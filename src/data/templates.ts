import { DeviceItem } from '../types/device';
import { BOMServiceItem, SEED_SERVICES } from './seedServices';
import { SEED_DEVICES } from './seedDevices';

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

function findSeedDev(id: string): DeviceItem | undefined {
  return SEED_DEVICES.find((d) => d.id === id);
}

function findSeedSrv(id: string, qty: number, notes = ''): BOMServiceItem | undefined {
  const srv = SEED_SERVICES.find((s) => s.id === id);
  if (!srv) return undefined;
  return {
    uid: `srv-tib-${id}`,
    item: srv,
    quantity: qty,
    pricingMode: srv.pricingMode,
    unitPriceExclTax: srv.unitPriceExclTax,
    unitPriceInclTax: srv.unitPriceInclTax,
    percentageRate: srv.percentageRate ?? 5,
    taxRate: srv.taxRate,
    notes,
  };
}

export const SCENE_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'tib-system-reconstruction',
    name: 'TIB1/2 网络分离与系统重构项目 (标准方案)',
    nameEn: 'TIB Network Separation & Infrastructure Reconstruction',
    badge: '企业级全栈交付',
    badgeEn: 'Full-Stack Enterprise',
    description: '出口防火墙双机 + 万兆核心交换 + 企业级物理服务器(域控/文件) + JumpServer堡垒机/IP-guard防泄密 + 割接人日与等保评定完整方案。',
    descriptionEn: 'Dual NGFW + 10G Core + Rackmount Servers + JumpServer Bastion + IP-guard DLP + Professional Cutover Mandays.',
    recommendedDiscount: 1.0,
    items: [
      {
        deviceId: 'fortinet-fg-80f',
        deviceSnapshot: findSeedDev('fortinet-fg-80f'),
        quantity: 2,
        areaGroup: '网络及弱电-安全出口区',
        customUnitPrice: 15850,
      },
      {
        deviceId: 'h3c-us700-core',
        deviceSnapshot: findSeedDev('h3c-us700-core'),
        quantity: 2,
        areaGroup: '网络及弱电-核心汇聚层',
        customUnitPrice: 14118,
      },
      {
        deviceId: 'h3c-us528s-x-hp-h1',
        deviceSnapshot: findSeedDev('h3c-us528s-x-hp-h1'),
        quantity: 2,
        areaGroup: '网络及弱电-接入与PoE区',
        customUnitPrice: 3660,
      },
      {
        deviceId: 'h3c-uap673',
        deviceSnapshot: findSeedDev('h3c-uap673'),
        quantity: 8,
        areaGroup: '网络及弱电-无线覆盖区',
        customUnitPrice: 1310,
      },
      {
        deviceId: 'h3c-r4700-g6-ad',
        deviceSnapshot: findSeedDev('h3c-r4700-g6-ad'),
        quantity: 2,
        areaGroup: '服务器采购 (方案A 物理机)',
        customUnitPrice: 57156,
      },
      {
        deviceId: 'h3c-r4900-g6-file',
        deviceSnapshot: findSeedDev('h3c-r4900-g6-file'),
        quantity: 1,
        areaGroup: '服务器采购 (方案A 物理机)',
        customUnitPrice: 98501,
      },
      {
        deviceId: 'ms-win-server-2025',
        deviceSnapshot: findSeedDev('ms-win-server-2025'),
        quantity: 5,
        areaGroup: '系统与安全软件',
        customUnitPrice: 8328,
      },
      {
        deviceId: 'jumpserver-ent-3y',
        deviceSnapshot: findSeedDev('jumpserver-ent-3y'),
        quantity: 1,
        areaGroup: '系统与安全软件',
        customUnitPrice: 42353,
      },
      {
        deviceId: 'ipguard-encrypt-20p',
        deviceSnapshot: findSeedDev('ipguard-encrypt-20p'),
        quantity: 1,
        areaGroup: '系统与安全软件',
        customUnitPrice: 15100,
      },
      {
        deviceId: 'canon-ir-adv-c3926',
        deviceSnapshot: findSeedDev('canon-ir-adv-c3926'),
        quantity: 1,
        areaGroup: '办公打印与外设',
        customUnitPrice: 26400,
      },
      {
        deviceId: 'tenda-tdl5708m-kvm',
        deviceSnapshot: findSeedDev('tenda-tdl5708m-kvm'),
        quantity: 1,
        areaGroup: '服务器采购 (方案A 物理机)',
        customUnitPrice: 4550,
      },
      {
        deviceId: 'htxk-om2-armored-cable',
        deviceSnapshot: findSeedDev('htxk-om2-armored-cable'),
        quantity: 160,
        areaGroup: '弱电线材与主干光缆',
        customUnitPrice: 7,
      },
    ],
    serviceItems: [
      findSeedSrv('srv-pm-total', 1, '总体推进/沟通协调/质量把控'),
      findSeedSrv('srv-req-design', 6, '2人*3天 = 6人日 (架构师调研设计)'),
      findSeedSrv('srv-net-preconfig', 24, '网络19人日 + 终端PC5人日 = 24人日'),
      findSeedSrv('srv-server-preconfig', 24, '物理机上架/RAID/系统应用部署 24人日'),
      findSeedSrv('srv-net-cutover-night', 19, '非工作时间割接迁移 19人日 (1.5倍加急)'),
      findSeedSrv('srv-server-cutover-night', 4, '非工作时间服务器加固与断电演练 4人日'),
      findSeedSrv('srv-standby-support', 2, '割接上线后现场驻场保障 2人日'),
      findSeedSrv('srv-docs-delivery', 7, '竣工交付图书5人日 + 运维培训2人日'),
      findSeedSrv('srv-sec-compliance', 1, '一级等保专家评定指导与评审'),
    ].filter(Boolean) as BOMServiceItem[],
  },
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
