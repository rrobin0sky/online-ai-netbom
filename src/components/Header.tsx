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

const BTN_BASE =
  'h-8 px-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-zinc-200 hover:text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap';

export const Header: React.FC<HeaderProps> = ({
  onOpenTemplates,
  onOpenAIImport,
}) => {
  const {
    items,
    serviceItems,
    toggleDrawer,
    diffDeviceIds,
    searchQuery,
    setSearchQuery,
  } = useBOMStore();

  const totalItemCount =
    items.reduce((acc, cur) => acc + cur.quantity, 0) +
    (serviceItems || []).length;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-zinc-200"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
              placeholder="搜索型号、P/N、弱电材料、布线人工..."
              className="w-full h-8 glass-input rounded-lg pl-9 pr-8 text-xs placeholder:text-zinc-500"
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

        {/* Action Buttons (Unified Size & Color) */}
        <div className="flex items-center gap-2">
          {onOpenAIImport && (
            <button
              onClick={onOpenAIImport}
              className={BTN_BASE}
              title="上传报价单解析或手动录入设备"
            >
              <Upload className="w-3.5 h-3.5 text-zinc-400" />
              <span>导入</span>
            </button>
          )}

          {onOpenTemplates && (
            <button onClick={onOpenTemplates} className={BTN_BASE}>
              <LayoutTemplate className="w-3.5 h-3.5 text-zinc-400" />
              <span>模板</span>
            </button>
          )}

          {diffDeviceIds.length > 0 && (
            <button
              onClick={() => {
                const el = document.getElementById('diff-modal-trigger');
                if (el) el.click();
              }}
              className={BTN_BASE}
            >
              <GitCompare className="w-3.5 h-3.5 text-zinc-400" />
              <span>对比 ({diffDeviceIds.length})</span>
            </button>
          )}

          <button onClick={toggleDrawer} className={BTN_BASE}>
            <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-400" />
            <span>清单</span>
            {totalItemCount > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-white/10 text-zinc-200 text-[11px] font-mono leading-none">
                {totalItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
