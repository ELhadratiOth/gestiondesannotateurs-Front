import { useState, useEffect } from 'react';
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
import { Search, Plus, Filter, Trash2, Mail, User } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import API from '../api';

export default function AnnotatorsTable() {
  const [annotators, setAnnotators] = useState([]);
  const [loading, setLoading] = useState(false);
  //   const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState(null);
  const [annotatorToDelete, setAnnotatorToDelete] = useState(null);
  const [newAnnotator, setNewAnnotator] = useState({
    firstName: '',
    lastName: '',
    email: '',
    isActive: true,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Fetch annotators from API
  useEffect(() => {
    const fetchAnnotators = async () => {
      setLoading(true);
      try {
        const response = await API.get('/api/annotators', {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 200) {
          // Use the data from the API response
          setAnnotators(response.data.data || []);
        } else {
          throw new Error('Failed to fetch annotators');
        }
      } catch (error) {
        console.error('Error fetching annotators:', error);
        // Show error notification if you have a notification system
        // showNotification({ type: 'error', message: 'Failed to fetch annotators' })
      } finally {
        setLoading(false);
      }
    };

    fetchAnnotators();
  }, []);
  // Toggle active status
  const toggleActiveStatus = async id => {
    try {
      // Find the annotator to toggle
      const annotator = annotators.find(a => a.id === id);
      if (!annotator) return;

      // Send update request to API
      const response = await API.patch(
        `/api/annotators/${id}/status`,
        {
          active: !annotator.active,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 200) {
        // Update local state
        setAnnotators(
          annotators.map(a => (a.id === id ? { ...a, active: !a.active } : a)),
        );
      } else {
        throw new Error('Failed to update annotator status');
      }
    } catch (error) {
      console.error('Error toggling annotator status:', error);
      // showNotification({ type: 'error', message: 'Failed to update annotator status' })
    }
  };
  // Handle annotator deletion
  const handleDeleteAnnotator = async () => {
    if (!annotatorToDelete) return;

    try {
      const response = await API.delete(
        `/api/annotators/${annotatorToDelete}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 200 || response.status === 204) {
        // Update local state
        setAnnotators(
          annotators.filter(annotator => annotator.id !== annotatorToDelete),
        );
        // showNotification({ type: 'success', message: 'Annotator deleted successfully' })
      } else {
        throw new Error('Failed to delete annotator');
      }
    } catch (error) {
      console.error('Error deleting annotator:', error);
      // showNotification({ type: 'error', message: 'Failed to delete annotator' })
    } finally {
      setAnnotatorToDelete(null);
    }
  };

  // Handle form input changes
  const handleInputChange = e => {
    const { name, value } = e.target;
    setNewAnnotator(prev => ({ ...prev, [name]: value }));
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle switch change
  const handleSwitchChange = checked => {
    setNewAnnotator(prev => ({ ...prev, isActive: checked }));
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!newAnnotator.firstName.trim())
      errors.firstName = 'First name is required';
    if (!newAnnotator.lastName.trim())
      errors.lastName = 'Last name is required';

    if (!newAnnotator.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newAnnotator.email)) {
      errors.email = 'Email is invalid';
    } else if (
      annotators.some(annotator => annotator.email === newAnnotator.email)
    ) {
      errors.email = 'Email already exists';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsCreating(true);

    try {
      const payload = {
        firstName: newAnnotator.firstName,
        lastName: newAnnotator.lastName,
        email: newAnnotator.email,
        active: newAnnotator.isActive,
      };

      // Make POST request to API
      console.log('Payload:', payload);
      const response = await API.post('/api/annotators', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201 || response.status === 200) {
        // Add the newly created annotator to state
        const createdAnnotator = response.data.data;

        setAnnotators(prev => [...prev, createdAnnotator]);

        // Show success notification if you have a notification system
        // showNotification({ type: 'success', message: 'Annotator created successfully' })
      } else {
        throw new Error('Failed to create annotator');
      }

      // Reset form
      setNewAnnotator({
        firstName: '',
        lastName: '',
        email: '',
        isActive: true,
      });

      setIsCreating(false); // Close dialog
      document.getElementById('close-create-annotator-dialog')?.click();
    } catch (error) {
      console.error('Error creating annotator:', error);
      // Show error notification if you have a notification system
      // showNotification({ type: 'error', message: error.response?.data?.message || 'Failed to create annotator' })
      setIsCreating(false);
    }
  };
  // Filter annotators based on search term and active filter
  const filteredAnnotators = annotators.filter(annotator => {
    const matchesSearch =
      searchTerm === '' ||
      annotator.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      annotator.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      annotator.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      annotator.id?.toString().toLowerCase().includes(searchTerm.toLowerCase());

    const matchesActiveFilter =
      filterActive === null || annotator.active === filterActive;

    return matchesSearch && matchesActiveFilter;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search annotators..."
            className="pl-8"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilterActive(null)}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterActive(true)}>
                Active Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterActive(false)}>
                Inactive Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                <span>Add Annotator</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Annotator</DialogTitle>
                <DialogDescription>
                  Create a new annotator account. Annotators can work on
                  assigned annotation tasks.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="firstName"
                          name="firstName"
                          className="pl-9"
                          value={newAnnotator.firstName}
                          onChange={handleInputChange}
                        />
                      </div>
                      {formErrors.firstName && (
                        <p className="text-xs text-destructive">
                          {formErrors.firstName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={newAnnotator.lastName}
                        onChange={handleInputChange}
                      />
                      {formErrors.lastName && (
                        <p className="text-xs text-destructive">
                          {formErrors.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        className="pl-9"
                        value={newAnnotator.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    {formErrors.email && (
                      <p className="text-xs text-destructive">
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active-status"
                      checked={newAnnotator.isActive}
                      onCheckedChange={handleSwitchChange}
                    />
                    <Label htmlFor="active-status">Active Account</Label>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose id="close-create-annotator-dialog" asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? 'Creating...' : 'Create Annotator'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Name</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Loading annotators...
                </TableCell>
              </TableRow>
            ) : filteredAnnotators.length > 0 ? (
              filteredAnnotators.map(annotator => (
                <TableRow key={annotator.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`/placeholder.svg?height=32&width=32&text=${
                            annotator.firstName
                              ? annotator.firstName.charAt(0)
                              : ''
                          }${
                            annotator.lastName
                              ? annotator.lastName.charAt(0)
                              : ''
                          }`}
                        />
                        <AvatarFallback>
                          {annotator.firstName
                            ? annotator.firstName.charAt(0)
                            : ''}
                          {annotator.lastName
                            ? annotator.lastName.charAt(0)
                            : ''}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {annotator.firstName} {annotator.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID: {annotator.id}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden max-w-[200px] truncate md:table-cell">
                    {annotator.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={annotator.active ? 'default' : 'secondary'}>
                      {annotator.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Switch
                        checked={annotator.active}
                        onCheckedChange={() => toggleActiveStatus(annotator.id)}
                        aria-label={`Toggle active status for ${annotator.firstName} ${annotator.lastName}`}
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setAnnotatorToDelete(annotator.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the annotator account and
                              remove their data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={() => setAnnotatorToDelete(null)}
                            >
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteAnnotator}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No annotators found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

    </div>
  );
}
