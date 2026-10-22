/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { BadgesModal } from './components/BadgesModal';
import { TheoryModal } from './components/TheoryModal';
import { BuilderModule } from './components/modules/BuilderModule';
import { DhcpModule } from './components/modules/DhcpModule';
import { PacketModule } from './components/modules/PacketModule';
import { DetectiveModule } from './components/modules/DetectiveModule';
import { SandboxModule } from './components/modules/SandboxModule';
import { BADGES } from './data/levels';
import { ModuleId } from './types/network';
import { sounds } from './utils/soundEffects';

export default function App() {
  const [currentModule, setCurrentModule] = useState<ModuleId>('builder');
  const [unlockedModules, setUnlockedModules] = useState<ModuleId[]>(() => {
    try {
      const saved = localStorage.getItem('sitovy_pruzkumnik_modules');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return ['builder', 'sandbox'];
  });

  const [unlockedBadges, setUnlockedBadges] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sitovy_pruzkumnik_badges');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => sounds.getMuted());
  const [isBadgesOpen, setIsBadgesOpen] = useState<boolean>(false);
  const [isTheoryOpen, setIsTheoryOpen] = useState<boolean>(false);

  // Projector (classroom high-contrast light mode) and Context Tooltips state
  const [isProjectorMode, setIsProjectorMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sitovy_pruzkumnik_projector') === 'true';
    } catch {
      return false;
    }
  });

  const [showContextTooltips, setShowContextTooltips] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sitovy_pruzkumnik_tooltips');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sitovy_pruzkumnik_projector', String(isProjectorMode));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [isProjectorMode]);

  useEffect(() => {
    try {
      localStorage.setItem('sitovy_pruzkumnik_tooltips', String(showContextTooltips));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [showContextTooltips]);

  useEffect(() => {
    try {
      localStorage.setItem('sitovy_pruzkumnik_modules', JSON.stringify(unlockedModules));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [unlockedModules]);

  useEffect(() => {
    try {
      localStorage.setItem('sitovy_pruzkumnik_badges', JSON.stringify(unlockedBadges));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [unlockedBadges]);

  const handleUnlockNext = (nextModule: ModuleId) => {
    setUnlockedModules((prev) => {
      if (prev.includes(nextModule)) return prev;
      return [...prev, nextModule];
    });
    setCurrentModule(nextModule);
  };

  const handleGrantBadge = (badgeId: string) => {
    setUnlockedBadges((prev) => {
      if (prev.includes(badgeId)) return prev;
      return [...prev, badgeId];
    });
  };

  const handleToggleMute = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  const handleToggleProjectorMode = () => {
    setIsProjectorMode((prev) => !prev);
  };

  const handleToggleTooltips = () => {
    setShowContextTooltips((prev) => !prev);
  };

  const handleResetProgress = () => {
    if (window.confirm('Opravdu chceš resetovat veškerý postup kampaně a odznaky?')) {
      setUnlockedModules(['builder', 'sandbox']);
      setUnlockedBadges([]);
      setCurrentModule('builder');
      localStorage.removeItem('sitovy_pruzkumnik_modules');
      localStorage.removeItem('sitovy_pruzkumnik_badges');
      sounds.playCableDisconnect();
    }
  };

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden font-sans transition-colors ${
      isProjectorMode ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Universal Top Bar */}
      <TopBar
        currentModule={currentModule}
        onSelectModule={(mod) => setCurrentModule(mod)}
        unlockedModules={unlockedModules}
        unlockedBadgesCount={unlockedBadges.length}
        totalBadgesCount={BADGES.length}
        onOpenBadges={() => setIsBadgesOpen(true)}
        onOpenTheory={() => setIsTheoryOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onResetProgress={handleResetProgress}
        isProjectorMode={isProjectorMode}
        onToggleProjectorMode={handleToggleProjectorMode}
        showContextTooltips={showContextTooltips}
        onToggleTooltips={handleToggleTooltips}
      />

      {/* Main Workspace Stage */}
      <main className="flex-1 flex overflow-hidden">
        {currentModule === 'builder' && (
          <BuilderModule
            onUnlockNext={(next) => handleUnlockNext(next)}
            onGrantBadge={handleGrantBadge}
            onOpenTheory={() => setIsTheoryOpen(true)}
            isProjectorMode={isProjectorMode}
            showContextTooltips={showContextTooltips}
          />
        )}

        {currentModule === 'dhcp' && (
          <DhcpModule
            onUnlockNext={(next) => handleUnlockNext(next)}
            onGrantBadge={handleGrantBadge}
            onOpenTheory={() => setIsTheoryOpen(true)}
            isProjectorMode={isProjectorMode}
            showContextTooltips={showContextTooltips}
          />
        )}

        {currentModule === 'packet' && (
          <PacketModule
            onUnlockNext={(next) => handleUnlockNext(next)}
            onGrantBadge={handleGrantBadge}
            onOpenTheory={() => setIsTheoryOpen(true)}
            isProjectorMode={isProjectorMode}
            showContextTooltips={showContextTooltips}
          />
        )}

        {currentModule === 'detective' && (
          <DetectiveModule
            onGrantBadge={handleGrantBadge}
            onOpenSandbox={() => setCurrentModule('sandbox')}
            onOpenTheory={() => setIsTheoryOpen(true)}
            isProjectorMode={isProjectorMode}
            showContextTooltips={showContextTooltips}
          />
        )}

        {currentModule === 'sandbox' && (
          <SandboxModule
            onOpenTheory={() => setIsTheoryOpen(true)}
            isProjectorMode={isProjectorMode}
            showContextTooltips={showContextTooltips}
          />
        )}
      </main>

      {/* Badges Achievement Modal */}
      <BadgesModal
        isOpen={isBadgesOpen}
        onClose={() => setIsBadgesOpen(false)}
        badges={BADGES}
        unlockedIds={unlockedBadges}
      />

      {/* Theory & Didactic Guide Modal */}
      <TheoryModal
        isOpen={isTheoryOpen}
        onClose={() => setIsTheoryOpen(false)}
      />
    </div>
  );
}
