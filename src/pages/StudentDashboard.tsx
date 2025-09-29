import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Student {
  id: string;
  user_id: string;
  name: string;
  email: string;
  class: string;
  section: string;
  role: string;
  created_at: string;
}

export default function StudentDashboard() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchStudentData();
  }, [user]);

  const fetchStudentData = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If no student record exists, show a message
        if (error.code === 'PGRST116') {
          toast({
            title: "Notice",
            description: "Your student profile hasn't been created yet. Please contact an administrator.",
            variant: "default"
          });
        } else {
          throw error;
        }
      } else {
        setStudent(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch your student information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your personal dashboard
        </p>
      </div>

      {student ? (
        <div className="grid gap-6">
          {/* Personal Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your student profile details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Full Name
                  </Label>
                  <p className="text-lg font-medium">{student.name}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Email Address
                  </Label>
                  <p className="text-lg font-medium">{student.email}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Class
                  </Label>
                  <p className="text-lg font-medium">{student.class}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Section
                  </Label>
                  <p className="text-lg font-medium">{student.section}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Role
                  </Label>
                  <p className="text-lg font-medium capitalize">{student.role}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Enrolled Since
                  </Label>
                  <p className="text-lg font-medium">
                    {new Date(student.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
              <CardDescription>Your class and academic details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <h3 className="text-2xl font-bold text-primary">{student.class}</h3>
                  <p className="text-sm text-muted-foreground">Current Class</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <h3 className="text-2xl font-bold text-primary">{student.section}</h3>
                  <p className="text-sm text-muted-foreground">Section</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <h3 className="text-2xl font-bold text-primary">Active</h3>
                  <p className="text-sm text-muted-foreground">Status</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Access</CardTitle>
              <CardDescription>Commonly used features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <h4 className="font-medium">My Attendance</h4>
                  <p className="text-sm text-muted-foreground">View attendance record</p>
                </div>
                
                <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <h4 className="font-medium">Class Schedule</h4>
                  <p className="text-sm text-muted-foreground">Check timetable</p>
                </div>
                
                <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <h4 className="font-medium">Assignments</h4>
                  <p className="text-sm text-muted-foreground">View pending work</p>
                </div>
                
                <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <h4 className="font-medium">Grades</h4>
                  <p className="text-sm text-muted-foreground">Check results</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>
              Your student profile hasn't been set up yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              It looks like your student profile hasn't been created yet. 
              Please contact your administrator or teacher to set up your account.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}