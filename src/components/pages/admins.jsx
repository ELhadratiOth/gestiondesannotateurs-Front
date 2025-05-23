import React from 'react'
import AdminsTable from '../admins-table';
const annotators = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Admins</h1>
      <p className="text-muted-foreground">
        Manage admins members who can manager this application.
      </p>
      <AdminsTable />
    </div>
  );
}

export default annotators
