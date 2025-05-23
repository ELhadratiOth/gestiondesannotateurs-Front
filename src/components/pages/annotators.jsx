import React from 'react'
import AnnotatorsTable from '../annotators-table'
const annotators = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Annotators</h1>
      <p className="text-muted-foreground">
        Manage team members who can annotate content in your projects.
      </p>
      <AnnotatorsTable />
    </div>
  );
}

export default annotators
