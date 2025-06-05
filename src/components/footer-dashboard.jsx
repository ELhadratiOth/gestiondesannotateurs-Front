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
  Cell,
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
    finishedDatasets: 0,
  });

  const [annotatorStats, setAnnotatorStats] = useState({
    min: { id: 0, value: 0, name: 'Aucun' },
    median: { id: 0, value: 0, name: 'Aucun' },
    max: { id: 0, value: 0, name: 'Aucun' },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsResponse = await API.get('/api/stats');
        if (statsResponse.status === 200) {
          setStats(statsResponse.data.data);
        }

        const annotatorStatsResponse = await API.get(
          '/api/annotators/global-stats',
        );

        if (
          annotatorStatsResponse.status === 200 &&
          annotatorStatsResponse.data.data
        ) {
          const statsData = annotatorStatsResponse.data.data;

          const minId = Object.keys(statsData.min)[0];
          const medianId = Object.keys(statsData.median)[0];
          const maxId = Object.keys(statsData.max)[0];

          const annotatorNamesResponse = await API.get('/api/annotators');
          const annotators = annotatorNamesResponse.data.data || [];

          console.log('Annotator Stats:', statsData);
          console.log('Annotators:', annotators);

          const findAnnotatorName = id => {
            const annotator = annotators.find(a => a.id == id);
            return annotator
              ? `${annotator.firstName} ${annotator.lastName}`
              : `Annotateur ${id}`;
          };

          setAnnotatorStats({
            min: {
              id: minId,
              value: Object.values(statsData.min)[0],
              name: findAnnotatorName(minId),
            },
            median: {
              id: medianId,
              value: Object.values(statsData.median)[0],
              name: findAnnotatorName(medianId),
            },
            max: {
              id: maxId,
              value: Object.values(statsData.max)[0],
              name: findAnnotatorName(maxId),
            },
          });
        }
        const lastAnnotatorResponse = await API.get('/api/annotators/last');

        const annotationsLast24hResponse = await API.get(
          '/api/annotations/count-last-24h',
        );

        const lastTaskResponse = await API.get(
          '/api/tasks/last-task-completed',
        );

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

        if (lastAnnotatorResponse.status === 200) {
          const lastAnnotator = lastAnnotatorResponse.data.data;

          let annotatorMessage,
            annotatorTime,
            annotatorUser,
            annotatorEmail,
            annotatorActive;

          if (lastAnnotator) {
            annotatorMessage = `New annotator "${lastAnnotator.firstName} ${lastAnnotator.lastName}" joined the platform`;
            annotatorTime = 'Recently';
            annotatorUser = lastAnnotator.username;
            annotatorEmail = lastAnnotator.email;
            annotatorActive = lastAnnotator.active;
          } else {
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

        if (lastTaskResponse.status === 200) {
          const lastTask = lastTaskResponse.data.data;

          let taskMessage, taskTime, taskUser;

          if (lastTask && lastTask.datasetName) {
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

        if (lastDatasetResponse.status === 200) {
          const lastDataset = lastDatasetResponse.data.data;

          let datasetMessage, datasetTime, datasetUser;

          if (lastDataset && lastDataset.datasetName) {
            datasetMessage = `Dataset "${lastDataset.datasetName}" creation completed`;
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

        let recentAnnotationsCount = 0;
        let pendingTasksCount = 0;

        if (annotationsLast24hResponse.status === 200) {
          recentAnnotationsCount = annotationsLast24hResponse.data.data || 0;
        }

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
          console.log('Quick Stats:', {
            recentAnnotations: recentAnnotationsCount,
            activeProjects: stats.nbrOfDatasets,
            pendingTasks: pendingTasksCount,
          });
        } else {
          setQuickStats({
            recentAnnotations: recentAnnotationsCount,
            activeProjects: 0,
            pendingTasks: pendingTasksCount,
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);

        setAnnotatorStats({
          min: { id: '3', value: 0, name: 'Annotateur 3' },
          median: { id: '5', value: 0, name: 'Annotateur 5' },
          max: { id: '7', value: 0, name: 'Annotateur 7' },
        });

        const mockActivity = [
          {
            id: 1,
            type: 'annotation',
            message: 'New annotation completed on Dataset',
            time: '2 hours ago',
            user: 'Default Annotator',
          },
          {
            id: 2,
            type: 'user',
            message: 'New annotator joined the platform',
            time: '4 hours ago',
            user: 'Admin',
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
          recentAnnotations: 0,
          activeProjects: 0,
          pendingTasks: 0,
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
        if (!activity?.hasData) {
          return <Clock className="h-4 w-4 text-gray-500" />;
        }
        return <Users className="h-4 w-4 text-green-600" />;
      case 'task':
        if (!activity?.hasData) {
          return <Clock className="h-4 w-4 text-gray-500" />;
        }
        return <FileText className="h-4 w-4 text-purple-600" />;
      case 'dataset':
        if (!activity?.hasData) {
          return <Clock className="h-4 w-4 text-gray-500" />;
        }
        return <Database className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const prepareChartData = () => {
    const getFirstName = fullName => {
      if (!fullName) return 'Aucun';
      return fullName.split(' ')[0];
    };

    return [
      {
        name: getFirstName(annotatorStats.min.name),
        value: annotatorStats.min.value,
        id: annotatorStats.min.id,
        fill: '#FDA4AF',
      },
      {
        name: getFirstName(annotatorStats.median.name),
        value: annotatorStats.median.value,
        id: annotatorStats.median.id,
        fill: '#60A5FA', // couleur bleue
      },
      {
        name: getFirstName(annotatorStats.max.name),
        value: annotatorStats.max.value,
        id: annotatorStats.max.id,
        fill: '#34D399', // couleur verte
      },
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
      </div>{' '}
      <div className="grid grid-cols-12 gap-3">
        {' '}
        {/* Recent Activity Card - 6 columns */}
        <Card className="col-span-6 h-[400px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 flex-shrink-0">
            <CardTitle className="text-lg font-semibold">
              Recent Activity
            </CardTitle>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </CardHeader>{' '}
          <CardContent className="p-3 flex-1 flex flex-col">
            <div className="space-y-2 flex-1 overflow-y-auto">
              {recentActivity.map(activity => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-2 p-2 rounded-lg border border-border"
                >
                  <div className="mt-1 flex-shrink-0">
                    {getActivityIcon(activity.type, activity)}
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <p
                      className={`text-sm font-medium leading-tight ${
                        (activity.type === 'task' && !activity.hasData) ||
                        (activity.type === 'user' && !activity.hasData) ||
                        (activity.type === 'dataset' && !activity.hasData)
                          ? 'text-muted-foreground'
                          : ''
                      }`}
                    >
                      {activity.message}
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{activity.time}</span>
                        <span>•</span>
                        <span>{activity.user}</span>
                      </div>
                      {(activity.email ||
                        activity.size ||
                        activity.active !== undefined) && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                          {activity.email && (
                            <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {activity.email}
                            </span>
                          )}
                          {activity.size && (
                            <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded font-medium">
                              {activity.size.toFixed(2)} MB
                            </span>
                          )}
                          {activity.active !== undefined && (
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                activity.active
                                  ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                                  : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                              }`}
                            >
                              {activity.active ? 'Active' : 'Inactive'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}{' '}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4 flex-shrink-0"
                onClick={() => navigate('/admin/tasks')}
              >
                View All Activity
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>{' '}
        {/* Right column - Performance Chart and Stats stacked vertically */}
        <div className="col-span-6 h-[400px] flex flex-col gap-3">
          {/* Annotator Performance Card - 70% height */}
          <Card className="h-[70%] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 flex-shrink-0">
              <CardTitle className="text-lg font-semibold">
                Performance of Annotators
              </CardTitle>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-2 flex-1 flex flex-col">
              <p className="text-xs text-muted-foreground mb-2 flex-shrink-0">
                Top Average and Last annotator performance
              </p>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={prepareChartData()}
                    margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
                  >
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      interval={0}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${value} annotations`,
                        `${props.payload.name}`,
                      ]}
                      labelFormatter={() => ''}
                    />
                    <Bar
                      dataKey="value"
                      nameKey="name"
                      fillOpacity={0.9}
                      radius={[4, 4, 0, 0]}
                    >
                      {prepareChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                      <LabelList
                        dataKey="value"
                        position="top"
                        fill="#374151"
                        fontSize={12}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          {/* User Stats Cards - 30% height */}
          <div className="h-[30%] flex flex-row gap-2">
            {statCards.map((card, index) => (
              <Card
                key={index}
                className="flex-1 shadow-sm hover:shadow-md transition-shadow duration-200 border-l-4 border-l-cyan-500"
              >
                <CardContent className="p-3 h-full">
                  <div className="flex items-center justify-between h-full">
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground truncate">
                        {card.title}
                      </p>
                      <p className="text-lg font-bold">{card.value}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {card.description}
                      </p>
                    </div>
                    <div
                      className={`${card.bgColor} dark:bg-opacity-20 p-2 rounded-xl flex-shrink-0 ml-2`}
                    >
                      <card.icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>{' '}
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
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border">
              <CardContent className="p-6 text-center">
                <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {quickStats.recentAnnotations}
                </div>
                <p className="text-sm text-muted-foreground">
                  Annotations (Last 24h)
                </p>
              </CardContent>
            </Card>
            <Card className="border">
              <CardContent className="p-6 text-center">
                <div className="bg-green-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {quickStats.activeProjects}
                </div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
              </CardContent>
            </Card>
            <Card className="border">
              <CardContent className="p-6 text-center">
                <div className="bg-orange-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  {quickStats.pendingTasks}
                </div>
                <p className="text-sm text-muted-foreground">Pending Tasks</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FooterDashboard;
