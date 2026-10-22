import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Radio,
  HardDrive,
  Monitor,
  Mail,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Network,
  Globe,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface TheoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: number;
  isProjectorMode?: boolean;
}

export const TheoryModal: React.FC<TheoryModalProps> = ({
  isOpen,
  onClose,
  initialTopic = 0,
  isProjectorMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<number>(initialTopic);

  if (!isOpen) return null;

  const topics = [
    {
      id: 'devices',
      title: '1. Switch vs. Router',
      icon: <Network className="w-4 h-4 text-sky-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-indigo-400" />
              <span>Switch (Přepínač) – „Křižovatka v učebně“</span>
            </h4>
            <p className="leading-relaxed">
              Představ si počítačovou učebnu s 25 počítači. Kdybychom chtěli propojit každý počítač s každým, potřebovali bychom stovky kabelů! Proto máme uprostřed učebny <strong className="text-indigo-300">Switch</strong>.
            </p>
            <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-indigo-200">
              <strong>Jak funguje:</strong> Do switche vede kabel z každého počítače. Když žák posílá soubor učiteli, switch se podívá na adresu a pošle data <em>pouze</em> na port učitele. Ostatní počítače ani internetový router vůbec nezatěžuje.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-sky-400" />
              <span>Router (Směrovač) – „Vrátný u vstupu do školy“</span>
            </h4>
            <p className="leading-relaxed">
              Router je zařízení, které spojuje dvě různé sítě – naši <strong className="text-sky-300">lokální školní síť (LAN)</strong> s venkovním <strong className="text-purple-300">internetem (WAN)</strong>.
            </p>
            <div className="p-3 rounded-lg bg-sky-950/40 border border-sky-500/20 text-sky-200">
              <strong>Výchozí brána (Default Gateway):</strong> Je IP adresa routeru (např. <code>192.168.1.1</code>). Když chce počítač otevřít YouTube nebo Google, pošle data této bráně a router je pošle ven optickým kabelem do světa.
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'cables',
      title: '2. Kabely a porty (LAN vs WAN)',
      icon: <Globe className="w-4 h-4 text-emerald-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sky-300">
                <div className="w-3 h-3 rounded bg-sky-400" />
                <span>LAN port (Konektor RJ-45)</span>
              </div>
              <p className="leading-relaxed text-[11px] text-slate-400">
                Klasický kovový UTP síťový kabel se zacvakávacím konektorem RJ-45. Slouží k propojení počítačů, tiskáren a switchů uvnitř budovy rychlostí až 1 Gbps (gigabit za vteřinu).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <div className="w-3 h-3 rounded bg-amber-400" />
                <span>WAN port (Internet / Optika)</span>
              </div>
              <p className="leading-relaxed text-[11px] text-slate-400">
                Na routeru bývá obvykle označen žlutou nebo modrou barvou. Do tohoto portu vede kabel od poskytovatele internetu (optický kabel nebo modem).
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-purple-200 space-y-2">
            <h5 className="font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>A co bezdrátová Wi-Fi?</span>
            </h5>
            <p className="text-[11px] leading-relaxed">
              Wi-Fi nahrazuje UTP kabel radiovými vlnami v pásmech 2.4 GHz a 5 GHz. Mobil, notebook nebo televize mají vestavěnou malou anténu, která se připojí k Wi-Fi routeru bez nutnosti tahat kabely po zemi.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'ip-addresses',
      title: '3. IP adresa a pošta',
      icon: <HelpCircle className="w-4 h-4 text-amber-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white">
              Metafora: IP adresa jako poštovní adresa
            </h4>
            <div className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-center font-mono text-base font-extrabold text-sky-400">
                192.168.1<span className="text-slate-500">.</span><span className="text-amber-400">10</span>
              </div>
              <div className="text-slate-400 text-xs">
                = <strong className="text-sky-300">Ulice Školní</strong> (Název sítě) č.p.{' '}
                <strong className="text-amber-300">10</strong> (Číslo konkrétního PC)
              </div>
            </div>
            <p className="leading-relaxed">
              IP adresa verze 4 (IPv4) se skládá ze čtyř čísel oddělených tečkami (každé číslo od 0 do 255).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-300">
              <AlertTriangle className="w-4 h-4" />
              <span>Proč musí být IP adresa unikátní? (Kolize IP)</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Kdyby měly dva domy ve stejné ulici stejné číslo popisné, pošťák by nevěděl, komu doručit balíček. Pokud mají dva počítače stejnou IP adresu, dochází ke <strong className="underline">kolizi</strong> – data se ztrácejí a ani jeden počítač se na síť nedostane!
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'packets',
      title: '4. Jak cestuje datový paket',
      icon: <Mail className="w-4 h-4 text-pink-400" />,
      content: (
        <div className="space-y-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-pink-400" />
              <span>Datová obálka (Paket)</span>
            </h4>
            <p className="leading-relaxed">
              Když posíláš obrázek nebo otevíráš web, data se rozdělí na tisíce malých kousků zvaných <strong>pakety</strong>. Každý paket má na sobě napsáno:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
              <li><strong>IP odesílatele:</strong> Kdo data posílá (např. tvůj počítač <code>192.168.1.10</code>).</li>
              <li><strong>IP příjemce:</strong> Kam mají data dorazit (např. učitel <code>192.168.1.2</code> nebo server <code>142.250.180.206</code>).</li>
              <li><strong>Samotný obsah:</strong> Kousek souboru nebo dotaz na web.</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-500/20 text-sky-200 text-xs">
            <strong>Dvě trasy:</strong>
            <p className="mt-1 text-[11px] text-slate-300">
              1. <em>V učebně (LAN):</em> PC ➔ Switch ➔ Učitel. (Rychlé, lokální, bez internetu).<br />
              2. <em>Do světa (Internet):</em> PC ➔ Switch ➔ Router (Brána) ➔ Světový internet.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'controls',
      title: '5. Návod: Jak ovládat aplikaci',
      icon: <CheckCircle2 className="w-4 h-4 text-amber-400" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <span>Jak propojit dvě zařízení:</span>
            </h4>
            <div className="space-y-2 text-[11px] text-slate-300">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-bold flex items-center justify-center shrink-0">1</span>
                <span><strong>Jednoduché kliknutí:</strong> Klikni na první počítač (rozsvítí se modře). Pak klikni na Switch nebo Router. Kabel se automaticky natáhne a zapojí!</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-bold flex items-center justify-center shrink-0">2</span>
                <span><strong>Přetahování myší:</strong> Klikni na port na zařízení a táhni kabel přímo k portu druhého zařízení. Magneticky se přichytí a zacvakne.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-bold flex items-center justify-center shrink-0">3</span>
                <span><strong>Přesouvání zařízení:</strong> Chytni kartu počítače či switche za záhlaví a přesuň si ji po ploše, kamkoliv potřebuješ!</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-bold flex items-center justify-center shrink-0">4</span>
                <span><strong>Tlačítko Nápověda (💡):</strong> V každé úrovni můžeš kliknout na tlačítko <em>„Ukázat nápovědu zapojení“</em> a aplikace ti rozsvítí vodící linky.</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Síťový slabikář & Výuková teorie
              </h3>
              <p className="text-xs text-slate-400">
                Přehledné vysvětlení pro žáky 2. stupně ZŠ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Topic Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 overflow-x-auto px-4 gap-1 py-1.5">
          {topics.map((t, idx) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(idx)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === idx
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {t.icon}
              <span>{t.title}</span>
            </button>
          ))}
        </div>

        {/* Topic Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {topics[activeTab].content}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Tip: Tuto teorii můžeš kdykoliv otevřít kliknutím na tlačítko Slabikář.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors"
          >
            Rozumím, jdu na to!
          </button>
        </div>
      </div>
    </div>
  );
};
