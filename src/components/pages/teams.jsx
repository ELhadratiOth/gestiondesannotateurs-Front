import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  RefreshCw,
  Search,
  Eye,
  ChevronRight,
  Database,
  FileText,
  Mail,
  User,
} from 'lucide-react';
import API from '../../api';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showTeamDetails, setShowTeamDetails] = useState(false);

  // Fetch teams data from API (single call)
  const fetchTeams = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await API.get('/api/teams');
      const result = response.data;

      if (result.status === 'success' && Array.isArray(result.data)) {
        const teamsData = result.data.map((team, index) => ({
          teamId: index + 1,
          teamName: team.datasetName || 'Unnamed Team',
          datasetName: team.datasetName,
          datasetDescription:
            team.datasetDescription || 'No description available',
          datasetLabel: team.labelName || 'No Label',
          progress: team.datasetAdvancement || 0,
          createdAt: team.datasetCreatedAt,
          members: Array.isArray(team.annotators)
            ? team.annotators.map((annotator, memberIndex) => ({
                id: memberIndex + 1,
                firstName: annotator.firstName || '',
                lastName: annotator.lastName || '',
                userName: annotator.userName || '',
                email: annotator.email || '',
                role: 'ANNOTATOR',
              }))
            : [],
        }));
        setTeams(teamsData);
      } else {
        setTeams([]);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      setTeams([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Filter teams based on search term
  const filteredTeams = teams.filter(team => {
    if (!team) return false;
    const name = (team.teamName || '').toLowerCase();
    const description = (team.datasetDescription || '').toLowerCase();
    const label = (team.datasetLabel || '').toLowerCase();
    const term = searchTerm.toLowerCase();

    return (
      name.includes(term) ||
      description.includes(term) ||
      label.includes(term) ||
      team.members.some(
        member =>
          `${member.firstName} ${member.lastName}`
            .toLowerCase()
            .includes(term) || member.email.toLowerCase().includes(term),
      )
    );
  });

  const handleTeamDetails = team => {
    setSelectedTeam(team);
    setShowTeamDetails(true);
  };
  const handleContactMember = (email, name) => {
    const subject = encodeURIComponent(
      `Team Communication - Dataset: ${selectedTeam?.datasetName || 'Unknown'}`,
    );
    const body = encodeURIComponent(
      `Hello ${name},\n\nI hope this email finds you well. I wanted to reach out regarding the annotation work on the "${
        selectedTeam?.datasetName || 'Unknown'
      }" dataset.\n\nBest regards`,
    );

    // Create mailto URL
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

    // Method 1: Try direct window.location.href (most reliable for opening default email client)
    try {
      window.location.href = mailtoUrl;
      return;
    } catch {
      // Continue to next method
    }

    // Method 2: Try creating and clicking a temporary link
    try {
      const link = document.createElement('a');
      link.href = mailtoUrl;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    } catch {
      // Continue to next method
    }

    // Method 3: Try Gmail web interface in new tab
    try {
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&subject=${subject}&body=${body}`;
      window.open(gmailUrl, '_blank');
      return;
    } catch {
      // Continue to fallback
    }

    // Fallback: Copy email to clipboard and show alert
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(email)
        .then(() => {
          alert(
            `Email client could not be opened automatically.\nEmail address "${email}" has been copied to your clipboard.\nPlease paste it into your email application.`,
          );
        })
        .catch(() => {
          alert(`Please contact ${name} at: ${email}`);
        });
    } else {
      alert(`Please contact ${name} at: ${email}`);
    }
  };

  const getTeamStatusColor = progress => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-gray-500';
  };
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Teams</h1>
            <p className="text-muted-foreground">
              View teams organized by dataset assignments.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading teams...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teams</h1>
          <p className="text-muted-foreground">
            View teams organized by dataset assignments and track their
            progress.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search teams..."
            className="pl-8"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={fetchTeams}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Teams Grid */}
      {filteredTeams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No teams found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm
                ? 'No teams match your search criteria. Try adjusting your search terms.'
                : 'No teams have been created yet. Teams are formed when annotators are assigned to datasets.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map(team => (
            <Card
              key={team.teamId}
              className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-background to-background/50"
            >
              <CardHeader className="pb-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold text-foreground group-hover:text-foreground transition-colors">
                      {team.teamName}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="secondary"
                        className="text-xs font-medium"
                      >
                        <Database className="h-3 w-3 mr-1" />
                        Dataset Team
                      </Badge>
                      <div
                        className={`w-2 h-2 rounded-full ${getTeamStatusColor(
                          team.progress,
                        )} animate-pulse`}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {team.members.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Members</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">

                {/* Progress Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Progress
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {team.progress}%
                    </span>
                  </div>
                  <div className="relative">
                    <Progress value={team.progress} className="h-3" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse rounded-full" />
                  </div>
                </div>

                {/* Team Members Showcase */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Team Members
                    </span>
                    <Badge variant="outline" className="text-xs text-white">
                      {team.members.length} Members
                    </Badge>
                  </div>

                  {/* Member Avatars */}
                  <div className="space-y-2">
                    <div className="flex -space-x-3">
                      {team.members.slice(0, 3).map(member => (
                        <Avatar
                          key={member.id}
                          className="h-10 w-10 border-3 border-background ring-2 ring-gray-100 dark:ring-gray-900 transition-transform hover:scale-110 hover:z-10"
                          title={`${member.firstName} ${member.lastName}`}
                        >
                          <AvatarImage
                            src={`/placeholder.svg?height=40&width=40&text=${member.firstName.charAt(
                              0,
                            )}${member.lastName.charAt(0)}`}
                          />
                          <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-gray-500 to-slate-600 text-white">
                            {member.firstName.charAt(0)}
                            {member.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {team.members.length > 3 && (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border-3 border-background bg-gradient-to-br from-gray-500 to-gray-600 text-white text-sm font-bold ring-2 ring-gray-100 dark:ring-gray-900">
                          +{team.members.length - 3}
                        </div>
                      )}
                    </div>

                    {/* First member name as example */}
                    {team.members.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Lead: {team.members[0].firstName}{' '}
                        {team.members[0].lastName}
                        {team.members.length > 1 &&
                          ` and ${team.members.length - 1} others`}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full group-hover:bg-gray-50 group-hover:border-gray-300 dark:group-hover:bg-gray-950/50 transition-colors"
                    onClick={() => handleTeamDetails(team)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Team Details
                    <ChevronRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Team Details Dialog */}
      <Dialog open={showTeamDetails} onOpenChange={setShowTeamDetails}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Details: {selectedTeam?.teamName}
            </DialogTitle>
            <DialogDescription>
              Detailed information about team members and their progress
            </DialogDescription>
          </DialogHeader>

          {selectedTeam && (
            <div className="space-y-6">
              {' '}
              {/* Team Overview - Compact */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Progress
                  </div>
                  <div className="text-lg font-bold mb-2">
                    {selectedTeam.progress}%
                  </div>
                  <Progress value={selectedTeam.progress} className="h-1.5" />
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Team Size
                  </div>
                  <div className="text-lg font-bold">
                    {selectedTeam.members.length}
                  </div>
                  <div className="text-xs text-muted-foreground">members</div>
                </div>
              </div>{' '}
              {/* Dataset Information */}
              <div>
                <h4 className="font-medium mb-2">Dataset Information</h4>
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/50 dark:to-slate-950/50 rounded-lg p-4 border border-gray-200 dark:border-gray-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedTeam.datasetName}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Label Type:</span>
                      <Badge variant="outline" className="text-xs">
                        {selectedTeam.datasetLabel}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Created Date:
                      </span>
                      <span className="font-medium">
                        {selectedTeam.createdAt
                          ? new Date(selectedTeam.createdAt).toLocaleDateString(
                              'en-US',
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              },
                            )
                          : 'N/A'}
                      </span>
                    </div>

                    {selectedTeam.datasetDescription &&
                      selectedTeam.datasetDescription !==
                        'No description available' && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <span className="text-muted-foreground text-xs block mb-1">
                            Description:
                          </span>
                          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                            {selectedTeam.datasetDescription}
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              </div>
              {/* Team Members Table */}
              <div>
                <h4 className="font-medium mb-2">Team Members</h4>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTeam.members.map(member => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={`/placeholder.svg?height=40&width=40&text=${member.firstName.charAt(
                                    0,
                                  )}${member.lastName.charAt(0)}`}
                                />
                                <AvatarFallback className="bg-gradient-to-br from-gray-500 to-slate-600 text-white">
                                  {member.firstName.charAt(0)}
                                  {member.lastName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {member.firstName} {member.lastName}
                                </p>
                                {member.userName && (
                                  <p className="text-xs text-muted-foreground">
                                    @{member.userName}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  ID: {member.id}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              {member.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{member.role}</Badge>
                          </TableCell>{' '}
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              onClick={() =>
                                handleContactMember(
                                  member.email,
                                  `${member.firstName} ${member.lastName}`,
                                )
                              }
                              title={`Send email to ${member.firstName} ${member.lastName} (${member.email})`}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Teams;
