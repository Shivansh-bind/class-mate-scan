import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Search, Award, Calendar, Users, TrendingUp } from "lucide-react";
import testsData from "@/data/tests.json";
import studentsData from "@/data/students.json";
import classesData from "@/data/classes.json";

const Tests = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  // Filter tests based on search
  const filteredTests = testsData.filter(test =>
    test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.classId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get test statistics
  const getTestStats = (test: typeof testsData[0]) => {
    const scores = test.results.map(r => r.score);
    const average = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
    const highest = scores.length > 0 ? Math.max(...scores) : 0;
    const lowest = scores.length > 0 ? Math.min(...scores) : 0;
    const passRate = scores.filter(score => (score / test.maxScore) * 100 >= 60).length / scores.length * 100;
    
    return { average, highest, lowest, passRate: passRate || 0, totalSubmissions: scores.length };
  };

  // Get student name from ID
  const getStudentName = (studentId: string) => {
    const student = studentsData.find(s => s.id === studentId);
    return student ? student.name : "Unknown Student";
  };

  // Get class name from ID
  const getClassName = (classId: string) => {
    const classItem = classesData.find(c => c.id === classId);
    return classItem ? classItem.subject : "Unknown Class";
  };

  const selectedTestData = selectedTest ? testsData.find(t => t.id === selectedTest) : null;

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Test Management
        </h1>
        <p className="text-muted-foreground">
          Track test results and student performance analytics
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by test title, subject, or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTests.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredTests.length > 0
                ? (filteredTests.reduce((sum, test) => {
                    const stats = getTestStats(test);
                    return sum + (stats.average / test.maxScore) * 100;
                  }, 0) / filteredTests.length).toFixed(1)
                : 0
              }%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredTests.reduce((sum, test) => sum + test.results.length, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <Award className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredTests.length > 0
                ? (filteredTests.reduce((sum, test) => {
                    const stats = getTestStats(test);
                    return sum + stats.passRate;
                  }, 0) / filteredTests.length).toFixed(1)
                : 0
              }%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tests List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">All Tests</h2>
          
          {filteredTests.map((test) => {
            const stats = getTestStats(test);
            const isSelected = selectedTest === test.id;
            
            return (
              <Card 
                key={test.id} 
                className={`cursor-pointer hover:shadow-lg transition-all ${
                  isSelected ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedTest(isSelected ? null : test.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{test.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{getClassName(test.classId)}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant={
                        test.type === 'midterm' ? 'default' : 
                        test.type === 'quiz' ? 'secondary' : 'outline'
                      }>
                        {test.type}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {new Date(test.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-primary">
                        {(stats.average / test.maxScore * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Average</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-secondary">
                        {stats.totalSubmissions}
                      </div>
                      <div className="text-xs text-muted-foreground">Submissions</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-accent">
                        {stats.passRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Pass Rate</div>
                    </div>
                  </div>

                  {/* Score Distribution Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Score Distribution</span>
                      <span>{stats.lowest} - {stats.highest} / {test.maxScore}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="h-2 bg-gradient-to-r from-destructive via-warning to-primary rounded-full"
                        style={{ width: `${(stats.average / test.maxScore) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredTests.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <ClipboardCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tests found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Test Details */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Test Details</h2>
          
          {selectedTestData ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ClipboardCheck className="w-5 h-5" />
                  <span>{selectedTestData.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Test Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subject:</span>
                    <span className="font-medium">{selectedTestData.subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Class:</span>
                    <span className="font-medium">{getClassName(selectedTestData.classId)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{new Date(selectedTestData.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Score:</span>
                    <span className="font-medium">{selectedTestData.maxScore}</span>
                  </div>
                </div>

                {/* Individual Results */}
                <div className="space-y-2">
                  <h4 className="font-medium">Student Results</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedTestData.results.map((result) => {
                      const percentage = (result.score / selectedTestData.maxScore) * 100;
                      
                      return (
                        <div key={result.studentId} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div>
                            <p className="font-medium text-sm">{getStudentName(result.studentId)}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(result.submittedAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={
                              percentage >= 80 ? "default" : 
                              percentage >= 60 ? "secondary" : "destructive"
                            }>
                              {result.score}/{selectedTestData.maxScore}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {percentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a Test</h3>
                  <p className="text-muted-foreground">
                    Click on a test to view detailed results
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tests;