# Síťový Průzkumník: Interaktivní výuka počítačových sítí a IP adres pro ZŠ

Interaktivní vzdělávací aplikace navržená na míru žákům 2. stupně ZŠ (11–15 let) a jejich učitelům informatiky. Hravou formou, pomocí drag & drop stavitele, magnetického zapojování kabelů, vizualizace doručování datových paketů a detektivního řešení síťových havárií vysvětluje principy fungování LAN, Wi-Fi, směrovačů, přepínačů (switchů), DHCP serveru a unikátních IP adres.

---

## Uživatelské volby a potvrzená rozhodnutí

> [!IMPORTANT]
> Na základě vašich odpovědí v 1. fázi plánování jsou v návrhu pevně ukotveny tyto principy:

- **Režim průchodu aplikací**: **Postupná kampaň po úrovních s odemykáním** (postupný postup od jednoduché domácí sítě přes DHCP a cestu paketu až po detektivní výzvy) + **Volné pískoviště (Sandbox)**, kde si žáci mohou kdykoliv postavit libovolnou vlastní síť bez omezení.
- **Způsob propojování**: **Interaktivní magnetické tažení kabelů** – žák klikne na port/zařízení a tažením myší (nebo dotykem) natáhne kabel (přímý UTP kabel nebo Wi-Fi vlny) s magnetickým přichycením k cílovému portu.
- **Audio & Gamifikace**: **Web Audio zvukové efekty** (zvuk zacvaknutí RJ-45 konektoru, pípnutí odeslání paketu, zvuk doručení do cíle, výstraha při kolizi IP adres a slavnostní tón při dokončení úrovně) + **sbírka odznaků síťového inženýra** a hvězdičkové hodnocení.

---

## 1. Přehled a hlavní koncept

### Co aplikace dělá
Aplikace převádí abstraktní a často obtížně uchopitelné pojmy počítačových sítí (IP adresa, paket, switch, router, DHCP, kolize adres, výchozí brána) do hmatatelných vizuálních metafor a interaktivních miniher.

### Cílová skupina
- **Žáci 6.–9. třídy ZŠ**: Intuitivní ovládání, srozumitelný český jazyk bez zbytečného akademického žargonu, okamžitá vizuální a zvuková zpětná vazba.
- **Učitelé informatiky**: Připravené didaktické scénáře (domácí Wi-Fi vs. školní počítačová učebna s Veyonem), možnost rychlého resetu a režim volného experimentování pro demonstraci na interaktivní tabuli či projektoru.

### Klíčová didaktická hodnota
- Žák na vlastní oči uvidí rozdíl mezi lokální komunikací (přes switch, např. sdílení souboru učiteli) a komunikací do internetu (nutnost projít přes výchozí bránu / router).
- Žák pochopí, proč dvě zařízení v jedné síti nemohou mít stejnou IP adresu (princip poštovní adresy domu a vizualizace kolize srazem paketů).

---

## 2. Uživatelská zkušenost a vizuální design

