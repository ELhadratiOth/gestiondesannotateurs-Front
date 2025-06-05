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
  TestTube,
  Database
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
import { TestDialog } from './test-card';
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
    // eslint-disable-next-line no-useless-escape
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
    console.log('Raw test data:', testData); // Debug log
    
    // La réponse commence par "✅ Testing started and end successfully."
    // puis contient un JSON
    const jsonStart = testData.indexOf('{"status"');
    if (jsonStart === -1) {
      console.error('No JSON found in test data');
      return null;
    }
    
    const jsonStr = testData.substring(jsonStart);
    console.log('Extracted JSON:', jsonStr); // Debug log
    
    const testResult = JSON.parse(jsonStr);
    
    // Extraire les données du résultat
    const result = testResult.result;
    
    return {
      timestamp: result.timestamp,
      project_name: result.project_name,
      status: testResult.status,
      metrics: {
        accuracy: result.metrics.accuracy,
        precision: result.metrics.precision,
        recall: result.metrics.recall,
        f1_score: result.metrics.classification_report['weighted avg']['f1-score'], // Utiliser le F1 pondéré
        confusion_matrix: result.metrics.confusion_matrix,
        classification_report: result.metrics.classification_report
      }
    };
  } catch (error) {
    console.error('Error parsing test results:', error);
    console.error('Raw data was:', testData);
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
  const [projectName, setProjectName] = useState(''); // Nouveau champ
  const [isTraining, setIsTraining] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [trainHistory, setTrainHistory] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedDatasetId, setUploadedDatasetId] = useState(null);
  const [uploadedProjectName, setUploadedProjectName] = useState(null); // Nouveau
  const [progress, setProgress] = useState(0);
  const [parsedHistory, setParsedHistory] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);

  const handleReset = () => {
    setTrainingParams({
      learningRate: 0.001,
      epochs: 10,
      batchSize: 32,
      task: 'similarity'
    });
    
    setFile(null);
    setProjectName(''); // Reset project name
    setIsTraining(false);
    setTrainHistory(null);
    setParsedHistory(null);
    setProgress(0);
    setTestResults(null);
    setIsTesting(false);
    setIsTestDialogOpen(false);
    setUploadedDatasetId(null);
    setUploadedProjectName(null); // Reset uploaded project name
    setSelectedDataset(null);
  };


  useEffect(() => {
    const fetchCompletedDatasets = async () => {
      try {
        const response = await API.get('/api/datasets/advancement/1');
        setCompletedDatasets(response.data.data);
      } catch (error) {
        console.error('Error fetching datasets:', error);
        toast.error('Failed to fetch datasets');
      }
    };

    fetchCompletedDatasets();
  }, []);

    // Nouvelle fonction pour gérer la sélection de dataset
  const handleDatasetSelect = (datasetId) => {
    setSelectedDataset(datasetId);
    const selectedDs = completedDatasets.find(ds => ds.id.toString() === datasetId);
    if (selectedDs) {
      setProjectName(selectedDs.name); // Auto-fill project name
    }
  };

  const handleStartTraining = async () => {
    // Validation du nom de projet
    if (!projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    setIsTraining(true);
    setProgress(0);
    try {
      if (activeTab === 'upload' && file) {
        // Upload dataset avec nouveau format
        const formData = new FormData();
        formData.append('file', file);
        formData.append('task', trainingParams.task);
        formData.append('project_name', projectName.trim()); // Nouveau champ
        formData.append('learning_rate', trainingParams.learningRate);
        formData.append('epochs', trainingParams.epochs);
        formData.append('batch_size', trainingParams.batchSize);
        formData.append('user', 'admin');

        const uploadResponse = await API.post('/api/model/upload', formData);
        console.log('Upload response:', uploadResponse.data);
        const responseData = JSON.parse(uploadResponse.data.data);
        const datasetId = responseData.dataset_id;
        console.log(datasetId); 
        
        setUploadedDatasetId(datasetId);
        setUploadedProjectName(projectName.trim());
        setProgress(33);
        toast.success('Dataset uploaded successfully');

        // Start training avec nouveau endpoint
        await API.post(`/api/model/train/${projectName.trim()}/${datasetId}`);
        setProgress(66);
        toast.success('Training completed');

        // Get training history avec nouveau endpoint
        const historyResponse = await API.get(`/api/model/train/history/${projectName.trim()}/${datasetId}`);
        const parsedHistory = parseTrainingHistory(historyResponse.data.data);
        setParsedHistory(parsedHistory);
        setTrainHistory(historyResponse.data.data);
        setProgress(100);
      } else if (selectedDataset) {
        // Train existing dataset
        await API.post(`/api/model/train/${projectName.trim()}/${selectedDataset}`);
        setProgress(50);
        toast.success('Training completed');

        const historyResponse = await API.get(`/api/model/train/history/${projectName.trim()}/${selectedDataset}`);
        const parsedHistory = parseTrainingHistory(historyResponse.data.data);
        setParsedHistory(parsedHistory);
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
      const currentProjectName = uploadedProjectName || projectName.trim();
      const testResponse = await API.post(`/api/model/test/${currentProjectName}/${datasetId}`);
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

 
// Remplacez la partie return du composant :

return (
  <Card className="w-full h-full shadow-lg flex flex-col">
    <CardHeader className="space-y-1 p-4">
      <CardTitle className="text-xl font-bold">Model Training</CardTitle>
      <CardDescription>
        Train your model using new or existing datasets
      </CardDescription>
    </CardHeader>

    <CardContent className="space-y-4 px-4 flex-1 overflow-y-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-3">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Dataset
          </TabsTrigger>
          <TabsTrigger value="select" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Select Dataset
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-3">
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="dataset">Upload Dataset (CSV)</Label>
            <Input
              id="dataset"
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0])}
              className="cursor-pointer"
            />
          </div>
          
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="project-name-upload">Project Name *</Label>
            <Input
              id="project-name-upload"
              type="text"
              placeholder="Enter project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              disabled={isTraining}
            />
          </div>
        </TabsContent>

        <TabsContent value="select" className="space-y-3">
          <div className="grid w-full items-center gap-3">
            <Label>Select a completed dataset</Label>
            <Select onValueChange={handleDatasetSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a dataset" />
              </SelectTrigger>
              <SelectContent>
                {completedDatasets.map((dataset) => (
                  <SelectItem key={dataset.id} value={dataset.id.toString()}>
                    {dataset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="project-name-select">Project Name</Label>
            <Input
              id="project-name-select"
              type="text"
              placeholder="Auto-filled from dataset name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              disabled={isTraining}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-3">
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

      {/* Affichage des résultats d'entraînement */}
      {parsedHistory && (
        <div className="space-y-4 mt-4">
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

      <TestDialog
        isOpen={isTestDialogOpen}
        onOpenChange={setIsTestDialogOpen}
        results={testResults}
      />
    </CardContent>

    <CardFooter className="flex justify-between border-t p-4">
      <Button
        variant="outline"
        onClick={handleReset}
        size="sm"
      >
        Reset Parameters
      </Button>
      <Button
        onClick={handleStartTraining}
        disabled={isTraining || (activeTab === 'upload' ? !file || !projectName.trim() : !selectedDataset || !projectName.trim())}
        className="flex items-center gap-2"
        size="sm"
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
