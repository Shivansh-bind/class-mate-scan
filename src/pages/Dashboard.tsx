import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, ClipboardCheck, Calendar, TrendingUp, Award } from "lucide-react";
import { Link } from "react-router-dom";
import studentsData from "@/data/students.json";
import classesData from "@/data/classes.json";
import testsData from "@/data/tests.json";
import eventsData from "@/data/events.json";

const Dashboard = () => {
  // Calculate statistics
  const totalStudents = studentsData.length;
  const totalClasses = classesData.length;
  const totalTests = testsData.length;
  const upcomingEvents = eventsData.filter(event => new Date(event.date) > new Date()).length;

  // Calculate average attendance
  const totalSessions = classesData.reduce((sum, cls) => sum + cls.sessions.length, 0);
  const totalAttendance = studentsData.reduce((sum, student) => sum + student.attendance.length, 0);
  const avgAttendanceRate = totalSessions > 0 ? (totalAttendance / (totalStudents * totalSessions)) * 100 : 0;

  // Calculate average test score
  const allTestScores = studentsData.flatMap(student => student.tests.map(test => test.score));
  const avgTestScore = allTestScores.length > 0 ? allTestScores.reduce((sum, score) => sum + score, 0) / allTestScores.length : 0;

  // Recent activity
  const recentTests = testsData
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const upcomingEventsData = eventsData
    .filter(event => new Date(event.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          SmartClass Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Real-time classroom attendance and activity tracking
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Active learners
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClasses}</div>
            <p className="text-xs text-muted-foreground">
              Ongoing courses
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgAttendanceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Class participation
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Test Score</CardTitle>
            <Award className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgTestScore.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Performance metric
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <ClipboardCheck className="w-5 h-5" />
              <span>Recent Tests</span>
            </CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link to="/tests">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTests.map((test) => (
              <div key={test.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <h4 className="font-medium">{test.title}</h4>
                  <p className="text-sm text-muted-foreground">{test.subject}</p>
                </div>
                <div className="text-right">
                  <Badge variant={test.type === 'midterm' ? 'default' : 'secondary'}>
                    {test.type}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(test.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {recentTests.length === 0 && (
              <p className="text-center text-muted-foreground">No recent tests</p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Upcoming Events</span>
            </CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link to="/events">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEventsData.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <h4 className="font-medium">{event.title}</h4>
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                </div>
                <div className="text-right">
                  <Badge variant={
                    event.priority === 'high' ? 'destructive' : 
                    event.priority === 'medium' ? 'default' : 'secondary'
                  }>
                    {event.type}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {upcomingEventsData.length === 0 && (
              <p className="text-center text-muted-foreground">No upcoming events</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-20 flex-col space-y-2">
              <Link to="/students">
                <Users className="w-6 h-6" />
                <span>View Students</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col space-y-2">
              <Link to="/classes">
                <BookOpen className="w-6 h-6" />
                <span>Manage Classes</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col space-y-2">
              <Link to="/tests">
                <ClipboardCheck className="w-6 h-6" />
                <span>Test Results</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col space-y-2">
              <Link to="/scan">
                <Calendar className="w-6 h-6" />
                <span>QR Scanner</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;