### Architektura 4 modulů a uživatelský průchod

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 01. Stavitel sítě         │ 02. Hra na DHCP         │ 03. Cesta paketu      │
│ • Domácí Wi-Fi síť        │ • Metafora pošty        │ • Lokální přenos (LAN)│
│ • Školní učebna (Switch)  │ • Přidělování koncovek  │ • Cesta do internetu  │
│ • Magnetické kabely & Wi-Fi│ • Simulace kolize IP    │ • Zpomalený rozbor   │
└───────────────────────────┴─────────────────────────┴───────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 04. Detektivní režim                               │ Volné pískoviště       │
│ • Diagnostika vadného kabelu                       │ • Vlastní topologie    │
│ • Odhalení duplicitní IP adresy                    │ • Libovolné pakety     │
│ • Oprava cizí podsítě (10.0.0.x vs 192.168.1.x)    │ • Export / Test sítě   │
└────────────────────────────────────────────────────┴────────────────────────┘
```

#### Modul 1: Stavitel sítě (Fyzická vrstva & Topologie)
1. **Scénář A – Domácí síť**: Na plátně je obývací pokoj. Žák z palety zařízení vytáhne Wi-Fi router a bezdrátově k němu připojí notebook, chytrý telefon a Smart TV. Vidí animované signálové vlny a indikátor spojení.
2. **Scénář B – Školní počítačová učebna**: Mnohem větší místnost. K dispozici je hlavní router školy, centrální 8-portový switch, učitelský počítač a 3 žákovské počítače. Žák musí pochopit, že počítače se nezapojují přímo do routeru ani do sebe navzájem, nýbrž do switche, a ten teprve vede jedním kabelem do routeru.
3. **Interakce**: Tažení kabelu z portu zařízení na jiný port. Pokud je kabel zapojen správně, port zeleně problikne, ozve se "cvaknutí" konektoru a linka se zaktivuje.

#### Modul 2: Hra na DHCP server (Logická vrstva & IP adresy)
1. **Metafora poštovní adresy**: Vizuální analogie – ulice (např. *192.168.1*) je název ulice, poslední číslo (*.2*, *.10*, *.15*) je číslo popisné domu.
2. **Mechanika přidělování**: Zařízení v zapojené síti začnou blikat se žlutým otazníkem (žádost o DHCP adresu). Žák má rozsah 192.168.1.2 až 192.168.1.254. Pomocí číselníku nebo přetahovacích visaček přiděluje zařízením IP adresy.
3. **Kolizní scénář (Chyba)**: Pokud žák přiřadí dvěma PC stejnou IP (např. 192.168.1.10), obě zařízení začnou varovně červeně pulzovat. Při pokusu o komunikaci se na lince srazí dva pakety s výstražným zvukovým signálem a vysvětlením, proč k chybě došlo.

#### Modul 3: Cesta paketu (Komunikační simulace)
1. **Scénář 1 – Školní LAN (Odevzdání úkolu / Veyon)**: Žák klikne na Žákovský PC a vybere "Odeslat úkol učiteli". Vytvoří se datová obálka s hlavičkou: Odesílatel `192.168.1.10`, Příjemce `192.168.1.2`. Obálka plyne do switche a switch ji okamžitě nasměruje přímo k učiteli (neposílá ji do routeru ani ostatním žákům).
2. **Scénář 2 – Internetový dotaz (Google / YouTube)**: Žák klikne na "Otevřít webovou stránku". Cílová IP je mimo lokální síť (např. `142.250.180.206`). Switch rozpozná, že cíl není v učebně, a pošle paket do routeru (Výchozí brána `192.168.1.1`), který jej pošle optickým kabelem do mraku Internetu a vrátí odpověď zpět.
3. **Ovládání simulace**: Tlačítka Přehrát, Pozastavit, Zpomalit (0.5x), Krokovat po krocích s textovými bublinami vysvětlujícími, co právě daný prvek s paketem dělá.

#### Modul 4: Detektivní režim (Závěrečná výzva & Troubleshooting)
1. Třída hlásí problém: "Internet nefunguje!", "Nemůžu poslat soubor!", "Počítač se nepřipojí!".
2. Žák dostane interaktivní nástroje:
   - **Ping test**: Odeslání testovacího signálu na libovolnou IP.
   - **Inspektor kabelů**: Kontrola fyzického zapojení.
   - **Konfigurátor síťové karty**: Možnost upravit IP adresu a masku podsítě.
3. Pět postupných detektivních případů s bodováním a odznaky:
   - Případ 1: Vypadnutý kabel ze switche pod lavicí.
   - Případ 2: Duplicitní IP adresa dvou žákovských PC.
   - Případ 3: Chybné číslo podsítě (PC má `10.0.0.5` místo `192.168.1.x`).
   - Případ 4: Špatně nastavená výchozí brána (PC vidí učitele v LAN, ale nedostane se na internet).
   - Případ 5: Odpojený kabel mezi switchem a hlavním routerem.

### Vizuální identita a atmosféra
- **Styl**: Moderní, čisté a přívětivé vzdělávací prostředí (Educational Blueprint) s důrazem na přehlednost pro žáky i promítání projektorem.
- **Barevná paleta (60-30-10)**:
  - 60% Neutrální plátno: Světlý břidlicový podklad (`#F8FAFC` až `#F1F5F9`) s jemnou mřížkou pro přesné umísťování prvků. Podpora tmavého režimu pro šetření očí.
  - 30% Strukturální panely: Čisté karty s jemnými obrysy (`border-slate-200`), přehledný horní navigační pruh s indikátorem postupu a odznaky.
  - 10% Didaktické akcenty:
    - Azurová / Modrá (`#0284C7`): Běžná komunikace a UTP kabely.
    - Smaragdová (`#059669`): Správné zapojení, úspěšné doručení paketu.
    - Korálová červená (`#DC2626`): Kolize adres, chybná podsíť, rozpojený kabel.
    - Jantarová (`#D97706`): Čekající DHCP žádost, výchozí brána.
    - Fialová (`#7C3AED`): Wi-Fi vlny a internetový mrak.
