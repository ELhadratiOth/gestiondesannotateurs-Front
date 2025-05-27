import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { 
  Activity, 
  ChevronRight, 
  LineChart,
  Upload, 
  Settings, 
  Play,
  TestTube // Nouvel import pour l'icône de test
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';
import { TestDialog } from './test-card'; // Import du composant de test
import API from '../api';
// Add a helper function to parse training history
const parseTrainingHistory = (historyData) => {
  try {
    const historyStr = historyData.replace('📈 Training History:\n', '');
    const history = JSON.parse(historyStr);
    
    // Extract logs
    const logs = history.stdout
      .split('\n')
      .filter(line => line.includes('"log"'))
      .map(line => {
        try {
          return JSON.parse(line.trim()).log;
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    // Extract metrics
    const metricsStr = history.stdout.match(/{\"metrics\": {.*}}/);
    const metrics = metricsStr ? JSON.parse(metricsStr[0]).metrics : null;

    return {
      timestamp: history.timestamp,
      dataset_id: history.dataset_id,
      logs,
      metrics,
    };
  } catch (error) {
    console.error('Error parsing training history:', error);
    return null;
  }
};

const parseTestResults = (testData) => {
  try {
    const match = testData.match(/\{.*\}/);
    if (!match) return null;
    
    const results = JSON.parse(match[0]);
    return {
      timestamp: results.timestamp,
      dataset_id: results.dataset_id,
      metrics: results.metrics
    };
  } catch (error) {
    console.error('Error parsing test results:', error);
    return null;
  }
};

export default function TrainCard() {
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [completedDatasets, setCompletedDatasets] = useState([]);
  const [trainingParams, setTrainingParams] = useState({
    learningRate: 0.001,
    epochs: 10,
    batchSize: 32,
    task: 'similarity'
  });
  const [file, setFile] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainHistory, setTrainHistory] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedDatasetId, setUploadedDatasetId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [parsedHistory, setParsedHistory] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);

    const handleReset = () => {
    // Reset training parameters
    setTrainingParams({
      learningRate: 0.001,
      epochs: 10,
      batchSize: 32,
      task: 'similarity'
    });
    
    // Reset all training and testing related states
    setFile(null);
    setIsTraining(false);
    setTrainHistory(null);
    setParsedHistory(null);
    setProgress(0);
    setTestResults(null);
    setIsTesting(false);
    setIsTestDialogOpen(false);
    setUploadedDatasetId(null);
    setSelectedDataset(null);
  };


  useEffect(() => {
    const fetchCompletedDatasets = async () => {
      try {
        const response = await API.get('/api/datasets/completed');
        setCompletedDatasets(response.data.data);
      } catch (error) {
        console.error('Error fetching datasets:', error);
        toast.error('Failed to fetch datasets');
      }
    };

    fetchCompletedDatasets();
  }, []);

   const handleStartTraining = async () => {
    setIsTraining(true);
    setProgress(0);
    try {
      if (activeTab === 'upload' && file) {
        // Upload dataset
        const formData = new FormData();
        formData.append('file', file);
        formData.append('task', trainingParams.task);
        formData.append('learning_rate', trainingParams.learningRate);
        formData.append('epochs', trainingParams.epochs);
        formData.append('batch_size', trainingParams.batchSize);
        formData.append('user', 'admin');

        const uploadResponse = await API.post('/api/model/upload', formData);
        const responseData = JSON.parse(uploadResponse.data.data);
        const datasetId = responseData.datasetId;
        
        setUploadedDatasetId(datasetId);
        setProgress(33);
        toast.success('Dataset uploaded successfully');

        // Start training
        const trainResponse = await API.post(`/api/model/train/${datasetId}`);
        setProgress(66);
        toast.success('Training completed');

        // Get training history
        const historyResponse = await API.get(`/api/model/train/history/${datasetId}`);
        const parsedHistory = parseTrainingHistory(historyResponse.data.data);
        setParsedHistory(parsedHistory);
        setTrainHistory(historyResponse.data.data);
        setProgress(100);
      } else if (selectedDataset) {
        // Train existing dataset
        const trainResponse = await API.post(`/api/model/train/${selectedDataset}`);
        setProgress(50);
        toast.success('Training completed');

        const historyResponse = await API.get(`/api/model/train/history/${selectedDataset}`);
        setTrainHistory(historyResponse.data.data);
        setProgress(100);
      }
    } catch (error) {
      console.error('Error during training:', error);
      toast.error('Training failed');
    } finally {
      setIsTraining(false);
    }
  };

  const handleStartTesting = async () => {
  setIsTesting(true);
  try {
    const datasetId = uploadedDatasetId || selectedDataset;
    const testResponse = await API.post(`/api/model/test/${datasetId}`);
    const parsedResults = parseTestResults(testResponse.data.data);
    setTestResults(parsedResults);
    setIsTestDialogOpen(true);
    toast.success('Testing completed successfully');
  } catch (error) {
    console.error('Error during testing:', error);
    toast.error('Testing failed');
  } finally {
    setIsTesting(false);
  }
};

 return (
    <Card className="w-[80%] mx-auto shadow-lg">
      <CardHeader className="space-y-1 p-6">
        <CardTitle className="text-2xl font-bold">Model Training</CardTitle>
        <CardDescription>
          Train your model using new or existing datasets
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Dataset
            </TabsTrigger>
            <TabsTrigger value="select" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Select Dataset
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="grid w-full items-center gap-4">
              <Label htmlFor="dataset">Upload Dataset (CSV)</Label>
              <Input
                id="dataset"
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files[0])}
                className="cursor-pointer"
              />
            </div>
          </TabsContent>

          <TabsContent value="select" className="space-y-4">
            <div className="grid w-full items-center gap-4">
              <Label>Select a completed dataset</Label>
              <Select onValueChange={(value) => setSelectedDataset(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a dataset" />
                </SelectTrigger>
                <SelectContent>
                  {completedDatasets.map((dataset) => (
                    <SelectItem key={dataset.id} value={dataset.id}>
                      {dataset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="learning-rate">Learning Rate</Label>
            <Input
              id="learning-rate"
              type="number"
              step="0.0001"
              min="0.0001"
              max="0.01"
              value={trainingParams.learningRate}
              onChange={(e) => setTrainingParams(prev => ({
                ...prev,
                learningRate: parseFloat(e.target.value)
              }))}
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="epochs">Epochs</Label>
            <Input
              id="epochs"
              type="number"
              min="1"
              max="100"
              value={trainingParams.epochs}
              onChange={(e) => setTrainingParams(prev => ({
                ...prev,
                epochs: parseInt(e.target.value)
              }))}
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="batch-size">Batch Size</Label>
            <Input
              id="batch-size"
              type="number"
              min="8"
              max="128"
              step="8"
              value={trainingParams.batchSize}
              onChange={(e) => setTrainingParams(prev => ({
                ...prev,
                batchSize: parseInt(e.target.value)
              }))}
              className="font-mono"
            />
          </div>
        </div>

        {isTraining && (
          <div className="space-y-2">
            <Label>Training Progress</Label>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {parsedHistory && (
          <div className="space-y-6 mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Training Progress Log
              </h3>
              <div className="space-y-2 bg-muted rounded-lg p-4">
                {parsedHistory.logs.map((log, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>

            {parsedHistory.metrics && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-green-500" />
                  Model Performance Metrics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Accuracy</div>
                    <div className="text-2xl font-bold">
                      {(parsedHistory.metrics.accuracy * 100).toFixed(2)}%
                    </div>
                    <Progress 
                      value={parsedHistory.metrics.accuracy * 100} 
                      className="h-2 mt-2"
                    />
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">F1 Score</div>
                    <div className="text-2xl font-bold">
                      {(parsedHistory.metrics.f1_score * 100).toFixed(2)}%
                    </div>
                    <Progress 
                      value={parsedHistory.metrics.f1_score * 100} 
                      className="h-2 mt-2"
                    />
                  </div>
                </div>

                {/* Classification Report */}
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2">Classification Details</h4>
                  <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Class</th>
                          <th className="text-right p-2">Precision</th>
                          <th className="text-right p-2">Recall</th>
                          <th className="text-right p-2">F1-score</th>
                          <th className="text-right p-2">Support</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(parsedHistory.metrics.classification_report)
                          .filter(([key]) => !['accuracy', 'macro avg', 'weighted avg'].includes(key))
                          .map(([className, metrics]) => (
                            <tr key={className} className="border-b border-muted-foreground/10">
                              <td className="p-2">{className}</td>
                              <td className="text-right p-2">
                                {(metrics.precision * 100).toFixed(1)}%
                              </td>
                              <td className="text-right p-2">
                                {(metrics.recall * 100).toFixed(1)}%
                              </td>
                              <td className="text-right p-2">
                                {(metrics['f1-score'] * 100).toFixed(1)}%
                              </td>
                              <td className="text-right p-2">
                                {metrics.support}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bouton de test */}
                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={handleStartTesting}
                    disabled={isTesting}
                    className="flex items-center gap-2"
                  >
                    {isTesting ? (
                      <>Testing...</>
                    ) : (
                      <>
                        <TestTube className="h-4 w-4" />
                        Run Model Testing
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dialog de test (en dehors du bloc parsedHistory) */}
        <TestDialog
          isOpen={isTestDialogOpen}
          onOpenChange={setIsTestDialogOpen}
          results={testResults}
        />
      </CardContent>

      <CardFooter className="flex justify-between border-t p-6">
        <Button
          variant="outline"
          onClick={handleReset}
        >
          Reset Parameters
        </Button>
        <Button
          onClick={handleStartTraining}
          disabled={isTraining || (activeTab === 'upload' ? !file : !selectedDataset)}
          className="flex items-center gap-2"
        >
          {isTraining ? (
            <>Training...</>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Start Training
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}