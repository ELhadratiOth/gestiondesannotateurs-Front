import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  History, 
  FolderOpen, 
  Database, 
  CheckCircle, 
  Clock, 
  XCircle,
  Loader2,
  BarChart3,
  TrendingUp,
  Activity,
  Eye,
  Play,
  TestTube,
  Calendar,
  FileText,
  RefreshCw
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import API from '../api';

// Composant pour afficher les métriques détaillées (TRAINING + TEST)
function MetricsDialog({ isOpen, onOpenChange, project, dataset }) {
  const [trainHistory, setTrainHistory] = useState(null);
  const [testHistory, setTestHistory] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && project && dataset) {
      fetchMetrics();
    }
  }, [isOpen, project, dataset]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      // Récupérer l'historique d'entraînement
      if (dataset.training_status === 'completed') {
        const trainResponse = await API.get(`/api/model/train/history/${project.name}/${dataset.id}`);
        const trainData = parseTrainingHistory(trainResponse.data.data);
        setTrainHistory(trainData);
      }

      // Récupérer l'historique de test
      if (dataset.testing_status === 'completed') {
        const testResponse = await API.get(`/api/model/test/history/${project.name}/${dataset.id}`);
        const testData = parseTestResults(testResponse.data.data);
        setTestHistory(testData);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast.error('Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  const parseTrainingHistory = (historyData) => {
    try {
      const historyStr = historyData.replace('📈 Training History:\n', '');
      const history = JSON.parse(historyStr);
      
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

      const metricsStr = history.stdout.match(/{"metrics": {.*}}/);
      const metrics = metricsStr ? JSON.parse(metricsStr[0]).metrics : null;

      return { timestamp: history.timestamp, logs, metrics };
    } catch (error) {
      console.error('Error parsing training history:', error);
      return null;
    }
  };

  const parseTestResults = (testData) => {
    try {
      const jsonStart = testData.indexOf('{"status"');
      if (jsonStart === -1) return null;
      
      const jsonStr = testData.substring(jsonStart);
      const testResult = JSON.parse(jsonStr);
      const result = testResult.result;
      
      return {
        timestamp: result.timestamp,
        project_name: result.project_name,
        status: testResult.status,
        metrics: {
          accuracy: result.metrics.accuracy,
          precision: result.metrics.precision,
          recall: result.metrics.recall,
          f1_score: result.metrics.classification_report['weighted avg']['f1-score'],
          confusion_matrix: result.metrics.confusion_matrix,
          classification_report: result.metrics.classification_report
        }
      };
    } catch (error) {
      console.error('Error parsing test results:', error);
      return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Metrics for {project?.name} - Dataset {dataset?.id}
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading metrics...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Configuration du dataset */}
            {dataset?.config && (
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Dataset Configuration
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><span className="font-medium">File:</span> {dataset.config.file_name}</div>
                  <div><span className="font-medium">Task:</span> {dataset.config.task}</div>
                  <div><span className="font-medium">Size:</span> {dataset.config.dataset_size} samples</div>
                  <div><span className="font-medium">Learning Rate:</span> {dataset.config.learning_rate}</div>
                  <div><span className="font-medium">Epochs:</span> {dataset.config.epochs}</div>
                  <div><span className="font-medium">Batch Size:</span> {dataset.config.batch_size}</div>
                </div>
              </div>
            )}

            {/* Métriques d'entraînement */}
            {trainHistory?.metrics && (
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  Training Metrics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm text-blue-600 font-medium">Accuracy</div>
                    <div className="text-3xl font-bold text-blue-700">
                      {(trainHistory.metrics.accuracy * 100).toFixed(1)}%
                    </div>
                    <Progress value={trainHistory.metrics.accuracy * 100} className="h-2 mt-2" />
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm text-green-600 font-medium">F1 Score</div>
                    <div className="text-3xl font-bold text-green-700">
                      {(trainHistory.metrics.f1_score * 100).toFixed(1)}%
                    </div>
                    <Progress value={trainHistory.metrics.f1_score * 100} className="h-2 mt-2" />
                  </div>
                </div>

                <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span>Trained: {new Date(trainHistory.timestamp).toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Métriques de test */}
            {testHistory?.metrics && (
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <TestTube className="h-4 w-4 text-green-500" />
                  Test Results
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm text-blue-600 font-medium">Accuracy</div>
                    <div className="text-2xl font-bold text-blue-700">
                      {(testHistory.metrics.accuracy * 100).toFixed(1)}%
                    </div>
                    <Progress value={testHistory.metrics.accuracy * 100} className="h-1 mt-2" />
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm text-green-600 font-medium">Precision</div>
                    <div className="text-2xl font-bold text-green-700">
                      {(testHistory.metrics.precision * 100).toFixed(1)}%
                    </div>
                    <Progress value={testHistory.metrics.precision * 100} className="h-1 mt-2" />
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="text-sm text-orange-600 font-medium">Recall</div>
                    <div className="text-2xl font-bold text-orange-700">
                      {(testHistory.metrics.recall * 100).toFixed(1)}%
                    </div>
                    <Progress value={testHistory.metrics.recall * 100} className="h-1 mt-2" />
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-sm text-purple-600 font-medium">F1 Score</div>
                    <div className="text-2xl font-bold text-purple-700">
                      {(testHistory.metrics.f1_score * 100).toFixed(1)}%
                    </div>
                    <Progress value={testHistory.metrics.f1_score * 100} className="h-1 mt-2" />
                  </div>
                </div>

                {/* Matrice de confusion */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Confusion Matrix</h4>
                  <div className="flex justify-center">
                    <table className="text-center bg-white rounded-lg overflow-hidden">
                      <thead>
                        <tr>
                          <th className="p-3 bg-muted"></th>
                          <th className="p-3 bg-muted font-medium">Predicted 0</th>
                          <th className="p-3 bg-muted font-medium">Predicted 1</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th className="p-3 bg-muted font-medium">Actual 0</th>
                          <td className="p-3 bg-green-100 font-bold">{testHistory.metrics.confusion_matrix[0][0]}</td>
                          <td className="p-3 bg-red-100 font-bold">{testHistory.metrics.confusion_matrix[0][1]}</td>
                        </tr>
                        <tr>
                          <th className="p-3 bg-muted font-medium">Actual 1</th>
                          <td className="p-3 bg-red-100 font-bold">{testHistory.metrics.confusion_matrix[1][0]}</td>
                          <td className="p-3 bg-green-100 font-bold">{testHistory.metrics.confusion_matrix[1][1]}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 flex items-center gap-2">
                  <TestTube className="h-4 w-4" />
                  <span>Tested: {new Date(testHistory.timestamp).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function ProjectHistory() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [isMetricsDialogOpen, setIsMetricsDialogOpen] = useState(false);

  useEffect(() => {
    fetchProjectHistory();
  }, []);

  const fetchProjectHistory = async () => {
    setLoading(true);
    try {
      const response = await API.get('/api/model/projects/history');
      if (response.status === 200 && response.data.status === 'success') {
        const historyString = response.data.data.replace('📈 Training History:\n', '');
        const historyData = JSON.parse(historyString);
        
        const projectsArray = Object.entries(historyData).map(([projectName, projectData]) => ({
          name: projectName,
          datasets: Object.entries(projectData.datasets).map(([datasetId, datasetData]) => ({
            id: datasetId,
            ...datasetData
          })),
          created_at: projectData.created_at
        }));
        
        setProjects(projectsArray);
      }
    } catch (error) {
      console.error('Error fetching project history:', error);
      toast.error('Failed to load project history');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProjectHistory();
    setRefreshing(false);
    toast.success('Project history refreshed');
  };

  const getStatusBadge = (status) => {
    const variants = {
      completed: { icon: CheckCircle, className: "bg-green-100 text-green-800 border-green-200" },
      pending: { icon: Clock, className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      failed: { icon: XCircle, className: "bg-red-100 text-red-800 border-red-200" },
    };

    const variant = variants[status] || { icon: Clock, className: "bg-gray-100 text-gray-800 border-gray-200" };
    const IconComponent = variant.icon;

    return (
      <Badge className={`${variant.className} border`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const openMetricsDialog = (project, dataset) => {
    setSelectedProject(project);
    setSelectedDataset(dataset);
    setIsMetricsDialogOpen(true);
  };

  const getProjectStats = (project) => {
    const total = project.datasets.length;
    const trained = project.datasets.filter(d => d.training_status === 'completed').length;
    const tested = project.datasets.filter(d => d.testing_status === 'completed').length;
    return { total, trained, tested };
  };

  if (loading) {
    return (
      <Card className="w-full h-full flex flex-col">
        <CardContent className="flex justify-center items-center h-32">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading project history...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full h-full flex flex-col">
        <CardHeader className="p-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Project History
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {projects.length} Projects
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-4 overflow-y-auto">
          {projects.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No training projects found</p>
              <p className="text-sm">Start training a model to see your project history here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => {
                const stats = getProjectStats(project);
                return (
                  <div key={project.name} className="border rounded-lg p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FolderOpen className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{project.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(project.created_at).toLocaleDateString()}
                            </span>
                            <span>{stats.total} datasets</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-right text-sm">
                          <div className="font-medium text-green-600">{stats.trained}/{stats.total} trained</div>
                          <div className="font-medium text-blue-600">{stats.tested}/{stats.total} tested</div>
                        </div>
                        <Progress 
                          value={(stats.trained / stats.total) * 100} 
                          className="w-16 h-2"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {project.datasets.map((dataset) => (
                        <div key={dataset.id} className="bg-muted/30 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Database className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">Dataset {dataset.id}</div>
                                <div className="text-sm text-muted-foreground">
                                  {dataset.config?.file_name} • {dataset.config?.dataset_size} samples
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {getStatusBadge(dataset.training_status)}
                              {getStatusBadge(dataset.testing_status)}
                              
                              {(dataset.training_status === 'completed' || dataset.testing_status === 'completed') && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openMetricsDialog(project, dataset)}
                                  className="ml-2"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View Metrics
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {dataset.config && (
                            <div className="mt-2 grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                              <div>Task: {dataset.config.task}</div>
                              <div>LR: {dataset.config.learning_rate}</div>
                              <div>Epochs: {dataset.config.epochs}</div>
                              <div>Batch: {dataset.config.batch_size}</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <MetricsDialog
        isOpen={isMetricsDialogOpen}
        onOpenChange={setIsMetricsDialogOpen}
        project={selectedProject}
        dataset={selectedDataset}
      />
    </>
  );
}