"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function SensorStatus() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [tremorLevel, setTremorLevel] = useState(0);
  const [isTremorDetected, setIsTremorDetected] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startMonitoring = () => {
    setIsMonitoring(true);
    intervalRef.current = setInterval(() => {
      const randomSpike = Math.random();
      if (randomSpike > 0.95) { // 5% chance of a significant tremor
        const level = Math.random() * 50 + 50; // 50-100
        setTremorLevel(level);
        setIsTremorDetected(true);
      } else if (randomSpike > 0.7) { // 25% chance of a minor tremor
        const level = Math.random() * 40 + 10; // 10-50
        setTremorLevel(level);
        setIsTremorDetected(false);
      } else {
        const level = Math.random() * 10; // 0-10
        setTremorLevel(level);
        setIsTremorDetected(false);
      }
    }, 1000);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTremorLevel(0);
    setIsTremorDetected(false);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-6 w-6" />
          Device Sensor
        </CardTitle>
        <CardDescription>Simulated accelerometer data for tremor detection.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full transition-colors ${isMonitoring ? (isTremorDetected ? 'bg-destructive animate-pulse' : 'bg-primary') : 'bg-muted-foreground'}`} />
            <div>
              <p className="font-semibold">
                {isMonitoring ? (isTremorDetected ? 'Tremor Detected!' : 'Monitoring...') : 'Inactive'}
              </p>
              <p className="text-sm text-muted-foreground">Status</p>
            </div>
          </div>
          {isMonitoring && isTremorDetected && <Zap className="h-6 w-6 text-destructive animate-ping" />}
        </div>
        
        <div className="space-y-2">
            <label className="text-sm font-medium">Tremor Intensity</label>
            <Progress value={tremorLevel} className={isTremorDetected ? '[&>div]:bg-destructive' : ''} />
        </div>

        <Button onClick={isMonitoring ? stopMonitoring : startMonitoring} className="w-full">
          {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
            This simulates integration with broader alert services.
        </p>
      </CardContent>
    </Card>
  );
}
