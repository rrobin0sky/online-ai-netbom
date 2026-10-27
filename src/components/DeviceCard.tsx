import React, { useState, useMemo } from 'react';
import {
  ExternalLink,
  Plus,
  Minus,
  Check,
  Copy,
  GitCompare,
  ChevronDown,
  ChevronUp,
  Edit3,
  Trash2,
  RotateCcw,
  Lock,
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
    isCostUnlocked,
    setCostModalOpen,
  } = useBOMStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [addQty, setAddQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [copiedSpecs, setCopiedSpecs] = useState(false);

  const isDiffSelected = diffDeviceIds.includes(device.id);

  const keySpecsText = useMemo(() => {
    if (device.description?.trim()) {
      return device.description.trim();
    }
    const parts: string[] = [];
    if (device.specs.ports?.summary) parts.push(device.specs.ports.summary);
    if (device.specs.switching_capacity_gbps) {
      parts.push(`交换容量 ${device.specs.switching_capacity_gbps}Gbps`);
    }
    if (device.specs.forwarding_rate_mpps) {
      parts.push(`包转发率 ${device.specs.forwarding_rate_mpps}Mpps`);
    }
    if (device.specs.poe?.supported) {
      parts.push(`PoE+ (${device.specs.poe.budget_watts || 370}W)`);
    }
    if (device.specs.power_supply) {
      const ps = device.specs.power_supply;
      const psType =
        ps.type === 'modular'
          ? `模块化电源(插槽×${ps.slots})`
          : ps.type === 'fixed'
          ? '内置固定电源'
          : '外置电源';
      parts.push(ps.redundancy_supported ? `${psType} 支持双冗余` : psType);
    }
    return parts.join(' | ');
  }, [device]);

  const handleCopySpecs = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(keySpecsText);
    setCopiedSpecs(true);
    setTimeout(() => setCopiedSpecs(false), 2000);
  };

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
      device.specs.layer === 'DataCenter' ||
      device.specs.layer === 'Server' ||
      device.specs.layer === 'Storage'
        ? '服务器机房'
        : device.specs.layer === 'Security'
        ? '安全出口区'
        : device.specs.layer === 'Software'
        ? '系统与软件'
        : device.specs.layer === 'Peripherals'
        ? '办公外设与辅材'
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
            {gpl !== null ? (
              <div className="text-xs font-mono text-zinc-200 font-semibold">
                指导价 ¥{gpl.toLocaleString()}
              </div>
            ) : (
              <div className="text-xs text-zinc-500 font-mono">暂无指导价</div>
            )}

            {isCostUnlocked ? (
              unitPrice !== null ? (
                <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                  成本 ¥{unitPrice.toLocaleString()}
                </div>
              ) : (
                <span className="text-[11px] font-medium text-zinc-400 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/10 mt-0.5 inline-block">
                  待核价
                </span>
              )
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCostModalOpen(true);
                }}
                className="mt-1 text-[10px] font-medium text-zinc-400 hover:text-zinc-200 bg-white/[0.04] hover:bg-white/[0.08] px-1.5 py-0.5 rounded border border-white/10 inline-flex items-center gap-1 transition-colors cursor-pointer"
                title="输入口令查看内部成本价"
              >
                <Lock className="w-2.5 h-2.5 text-zinc-500" />
                <span>成本锁定</span>
              </button>
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
            {device.specs.switching_capacity_gbps > 0 || device.specs.forwarding_rate_mpps > 0 ? (
              <>
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
              </>
            ) : (
              <>
                <div className="col-span-2 truncate">
                  <span className="text-zinc-500">接口/规格:</span>{' '}
                  <span className="text-zinc-200">{device.specs.ports.summary || '标准配置'}</span>
                </div>
              </>
            )}
            <div>
              <span className="text-zinc-500">供电:</span>{' '}
              {device.specs.poe.supported ? (
                <span className="text-zinc-200">PoE ({device.specs.poe.budget_watts}W)</span>
              ) : (
                <span className="text-zinc-400">
                  {device.specs.power_supply.type === 'modular'
                    ? `插槽x${device.specs.power_supply.slots}`
                    : '固定/内置'}
                </span>
              )}
            </div>
            <div>
              <span className="text-zinc-500">系列:</span>{' '}
              <span className="text-zinc-300">{device.series || device.brand}</span>
            </div>
          </div>

          {/* Key Technical Specification Description */}
          <div className="rounded-lg p-2.5 bg-white/[0.03] border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
              <span className="text-zinc-300 font-semibold">关键技术规格描述</span>
              <button
                type="button"
                onClick={handleCopySpecs}
                className="text-[11px] text-zinc-400 hover:text-white inline-flex items-center gap-1 transition-colors cursor-pointer"
                title="复制关键技术规格描述"
              >
                {copiedSpecs ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">已复制</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>复制</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-zinc-200 leading-relaxed font-sans select-text">
              {keySpecsText}
            </p>
          </div>

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
