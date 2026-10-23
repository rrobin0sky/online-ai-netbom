import { BOMItem } from '../types/device';
import { SEED_DEVICES, SEED_ACCESSORIES } from './seedDevices';

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
    }[];
  }[];
}

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
        quantity: 2,
        areaGroup: '数据中心服务器区',
        areaGroupEn: 'DC Server Zone',
        accessories: [
          { accessoryId: 'huawei-pac600s12-cb', quantity: 4 }, // 每台配2个电源
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
