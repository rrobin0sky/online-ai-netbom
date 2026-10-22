import React, { useMemo } from 'react';
import { DeviceCard } from './DeviceCard';
import { SEED_DEVICES } from '../data/seedDevices';
import { useBOMStore } from '../store/useBOMStore';
import { SearchX, Filter } from 'lucide-react';

export const DeviceCatalog: React.FC = () => {
  const {
    searchQuery,
    selectedBrand,
    selectedCategory,
    selectedSpeed,
    poeOnly,
    hideEol,
  } = useBOMStore();

  const filteredDevices = useMemo(() => {
    return SEED_DEVICES.filter((d) => {
      // 1. Text Search (model, series, part_number, description, tags)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesModel = d.model.toLowerCase().includes(q);
        const matchesSeries = d.series.toLowerCase().includes(q);
        const matchesPn = d.part_number.toLowerCase().includes(q);
        const matchesDesc = d.description.toLowerCase().includes(q);
        const matchesTags = d.metadata.tags.some((t) => t.toLowerCase().includes(q));
        const matchesPorts = d.specs.ports.summary.toLowerCase().includes(q);
        if (
          !matchesModel &&
          !matchesSeries &&
          !matchesPn &&
          !matchesDesc &&
          !matchesTags &&
          !matchesPorts
        ) {
          return false;
        }
      }

      // 2. Brand
      if (selectedBrand !== 'all' && d.brand !== selectedBrand) {
        return false;
      }

      // 3. Category / Layer
      if (selectedCategory !== 'all') {
        if (d.specs.layer !== selectedCategory) {
          return false;
        }
      }

      // 4. Speed
      if (selectedSpeed !== 'all') {
        const hasDownlink = d.specs.ports.downlink_speed === selectedSpeed;
        const hasUplink = d.specs.ports.uplink_speed === selectedSpeed;
        if (!hasDownlink && !hasUplink) {
          return false;
        }
      }

      // 5. PoE Only
      if (poeOnly && !d.specs.poe.supported) {
        return false;
      }

      // 6. Hide EOL
      if (hideEol && d.lifecycle === 'eol') {
        return false;
      }

      return true;
    });
  }, [
    searchQuery,
    selectedBrand,
    selectedCategory,
    selectedSpeed,
    poeOnly,
    hideEol,
  ]);

  return (
    <div className="flex-1 min-w-0">
      {/* Result Status Bar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-semibold text-slate-200">
            符合条件设备清单
          </h2>
          <span className="text-xs font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
            {filteredDevices.length} 款机型
          </span>
        </div>

        <div className="text-xs text-slate-500">
          支持多维联动筛选与参数对齐
        </div>
      </div>

      {/* Catalog Grid */}
      {filteredDevices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-5">
          {filteredDevices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-panel rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto my-12">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
            <SearchX className="w-8 h-8 text-sky-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">未找到匹配的设备</h3>
            <p className="text-xs text-slate-400 mt-1">
              没有找到符合当前筛选条件的网络设备。请尝试调整品牌、端口速率或取消 PoE 限制。
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
