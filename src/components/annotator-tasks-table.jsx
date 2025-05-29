import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Filter,
  MoreHorizontal,
  Play,
  Pause,
  CheckCircle,
  Clock,
  BookOpen,
  Eye,
  Loader2,
} from 'lucide-react';
import API from '../api';

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'not start':
      return 'bg-gray-100 text-gray-800';
    case 'in progress':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'paused':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status) => {
  switch (status.toLowerCase()) {
    case 'not start':
      return <Clock className="h-3 w-3" />;
    case 'in progress':
      return <Play className="h-3 w-3" />;
    case 'completed':
      return <CheckCircle className="h-3 w-3" />;
    case 'paused':
      return <Pause className="h-3 w-3" />;
    default:
      return <Clock className="h-3 w-3" />;
  }
};

export function AnnotatorTasksTable() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState(null);

  // Get annotator ID from localStorage
  const getAnnotatorId = () => {
    const user= JSON.parse(localStorage.getItem('user') || '{}');
    console.log('User from localStorage:', user);
    console.log('User annotatorId:', user.annotatorId);
    return user.annotatorId || user.id || '';
  };

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const annotatorId = getAnnotatorId();
        const response = await API.get(
          `/api/annotators/getAnnotatorTasks/${annotatorId}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (response.status === 200) {
          const responseData = response.data;
          
          if (responseData.status === 'success' && Array.isArray(responseData.data)) {
            setTasks(responseData.data);
          } else {
            console.error('Unexpected response format:', responseData);
            setTasks([]);
          }
        } else {
          console.error('Failed to fetch tasks');
          setTasks([]);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Filter tasks based on search term and status filter
  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      searchTerm === '' ||
      task.datasetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.datasetDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.datasetLabelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.taskId.toString().includes(searchTerm);

    const matchesStatusFilter =
      filterStatus === null || task.status === filterStatus;

    return matchesSearch && matchesStatusFilter;
  });

  // Navigate to annotation page
  const handleAnnotateClick = (task) => {
    const annotatorId = getAnnotatorId();
    navigate(`/annotate/${annotatorId}/${task.taskId}`);
  };

  // Handle action button click
  const handleActionClick = (task) => {
    if (task.action === 'Start' || task.action === 'Continue') {
      handleAnnotateClick(task);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your tasks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {filterStatus || 'All Status'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterStatus(null)}>
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('Not Start')}>
                Not Started
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('In Progress')}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('Completed')}>
                Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Task ID</TableHead>
              <TableHead>Dataset</TableHead>
              <TableHead>Label Type</TableHead>
              <TableHead className="text-center">Progress</TableHead>
              <TableHead className="text-center">Assigned</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TableRow key={task.taskId} className="hover:bg-muted/50">
                  <TableCell className="font-medium">#{task.taskId}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{task.datasetName}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {task.datasetDescription}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700">
                      {task.datasetLabelName}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <div className="text-sm font-medium">
                        {(task.progress * 100).toFixed(1)}%
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mt-1">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${task.progress * 100}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{task.totalAssigned}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={getStatusColor(task.status)}>
                      {getStatusIcon(task.status)}
                      <span className="ml-1">{task.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {task.action && (
                        <Button
                          size="sm"
                          onClick={() => handleActionClick(task)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <BookOpen className="h-4 w-4 mr-1" />
                          {task.action}
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAnnotateClick(task)}>
                            <BookOpen className="h-4 w-4 mr-2" />
                            Annotate
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {searchTerm || filterStatus ? 'No tasks found matching your criteria.' : 'No tasks assigned to you yet.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {filteredTasks.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {filteredTasks.length} of {tasks.length} task(s)
          </div>
          <div>
            {tasks.filter(t => t.status === 'Completed').length} completed • {' '}
            {tasks.filter(t => t.status === 'In Progress').length} in progress • {' '}
            {tasks.filter(t => t.status === 'Not Start').length} not started
          </div>
        </div>
      )}
    </div>
  );
}

export default AnnotatorTasksTable;