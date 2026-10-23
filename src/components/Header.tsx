import React from 'react';
import {
  Network,
  FileSpreadsheet,
  GitCompare,
  Search,
  Plus,
  Layers,
  Sparkles,
  Settings,
} from 'lucide-react';
import { useBOMStore } from '../store/useBOMStore';

interface HeaderProps {
  onOpenAddDevice?: () => void;
  onOpenTemplates?: () => void;
  onOpenAIImport?: () => void;
  onOpenAISettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddDevice,
  onOpenTemplates,
  onOpenAIImport,
  onOpenAISettings,
}) => {
  const {
    items,
    toggleDrawer,
    diffDeviceIds,
    searchQuery,
    setSearchQuery,
    globalDiscountRate,
  } = useBOMStore();

  const totalItemCount = items.reduce((acc, cur) => acc + cur.quantity, 0);

  const estimatedTotal = items.reduce((sum, item) => {
    let unitPrice = 0;
    if (item.customUnitPrice !== null) {
      unitPrice = item.customUnitPrice;
    } else if (item.device.pricing.cost_estimate !== null) {
      unitPrice = item.device.pricing.cost_estimate;
    } else if (item.device.pricing.list_price_gpl !== null) {
      const discount = item.itemDiscountRate ?? globalDiscountRate;
      unitPrice = item.device.pricing.list_price_gpl * discount;
    }
    const accTotal = (item.selectedAccessories || []).reduce(
      (aSum, a) => aSum + a.unitPrice * a.quantity,
      0
    );
    return sum + (unitPrice + accTotal) * item.quantity;
  }, 0);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-cyan-400 p-[1px] shadow-md shadow-sky-500/20">
            <div className="w-full h-full bg-[#0d1017] rounded-[7px] flex items-center justify-center">
              <Network className="w-4 h-4 text-sky-400" />
            </div>
          </div>
          <h1 className="text-base font-bold tracking-tight text-white">
            NetBOM
          </h1>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索型号、P/N、端口规格 (如 S5735, 48口PoE+, 25G)..."
              className="w-full glass-input rounded-xl pl-9 pr-8 py-1.5 text-xs placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* AI Import Quote / Specs */}
          {onOpenAIImport && (
            <button
              onClick={onOpenAIImport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-xs font-semibold transition-colors"
              title="上传 Excel / PDF / 文本报价单自动解析"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>AI 导入报价</span>
            </button>
          )}

          {/* Add Device */}
          {onOpenAddDevice && (
            <button
              onClick={onOpenAddDevice}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl glass-panel text-slate-300 hover:text-white hover:bg-white/10 text-xs font-medium transition-colors"
              title="手动录入设备"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">录入设备</span>
            </button>
          )}

          {/* Templates */}
          {onOpenTemplates && (
            <button
              onClick={onOpenTemplates}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl glass-panel text-slate-300 hover:text-white hover:bg-white/10 text-xs font-medium transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>模板</span>
            </button>
          )}

          {/* AI Settings */}
          {onOpenAISettings && (
            <button
              onClick={onOpenAISettings}
              className="p-1.5 rounded-xl glass-panel text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="AI 接口设置"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {/* Compare Button */}
          {diffDeviceIds.length > 0 && (
            <button
              onClick={() => {
                const el = document.getElementById('diff-modal-trigger');
                if (el) el.click();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500/25"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>对比 ({diffDeviceIds.length})</span>
            </button>
          )}

          {/* BOM Sheet Trigger */}
          <button
            onClick={toggleDrawer}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              totalItemCount > 0
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:brightness-110 shadow-md shadow-sky-500/20'
                : 'glass-panel text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>BOM 清单</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                totalItemCount > 0 ? 'bg-white text-sky-700' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {totalItemCount}
            </span>
            {totalItemCount > 0 && (
              <span className="hidden xl:inline text-sky-100 font-mono text-[11px] border-l border-white/20 pl-2">
                ¥{estimatedTotal.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