- **Typografie**:
  - Nadpisy: `Plus Jakarta Sans` / moderní geometrický bezpatkový font.
  - IP adresy, MAC adresy a porty: `JetBrains Mono` / `font-mono tabular-nums` pro dokonalé zarovnání oktetů.
- **Respektování pravidel čistého designu**: Žádné zbytečné dekorativní tečky, žádné falešné stavové hlášky, srozumitelná česká tlačítka ("Odeslat paket", "Otestovat spojení", "Zkontrolovat síť", "Resetovat").

---

## 3. Klíčová rozhodnutí a architektonické kompromisy

1. **Vlastní vektorový SVG render kabelů a paketů**:
   - *Zvolený přístup*: Plynulé kubické Bézierovy křivky vykreslované přímo v SVG vrstvě nad plátnem. Porty zařízení mají definované souřadnice, kabel se při tažení magneticky přichytí k nejbližšímu kompatibilnímu portu v okruhu 30 px.
   - *Proč*: 100% spolehlivost na libovolném rozlišení (od tabletů po 4K tabule), nulové externí těžké závislosti na Canvasu, snadné stylování a plynulé CSS/Framer animace pohybu paketů po křivce (`stroke-dashoffset` / `motion` animace podél SVG path).
2. **Syntetizované zvukové efekty (Web Audio API)**:
   - *Zvolený přístup*: Využití nativního `AudioContext` s frekvenčními oscilátory a šumovými generátory pro kliknutí konektoru, pípnutí a fanfáry.
   - *Proč*: Funguje okamžitě bez nutnosti stahovat externí MP3 soubory, které by se v offline prostředí školy nebo kvůli CORS nemusely načíst. Obsahuje přepínač pro okamžité ztlumení zvuku (ideální do školní učebny, kde má 25 žáků zapnutý zvuk).
3. **Ukládání postupu (Local Storage)**:
   - *Zvolený přístup*: Průchod kampaní, získané odznaky a nejlepší skóre se automaticky ukládají do `localStorage`. Žák nebo učitel může postup jedním kliknutím resetovat pro další hodinu.

---

## 4. Technická architektura a datová struktura

### Systémový diagram komponent

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            App (Hlavní stav & Navigace)                      │
│   • Aktivní modul (Stavitel / DHCP / Simulace / Detektiv / Pískoviště)      │
│   • Postup kampaní (LevelManager, Odemčené úrovně, Odznaky)                 │
│   • Zvukový manažer (Web Audio API - s možností ztlumení Mute)              │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        ▼                              ▼                              ▼
┌──────────────────┐         ┌──────────────────┐           ┌──────────────────┐
│   TopBarMenu     │         │ InteractiveStage │           │   ControlDeck    │
│ • Volba modulů   │         │ • Canvas mřížka  │           │ • Zadání úkolu   │
│ • Přehled odznaků│         │ • Zařízení & Port│           │ • Paleta prvků   │
│ • Zvuk ON/OFF    │         │ • SVG Kabely     │           │ • Přehrávač      │
│ • Reset postupu  │         │ • Animace paketu │           │ • Diagnostika    │
└──────────────────┘         └──────────────────┘           └──────────────────┘
```

### Datové modely (TypeScript)

```typescript
// Typy síťových zařízení
export type DeviceType = 
  | 'router'       // Směrovač / Wi-Fi router (brána do světa)
  | 'switch'       // Přepínač (rozbočovač LAN sítě)
  | 'pc-teacher'   // Učitelský počítač
  | 'pc-student'   // Žákovský počítač
  | 'laptop'       // Notebook (Wi-Fi / kabel)
  | 'phone'        // Chytrý mobilní telefon (Wi-Fi)
  | 'smart-tv'     // Chytrá televize
  | 'server';      // Webový / internetový server

