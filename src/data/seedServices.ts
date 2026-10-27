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
  // 1. 弱电施工与现场安装 (9% 税率)
  createEngineeringItem({
    id: 'srv-cabling-install',
    category: '弱电施工',
    brand: '工程施工',
    name: '弱电施工与设备物理安装 (含综合辅材)',
    model: '金属管槽/线缆铺设/光纤熔接打光/设备上架',
    part_number: 'SRV-CAB-INST',
    specs: '弱电工程金属线管包塑软管/托盘安装、网线及光缆铺设、水晶头压接、光纤熔接打光测试、高空施工及网络设备物理安装 (含工程综合辅材料)',
    unit: '式',
    pricingMode: 'fixed',
    unitPriceInclTax: 16200,
    unitPriceExclTax: 14862.39,
    taxRate: 0.09,
    notes: '单价成本 13,500元',
  }),

  // 2. 方案规划与前期作业 (6% 税率)
  createEngineeringItem({
    id: 'srv-req-design',
    category: '实施与割接',
    brand: '专业服务',
    name: '要件定义、现场调研与网络重构架构设计',
    model: '2人 * 3天 = 6人日 (高级架构师/售前)',
    part_number: 'SRV-ENG-DES',
    specs: '现场调查、现网网络分析与流量分析、IP/VLAN 拓扑分析、服务器(物理机/存储/虚拟化)及终端资产排查、现网架构确认；TIB1/2网络分离架构设计、专线割接方案制定、服务器/存储架构设计(方案A/B/C)、AD域控/文件/IP-guard/堡垒机规划、网络及服务器应急回退预案准备',
    unit: '人日',
    pricingMode: 'fixed',
    unitPriceInclTax: 3000,
    unitPriceExclTax: 2830.19,
    taxRate: 0.06,
    notes: '单价成本 3,000元',
  }),

  createEngineeringItem({
    id: 'srv-net-preconfig',
    category: '实施与割接',
    brand: '专业服务',
    name: '网络与终端事前配置作业 (工作时间)',
    model: '网络设备配置 19人日 + 终端PC/打印机配置 5人日 = 24人日',
    part_number: 'SRV-NET-PRE',
    specs: '汇总网络设备与终端PC事前构筑预配置作业 (工作时间实施)：\n1. 网络设备事前配置：出口FW初始化/安全区域拆分、万兆核心/服务器/楼层SW VLAN及LACP配置、WAC/SSID配置、Syslog/安全基线对接、DHCP/RADIUS预配置\n2. 终端PC及打印机事前配置：10台PC OEM OS初始化、CZERO/IPGuard/Office预装、Canon打印机驱动推送',
    unit: '人日',
    pricingMode: 'fixed',
    unitPriceInclTax: 3000,
    unitPriceExclTax: 2830.19,
    taxRate: 0.06,
    notes: '单价成本 3,000元',
  }),

  createEngineeringItem({
    id: 'srv-server-preconfig-a',
    category: '实施与割接',
    brand: '专业服务',
    name: '【方案A 物理机】服务器事前构筑 (工作时间)',
    model: '物理机裸金属安装与应用构筑 = 24人日',
    part_number: 'SRV-SRV-PRE-A',
    specs: '【主推荐 方案A 独立物理机】物理服务器上架接线、RAID5/1划分、Firmware升级与 IP配置、Windows/Linux裸金属OS批量安装与驱动打入、AD主备域控、DNS/DHCP/NTP、FL-01主文件、FL-02 Veeam备份、Syslog/Zabbix及JumpServer物理机部署',
    unit: '人日',
    pricingMode: 'fixed',
    unitPriceInclTax: 3000,
    unitPriceExclTax: 2830.19,
    taxRate: 0.06,
    notes: '单价成本 3,000元',
  }),

  createEngineeringItem({
    id: 'srv-server-preconfig-b',
    category: '实施与割接',
    brand: '专业服务',
    name: '【方案B 虚拟化】服务器事前构筑 (工作时间)',
    model: 'ZStack私有云+SAN存储初始化 = 25人日',
    part_number: 'SRV-SRV-PRE-B',
    specs: '【备选 方案B ZStack虚拟化】2台2U节点及12盘位SAN存储物理上架接线、RAID5/FC多路径配置、2节点ZStack Enterprise私有云 Hypervisor安装/集群初始化/FC共享存储池挂载/HA配置；创建并部署AD主备域控VM、DNS/DHCP/NTP双机、FL-01主文件VM(SAN LUN)、FL-02 Veeam备份VM、IP-guard控制台VM、Syslog/Zabbix监控VM及JumpServer堡垒机独立隔离VM',
    unit: '人日',
    pricingMode: 'fixed',
    unitPriceInclTax: 3000,
    unitPriceExclTax: 2830.19,
    taxRate: 0.06,
    notes: '单价成本 3,000元',
  }),

  createEngineeringItem({
    id: 'srv-server-preconfig-c',
    category: '实施与割接',
    brand: '专业服务',
    name: '【方案C 阿里云】服务器事前构筑 (工作时间)',
    model: '阿里云混合云VPC/VPN与批量ECS = 20人日',
    part_number: 'SRV-SRV-PRE-C',
    specs: '【备选 方案C 阿里云】OS安装及AD DS同步；阿里云VPC/VSwitch/安全组划分及IPsec-VPN网关调测；部署vFortiGate VM镜像/路由引流；阿里云批量创建ECS实例(FL-01, IP-guard, Syslog, JumpServer)OS初始化、FL-01云文件/OSS备份及控制台配置',
    unit: '人日',
    pricingMode: 'fixed',
    unitPriceInclTax: 3000,
    unitPriceExclTax: 2830.19,
    taxRate: 0.06,
    notes: '单价成本 3,000元',
  }),

  // 3. 正式割接与非工作时间作业 (6% 税率，1.5倍费率)
  createEngineeringItem({
    id: 'srv-net-cutover-night',
    category: '实施与割接',
    brand: '专业服务',
    name: '网络割接与终端迁移 (非工作时间/夜间/周末)',
    model: '网络割接 + 终端迁移 = 19人日 (1.5倍加急费率)',
    part_number: 'SRV-CUT-NGT',
    specs: '汇总网络割接与终端数据迁移作业 (非工作时间/夜间/周末割接窗口实施)：\n1. 网络割接：CZERO VPN网关割接、专线二层隔离割接、全网链路冗余HA测试、原有旧网络配置清理与验证、全网RADIUS/802.1X动态准入割接\n2. 终端割接迁移：外勤Splashtop迁移、10名员工旧PC本地文档/桌面/Outlook PST数据打包安全迁移、终端EDR验证、802.1X准入与证书导入、CZERO拨号测试',
    unit: '人日',
    pricingMode: 'fixed',
    unitPriceInclTax: 4500,
    unitPriceExclTax: 4245.28,
    taxRate: 0.06,
    notes: '单价成本 4,500元',
  }),

  createEngineeringItem({
    id: 'srv-server-cutover-a',
    category: '实施与割接',
    brand: '专业服务',
    name: '【方案A 物理机】服务器正式作业 (非工作时间)',
    model: '物理机安全加固与断电热切换 = 4人日',
    part_number: 'SRV-SRV-CUT-A',
    specs: '【主推荐 方案A 独立物理机】物理服务器OS安全加固、双电源断电热切换测试及裸机备份恢复作业',
    unit: '人日',
    pricingMode: 'fixed',
    unitPriceInclTax: 4500,
    unitPriceExclTax: 4245.28,
    taxRate: 0.06,
    notes: '单价成本 4,500元',
  }),

  createEngineeringItem({
    id: 'srv-server-cutover-b',
    category: '实施与割接',
    brand: '专业服务',
    name: '【方案B 虚拟化】服务器正式作业 (非工作时间)',
    model: 'ZStack VM热迁移与HA断电作业 = 4人日',
    part_number: 'SRV-SRV-CUT-B',
    specs: '【备选 方案B ZStack虚拟化】全网虚拟机系统安全加固、ZStack VM动态热迁移(vMotion)作业、单节点断电自动HA拉起及物理机双电源断电热切换测试',
    unit: '人日',
    pricingMode: 'fixed',
    unitPriceInclTax: 4500,
    unitPriceExclTax: 4245.28,
    taxRate: 0.06,
    notes: '单价成本 4,500元',
  }),

  createEngineeringItem({
    id: 'srv-server-cutover-c',
    category: '实施与割接',
    brand: '专业服务',
    name: '【方案C 阿里云】服务器正式作业 (非工作时间)',
    model: '混合云专网连通与VPN切换 = 5人日',
    part_number: 'SRV-SRV-CUT-C',
    specs: '【备选 方案C 阿里云】云上云下安全策略对接、802.1X准入联动、IPsec-VPN主备隧道切换作业及全网混合云系统安全加固',
    unit: '人日',
    pricingMode: 'fixed',
    unitPriceInclTax: 4500,
    unitPriceExclTax: 4245.28,
    taxRate: 0.06,
    notes: '单价成本 4,500元',
  }),

  // 4. 保障、交付与培训 (6% 税率)
  createEngineeringItem({
    id: 'srv-standby-support',
    category: '实施与割接',
    brand: '专业服务',
    name: 'Standby 割接上线护航保障',
    model: '网络切换1天 + 服务器上线1天 = 2人日',
    part_number: 'SRV-STB-SUP',
    specs: '割接上线后 试运行期间现场技术专家驻场及远程护航保障，保障全网业务平稳过渡，即时响应处置突发故障',
    unit: '人日',
    pricingMode: 'fixed',
    unitPriceInclTax: 3000,
    unitPriceExclTax: 2830.19,
    taxRate: 0.06,
    notes: '单价成本 3,000元',
  }),

  createEngineeringItem({
    id: 'srv-docs-delivery',
    category: '实施与割接',
    brand: '专业服务',
    name: '项目完成资料交付 (全套竣工交付图书)',
    model: '网络交付资料3人日 + 服务器交付资料2人日 = 5人日',
    part_number: 'SRV-DOC-DEL',
    specs: '制作包含网络总拓扑图、服务器物理/逻辑架构图(方案A/B/C)、端口映射表、IP/VLAN分配表、设备配置备份、维护手顺与用户验收报告全套图书',
    unit: '人日',
    pricingMode: 'fixed',
    unitPriceInclTax: 3000,
    unitPriceExclTax: 2830.19,
    taxRate: 0.06,
    notes: '单价成本 3,000元',
  }),

  createEngineeringItem({
    id: 'srv-training-transfer',
    category: '实施与割接',
    brand: '专业服务',
    name: 'IT团队交接与培训',
    model: '培训准备与现场讲解作业 = 2人日',
    part_number: 'SRV-TRN-XFR',
    specs: '面向客户 IT 管理团队提供全套架构培训与运维知识转移，包含 AD/FL/Veeam/防火墙/交换机日常管理与故障处置',
    unit: '人日',
    pricingMode: 'fixed',
    unitPriceInclTax: 3000,
    unitPriceExclTax: 2830.19,
    taxRate: 0.06,
    notes: '单价成本 3,000元',
  }),

  createEngineeringItem({
    id: 'srv-pm-total',
    category: '项目管理费',
    brand: '项目管理',
    name: '项目全周期管理与实施统筹费 (固定包干)',
    model: '包含项目全周期总体推进与计划管控',
    part_number: 'SRV-PM-FIX',
    specs: '包含项目全周期总体推进与计划管理、多方供应商及施工团队协调沟通、定例会组织与项目周报/客户汇报资料制作、施工进度与工程质量管控、技术实施风险控制、关键割接里程碑管控及项目最终验收推进管理',
    unit: '式',
    pricingMode: 'fixed',
    unitPriceInclTax: 48000,
    unitPriceExclTax: 45283.02,
    taxRate: 0.06,
    notes: '单价成本 50,000元',
  }),

  // 5. 安全与等保专项 (6% 税率)
  createEngineeringItem({
    id: 'srv-sec-compliance',
    category: '安全与等保',
    brand: '合规认证',
    name: '一级等保评定费',
    model: '专家评定费，初步预计无需备案及测评',
    part_number: 'SRV-SEC-DJ1',
    specs: '本项目涉及 AD、FP、Zabbix、Syslog、堡垒机、备份系统等。因不涉及对外发布及公民个人信息，初步预计为一级等保专家评定指导与评审',
    unit: '项',
    pricingMode: 'fixed',
    unitPriceInclTax: 12000,
    unitPriceExclTax: 11320.75,
    taxRate: 0.06,
  }),

  createEngineeringItem({
    id: 'srv-audit-application',
    category: '安全与等保',
    brand: '合规认证',
    name: '社内安全审查与申请资料审计',
    model: '包含安全申请资料填写及安全审计',
    part_number: 'SRV-SEC-AUD',
    specs: '包含安全申请资料填写及安全审计，对接集团或总部安全基线要求',
    unit: '项',
    pricingMode: 'fixed',
    unitPriceInclTax: 100000,
    unitPriceExclTax: 94339.62,
    taxRate: 0.06,
  }),

  // 6. 第二年维保与服务续费 (Year 2 Renewal)
  createEngineeringItem({
    id: 'rnw-fg80f-y2',
    category: '次年维保与订阅续费',
    brand: 'Fortinet',
    name: 'FortiGate FG-80F 第2年 license 费用',
    model: 'FC-10-0080F-950-02-12',
    part_number: 'FC-10-0080F-950-02-12',
    specs: 'FortiGate FG-80F 第 2 年 FortiGuard 安全防护授权许可续费',
    unit: '年',
    pricingMode: 'fixed',
    unitPriceInclTax: 6200,
    unitPriceExclTax: 5486.73,
    taxRate: 0.13,
    notes: '单价成本 5,236元',
  }),

  createEngineeringItem({
    id: 'rnw-ipguard-y2',
    category: '次年维保与订阅续费',
    brand: 'IP-guard',
    name: 'IP-guard 3 个模块维保 (第2年)',
    model: '加密服务端 + 基本模块 + 透明加密模块',
    part_number: 'RNW-IPG-Y2',
    specs: 'IP-guard 3 个模块第 2 年原厂软件升级与技术支持维保续费',
    unit: '套',
    pricingMode: 'fixed',
    unitPriceInclTax: 1180,
    unitPriceExclTax: 1044.25,
    taxRate: 0.13,
    notes: '单价成本 1,002元',
  }),

  createEngineeringItem({
    id: 'rnw-veeam-y2',
    category: '次年维保与订阅续费',
    brand: 'Veeam',
    name: 'Veeam Backup 第 2 年订阅费',
    model: 'Veeam Backup & Replication 订阅续费',
    part_number: 'RNW-VEEAM-Y2',
    specs: 'Veeam Backup 第 2 年原厂版本升级与技术支持订阅费 (方案 A/B 需要)',
    unit: '套',
    pricingMode: 'fixed',
    unitPriceInclTax: 5900,
    unitPriceExclTax: 5221.24,
    taxRate: 0.13,
    notes: '单价成本 5,000元',
  }),

  createEngineeringItem({
    id: 'rnw-eventlog-y2',
    category: '次年维保与订阅续费',
    brand: 'ZOHO',
    name: 'ZOHO Eventlog Analyzer 第 2 年订阅费',
    model: 'Eventlog Analyzer 专业版 5日志源续费',
    part_number: 'RNW-ZOHO-Y2',
    specs: 'Eventlog Analyzer 第 2 年订阅费，对象：2台防火墙 + 1台无线控制器日志收集与审计分析',
    unit: '套',
    pricingMode: 'fixed',
    unitPriceInclTax: 3250,
    unitPriceExclTax: 2876.11,
    taxRate: 0.13,
    notes: '单价成本 2,747元',
  }),

  createEngineeringItem({
    id: 'rnw-zstack-y2',
    category: '次年维保与订阅续费',
    brand: 'ZStack',
    name: 'ZStack 虚拟化平台维保 (第2年)',
    model: 'ZStack Enterprise 企业版维保续费',
    part_number: 'RNW-ZSTACK-Y2',
    specs: 'ZStack Enterprise 企业版虚拟化平台套件第 2 年原厂技术支持与软件版本升级服务 (若选方案B)',
    unit: '年',
    pricingMode: 'fixed',
    unitPriceInclTax: 15294,
    unitPriceExclTax: 13534.51,
    taxRate: 0.13,
    notes: '单价成本 13,000元',
  }),

  createEngineeringItem({
    id: 'rnw-old-server-y2',
    category: '次年维保与订阅续费',
    brand: '服务器续保',
    name: '利旧服务器第 2 年续保服务',
    model: '旧服务器硬件与维保支持',
    part_number: 'RNW-OLD-SRV-Y2',
    specs: '客户利旧原有旧服务器第 2 年硬件维保支持费',
    unit: '年',
    pricingMode: 'fixed',
    unitPriceInclTax: 3500,
    unitPriceExclTax: 3097.35,
    taxRate: 0.13,
    notes: '单价成本 3,000元',
  }),
];
