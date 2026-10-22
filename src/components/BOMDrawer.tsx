import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Share2,
  Trash2,
  Plus,
  Minus,
  AlertCircle,
  Sliders,
  DollarSign,
  Building,
  Check,
  PackagePlus,
  ShieldAlert,
} from 'lucide-react';
import { useBOMStore } from '../store/useBOMStore';
import { exportBOMToExcel } from '../utils/excel-export';
import { SEED_ACCESSORIES } from '../data/seedDevices';

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
    targetMarginRate,
    setTargetMarginRate,
    taxRate,
    setTaxRate,
    updateQuantity,
    updateCustomPrice,
    updateItemDiscount,
    updateAreaGroup,
    removeItem,
    clearBOM,
    addAccessoryToItem,
    removeAccessoryFromItem,
    generateShareUrl,
  } = useBOMStore();

  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeAccessoryUID, setActiveAccessoryUID] = useState<string | null>(null);

  if (!isDrawerOpen) return null;

  // Group items by area
  const groupedItems = items.reduce<Record<string, typeof items>>((acc, item) => {
    const group = item.areaGroup || '未分组';
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

  // Pricing math
  let totalGPL = 0;
  let totalQuotedPrice = 0;
  let pendingCount = 0;

  items.forEach((item) => {
    const gpl = item.device.pricing.list_price_gpl;
    if (gpl !== null) {
      totalGPL += gpl * item.quantity;
    } else {
      pendingCount++;
    }

    let unitPrice = 0;
    if (item.customUnitPrice !== null) {
      unitPrice = item.customUnitPrice;
    } else if (gpl !== null) {
      const discount = item.itemDiscountRate ?? globalDiscountRate;
      unitPrice = gpl * discount;
    }

    // Add accessories
    const accTotal = (item.selectedAccessories || []).reduce(
      (sum, acc) => sum + acc.unitPrice * acc.quantity,
      0
    );

    totalQuotedPrice += (unitPrice + accTotal) * item.quantity;
  });

  const taxAmount = totalQuotedPrice * taxRate;
  const grandTotalWithTax = totalQuotedPrice + taxAmount;

  // Handle Share URL
  const handleShare = () => {
    const url = generateShareUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Handle Excel Export
  const handleExport = async () => {
    if (items.length === 0) {
      alert('BOM 清单为空，请先在左侧添加设备！');
      return;
    }
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
    } catch (err) {
      console.error(err);
      alert('导出 Excel 失败，请检查浏览器权限');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        onClick={() => setDrawerOpen(false)}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-3xl glass-panel-elevated h-full flex flex-col z-10 shadow-2xl border-l border-white/10 animate-in slide-in-from-right duration-300">
        {/* Top Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                工程物料清单 (BOM 工作台)
                <span className="text-xs font-mono font-normal text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                  {items.length} 项设备
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                实时自动核算合价、税率、折扣与配套配件
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('确认清空当前方案中的所有设备吗？')) {
                    clearBOM();
                  }
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="清空清单"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Project & Client Settings Bar */}
        <div className="p-4 bg-black/30 border-b border-white/5 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1 mb-1">
              <Building className="w-3 h-3 text-sky-400" /> 工程项目名称
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full glass-input rounded-xl px-3 py-1.5 text-xs font-medium"
              placeholder="请输入项目名称..."
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1 mb-1">
              <Building className="w-3 h-3 text-emerald-400" /> 客户 / 招投标单位
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full glass-input rounded-xl px-3 py-1.5 text-xs font-medium"
              placeholder="请输入客户或单位名称..."
            />
          </div>
        </div>

        {/* Financial Simulator Strip (Discount & Tax) */}
        <div className="p-4 bg-sky-950/20 border-b border-sky-500/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-semibold text-sky-300">
              <Sliders className="w-3.5 h-3.5" /> 全局执行折扣:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.01"
                value={globalDiscountRate}
                onChange={(e) => setGlobalDiscountRate(parseFloat(e.target.value))}
                className="w-24 accent-sky-400 cursor-pointer"
              />
              <span className="font-mono font-bold text-white bg-sky-500/20 px-2 py-0.5 rounded border border-sky-500/30">
                {(globalDiscountRate * 10).toFixed(1)} 折 (
                {(globalDiscountRate * 100).toFixed(0)}%)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400">增值税专用发票:</span>
            <select
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value))}
              className="glass-input rounded-lg px-2 py-1 text-xs text-slate-200"
            >
              <option value="0.13">13% 专票</option>
              <option value="0.06">6% 普票/服务</option>
              <option value="0">0% 免税</option>
            </select>
          </div>
        </div>

        {/* Items List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {items.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="text-sm font-medium text-slate-400">
                当前 BOM 清单为空
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                从左侧设备矩阵中挑选需要的交换机、路由器或防火墙，点击「加到 BOM」即可开始编制。
              </p>
            </div>
          ) : (
            Object.entries(groupedItems).map(([group, groupItems]) => (
              <div key={group} className="space-y-3">
                {/* Area Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      {group}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">
                      ({groupItems.length} 项)
                    </span>
                  </div>
                </div>

                {/* Items in this group */}
                <div className="space-y-3">
                  {groupItems.map((item) => {
                    const gpl = item.device.pricing.list_price_gpl;
                    const effectiveDiscount =
                      item.itemDiscountRate ?? globalDiscountRate;
                    const calculatedUnitPrice =
                      item.customUnitPrice !== null
                        ? item.customUnitPrice
                        : gpl !== null
                        ? gpl * effectiveDiscount
                        : 0;

                    // Accessory subtotal for this item
                    const accTotal = (item.selectedAccessories || []).reduce(
                      (sum, acc) => sum + acc.unitPrice * acc.quantity,
                      0
                    );
                    const itemTotal = (calculatedUnitPrice + accTotal) * item.quantity;

                    // Power supply warning check
                    const isModularPower =
                      item.device.specs.power_supply.type === 'modular';
                    const defaultIncludedPower =
                      item.device.specs.power_supply.default_included;
                    const needsPowerWarning =
                      isModularPower && defaultIncludedPower === 0;

                    return (
                      <div
                        key={item.uid}
                        className="glass-panel rounded-2xl p-4 space-y-3 transition-all hover:border-white/20"
                      >
                        {/* Device Info Row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white truncate">
                                {item.device.model}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
                                {item.device.brand}
                              </span>
                              <span className="text-[10px] font-mono text-sky-400">
                                P/N: {item.device.part_number}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {item.device.specs.ports.summary}
                            </p>
                          </div>

                          {/* Delete Item */}
                          <button
                            onClick={() => removeItem(item.uid)}
                            className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Power Supply Safety Warning */}
                        {needsPowerWarning && (
                          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                              该机型出厂为裸机（不含电源），请务必配齐电源模块！
                            </span>
                            <button
                              onClick={() => {
                                const acc = SEED_ACCESSORIES.find(
                                  (a) => a.category === 'power_module'
                                );
                                if (acc) addAccessoryToItem(item.uid, acc, 2);
                              }}
                              className="px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 font-medium text-[10px] whitespace-nowrap ml-2"
                            >
                              一键配双电源
                            </button>
                          </div>
                        )}

                        {/* Quantity & Pricing Editing Row */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5 text-xs">
                          {/* Quantity Counter */}
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-500">数量:</span>
                            <div className="flex items-center glass-input rounded-lg overflow-hidden">
                              <button
                                onClick={() =>
                                  updateQuantity(item.uid, item.quantity - 1)
                                }
                                className="px-2 py-1 hover:bg-white/10 text-slate-400 hover:text-white"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-3 font-mono font-bold text-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.uid, item.quantity + 1)
                                }
                                className="px-2 py-1 hover:bg-white/10 text-slate-400 hover:text-white"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Unit Price Custom Override */}
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-500">
                              销售单价:
                            </span>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                                ¥
                              </span>
                              <input
                                type="number"
                                value={calculatedUnitPrice || ''}
                                onChange={(e) => {
                                  const val = e.target.value
                                    ? parseFloat(e.target.value)
                                    : null;
                                  updateCustomPrice(item.uid, val);
                                }}
                                className="w-28 glass-input rounded-lg pl-6 pr-2 py-1 font-mono text-xs text-white"
                                placeholder={
                                  gpl ? (gpl * effectiveDiscount).toFixed(0) : '自定义'
                                }
                              />
                            </div>
                          </div>

                          {/* Item Subtotal */}
                          <div className="text-right">
                            <div className="text-[10px] text-slate-500">合价金额</div>
                            <div className="font-mono font-bold text-sky-400 text-sm">
                              ¥{itemTotal.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
                            </div>
                          </div>
                        </div>

                        {/* Selected Accessories Section */}
                        {item.selectedAccessories &&
                          item.selectedAccessories.length > 0 && (
                            <div className="bg-black/20 rounded-xl p-2.5 space-y-1.5 border border-white/5">
                              <div className="text-[10px] uppercase font-mono text-slate-500 flex items-center justify-between">
                                <span>已选配辅件 (Accessories)</span>
                                <span>分项合计: ¥{accTotal * item.quantity}</span>
                              </div>
                              <div className="space-y-1">
                                {item.selectedAccessories.map((acc) => (
                                  <div
                                    key={acc.accessoryId}
                                    className="flex items-center justify-between text-[11px] text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg"
                                  >
                                    <span className="truncate pr-2">
                                      {acc.accessoryName} (x{acc.quantity})
                                    </span>
                                    <div className="flex items-center gap-2 font-mono flex-shrink-0">
                                      <span>
                                        ¥{(acc.unitPrice * acc.quantity).toLocaleString()}
                                      </span>
                                      <button
                                        onClick={() =>
                                          removeAccessoryFromItem(
                                            item.uid,
                                            acc.accessoryId
                                          )
                                        }
                                        className="text-slate-500 hover:text-rose-400"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Add Companion Accessory Trigger */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() =>
                              setActiveAccessoryUID(
                                activeAccessoryUID === item.uid ? null : item.uid
                              )
                            }
                            className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-medium"
                          >
                            <PackagePlus className="w-3.5 h-3.5" />
                            <span>
                              {activeAccessoryUID === item.uid
                                ? '收起辅件选单'
                                : '+ 搭配光模块 / 电源 / 堆叠线'}
                            </span>
                          </button>
                        </div>

                        {/* Accessory Quick Picker Dropdown */}
                        {activeAccessoryUID === item.uid && (
                          <div className="p-3 rounded-xl bg-slate-900/90 border border-sky-500/20 space-y-2 mt-2">
                            <div className="text-[10px] text-slate-400 font-semibold">
                              快捷加购推荐网络配件：
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {SEED_ACCESSORIES.map((acc) => (
                                <button
                                  key={acc.id}
                                  onClick={() => {
                                    addAccessoryToItem(item.uid, acc, 2);
                                  }}
                                  className="text-left p-2 rounded-lg bg-white/5 hover:bg-sky-500/10 border border-white/5 hover:border-sky-500/30 text-xs transition-all"
                                >
                                  <div className="font-medium text-slate-200 truncate">
                                    {acc.name}
                                  </div>
                                  <div className="text-[10px] text-sky-400 font-mono mt-0.5 flex justify-between">
                                    <span>P/N: {acc.part_number}</span>
                                    <span>+¥{acc.reference_price}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Financial Summary & Export Bar */}
        {items.length > 0 && (
          <div className="p-5 bg-black/60 border-t border-white/10 space-y-4">
            {/* TBD Warning */}
            {pendingCount > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>
                  当前清单中包含 <strong>{pendingCount}</strong> 款未录入指导价的设备，总价已暂时剔除未定价项。
                </span>
              </div>
            )}

            {/* Figures Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-white/5">
                <div className="text-[10px] text-slate-500">目录指导总价(GPL)</div>
                <div className="font-mono font-bold text-slate-300 text-sm mt-0.5">
                  ¥{totalGPL.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5">
                <div className="text-[10px] text-slate-500">方案未税总价</div>
                <div className="font-mono font-bold text-sky-400 text-sm mt-0.5">
                  ¥{totalQuotedPrice.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5">
                <div className="text-[10px] text-slate-500">
                  增值税额 ({(taxRate * 100).toFixed(0)}%)
                </div>
                <div className="font-mono font-bold text-slate-400 text-sm mt-0.5">
                  ¥{taxAmount.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20">
                <div className="text-[10px] text-sky-400 font-semibold">
                  最终含税总报价
                </div>
                <div className="font-mono font-bold text-amber-400 text-base mt-0.5">
                  ¥{grandTotalWithTax.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl glass-panel text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">分享链接已复制</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>生成分享链接</span>
                  </>
                )}
              </button>

              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold tracking-wide transition-all shadow-lg shadow-sky-500/25 active:scale-98 disabled:opacity-50"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>
                  {isExporting ? '正在生成 Excel...' : '导出工业级工程报价单 (.xlsx)'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
