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
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

const greetings = [
  'Welcome back',
  'Hello',
  'Good to see you',
  'Hey there',
  'Great to have you back',
  'Welcome',
  'Greetings',
];

// Add time-based greeting function
const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
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
    finishedDatasets: 0,
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
  const firstRowCards = [
    {
      title: 'Total Datasets',
      value: stats.nbrOfDatasets,
      description: `${stats.assignedDatasets} assigned`,
      icon: Database,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-l-cyan-500',
    },
    {
      title: 'Completed Datasets',
      value: stats.finishedDatasets,
      description: 'Annotation completed',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-l-cyan-500',
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
      borderColor: 'border-l-cyan-500',
    },
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      description: 'Annotation tasks',
      icon: Activity,
      color: 'text-rose-600',
      bgColor: 'bg-rose-100',
      borderColor: 'border-l-cyan-500',
    },
  ];
  // Données pour le diagramme circulaire avec des couleurs sophistiquées
  const pieChartData = [
    {
      name: 'Completed',
      value: stats.finishedDatasets,
      color: '#10B981',
      gradient: 'url(#completedGradient)',
      description: 'Successfully finished',
    },
    {
      name: 'Pending',
      value: stats.pendingDatasets,
      color: '#F59E0B',
      gradient: 'url(#pendingGradient)',
      description: 'In progress',
    },
    {
      name: 'Unassigned',
      value:
        stats.nbrOfDatasets - (stats.finishedDatasets + stats.pendingDatasets),
      color: '#8B5CF6',
      gradient: 'url(#unassignedGradient)',
      description: 'Not yet started',
    },
  ].filter(item => item.value > 0);
  // Custom label rendering function
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    if (percent < 0.05) return null; // Don't show label if slice is too small

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="600"
        className="drop-shadow-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <span className="font-medium text-sm">{data.name}</span>
          </div>
          <p className="text-xs text-muted-foreground">{data.description}</p>
          <p className="text-lg font-bold">{data.value} datasets</p>
          <p className="text-xs text-muted-foreground">
            {((data.value / stats.nbrOfDatasets) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-col gap-1 mt-2">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.value}</span>
            <span className="font-medium ml-auto">{entry.payload.value}</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div>Loading statistics...</div>;
  }

  // Get random greeting when rendering
  const randomGreeting =
    greetings[Math.floor(Math.random() * greetings.length)];
  const timeGreeting = getTimeBasedGreeting();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {timeGreeting}, <span className='capitalize'>{adminName || 'Admin'}!</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          {randomGreeting}. Here's an overview of your annotation platform.
        </p>
      </div>

      <div className="flex gap-4">
        {' '}
        {/* Cartes à gauche - width-2/3 pour prendre 2/3 de l'espace */}{' '}
        <div className="w-2/3 space-y-4">
          {/* Première rangée */}
          <div className="grid gap-4 grid-cols-2">
            {firstRowCards.map((card, index) => (
              <Card
                key={index}
                className={`shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 ${card.borderColor}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        {card.title}
                      </p>
                      <p className="text-3xl font-bold">{card.value}</p>
                      <p className="text-xs text-muted-foreground">
                        {card.description}
                      </p>
                    </div>
                    <div
                      className={`${card.bgColor} dark:bg-opacity-20 p-3 rounded-xl`}
                    >
                      <card.icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Deuxième rangée */}
          <div className="grid gap-4 grid-cols-2">
            {secondRowCards.map((card, index) => (
              <Card
                key={index}
                className={`shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 ${card.borderColor}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        {card.title}
                      </p>
                      <p className="text-3xl font-bold">{card.value}</p>
                      <p className="text-xs text-muted-foreground">
                        {card.description}
                      </p>
                    </div>
                    <div
                      className={`${card.bgColor} dark:bg-opacity-20 p-3 rounded-xl`}
                    >
                      <card.icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                  </div>
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
                Visual breakdown of dataset progress
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              {pieChartData.length > 0 ? (
                <div className="space-y-2">
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <defs>
                          <linearGradient
                            id="completedGradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop
                              offset="0%"
                              stopColor="#10B981"
                              stopOpacity={1}
                            />
                            <stop
                              offset="100%"
                              stopColor="#059669"
                              stopOpacity={1}
                            />
                          </linearGradient>
                          <linearGradient
                            id="pendingGradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop
                              offset="0%"
                              stopColor="#F59E0B"
                              stopOpacity={1}
                            />
                            <stop
                              offset="100%"
                              stopColor="#D97706"
                              stopOpacity={1}
                            />
                          </linearGradient>
                          <linearGradient
                            id="unassignedGradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop
                              offset="0%"
                              stopColor="#8B5CF6"
                              stopOpacity={1}
                            />
                            <stop
                              offset="100%"
                              stopColor="#7C3AED"
                              stopOpacity={1}
                            />
                          </linearGradient>
                        </defs>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomLabel}
                          outerRadius={65}
                          innerRadius={25}
                          paddingAngle={3}
                          dataKey="value"
                          animationBegin={0}
                          animationDuration={800}
                          animationEasing="ease-out"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.gradient}
                              stroke="rgba(255,255,255,0.2)"
                              strokeWidth={2}
                              className="drop-shadow-sm hover:drop-shadow-md transition-all duration-200"
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={<CustomLegend />} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Summary statistics */}
                  <div className="text-center pt-1 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      Total:{' '}
                      <span className="font-medium text-foreground">
                        {stats.nbrOfDatasets}
                      </span>{' '}
                      datasets
                    </p>
                    {stats.nbrOfDatasets > 0 && (
                      <p className="text-xs text-muted-foreground">
                        <span className="text-green-600 font-medium">
                          {(
                            (stats.finishedDatasets / stats.nbrOfDatasets) *
                            100
                          ).toFixed(0)}
                          %
                        </span>{' '}
                        completion rate
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[180px] text-muted-foreground">
                  <PieChart className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No data available</p>
                  <p className="text-xs">
                    Start creating datasets to see analytics
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
