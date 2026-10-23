import React, { useState } from 'react';
import { X, Settings, Key, Globe, Cpu, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAIStore, AI_PRESETS, APIFormat } from '../store/useAIStore';
import { callLLM } from '../utils/ai-service';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({ isOpen, onClose }) => {
  const aiSettings = useAIStore();
  const {
    presetId,
    apiFormat,
    baseUrl,
    apiKey,
    model,
    enableWebSearch,
    setPreset,
    setApiFormat,
    setBaseUrl,
    setApiKey,
    setModel,
    setEnableWebSearch,
  } = aiSettings;

  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  if (!isOpen) return null;

  const currentPreset = AI_PRESETS.find((p) => p.id === presetId);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const reply = await callLLM(
        'You are a network assistant.',
        '请只回复 "OK" 两个字母。',
        aiSettings
      );
      setTestResult({
        ok: true,
        msg: `连接成功！模型响应: ${reply.slice(0, 40)}`,
      });
    } catch (err: any) {
      setTestResult({
        ok: false,
        msg: err.message || '连接失败，请检查 Base URL 或 API Key',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/75 backdrop-blur-sm" />

      <div className="relative w-full max-w-lg glass-panel-elevated rounded-2xl flex flex-col z-10 shadow-2xl border border-white/15 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Settings className="w-4 h-4 text-zinc-300" />
            <h2 className="text-sm font-bold text-zinc-100">AI 接口设置</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          {/* Provider Preset */}
          <div>
            <label className="text-zinc-400 font-medium mb-1.5 block">服务商预设</label>
            <select
              value={presetId}
              onChange={(e) => {
                setPreset(e.target.value);
                setTestResult(null);
              }}
              className="w-full glass-input rounded-xl px-3 py-2 text-zinc-100 font-medium"
            >
              {AI_PRESETS.map((p) => (
                <option key={p.id} value={p.id} className="bg-zinc-900 text-zinc-100">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* API Protocol Standard */}
          <div>
            <label className="text-zinc-400 font-medium mb-1.5 block">协议标准</label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'openai', label: 'OpenAI 兼容标准' },
                  { id: 'gemini', label: 'Google Gemini' },
                  { id: 'anthropic', label: 'Anthropic Claude' },
                ] as { id: APIFormat; label: string }[]
              ).map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setApiFormat(fmt.id)}
                  className={`py-2 px-2.5 rounded-xl font-medium border text-center transition-all ${
                    apiFormat === fmt.id
                      ? 'bg-zinc-100 text-zinc-900 border-zinc-100 font-semibold'
                      : 'glass-input text-zinc-400 hover:text-white'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Base URL */}
          <div>
            <label className="text-zinc-400 font-medium mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-zinc-400" /> API Base URL
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="w-full glass-input rounded-xl px-3 py-2 font-mono text-zinc-100"
            />
          </div>

          {/* API Key */}
          <div>
            <label className="text-zinc-400 font-medium mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-zinc-400" /> API Key (仅保存在本地浏览器)
              </span>
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-... 或 AIzaSy..."
                className="w-full glass-input rounded-xl pl-3 pr-9 py-2 font-mono text-zinc-100"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Model Name */}
          <div>
            <label className="text-zinc-400 font-medium mb-1.5 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-zinc-400" /> 模型名称 (Model ID)
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="如 deepseek-chat, gpt-4o-mini, gemini-2.5-flash"
              className="w-full glass-input rounded-xl px-3 py-2 font-mono text-zinc-100"
            />
            {currentPreset && currentPreset.models.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {currentPreset.models.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setModel(m)}
                    className={`px-2 py-0.5 rounded-md font-mono text-[11px] border transition-colors ${
                      model === m
                        ? 'bg-zinc-100 text-zinc-900 border-zinc-100 font-semibold'
                        : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Web Search Grounding Toggle */}
          <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer select-none">
            <div>
              <div className="font-medium text-zinc-200">联网检索官网参数补全</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                缺失参数时允许调用搜索工具 (Gemini Search / 百炼联网) 或官方规格知识库补全
              </div>
            </div>
            <input
              type="checkbox"
              checked={enableWebSearch}
              onChange={(e) => setEnableWebSearch(e.target.checked)}
              className="w-4 h-4 accent-zinc-200 rounded"
            />
          </label>

          {/* Test Result */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2 ${
                testResult.ok
                  ? 'bg-white/10 border-white/20 text-zinc-100'
                  : 'bg-white/5 border-white/15 text-zinc-300'
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              )}
              <span className="break-all">{testResult.msg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-black/40 border-t border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass-panel border border-white/10 text-xs font-medium text-zinc-300 hover:text-white disabled:opacity-50"
          >
            {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            <span>{testing ? '测试中...' : '测试连接'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-bold transition-colors"
          >
            完成保存
          </button>
        </div>
      </div>
    </div>
  );
};
