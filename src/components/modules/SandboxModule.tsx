import React, { useState, useRef } from 'react';
import {
  Plus,
  Trash2,
  Send,
  Radio,
  HardDrive,
  Monitor,
  Laptop,
  Smartphone,
  Tv,
  Server,
  Play,
  Settings2,
  BookOpen,
} from 'lucide-react';
import { DeviceNode } from '../DeviceNode';
import { CableLayer } from '../CableLayer';
import { PacketVisualizer } from '../PacketVisualizer';
import { DeviceConfigModal } from '../DeviceConfigModal';
import { CableConnection, DataPacket, DeviceType, NetworkDevice, NetworkPort } from '../../types/network';
import { sounds } from '../../utils/soundEffects';
import { getDeviceDidacticHelp } from '../../utils/didacticTooltips';

interface SandboxModuleProps {
  onOpenTheory: () => void;
  isProjectorMode?: boolean;
  showContextTooltips?: boolean;
}

export const SandboxModule: React.FC<SandboxModuleProps> = ({
  onOpenTheory,
  isProjectorMode = false,
  showContextTooltips = false,
}) => {
  const [devices, setDevices] = useState<NetworkDevice[]>([
    {
      id: 'sbx-r1',
      type: 'router',
      name: 'Centrální Router',
      x: 80,
      y: 190,
      ip: '192.168.1.1',
      subnetMask: '255.255.255.0',
      defaultGateway: '192.168.1.1',
      macAddress: '00:50:56:AA:BB:01',
      ports: [
        { id: 'p1', name: 'LAN 1', type: 'ethernet', position: 'right' },
        { id: 'p2', name: 'Wi-Fi 5G', type: 'wifi', position: 'top' },
      ],
      status: 'ok',
    },
    {
      id: 'sbx-sw1',
      type: 'switch',
      name: 'Učební Switch',
      x: 340,
      y: 190,
      ip: '192.168.1.250',
      subnetMask: '255.255.255.0',
      defaultGateway: '192.168.1.1',
      macAddress: '00:15:5D:AA:BB:01',
      ports: [
        { id: 'sw-up', name: 'Uplink', type: 'ethernet', position: 'left' },
        { id: 'sw-p1', name: 'Port 1', type: 'ethernet', position: 'top' },
        { id: 'sw-p2', name: 'Port 2', type: 'ethernet', position: 'bottom' },
        { id: 'sw-p3', name: 'Port 3', type: 'ethernet', position: 'right' },
      ],
      status: 'ok',
    },
    {
      id: 'sbx-pc1',
      type: 'pc-student',
      name: 'Pracovní PC 1',
      x: 620,
      y: 70,
      ip: '192.168.1.10',
      subnetMask: '255.255.255.0',
      defaultGateway: '192.168.1.1',
      macAddress: '70:85:C2:55:01:01',
      ports: [{ id: 'p-eth', name: 'LAN', type: 'ethernet', position: 'left' }],
      status: 'ok',
    },
    {
      id: 'sbx-pc2',
      type: 'pc-student',
      name: 'Pracovní PC 2',
      x: 620,
      y: 310,
      ip: '192.168.1.11',
      subnetMask: '255.255.255.0',
      defaultGateway: '192.168.1.1',
      macAddress: '70:85:C2:55:01:02',
      ports: [{ id: 'p-eth', name: 'LAN', type: 'ethernet', position: 'left' }],
      status: 'ok',
    },
  ]);

  const [connections, setConnections] = useState<CableConnection[]>([
    { id: 'c1', fromDeviceId: 'sbx-r1', fromPortId: 'p1', toDeviceId: 'sbx-sw1', toPortId: 'sw-up', medium: 'cable', status: 'active' },
    { id: 'c2', fromDeviceId: 'sbx-sw1', fromPortId: 'sw-p1', toDeviceId: 'sbx-pc1', toPortId: 'p-eth', medium: 'cable', status: 'active' },
    { id: 'c3', fromDeviceId: 'sbx-sw1', fromPortId: 'sw-p2', toDeviceId: 'sbx-pc2', toPortId: 'p-eth', medium: 'cable', status: 'active' },
  ]);

  const [selectedDevice, setSelectedDevice] = useState<NetworkDevice | null>(null);
  const [editingDevice, setEditingDevice] = useState<NetworkDevice | null>(null);

  // Click-to-connect state
  const [connectionSourceDevId, setConnectionSourceDevId] = useState<string | null>(null);

  // Moving device
  const [movingDevice, setMovingDevice] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // Packet simulation state
  const [packetSourceId, setPacketSourceId] = useState<string>('sbx-pc1');
  const [packetTargetId, setPacketTargetId] = useState<string>('sbx-pc2');
  const [activePacket, setActivePacket] = useState<DataPacket | null>(null);

  // Cable dragging
  const [draggingCable, setDraggingCable] = useState<{
    fromDeviceId: string;
    fromPortId: string;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    medium: 'cable' | 'wifi';
    targetPort: { deviceId: string; portId: string; x: number; y: number } | null;
  } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

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
    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const curX = e.clientX - canvasRect.left;
    const curY = e.clientY - canvasRect.top;

    if (movingDevice) {
      const newX = Math.max(10, Math.min(canvasRect.width - 240, curX - movingDevice.offsetX));
      const newY = Math.max(10, Math.min(canvasRect.height - 200, curY - movingDevice.offsetY));
      setDevices((prev) =>
        prev.map((d) => (d.id === movingDevice.id ? { ...d, x: newX, y: newY } : d))
      );
      return;
    }

    if (draggingCable) {
      let snappedPort: {
        deviceId: string;
        portId: string;
        x: number;
        y: number;
      } | null = null;

      for (const dev of devices) {
        if (dev.id === draggingCable.fromDeviceId) continue;
        const portCount = dev.ports.length;
        dev.ports.forEach((p, idx) => {
          const isWifi = draggingCable.medium === 'wifi';
          if (isWifi && p.type !== 'wifi') return;
          if (!isWifi && p.type === 'wifi') return;

          const pX = dev.x + ((idx + 1) / (portCount + 1)) * 224;
          const pY = dev.y + (p.position === 'top' ? 0 : 150);
          if (Math.hypot(curX - pX, curY - pY) < 55) {
            snappedPort = { deviceId: dev.id, portId: p.id, x: pX, y: pY };
          }
        });
      }

      setDraggingCable((prev) =>
        prev ? { ...prev, currentX: curX, currentY: curY, targetPort: snappedPort } : null
      );
    }
  };

  const handleMouseUp = () => {
    if (movingDevice) setMovingDevice(null);

    if (draggingCable) {
      if (draggingCable.targetPort) {
        connectDevices(
          draggingCable.fromDeviceId,
          draggingCable.fromPortId,
          draggingCable.targetPort.deviceId,
          draggingCable.targetPort.portId,
          draggingCable.medium
        );
      }
      setDraggingCable(null);
    }
  };

  const handlePortMouseDown = (
    devId: string,
    port: NetworkPort,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const startX = e.clientX - canvasRect.left;
    const startY = e.clientY - canvasRect.top;

    setDraggingCable({
      fromDeviceId: devId,
      fromPortId: port.id,
      startX,
      startY,
      currentX: startX,
      currentY: startY,
      medium: port.type === 'wifi' ? 'wifi' : 'cable',
      targetPort: null,
    });
  };

  const handleStartConnection = (devId: string) => {
    setConnectionSourceDevId(devId);
  };

  const handleCompleteConnection = (targetDevId: string) => {
    if (!connectionSourceDevId || connectionSourceDevId === targetDevId) {
      setConnectionSourceDevId(null);
      return;
    }

    const sDev = devices.find((d) => d.id === connectionSourceDevId);
    const tDev = devices.find((d) => d.id === targetDevId);
    if (!sDev || !tDev) {
      setConnectionSourceDevId(null);
      return;
    }

    const isWifi =
      sDev.ports.some((p) => p.type === 'wifi') &&
      tDev.ports.some((p) => p.type === 'wifi');

    const sPort = sDev.ports.find((p) => isWifi ? p.type === 'wifi' : p.type !== 'wifi') || sDev.ports[0];
    const tPort = tDev.ports.find((p) => isWifi ? p.type === 'wifi' : p.type !== 'wifi') || tDev.ports[0];

    connectDevices(sDev.id, sPort.id, tDev.id, tPort.id, isWifi ? 'wifi' : 'cable');
    setConnectionSourceDevId(null);
  };

  const connectDevices = (
    fromDevId: string,
    fromPId: string,
    toDevId: string,
    toPId: string,
    medium: 'cable' | 'wifi'
  ) => {
    const exists = connections.some(
      (c) =>
        (c.fromDeviceId === fromDevId && c.toDeviceId === toDevId) ||
        (c.fromDeviceId === toDevId && c.toDeviceId === fromDevId)
    );

    if (!exists) {
      const newConn: CableConnection = {
        id: `conn-sbx-${Date.now()}`,
        fromDeviceId: fromDevId,
        fromPortId: fromPId,
        toDeviceId: toDevId,
        toPortId: toPId,
        medium,
        status: 'active',
      };
      setConnections((prev) => [...prev, newConn]);
      sounds.playCableConnect();
    }
  };

  const handleAddDevice = (type: DeviceType) => {
    const id = `dev-sbx-${Date.now()}`;
    const nextNum = devices.length + 1;
    const isWifi = type === 'phone' || type === 'smart-tv';

    const newDev: NetworkDevice = {
      id,
      type,
      name:
        type === 'router'
          ? `Router ${nextNum}`
          : type === 'switch'
          ? `Switch ${nextNum}`
          : type === 'laptop'
          ? `Notebook ${nextNum}`
          : type === 'phone'
          ? `Mobil ${nextNum}`
          : type === 'smart-tv'
          ? `Smart TV ${nextNum}`
          : type === 'server'
          ? `Server ${nextNum}`
          : `Počítač ${nextNum}`,
      x: 100 + ((devices.length * 60) % 500),
      y: 80 + ((devices.length * 70) % 300),
      ip: `192.168.1.${10 + nextNum}`,
      subnetMask: '255.255.255.0',
      defaultGateway: '192.168.1.1',
      macAddress: `00:1A:2B:3C:${nextNum.toString(16).padStart(2, '0')}:50`,
      ports:
        type === 'switch'
          ? [
              { id: 'p1', name: 'Port 1', type: 'ethernet', position: 'left' },
              { id: 'p2', name: 'Port 2', type: 'ethernet', position: 'top' },
              { id: 'p3', name: 'Port 3', type: 'ethernet', position: 'right' },
              { id: 'p4', name: 'Port 4', type: 'ethernet', position: 'bottom' },
            ]
          : type === 'router'
          ? [
              { id: 'p-lan', name: 'LAN', type: 'ethernet', position: 'right' },
              { id: 'p-wifi', name: 'Wi-Fi', type: 'wifi', position: 'top' },
            ]
          : [
              {
                id: 'p-main',
                name: isWifi ? 'Wi-Fi' : 'LAN',
                type: isWifi ? 'wifi' : 'ethernet',
                position: 'left',
              },
            ],
      status: 'ok',
    };

    setDevices((prev) => [...prev, newDev]);
    sounds.playCableConnect();
  };

  const handleDeleteSelected = () => {
    if (!selectedDevice) return;
    const id = selectedDevice.id;
    setDevices((prev) => prev.filter((d) => d.id !== id));
    setConnections((prev) =>
      prev.filter((c) => c.fromDeviceId !== id && c.toDeviceId !== id)
    );
    setSelectedDevice(null);
    sounds.playCableDisconnect();
  };

  const handleClearAll = () => {
    setDevices([]);
    setConnections([]);
    setSelectedDevice(null);
    setActivePacket(null);
    sounds.playCableDisconnect();
  };

  const handleSendCustomPacket = () => {
    const srcDev = devices.find((d) => d.id === packetSourceId);
    const tgtDev = devices.find((d) => d.id === packetTargetId);

    if (!srcDev || !tgtDev || srcDev.id === tgtDev.id) return;

    const sw = devices.find((d) => d.type === 'switch');
    const route = sw ? [srcDev.id, sw.id, tgtDev.id] : [srcDev.id, tgtDev.id];

    const packet: DataPacket = {
      id: `pkt-sbx-${Date.now()}`,
      sourceDeviceId: srcDev.id,
      targetDeviceId: tgtDev.id,
      sourceIp: srcDev.ip,
      targetIp: tgtDev.ip,
      payloadType: 'ping',
      label: `DATA: ${srcDev.name} ➔ ${tgtDev.name}`,
      status: 'traveling',
      currentStep: 0,
      totalSteps: route.length - 1,
      route,
      explanation: `Přenos dat z ${srcDev.name} na ${tgtDev.name}`,
    };

    setActivePacket(packet);
    sounds.playPacketSent();
  };

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

        {/* Ambient Top Tag */}
        <div className={`absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-sm text-xs font-semibold shadow-sm ${
          isProjectorMode
            ? 'bg-white/95 border-slate-300 text-slate-800'
            : 'bg-slate-900/80 border-slate-800 text-slate-300'
        }`}>
          <Settings2 className="w-4 h-4 text-amber-500" />
          <span>Volné síťové pískoviště: Stavěj a experimentuj</span>
        </div>

        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={onOpenTheory}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${
              isProjectorMode
                ? 'bg-sky-50 border-sky-300 text-sky-800 hover:bg-sky-100'
                : 'bg-sky-950/80 border-sky-500/40 text-sky-300 hover:bg-sky-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-500" />
            <span>Slabikář & Teorie</span>
          </button>
        </div>

        {/* Connection Source Banner */}
        {connectionSourceDevId && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2 rounded-xl bg-sky-600 border border-sky-400 text-white text-xs font-bold shadow-2xl backdrop-blur-md animate-bounce">
            <span>Klikni na zařízení, kam chceš kabel zapojit!</span>
            <button
              onClick={() => setConnectionSourceDevId(null)}
              className="px-2 py-0.5 rounded bg-slate-900/60 hover:bg-slate-900 text-white text-[10px]"
            >
              Zrušit
            </button>
          </div>
        )}

        {/* Cable Layer */}
        <CableLayer
          connections={connections}
          devices={devices}
          draggingCable={draggingCable}
          onDisconnectCable={(id) => {
            setConnections((prev) => prev.filter((c) => c.id !== id));
            sounds.playCableDisconnect();
          }}
          isProjectorMode={isProjectorMode}
        />

        {/* Active Packet Visualizer */}
        <PacketVisualizer
          packet={activePacket}
          devices={devices}
          onComplete={() => {
            sounds.playPacketDelivered();
            setActivePacket((prev) => (prev ? { ...prev, status: 'delivered' } : null));
          }}
        />

        {/* Devices */}
        {devices.map((device) => {
          const isSource = connectionSourceDevId === device.id;
          const isTarget = !!connectionSourceDevId && connectionSourceDevId !== device.id;

          return (
            <DeviceNode
              key={device.id}
              device={device}
              isSelected={selectedDevice?.id === device.id}
              isConnectionSource={isSource}
              isValidConnectionTarget={isTarget}
              highlightPortId={
                draggingCable?.targetPort?.deviceId === device.id
                  ? draggingCable.targetPort.portId
                  : null
              }
              onSelect={() => setSelectedDevice(device)}
              onHeaderMouseDown={(e) => handleDeviceHeaderMouseDown(device.id, e)}
              onStartConnection={() => handleStartConnection(device.id)}
              onTargetClick={() => handleCompleteConnection(device.id)}
              onConfigureClick={() => setEditingDevice(device)}
              onPortMouseDown={(port, e) => handlePortMouseDown(device.id, port, e)}
              onPortClick={() => {
                if (connectionSourceDevId) {
                  handleCompleteConnection(device.id);
                } else {
                  handleStartConnection(device.id);
                }
              }}
              contextHelp={getDeviceDidacticHelp(device, 'sandbox')}
              showTooltips={showContextTooltips}
              isProjectorMode={isProjectorMode}
            />
          );
        })}

        {/* Config Modal */}
        <DeviceConfigModal
          device={editingDevice}
          onClose={() => setEditingDevice(null)}
          onSave={(updated) =>
            setDevices((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
          }
          isProjectorMode={isProjectorMode}
        />
      </div>

      {/* Control & Device Palette Deck */}
      <aside className={`w-full xl:w-96 p-5 border-l flex flex-col justify-between overflow-y-auto transition-colors ${
        isProjectorMode
          ? 'bg-white border-slate-200 text-slate-900 shadow-md'
          : 'bg-slate-900/70 border-slate-800 text-slate-100 backdrop-blur-md'
      }`}>
        <div className="space-y-4">
          <div>
            <h2 className={`text-base font-bold tracking-tight ${
              isProjectorMode ? 'text-slate-900' : 'text-white'
            }`}>
              Paleta zařízení
            </h2>
            <p className={`text-xs ${isProjectorMode ? 'text-slate-600' : 'text-slate-400'}`}>
              Kliknutím přidej nový prvek do síťové topologie
            </p>
          </div>

          {/* Device Spawn Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAddDevice('pc-student')}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                isProjectorMode
                  ? 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100 hover:border-emerald-500'
                  : 'bg-slate-950 border-slate-800 hover:border-sky-500 hover:text-sky-300 text-slate-300'
              }`}
            >
              <Monitor className="w-4 h-4 text-emerald-500" />
              <span>Počítač (PC)</span>
            </button>

            <button
              onClick={() => handleAddDevice('switch')}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                isProjectorMode
                  ? 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100 hover:border-indigo-500'
                  : 'bg-slate-950 border-slate-800 hover:border-sky-500 hover:text-sky-300 text-slate-300'
              }`}
            >
              <HardDrive className="w-4 h-4 text-indigo-500" />
              <span>Switch</span>
            </button>

            <button
              onClick={() => handleAddDevice('router')}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                isProjectorMode
                  ? 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100 hover:border-sky-500'
                  : 'bg-slate-950 border-slate-800 hover:border-sky-500 hover:text-sky-300 text-slate-300'
              }`}
            >
              <Radio className="w-4 h-4 text-sky-500" />
              <span>Router</span>
            </button>

            <button
              onClick={() => handleAddDevice('laptop')}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                isProjectorMode
                  ? 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100 hover:border-cyan-500'
                  : 'bg-slate-950 border-slate-800 hover:border-sky-500 hover:text-sky-300 text-slate-300'
              }`}
            >
              <Laptop className="w-4 h-4 text-cyan-500" />
              <span>Notebook</span>
            </button>

            <button
              onClick={() => handleAddDevice('phone')}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                isProjectorMode
                  ? 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100 hover:border-pink-500'
                  : 'bg-slate-950 border-slate-800 hover:border-sky-500 hover:text-sky-300 text-slate-300'
              }`}
            >
              <Smartphone className="w-4 h-4 text-pink-500" />
              <span>Mobil (Wi-Fi)</span>
            </button>

            <button
              onClick={() => handleAddDevice('server')}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                isProjectorMode
                  ? 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100 hover:border-amber-500'
                  : 'bg-slate-950 border-slate-800 hover:border-sky-500 hover:text-sky-300 text-slate-300'
              }`}
            >
              <Server className="w-4 h-4 text-amber-500" />
              <span>Server</span>
            </button>
          </div>

          {/* Test Packet Simulator */}
          <div className={`p-3.5 rounded-xl border space-y-3 ${
            isProjectorMode ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800'
          }`}>
            <span className={`text-xs font-bold block ${
              isProjectorMode ? 'text-sky-800' : 'text-sky-300'
            }`}>
              Odeslat zkušební paket:
            </span>

            <div className="space-y-2">
              <div>
                <label className={`text-[10px] block mb-0.5 ${
                  isProjectorMode ? 'text-slate-600 font-semibold' : 'text-slate-400'
                }`}>Odesílatel:</label>
                <select
                  value={packetSourceId}
                  onChange={(e) => setPacketSourceId(e.target.value)}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-xs ${
                    isProjectorMode
                      ? 'bg-white border border-slate-300 text-slate-800'
                      : 'bg-slate-900 border border-slate-700 text-slate-200'
                  }`}
                >
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.ip || 'bez IP'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`text-[10px] block mb-0.5 ${
                  isProjectorMode ? 'text-slate-600 font-semibold' : 'text-slate-400'
                }`}>Příjemce:</label>
                <select
                  value={packetTargetId}
                  onChange={(e) => setPacketTargetId(e.target.value)}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-xs ${
                    isProjectorMode
                      ? 'bg-white border border-slate-300 text-slate-800'
                      : 'bg-slate-900 border border-slate-700 text-slate-200'
                  }`}
                >
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.ip || 'bez IP'})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSendCustomPacket}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors shadow-sm"
              >
                <Play className="w-3.5 h-3.5" /> Poslat datový paket
              </button>
            </div>
          </div>

          {/* Selected Device Controls */}
          {selectedDevice && (
            <div className={`p-3.5 rounded-xl border space-y-2 ${
              isProjectorMode ? 'bg-sky-50 border-sky-300' : 'bg-slate-950 border-sky-500/40'
            }`}>
              <span className={`text-xs font-bold block truncate ${
                isProjectorMode ? 'text-sky-900' : 'text-sky-200'
              }`}>
                Vybráno: {selectedDevice.name}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingDevice(selectedDevice)}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium border ${
                    isProjectorMode
                      ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                  }`}
                >
                  Upravit IP
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-medium border ${
                    isProjectorMode
                      ? 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100'
                      : 'bg-rose-950/70 hover:bg-rose-900 border-rose-800 text-rose-300'
                  }`}
                >
                  Smazat
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Clear Canvas */}
        <div className={`pt-4 mt-4 border-t ${
          isProjectorMode ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <button
            onClick={handleClearAll}
            className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
              isProjectorMode
                ? 'border-slate-300 bg-slate-100 hover:bg-rose-50 hover:border-rose-300 text-slate-700 hover:text-rose-700'
                : 'border-slate-700 bg-slate-800/80 hover:bg-rose-950/60 hover:border-rose-700 text-slate-300 hover:text-rose-300'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" /> Vymazat celou plochu
          </button>
        </div>
      </aside>
    </div>
  );
};
