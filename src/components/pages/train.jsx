import React from 'react';
import TrainCard from '../train-card';
import ProjectHistory from '../project-history';

const TrainPage = () => {
  return (
    <div className="space-y-4 p-4 min-h-screen">
      {/* Header condensé */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Model Space</h1>
        <p className="text-muted-foreground">
          Train your model using new or existing datasets and track your progress.
        </p>
      </div>
      
      {/* Grid layout responsive */}
      <div className="grid lg:grid-cols-2 gap-4 h-[calc(100vh-180px)] min-h-[500px]">
        {/* Section d'entraînement */}
        <div className="flex flex-col h-full">
          <TrainCard />
        </div>

        {/* Section d'historique */}
        <div className="flex flex-col h-full">
          <ProjectHistory />
        </div>
      </div>
    </div>
  );
};

export default TrainPage;