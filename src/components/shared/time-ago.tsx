"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

// Client-side component to prevent hydration mismatch for dates
export const TimeAgo = ({ time }: { time: number | null }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !time) {
    // Render a placeholder or nothing on the server and initial client render
    return <span />;
  }

  // Render the formatted time only on the client after mounting
  return <span>{formatDistanceToNow(new Date(time), { addSuffix: true })}</span>;
};
