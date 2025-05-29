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
  CheckCircle
} from 'lucide-react';
import API from '../../api';

export default function AnnotateCouples() {
  const { annotatorId, taskId } = useParams();
  const navigate = useNavigate();
  
  const [couples, setCouples] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [availableLabels, setAvailableLabels] = useState([]);
  const [taskInfo, setTaskInfo] = useState(null);
  const [annotationsCount, setAnnotationsCount] = useState(0);

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
            
            // Count existing annotations
            const annotated = data.filter(couple => couple.annotationLabel).length;
            setAnnotationsCount(annotated);
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

  const currentCouple = couples[currentIndex];
  const progress = couples.length > 0 ? ((annotationsCount / couples.length) * 100) : 0;

  const handleLabelSelect = (label) => {
    setSelectedLabel(label);
  };

  const handleSave = async () => {
    if (!selectedLabel || !currentCouple) return;

    try {
      // Here you would typically make an API call to save the annotation
      // For now, we'll update the local state
      const updatedCouples = [...couples];
      if (!updatedCouples[currentIndex].annotationLabel) {
        setAnnotationsCount(prev => prev + 1);
      }
      updatedCouples[currentIndex].annotationLabel = selectedLabel;
      setCouples(updatedCouples);
      
      // Move to next couple
      handleNext();
    } catch (error) {
      console.error('Error saving annotation:', error);
    }
  };

  const handleNext = () => {
    if (currentIndex < couples.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedLabel(couples[currentIndex + 1]?.annotationLabel || null);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedLabel(couples[currentIndex - 1]?.annotationLabel || null);
    }
  };

  const handleSkip = () => {
    handleNext();
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/annotator/tasks')}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Tasks
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
              {annotationsCount}/{couples.length} completed
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
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={currentIndex === couples.length - 1}
          >
            <SkipForward className="h-4 w-4 mr-2" />
            Skip
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={!selectedLabel}
          >
            <Save className="h-4 w-4 mr-2" />
            Save & Next
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentIndex === couples.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}