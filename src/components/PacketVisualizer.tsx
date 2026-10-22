import React, { useEffect, useState } from 'react';
import { Mail, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { DataPacket, NetworkDevice } from '../types/network';

interface PacketVisualizerProps {
  packet: DataPacket | null;
  devices: NetworkDevice[];
  onComplete?: () => void;
  speed?: number; // 1 = normal, 0.5 = slow motion
}

export const PacketVisualizer: React.FC<PacketVisualizerProps> = ({
  packet,
  devices,
  onComplete,
  speed = 1,
}) => {
  const [progress, setProgress] = useState(0); // 0 to 1 between current segment
  const [segmentIndex, setSegmentIndex] = useState(0);

  useEffect(() => {
    if (!packet || packet.route.length < 2) {
      setProgress(0);
      setSegmentIndex(0);
      return;
    }

    setProgress(0);
    setSegmentIndex(0);

    let currentSegment = 0;
    let localProgress = 0;
    const intervalMs = 20 / speed;
    const stepIncrement = 0.02;

    const timer = setInterval(() => {
      localProgress += stepIncrement;

      if (localProgress >= 1) {
        currentSegment += 1;
        localProgress = 0;

        if (currentSegment >= packet.route.length - 1) {
          clearInterval(timer);
          setProgress(1);
          setSegmentIndex(packet.route.length - 2);
          setTimeout(() => {
            onComplete?.();
          }, 300);
          return;
        }
      }

      setProgress(localProgress);
      setSegmentIndex(currentSegment);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [packet, speed]);

  if (!packet || packet.route.length < 2) return null;

  const currentDevId = packet.route[segmentIndex];
  const nextDevId = packet.route[segmentIndex + 1];

  const currentDev = devices.find((d) => d.id === currentDevId);
  const nextDev = devices.find((d) => d.id === nextDevId);

  if (!currentDev || !nextDev) return null;

  // Approximate centers of devices
  const x1 = currentDev.x + 104;
  const y1 = currentDev.y + 75;
  const x2 = nextDev.x + 104;
  const y2 = nextDev.y + 75;

  // Linear interpolation with a gentle curve
  const currentX = x1 + (x2 - x1) * progress;
  const currentY = y1 + (y2 - y1) * progress - Math.sin(progress * Math.PI) * 25;

  const isCollision = packet.status === 'collided';
  const isDelivered = packet.status === 'delivered';

  return (
    <div
      style={{
        transform: `translate3d(${currentX - 55}px, ${currentY - 26}px, 0)`,
      }}
      className="absolute pointer-events-none z-30 transition-transform duration-75"
    >
      {isCollision ? (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs shadow-xl ring-4 ring-rose-400/40 animate-ping">
          <AlertOctagon className="w-4 h-4 text-white" />
          <span>KOLIZE!</span>
        </div>
      ) : (
        <div
          className={`flex flex-col items-center p-2 rounded-xl border shadow-2xl backdrop-blur-md ${
            isDelivered
              ? 'bg-emerald-950/95 border-emerald-400 text-emerald-200'
              : 'bg-slate-900/95 border-sky-400 text-sky-200 ring-2 ring-sky-400/30'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {isDelivered ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Mail className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            )}
            <span className="truncate max-w-[120px]">{packet.label}</span>
          </div>

          <div className="flex items-center gap-1 text-[9px] font-mono text-slate-300 mt-0.5">
            <span className="text-sky-300">{packet.sourceIp}</span>
            <span className="text-slate-500">→</span>
            <span className="text-emerald-300">{packet.targetIp}</span>
          </div>
        </div>
      )}
    </div>
  );
};
