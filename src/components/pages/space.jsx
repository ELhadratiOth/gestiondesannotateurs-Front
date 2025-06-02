import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Check,
  Target,
  Calendar,
  ClipboardList,
  AlertTriangle,
  ListTodo,
  Users,
  Activity,
  TrendingUp,
  BarChart3,
  Database,
  Clock,
  ArrowRight
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import API from '../../api';
import { useAuth } from '@/context/AuthContext';

function StatCard({ title, value, description, icon, color = "blue", bgColor = "bg-blue-500" }) {
  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6 text-center">
        <div className={`${bgColor} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4`}>
          {icon}
        </div>
        <div className={`text-3xl font-bold text-${color}-600 dark:text-${color}-400 mb-2`}>
          {value}
        </div>
        <p className="text-sm text-muted-foreground">
          {title}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardCard({ title, icon, items = [] }) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">No items to display</p>
        ) : (
          <div className="space-y-2">
            {items.map((item, i) => (
              <div
                key={i}
                className="flex items-center space-x-2 p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
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
    return "Welcome back,";
  };

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        setLoading(true);
        const annotatorId = localStorage.getItem('annotatorId') || user?.id;
        if (!annotatorId) throw new Error('No annotator ID found');
        
        const response = await API.get('/api/dashboard/annotator-stats', {
          headers: { 'X-Annotator-ID': annotatorId }
        });

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
      <div className="space-y-6 p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">
          {getGreeting()} <span className="text-primary">{stats.firstName}</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Here's your personal dashboard overview
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {stats.isSpammer && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your account has been flagged for suspicious activity. Please review guidelines.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-4">
        <StatCard
          title="Tasks Completed"
          value={`${stats.tasksCompleted}/${stats.totalTasks}`}
          icon={<Check className="h-6 w-6 text-white" />}
          color="blue"
          bgColor="bg-blue-500"
        />
        <StatCard
          title="Days Active"
          value={stats.daysSinceCreation}
          description={stats.daysSinceCreation < 5 ? 'New annotator' : 'Experienced'}
          icon={<Target className="h-6 w-6 text-white" />}
          color="green"
          bgColor="bg-green-500"
        />
        <StatCard
          title="Daily Streak"
          value={`${stats.dailyStreak}`}
          description={stats.dailyStreak > 3 ? '🔥 On fire!' : 'Keep going!'}
          icon={<Calendar className="h-6 w-6 text-white" />}
          color="purple"
          bgColor="bg-purple-500"
        />
        <StatCard
          title="Today's Goal"
          value={stats.todayGoal}
          description="Tasks remaining"
          icon={<ClipboardList className="h-6 w-6 text-white" />}
          color="orange"
          bgColor="bg-orange-500"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <DashboardCard
          title="Recent Annotations"
          icon={<ListTodo className="h-5 w-5" />}
          items={stats.recentAnnotations}
        />
        <DashboardCard
          title="Active Projects"
          icon={<Database className="h-5 w-5" />}
          items={stats.activeProjects}
        />
        <DashboardCard
          title="Team Activity"
          icon={<Users className="h-5 w-5" />}
          items={stats.teamActivity}
        />
      </div>
    </div>
  );
}