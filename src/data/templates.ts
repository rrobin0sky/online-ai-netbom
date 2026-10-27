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
    id: 'tib-scheme-a',
    name: 'TIB 方案 A：独立物理机架构 (主推荐)',
    nameEn: 'TIB Scheme A: Dedicated Physical Servers (Primary)',
    badge: '主推方案 (全栈物理机)',
    badgeEn: 'Primary (Bare-Metal)',
    description: 'FortiGate FG-80F 双机 + H3C 万兆核心及 PoE+ 接入 + 7台 H3C G6 独立物理机(AD/文件/备份/运维) + JumpServer / IP-guard 安全套件 + 完整实施割接人日。',
    descriptionEn: 'Dual FG-80F + H3C 10G Core/PoE Access + 7x H3C G6 Bare-Metal Servers + JumpServer/IP-guard Security Suite + Full Cutover Mandays.',
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
        accessories: [
          { accessoryId: 'h3c-sfp-xe-sx', quantity: 4, unitPrice: 340 },
          { accessoryId: 'h3c-sfp-stack-1m', quantity: 2, unitPrice: 648 },
        ],
      },
      {
        deviceId: 'h3c-us528s-x-hp-h1',
        deviceSnapshot: findSeedDev('h3c-us528s-x-hp-h1'),
        quantity: 2,
        areaGroup: '网络及弱电-接入与PoE区',
        customUnitPrice: 3660,
      },
      {
        deviceId: 'h3c-us528s-xe',
        deviceSnapshot: findSeedDev('h3c-us528s-xe'),
        quantity: 1,
        areaGroup: '网络及弱电-接入与PoE区',
        customUnitPrice: 2350,
      },
      {
        deviceId: 'h3c-ur7808-wac',
        deviceSnapshot: findSeedDev('h3c-ur7808-wac'),
        quantity: 1,
        areaGroup: '网络及弱电-无线网关区',
        customUnitPrice: 1475,
      },
      {
        deviceId: 'h3c-uap673',
        deviceSnapshot: findSeedDev('h3c-uap673'),
        quantity: 8,
        areaGroup: '网络及弱电-无线覆盖区',
        customUnitPrice: 1310,
      },
      {
        deviceId: 'htxk-om2-armored-cable',
        deviceSnapshot: findSeedDev('htxk-om2-armored-cable'),
        quantity: 160,
        areaGroup: '弱电线材与主干光缆',
        customUnitPrice: 7,
      },
      {
        deviceId: 'htxk-cat6-box',
        deviceSnapshot: findSeedDev('htxk-cat6-box'),
        quantity: 2,
        areaGroup: '弱电线材与主干光缆',
        customUnitPrice: 760,
      },
      {
        deviceId: 'h3c-r4700-g6-ad',
        deviceSnapshot: findSeedDev('h3c-r4700-g6-ad'),
        quantity: 1,
        areaGroup: '服务器采购 (方案A 物理机)',
        customUnitPrice: 57156,
      },
      {
        deviceId: 'h3c-r4700-g6-ad02',
        deviceSnapshot: findSeedDev('h3c-r4700-g6-ad02'),
        quantity: 1,
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
        deviceId: 'h3c-r4900-g6-backup',
        deviceSnapshot: findSeedDev('h3c-r4900-g6-backup'),
        quantity: 1,
        areaGroup: '服务器采购 (方案A 物理机)',
        customUnitPrice: 98501,
      },
      {
        deviceId: 'h3c-r4700-g6-syslog',
        deviceSnapshot: findSeedDev('h3c-r4700-g6-syslog'),
        quantity: 1,
        areaGroup: '服务器采购 (方案A 物理机)',
        customUnitPrice: 57156,
      },
      {
        deviceId: 'h3c-r4700-g6-zabbix',
        deviceSnapshot: findSeedDev('h3c-r4700-g6-zabbix'),
        quantity: 1,
        areaGroup: '服务器采购 (方案A 物理机)',
        customUnitPrice: 57156,
      },
      {
        deviceId: 'h3c-r4700-g6-jumpserver',
        deviceSnapshot: findSeedDev('h3c-r4700-g6-jumpserver'),
        quantity: 1,
        areaGroup: '服务器采购 (方案A 物理机)',
        customUnitPrice: 57156,
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
        deviceId: 'ipguard-server',
        deviceSnapshot: findSeedDev('ipguard-server'),
        quantity: 1,
        areaGroup: '系统与安全软件',
        customUnitPrice: 1000,
      },
      {
        deviceId: 'ipguard-basic-module',
        deviceSnapshot: findSeedDev('ipguard-basic-module'),
        quantity: 20,
        areaGroup: '系统与安全软件',
        customUnitPrice: 230,
      },
      {
        deviceId: 'veeam-backup-software',
        deviceSnapshot: findSeedDev('veeam-backup-software'),
        quantity: 1,
        areaGroup: '系统与安全软件',
        customUnitPrice: 10400,
      },
      {
        deviceId: 'zoho-eventlog-analyzer',
        deviceSnapshot: findSeedDev('zoho-eventlog-analyzer'),
        quantity: 1,
        areaGroup: '系统与安全软件',
        customUnitPrice: 13000,
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
    ],
    serviceItems: [
      findSeedSrv('srv-cabling-install', 1, '弱电布线施工及机房跳线梳理包工包料 (1式)'),
      findSeedSrv('srv-pm-total', 1, '总体推进/沟通协调/质量把控 (48,000元/式)'),
      findSeedSrv('srv-req-design', 6, '2人*3天 = 6人日 (架构师需求定义与架构设计)'),
      findSeedSrv('srv-net-preconfig', 24, '网络19人日 + 终端PC5人日 = 24人日 (3,000元/人日)'),
      findSeedSrv('srv-server-preconfig-a', 24, '物理机上架/RAID/系统部署 24人日 (4,500元/人日)'),
      findSeedSrv('srv-net-cutover-night', 19, '非工作时间割接迁移 19人日 (4,500元/人日)'),
      findSeedSrv('srv-server-cutover-a', 4, '非工作时间物理机服务割接演练 4人日 (4,500元/人日)'),
      findSeedSrv('srv-standby-support', 2, '割接上线后现场驻场保障 2人日 (3,000元/人日)'),
      findSeedSrv('srv-docs-delivery', 5, '竣工交付图书制作 5人日 (3,000元/人日)'),
      findSeedSrv('srv-training-transfer', 2, '管理员运维技能培训 2人日 (3,000元/人日)'),
      findSeedSrv('srv-sec-compliance', 1, '一级等保专家评定指导与评审 (12,000元/式)'),
    ].filter(Boolean) as BOMServiceItem[],
  },
  {
    id: 'tib-scheme-b',
    name: 'TIB 方案 B：ZStack 虚拟化架构 (备选方案)',
    nameEn: 'TIB Scheme B: ZStack Virtualization & SAN (Alternative)',
    badge: '虚拟化备选 (超融合/SAN)',
    badgeEn: 'Virtualization & SAN',
    description: 'FortiGate FG-80F 双机 + H3C 万兆网络 + Dell R570 双计算节点 + Dell ME5212 FC SAN 存储 + ZStack 企业级虚拟化平台 + 虚拟化割接实施人日。',
    descriptionEn: 'Dual FG-80F + H3C 10G Net + Dell R570 2-Node Cluster + Dell ME5212 FC SAN + ZStack Platform + Virtualization Mandays.',
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
        deviceId: 'dell-r570-zstack',
        deviceSnapshot: findSeedDev('dell-r570-zstack'),
        quantity: 2,
        areaGroup: '服务器采购 (方案B 虚拟化)',
        customUnitPrice: 68688,
      },
      {
        deviceId: 'dell-me5212-san',
        deviceSnapshot: findSeedDev('dell-me5212-san'),
        quantity: 1,
        areaGroup: '服务器采购 (方案B 虚拟化)',
        customUnitPrice: 119853,
        accessories: [
          { accessoryId: 'fc-om4-5m', quantity: 4, unitPrice: 241 },
        ],
      },
      {
        deviceId: 'zstack-enterprise-platform',
        deviceSnapshot: findSeedDev('zstack-enterprise-platform'),
        quantity: 1,
        areaGroup: '系统与安全软件',
        customUnitPrice: 80000,
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
        deviceId: 'ipguard-server',
        deviceSnapshot: findSeedDev('ipguard-server'),
        quantity: 1,
        areaGroup: '系统与安全软件',
        customUnitPrice: 1000,
      },
      {
        deviceId: 'ipguard-basic-module',
        deviceSnapshot: findSeedDev('ipguard-basic-module'),
        quantity: 20,
        areaGroup: '系统与安全软件',
        customUnitPrice: 230,
      },
      {
        deviceId: 'veeam-backup-software',
        deviceSnapshot: findSeedDev('veeam-backup-software'),
        quantity: 1,
        areaGroup: '系统与安全软件',
        customUnitPrice: 10400,
      },
      {
        deviceId: 'zoho-eventlog-analyzer',
        deviceSnapshot: findSeedDev('zoho-eventlog-analyzer'),
        quantity: 1,
        areaGroup: '系统与安全软件',
        customUnitPrice: 13000,
      },
      {
        deviceId: 'htxk-om2-armored-cable',
        deviceSnapshot: findSeedDev('htxk-om2-armored-cable'),
        quantity: 160,
        areaGroup: '弱电线材与主干光缆',
        customUnitPrice: 7,
      },
      {
        deviceId: 'htxk-cat6-box',
        deviceSnapshot: findSeedDev('htxk-cat6-box'),
        quantity: 2,
        areaGroup: '弱电线材与主干光缆',
        customUnitPrice: 760,
      },
    ],
    serviceItems: [
      findSeedSrv('srv-cabling-install', 1, '弱电布线施工及机房跳线梳理包工包料 (1式)'),
      findSeedSrv('srv-pm-total', 1, '总体推进/沟通协调/质量把控 (48,000元/式)'),
      findSeedSrv('srv-req-design', 6, '2人*3天 = 6人日 (架构师需求定义与架构设计)'),
      findSeedSrv('srv-net-preconfig', 24, '网络19人日 + 终端PC5人日 = 24人日 (3,000元/人日)'),
      findSeedSrv('srv-server-preconfig-b', 25, 'ZStack虚拟化平台安装配置与测试 25人日 (4,500元/人日)'),
      findSeedSrv('srv-net-cutover-night', 19, '非工作时间割接迁移 19人日 (4,500元/人日)'),
      findSeedSrv('srv-server-cutover-b', 4, '非工作时间虚拟机迁移与断电演练 4人日 (4,500元/人日)'),
      findSeedSrv('srv-standby-support', 2, '割接上线后现场驻场保障 2人日 (3,000元/人日)'),
      findSeedSrv('srv-docs-delivery', 5, '竣工交付图书制作 5人日 (3,000元/人日)'),
      findSeedSrv('srv-training-transfer', 2, '管理员运维技能培训 2人日 (3,000元/人日)'),
      findSeedSrv('srv-sec-compliance', 1, '一级等保专家评定指导与评审 (12,000元/式)'),
    ].filter(Boolean) as BOMServiceItem[],
  },
  {
    id: 'tib-scheme-c',
    name: 'TIB 方案 C：阿里云混合云架构 (备选方案)',
    nameEn: 'TIB Scheme C: Alibaba Cloud Hybrid Architecture (Alternative)',
    badge: '混合云备选 (云端ECS/SD-WAN)',
    badgeEn: 'Hybrid Cloud',
    description: 'FortiGate FG-80F 双机建立云上云下安全通道 + 本地轻量化接入交换机 + 云端虚拟机部署 + 混合云割接实施人日。',
    descriptionEn: 'Dual FG-80F Cloud Interconnect + Local Lightweight Access + Cloud Virtual Machines + Hybrid Cutover Mandays.',
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
        deviceId: 'ipguard-server',
        deviceSnapshot: findSeedDev('ipguard-server'),
        quantity: 1,
        areaGroup: '系统与安全软件',
        customUnitPrice: 1000,
      },
      {
        deviceId: 'ipguard-basic-module',
        deviceSnapshot: findSeedDev('ipguard-basic-module'),
        quantity: 20,
        areaGroup: '系统与安全软件',
        customUnitPrice: 230,
      },
      {
        deviceId: 'veeam-backup-software',
        deviceSnapshot: findSeedDev('veeam-backup-software'),
        quantity: 1,
        areaGroup: '系统与安全软件',
        customUnitPrice: 10400,
      },
      {
        deviceId: 'zoho-eventlog-analyzer',
        deviceSnapshot: findSeedDev('zoho-eventlog-analyzer'),
        quantity: 1,
        areaGroup: '系统与安全软件',
        customUnitPrice: 13000,
      },
      {
        deviceId: 'htxk-om2-armored-cable',
        deviceSnapshot: findSeedDev('htxk-om2-armored-cable'),
        quantity: 160,
        areaGroup: '弱电线材与主干光缆',
        customUnitPrice: 7,
      },
      {
        deviceId: 'htxk-cat6-box',
        deviceSnapshot: findSeedDev('htxk-cat6-box'),
        quantity: 2,
        areaGroup: '弱电线材与主干光缆',
        customUnitPrice: 760,
      },
    ],
    serviceItems: [
      findSeedSrv('srv-cabling-install', 1, '弱电布线施工及机房跳线梳理包工包料 (1式)'),
      findSeedSrv('srv-pm-total', 1, '总体推进/沟通协调/质量把控 (48,000元/式)'),
      findSeedSrv('srv-req-design', 6, '2人*3天 = 6人日 (架构师需求定义与架构设计)'),
      findSeedSrv('srv-net-preconfig', 24, '网络19人日 + 终端PC5人日 = 24人日 (3,000元/人日)'),
      findSeedSrv('srv-server-preconfig-c', 20, '阿里云ECS实例/安全组/系统配置 20人日 (4,500元/人日)'),
      findSeedSrv('srv-net-cutover-night', 19, '非工作时间割接迁移 19人日 (4,500元/人日)'),
      findSeedSrv('srv-server-cutover-c', 5, '非工作时间混合云网络联通与业务割接 5人日 (4,500元/人日)'),
      findSeedSrv('srv-standby-support', 2, '割接上线后现场驻场保障 2人日 (3,000元/人日)'),
      findSeedSrv('srv-docs-delivery', 5, '竣工交付图书制作 5人日 (3,000元/人日)'),
      findSeedSrv('srv-training-transfer', 2, '管理员运维技能培训 2人日 (3,000元/人日)'),
      findSeedSrv('srv-sec-compliance', 1, '一级等保专家评定指导与评审 (12,000元/式)'),
    ].filter(Boolean) as BOMServiceItem[],
  },
];
