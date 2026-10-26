import React, { useState } from 'react';
import {
  ExternalLink,
  Plus,
  Minus,
  Check,
  GitCompare,
  ChevronDown,
  ChevronUp,
  Edit3,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { DeviceItem } from '../types/device';
import { useBOMStore } from '../store/useBOMStore';

interface DeviceCardProps {
  device: DeviceItem;
  isTrash?: boolean;
  onEditDevice?: (device: DeviceItem) => void;
}

const CARD_BTN =
  'h-7 px-2.5 rounded-md bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-zinc-200 hover:text-white text-xs font-medium inline-flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap';

export const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  isTrash = false,
  onEditDevice,
}) => {
  const {
    items,
    addItem,
    toggleDiffDevice,
    diffDeviceIds,
    globalDiscountRate,
    deleteDevice,
    restoreDevice,
    permanentlyDeleteDevice,
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

  const isEol = device.lifecycle === 'eol';
  const gpl = device.pricing.list_price_gpl;
  const effectiveDiscount = device.pricing.discount_reference ?? globalDiscountRate;
  const unitPrice =
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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteDevice(device.id);
  };

  const handleRestore = (e: React.MouseEvent) => {
    e.stopPropagation();
    restoreDevice(device.id);
  };

  const handlePermanentDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`确定彻底删除设备「${device.model}」吗？删除后将无法还原。`)) {
      permanentlyDeleteDevice(device.id);
    }
  };

  return (
    <div
      className={`glass-panel rounded-xl p-3.5 transition-all duration-150 hover:border-white/20 ${
        isDiffSelected ? 'border-white/30 bg-white/[0.04]' : ''
      }`}
    >
      {/* Primary Compact Area (Brand, Model, Price) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="cursor-pointer select-none"
      >
        <div className="flex items-start justify-between gap-2.5">
          {/* Left: Brand + Model */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-medium bg-white/[0.05] text-zinc-300 border border-white/10">
                {device.brand}
              </span>
              <h3 className="text-sm font-bold text-zinc-100 tracking-tight truncate">
                {device.model}
              </h3>
              {isEol && (
                <span className="text-[11px] font-medium text-zinc-400 bg-white/[0.05] border border-white/10 px-1.5 py-0.5 rounded">
                  停产
                </span>
              )}
            </div>
            <div className="text-xs text-zinc-400 truncate mt-1">
              {device.specs.ports.summary}
            </div>
          </div>

          {/* Right: Unit Price & 指导价 */}
          <div className="text-right flex-shrink-0">
            {unitPrice !== null ? (
              <div>
                <div className="text-sm font-bold font-mono text-zinc-100">
                  ¥{unitPrice.toLocaleString()}
                </div>
                {gpl !== null && (
                  <div className="text-[11px] font-mono text-zinc-400">
                    指导价 ¥{gpl.toLocaleString()}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-xs font-medium text-zinc-400 bg-white/[0.05] px-2 py-0.5 rounded border border-white/10">
                待核价
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-white/5">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={CARD_BTN}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
              <span>收起</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              <span>详情</span>
            </>
          )}
        </button>

        {isTrash ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleRestore}
              className={CARD_BTN}
              title="还原到设备库"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
              <span>还原</span>
            </button>
            <button
              type="button"
              onClick={handlePermanentDelete}
              className={`${CARD_BTN} hover:text-rose-300`}
              title="从回收站彻底删除"
            >
              <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>彻底删除</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            {/* Quantity Selector */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center bg-white/[0.04] border border-white/10 rounded-md overflow-hidden h-7"
            >
              <button
                type="button"
                onClick={() => setAddQty((q) => Math.max(1, q - 1))}
                className="w-6 h-full flex items-center justify-center hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="number"
                min={1}
                value={addQty}
                onChange={(e) => setAddQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-7 text-center bg-transparent font-mono text-xs font-medium text-zinc-100 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setAddQty((q) => q + 1)}
                className="w-6 h-full flex items-center justify-center hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Add to BOM Button */}
            <button
              type="button"
              onClick={handleAddToBOM}
              className={`${CARD_BTN} ${
                isAdded ? 'bg-white/[0.12] border-white/25 text-white' : ''
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>已加{inBomQuantity > 0 ? ` (${inBomQuantity})` : ''}</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 text-zinc-400" />
                  <span>清单</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Collapsible Detailed Parameters Section */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-white/10 space-y-2.5 text-xs animate-in fade-in duration-150">
          {isEol && device.replacement_model && (
            <div className="p-2 rounded-md bg-white/[0.04] border border-white/10 text-xs text-zinc-300">
              替代型号：<strong className="text-white">{device.replacement_model}</strong>
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 bg-black/30 rounded-lg p-2.5 border border-white/5 text-xs">
            <div>
              <span className="text-zinc-500">编码:</span>{' '}
              <span className="font-mono text-zinc-200">{device.part_number}</span>
            </div>
            <div>
              <span className="text-zinc-500">形态:</span>{' '}
              <span className="text-zinc-200">
                {device.specs.layer} • {device.specs.form_factor}
              </span>
            </div>
            <div>
              <span className="text-zinc-500">容量:</span>{' '}
              <span className="font-mono text-zinc-200">
                {device.specs.switching_capacity_gbps} Gbps
              </span>
            </div>
            <div>
              <span className="text-zinc-500">转发:</span>{' '}
              <span className="font-mono text-zinc-200">
                {device.specs.forwarding_rate_mpps} Mpps
              </span>
            </div>
            <div>
              <span className="text-zinc-500">PoE:</span>{' '}
              {device.specs.poe.supported ? (
                <span className="text-zinc-200">{device.specs.poe.budget_watts}W</span>
              ) : (
                <span className="text-zinc-400">无</span>
              )}
            </div>
            <div>
              <span className="text-zinc-500">电源:</span>{' '}
              <span className="text-zinc-300">
                {device.specs.power_supply.type === 'modular'
                  ? `插槽x${device.specs.power_supply.slots}`
                  : '固定'}
              </span>
            </div>
          </div>

          {device.description && (
            <p className="text-xs text-zinc-400 leading-relaxed">
              {device.description}
            </p>
          )}

          {/* Secondary Utility Actions */}
          <div className="flex items-center justify-between gap-1.5 pt-1">
            <a
              href={device.metadata.official_spec_url}
              target="_blank"
              rel="noopener noreferrer"
              className={CARD_BTN}
            >
              <ExternalLink className="w-3 h-3 text-zinc-400" />
              <span>官网</span>
            </a>

            {!isTrash && (
              <div className="flex items-center gap-1.5">
                {onEditDevice && (
                  <button
                    type="button"
                    onClick={() => onEditDevice(device)}
                    className={CARD_BTN}
                  >
                    <Edit3 className="w-3 h-3 text-zinc-400" />
                    <span>编辑</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => toggleDiffDevice(device.id)}
                  className={`${CARD_BTN} ${
                    isDiffSelected ? 'bg-white/[0.12] border-white/25 text-white' : ''
                  }`}
                >
                  <GitCompare className="w-3 h-3 text-zinc-400" />
                  <span>对比</span>
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  className={CARD_BTN}
                  title="移入回收站"
                >
                  <Trash2 className="w-3 h-3 text-zinc-400" />
                  <span>删除</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
