import React from 'react'
import DatasetsGrid from '../datasets-grid'

const datasets = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Datasets</h1>
      <p className="text-muted-foreground">
        Browse and manage your annotation datasets.
      </p>
      <DatasetsGrid />
    </div>
  );
}

export default datasets
