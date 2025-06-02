import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, MoreHorizontal, Eye, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import API from '../api';

export function TasksTable() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await API.get(
          '/api/admins/getAdminTasksWithAllNeededCoupleOfText',
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        if (response.status === 200) {
          // Process the response data to match our expected structure
          const responseData = response.data;
          console.log('my  data : ' + responseData.data[0].datasetId);

          if (
            responseData.status === 'success' &&
            Array.isArray(responseData.data)
          ) {
            // Transform the data to match the expected format using actual API field names
            const processedTasks = responseData.data.map((task, index) => ({
              id: task.datasetId || `T${String(index + 1).padStart(3, '0')}`, // Use datasetId or generate ID
              datasetId: task.datasetId, // Use for navigation
              label: task.LabelName || 'Annotation Task',
              datasetName: task.DatasetName || 'Unknown Dataset',
              datasetDesc: task.DatasetDescription || '',
              status:
                task.Status === 'Not Start'
                  ? 'not-started'
                  : task.Status === 'In Progress'
                  ? 'in-progress'
                  : task.Status === 'Completed'
                  ? 'completed'
                  : 'not-started',
              progress: Math.round(task.Advancement || 0),
              action: task.Action || 'Start',
              baseAffectedRows: task.baseAffectedRows || 0,
            }));

            setTasks(processedTasks);
          } else {
            console.log('Unexpected API response format:', responseData);
            setTasks([]);
          }
        } else {
          throw new Error('Failed to fetch tasks');
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        // Fallback to empty array if API fails
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
      task.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.datasetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatusFilter =
      filterStatus === null || task.status === filterStatus;

    return matchesSearch && matchesStatusFilter;
  });
  // Navigate to annotation page using dataset ID instead of task ID
  const handleAnnotateClick = task => {
    navigate(`/annotate/${task.datasetId}`);
  };

  // Navigate to couple of text page
  const handleViewCouplesOfText = task => {
    navigate(`/couple-of-text/${task.datasetId}`);
  };
  const getStatusBadge = status => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'in-progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'not-started':
        return <Badge variant="outline">Not Started</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            className="pl-8"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilterStatus(null)}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('not-started')}>
                Not Started
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('in-progress')}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('completed')}>
                Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Dataset Name</TableHead>
              <TableHead className="hidden md:table-cell">
                Dataset Description
              </TableHead>
              <TableHead className="w-[140px] text-center">Progress</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading tasks...
                </TableCell>
              </TableRow>
            ) : filteredTasks.length > 0 ? (
              filteredTasks.map(task => (
                <TableRow
                  key={task.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium text-sm">
                    {task.id}
                  </TableCell>
                  <TableCell className="font-medium">{task.label}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {task.datasetName}
                  </TableCell>
                  <TableCell className="hidden max-w-[250px] truncate md:table-cell text-muted-foreground text-sm">
                    {task.datasetDesc || 'No description available'}
                  </TableCell>
                  <TableCell className="w-[140px]">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          Progress
                        </span>
                        <span className="text-sm font-semibold">
                          {Math.round(task.progress)}%
                        </span>
                      </div>
                      <Progress value={task.progress} className="h-2 w-full" />
                      <div className="text-xs text-muted-foreground text-center">
                        {task.baseAffectedRows > 0 &&
                          `${Math.round(
                            (task.progress / 100) * task.baseAffectedRows,
                          )}/${task.baseAffectedRows} items`}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        variant={
                          task.status === 'not-started'
                            ? 'default'
                            : task.status === 'in-progress'
                            ? 'secondary'
                            : 'outline'
                        }
                        size="sm"
                        onClick={() => handleAnnotateClick(task)}
                        // disabled={task.status === 'completed'}
                        className="min-w-[80px]"
                      >
                        {task.action ||
                          (task.status === 'not-started'
                            ? 'Start'
                            : task.status === 'in-progress'
                            ? 'Continue'
                            : 'Review')}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleViewCouplesOfText(task)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View All Couples of Text
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
                  No tasks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Default export for compatibility
export default TasksTable;
