import { DeviceItem } from '../types/device';

export interface AccessoryItem {
  id: string;
  category: 'transceiver' | 'power_module' | 'cable';
  name: string;
  partNumber: string;
  part_number?: string;
  specs: string;
  reference_price: number;
}

export const SEED_ACCESSORIES: AccessoryItem[] = [
  {
    id: 'sfp-10g-sr-850',
    category: 'transceiver',
    name: '10GE SFP+ 光模块 (多模 850nm 300m LC)',
    partNumber: '02318169',
    part_number: '02318169',
    specs: '万兆多模 SFP+，双纤 LC 接口，传输距离 300 米',
    reference_price: 320,
  },
  {
    id: 'sfp-10g-lr-1310',
    category: 'transceiver',
    name: '10GE SFP+ 光模块 (单模 1310nm 10km LC)',
    partNumber: '02318170',
    part_number: '02318170',
    specs: '万兆单模 SFP+，双纤 LC 接口，传输距离 10 公里',
    reference_price: 480,
  },
  {
    id: 'sfp28-25g-sr',
    category: 'transceiver',
    name: '25GE SFP28 光模块 (多模 850nm 100m LC)',
    partNumber: '02311YUX',
    part_number: '02311YUX',
    specs: '25G 数据中心多模光模块，双纤 LC 接口',
    reference_price: 850,
  },
  {
    id: 'dac-sfp-10g-1m',
    category: 'cable',
    name: '10GE SFP+ 高速线缆 (DAC 铜缆 1米)',
    partNumber: '02310MHP',
    part_number: '02310MHP',
    specs: '10G 无源高速直连铜缆 1 米，用于机柜内堆叠与互联',
    reference_price: 110,
  },
  {
    id: 'huawei-pac600s12-cb',
    category: 'power_module',
    name: '华为 600W 交流电源模块 (CE系列)',
    partNumber: '02312DWR',
    part_number: '02312DWR',
    specs: 'CE 系列数据中心交换机原装 600W 交流电源模块，支持 1+1 冗余',
    reference_price: 1800,
  },
  {
    id: 'cisco-pwr-c1-715wac-p',
    category: 'power_module',
    name: '思科 715W AC 白金级电源模块',
    partNumber: 'PWR-C1-715WAC-P',
    part_number: 'PWR-C1-715WAC-P',
    specs: 'Catalyst 9300 系列专用 715W 交流电源模块，支持 PoE 满配供电',
    reference_price: 2400,
  },
];

// Default equipment catalog is cleared for user manual upload & sync
export const SEED_DEVICES: DeviceItem[] = [];
