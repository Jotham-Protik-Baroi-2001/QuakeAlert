"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Activity, Server } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const SENSOR_THRESHOLD = 5; // m/s^2, a significant shake
const SENSOR_SENSITIVITY_MULTIPLIER = 10; 

// Type definition for LinearAccelerationSensor
interface Sensor {
  start: () => void;
  stop: () => void;
  addEventListener: (event: 'reading' | 'error', listener: () => void) => void;
  removeEventListener: (event: 'reading' | 'error', listener: () => void) => void;
  x: number | null;
  y: number | null;
  z: number | null;
}

declare global {
  interface Window {
    LinearAccelerationSensor?: {
      new (options: any): Sensor;
    };
  }
}

export default function SensorStatus() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [tremorLevel, setTremorLevel] = useState(0);
  const [isTremorDetected, setIsTremorDetected] = useState(false);
  const [sensorMode, setSensorMode] = useState<'simulated' | 'real'>('simulated');
  const [isSensorAvailable, setIsSensorAvailable] = useState(false);
  
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sensorRef = useRef<Sensor | null>(null);

  useEffect(() => {
    // Check for sensor availability on the client
    if ('LinearAccelerationSensor' in window) {
      setIsSensorAvailable(true);
    }
  }, []);

  const handleSensorReading = () => {
    if (!sensorRef.current) return;

    const { x, y, z } = sensorRef.current;
    const magnitude = Math.sqrt((x ?? 0) ** 2 + (y ?? 0) ** 2 + (z ?? 0) ** 2);
    
    const level = Math.min(100, magnitude * SENSOR_SENSITIVITY_MULTIPLIER);
    setTremorLevel(level);

    if (level > 75) {
      setIsTremorDetected(true);
    } else {
      setIsTremorDetected(false);
    }
  };

  const startSimulation = () => {
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
      if (!('permissions' in navigator)) {
        throw new Error('Permissions API not supported');
      }
      // @ts-ignore - name is a valid property for permissions.query
      const permissionStatus = await navigator.permissions.query({ name: 'accelerometer' });

      if (permissionStatus.state === 'granted') {
        const sensor = new window.LinearAccelerationSensor!({ frequency: 60 });
        sensor.addEventListener('reading', handleSensorReading);
        sensor.addEventListener('error', () => {
          console.error('Sensor error. Falling back to simulation.');
          setSensorMode('simulated');
          startSimulation();
        });
        sensor.start();
        sensorRef.current = sensor;
        setSensorMode('real');
      } else {
        console.warn('Sensor permission not granted. Using simulation.');
        setSensorMode('simulated');
        startSimulation();
      }
    } catch (error) {
      console.error('Failed to initialize sensor, falling back to simulation:', error);
      setSensorMode('simulated');
      startSimulation();
    }
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    if (isSensorAvailable) {
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
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopMonitoring();
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-6 w-6" />
          Device Sensor
        </CardTitle>
        <CardDescription>
          {isSensorAvailable 
            ? 'Using real device accelerometer data for tremor detection.'
            : 'Simulating accelerometer data for tremor detection.'
          }
        </CardDescription>
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
           {isMonitoring && (
            <div className='flex items-center gap-2'>
              {isTremorDetected && <Zap className="h-6 w-6 text-destructive animate-ping" />}
              {sensorMode === 'simulated' && <Server className="h-5 w-5 text-muted-foreground" title="Simulated Data" />}
            </div>
           )}
        </div>
        
        <div className="space-y-2">
            <label className="text-sm font-medium">Tremor Intensity</label>
            <Progress value={tremorLevel} className={isTremorDetected ? '[&>div]:bg-destructive' : ''} />
        </div>

        <Button onClick={isMonitoring ? stopMonitoring : startMonitoring} className="w-full">
          {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
            {isSensorAvailable 
              ? 'This uses your device motion sensors. No data is stored.'
              : 'This simulates integration with broader alert services.'
            }
        </p>
      </CardContent>
    </Card>
  );
}
