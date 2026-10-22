import { DeviceItem } from '../types/device';

export const SEED_DEVICES: DeviceItem[] = [
  // 1. 华为 CloudEngine S5735-L48P4X-A1 (园区接入标杆)
  {
    id: 'huawei-s5735-l48p4x-a1',
    brand: 'Huawei',
    series: 'CloudEngine S5735-L',
    model: 'S5735-L48P4X-A1',
    part_number: '02353GBH',
    category: 'switch',
    lifecycle: 'active',
    description: '全千兆 PoE+ 园区接入交换机，提供 48 个千兆电口下行与 4 个 10GE SFP+ 万兆光上行，支持绿色节能。',
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
        default_power_watts: 600,
        redundancy_supported: false,
      },
      airflow: 'front-to-back',
      stacking: {
        supported: true,
        max_units: 9,
      },
    },
    pricing: {
      currency: 'CNY',
      list_price_gpl: 14800,
      cost_estimate: 4200,
      discount_reference: 0.28,
      price_verified_at: '2026-10-22',
      source_quote_type: 'distributor',
    },
    metadata: {
      official_spec_url: 'https://e.huawei.com/cn/products/enterprise-transmission-access/switches/campus-switches/s5735-l',
      specs_verified_at: '2026-10-22',
      contributor: 'bin0sky',
      tags: ['园区接入', 'PoE+', '48口千兆', '万兆上行', '智慧校园'],
      compatible_accessories: {
        transceivers: ['sfp-10g-sr-850', 'sfp-10g-lr-1310'],
        cables: ['dac-sfp-10g-1m', 'dac-sfp-10g-3m'],
      },
    },
  },

  // 2. 华为 CloudEngine 6863-48S6CQ (数据中心/大核心标杆)
  {
    id: 'huawei-ce6863-48s6cq',
    brand: 'Huawei',
    series: 'CloudEngine 6863',
    model: 'CE6863-48S6CQ',
    part_number: '02353DFV',
    category: 'switch',
    lifecycle: 'active',
    description: '数据中心级高性能 25G 汇聚/接入交换机，提供 48 个 25GE SFP28 端口与 6 个 100GE QSFP28 端口，高密度无阻塞转发。',
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
      layer: 'DataCenter',
      power_supply: {
        type: 'modular',
        slots: 2,
        default_included: 0, // 裸机不含电，提醒用户必配电源
        default_power_watts: 600,
        redundancy_supported: true,
      },
      airflow: 'front-to-back',
      stacking: {
        supported: true,
        max_units: 16,
      },
    },
    pricing: {
      currency: 'CNY',
      list_price_gpl: 88000,
      cost_estimate: 24500,
      discount_reference: 0.28,
      price_verified_at: '2026-10-22',
      source_quote_type: 'distributor',
    },
    metadata: {
      official_spec_url: 'https://e.huawei.com/cn/products/enterprise-transmission-access/switches/data-center-switches/ce6863',
      specs_verified_at: '2026-10-22',
      contributor: 'bin0sky',
      tags: ['数据中心', '25G接入', '100G上行', 'EVPN-VXLAN', '双电源冗余'],
      compatible_accessories: {
        power_modules: ['huawei-pac600s12-cb'],
        transceivers: ['sfp28-25g-sr', 'qsfp28-100g-sr4'],
      },
    },
  },

  // 3. 新华三 H3C S5560X-30C-PWR-EI (新华三明星千兆PoE汇聚接入)
  {
    id: 'h3c-s5560x-30c-pwr-ei',
    brand: 'H3C',
    series: 'S5560X-EI',
    model: 'S5560X-30C-PWR-EI',
    part_number: 'LS-5560X-30C-PWR-EI',
    category: 'switch',
    lifecycle: 'active',
    description: '新华三增强型 IPv6 三层千兆以太网交换机，24个千兆电口（PoE+）+ 4个万兆SFP+光口 + 1个扩展槽位，IRF2堆叠。',
    specs: {
      form_factor: '1U',
      ports: {
        summary: '24 x 10/100/1000Base-T (PoE+) + 4 x 10GE SFP+ + 1 Slot',
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
        default_power_watts: 920,
        redundancy_supported: true,
      },
      airflow: 'front-to-back',
      stacking: {
        supported: true,
        max_units: 9,
      },
    },
    pricing: {
      currency: 'CNY',
      list_price_gpl: 19800,
      cost_estimate: 5600,
      discount_reference: 0.28,
      price_verified_at: '2026-10-22',
      source_quote_type: 'distributor',
    },
    metadata: {
      official_spec_url: 'https://www.h3c.com/cn/Products_Technology/Enterprise_Products/Switches/Campus_Switches/S5560X-EI/',
      specs_verified_at: '2026-10-22',
      contributor: 'bin0sky',
      tags: ['H3C', 'L3全功能', '大功率PoE+', '双电源', '扩展槽位'],
      compatible_accessories: {
        transceivers: ['sfp-10g-sr-850', 'sfp-10g-lr-1310'],
      },
    },
  },

  // 4. 思科 Cisco Catalyst C9300-48P-A (全球企业网天花板)
  {
    id: 'cisco-c9300-48p-a',
    brand: 'Cisco',
    series: 'Catalyst 9300',
    model: 'C9300-48P-A',
    part_number: 'C9300-48P-A',
    category: 'switch',
    lifecycle: 'active',
    description: '思科旗舰级企业园区堆叠交换机，48口全 PoE+，支持 StackWise-480 堆叠与 DNA 软件定义网络，极高可靠性。',
    specs: {
      form_factor: '1U',
      ports: {
        summary: '48 x 10/100/1000 (PoE+) + Modular Uplink',
        downlink: '48 x 10/100/1000Base-T (PoE+)',
        downlink_count: 48,
        downlink_speed: '1G',
        uplink: '模块化上行 (支持 4x10G / 2x40G / 2x25G)',
        uplink_count: 4,
        uplink_speed: '10G',
      },
      switching_capacity_gbps: 256,
      forwarding_rate_mpps: 190.47,
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
      stacking: {
        supported: true,
        max_units: 8,
      },
    },
    pricing: {
      currency: 'CNY',
      list_price_gpl: 62000,
      cost_estimate: 21500,
      discount_reference: 0.35,
      price_verified_at: '2026-10-22',
      source_quote_type: 'distributor',
    },
    metadata: {
      official_spec_url: 'https://www.cisco.com/c/en/us/products/switches/catalyst-9300-series-switches/index.html',
      specs_verified_at: '2026-10-22',
      contributor: 'bin0sky',
      tags: ['Cisco', 'Catalyst9300', 'StackWise', '全PoE+', '模块化冗余'],
      compatible_accessories: {
        power_modules: ['cisco-pwr-c1-715wac-p'],
        transceivers: ['sfp-10g-sr-850'],
      },
    },
  },

  // 5. 锐捷网络 RG-S5310-48GT4XS-P (高性价比全千兆PoE+)
  {
    id: 'ruijie-rg-s5310-48gt4xs-p',
    brand: 'Ruijie',
    series: 'RG-S5310',
    model: 'RG-S5310-48GT4XS-P',
    part_number: 'RG-S5310-48GT4XS-P',
    category: 'switch',
    lifecycle: 'active',
    description: '锐捷千兆安全接入以太网交换机，48口千兆 PoE+ 下行与 4口万兆 SFP+ 上行，支持 VSU 虚拟化。',
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
        budget_watts: 370,
        standard: 'PoE+',
      },
      layer: 'L2+',
      power_supply: {
        type: 'fixed',
        slots: 1,
        default_included: 1,
        default_power_watts: 450,
        redundancy_supported: false,
      },
      airflow: 'front-to-back',
    },
    pricing: {
      currency: 'CNY',
      list_price_gpl: 12500,
      cost_estimate: 3600,
      discount_reference: 0.29,
      price_verified_at: '2026-10-22',
      source_quote_type: 'distributor',
    },
    metadata: {
      official_spec_url: 'https://www.ruijie.com.cn/cp/jh-sq/s5310/',
      specs_verified_at: '2026-10-22',
      contributor: 'bin0sky',
      tags: ['锐捷', '普教园区', 'PoE+', '高性价比'],
    },
  },

  // 6. FS.com 飞速 S5860-20SQ (多速率全光万兆汇聚交换机)
  {
    id: 'fs-s5860-20sq',
    brand: 'FS.com',
    series: 'S5860',
    model: 'S5860-20SQ',
    part_number: '115386',
    category: 'switch',
    lifecycle: 'active',
    description: '全光口万兆汇聚交换机，20个 10GE SFP+，4个 25GE SFP28 与 4个 40GE QSFP+，支持 1+1 冗余电源。',
    specs: {
      form_factor: '1U',
      ports: {
        summary: '20 x 10G SFP+ + 4 x 25G SFP28 + 4 x 40G QSFP+',
        downlink: '20 x 10GE SFP+',
        downlink_count: 20,
        downlink_speed: '10G',
        uplink: '4 x 25GE SFP28 + 4 x 40GE QSFP+',
        uplink_count: 8,
        uplink_speed: '40G',
      },
      switching_capacity_gbps: 800,
      forwarding_rate_mpps: 595,
      poe: {
        supported: false,
        standard: 'None',
      },
      layer: 'L3',
      power_supply: {
        type: 'modular',
        slots: 2,
        default_included: 2, // 标配双电！
        default_power_watts: 150,
        redundancy_supported: true,
      },
      airflow: 'front-to-back',
    },
    pricing: {
      currency: 'CNY',
      list_price_gpl: 16800,
      cost_estimate: 11999,
      discount_reference: 0.71,
      price_verified_at: '2026-10-22',
      source_quote_type: 'vendor_gpl',
    },
    metadata: {
      official_spec_url: 'https://www.fs.com/products/115386.html',
      specs_verified_at: '2026-10-22',
      contributor: 'bin0sky',
      tags: ['全光汇聚', '25G/40G上行', '出厂双电源', '现货直接提货'],
    },
  },

  // 7. 华为已退市设备展示 (带替换型号提示验证)
  {
    id: 'huawei-s5720-28p-si-ac',
    brand: 'Huawei',
    series: 'CloudEngine S5720-SI',
    model: 'S5720-28P-SI-AC',
    part_number: '02350BCJ',
    category: 'switch',
    lifecycle: 'eol',
    replacement_model: 'S5735-L48P4X-A1',
    description: '【已退市停产】华为上一代 24口千兆三层交换机，现已停止销售，推荐选用 S5735 系列替代。',
    specs: {
      form_factor: '1U',
      ports: {
        summary: '24 x 10/100/1000Base-T + 4 x GE SFP',
        downlink: '24 x 10/100/1000Base-T',
        downlink_count: 24,
        downlink_speed: '1G',
        uplink: '4 x 1GE SFP',
        uplink_count: 4,
        uplink_speed: '1G',
      },
      switching_capacity_gbps: 336,
      forwarding_rate_mpps: 51,
      poe: {
        supported: false,
        standard: 'None',
      },
      layer: 'L3',
      power_supply: {
        type: 'fixed',
        slots: 1,
        default_included: 1,
        default_power_watts: 50,
        redundancy_supported: false,
      },
      airflow: 'front-to-back',
    },
    pricing: {
      currency: 'CNY',
      list_price_gpl: 6800,
      cost_estimate: null, // 停产无现货报价
      discount_reference: null,
      price_verified_at: '2024-05-10',
      source_quote_type: 'none',
    },
    metadata: {
      official_spec_url: 'https://support.huawei.com/enterprise/zh/doc/EDOC1000141443',
      specs_verified_at: '2026-10-22',
      contributor: 'bin0sky',
      tags: ['已退市', '历史设备参考', '避免招投标踩坑'],
    },
  },
];

