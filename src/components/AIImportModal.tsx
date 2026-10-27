import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Loader2,
  Check,
  Search,
  Trash2,
  Plus,
  Settings,
  AlertCircle,
  FileText,
  Repeat,
  Radio,
  Wrench,
  Layers,
} from 'lucide-react';
import { useAIStore } from '../store/useAIStore';
import { useBOMStore, DEFAULT_BRANDS } from '../store/useBOMStore';
import {
  ParsedQuoteItem,
  QuoteItemType,
  parseUploadedFileToText,
  analyzeQuoteWithAI,
  convertParsedToDeviceItem,
  convertParsedToEngineeringItem,
  lookupSingleDeviceSpecsWithAI,
} from '../utils/ai-service';

interface AIImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAISettings: () => void;
}

export const AIImportModal: React.FC<AIImportModalProps> = ({
  isOpen,
  onClose,
  onOpenAISettings,
}) => {
  const aiSettings = useAIStore();
  const { addCustomDevice, addItem, addCustomService, addServiceItem, brands } = useBOMStore();
  const activeBrands = brands?.length ? brands : DEFAULT_BRANDS;

  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [lookingUpId, setLookingUpId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parsedItems, setParsedItems] = useState<ParsedQuoteItem[]>([]);
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'device' | 'service'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingFile(true);
    setErrorMsg(null);
    setFileName(file.name);
    try {
      const extracted = await parseUploadedFileToText(file);
      setRawText(extracted);
    } catch (err: any) {
      setErrorMsg(`文件读取失败: ${err.message || '请检查文件格式'}`);
    } finally {
      setLoadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!rawText.trim()) {
      setErrorMsg('请先上传报价单文件或在文本框中粘贴清单内容');
      return;
    }
    if (!aiSettings.apiKey.trim()) {
      setErrorMsg('尚未配置 AI API Key，请点击右上角「AI 设置」填入 Key');
      return;
    }

    setAnalyzing(true);
    setErrorMsg(null);
    try {
      const items = await analyzeQuoteWithAI(rawText, aiSettings);
      setParsedItems(items);
    } catch (err: any) {
      setErrorMsg(err.message || 'AI 解析失败，请检查网络或 API 设置');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSingleLookup = async (row: ParsedQuoteItem) => {
    if (!row.model.trim()) return;
    if (!aiSettings.apiKey.trim()) {
      setErrorMsg('请先点击右上角「AI 设置」配置 API Key');
      return;
    }
    setLookingUpId(row.tempId);
    setErrorMsg(null);
    try {
      const completed = await lookupSingleDeviceSpecsWithAI(row.brand, row.model, aiSettings);
      setParsedItems((prev) =>
        prev.map((item) =>
          item.tempId === row.tempId
            ? {
                ...item,
                ...completed,
                tempId: item.tempId,
                selected: item.selected,
                quoted_unit_price: item.quoted_unit_price ?? completed.quoted_unit_price ?? null,
                quantity: item.quantity || 1,
                ai_completed: true,
              }
            : item
        )
      );
    } catch (err: any) {
      setErrorMsg(`官网参数检索失败: ${err.message}`);
    } finally {
      setLookingUpId(null);
    }
  };

  const updateRow = <K extends keyof ParsedQuoteItem>(
    tempId: string,
    field: K,
    value: ParsedQuoteItem[K]
  ) => {
    setParsedItems((prev) =>
      prev.map((item) => (item.tempId === tempId ? { ...item, [field]: value } : item))
    );
  };

  const toggleItemType = (tempId: string) => {
    setParsedItems((prev) =>
      prev.map((item) => {
        if (item.tempId !== tempId) return item;
        const nextType: QuoteItemType = item.item_type === 'device' ? 'service' : 'device';
        return {
          ...item,
          item_type: nextType,
          service_category: item.service_category || '弱电材料',
          unit: item.unit || (nextType === 'service' ? '项' : '台'),
        };
      })
    );
  };

  const addEmptyRow = (type: QuoteItemType = 'device') => {
    setParsedItems((prev) => [
      ...prev,
      {
        tempId: `manual-${Date.now()}`,
        selected: true,
        item_type: type,
        brand: type === 'device' ? (activeBrands[0] || 'Huawei') : '综合弱电',
        series: type === 'device' ? '接入层系列' : '弱电材料',
        model: type === 'device' ? '' : '六类非屏蔽网线 (305米/箱)',
        name: type === 'device' ? '网络交换机' : '六类非屏蔽网线',
        part_number: '-',
        category: 'switch',
        form_factor: '1U',
        layer: 'L2+',
        ports_summary: type === 'device' ? '24 x 10/100/1000Base-T + 4 x 10GE SFP+' : '标准弱电材料规范',
        downlink_speed: '1G',
        uplink_speed: '10G',
        switching_capacity_gbps: 176,
        forwarding_rate_mpps: 132,
        poe_supported: false,
        poe_budget_watts: 0,
        power_type: 'fixed',
        power_slots: 1,
        default_included_power: 1,
        redundancy_supported: false,
        list_price_gpl: null,
        quoted_unit_price: null,
        quantity: 1,
        area_group: type === 'device' ? '接入层' : '综合布线区',
        official_spec_url: 'https://e.huawei.com',
        description: '',
        ai_completed: false,
        service_category: '弱电材料',
        unit: type === 'device' ? '台' : '箱',
        pricing_mode: 'fixed',
        tax_rate: 0.13,
      },
    ]);
  };

  const handleImport = (alsoAddToBOM: boolean) => {
    const selectedRows = parsedItems.filter(
      (i) => i.selected && ((i.model && i.model.trim()) || (i.name && i.name.trim()))
    );
    if (selectedRows.length === 0) {
      setErrorMsg('请至少勾选一款产品或弱电服务项');
      return;
    }

    selectedRows.forEach((row) => {
      if (row.item_type === 'service') {
        const engItem = convertParsedToEngineeringItem(row);
        addCustomService(engItem);
        if (alsoAddToBOM) {
          addServiceItem(engItem, row.quantity || 1);
        }
      } else {
        const deviceItem = convertParsedToDeviceItem(row);
        addCustomDevice(deviceItem);
        if (alsoAddToBOM) {
          addItem(deviceItem, row.area_group || '接入层', row.quantity || 1, row.quoted_unit_price);
        }
      }
    });

    onClose();
  };

  const deviceCount = parsedItems.filter((i) => i.item_type === 'device').length;
  const serviceCount = parsedItems.filter((i) => i.item_type === 'service').length;

  const displayedItems = parsedItems.filter((item) => {
    if (activeFilterTab === 'device') return item.item_type === 'device';
    if (activeFilterTab === 'service') return item.item_type === 'service';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-3 sm:p-6">
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-md" />

      <div className="relative w-full max-w-6xl max-h-[92vh] glass-panel-elevated rounded-2xl flex flex-col z-10 shadow-2xl border border-white/15 overflow-hidden bg-zinc-950/95">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between gap-4 bg-zinc-900/80">
          <div className="flex items-center gap-2.5">
            <Upload className="w-4 h-4 text-zinc-300" />
            <h2 className="text-sm font-bold text-zinc-100">
              智能清单识别与导入 (网络硬件 + 弱电材料/工程)
            </h2>
            <span className="text-[11px] font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
              {aiSettings.model || '未配置模型'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAISettings}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-xs text-zinc-300 hover:text-white transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-zinc-400" />
              <span>AI 设置</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/15 text-zinc-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span>{errorMsg}</span>
              </div>
              {!aiSettings.apiKey && (
                <button
                  onClick={onOpenAISettings}
                  className="h-7 px-2.5 rounded-md bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-zinc-100 text-xs font-medium whitespace-nowrap"
                >
                  设置 API Key
                </button>
              )}
            </div>
          )}

          {/* Upload & Paste Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* File Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="glass-panel rounded-xl p-4 border-dashed border-2 border-white/15 hover:border-white/30 cursor-pointer flex flex-col items-center justify-center text-center transition-all min-h-[130px]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.csv,.pdf,.txt,.md,.json"
                onChange={handleFileChange}
                className="hidden"
              />
              {loadingFile ? (
                <Loader2 className="w-6 h-6 text-zinc-300 animate-spin mb-2" />
              ) : (
                <Upload className="w-6 h-6 text-zinc-400 mb-2" />
              )}
              <div className="font-semibold text-zinc-200">
                {fileName ? `已加载: ${fileName}` : '点击上传综合报价单 / 采购文件'}
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">
                支持 Excel (.xlsx/.csv)、PDF、文本 (.txt)
              </div>
            </div>

            {/* Raw Text Input */}
            <div className="lg:col-span-2 flex flex-col gap-2">
              <textarea
                rows={4}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="或直接在此粘贴混合报价单内容（例如：华为 S5735-L48P4X-A1 4台 单价3950；42U标准机柜 2台 单价2600；六类网线 10箱 单价850；综合布线点位施工人工 150个点 单价120）..."
                className="w-full flex-1 glass-input rounded-xl p-3 font-mono text-xs text-zinc-200"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addEmptyRow('device')}
                    className="h-8 px-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-zinc-200 hover:text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-zinc-400" /> 加设备行
                  </button>
                  <button
                    type="button"
                    onClick={() => addEmptyRow('service')}
                    className="h-8 px-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-zinc-200 hover:text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" /> 加弱电/服务行
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="h-8 px-3.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-zinc-100 hover:text-white text-xs font-medium inline-flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>AI 双轨解析中...</span>
                    </>
                  ) : (
                    <span>AI 智能双轨提取</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Editable Review & Staging Table */}
          {parsedItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                    提取结果复核（共 {parsedItems.length} 项）
                  </span>

                  {/* Filter tabs */}
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveFilterTab('all')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        activeFilterTab === 'all'
                          ? 'bg-white/15 text-white font-medium'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      全部 ({parsedItems.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveFilterTab('device')}
                      className={`px-2.5 py-1 rounded-md transition-colors inline-flex items-center gap-1.5 ${
                        activeFilterTab === 'device'
                          ? 'bg-white/15 text-white font-medium'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Radio className="w-3 h-3 text-sky-400" />
                      <span>网络设备 ({deviceCount})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveFilterTab('service')}
                      className={`px-2.5 py-1 rounded-md transition-colors inline-flex items-center gap-1.5 ${
                        activeFilterTab === 'service'
                          ? 'bg-white/15 text-white font-medium'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Wrench className="w-3 h-3 text-amber-400" />
                      <span>弱电与工程 ({serviceCount})</span>
                    </button>
                  </div>
                </div>

                <span className="text-[11px] text-zinc-400">
                  提示：点击类型标签可在「网络设备 ⇋ 弱电工程」间一键切换归属
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/30">
                <datalist id="import-brand-options">
                  {activeBrands.map((b) => (
                    <option key={b} value={b} />
                  ))}
                </datalist>
                <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
                  <thead>
                    <tr className="bg-zinc-900/90 text-zinc-400 border-b border-white/10 text-[11px]">
                      <th className="p-2.5 text-center w-8">选</th>
                      <th className="p-2.5 w-24 text-center">归属类型</th>
                      <th className="p-2.5 w-28">品牌 / 分类</th>
                      <th className="p-2.5 min-w-[180px]">产品型号 / 项目名称</th>
                      <th className="p-2.5 w-24">单位</th>
                      <th className="p-2.5 min-w-[200px]">技术规格 / 施工范围描述</th>
                      <th className="p-2.5 w-20 text-center">税率</th>
                      <th className="p-2.5 w-24 text-right">单价 (元)</th>
                      <th className="p-2.5 w-16 text-center">数量</th>
                      <th className="p-2.5 w-10 text-center">删</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {displayedItems.map((row) => (
                      <tr key={row.tempId} className="hover:bg-white/[0.02]">
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={row.selected}
                            onChange={(e) => updateRow(row.tempId, 'selected', e.target.checked)}
                            className="accent-zinc-200 rounded"
                          />
                        </td>

                        {/* Dual-track Toggle Pill */}
                        <td className="p-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => toggleItemType(row.tempId)}
                            title={
                              row.item_type === 'device'
                                ? '点击切换为「弱电与工程服务」'
                                : '点击切换为「网络硬件设备」'
                            }
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border inline-flex items-center gap-1 cursor-pointer transition-colors ${
                              row.item_type === 'device'
                                ? 'bg-sky-500/10 border-sky-500/30 text-sky-300 hover:bg-sky-500/20'
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                            }`}
                          >
                            {row.item_type === 'device' ? (
                              <>
                                <Radio className="w-2.5 h-2.5" />
                                <span>设备</span>
                              </>
                            ) : (
                              <>
                                <Wrench className="w-2.5 h-2.5" />
                                <span>弱电</span>
                              </>
                            )}
                            <Repeat className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                          </button>
                        </td>

                        {/* Brand or Service Category */}
                        <td className="p-1.5">
                          {row.item_type === 'device' ? (
                            <input
                              type="text"
                              list="import-brand-options"
                              value={row.brand}
                              onChange={(e) => updateRow(row.tempId, 'brand', e.target.value)}
                              className="w-24 glass-input rounded px-1.5 py-1 text-xs text-zinc-100"
                            />
                          ) : (
                            <select
                              value={row.service_category || '弱电材料'}
                              onChange={(e) =>
                                updateRow(
                                  row.tempId,
                                  'service_category',
                                  e.target.value as any
                                )
                              }
                              className="w-26 bg-zinc-900 border border-white/10 rounded px-1.5 py-1 text-xs text-zinc-200"
                            >
                              <option value="弱电材料">弱电材料</option>
                              <option value="布线人工">布线人工</option>
                              <option value="作业费">作业费</option>
                              <option value="项目管理费">项目管理费</option>
                            </select>
                          )}
                        </td>

                        {/* Model / Name */}
                        <td className="p-1.5">
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={row.item_type === 'device' ? row.model : (row.name || row.model)}
                              onChange={(e) => {
                                updateRow(row.tempId, 'model', e.target.value);
                                if (row.item_type === 'service') {
                                  updateRow(row.tempId, 'name', e.target.value);
                                }
                              }}
                              placeholder={row.item_type === 'device' ? '输入设备型号...' : '输入材料/服务名称...'}
                              className="w-full glass-input rounded px-2 py-1 font-semibold text-zinc-100"
                            />
                            {row.item_type === 'device' && (
                              <button
                                type="button"
                                onClick={() => handleSingleLookup(row)}
                                disabled={lookingUpId === row.tempId}
                                title="联网检索官网规格参数"
                                className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-zinc-200 flex-shrink-0"
                              >
                                {lookingUpId === row.tempId ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Search className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Unit */}
                        <td className="p-1.5">
                          {row.item_type === 'device' ? (
                            <span className="text-zinc-400 font-mono pl-1">台</span>
                          ) : (
                            <select
                              value={row.unit || '项'}
                              onChange={(e) => updateRow(row.tempId, 'unit', e.target.value)}
                              className="w-16 bg-zinc-900 border border-white/10 rounded px-1.5 py-1 text-xs text-zinc-200"
                            >
                              <option value="台">台</option>
                              <option value="箱">箱</option>
                              <option value="米">米</option>
                              <option value="条">条</option>
                              <option value="点">点</option>
                              <option value="项">项</option>
                              <option value="次">次</option>
                              <option value="套">套</option>
                            </select>
                          )}
                        </td>

                        {/* Specifications / Working content */}
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={
                              row.item_type === 'device'
                                ? row.ports_summary
                                : (row.description || row.ports_summary)
                            }
                            onChange={(e) => {
                              updateRow(row.tempId, 'ports_summary', e.target.value);
                              updateRow(row.tempId, 'description', e.target.value);
                            }}
                            placeholder="规格或工作内容描述..."
                            className="w-full glass-input rounded px-2 py-1 text-zinc-300"
                          />
                        </td>

                        {/* Tax Rate */}
                        <td className="p-1.5 text-center">
                          <select
                            value={row.tax_rate !== undefined ? String(row.tax_rate) : '0.13'}
                            onChange={(e) =>
                              updateRow(row.tempId, 'tax_rate', parseFloat(e.target.value))
                            }
                            className="bg-zinc-900 border border-white/10 rounded px-1.5 py-1 text-xs text-zinc-300"
                          >
                            <option value="0.13">13%</option>
                            <option value="0.09">9%</option>
                            <option value="0.06">6%</option>
                            <option value="0.03">3%</option>
                            <option value="0">0%</option>
                          </select>
                        </td>

                        {/* Unit Price */}
                        <td className="p-1.5">
                          <input
                            type="number"
                            value={row.quoted_unit_price ?? ''}
                            onChange={(e) =>
                              updateRow(
                                row.tempId,
                                'quoted_unit_price',
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                            placeholder="待填"
                            className="w-20 glass-input rounded px-1.5 py-1 font-mono text-right text-zinc-100 font-semibold"
                          />
                        </td>

                        {/* Quantity */}
                        <td className="p-1.5">
                          <input
                            type="number"
                            min={1}
                            value={row.quantity}
                            onChange={(e) =>
                              updateRow(row.tempId, 'quantity', Math.max(1, Number(e.target.value)))
                            }
                            className="w-14 glass-input rounded px-1.5 py-1 font-mono text-center"
                          />
                        </td>

                        {/* Delete Button */}
                        <td className="p-1.5 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              setParsedItems((prev) => prev.filter((i) => i.tempId !== row.tempId))
                            }
                            className="text-zinc-500 hover:text-zinc-200 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-black/50 border-t border-white/10 flex items-center justify-between gap-3">
          <div className="text-[11px] text-zinc-400 flex items-center gap-2">
            <span>已选定:</span>
            <span className="font-medium text-sky-300">
              {parsedItems.filter((i) => i.selected && i.item_type === 'device').length} 款网络设备
            </span>
            <span>·</span>
            <span className="font-medium text-amber-300">
              {parsedItems.filter((i) => i.selected && i.item_type === 'service').length} 项弱电与工程
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              disabled={parsedItems.length === 0}
              onClick={() => handleImport(false)}
              className="h-8 px-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-xs font-medium text-zinc-200 hover:text-white disabled:opacity-40 transition-colors"
            >
              仅入库 (分流存库)
            </button>
            <button
              type="button"
              disabled={parsedItems.length === 0}
              onClick={() => handleImport(true)}
              className="h-8 px-3.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-zinc-100 hover:text-white text-xs font-medium inline-flex items-center gap-1.5 disabled:opacity-40 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>入库并全加入清单</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
