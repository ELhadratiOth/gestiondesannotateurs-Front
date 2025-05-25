import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Info,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import API from '../../api';

export default function AnnotatePage() {
  const navigate = useNavigate();
  const { id: datasetId } = useParams();
  const [adminTask, setAdminTask] = useState(null);
  const [subject, setSubject] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTextPair, setCurrentTextPair] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Fetch admin task data
  useEffect(() => {
    const fetchAdminTask = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await API.get(
          `/api/admins/getAdminTasksWithAllNeededCoupleOfText`,
          {
            params: { datasetId },
          },
        );

        if (
          response.data &&
          response.data.status === 'success' &&
          response.data.data
        ) {
          const taskData = response.data.data;
          setAdminTask(taskData);

          // If the response includes text pairs, use them. Otherwise, use mock data for now
          if (taskData.coupleOfTexts && taskData.coupleOfTexts.length > 0) {
            setCurrentTextPair({
              index: 0,
              textA: taskData.coupleOfTexts[0].textA || 'Text A content...',
              textB: taskData.coupleOfTexts[0].textB || 'Text B content...',
              labelClasses: taskData.LabelName
                ? [taskData.LabelName]
                : ['Label1', 'Label2', 'Label3'],
            });
          } else if (taskData.baseAffectedRows > 0) {
            // Load first text pair with mock data (will be replaced with real API)
            setCurrentTextPair({
              index: 0,
              textA: 'Sample text A for annotation...',
              textB: 'Sample text B for annotation...',
              labelClasses: taskData.LabelName
                ? [taskData.LabelName]
                : ['Label1', 'Label2', 'Label3'],
            });
          }
        } else {
          setError('No task data found');
        }
      } catch (err) {
        console.error('Error fetching admin task:', err);
        setError('Failed to load annotation task');
      } finally {
        setLoading(false);
      }
    };

    if (datasetId) {
      fetchAdminTask();
    } else {
      navigate('/admin/tasks');
    }
  }, [datasetId, navigate]);
  // Fetch text pair for annotation - now properly integrated with adminTask
  const fetchTextPair = async index => {
    try {
      if (!adminTask) return;

      // If adminTask includes text pairs in the response, use them
      if (adminTask.coupleOfTexts && adminTask.coupleOfTexts[index]) {
        const textPair = adminTask.coupleOfTexts[index];
        setCurrentTextPair({
          index,
          textA: textPair.textA || 'Text A content...',
          textB: textPair.textB || 'Text B content...',
          labelClasses: adminTask.LabelName
            ? [adminTask.LabelName]
            : ['Label1', 'Label2', 'Label3'],
        });
      } else {
        // Fallback: try to fetch from a specific text pair endpoint
        try {
          const response = await API.get(`/api/admins/getTextPair`, {
            params: {
              datasetId,
              index,
            },
          });

          if (
            response.data &&
            response.data.status === 'success' &&
            response.data.data
          ) {
            const textPairData = response.data.data;
            setCurrentTextPair({
              index,
              textA: textPairData.textA || 'Text A content...',
              textB: textPairData.textB || 'Text B content...',
              labelClasses: adminTask.LabelName
                ? [adminTask.LabelName]
                : ['Label1', 'Label2', 'Label3'],
            });
          } else {
            throw new Error('Invalid text pair response');
          }
        } catch (apiErr) {
          console.warn(
            'Text pair API endpoint not available, using mock data:',
            apiErr,
          );
          // Use mock data if specific endpoint isn't available
          setCurrentTextPair({
            index,
            textA: `Sample text A for annotation (pair ${index + 1})...`,
            textB: `Sample text B for annotation (pair ${index + 1})...`,
            labelClasses: adminTask.LabelName
              ? [adminTask.LabelName]
              : ['Label1', 'Label2', 'Label3'],
          });
        }
      }
    } catch (err) {
      console.error('Error fetching text pair:', err);
      setError('Failed to load text pair');
    }
  };

  const handleGoBack = () => {
    navigate('/admin/tasks');
  };
  const handleValidate = async () => {
    if (!selectedLabel) {
      alert('Please select a label before validating');
      return;
    }

    try {
      setIsSubmitting(true);

      // Submit annotation with proper API structure
      const payload = {
        datasetId,
        textPairIndex: currentTextPair?.index,
        selectedLabel,
        subject: subject || 'Default Subject',
      };

      const response = await API.post('/api/annotations/submit', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Handle different response formats
      if (response.status === 200 || response.status === 201) {
        const result = response.data;
        if (result.status === 'success' || result.success) {
          alert(`Annotation saved with label: ${selectedLabel}`);
          setSelectedLabel('');

          // Move to next item automatically
          if (currentTextPair?.index < adminTask?.baseAffectedRows - 1) {
            await fetchTextPair(currentTextPair.index + 1);
          } else {
            alert('All annotations completed!');
            navigate('/admin/tasks');
          }
        } else {
          throw new Error(result.message || 'Failed to save annotation');
        }
      } else {
        throw new Error('Failed to save annotation');
      }
    } catch (err) {
      console.error('Error submitting annotation:', err);
      alert('Failed to save annotation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleNext = async () => {
    if (!currentTextPair || !adminTask) return;

    const nextIndex = currentTextPair.index + 1;
    if (nextIndex < adminTask.baseAffectedRows) {
      await fetchTextPair(nextIndex);
      setSelectedLabel(''); // Reset selection
      setSubject(''); // Reset subject as well
    } else {
      alert('You have reached the end of the dataset');
    }
  };

  const handlePrevious = async () => {
    if (!currentTextPair) return;

    const prevIndex = currentTextPair.index - 1;
    if (prevIndex >= 0) {
      await fetchTextPair(prevIndex);
      setSelectedLabel(''); // Reset selection
      setSubject(''); // Reset subject as well
    } else {
      alert('You are at the beginning of the dataset');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading annotation task...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => navigate('/admin/tasks')}>
          Go back to tasks
        </Button>
      </div>
    );
  }

  if (!adminTask) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <p>Task not found</p>
        <Button onClick={() => navigate('/admin/tasks')}>
          Go back to tasks
        </Button>
      </div>
    );
  }

  // Calculate progress percentage from AdminTask advancement
  const progressPercentage = adminTask.Advancement || 0;
  const currentProgress = currentTextPair ? currentTextPair.index + 1 : 0;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <Button variant="ghost" onClick={handleGoBack} className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Go back
          </Button>
          <div className="text-center font-medium">
            Annotation Task: {adminTask.LabelName}
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Info className="h-4 w-4" />
                Guidelines
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Annotation Guidelines</DialogTitle>
                <DialogDescription>
                  Please follow these guidelines when annotating content.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p>
                  Carefully review each item before submitting your annotation.
                  Quality is important.
                </p>
                <div className="rounded-md border-l-4 border-destructive bg-destructive/10 p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <h4 className="font-medium text-destructive">
                      Warning: Spam Detection
                    </h4>
                  </div>
                  <p className="mt-2 text-sm">
                    Our system automatically detects spamming behavior and
                    low-quality annotations. Users who consistently submit spam
                    or low-quality work will be detected and removed from the
                    application. Please take your time and submit thoughtful
                    annotations.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button>I Understand</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container flex-1 py-6">
        <div className="mb-6 space-y-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-medium">
                Dataset: {adminTask.DatasetName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {adminTask.DatasetDescription}
              </p>
              <div className="w-full max-w-xs mt-2">
                <Select defaultValue={adminTask.DatasetName} disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Select dataset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={adminTask.DatasetName}>
                      {adminTask.DatasetName}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="h-px bg-border" />

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span>Choose a subject</span>
              <Input
                placeholder="Enter subject"
                className="w-[200px]"
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-1 text-right">
              <div className="text-sm">
                Progress: {currentProgress} / {adminTask.baseAffectedRows}
              </div>
              <div className="text-sm text-muted-foreground">
                Status: {adminTask.Status}
              </div>
              <Progress value={progressPercentage} className="h-2 w-[200px]" />
            </div>
          </div>
        </div>

        {currentTextPair ? (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <div className="mb-4 rounded bg-primary px-4 py-2 text-primary-foreground font-medium">
                  Text A
                </div>
                <div className="h-[200px] overflow-y-auto rounded border p-4">
                  <p>{currentTextPair.textA}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="mb-4 rounded bg-primary px-4 py-2 text-primary-foreground font-medium">
                  Text B
                </div>
                <div className="h-[200px] overflow-y-auto rounded border p-4">
                  <p>{currentTextPair.textB}</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="w-full max-w-xs">
                <label
                  htmlFor="label-select"
                  className="block text-sm font-medium mb-2"
                >
                  Select Label Class
                </label>
                <Select value={selectedLabel} onValueChange={setSelectedLabel}>
                  <SelectTrigger id="label-select" className="w-full">
                    <SelectValue placeholder="Choose a label" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentTextPair.labelClasses.map(label => (
                      <SelectItem key={label} value={label}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={!currentTextPair || currentTextPair.index === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  variant="default"
                  onClick={handleValidate}
                  disabled={!selectedLabel || isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Submitting...' : 'Validate'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNext}
                  disabled={
                    !currentTextPair ||
                    currentTextPair.index >= adminTask.baseAffectedRows - 1
                  }
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              No text pairs available for annotation
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
