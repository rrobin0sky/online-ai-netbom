import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type APIFormat = 'openai' | 'gemini' | 'anthropic';

export interface AIPreset {
  id: string;
  name: string;
  format: APIFormat;
  baseUrl: string;
  defaultModel: string;
  models: string[];
  supportsSearchGrounding?: boolean;
}

export const AI_PRESETS: AIPreset[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek (官方 API)',
    format: 'openai',
    baseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    models: ['deepseek-chat', 'deepseek-reasoner'],
  },
  {
    id: 'openai',
    name: 'OpenAI / 兼容接口',
    format: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o', 'gpt-4o-mini', 'o3-mini'],
  },
  {
    id: 'gemini',
    name: 'Google Gemini (支持联网查官网)',
    format: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: 'gemini-2.5-flash',
    models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'],
    supportsSearchGrounding: true,
  },
  {
    id: 'qwen',
    name: '阿里云百炼 (通义千问 Qwen)',
    format: 'openai',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultModel: 'qwen-plus',
    models: ['qwen-max', 'qwen-plus', 'qwen-turbo'],
    supportsSearchGrounding: true,
  },
  {
    id: 'siliconflow',
    name: 'SiliconFlow (硅基流动)',
    format: 'openai',
    baseUrl: 'https://api.siliconflow.cn/v1',
    defaultModel: 'deepseek-ai/DeepSeek-V3',
    models: ['deepseek-ai/DeepSeek-V3', 'Qwen/Qwen2.5-72B-Instruct'],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter (全球模型聚合)',
    format: 'openai',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'google/gemini-2.5-flash',
    models: ['google/gemini-2.5-flash', 'anthropic/claude-3.7-sonnet', 'openai/gpt-4o-mini'],
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    format: 'anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-3-7-sonnet-latest',
    models: ['claude-3-7-sonnet-latest', 'claude-3-5-haiku-latest'],
  },
  {
    id: 'custom',
    name: '自定义 API 端点 (OpenAI 标准)',
    format: 'openai',
    baseUrl: '',
    defaultModel: '',
    models: [],
  },
];

export interface AISettingsState {
  presetId: string;
  apiFormat: APIFormat;
  baseUrl: string;
  apiKey: string;
  model: string;
  enableWebSearch: boolean;

  setPreset: (presetId: string) => void;
  setApiFormat: (format: APIFormat) => void;
  setBaseUrl: (url: string) => void;
  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
  setEnableWebSearch: (enable: boolean) => void;
}

export const useAIStore = create<AISettingsState>()(
  persist(
    (set) => ({
      presetId: 'deepseek',
      apiFormat: 'openai',
      baseUrl: 'https://api.deepseek.com/v1',
      apiKey: '',
      model: 'deepseek-chat',
      enableWebSearch: true,

      setPreset: (presetId) => {
        const found = AI_PRESETS.find((p) => p.id === presetId);
        if (found) {
          set({
            presetId,
            apiFormat: found.format,
            baseUrl: found.baseUrl,
            model: found.defaultModel,
          });
        } else {
          set({ presetId });
        }
      },
      setApiFormat: (apiFormat) => set({ apiFormat }),
      setBaseUrl: (baseUrl) => set({ baseUrl }),
      setApiKey: (apiKey) => set({ apiKey }),
      setModel: (model) => set({ model }),
      setEnableWebSearch: (enableWebSearch) => set({ enableWebSearch }),
    }),
    {
      name: 'netbom_ai_settings_v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
