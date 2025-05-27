import { Progress } from "@/components/ui/progress";
import { BarChart2, TestTube } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const TestResults = ({ results }) => {
  if (!results) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-muted rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Test Accuracy</div>
          <div className="text-2xl font-bold">
            {(results.metrics.accuracy * 100).toFixed(2)}%
          </div>
          <Progress 
            value={results.metrics.accuracy * 100} 
            className="h-2 mt-2"
          />
        </div>
        <div className="bg-muted rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Precision</div>
          <div className="text-2xl font-bold">
            {(results.metrics.precision * 100).toFixed(2)}%
          </div>
          <Progress 
            value={results.metrics.precision * 100} 
            className="h-2 mt-2"
          />
        </div>
        <div className="bg-muted rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Recall</div>
          <div className="text-2xl font-bold">
            {(results.metrics.recall * 100).toFixed(2)}%
          </div>
          <Progress 
            value={results.metrics.recall * 100} 
            className="h-2 mt-2"
          />
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2">Confusion Matrix</h4>
        <div className="bg-muted rounded-lg p-4">
          <table className="min-w-full text-sm">
            <tbody>
              {results.metrics.confusion_matrix.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className="p-2 text-center border">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2">Test Classification Details</h4>
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
    </div>
  );
};

export const TestDialog = ({ 
  isOpen, 
  onOpenChange, 
  onStartTest, 
  results, 
  isTesting 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {/* <Button
          onClick={onStartTest}
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
        </Button> */}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[100vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-purple-500" />
            Test Results
          </DialogTitle>
        </DialogHeader>
        {results && <TestResults results={results} />}
      </DialogContent>
    </Dialog>
  );
};