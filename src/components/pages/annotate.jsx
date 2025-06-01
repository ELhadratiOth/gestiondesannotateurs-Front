import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Target,
  BookOpen,
  Loader2,
  CheckCircle,
  AlertCircle,
  SkipForward,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import API from '../../api';

export default function AnnotatePage() {
  const navigate = useNavigate();
  const { id: datasetId } = useParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [annotationData, setAnnotationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveMessage, setSaveMessage] = useState(null);
  const [annotationsCount, setAnnotationsCount] = useState(0);

  useEffect(() => {
    const fetchAnnotationData = async () => {
      try {
        setLoading(true);
        const response = await API.get(
          `/api/admins/coupleoftextannotated/${datasetId}`,
        );
        if (response.status === 200 && response.data.data) {
          const couplesOfText = response.data.data;
          console.log('Fetched couples of text:', couplesOfText);
          const firstItem = couplesOfText[0];
          const datasetName = firstItem?.datasetName || `Dataset ${datasetId}`;
          const datasetLabelName =
            firstItem?.datasetLabelName || 'Annotation Task';

          // Parse label classes from semicolon-separated string
          const labelClassesString = firstItem?.datasetLabelClasses || '';
          const labelClasses = labelClassesString
            .split(';')
            .map(label => label.trim())
            .filter(label => label.length > 0);

          // Transform the data to match our component structure
          const transformedData = {
            datasetName: datasetName,
            datasetLabelName: datasetLabelName,
            datasetDescription: 'Annotation task for text comparison',
            labelClasses:
              labelClasses.length > 0
                ? labelClasses
                : ['Similar', 'Different', 'Neutral'],
            textPairs: couplesOfText.map(item => ({
              id: item.coupleOfTextId,
              annotationId: item.annotationId,
              textA: item.textA,
              textB: item.textB,
              existingLabel: item.annotationLabel, // Can be null if not annotated yet
            })),
          };

          setAnnotationData(transformedData);

          // Calculate initial annotations count
          const annotated = couplesOfText.filter(
            item => item.annotationLabel,
          ).length;
          setAnnotationsCount(annotated);
        } else {
          setError('Failed to fetch annotation data');
        }
      } catch (err) {
        console.error('Error fetching annotation data:', err);
        setError('Failed to load annotation data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    if (datasetId) {
      fetchAnnotationData();
    }
  }, [datasetId]);

  // Auto-dismiss save messages
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  // Set existing label when moving to a new text pair
  useEffect(() => {
    if (annotationData && annotationData.textPairs[currentIndex]) {
      const currentPair = annotationData.textPairs[currentIndex];
      const existingLabel = currentPair.existingLabel || '';
      console.log(`Setting label for index ${currentIndex}:`, existingLabel);
      // Always set the selected label to existing label (or empty string if no existing label)
      setSelectedLabel(existingLabel);
    }
  }, [currentIndex, annotationData]);
  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <div className="text-lg font-medium">Loading annotation data...</div>
          <div className="text-sm text-muted-foreground mt-2">
            Please wait while we fetch your tasks
          </div>
        </div>
      </div>
    );
  }
  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center bg-red-50 text-red-700 rounded-md p-4">
          <AlertCircle className="h-6 w-6 mx-auto mb-2" />
          <div className="text-lg font-medium">Error</div>
          <div className="text-sm text-muted-foreground mt-2">{error}</div>
          <Button
            variant="outline"
            onClick={() => navigate('/admin/tasks')}
            className="mt-4"
          >
            Go Back to Tasks
          </Button>
        </div>
      </div>
    );
  }

  // No data state
  if (!annotationData || annotationData.textPairs.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">
            No annotation tasks available
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            There are no text pairs to annotate in this dataset
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/admin/tasks')}
            className="mt-4"
          >
            Go Back to Tasks
          </Button>
        </div>
      </div>
    );
  }
  const currentTextPair = annotationData.textPairs[currentIndex];
  const totalPairs = annotationData.textPairs.length;
  const progress = totalPairs > 0 ? (annotationsCount / totalPairs) * 100 : 0;

  const handleGoBack = () => {
    navigate('/admin/tasks');
  };
  const handleValidate = async () => {
    if (!selectedLabel) {
      setSaveMessage({
        type: 'error',
        message: 'Please select a label before saving.',
      });
      return;
    }

    setSaving(true);
    setSaveMessage(null);

    try {
      // Prepare annotation request
      const annotationRequest = {
        coupletextId: currentTextPair.id,
        label: selectedLabel,
      };

      console.log('Saving annotation:', annotationRequest);

      // Call the API to save annotation
      const response = await API.post(
        `/api/annotations/${datasetId}`,
        annotationRequest,
      );

      if (response.status === 200 || response.status === 201) {
        const wasAlreadyAnnotated = currentTextPair.existingLabel;

        setSaveMessage({
          type: 'success',
          message: 'Annotation saved successfully!',
        });

        // Update the current text pair's existing label in the state
        setAnnotationData(prevData => {
          const updatedData = { ...prevData };
          updatedData.textPairs = [...updatedData.textPairs];
          updatedData.textPairs[currentIndex] = {
            ...updatedData.textPairs[currentIndex],
            existingLabel: selectedLabel,
          };
          return updatedData;
        });

        // Update annotations count if this was a new annotation
        if (!wasAlreadyAnnotated) {
          setAnnotationsCount(prev => prev + 1);
        }

        // Auto-advance after a short delay
        setTimeout(() => {
          if (currentIndex < totalPairs - 1) {
            setCurrentIndex(currentIndex + 1);
          } else {
            // All annotations completed
            setSaveMessage({
              type: 'success',
              message: 'All annotations completed! Great work!',
            });
          }
        }, 500);
      } else {
        setSaveMessage({
          type: 'error',
          message: 'Failed to save annotation. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error saving annotation:', error);
      setSaveMessage({
        type: 'error',
        message: 'Error occurred while saving annotation. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };
  const handleNext = () => {
    if (currentIndex < totalPairs - 1) {
      setCurrentIndex(currentIndex + 1);
      setSaveMessage(null);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSaveMessage(null);
    }
  };

  const handleSkip = () => {
    setSaveMessage(null);
    handleNext();
  };

  const handleLabelSelect = label => {
    setSelectedLabel(label);
  };
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {' '}
      {/* Save Message Notification */}
      {saveMessage && (
        <div
          className={`p-4 rounded-md border ${
            saveMessage.type === 'success'
              ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/50 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {saveMessage.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span>{saveMessage.message}</span>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleGoBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Tasks
        </Button>

        <div className="text-center">
          <h1 className="text-2xl font-bold">Annotation Interface</h1>
          <p className="text-muted-foreground">
            {annotationData.datasetName} - {annotationData.datasetLabelName}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            {currentIndex + 1} of {totalPairs}
          </p>
        </div>
      </div>
      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              {annotationsCount}/{totalPairs} completed ({progress.toFixed(1)}%)
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>
      {/* Text Pair */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Text A
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] overflow-y-auto rounded border p-4 bg-card text-card-foreground">
              <p className="text-sm leading-relaxed">{currentTextPair.textA}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Text B
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] overflow-y-auto rounded border p-4 bg-card text-card-foreground">
              <p className="text-sm leading-relaxed">{currentTextPair.textB}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Label Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Select Label
          </CardTitle>
        </CardHeader>
        <CardContent>
          {' '}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {annotationData.labelClasses.map(label => (
              <Button
                key={label}
                variant={selectedLabel === label ? 'default' : 'outline'}
                onClick={() => handleLabelSelect(label)}
                className={`h-12 transition-all duration-200 ${
                  selectedLabel === label
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md ring-2 ring-primary/20 dark:ring-primary/30'
                    : 'hover:bg-accent hover:text-accent-foreground border-border hover:border-accent-foreground/20'
                }`}
                disabled={saving}
              >
                {label}
              </Button>
            ))}
          </div>{' '}
          {currentTextPair.existingLabel && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800/50">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Previously annotated as:{' '}
                  <Badge
                    variant="outline"
                    className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700"
                  >
                    {currentTextPair.existingLabel}
                  </Badge>
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0 || saving}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={currentIndex === totalPairs - 1 || saving}
          >
            <SkipForward className="h-4 w-4 mr-2" />
            Skip
          </Button>

          <Button onClick={handleValidate} disabled={!selectedLabel || saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save & Next'}
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentIndex === totalPairs - 1 || saving}
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>{' '}
      {/* Completion Status */}
      {annotationsCount === totalPairs && (
        <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 text-green-800 dark:text-green-200">
              <CheckCircle className="h-6 w-6" />
              <span className="text-lg font-medium">
                Congratulations! You have completed all annotations for this
                task.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
