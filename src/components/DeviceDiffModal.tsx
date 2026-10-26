import React from 'react';
import { X, GitCompare, ExternalLink, Plus } from 'lucide-react';
import { useBOMStore, getMergedCatalog } from '../store/useBOMStore';

interface DeviceDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BTN_UNIFIED =
  'h-8 px-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-zinc-200 hover:text-white text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap';

export const DeviceDiffModal: React.FC<DeviceDiffModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    diffDeviceIds,
    toggleDiffDevice,
    clearDiff,
    addItem,
    customDevices,
    deletedDeviceIds,
    purgedDeviceIds,
    brandRenames,
  } = useBOMStore();

  if (!isOpen || diffDeviceIds.length === 0) return null;

  const allDevices = getMergedCatalog(
    customDevices,
    deletedDeviceIds,
    brandRenames,
    purgedDeviceIds
  );
  const comparedDevices = allDevices.filter((d) =>
    diffDeviceIds.includes(d.id)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 sm:p-6">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      <div className="relative w-full max-w-6xl max-h-[90vh] glass-panel-elevated rounded-2xl flex flex-col z-10 shadow-2xl overflow-hidden border border-white/15">
        {/* Top Header */}
        <div className="px-5 py-3 bg-zinc-900/80 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <GitCompare className="w-4 h-4 text-zinc-300" />
            <h2 className="text-sm font-bold text-zinc-100">
              参数对比 ({comparedDevices.length})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={clearDiff} className={BTN_UNIFIED}>
              清空
            </button>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Comparison Matrix */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-5">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr>
                <th className="p-3 w-36 text-zinc-400 font-medium bg-white/[0.03] border-b border-white/10">
                  参数项
                </th>
                {comparedDevices.map((d) => (
                  <th
                    key={d.id}
                    className="p-3.5 min-w-[210px] bg-white/[0.02] border-l border-b border-white/10"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono text-[11px] text-zinc-400">
                        {d.brand}
                      </span>
                      <button
                        onClick={() => toggleDiffDevice(d.id)}
                        className="text-zinc-500 hover:text-zinc-200 p-0.5 transition-colors"
                        title="移除"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="text-sm font-bold text-zinc-100 tracking-tight">
                      {d.model}
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                      {d.part_number}
                    </div>

                    <button
                      onClick={() => addItem(d, '接入层')}
                      className="w-full mt-3 h-7 px-2.5 rounded-md bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-zinc-200 hover:text-white text-xs font-medium inline-flex items-center justify-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-zinc-400" />
                      <span>清单</span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              <tr>
                <td className="p-3 text-zinc-400 font-medium">形态</td>
                {comparedDevices.map((d) => (
                  <td key={d.id} className="p-3 text-zinc-200 border-l border-white/5 font-mono">
                    {d.specs.form_factor}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3 text-zinc-400 font-medium">层级</td>
                {comparedDevices.map((d) => (
                  <td key={d.id} className="p-3 text-zinc-200 border-l border-white/5">
                    {d.specs.layer}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3 text-zinc-400 font-medium">端口规格</td>
                {comparedDevices.map((d) => (
                  <td key={d.id} className="p-3 text-zinc-200 border-l border-white/5 leading-relaxed">
                    {d.specs.ports.summary}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3 text-zinc-400 font-medium">交换容量</td>
                {comparedDevices.map((d) => (
                  <td key={d.id} className="p-3 text-zinc-200 border-l border-white/5 font-mono">
                    {d.specs.switching_capacity_gbps} Gbps
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3 text-zinc-400 font-medium">包转发率</td>
                {comparedDevices.map((d) => (
                  <td key={d.id} className="p-3 text-zinc-200 border-l border-white/5 font-mono">
                    {d.specs.forwarding_rate_mpps} Mpps
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3 text-zinc-400 font-medium">PoE</td>
                {comparedDevices.map((d) => (
                  <td key={d.id} className="p-3 border-l border-white/5 text-zinc-200">
                    {d.specs.poe.supported
                      ? `${d.specs.poe.budget_watts}W (${d.specs.poe.standard})`
                      : '无'}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3 text-zinc-400 font-medium">电源</td>
                {comparedDevices.map((d) => (
                  <td key={d.id} className="p-3 text-zinc-300 border-l border-white/5">
                    {d.specs.power_supply.type === 'modular'
                      ? `插槽 x${d.specs.power_supply.slots} (含${d.specs.power_supply.default_included})`
                      : '固定电源'}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3 text-zinc-400 font-medium">指导价</td>
                {comparedDevices.map((d) => (
                  <td key={d.id} className="p-3 border-l border-white/5 font-mono font-bold text-zinc-100">
                    {d.pricing.list_price_gpl
                      ? `¥${d.pricing.list_price_gpl.toLocaleString()}`
                      : '待核价'}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-3 text-zinc-400 font-medium">官网</td>
                {comparedDevices.map((d) => (
                  <td key={d.id} className="p-3 border-l border-white/5">
                    <a
                      href={d.metadata.official_spec_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-zinc-300 hover:text-white text-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                      <span>规格书</span>
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
