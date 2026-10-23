import React, { useMemo } from 'react';
import { DeviceCard } from './DeviceCard';
import { useBOMStore, getMergedCatalog } from '../store/useBOMStore';
import { DeviceItem } from '../types/device';
import { SearchX } from 'lucide-react';

interface DeviceCatalogProps {
  onEditDevice?: (device: DeviceItem) => void;
}

export const DeviceCatalog: React.FC<DeviceCatalogProps> = ({ onEditDevice }) => {
  const {
    customDevices,
    deletedDeviceIds,
    brandRenames,
    searchQuery,
    selectedBrand,
    selectedCategory,
    selectedSpeed,
    poeOnly,
    hideEol,
  } = useBOMStore();

  const allDevices = useMemo(() => {
    return getMergedCatalog(customDevices, deletedDeviceIds, brandRenames);
  }, [customDevices, deletedDeviceIds, brandRenames]);

  const filteredDevices = useMemo(() => {
    return allDevices.filter((d) => {
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

      return true;
    });
  }, [
    allDevices,
    searchQuery,
    selectedBrand,
    selectedCategory,
    selectedSpeed,
    poeOnly,
    hideEol,
  ]);

  return (
    <div className="flex-1 min-w-0">
      {filteredDevices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 items-start">
          {filteredDevices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onEditDevice={onEditDevice}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-10 text-center space-y-3 max-w-sm mx-auto my-8">
          <SearchX className="w-7 h-7 text-zinc-500 mx-auto" />
          <div className="text-sm font-bold text-zinc-200">无匹配设备</div>
        </div>
      )}
    </div>
  );
};
