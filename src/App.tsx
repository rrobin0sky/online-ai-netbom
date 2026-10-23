import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FilterSidebar } from './components/FilterSidebar';
import { DeviceCatalog } from './components/DeviceCatalog';
import { BOMDrawer } from './components/BOMDrawer';
import { DeviceDiffModal } from './components/DeviceDiffModal';
import { AddDeviceModal } from './components/AddDeviceModal';
import { SceneTemplateModal } from './components/SceneTemplateModal';
import { useBOMStore } from './store/useBOMStore';
import { useI18n } from './i18n';
import {
  Server,
  Zap,
  Sliders,
  FileSpreadsheet,
  Sparkles,
} from 'lucide-react';
import LZString from 'lz-string';
import { SEED_DEVICES } from './data/seedDevices';
import { BOMItem } from './types/device';

export const App: React.FC = () => {
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const { setDrawerOpen, items } = useBOMStore();
  const { t, setLang } = useI18n();

  // Listen to shared URL parameters on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const bomData = params.get('bom');
      if (bomData) {
        const decompressed = LZString.decompressFromEncodedURIComponent(bomData);
        if (decompressed) {
          const parsed = JSON.parse(decompressed);
          if (parsed && parsed.items && Array.isArray(parsed.items)) {
            // Restore store items
            const restoredItems: BOMItem[] = [];
            parsed.items.forEach((itemMeta: any) => {
              const matchedDevice = SEED_DEVICES.find((d) => d.id === itemMeta.id);
              if (matchedDevice) {
                restoredItems.push({
                  uid: `${matchedDevice.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  device: matchedDevice,
                  quantity: itemMeta.q || 1,
                  areaGroup: itemMeta.g || '接入层',
                  customUnitPrice: itemMeta.p || null,
                  itemDiscountRate: itemMeta.d || null,
                  notes: itemMeta.n || '',
                  selectedAccessories: itemMeta.acc || [],
                });
              }
            });
            if (restoredItems.length > 0) {
              useBOMStore.setState({
                items: restoredItems,
                projectName: parsed.p || '已导入分享方案',
                clientName: parsed.c || '尊贵客户',
                globalDiscountRate: parsed.d ?? 0.3,
                targetMarginRate: parsed.m ?? 0.25,
                taxRate: parsed.t ?? 0.13,
                isDrawerOpen: true,
              });
            }
          }
        }
      }

      // Check URL language
      const urlLang = params.get('b0_lang');
      if (urlLang) {
        setLang(urlLang);
      }
    } catch (e) {
      console.error('Failed to load shared BOM from URL', e);
    }
  }, [setLang]);

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans selection:bg-sky-500/20 selection:text-sky-300">
      {/* Top Header */}
      <Header
        onOpenAddDevice={() => setIsAddDeviceOpen(true)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
      />

      {/* Hero / Value Proposition Strip */}
      <section className="relative px-4 lg:px-8 py-6 border-b border-white/5 bg-gradient-to-b from-sky-950/20 via-transparent to-transparent">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>{t('hero.badge')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {t('hero.title')}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {t('hero.description')}
            </p>
          </div>

          {/* Quick Steps Pill Flow */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono bg-white/5 p-2 rounded-2xl border border-white/5 flex-shrink-0">
            <span className="flex items-center gap-1 text-sky-300 font-semibold">
              <Server className="w-3.5 h-3.5" /> {t('hero.step1')}
            </span>
            <span>➔</span>
            <span className="flex items-center gap-1 text-amber-300 font-semibold">
              <Zap className="w-3.5 h-3.5" /> {t('hero.step2')}
            </span>
            <span>➔</span>
            <span className="flex items-center gap-1 text-emerald-300 font-semibold">
              <Sliders className="w-3.5 h-3.5" /> {t('hero.step3')}
            </span>
            <span>➔</span>
            <span className="flex items-center gap-1 text-white font-bold bg-sky-500/20 px-2 py-0.5 rounded-lg border border-sky-500/30">
              <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" /> {t('hero.step4')}
            </span>
          </div>
        </div>
      </section>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left Filter Sidebar */}
        <FilterSidebar />

        {/* Right Device Catalog Cards */}
        <DeviceCatalog />
      </main>

      {/* Hidden button to trigger diff modal from Header */}
      <button
        id="diff-modal-trigger"
        className="hidden"
        onClick={() => setIsDiffModalOpen(true)}
      />

      {/* Diff Modal */}
      <DeviceDiffModal
        isOpen={isDiffModalOpen}
        onClose={() => setIsDiffModalOpen(false)}
      />

      {/* Add Custom Device Modal */}
      <AddDeviceModal
        isOpen={isAddDeviceOpen}
        onClose={() => setIsAddDeviceOpen(false)}
      />

      {/* Scene Templates Modal */}
      <SceneTemplateModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
      />

      {/* BOM Drawer */}
      <BOMDrawer />

      {/* Floating Bottom Pill for Quick Access */}
      {items.length > 0 && (
        <div className="fixed bottom-6 right-6 z-30 lg:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs shadow-2xl shadow-sky-500/40 ring-4 ring-sky-400/20"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t('drawer.viewBOMFloating')} ({items.reduce((s, i) => s + i.quantity, 0)})</span>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t('footer.tagline')}</span>
          </div>
          <div>
            Part of{' '}
            <a
              href="/"
              className="text-slate-400 hover:text-white font-medium underline underline-offset-4"
            >
              bin0sky.tech
            </a>{' '}
            Digital Studio Matrix
          </div>
        </div>
      </footer>
    </div>
  );
};
