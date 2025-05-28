import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, RefreshCw } from 'lucide-react';
import API from '../../api';
import TeamCard from '../teams/TeamCard';
import TeamSearchBar from '../teams/TeamSearchBar';
import TeamDetailsDialog from '../teams/TeamDetailsDialog';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showTeamDetails, setShowTeamDetails] = useState(false);

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
                active: true,
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

  const handleContactAnnotator = (email, name) => {
    const subject = encodeURIComponent(
      `Team Communication - Dataset: ${selectedTeam?.datasetName || 'Unknown'}`,
    );
    const body = encodeURIComponent(
      `Hello ${name},\n\nI hope this email finds you well. I wanted to reach out regarding the annotation work on the "${
        selectedTeam?.datasetName || 'Unknown'
      }" dataset.\n\nBest regards`,
    );
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_self');
  };

  const handleContactAllMembers = team => {
    const emails = team.members.map(member => member.email).join(',');
    const subject = encodeURIComponent(
      `Team Communication - Dataset: ${team.datasetName}`,
    );
    const body = encodeURIComponent(
      `Hello Team,\n\nI hope this email finds you all well. I wanted to reach out regarding the annotation work on the "${team.datasetName}" dataset.\n\nProgress Update: ${team.progress}%\nLabel Type: ${team.datasetLabel}\n\nPlease let me know if you have any questions or need assistance.\n\nBest regards`,
    );
    const mailtoUrl = `mailto:${emails}?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_self');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teams</h1>
          <p className="text-muted-foreground">
            View teams organized by dataset assignments and track their
            progress.
          </p>
        </div>
      </div>

      <TeamSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={fetchTeams}
        teamsCount={filteredTeams.length}
      />

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
            <TeamCard
              key={team.teamId}
              team={team}
              onViewDetails={handleTeamDetails}
              onContactTeam={handleContactAllMembers}
            />
          ))}
        </div>
      )}

      <TeamDetailsDialog
        isOpen={showTeamDetails}
        onClose={setShowTeamDetails}
        team={selectedTeam}
        onContactMember={handleContactAnnotator}
      />
    </div>
  );
};

export default Teams;
