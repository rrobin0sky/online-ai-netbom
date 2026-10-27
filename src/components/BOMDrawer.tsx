import React, { useState, useMemo } from 'react';
import {
  X,
  FileSpreadsheet,
  Share2,
  Trash2,
  Check,
  PackagePlus,
  ShieldAlert,
  BookmarkPlus,
  Plus,
  Layers,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Activity,
  RotateCcw,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';
import { useBOMStore, getMergedServiceCatalog } from '../store/useBOMStore';
import { exportBOMToExcel } from '../utils/excel-export';
import { SEED_ACCESSORIES } from '../data/seedDevices';
import { EngineeringItem } from '../data/seedServices';

const BTN_UNIFIED =
  'h-8 px-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-zinc-200 hover:text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-40';

function round2(num: number): number {
  return Math.round(num * 100) / 100;
}

// Convert number to Chinese Currency Uppercase
function toChineseCurrency(num: number): string {
  if (isNaN(num) || num <= 0) return '零元整';
  const fraction = ['角', '分'];
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const unit = [
    ['元', '万', '亿'],
    ['', '拾', '佰', '仟'],
  ];
  let n = Math.abs(num);
  let s = '';
  for (let i = 0; i < fraction.length; i++) {
    s += (digit[Math.floor(n * 10 * Math.pow(10, i)) % 10] + fraction[i]).replace(/零./, '');
  }
  s = s || '整';
  n = Math.floor(n);
  for (let i = 0; i < unit[0].length && n > 0; i++) {
    let p = '';
    for (let j = 0; j < unit[1].length && n > 0; j++) {
      p = digit[n % 10] + unit[1][j] + p;
      n = Math.floor(n / 10);
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
  }
  return s
    .replace(/(零.)*零元/, '元')
    .replace(/(零.)+/g, '零')
    .replace(/^整$/, '零元整');
}

export const BOMDrawer: React.FC = () => {
  const {
    items,
    serviceItems,
    customServices,
    deletedServiceIds,
    isDrawerOpen,
    setDrawerOpen,
    projectName,
    setProjectName,
    clientName,
    setClientName,
    creatorName,
    quoteValidityDays,
    setQuoteValidityDays,
    globalDiscountRate,
    taxRate,
    setTaxRate,
    updateQuantity,
    updateCustomPrice,
    updateItemTaxRate,
    updateAreaGroup,
    updateItemNotes,
    removeItem,
    clearBOM,
    addAccessoryToItem,
    updateAccessoryQuantity,
    updateAccessoryPrice,
    removeAccessoryFromItem,
    addServiceItem,
    addBlankServiceRow,
    removeServiceItem,
    updateServiceItem,
    updateServicePrice,
    updateServiceTaxRate,
    saveCurrentBOMAsTemplate,
    generateShareUrl,
    techReviewed,
    techReviewer,
    commercialReviewed,
    commercialReviewer,
    setTechReview,
    setCommercialReview,
    resetReviewStatus,
    isCostUnlocked,
    setCostModalOpen,
  } = useBOMStore();

  const [copied, setCopied] = useState(false);
  const [savedTmpl, setSavedTmpl] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeAccessoryUID, setActiveAccessoryUID] = useState<string | null>(null);
  const [isServicePickerOpen, setIsServicePickerOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);

  const auditIssues = useMemo(() => {
    const issues: { type: 'severe' | 'warn' | 'ok'; title: string; desc: string }[] = [];
    const validItems = (items || []).filter((i) => i && i.device);
    if (validItems.length === 0 && (!serviceItems || serviceItems.length === 0)) {
      return issues;
    }

    // 1. Modular power supply check
    validItems.forEach((item) => {
      const ps = item.device.specs?.power_supply;
      const needsPowerWarning =
        ps?.type === 'modular' &&
        ps?.default_included === 0 &&
        (!item.selectedAccessories ||
          !item.selectedAccessories.some(
            (a) => a.accessoryId.includes('pwr') || a.accessoryId.includes('pac')
          ));
      if (needsPowerWarning) {
        issues.push({
          type: 'severe',
          title: `${item.device.model} 裸机未配电源模块`,
          desc: '该机型为插槽式双电源架构，出厂不含电源模块，当前清单未选配任何电源配件！',
        });
      }
    });

    // 2. 0 price items check
    validItems.forEach((item) => {
      const gpl = item.device.pricing?.list_price_gpl ?? null;
      const effectiveDiscount = item.itemDiscountRate ?? globalDiscountRate;
      const unitPrice =
        item.customUnitPrice !== null
          ? item.customUnitPrice
          : item.device.pricing?.cost_estimate !== null && item.device.pricing?.cost_estimate !== undefined
          ? item.device.pricing.cost_estimate
          : gpl !== null
          ? Math.round(gpl * effectiveDiscount)
          : 0;
      if (!unitPrice || unitPrice <= 0) {
        issues.push({
          type: 'warn',
          title: `${item.device.model} 单价为0或待核价`,
          desc: '该设备当前未填写单价，请补充实际报价或进货折扣。',
        });
      }
    });

    // 3. Optical ports vs transceivers
    let totalOpticalPorts = 0;
    let totalTransceivers = 0;
    validItems.forEach((item) => {
      const uplinkCount = item.device.specs?.ports?.uplink_count || 0;
      totalOpticalPorts += uplinkCount * item.quantity;
      (item.selectedAccessories || []).forEach((acc) => {
        if (acc.accessoryId && acc.accessoryId.includes('sfp')) {
          totalTransceivers += (acc.quantity || 1) * item.quantity;
        }
      });
    });
    if (totalOpticalPorts > 0 && totalTransceivers === 0) {
      issues.push({
        type: 'warn',
        title: '万兆光口未选配光模块',
        desc: `整单共计 ${totalOpticalPorts} 个万兆光口，当前尚未选配任何 SFP+ 模块或 DAC 直连线缆。`,
      });
    }

    // 4. Multi-tax check
    const itemTaxes = validItems.map((i) => i.itemTaxRate ?? taxRate);
    const mixedTaxes = new Set([taxRate, ...itemTaxes]);
    if (mixedTaxes.size > 1) {
      issues.push({
        type: 'ok',
        title: '存在多档税率配置',
        desc: `清单包含 ${Array.from(mixedTaxes)
          .map((t) => (t * 100).toFixed(0) + '%')
          .join('、')} 差异税率，系统已按单行精确计算税金。`,
      });
    }

    return issues;
  }, [items, serviceItems, taxRate, globalDiscountRate]);

  const hasSevereIssue = auditIssues.some((i) => i.type === 'severe');

  if (!isDrawerOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  // ============================================================================
  // Financial Calculations
  // ============================================================================
  let equipExclSubtotal = 0;
  let equipInclSubtotal = 0;

  (items || []).forEach((item) => {
    if (!item || !item.device) return;
    const gpl = item.device.pricing?.list_price_gpl ?? null;
    const effectiveDiscount = item.itemDiscountRate ?? globalDiscountRate;
    const rowTax = item.itemTaxRate ?? taxRate;

    const hostUnitPriceExcl =
      item.customUnitPrice !== null
        ? item.customUnitPrice
        : item.device.pricing?.cost_estimate !== null && item.device.pricing?.cost_estimate !== undefined
        ? item.device.pricing.cost_estimate
        : gpl !== null
        ? Math.round(gpl * effectiveDiscount)
        : 0;

    const hostUnitPriceIncl = round2(hostUnitPriceExcl * (1 + rowTax));
    equipExclSubtotal += hostUnitPriceExcl * item.quantity;
    equipInclSubtotal += hostUnitPriceIncl * item.quantity;

    (item.selectedAccessories || []).forEach((acc) => {
      const accExcl = acc.unitPrice || 0;
      const accIncl = round2(accExcl * (1 + rowTax));
      const totalAccQty = (acc.quantity || 1) * item.quantity;
      equipExclSubtotal += accExcl * totalAccQty;
      equipInclSubtotal += accIncl * totalAccQty;
    });
  });

  // Services: First calculate fixed items to serve as base for percent-mode services
  let fixedServiceExcl = 0;
  let fixedServiceIncl = 0;

  (serviceItems || []).forEach((s) => {
    if (s.pricingMode !== 'percent') {
      const excl = (s.unitPriceExclTax || 0) * (s.quantity || 1);
      const incl = (s.unitPriceInclTax || 0) * (s.quantity || 1);
      fixedServiceExcl += excl;
      fixedServiceIncl += incl;
    }
  });

  const baseForPercent = equipExclSubtotal + fixedServiceExcl;

  let serviceExclSubtotal = fixedServiceExcl;
  let serviceInclSubtotal = fixedServiceIncl;

  (serviceItems || []).forEach((s) => {
    if (s.pricingMode === 'percent') {
      const excl = round2(baseForPercent * ((s.percentageRate || 0) / 100));
      const incl = round2(excl * (1 + (s.taxRate || 0)));
      serviceExclSubtotal += excl;
      serviceInclSubtotal += incl;
    }
  });

  const totalExclAmount = round2(equipExclSubtotal + serviceExclSubtotal);
  const grandTotal = round2(equipInclSubtotal + serviceInclSubtotal);
  const totalTaxAmount = round2(grandTotal - totalExclAmount);

  const availableServices = getMergedServiceCatalog(customServices, deletedServiceIds);

  const handleTechReview = () => {
    const name = prompt('请输入技术复核人姓名（如：张工 / 售前网络架构师）：', techReviewer || '张工');
    if (!name) return;
    setTechReview(true, name.trim());
  };

  const handleCommercialReview = () => {
    if (!techReviewed) {
      alert('请先完成第 1 步技术复核，再进行商务终审！');
      return;
    }
    const name = prompt('请输入商务审核人姓名（如：李总 / 商务总监）：', commercialReviewer || '李总');
    if (!name) return;
    setCommercialReview(true, name.trim());
  };

  const handleShare = () => {
    const url = generateShareUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAsTemplate = () => {
    if (items.length === 0 && (!serviceItems || serviceItems.length === 0)) return;
    const name = prompt('请输入模板名称：', projectName || '自定义网络方案');
    if (!name) return;
    saveCurrentBOMAsTemplate(name, '自定义模板', `包含 ${items.length} 类网络设备及工程服务`);
    setSavedTmpl(true);
    setTimeout(() => setSavedTmpl(false), 2000);
  };

  const handleExport = async () => {
    if (items.length === 0 && (!serviceItems || serviceItems.length === 0)) return;
    setIsExporting(true);
    try {
      await exportBOMToExcel({
        projectName,
        clientName,
        creatorName,
        quoteValidityDays,
        globalDiscountRate,
        taxRate,
        items,
        serviceItems,
        techReviewed,
        techReviewer,
        commercialReviewed,
        commercialReviewer,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-2 sm:p-5">
      {/* Backdrop */}
      <div
        onClick={() => setDrawerOpen(false)}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Engineer Quotation Sheet Modal */}
      <div className="relative w-full max-w-7xl max-h-[94vh] glass-panel-elevated border border-white/15 rounded-2xl flex flex-col z-10 shadow-2xl overflow-hidden bg-zinc-950/95">
        {/* Top Quotation Title Bar */}
        <div className="px-5 py-3 bg-zinc-900/80 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-4 h-4 text-zinc-300" />
            <h2 className="text-sm font-bold text-zinc-100">报价清单</h2>
          </div>

          <div className="flex items-center gap-2">
            {(items.length > 0 || (serviceItems && serviceItems.length > 0)) && (
              <>
                <button
                  type="button"
                  onClick={handleSaveAsTemplate}
                  className={BTN_UNIFIED}
                >
                  {savedTmpl ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>已保存</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-3.5 h-3.5 text-zinc-400" />
                      <span>存模板</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    if (confirm('确定清空整张报价清单吗？')) clearBOM();
                  }}
                  className={BTN_UNIFIED}
                >
                  <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>清空</span>
                </button>
              </>
            )}
            <button
              onClick={() => setDrawerOpen(false)}
              className="h-8 w-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quotation Meta Header (with 报价有效期) */}
        <div className="grid grid-cols-1 sm:grid-cols-4 border-b border-white/10 bg-zinc-950/60 text-xs divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          <div className="p-2.5 flex items-center gap-2">
            <span className="text-zinc-500 whitespace-nowrap font-medium">项目名称:</span>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-transparent text-zinc-100 font-semibold focus:outline-none border-b border-transparent focus:border-zinc-400"
            />
          </div>
          <div className="p-2.5 flex items-center gap-2">
            <span className="text-zinc-500 whitespace-nowrap font-medium">客户单位:</span>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full bg-transparent text-zinc-100 font-medium focus:outline-none border-b border-transparent focus:border-zinc-400"
            />
          </div>
          <div className="p-2.5 flex items-center gap-2">
            <span className="text-zinc-500 whitespace-nowrap font-medium">报价有效期:</span>
            <select
              value={quoteValidityDays}
              onChange={(e) => setQuoteValidityDays(parseInt(e.target.value) || 30)}
              className="bg-zinc-900 border border-white/10 rounded px-2 py-0.5 text-xs text-zinc-100"
            >
              <option value="7">7天</option>
              <option value="15">15天</option>
              <option value="30">30天 (标准)</option>
              <option value="60">60天</option>
              <option value="90">90天</option>
            </select>
          </div>
          <div className="p-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500 whitespace-nowrap font-medium">默认设备税率:</span>
              <select
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                className="bg-zinc-900 border border-white/10 rounded px-2 py-0.5 text-xs text-zinc-100"
              >
                <option value="0.13">13% 专票</option>
                <option value="0.09">9% 专票</option>
                <option value="0.06">6% 普票</option>
                <option value="0.03">3% 简易</option>
                <option value="0">0% 未税</option>
              </select>
            </div>
            <span className="font-mono text-[11px] text-zinc-500">{todayStr}</span>
          </div>
        </div>

        {/* Two-Stage Review & Health Check Bar */}
        <div className="px-4 py-2 bg-zinc-900/60 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left: Two-Stage Verification Workflow */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-zinc-300" />
              <span>报价双核流程:</span>
            </div>

            {/* Stage 1: 技术复核 */}
            <div className="flex items-center gap-1.5">
              {techReviewed ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.08] border border-white/20 text-zinc-100 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>1. 技术复核:</span>
                  <span className="text-zinc-200">{techReviewer || '已复核'}</span>
                  <button
                    type="button"
                    onClick={handleTechReview}
                    className="text-[10px] text-zinc-400 hover:text-white underline ml-1"
                    title="修改技术复核人"
                  >
                    改名
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleTechReview}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-dashed border-white/20 text-zinc-300 hover:text-white transition-colors"
                >
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  <span>1. 技术复核 (待核)</span>
                </button>
              )}
            </div>

            <span className="text-zinc-600 hidden sm:inline">→</span>

            {/* Stage 2: 商务终审 */}
            <div className="flex items-center gap-1.5">
              {commercialReviewed ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.08] border border-white/20 text-zinc-100 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>2. 商务终审:</span>
                  <span className="text-zinc-200">{commercialReviewer || '已终审'}</span>
                  <button
                    type="button"
                    onClick={handleCommercialReview}
                    className="text-[10px] text-zinc-400 hover:text-white underline ml-1"
                    title="修改商务审核人"
                  >
                    改名
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleCommercialReview}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors ${
                    techReviewed
                      ? 'bg-white/[0.04] hover:bg-white/[0.08] border-dashed border-white/20 text-zinc-300 hover:text-white'
                      : 'bg-black/20 border-white/5 text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                  <span>2. 商务终审{techReviewed ? ' (待审)' : ' (需先过技术)'}</span>
                </button>
              )}
            </div>

            {/* Reset Button (if any reviewed) */}
            {(techReviewed || commercialReviewed) && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('确定要重置当前报价单的复核与审核状态吗？')) {
                    resetReviewStatus();
                  }
                }}
                className="h-6 px-2 rounded bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1 text-[11px] transition-colors"
                title="重置复核状态"
              >
                <RotateCcw className="w-3 h-3" />
                <span>重置状态</span>
              </button>
            )}
          </div>

          {/* Right: 报价体检 Health Check Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsHealthModalOpen(true)}
              className={`h-7 px-3 rounded-lg border inline-flex items-center gap-1.5 transition-colors font-medium ${
                hasSevereIssue
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25'
                  : auditIssues.length > 0
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                  : 'bg-white/[0.05] border-white/10 text-zinc-300 hover:bg-white/[0.10]'
              }`}
            >
              <Activity className={`w-3.5 h-3.5 ${hasSevereIssue ? 'text-rose-400 animate-pulse' : 'text-zinc-400'}`} />
              <span>报价体检</span>
              {auditIssues.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  hasSevereIssue ? 'bg-rose-500/30 text-rose-200' : 'bg-amber-500/30 text-amber-200'
                }`}>
                  {auditIssues.length}项
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Quotation Sheet Body */}
        <div className="flex-1 overflow-x-auto overflow-y-auto divide-y divide-white/10">
          {/* ================================================================= */}
          {/* SECTION 1: 一、网络设备清单 */}
          {/* ================================================================= */}
          <div className="p-3 bg-zinc-900/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-200">一、网络设备清单</span>
                <span className="px-1.5 py-0.2 rounded bg-white/10 text-zinc-400 text-[11px] font-mono">
                  {items.length} 款
                </span>
              </div>
              <div className="text-xs text-zinc-400 font-mono">
                含税小计: ¥{equipInclSubtotal.toLocaleString()}
              </div>
            </div>

            {items.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500 border border-dashed border-white/10 rounded-lg">
                暂未添加网络设备，可在设备库卡片上点击「清单」加入
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs border border-white/10 rounded-lg overflow-hidden">
                <thead className="bg-zinc-900/90 text-zinc-300 font-semibold border-b border-white/15 whitespace-nowrap">
                  <tr className="divide-x divide-white/10">
                    <th className="py-2 px-2 text-center w-10">序号</th>
                    <th className="py-2 px-2 w-24">网络分区</th>
                    <th className="py-2 px-2 w-16">品牌</th>
                    <th className="py-2 px-2.5 min-w-[140px]">产品型号</th>
                    <th className="py-2 px-2 w-28">订货编码</th>
                    <th className="py-2 px-2.5 min-w-[200px]">关键技术规格描述</th>
                    <th className="py-2 px-1 text-center w-14">数量</th>
                    <th className="py-2 px-1 text-center w-10">单位</th>
                    <th className="py-2 px-1.5 text-center w-16">税率</th>
                    <th className="py-2 px-2 text-right w-24">未税单价</th>
                    <th className="py-2 px-2 text-right w-24">含税单价</th>
                    <th className="py-2 px-2 text-right w-24">含税合价</th>
                    <th className="py-2 px-2 min-w-[100px]">备注</th>
                    <th className="py-2 px-1.5 text-center w-20">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {items.map((item, idx) => {
                    if (!item || !item.device) return null;
                    const gpl = item.device.pricing?.list_price_gpl ?? null;
                    const effectiveDiscount = item.itemDiscountRate ?? globalDiscountRate;
                    const rowTax = item.itemTaxRate ?? taxRate;

                    const unitPriceExcl =
                      item.customUnitPrice !== null
                        ? item.customUnitPrice
                        : item.device.pricing?.cost_estimate !== null && item.device.pricing?.cost_estimate !== undefined
                        ? item.device.pricing.cost_estimate
                        : gpl !== null
                        ? Math.round(gpl * effectiveDiscount)
                        : 0;

                    const unitPriceIncl = round2(unitPriceExcl * (1 + rowTax));
                    const lineTotalIncl = round2(unitPriceIncl * item.quantity);

                    const ps = item.device.specs?.power_supply;
                    const needsPowerWarning =
                      ps?.type === 'modular' &&
                      ps?.default_included === 0 &&
                      (!item.selectedAccessories ||
                        !item.selectedAccessories.some(
                          (a) => a.accessoryId.includes('pwr') || a.accessoryId.includes('pac')
                        ));

                    const specDesc =
                      item.device.description ||
                      (item.device.specs?.ports?.summary
                        ? `${item.device.specs.ports.summary} | ${item.device.specs.switching_capacity_gbps || 0}G${
                            item.device.specs.poe?.supported
                              ? ` | PoE ${item.device.specs.poe.budget_watts || 0}W`
                              : ''
                          }`
                        : '标准网络设备');

                    return (
                      <React.Fragment key={item.uid}>
                        <tr className="divide-x divide-white/5 hover:bg-white/[0.03] bg-black/20">
                          <td className="py-2 px-1 text-center font-mono font-bold text-zinc-300">
                            {idx + 1}
                          </td>
                          <td className="py-1 px-1.5">
                            <select
                              value={item.areaGroup}
                              onChange={(e) => updateAreaGroup(item.uid, e.target.value)}
                              className="w-full bg-transparent text-zinc-200 focus:outline-none text-xs"
                            >
                              <option value="核心汇聚层" className="bg-zinc-900">核心汇聚层</option>
                              <option value="核心层" className="bg-zinc-900">核心层</option>
                              <option value="汇聚层" className="bg-zinc-900">汇聚层</option>
                              <option value="接入层" className="bg-zinc-900">接入层</option>
                              <option value="楼层接入层" className="bg-zinc-900">楼层接入层</option>
                              <option value="数据中心" className="bg-zinc-900">数据中心</option>
                              <option value="外联安全区" className="bg-zinc-900">外联安全区</option>
                            </select>
                          </td>
                          <td className="py-2 px-2 font-medium text-zinc-300">{item.device.brand || '通用'}</td>
                          <td className="py-2 px-2.5 font-bold text-zinc-100">
                            <div>{item.device.model}</div>
                            {needsPowerWarning && (
                              <div className="text-[10px] text-zinc-400 font-normal flex items-center gap-1 mt-0.5">
                                <ShieldAlert className="w-3 h-3 text-amber-400" /> 裸机不含电源
                              </div>
                            )}
                          </td>
                          <td className="py-2 px-2 font-mono text-zinc-400 text-xs">
                            {item.device.part_number || '-'}
                          </td>
                          <td
                            className="py-2 px-2.5 text-zinc-300 text-xs max-w-xs truncate"
                            title={specDesc}
                          >
                            {specDesc}
                          </td>
                          <td className="py-1 px-1 text-center">
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(item.uid, parseInt(e.target.value) || 1)
                              }
                              className="w-12 h-6 glass-input rounded text-center font-mono font-bold text-zinc-100"
                            />
                          </td>
                          <td className="py-2 px-1 text-center text-zinc-400">台</td>
                          <td className="py-1 px-1 text-center">
                            <select
                              value={rowTax}
                              onChange={(e) =>
                                updateItemTaxRate(item.uid, parseFloat(e.target.value))
                              }
                              className="bg-transparent border border-white/10 rounded px-1 py-0.5 text-[11px] text-zinc-300"
                            >
                              <option value="0.13" className="bg-zinc-900">13%</option>
                              <option value="0.09" className="bg-zinc-900">9%</option>
                              <option value="0.06" className="bg-zinc-900">6%</option>
                              <option value="0.03" className="bg-zinc-900">3%</option>
                              <option value="0" className="bg-zinc-900">0%</option>
                            </select>
                          </td>
                          {/* 未税单价 (双向自动联动) */}
                          <td className="py-1 px-1.5 text-right">
                            <input
                              type="number"
                              value={unitPriceExcl || ''}
                              onChange={(e) => {
                                const val = e.target.value ? parseFloat(e.target.value) : null;
                                updateCustomPrice(item.uid, val);
                              }}
                              placeholder="待填"
                              className="w-20 h-6 glass-input rounded px-1 text-right font-mono text-zinc-300 text-xs"
                            />
                          </td>
                          {/* 含税单价 (双向自动联动) */}
                          <td className="py-1 px-1.5 text-right">
                            <input
                              type="number"
                              value={unitPriceIncl || ''}
                              onChange={(e) => {
                                const val = e.target.value ? parseFloat(e.target.value) : 0;
                                updateCustomPrice(item.uid, round2(val / (1 + rowTax)));
                              }}
                              placeholder="待填"
                              className="w-20 h-6 glass-input rounded px-1 text-right font-mono text-zinc-100 font-semibold text-xs"
                            />
                          </td>
                          <td className="py-2 px-2 text-right font-mono font-bold text-zinc-100">
                            ¥{lineTotalIncl.toLocaleString()}
                          </td>
                          <td className="py-1 px-1.5">
                            <input
                              type="text"
                              value={item.notes || ''}
                              onChange={(e) => updateItemNotes(item.uid, e.target.value)}
                              placeholder="备注..."
                              className="w-full bg-transparent border-b border-transparent focus:border-white/20 text-zinc-300 text-xs focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-1 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveAccessoryUID(
                                    activeAccessoryUID === item.uid ? null : item.uid
                                  )
                                }
                                title="选配光模块/电源"
                                className={`h-6 px-1.5 rounded text-[11px] inline-flex items-center gap-1 border transition-colors ${
                                  activeAccessoryUID === item.uid
                                    ? 'bg-white/[0.12] text-white border-white/25'
                                    : 'bg-white/[0.05] text-zinc-300 border-white/10 hover:bg-white/[0.10]'
                                }`}
                              >
                                <PackagePlus className="w-3 h-3 text-zinc-400" />
                                <span>配件</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => removeItem(item.uid)}
                                className="h-6 w-6 rounded bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 inline-flex items-center justify-center text-zinc-400 hover:text-zinc-100"
                                title="删除"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Inline Accessory Picker Row */}
                        {activeAccessoryUID === item.uid && (
                          <tr className="bg-white/[0.03]">
                            <td colSpan={14} className="p-2.5">
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="text-zinc-300 font-medium">添加配套模块/电源：</span>
                                {SEED_ACCESSORIES.map((acc) => (
                                  <button
                                    key={acc.id}
                                    type="button"
                                    onClick={() => addAccessoryToItem(item.uid, acc, 2)}
                                    className="h-6 px-2 rounded bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-zinc-200 inline-flex items-center gap-1.5 transition-colors text-xs"
                                  >
                                    <span>+ {acc.name}</span>
                                    <span className="font-mono text-zinc-400">
                                      ¥{acc.reference_price}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}

                        {/* Sub-rows for Selected Accessories */}
                        {(item.selectedAccessories || []).map((acc, accIdx) => {
                          const totalAccQty = acc.quantity * item.quantity;
                          const accExcl = acc.unitPrice;
                          const accIncl = round2(accExcl * (1 + rowTax));
                          const totalAccPrice = round2(accIncl * totalAccQty);
                          return (
                            <tr
                              key={acc.accessoryId}
                              className="divide-x divide-white/5 bg-black/30 text-zinc-400 text-xs"
                            >
                              <td className="py-1 px-1 text-center font-mono text-zinc-500">
                                {idx + 1}.{accIdx + 1}
                              </td>
                              <td className="py-1 px-1.5 text-zinc-500">↳ 配套辅件</td>
                              <td className="py-1 px-1.5">通用/原厂</td>
                              <td className="py-1 px-2.5 text-zinc-300 pl-4">{acc.accessoryName}</td>
                              <td className="py-1 px-2 font-mono">{acc.partNumber}</td>
                              <td className="py-1 px-2 text-zinc-500">
                                每台配 {acc.quantity} 个 (共 {item.quantity} 台)
                              </td>
                              <td className="py-1 px-1 text-center">
                                <input
                                  type="number"
                                  min={1}
                                  value={acc.quantity}
                                  onChange={(e) =>
                                    updateAccessoryQuantity(
                                      item.uid,
                                      acc.accessoryId,
                                      parseInt(e.target.value) || 1
                                    )
                                  }
                                  className="w-10 h-5 glass-input rounded text-center font-mono text-zinc-200 text-xs"
                                />
                              </td>
                              <td className="py-1 px-1 text-center">只</td>
                              <td className="py-1 px-1 text-center font-mono text-zinc-500">
                                {(rowTax * 100).toFixed(0)}%
                              </td>
                              <td className="py-1 px-1.5 text-right font-mono text-zinc-400">
                                <input
                                  type="number"
                                  value={accExcl}
                                  onChange={(e) =>
                                    updateAccessoryPrice(
                                      item.uid,
                                      acc.accessoryId,
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="w-18 h-5 glass-input rounded px-1 text-right font-mono text-zinc-300 text-xs"
                                />
                              </td>
                              <td className="py-1 px-1.5 text-right font-mono text-zinc-300">
                                ¥{accIncl.toFixed(2)}
                              </td>
                              <td className="py-1 px-2 text-right font-mono text-zinc-300 font-semibold">
                                ¥{totalAccPrice.toLocaleString()}
                              </td>
                              <td className="py-1 px-1.5 text-zinc-500">总计 {totalAccQty} 只</td>
                              <td className="py-1 px-1 text-center">
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeAccessoryFromItem(item.uid, acc.accessoryId)
                                  }
                                  className="text-zinc-500 hover:text-zinc-200"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* ================================================================= */}
          {/* SECTION 2: 二、弱电材料、布线人工、作业费与项目管理费 */}
          {/* ================================================================= */}
          <div className="p-3 bg-zinc-900/30">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-200">
                  二、弱电材料、布线人工、作业费与项目管理费
                </span>
                <span className="px-1.5 py-0.2 rounded bg-white/10 text-zinc-400 text-[11px] font-mono">
                  {(serviceItems || []).length} 项
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsServicePickerOpen(!isServicePickerOpen)}
                  className={`${BTN_UNIFIED} ${
                    isServicePickerOpen ? 'bg-white/[0.15] text-white border-white/30' : ''
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-zinc-400" />
                  <span>选配弱电库</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlankServiceRow('弱电材料')}
                  className={BTN_UNIFIED}
                >
                  <Plus className="w-3.5 h-3.5 text-zinc-400" />
                  <span>弱电材料</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlankServiceRow('布线人工')}
                  className={BTN_UNIFIED}
                >
                  <Plus className="w-3.5 h-3.5 text-zinc-400" />
                  <span>布线人工</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlankServiceRow('作业费')}
                  className={BTN_UNIFIED}
                >
                  <Plus className="w-3.5 h-3.5 text-zinc-400" />
                  <span>作业费</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlankServiceRow('项目管理费')}
                  className={BTN_UNIFIED}
                >
                  <Plus className="w-3.5 h-3.5 text-zinc-400" />
                  <span>管理费</span>
                </button>
              </div>
            </div>

            {/* Quick Picker from Service Catalog */}
            {isServicePickerOpen && (
              <div className="mb-3 p-2.5 rounded-lg border border-white/10 bg-zinc-950/80">
                <div className="text-xs text-zinc-400 mb-2 font-medium">点击快速加入弱电服务项：</div>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                  {availableServices.map((srv) => (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => addServiceItem(srv, 1)}
                      className="h-6 px-2 rounded bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-zinc-200 text-xs inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span className="text-zinc-500 font-mono">[{srv.category}]</span>
                      <span>{srv.name}</span>
                      <span className="font-mono text-zinc-400">¥{srv.unitPriceInclTax}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(serviceItems || []).length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500 border border-dashed border-white/10 rounded-lg">
                暂无弱电材料或工程服务费用。点击上方按键添加弱电管线、布线人工或项目管理费。
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs border border-white/10 rounded-lg overflow-hidden">
                <thead className="bg-zinc-900/90 text-zinc-300 font-semibold border-b border-white/15 whitespace-nowrap">
                  <tr className="divide-x divide-white/10">
                    <th className="py-2 px-2 text-center w-10">序号</th>
                    <th className="py-2 px-2 w-24">费用类别</th>
                    <th className="py-2 px-2 w-20">品牌/来源</th>
                    <th className="py-2 px-2.5 min-w-[140px]">项目名称</th>
                    <th className="py-2 px-2 w-24">订货编码</th>
                    <th className="py-2 px-2.5 min-w-[180px]">规格型号 / 计费标准</th>
                    <th className="py-2 px-1 text-center w-16">数量/比例</th>
                    <th className="py-2 px-1 text-center w-10">单位</th>
                    <th className="py-2 px-1.5 text-center w-16">税率</th>
                    <th className="py-2 px-2 text-right w-24">未税单价</th>
                    <th className="py-2 px-2 text-right w-24">含税单价</th>
                    <th className="py-2 px-2 text-right w-24">含税合价</th>
                    <th className="py-2 px-2 min-w-[100px]">备注</th>
                    <th className="py-2 px-1.5 text-center w-14">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {serviceItems.map((sItem, sIdx) => {
                    const isPercent = sItem.pricingMode === 'percent';
                    const unitExcl = isPercent
                      ? round2(baseForPercent * ((sItem.percentageRate || 0) / 100))
                      : sItem.unitPriceExclTax;
                    const unitIncl = isPercent
                      ? round2(unitExcl * (1 + sItem.taxRate))
                      : sItem.unitPriceInclTax;
                    const effQty = isPercent ? 1 : sItem.quantity;
                    const rowInclTotal = round2(unitIncl * effQty);

                    return (
                      <tr
                        key={sItem.uid}
                        className="divide-x divide-white/5 hover:bg-white/[0.03] bg-black/20"
                      >
                        <td className="py-2 px-1 text-center font-mono font-bold text-zinc-300">
                          {sIdx + 1}
                        </td>
                        <td className="py-1 px-1.5">
                          <select
                            value={sItem.item.category}
                            onChange={(e) =>
                              updateServiceItem(sItem.uid, {
                                item: { ...sItem.item, category: e.target.value },
                              })
                            }
                            className="w-full bg-transparent text-zinc-200 focus:outline-none text-xs"
                          >
                            <option value="弱电材料" className="bg-zinc-900">弱电材料</option>
                            <option value="布线人工" className="bg-zinc-900">布线人工</option>
                            <option value="作业费" className="bg-zinc-900">作业费</option>
                            <option value="项目管理费" className="bg-zinc-900">项目管理费</option>
                          </select>
                        </td>
                        <td className="py-1 px-1.5">
                          <input
                            type="text"
                            value={sItem.item.brand || ''}
                            onChange={(e) =>
                              updateServiceItem(sItem.uid, {
                                item: { ...sItem.item, brand: e.target.value },
                              })
                            }
                            placeholder="品牌..."
                            className="w-full bg-transparent text-zinc-300 focus:outline-none"
                          />
                        </td>
                        <td className="py-1 px-2 font-medium text-zinc-100">
                          <input
                            type="text"
                            value={sItem.item.name}
                            onChange={(e) =>
                              updateServiceItem(sItem.uid, {
                                item: { ...sItem.item, name: e.target.value },
                              })
                            }
                            className="w-full bg-transparent text-zinc-100 font-semibold focus:outline-none"
                          />
                        </td>
                        <td className="py-1 px-2 font-mono text-zinc-400">
                          <input
                            type="text"
                            value={sItem.item.part_number}
                            onChange={(e) =>
                              updateServiceItem(sItem.uid, {
                                item: { ...sItem.item, part_number: e.target.value },
                              })
                            }
                            className="w-full bg-transparent font-mono text-zinc-400 focus:outline-none"
                          />
                        </td>
                        <td className="py-1 px-2 text-zinc-300">
                          <input
                            type="text"
                            value={sItem.item.specs || sItem.item.model}
                            onChange={(e) =>
                              updateServiceItem(sItem.uid, {
                                item: { ...sItem.item, specs: e.target.value },
                              })
                            }
                            placeholder="技术规格 / 计费基准..."
                            className="w-full bg-transparent text-zinc-300 focus:outline-none"
                          />
                        </td>
                        <td className="py-1 px-1 text-center">
                          {isPercent ? (
                            <div className="flex items-center justify-center gap-0.5">
                              <input
                                type="number"
                                min={0}
                                step={0.5}
                                value={sItem.percentageRate}
                                onChange={(e) =>
                                  updateServiceItem(sItem.uid, {
                                    percentageRate: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-10 h-6 glass-input rounded text-center font-mono text-xs text-zinc-100"
                              />
                              <span className="text-zinc-500">%</span>
                            </div>
                          ) : (
                            <input
                              type="number"
                              min={1}
                              value={sItem.quantity}
                              onChange={(e) =>
                                updateServiceItem(sItem.uid, {
                                  quantity: parseInt(e.target.value) || 1,
                                })
                              }
                              className="w-12 h-6 glass-input rounded text-center font-mono font-bold text-zinc-100"
                            />
                          )}
                        </td>
                        <td className="py-1 px-1 text-center">
                          <input
                            type="text"
                            value={sItem.item.unit}
                            onChange={(e) =>
                              updateServiceItem(sItem.uid, {
                                item: { ...sItem.item, unit: e.target.value },
                              })
                            }
                            className="w-8 text-center bg-transparent text-zinc-400 focus:outline-none"
                          />
                        </td>
                        <td className="py-1 px-1 text-center">
                          <select
                            value={sItem.taxRate}
                            onChange={(e) =>
                              updateServiceTaxRate(sItem.uid, parseFloat(e.target.value))
                            }
                            className="bg-transparent border border-white/10 rounded px-1 py-0.5 text-[11px] text-zinc-300"
                          >
                            <option value="0.13" className="bg-zinc-900">13%</option>
                            <option value="0.09" className="bg-zinc-900">9%</option>
                            <option value="0.06" className="bg-zinc-900">6%</option>
                            <option value="0.03" className="bg-zinc-900">3%</option>
                            <option value="0" className="bg-zinc-900">0%</option>
                          </select>
                        </td>
                        {/* 未税单价 (双向自动联动) */}
                        <td className="py-1 px-1.5 text-right">
                          <input
                            type="number"
                            value={unitExcl || ''}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              updateServicePrice(sItem.uid, val, false);
                            }}
                            placeholder="未税"
                            className="w-20 h-6 glass-input rounded px-1 text-right font-mono text-zinc-300 text-xs"
                          />
                        </td>
                        {/* 含税单价 (双向自动联动) */}
                        <td className="py-1 px-1.5 text-right">
                          <input
                            type="number"
                            value={unitIncl || ''}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              updateServicePrice(sItem.uid, val, true);
                            }}
                            placeholder="含税"
                            className="w-20 h-6 glass-input rounded px-1 text-right font-mono text-zinc-100 font-semibold text-xs"
                          />
                        </td>
                        <td className="py-2 px-2 text-right font-mono font-bold text-zinc-100">
                          ¥{rowInclTotal.toLocaleString()}
                        </td>
                        <td className="py-1 px-1.5">
                          <input
                            type="text"
                            value={sItem.notes || ''}
                            onChange={(e) =>
                              updateServiceItem(sItem.uid, { notes: e.target.value })
                            }
                            placeholder="备注..."
                            className="w-full bg-transparent border-b border-transparent focus:border-white/20 text-zinc-300 text-xs focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-1 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => removeServiceItem(sItem.uid)}
                            className="h-6 w-6 rounded bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 inline-flex items-center justify-center text-zinc-400 hover:text-zinc-100"
                            title="删除"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quotation Sheet Summary Footer */}
        <div className="p-4 bg-zinc-950/95 border-t border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs">
            {items.length > 0 && (
              <div>
                <span className="text-zinc-500">设备小计(含税):</span>{' '}
                <span className="font-mono font-semibold text-zinc-300">
                  ¥{equipInclSubtotal.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
                </span>
              </div>
            )}
            {(serviceItems || []).length > 0 && (
              <div>
                <span className="text-zinc-500">弱电服务(含税):</span>{' '}
                <span className="font-mono font-semibold text-zinc-300">
                  ¥{serviceInclSubtotal.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
                </span>
              </div>
            )}
            <div>
              <span className="text-zinc-500">未税总额:</span>{' '}
              <span className="font-mono font-semibold text-zinc-200">
                ¥{totalExclAmount.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div>
              <span className="text-zinc-500">总税额:</span>{' '}
              <span className="font-mono text-zinc-400">
                ¥{totalTaxAmount.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-zinc-300 font-bold">含税总计:</span>
              <span className="font-mono font-bold text-white text-base">
                ¥{grandTotal.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
              </span>
              <span className="text-xs text-zinc-500">
                ({toChineseCurrency(Math.round(grandTotal))})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Review Status Pill in Footer */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-white/[0.04] border border-white/10 text-xs text-zinc-400">
              {techReviewed && commercialReviewed ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>双重复核已签发 ({techReviewer} / {commercialReviewer})</span>
                </span>
              ) : techReviewed ? (
                <span className="inline-flex items-center gap-1.5 text-zinc-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>技术已核 ({techReviewer}) · 待商务终审</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-amber-400/90">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>草案未审核 (导出带草案标识)</span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleShare}
              disabled={items.length === 0 && (!serviceItems || serviceItems.length === 0)}
              className={BTN_UNIFIED}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>已复制</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>分享</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleExport}
              disabled={
                isExporting ||
                (items.length === 0 && (!serviceItems || serviceItems.length === 0))
              }
              className={BTN_UNIFIED}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-400" />
              <span>{isExporting ? '导出中...' : '导出 Excel'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Health Check Modal */}
      {isHealthModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => setIsHealthModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-lg glass-panel-elevated border border-white/15 rounded-2xl p-5 z-10 shadow-2xl bg-zinc-950/95 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-zinc-300" />
                <h3 className="text-sm font-bold text-zinc-100">报价单智能体检报告</h3>
              </div>
              <button
                onClick={() => setIsHealthModalOpen(false)}
                className="h-7 w-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto space-y-2.5 pr-1">
              {auditIssues.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">全面体检合规</div>
                    <div className="text-zinc-400 mt-0.5">未发现电源缺配、光口模块漏配或零报价项，技术架构与报价规则检查正常。</div>
                  </div>
                </div>
              ) : (
                auditIssues.map((issue, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                      issue.type === 'severe'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                        : issue.type === 'warn'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                        : 'bg-white/[0.04] border-white/10 text-zinc-300'
                    }`}
                  >
                    {issue.type === 'severe' ? (
                      <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    ) : issue.type === 'warn' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-zinc-100">{issue.title}</div>
                      <div className="text-zinc-400 mt-0.5 leading-relaxed">{issue.desc}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-zinc-500">
                共检出 {auditIssues.length} 条体检指标
              </span>
              <button
                type="button"
                onClick={() => setIsHealthModalOpen(false)}
                className={BTN_UNIFIED}
              >
                <span>完成体检</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
