import React, { useState } from 'react';
import {
  Wifi,
  Laptop,
  Smartphone,
  Tv,
  Server,
  Globe,
  Radio,
  Monitor,
  HardDrive,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Settings2,
  GripHorizontal,
  Link,
  Info,
  Lightbulb,
} from 'lucide-react';
import { NetworkDevice, NetworkPort, PortType } from '../types/network';
import { DeviceDidacticHelp } from '../utils/didacticTooltips';

interface DeviceNodeProps {
  device: NetworkDevice;
  isSelected?: boolean;
  isConnectionSource?: boolean;
  isValidConnectionTarget?: boolean;
  onSelect?: () => void;
  onStartConnection?: () => void;
  onTargetClick?: () => void;
  onHeaderMouseDown?: (e: React.MouseEvent) => void;
  onPortMouseDown?: (port: NetworkPort, event: React.MouseEvent) => void;
  onPortClick?: (port: NetworkPort) => void;
  onPortHover?: (port: NetworkPort | null) => void;
  onConfigureClick?: () => void;
  highlightPortId?: string | null;
  // Contextual Tooltip props
  contextHelp?: DeviceDidacticHelp;
  showTooltips?: boolean;
  isProjectorMode?: boolean;
}

export const DeviceNode: React.FC<DeviceNodeProps> = ({
  device,
  isSelected,
  isConnectionSource,
  isValidConnectionTarget,
  onSelect,
  onStartConnection,
  onTargetClick,
  onHeaderMouseDown,
  onPortMouseDown,
  onPortClick,
  onPortHover,
  onConfigureClick,
  highlightPortId,
  contextHelp,
  showTooltips = false,
  isProjectorMode = false,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const getDeviceIcon = () => {
    switch (device.type) {
      case 'router':
        return <Radio className="w-6 h-6 text-sky-500" />;
      case 'switch':
        return <HardDrive className="w-6 h-6 text-indigo-500" />;
      case 'pc-teacher':
        return <Monitor className="w-6 h-6 text-amber-500" />;
      case 'pc-student':
        return <Monitor className="w-6 h-6 text-emerald-500" />;
      case 'laptop':
        return <Laptop className="w-6 h-6 text-cyan-500" />;
      case 'phone':
        return <Smartphone className="w-6 h-6 text-pink-500" />;
      case 'smart-tv':
        return <Tv className="w-6 h-6 text-purple-500" />;
      case 'server':
        return <Server className="w-6 h-6 text-emerald-500" />;
      default:
        return <Monitor className="w-6 h-6 text-slate-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (device.status) {
      case 'ip-conflict':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded shadow-sm animate-pulse">
            <AlertTriangle className="w-3 h-3 text-rose-600" /> Kolize IP!
          </span>
        );
      case 'wrong-subnet':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded shadow-sm">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> Cizí síť
          </span>
        );
      case 'requesting-dhcp':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded shadow-sm animate-bounce">
            <HelpCircle className="w-3 h-3 text-amber-600" /> Žádá o IP
          </span>
        );
      case 'unconnected':
        return (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
            isProjectorMode
              ? 'text-slate-600 bg-slate-100 border-slate-300'
              : 'text-slate-400 bg-slate-900 border-slate-700'
          }`}>
            Nezapojeno
          </span>
        );
      case 'ok':
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Zapojeno
          </span>
        );
    }
  };

  const getPortIcon = (type: PortType) => {
    switch (type) {
      case 'wifi':
        return <Wifi className="w-3 h-3 text-purple-500" />;
      case 'wan':
        return <Globe className="w-3 h-3 text-amber-500" />;
      case 'ethernet':
      default:
        return <div className="w-2.5 h-2.5 rounded-[2px] bg-sky-500 border border-sky-600 shadow-sm" />;
    }
  };

  const connectedPortsCount = device.ports.filter((p) => p.connectedCableId).length;

  return (
    <div
      style={{
        transform: `translate3d(${device.x}px, ${device.y}px, 0)`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        if (isValidConnectionTarget && onTargetClick) {
          e.stopPropagation();
          onTargetClick();
          return;
        }
        onSelect?.();
      }}
      className={`absolute select-none rounded-xl border p-3 w-60 shadow-xl transition-all duration-100 ${
        isProjectorMode
          ? 'bg-white text-slate-900 border-slate-300 shadow-slate-300/60'
          : 'bg-slate-900/95 text-slate-100 border-slate-800 shadow-2xl backdrop-blur-md'
      } ${
        isConnectionSource
          ? 'ring-4 ring-sky-500 shadow-sky-500/30 scale-102 z-30 border-sky-500'
          : isValidConnectionTarget
          ? 'ring-4 ring-emerald-500 shadow-emerald-500/40 animate-pulse cursor-pointer z-30 border-emerald-500'
          : isSelected
          ? 'ring-2 ring-sky-500 border-sky-500 z-20'
          : device.status === 'ip-conflict'
          ? 'ring-2 ring-rose-500 border-rose-500 z-10'
          : 'hover:border-slate-400 z-10'
      }`}
    >
      {/* Contextual Didactic Tooltip when enabled and hovered */}
      {showTooltips && isHovered && contextHelp && (
        <div
          className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-80 p-3.5 rounded-xl border-2 shadow-2xl z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150 ${
            isProjectorMode
              ? 'bg-white border-sky-600 text-slate-900 shadow-slate-400'
              : 'bg-slate-950 border-sky-400 text-slate-100 shadow-black'
          }`}
        >
          <div className="flex items-center gap-2 pb-1.5 border-b border-sky-500/30">
            <Info className="w-4 h-4 text-sky-500 shrink-0" />
            <span className="text-xs font-bold text-sky-700 dark:text-sky-300 truncate">
              {contextHelp.title}
            </span>
          </div>

          <div className="mt-2 space-y-1.5 text-[11px] leading-snug">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">Úloha v síti: </span>
              <span className="text-slate-700 dark:text-slate-300">{contextHelp.roleInTask}</span>
            </div>
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">Princip: </span>
              <span className="text-slate-600 dark:text-slate-400">{contextHelp.howItWorks}</span>
            </div>
            <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 flex items-start gap-1.5 text-amber-700 dark:text-amber-300 font-medium">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>{contextHelp.pupilTip}</span>
            </div>
          </div>

          {/* Pointer Triangle */}
          <div
            className={`absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-3 h-3 rotate-45 border-r-2 border-b-2 ${
              isProjectorMode
                ? 'bg-white border-sky-600'
                : 'bg-slate-950 border-sky-400'
            }`}
          />
        </div>
      )}

      {/* Device Header with Move / Drag Handle */}
      <div
        onMouseDown={onHeaderMouseDown}
        className={`flex items-center justify-between gap-1.5 mb-2 pb-1.5 border-b cursor-grab active:cursor-grabbing rounded px-1 -mx-1 transition-colors ${
          isProjectorMode
            ? 'border-slate-200 hover:bg-slate-100'
            : 'border-slate-800/80 hover:bg-slate-800/40'
        }`}
        title="Přetáhni myší pro posun zařízení po ploše"
      >
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg border ${
            isProjectorMode
              ? 'bg-slate-100 border-slate-300'
              : 'bg-slate-800 border-slate-700'
          }`}>
            {getDeviceIcon()}
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-tight leading-tight">
              {device.name}
            </h4>
            <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-mono text-slate-500">
              <span>{device.type}</span>
              {(device.type === 'switch' || device.type === 'router') && (
                <span className="flex items-center gap-0.5 font-bold">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      connectedPortsCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                  <span>{connectedPortsCount} LED</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          {onConfigureClick && (
            <button
              type="button"
              title="Nastavit síťovou kartu"
              onClick={(e) => {
                e.stopPropagation();
                onConfigureClick();
              }}
              className="p-1 rounded text-slate-500 hover:text-sky-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </button>
          )}
          <GripHorizontal className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
        </div>
      </div>

      {/* Network Metadata */}
      <div className={`space-y-1 mb-2 rounded-lg p-2 border font-mono text-[11px] ${
        isProjectorMode
          ? 'bg-slate-100 border-slate-200 text-slate-800'
          : 'bg-slate-950/70 border-slate-800/70 text-slate-200'
      }`}>
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-slate-500 font-semibold">IP:</span>
          <span
            className={`font-bold tabular-nums ${
              device.status === 'ip-conflict'
                ? 'text-rose-600'
                : device.status === 'wrong-subnet'
                ? 'text-amber-600'
                : !device.ip
                ? 'text-slate-400 italic'
                : 'text-sky-700 dark:text-sky-300'
            }`}
          >
            {device.ip || '0.0.0.0'}
          </span>
        </div>

        {device.type !== 'switch' && (
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-500 font-semibold">Brána:</span>
            <span className="tabular-nums truncate max-w-[120px]">
              {device.defaultGateway || 'Nenastavena'}
            </span>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className={`flex items-center justify-between pt-1 border-t mb-2 ${
        isProjectorMode ? 'border-slate-200' : 'border-slate-800/60'
      }`}>
        {getStatusBadge()}

        {onStartConnection && !isConnectionSource && !isValidConnectionTarget && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStartConnection();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold text-sky-700 bg-sky-100 hover:bg-sky-200 border border-sky-300 dark:text-sky-300 dark:bg-sky-950/60 dark:hover:bg-sky-900 transition-colors shadow-sm"
            title="Klikni a poté klikni na cíl pro propojení"
          >
            <Link className="w-3 h-3" /> Propojit
          </button>
        )}

        {isConnectionSource && (
          <span className="text-[10px] font-bold text-sky-600 animate-pulse">
            Vybráno...
          </span>
        )}

        {isValidConnectionTarget && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTargetClick?.();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-colors animate-pulse"
          >
            <Link className="w-3 h-3" /> Zapojit sem
          </button>
        )}
      </div>

      {/* Sockets / Ports list */}
      <div className={`pt-2 border-t flex flex-wrap gap-1.5 items-center ${
        isProjectorMode ? 'border-slate-200' : 'border-slate-800/50'
      }`}>
        {device.ports.map((port) => {
          const isHighlighted = highlightPortId === port.id;
          const isWan = port.type === 'wan';
          const isWifi = port.type === 'wifi';

          return (
            <div
              key={port.id}
              data-port-id={port.id}
              data-device-id={device.id}
              onClick={(e) => {
                e.stopPropagation();
                onPortClick?.(port);
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                onPortMouseDown?.(port, e);
              }}
              onMouseEnter={() => onPortHover?.(port)}
              onMouseLeave={() => onPortHover?.(null)}
              title={`${port.name} (${port.type.toUpperCase()}) – Klikni nebo táhni kabel`}
              className={`group relative flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono transition-all cursor-pointer border ${
                isHighlighted
                  ? 'bg-emerald-100 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500 scale-105'
                  : port.connectedCableId
                  ? isProjectorMode
                    ? 'bg-sky-100 border-sky-300 text-sky-800 font-semibold'
                    : 'bg-slate-800/90 border-sky-500/50 text-sky-200'
                  : isWan
                  ? 'bg-amber-100 border-amber-300 text-amber-800 hover:border-amber-500 dark:bg-amber-950/40 dark:border-amber-500/40 dark:text-amber-200'
                  : isWifi
                  ? 'bg-purple-100 border-purple-300 text-purple-800 hover:border-purple-500 dark:bg-purple-950/40 dark:border-purple-500/40 dark:text-purple-200'
                  : isProjectorMode
                  ? 'bg-white border-slate-300 text-slate-700 hover:border-sky-500 hover:text-sky-700'
                  : 'bg-slate-950/80 border-slate-700/70 text-slate-300 hover:border-sky-400 hover:text-white'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full transition-colors ${
                  port.connectedCableId
                    ? 'bg-emerald-500 ring-2 ring-emerald-400/40'
                    : 'bg-slate-400 group-hover:bg-sky-500'
                }`}
              />
              {getPortIcon(port.type)}
              <span className="truncate max-w-[95px]">{port.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
