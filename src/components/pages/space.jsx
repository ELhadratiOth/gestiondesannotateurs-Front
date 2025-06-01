import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Check,
  Target,
  Calendar,
  ClipboardList,
  AlertTriangle,
  ListTodo,
  Users,
  Activity
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import API from '../../api';
import { useAuth } from '@/context/AuthContext';

function StatCard({ title, value, description, icon, progress }) {
  return (
    <Card className="bg-gradient-to-br from-background to-muted shadow-xl rounded-2xl backdrop-blur-sm border border-border transition-all hover:scale-[1.01]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-semibold text-foreground/90">{title}</CardTitle>
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-extrabold text-primary">{value}</div>
        {progress !== undefined && (
          <Progress value={progress} className="mt-3 h-2 bg-muted-foreground/10" />
        )}
        {description && (
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardCard({ title, icon, items = [] }) {
  return (
    <Card className="bg-background/80 backdrop-blur-md border shadow-lg rounded-xl hover:ring-2 ring-ring transition-all">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
        <div className="h-9 w-9 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-md">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">No items to display</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm text-foreground/90">
            {items.map((item, i) => (
              <li key={i} className="rounded-lg px-3 py-1 bg-muted/30 hover:bg-muted transition">{item}</li>
            ))}
          </ul>
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
    accuracyRate: 0,
    dailyStreak: 0,
    todayGoal: 0,
    isSpammer: false,
    recentAnnotations: [],
    activeProjects: [],
    teamActivity: [],
    daysSinceCreation: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const annotatorId = localStorage.getItem('annotatorId') || user?.id;
        if (!annotatorId) throw new Error('No annotator ID found');
        const response = await API.get('/api/dashboard/annotator-stats', {
          headers: { 'X-Annotator-ID': annotatorId }
        });

        if (response.data?.status === 'success') {
          const data = response.data.data;
          setStats({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            tasksCompleted: data.tasksCompleted || 0,
            totalTasks: data.totalTasks || 0,
            accuracyRate: data.accuracyRate || 0,
            dailyStreak: data.dailyStreak || 0,
            todayGoal: data.todayGoal || 0,
            isSpammer: data.spammer || false,
            recentAnnotations: data.recentAnnotations || [],
            activeProjects: data.activeProjects || [],
            teamActivity: data.teamActivity || [],
            daysSinceCreation: data.daysSinceCreation || 0
          });

                            console.log('Fetched stats:', data);

        } else {
          throw new Error(response.data?.message || 'Failed to fetch stats');
        }
      } catch (error) {
        setError(error.message);
      } finally {

        setLoading(false);
      }
    };

    if (user) fetchStats();
  }, [user]);

  if (!user) return <div className="p-6 text-center text-lg text-muted-foreground">Please log in to view the dashboard</div>;
  if (loading) return <div className="p-6 text-center text-xl animate-pulse text-muted-foreground">Loading dashboard...</div>;

  return (
    <div className="p-8 space-y-8 bg-gradient-to-b from-background via-muted to-background min-h-screen">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1">
        <h2 className="text-4xl font-extrabold tracking-tight text-foreground">
          {getGreeting()}, <span className="capitalize">{stats.firstName} {stats.lastName}!</span>
        </h2>
        <p className="text-lg text-muted-foreground">Welcome back! Ready to make an impact today?</p>
      </div>

      {stats.isSpammer && (
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertDescription>
            Your account has been flagged for suspicious activity. Please review annotation guidelines.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tasks Completed"
          value={`${stats.tasksCompleted}/${stats.totalTasks}`}
          icon={<Check className="h-5 w-5" />}
          progress={stats.totalTasks > 0 ? Math.round((stats.tasksCompleted / stats.totalTasks) * 100) : 0}
        />
        <StatCard
          title="Days Registered"
          value={`${stats.daysSinceCreation}`}
          description={
            stats.daysSinceCreation < 5
              ? 'New annotator, keep learning!'
              : 'Experienced annotator, great job!'
          }
          icon={<Target className="h-5 w-5" />}
        />
        <StatCard
          title="Daily Streak"
          value={`${stats.dailyStreak} days`}
          description={stats.dailyStreak > 3 ? '🔥 Keep it going!' : 'Let’s start a streak!'}
          icon={<Calendar className="h-5 w-5" />}
        />
        <StatCard
          title="Today’s Goal"
          value={`${stats.todayGoal}`}
          description="Tasks remaining for today"
          icon={<ClipboardList className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <DashboardCard title="Recent Annotations" icon={<ListTodo className="h-5 w-5" />} items={stats.recentAnnotations} />
        <DashboardCard title="Active Projects" icon={<Users className="h-5 w-5" />} items={stats.activeProjects} />
        <DashboardCard title="Team Activity" icon={<Activity className="h-5 w-5" />} items={stats.teamActivity} />
      </div>
    </div>
  );
}
