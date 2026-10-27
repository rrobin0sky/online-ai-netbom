import { DeviceItem } from '../types/device';
import { BOMServiceItem } from './seedServices';

export interface ProjectTemplate {
  id: string;
  name: string;
  nameEn?: string;
  badge: string;
  badgeEn?: string;
  description: string;
  descriptionEn?: string;
  recommendedDiscount: number;
  items: {
    deviceId: string;
    quantity: number;
    areaGroup: string;
    areaGroupEn?: string;
    accessories?: {
      accessoryId: string;
      quantity: number;
      unitPrice?: number;
    }[];
    customUnitPrice?: number | null;
    deviceSnapshot?: DeviceItem;
  }[];
  serviceItems?: BOMServiceItem[];
}

const TEMPLATE_DEVICES: Record<string, DeviceItem> = {
  'h3c-s5560x-30c-pwr-ei': {
    id: 'h3c-s5560x-30c-pwr-ei',
    brand: 'H3C',
    series: 'S5560X-EI',
    model: 'S5560X-30C-PWR-EI',
    part_number: '0235A37V',
    category: 'switch',
    lifecycle: 'active',
    description: '24端口千兆PoE+电口，4端口万兆SFP+光口，1个扩展插槽，双模块化电源',
    specs: {
      form_factor: '1U',
      ports: {
        summary: '24 x 10/100/1000Base-T (PoE+) + 4 x 10GE SFP+',
        downlink: '24 x 10/100/1000Base-T (PoE+)',
        downlink_count: 24,
        downlink_speed: '1G',
        uplink: '4 x 10GE SFP+',
        uplink_count: 4,
        uplink_speed: '10G',
      },
      switching_capacity_gbps: 598,
      forwarding_rate_mpps: 222,
      poe: {
        supported: true,
        budget_watts: 740,
        standard: 'PoE+',
      },
      layer: 'L3',
      power_supply: {
        type: 'modular',
        slots: 2,
        default_included: 1,
        default_power_watts: 740,
        redundancy_supported: true,
      },
      airflow: 'front-to-back',
    },
    pricing: {
      currency: 'CNY',
      list_price_gpl: 14800,
      cost_estimate: 4200,
      discount_reference: 0.28,
      price_verified_at: null,
      source_quote_type: 'none',
    },
    metadata: {
      official_spec_url: 'https://www.h3c.com',
      specs_verified_at: '2026-10-27',
      contributor: 'bin0sky',
      tags: ['PoE+', 'Layer3', '10GE'],
    },
  },
  'huawei-s5735-l48p4x-a1': {
    id: 'huawei-s5735-l48p4x-a1',
    brand: 'Huawei',
    series: 'CloudEngine S5735-L',
    model: 'S5735-L48P4X-A1',
    part_number: '02353JUR',
    category: 'switch',
    lifecycle: 'active',
    description: '48端口全千兆PoE+电口，4端口万兆SFP+光口上行，内置交流电源',
    specs: {
      form_factor: '1U',
      ports: {
        summary: '48 x 10/100/1000Base-T (PoE+) + 4 x 10GE SFP+',
        downlink: '48 x 10/100/1000Base-T (PoE+)',
        downlink_count: 48,
        downlink_speed: '1G',
        uplink: '4 x 10GE SFP+',
        uplink_count: 4,
        uplink_speed: '10G',
      },
      switching_capacity_gbps: 176,
      forwarding_rate_mpps: 132,
      poe: {
        supported: true,
        budget_watts: 380,
        standard: 'PoE+',
      },
      layer: 'L2+',
      power_supply: {
        type: 'fixed',
        slots: 1,
        default_included: 1,
        default_power_watts: 500,
        redundancy_supported: false,
      },
      airflow: 'side-to-side',
    },
    pricing: {
      currency: 'CNY',
      list_price_gpl: 12500,
      cost_estimate: 3600,
      discount_reference: 0.28,
      price_verified_at: null,
      source_quote_type: 'none',
    },
    metadata: {
      official_spec_url: 'https://e.huawei.com',
      specs_verified_at: '2026-10-27',
      contributor: 'bin0sky',
      tags: ['PoE+', 'Access', '48Ports'],
    },
  },
  'huawei-ce6863-48s6cq': {
    id: 'huawei-ce6863-48s6cq',
    brand: 'Huawei',
    series: 'CloudEngine 6800',
    model: 'CE6863-48S6CQ',
    part_number: '02352BJA',
    category: 'switch',
    lifecycle: 'active',
    description: '数据中心TOR交换机，48口25GE SFP28，6口100GE QSFP28，双可插拔电源',
    specs: {
      form_factor: '1U',
      ports: {
        summary: '48 x 25GE SFP28 + 6 x 100GE QSFP28',
        downlink: '48 x 25GE SFP28',
        downlink_count: 48,
        downlink_speed: '25G',
        uplink: '6 x 100GE QSFP28',
        uplink_count: 6,
        uplink_speed: '100G',
      },
      switching_capacity_gbps: 3600,
      forwarding_rate_mpps: 2000,
      poe: {
        supported: false,
        standard: 'None',
      },
      layer: 'L3',
      power_supply: {
        type: 'modular',
        slots: 2,
        default_included: 0,
        default_power_watts: 600,
        redundancy_supported: true,
      },
      airflow: 'front-to-back',
    },
    pricing: {
      currency: 'CNY',
      list_price_gpl: 45000,
      cost_estimate: 13500,
      discount_reference: 0.30,
      price_verified_at: null,
      source_quote_type: 'none',
    },
    metadata: {
      official_spec_url: 'https://e.huawei.com',
      specs_verified_at: '2026-10-27',
      contributor: 'bin0sky',
      tags: ['DataCenter', '25G', '100G'],
    },
  },
  'cisco-c9300-48p-a': {
    id: 'cisco-c9300-48p-a',
    brand: 'Cisco',
    series: 'Catalyst 9300',
    model: 'C9300-48P-A',
    part_number: 'C9300-48P-A',
    category: 'switch',
    lifecycle: 'active',
    description: '企业级核心接入一体化交换机，48口全PoE+，网络优势版DNA许可架构',
    specs: {
      form_factor: '1U',
      ports: {
        summary: '48 x 10/100/1000Base-T (PoE+) + 模块化网络上行扩展',
        downlink: '48 x 10/100/1000Base-T (PoE+)',
        downlink_count: 48,
        downlink_speed: '1G',
        uplink: '模块化插槽 (选配4x10G / 2x40G)',
        uplink_count: 4,
        uplink_speed: '10G',
      },
      switching_capacity_gbps: 256,
      forwarding_rate_mpps: 190,
      poe: {
        supported: true,
        budget_watts: 437,
        standard: 'PoE+',
      },
      layer: 'L3',
      power_supply: {
        type: 'modular',
        slots: 2,
        default_included: 1,
        default_power_watts: 715,
        redundancy_supported: true,
      },
      airflow: 'front-to-back',
    },
    pricing: {
      currency: 'CNY',
      list_price_gpl: 52000,
      cost_estimate: 17500,
      discount_reference: 0.35,
      price_verified_at: null,
      source_quote_type: 'none',
    },
    metadata: {
      official_spec_url: 'https://www.cisco.com',
      specs_verified_at: '2026-10-27',
      contributor: 'bin0sky',
      tags: ['Cisco', 'Catalyst', 'PoE+'],
    },
  },
};

