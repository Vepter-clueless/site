import React from 'react';
import {
  Network,
  Volume2,
  VolumeX,
  Award,
  RotateCcw,
  BookOpen,
  Sun,
  Moon,
  HelpCircle,
} from 'lucide-react';
import { ModuleId } from '../types/network';

interface TopBarProps {
  currentModule: ModuleId;
  onSelectModule: (module: ModuleId) => void;
  unlockedModules: ModuleId[];
  unlockedBadgesCount: number;
  totalBadgesCount: number;
  onOpenBadges: () => void;
  onOpenTheory: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onResetProgress: () => void;
  // Projector and Tooltip modes
  isProjectorMode: boolean;
  onToggleProjectorMode: () => void;
  showContextTooltips: boolean;
  onToggleTooltips: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentModule,
  onSelectModule,
  unlockedModules,
  unlockedBadgesCount,
  totalBadgesCount,
  onOpenBadges,
  onOpenTheory,
  isMuted,
  onToggleMute,
  onResetProgress,
  isProjectorMode,
  onToggleProjectorMode,
  showContextTooltips,
  onToggleTooltips,
}) => {
  const navItems: { id: ModuleId; label: string }[] = [
    { id: 'builder', label: '1. Stavitel sítě' },
    { id: 'dhcp', label: '2. Hra na DHCP' },
    { id: 'packet', label: '3. Cesta paketu' },
    { id: 'detective', label: '4. Detektivní režim' },
    { id: 'sandbox', label: 'Volné pískoviště' },
  ];

  return (
    <header className={`flex items-center justify-between gap-4 lg:gap-8 px-6 py-3 border-b sticky top-0 z-40 transition-colors ${
      isProjectorMode
        ? 'bg-white border-slate-300 text-slate-900 shadow-sm'
        : 'bg-slate-950/80 border-slate-800 text-slate-100 backdrop-blur-md'
    }`}>
      {/* Zone 1: Wordmark */}
      <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          isProjectorMode
            ? 'bg-sky-100 text-sky-700 border border-sky-300'
            : 'bg-sky-500/10 text-sky-400 border border-sky-400/30'
        }`}>
          <Network className="w-5 h-5" />
        </div>
        <span className={`text-base font-bold tracking-tight ${
          isProjectorMode ? 'text-slate-900' : 'text-white'
        }`}>
          Síťový Průzkumník
        </span>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden lg:flex items-center gap-1">
        {navItems.map((item) => {
          const isUnlocked = unlockedModules.includes(item.id);
          const isActive = currentModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => isUnlocked && onSelectModule(item.id)}
              disabled={!isUnlocked}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                isActive
                  ? isProjectorMode
                    ? 'bg-sky-100 text-sky-800 border border-sky-300 font-bold shadow-sm'
                    : 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold shadow-sm'
                  : isUnlocked
                  ? isProjectorMode
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  : 'text-slate-400 opacity-40 cursor-not-allowed'
              }`}
            >
              {item.label}
              {!isUnlocked && <span className="text-[10px]">🔒</span>}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Actions (Tooltips, Projector, Theory, Badges, Sound, Reset) */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Contextual Tooltip Toggle (User requested toggle for tooltips!) */}
        <button
          onClick={onToggleTooltips}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
            showContextTooltips
              ? 'bg-amber-100 text-amber-900 border-amber-400 ring-2 ring-amber-400/40 shadow-sm'
              : isProjectorMode
              ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Zapnout/vypnout vysvětlující bubliny při najetí myší na síťový prvek"
        >
          <HelpCircle className={`w-4 h-4 ${showContextTooltips ? 'text-amber-600' : 'text-slate-400'}`} />
          <span className="hidden sm:inline">
            {showContextTooltips ? 'Bubliny: ZAP' : 'Bubliny: VYP'}
          </span>
        </button>

        {/* Projector Light Mode Toggle (Crucial for classroom projection!) */}
        <button
          onClick={onToggleProjectorMode}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
            isProjectorMode
              ? 'bg-sky-600 text-white border-sky-700 shadow-md ring-2 ring-sky-300'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
          title="Přepnout na světlé pozadí s vysokým kontrastem pro promítání na projektor"
        >
          {isProjectorMode ? (
            <>
              <Sun className="w-4 h-4 text-amber-300" />
              <span className="hidden md:inline">Projektor (Světlý)</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-400" />
              <span className="hidden md:inline">Režim projektoru</span>
            </>
          )}
        </button>

        {/* Theory & Slabikář Button */}
        <button
          onClick={onOpenTheory}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap border ${
            isProjectorMode
              ? 'bg-sky-50 text-sky-800 border-sky-300 hover:bg-sky-100'
              : 'bg-sky-950/80 border-sky-500/40 text-sky-300 hover:bg-sky-900'
          }`}
          title="Zobrazit teorii sítí a návod"
        >
          <BookOpen className="w-4 h-4 text-sky-500" />
          <span className="hidden xl:inline">Slabikář</span>
        </button>

        {/* Badges Button */}
        <button
          onClick={onOpenBadges}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
            isProjectorMode
              ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
              : 'bg-slate-900 border-slate-800 text-amber-300 hover:bg-slate-800'
          }`}
          title="Získané odznaky"
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span className="font-mono tabular-nums font-bold">
            {unlockedBadgesCount}/{totalBadgesCount}
          </span>
        </button>

        {/* Mute Toggle */}
        <button
          onClick={onToggleMute}
          className={`p-2 rounded-lg border transition-colors ${
            isMuted
              ? isProjectorMode
                ? 'bg-slate-100 border-slate-300 text-slate-400'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
              : isProjectorMode
              ? 'bg-sky-100 border-sky-300 text-sky-700'
              : 'bg-sky-950/60 border-sky-800/60 text-sky-300 hover:bg-sky-900/60'
          }`}
          title={isMuted ? 'Zapnout zvukové efekty' : 'Ztlumit zvuk'}
          aria-label={isMuted ? 'Zapnout zvuk' : 'Ztlumit zvuk'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Reset Progress */}
        <button
          onClick={onResetProgress}
          className={`p-2 rounded-lg border transition-colors ${
            isProjectorMode
              ? 'border-slate-300 bg-slate-100 text-slate-600 hover:text-rose-600 hover:bg-slate-200'
              : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-slate-800'
          }`}
          title="Resetovat postup (pro novou výuku)"
          aria-label="Resetovat postup"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
