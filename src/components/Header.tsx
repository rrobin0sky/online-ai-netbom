import React from 'react';
import { Network, FileSpreadsheet, GitCompare, Search, ShieldCheck, Plus, Layers } from 'lucide-react';
import { useBOMStore } from '../store/useBOMStore';
import { useI18n } from '../i18n';

interface HeaderProps {
  onOpenAddDevice?: () => void;
  onOpenTemplates?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddDevice, onOpenTemplates }) => {
  const {
    items,
    toggleDrawer,
    diffDeviceIds,
    searchQuery,
    setSearchQuery,
    globalDiscountRate,
  } = useBOMStore();
  const { t, lang } = useI18n();

  const totalItemCount = items.reduce((acc, cur) => acc + cur.quantity, 0);

  // Compute total estimated cost / price
  const estimatedTotal = items.reduce((sum, item) => {
    let unitPrice = 0;
    if (item.customUnitPrice !== null) {
      unitPrice = item.customUnitPrice;
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
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 p-[1.5px] shadow-lg shadow-sky-500/20 flex-shrink-0">
            <div className="w-full h-full bg-[#0d1017] rounded-[10px] flex items-center justify-center">
              <Network className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                NetBOM
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  {t('header.version')}
                </span>
              </h1>
              <span className="hidden sm:inline-block text-xs text-slate-500">•</span>
              <span className="hidden sm:inline-block text-xs text-slate-400 font-medium">
                {t('header.tagline')}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-2">
              <span className="flex items-center gap-1 text-emerald-400/90">
                <ShieldCheck className="w-3 h-3" /> {lang === 'zh' ? '官网规格溯源' : 'Official Datasheet Specs'}
              </span>
              <span>•</span>
              <span>{lang === 'zh' ? 'Local-First 商业隐私加密' : 'Local-First Privacy Architecture'}</span>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('header.searchPlaceholder')}
              className="w-full glass-input rounded-xl pl-10 pr-4 py-2 text-xs placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Templates Trigger */}
          {onOpenTemplates && (
            <button
              onClick={onOpenTemplates}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl glass-panel text-slate-300 hover:text-white hover:bg-white/10 text-xs font-medium transition-colors"
              title={lang === 'zh' ? '载入行业拓扑预置模板' : 'Load network topology template'}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t('header.templates')}</span>
            </button>
          )}

          {/* Add Device Trigger */}
          {onOpenAddDevice && (
            <button
              onClick={onOpenAddDevice}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/25 text-sky-300 text-xs font-semibold transition-colors"
              title={lang === 'zh' ? '录入新设备规格' : 'Add custom equipment specs'}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('header.addCustom')}</span>
            </button>
          )}

          {/* Compare Button */}
          {diffDeviceIds.length > 0 && (
            <button
              onClick={() => {
                const el = document.getElementById('diff-modal-trigger');
                if (el) el.click();
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500/20 transition-colors"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>{t('header.diff')} ({diffDeviceIds.length})</span>
            </button>
          )}

          {/* BOM Drawer Trigger */}
          <button
            onClick={toggleDrawer}
            className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-md ${
              totalItemCount > 0
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:brightness-110 shadow-sky-500/25 ring-2 ring-sky-400/20'
                : 'glass-panel text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <div className="flex items-center gap-1.5">
              <span>BOM</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  totalItemCount > 0 ? 'bg-white text-sky-700' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {totalItemCount}
              </span>
            </div>
            {totalItemCount > 0 && (
              <span className="hidden lg:inline text-sky-100 font-mono text-[11px] border-l border-white/20 pl-2">
                ¥{estimatedTotal.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
