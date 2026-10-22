import React from 'react';
import { CableConnection, NetworkDevice } from '../types/network';

interface DraggingCable {
  fromDeviceId: string;
  fromPortId: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  medium: 'cable' | 'wifi';
  targetPort: { deviceId: string; portId: string; x: number; y: number } | null;
}

interface GuideHint {
  fromDeviceId: string;
  toDeviceId: string;
  label: string;
}

interface CableLayerProps {
  connections: CableConnection[];
  devices: NetworkDevice[];
  draggingCable: DraggingCable | null;
  onDisconnectCable?: (cableId: string) => void;
  selectedCableId?: string | null;
  guideHints?: GuideHint[];
  isProjectorMode?: boolean;
}

export const CableLayer: React.FC<CableLayerProps> = ({
  connections,
  devices,
  draggingCable,
  onDisconnectCable,
  selectedCableId,
  guideHints = [],
  isProjectorMode = false,
}) => {
  // Helper to find exact screen position of a port on a device
  const getPortCoordinates = (deviceId: string, portId?: string) => {
    const dev = devices.find((d) => d.id === deviceId);
    if (!dev) return null;

    const width = 224; // w-56 is 14rem = 224px
    const height = 150;

    let px = dev.x + width / 2;
    let py = dev.y + height / 2;

    if (portId) {
      const portIndex = dev.ports.findIndex((p) => p.id === portId);
      const totalPorts = dev.ports.length || 1;
      const port = dev.ports[portIndex];

      if (port) {
        if (port.position === 'top') {
          px = dev.x + ((portIndex + 1) / (totalPorts + 1)) * width;
          py = dev.y;
        } else if (port.position === 'bottom') {
          px = dev.x + ((portIndex + 1) / (totalPorts + 1)) * width;
          py = dev.y + height;
        } else if (port.position === 'left') {
          px = dev.x;
          py = dev.y + height / 2;
        } else if (port.position === 'right') {
          px = dev.x + width;
          py = dev.y + height / 2;
        }
      }
    }

    return { x: px, y: py };
  };

  const calculateBezierPath = (
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) => {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const dist = Math.sqrt(dx * dx + dy * dy);
    const curveOffset = Math.min(dist * 0.35, 120);

    const cx1 = x1 < x2 ? x1 + curveOffset : x1 - curveOffset;
    const cy1 = y1 + (y2 > y1 ? 30 : -30);
    const cx2 = x2 > x1 ? x2 - curveOffset : x2 + curveOffset;
    const cy2 = y2 + (y1 > y2 ? 30 : -30);

    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  };

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
      <defs>
        <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#38bdf8" floodOpacity="0.6" />
        </filter>
        <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#c084fc" floodOpacity="0.7" />
        </filter>
        <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#34d399" floodOpacity="0.8" />
        </filter>
      </defs>

      {/* Render Didactic Guide Hints (Green dashed guide wires) */}
      {guideHints.map((hint, idx) => {
        const fromCoord = getPortCoordinates(hint.fromDeviceId);
        const toCoord = getPortCoordinates(hint.toDeviceId);
        if (!fromCoord || !toCoord) return null;

        // Only show if not already connected
        const isAlreadyConnected = connections.some(
          (c) =>
            (c.fromDeviceId === hint.fromDeviceId && c.toDeviceId === hint.toDeviceId) ||
            (c.fromDeviceId === hint.toDeviceId && c.toDeviceId === hint.fromDeviceId)
        );
        if (isAlreadyConnected) return null;

        const path = calculateBezierPath(fromCoord.x, fromCoord.y, toCoord.x, toCoord.y);

        return (
          <g key={`guide-${idx}`}>
            <path
              d={path}
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeDasharray="6 6"
              filter="url(#glow-emerald)"
              className="opacity-75 animate-pulse"
            />
          </g>
        );
      })}

      {/* Render Existing Connections */}
      {connections.map((conn) => {
        const fromCoord = getPortCoordinates(conn.fromDeviceId, conn.fromPortId);
        const toCoord = getPortCoordinates(conn.toDeviceId, conn.toPortId);

        if (!fromCoord || !toCoord) return null;

        const pathData = calculateBezierPath(
          fromCoord.x,
          fromCoord.y,
          toCoord.x,
          toCoord.y
        );

        const isWifi = conn.medium === 'wifi';
        const isBroken = conn.status === 'broken';
        const isSelected = selectedCableId === conn.id;

        const midX = (fromCoord.x + toCoord.x) / 2;
        const midY = (fromCoord.y + toCoord.y) / 2;

        return (
          <g key={conn.id} className="group">
            {/* Background hit area for easy clicking */}
            <path
              d={pathData}
              fill="none"
              stroke="transparent"
              strokeWidth="28"
              className="pointer-events-auto cursor-pointer"
              onClick={() => onDisconnectCable?.(conn.id)}
            />

            {/* Cable Outer Aura */}
            <path
              d={pathData}
              fill="none"
              stroke={
                isBroken
                  ? '#ef4444'
                  : isWifi
                  ? 'rgba(192, 132, 252, 0.45)'
                  : 'rgba(56, 189, 248, 0.4)'
              }
              strokeWidth={isWifi ? 6 : 7}
              strokeDasharray={isWifi ? '6 8' : undefined}
              filter={isWifi ? 'url(#glow-purple)' : 'url(#glow-cyan)'}
              className={isWifi ? 'animate-pulse' : ''}
            />

            {/* Main Core Wire */}
            <path
              d={pathData}
              fill="none"
              stroke={
                isBroken
                  ? '#dc2626'
                  : isWifi
                  ? isProjectorMode ? '#7e22ce' : '#a855f7'
                  : isSelected
                  ? '#f59e0b'
                  : isProjectorMode ? '#0284c7' : '#38bdf8'
              }
              strokeWidth={isWifi ? (isProjectorMode ? 4 : 3.5) : (isProjectorMode ? 4.5 : 4)}
              strokeDasharray={isBroken ? '8 6' : isWifi ? '5 7' : undefined}
              strokeLinecap="round"
            />

            {/* Connector Pins */}
            <circle
              cx={fromCoord.x}
              cy={fromCoord.y}
              r={isWifi ? 5 : 4.5}
              fill={isWifi ? '#c084fc' : '#38bdf8'}
              stroke="#0f172a"
              strokeWidth="1.5"
            />
            <circle
              cx={toCoord.x}
              cy={toCoord.y}
              r={isWifi ? 5 : 4.5}
              fill={isWifi ? '#c084fc' : '#38bdf8'}
              stroke="#0f172a"
              strokeWidth="1.5"
            />

            {/* Disconnect indicator on hover */}
            {onDisconnectCable && (
              <g
                transform={`translate(${midX}, ${midY})`}
                className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto cursor-pointer"
                onClick={() => onDisconnectCable(conn.id)}
              >
                <circle r="13" fill="#0f172a" stroke="#f43f5e" strokeWidth="1.5" />
                <line x1="-4" y1="-4" x2="4" y2="4" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
                <line x1="4" y1="-4" x2="-4" y2="4" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
              </g>
            )}
          </g>
        );
      })}

      {/* Render Cable Currently Being Dragged */}
      {draggingCable && (
        <g>
          {(() => {
            const targetX = draggingCable.targetPort
              ? draggingCable.targetPort.x
              : draggingCable.currentX;
            const targetY = draggingCable.targetPort
              ? draggingCable.targetPort.y
              : draggingCable.currentY;

            const dragPath = calculateBezierPath(
              draggingCable.startX,
              draggingCable.startY,
              targetX,
              targetY
            );

            const hasSnap = !!draggingCable.targetPort;
            const isWifi = draggingCable.medium === 'wifi';

            return (
              <>
                {hasSnap && (
                  <circle
                    cx={targetX}
                    cy={targetY}
                    r="20"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    className="animate-spin"
                  />
                )}

                <path
                  d={dragPath}
                  fill="none"
                  stroke={
                    hasSnap
                      ? '#34d399'
                      : isWifi
                      ? '#c084fc'
                      : '#38bdf8'
                  }
                  strokeWidth="4"
                  strokeDasharray={isWifi ? '6 6' : undefined}
                  strokeLinecap="round"
                />

                <circle
                  cx={targetX}
                  cy={targetY}
                  r="6"
                  fill={hasSnap ? '#10b981' : '#38bdf8'}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </>
            );
          })()}
        </g>
      )}
    </svg>
  );
};
