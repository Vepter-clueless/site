import React from 'react';
import { X, Award, CheckCircle2, Lock, ShieldCheck, Wifi, Server, Cpu, Mail } from 'lucide-react';
import { Badge } from '../types/network';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  badges: Badge[];
  unlockedIds: string[];
}

export const BadgesModal: React.FC<BadgesModalProps> = ({
  isOpen,
  onClose,
  badges,
  unlockedIds,
}) => {
  if (!isOpen) return null;

  const renderBadgeIcon = (iconName: string, isUnlocked: boolean) => {
    const className = `w-7 h-7 ${isUnlocked ? 'text-amber-400' : 'text-slate-600'}`;
    switch (iconName) {
      case 'wifi':
        return <Wifi className={className} />;
      case 'server':
        return <Server className={className} />;
      case 'cpu':
        return <Cpu className={className} />;
      case 'mail':
        return <Mail className={className} />;
      case 'shield-check':
        return <ShieldCheck className={className} />;
      case 'award':
      default:
        return <Award className={className} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Síň síťových odznaků</h3>
              <p className="text-xs text-slate-400">
                Odemčeno {unlockedIds.length} z {badges.length} odznaků mladého správce sítě
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {badges.map((badge) => {
            const isUnlocked = unlockedIds.includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                  isUnlocked
                    ? 'bg-slate-950/70 border-amber-500/40 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/20'
                    : 'bg-slate-950/30 border-slate-800/60 opacity-60'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl border shrink-0 ${
                    isUnlocked
                      ? 'bg-amber-950/40 border-amber-500/30'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  {isUnlocked ? (
                    renderBadgeIcon(badge.icon, true)
                  ) : (
                    <Lock className="w-7 h-7 text-slate-600" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4
                      className={`text-xs font-bold truncate ${
                        isUnlocked ? 'text-amber-200' : 'text-slate-400'
                      }`}
                    >
                      {badge.title}
                    </h4>
                    {isUnlocked && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Zavřít
          </button>
        </div>
      </div>
    </div>
  );
};
