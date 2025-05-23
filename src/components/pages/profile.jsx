import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Building, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import API from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function ProfileUpdateForm() {
  const { user } = useAuth();

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    jobTitle: '',
    department: '',
    location: '',
    bio: '',
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    const fetchUserData = async () => {
      //       console.log(user);
      try {
        const response = await API.get(`/api/persons/${user.id}`);
        const userData = response.data.data;
        console.log(userData);
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          username: userData.username || '',
          email: userData.email || '',
          phone: userData.phone || '',
          jobTitle: userData.jobTitle || '',
          department: userData.department || '',
          location: userData.location || '',

          bio: userData.bio || '',
        });
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };
    fetchUserData();
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await API.put(`/api/persons/${user.id}`, formData);
    } catch (error) {
      console.error('Profile update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details and contact information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-3">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src="/placeholder.svg?height=96&width=96"
                  alt="Profile"
                />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" className="gap-1">
                <Camera className="h-4 w-4" />
                Change Photo
              </Button>
            </div>

            <div className="grid gap-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      name="firstName"
                      className="pl-9"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
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
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    className="pl-9"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Work Information</CardTitle>
            <CardDescription>
              Update your work details and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="jobTitle"
                  name="jobTitle"
                  className="pl-9"
                  value={formData.jobTitle}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.department}
                onValueChange={value => handleSelectChange('department', value)}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Research">Research</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Data Science">Data Science</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  name="location"
                  className="pl-9"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                rows={10}
                placeholder="Tell us about yourself"
                value={formData.bio}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Button variant="outline" onClick={handleCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
