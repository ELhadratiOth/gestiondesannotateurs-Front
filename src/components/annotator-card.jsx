import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import {
  CheckCircle,
  Calendar,
  Award,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

export default function AnnotatorCard() {
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const stats = {
    tasksCompleted: 38,
    tasksAssigned: 45,
    accuracy: 97,
    streak: 7,
  };

  // Calculate completion percentage
  const completionPercentage = Math.round(
    (stats.tasksCompleted / stats.tasksAssigned) * 100,
  );

  // Greeting messages
  const greetings = [
    `Welcome back! Ready to make an impact today?`,
    `Great to see you! Your contributions are making a difference.`,
    `Your expertise is invaluable to our annotation projects.`,
    `Your precision and attention to detail are what make our data exceptional.`,
    `Thanks for being an essential part of our annotation team.`,
  ];

  // Select a random greeting
  const randomGreeting =
    greetings[Math.floor(Math.random() * greetings.length)];

  return (
    <Card className="border-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl">
          Good {getTimeOfDay()}!
        </CardTitle>
        <CardDescription className="text-base">
          {randomGreeting}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Tasks Completed</span>
            </div>
            <div className="mt-2 text-2xl font-bold">
              {stats.tasksCompleted}{' '}
              <span className="text-sm text-muted-foreground font-normal">
                / {stats.tasksAssigned}
              </span>
            </div>
            <Progress value={completionPercentage} className="mt-2 h-1" />
          </div>

          <div className="rounded-lg border bg-card p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Accuracy Rate</span>
            </div>
            <div className="mt-2 text-2xl font-bold">{stats.accuracy}%</div>
            <div className="mt-2 text-xs text-muted-foreground">
              {stats.accuracy > 95 ? 'Excellent work!' : 'Keep improving!'}
            </div>
          </div>

          <div className="rounded-lg border bg-card p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Daily Streak</span>
            </div>
            <div className="mt-2 text-2xl font-bold">{stats.streak} days</div>
            <div className="mt-2 text-xs text-muted-foreground">
              Keep it going!
            </div>
          </div>

          <div className="rounded-lg border bg-card p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Today's Goal</span>
            </div>
            <div className="mt-2 text-2xl font-bold">
              {stats.tasksAssigned - stats.tasksCompleted}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Tasks remaining today
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between border-t bg-muted/50 px-6 py-3">
        <div className="flex items-center">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            {stats.streak >= 5 ? 'Power Annotator' : 'Active Annotator'}
          </Badge>
        </div>
        <Button variant="ghost" className="gap-1 text-sm">
          View all tasks <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
