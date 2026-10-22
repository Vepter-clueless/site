import { DeviceType, ModuleId, NetworkDevice } from '../types/network';

export interface DeviceDidacticHelp {
  title: string;
  roleInTask: string;
  howItWorks: string;
  pupilTip: string;
}

export function getDeviceDidacticHelp(
  device: NetworkDevice,
  moduleId: ModuleId,
  currentLevelIndex?: number,
  currentCaseIndex?: number
): DeviceDidacticHelp {
  // 1. MODULE: BUILDER
  if (moduleId === 'builder') {
    if (currentLevelIndex === 1) {
      // Home Network
      if (device.type === 'router') {
        return {
          title: 'Domácí Wi-Fi Router (Centrální přístupový bod)',
          roleInTask: 'Srdce domácí bezdrátové sítě (WLAN). Všechna zařízení v bytě se k němu připojují vzduchem.',
          howItWorks: 'Vysílá radiové vlny na frekvencích 2.4 GHz a 5 GHz. Zároveň obsahuje modem/WAN port pro přívod internetu do bytu.',
          pupilTip: 'Připoj k jeho Wi-Fi anténě notebook, telefon i chytrou televizi.',
        };
      }
      if (device.type === 'smart-tv') {
        return {
          title: 'Chytrá televize (Smart TV)',
          roleInTask: 'Koncové zařízení v obývacím pokoji, které přehrává streamované video (YouTube, Netflix).',
          howItWorks: 'Má zabudovaný Wi-Fi modul, kterým přijímá datové toky videí z routeru.',
          pupilTip: 'Potřebuje bezdrátové spojení s domácím routerem.',
        };
      }
      if (device.type === 'laptop') {
        return {
          title: 'Pracovní Notebook',
          roleInTask: 'Přenosný počítač, který se po bytě pohybuje a komunikuje bezdrátově.',
          howItWorks: 'Má v rámu displeje skrytou Wi-Fi anténu, která vyhledává název sítě (SSID) a šifrované spojení.',
          pupilTip: 'Klikni na Propojit a spoj ho s Wi-Fi routerem.',
        };
      }
      if (device.type === 'phone') {
        return {
          title: 'Chytrý telefon (Smartphone)',
          roleInTask: 'Mobilní zařízení s úsporným Wi-Fi čipem.',
          howItWorks: 'Doma šetří mobilní data tím, že se automaticky přepne na domácí Wi-Fi síť routeru.',
          pupilTip: 'Táhni spojení z jeho Wi-Fi antény na router.',
        };
      }
    } else {
      // School Network (Classroom)
      if (device.type === 'switch') {
        return {
          title: 'Učební Switch (Centrální síťový přepínač)',
          roleInTask: 'Klíčový rozbočovač celé učebny! Do něj vedou kabely ze všech počítačů.',
          howItWorks: 'Má mnoho LAN portů (např. 8, 16 nebo 24). Rychle přepíná pakety mezi lavicemi a jedním kabelem (Uplink) je spojen s routerem.',
          pupilTip: 'Sem musí vést UTP kabel z učitelského PC i všech žákovských PC, a také kabel do routeru.',
        };
      }
      if (device.type === 'router') {
        return {
          title: 'Školní Router (Výchozí brána do světa)',
          roleInTask: 'Spojuje naši třídu se zbytkem školy a celosvětovým internetem.',
          howItWorks: 'Počítače v učebně nejdou přímo do routeru, protože ten má málo portů. Router je spojen se switchem jediným silným kabelem.',
          pupilTip: 'Propoj port LAN routeru s Uplink portem učebního switche.',
        };
      }
      if (device.type === 'pc-teacher') {
        return {
          title: 'Učitelský počítač (Katedra)',
          roleInTask: 'Hlavní počítač pro řízení výuky, promítání a sběr prací (Veyon Master).',
          howItWorks: 'Komunikuje se žáky přes switch po lokální síti. Zapojuje se metalickým UTP kabelem.',
          pupilTip: 'Zapoj jeho síťovou kartu kabelem do portu 1 na switchi.',
        };
      }
      if (device.type === 'pc-student') {
        return {
          title: `Žákovská stanice (${device.name})`,
          roleInTask: 'Klientský počítač v lavici, na kterém žák pracuje.',
          howItWorks: 'Zezadu skříně vede UTP kabel do podlahové lišty a odtud do učebního switche.',
          pupilTip: 'Nezapojuj ho do jiného žáka ani do routeru! Všechny počítače patří do switche.',
        };
      }
    }
  }

  // 2. MODULE: DHCP
  if (moduleId === 'dhcp') {
    if (device.type === 'router') {
      return {
        title: 'Router jako DHCP Server',
        roleInTask: 'Správce adres! V reálné síti automaticky zapůjčuje volné IP adresy nově připojeným počítačům.',
        howItWorks: 'Jeho vlastní IP adresa je obvykle 192.168.1.1 (první číslo v ulici). Pro ostatní má připravený rozsah 2 až 254.',
        pupilTip: 'Sám má adresu 192.168.1.1, takže tuto adresu nesmíš dát žádnému žákovskému počítači.',
      };
    }
    if (device.type === 'switch') {
      return {
        title: 'Učební Switch',
        roleInTask: 'Přeposílá DHCP žádosti z počítačů do routeru.',
        howItWorks: 'Switch sám IP adresu k přepínání nepotřebuje (pracuje s MAC adresami na linkové vrstvě).',
        pupilTip: 'Switch propojuje kabely a stará se, aby se DHCP zprávy dostaly k routeru.',
      };
    }
    return {
      title: `${device.name} (Čeká na IP adresu)`,
      roleInTask: 'Počítač se právě zapnul a volá do sítě: „Kdo jsem a jaké je mé číslo?“ (DHCP Discover).',
      howItWorks: 'Bez unikátní IP adresy nemůže posílat ani přijímat data. Dvě zařízení nesmí mít stejné číslo (kolize)!',
      pupilTip: 'Vyber tento počítač v pravém panelu a přiřaď mu volnou koncovku (např. .10, .11 nebo .12).',
    };
  }

  // 3. MODULE: PACKET
  if (moduleId === 'packet') {
    if (device.type === 'server') {
      return {
        title: 'Vzdálený Webový Server (Google / Seznam)',
        roleInTask: 'Cílový server v internetu, na kterém běží webová stránka.',
        howItWorks: 'Má veřejnou IP adresu (142.250.180.206). Přijme požadavek od žáka a obratem pošle zpět kód webové stránky.',
        pupilTip: 'K tomuto serveru se žák dostane jedině přes switch a výchozí bránu (router).',
      };
    }
    if (device.type === 'router') {
      return {
        title: 'Školní Router (Výchozí brána - Default Gateway)',
        roleInTask: 'Rozcestník mezi školou a celým světem.',
        howItWorks: 'Když paket směřuje mimo školu (na 142.250.180.206), switch ho pošle sem. Router ho zabalí a pošle optikou ven.',
        pupilTip: 'Při odesílání úkolu učiteli v učebně router vůbec nezasahuje – switch to vyřídí sám!',
      };
    }
    if (device.type === 'switch') {
      return {
        title: 'Učební Switch (Inteligentní třídič paketů)',
        roleInTask: 'Podle cílové IP/MAC adresy se rozhoduje, kam paket nasměrovat.',
        howItWorks: 'Pokud jde paket učiteli (.2), pošle ho přímo jemu. Pokud jde na web, pošle ho do routeru (.1).',
        pupilTip: 'Sleduj, jak switch šetří přenosovou linku a zbytečně neposílá data tam, kam nepatří.',
      };
    }
    if (device.type === 'pc-teacher') {
      return {
        title: 'Učitelský PC (Veyon Master / Příjemce úkolu)',
        roleInTask: 'Cíl lokálního odevzdání úkolu v učebně.',
        howItWorks: 'Přijímá vypracovaný soubor přímo od žáka přes switch po lokální síti LAN.',
        pupilTip: 'Při lokálním přenosu se data vůbec nedostanou mimo třídu.',
      };
    }
    return {
      title: `${device.name} (Odesílatel dat)`,
      roleInTask: 'Počítač, který generuje datové pakety.',
      howItWorks: 'Rozdělí soubor nebo webový dotaz na pakety, orazítkuje je svou IP a IP příjemce a pošle je do sítě.',
      pupilTip: 'Klikni vpravo na scénář 1 nebo 2 a sleduj cestu datové obálky.',
    };
  }

  // 4. MODULE: DETECTIVE
  if (moduleId === 'detective') {
    if (device.status === 'unconnected') {
      return {
        title: `Podezřelé zařízení: ${device.name}`,
        roleInTask: 'Nemá spojení se sítí! Pravděpodobně vypadl kabel nebo chybí spojení.',
        howItWorks: 'Na fyzické vrstvě (vrstva 1) neteče žádný elektrický signál.',
        pupilTip: 'Zkontroluj UTP kabel ze síťové karty do switche!',
      };
    }
    if (device.status === 'ip-conflict') {
      return {
        title: `Podezřelé zařízení: ${device.name} (Kolize IP!)`,
        roleInTask: 'Dvě zařízení mají v síti nastavenou úplně stejnou IP adresu!',
        howItWorks: 'Switch ani router nevědí, kam pakety doručit. Spojení se přerušuje.',
        pupilTip: 'Otevři nastavení síťové karty (ozubené kolo) a změň koncovku na unikátní číslo.',
      };
    }
    if (device.status === 'wrong-subnet') {
      return {
        title: `Podezřelé zařízení: ${device.name} (Cizí podsíť)`,
        roleInTask: 'Má IP adresu z úplně jiné sítě (např. 10.0.0.5 místo 192.168.1.x)!',
        howItWorks: 'Je jako cizinec mluvící jiným jazykem – školní switch a router s ním nedokáží komunikovat.',
        pupilTip: 'Přenastav IP adresu tak, aby začínala na 192.168.1.',
      };
    }
    return {
      title: device.name,
      roleInTask: `Zařízení v síti (${device.type}).`,
      howItWorks: `IP: ${device.ip || 'nenastavena'}, Výchozí brána: ${device.defaultGateway || 'nenastavena'}.`,
      pupilTip: 'Otestuj spojení pomocí diagnostického PING testu v pravém panelu.',
    };
  }

  // 5. MODULE: SANDBOX
  return {
    title: `${device.name} (${device.type.toUpperCase()})`,
    roleInTask: 'Prvek ve tvé vlastní vytvořené topologii.',
    howItWorks: `Nastavená IP: ${device.ip || 'žádná'}, Brána: ${device.defaultGateway || 'žádná'}.`,
    pupilTip: 'Můžeš ho přesouvat myší za záhlaví, propojovat kabely nebo poslat testovací paket.',
  };
}
