import React, { useState } from 'react';
import { X, Plus, Code, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { useBOMStore } from '../store/useBOMStore';
import { DeviceItem, DeviceItemSchema } from '../types/device';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ isOpen, onClose }) => {
  const { addCustomDevice } = useBOMStore();
  const [mode, setMode] = useState<'form' | 'json'>('form');

  // Form states
  const [brand, setBrand] = useState<'Huawei' | 'H3C' | 'Cisco' | 'Ruijie' | 'FS.com'>('Huawei');
  const [model, setModel] = useState('');
  const [series, setSeries] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [portsSummary, setPortsSummary] = useState('');
  const [formFactor, setFormFactor] = useState<'1U' | '2U' | 'Modular'>('1U');
  const [switchingGbps, setSwitchingGbps] = useState<number>(176);
  const [forwardingMpps, setForwardingMpps] = useState<number>(132);
  const [isPoe, setIsPoe] = useState(false);
  const [poeWatts, setPoeWatts] = useState<number>(380);
  const [gplPrice, setGplPrice] = useState<string>('');
  const [specUrl, setSpecUrl] = useState('');
  const [description, setDescription] = useState('');

  // JSON mode
  const [jsonInput, setJsonInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!model.trim() || !partNumber.trim() || !portsSummary.trim()) {
      setErrorMsg('请填写完整的型号、订货编码 (P/N) 与端口描述');
      return;
    }

    const deviceId = `custom-${brand.toLowerCase()}-${model.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
    const parsedGpl = gplPrice ? parseFloat(gplPrice) : null;

    const newDevice: DeviceItem = {
      id: deviceId,
      brand,
      series: series.trim() || `${brand} 系列`,
      model: model.trim(),
      part_number: partNumber.trim(),
      category: 'switch',
      lifecycle: 'active',
      description: description.trim() || `${model.trim()} 企业级以太网交换机，满足高效稳定网络承载。`,
      specs: {
        form_factor: formFactor,
        ports: {
          summary: portsSummary.trim(),
          downlink: portsSummary.trim(),
          downlink_count: 24,
          downlink_speed: '1G',
          uplink: '4 x 10GE SFP+',
          uplink_count: 4,
          uplink_speed: '10G',
        },
        switching_capacity_gbps: switchingGbps,
        forwarding_rate_mpps: forwardingMpps,
        poe: {
          supported: isPoe,
          budget_watts: isPoe ? poeWatts : undefined,
          standard: isPoe ? 'PoE+' : 'None',
        },
        layer: 'L2+',
        power_supply: {
          type: 'modular',
          slots: 2,
          default_included: 1,
          default_power_watts: 600,
          redundancy_supported: true,
        },
        airflow: 'front-to-back',
      },
      pricing: {
        currency: 'CNY',
        list_price_gpl: parsedGpl,
        cost_estimate: parsedGpl ? parsedGpl * 0.3 : null,
        discount_reference: 0.3,
        price_verified_at: new Date().toISOString().split('T')[0],
        source_quote_type: parsedGpl ? 'vendor_gpl' : 'none',
      },
      metadata: {
        official_spec_url: specUrl.trim() || 'https://bin0sky.tech',
        specs_verified_at: new Date().toISOString().split('T')[0],
        contributor: 'User Custom',
        tags: ['自定义录入', brand],
      },
    };

    try {
      DeviceItemSchema.parse(newDevice);
      addCustomDevice(newDevice);
      setSuccessMsg(`设备 ${newDevice.model} 录入成功并已持久化保存！`);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`数据校验失败: ${err.message || '请检查输入'}`);
    }
  };

  const handleJsonSubmit = () => {
    setErrorMsg(null);
    try {
      const parsed = JSON.parse(jsonInput);
      DeviceItemSchema.parse(parsed);
      addCustomDevice(parsed);
      setSuccessMsg(`JSON 规格验证通过，设备已收录！`);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(`JSON 解析失败: ${err.message || '格式不符合 DeviceItemSchema 规范'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl glass-panel-elevated rounded-3xl flex flex-col z-10 shadow-2xl overflow-hidden border border-white/15 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">录入新设备规格与报价</h2>
              <p className="text-[11px] text-slate-400">
                支持表单交互录入或直接粘贴标准 JSON，数据加密留存本地
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode(mode === 'form' ? 'json' : 'form')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel text-xs text-slate-300 hover:text-white"
            >
              {mode === 'form' ? (
                <>
                  <Code className="w-3.5 h-3.5 text-sky-400" />
                  <span>切换为 JSON 模式</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>切换为表单模式</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'form' ? (
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {/* Brand & Series */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 font-medium mb-1 block">设备品牌</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value as any)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-white font-medium"
                  >
                    <option value="Huawei">华为 (Huawei)</option>
                    <option value="H3C">新华三 (H3C)</option>
                    <option value="Cisco">思科 (Cisco)</option>
                    <option value="Ruijie">锐捷 (Ruijie)</option>
                    <option value="FS.com">飞速 (FS.com)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-medium mb-1 block">产品系列</label>
                  <input
                    type="text"
                    value={series}
                    onChange={(e) => setSeries(e.target.value)}
                    placeholder="如 CloudEngine S5735"
                    className="w-full glass-input rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Model & Part Number */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 font-medium mb-1 block">
                    产品型号 (Model) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="如 S6730-H48X6C"
                    required
                    className="w-full glass-input rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium mb-1 block">
                    订货号 / P/N 码 <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={partNumber}
                    onChange={(e) => setPartNumber(e.target.value)}
                    placeholder="如 02353DFV"
                    required
                    className="w-full glass-input rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              {/* Ports Summary */}
              <div>
                <label className="text-slate-400 font-medium mb-1 block">
                  端口规格概述 <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={portsSummary}
                  onChange={(e) => setPortsSummary(e.target.value)}
                  placeholder="如 48 x 10GE SFP+ + 6 x 100GE QSFP28"
                  required
                  className="w-full glass-input rounded-xl px-3 py-2 text-white font-medium"
                />
              </div>

              {/* Performance */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 font-medium mb-1 block">机箱高度</label>
                  <select
                    value={formFactor}
                    onChange={(e) => setFormFactor(e.target.value as any)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-white"
                  >
                    <option value="1U">1U</option>
                    <option value="2U">2U</option>
                    <option value="Modular">框式模块化</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-medium mb-1 block">交换容量 (Gbps)</label>
                  <input
                    type="number"
                    value={switchingGbps}
                    onChange={(e) => setSwitchingGbps(parseInt(e.target.value) || 0)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium mb-1 block">包转发率 (Mpps)</label>
                  <input
                    type="number"
                    value={forwardingMpps}
                    onChange={(e) => setForwardingMpps(parseInt(e.target.value) || 0)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              {/* PoE Settings */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPoe}
                    onChange={(e) => setIsPoe(e.target.checked)}
                    className="rounded bg-slate-900 text-sky-500 w-4 h-4"
                  />
                  <span className="text-slate-200 font-medium">支持 PoE / PoE+ 远程供电</span>
                </label>
                {isPoe && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">供电预算:</span>
                    <input
                      type="number"
                      value={poeWatts}
                      onChange={(e) => setPoeWatts(parseInt(e.target.value) || 0)}
                      className="w-24 glass-input rounded-lg px-2 py-1 font-mono text-amber-300 font-bold"
                    />
                    <span className="text-slate-400 font-mono">W</span>
                  </div>
                )}
              </div>

              {/* GPL & URL */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 font-medium mb-1 block">
                    官方目录指导面价 (GPL 元，选填)
                  </label>
                  <input
                    type="number"
                    value={gplPrice}
                    onChange={(e) => setGplPrice(e.target.value)}
                    placeholder="留空则标记为「待询价」"
                    className="w-full glass-input rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium mb-1 block">
                    官网白皮书 / 规格书 URL
                  </label>
                  <input
                    type="url"
                    value={specUrl}
                    onChange={(e) => setSpecUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full glass-input rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-slate-400 font-medium mb-1 block">简要说明</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="简述该机型应用场景与关键特性..."
                  className="w-full glass-input rounded-xl p-3 text-white"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 hover:brightness-110"
                >
                  保存并加入设备库
                </button>
              </div>
            </form>
          ) : (
            /* JSON Mode */
            <div className="space-y-4">
              <div className="text-[11px] text-slate-400">
                将符合 `DeviceItem` 接口的标准 JSON 直接粘贴至下方，点击验证并保存：
              </div>
              <textarea
                rows={12}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={`{\n  "id": "huawei-example",\n  "brand": "Huawei",\n  "series": "...",\n  "model": "...",\n  "part_number": "...",\n  "category": "switch",\n  "specs": { ... }\n}`}
                className="w-full glass-input rounded-2xl p-4 font-mono text-xs text-sky-200"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleJsonSubmit}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs"
                >
                  验证并解析导入
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
