import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, MapPin, Clock, Users, QrCode, Play } from "lucide-react";
import QRDisplay from "@/components/QRDisplay";
import { useToast } from "@/hooks/use-toast";
import classesData from "@/data/classes.json";

const Classes = () => {
  const [activeSession, setActiveSession] = useState<{
    classId: string;
    sessionId: string;
    qrToken: string;
    startTime: Date;
  } | null>(null);
  const { toast } = useToast();

  const startNewSession = (classItem: typeof classesData[0]) => {
    const sessionId = `sess${Date.now()}`;
    const qrToken = Math.random().toString(36).substring(2, 15);
    const startTime = new Date();

    setActiveSession({
      classId: classItem.id,
      sessionId,
      qrToken,
      startTime
    });

    toast({
      title: "Session Started",
      description: `New attendance session started for ${classItem.subject}`,
    });
  };

  const endSession = () => {
    if (activeSession) {
      toast({
        title: "Session Ended", 
        description: "QR code has expired and attendance is closed",
      });
      setActiveSession(null);
    }
  };

  // Calculate class statistics
  const getClassStats = (classItem: typeof classesData[0]) => {
    const totalSessions = classItem.sessions.length;
    const totalAttendees = classItem.sessions.reduce((sum, session) => sum + (session.attendees?.length || 0), 0);
    const avgAttendance = totalSessions > 0 ? totalAttendees / totalSessions : 0;
    
    return {
      totalSessions,
      avgAttendance: Math.round(avgAttendance)
    };
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Class Management
        </h1>
        <p className="text-muted-foreground">
          Generate QR codes and track attendance for your classes
        </p>
      </div>

      {/* Active Session */}
      {activeSession && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-primary">
              <QrCode className="w-5 h-5" />
              <span>Active Session</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-6">
              <QRDisplay
                sessionId={activeSession.sessionId}
                qrToken={activeSession.qrToken}
                startTime={activeSession.startTime}
                duration={300}
                className={classesData.find(c => c.id === activeSession.classId)?.subject}
                onExpire={endSession}
              />
              
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {classesData.find(c => c.id === activeSession.classId)?.subject}
                  </h3>
                  <p className="text-muted-foreground">
                    Session ID: {activeSession.sessionId}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Started</p>
                    <p className="font-medium">{activeSession.startTime.toLocaleTimeString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
                
                <Button onClick={endSession} variant="outline" className="w-full lg:w-auto">
                  End Session
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Classes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {classesData.map((classItem) => {
          const stats = getClassStats(classItem);
          const isActiveClass = activeSession?.classId === classItem.id;
          
          return (
            <Card key={classItem.id} className={`hover:shadow-lg transition-shadow ${isActiveClass ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <span>{classItem.subject}</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{classItem.instructor}</p>
                  </div>
                  <Badge variant={isActiveClass ? "default" : "secondary"}>
                    {isActiveClass ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Class Details */}
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{classItem.room}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{classItem.schedule}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>Avg {stats.avgAttendance} students per session</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{stats.totalSessions}</div>
                    <div className="text-xs text-muted-foreground">Total Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">{classItem.tests?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Tests Conducted</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button 
                    onClick={() => startNewSession(classItem)}
                    disabled={!!activeSession}
                    className="flex-1"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isActiveClass ? "Session Active" : "Start Session"}
                  </Button>
                </div>

                {/* Recent Sessions */}
                {classItem.sessions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Recent Sessions</h4>
                    <div className="space-y-1">
                      {classItem.sessions.slice(-3).reverse().map((session, index) => (
                        <div key={session.sessionId} className="flex items-center justify-between text-xs bg-muted p-2 rounded">
                          <span>{session.sessionId}</span>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {session.attendees?.length || 0} attended
                            </Badge>
                            <span className="text-muted-foreground">
                              {new Date(session.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Active Session Message */}
      {!activeSession && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Session</h3>
              <p className="text-muted-foreground">
                Start a new session to generate QR codes for attendance
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Classes;