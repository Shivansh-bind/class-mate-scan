import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Edit } from 'lucide-react';
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
}

interface Teacher {
  id: string;
  user_id: string;
  name: string;
  email: string;
  subject: string;
  role: string;
}

export default function TeacherDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch teacher's own data
      if (user) {
        const { data: teacherData } = await supabase
          .from('teachers')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (teacherData) setTeacher(teacherData);
      }

      // Fetch all students
      const { data: studentsData, error } = await supabase
        .from('students')
        .select('*');

      if (error) throw error;
      if (studentsData) setStudents(studentsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive"
      });
    }
  };

  const handleUpdateStudent = async (studentId: string, data: Partial<Student>) => {
    try {
      const { error } = await supabase
        .from('students')
        .update(data)
        .eq('id', studentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student information updated successfully"
      });

      setIsDialogOpen(false);
      setEditingStudent(null);
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update student information",
        variant: "destructive"
      });
    }
  };

  const StudentForm = ({ student }: { student: Student }) => {
    const [formData, setFormData] = useState({
      name: student.name,
      email: student.email,
      class: student.class,
      section: student.section
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleUpdateStudent(student.id, formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="class">Class</Label>
          <Input
            id="class"
            value={formData.class}
            onChange={(e) => setFormData({ ...formData, class: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="section">Section</Label>
          <Input
            id="section"
            value={formData.section}
            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Update Student
        </Button>
      </form>
    );
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.section.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        {teacher && (
          <p className="text-muted-foreground">
            Welcome, {teacher.name} - Subject: {teacher.subject}
          </p>
        )}
      </div>

      <div className="grid gap-6">
        {/* Teacher Profile Card */}
        {teacher && (
          <Card>
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
              <CardDescription>Your teacher information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-muted-foreground">{teacher.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{teacher.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Subject</Label>
                  <p className="text-sm text-muted-foreground">{teacher.subject}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <p className="text-sm text-muted-foreground">{teacher.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Students Management Card */}
        <Card>
          <CardHeader>
            <CardTitle>Students Management</CardTitle>
            <CardDescription>
              View and update student information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.class}</TableCell>
                      <TableCell>{student.section}</TableCell>
                      <TableCell>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingStudent(student)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Student Information</DialogTitle>
                            </DialogHeader>
                            {editingStudent && (
                              <StudentForm student={editingStudent} />
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}