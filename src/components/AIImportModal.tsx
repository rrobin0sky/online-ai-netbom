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
} from 'lucide-react';
import { useAIStore } from '../store/useAIStore';
import { useBOMStore } from '../store/useBOMStore';
import {
  ParsedQuoteItem,
  parseUploadedFileToText,
  analyzeQuoteWithAI,
  convertParsedToDeviceItem,
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
  const { addCustomDevice, addItem } = useBOMStore();

  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [lookingUpId, setLookingUpId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parsedItems, setParsedItems] = useState<ParsedQuoteItem[]>([]);
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
      setErrorMsg('请先上传报价文件（Excel / PDF / 文本）或在输入框中粘贴报价内容');
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

  const addEmptyRow = () => {
    setParsedItems((prev) => [
      ...prev,
      {
        tempId: `manual-${Date.now()}`,
        selected: true,
        brand: 'Huawei',
        series: '',
        model: '',
        part_number: '',
        category: 'switch',
        form_factor: '1U',
        layer: 'L2+',
        ports_summary: '24 x 10/100/1000Base-T + 4 x 10GE SFP+',
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
        area_group: '接入层',
        official_spec_url: 'https://e.huawei.com',
        description: '',
        ai_completed: false,
      },
    ]);
  };

  const handleImport = (alsoAddToBOM: boolean) => {
    const selectedRows = parsedItems.filter((i) => i.selected && i.model.trim());
    if (selectedRows.length === 0) {
      setErrorMsg('请至少勾选一款型号有效的设备');
      return;
    }

    selectedRows.forEach((row) => {
      const deviceItem = convertParsedToDeviceItem(row);
      addCustomDevice(deviceItem);
      if (alsoAddToBOM) {
        addItem(deviceItem, row.area_group || '接入层', row.quantity || 1, row.quoted_unit_price);
      }
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-3 sm:p-6">
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-md" />

      <div className="relative w-full max-w-6xl max-h-[92vh] glass-panel-elevated rounded-2xl flex flex-col z-10 shadow-2xl border border-white/15 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Upload className="w-4 h-4 text-zinc-300" />
            <h2 className="text-sm font-bold text-zinc-100">
              导入报价文件 / 录入设备
            </h2>
            <span className="text-[11px] font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
              {aiSettings.model || '未配置模型'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAISettings}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-panel border border-white/10 text-xs text-zinc-300 hover:text-white"
            >
              <Settings className="w-3.5 h-3.5 text-zinc-400" />
              <span>AI 设置</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
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
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-zinc-400" />
                <span>{errorMsg}</span>
              </div>
              {!aiSettings.apiKey && (
                <button
                  onClick={onOpenAISettings}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-900 font-semibold whitespace-nowrap"
                >
                  去设置 API Key
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
                {fileName ? `已加载: ${fileName}` : '点击上传报价单 / 规格书'}
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
                placeholder="或直接在此粘贴报价内容、型号清单（如：华为 S5735-L48P4X-A1 4台 单价3950元；H3C S5560X-30C-EI 2台）..."
                className="w-full flex-1 glass-input rounded-xl p-3 font-mono text-xs text-zinc-200"
              />
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={addEmptyRow}
                  className="flex items-center gap-1 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 border border-white/10"
                >
                  <Plus className="w-3.5 h-3.5" /> 手动添加设备行
                </button>

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-900 font-bold shadow-sm disabled:opacity-50"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>正在解析并检索官网规格...</span>
                    </>
                  ) : (
                    <span>AI 提取与官网参数补全</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Editable Review & Staging Table */}
          {parsedItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-zinc-400" />
                  设备复核与编辑（共 {parsedItems.length} 项）
                </span>
                <span className="text-[11px] text-zinc-400">
                  点击型号右侧 <Search className="w-3 h-3 inline text-zinc-300" /> 可单独联网检索官网参数
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/30">
                <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
                  <thead>
                    <tr className="bg-zinc-900/90 text-zinc-400 border-b border-white/10 text-[11px]">
                      <th className="p-2.5 text-center w-8">选</th>
                      <th className="p-2.5 w-24">品牌</th>
                      <th className="p-2.5 min-w-[180px]">产品型号 (可查官网)</th>
                      <th className="p-2.5 w-28">订货编码 (P/N)</th>
                      <th className="p-2.5 min-w-[220px]">端口配置参数</th>
                      <th className="p-2.5 w-20">容量(Gbps)</th>
                      <th className="p-2.5 w-20">转发(Mpps)</th>
                      <th className="p-2.5 w-20">PoE(W)</th>
                      <th className="p-2.5 w-24">单价 (元)</th>
                      <th className="p-2.5 w-16">数量</th>
                      <th className="p-2.5 w-10 text-center">删</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {parsedItems.map((row) => (
                      <tr key={row.tempId} className="hover:bg-white/[0.02]">
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={row.selected}
                            onChange={(e) => updateRow(row.tempId, 'selected', e.target.checked)}
                            className="accent-zinc-200 rounded"
                          />
                        </td>
                        <td className="p-1.5">
                          <select
                            value={row.brand}
                            onChange={(e) => updateRow(row.tempId, 'brand', e.target.value as any)}
                            className="w-full glass-input rounded px-1.5 py-1 text-xs"
                          >
                            <option value="Huawei">Huawei</option>
                            <option value="H3C">H3C</option>
                            <option value="Cisco">Cisco</option>
                            <option value="Ruijie">Ruijie</option>
                            <option value="Arista">Arista</option>
                            <option value="FS.com">FS.com</option>
                          </select>
                        </td>
                        <td className="p-1.5">
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={row.model}
                              onChange={(e) => updateRow(row.tempId, 'model', e.target.value)}
                              placeholder="输入型号..."
                              className="w-full glass-input rounded px-2 py-1 font-bold text-zinc-100"
                            />
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
                          </div>
                        </td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={row.part_number}
                            onChange={(e) => updateRow(row.tempId, 'part_number', e.target.value)}
                            className="w-24 glass-input rounded px-2 py-1 font-mono text-zinc-300"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={row.ports_summary}
                            onChange={(e) => updateRow(row.tempId, 'ports_summary', e.target.value)}
                            className="w-full glass-input rounded px-2 py-1 text-zinc-200"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="number"
                            value={row.switching_capacity_gbps}
                            onChange={(e) =>
                              updateRow(row.tempId, 'switching_capacity_gbps', Number(e.target.value))
                            }
                            className="w-16 glass-input rounded px-1.5 py-1 font-mono text-right"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="number"
                            value={row.forwarding_rate_mpps}
                            onChange={(e) =>
                              updateRow(row.tempId, 'forwarding_rate_mpps', Number(e.target.value))
                            }
                            className="w-16 glass-input rounded px-1.5 py-1 font-mono text-right"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="number"
                            value={row.poe_budget_watts}
                            onChange={(e) => {
                              const w = Number(e.target.value) || 0;
                              updateRow(row.tempId, 'poe_budget_watts', w);
                              updateRow(row.tempId, 'poe_supported', w > 0);
                            }}
                            placeholder="0"
                            className="w-16 glass-input rounded px-1.5 py-1 font-mono text-right text-zinc-200"
                          />
                        </td>
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
                            placeholder="待定"
                            className="w-20 glass-input rounded px-1.5 py-1 font-mono text-right text-zinc-100 font-semibold"
                          />
                        </td>
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
                        <td className="p-1.5 text-center">
                          <button
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
          <div className="text-[11px] text-zinc-400">
            已勾选 {parsedItems.filter((i) => i.selected).length} 款产品
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
            >
              取消
            </button>
            <button
              disabled={parsedItems.length === 0}
              onClick={() => handleImport(false)}
              className="px-4 py-2 rounded-xl glass-panel border border-white/10 text-xs font-semibold text-zinc-200 hover:text-white hover:bg-white/10 disabled:opacity-40"
            >
              仅导入设备库
            </button>
            <button
              disabled={parsedItems.length === 0}
              onClick={() => handleImport(true)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-bold shadow-sm disabled:opacity-40"
            >
              <Check className="w-3.5 h-3.5" />
              <span>导入设备库并加入 BOM</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
