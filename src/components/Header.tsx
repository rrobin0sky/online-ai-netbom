import React from 'react';
import {
  FileSpreadsheet,
  GitCompare,
  Search,
  Upload,
  LayoutTemplate,
} from 'lucide-react';
import { useBOMStore } from '../store/useBOMStore';

interface HeaderProps {
  onOpenTemplates?: () => void;
  onOpenAIImport?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenTemplates,
  onOpenAIImport,
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
      unitPrice = Math.round(item.device.pricing.list_price_gpl * discount);
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
        {/* Brand Logo (Minimalist Rack Switch + BOM Icon) */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/15 flex items-center justify-center shadow-xs">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-zinc-100" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="7" rx="1.5" />
              <rect x="2" y="13" width="20" height="7" rx="1.5" />
              <circle cx="6" cy="7.5" r="0.8" fill="currentColor" />
              <circle cx="9.5" cy="7.5" r="0.8" fill="currentColor" />
              <circle cx="6" cy="16.5" r="0.8" fill="currentColor" />
              <circle cx="9.5" cy="16.5" r="0.8" fill="currentColor" />
              <line x1="14" y1="7.5" x2="18.5" y2="7.5" />
              <line x1="14" y1="16.5" x2="18.5" y2="16.5" />
            </svg>
          </div>
          <h1 className="text-sm font-bold tracking-tight text-zinc-100">
            NetBOM
          </h1>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索型号、P/N、端口规格 (如 S5735, 48口PoE+, 25G)..."
              className="w-full glass-input rounded-xl pl-9 pr-8 py-1.5 text-xs placeholder:text-zinc-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons (Restrained Monochrome Style) */}
        <div className="flex items-center gap-2">
          {/* Unified Import / Add Entry */}
          {onOpenAIImport && (
            <button
              onClick={onOpenAIImport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel border border-white/10 text-zinc-200 hover:text-white hover:bg-white/10 text-xs font-medium transition-colors"
              title="上传报价单解析或手动录入设备"
            >
              <Upload className="w-3.5 h-3.5 text-zinc-400" />
              <span>导入 / 录入</span>
            </button>
          )}

          {/* Templates */}
          {onOpenTemplates && (
            <button
              onClick={onOpenTemplates}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel border border-white/10 text-zinc-200 hover:text-white hover:bg-white/10 text-xs font-medium transition-colors"
            >
              <LayoutTemplate className="w-3.5 h-3.5 text-zinc-400" />
              <span>模板</span>
            </button>
          )}

          {/* Compare Button */}
          {diffDeviceIds.length > 0 && (
            <button
              onClick={() => {
                const el = document.getElementById('diff-modal-trigger');
                if (el) el.click();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel border border-white/20 text-zinc-100 text-xs font-medium hover:bg-white/10"
            >
              <GitCompare className="w-3.5 h-3.5 text-zinc-400" />
              <span>对比 ({diffDeviceIds.length})</span>
            </button>
          )}

          {/* BOM Sheet Trigger */}
          <button
            onClick={toggleDrawer}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              totalItemCount > 0
                ? 'bg-zinc-100 text-zinc-900 hover:bg-white shadow-sm'
                : 'glass-panel border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>BOM 清单</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                totalItemCount > 0
                  ? 'bg-zinc-900 text-zinc-100'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {totalItemCount}
            </span>
            {totalItemCount > 0 && (
              <span className="hidden xl:inline text-zinc-600 font-mono text-[11px] border-l border-zinc-300 pl-2">
                ¥{estimatedTotal.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
