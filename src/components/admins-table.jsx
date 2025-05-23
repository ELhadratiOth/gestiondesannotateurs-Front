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

export default function AdminsTable() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState(null);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [newAdmin, setNewAdmin] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      try {
        const response = await API.get('/api/admins', {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 200) {
          setAdmins(response.data.data || []);
        } else {
          throw new Error('Failed to fetch admins');
        }
      } catch (error) {
        console.error('Error fetching admins:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const toggleActiveStatus = async id => {
    try {
      // Find the admin to toggle
      const admin = admins.find(a => a.id === id);
      if (!admin) return;

      // Send update request to API
      const response = await API.patch(
        `/api/admins/${id}/status`,
        {
          active: !admin.active,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 200) {
        // Update local state
        setAdmins(
          admins.map(a => (a.id === id ? { ...a, active: !a.active } : a)),
        );
      } else {
        throw new Error('Failed to update admin status');
      }
    } catch (error) {
      console.error('Error toggling admin status:', error);
      // showNotification({ type: 'error', message: 'Failed to update admin status' })
    }
  };

  // Handle admin deletion
  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return;

    try {
      const response = await API.delete(`/api/admins/${adminToDelete}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200 || response.status === 204) {
        // Update local state
        setAdmins(admins.filter(admin => admin.id !== adminToDelete));
        // showNotification({ type: 'success', message: 'Admin deleted successfully' })
      } else {
        throw new Error('Failed to delete admin');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      // showNotification({ type: 'error', message: 'Failed to delete admin' })
    } finally {
      setAdminToDelete(null);
    }
  };

  // Handle form input changes
  const handleInputChange = e => {
    const { name, value } = e.target;
    setNewAdmin(prev => ({ ...prev, [name]: value }));
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
    setNewAdmin(prev => ({ ...prev, isActive: checked }));
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!newAdmin.firstName.trim()) errors.firstName = 'First name is required';
    if (!newAdmin.lastName.trim()) errors.lastName = 'Last name is required';

    if (!newAdmin.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newAdmin.email)) {
      errors.email = 'Email is invalid';
    } else if (admins.some(admin => admin.email === newAdmin.email)) {
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
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        email: newAdmin.email,
//         active: newAdmin.isActive,
      };

      // Make POST request to API
      console.log('Payload:', payload);
      const response = await API.post('/api/admins', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201 || response.status === 200) {
        // Add the newly created admin to state
        const createdAdmin = response.data.data;

        setAdmins(prev => [...prev, createdAdmin]);

        // Show success notification if you have a notification system
        // showNotification({ type: 'success', message: 'Admin created successfully' })
      } else {
        throw new Error('Failed to create admin');
      }

      // Reset form
      setNewAdmin({
        firstName: '',
        lastName: '',
        email: '',
        isActive: true,
      });

      setIsCreating(false); // Close dialog
      document.getElementById('close-create-admin-dialog')?.click();
    } catch (error) {
      console.error('Error creating admin:', error);
      // Show error notification if you have a notification system
      // showNotification({ type: 'error', message: error.response?.data?.message || 'Failed to create admin' })
      setIsCreating(false);
    }
  };

  // Filter admins based on search term and active filter
  const filteredAdmins = admins.filter(admin => {
    const matchesSearch =
      searchTerm === '' ||
      admin.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.id?.toString().toLowerCase().includes(searchTerm.toLowerCase());

    const matchesActiveFilter =
      filterActive === null || admin.active === filterActive;

    return matchesSearch && matchesActiveFilter;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search admins..."
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
                <span>Add Admin</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Admin</DialogTitle>
                <DialogDescription>
                  Create a new admin account. Admins have access to manage
                  system settings and users.
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
                          value={newAdmin.firstName}
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
                        value={newAdmin.lastName}
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
                        value={newAdmin.email}
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
                      checked={newAdmin.isActive}
                      onCheckedChange={handleSwitchChange}
                    />
                    <Label htmlFor="active-status">Active Account</Label>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose id="close-create-admin-dialog" asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? 'Creating...' : 'Create Admin'}
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
                  Loading admins...
                </TableCell>
              </TableRow>
            ) : filteredAdmins.length > 0 ? (
              filteredAdmins.map(admin => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`/placeholder.svg?height=32&width=32&text=${
                            admin.firstName ? admin.firstName.charAt(0) : ''
                          }${admin.lastName ? admin.lastName.charAt(0) : ''}`}
                        />
                        <AvatarFallback>
                          {admin.firstName ? admin.firstName.charAt(0) : ''}
                          {admin.lastName ? admin.lastName.charAt(0) : ''}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {admin.firstName} {admin.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID: {admin.id}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden max-w-[200px] truncate md:table-cell">
                    {admin.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={admin.active ? 'default' : 'secondary'}>
                      {admin.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Switch
                        checked={admin.active}
                        onCheckedChange={() => toggleActiveStatus(admin.id)}
                        aria-label={`Toggle active status for ${admin.firstName} ${admin.lastName}`}
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setAdminToDelete(admin.id)}
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
                              permanently delete the admin account and remove
                              their data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              onClick={() => setAdminToDelete(null)}
                            >
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteAdmin}
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
                  No admins found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
