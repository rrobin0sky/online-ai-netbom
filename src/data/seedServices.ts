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

  // 5. 专业工程作业与项目管理 (Enterprise SI Professional Services - 人日/包干)
  createEngineeringItem({
    id: 'srv-req-design',
    category: '实施与割接',
    brand: '专业服务',
    name: '要件定义、现场调研与网络重构架构设计',
    model: '2人 * 3天 = 6人日 (高级架构师/售前)',
    part_number: 'SRV-ENG-DES',
    specs: '现场调查、现网网络分析与流量分析、IP/VLAN拓扑分析、服务器及终端资产排查、网络分离架构设计、专线割接方案及应急回退预案准备',
    unit: '人日',
    pricingMode: 'fixed',
    unitPriceInclTax: 3000,
    taxRate: 0.06,
  }),
  createEngineeringItem({
    id: 'srv-net-preconfig',
    category: '实施与割接',
    brand: '专业服务',
    name: '网络设备与终端PC事前预配置 (工作时间)',
    model: '网络设备19人日 + 终端PC5人日 = 24人日',
    part_number: 'SRV-NET-PRE',
    specs: '出口FW初始化/安全区域拆分、核心及楼层SW VLAN/LACP配置、WAC/SSID配置、Syslog/安全基线对接、PC OS初始化及打印机驱动推送',
    unit: '人日',
    pricingMode: 'fixed',
    unitPriceInclTax: 3000,
    taxRate: 0.06,
  }),
  createEngineeringItem({
    id: 'srv-server-preconfig',
    category: '实施与割接',
    brand: '专业服务',
    name: '服务器事前构筑与系统部署 (工作时间)',
    model: '物理机上架/RAID划分/OS与应用部署 24人日',
    part_number: 'SRV-SRV-PRE',
    specs: '服务器上架接线、RAID5/1划分、Firmware升级与IP配置、Windows/Linux裸机安装与驱动、AD主备域控、FL文件/Veeam备份/Syslog及JumpServer部署',
    unit: '人日',
    pricingMode: 'fixed',
    unitPriceInclTax: 3000,
    taxRate: 0.06,
  }),
  createEngineeringItem({
    id: 'srv-net-cutover-night',
    category: '实施与割接',
    brand: '专业服务',
    name: '网络割接与终端数据迁移 (非工作时间/夜间周末)',
    model: '网络割接 + 终端迁移 = 19人日 (1.5倍加急费率)',
    part_number: 'SRV-CUT-NGT',
    specs: 'VPN网关割接、专线二层隔离割接、链路冗余HA测试、旧配置清理验证、802.1X动态准入割接、员工旧PC数据与Outlook本地文件安全迁移',
    unit: '人日',
    pricingMode: 'fixed',
    unitPriceInclTax: 4500,
    taxRate: 0.06,
  }),
  createEngineeringItem({
    id: 'srv-server-cutover-night',
    category: '实施与割接',
    brand: '专业服务',
    name: '服务器正式割接与断电热切换 (非工作时间)',
    model: '服务器正式作业 = 4人日 (1.5倍费率)',
    part_number: 'SRV-SRV-CUT',
    specs: '物理服务器OS安全加固、双电源断电热切换测试、裸机备份恢复作业、业务连通性交叉验证',
    unit: '人日',
    pricingMode: 'fixed',
    unitPriceInclTax: 4500,
    taxRate: 0.06,
  }),
  createEngineeringItem({
    id: 'srv-standby-support',
    category: '实施与割接',
    brand: '专业服务',
    name: '割接上线后现场驻场保障 (Standby)',
    model: '网络切换1天 + 服务器上线1天 = 2人日',
    part_number: 'SRV-STB-SUP',
    specs: '割接上线后试运行期间现场技术专家驻场及远程护航保障，保障全网业务平稳过渡，即时响应处置突发故障',
    unit: '人日',
    pricingMode: 'fixed',
    unitPriceInclTax: 3000,
    taxRate: 0.06,
  }),
  createEngineeringItem({
    id: 'srv-docs-delivery',
    category: '实施与割接',
    brand: '专业服务',
    name: '项目竣工交付图书编制与知识转移培训',
    model: '竣工资料5人日 + 运维培训2人日 = 7人日',
    part_number: 'SRV-DOC-TRN',
    specs: '制作网络总拓扑、物理逻辑架构图、端口映射表、IP/VLAN表、配置备份与维护手册；面向客户IT团队提供全套运维架构培训',
    unit: '人日',
    pricingMode: 'fixed',
    unitPriceInclTax: 3000,
    taxRate: 0.06,
  }),
  createEngineeringItem({
    id: 'srv-pm-total',
    category: '项目管理费',
    brand: '项目管理',
    name: '企业重构项目全周期管理与实施统筹费 (固定包干)',
    model: '包含项目全周期总体推进与质量管控',
    part_number: 'SRV-PM-FIX',
    specs: '总体推进与计划管理、多方供应商及施工团队协调沟通、定例会组织与项目周报/客户汇报、施工进度与质量管控、关键割接里程碑把控及项目最终验收推进',
    unit: '式',
    pricingMode: 'fixed',
    unitPriceInclTax: 48000,
    taxRate: 0.06,
  }),
  createEngineeringItem({
    id: 'srv-sec-compliance',
    category: '安全与等保',
    brand: '合规认证',
    name: '一级等保专家评定与合规咨询费',
    model: '专家评定费（初步预计无需备案及测评）',
    part_number: 'SRV-SEC-DJ1',
    specs: '涉及 AD、文件、Zabbix、Syslog、堡垒机、备份系统等网络与主机安全一级等保专家现场评定与评审指导',
    unit: '项',
    pricingMode: 'fixed',
    unitPriceInclTax: 12000,
    taxRate: 0.06,
  }),
  createEngineeringItem({
    id: 'srv-audit-application',
    category: '安全与等保',
    brand: '合规认证',
    name: '社内安全审查申请与安全审计专项费',
    model: '包含安全申请资料填写及安全审计',
    part_number: 'SRV-SEC-AUD',
    specs: '企业集团内部安全申请资料编制与填报、架构安全审计、合规风险评估及跨国总部审计资料对应',
    unit: '项',
    pricingMode: 'fixed',
    unitPriceInclTax: 100000,
    taxRate: 0.06,
  }),
];
