import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@/components/ui/breadcrumb';
import { ChevronRight, Database, BookText, RefreshCw } from 'lucide-react';
import BlockOfCompos from '../layouts/block-of-compos';
import CoupleOfTextTable from '../couple-of-text-card';
import API from '../../api';

export default function CoupleOfTextPage() {
  const { idDataset } = useParams();
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDatasetInfo = async () => {
      try {
        const response = await API.get(`/api/datasets/${idDataset}`);
        if (response.status === 200) {
          setDatasetInfo(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching dataset info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDatasetInfo();
  }, [idDataset]);

  return (
    <BlockOfCompos>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/datasets" className="flex items-center">
              <Database className="h-4 w-4 mr-1" /> Datasets
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink className="text-primary font-medium flex items-center">
              <BookText className="h-4 w-4 mr-1" /> Couple of Text
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        {/* Page Header */}
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">
              Couple of text
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary">
                Dataset ID: {idDataset}
              </span>
              {datasetInfo && (
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                  {datasetInfo.datasetName || 'Sans nom'}
                </span>
              )}
            </div>
          </div>
          <p className="text-muted-foreground mt-2">
            Visualize all pairs of text and their labels in this dataset
          </p>{' '}
        </div>

        {/* Table Component */}
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading dataset information...</span>
          </div>
        ) : (
          <div className="mt-8">
            <CoupleOfTextTable datasetId={idDataset} />
          </div>
        )}
      </div>
    </BlockOfCompos>
  );
}
