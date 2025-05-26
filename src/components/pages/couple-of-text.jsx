import { useParams } from 'react-router-dom';
import BlockOfCompos from '../layouts/block-of-compos';

export default function CoupleOfTextPage() {
  const { idDataset } = useParams();

  return (
    <BlockOfCompos>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hello</h1>
          <p className="text-muted-foreground">Dataset ID: {idDataset}</p>
        </div>

        <div className="mt-8">
          <p>This page will show all couples of text for dataset {idDataset}</p>
        </div>
      </div>
    </BlockOfCompos>
  );
}
