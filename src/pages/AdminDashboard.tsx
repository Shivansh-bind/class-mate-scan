import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Admin {
  id: string;
  user_id: string;
  name: string;
  email: string;
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

interface Student {
  id: string;
  user_id: string;
  name: string;
  email: string;
  class: string;
  section: string;
  role: string;
}

export default function AdminDashboard() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('admins');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [adminsRes, teachersRes, studentsRes] = await Promise.all([
        supabase.from('admins').select('*'),
        supabase.from('teachers').select('*'),
        supabase.from('students').select('*')
      ]);

      if (adminsRes.data) setAdmins(adminsRes.data);
      if (teachersRes.data) setTeachers(teachersRes.data);
      if (studentsRes.data) setStudents(studentsRes.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive"
      });
    }
  };

  const handleCreateRecord = async (type: 'admins' | 'teachers' | 'students', data: any) => {
    try {
      let error;
      if (type === 'admins') {
        const result = await supabase.from('admins').insert([data]);
        error = result.error;
      } else if (type === 'teachers') {
        const result = await supabase.from('teachers').insert([data]);
        error = result.error;
      } else {
        const result = await supabase.from('students').insert([data]);
        error = result.error;
      }
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "Record created successfully"
      });
      
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create record",
        variant: "destructive"
      });
    }
  };

  const handleUpdateRecord = async (type: 'admins' | 'teachers' | 'students', id: string, data: any) => {
    try {
      let error;
      if (type === 'admins') {
        const result = await supabase.from('admins').update(data).eq('id', id);
        error = result.error;
      } else if (type === 'teachers') {
        const result = await supabase.from('teachers').update(data).eq('id', id);
        error = result.error;
      } else {
        const result = await supabase.from('students').update(data).eq('id', id);
        error = result.error;
      }
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "Record updated successfully"
      });
      
      setIsDialogOpen(false);
      setEditingRecord(null);
      fetchData();
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to update record",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRecord = async (type: 'admins' | 'teachers' | 'students', id: string) => {
    try {
      let error;
      if (type === 'admins') {
        const result = await supabase.from('admins').delete().eq('id', id);
        error = result.error;
      } else if (type === 'teachers') {
        const result = await supabase.from('teachers').delete().eq('id', id);
        error = result.error;
      } else {
        const result = await supabase.from('students').delete().eq('id', id);
        error = result.error;
      }
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "Record deleted successfully"
      });
      
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete record",
        variant: "destructive"
      });
    }
  };

  const RecordForm = ({ type, record }: { type: 'admins' | 'teachers' | 'students'; record?: any }) => {
    const [formData, setFormData] = useState(
      record || { name: '', email: '', subject: '', class: '', section: '' }
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (record) {
        handleUpdateRecord(type, record.id, formData);
      } else {
        handleCreateRecord(type, formData);
      }
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
        {type === 'teachers' && (
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
          </div>
        )}
        {type === 'students' && (
          <>
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
          </>
        )}
        <Button type="submit" className="w-full">
          {record ? 'Update' : 'Create'}
        </Button>
      </form>
    );
  };

  const DataTable = ({ data, type }: { data: any[]; type: 'admins' | 'teachers' | 'students' }) => {
    const filteredData = data.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingRecord(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Add {type.slice(0, -1)}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingRecord ? 'Edit' : 'Add'} {type.slice(0, -1)}
                </DialogTitle>
              </DialogHeader>
              <RecordForm type={type} record={editingRecord} />
            </DialogContent>
          </Dialog>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              {type === 'teachers' && <TableHead>Subject</TableHead>}
              {type === 'students' && (
                <>
                  <TableHead>Class</TableHead>
                  <TableHead>Section</TableHead>
                </>
              )}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.name}</TableCell>
                <TableCell>{record.email}</TableCell>
                {type === 'teachers' && <TableCell>{record.subject}</TableCell>}
                {type === 'students' && (
                  <>
                    <TableCell>{record.class}</TableCell>
                    <TableCell>{record.section}</TableCell>
                  </>
                )}
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingRecord(record);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteRecord(type, record.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage all users in the system
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="admins">Admins</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        <TabsContent value="admins">
          <Card>
            <CardHeader>
              <CardTitle>Admin Records</CardTitle>
              <CardDescription>
                Manage administrator accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable data={admins} type="admins" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teachers">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Records</CardTitle>
              <CardDescription>
                Manage teacher accounts and subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable data={teachers} type="teachers" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Student Records</CardTitle>
              <CardDescription>
                Manage student accounts and class assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable data={students} type="students" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}