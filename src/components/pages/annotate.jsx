import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function AnnotatePage() {
  const navigate = useNavigate();
  const { id: _datasetId } = useParams();

  // Static test data
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLabel, setSelectedLabel] = useState('');

  // Mock data for testing
  const testData = {
    datasetName: 'Sample Dataset',
    datasetDescription: 'This is a test dataset for annotation',
    labelClasses: ['Similar', 'Different', 'Neutral'],
    textPairs: [
      {
        textA:
          'This is the first text sample for Text A. It contains some example content that needs to be compared with Text B.',
        textB:
          'This is the first text sample for Text B. It has similar content but with some variations that need to be analyzed.',
      },
      {
        textA:
          'Second example of Text A with different content. This text discusses a completely different topic.',
        textB:
          'Second example of Text B which talks about another subject matter entirely different from Text A.',
      },
      {
        textA:
          'Third sample text A about technology and innovation in the modern world.',
        textB:
          'Third sample text B also discussing technology and innovation but from a different perspective.',
      },
    ],
  };

  const currentTextPair = testData.textPairs[currentIndex];
  const totalPairs = testData.textPairs.length;

  const handleGoBack = () => {
    navigate('/admin/tasks');
  };

  const handleValidate = () => {
    if (!selectedLabel) {
      alert('Please select a label before validating');
      return;
    }

    alert(`Annotation saved with label: ${selectedLabel}`);
    setSelectedLabel('');

    // Move to next item automatically
    if (currentIndex < totalPairs - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      alert('All annotations completed!');
      navigate('/admin/tasks');
    }
  };

  const handleNext = () => {
    if (currentIndex < totalPairs - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedLabel(''); 
      alert('You have reached the end of the dataset');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedLabel('');
    } else {
      alert('You are at the beginning of the dataset');
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
          </Button>
          <div className="text-center font-medium">
            Annotation Task: {testData.datasetName}
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
              Dataset: {testData.datasetName}
            </h2>
            <p className="text-sm text-muted-foreground">
              {testData.datasetDescription}
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
                  {testData.labelClasses.map(label => (
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
                  ))}
                </div>
                {selectedLabel && (
                  <p className="text-sm text-muted-foreground">
                    Selected:{' '}
                    <span className="font-medium text-blue-600">
                      {selectedLabel}
                    </span>
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
