import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Send,
  Globe,
  FileText,
  Play,
  RotateCcw,
  CheckCircle2,
  Lightbulb,
  Radio,
  ArrowRight,
  HardDrive,
  BookOpen,
} from 'lucide-react';
import { DeviceNode } from '../DeviceNode';
import { CableLayer } from '../CableLayer';
import { PacketVisualizer } from '../PacketVisualizer';
import { CableConnection, DataPacket, NetworkDevice } from '../../types/network';
import { sounds } from '../../utils/soundEffects';
import { getDeviceDidacticHelp } from '../../utils/didacticTooltips';

interface PacketModuleProps {
  onUnlockNext: (nextModuleId: 'detective') => void;
  onGrantBadge: (badgeId: string) => void;
  onOpenTheory: () => void;
  isProjectorMode?: boolean;
  showContextTooltips?: boolean;
}

export const PacketModule: React.FC<PacketModuleProps> = ({
  onUnlockNext,
  onGrantBadge,
  onOpenTheory,
  isProjectorMode = false,
  showContextTooltips = false,
}) => {
  const initialDevices: NetworkDevice[] = [
    {
      id: 'pkt-internet-server',
      type: 'server',
      name: 'Webový Server (Google)',
      x: 60,
      y: 50,
      ip: '142.250.180.206',
      subnetMask: '255.255.255.0',
      defaultGateway: '142.250.180.1',
      macAddress: 'AA:00:14:22:33:44',
      ports: [{ id: 'p-srv', name: 'Optika', type: 'wan', position: 'bottom' }],
      status: 'ok',
      isFixed: true,
    },
    {
      id: 'pkt-router',
      type: 'router',
      name: 'Školní Router (Brána)',
      x: 60,
      y: 250,
      ip: '192.168.1.1',
      subnetMask: '255.255.255.0',
      defaultGateway: '192.168.1.1',
      macAddress: '00:50:56:01:02:01',
      ports: [
        { id: 'p-wan', name: 'WAN (Internet)', type: 'wan', position: 'top' },
        { id: 'p-lan', name: 'LAN (Switch)', type: 'ethernet', position: 'right' },
      ],
      status: 'ok',
      isFixed: true,
    },
    {
      id: 'pkt-switch',
      type: 'switch',
      name: 'Učební Switch (Přepínač)',
      x: 340,
      y: 250,
      ip: '192.168.1.250',
      subnetMask: '255.255.255.0',
      defaultGateway: '192.168.1.1',
      macAddress: '00:15:5D:AA:BB:01',
      ports: [
        { id: 'p-up', name: 'Uplink (Router)', type: 'ethernet', position: 'left' },
        { id: 'p1', name: 'Port 1 (Učitel)', type: 'ethernet', position: 'top' },
        { id: 'p2', name: 'Port 2 (Žák Pavel)', type: 'ethernet', position: 'right' },
        { id: 'p3', name: 'Port 3 (Žákyně Lucie)', type: 'ethernet', position: 'bottom' },
      ],
      status: 'ok',
      isFixed: true,
    },
    {
      id: 'pkt-teacher-pc',
      type: 'pc-teacher',
      name: 'Učitelský PC (Veyon Master)',
      x: 340,
      y: 50,
      ip: '192.168.1.2',
      subnetMask: '255.255.255.0',
      defaultGateway: '192.168.1.1',
      macAddress: '70:85:C2:10:20:02',
      ports: [{ id: 'p-eth', name: 'LAN', type: 'ethernet', position: 'bottom' }],
      status: 'ok',
      isFixed: true,
    },
    {
      id: 'pkt-student-pavel',
      type: 'pc-student',
      name: 'Žák Pavel (Tvůj PC)',
      x: 640,
      y: 150,
      ip: '192.168.1.10',
      subnetMask: '255.255.255.0',
      defaultGateway: '192.168.1.1',
      macAddress: '70:85:C2:10:20:10',
      ports: [{ id: 'p-eth', name: 'LAN', type: 'ethernet', position: 'left' }],
      status: 'ok',
      isFixed: true,
    },
    {
      id: 'pkt-student-lucie',
      type: 'pc-student',
      name: 'Žákyně Lucie',
      x: 640,
      y: 350,
      ip: '192.168.1.11',
      subnetMask: '255.255.255.0',
      defaultGateway: '192.168.1.1',
      macAddress: '70:85:C2:10:20:11',
      ports: [{ id: 'p-eth', name: 'LAN', type: 'ethernet', position: 'left' }],
      status: 'ok',
      isFixed: true,
    },
  ];

  const connections: CableConnection[] = [
    { id: 'c-srv', fromDeviceId: 'pkt-internet-server', fromPortId: 'p-srv', toDeviceId: 'pkt-router', toPortId: 'p-wan', medium: 'cable', status: 'active' },
    { id: 'c-up', fromDeviceId: 'pkt-router', fromPortId: 'p-lan', toDeviceId: 'pkt-switch', toPortId: 'p-up', medium: 'cable', status: 'active' },
    { id: 'c-teach', fromDeviceId: 'pkt-switch', fromPortId: 'p1', toDeviceId: 'pkt-teacher-pc', toPortId: 'p-eth', medium: 'cable', status: 'active' },
    { id: 'c-pavel', fromDeviceId: 'pkt-switch', fromPortId: 'p2', toDeviceId: 'pkt-student-pavel', toPortId: 'p-eth', medium: 'cable', status: 'active' },
    { id: 'c-lucie', fromDeviceId: 'pkt-switch', fromPortId: 'p3', toDeviceId: 'pkt-student-lucie', toPortId: 'p-eth', medium: 'cable', status: 'active' },
  ];

  const [devices, setDevices] = useState<NetworkDevice[]>(initialDevices);
  const [movingDevice, setMovingDevice] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [activeScenario, setActiveScenario] = useState<'local' | 'internet' | 'ping' | null>(null);
  const [currentPacket, setCurrentPacket] = useState<DataPacket | null>(null);
  const [isSlowMotion, setIsSlowMotion] = useState<boolean>(false);
  const [stepLogs, setStepLogs] = useState<string[]>([]);
  const [completedScenarios, setCompletedScenarios] = useState<Set<string>>(new Set());

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

  const handleStartLocalTransfer = () => {
    setActiveScenario('local');
    const packet: DataPacket = {
      id: `pkt-${Date.now()}`,
      sourceDeviceId: 'pkt-student-pavel',
      targetDeviceId: 'pkt-teacher-pc',
      sourceIp: '192.168.1.10',
      targetIp: '192.168.1.2',
      payloadType: 'file-transfer',
      label: 'Úkol: projekt.pptx',
      status: 'traveling',
      currentStep: 0,
      totalSteps: 2,
      route: ['pkt-student-pavel', 'pkt-switch', 'pkt-teacher-pc'],
      explanation: 'Pavel odesílá soubor učiteli.',
    };

    setCurrentPacket(packet);
    setStepLogs([
      '1. Žák Pavel (192.168.1.10) zabalil soubor projekt.pptx do datových paketů.',
      '2. Paket dorazil do switche. Switch se podíval na cílovou IP 192.168.1.2.',
      '3. Protože cíl je v lokální síti, switch paket poslal PŘÍMO učitelskému PC. (Router ani ostatní žáci nebyli zatíženi!)',
    ]);

    sounds.playPacketSent();
  };

  const handleStartInternetRequest = () => {
    setActiveScenario('internet');
    const packet: DataPacket = {
      id: `pkt-${Date.now()}`,
      sourceDeviceId: 'pkt-student-pavel',
      targetDeviceId: 'pkt-internet-server',
      sourceIp: '192.168.1.10',
      targetIp: '142.250.180.206',
      payloadType: 'web-request',
      label: 'HTTP GET: www.google.com',
      status: 'traveling',
      currentStep: 0,
      totalSteps: 3,
      route: ['pkt-student-pavel', 'pkt-switch', 'pkt-router', 'pkt-internet-server'],
      explanation: 'Pavel otevírá webovou stránku na internetu.',
    };

    setCurrentPacket(packet);
    setStepLogs([
      '1. Prohlížeč u Pavla odesílá požadavek na cizí IP 142.250.180.206.',
      '2. Switch zjistí, že cíl NEPATŘÍ do naší školní učebny (192.168.1.x).',
      '3. Switch předá paket výchozí bráně (školnímu routeru 192.168.1.1).',
      '4. Router převede adresu (NAT) a pošle paket přes optický kabel poskytovatele až k webovému serveru v internetu!',
    ]);

    sounds.playPacketSent();
  };

  const handlePacketDelivered = () => {
    sounds.playPacketDelivered();
    if (currentPacket) {
      setCurrentPacket((prev) => (prev ? { ...prev, status: 'delivered' } : null));

      const nextScenarios = new Set(completedScenarios);
      if (activeScenario) {
        nextScenarios.add(activeScenario);
      }
      setCompletedScenarios(nextScenarios);

      if (nextScenarios.size >= 2) {
        sounds.playSuccessFanfare();
        confetti({ particleCount: 90, spread: 65, origin: { y: 0.6 } });
        onGrantBadge('packet-navigator');
        onUnlockNext('detective');
      }
    }
  };

  const handleResetSimulation = () => {
    setCurrentPacket(null);
    setActiveScenario(null);
    setStepLogs([]);
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
          <Send className="w-4 h-4 text-sky-500" />
          <span>Simulátor toku dat: LAN vs. Internet</span>
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

        {/* Cable Layer */}
        <CableLayer
          connections={connections}
          devices={devices}
          draggingCable={null}
          isProjectorMode={isProjectorMode}
        />

        {/* Animated Packet Moving Along Cables */}
        <PacketVisualizer
          packet={currentPacket}
          devices={devices}
          speed={isSlowMotion ? 0.45 : 1}
          onComplete={handlePacketDelivered}
        />

        {/* Devices */}
        {devices.map((device) => (
          <DeviceNode
            key={device.id}
            device={device}
            onHeaderMouseDown={(e) => handleDeviceHeaderMouseDown(device.id, e)}
            contextHelp={getDeviceDidacticHelp(device, 'packet', activeScenario === 'internet' ? 2 : 1)}
            showTooltips={showContextTooltips}
            isProjectorMode={isProjectorMode}
          />
        ))}

        {/* Real-time Hop Explanation Overlay */}
        {currentPacket && (
          <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-11/12 max-w-xl p-3.5 rounded-xl border shadow-2xl backdrop-blur-md ${
            isProjectorMode
              ? 'bg-white/95 border-sky-500 text-slate-900'
              : 'bg-slate-900/95 border-sky-500/40 text-slate-100'
          }`}>
            <div className={`flex items-center justify-between text-xs font-bold mb-1.5 ${
              isProjectorMode ? 'text-sky-800' : 'text-sky-300'
            }`}>
              <span className="flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5" />
                {currentPacket.label}
              </span>
              <span className={`font-mono text-[10px] ${
                isProjectorMode ? 'text-slate-600' : 'text-slate-400'
              }`}>
                {currentPacket.status === 'delivered' ? 'DORUČENO' : 'PŘENÁŠÍ SE...'}
              </span>
            </div>
            <p className={`text-[11px] leading-relaxed ${
              isProjectorMode ? 'text-slate-700' : 'text-slate-300'
            }`}>
              {currentPacket.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Control Deck */}
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
              <HardDrive className="w-4 h-4" /> Modul 3
            </div>
            <h2 className={`text-base font-bold tracking-tight mt-1 ${
              isProjectorMode ? 'text-slate-900' : 'text-white'
            }`}>
              Cesta paketu po síti
            </h2>
            <p className={`text-xs ${isProjectorMode ? 'text-slate-600' : 'text-slate-400'}`}>
              Sleduj rozdíl mezi přenosem ve třídě (LAN) a cestou do internetu
            </p>
          </div>

          {/* Scenario Trigger Buttons */}
          <div className="space-y-2">
            <span className={`text-[11px] font-semibold block ${
              isProjectorMode ? 'text-slate-700' : 'text-slate-400'
            }`}>
              Vyber simulační scénář:
            </span>

            {/* Scenario 1: Local File Transfer */}
            <button
              onClick={handleStartLocalTransfer}
              className={`w-full p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                activeScenario === 'local'
                  ? isProjectorMode
                    ? 'bg-sky-100 border-sky-400 ring-2 ring-sky-300 shadow-sm'
                    : 'bg-sky-500/20 border-sky-400 ring-2 ring-sky-400/30'
                  : isProjectorMode
                  ? 'bg-slate-50 border-slate-300 hover:border-slate-400'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${
                isProjectorMode
                  ? 'bg-sky-200 text-sky-800'
                  : 'bg-sky-500/10 text-sky-400'
              }`}>
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className={`text-xs font-bold flex items-center gap-2 ${
                  isProjectorMode ? 'text-slate-900' : 'text-slate-100'
                }`}>
                  <span>1. Poslat úkol učiteli (LAN / Veyon)</span>
                  {completedScenarios.has('local') && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                </div>
                <p className={`text-[11px] mt-0.5 leading-snug ${
                  isProjectorMode ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  Data putují z PC Pavla (.10) přes switch rovnou k učiteli (.2).
                </p>
              </div>
            </button>

            {/* Scenario 2: Internet Request */}
            <button
              onClick={handleStartInternetRequest}
              className={`w-full p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                activeScenario === 'internet'
                  ? isProjectorMode
                    ? 'bg-purple-100 border-purple-400 ring-2 ring-purple-300 shadow-sm'
                    : 'bg-purple-500/20 border-purple-400 ring-2 ring-purple-400/30'
                  : isProjectorMode
                  ? 'bg-slate-50 border-slate-300 hover:border-slate-400'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${
                isProjectorMode
                  ? 'bg-purple-200 text-purple-800'
                  : 'bg-purple-500/10 text-purple-400'
              }`}>
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <div className={`text-xs font-bold flex items-center gap-2 ${
                  isProjectorMode ? 'text-slate-900' : 'text-slate-100'
                }`}>
                  <span>2. Otevřít web Google (Internet)</span>
                  {completedScenarios.has('internet') && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                </div>
                <p className={`text-[11px] mt-0.5 leading-snug ${
                  isProjectorMode ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  Cíl je mimo LAN: switch předá paket routeru (bráně) a ten do internetu.
                </p>
              </div>
            </button>
          </div>

          {/* Playback Settings (Slow-mo) */}
          <div className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
            isProjectorMode ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800'
          }`}>
            <span className={`font-medium ${isProjectorMode ? 'text-slate-700' : 'text-slate-300'}`}>
              Zpomalený režim (0.5x):
            </span>
            <button
              onClick={() => setIsSlowMotion(!isSlowMotion)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                isSlowMotion
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : isProjectorMode
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isSlowMotion ? 'ZAPNUTO' : 'VYPNUTO'}
            </button>
          </div>

          {/* Didactic Step Log */}
          {stepLogs.length > 0 && (
            <div className={`p-3.5 rounded-xl border space-y-2 ${
              isProjectorMode ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800'
            }`}>
              <span className={`text-[11px] font-bold uppercase tracking-wider block ${
                isProjectorMode ? 'text-sky-800' : 'text-sky-300'
              }`}>
                Průběh přenosu:
              </span>
              <div className={`space-y-1.5 text-[11px] ${
                isProjectorMode ? 'text-slate-700' : 'text-slate-300'
              }`}>
                {stepLogs.map((log, index) => (
                  <div key={index} className="leading-snug">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Didactic Fact */}
          <div className={`p-3.5 rounded-xl border text-[11px] space-y-1.5 ${
            isProjectorMode
              ? 'bg-sky-50/80 border-sky-300 text-slate-700 shadow-sm'
              : 'bg-slate-950/60 border-slate-800 text-slate-400'
          }`}>
            <div className={`flex items-center gap-1.5 font-bold ${
              isProjectorMode ? 'text-sky-800' : 'text-sky-300'
            }`}>
              <Lightbulb className="w-4 h-4 text-sky-500 shrink-0" />
              <span>Proč switch neposílá vše do routeru?</span>
            </div>
            <p className="leading-relaxed">
              Switch je chytrý přepínač. Pamatuje si, ke kterému kabelu je připojen učitel a ke kterému žáci. Když komunikují dva počítače ve stejné místnosti, vyřeší to switch sám a nezatěžuje internetovou linku školy.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className={`pt-4 mt-4 border-t space-y-2 ${
          isProjectorMode ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetSimulation}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                isProjectorMode
                  ? 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset simulace
            </button>

            {completedScenarios.size >= 2 && (
              <button
                onClick={() => onUnlockNext('detective')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md"
              >
                <span>4. Detektivní režim</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};
