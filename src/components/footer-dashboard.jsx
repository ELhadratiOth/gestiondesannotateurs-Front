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
} from 'lucide-react';
import API from '../api';

const FooterDashboard = () => {
  const navigate = useNavigate();
  const [recentActivity, setRecentActivity] = useState([]);
  const [quickStats, setQuickStats] = useState({
    recentAnnotations: 0,
    activeProjects: 0,
    pendingTasks: 0,
  });
  const [loading, setLoading] = useState(true);  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch last annotator data
        const lastAnnotatorResponse = await API.get('/api/annotators/last');
        
        // Fetch existing stats data
        const statsResponse = await API.get('/api/stats');
        
        // Fetch annotations count in last 24 hours
        const annotationsLast24hResponse = await API.get('/api/annotations/count-last-24h');
        console.log('Annotations in last 24h:', annotationsLast24hResponse.data);
        let activityData = [];
        
        if (lastAnnotatorResponse.status === 200 && lastAnnotatorResponse.data.data) {
          const lastAnnotator = lastAnnotatorResponse.data.data;
          
          // Create activity for the last annotator
          activityData.push({
            id: 1,
            type: 'user',
            message: `New annotator "${lastAnnotator.firstName} ${lastAnnotator.lastName}" joined the platform`,
            time: 'Recently',
            user: lastAnnotator.username,
            email: lastAnnotator.email,
            active: lastAnnotator.active
          });
        }
if (annotationsLast24hResponse.status === 200) {
  const annotationCount = annotationsLast24hResponse.data.data || 0;
  const message = annotationCount > 0 
    ? `${annotationCount} annotations completed in the last 24 hours`
    : 'No annotations completed in the last 24 hours';
  
  activityData.push({
    id: 2,
    type: 'annotation',
    message: message,
    time: 'Last 24h',
    user: 'Admin',
    count: annotationCount
  });
}

// Fetch last task data
try {
  const lastTaskResponse = await API.get('/api/tasks/last');
  if (lastTaskResponse.status === 200 && lastTaskResponse.data.data) {
    const lastTask = lastTaskResponse.data.data;
    activityData.push({
      id: 3,
      type: 'task',
      message: `Task "${lastTask.name || 'Unnamed Task'}" was recently ${lastTask.status || 'updated'}`,
      time: 'Recently',
      user: lastTask.assignedTo || 'Unassigned',
    });
  }
} catch (taskError) {
  console.log('Could not fetch last task:', taskError);
}

activityData.push({
  id: 4,
  type: 'dataset',
  message: 'Dataset processing completed',
  time: '4 hours ago',
  user: 'Admin',
});

        setRecentActivity(activityData);

        // Use real stats data if available
        let recentAnnotationsCount = 0;
        
        // Get real annotations count from last 24h endpoint
        if (annotationsLast24hResponse.status === 200) {
          recentAnnotationsCount = annotationsLast24hResponse.data.data || 0;
        }
        
        if (statsResponse.status === 200 && statsResponse.data.data) {
          const stats = statsResponse.data.data;
          setQuickStats({
            recentAnnotations: recentAnnotationsCount,
            activeProjects: stats.nbrOfDatasets || 0,
            pendingTasks: stats.pendingDatasets || 0,
          });
        } else {
          // Fallback to mock data but use real annotations count
          setQuickStats({
            recentAnnotations: recentAnnotationsCount,
            activeProjects: 8,
            pendingTasks: 23,
          });
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        
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
      case 'annotation':
        // Show different icon based on whether there are annotations or not
        if (activity?.count === 0) {
          return <Clock className="h-4 w-4 text-gray-500" />;
        }
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'user':
        return <Users className="h-4 w-4 text-green-600" />;
      case 'dataset':
        return <Database className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
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

      <div className="flex flex-col md:flex-row gap-6">
        {/* Recent Activity Card */}
        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="mt-1">{getActivityIcon(activity.type, activity)}</div>
                  <div className="flex-1 space-y-1">
                    <p className={`text-sm font-medium leading-none ${
                      activity.type === 'annotation' && activity.count === 0 
                        ? 'text-muted-foreground' 
                        : ''
                    }`}>
                      {activity.message}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{activity.time}</span>
                      <span>•</span>
                      <span>{activity.user}</span>
                      {activity.email && (
                        <>
                          <span>•</span>
                          <span>{activity.email}</span>
                        </>
                      )}
                      {activity.active !== undefined && (
                        <>
                          <span>•</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            activity.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
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
      </div>

      {/* Platform Statistics Summary */}
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
          <div className="grid gap-4 md:grid-cols-3">            <div className="text-center p-4 border rounded-lg hover:bg-blue-50 transition-colors">
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
              <p className="text-sm text-muted-foreground">
                Active Projects
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {quickStats.pendingTasks}
              </div>
              <p className="text-sm text-muted-foreground">
                Pending Tasks
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FooterDashboard;
