import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  startTime: Date;
  duration: number; // in seconds
  onExpire?: () => void;
}

const CountdownTimer = ({ startTime, duration, onExpire }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const start = startTime.getTime();
      const elapsed = (now - start) / 1000; // seconds elapsed
      const remaining = Math.max(0, duration - elapsed);
      
      setTimeLeft(remaining);
      
      if (remaining === 0 && !isExpired) {
        setIsExpired(true);
        onExpire?.();
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [startTime, duration, isExpired, onExpire]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((duration - timeLeft) / duration) * 100;
  };

  if (isExpired) {
    return (
      <Badge variant="destructive" className="flex items-center space-x-1">
        <Clock className="w-3 h-3" />
        <span>Expired</span>
      </Badge>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <Badge 
        variant={timeLeft < 30 ? "destructive" : timeLeft < 60 ? "secondary" : "default"}
        className="flex items-center space-x-1"
      >
        <Clock className="w-3 h-3" />
        <span>{formatTime(timeLeft)}</span>
      </Badge>
      
      <div className="flex-1 max-w-32">
        <div className="w-full bg-muted rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full transition-all duration-1000 ${
              timeLeft < 30 ? "bg-destructive" : 
              timeLeft < 60 ? "bg-warning" : "bg-primary"
            }`}
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;