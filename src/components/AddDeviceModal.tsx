import React, { useState, useEffect } from 'react';
import { X, Plus, Code, CheckCircle, AlertCircle, FileText, Search, Loader2, Edit3 } from 'lucide-react';
import { useBOMStore, DEFAULT_BRANDS } from '../store/useBOMStore';
import { useAIStore } from '../store/useAIStore';
import { DeviceItem, DeviceItemSchema } from '../types/device';
import { lookupSingleDeviceSpecsWithAI } from '../utils/ai-service';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingDevice?: DeviceItem | null;
}

export const AddDeviceModal: React.FC<AddDeviceModalProps> = ({
  isOpen,
  onClose,
  editingDevice,
}) => {
  const { addCustomDevice, brands } = useBOMStore();
  const aiSettings = useAIStore();
  const [mode, setMode] = useState<'form' | 'json'>('form');

  const activeBrands = brands?.length ? brands : DEFAULT_BRANDS;

  // Form states
  const [brand, setBrand] = useState<string>(activeBrands[0] || 'Huawei');
  const [model, setModel] = useState('');
  const [series, setSeries] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [portsSummary, setPortsSummary] = useState('');
  const [formFactor, setFormFactor] = useState<'1U' | '2U' | 'Modular'>('1U');
  const [layer, setLayer] = useState<'L2' | 'L2+' | 'L3' | 'DataCenter'>('L2+');
  const [switchingGbps, setSwitchingGbps] = useState<number>(176);
  const [forwardingMpps, setForwardingMpps] = useState<number>(132);
  const [isPoe, setIsPoe] = useState(false);
  const [poeWatts, setPoeWatts] = useState<number>(380);
  const [gplPrice, setGplPrice] = useState<string>('');
  const [costPrice, setCostPrice] = useState<string>('');
  const [specUrl, setSpecUrl] = useState('');
  const [description, setDescription] = useState('');

  // JSON mode
  const [jsonInput, setJsonInput] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (editingDevice) {
      setBrand(editingDevice.brand);
      setModel(editingDevice.model);
      setSeries(editingDevice.series);
      setPartNumber(editingDevice.part_number);
      setPortsSummary(editingDevice.specs.ports.summary);
      setFormFactor((editingDevice.specs.form_factor as any) || '1U');
      setLayer((editingDevice.specs.layer as any) || 'L2+');
      setSwitchingGbps(editingDevice.specs.switching_capacity_gbps);
      setForwardingMpps(editingDevice.specs.forwarding_rate_mpps);
      setIsPoe(editingDevice.specs.poe.supported);
      setPoeWatts(editingDevice.specs.poe.budget_watts || 380);
      setGplPrice(
        editingDevice.pricing.list_price_gpl !== null
          ? String(editingDevice.pricing.list_price_gpl)
          : ''
      );
      setCostPrice(
        editingDevice.pricing.cost_estimate !== null
          ? String(editingDevice.pricing.cost_estimate)
          : ''
      );
      setSpecUrl(editingDevice.metadata.official_spec_url);
      setDescription(editingDevice.description);
      setJsonInput(JSON.stringify(editingDevice, null, 2));
    } else {
      setBrand(activeBrands[0] || 'Huawei');
      setModel('');
      setSeries('');
      setPartNumber('');
      setPortsSummary('');
      setFormFactor('1U');
      setLayer('L2+');
      setSwitchingGbps(176);
      setForwardingMpps(132);
      setIsPoe(false);
      setPoeWatts(380);
      setGplPrice('');
      setCostPrice('');
      setSpecUrl('');
      setDescription('');
      setJsonInput('');
    }
  }, [editingDevice, isOpen]);

  if (!isOpen) return null;

  const handleAILookup = async () => {
    if (!model.trim()) {
      setErrorMsg('请先输入设备型号（如 S5735-L24T4X-A1），再点击联网检索');
      return;
    }
    if (!aiSettings.apiKey.trim()) {
      setErrorMsg('请先在「导入 / 录入 -> AI 设置」中配置 API Key');
      return;
    }

    setLookingUp(true);
    setErrorMsg(null);
    try {
      const info = await lookupSingleDeviceSpecsWithAI(brand, model, aiSettings);
      if (info.series) setSeries(info.series);
      if (info.part_number) setPartNumber(info.part_number);
      if (info.ports_summary) setPortsSummary(info.ports_summary);
      if (info.switching_capacity_gbps) setSwitchingGbps(info.switching_capacity_gbps);
      if (info.forwarding_rate_mpps) setForwardingMpps(info.forwarding_rate_mpps);
      if (info.poe_supported !== undefined) setIsPoe(info.poe_supported);
      if (info.poe_budget_watts) setPoeWatts(info.poe_budget_watts);
      if (info.list_price_gpl) setGplPrice(String(info.list_price_gpl));
      if (info.official_spec_url) setSpecUrl(info.official_spec_url);
      if (info.description) setDescription(info.description);
      setSuccessMsg('已从官网白皮书知识库补全参数，请核对后保存');
    } catch (err: any) {
      setErrorMsg(`检索失败: ${err.message}`);
    } finally {
      setLookingUp(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!brand.trim() || !model.trim() || !partNumber.trim() || !portsSummary.trim()) {
      setErrorMsg('请填写完整的品牌、型号、订货编码 (P/N) 与端口描述');
      return;
    }

    const cleanBrand = brand.trim();
    const deviceId =
      editingDevice?.id ||
      `custom-${cleanBrand.toLowerCase()}-${model.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const parsedGpl = gplPrice ? parseFloat(gplPrice) : null;
    const parsedCost = costPrice ? parseFloat(costPrice) : parsedGpl ? Math.round(parsedGpl * 0.3) : null;
    const today = new Date().toISOString().split('T')[0];

    const newDevice: DeviceItem = {
      id: deviceId,
      brand: cleanBrand,
      series: series.trim() || `${cleanBrand} 系列`,
      model: model.trim(),
      part_number: partNumber.trim(),
      category: editingDevice?.category || 'switch',
      lifecycle: editingDevice?.lifecycle || 'active',
      replacement_model: editingDevice?.replacement_model || null,
      description:
        description.trim() || `${model.trim()} 企业级网络设备`,
      specs: {
        form_factor: formFactor,
        ports: {
          summary: portsSummary.trim(),
          downlink: portsSummary.trim(),
          downlink_count: editingDevice?.specs.ports.downlink_count || 24,
          downlink_speed: editingDevice?.specs.ports.downlink_speed || '1G',
          uplink: editingDevice?.specs.ports.uplink || '4 x 10GE SFP+',
          uplink_count: editingDevice?.specs.ports.uplink_count || 4,
          uplink_speed: editingDevice?.specs.ports.uplink_speed || '10G',
        },
        switching_capacity_gbps: switchingGbps,
        forwarding_rate_mpps: forwardingMpps,
        poe: {
          supported: isPoe,
          budget_watts: isPoe ? poeWatts : undefined,
          standard: isPoe ? 'PoE+' : 'None',
        },
        layer,
        power_supply: editingDevice?.specs.power_supply || {
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
        cost_estimate: parsedCost,
        discount_reference:
          parsedGpl && parsedCost ? Number((parsedCost / parsedGpl).toFixed(2)) : 0.3,
        price_verified_at: today,
        source_quote_type: parsedGpl ? 'vendor_gpl' : 'none',
      },
      metadata: {
        official_spec_url: specUrl.trim() || 'https://e.huawei.com',
        specs_verified_at: today,
        contributor: 'User',
        tags: editingDevice?.metadata.tags || [cleanBrand, layer],
        compatible_accessories: editingDevice?.metadata.compatible_accessories,
      },
    };

    try {
      DeviceItemSchema.parse(newDevice);
      addCustomDevice(newDevice);
      onClose();
    } catch (err: any) {
      setErrorMsg(`数据校验失败: ${err.message || '请检查输入'}`);
    }
  };

  const handleJsonSubmit = () => {
    setErrorMsg(null);
    try {
      const parsed = JSON.parse(jsonInput);
      DeviceItemSchema.parse(parsed);
      addCustomDevice(parsed);
      onClose();
    } catch (err: any) {
      setErrorMsg(`JSON 解析失败: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-md" />

      <div className="relative w-full max-w-2xl glass-panel-elevated rounded-2xl flex flex-col z-10 shadow-2xl overflow-hidden border border-white/15">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            {editingDevice ? (
              <Edit3 className="w-4 h-4 text-zinc-300" />
            ) : (
              <Plus className="w-4 h-4 text-zinc-300" />
            )}
            <h2 className="text-sm font-bold text-zinc-100">
              {editingDevice ? `编辑设备: ${editingDevice.model}` : '录入新设备'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode(mode === 'form' ? 'json' : 'form')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-panel border border-white/10 text-xs text-zinc-300 hover:text-white"
            >
              {mode === 'form' ? (
                <>
                  <Code className="w-3.5 h-3.5 text-zinc-400" />
                  <span>JSON</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5 text-zinc-400" />
                  <span>表单</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 max-h-[78vh] overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/15 text-zinc-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-zinc-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-white/10 border border-white/20 text-zinc-100 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'form' ? (
            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-medium mb-1 block">
                    设备品牌（可选或直接输入新品牌）
                  </label>
                  <input
                    type="text"
                    list="netbom-brand-options"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="选择或输入品牌..."
                    className="w-full glass-input rounded-xl px-3 py-2 text-zinc-100 font-medium"
                  />
                  <datalist id="netbom-brand-options">
                    {activeBrands.map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="text-zinc-400 font-medium mb-1 block">产品系列</label>
                  <input
                    type="text"
                    value={series}
                    onChange={(e) => setSeries(e.target.value)}
                    placeholder="如 CloudEngine S5735"
                    className="w-full glass-input rounded-xl px-3 py-2 text-zinc-100"
                  />
                </div>
              </div>

              {/* Model (with AI Lookup button) & Part Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-medium mb-1 block">
                    产品型号 <span className="text-zinc-300">*</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="如 S6730-H48X6C"
                      required
                      className="w-full glass-input rounded-xl px-3 py-2 text-zinc-100 font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleAILookup}
                      disabled={lookingUp}
                      title="AI 自动检索官网参数"
                      className="px-2.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-zinc-100 flex items-center gap-1 whitespace-nowrap font-medium"
                    >
                      {lookingUp ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Search className="w-3.5 h-3.5" />
                      )}
                      <span>查官网</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-zinc-400 font-medium mb-1 block">
                    订货编码 (P/N) <span className="text-zinc-300">*</span>
                  </label>
                  <input
                    type="text"
                    value={partNumber}
                    onChange={(e) => setPartNumber(e.target.value)}
                    placeholder="如 02353DFV"
                    required
                    className="w-full glass-input rounded-xl px-3 py-2 text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 font-medium mb-1 block">
                  端口配置参数 <span className="text-zinc-300">*</span>
                </label>
                <input
                  type="text"
                  value={portsSummary}
                  onChange={(e) => setPortsSummary(e.target.value)}
                  placeholder="如 48 x 10/100/1000Base-T (PoE+) + 4 x 10GE SFP+"
                  required
                  className="w-full glass-input rounded-xl px-3 py-2 text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="text-zinc-400 font-medium mb-1 block">形态</label>
                  <select
                    value={formFactor}
                    onChange={(e) => setFormFactor(e.target.value as any)}
                    className="w-full glass-input rounded-xl px-2.5 py-2 text-zinc-100"
                  >
                    <option value="1U">1U</option>
                    <option value="2U">2U</option>
                    <option value="Modular">框式</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-400 font-medium mb-1 block">层级</label>
                  <select
                    value={layer}
                    onChange={(e) => setLayer(e.target.value as any)}
                    className="w-full glass-input rounded-xl px-2.5 py-2 text-zinc-100"
                  >
                    <option value="L2">L2</option>
                    <option value="L2+">L2+</option>
                    <option value="L3">L3</option>
                    <option value="DataCenter">DC</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-400 font-medium mb-1 block">容量 (Gbps)</label>
                  <input
                    type="number"
                    value={switchingGbps}
                    onChange={(e) => setSwitchingGbps(parseFloat(e.target.value) || 0)}
                    className="w-full glass-input rounded-xl px-2.5 py-2 text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-medium mb-1 block">转发 (Mpps)</label>
                  <input
                    type="number"
                    value={forwardingMpps}
                    onChange={(e) => setForwardingMpps(parseFloat(e.target.value) || 0)}
                    className="w-full glass-input rounded-xl px-2.5 py-2 text-zinc-100 font-mono"
                  />
                </div>
              </div>

              {/* PoE */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPoe}
                    onChange={(e) => setIsPoe(e.target.checked)}
                    className="rounded bg-zinc-900 w-4 h-4 accent-zinc-200"
                  />
                  <span className="text-zinc-200 font-medium">支持 PoE 供电</span>
                </label>
                {isPoe && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-400">功率预算:</span>
                    <input
                      type="number"
                      value={poeWatts}
                      onChange={(e) => setPoeWatts(parseInt(e.target.value) || 0)}
                      className="w-20 glass-input rounded-lg px-2 py-1 font-mono text-zinc-100 font-bold"
                    />
                    <span className="text-zinc-400 font-mono">W</span>
                  </div>
                )}
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-medium mb-1 block">指导价 (元)</label>
                  <input
                    type="number"
                    value={gplPrice}
                    onChange={(e) => setGplPrice(e.target.value)}
                    placeholder="选填厂商指导价"
                    className="w-full glass-input rounded-xl px-3 py-2 text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-medium mb-1 block">单价 (元)</label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="实际报价单价"
                    className="w-full glass-input rounded-xl px-3 py-2 text-zinc-100 font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-zinc-400 font-medium block">
                    关键技术规格描述 (用于卡片详情与报价单)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const auto = `${portsSummary || '标准接口'} | 交换容量 ${switchingGbps}Gbps | 包转发率 ${forwardingMpps}Mpps${isPoe ? ` | PoE ${poeWatts}W` : ''}`;
                      setDescription(auto);
                    }}
                    className="text-[11px] text-zinc-400 hover:text-white cursor-pointer"
                  >
                    根据参数生成
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="如: 24×10/100/1000Base-T, 4×10GE SFP+ | 交换容量 336Gbps | 包转发率 126Mpps"
                  className="w-full glass-input rounded-xl px-3 py-2 text-zinc-100 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-medium mb-1 block">官网链接 URL</label>
                <input
                  type="url"
                  value={specUrl}
                  onChange={(e) => setSpecUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full glass-input rounded-xl px-3 py-2 text-zinc-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-8 px-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-xs font-medium text-zinc-300 hover:text-white"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-zinc-100 hover:text-white font-medium text-xs"
                >
                  保存
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <textarea
                rows={12}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="w-full glass-input rounded-xl p-3 font-mono text-xs text-zinc-200"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-8 px-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-xs font-medium text-zinc-300 hover:text-white"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleJsonSubmit}
                  className="h-8 px-4 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-zinc-100 hover:text-white font-medium text-xs"
                >
                  保存
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
