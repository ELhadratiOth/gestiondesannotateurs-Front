import { Progress } from "@/components/ui/progress";
import { 
  BarChart2, 
  TestTube, 
  CheckCircle, 
  AlertCircle, 
  History, 
  Loader2,
  FolderOpen,
  Database
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";


export function TestDialog({ isOpen, onOpenChange, results }) {
  console.log('TestDialog results:', results); // Debug log
  
  if (!results) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Test Results - {results.project_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="font-medium">{results.status}</span>
            <span className="text-sm text-muted-foreground">
              • {new Date(results.timestamp).toLocaleString()}
            </span>
          </div>

          {/* Métriques principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-medium">Accuracy</div>
              <div className="text-2xl font-bold text-blue-700">
                {(results.metrics.accuracy * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 font-medium">Precision</div>
              <div className="text-2xl font-bold text-green-700">
                {(results.metrics.precision * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-sm text-orange-600 font-medium">Recall</div>
              <div className="text-2xl font-bold text-orange-700">
                {(results.metrics.recall * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-600 font-medium">F1 Score</div>
              <div className="text-2xl font-bold text-purple-700">
                {(results.metrics.f1_score * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Matrice de confusion */}
          <div>
            <h4 className="font-semibold mb-2">Confusion Matrix</h4>
            <div className="bg-muted rounded-lg p-4">
              <table className="w-full text-center">
                <thead>
                  <tr>
                    <th className="p-2"></th>
                    <th className="p-2 font-medium">Predicted 0</th>
                    <th className="p-2 font-medium">Predicted 1</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th className="p-2 font-medium">Actual 0</th>
                    <td className="p-2 bg-green-100 rounded">{results.metrics.confusion_matrix[0][0]}</td>
                    <td className="p-2 bg-red-100 rounded">{results.metrics.confusion_matrix[0][1]}</td>
                  </tr>
                  <tr>
                    <th className="p-2 font-medium">Actual 1</th>
                    <td className="p-2 bg-red-100 rounded">{results.metrics.confusion_matrix[1][0]}</td>
                    <td className="p-2 bg-green-100 rounded">{results.metrics.confusion_matrix[1][1]}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Rapport de classification détaillé */}
          <div>
            <h4 className="font-semibold mb-2">Classification Report</h4>
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
                  {Object.entries(results.metrics.classification_report)
                    .filter(([key]) => !['accuracy', 'macro avg', 'weighted avg'].includes(key))
                    .map(([className, metrics]) => (
                      <tr key={className} className="border-b border-muted-foreground/10">
                        <td className="p-2 font-medium">Class {className}</td>
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
                  
                  {/* Moyennes */}
                  <tr className="border-t-2 bg-muted/50">
                    <td className="p-2 font-medium">Macro Avg</td>
                    <td className="text-right p-2">
                      {(results.metrics.classification_report['macro avg'].precision * 100).toFixed(1)}%
                    </td>
                    <td className="text-right p-2">
                      {(results.metrics.classification_report['macro avg'].recall * 100).toFixed(1)}%
                    </td>
                    <td className="text-right p-2">
                      {(results.metrics.classification_report['macro avg']['f1-score'] * 100).toFixed(1)}%
                    </td>
                    <td className="text-right p-2">
                      {results.metrics.classification_report['macro avg'].support}
                    </td>
                  </tr>
                  
                  <tr className="bg-muted/50">
                    <td className="p-2 font-medium">Weighted Avg</td>
                    <td className="text-right p-2">
                      {(results.metrics.classification_report['weighted avg'].precision * 100).toFixed(1)}%
                    </td>
                    <td className="text-right p-2">
                      {(results.metrics.classification_report['weighted avg'].recall * 100).toFixed(1)}%
                    </td>
                    <td className="text-right p-2">
                      {(results.metrics.classification_report['weighted avg']['f1-score'] * 100).toFixed(1)}%
                    </td>
                    <td className="text-right p-2">
                      {results.metrics.classification_report['weighted avg'].support}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}