"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { SlidersHorizontal, Bell, Vibrate, Rss } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { earthquakeFeedSources } from '@/app/page';

interface SettingsProps {
  currentFeedUrl: string;
  onFeedSourceChange: (newUrl: string) => void;
}

export default function Settings({ currentFeedUrl, onFeedSourceChange }: SettingsProps) {
  const [sensitivity, setSensitivity] = useState(50);
  const { toast } = useToast();

  const handleSettingsChange = () => {
    toast({
      title: "Settings saved",
      description: "Your alert preferences have been updated.",
    });
  };

  const handleFeedChange = (newUrl: string) => {
    onFeedSourceChange(newUrl);
    toast({
        title: "Feed source updated",
        description: "The earthquake feed has been updated to the new source."
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SlidersHorizontal className="h-6 w-6" />
          Configuration
        </CardTitle>
        <CardDescription>Customize sensors, data sources, and alert notifications.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label htmlFor="feed-source" className="font-medium flex items-center gap-2">
            <Rss className="h-5 w-5" />
            Data Feed Source
          </Label>
          <Select value={currentFeedUrl} onValueChange={handleFeedChange}>
            <SelectTrigger id="feed-source">
              <SelectValue placeholder="Select a feed source" />
            </SelectTrigger>
            <SelectContent>
              {earthquakeFeedSources.map(source => (
                <SelectItem key={source.id} value={source.url}>
                  {source.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />
      
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
