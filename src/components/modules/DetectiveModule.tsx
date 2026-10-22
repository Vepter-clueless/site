import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Radio,
  ArrowRight,
  RefreshCw,
  Activity,
  BookOpen,
  Eye,
  EyeOff,
} from 'lucide-react';
import { DeviceNode } from '../DeviceNode';
import { CableLayer } from '../CableLayer';
import { DeviceConfigModal } from '../DeviceConfigModal';
import { DETECTIVE_CASES } from '../../data/levels';
import { CableConnection, DetectiveCase, NetworkDevice, NetworkPort } from '../../types/network';
import { sounds } from '../../utils/soundEffects';
import { getDeviceDidacticHelp } from '../../utils/didacticTooltips';

interface DetectiveModuleProps {
  onGrantBadge: (badgeId: string) => void;
  onOpenSandbox: () => void;
  onOpenTheory: () => void;
  isProjectorMode?: boolean;
  showContextTooltips?: boolean;
}

export const DetectiveModule: React.FC<DetectiveModuleProps> = ({
  onGrantBadge,
  onOpenSandbox,
  onOpenTheory,
  isProjectorMode = false,
  showContextTooltips = false,
}) => {
  const [currentCaseIndex, setCurrentCaseIndex] = useState<number>(0);
  const activeCase: DetectiveCase = DETECTIVE_CASES[currentCaseIndex];

  const [devices, setDevices] = useState<NetworkDevice[]>(activeCase.devices);
  const [connections, setConnections] = useState<CableConnection[]>(activeCase.connections);
  const [selectedDevice, setSelectedDevice] = useState<NetworkDevice | null>(null);
  const [editingDevice, setEditingDevice] = useState<NetworkDevice | null>(null);

  // Click-to-connect state
  const [connectionSourceDevId, setConnectionSourceDevId] = useState<string | null>(null);

  // Move device state
  const [movingDevice, setMovingDevice] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // Guide hints toggle
  const [showGuideHints, setShowGuideHints] = useState<boolean>(false);

  // Ping tool states
  const [pingTargetIp, setPingTargetIp] = useState<string>('192.168.1.1');
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState<boolean>(false);

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

  // Validation
  const [validationResult, setValidationResult] = useState<{
    isFixed: boolean;
    reason: string;
  } | null>(null);
  const [solvedCases, setSolvedCases] = useState<number[]>([]);

  const canvasRef = useRef<HTMLDivElement>(null);

  const handleSelectCase = (index: number) => {
    setCurrentCaseIndex(index);
    const targetCase = DETECTIVE_CASES[index];
    setDevices(targetCase.devices);
    setConnections(targetCase.connections);
    setSelectedDevice(null);
    setEditingDevice(null);
    setValidationResult(null);
    setPingResult(null);
    setConnectionSourceDevId(null);
    setShowGuideHints(false);
    sounds.playCableDisconnect();
  };

  const handleResetCurrentCase = () => {
    const targetCase = DETECTIVE_CASES[currentCaseIndex];
    setDevices(targetCase.devices);
    setConnections(targetCase.connections);
    setValidationResult(null);
    setPingResult(null);
    setConnectionSourceDevId(null);
    sounds.playCableDisconnect();
  };

  const handleSaveDeviceConfig = (updated: NetworkDevice) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d))
    );
    sounds.playPacketSent();
  };

  // Device drag header
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
          draggingCable.targetPort.portId
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
      medium: 'cable',
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

    const sPort = sDev.ports[0];
    const tPort = tDev.ports[0];

    connectDevices(sDev.id, sPort.id, tDev.id, tPort.id);
    setConnectionSourceDevId(null);
  };

  const connectDevices = (
    fromDevId: string,
    fromPId: string,
    toDevId: string,
    toPId: string
  ) => {
    const exists = connections.some(
      (c) =>
        (c.fromDeviceId === fromDevId && c.toDeviceId === toDevId) ||
        (c.fromDeviceId === toDevId && c.toDeviceId === fromDevId)
    );

    if (!exists) {
      const newConn: CableConnection = {
        id: `conn-det-${Date.now()}`,
        fromDeviceId: fromDevId,
        fromPortId: fromPId,
        toDeviceId: toDevId,
        toPortId: toPId,
        medium: 'cable',
        status: 'active',
      };
      setConnections((prev) => [...prev, newConn]);
      sounds.playCableConnect();

      setDevices((prevDevs) =>
        prevDevs.map((d) =>
          d.id === fromDevId || d.id === toDevId
            ? { ...d, status: d.status === 'unconnected' ? 'ok' : d.status }
            : d
        )
      );
    }
  };

  // Run ping test
  const handleRunPing = () => {
    setIsPinging(true);
    setPingResult('Odesílám 4x ICMP echo packet...');
    sounds.playPing();

    setTimeout(() => {
      setIsPinging(false);
      const targetDev = devices.find((d) => d.ip === pingTargetIp);
      if (!targetDev) {
        sounds.playCollision();
        setPingResult(`PING ${pingTargetIp}: Cíl nebyl v síti nalezen! (Request Timed Out, 100% loss)`);
        return;
      }

      if (currentCaseIndex === 0 && targetDev.id === 'det-pc3-broken') {
        const isConn = connections.some(
          (c) => c.fromDeviceId === 'det-pc3-broken' || c.toDeviceId === 'det-pc3-broken'
        );
        if (!isConn) {
          sounds.playCollision();
          setPingResult(`PING ${pingTargetIp}: Cíl neodpovídá! Kabel je odpojen ze switche.`);
          return;
        }
      }

      if (currentCaseIndex === 1) {
        const petr = devices.find((d) => d.id === 'det-pc-petr');
        const jana = devices.find((d) => d.id === 'det-pc-jana');
        if (petr?.ip === jana?.ip && pingTargetIp === petr?.ip) {
          sounds.playCollision();
          setPingResult(`PING ${pingTargetIp}: Kolize! Na stejné IP odpovídají 2 zařízení současně!`);
          return;
        }
      }

      if (currentCaseIndex === 2 && targetDev.id === 'det-laptop-wrong') {
        if (!targetDev.ip.startsWith('192.168.1.')) {
          sounds.playCollision();
          setPingResult(`PING ${pingTargetIp}: Cíl je v cizí síti ${targetDev.ip} (mimo podsíť 192.168.1.x)!`);
          return;
        }
      }

      if (currentCaseIndex === 3 && targetDev.id === 'det-pc-klara') {
        if (targetDev.defaultGateway !== '192.168.1.1' && pingTargetIp === '192.168.1.1') {
          sounds.playPacketDelivered();
          setPingResult(`PING 192.168.1.1: Router odpověděl, ale v síťové kartě Kláry chybí Výchozí brána.`);
          return;
        }
      }

      if (currentCaseIndex === 4) {
        const hasUplink = connections.some(
          (c) => (c.fromDeviceId === 'det-r5' && c.toDeviceId === 'det-sw5') ||
                 (c.toDeviceId === 'det-r5' && c.fromDeviceId === 'det-sw5')
        );
        if (!hasUplink && (targetDev.id === 'det-r5' || pingTargetIp === '192.168.1.1')) {
          sounds.playCollision();
          setPingResult(`PING 192.168.1.1: Spojení selhalo! Chybí propojovací kabel mezi switchem a routerem.`);
          return;
        }
      }

      sounds.playPacketDelivered();
      setPingResult(`PING ${pingTargetIp}: Úspěch! 4 odpovědi přijaty, čas <1ms. (0% ztráta paketů)`);
    }, 550);
  };

  // Check solution
  const handleVerifyCase = () => {
    const result = activeCase.validateFix(devices, connections);
    setValidationResult(result);

    if (result.isFixed) {
      sounds.playSuccessFanfare();
      confetti({ particleCount: 90, spread: 65, origin: { y: 0.6 } });

      const nextSolved = Array.from(new Set([...solvedCases, currentCaseIndex]));
      setSolvedCases(nextSolved);

      if (nextSolved.length === 1) {
        onGrantBadge('detective-bronze');
      }
      if (nextSolved.length === DETECTIVE_CASES.length) {
        onGrantBadge('detective-gold');
      }
    } else {
      sounds.playCollision();
    }
  };

  // Guide hints for detective cases
  const detectiveGuideHints = showGuideHints
    ? currentCaseIndex === 0
      ? [{ fromDeviceId: 'det-pc3-broken', toDeviceId: 'det-sw1', label: 'Zastrčit kabel' }]
      : currentCaseIndex === 4
      ? [{ fromDeviceId: 'det-sw5', toDeviceId: 'det-r5', label: 'Uplink' }]
      : []
    : [];

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

        {/* Ambient Case Banner */}
        <div className={`absolute top-4 left-4 right-4 z-20 flex items-center justify-between p-3 rounded-xl border backdrop-blur-md shadow-sm ${
          isProjectorMode
            ? 'bg-white/95 border-slate-300 text-slate-800'
            : 'bg-slate-900/90 border-slate-800 text-slate-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${
              isProjectorMode
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className={`text-xs font-bold flex items-center gap-2 ${
                isProjectorMode ? 'text-slate-900' : 'text-white'
              }`}>
                <span>{activeCase.title}</span>
                <span className={`text-[10px] ${isProjectorMode ? 'text-slate-500' : 'text-slate-400'}`}>· Hlásí: {activeCase.reporter}</span>
              </div>
              <p className={`text-[11px] italic mt-0.5 ${
                isProjectorMode ? 'text-slate-600' : 'text-slate-300'
              }`}>
                {activeCase.problemReport}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(currentCaseIndex === 0 || currentCaseIndex === 4) && (
              <button
                onClick={() => setShowGuideHints(!showGuideHints)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm ${
                  showGuideHints
                    ? 'bg-emerald-600 border-emerald-700 text-white'
                    : isProjectorMode
                    ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {showGuideHints ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-emerald-500" />}
                <span>{showGuideHints ? 'Skrýt kabel' : 'Nápověda kabelu'}</span>
              </button>
            )}

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

        {/* Connection Source Banner */}
        {connectionSourceDevId && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2 rounded-xl bg-sky-600 border border-sky-400 text-white text-xs font-bold shadow-2xl backdrop-blur-md animate-bounce">
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
          guideHints={detectiveGuideHints}
          isProjectorMode={isProjectorMode}
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
              contextHelp={getDeviceDidacticHelp(device, 'detective', undefined, currentCaseIndex)}
              showTooltips={showContextTooltips}
              isProjectorMode={isProjectorMode}
            />
          );
        })}

        {/* Config Modal */}
        <DeviceConfigModal
          device={editingDevice}
          onClose={() => setEditingDevice(null)}
          onSave={handleSaveDeviceConfig}
          isProjectorMode={isProjectorMode}
        />
      </div>

      {/* Detective Tool & Dossier Deck */}
      <aside className={`w-full xl:w-96 p-5 border-l flex flex-col justify-between overflow-y-auto transition-colors ${
        isProjectorMode
          ? 'bg-white border-slate-200 text-slate-900 shadow-md'
          : 'bg-slate-900/70 border-slate-800 text-slate-100 backdrop-blur-md'
      }`}>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
                isProjectorMode ? 'text-rose-700' : 'text-rose-400'
              }`}>
                <Search className="w-4 h-4" /> Detektivní spis
              </div>
              <span className={`text-xs font-mono ${isProjectorMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Případ {currentCaseIndex + 1} z {DETECTIVE_CASES.length}
              </span>
            </div>

            {/* Cases Navigation Carousel */}
            <div className="flex items-center gap-1.5 mt-2">
              {DETECTIVE_CASES.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectCase(i)}
                  className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold transition-all border ${
                    currentCaseIndex === i
                      ? 'bg-rose-500 text-white border-rose-400 shadow-md'
                      : solvedCases.includes(i)
                      ? isProjectorMode
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                        : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                      : isProjectorMode
                      ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  #{i + 1}
                  {solvedCases.includes(i) && ' ✓'}
                </button>
              ))}
            </div>
          </div>

          {/* Symptom & Clue */}
          <div className={`p-3.5 rounded-xl border space-y-2 text-xs ${
            isProjectorMode ? 'bg-amber-50/60 border-amber-300' : 'bg-slate-950 border-slate-800'
          }`}>
            <div className={`flex items-center gap-1.5 font-bold ${
              isProjectorMode ? 'text-amber-800' : 'text-amber-300'
            }`}>
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Zjištěné příznaky:</span>
            </div>
            <p className={`leading-relaxed text-[11px] ${
              isProjectorMode ? 'text-slate-700' : 'text-slate-300'
            }`}>
              {activeCase.symptom}
            </p>

            <div className={`pt-2 border-t text-[11px] ${
              isProjectorMode ? 'border-amber-200 text-slate-600' : 'border-slate-800 text-slate-400'
            }`}>
              <span className={`font-semibold ${isProjectorMode ? 'text-sky-700' : 'text-sky-300'}`}>Nápověda detektiva: </span>
              {activeCase.hint}
            </div>
          </div>

          {/* Diagnostic Tool: Ping Console */}
          <div className={`p-3.5 rounded-xl border space-y-2.5 ${
            isProjectorMode ? 'bg-slate-50 border-slate-300' : 'bg-slate-950/80 border-slate-800'
          }`}>
            <div className={`flex items-center gap-1.5 text-xs font-bold ${
              isProjectorMode ? 'text-sky-800' : 'text-sky-300'
            }`}>
              <Activity className="w-4 h-4 text-sky-500" />
              <span>Diagnostický PING test</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={pingTargetIp}
                onChange={(e) => setPingTargetIp(e.target.value)}
                placeholder="Cílová IP (např. 192.168.1.1)"
                className={`flex-1 px-2.5 py-1.5 rounded-lg text-xs font-mono focus:outline-none ${
                  isProjectorMode
                    ? 'bg-white border border-slate-300 text-sky-800 focus:border-sky-500'
                    : 'bg-slate-900 border border-slate-700 text-sky-300 focus:border-sky-400'
                }`}
              />
              <button
                onClick={handleRunPing}
                disabled={isPinging}
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold disabled:opacity-50 transition-colors shadow-sm"
              >
                {isPinging ? 'Testuji...' : 'Odeslat PING'}
              </button>
            </div>

            {pingResult && (
              <div className={`p-2 rounded-lg font-mono text-[10px] leading-normal border ${
                isProjectorMode
                  ? 'bg-white border-slate-300 text-slate-800'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}>
                {pingResult}
              </div>
            )}
          </div>

          {/* Validation Result */}
          {validationResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                validationResult.isFixed
                  ? isProjectorMode
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                  : isProjectorMode
                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                  : 'bg-rose-950/80 border-rose-500 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {validationResult.isFixed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{validationResult.isFixed ? 'Případ úspěšně vyřešen!' : 'Problém stále přetrvává'}</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {validationResult.reason}
              </p>
            </div>
          )}

          {/* Didactic Fact */}
          <div className={`p-3.5 rounded-xl border text-[11px] space-y-1 ${
            isProjectorMode
              ? 'bg-purple-50/70 border-purple-200 text-slate-700'
              : 'bg-slate-950/50 border-slate-800/80 text-slate-400'
          }`}>
            <span className={`font-bold block ${isProjectorMode ? 'text-purple-800' : 'text-purple-300'}`}>Zlaté pravidlo správce sítě:</span>
            <p className="leading-relaxed">
              {activeCase.didacticFact}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className={`pt-4 mt-4 border-t space-y-2 ${
          isProjectorMode ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <button
            onClick={handleVerifyCase}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01]"
          >
            <CheckCircle2 className="w-4 h-4" /> Zkontrolovat vyřešení případu
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetCurrentCase}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                isProjectorMode
                  ? 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset případu
            </button>

            {currentCaseIndex < DETECTIVE_CASES.length - 1 ? (
              <button
                onClick={() => handleSelectCase(currentCaseIndex + 1)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow-md"
              >
                <span>Další případ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onOpenSandbox}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md"
              >
                <span>Pískoviště</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};
