import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';

export default function StudentDashboard() {
  const { profile } = useAuth();

  // No need to fetch additional data - we already have it in profile

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Welcome, {profile?.full_name}</h2>
        <p className="text-muted-foreground">Student Dashboard</p>
      </div>

      {profile ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                <p className="mt-1">{profile.full_name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                <p className="mt-1">{profile.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                <p className="mt-1 capitalize">{profile.role}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">User ID</Label>
                <p className="mt-1 font-mono text-sm">{profile.user_id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading your information...</p>
        </div>
      )}
    </div>
  );
}