export interface NetworkPort {
  id: string;
  name: string;        // např. "LAN 1", "LAN 2", "WAN / Internet", "Wi-Fi"
  type: 'ethernet' | 'wifi' | 'wan';
  connectedToDeviceId?: string;
  connectedToPortId?: string;
}

export interface NetworkDevice {
  id: string;
  type: DeviceType;
  name: string;
  x: number;
  y: number;
  ip: string;                  // např. "192.168.1.10" nebo ""
  subnetMask: string;          // např. "255.255.255.0"
  defaultGateway: string;      // např. "192.168.1.1"
  macAddress: string;          // např. "00:1A:2B:3C:4D:5E"
  ports: NetworkPort[];
  status: 'offline' | 'requesting-dhcp' | 'configured' | 'ip-conflict';
  icon: string;
}

export interface CableConnection {
  id: string;
  fromDeviceId: string;
  fromPortId: string;
  toDeviceId: string;
  toPortId: string;
  medium: 'cable' | 'wifi';
  status: 'connected' | 'disconnected' | 'broken';
}

export interface DataPacket {
  id: string;
  sourceIp: string;
  targetIp: string;
  sourceDeviceId: string;
  targetDeviceId: string;
  payloadType: 'veyon-file' | 'web-request' | 'dhcp-discover' | 'ping';
  label: string;
  currentStepIndex: number;
  route: string[];             // IDs zařízení na trase
  status: 'traveling' | 'delivered' | 'dropped' | 'collided';
}

export interface DetectiveCase {
  id: string;
  title: string;
  description: string;
  symptom: string;
  hint: string;
  solutionExplanation: string;
  initialDevices: NetworkDevice[];
  initialConnections: CableConnection[];
  checkSuccess: (devices: NetworkDevice[], connections: CableConnection[]) => boolean;
}
```

---

## 5. Plán kroků realizace (Execution Roadmap)

Po schválení plánu proběhne výstavba aplikace v následujících koordinovaných krocích:

1. **Konfigurace a základy projektu**:
   - Aktualizace `metadata.json` (název aplikace *Síťový Průzkumník*, popis) a `index.html` (český titulek a meta tagy).
   - Vytvoření zvukového syntetizátoru `soundEffects.ts` s použitím Web Audio API (efekty kliknutí, spojení, paketu, kolize a fanfáry bez externích souborů).

2. **Jádro síťového simulátoru & SVG kabelového systému**:
   - Komponenta `NetworkCanvas`: renderování zařízení na mřížce, manipulace s pozicí, indikátory portů.
   - Komponenta `CableLayer`: výpočet Bézierových křivek mezi porty zařízení, interaktivní tažení kabelu s magnetickým přichycením, odlišení metalických UTP kabelů a bezdrátových Wi-Fi spojů.
   - Komponenta `PacketAnimator`: vizuální cestování datové obálky po spojnicích s krokováním a informačními štítky.

3. **Implementace 4 modulů**:
   - **Modul 1 (Stavitel sítě)**: Scénář Domácí Wi-Fi síť a Scénář Počítačová učebna se switchem. Validace správného propojení a odemykání.
   - **Modul 2 (Hra na DHCP)**: Vizuální metafora pošty a čísel popisných. Interaktivní přidělování IP adres, okamžitá detekce a dramatická animace IP kolize při duplicitě.
   - **Modul 3 (Cesta paketu)**: Simulace lokálního sdílení souboru (Veyon / LAN přenos přes switch) vs. dotazu do internetu (směrování přes router / bránu na server). Zpomalený režim s vysvětlivkami role switche a routeru.
   - **Modul 4 (Detektivní režim)**: 5 interaktivních kriminálních případů se síťovými chybami (rozpojený kabel, kolize IP, cizí podsíť, špatná brána). Integrované diagnostické nástroje (Ping, kontrola kabelu, konfigurace karty).

4. **Kampaň, Odznaky a Volné pískoviště (Sandbox)**:
   - Systém odemykání úrovní s ukládáním do `localStorage`.
   - Galerie odznaků mladého síťového administrátora.
   - Sandbox režim pro volnou tvorbu topologií a experimentování ve výuce.

5. **Testování a ověření sestavení**:
   - Kontrola pomocí `compile_applet` a `lint_applet`.
   - Ověření funkčnosti na různých velikostech obrazovek (od interaktivní tabule po školní notebooky).
