import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Share2,
  Trash2,
  Check,
  PackagePlus,
  ShieldAlert,
} from 'lucide-react';
import { useBOMStore } from '../store/useBOMStore';
import { exportBOMToExcel } from '../utils/excel-export';
import { SEED_ACCESSORIES } from '../data/seedDevices';

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
    isDrawerOpen,
    setDrawerOpen,
    projectName,
    setProjectName,
    clientName,
    setClientName,
    creatorName,
    globalDiscountRate,
    setGlobalDiscountRate,
    taxRate,
    setTaxRate,
    updateQuantity,
    updateCustomPrice,
    updateAreaGroup,
    updateItemNotes,
    removeItem,
    clearBOM,
    addAccessoryToItem,
    updateAccessoryQuantity,
    updateAccessoryPrice,
    removeAccessoryFromItem,
    generateShareUrl,
  } = useBOMStore();

  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeAccessoryUID, setActiveAccessoryUID] = useState<string | null>(null);

  if (!isDrawerOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  // Financial Calculations
  let totalGPL = 0;
  let totalNetPrice = 0;

  items.forEach((item) => {
    const gpl = item.device.pricing.list_price_gpl;
    if (gpl !== null) {
      totalGPL += gpl * item.quantity;
    }
    const effectiveDiscount = item.itemDiscountRate ?? globalDiscountRate;
    const hostUnitPrice =
      item.customUnitPrice !== null
        ? item.customUnitPrice
        : item.device.pricing.cost_estimate !== null
        ? item.device.pricing.cost_estimate
        : gpl !== null
        ? Math.round(gpl * effectiveDiscount)
        : 0;

    const accPerHost = (item.selectedAccessories || []).reduce(
      (sum, acc) => sum + acc.unitPrice * acc.quantity,
      0
    );

    totalNetPrice += (hostUnitPrice + accPerHost) * item.quantity;
  });

  const taxAmount = totalNetPrice * taxRate;
  const grandTotal = totalNetPrice + taxAmount;

  const handleShare = () => {
    const url = generateShareUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async () => {
    if (items.length === 0) return;
    setIsExporting(true);
    try {
      await exportBOMToExcel({
        projectName,
        clientName,
        creatorName,
        globalDiscountRate,
        taxRate,
        items,
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
      <div className="relative w-full max-w-6xl max-h-[92vh] glass-panel-elevated border border-white/15 rounded-2xl flex flex-col z-10 shadow-2xl overflow-hidden">
        {/* Top Quotation Title Bar */}
        <div className="px-5 py-3.5 bg-slate-900/60 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-5 h-5 text-sky-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              工程设备配置与报价清单 (BOM Quotation Sheet)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('确定清空整张报价单吗？')) clearBOM();
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>清空</span>
              </button>
            )}
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quotation Meta Header (Spreadsheet-style info cells) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-b border-white/10 bg-slate-950/60 text-xs divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          <div className="p-2.5 flex items-center gap-2">
            <span className="text-slate-500 whitespace-nowrap font-medium">项目名称:</span>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-transparent text-white font-semibold focus:outline-none border-b border-transparent focus:border-sky-400"
            />
          </div>
          <div className="p-2.5 flex items-center gap-2">
            <span className="text-slate-500 whitespace-nowrap font-medium">客户单位:</span>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full bg-transparent text-white font-medium focus:outline-none border-b border-transparent focus:border-sky-400"
            />
          </div>
          <div className="p-2.5 flex items-center gap-2">
            <span className="text-slate-500 whitespace-nowrap font-medium">基准折扣:</span>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.01"
              value={globalDiscountRate}
              onChange={(e) => setGlobalDiscountRate(parseFloat(e.target.value))}
              className="w-20 accent-sky-400 cursor-pointer"
            />
            <span className="font-mono font-bold text-sky-400">
              {(globalDiscountRate * 10).toFixed(1)}折 ({(globalDiscountRate * 100).toFixed(0)}%)
            </span>
          </div>
          <div className="p-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 whitespace-nowrap font-medium">税率:</span>
              <select
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                className="bg-slate-900 border border-white/10 rounded px-2 py-0.5 text-xs text-white"
              >
                <option value="0.13">13% 专票</option>
                <option value="0.06">6% 普票</option>
                <option value="0">0% 未税</option>
              </select>
            </div>
            <span className="font-mono text-[11px] text-slate-500">{todayStr}</span>
          </div>
        </div>

        {/* Main Engineering Quotation Sheet Table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          {items.length === 0 ? (
            <div className="py-20 text-center text-xs text-slate-500">
              报价单暂无设备，请先在设备列表中点击「加到 BOM」
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 z-20 bg-slate-900/95 text-slate-300 border-b border-white/15 font-semibold whitespace-nowrap">
                <tr className="divide-x divide-white/10">
                  <th className="py-2.5 px-2.5 text-center w-12">序号</th>
                  <th className="py-2.5 px-2.5 w-28">网络分区</th>
                  <th className="py-2.5 px-2.5 w-20">品牌</th>
                  <th className="py-2.5 px-3 min-w-[160px]">产品型号</th>
                  <th className="py-2.5 px-2.5 w-28">订货编码 (P/N)</th>
                  <th className="py-2.5 px-3 min-w-[230px]">关键技术规格描述</th>
                  <th className="py-2.5 px-2 text-center w-16">数量</th>
                  <th className="py-2.5 px-2 text-center w-12">单位</th>
                  <th className="py-2.5 px-2.5 text-right w-24">目录面价</th>
                  <th className="py-2.5 px-2.5 text-right w-28">单价 (元)</th>
                  <th className="py-2.5 px-3 text-right w-28">合价 (元)</th>
                  <th className="py-2.5 px-2.5 min-w-[120px]">备注</th>
                  <th className="py-2.5 px-2.5 text-center w-24">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {items.map((item, idx) => {
                  const gpl = item.device.pricing.list_price_gpl;
                  const effectiveDiscount = item.itemDiscountRate ?? globalDiscountRate;
                  const unitPrice =
                    item.customUnitPrice !== null
                      ? item.customUnitPrice
                      : item.device.pricing.cost_estimate !== null
                      ? item.device.pricing.cost_estimate
                      : gpl !== null
                      ? Math.round(gpl * effectiveDiscount)
                      : 0;

                  const lineTotal = unitPrice * item.quantity;

                  const needsPowerWarning =
                    item.device.specs.power_supply.type === 'modular' &&
                    item.device.specs.power_supply.default_included === 0 &&
                    (!item.selectedAccessories ||
                      !item.selectedAccessories.some((a) => a.accessoryId.includes('pwr') || a.accessoryId.includes('pac')));

                  return (
                    <React.Fragment key={item.uid}>
                      {/* Main Host Row */}
                      <tr className="divide-x divide-white/5 hover:bg-white/[0.03] bg-black/20">
                        <td className="py-2 px-2 text-center font-mono font-bold text-slate-300">
                          {idx + 1}
                        </td>
                        <td className="py-1.5 px-2">
                          <select
                            value={item.areaGroup}
                            onChange={(e) => updateAreaGroup(item.uid, e.target.value)}
                            className="w-full bg-transparent text-slate-200 focus:outline-none text-xs"
                          >
                            <option value="核心汇聚层" className="bg-slate-900">核心汇聚层</option>
                            <option value="核心层" className="bg-slate-900">核心层</option>
                            <option value="汇聚层" className="bg-slate-900">汇聚层</option>
                            <option value="接入层" className="bg-slate-900">接入层</option>
                            <option value="数据中心" className="bg-slate-900">数据中心</option>
                            <option value="外联安全区" className="bg-slate-900">外联安全区</option>
                          </select>
                        </td>
                        <td className="py-2 px-2.5 font-medium text-slate-300">
                          {item.device.brand}
                        </td>
                        <td className="py-2 px-3 font-bold text-white">
                          <div>{item.device.model}</div>
                          {needsPowerWarning && (
                            <div className="text-[10px] text-amber-400 font-normal flex items-center gap-1 mt-0.5">
                              <ShieldAlert className="w-3 h-3" /> 裸机不含电源
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-2.5 font-mono text-slate-400 text-[11px]">
                          {item.device.part_number}
                        </td>
                        <td className="py-2 px-3 text-slate-300 text-[11px] max-w-xs truncate" title={item.device.specs.ports.summary}>
                          {item.device.specs.ports.summary} | {item.device.specs.switching_capacity_gbps}G
                          {item.device.specs.poe.supported ? ` | PoE ${item.device.specs.poe.budget_watts}W` : ''}
                        </td>
                        <td className="py-1.5 px-1.5 text-center">
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.uid, parseInt(e.target.value) || 1)
                            }
                            className="w-14 glass-input rounded px-1.5 py-1 text-center font-mono font-bold text-white"
                          />
                        </td>
                        <td className="py-2 px-2 text-center text-slate-400">台</td>
                        <td className="py-2 px-2.5 text-right font-mono text-slate-400">
                          {gpl !== null ? `¥${gpl.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-1.5 px-2 text-right">
                          <input
                            type="number"
                            value={unitPrice || ''}
                            onChange={(e) => {
                              const val = e.target.value ? parseFloat(e.target.value) : null;
                              updateCustomPrice(item.uid, val);
                            }}
                            placeholder="待填"
                            className="w-24 glass-input rounded px-2 py-1 text-right font-mono text-emerald-300 font-semibold"
                          />
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-sky-400">
                          ¥{lineTotal.toLocaleString()}
                        </td>
                        <td className="py-1.5 px-2">
                          <input
                            type="text"
                            value={item.notes || ''}
                            onChange={(e) => updateItemNotes(item.uid, e.target.value)}
                            placeholder="选填备注..."
                            className="w-full bg-transparent border-b border-transparent focus:border-white/20 text-slate-300 text-[11px] focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-2 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveAccessoryUID(
                                  activeAccessoryUID === item.uid ? null : item.uid
                                )
                              }
                              title="选配光模块/电源/线缆"
                              className={`px-1.5 py-1 rounded text-[11px] flex items-center gap-0.5 ${
                                activeAccessoryUID === item.uid
                                  ? 'bg-sky-500 text-white'
                                  : 'bg-sky-500/15 text-sky-300 hover:bg-sky-500/25'
                              }`}
                            >
                              <PackagePlus className="w-3 h-3" />
                              <span>配件</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItem(item.uid)}
                              className="p-1 text-slate-500 hover:text-rose-400"
                              title="删除行"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Inline Accessory Picker Row */}
                      {activeAccessoryUID === item.uid && (
                        <tr className="bg-sky-950/20">
                          <td colSpan={13} className="p-2.5">
                            <div className="flex flex-wrap items-center gap-2 text-[11px]">
                              <span className="text-sky-300 font-semibold">
                                为 {item.device.model} 添加配套模块/电源：
                              </span>
                              {SEED_ACCESSORIES.map((acc) => (
                                <button
                                  key={acc.id}
                                  type="button"
                                  onClick={() => addAccessoryToItem(item.uid, acc, 2)}
                                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-sky-500/20 border border-white/10 hover:border-sky-500/40 text-slate-200 flex items-center gap-1.5 transition-all"
                                >
                                  <span>+ {acc.name}</span>
                                  <span className="font-mono text-sky-400">
                                    ¥{acc.reference_price}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Sub-rows for Selected Accessories (1.1, 1.2...) */}
                      {(item.selectedAccessories || []).map((acc, accIdx) => {
                        const totalAccQty = acc.quantity * item.quantity;
                        const totalAccPrice = acc.unitPrice * totalAccQty;
                        return (
                          <tr
                            key={acc.accessoryId}
                            className="divide-x divide-white/5 bg-black/30 text-slate-400 text-[11px]"
                          >
                            <td className="py-1.5 px-2 text-center font-mono text-slate-500">
                              {idx + 1}.{accIdx + 1}
                            </td>
                            <td className="py-1.5 px-2.5 text-slate-500">↳ 配套辅件</td>
                            <td className="py-1.5 px-2.5">通用/原厂</td>
                            <td className="py-1.5 px-3 text-slate-300 pl-5">
                              {acc.accessoryName}
                            </td>
                            <td className="py-1.5 px-2.5 font-mono">{acc.partNumber}</td>
                            <td className="py-1.5 px-3 text-slate-500">
                              每台主机配 {acc.quantity} 个（共 {item.quantity} 台主机）
                            </td>
                            <td className="py-1 px-1.5 text-center">
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
                                title="单台主机配比数量"
                                className="w-12 glass-input rounded px-1 py-0.5 text-center font-mono text-slate-200"
                              />
                            </td>
                            <td className="py-1.5 px-2 text-center">只</td>
                            <td className="py-1.5 px-2.5 text-right font-mono">-</td>
                            <td className="py-1 px-2 text-right">
                              <input
                                type="number"
                                value={acc.unitPrice}
                                onChange={(e) =>
                                  updateAccessoryPrice(
                                    item.uid,
                                    acc.accessoryId,
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-20 glass-input rounded px-1.5 py-0.5 text-right font-mono text-slate-300"
                              />
                            </td>
                            <td className="py-1.5 px-3 text-right font-mono text-slate-300">
                              ¥{totalAccPrice.toLocaleString()}
                            </td>
                            <td className="py-1.5 px-2 text-slate-500">
                              总计 {totalAccQty} 只
                            </td>
                            <td className="py-1.5 px-2 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  removeAccessoryFromItem(item.uid, acc.accessoryId)
                                }
                                className="text-slate-500 hover:text-rose-400"
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

        {/* Quotation Sheet Summary Footer */}
        <div className="p-4 bg-slate-950/95 border-t border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Totals Breakdown */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs">
            <div>
              <span className="text-slate-500">目录面价合计:</span>{' '}
              <span className="font-mono text-slate-300">
                ¥{totalGPL.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div>
              <span className="text-slate-500">未税总价:</span>{' '}
              <span className="font-mono font-semibold text-sky-400">
                ¥{totalNetPrice.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div>
              <span className="text-slate-500">
                税额 ({(taxRate * 100).toFixed(0)}%):
              </span>{' '}
              <span className="font-mono text-slate-400">
                ¥{taxAmount.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-slate-300 font-bold">含税总计:</span>
              <span className="font-mono font-bold text-amber-400 text-base">
                ¥{grandTotal.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
              </span>
              <span className="text-[11px] text-slate-400">
                ({toChineseCurrency(Math.round(grandTotal))})
              </span>
            </div>
          </div>

          {/* Export & Share Actions */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleShare}
              disabled={items.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass-panel text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">已复制链接</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>分享链接</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || items.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-lg shadow-sky-500/20 disabled:opacity-40"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isExporting ? '导出中...' : '导出 Excel 报价单'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
