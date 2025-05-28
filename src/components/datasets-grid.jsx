import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Database,
  Search,
  Plus,
  Edit,
  Download,
  Trash2,
  UserPlus,
  UserMinus,
  Users,
  Scan,
  RefreshCw,
  Calendar,
  FileText,
  LayoutGrid,
  Info,
  MoreHorizontal,
  Eye,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import API from '../api';

export default function DatasetsGrid() {
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [selectedAnnotators, setSelectedAnnotators] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isDisaffecting, setIsDisaffecting] = useState(false);
  const [detailDataset, setDetailDataset] = useState(null);
  const [showAnnotatorScan, setShowAnnotatorScan] = useState(false);
  const [scanningDataset, setScanningDataset] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [annotators, setAnnotators] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [labelsData, setLabelsData] = useState([]);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    labelId: 0,
  });

  // Use useCallback for data fetching functions to prevent unnecessary re-renders
  const fetchDatasetsCallback = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await API.get('/api/datasets');
      console.log('ggggggg:', response.data);
      const result = response.data.data;

      const datasetsArray = Array.isArray(result) ? result : [];

      const datasetsWithAnnotators = datasetsArray.map(dataset => ({
        ...dataset,
        datasetId: dataset.datasetId,
        datasetSize: dataset.datasetSize || 0,
        datasetName: dataset.datasetName || 'Unnamed Dataset',
        datasetAdvancement: dataset.datasetAdvancement || 0,
        datasetDescription: dataset.datasetDescription || '',
        datasetLabel: dataset.datasetLabel || 'No Label',
        datasetCreatedAt: dataset.datasetCreatedAt || new Date().toISOString(),
        datasetAssigned: dataset.assigned || false,
        annotators: Array.isArray(dataset.annotators)
          ? dataset.annotators.map(annotator => ({
              ...annotator,
              id: annotator.id || annotator.annotatorId,
              firstName: annotator.firstName || 'erywry',
              lastName: annotator.lastName || 'ewtert',
              email: annotator.email || 'erwterterw',
              active: annotator.active !== undefined ? annotator.active : true,
              role: annotator.role || 'ANNOTATOR',
            }))
          : [],
      }));

      setDatasets(datasetsWithAnnotators);
      console.log('Datasets loaded:', datasetsWithAnnotators);
    } catch (error) {
      console.error('Error fetching datasets:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  const fetchAnnotatorsCallback = useCallback(async () => {
    try {
      console.log('Fetching annotators...');
      const response = await API.get('/api/annotators');
      const result = response.data;
      console.log('Annotators response:', result);

      if (result.status === 'success' && Array.isArray(result.data)) {
        const processedAnnotators = result.data.map(annotator => ({
          id: annotator.id,
          firstName: annotator.firstName || '',
          lastName: annotator.lastName || '',
          email: annotator.email || '',
          active: annotator.active !== undefined ? annotator.active : true,
          role: annotator.role || 'ANNOTATOR',
        }));

        console.log(
          `Successfully processed ${processedAnnotators.length} annotators`,
        );
        setAnnotators(processedAnnotators);
      } else {
        console.log(
          'Unexpected annotators response format, using mock data:',
          result,
        );
      }
    } catch (error) {
      console.error('Error fetching annotators:', error);
    }
  }, []);

  const fetchLabelsCallback = useCallback(async () => {
    try {
      const response = await API.get('/api/labels');
      const result = response.data;

      if (Array.isArray(result)) {
        setLabelsData(result);
      } else if (result.data && Array.isArray(result.data)) {
        setLabelsData(result.data);
      } else if (result.status === 'success' && result.data) {
        setLabelsData(result.data);
      } else {
        setLabelsData([]);
      }

      console.log('Labels loaded successfully');
    } catch (error) {
      console.error('Error fetching labels:', error);
      setLabelsData([]);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchDatasetsCallback(),
          fetchAnnotatorsCallback(),
          fetchLabelsCallback(),
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [fetchDatasetsCallback, fetchAnnotatorsCallback, fetchLabelsCallback]);

  const refreshDatasets = useCallback(() => {
    fetchDatasetsCallback();
  }, [fetchDatasetsCallback]);

  const refreshLabels = useCallback(() => {
    fetchLabelsCallback();
  }, [fetchLabelsCallback]);

  const refreshAnnotators = useCallback(() => {
    fetchAnnotatorsCallback();
  }, [fetchAnnotatorsCallback]);

  const refreshAllData = useCallback(() => {
    refreshDatasets();
    refreshLabels();
    refreshAnnotators();
  }, [refreshDatasets, refreshLabels, refreshAnnotators]);

  const filteredDatasets = datasets.filter(dataset => {
    if (!dataset) return false;
    const name = (dataset.datasetName || '').toLowerCase();
    const description = (dataset.datasetDescription || '').toLowerCase();
    const label = dataset.datasetLabel || '';
    const term = searchTerm.toLowerCase();

    return (
      name.includes(term) || description.includes(term) || label.includes(term)
    );
  });

  const handleEditDataset = (datasetId, e) => {
    if (e) e.stopPropagation();

    if (!datasetId) return;

    const dataset = datasets.find(d => d.datasetId === datasetId);
    if (dataset) {
      setEditFormData({
        name: dataset.datasetName || '',
        description: dataset.datasetDescription || '',
        labelId:
          labelsData.find(l => l.name === dataset.datasetLabel)?.id ||
          (labelsData.length > 0 ? labelsData[0].id : 1),
      });
      setSelectedDataset(datasetId);
    }
  };

  const handleSaveEditedDataset = async () => {
    if (!selectedDataset) return;

    setIsEditing(true);
    try {
      const response = await API.put(`/api/datasets/${selectedDataset}`, {
        name: editFormData.name,
        description: editFormData.description,
        labelId: editFormData.labelId,
      });
      const result = await response.data;
      console.log(result);
      const updatedDatasets = datasets.map(dataset =>
        dataset.datasetId === selectedDataset
          ? {
              ...dataset,
              datasetName: editFormData.name,
              datasetDescription: editFormData.description,
              datasetLabel:
                labelsData.find(l => l.id === editFormData.labelId)?.name ||
                'label 1',
            }
          : dataset,
      );

      setDatasets(updatedDatasets);
      setSelectedDataset(null);

      refreshDatasets();
    } catch (error) {
      console.error('Error updating dataset:', error);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteDataset = async datasetId => {
    setIsDeleting(true);
    try {
      await API.delete(`/api/datasets/${datasetId}`);
      setDatasets(datasets.filter(dataset => dataset.datasetId !== datasetId));

      if (detailDataset === datasetId) {
        setDetailDataset(null);
      }

      setTimeout(() => {
        refreshDatasets();
      }, 500);
    } catch (error) {
      console.error('Error deleting dataset:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  const handleAssignAnnotators = (datasetId, e) => {
    if (e) e.stopPropagation();
    const dataset = datasets.find(d => d.datasetId === datasetId);
    if (dataset) {
      refreshAnnotators();
      console.log(
        'Opening annotator assignment dialog for dataset:',
        datasetId,
      );
      setEditFormData(null);
      setSelectedDataset(datasetId);
      setSelectedAnnotators(dataset.annotators?.map(a => a.id) || []);
    }
  };

  const handleAnnotatorSelection = annotatorId => {
    setSelectedAnnotators(prev =>
      prev.includes(annotatorId)
        ? prev.filter(id => id !== annotatorId)
        : [...prev, annotatorId],
    );
  };
  const handleSaveAnnotators = async () => {
    if (!selectedDataset) return;

    if (selectedAnnotators.length < 3) {
      alert('Please select at least 3 annotators before assigning.');
      return;
    }

    setIsAssigning(true);
    try {
      const payload = {
        annotatorIds: selectedAnnotators,
        datasetId: selectedDataset,
      };

      await API.post('/api/tasks', payload);
      console.log(
        'Assigned annotators:',
        selectedAnnotators,
        'to dataset:',
        selectedDataset,
      );

      const selectedAnnotatorsData = annotators
        .filter(annotator => selectedAnnotators.includes(annotator.id))
        .map(annotator => ({
          id: annotator.id,
          firstName: annotator.firstName || '',
          lastName: annotator.lastName || '',
          email: annotator.email || '',
          active: annotator.active !== undefined ? annotator.active : true,
          role: annotator.role || 'Annotator',
        }));

      setDatasets(
        datasets.map(dataset =>
          dataset.datasetId === selectedDataset
            ? { ...dataset, annotators: selectedAnnotatorsData }
            : dataset,
        ),
      );
      setSelectedDataset(null);

      refreshDatasets();
      refreshAnnotators();
    } catch (error) {
      console.error('Error assigning annotators:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle disaffect all annotators
  const handleDisaffectAllAnnotators = async (datasetId, e) => {
    if (e) e.stopPropagation();

    if (
      !confirm(
        'Are you sure you want to remove all annotators from this dataset?',
      )
    ) {
      return;
    }

    setIsDisaffecting(true);
    try {
      await API.delete(`/api/tasks/dataset/${datasetId}`);

      console.log('Removed all annotators from dataset:', datasetId);

      // Update local state to remove annotators from the dataset
      setDatasets(
        datasets.map(dataset =>
          dataset.datasetId === datasetId
            ? { ...dataset, annotators: [], assigned: false }
            : dataset,
        ),
      );

      // Refresh data after disaffecting annotators
      refreshDatasets();
      refreshAnnotators();

      alert('All annotators have been successfully removed from the dataset.');
    } catch (error) {
      console.error('Error removing annotators:', error);
      alert('Failed to remove annotators. Please try again.');
    } finally {
      setIsDisaffecting(false);
    }
  };

  const handleCardClick = datasetId => {
    setDetailDataset(datasetId);
  };
  const handleScanAnnotators = (datasetId, e) => {
    if (e) e.stopPropagation();

    // Always reset and set the scanning dataset and dialog state
    setScanningDataset(datasetId);
    setIsScanning(true);
    setShowAnnotatorScan(true);

    // Simulate scanning process
    setTimeout(() => {
      setIsScanning(false);
    }, 1500);
  };

  // Navigate to couple of text page
  const handleViewCouplesOfText = (dataset, e) => {
    if (e) e.stopPropagation();
    navigate(`/couple-of-text/${dataset.datasetId}`);
  };

  const getAnnotatorName = annotatorId => {
    const annotator = annotators.find(a => a.id === annotatorId);
    return annotator
      ? `${annotator.firstName} ${annotator.lastName}`
      : annotatorId;
  };

  // Get dataset annotators
  const getDatasetAnnotators = datasetId => {
    if (!datasetId) return [];
    const dataset = datasets.find(d => d.datasetId === datasetId);
    if (!dataset) return [];

    // Handle different possible structures for annotators
    if (Array.isArray(dataset.annotators)) {
      return dataset.annotators.map(annotator => ({
        id: annotator.id || annotator.annotatorId,
        firstName: annotator.firstName || '',
        lastName: annotator.lastName || '',
        email: annotator.email || '',
        active: annotator.active !== undefined ? annotator.active : true,
        role: annotator.role || 'Annotator',
      }));
    }
    return [];
  };

  // Get detail dataset
  const getDetailDataset = () => {
    if (!detailDataset) return null;
    const dataset = datasets.find(d => d.datasetId === detailDataset);
    if (!dataset) return null;

    console.log('Detail dataset:', dataset);

    return {
      datasetId: dataset.datasetId,
      datasetName: dataset.datasetName || 'Unnamed Dataset',
      datasetDescription: dataset.datasetDescription || '',
      datasetLabel: dataset.datasetLabel || 'No Label',
      datasetSize: dataset.datasetSize || 0,
      datasetAdvancement: dataset.datasetAdvancement || 0,
      datasetCreatedAt: dataset.datasetCreatedAt || new Date().toISOString(),
      annotators: dataset.annotators || [],
      datasetAssignedAt: dataset.assignedAt,
    };
  };

  // Handle add dataset
  const handleAddDataset = async e => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const formData = new FormData(e.target);
      const name = formData.get('name');
      const description = formData.get('description') || '';
      const labelId = formData.get('labelId');
      const file = formData.get('file');
      const sizeMB = file.size / (1024 * 1024);

      const correctFormData = new FormData();
      correctFormData.append('name', name);
      correctFormData.append('description', description);
      correctFormData.append('labelId', labelId);
      correctFormData.append('sizeMB', sizeMB.toFixed(6));
      correctFormData.append('file', file);

      console.log('Submitting dataset with:', {
        name,
        description,
        labelId,
        sizeMB: sizeMB.toFixed(6),
        fileName: file.name,
      });

      // Send the FormData directly to the Spring backend
      const response = await API.post('/api/datasets', correctFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Dataset creation response:', response);

      let createdDataset;
      if (response.data) {
        createdDataset = response.data.data;
      }
      console.log('Created dataset:', createdDataset);

      const newDataset = {
        datasetId: createdDataset?.datasetId || Date.now(),
        datasetSize: createdDataset?.datasetSizeMB || sizeMB,
        datasetName: createdDataset?.datasetName || name,
        datasetDescription: createdDataset?.description || description,
        datasetLabel:
          createdDataset?.datasetLabel ||
          labelsData.find(l => l.id === Number.parseInt(labelId))?.name ||
          'Default Label',
        datasetAdvancement: createdDataset?.datasetAdvancement || 0,
        datasetCreatedAt:
          createdDataset?.datasetCreatedAt || new Date().toISOString(),
        datasetSizeMB: createdDataset?.datasetSize || 0,
        datasetAssignedAt:
          createdDataset?.assignedAt || new Date().toISOString(),
        annotators: [],
      };

      setDatasets([newDataset, ...datasets]);

      setTimeout(() => {
        refreshDatasets();
      }, 1000);

      document
        .querySelector('[data-state="open"] button[type="button"]')
        .click();
    } catch (error) {
      console.error('Error creating dataset:', error);
      alert('Failed to create dataset. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const formatFileSize = sizeInMB => {
    if (!sizeInMB) return 'Unknown size';
    return `${sizeInMB} MB`;
  };

  const handleDownloadDataset = datasetId => {
    if (!datasetId) return;

    const downloadUrl = `${API.defaults.baseURL}/api/datasets/download/${datasetId}`;
    window.open(downloadUrl, '_blank');
    console.log(`Downloading dataset with ID: ${datasetId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search datasets..."
            className="pl-8"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={refreshAllData}
            disabled={isLoading}
            title="Refresh Data"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                <span>Add Dataset</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Dataset</DialogTitle>
                <DialogDescription>
                  Upload a file and provide information to create a new dataset.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddDataset}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Dataset Name</Label>
                    <div className="relative">
                      <Database className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter dataset name"
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Enter a description of your dataset"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="labelId">Label</Label>
                    <Select defaultValue="1" name="labelId">
                      <SelectTrigger id="labelId">
                        <SelectValue placeholder="Select label" />
                      </SelectTrigger>
                      <SelectContent>
                        {labelsData.map(label => (
                          <SelectItem
                            key={label.id}
                            value={label.id.toString()}
                          >
                            {label.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file">Upload Dataset File</Label>
                    <div className="grid gap-2">
                      <Input
                        id="file"
                        name="file"
                        type="file"
                        accept=".csv,.json,.xlsx"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Supported formats: CSV, JSON, JSONL, XML, XLSX. Maximum
                        file size: 100MB.
                      </p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? 'Creating...' : 'Create Dataset'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading datasets...</span>
        </div>
      ) : filteredDatasets.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center">
          <Database className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">No datasets found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchTerm
              ? 'Try a different search term'
              : 'Get started by creating your first dataset'}
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Dataset
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Dataset</DialogTitle>
                <DialogDescription>
                  Upload a file and provide information to create a new dataset.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddDataset}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name-empty">Dataset Name</Label>
                    <div className="relative">
                      <Database className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name-empty"
                        name="name"
                        placeholder="Enter dataset name"
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description-empty">Description</Label>
                    <Textarea
                      id="description-empty"
                      name="description"
                      placeholder="Enter a description of your dataset"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="labelId-empty">Label</Label>
                    <Select defaultValue="1" name="labelId">
                      <SelectTrigger id="labelId-empty">
                        <SelectValue placeholder="Select label" />
                      </SelectTrigger>
                      <SelectContent>
                        {labelsData.map(label => (
                          <SelectItem
                            key={label.id}
                            value={label.id.toString()}
                          >
                            {label.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file-empty">Upload Dataset File</Label>
                    <div className="grid gap-2">
                      <Input
                        id="file-empty"
                        name="file"
                        type="file"
                        accept=".csv,.json,.xlsx"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Supported formats: CSV, JSON, JSONL, XML, XLSX. Maximum
                        file size: 100MB.
                      </p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? 'Creating...' : 'Create Dataset'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDatasets.map(dataset => (
            <Card
              key={dataset.datasetId || `dataset-${Math.random()}`}
              className="overflow-hidden cursor-pointer transition-all duration-200 hover:border-muted-foreground/20"
              onClick={() => handleCardClick(dataset.datasetId)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-muted-foreground" />
                      {dataset.datasetName || 'Unnamed Dataset'}
                    </CardTitle>
                    <CardDescription>
                      {dataset.datasetLabel || 'No Label'}
                    </CardDescription>
                  </div>{' '}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={e => e.stopPropagation()}
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={e => handleViewCouplesOfText(dataset, e)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View All Couples of Text
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={e => handleEditDataset(dataset.datasetId, e)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      {!dataset.assigned && (
                        <DropdownMenuItem
                          onClick={e =>
                            handleAssignAnnotators(dataset.datasetId, e)
                          }
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Assign Annotators
                        </DropdownMenuItem>
                      )}
                      {dataset.assigned &&
                        dataset.annotators &&
                        dataset.annotators.length > 0 && (
                          <DropdownMenuItem
                            onClick={e =>
                              handleDisaffectAllAnnotators(dataset.datasetId, e)
                            }
                            className="text-orange-600"
                            disabled={isDisaffecting}
                          >
                            <UserMinus className="mr-2 h-4 w-4" />
                            {isDisaffecting
                              ? 'Removing...'
                              : 'Disaffect All Annotators'}
                          </DropdownMenuItem>
                        )}
                      <DropdownMenuItem
                        onClick={e =>
                          handleScanAnnotators(dataset.datasetId, e)
                        }
                      >
                        <Scan className="mr-2 h-4 w-4" />
                        Scan Annotators
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={e => {
                          e.stopPropagation();
                          handleDownloadDataset(dataset.datasetId);
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={e => {
                          e.stopPropagation();
                          if (
                            confirm(
                              `Are you sure you want to delete "${dataset.datasetName}"?`,
                            )
                          ) {
                            handleDeleteDataset(dataset.datasetId);
                          }
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {dataset.datasetDescription}
                </p>
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span>{dataset.datasetAdvancement}%</span>
                  </div>
                  <Progress
                    value={dataset.datasetAdvancement}
                    className="h-2"
                  />
                </div>
                {dataset.annotators && dataset.annotators.length > 0 && (
                  <div className="mt-3 ">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>Assigned Annotators:</span>
                    </div>
                    <div className="flex -space-x-2">
                      {dataset.annotators.slice(0, 3).map(annotator => (
                        <Avatar
                          key={annotator.id}
                          className="h-10 w-10 border-2 border-background"
                        >
                          <AvatarImage
                            src={`/placeholder.svg?height=24&width=24&text=${
                              annotator.firstName.charAt(0) || ''
                            }${annotator.lastName.charAt(0) || ''}`}
                          />
                          <AvatarFallback className="text-xs">
                            {annotator.firstName.charAt(0) || ''}
                            {annotator.lastName.charAt(0) || ''}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {dataset.annotators.length > 3 && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                          +{dataset.annotators.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex items-center justify-between pt-2">
                <div className="text-sm text-muted-foreground">
                  Created:
                  {new Date(dataset.datasetCreatedAt).toLocaleDateString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatFileSize(dataset.datasetSize)}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      <Dialog
        open={detailDataset !== null}
        onOpenChange={open => !open && setDetailDataset(null)}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              {getDetailDataset()?.datasetName}
            </DialogTitle>
            <DialogDescription>
              {getDetailDataset()?.datasetLabel}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="overview" className="mt-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="annotators">Annotators</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Created
                  </Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {getDetailDataset() &&
                        new Date(
                          getDetailDataset().datasetCreatedAt,
                        ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Size</Label>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formatFileSize(getDetailDataset()?.datasetSize)}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Label</Label>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {getDetailDataset()?.datasetLabel}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Advancement
                  </Label>
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {getDetailDataset()?.datasetAdvancement}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground rounded-md border p-3">
                  {getDetailDataset()?.datasetDescription}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Progress</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Annotation Progress
                    </span>
                    <span>{getDetailDataset()?.datasetAdvancement}%</span>
                  </div>
                  <Progress
                    value={getDetailDataset()?.datasetAdvancement}
                    className="h-3"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="annotators" className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Assigned Annotators
                </Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() =>
                      detailDataset && handleScanAnnotators(detailDataset)
                    }
                  >
                    <Scan className="h-3.5 w-3.5" />
                    Scan Status
                  </Button>
                </div>
              </div>
              {detailDataset &&
              getDatasetAnnotators(detailDataset).length > 0 ? (
                <div className="space-y-2">
                  {getDatasetAnnotators(detailDataset).map(annotator => (
                    <div
                      key={annotator.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`/placeholder.svg?height=32&width=32&text=${annotator.firstName.charAt(
                              0,
                            )}${annotator.lastName.charAt(0)}`}
                          />
                          <AvatarFallback>
                            {annotator.firstName.charAt(0)}
                            {annotator.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {annotator.firstName} {annotator.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {annotator.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={annotator.active ? 'default' : 'secondary'}
                        >
                          {annotator.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border border-dashed p-8 text-center">
                  <Users className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No annotators assigned to this dataset
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() =>
                      detailDataset && handleAssignAnnotators(detailDataset)
                    }
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign Annotators
                  </Button>
                </div>
              )}

              <div className="rounded-md border bg-muted/50 p-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Annotators can be assigned to multiple datasets. Only active
                    annotators can work on datasets.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Annotation Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {getDetailDataset()?.datasetAdvancement}%
                    </div>
                    <Progress
                      value={getDetailDataset()?.datasetAdvancement}
                      className="mt-2 h-2"
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Annotator Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {detailDataset
                        ? getDatasetAnnotators(detailDataset).filter(
                            a => a.active,
                          ).length
                        : 0}
                      / {annotators.length}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Active annotators
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {detailDataset && getDetailDataset()?.datasetAssignedAt && (
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <UserPlus className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm">Annotators assigned</p>
                          <p className="text-xs text-muted-foreground">
                            Annotators were assigned to this dataset
                          </p>
                        </div>
                        <div className="ml-auto text-xs text-muted-foreground">
                          {new Date(
                            getDetailDataset().datasetAssignedAt,
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Database className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm">Dataset created</p>
                        <p className="text-xs text-muted-foreground">
                          Dataset was initially created
                        </p>
                      </div>
                      <div className="ml-auto text-xs text-muted-foreground">
                        {detailDataset && getDetailDataset()?.datasetCreatedAt
                          ? new Date(
                              getDetailDataset().datasetCreatedAt,
                            ).toLocaleDateString()
                          : 'Unknown date'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex justify-between gap-2 sm:justify-between">
            <div>
              <Button
                variant="destructive"
                size="sm"
                className="gap-1"
                onClick={() => {
                  if (
                    confirm(
                      `Are you sure you want to delete "${
                        getDetailDataset()?.datasetName
                      }"?`,
                    )
                  ) {
                    handleDeleteDataset(detailDataset);
                  }
                }}
                disabled={isDeleting}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={e =>
                  detailDataset && handleEditDataset(detailDataset, e)
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button onClick={() => handleDownloadDataset(detailDataset)}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Edit Dataset Dialog */}
      <Dialog
        open={selectedDataset !== null && editFormData}
        onOpenChange={open => {
          if (!open) {
            setSelectedDataset(null);
            setEditFormData(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Dataset</DialogTitle>
            <DialogDescription>Update dataset information.</DialogDescription>
          </DialogHeader>
          {editFormData && (
            <div className="py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Dataset Name</Label>
                  <Input
                    id="edit-name"
                    value={editFormData.name}
                    onChange={e =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editFormData.description}
                    onChange={e =>
                      setEditFormData({
                        ...editFormData,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-label">Label</Label>
                  <Select
                    value={editFormData.labelId.toString()}
                    onValueChange={value =>
                      setEditFormData({
                        ...editFormData,
                        labelId: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a label" />
                    </SelectTrigger>
                    <SelectContent>
                      {labelsData.map(label => (
                        <SelectItem key={label.id} value={label.id.toString()}>
                          {label.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          {editFormData && (
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedDataset(null)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEditedDataset} disabled={isEditing}>
                {isEditing ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
      {/* Assign Annotators Dialog */}
      <Dialog
        open={selectedDataset !== null && !editFormData}
        onOpenChange={open => !open && setSelectedDataset(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Annotators</DialogTitle>
            <DialogDescription>
              Select annotators to work on this dataset. Only active annotators
              can be assigned.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4">
              <Label className="text-sm font-medium">Dataset</Label>
              <div className="mt-1 rounded-md border p-3">
                <div className="font-medium">
                  {selectedDataset &&
                    datasets.find(d => d.datasetId === selectedDataset)
                      ?.datasetName}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedDataset &&
                    datasets.find(d => d.datasetId === selectedDataset)
                      ?.datasetLabel}
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" />
                Click on an annotator card or checkbox to select/deselect them
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Available Annotators
                </Label>
                <Badge
                  variant={
                    selectedAnnotators.length < 3 ? 'destructive' : 'outline'
                  }
                  className="text-xs"
                >
                  {selectedAnnotators.length} selected (minimum 3 required)
                </Badge>
              </div>
              <ScrollArea className="mt-1 h-[200px] rounded-md border p-2">
                <div className="space-y-2">
                  {annotators
                    .filter(annotator => annotator.active)
                    .map(annotator => (
                      <div
                        key={annotator.id}
                        className={`flex items-center space-x-3 rounded-md border p-2 hover:bg-muted cursor-pointer transition-colors ${
                          selectedAnnotators.includes(annotator.id)
                            ? 'bg-muted-foreground/10 border-primary'
                            : ''
                        }`}
                        onClick={() => handleAnnotatorSelection(annotator.id)}
                      >
                        <Checkbox
                          id={`annotator-${annotator.id}`}
                          checked={selectedAnnotators.includes(annotator.id)}
                          onCheckedChange={() =>
                            handleAnnotatorSelection(annotator.id)
                          }
                        />
                        <div className="flex flex-1 items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={`/placeholder.svg?height=32&width=32&text=${annotator.firstName.charAt(
                                0,
                              )}${annotator.lastName.charAt(0)}`}
                            />
                            <AvatarFallback>
                              {annotator.firstName.charAt(0)}
                              {annotator.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Label
                              htmlFor={`annotator-${annotator.id}`}
                              className="cursor-pointer font-medium"
                            >
                              {annotator.firstName} {annotator.lastName}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {annotator.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  {annotators.length === 0 ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      <RefreshCw className="mx-auto h-4 w-4 animate-spin mb-2" />
                      Loading annotators...
                    </div>
                  ) : annotators.filter(annotator => annotator.active)
                      .length === 0 ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      <div className="mb-2">No active annotators available</div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => refreshAnnotators()}
                        className="mx-auto"
                      >
                        <RefreshCw className="mr-2 h-3 w-3" />
                        Retry Loading Annotators
                      </Button>
                    </div>
                  ) : (
                    annotators.filter(annotator => annotator.active).length <
                      3 && (
                      <div className="mt-4 p-2 text-center text-xs text-amber-500 bg-amber-50 dark:bg-amber-950/20 rounded-md">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Info className="h-3 w-3" />
                          <span>Not enough active annotators</span>
                        </div>
                        You need at least 3 active annotators to assign to a
                        dataset
                      </div>
                    )
                  )}
                </div>
              </ScrollArea>
            </div>

            {selectedAnnotators.length > 0 && (
              <div className="mt-4">
                <Label className="text-sm font-medium">
                  Selected Annotators
                </Label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selectedAnnotators.map(annotatorId => (
                    <Badge
                      key={annotatorId}
                      variant="secondary"
                      className="gap-1"
                    >
                      {getAnnotatorName(annotatorId)}
                      <button
                        type="button"
                        className="ml-1 rounded-full text-muted-foreground hover:text-foreground"
                        onClick={() => handleAnnotatorSelection(annotatorId)}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedDataset(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveAnnotators}
              disabled={isAssigning || selectedAnnotators.length < 3}
              title={
                selectedAnnotators.length < 3
                  ? 'Select at least 3 annotators'
                  : ''
              }
            >
              {isAssigning ? 'Saving...' : 'Save Assignments'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Scan Annotators Dialog */}{' '}
      <Dialog
        open={showAnnotatorScan}
        onOpenChange={open => {
          setShowAnnotatorScan(open);
          if (!open) {
            // Reset scanning state when dialog closes
            setScanningDataset(null);
            setIsScanning(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              Annotator Status Scan
            </DialogTitle>
            <DialogDescription>
              {scanningDataset && (
                <>
                  Viewing annotator status for dataset:
                  <span className="font-medium">
                    {
                      datasets.find(d => d.datasetId === scanningDataset)
                        ?.datasetName
                    }
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {isScanning ? (
            <div className="py-8 text-center">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">
                Scanning annotator status...
              </p>
            </div>
          ) : (
            <div className="py-4">
              {scanningDataset &&
              getDatasetAnnotators(scanningDataset).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Annotator</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getDatasetAnnotators(scanningDataset).map(annotator => (
                      <TableRow key={annotator.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={`/placeholder.svg?height=32&width=32&text=${annotator.firstName.charAt(
                                  0,
                                )}${annotator.lastName.charAt(0)}`}
                              />
                              <AvatarFallback>
                                {annotator.firstName.charAt(0)}
                                {annotator.lastName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {annotator.firstName} {annotator.lastName}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={annotator.active ? 'default' : 'secondary'}
                          >
                            {annotator.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{annotator.email}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{annotator.role}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center">
                  <Users className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    No annotators assigned to this dataset
                  </p>

                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setShowAnnotatorScan(false);
                      if (scanningDataset)
                        handleAssignAnnotators(scanningDataset);
                    }}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign Annotators
                  </Button>
                </div>
              )}
            </div>
          )}{' '}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAnnotatorScan(false);
                setScanningDataset(null);
                setIsScanning(false);
              }}
            >
              Close
            </Button>
            {scanningDataset &&
              getDatasetAnnotators(scanningDataset).length > 0 && (
                <Button
                  onClick={() => {
                    // Store dataset ID temporarily before resetting dialog state
                    const datasetToManage = scanningDataset;
                    setShowAnnotatorScan(false);
                    setScanningDataset(null);
                    setIsScanning(false);

                    // Use the stored dataset ID
                    if (datasetToManage) {
                      handleAssignAnnotators(datasetToManage);
                    }
                  }}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Manage Annotators
                </Button>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
