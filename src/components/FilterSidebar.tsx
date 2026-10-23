import React from 'react';
import { Layers, Zap, SlidersHorizontal, ShieldAlert, Cpu } from 'lucide-react';
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
  } = useBOMStore();

  const allDevices = getMergedCatalog(customDevices);

  const brands = [
    { id: 'all', label: '全部品牌' },
    { id: 'Huawei', label: 'Huawei 华为' },
    { id: 'H3C', label: 'H3C 新华三' },
    { id: 'Cisco', label: 'Cisco 思科' },
    { id: 'Ruijie', label: 'Ruijie 锐捷' },
    { id: 'FS.com', label: 'FS.com 飞速' },
  ];

  const layers = [
    { id: 'all', label: '全部层级' },
    { id: 'L2+', label: '园区接入 (L2+)' },
    { id: 'L3', label: '核心汇聚 (L3)' },
    { id: 'DataCenter', label: '数据中心 (DC)' },
  ];

  const speeds = [
    { id: 'all', label: '全部' },
    { id: '1G', label: '1GE' },
    { id: '10G', label: '10GE' },
    { id: '25G', label: '25GE' },
    { id: '100G', label: '100GE' },
  ];

  return (
    <aside className="w-full lg:w-56 flex-shrink-0 space-y-4">
      <div className="block md:hidden">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索型号、P/N..."
          className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
        />
      </div>

      {/* Brand Selector */}
      <div className="glass-panel rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-sky-400" /> 品牌
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-1">
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBrand(b.id)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedBrand === b.id
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>{b.label}</span>
              <span className="text-[10px] font-mono text-slate-500">
                {b.id === 'all'
                  ? allDevices.length
                  : allDevices.filter((d) => d.brand === b.id).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Layer Filter */}
      <div className="glass-panel rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Layers className="w-3.5 h-3.5 text-indigo-400" /> 层级
        </div>
        <div className="space-y-1">
          {layers.map((l) => (
            <button
              key={l.id}
              onClick={() => setSelectedCategory(l.id)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === l.id
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Speed Filter */}
      <div className="glass-panel rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Zap className="w-3.5 h-3.5 text-amber-400" /> 端口速率
        </div>
        <div className="flex flex-wrap gap-1.5">
          {speeds.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSpeed(s.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedSpeed === s.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'glass-input text-slate-400 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="glass-panel rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" /> 过滤项
        </div>
        <div className="space-y-2 pt-0.5">
          <label className="flex items-center justify-between text-xs cursor-pointer select-none text-slate-300 hover:text-white">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> 仅看 PoE
            </span>
            <input
              type="checkbox"
              checked={poeOnly}
              onChange={(e) => setPoeOnly(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-sky-500 w-3.5 h-3.5 accent-sky-500"
            />
          </label>

          <label className="flex items-center justify-between text-xs cursor-pointer select-none text-slate-300 hover:text-white">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> 隐藏停产机型
            </span>
            <input
              type="checkbox"
              checked={hideEol}
              onChange={(e) => setHideEol(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-sky-500 w-3.5 h-3.5 accent-sky-500"
            />
          </label>
        </div>
      </div>
    </aside>
  );
};
