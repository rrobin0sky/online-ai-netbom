export interface EngineeringItem {
  id: string;
  category: '弱电材料' | '布线人工' | '作业费' | '项目管理费' | string;
  brand: string;
  name: string;
  model: string;
  part_number: string;
  specs: string;
  unit: string;
  pricingMode: 'fixed' | 'percent';
  unitPriceExclTax: number; // 未税单价
  unitPriceInclTax: number; // 含税单价
  percentageRate?: number;  // 按比例取费时的百分比，如 5 表示 5%
  taxRate: number;          // 增值税率，如 0.13, 0.09, 0.06, 0.03, 0
  notes?: string;
}

export interface BOMServiceItem {
  uid: string;
  item: EngineeringItem;
  quantity: number;
  pricingMode: 'fixed' | 'percent';
  unitPriceExclTax: number;
  unitPriceInclTax: number;
  percentageRate: number;
  taxRate: number;
  notes: string;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function createEngineeringItem(
  partial: Omit<EngineeringItem, 'unitPriceExclTax'> & { unitPriceExclTax?: number }
): EngineeringItem {
  const excl =
    partial.unitPriceExclTax !== undefined
      ? partial.unitPriceExclTax
      : round2(partial.unitPriceInclTax / (1 + partial.taxRate));
  return {
    ...partial,
    unitPriceExclTax: excl,
  };
}

export const SEED_SERVICES: EngineeringItem[] = [
  // 1. 弱电材料 (13% 税率)
  createEngineeringItem({
    id: 'mat-cat6-utp-box',
    category: '弱电材料',
    brand: '综合布线',
    name: '六类非屏蔽双绞线 (CAT6)',
    model: 'CAT6-UTP-305M',
    part_number: 'CAB-C6-305',
    specs: '23AWG 无氧铜，305米/箱，符合 ISO/IEC 11801 标准',
    unit: '箱',
    pricingMode: 'fixed',
    unitPriceInclTax: 850,
    taxRate: 0.13,
  }),
  createEngineeringItem({
    id: 'mat-cat6a-utp-box',
    category: '弱电材料',
    brand: '综合布线',
    name: '超六类万兆网线 (CAT6A)',
    model: 'CAT6A-SFTP-305M',
    part_number: 'CAB-C6A-305',
    specs: '23AWG 无氧铜屏蔽线，支持万兆传输，305米/箱，低烟无卤 LSZH',
    unit: '箱',
    pricingMode: 'fixed',
    unitPriceInclTax: 1450,
    taxRate: 0.13,
  }),
  createEngineeringItem({
    id: 'mat-om3-fiber-12c',
    category: '弱电材料',
    brand: '综合布线',
    name: '室内万兆多模光缆 (OM3-12芯)',
    model: 'GJPFJH-12B1.3',
    part_number: 'FIB-OM3-12C',
    specs: '12芯 OM3 万兆多模室内光缆，LSZH 阻燃护套',
    unit: '米',
    pricingMode: 'fixed',
    unitPriceInclTax: 6.5,
    taxRate: 0.13,
  }),
  createEngineeringItem({
    id: 'mat-jdg20-pipe',
    category: '弱电材料',
    brand: '国标管材',
    name: 'JDG 紧定式镀锌穿线管 Φ20',
    model: 'JDG-DN20×1.2mm',
    part_number: 'PIPE-JDG20',
    specs: '热镀锌钢导管，管径 20mm，壁厚 1.2mm（含管箍、锁母、吊卡辅件）',
    unit: '米',
    pricingMode: 'fixed',
    unitPriceInclTax: 8.5,
    taxRate: 0.13,
  }),
  createEngineeringItem({
    id: 'mat-jdg25-pipe',
    category: '弱电材料',
    brand: '国标管材',
    name: 'JDG 紧定式镀锌穿线管 Φ25',
    model: 'JDG-DN25×1.2mm',
    part_number: 'PIPE-JDG25',
    specs: '热镀锌钢导管，管径 25mm，壁厚 1.2mm（含管箍、锁母、支吊架）',
    unit: '米',
    pricingMode: 'fixed',
    unitPriceInclTax: 11.5,
    taxRate: 0.13,
  }),
  createEngineeringItem({
    id: 'mat-cable-tray-200',
    category: '弱电材料',
    brand: '国标桥架',
    name: '镀锌金属线槽/弱电桥架 200×100',
    model: 'QJ-200×100×1.2',
    part_number: 'TRAY-200-100',
    specs: '200mm×100mm 镀锌槽式桥架，含盖板、连接片、丝杆及托臂辅材',
    unit: '米',
    pricingMode: 'fixed',
    unitPriceInclTax: 65,
    taxRate: 0.13,
  }),
  createEngineeringItem({
    id: 'mat-patch-panel-24',
    category: '弱电材料',
    brand: '综合布线',
    name: '24口六类配线架 + 1U 理线器套件',
    model: 'PP-C6-24P-KIT',
    part_number: 'ACC-PP24-KIT',
    specs: '19英寸机架式 24口模块化配线架（含24颗六类模块、1U金属理线架、跳线）',
    unit: '套',
    pricingMode: 'fixed',
    unitPriceInclTax: 420,
    taxRate: 0.13,
  }),
  createEngineeringItem({
    id: 'mat-cabinet-42u',
    category: '弱电材料',
    brand: '图腾/标准',
    name: '42U 标准网络服务器机柜',
    model: 'G26642 (600×600×2000)',
    part_number: 'CAB-42U-66',
    specs: '600×600×2000mm 前后网孔门，含2条8位PDU电源、托盘2块、风扇单元',
    unit: '台',
    pricingMode: 'fixed',
    unitPriceInclTax: 2200,
    taxRate: 0.13,
  }),

  // 2. 弱电布线人工 (默认 9% 建筑安装税率)
  createEngineeringItem({
    id: 'lab-point-cabling',
    category: '布线人工',
    brand: '施工人工',
    name: '网络信息点布线与端接人工',
    model: '单点放线+打模块+寻线测试',
    part_number: 'LAB-NET-PT',
    specs: '含网线穿管/桥架敷设、两端模块压接、面板安装、标签打印及福禄克/通断测试',
    unit: '点',
    pricingMode: 'fixed',
    unitPriceInclTax: 95,
    taxRate: 0.09,
  }),
  createEngineeringItem({
    id: 'lab-pipe-install',
    category: '布线人工',
    brand: '施工人工',
    name: '线管 / 桥架敷设安装人工',
    model: 'JDG管/线槽吊装固定',
    part_number: 'LAB-PIPE-M',
    specs: '含支吊架打孔安装、JDG线管或金属线槽敷设、接地跨接施工人工',
    unit: '米',
    pricingMode: 'fixed',
    unitPriceInclTax: 18,
    taxRate: 0.09,
  }),
  createEngineeringItem({
    id: 'lab-fiber-splice',
    category: '布线人工',
    brand: '施工人工',
    name: '光缆敷设与光纤熔接测试人工',
    model: '光纤熔接+ODF端接+光衰测试',
    part_number: 'LAB-FIB-CORE',
    specs: '含室内外光缆牵引敷设、ODF配线箱端接、尾纤熔接及光功率计测试',
    unit: '芯',
    pricingMode: 'fixed',
    unitPriceInclTax: 45,
    taxRate: 0.09,
  }),
  createEngineeringItem({
    id: 'lab-device-mount',
    category: '布线人工',
    brand: '施工人工',
    name: '交换机/无线AP物理安装与上架人工',
    model: '设备上架/吸顶安装+跳线整理',
    part_number: 'LAB-DEV-MNT',
    specs: '含设备开箱验货、机柜导轨安装固定、电源线与跳线捆扎理线、线标粘贴',
    unit: '台',
    pricingMode: 'fixed',
    unitPriceInclTax: 150,
    taxRate: 0.09,
  }),

  // 3. 作业费 (特种施工/措施费，默认 9% 税率)
  createEngineeringItem({
    id: 'fee-high-altitude',
    category: '作业费',
    brand: '措施作业',
    name: '高空作业费（升降车/脚手架台班）',
    model: '≥3.5米高空布线与吊装措施',
    part_number: 'FEE-HIGH-ALT',
    specs: '含剪叉式高空升降平台租赁或移动脚手架搭拆、安全防护措施及高空补助',
    unit: '台班',
    pricingMode: 'fixed',
    unitPriceInclTax: 800,
    taxRate: 0.09,
  }),
  createEngineeringItem({
    id: 'fee-wall-drilling',
    category: '作业费',
    brand: '措施作业',
    name: '穿墙水钻开孔与防火封堵作业费',
    model: '过墙洞口开孔+防火泥封堵',
    part_number: 'FEE-DRILL-FIRE',
    specs: '含水钻穿墙/穿楼板打洞、套管预埋及桥架穿墙处有机防火泥/防火包封堵',
    unit: '项',
    pricingMode: 'fixed',
    unitPriceInclTax: 600,
    taxRate: 0.09,
  }),
  createEngineeringItem({
    id: 'fee-night-shift',
    category: '作业费',
    brand: '措施作业',
    name: '夜间割接施工与文明施工清理费',
    model: '非工作时间施工/现场保护清理',
    part_number: 'FEE-NIGHT-CLN',
    specs: '含业务不中断夜间割接施工补贴、成品保护膜敷设及施工垃圾清运',
    unit: '项',
    pricingMode: 'fixed',
    unitPriceInclTax: 1500,
    taxRate: 0.09,
  }),

  // 4. 项目管理费与集成调试费 (默认 6% 现代服务税率，支持按比例 % 或固定金额)
  createEngineeringItem({
    id: 'pm-system-integration',
    category: '项目管理费',
    brand: '技术服务',
    name: '网络系统集成与联调配置费',
    model: 'VLAN/OSPF/堆叠/安全策略调测',
    part_number: 'SRV-SYS-INT',
    specs: '含全网IP地址规划、核心堆叠、路由策略联调、无线漫游优化及压力测试（默认按5%计取，可改固定价）',
    unit: '%',
    pricingMode: 'percent',
    percentageRate: 5,
    unitPriceInclTax: 3000,
    taxRate: 0.06,
  }),
  createEngineeringItem({
    id: 'pm-project-mgmt',
    category: '项目管理费',
    brand: '项目管理',
    name: '工程项目管理费与竣工文档编制',
    model: '项目经理驻场/进度安全管理/竣工图',
    part_number: 'SRV-PM-DOC',
    specs: '含施工组织设计、项目经理现场协调、CAD竣工图纸绘制、验收报告编制（默认按3%计取，可改固定价）',
    unit: '%',
    pricingMode: 'percent',
    percentageRate: 3,
    unitPriceInclTax: 2000,
    taxRate: 0.06,
  }),
];
