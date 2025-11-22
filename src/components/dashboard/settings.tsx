"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { SlidersHorizontal, Bell, Vibrate } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [sensitivity, setSensitivity] = useState(50);
  const { toast } = useToast();

  const handleSettingsChange = () => {
    toast({
      title: "Settings saved",
      description: "Your alert preferences have been updated.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SlidersHorizontal className="h-6 w-6" />
          Configuration
        </CardTitle>
        <CardDescription>Customize sensor sensitivity and alert notifications.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label htmlFor="sensitivity" className="font-medium">Detection Threshold</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="sensitivity"
              value={[sensitivity]}
              onValueChange={(value) => setSensitivity(value[0])}
              onValueCommit={handleSettingsChange}
              max={100}
              step={1}
            />
            <span className="font-mono text-lg w-12 text-center p-2 bg-muted rounded-md">{sensitivity}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Higher values make the sensor less sensitive to minor movements.
          </p>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="font-medium">Customizable Alerts</h4>
          <div className="flex items-center justify-between">
            <Label htmlFor="sound-alert" className="flex items-center gap-3 cursor-pointer">
                <Bell className="h-5 w-5" />
                <span>Sound Alert</span>
            </Label>
            <Switch id="sound-alert" onCheckedChange={handleSettingsChange} defaultChecked/>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="vibration-alert" className="flex items-center gap-3 cursor-pointer">
                <Vibrate className="h-5 w-5" />
                <span>Vibration Alert</span>
            </Label>
            <Switch id="vibration-alert" onCheckedChange={handleSettingsChange} defaultChecked/>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
