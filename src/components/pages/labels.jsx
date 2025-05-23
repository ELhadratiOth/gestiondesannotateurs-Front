import React from 'react';
import LabelsTable from '../labels-table';

export default function Labels() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Labels</h1>
      <p className="text-muted-foreground">
        Manage dataset labels and their classifications.
      </p>
      <LabelsTable />
    </div>
  );
}
