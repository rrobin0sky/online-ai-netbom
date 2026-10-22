import React, { useState } from 'react';
import {
  ExternalLink,
  Plus,
  GitCompare,
  Zap,
  Server,
  Layers,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { DeviceItem } from '../types/device';
import { useBOMStore } from '../store/useBOMStore';

interface DeviceCardProps {
  device: DeviceItem;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ device }) => {
  const {
    addItem,
    toggleDiffDevice,
    diffDeviceIds,
    globalDiscountRate,
  } = useBOMStore();

  const [selectedArea, setSelectedArea] = useState('接入层');

  const isDiffSelected = diffDeviceIds.includes(device.id);

  // Brand Badge Style
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

  // Price calculations
  const gpl = device.pricing.list_price_gpl;
  const effectiveDiscount = device.pricing.discount_reference ?? globalDiscountRate;
  const estimatedCost = gpl !== null ? gpl * effectiveDiscount : null;

  return (
    <div
      className={`glass-panel rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:border-sky-500/30 hover:shadow-xl hover:shadow-sky-500/5 ${
        isEol ? 'border-rose-500/20 bg-rose-950/5' : ''
      } ${isDiffSelected ? 'ring-2 ring-amber-400/40 border-amber-400/30' : ''}`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getBrandBadge(
                device.brand
              )}`}
            >
              {device.brand}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {device.series}
            </span>
            {isEol ? (
              <span className="flex items-center gap-1 text-[10px] font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                <AlertTriangle className="w-2.5 h-2.5" /> 已停产退市
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-2.5 h-2.5" /> 现役在售
              </span>
            )}
          </div>

          {/* Form Factor Tag */}
          <span className="text-[11px] font-mono font-medium text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
            {device.specs.form_factor}
          </span>
        </div>

        {/* Model & Part Number */}
        <div className="mb-3">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            {device.model}
          </h3>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
            <span>P/N: <strong className="text-slate-200">{device.part_number}</strong></span>
            <span>•</span>
            <span className="text-sky-400/90 font-sans">{device.specs.layer} 层级</span>
          </div>
        </div>

        {/* Description / EOL Warning */}
        {isEol && device.replacement_model ? (
          <div className="p-2.5 mb-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-200">
            ⚠️ 厂商已停产，招投标请采用推荐替代型号：
            <strong className="text-white ml-1 underline">{device.replacement_model}</strong>
          </div>
        ) : (
          <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {device.description}
          </p>
        )}

        {/* Technical Specs Matrix */}
        <div className="rounded-xl bg-black/30 border border-white/5 p-3 space-y-2 mb-4 text-xs">
          {/* Ports */}
          <div className="flex items-start gap-2">
            <Server className="w-3.5 h-3.5 text-sky-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase text-slate-500 font-mono">端口矩阵 (Ports)</div>
              <div className="text-slate-200 font-medium truncate" title={device.specs.ports.summary}>
                {device.specs.ports.summary}
              </div>
            </div>
          </div>

          {/* Performance & PoE */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5 text-[11px]">
            <div>
              <span className="text-slate-500">交换容量:</span>{' '}
              <strong className="text-slate-200 font-mono">
                {device.specs.switching_capacity_gbps} Gbps
              </strong>
            </div>
            <div>
              <span className="text-slate-500">包转发率:</span>{' '}
              <strong className="text-slate-200 font-mono">
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
                <span className="text-slate-500">不支持</span>
              )}
            </div>
            <div>
              <span className="text-slate-500">电源配置:</span>{' '}
              <span className="text-slate-300">
                {device.specs.power_supply.type === 'modular'
                  ? `模块插槽 x${device.specs.power_supply.slots}`
                  : '固定电源'}
                {device.specs.power_supply.redundancy_supported && ' (双电冗余)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Pricing & Actions */}
      <div className="pt-2 border-t border-white/10 space-y-3">
        {/* Pricing Info */}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[10px] text-slate-500">
              官方目录指导价 (GPL)
            </div>
            {gpl !== null ? (
              <div className="text-lg font-bold font-mono text-white tracking-tight">
                ¥{gpl.toLocaleString()}
                <span className="text-xs font-normal text-slate-400 ml-1.5 font-sans">
                  (参考折后 ~¥{estimatedCost?.toLocaleString()})
                </span>
              </div>
            ) : (
              <div className="text-sm font-medium text-amber-400 flex items-center gap-1">
                待渠道核价 (TBD)
              </div>
            )}
          </div>

          {/* Official Spec Sheet Link */}
          <a
            href={device.metadata.official_spec_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 transition-colors p-1"
            title="查看厂商官网白皮书规范"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">官网白皮书</span>
          </a>
        </div>

        {/* Verification Timestamp */}
        <div className="text-[10px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-500" />
            规格核验: {device.metadata.specs_verified_at}
          </span>
          {device.pricing.price_verified_at && (
            <span>报价有效性: {device.pricing.price_verified_at}</span>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2 pt-1">
          {/* Target Network Layer / Zone Selector */}
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="glass-input rounded-xl px-2.5 py-2 text-xs text-slate-300 font-medium"
          >
            <option value="核心层">核心层</option>
            <option value="汇聚层">汇聚层</option>
            <option value="接入层">接入层</option>
            <option value="外联安全区">外联安全区</option>
            <option value="机房服务器区">机房服务器区</option>
          </select>

          {/* Add to BOM Button */}
          <button
            onClick={() => addItem(device, selectedArea)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 hover:bg-sky-500 hover:text-white text-xs font-semibold transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>加到 BOM</span>
          </button>

          {/* Add to Compare */}
          <button
            onClick={() => toggleDiffDevice(device.id)}
            className={`p-2 rounded-xl border transition-all ${
              isDiffSelected
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'glass-input text-slate-400 hover:text-white'
            }`}
            title="加入横向对比"
          >
            <GitCompare className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
