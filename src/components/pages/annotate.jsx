import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import API from '../../api';

export default function AnnotatePage() {
  const navigate = useNavigate();
  const { id: datasetId } = useParams();

  // State for annotation data
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [annotationData, setAnnotationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnotationData = async () => {
      try {        setLoading(true);
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
        } else {
          setError('Failed to fetch annotation data');
        }
      } catch (err) {
        console.error('Error fetching annotation data:', err);
        setError('Failed to load annotation data. Please try again.');
      } finally {
        setLoading(false);
      }
    };    if (datasetId) {
      fetchAnnotationData();
    }
  }, [datasetId]); 
  
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
        <div className="text-center">
          <div className="text-lg font-medium text-red-600">Error</div>
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

  const handleGoBack = () => {
    navigate('/admin/tasks');
  };
  const handleValidate = async () => {
    if (!selectedLabel) {
      alert('Please select a label before validating');
      return;
    }

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
        alert(`Annotation saved successfully with label: ${selectedLabel}`);

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

        // Move to next item automatically
        if (currentIndex < totalPairs - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          alert('All annotations completed!');
          navigate('/admin/tasks');
        }
      } else {
        alert('Failed to save annotation. Please try again.');
      }
    } catch (error) {
      console.error('Error saving annotation:', error);
      alert('Error occurred while saving annotation. Please try again.');
    }
  };
  const handleNext = () => {
    if (currentIndex < totalPairs - 1) {
      setCurrentIndex(currentIndex + 1);
      // Don't reset selectedLabel here - let useEffect handle it
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      // Don't reset selectedLabel here - let useEffect handle it
    }
  };

  const handleLabelSelect = label => {
    setSelectedLabel(label);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <Button variant="ghost" onClick={handleGoBack} className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Go back
          </Button>{' '}
          <div className="text-center font-medium">
            Annotation Task: {annotationData.datasetLabelName}
          </div>
          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} / {totalPairs}
          </div>
        </div>
      </header>

      <main className="container flex-1 py-6">
        <div className="mb-6 space-y-4">
          <div>
            <h2 className="text-lg font-medium">
              Dataset: {annotationData.datasetName}
            </h2>
            <p className="text-sm text-muted-foreground">
              {annotationData.datasetDescription}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Horizontal layout for Text A and Text B */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="mb-4 rounded bg-primary px-4 py-2 text-primary-foreground font-medium">
                  Text A
                </div>
                <div className="h-[200px] overflow-y-auto rounded border p-4 bg-gray-50">
                  <p className="text-sm leading-relaxed">
                    {currentTextPair.textA}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="mb-4 rounded bg-primary px-4 py-2 text-primary-foreground font-medium">
                  Text B
                </div>
                <div className="h-[200px] overflow-y-auto rounded border p-4 bg-gray-50">
                  <p className="text-sm leading-relaxed">
                    {currentTextPair.textB}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Label selection buttons */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Select Label Class:</h3>
                <div className="flex gap-3 flex-wrap">
                  {annotationData.labelClasses.map(label => (
                    <Button
                      key={label}
                      variant={selectedLabel === label ? 'default' : 'outline'}
                      onClick={() => handleLabelSelect(label)}
                      className={
                        selectedLabel === label
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : ''
                      }
                    >
                      {label}
                    </Button>
                  ))}{' '}
                </div>
                {selectedLabel && (
                  <div className="space-y-2">
                    {currentTextPair.existingLabel && (
                      <p className="text-xs text-green-600">
                        ✓ This text pair has been previously annotated
                      </p>
                    )}
                  </div>
                )}
                {!selectedLabel && currentTextPair.existingLabel && (
                  <p className="text-xs text-yellow-600">
                    ⚠ This text pair was previously annotated with "
                    {currentTextPair.existingLabel}" but no label is currently
                    selected
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation and validation buttons */}
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <Button
              variant="default"
              onClick={handleValidate}
              disabled={!selectedLabel}
              className="bg-green-600 hover:bg-green-700 gap-2"
            >
              <Check className="h-4 w-4" />
              Validate
            </Button>

            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentIndex >= totalPairs - 1}
              className="gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
