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
  PieChart,
} from 'lucide-react';
import API from '../api';
import { PieChart as RechartsPieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

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
    console.log('User from localStorage:', user);
    console.log('User firstName:', user.username);
    setAdminName(user.username || '');
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

  // Diviser les cartes en deux rangées
  const firstRowCards = [
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
  ];

  const secondRowCards = [
    {
      title: 'Pending Datasets',
      value: stats.pendingDatasets,
      description: 'Not yet finished',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
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

  // Données pour le diagramme circulaire
  const pieChartData = [
    { name: 'Completed', value: stats.finishedDatasets, color: '#10B981' },  // vert
    { name: 'Pending', value: stats.pendingDatasets, color: '#F97316' },     // orange
    { name: 'Other', value: stats.nbrOfDatasets - (stats.finishedDatasets + stats.pendingDatasets), color: '#8B5CF6' }  // violet
  ].filter(item => item.value > 0);  // Ne garder que les valeurs positives

  if (loading) {
    return <div>Loading statistics...</div>;
  }

  // Get random greeting when rendering
  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
  const timeGreeting = getTimeBasedGreeting();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {timeGreeting}, {adminName || 'Admin'}!
        </h2>
        <p className="text-sm text-muted-foreground">
          {randomGreeting}. Here's an overview of your annotation platform.
        </p>
      </div>

      <div className="flex gap-4">
        {/* Cartes à gauche - width-2/3 pour prendre 2/3 de l'espace */}
        <div className="w-2/3 space-y-3">
          {/* Première rangée */}
          <div className="grid gap-3 grid-cols-2">
            {firstRowCards.map((card, index) => (
              <Card key={index} className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
                  <CardTitle className="text-xs font-medium">
                    {card.title}
                  </CardTitle>
                  <div className={`${card.bgColor} p-1.5 rounded-full`}>
                    <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-2 px-3">
                  <div className="text-xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Deuxième rangée */}
          <div className="grid gap-3 grid-cols-2">
            {secondRowCards.map((card, index) => (
              <Card key={index} className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
                  <CardTitle className="text-xs font-medium">
                    {card.title}
                  </CardTitle>
                  <div className={`${card.bgColor} p-1.5 rounded-full`}>
                    <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-2 px-3">
                  <div className="text-xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Diagramme circulaire à droite - w-1/3 pour prendre 1/3 de l'espace */}
        <div className="w-1/3">
          <Card className="shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <PieChart className="h-4 w-4 mr-2 text-muted-foreground" />
                Dataset Distribution
              </CardTitle>
              <CardDescription className="text-xs">
                Overview of dataset status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pieChartData.length > 0 ? (
                <div className="h-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}`, 'Datasets']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[150px] text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}