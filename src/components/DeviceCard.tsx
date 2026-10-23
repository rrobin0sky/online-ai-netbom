import React, { useState } from 'react';
import {
  ExternalLink,
  Plus,
  Minus,
  Check,
  GitCompare,
  Zap,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Edit3,
} from 'lucide-react';
import { DeviceItem } from '../types/device';
import { useBOMStore } from '../store/useBOMStore';

interface DeviceCardProps {
  device: DeviceItem;
  onEditDevice?: (device: DeviceItem) => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ device, onEditDevice }) => {
  const {
    items,
    addItem,
    toggleDiffDevice,
    diffDeviceIds,
    globalDiscountRate,
  } = useBOMStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [addQty, setAddQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const isDiffSelected = diffDeviceIds.includes(device.id);

  // Total quantity of this device currently in BOM
  const inBomQuantity = items
    .filter((i) => i.device.id === device.id)
    .reduce((sum, i) => sum + i.quantity, 0);

  const isAdded = inBomQuantity > 0 || justAdded;

  const getBrandBadge = (brand: string) => {
    switch (brand) {
      case 'Huawei':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/25';
      case 'H3C':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/25';
      case 'Cisco':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25';
      case 'Ruijie':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      case 'FS.com':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/25';
    }
  };

  const isEol = device.lifecycle === 'eol';
  const gpl = device.pricing.list_price_gpl;
  const effectiveDiscount = device.pricing.discount_reference ?? globalDiscountRate;
  const estimatedPrice =
    device.pricing.cost_estimate !== null
      ? device.pricing.cost_estimate
      : gpl !== null
      ? Math.round(gpl * effectiveDiscount)
      : null;

  const handleAddToBOM = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultArea =
      device.specs.layer === 'DataCenter'
        ? '数据中心'
        : device.specs.layer === 'L3'
        ? '核心汇聚层'
        : '接入层';
    addItem(device, defaultArea, addQty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div
      className={`glass-panel rounded-xl p-4 transition-all duration-200 hover:border-sky-500/30 ${
        isEol ? 'border-rose-500/20 bg-rose-950/5' : ''
      } ${isDiffSelected ? 'ring-1 ring-amber-400/50 border-amber-400/40' : ''}`}
    >
      {/* Primary Compact Area (Always Visible: Brand, Model, Price) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="cursor-pointer select-none"
      >
        <div className="flex items-start justify-between gap-3">
          {/* Left: Brand + Model */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getBrandBadge(
                  device.brand
                )}`}
              >
                {device.brand}
              </span>
              <h3 className="text-sm font-bold text-white tracking-tight truncate">
                {device.model}
              </h3>
              {isEol && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">
                  <AlertTriangle className="w-2.5 h-2.5" /> 停产
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-1">
              {device.specs.ports.summary}
            </div>
          </div>

          {/* Right: Price */}
          <div className="text-right flex-shrink-0">
            {estimatedPrice !== null ? (
              <div>
                <div className="text-sm font-bold font-mono text-sky-400">
                  ¥{estimatedPrice.toLocaleString()}
                </div>
                {gpl !== null && (
                  <div className="text-[10px] font-mono text-slate-500">
                    面价 ¥{gpl.toLocaleString()}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-xs font-medium text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                待核价
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar: Expand Toggle + Quantity Stepper + Add to BOM */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-white/5">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white py-1 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
              <span>收起参数</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>详细参数</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-2">
          {/* Quantity Selector */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center glass-input rounded-lg overflow-hidden h-7"
          >
            <button
              type="button"
              onClick={() => setAddQty((q) => Math.max(1, q - 1))}
              className="px-2 h-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <input
              type="number"
              min={1}
              value={addQty}
              onChange={(e) => setAddQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-9 text-center bg-transparent font-mono text-xs font-bold text-white focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setAddQty((q) => q + 1)}
              className="px-2 h-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Add to BOM Button (Non-intrusive, turns into "已添加") */}
          <button
            type="button"
            onClick={handleAddToBOM}
            className={`flex items-center justify-center gap-1 px-3 h-7 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
              isAdded
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                : 'bg-sky-500/15 border border-sky-500/30 text-sky-300 hover:bg-sky-500 hover:text-white'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>已添加{inBomQuantity > 0 ? ` (${inBomQuantity})` : ''}</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>加到 BOM</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Detailed Parameters Section */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-white/10 space-y-2.5 text-xs animate-in fade-in duration-150">
          {isEol && device.replacement_model && (
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-200">
              替代型号：<strong className="text-white">{device.replacement_model}</strong>
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 bg-black/30 rounded-lg p-2.5 border border-white/5 text-[11px]">
            <div>
              <span className="text-slate-500">订货编码 P/N:</span>{' '}
              <span className="font-mono text-slate-200">{device.part_number}</span>
            </div>
            <div>
              <span className="text-slate-500">系列 / 形态:</span>{' '}
              <span className="text-slate-200">
                {device.specs.layer} • {device.specs.form_factor}
              </span>
            </div>
            <div>
              <span className="text-slate-500">交换容量:</span>{' '}
              <strong className="font-mono text-slate-200">
                {device.specs.switching_capacity_gbps} Gbps
              </strong>
            </div>
            <div>
              <span className="text-slate-500">包转发率:</span>{' '}
              <strong className="font-mono text-slate-200">
                {device.specs.forwarding_rate_mpps} Mpps
              </strong>
            </div>
            <div>
              <span className="text-slate-500">PoE 供电:</span>{' '}
              {device.specs.poe.supported ? (
                <span className="text-amber-300 font-semibold inline-flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5" /> {device.specs.poe.budget_watts}W
                </span>
              ) : (
                <span className="text-slate-400">不支持</span>
              )}
            </div>
            <div>
              <span className="text-slate-500">电源配置:</span>{' '}
              <span className="text-slate-300">
                {device.specs.power_supply.type === 'modular'
                  ? `插槽x${device.specs.power_supply.slots} (含${device.specs.power_supply.default_included})`
                  : '固定电源'}
              </span>
            </div>
          </div>

          {device.description && (
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {device.description}
            </p>
          )}

          {/* Secondary Utility Actions */}
          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
            <span className="font-mono">核验: {device.metadata.specs_verified_at}</span>

            <div className="flex items-center gap-2">
              <a
                href={device.metadata.official_spec_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sky-400 hover:text-sky-300 px-1.5 py-0.5 rounded hover:bg-white/5"
              >
                <ExternalLink className="w-3 h-3" />
                <span>官网</span>
              </a>

              {onEditDevice && (
                <button
                  type="button"
                  onClick={() => onEditDevice(device)}
                  className="flex items-center gap-1 text-slate-300 hover:text-white px-1.5 py-0.5 rounded hover:bg-white/5"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>编辑</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => toggleDiffDevice(device.id)}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
                  isDiffSelected
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <GitCompare className="w-3 h-3" />
                <span>对比</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
