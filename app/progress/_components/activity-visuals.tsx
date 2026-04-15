"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import ActivityCharts from "./activity-charts";

const ActivityMap = dynamic(() => import("./activity-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#1a1a1a] text-xs text-[#6d6d6d]">
      Loading map...
    </div>
  ),
});

interface ActivityVisualsProps {
  streams: {
    type: string;
    data: any;
  }[];
}

export default function ActivityVisuals({ streams }: ActivityVisualsProps) {
  const [cursorIndex, setCursorIndex] = useState<number | null>(null);

  const latlngStream = streams.find((s) => s.type === "latlng")?.data as [number, number][] | undefined;
  const altitudeStream = streams.find((s) => s.type === "altitude")?.data as number[] | undefined;
  const velocityStream = streams.find((s) => s.type === "velocity_smooth")?.data as number[] | undefined;
  const distanceStream = streams.find((s) => s.type === "distance")?.data as number[] | undefined;
  const hrStream = streams.find((s) => s.type === "heartrate")?.data as number[] | undefined;

  const elevationData = useMemo(() => {
    if (!altitudeStream || !distanceStream) return [];
    const step = Math.max(1, Math.floor(altitudeStream.length / 300));
    return altitudeStream
      .map((alt, i) => ({
        value: alt,
        distance: distanceStream[i] || 0,
        index: i,
      }))
      .filter((_, i) => i % step === 0);
  }, [altitudeStream, distanceStream]);

  const hrData = useMemo(() => {
    if (!hrStream || !distanceStream) return [];
    const step = Math.max(1, Math.floor(hrStream.length / 300));
    return hrStream
      .map((hr, i) => ({
        value: hr,
        distance: distanceStream[i] || 0,
        index: i,
      }))
      .filter((_, i) => i % step === 0);
  }, [hrStream, distanceStream]);

  if (!latlngStream && elevationData.length === 0 && hrData.length === 0) {
    return (
      <div className="flex h-32 w-full items-center justify-center bg-[#1a1a1a] p-4 text-xs text-[#6d6d6d] rounded-lg">
        Performance data not available for this activity.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {latlngStream && (
        <div className="h-[300px] w-full sm:h-[400px] overflow-hidden rounded-lg">
          <ActivityMap
            latlngs={latlngStream}
            velocities={velocityStream}
            cursorIndex={cursorIndex}
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {elevationData.length > 0 && (
          <div className="overflow-hidden rounded-lg bg-[#1a1a1a]">
            <div className="border-b border-[#2a2a2a] px-4 py-2">
              <h3 className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-[#ff906d]">
                Elevation Profile
              </h3>
            </div>
            <ActivityCharts 
              data={elevationData} 
              dataKey="elevation"
              stroke="#ff906d"
              fill="#ff906d"
              label="Elevation"
              unit="m"
              onCursorMove={setCursorIndex} 
            />
          </div>
        )}

        {hrData.length > 0 && (
          <div className="overflow-hidden rounded-lg bg-[#1a1a1a]">
            <div className="border-b border-[#2a2a2a] px-4 py-2">
              <h3 className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-[#ff4d4d]">
                Heart Rate
              </h3>
            </div>
            <ActivityCharts 
              data={hrData} 
              dataKey="heartrate"
              stroke="#ff4d4d"
              fill="#ff4d4d"
              label="Heart Rate"
              unit=" bpm"
              onCursorMove={setCursorIndex} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
