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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-muted/10 flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {progress !== undefined && (
          <Progress value={progress} className="mt-2" />
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardCard({ title, icon, items = [] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-muted/10 flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items to display</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li key={index} className="text-sm">{item}</li>
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
    teamActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (!user) {
    return <div className="p-6">Please log in to view the dashboard</div>;
  }

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
        
        if (!annotatorId) {
          throw new Error('No annotator ID found');
        }

        const response = await API.get('/api/dashboard/annotator-stats', {
          headers: {
            'X-Annotator-ID': annotatorId
          }
        });

        if (response.data?.status === 'success') {
          const data = response.data.data;
          if (data.firstName && data.lastName) {
            setStats({
              firstName: data.firstName,
              lastName: data.lastName,
              tasksCompleted: data.tasksCompleted || 0,
              totalTasks: data.totalTasks || 0,
              accuracyRate: data.accuracyRate || 0,
              dailyStreak: data.dailyStreak || 0,
              todayGoal: data.todayGoal || 0,
              isSpammer: data.spammer || false,
              recentAnnotations: data.recentAnnotations || [],
              activeProjects: data.activeProjects || [],
              teamActivity: data.teamActivity || []
            });
          } else {
            throw new Error('Invalid data format from server');
          }
        } else {
          throw new Error(response.data?.message || 'Failed to fetch stats');
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          {getGreeting()}, {stats.firstName} {stats.lastName}!
        </h2>
        <p className="text-muted-foreground">
          Welcome back! Ready to make an impact today?
        </p>
      </div>

      {stats.isSpammer && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your account has been flagged for suspicious annotation patterns. Please review our guidelines.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tasks Completed"
          value={`${stats.tasksCompleted}/${stats.totalTasks}`}
          icon={<Check />}
          progress={stats.totalTasks > 0 ? Math.round((stats.tasksCompleted / stats.totalTasks) * 100) : 0}
        />

        <StatCard
          title="Accuracy Rate"
          value={`${stats.accuracyRate}%`}
          description={stats.accuracyRate > 80 ? "Excellent work!" : stats.accuracyRate > 50 ? "Good job!" : "Keep practicing!"}
          icon={<Target />}
        />

        <StatCard
          title="Daily Streak"
          value={`${stats.dailyStreak} days`}
          description={stats.dailyStreak > 3 ? "Keep it going!" : "Start your streak!"}
          icon={<Calendar />}
        />

        <StatCard
          title="Today's Goal"
          value={`${stats.todayGoal}/5`}
          description="Tasks remaining today"
          icon={<ClipboardList />}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <DashboardCard
          title="Recent Annotations"
          icon={<ListTodo />}
          items={stats.recentAnnotations}
        />
        <DashboardCard
          title="Active Projects"
          icon={<Users />}
          items={stats.activeProjects}
        />
        <DashboardCard
          title="Team Activity"
          icon={<Activity />}
          items={stats.teamActivity}
        />
      </div>
    </div>
  );
}