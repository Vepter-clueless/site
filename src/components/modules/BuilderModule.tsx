import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  RefreshCw,
  Lightbulb,
  ArrowRight,
  Sparkles,
  Info,
  Tv,
  BookOpen,
  Eye,
  EyeOff,
  Move,
} from 'lucide-react';
import { DeviceNode } from '../DeviceNode';
import { CableLayer } from '../CableLayer';
import { CableConnection, NetworkDevice, NetworkPort } from '../../types/network';
import { HOME_NETWORK_LEVEL, SCHOOL_NETWORK_LEVEL, LevelInfo } from '../../data/levels';
import { sounds } from '../../utils/soundEffects';
import { getDeviceDidacticHelp } from '../../utils/didacticTooltips';

interface BuilderModuleProps {
  onUnlockNext: (nextModuleId: 'dhcp') => void;
  onGrantBadge: (badgeId: string) => void;
  onOpenTheory: () => void;
  isProjectorMode?: boolean;
  showContextTooltips?: boolean;
}

export const BuilderModule: React.FC<BuilderModuleProps> = ({
  onUnlockNext,
  onGrantBadge,
  onOpenTheory,
  isProjectorMode = false,
  showContextTooltips = false,
}) => {
  const [currentLevelIndex, setCurrentLevelIndex] = useState<1 | 2>(1);
  const currentLevel: LevelInfo =
    currentLevelIndex === 1 ? HOME_NETWORK_LEVEL : SCHOOL_NETWORK_LEVEL;

  const [devices, setDevices] = useState<NetworkDevice[]>(currentLevel.devices);
  const [connections, setConnections] = useState<CableConnection[]>(currentLevel.connections);

  // Click-to-connect state (Super intuitive: click Device A -> click Device B)
  const [connectionSourceDevId, setConnectionSourceDevId] = useState<string | null>(null);

  // Device moving state
  const [movingDevice, setMovingDevice] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // Cable dragging state
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

  // Show guide hints
  const [showGuideHints, setShowGuideHints] = useState<boolean>(false);

  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    message: string;
    missingTips: string[];
  } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  const switchLevel = (lvl: 1 | 2) => {
    setCurrentLevelIndex(lvl);
    const target = lvl === 1 ? HOME_NETWORK_LEVEL : SCHOOL_NETWORK_LEVEL;
    setDevices(target.devices);
    setConnections(target.connections);
    setValidationResult(null);
    setConnectionSourceDevId(null);
    setDraggingCable(null);
    setShowGuideHints(false);
  };

  const handleResetLevel = () => {
    const target = currentLevelIndex === 1 ? HOME_NETWORK_LEVEL : SCHOOL_NETWORK_LEVEL;
    setDevices(target.devices);
    setConnections(target.connections);
    setValidationResult(null);
    setConnectionSourceDevId(null);
    setDraggingCable(null);
    sounds.playCableDisconnect();
  };

  // Move Device handler
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

  // Canvas Mouse Move (Handles both moving devices and dragging cables)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const curX = e.clientX - canvasRect.left;
    const curY = e.clientY - canvasRect.top;

    // Moving a device block
    if (movingDevice) {
      const newX = Math.max(10, Math.min(canvasRect.width - 240, curX - movingDevice.offsetX));
      const newY = Math.max(10, Math.min(canvasRect.height - 200, curY - movingDevice.offsetY));

      setDevices((prev) =>
        prev.map((d) => (d.id === movingDevice.id ? { ...d, x: newX, y: newY } : d))
      );
      return;
    }

    // Dragging a cable
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
          const isWifiConn = draggingCable.medium === 'wifi';
          if (isWifiConn && p.type !== 'wifi') return;
          if (!isWifiConn && p.type === 'wifi') return;

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
    if (movingDevice) {
      setMovingDevice(null);
    }

    if (draggingCable) {
      if (draggingCable.targetPort) {
        createConnection(
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

  // Port mouse down for dragging
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

  // Super intuitive Click-to-Connect
  const handleStartConnection = (sourceDevId: string) => {
    setConnectionSourceDevId(sourceDevId);
  };

  const handleCompleteConnection = (targetDevId: string) => {
    if (!connectionSourceDevId || connectionSourceDevId === targetDevId) {
      setConnectionSourceDevId(null);
      return;
    }

    const sourceDev = devices.find((d) => d.id === connectionSourceDevId);
    const targetDev = devices.find((d) => d.id === targetDevId);
    if (!sourceDev || !targetDev) {
      setConnectionSourceDevId(null);
      return;
    }

    // Determine medium
    const isWifi =
      sourceDev.ports.some((p) => p.type === 'wifi') &&
      targetDev.ports.some((p) => p.type === 'wifi');

    // Find first compatible free ports
    const sourcePort =
      sourceDev.ports.find((p) => isWifi ? p.type === 'wifi' : p.type !== 'wifi') ||
      sourceDev.ports[0];

    const targetPort =
      targetDev.ports.find((p) => isWifi ? p.type === 'wifi' : p.type !== 'wifi') ||
      targetDev.ports[0];

    createConnection(
      sourceDev.id,
      sourcePort.id,
      targetDev.id,
      targetPort.id,
      isWifi ? 'wifi' : 'cable'
    );

    setConnectionSourceDevId(null);
  };

  const createConnection = (
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

    if (exists) {
      sounds.playCollision();
      return;
    }

    const newConnection: CableConnection = {
      id: `conn-${Date.now()}`,
      fromDeviceId: fromDevId,
      fromPortId: fromPId,
      toDeviceId: toDevId,
      toPortId: toPId,
      medium,
      status: 'active',
    };

    setConnections((prev) => [...prev, newConnection]);
    sounds.playCableConnect();
    onGrantBadge('first-cable');

    setDevices((prevDevs) =>
      prevDevs.map((dev) => {
        if (dev.id === fromDevId || dev.id === toDevId) {
          return {
            ...dev,
            status: 'ok',
            ports: dev.ports.map((p) => {
              if (
                (dev.id === fromDevId && p.id === fromPId) ||
                (dev.id === toDevId && p.id === toPId)
              ) {
                return { ...p, connectedCableId: newConnection.id };
              }
              return p;
            }),
          };
        }
        return dev;
      })
    );

    setValidationResult(null);
  };

  const handleDisconnectCable = (cableId: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== cableId));
    sounds.playCableDisconnect();

    setDevices((prevDevs) =>
      prevDevs.map((dev) => {
        const remainingConns = connections.filter(
          (c) =>
            c.id !== cableId &&
            (c.fromDeviceId === dev.id || c.toDeviceId === dev.id)
        );
        return {
          ...dev,
          status: remainingConns.length > 0 || dev.isFixed ? dev.status : 'unconnected',
          ports: dev.ports.map((p) =>
            p.connectedCableId === cableId ? { ...p, connectedCableId: undefined } : p
          ),
        };
      })
    );
    setValidationResult(null);
  };

  // Validation function
  const handleValidateTopology = () => {
    const tips: string[] = [];

    if (currentLevelIndex === 1) {
      const router = devices.find((d) => d.id === 'dev-router-home');
      const laptop = devices.find((d) => d.id === 'dev-laptop-home');
      const phone = devices.find((d) => d.id === 'dev-phone-home');
      const tv = devices.find((d) => d.id === 'dev-tv-home');

      const isConnectedToRouter = (devId: string) =>
        connections.some(
          (c) =>
            (c.fromDeviceId === devId && c.toDeviceId === router?.id) ||
            (c.toDeviceId === devId && c.fromDeviceId === router?.id)
        );

      if (laptop && !isConnectedToRouter(laptop.id)) {
        tips.push('Notebook není bezdrátově připojen k Wi-Fi routeru.');
      }
      if (phone && !isConnectedToRouter(phone.id)) {
        tips.push('Chytrý mobil není připojen k Wi-Fi síti.');
      }
      if (tv && !isConnectedToRouter(tv.id)) {
        tips.push('Chytrá televize nemá navázané spojení s routerem.');
      }

      if (tips.length === 0) {
        sounds.playSuccessFanfare();
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        onGrantBadge('home-architect');
        setValidationResult({
          success: true,
          message: 'Vynikající práce! Všechna domácí zařízení jsou bezdrátově propojena s Wi-Fi routerem.',
          missingTips: [],
        });
      } else {
        sounds.playCollision();
        setValidationResult({
          success: false,
          message: 'V domácí síti ještě chybí některá propojení:',
          missingTips: tips,
        });
      }
    } else {
      const router = devices.find((d) => d.id === 'dev-school-router');
      const sw = devices.find((d) => d.id === 'dev-school-switch');
      const teacher = devices.find((d) => d.id === 'dev-teacher-pc');
      const st1 = devices.find((d) => d.id === 'dev-student1-pc');
      const st2 = devices.find((d) => d.id === 'dev-student2-pc');
      const st3 = devices.find((d) => d.id === 'dev-student3-pc');

      const switchConnectedToRouter = connections.some(
        (c) =>
          (c.fromDeviceId === sw?.id && c.toDeviceId === router?.id) ||
          (c.toDeviceId === sw?.id && c.fromDeviceId === router?.id)
      );
      if (!switchConnectedToRouter) {
        tips.push('Switch není propojen kabelem se školním routerem (chybí páteřní kabel / Uplink do internetu).');
      }

      const isConnectedToSwitch = (devId: string) =>
        connections.some(
          (c) =>
            (c.fromDeviceId === devId && c.toDeviceId === sw?.id) ||
            (c.toDeviceId === devId && c.fromDeviceId === sw?.id)
        );

      if (teacher && !isConnectedToSwitch(teacher.id)) {
        tips.push('Učitelský PC není zapojen kabelem do switche.');
      }
      if (st1 && !isConnectedToSwitch(st1.id)) {
        tips.push('Počítač Žáka 1 není zapojen do switche.');
      }
      if (st2 && !isConnectedToSwitch(st2.id)) {
        tips.push('Počítač Žáka 2 není zapojen do switche.');
      }
      if (st3 && !isConnectedToSwitch(st3.id)) {
        tips.push('Počítač Žáka 3 není zapojen do switche.');
      }

      const directStudentLinks = connections.filter(
        (c) =>
          (c.fromDeviceId.startsWith('dev-student') && c.toDeviceId.startsWith('dev-student')) ||
          (c.fromDeviceId.startsWith('dev-student') && c.toDeviceId === router?.id) ||
          (c.toDeviceId.startsWith('dev-student') && c.fromDeviceId === router?.id)
      );
      if (directStudentLinks.length > 0) {
        tips.push('Pozor: Ve školní učebně se počítače nezapojují přímo do sebe ani do routeru, ale VŠECHNY do centrálního switche!');
      }

      if (tips.length === 0) {
        sounds.playSuccessFanfare();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        onGrantBadge('school-sysadmin');
        onUnlockNext('dhcp');
        setValidationResult({
          success: true,
          message: 'Gratulujeme! Školní učebna má dokonalou hvězdicovou topologii se switchem a routerem.',
          missingTips: [],
        });
      } else {
        sounds.playCollision();
        setValidationResult({
          success: false,
          message: 'Školní učebna ještě není správně zapojená:',
          missingTips: tips,
        });
      }
    }
  };

  // Guide hints definitions
  const guideHints = showGuideHints
    ? currentLevelIndex === 1
      ? [
          { fromDeviceId: 'dev-laptop-home', toDeviceId: 'dev-router-home', label: 'Wi-Fi' },
          { fromDeviceId: 'dev-phone-home', toDeviceId: 'dev-router-home', label: 'Wi-Fi' },
          { fromDeviceId: 'dev-tv-home', toDeviceId: 'dev-router-home', label: 'Wi-Fi' },
        ]
      : [
          { fromDeviceId: 'dev-school-switch', toDeviceId: 'dev-school-router', label: 'Uplink kabel' },
          { fromDeviceId: 'dev-teacher-pc', toDeviceId: 'dev-school-switch', label: 'UTP kabel' },
          { fromDeviceId: 'dev-student1-pc', toDeviceId: 'dev-school-switch', label: 'UTP kabel' },
          { fromDeviceId: 'dev-student2-pc', toDeviceId: 'dev-school-switch', label: 'UTP kabel' },
          { fromDeviceId: 'dev-student3-pc', toDeviceId: 'dev-school-switch', label: 'UTP kabel' },
        ]
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

        {/* Ambient Top Tag */}
        <div className={`absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-sm text-xs font-semibold shadow-sm ${
          isProjectorMode
            ? 'bg-white/95 border-slate-300 text-slate-800'
            : 'bg-slate-900/80 border-slate-800 text-slate-300'
        }`}>
          {currentLevelIndex === 1 ? (
            <>
              <Tv className="w-4 h-4 text-purple-500" />
              <span>Domácí Wi-Fi síť (Bezdrátová WLAN)</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-sky-500" />
              <span>Školní učebna ZŠ (Hvězdicová topologie se switchem)</span>
            </>
          )}
          <span className="text-[10px] text-slate-500 ml-2 hidden sm:inline">
            💡 Bloky můžeš volně přetahovat myší za záhlaví
          </span>
        </div>

        {/* Top-Right Quick Helper Tools */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={() => setShowGuideHints(!showGuideHints)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm ${
              showGuideHints
                ? 'bg-emerald-600 text-white border-emerald-700'
                : isProjectorMode
                ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            {showGuideHints ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-emerald-500" />}
            <span>{showGuideHints ? 'Skrýt vodící linky' : 'Ukázat nápovědu zapojení'}</span>
          </button>

          <button
            onClick={onOpenTheory}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border shadow-sm ${
              isProjectorMode
                ? 'bg-sky-50 border-sky-300 text-sky-800 hover:bg-sky-100'
                : 'bg-sky-950/80 border-sky-500/40 text-sky-300 hover:bg-sky-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-500" />
            <span>Slabikář & Teorie</span>
          </button>
        </div>

        {/* Connection Pending Banner */}
        {connectionSourceDevId && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-sky-600 border border-sky-400 text-white text-xs font-bold shadow-2xl backdrop-blur-md animate-bounce">
            <Sparkles className="w-4 h-4 text-white" />
            <span>
              Vybráno zařízení: Klikni na cílové zařízení (Switch nebo Router) pro propojení!
            </span>
            <button
              onClick={() => setConnectionSourceDevId(null)}
              className="px-2 py-0.5 rounded bg-slate-900/60 hover:bg-slate-900 text-white text-[10px]"
            >
              Zrušit
            </button>
          </div>
        )}

        {/* SVG Cable Layer */}
        <CableLayer
          connections={connections}
          devices={devices}
          draggingCable={draggingCable}
          onDisconnectCable={handleDisconnectCable}
          guideHints={guideHints}
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
              isConnectionSource={isSource}
              isValidConnectionTarget={isTarget}
              highlightPortId={
                draggingCable?.targetPort?.deviceId === device.id
                  ? draggingCable.targetPort.portId
                  : null
              }
              contextHelp={getDeviceDidacticHelp(device, 'builder', currentLevelIndex)}
              showTooltips={showContextTooltips}
              isProjectorMode={isProjectorMode}
              onHeaderMouseDown={(e) => handleDeviceHeaderMouseDown(device.id, e)}
              onStartConnection={() => handleStartConnection(device.id)}
              onTargetClick={() => handleCompleteConnection(device.id)}
              onPortMouseDown={(port, e) => handlePortMouseDown(device.id, port, e)}
              onPortClick={() => {
                if (connectionSourceDevId) {
                  handleCompleteConnection(device.id);
                } else {
                  handleStartConnection(device.id);
                }
              }}
            />
          );
        })}
      </div>

      {/* Control & Concept Deck */}
      <aside className={`w-full xl:w-96 p-5 border-l flex flex-col justify-between overflow-y-auto transition-colors ${
        isProjectorMode
          ? 'bg-white border-slate-200 text-slate-900 shadow-md'
          : 'bg-slate-900/70 border-slate-800 text-slate-100 backdrop-blur-md'
      }`}>
        <div className="space-y-4">
          {/* Level Switcher */}
          <div className={`flex items-center gap-1.5 p-1 rounded-xl border ${
            isProjectorMode ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800'
          }`}>
            <button
              onClick={() => switchLevel(1)}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors ${
                currentLevelIndex === 1
                  ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
                  : isProjectorMode ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Domácí síť
            </button>
            <button
              onClick={() => switchLevel(2)}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors ${
                currentLevelIndex === 2
                  ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
                  : isProjectorMode ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Počítačová učebna
            </button>
          </div>

          {/* Level Header */}
          <div>
            <h2 className="text-base font-bold tracking-tight">
              {currentLevel.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{currentLevel.subtitle}</p>
          </div>

          {/* Task Instructions */}
          <div className={`p-3.5 rounded-xl border text-xs space-y-2 ${
            isProjectorMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="flex items-center gap-2 font-bold text-sky-600 dark:text-sky-300">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Tvůj úkol:</span>
            </div>
            <p className={`leading-relaxed text-[11px] ${isProjectorMode ? 'text-slate-700' : 'text-slate-300'}`}>
              {currentLevel.instructions}
            </p>
            <div className={`pt-2 border-t text-[11px] font-semibold flex items-center gap-1.5 ${
              isProjectorMode ? 'border-slate-200 text-emerald-700' : 'border-slate-800/80 text-emerald-400'
            }`}>
              <span>👉 2 způsoby zapojení:</span>
              <span className={`font-normal ${isProjectorMode ? 'text-slate-600' : 'text-slate-400'}`}>
                Klikni na „Propojit“ nebo přetáhni kabel z portu myší!
              </span>
            </div>
          </div>

          {/* Didactic Concept Card */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-purple-300">
              <Info className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Jak to funguje v reálném světě:</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {currentLevel.didacticConcept}
            </p>
            <div className="p-2 rounded-lg bg-purple-950/30 border border-purple-500/20 text-purple-200 text-[11px] italic">
              💡 {currentLevel.analogousStory}
            </div>
          </div>

          {/* Validation Result Box */}
          {validationResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-all ${
                validationResult.success
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/70 border-rose-500/50 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2
                  className={`w-4 h-4 ${
                    validationResult.success ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                />
                <span>{validationResult.message}</span>
              </div>
              {validationResult.missingTips.length > 0 && (
                <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-300 pl-1 mt-1">
                  {validationResult.missingTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-4 mt-4 border-t border-slate-800 space-y-2">
          <button
            onClick={handleValidateTopology}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.01]"
          >
            <CheckCircle2 className="w-4 h-4" /> Zkontrolovat zapojení sítě
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetLevel}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Odpojit kabely
            </button>

            {validationResult?.success && currentLevelIndex === 1 && (
              <button
                onClick={() => switchLevel(2)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md"
              >
                <span>Do učebny</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};