export const SCENE_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'campus-standard-500',
    name: '中大型企业智能园区 (500人网络)',
    nameEn: 'Mid-to-Large Smart Enterprise Campus (500 Users)',
    badge: '园区典型拓扑',
    badgeEn: 'Enterprise Campus',
    description: '核心万兆冗余堆叠 + 接入全千兆 PoE+ 供电 + 标配万兆多模光模块与双电源。',
    descriptionEn: 'Core 10G redundant stack + Access full Gigabit PoE+ with standard 10G MMF transceivers & dual PSUs.',
    recommendedDiscount: 0.28,
    items: [
      {
        deviceId: 'h3c-s5560x-30c-pwr-ei',
        deviceSnapshot: TEMPLATE_DEVICES['h3c-s5560x-30c-pwr-ei'],
        quantity: 2,
        areaGroup: '核心汇聚层',
        areaGroupEn: 'Core Aggregation Layer',
        accessories: [
          { accessoryId: 'sfp-10g-sr-850', quantity: 4 },
          { accessoryId: 'dac-sfp-10g-1m', quantity: 2 },
        ],
      },
      {
        deviceId: 'huawei-s5735-l48p4x-a1',
        deviceSnapshot: TEMPLATE_DEVICES['huawei-s5735-l48p4x-a1'],
        quantity: 6,
        areaGroup: '楼层接入层',
        areaGroupEn: 'Floor Access Layer',
        accessories: [
          { accessoryId: 'sfp-10g-sr-850', quantity: 12 },
        ],
      },
    ],
  },
  {
    id: 'datacenter-tor-leaf',
    name: '数据中心服务器集群 (25G Leaf-Spine)',
    nameEn: 'Data Center Server Cluster (25G Leaf-Spine)',
    badge: '高密数据中心',
    badgeEn: 'Dense Data Center',
    description: '48口 25G SFP28 接入 + 100G QSFP28 上行无阻塞交换机，出厂双交流电源模块满配。',
    descriptionEn: '48-port 25G SFP28 access + 100G QSFP28 uplink non-blocking switches, dual AC PSU equipped.',
    recommendedDiscount: 0.28,
    items: [
      {
        deviceId: 'huawei-ce6863-48s6cq',
        deviceSnapshot: TEMPLATE_DEVICES['huawei-ce6863-48s6cq'],
        quantity: 2,
        areaGroup: '数据中心服务器区',
        areaGroupEn: 'DC Server Zone',
        accessories: [
          { accessoryId: 'huawei-pac600s12-cb', quantity: 4 },
          { accessoryId: 'sfp28-25g-sr', quantity: 16 },
        ],
      },
    ],
  },
  {
    id: 'cisco-enterprise-hq',
    name: '跨国/外企总部高可靠网络方案',
    nameEn: 'Global Enterprise HQ High-Availability Architecture',
    badge: '高端企业标杆',
    badgeEn: 'Mission-Critical Enterprise',
    description: '思科 Catalyst 9300 系列全 PoE+ 交换机，配置 715W 白金级冗余电源。',
    descriptionEn: 'Cisco Catalyst 9300 Series full PoE+ switches configured with 715W Platinum redundant PSUs.',
    recommendedDiscount: 0.35,
    items: [
      {
        deviceId: 'cisco-c9300-48p-a',
        deviceSnapshot: TEMPLATE_DEVICES['cisco-c9300-48p-a'],
        quantity: 4,
        areaGroup: '办公接入区',
        areaGroupEn: 'Office Access Zone',
        accessories: [
          { accessoryId: 'cisco-pwr-c1-715wac-p', quantity: 4 },
          { accessoryId: 'sfp-10g-sr-850', quantity: 8 },
        ],
      },
    ],
  },
];
