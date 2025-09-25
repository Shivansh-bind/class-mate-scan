import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CountdownTimer from "./CountdownTimer";
import { QrCode, Users } from "lucide-react";

interface QRDisplayProps {
  sessionId: string;
  qrToken: string;
  startTime: Date;
  duration?: number;
  attendees?: string[];
  className?: string;
  onExpire?: () => void;
}

const QRDisplay = ({ 
  sessionId, 
  qrToken, 
  startTime, 
  duration = 300, // 5 minutes default
  attendees = [],
  className,
  onExpire 
}: QRDisplayProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const qrData = JSON.stringify({
          sessionId,
          token: qrToken,
          timestamp: startTime.toISOString(),
          class: className
        });
        
        const url = await QRCode.toDataURL(qrData, {
          width: 200,
          margin: 2,
          color: {
            dark: '#1e3a8a', // primary color
            light: '#ffffff'
          }
        });
        
        setQrCodeUrl(url);
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    };

    generateQRCode();
  }, [sessionId, qrToken, startTime, className]);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center space-y-3">
        <CardTitle className="flex items-center justify-center space-x-2">
          <QrCode className="w-5 h-5" />
          <span>Attendance QR</span>
        </CardTitle>
        
        <CountdownTimer 
          startTime={startTime}
          duration={duration}
          onExpire={onExpire}
        />
      </CardHeader>
      
      <CardContent className="space-y-4">
        {qrCodeUrl && (
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-lg shadow-inner">
              <img 
                src={qrCodeUrl} 
                alt="Attendance QR Code"
                className="w-48 h-48"
              />
            </div>
          </div>
        )}
        
        <div className="text-center space-y-2">
          <Badge variant="outline" className="text-xs">
            Session: {sessionId}
          </Badge>
          
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{attendees.length} scanned</span>
          </div>
        </div>
        
        <div className="text-xs text-center text-muted-foreground">
          Students must be within 100m of classroom to scan
        </div>
      </CardContent>
    </Card>
  );
};

export default QRDisplay;