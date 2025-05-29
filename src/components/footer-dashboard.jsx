import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Users,
  Clock,
  TrendingUp,
  ArrowRight,
  Eye,
  UserPlus,
  Database,
  Tag,
  Settings,
  Activity,
  BarChart3,
  UserCheck,
} from 'lucide-react';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LabelList, 
  Cell 
} from 'recharts';

import API from '../api';

const FooterDashboard = () => {
  const navigate = useNavigate();
  const [recentActivity, setRecentActivity] = useState([]);
  const [quickStats, setQuickStats] = useState({
    recentAnnotations: 0,
    activeProjects: 0,
    pendingTasks: 0,
  });

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

  const [annotatorStats, setAnnotatorStats] = useState({
    min: { id: 0, value: 0, name: "Aucun" },
    median: { id: 0, value: 0, name: "Aucun" },
    max: { id: 0, value: 0, name: "Aucun" },
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch global stats data (ajout)
        const statsResponse = await API.get('/api/stats');
        if (statsResponse.status === 200) {
          setStats(statsResponse.data.data);
        }

        const annotatorStatsResponse = await API.get('/api/annotators/stats');
      
        if (annotatorStatsResponse.status === 200 && annotatorStatsResponse.data.data) {
          const statsData = annotatorStatsResponse.data.data;
          
          // Récupérer tous les IDs d'annotateurs de min, median et max
          const minId = Object.keys(statsData.min)[0];
          const medianId = Object.keys(statsData.median)[0];
          const maxId = Object.keys(statsData.max)[0];
          
          // Récupérer les noms des annotateurs
          const annotatorNamesResponse = await API.get('/api/annotators');
          const annotators = annotatorNamesResponse.data.data || [];

          console.log('Annotator Stats:', statsData);
          console.log('Annotators:', annotators);
          
          // Fonction pour trouver le nom de l'annotateur par ID
          const findAnnotatorName = (id) => {
            const annotator = annotators.find(a => a.id == id);
            return annotator ? `${annotator.firstName} ${annotator.lastName}` : `Annotateur ${id}`;
          };
          
          setAnnotatorStats({
            min: { 
              id: minId, 
              value: Object.values(statsData.min)[0],
              name: findAnnotatorName(minId)
            },
            median: { 
              id: medianId, 
              value: Object.values(statsData.median)[0],
              name: findAnnotatorName(medianId)
            },
            max: { 
              id: maxId, 
              value: Object.values(statsData.max)[0],
              name: findAnnotatorName(maxId)
            }
          });
        }
        // Fetch last annotator data
        const lastAnnotatorResponse = await API.get('/api/annotators/last');

        // Fetch annotations count in last 24 hours
        const annotationsLast24hResponse = await API.get(
          '/api/annotations/count-last-24h',
        ); 
        
        // Fetch last completed task
        const lastTaskResponse = await API.get(
          '/api/tasks/last-task-completed',
        );

        // Fetch last completed dataset
        const lastDatasetResponse = await API.get(
          '/api/datasets/last-dataset-completed',
        );

        console.log(
          'Annotations in last 24h:',
          annotationsLast24hResponse.data,
        );
        console.log('Last completed task:', lastTaskResponse.data);
        console.log('Last completed dataset:', lastDatasetResponse.data);
        let activityData = [];

        // Add last annotator activity - always show
        if (lastAnnotatorResponse.status === 200) {
          const lastAnnotator = lastAnnotatorResponse.data.data;

          let annotatorMessage,
            annotatorTime,
            annotatorUser,
            annotatorEmail,
            annotatorActive;

          if (lastAnnotator) {
            // There is a last annotator
            annotatorMessage = `New annotator "${lastAnnotator.firstName} ${lastAnnotator.lastName}" joined the platform`;
            annotatorTime = 'Recently';
            annotatorUser = lastAnnotator.username;
            annotatorEmail = lastAnnotator.email;
            annotatorActive = lastAnnotator.active;
          } else {
            // No annotators in the database
            annotatorMessage = 'No annotators have joined the platform yet';
            annotatorTime = 'Waiting';
            annotatorUser = 'System';
            annotatorEmail = null;
            annotatorActive = undefined;
          }

          activityData.push({
            id: 1,
            type: 'user',
            message: annotatorMessage,
            time: annotatorTime,
            user: annotatorUser,
            email: annotatorEmail,
            active: annotatorActive,
            hasData: !!lastAnnotator,
          });
        } 
        
        // Add last completed task activity - always show
        if (lastTaskResponse.status === 200) {
          const lastTask = lastTaskResponse.data.data;

          let taskMessage, taskTime, taskUser;

          if (lastTask && lastTask.datasetName) {
            // There is a completed task
            taskMessage = `Task completed on dataset "${lastTask.datasetName}"`;
            taskTime = lastTask.finishedAt
              ? new Date(lastTask.finishedAt).toLocaleDateString()
              : 'Recently';
            taskUser = lastTask.annotatorName || 'Unknown Annotator';
          } else {
            taskMessage = 'No tasks have been completed yet';
            taskTime = 'Waiting';
            taskUser = 'System';
          }
          activityData.push({
            id: 3,
            type: 'task',
            message: taskMessage,
            time: taskTime,
            user: taskUser,
            hasData: !!lastTask,
          });
        }

        // Add last completed dataset activity - always show
        if (lastDatasetResponse.status === 200) {
          const lastDataset = lastDatasetResponse.data.data;

          let datasetMessage, datasetTime, datasetUser;

          if (lastDataset && lastDataset.datasetName) {
            // There is a completed dataset
            datasetMessage = `Dataset "${lastDataset.datasetName}" processing completed`;
            datasetTime = lastDataset.createdAt
              ? new Date(lastDataset.createdAt).toLocaleDateString()
              : 'Recently';
            datasetUser = lastDataset.labelName
              ? `Label: ${lastDataset.labelName}`
              : 'System';
          } else {
            datasetMessage = 'No datasets have been processed yet';
            datasetTime = 'Waiting';
            datasetUser = 'System';
          }

          activityData.push({
            id: 4,
            type: 'dataset',
            message: datasetMessage,
            time: datasetTime,
            user: datasetUser,
            hasData: !!lastDataset,
            size: lastDataset?.sizeMB,
          });
        }

        setRecentActivity(activityData); 
        
        // Use real stats data if available
        let recentAnnotationsCount = 0;
        let pendingTasksCount = 0;

        // Get real annotations count from last 24h endpoint
        if (annotationsLast24hResponse.status === 200) {
          recentAnnotationsCount = annotationsLast24hResponse.data.data || 0;
        }

        // Get real pending tasks count from last completed task endpoint
        if (lastTaskResponse.status === 200 && lastTaskResponse.data.data) {
          pendingTasksCount = lastTaskResponse.data.data.nbrOfPendingTasks || 0;
        }

        if (statsResponse.status === 200 && statsResponse.data.data) {
          const stats = statsResponse.data.data;
          setQuickStats({
            recentAnnotations: recentAnnotationsCount,
            activeProjects: stats.nbrOfDatasets || 0,
            pendingTasks: pendingTasksCount,
          });
        } else {
          // Fallback to mock data but use real annotations and pending tasks count
          setQuickStats({
            recentAnnotations: recentAnnotationsCount,
            activeProjects: 8,
            pendingTasks: pendingTasksCount,
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);

        // Fallback to mock data for annotator stats
        setAnnotatorStats({
          min: { id: "3", value: 1, name: "Annotateur 3" },
          median: { id: "5", value: 5, name: "Annotateur 5" },
          max: { id: "7", value: 8, name: "Annotateur 7" },
        });
        
        // Fallback to mock data on error
        const mockActivity = [
          {
            id: 1,
            type: 'annotation',
            message: 'New annotation completed on Dataset #12',
            time: '2 hours ago',
            user: 'John Doe',
          },
          {
            id: 2,
            type: 'user',
            message: 'New annotator joined the platform',
            time: '4 hours ago',
            user: 'Jane Smith',
          },
          {
            id: 3,
            type: 'dataset',
            message: 'Dataset "Medical Images" was created',
            time: '1 day ago',
            user: 'Admin',
          },
        ];

        setRecentActivity(mockActivity);
        setQuickStats({
          recentAnnotations: 15,
          activeProjects: 8,
          pendingTasks: 23,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  
  const getActivityIcon = (type, activity) => {
    switch (type) {
      case 'user':
        // Show different icon based on whether there are annotators or not
        if (!activity?.hasData) {
          return <Clock className="h-4 w-4 text-gray-500" />;
        }
        return <Users className="h-4 w-4 text-green-600" />;
      case 'task':
        // Show different icon based on whether there are completed tasks or not
        if (!activity?.hasData) {
          return <Clock className="h-4 w-4 text-gray-500" />;
        }
        return <FileText className="h-4 w-4 text-purple-600" />;
      case 'dataset':
        // Show different icon based on whether there are processed datasets or not
        if (!activity?.hasData) {
          return <Clock className="h-4 w-4 text-gray-500" />;
        }
        return <Database className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const prepareChartData = () => {
    // Extraire le prénom seulement pour l'affichage
    const getFirstName = (fullName) => {
      if (!fullName) return "Aucun";
      return fullName.split(' ')[0];
    };
    
    return [
      {
        name: getFirstName(annotatorStats.min.name),
        value: annotatorStats.min.value,
        id: annotatorStats.min.id,
        fill: "#FDA4AF" // couleur rouge clair
      },
      {
        name: getFirstName(annotatorStats.median.name),
        value: annotatorStats.median.value,
        id: annotatorStats.median.id,
        fill: "#60A5FA" // couleur bleue
      },
      {
        name: getFirstName(annotatorStats.max.name),
        value: annotatorStats.max.value,
        id: annotatorStats.max.id,
        fill: "#34D399" // couleur verte
      }
    ];
  };

  // Définition des nouvelles cartes à afficher
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
      title: 'Total Users',
      value: stats.totalUsers,
      description: 'All accounts',
      icon: UserCheck,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Management Hub</h2>
        <p className="text-muted-foreground">
          Quick access to key platform features and recent activity overview.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Recent Activity Card - 4 columns */}
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">
              Recent Activity
            </CardTitle>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map(activity => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="mt-1">
                    {getActivityIcon(activity.type, activity)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p
                      className={`text-sm font-medium leading-none ${
                        (activity.type === 'task' && !activity.hasData) ||
                        (activity.type === 'user' && !activity.hasData) ||
                        (activity.type === 'dataset' && !activity.hasData)
                          ? 'text-muted-foreground'
                          : ''
                      }`}
                    >
                      {activity.message}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{activity.time}</span>
                      <span>•</span>
                      <span>{activity.user}</span>
                      {activity.email && <span>{activity.email}</span>}
                      {activity.size && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600 font-medium">
                            {activity.size.toFixed(2)} MB
                          </span>
                        </>
                      )}
                      {activity.active !== undefined && (
                        <>
                          <span>•</span>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              activity.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {activity.active ? 'Active' : 'Inactive'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => navigate('/admin/tasks')}
              >
                View All Activity
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
                                                        
        {/* Annotator Performance Card - 4 columns */}
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">
              Performance of Annotators
            </CardTitle>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Top Average and Last annotator performance
            </p>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prepareChartData()} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} />
                  <YAxis allowDecimals={false} />
                  <Tooltip 
                    formatter={(value, name, props) => [`${value} annotations`, `${props.payload.name}`]}
                    labelFormatter={() => ""}
                  />
                  {/* Modified Bar to use item colors and show by default without hover */}
                  <Bar dataKey="value" nameKey="name" fillOpacity={0.9}>
                    {prepareChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <LabelList dataKey="value" position="top" fill="#374151" fontSize={12} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cards des stats utilisateurs - 4 columns */}
        <div className="col-span-4 space-y-4">
          {statCards.map((card, index) => (
            <Card key={index} className="shadow-sm">
              <div className="flex p-4 items-center">
                <div className={`${card.bgColor} p-3 rounded-full mr-4`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </h3>
                  <div className="text-2xl font-bold mt-1">{card.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
          
        </div>
      </div>

      {/* Platform Statistics Summary - full width */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Platform Overview
          </CardTitle>
          <CardDescription>
            Quick insights into platform performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg hover:bg-blue-50 transition-colors">
              <div className="text-2xl font-bold text-blue-600">
                {quickStats.recentAnnotations}
              </div>
              <p className="text-sm text-muted-foreground">
                Annotations (Last 24h)
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {quickStats.activeProjects}
              </div>
              <p className="text-sm text-muted-foreground">Active Projects</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {quickStats.pendingTasks}
              </div>
              <p className="text-sm text-muted-foreground">Pending Tasks</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FooterDashboard;