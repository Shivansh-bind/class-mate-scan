import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  created_at: string;
  updated_at: string;
}

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState('admins');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles((data || []) as Profile[]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch profiles",
        variant: "destructive",
      });
    }
  };

  const handleCreateRecord = async (data: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase.from('profiles').insert([data]);
      if (error) throw error;
      
      fetchData();
      toast({
        title: "Success",
        description: "User created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRecord = async (data: Profile) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          email: data.email,
          role: data.role
        })
        .eq('id', data.id);
      
      if (error) throw error;
      
      fetchData();
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      
      fetchData();
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  interface RecordFormProps {
    record?: Profile;
    onSubmit: (data: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) => void;
    onCancel: () => void;
  }

  const RecordForm = ({ record, onSubmit, onCancel }: RecordFormProps) => {
    const [formData, setFormData] = useState(() => {
      if (record) {
        return {
          user_id: record.user_id,
          full_name: record.full_name,
          email: record.email,
          role: record.role
        };
      }
      
      return {
        user_id: '',
        full_name: '',
        email: '',
        role: 'student' as const
      };
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            value={formData.role}
            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'teacher' | 'student' }))}
            className="w-full p-2 border rounded"
            required
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {!record && (
          <div>
            <Label htmlFor="user_id">User ID (from auth.users)</Label>
            <Input
              id="user_id"
              value={formData.user_id}
              onChange={(e) => setFormData(prev => ({ ...prev, user_id: e.target.value }))}
              placeholder="Enter user ID from authentication"
              required
            />
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {record ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    );
  };

  interface DataTableProps {
    data: Profile[];
    role: 'admin' | 'teacher' | 'student';
    searchTerm: string;
    onAdd: () => void;
    onEdit: (record: Profile) => void;
    onDelete: (id: string) => void;
  }

  const DataTable = ({ data, role, searchTerm, onAdd, onEdit, onDelete }: DataTableProps) => {
    const filteredData = data.filter(item => 
      item.role === role &&
      Object.values(item).some(value => 
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    const columns = ['full_name', 'email', 'role'];

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold capitalize">{role}s</h3>
          <Button onClick={onAdd}>
            Add {role}
          </Button>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(column => (
                  <TableHead key={column} className="capitalize">
                    {column.replace('_', ' ')}
                  </TableHead>
                ))}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id}>
                  {columns.map(column => (
                    <TableCell key={column}>
                      {item[column as keyof Profile]}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(item)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(item.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? 'Edit' : 'Add'} User
            </DialogTitle>
          </DialogHeader>
          <RecordForm
            record={editingRecord}
            onSubmit={(data) => {
              if (editingRecord) {
                handleUpdateRecord({ ...editingRecord, ...data });
              } else {
                handleCreateRecord(data);
              }
              setIsDialogOpen(false);
              setEditingRecord(null);
            }}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingRecord(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="admins">Admins</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>
        
        <TabsContent value="admins">
          <Card>
            <DataTable
              data={profiles}
              role="admin"
              searchTerm={searchTerm}
              onAdd={() => {
                setEditingRecord(null);
                setIsDialogOpen(true);
              }}
              onEdit={(record) => {
                setEditingRecord(record);
                setIsDialogOpen(true);
              }}
              onDelete={(id) => handleDeleteRecord(id)}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="teachers">
          <Card>
            <DataTable
              data={profiles}
              role="teacher"
              searchTerm={searchTerm}
              onAdd={() => {
                setEditingRecord(null);
                setIsDialogOpen(true);
              }}
              onEdit={(record) => {
                setEditingRecord(record);
                setIsDialogOpen(true);
              }}
              onDelete={(id) => handleDeleteRecord(id)}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="students">
          <Card>
            <DataTable
              data={profiles}
              role="student"
              searchTerm={searchTerm}
              onAdd={() => {
                setEditingRecord(null);
                setIsDialogOpen(true);
              }}
              onEdit={(record) => {
                setEditingRecord(record);
                setIsDialogOpen(true);
              }}
              onDelete={(id) => handleDeleteRecord(id)}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}