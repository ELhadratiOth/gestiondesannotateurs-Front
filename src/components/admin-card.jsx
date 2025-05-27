import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Users,
  Database,
  CheckCircle,
  Clock,
  Activity,
  UserCheck,
} from 'lucide-react';
import API from '../api';

const greetings = [
  "Welcome back",
  "Hello",
  "Good to see you",
  "Hey there",
  "Great to have you back",
  "Welcome",
  "Greetings"
];

// Add time-based greeting function
const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};
const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
const timeGreeting = getTimeBasedGreeting();

export default function AdminCard() {
  
  const [stats, setStats] = useState({
    nbrOfAnnotators: 0,
    activeAnnotators: 0,
    totalUsers: 0,
    totalTasks: 0,
    assignedDatasets: 0,
    pendingDatasets: 0,
    nbrOfDatasets: 0,
    finishedDatasets: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState('');

  // Fetch admin name on component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('User from localStorage:', user); // Log the entire user object
      console.log('User firstName:', user.username); // Log the username specifically
    setAdminName(user.username || ''); // Use username or fallback to empty string
  }, []);


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await API.get('/api/stats');
        if (response.status === 200) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Annotators',
      value: stats.nbrOfAnnotators,
      description: `${stats.activeAnnotators} currently active`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Datasets',
      value: stats.nbrOfDatasets,
      description: `${stats.assignedDatasets} assigned`,
      icon: Database,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Completed Datasets',
      value: stats.finishedDatasets,
      description: 'Annotation completed',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Pending Datasets',
      value: stats.pendingDatasets,
      description: 'Not yet assigned',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      description: 'All accounts',
      icon: UserCheck,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      description: 'Annotation tasks',
      icon: Activity,
      color: 'text-rose-600',
      bgColor: 'bg-rose-100',
    },
  ];
  if (loading) {
    return <div>Loading statistics...</div>;
  }

    // Get random greeting when rendering
  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
  const timeGreeting = getTimeBasedGreeting();


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {timeGreeting}, {adminName || 'Admin'}!
        </h2>
        <p className="text-muted-foreground">
          {randomGreeting}. Here's an overview of your annotation platform.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`${card.bgColor} p-2 rounded-full`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

}