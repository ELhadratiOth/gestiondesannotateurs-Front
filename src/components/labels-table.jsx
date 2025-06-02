import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Trash2, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import API from '../api';

export default function LabelsTable() {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newLabel, setNewLabel] = useState({
    name: '',
    classes: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fetchLabels = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get('/api/labels', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setLabels(response.data.data || []);
      } else {
        throw new Error('Failed to fetch labels');
      }
    } catch (error) {
      console.error('Error fetching labels:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

  // Delete label
  const deleteLabel = async id => {
    try {
      const response = await API.delete(`/api/labels/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setLabels(prevLabels => prevLabels.filter(label => label.id !== id));
      } else {
        throw new Error('Failed to delete label');
      }
    } catch (error) {
      console.error('Error deleting label:', error);
    }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setNewLabel(prev => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      const newErrors = { ...formErrors };
      delete newErrors[name];
      setFormErrors(newErrors);
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!newLabel.name.trim()) errors.name = 'Label name is required';
    if (!newLabel.classes.trim()) errors.classes = 'Classes are required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createLabel = async () => {
    if (!validateForm()) return;

    setIsCreating(true);
    try {
      const response = await API.post(
        '/api/labels',
        {
          name: newLabel.name,
          classes: newLabel.classes,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 200 || response.status === 201) {
        setLabels(prevLabels => [...prevLabels, response.data.data]);
        setNewLabel({
          name: '',
          classes: '',
        });
        setFormErrors({});
        setIsDialogOpen(false);
      } else {
        throw new Error('Failed to create label');
      }
    } catch (error) {
      console.error('Error creating label:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredLabels = labels.filter(
    label =>
      label.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      label.classes?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-muted-foreground">Loading labels...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with search and create button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search labels..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Label
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Label</DialogTitle>
              <DialogDescription>
                Add a new label for dataset classification.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Label Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={newLabel.name}
                  onChange={handleInputChange}
                  placeholder="Enter label name"
                  className={formErrors.name ? 'border-red-500' : ''}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="classes">Classes</Label>{' '}
                <Textarea
                  id="classes"
                  name="classes"
                  value={newLabel.classes}
                  onChange={handleInputChange}
                  placeholder="Enter classes separated by semicolons (e.g., positive; negative; neutral)"
                  className={formErrors.classes ? 'border-red-500' : ''}
                  rows={3}
                />
                {formErrors.classes && (
                  <p className="text-sm text-red-500">{formErrors.classes}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={createLabel} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Label'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Classes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLabels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Tag className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? 'No labels found matching your search.'
                        : 'No labels available.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredLabels.map(label => (
                <TableRow key={label.id}>
                  <TableCell className="font-medium">{label.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{label.name}</Badge>
                    </div>
                  </TableCell>{' '}
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {label.classes ? (
                        label.classes.split(';').map((className, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {className.trim()}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          No classes
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Label</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the label "
                            {label.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteLabel(label.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredLabels.length} of {labels.length} labels
      </div>
    </div>
  );
}
