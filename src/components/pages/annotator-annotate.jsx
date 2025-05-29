import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  SkipForward, 
  BookOpen, 
  Target,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import API from '../../api';

export default function AnnotateCouples() {
  const { annotatorId, taskId } = useParams();
  const navigate = useNavigate();
  
  const [couples, setCouples] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [availableLabels, setAvailableLabels] = useState([]);
  const [taskInfo, setTaskInfo] = useState(null);
  const [annotationsCount, setAnnotationsCount] = useState(0);
  const [saveMessage, setSaveMessage] = useState(null); // Remplace useToast

  useEffect(() => {
    const fetchCouples = async () => {
      setLoading(true);
      try {
        const response = await API.get(`/api/annotators/coupleoftextannotated/${annotatorId}/${taskId}`);
        
        if (response.status === 200 && response.data.status === 'success') {
          const data = response.data.data;
          setCouples(data);
          
          if (data.length > 0) {
            // Extract task info from first couple
            const firstCouple = data[0];
            setTaskInfo({
              datasetName: firstCouple.datasetName,
              datasetLabelName: firstCouple.datasetLabelName,
              datasetLabelClasses: firstCouple.datasetLabelClasses
            });
            
            // Set available labels
            const labels = firstCouple.datasetLabelClasses.split(';').filter(label => label.trim());
            setAvailableLabels(labels);
            
            // Count existing annotations and set current annotation
            const annotated = data.filter(couple => couple.annotationLabel).length;
            setAnnotationsCount(annotated);
            
            // Set selected label if current couple is already annotated
            if (data[0]?.annotationLabel) {
              setSelectedLabel(data[0].annotationLabel);
            }
          }
        } else {
          setError('Failed to load annotation data');
        }
      } catch (err) {
        console.error('Error fetching couples:', err);
        setError('Error loading annotation data');
      } finally {
        setLoading(false);
      }
    };

    fetchCouples();
  }, [annotatorId, taskId]);

  // Update selected label when current index changes
  useEffect(() => {
    if (couples[currentIndex]) {
      setSelectedLabel(couples[currentIndex].annotationLabel || null);
    }
  }, [currentIndex, couples]);

  // Auto-hide save message after 3 seconds
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  const currentCouple = couples[currentIndex];
  const progress = couples.length > 0 ? ((annotationsCount / couples.length) * 100) : 0;

  const handleLabelSelect = (label) => {
    setSelectedLabel(label);
    setSaveMessage(null); // Clear any previous messages
  };

  const saveAnnotation = async (coupletextId, label) => {
    try {
      const response = await API.post(`/api/annotations/tasks/${taskId}`, {
        coupletextId: coupletextId,
        label: label
      });

      if (response.status === 200 || response.status === 201) {
        return response.data;
      } else {
        throw new Error('Failed to save annotation');
      }
    } catch (error) {
      console.error('Error saving annotation:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!selectedLabel || !currentCouple) {
      setSaveMessage({
        type: 'error',
        message: 'Please select a label before saving.'
      });
      return;
    }

    setSaving(true);
    setSaveMessage(null);
    
    try {
      // Save annotation to backend
      await saveAnnotation(currentCouple.coupleOfTextId, selectedLabel);
      
      // Update local state
      const updatedCouples = [...couples];
      const wasAlreadyAnnotated = updatedCouples[currentIndex].annotationLabel;
      
      updatedCouples[currentIndex] = {
        ...updatedCouples[currentIndex],
        annotationLabel: selectedLabel,
        annotationId: Date.now() // Temporary ID, should come from backend response
      };
      
      setCouples(updatedCouples);
      
      // Update annotations count only if it wasn't already annotated
      if (!wasAlreadyAnnotated) {
        setAnnotationsCount(prev => prev + 1);
      }
      
      setSaveMessage({
        type: 'success',
        message: 'Annotation saved successfully!'
      });
      
      // Move to next couple automatically after a short delay
      setTimeout(() => {
        handleNext();
      }, 500);
      
    } catch (error) {
      setSaveMessage({
        type: 'error',
        message: 'Failed to save annotation. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < couples.length - 1) {
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

  const handleGoToIndex = (index) => {
    if (index >= 0 && index < couples.length) {
      setCurrentIndex(index);
      setSaveMessage(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading annotation interface...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 bg-red-50 text-red-700 rounded-md p-4">
        <AlertCircle className="h-6 w-6 mr-2" />
        <p>{error}</p>
      </div>
    );
  }

  if (!currentCouple) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>No couples found for annotation.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Message d'alerte */}
      {saveMessage && (
        <div className={`p-4 rounded-md border ${
          saveMessage.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
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
        <Button 
          variant="ghost" 
          onClick={() => navigate('/my-tasks')}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to My Tasks
        </Button>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold">Annotation Interface</h1>
          <p className="text-muted-foreground">
            {taskInfo?.datasetName} - {taskInfo?.datasetLabelName}
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            {currentIndex + 1} of {couples.length}
          </p>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              {annotationsCount}/{couples.length} completed ({progress.toFixed(1)}%)
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Quick Navigation */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1">
            {couples.map((couple, index) => (
              <Button
                key={index}
                variant={index === currentIndex ? "default" : couple.annotationLabel ? "secondary" : "outline"}
                size="sm"
                onClick={() => handleGoToIndex(index)}
                className="w-10 h-8"
              >
                {couple.annotationLabel && <CheckCircle className="h-3 w-3" />}
                {!couple.annotationLabel && index + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card> */}

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
            <p className="text-base leading-relaxed">{currentCouple.textA}</p>
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
            <p className="text-base leading-relaxed">{currentCouple.textB}</p>
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableLabels.map((label) => (
              <Button
                key={label}
                variant={selectedLabel === label ? "default" : "outline"}
                onClick={() => handleLabelSelect(label)}
                className="h-12"
                disabled={saving}
              >
                {label}
              </Button>
            ))}
          </div>
          
          {currentCouple.annotationLabel && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Previously annotated as: <Badge variant="outline">{currentCouple.annotationLabel}</Badge>
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
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={currentIndex === couples.length - 1 || saving}
          >
            <SkipForward className="h-4 w-4 mr-2" />
            Skip
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={!selectedLabel || saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save & Next'}
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentIndex === couples.length - 1 || saving}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Completion Status */}
      {annotationsCount === couples.length && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 text-green-800">
              <CheckCircle className="h-6 w-6" />
              <span className="text-lg font-medium">
                Congratulations! You have completed all annotations for this task.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}