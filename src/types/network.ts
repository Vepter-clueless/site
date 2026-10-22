/**
 * Data structures and types for Network Explorer (Síťový Průzkumník)
 */

export type ModuleId = 'builder' | 'dhcp' | 'packet' | 'detective' | 'sandbox';

export type DeviceType =
  | 'router'       // Domácí / Školní Wi-Fi router & brána
  | 'switch'       // Přepínač (switch) do učebny
  | 'pc-teacher'   // Učitelský počítač
  | 'pc-student'   // Žákovský počítač
  | 'laptop'       // Notebook
  | 'phone'        // Smartphone
  | 'smart-tv'     // Chytrá televize
  | 'server';      // Webový server v internetu

export type PortType = 'ethernet' | 'wifi' | 'wan';

export interface NetworkPort {
  id: string;
  name: string;
  type: PortType;
  position: 'top' | 'bottom' | 'left' | 'right';
  connectedCableId?: string;
}

export interface NetworkDevice {
  id: string;
  type: DeviceType;
  name: string;
  x: number;
  y: number;
  ip: string;
  subnetMask: string;
  defaultGateway: string;
  macAddress: string;
  ports: NetworkPort[];
  status: 'ok' | 'requesting-dhcp' | 'ip-conflict' | 'unconnected' | 'wrong-subnet';
  isFixed?: boolean; // If true, position is locked in the scenario
  didacticRole?: string; // Purpose of this device in the current scenario
  didacticTip?: string;  // Pedagogical hint for pupils
}

export interface CableConnection {
  id: string;
  fromDeviceId: string;
  fromPortId: string;
  toDeviceId: string;
  toPortId: string;
  medium: 'cable' | 'wifi';
  status: 'active' | 'inactive' | 'broken';
  label?: string;
}

export interface DataPacket {
  id: string;
  sourceDeviceId: string;
  targetDeviceId: string;
  sourceIp: string;
  targetIp: string;
  payloadType: 'file-transfer' | 'web-request' | 'dhcp-request' | 'ping';
  label: string;
  status: 'traveling' | 'delivered' | 'collided' | 'dropped';
  currentStep: number;
  totalSteps: number;
  route: string[]; // Device IDs along path
  explanation: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface DetectiveCase {
  id: string;
  caseNumber: number;
  title: string;
  reporter: string;
  problemReport: string;
  symptom: string;
  hint: string;
  didacticFact: string;
  devices: NetworkDevice[];
  connections: CableConnection[];
  validateFix: (devices: NetworkDevice[], connections: CableConnection[]) => {
    isFixed: boolean;
    reason: string;
  };
}
