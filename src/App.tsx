import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FilterSidebar } from './components/FilterSidebar';
import { DeviceCatalog } from './components/DeviceCatalog';
import { ServiceCatalog } from './components/ServiceCatalog';
import { BOMDrawer } from './components/BOMDrawer';
import { DeviceDiffModal } from './components/DeviceDiffModal';
import { AddDeviceModal } from './components/AddDeviceModal';
import { SceneTemplateModal } from './components/SceneTemplateModal';
import { AISettingsModal } from './components/AISettingsModal';
import { AIImportModal } from './components/AIImportModal';
import { useBOMStore, getMergedCatalog } from './store/useBOMStore';
import { FileSpreadsheet } from 'lucide-react';
import LZString from 'lz-string';
import { BOMItem, DeviceItem } from './types/device';

export const App: React.FC = () => {
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<DeviceItem | null>(null);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isAIImportOpen, setIsAIImportOpen] = useState(false);
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);

  const {
    workspaceTab,
    setDrawerOpen,
    items,
    serviceItems,
    customDevices,
    deletedDeviceIds,
  } = useBOMStore();

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const bomData = params.get('bom');
      if (bomData) {
        const decompressed = LZString.decompressFromEncodedURIComponent(bomData);
        if (decompressed) {
          const parsed = JSON.parse(decompressed);
          if (parsed && parsed.items && Array.isArray(parsed.items)) {
            const catalog = getMergedCatalog(customDevices, deletedDeviceIds);
            const restoredItems: BOMItem[] = [];
            parsed.items.forEach((itemMeta: any) => {
              const matchedDevice = catalog.find((d) => d.id === itemMeta.id);
              if (matchedDevice) {
                restoredItems.push({
                  uid: `${matchedDevice.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  device: matchedDevice,
                  quantity: itemMeta.q || 1,
                  areaGroup: itemMeta.g || '接入层',
                  customUnitPrice: itemMeta.p || null,
                  itemDiscountRate: itemMeta.d || null,
                  itemTaxRate: itemMeta.tx ?? 0.13,
                  notes: itemMeta.n || '',
                  selectedAccessories: itemMeta.acc || [],
                });
              }
            });
            if (restoredItems.length > 0) {
              useBOMStore.setState({
                items: restoredItems,
                projectName: parsed.p || '已导入分享方案',
                clientName: parsed.c || '客户单位',
                globalDiscountRate: parsed.d ?? 0.3,
                targetMarginRate: parsed.m ?? 0.25,
                taxRate: parsed.t ?? 0.13,
                isDrawerOpen: true,
              });
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to load shared BOM from URL', e);
    }
  }, []);

  const totalCount =
    items.reduce((s, i) => s + i.quantity, 0) + (serviceItems || []).length;

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col font-sans selection:bg-white/20 selection:text-white">
      {/* Top Workspace Header */}
      <Header
        onOpenAIImport={() => setIsAIImportOpen(true)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
      />

      {/* Main Workspace Layout: Top Horizontal Filter Bar + Catalog Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-4 flex flex-col gap-4">
        <FilterSidebar onOpenAddService={() => setIsAddServiceOpen(true)} />
        {workspaceTab === 'devices' ? (
          <DeviceCatalog
            onEditDevice={(dev) => {
              setEditingDevice(dev);
              setIsAddDeviceOpen(true);
            }}
          />
        ) : (
          <ServiceCatalog
            isAddModalOpen={isAddServiceOpen}
            onCloseAddModal={() => setIsAddServiceOpen(false)}
          />
        )}
      </main>

      {/* Hidden trigger for Diff Modal */}
      <button
        id="diff-modal-trigger"
        className="hidden"
        onClick={() => setIsDiffModalOpen(true)}
      />

      {/* Modals & Sheets */}
      <DeviceDiffModal
        isOpen={isDiffModalOpen}
        onClose={() => setIsDiffModalOpen(false)}
      />

      <AddDeviceModal
        isOpen={isAddDeviceOpen}
        editingDevice={editingDevice}
        onClose={() => {
          setIsAddDeviceOpen(false);
          setEditingDevice(null);
        }}
      />

      <SceneTemplateModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
      />

      <AIImportModal
        isOpen={isAIImportOpen}
        onClose={() => setIsAIImportOpen(false)}
        onOpenAISettings={() => setIsAISettingsOpen(true)}
      />

      <AISettingsModal
        isOpen={isAISettingsOpen}
        onClose={() => setIsAISettingsOpen(false)}
      />

      <BOMDrawer />

      {/* Mobile Floating BOM Pill */}
      {totalCount > 0 && (
        <div className="fixed bottom-5 right-5 z-30 lg:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            className="h-9 px-4 rounded-full bg-zinc-900 border border-white/20 text-zinc-100 font-medium text-xs shadow-2xl inline-flex items-center gap-2"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-400" />
            <span>清单 ({totalCount})</span>
          </button>
        </div>
      )}
    </div>
  );
};
