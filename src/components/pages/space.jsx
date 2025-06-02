import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Target,
  Calendar,
  AlertTriangle,
  Users,
  Activity,
  Database,
  CheckCircle,
  Zap,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import API from '../../api';
import { useAuth } from '@/context/AuthContext';

// Greeting arrays for variety
const greetings = [
  'Welcome back',
  'Hello',
  'Good to see you',
  'Hey there',
  'Great to have you back',
  'Welcome',
  'Greetings',
];

// Time-based greeting function
const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

function StatCard({ title, value, description, icon }) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-l-cyan-500">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="bg-muted p-3 rounded-xl">
            <div className="text-muted-foreground">{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardCard({ title, icon, items = [] }) {
  // Function to format text based on card type
  const formatItemText = (item, cardTitle) => {
    if (cardTitle === 'Recent Annotations' && typeof item === 'string') {
      // Parse format like "alpha/bravo - not sim"
      const parts = item.split(' - ');
      if (parts.length === 2) {
        const [textPair, annotation] = parts;
        return {
          textPair: textPair.trim(),
          annotation: annotation.trim(),
          isAnnotation: true,
        };
      }
    }
    if (cardTitle === 'Team Activity' && typeof item === 'string') {
      // Parse format like "ggg (3 annotateurs)"
      const match = item.match(/^(.+?)\s*\((\d+)\s*annotateurs?\)$/i);
      if (match) {
        const [, groupName, count] = match;
        return {
          groupName: groupName.trim(),
          annotatorCount: parseInt(count),
          isTeamActivity: true,
        };
      }
    }

    return {
      text: item,
      isAnnotation: false,
      isTeamActivity: false,
    };
  };
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-l-cyan-500">
      {' '}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="bg-muted p-2 rounded-lg">
          <div className="h-4 w-4 text-muted-foreground">{icon}</div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {items.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No items to display</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.slice(0, 3).map((item, i) => {
              const formattedItem = formatItemText(item, title);
              return (
                <div
                  key={i}
                  className="flex items-start space-x-2 p-2.5 rounded-lg border  bg-muted/30 hover:bg-muted/40 border-muted/20 hover:border-muted/30 transition-all duration-200 cursor-pointer"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground flex-shrink-0 mt-3"></div>
                  {formattedItem.isAnnotation ? (
                    <div className="flex min-w-0">
                      {formattedItem.textPair.includes('/') ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground shrink-0">
                              Texts:
                            </span>
                            <div className="flex gap-1 min-w-0">
                              <Badge
                                variant="secondary"
                                className="text-xs truncate pt-0"
                              >
                                {formattedItem.textPair.split('/')[0].trim()}
                              </Badge>
                              <span className="text-muted-foreground text-lg mt-0.5">•</span>
                              <Badge
                                variant="secondary"
                                className="text-xs truncate"
                              >
                                {formattedItem.textPair.split('/')[1].trim()}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground shrink-0">
                              Label:
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {formattedItem.annotation}
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="text-sm font-medium text-foreground block truncate">
                            {formattedItem.textPair}
                          </span>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">
                              Label:
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {formattedItem.annotation}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : formattedItem.isTeamActivity ? (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <Users className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm font-medium text-foreground truncate">
                            {formattedItem.groupName}
                          </span>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-xs flex-shrink-0"
                        >
                          {formattedItem.annotatorCount} annotator
                          {formattedItem.annotatorCount !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-foreground flex-1 truncate">
                      {formattedItem.text}
                    </span>
                  )}
                </div>
              );
            })}
            {items.length > 3 && (
              <div className="text-xs text-muted-foreground text-center pt-2">
                +{items.length - 3} more items
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Space() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    firstName: '',
    lastName: '',
    tasksCompleted: 0,
    totalTasks: 0,
    daysSinceCreation: 0,
    dailyStreak: 0,
    todayGoal: '',
    spammer: false,
    recentAnnotations: [],
    activeProjects: [],
    teamActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const getGreeting = () => {
    const randomGreeting =
      greetings[Math.floor(Math.random() * greetings.length)];
    const timeGreeting = getTimeBasedGreeting();
    return { timeGreeting, randomGreeting };
  };

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        setLoading(true);
        const annotatorId = localStorage.getItem('annotatorId') || user?.id;
        if (!annotatorId) throw new Error('No annotator ID found');

        const response = await API.get(
          `/api/dashboard/annotator-stats/${annotatorId}`,
        );

        if (!isMounted) return;

        if (response.data?.status === 'success') {
          setStats(response.data.data);
        } else {
          throw new Error(response.data?.message || 'Failed to fetch stats');
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          console.error('Dashboard error:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (user) {
      fetchStats();
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to access your personalized dashboard
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="space-y-6 p-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 bg-muted/20 rounded w-1/3"></div>
          <div className="h-4 bg-muted/20 rounded w-1/2"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-muted/20 rounded-lg"></div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-muted/20 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const { timeGreeting, randomGreeting } = getGreeting();

  return (
    <div className="space-y-6 p-6">
      {/* Professional Greeting Section */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">
          {timeGreeting},{' '}
          <span className="capitalize">{stats.firstName || 'Annotator'}!</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          {randomGreeting}. Here's your personal annotation dashboard overview.
        </p>
      </div>{' '}
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {/* Spammer Alert */}
      {stats.spammer && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your account has been flagged for review. Please contact support if
            you believe this is an error.
          </AlertDescription>
        </Alert>
      )}{' '}
      {/* Stats Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tasks Completed"
          value={`${stats.tasksCompleted}/${stats.totalTasks}`}
          description={`${Math.round(
            (stats.tasksCompleted / Math.max(stats.totalTasks, 1)) * 100,
          )}% completion rate`}
          icon={<CheckCircle className="h-6 w-6" />}
        />
        <StatCard
          title="Days Active"
          value={stats.daysSinceCreation}
          description={
            stats.daysSinceCreation < 7 ? 'New annotator' : 'Experienced member'
          }
          icon={<Calendar className="h-6 w-6" />}
        />
        <StatCard
          title="Daily Streak"
          value={`${stats.dailyStreak} days`}
          description={
            stats.dailyStreak > 7
              ? '🔥 On fire!'
              : stats.dailyStreak > 3
              ? 'Great momentum!'
              : 'Keep going!'
          }
          icon={<Zap className="h-6 w-6" />}
        />
        <StatCard
          title="Today's Goal"
          value={stats.todayGoal || 'No goal set'}
          description="Daily target"
          icon={<Target className="h-6 w-6" />}
        />
      </div>{' '}
      {/* Dashboard Cards Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard
          title="Recent Annotations"
          icon={<Activity className="h-4 w-4" />}
          items={stats.recentAnnotations || []}
        />
        <DashboardCard
          title="Active Projects"
          icon={<Database className="h-4 w-4" />}
          items={stats.activeProjects || []}
        />
        <DashboardCard
          title="Team Activity"
          icon={<Users className="h-4 w-4" />}
          items={stats.teamActivity || []}
        />
      </div>
    </div>
  );
}
