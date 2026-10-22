import { BOMItem } from '../types/device';
import { SEED_DEVICES, SEED_ACCESSORIES } from './seedDevices';

export interface ProjectTemplate {
  id: string;
  name: string;
  badge: string;
  description: string;
  recommendedDiscount: number;
  items: {
    deviceId: string;
    quantity: number;
    areaGroup: string;
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
    badge: '园区典型拓扑',
    description: '核心万兆冗余堆叠 + 接入全千兆 PoE+ 供电 + 标配万兆多模光模块与双电源。',
    recommendedDiscount: 0.28,
    items: [
      {
        deviceId: 'h3c-s5560x-30c-pwr-ei',
        quantity: 2,
        areaGroup: '核心汇聚层',
        accessories: [
          { accessoryId: 'sfp-10g-sr-850', quantity: 4 },
          { accessoryId: 'dac-sfp-10g-1m', quantity: 2 },
        ],
      },
      {
        deviceId: 'huawei-s5735-l48p4x-a1',
        quantity: 6,
        areaGroup: '楼层接入层',
        accessories: [
          { accessoryId: 'sfp-10g-sr-850', quantity: 12 },
        ],
      },
    ],
  },
  {
    id: 'datacenter-tor-leaf',
    name: '数据中心服务器集群 (25G Leaf-Spine)',
    badge: '高密数据中心',
    description: '48口 25G SFP28 接入 + 100G QSFP28 上行无阻塞交换机，出厂双交流电源模块满配。',
    recommendedDiscount: 0.28,
    items: [
      {
        deviceId: 'huawei-ce6863-48s6cq',
        quantity: 2,
        areaGroup: '数据中心服务器区',
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
    badge: '高端企业标杆',
    description: '思科 Catalyst 9300 系列全 PoE+ 交换机，配置 715W 白金级冗余电源。',
    recommendedDiscount: 0.35,
    items: [
      {
        deviceId: 'cisco-c9300-48p-a',
        quantity: 4,
        areaGroup: '办公接入区',
        accessories: [
          { accessoryId: 'cisco-pwr-c1-715wac-p', quantity: 4 },
          { accessoryId: 'sfp-10g-sr-850', quantity: 8 },
        ],
      },
    ],
  },
];
