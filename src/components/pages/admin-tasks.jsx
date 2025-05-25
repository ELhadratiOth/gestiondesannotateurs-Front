import React from 'react'
import AdminTasksTable from '../admin-tasks-table';

const adminTasks = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Tasks</h1>
      <p className="text-muted-foreground">
        View and manage your assigned annotation tasks.
      </p>
      <AdminTasksTable />
    </div>
  );
}

export default adminTasks
