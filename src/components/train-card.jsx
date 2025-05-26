import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import API from '../api';

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

  const handleStartTraining = async () => {
    setIsTraining(true);
    try {
      if (activeTab === 'upload' && file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('task', trainingParams.task);
        formData.append('learning_rate', trainingParams.learningRate);
        formData.append('epochs', trainingParams.epochs);
        formData.append('batch_size', trainingParams.batchSize);
        formData.append('user', 'admin');
        formData.append('dataset_id', 1);

        const uploadResponse = await API.post('/api/model/upload', formData);
        const datasetId = uploadResponse.data.data.datasetId; // Assurez-vous que l'API renvoie l'ID
        setUploadedDatasetId(datasetId);
        toast.success('Training data uploaded successfully');
        
        // Utiliser l'ID du dataset qui vient d'être uploadé
        const trainResponse = await API.post(`/api/model/train/${datasetId}`);
        toast.success(trainResponse.data.data);
        
        // Utiliser le même ID pour récupérer l'historique
        const historyResponse = await API.get(`/api/model/train/history/${datasetId}`);
        setTrainHistory(historyResponse.data.data);
      }
      
    } catch (error) {
      console.error('Error during training:', error);
      toast.error('Training failed');
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Model Training</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Dataset</TabsTrigger>
            <TabsTrigger value="select">Select Dataset</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="grid w-full items-center gap-4">
              <Label htmlFor="dataset">Upload Dataset (CSV)</Label>
              <Input
                id="dataset"
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
          </TabsContent>

          <TabsContent value="select" className="space-y-4">
            <div className="grid w-full items-center gap-4">
              <Label>Select a completed dataset</Label>
              {/* Add your dataset selection UI here */}
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
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
            />
          </div>
          <div>
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
            />
          </div>
          <div>
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
            />
          </div>
        </div>

        {trainHistory && (
          <Alert>
            <AlertDescription className="font-mono text-sm whitespace-pre-wrap">
              {trainHistory}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => setTrainingParams({
            learningRate: 0.001,
            epochs: 10,
            batchSize: 32,
            task: 'similarity'
          })}
        >
          Reset Parameters
        </Button>
        <Button
          onClick={handleStartTraining}
          disabled={isTraining || (activeTab === 'upload' && !file)}
        >
          {isTraining ? 'Training...' : 'Start Training'}
        </Button>
      </CardFooter>
    </Card>
  );
}