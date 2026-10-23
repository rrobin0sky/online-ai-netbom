import React from 'react';
import { X, GitCompare, ExternalLink, Plus } from 'lucide-react';
import { useBOMStore, getMergedCatalog } from '../store/useBOMStore';
import { useI18n } from '../i18n';

interface DeviceDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeviceDiffModal: React.FC<DeviceDiffModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { diffDeviceIds, toggleDiffDevice, clearDiff, addItem, customDevices } = useBOMStore();
  const { t, lang } = useI18n();

  if (!isOpen || diffDeviceIds.length === 0) return null;

  const allDevices = getMergedCatalog(customDevices);
  const comparedDevices = allDevices.filter((d) =>
    diffDeviceIds.includes(d.id)
  );

  // Find max capacity and forwarding rate for highlighting
  const maxCapacity = Math.max(...comparedDevices.map((d) => d.specs.switching_capacity_gbps));
  const maxForwarding = Math.max(...comparedDevices.map((d) => d.specs.forwarding_rate_mpps));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-6xl max-h-[90vh] glass-panel-elevated rounded-3xl flex flex-col z-10 shadow-2xl overflow-hidden border border-white/15 animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {t('diff.title')}
                <span className="text-xs font-mono font-normal text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                  {comparedDevices.length} {lang === 'zh' ? '款机型' : 'Selected'}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {t('diff.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearDiff}
              className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              {t('diff.clearAll')}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Matrix (Scrollable horizontally) */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr>
                <th className="p-3 w-40 text-slate-400 font-mono uppercase bg-white/5 rounded-l-xl">
                  {lang === 'zh' ? '比选参数项' : 'Specification'}
                </th>
                {comparedDevices.map((d) => (
                  <th
                    key={d.id}
                    className="p-4 min-w-[220px] bg-slate-900/60 border-l border-white/10 first:border-0"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-semibold text-sky-400 font-mono text-[11px]">
                        {d.brand}
                      </span>
                      <button
                        onClick={() => toggleDiffDevice(d.id)}
                        className="text-slate-500 hover:text-rose-400 p-0.5 transition-colors"
                        title={lang === 'zh' ? '从比选中移除' : 'Remove from diff'}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="text-sm font-bold text-white tracking-tight">
                      {d.model}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      P/N: {d.part_number}
                    </div>

                    <button
                      onClick={() => addItem(d, lang === 'zh' ? '接入层' : 'Access Layer')}
                      className="w-full mt-3 flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-white font-semibold transition-all text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('diff.addToBOM')}</span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {/* Form Factor */}
              <tr>
                <td className="p-3 text-slate-400 font-medium">
                  {lang === 'zh' ? '机箱规格 (U)' : 'Form Factor (U)'}
                </td>
                {comparedDevices.map((d) => (
                  <td key={d.id} className="p-3 text-slate-200 border-l border-white/5 font-mono">
                    {d.specs.form_factor}
                  </td>
                ))}
              </tr>

              {/* Layer */}
              <tr>
                <td className="p-3 text-slate-400 font-medium">
                  {t('diff.layer')}
                </td>
                {comparedDevices.map((d) => (
                  <td key={d.id} className="p-3 text-slate-200 border-l border-white/5">
                    {d.specs.layer}
                  </td>
                ))}
              </tr>

              {/* Ports Summary */}
              <tr>
                <td className="p-3 text-slate-400 font-medium">
                  {t('diff.ports')}
                </td>
                {comparedDevices.map((d) => (
                  <td key={d.id} className="p-3 text-slate-200 border-l border-white/5 font-medium leading-relaxed">
                    {d.specs.ports.summary}
                  </td>
                ))}
              </tr>

              {/* Switching Capacity */}
              <tr>
                <td className="p-3 text-slate-400 font-medium">
                  {t('diff.switching')} (Gbps)
                </td>
                {comparedDevices.map((d) => {
                  const isBest = d.specs.switching_capacity_gbps === maxCapacity;
                  return (
                    <td key={d.id} className="p-3 border-l border-white/5 font-mono">
                      <span
                        className={`px-2 py-0.5 rounded ${
                          isBest
                            ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                            : 'text-slate-300'
                        }`}
                      >
                        {d.specs.switching_capacity_gbps} Gbps
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Forwarding Rate */}
              <tr>
                <td className="p-3 text-slate-400 font-medium">
                  {t('diff.forwarding')} (Mpps)
                </td>
                {comparedDevices.map((d) => {
                  const isBest = d.specs.forwarding_rate_mpps === maxForwarding;
                  return (
                    <td key={d.id} className="p-3 border-l border-white/5 font-mono">
                      <span
                        className={`px-2 py-0.5 rounded ${
                          isBest
                            ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                            : 'text-slate-300'
                        }`}
                      >
                        {d.specs.forwarding_rate_mpps} Mpps
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* PoE Budget */}
              <tr>
                <td className="p-3 text-slate-400 font-medium">
                  {t('diff.poe')}
                </td>
                {comparedDevices.map((d) => (
                  <td key={d.id} className="p-3 border-l border-white/5">
                    {d.specs.poe.supported ? (
                      <span className="text-amber-300 font-mono font-semibold">
                        {d.specs.poe.budget_watts}W ({d.specs.poe.standard})
                      </span>
                    ) : (
                      <span className="text-slate-500">{lang === 'zh' ? '不支持' : 'Not supported'}</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Power Supply */}
              <tr>
                <td className="p-3 text-slate-400 font-medium">
                  {t('diff.power')}
                </td>
                {comparedDevices.map((d) => (
                  <td key={d.id} className="p-3 text-slate-300 border-l border-white/5">
                    {d.specs.power_supply.type === 'modular'
                      ? (lang === 'zh'
                          ? `插槽 x${d.specs.power_supply.slots} (标配 ${d.specs.power_supply.default_included})`
                          : `Slots x${d.specs.power_supply.slots} (Default ${d.specs.power_supply.default_included})`)
                      : (lang === 'zh' ? '固定电源' : 'Fixed Internal')}
                    {d.specs.power_supply.redundancy_supported && (lang === 'zh' ? ' [支持1+1冗余]' : ' [1+1 Redundant]')}
                  </td>
                ))}
              </tr>

              {/* GPL Price */}
              <tr>
                <td className="p-3 text-slate-400 font-medium">
                  {t('diff.listPrice')}
                </td>
                {comparedDevices.map((d) => (
                  <td key={d.id} className="p-3 border-l border-white/5 font-mono font-bold text-white text-sm">
                    {d.pricing.list_price_gpl
                      ? `¥${d.pricing.list_price_gpl.toLocaleString()}`
                      : (lang === 'zh' ? '待询价' : 'Inquire')}
                  </td>
                ))}
              </tr>

              {/* Official Spec URL */}
              <tr>
                <td className="p-3 text-slate-400 font-medium">
                  {lang === 'zh' ? '官网数据凭据' : 'Official Spec'}
                </td>
                {comparedDevices.map((d) => (
                  <td key={d.id} className="p-3 border-l border-white/5">
                    <a
                      href={d.metadata.official_spec_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 text-[11px]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{lang === 'zh' ? '查看官方白皮书' : 'Datasheet'}</span>
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