/**
 * 常用关联配件库 (电源模块、光模块、高速线缆)
 */
export interface AccessoryItem {
  id: string;
  brand: string;
  name: string;
  part_number: string;
  category: 'transceiver' | 'power_module' | 'cable';
  form_factor: string;
  specs_summary: string;
  reference_price: number;
}

export const SEED_ACCESSORIES: AccessoryItem[] = [
  {
    id: 'sfp-10g-sr-850',
    brand: 'Generic/Universal',
    name: '10G SFP+ 多模光模块 (850nm, 300m, LC)',
    part_number: 'SFP-10G-SR',
    category: 'transceiver',
    form_factor: 'SFP+',
    specs_summary: '波长 850nm, 距离 300m (OM3), 双工 LC 接口',
    reference_price: 95,
  },
  {
    id: 'sfp-10g-lr-1310',
    brand: 'Generic/Universal',
    name: '10G SFP+ 单模光模块 (1310nm, 10km, LC)',
    part_number: 'SFP-10G-LR',
    category: 'transceiver',
    form_factor: 'SFP+',
    specs_summary: '波长 1310nm, 传输距离 10km (G.652), 双工 LC',
    reference_price: 160,
  },
  {
    id: 'sfp28-25g-sr',
    brand: 'Generic/Universal',
    name: '25G SFP28 多模光模块 (850nm, 100m, LC)',
    part_number: 'SFP28-25G-SR',
    category: 'transceiver',
    form_factor: 'SFP28',
    specs_summary: '波长 850nm, 传输距离 100m (OM4), 双工 LC',
    reference_price: 260,
  },
  {
    id: 'dac-sfp-10g-1m',
    brand: 'Generic/Universal',
    name: '10G SFP+ 直连无源铜缆 (DAC) 1米',
    part_number: 'SFP-H10GB-CU1M',
    category: 'cable',
    form_factor: 'SFP+ to SFP+',
    specs_summary: '无源 Twinax, 长度 1m, 适用于同机柜堆叠与直连',
    reference_price: 45,
  },
  {
    id: 'huawei-pac600s12-cb',
    brand: 'Huawei',
    name: '华为 600W 交流电源模块 (PAC600S12-CB)',
    part_number: '02312DWR',
    category: 'power_module',
    form_factor: 'Modular',
    specs_summary: '输入 100-240V AC, 输出 12V/600W, 热插拔',
    reference_price: 1800,
  },
  {
    id: 'cisco-pwr-c1-715wac-p',
    brand: 'Cisco',
    name: '思科 715W AC 白金级冗余电源模块',
    part_number: 'PWR-C1-715WAC-P',
    category: 'power_module',
    form_factor: 'Modular',
    specs_summary: '80 Plus Platinum 认证, 支持 C9300 系列 PoE+ 供电',
    reference_price: 3600,
  },
];
