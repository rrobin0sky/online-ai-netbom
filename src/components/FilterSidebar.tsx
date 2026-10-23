import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useBOMStore, getMergedCatalog } from '../store/useBOMStore';

export const FilterSidebar: React.FC = () => {
  const {
    selectedBrand,
    setSelectedBrand,
    selectedCategory,
    setSelectedCategory,
    selectedSpeed,
    setSelectedSpeed,
    poeOnly,
    setPoeOnly,
    hideEol,
    setHideEol,
    searchQuery,
    setSearchQuery,
    customDevices,
    deletedDeviceIds,
    restoreDefaultDevices,
  } = useBOMStore();

  const allDevices = getMergedCatalog(customDevices, deletedDeviceIds);

  const brands = [
    { id: 'all', label: '全部品牌' },
    { id: 'Huawei', label: 'Huawei' },
    { id: 'H3C', label: 'H3C' },
    { id: 'Cisco', label: 'Cisco' },
    { id: 'Ruijie', label: 'Ruijie' },
    { id: 'FS.com', label: 'FS.com' },
  ];

  const layers = [
    { id: 'all', label: '全部层级' },
    { id: 'L2+', label: '接入 (L2+)' },
    { id: 'L3', label: '核心汇聚 (L3)' },
    { id: 'DataCenter', label: '数据中心 (DC)' },
  ];

  const speeds = [
    { id: 'all', label: '全部速率' },
    { id: '1G', label: '1GE' },
    { id: '10G', label: '10GE' },
    { id: '25G', label: '25GE' },
    { id: '100G', label: '100GE' },
  ];

  const pillClass = (active: boolean) =>
    `px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
      active
        ? 'bg-zinc-100 text-zinc-900 font-semibold shadow-xs'
        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
    }`;

  return (
    <section className="w-full space-y-2.5">
      {/* Mobile Search Input */}
      <div className="block md:hidden">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索型号、P/N..."
          className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
        />
      </div>

      {/* Horizontal Top Filter Bar */}
      <div className="glass-panel rounded-xl px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-y-2.5 gap-x-4">
        <div className="flex flex-wrap items-center gap-y-2 gap-x-3">
          {/* Brand Pills */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[11px] text-zinc-500 mr-1 font-medium">品牌:</span>
            {brands.map((b) => {
              const count =
                b.id === 'all'
                  ? allDevices.length
                  : allDevices.filter((d) => d.brand === b.id).length;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBrand(b.id)}
                  className={pillClass(selectedBrand === b.id)}
                >
                  <span>{b.label}</span>
                  <span
                    className={`ml-1 text-[10px] font-mono ${
                      selectedBrand === b.id ? 'text-zinc-600' : 'text-zinc-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="hidden xl:block h-4 w-[1px] bg-white/10" />

          {/* Layer Pills */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[11px] text-zinc-500 mr-1 font-medium">层级:</span>
            {layers.map((l) => (
              <button
                key={l.id}
                onClick={() => setSelectedCategory(l.id)}
                className={pillClass(selectedCategory === l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="hidden xl:block h-4 w-[1px] bg-white/10" />

          {/* Speed Pills */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[11px] text-zinc-500 mr-1 font-medium">速率:</span>
            {speeds.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSpeed(s.id)}
                className={pillClass(selectedSpeed === s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Toggles & Reset */}
        <div className="flex items-center gap-3 text-xs ml-auto">
          <label className="flex items-center gap-1.5 cursor-pointer select-none text-zinc-400 hover:text-zinc-200">
            <input
              type="checkbox"
              checked={poeOnly}
              onChange={(e) => setPoeOnly(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-900 w-3.5 h-3.5 accent-zinc-200"
            />
            <span>仅 PoE</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none text-zinc-400 hover:text-zinc-200">
            <input
              type="checkbox"
              checked={hideEol}
              onChange={(e) => setHideEol(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-900 w-3.5 h-3.5 accent-zinc-200"
            />
            <span>隐藏停产</span>
          </label>

          {deletedDeviceIds.length > 0 && (
            <button
              type="button"
              onClick={restoreDefaultDevices}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-zinc-400 hover:text-zinc-100 hover:bg-white/5 border border-white/10"
              title="恢复已删除的默认设备"
            >
              <RotateCcw className="w-3 h-3" />
              <span>恢复默认库 ({deletedDeviceIds.length})</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
