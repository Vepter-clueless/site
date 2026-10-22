import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Server,
  Zap,
  Home,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import { DeviceNode } from '../DeviceNode';
import { CableLayer } from '../CableLayer';
import { CableConnection, NetworkDevice } from '../../types/network';
import { sounds } from '../../utils/soundEffects';
import { getDeviceDidacticHelp } from '../../utils/didacticTooltips';

interface DhcpModuleProps {
  onUnlockNext: (nextModuleId: 'packet') => void;
  onGrantBadge: (badgeId: string) => void;
  onOpenTheory: () => void;
  isProjectorMode?: boolean;
  showContextTooltips?: boolean;
}

export const DhcpModule: React.FC<DhcpModuleProps> = ({
  onUnlockNext,
  onGrantBadge,
  onOpenTheory,
  isProjectorMode = false,
  showContextTooltips = false,
}) => {
  // Pre-wired classroom network ready for IP assignment
  const initialDevices: NetworkDevice[] = [
    {
      id: 'dhcp-router',
      type: 'router',
      name: 'Školní Router (DHCP Server)',
      x: 80,
      y: 190,
      ip: '192.168.1.1',
      subnetMask: '255.255.255.0',
      defaultGateway: '192.168.1.1',
      macAddress: '00:50:56:01:02:01',
      ports: [
        { id: 'p-lan', name: 'LAN port', type: 'ethernet', position: 'right' },
      ],
      status: 'ok',
      isFixed: true,
    },
    {
      id: 'dhcp-switch',
      type: 'switch',
      name: 'Učební Switch',
      x: 340,
      y: 190,
      ip: '192.168.1.250',
      subnetMask: '255.255.255.0',
      defaultGateway: '192.168.1.1',
      macAddress: '00:15:5D:AA:BB:01',
      ports: [
        { id: 'p-up', name: 'Uplink', type: 'ethernet', position: 'left' },
        { id: 'p1', name: 'Port 1', type: 'ethernet', position: 'top' },
        { id: 'p2', name: 'Port 2', type: 'ethernet', position: 'top' },
        { id: 'p3', name: 'Port 3', type: 'ethernet', position: 'bottom' },
        { id: 'p4', name: 'Port 4', type: 'ethernet', position: 'bottom' },
      ],
      status: 'ok',
      isFixed: true,
    },
    {
      id: 'dhcp-dev-teacher',
      type: 'pc-teacher',
      name: 'Učitelský PC',
      x: 600,
      y: 50,
      ip: '',
      subnetMask: '255.255.255.0',
      defaultGateway: '192.168.1.1',
      macAddress: '70:85:C2:11:01:01',
      ports: [{ id: 'p-eth', name: 'LAN', type: 'ethernet', position: 'left' }],
      status: 'requesting-dhcp',
    },
    {
      id: 'dhcp-dev-st1',
      type: 'pc-student',
      name: 'Žák 1 (Adam)',
      x: 820,
      y: 50,
      ip: '',
      subnetMask: '255.255.255.0',
      defaultGateway: '192.168.1.1',
      macAddress: '70:85:C2:11:01:02',
      ports: [{ id: 'p-eth', name: 'LAN', type: 'ethernet', position: 'left' }],
      status: 'requesting-dhcp',
    },
    {
      id: 'dhcp-dev-st2',
      type: 'pc-student',
      name: 'Žák 2 (Bára)',
      x: 600,
      y: 330,
      ip: '',
      subnetMask: '255.255.255.0',
      defaultGateway: '192.168.1.1',
      macAddress: '70:85:C2:11:01:03',
      ports: [{ id: 'p-eth', name: 'LAN', type: 'ethernet', position: 'left' }],
      status: 'requesting-dhcp',
    },
    {
      id: 'dhcp-dev-st3',
      type: 'pc-student',
      name: 'Žák 3 (Cyril)',
      x: 820,
      y: 330,
      ip: '',
      subnetMask: '255.255.255.0',
      defaultGateway: '192.168.1.1',
      macAddress: '70:85:C2:11:01:04',
      ports: [{ id: 'p-eth', name: 'LAN', type: 'ethernet', position: 'left' }],
      status: 'requesting-dhcp',
    },
  ];

  const connections: CableConnection[] = [
    { id: 'c-up', fromDeviceId: 'dhcp-router', fromPortId: 'p-lan', toDeviceId: 'dhcp-switch', toPortId: 'p-up', medium: 'cable', status: 'active' },
    { id: 'c1', fromDeviceId: 'dhcp-switch', fromPortId: 'p1', toDeviceId: 'dhcp-dev-teacher', toPortId: 'p-eth', medium: 'cable', status: 'active' },
    { id: 'c2', fromDeviceId: 'dhcp-switch', fromPortId: 'p2', toDeviceId: 'dhcp-dev-st1', toPortId: 'p-eth', medium: 'cable', status: 'active' },
    { id: 'c3', fromDeviceId: 'dhcp-switch', fromPortId: 'p3', toDeviceId: 'dhcp-dev-st2', toPortId: 'p-eth', medium: 'cable', status: 'active' },
    { id: 'c4', fromDeviceId: 'dhcp-switch', fromPortId: 'p4', toDeviceId: 'dhcp-dev-st3', toPortId: 'p-eth', medium: 'cable', status: 'active' },
  ];

  const [devices, setDevices] = useState<NetworkDevice[]>(initialDevices);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('dhcp-dev-teacher');
  const [customEnding, setCustomEnding] = useState<number>(2);
  const [movingDevice, setMovingDevice] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    hasCollision: boolean;
    message: string;
    conflictedIps: string[];
  } | null>(null);

  const handleDeviceHeaderMouseDown = (devId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const dev = devices.find((d) => d.id === devId);
    if (!dev || !canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    setMovingDevice({
      id: devId,
      offsetX: e.clientX - canvasRect.left - dev.x,
      offsetY: e.clientY - canvasRect.top - dev.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!movingDevice || !canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const curX = e.clientX - canvasRect.left;
    const curY = e.clientY - canvasRect.top;
    const newX = Math.max(10, Math.min(canvasRect.width - 240, curX - movingDevice.offsetX));
    const newY = Math.max(10, Math.min(canvasRect.height - 200, curY - movingDevice.offsetY));
    setDevices((prev) =>
      prev.map((d) => (d.id === movingDevice.id ? { ...d, x: newX, y: newY } : d))
    );
  };

  const handleMouseUp = () => {
    if (movingDevice) setMovingDevice(null);
  };

  // Recommended host pool
  const recommendedEndings = [2, 10, 11, 12, 15, 20, 50, 100];

  const handleAssignIp = (devId: string, ending: number) => {
    const newIp = `192.168.1.${ending}`;

    setDevices((prevDevs) => {
      const updated = prevDevs.map((d) => {
        if (d.id === devId) {
          return {
            ...d,
            ip: newIp,
            status: 'ok' as const,
          };
        }
        return d;
      });

      // Check collisions after assignment
      return recalculateDeviceStatuses(updated);
    });

    sounds.playPacketSent();
  };

  const recalculateDeviceStatuses = (devs: NetworkDevice[]) => {
    const ipCounts: Record<string, number> = {};
    devs.forEach((d) => {
      if (d.ip) {
        ipCounts[d.ip] = (ipCounts[d.ip] || 0) + 1;
      }
    });

    return devs.map((d) => {
      if (!d.ip) return { ...d, status: 'requesting-dhcp' as const };
      if (ipCounts[d.ip] > 1) {
        return { ...d, status: 'ip-conflict' as const };
      }
      return { ...d, status: 'ok' as const };
    });
  };

  // Intentional collision test trigger
  const handleTriggerCollisionDemo = () => {
    setDevices((prevDevs) => {
      const updated = prevDevs.map((d) => {
        if (d.id === 'dhcp-dev-st1' || d.id === 'dhcp-dev-st2') {
          return {
            ...d,
            ip: '192.168.1.10',
            status: 'ip-conflict' as const,
          };
        }
        return d;
      });
      return recalculateDeviceStatuses(updated);
    });

    sounds.playCollision();
    setValidationResult({
      success: false,
      hasCollision: true,
      message: 'KOLIZE IP ADRES! Počítač Adam i Bára mají nastaveno stejné číslo 192.168.1.10.',
      conflictedIps: ['192.168.1.10'],
    });
  };

  const handleCheckDhcp = () => {
    // Check if any devices still unconfigured
    const unassigned = devices.filter(
      (d) => d.id.startsWith('dhcp-dev') && (!d.ip || d.status === 'requesting-dhcp')
    );
    if (unassigned.length > 0) {
      sounds.playCollision();
      setValidationResult({
        success: false,
        hasCollision: false,
        message: `Ještě ${unassigned.length} zařízení čekají na přidělení IP adresy!`,
        conflictedIps: [],
      });
      return;
    }

    // Check collisions
    const assignedIps = devices.filter((d) => d.ip).map((d) => d.ip);
    const duplicates = assignedIps.filter(
      (item, index) => assignedIps.indexOf(item) !== index
    );

    if (duplicates.length > 0) {
      sounds.playCollision();
      setValidationResult({
        success: false,
        hasCollision: true,
        message: `Pozor! V síti došlo ke kolizi IP adresy: ${duplicates.join(', ')}. Dvě zařízení nemohou mít stejnou adresu!`,
        conflictedIps: duplicates,
      });
      return;
    }

    // Success!
    sounds.playSuccessFanfare();
    confetti({ particleCount: 90, spread: 65, origin: { y: 0.6 } });
    onGrantBadge('dhcp-master');
    onUnlockNext('packet');

    setValidationResult({
      success: true,
      hasCollision: false,
      message: 'Skvělá práce, pane správce! Všechna zařízení mají unikátní IP adresu ze správného rozsahu.',
      conflictedIps: [],
    });
  };

  const handleResetDhcp = () => {
    setDevices(initialDevices);
    setValidationResult(null);
    sounds.playCableDisconnect();
  };

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId);

  return (
    <div className="flex-1 flex flex-col xl:flex-row h-full overflow-hidden">
      {/* Interactive Stage */}
      <div
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`relative flex-1 min-h-[520px] overflow-hidden border-b xl:border-b-0 xl:border-r transition-colors ${
          isProjectorMode
            ? 'bg-slate-100 border-slate-300'
            : 'bg-slate-950 border-slate-800'
        }`}
      >
        {/* Background Grid */}
        <div
          className={`absolute inset-0 pointer-events-none ${isProjectorMode ? 'opacity-25' : 'opacity-15'}`}
          style={{
            backgroundImage: `radial-gradient(circle, ${isProjectorMode ? '#0369a1' : '#38bdf8'} 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Postal Metaphor Banner */}
        <div className={`absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-4 p-3 rounded-xl border backdrop-blur-md shadow-sm ${
          isProjectorMode
            ? 'bg-white/95 border-slate-300 text-slate-800'
            : 'bg-slate-900/90 border-slate-800 text-slate-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${
              isProjectorMode
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className={`text-xs font-bold flex items-center gap-2 ${
                isProjectorMode ? 'text-slate-900' : 'text-slate-100'
              }`}>
                <span>Poštovní analogie IP adresy:</span>
                <span className={`font-mono ${isProjectorMode ? 'text-sky-700 font-extrabold' : 'text-sky-400'}`}>192.168.1.</span>
                <span className={`font-mono font-extrabold ${isProjectorMode ? 'text-amber-700' : 'text-amber-400'}`}>X</span>
              </div>
              <p className={`text-[11px] ${isProjectorMode ? 'text-slate-600' : 'text-slate-400'}`}>
                <span className={`${isProjectorMode ? 'text-sky-800 font-bold' : 'text-sky-300 font-semibold'}`}>192.168.1</span> = Název ulice (Síť) ·{' '}
                <span className={`${isProjectorMode ? 'text-amber-800 font-bold' : 'text-amber-300 font-semibold'}`}>X</span> = Číslo popisné domu (Unikátní koncovka 2 až 254)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerCollisionDemo}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                isProjectorMode
                  ? 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100 shadow-sm'
                  : 'bg-rose-950/70 border-rose-500/50 text-rose-300 hover:bg-rose-900/80'
              }`}
              title="Nasimulovat, co se stane při shodné IP adrese"
            >
              <Zap className="w-3.5 h-3.5 text-rose-500" />
              <span>Vyzkoušet kolizi IP</span>
            </button>

            <button
              onClick={onOpenTheory}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${
                isProjectorMode
                  ? 'bg-sky-50 border-sky-300 text-sky-800 hover:bg-sky-100'
                  : 'bg-sky-950/80 border-sky-500/40 text-sky-300 hover:bg-sky-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-500" />
              <span>Slabikář</span>
            </button>
          </div>
        </div>

        {/* Cable Layer */}
        <CableLayer
          connections={connections}
          devices={devices}
          draggingCable={null}
          isProjectorMode={isProjectorMode}
        />

        {/* Devices */}
        {devices.map((device) => (
          <DeviceNode
            key={device.id}
            device={device}
            isSelected={selectedDeviceId === device.id}
            onSelect={() => setSelectedDeviceId(device.id)}
            onHeaderMouseDown={(e) => handleDeviceHeaderMouseDown(device.id, e)}
            contextHelp={getDeviceDidacticHelp(device, 'dhcp')}
            showTooltips={showContextTooltips}
            isProjectorMode={isProjectorMode}
          />
        ))}

        {/* Collision Visual Warning Banner over Canvas */}
        {validationResult?.hasCollision && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-5 py-3 rounded-xl bg-rose-950/95 border border-rose-500 text-rose-100 shadow-2xl backdrop-blur-md animate-bounce">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold">Havárie sítě (IP Conflict): </span>
              <span>
                Přepínač a router nevědí, komu doručit data! Pakety se srazí a obě zařízení ztratí spojení.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Control & Allocation Deck */}
      <aside className={`w-full xl:w-96 p-5 border-l flex flex-col justify-between overflow-y-auto transition-colors ${
        isProjectorMode
          ? 'bg-white border-slate-200 text-slate-900 shadow-md'
          : 'bg-slate-900/70 border-slate-800 text-slate-100 backdrop-blur-md'
      }`}>
        <div className="space-y-4">
          <div>
            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
              isProjectorMode ? 'text-sky-700' : 'text-sky-400'
            }`}>
              <Server className="w-4 h-4" /> Modul 2
            </div>
            <h2 className={`text-base font-bold tracking-tight mt-1 ${
              isProjectorMode ? 'text-slate-900' : 'text-white'
            }`}>
              Hra na DHCP Server
            </h2>
            <p className={`text-xs ${isProjectorMode ? 'text-slate-600' : 'text-slate-400'}`}>
              Přiděluj počítačům unikátní IP adresy z rozsahu 192.168.1.X
            </p>
          </div>

          {/* Active Target Device Selector */}
          <div className={`p-3.5 rounded-xl border space-y-2 ${
            isProjectorMode ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800'
          }`}>
            <span className={`text-[11px] font-semibold block ${
              isProjectorMode ? 'text-slate-700' : 'text-slate-400'
            }`}>
              Vyber zařízení k nastavení:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {devices
                .filter((d) => d.id.startsWith('dhcp-dev'))
                .map((dev) => (
                  <button
                    key={dev.id}
                    onClick={() => setSelectedDeviceId(dev.id)}
                    className={`p-2 rounded-lg text-left text-xs transition-colors border ${
                      selectedDeviceId === dev.id
                        ? isProjectorMode
                          ? 'bg-sky-100 border-sky-400 text-sky-900 font-bold shadow-sm'
                          : 'bg-sky-500/20 border-sky-400 text-sky-200 font-bold'
                        : isProjectorMode
                        ? 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="truncate">{dev.name}</div>
                    <div className={`text-[10px] font-mono ${
                      isProjectorMode ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      {dev.ip || 'Nemá IP'}
                    </div>
                  </button>
                ))}
            </div>
          </div>

          {/* Allocation Palette */}
          {selectedDevice && (
            <div className={`p-3.5 rounded-xl border space-y-3 ${
              isProjectorMode ? 'bg-white border-slate-300 shadow-sm' : 'bg-slate-950/80 border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isProjectorMode ? 'text-slate-800' : 'text-slate-200'}`}>
                  Nastavit IP pro: <span className={isProjectorMode ? 'text-sky-700 font-extrabold' : 'text-sky-300'}>{selectedDevice.name}</span>
                </span>
                <span className={`text-[10px] font-mono ${isProjectorMode ? 'text-slate-600 font-semibold' : 'text-slate-400'}`}>
                  Rozsah: .2 – .254
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <span className={`text-[11px] ${isProjectorMode ? 'text-slate-600' : 'text-slate-400'}`}>
                  Doporučené volné koncovky:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {recommendedEndings.map((num) => {
                    const isTaken = devices.some(
                      (d) => d.id !== selectedDevice.id && d.ip === `192.168.1.${num}`
                    );
                    const isCurrent = selectedDevice.ip === `192.168.1.${num}`;

                    return (
                      <button
                        key={num}
                        onClick={() => handleAssignIp(selectedDevice.id, num)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                          isCurrent
                            ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                            : isTaken
                            ? isProjectorMode
                              ? 'bg-rose-100 border border-rose-300 text-rose-800 hover:bg-rose-200'
                              : 'bg-rose-950/60 border border-rose-800/60 text-rose-400 hover:bg-rose-900'
                            : isProjectorMode
                            ? 'bg-slate-100 border border-slate-300 text-slate-800 hover:bg-sky-50 hover:text-sky-800 hover:border-sky-400'
                            : 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-sky-950 hover:text-sky-300 hover:border-sky-500'
                        }`}
                        title={isTaken ? 'Tato adresa je již obsazena! (Způsobí kolizi)' : ''}
                      >
                        .{num}
                        {isTaken && <span className="text-[9px] ml-1">⚠️</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Number Input */}
              <div className={`pt-2 border-t flex items-center gap-2 ${
                isProjectorMode ? 'border-slate-200' : 'border-slate-800'
              }`}>
                <span className={`font-mono text-xs ${isProjectorMode ? 'text-slate-600 font-semibold' : 'text-slate-400'}`}>192.168.1.</span>
                <input
                  type="number"
                  min="2"
                  max="254"
                  value={customEnding}
                  onChange={(e) => setCustomEnding(parseInt(e.target.value) || 2)}
                  className={`w-16 px-2 py-1 rounded font-mono text-xs focus:outline-none ${
                    isProjectorMode
                      ? 'bg-slate-100 border border-slate-300 text-sky-800 focus:border-sky-600'
                      : 'bg-slate-900 border border-slate-700 text-sky-300 focus:border-sky-400'
                  }`}
                />
                <button
                  onClick={() => handleAssignIp(selectedDevice.id, customEnding)}
                  className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm"
                >
                  Přiřadit
                </button>
              </div>
            </div>
          )}

          {/* Validation Feedback */}
          {validationResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                validationResult.success
                  ? isProjectorMode
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm'
                    : 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                  : isProjectorMode
                  ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-sm'
                  : 'bg-rose-950/70 border-rose-500/50 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {validationResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{validationResult.message}</span>
              </div>
            </div>
          )}

          {/* Didactic Fact */}
          <div className={`p-3.5 rounded-xl border text-[11px] space-y-1.5 ${
            isProjectorMode
              ? 'bg-amber-50/80 border-amber-300 text-slate-700 shadow-sm'
              : 'bg-slate-950/60 border-slate-800 text-slate-400'
          }`}>
            <div className={`flex items-center gap-1.5 font-bold ${
              isProjectorMode ? 'text-amber-800' : 'text-amber-300'
            }`}>
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Co dělá DHCP server?</span>
            </div>
            <p className="leading-relaxed">
              V reálné domácnosti nebo škole nemusíš čísla zadávat ručně. Tuto práci dělá router díky službě{' '}
              <strong className={isProjectorMode ? 'text-slate-900 font-bold' : 'text-slate-200'}>DHCP</strong> (Dynamic Host Configuration Protocol), která nově připojenému zařízení automaticky zapůjčí volnou IP adresu.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`pt-4 mt-4 border-t space-y-2 ${
          isProjectorMode ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <button
            onClick={handleCheckDhcp}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.01]"
          >
            <CheckCircle2 className="w-4 h-4" /> Zkontrolovat DHCP přidělení
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDhcp}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                isProjectorMode
                  ? 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" /> Vymazat adresy
            </button>

            {validationResult?.success && (
              <button
                onClick={() => onUnlockNext('packet')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md"
              >
                <span>3. Cesta paketu</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};
