import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Users, TrendingUp, Award, Calendar } from "lucide-react";
import studentsData from "@/data/students.json";
import classesData from "@/data/classes.json";

const Students = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter students based on search
  const filteredStudents = studentsData.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate attendance percentage for each student
  const getAttendancePercentage = (student: typeof studentsData[0]) => {
    const classForStudent = classesData.find(cls => cls.id === student.class);
    if (!classForStudent) return 0;
    
    const totalSessions = classForStudent.sessions.length;
    const attendedSessions = student.attendance.length;
    
    return totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;
  };

  // Calculate average test score for each student  
  const getAverageTestScore = (student: typeof studentsData[0]) => {
    if (student.tests.length === 0) return 0;
    const total = student.tests.reduce((sum, test) => sum + test.score, 0);
    return total / student.tests.length;
  };

  // Get student initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Student Management
        </h1>
        <p className="text-muted-foreground">
          Track attendance and performance across all students
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name, roll number, or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStudents.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
            <TrendingUp className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredStudents.length > 0 
                ? (filteredStudents.reduce((sum, student) => sum + getAttendancePercentage(student), 0) / filteredStudents.length).toFixed(1)
                : 0
              }%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Test Score</CardTitle>
            <Award className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredStudents.length > 0
                ? (filteredStudents.reduce((sum, student) => sum + getAverageTestScore(student), 0) / filteredStudents.length).toFixed(1)
                : 0
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => {
          const attendancePercentage = getAttendancePercentage(student);
          const averageScore = getAverageTestScore(student);
          
          return (
            <Card key={student.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(student.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{student.name}</h3>
                    <p className="text-sm text-muted-foreground">{student.rollNo}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Student Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Class</p>
                    <p className="font-medium">{student.class}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Age</p>
                    <p className="font-medium">{student.age}</p>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">Attendance</span>
                      <Badge variant={attendancePercentage >= 80 ? "default" : attendancePercentage >= 60 ? "secondary" : "destructive"}>
                        {attendancePercentage.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          attendancePercentage >= 80 ? "bg-primary" : 
                          attendancePercentage >= 60 ? "bg-secondary" : "bg-destructive"
                        }`}
                        style={{ width: `${attendancePercentage}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">Test Average</span>
                      <Badge variant={averageScore >= 80 ? "default" : averageScore >= 60 ? "secondary" : "destructive"}>
                        {averageScore.toFixed(1)}
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          averageScore >= 80 ? "bg-primary" : 
                          averageScore >= 60 ? "bg-secondary" : "bg-destructive"
                        }`}
                        style={{ width: `${averageScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="pt-2">
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {student.attendance.length > 0 
                        ? `Last attended: ${new Date(student.attendance[student.attendance.length - 1].date).toLocaleDateString()}`
                        : "No attendance recorded"
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No students found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Students;