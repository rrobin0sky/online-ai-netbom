import React, { useMemo } from 'react';
import { DeviceCard } from './DeviceCard';
import {
  useBOMStore,
  getMergedCatalog,
  getDeletedDevicesCatalog,
} from '../store/useBOMStore';
import { DeviceItem } from '../types/device';
import { SearchX, RotateCcw, Trash2 } from 'lucide-react';

interface DeviceCatalogProps {
  onEditDevice?: (device: DeviceItem) => void;
}

export const DeviceCatalog: React.FC<DeviceCatalogProps> = ({ onEditDevice }) => {
  const {
    customDevices,
    deletedDeviceIds,
    deletedCustomDevices,
    purgedDeviceIds,
    brandRenames,
    searchQuery,
    selectedBrand,
    selectedCategory,
    selectedSpeed,
    poeOnly,
    hideEol,
    recentOnly,
    unpricedOnly,
    trashView,
    setTrashView,
    restoreDefaultDevices,
    emptyTrash,
    globalDiscountRate,
  } = useBOMStore();

  const allDevices = useMemo(() => {
    if (trashView) {
      return getDeletedDevicesCatalog(
        deletedDeviceIds,
        deletedCustomDevices,
        brandRenames,
        purgedDeviceIds
      );
    }
    return getMergedCatalog(customDevices, deletedDeviceIds, brandRenames, purgedDeviceIds);
  }, [
    trashView,
    customDevices,
    deletedDeviceIds,
    deletedCustomDevices,
    purgedDeviceIds,
    brandRenames,
  ]);

  const customIds = useMemo(
    () => new Set(customDevices.map((c) => c.id)),
    [customDevices]
  );

  const filteredDevices = useMemo(() => {
    const now = Date.now();
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;

    return allDevices.filter((d) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesModel = d.model.toLowerCase().includes(q);
        const matchesSeries = d.series.toLowerCase().includes(q);
        const matchesPn = d.part_number.toLowerCase().includes(q);
        const matchesDesc = d.description.toLowerCase().includes(q);
        const matchesTags = d.metadata.tags.some((t) =>
          t.toLowerCase().includes(q)
        );
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

      if (trashView) {
        return true;
      }

      if (selectedBrand !== 'all' && d.brand !== selectedBrand) {
        return false;
      }

      if (selectedCategory !== 'all' && d.specs.layer !== selectedCategory) {
        return false;
      }

      if (selectedSpeed !== 'all') {
        const hasDownlink = d.specs.ports.downlink_speed === selectedSpeed;
        const hasUplink = d.specs.ports.uplink_speed === selectedSpeed;
        if (!hasDownlink && !hasUplink) {
          return false;
        }
      }

      if (poeOnly && !d.specs.poe.supported) {
        return false;
      }

      if (hideEol && d.lifecycle === 'eol') {
        return false;
      }

      if (recentOnly && !customIds.has(d.id)) {
        return false;
      }

      if (unpricedOnly) {
        const gpl = d.pricing.list_price_gpl;
        const discount = d.pricing.discount_reference ?? globalDiscountRate;
        const price =
          d.pricing.cost_estimate !== null
            ? d.pricing.cost_estimate
            : gpl !== null
            ? Math.round(gpl * discount)
            : null;
        const verifiedDate = d.pricing.price_verified_at
          ? Date.parse(d.pricing.price_verified_at)
          : NaN;
        const isExpired =
          isNaN(verifiedDate) || now - verifiedDate > ninetyDaysMs;
        if (price !== null && !isExpired) {
          return false;
        }
      }

      return true;
    });
  }, [
    allDevices,
    trashView,
    searchQuery,
    selectedBrand,
    selectedCategory,
    selectedSpeed,
    poeOnly,
    hideEol,
    recentOnly,
    unpricedOnly,
    customIds,
    globalDiscountRate,
  ]);

  return (
    <div className="flex-1 min-w-0 space-y-3">
      {/* Recycle Bin Header Bar when in Trash View */}
      {trashView && (
        <div className="glass-panel rounded-xl px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>
              回收站（共 {filteredDevices.length} 台已删除设备，可单独还原或全部还原）
            </span>
          </div>
          <div className="flex items-center gap-2">
            {filteredDevices.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={restoreDefaultDevices}
                  className="h-7 px-2.5 rounded-md bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-zinc-200 hover:text-white inline-flex items-center gap-1 transition-colors cursor-pointer"
                  title="将回收站中的所有设备恢复到设备库"
                >
                  <RotateCcw className="w-3 h-3 text-zinc-400" />
                  <span>全部还原</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('确定清空回收站吗？清空后将从回收站永久移除。')) {
                      emptyTrash();
                    }
                  }}
                  className="h-7 px-2.5 rounded-md bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-zinc-300 hover:text-rose-300 inline-flex items-center gap-1 transition-colors cursor-pointer"
                  title="永久清空回收站中的所有内容"
                >
                  <Trash2 className="w-3 h-3 text-zinc-400" />
                  <span>清空回收站</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setTrashView(false)}
              className="h-7 px-2.5 rounded-md bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              返回列表
            </button>
          </div>
        </div>
      )}

      {filteredDevices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 items-start">
          {filteredDevices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              isTrash={trashView}
              onEditDevice={onEditDevice}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-10 text-center space-y-3 max-w-sm mx-auto my-8">
          <SearchX className="w-7 h-7 text-zinc-500 mx-auto" />
          <div className="text-sm font-bold text-zinc-200">
            {trashView
              ? '回收站为空'
              : recentOnly
              ? '暂无最近录入的设备'
              : unpricedOnly
              ? '暂无待核价或价格过期的设备'
              : '无匹配设备'}
          </div>
        </div>
      )}
    </div>
  );
};
