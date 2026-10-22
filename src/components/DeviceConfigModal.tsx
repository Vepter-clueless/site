import React, { useState } from 'react';
import { X, Network, Save } from 'lucide-react';
import { NetworkDevice } from '../types/network';

interface DeviceConfigModalProps {
  device: NetworkDevice | null;
  onClose: () => void;
  onSave: (updated: NetworkDevice) => void;
  isProjectorMode?: boolean;
}

export const DeviceConfigModal: React.FC<DeviceConfigModalProps> = ({
  device,
  onClose,
  onSave,
  isProjectorMode = false,
}) => {
  if (!device) return null;

  const [ip, setIp] = useState(device.ip || '');
  const [subnetMask, setSubnetMask] = useState(device.subnetMask || '255.255.255.0');
  const [defaultGateway, setDefaultGateway] = useState(device.defaultGateway || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...device,
      ip: ip.trim(),
      subnetMask: subnetMask.trim(),
      defaultGateway: defaultGateway.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 ${
        isProjectorMode
          ? 'bg-white border-slate-300 text-slate-900'
          : 'bg-slate-900 border-slate-800 text-slate-100'
      }`}>
        <div className={`flex items-center justify-between pb-4 border-b ${
          isProjectorMode ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg border ${
              isProjectorMode
                ? 'bg-sky-100 text-sky-800 border-sky-300'
                : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
            }`}>
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${isProjectorMode ? 'text-slate-900' : 'text-white'}`}>Nastavení síťové karty</h3>
              <p className={`text-xs ${isProjectorMode ? 'text-slate-600' : 'text-slate-400'}`}>{device.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${
              isProjectorMode ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className={`block text-xs font-semibold mb-1 ${
              isProjectorMode ? 'text-slate-700' : 'text-slate-300'
            }`}>
              IP adresa (IPv4)
            </label>
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="např. 192.168.1.10"
              className={`w-full px-3 py-2 rounded-lg font-mono text-sm focus:outline-none ${
                isProjectorMode
                  ? 'bg-slate-50 border border-slate-300 text-sky-800 focus:border-sky-500'
                  : 'bg-slate-950 border border-slate-700 text-sky-300 focus:border-sky-400'
              }`}
            />
            <span className={`text-[10px] mt-1 block ${
              isProjectorMode ? 'text-slate-500' : 'text-slate-400'
            }`}>
              Unikátní číslo v síti. Např. 192.168.1.2 až 192.168.1.254.
            </span>
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${
              isProjectorMode ? 'text-slate-700' : 'text-slate-300'
            }`}>
              Maska podsítě (Subnet Mask)
            </label>
            <input
              type="text"
              value={subnetMask}
              onChange={(e) => setSubnetMask(e.target.value)}
              placeholder="255.255.255.0"
              className={`w-full px-3 py-2 rounded-lg font-mono text-sm focus:outline-none ${
                isProjectorMode
                  ? 'bg-slate-50 border border-slate-300 text-slate-800 focus:border-sky-500'
                  : 'bg-slate-950 border border-slate-700 text-slate-300 focus:border-sky-400'
              }`}
            />
            <span className={`text-[10px] mt-1 block ${
              isProjectorMode ? 'text-slate-500' : 'text-slate-400'
            }`}>
              Určuje, která část adresy je síť (ulice) a která zařízení (dům).
            </span>
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${
              isProjectorMode ? 'text-slate-700' : 'text-slate-300'
            }`}>
              Výchozí brána (Default Gateway)
            </label>
            <input
              type="text"
              value={defaultGateway}
              onChange={(e) => setDefaultGateway(e.target.value)}
              placeholder="192.168.1.1"
              className={`w-full px-3 py-2 rounded-lg font-mono text-sm focus:outline-none ${
                isProjectorMode
                  ? 'bg-slate-50 border border-slate-300 text-slate-800 focus:border-sky-500'
                  : 'bg-slate-950 border border-slate-700 text-slate-300 focus:border-sky-400'
              }`}
            />
            <span className={`text-[10px] mt-1 block ${
              isProjectorMode ? 'text-slate-500' : 'text-slate-400'
            }`}>
              IP adresa routeru, přes kterou putují data ven do internetu.
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg border text-xs font-medium transition-colors ${
                isProjectorMode
                  ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  : 'border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Zrušit
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> Uložit nastavení
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
