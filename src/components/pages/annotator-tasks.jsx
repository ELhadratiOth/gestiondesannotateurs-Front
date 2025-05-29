import React from 'react';
import AnnotatorTasksTable from '../annotator-tasks-table';

const AnnotatorTasks = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Annotation Tasks</h1>
      <p className="text-muted-foreground">
        View and work on your assigned annotation tasks.
      </p>
      <AnnotatorTasksTable />
    </div>
  );
};

export default AnnotatorTasks;