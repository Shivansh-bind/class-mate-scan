import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, CheckCircle, XCircle, Camera, CameraOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import studentsData from "@/data/students.json";
import classesData from "@/data/classes.json";

const QRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [attendanceResult, setAttendanceResult] = useState<{
    success: boolean;
    message: string;
    studentName?: string;
    className?: string;
  } | null>(null);
  
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation(position),
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Unable to get your location. Attendance verification may not work properly.",
            variant: "destructive",
          });
        }
      );
    }

    return () => {
      stopScanning();
    };
  }, [toast]);

  const startScanning = async () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          setScanResult(decodedText);
          processAttendance(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          // Ignore continuous scanning errors
        }
      );

      setIsScanning(true);
    } catch (error) {
      console.error("Error starting QR scanner:", error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (error) {
        console.error("Error stopping scanner:", error);
      }
    }
    setIsScanning(false);
  };

  const processAttendance = (qrToken: string) => {
    // Mock student ID (in real app, this would come from authentication)
    const currentStudentId = "stu001";
    const student = studentsData.find(s => s.id === currentStudentId);
    
    if (!student) {
      setAttendanceResult({
        success: false,
        message: "Student not found"
      });
      return;
    }

    // Find the class session with this QR token
    let foundSession = null;
    let foundClass = null;

    for (const classItem of classesData) {
      const session = classItem.sessions.find(s => s.qrToken === qrToken);
      if (session) {
        foundSession = session;
        foundClass = classItem;
        break;
      }
    }

    if (!foundSession || !foundClass) {
      setAttendanceResult({
        success: false,
        message: "Invalid QR code or session not found"
      });
      return;
    }

    // Check if session is expired (more than 5 minutes old)
    const sessionTime = new Date(foundSession.timestamp);
    const now = new Date();
    const timeDiff = (now.getTime() - sessionTime.getTime()) / (1000 * 60); // minutes

    if (timeDiff > 5) {
      setAttendanceResult({
        success: false,
        message: "QR code has expired. Please ask instructor for a new code."
      });
      return;
    }

    // Check location if available
    if (location && foundClass.location) {
      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        foundClass.location.lat,
        foundClass.location.lng
      );

      if (distance > 0.1) { // 100 meters
        setAttendanceResult({
          success: false,
          message: `You must be within 100m of ${foundClass.location.name}. You are ${Math.round(distance * 1000)}m away.`
        });
        return;
      }
    }

    // Success! Mark attendance
    setAttendanceResult({
      success: true,
      message: "Attendance marked successfully!",
      studentName: student.name,
      className: foundClass.subject
    });

    toast({
      title: "Attendance Marked",
      description: `Successfully marked attendance for ${foundClass.subject}`,
    });
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          QR Code Scanner
        </h1>
        <p className="text-muted-foreground">
          Scan your class QR code to mark attendance
        </p>
      </div>

      {/* Location Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <MapPin className={`w-5 h-5 ${location ? "text-success" : "text-warning"}`} />
            <div>
              <p className="font-medium">Location Status</p>
              <p className="text-sm text-muted-foreground">
                {location 
                  ? `Location detected (±${Math.round(location.coords.accuracy)}m accuracy)`
                  : "Getting location..."
                }
              </p>
            </div>
            <Badge variant={location ? "default" : "secondary"}>
              {location ? "Ready" : "Pending"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* QR Scanner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="w-5 h-5" />
            <span>Camera Scanner</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div 
            id="qr-reader" 
            className={`w-full h-64 bg-muted rounded-lg ${isScanning ? "" : "flex items-center justify-center"}`}
          >
            {!isScanning && (
              <div className="text-center space-y-4">
                <CameraOff className="w-12 h-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">Camera not active</p>
              </div>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button 
              onClick={startScanning} 
              disabled={isScanning}
              className="flex-1"
            >
              <Camera className="w-4 h-4 mr-2" />
              {isScanning ? "Scanning..." : "Start Scanning"}
            </Button>
            
            {isScanning && (
              <Button 
                onClick={stopScanning}
                variant="outline"
              >
                <CameraOff className="w-4 h-4 mr-2" />
                Stop
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Result */}
      {attendanceResult && (
        <Card className={attendanceResult.success ? "border-success" : "border-destructive"}>
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              {attendanceResult.success ? (
                <CheckCircle className="w-6 h-6 text-success flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-2">
                <h3 className={`font-semibold ${attendanceResult.success ? "text-success" : "text-destructive"}`}>
                  {attendanceResult.success ? "Success!" : "Failed"}
                </h3>
                <p className="text-sm">{attendanceResult.message}</p>
                {attendanceResult.studentName && attendanceResult.className && (
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Student:</strong> {attendanceResult.studentName}</p>
                    <p><strong>Class:</strong> {attendanceResult.className}</p>
                    <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scan Result Debug */}
      {scanResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Scanned Data</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="text-xs bg-muted p-2 rounded block break-all">
              {scanResult}
            </code>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRScanner;