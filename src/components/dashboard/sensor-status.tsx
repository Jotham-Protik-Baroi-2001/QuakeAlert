"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const SENSOR_SENSITIVITY_MULTIPLIER = 10; 

// Type definition for LinearAccelerationSensor
interface Sensor extends EventTarget {
  start: () => void;
  stop: () => void;
  x: number | null;
  y: number | null;
  z: number | null;
}

declare global {
  interface Window {
    LinearAccelerationSensor?: {
      new (options?: any): Sensor;
    };
  }
}

// Inline SVG to replace the problematic lucide-react icon
const DatabaseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );

export default function SensorStatus() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [tremorLevel, setTremorLevel] = useState(0);
  const [isTremorDetected, setIsTremorDetected] = useState(false);
  const [sensorMode, setSensorMode] = useState<'simulated' | 'real' | 'unavailable'>('unavailable');
  const [sensorStatusMessage, setSensorStatusMessage] = useState('Checking for device sensors...');
  
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sensorRef = useRef<Sensor | null>(null);

  useEffect(() => {
    // This effect runs only on the client to determine sensor availability.
    if ('LinearAccelerationSensor' in window) {
      setSensorMode('real');
      setSensorStatusMessage('Device accelerometer is available.');
    } else {
      setSensorMode('unavailable');
      setSensorStatusMessage('Your device does not have the required motion sensors.');
    }
  }, []);

  const handleSensorReading = () => {
    if (!sensorRef.current) return;

    const { x, y, z } = sensorRef.current;
    const magnitude = Math.sqrt((x ?? 0) ** 2 + (y ?? 0) ** 2 + (z ?? 0) ** 2);
    
    const level = Math.min(100, magnitude * SENSOR_SENSITIVITY_MULTIPLIER);
    setTremorLevel(level);

    if (level > 75) { // Corresponds to a significant shake
      setIsTremorDetected(true);
    } else {
      setIsTremorDetected(false);
    }
  };

  const startSimulation = () => {
    if (sensorMode !== 'unavailable') {
        setSensorMode('simulated');
        setSensorStatusMessage('Simulating accelerometer data for tremor detection.');
    }
    simulationIntervalRef.current = setInterval(() => {
      const randomSpike = Math.random();
      let level = 0;
      let detected = false;
      if (randomSpike > 0.95) { // 5% chance of a significant tremor
        level = Math.random() * 50 + 50; // 50-100
        detected = true;
      } else if (randomSpike > 0.7) { // 25% chance of a minor tremor
        level = Math.random() * 40 + 10; // 10-50
      } else {
        level = Math.random() * 10; // 0-10
      }
      setTremorLevel(level);
      setIsTremorDetected(detected);
    }, 1000);
  };
  
  const startRealSensor = async () => {
    try {
        // @ts-ignore - name is a valid property
        const permissionStatus = await navigator.permissions.query({ name: 'accelerometer' });

        if (permissionStatus.state === 'denied') {
            setSensorStatusMessage('Permission to accelerometer denied. Falling back to simulation.');
            startSimulation();
            return;
        }

        const sensor = new window.LinearAccelerationSensor!({ frequency: 10 });
        sensor.addEventListener('reading', handleSensorReading);
        sensor.addEventListener('error', (event: any) => {
            if (event.error.name === 'NotReadableError') {
                setSensorStatusMessage('Sensor could not be read. Falling back to simulation.');
            } else {
                setSensorStatusMessage('A sensor error occurred. Falling back to simulation.');
            }
            // Stop the failing sensor and switch to simulation
            if (isMonitoring) {
              stopMonitoring();
              setIsMonitoring(true); // Keep monitoring state active
              startSimulation();
            }
        });
        sensor.start();
        sensorRef.current = sensor;
        setSensorMode('real');
        setSensorStatusMessage('Using real device accelerometer.');

    } catch (error) {
        setSensorStatusMessage('Failed to initialize sensor. Falling back to simulation.');
        startSimulation();
    }
  };

  const startMonitoring = () => {
    if (sensorMode === 'unavailable') return;
    setIsMonitoring(true);
    if (sensorMode === 'real') {
      startRealSensor();
    } else {
      startSimulation();
    }
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }

    if (sensorRef.current) {
      sensorRef.current.removeEventListener('reading', handleSensorReading);
      sensorRef.current.stop();
      sensorRef.current = null;
    }

    setTremorLevel(0);
    setIsTremorDetected(false);
    if (sensorMode === 'real') {
      setSensorStatusMessage('Device accelerometer is available.');
    } else if (sensorMode === 'simulated') {
      setSensorStatusMessage('Simulation stopped. Ready to use real sensor.');
      setSensorMode('real'); // Revert to real mode possibility
    }
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusText = () => {
    if (sensorMode === 'unavailable') return 'Unavailable';
    if (!isMonitoring) return 'Inactive';
    if (isTremorDetected) return 'Tremor Detected!';
    return 'Monitoring...';
  }

  return (
    <Card className={cn(sensorMode === 'unavailable' && 'opacity-60')}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-6 w-6" />
          Device Sensor
        </CardTitle>
        <CardDescription>
            {sensorStatusMessage}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full transition-colors ${isMonitoring ? (isTremorDetected ? 'bg-destructive animate-pulse' : 'bg-primary') : 'bg-muted-foreground'}`} />
            <div>
              <p className="font-semibold">{getStatusText()}</p>
              <p className="text-sm text-muted-foreground">Status</p>
            </div>
          </div>
           {isMonitoring && (
            <div className='flex items-center gap-2'>
              {isTremorDetected && <Zap className="h-6 w-6 text-destructive animate-ping" />}
              {sensorMode === 'simulated' && <DatabaseIcon className="h-5 w-5 text-muted-foreground" title="Simulated Data" />}
            </div>
           )}
        </div>
        
        <div className="space-y-2">
            <label className="text-sm font-medium">Tremor Intensity</label>
            <Progress value={tremorLevel} className={isTremorDetected ? '[&>div]:bg-destructive' : ''} />
        </div>

        <Button onClick={isMonitoring ? stopMonitoring : startMonitoring} className="w-full" disabled={sensorMode === 'unavailable'}>
          {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
            {sensorMode !== 'unavailable' 
              ? 'This feature uses your device motion sensors if available.'
              : ''
            }
        </p>
      </CardContent>
    </Card>
  );
}
