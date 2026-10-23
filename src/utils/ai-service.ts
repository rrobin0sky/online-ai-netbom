import ExcelJS from 'exceljs';
import { AISettingsState } from '../store/useAIStore';
import { DeviceItem } from '../types/device';

export interface ParsedQuoteItem {
  tempId: string;
  selected: boolean;
  brand: string;
  series: string;
  model: string;
  part_number: string;
  category: 'switch' | 'router' | 'firewall' | 'wireless_ap' | 'transceiver' | 'power_module' | 'cable';
  form_factor: '1U' | '2U' | '3U' | '4U' | 'Modular' | 'Desktop' | 'Ceiling' | 'Module';
  layer: 'L2' | 'L2+' | 'L3' | 'DataCenter' | 'Security' | 'Accessory';
  ports_summary: string;
  downlink_speed: string;
  uplink_speed: string;
  switching_capacity_gbps: number;
  forwarding_rate_mpps: number;
  poe_supported: boolean;
  poe_budget_watts: number;
  power_type: 'fixed' | 'modular';
  power_slots: number;
  default_included_power: number;
  redundancy_supported: boolean;
  list_price_gpl: number | null;
  quoted_unit_price: number | null;
  quantity: number;
  area_group: string;
  official_spec_url: string;
  description: string;
  ai_completed: boolean; // True if AI filled in missing official specs
}

/**
 * Extract readable text from uploaded Excel (.xlsx), PDF (.pdf), or Text/CSV files
 */
export async function parseUploadedFileToText(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  // 1. Excel (.xlsx)
  if (ext === 'xlsx') {
    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const lines: string[] = [];
    workbook.eachSheet((sheet) => {
      lines.push(`=== 工作表: ${sheet.name} ===`);
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber > 300) return; // Cap at 300 rows per sheet
        const vals = Array.isArray(row.values)
          ? row.values
              .slice(1)
              .map((v: any) => {
                if (v === null || v === undefined) return '';
                if (typeof v === 'object') {
                  if ('result' in v) return String(v.result ?? '');
                  if ('text' in v) return String(v.text ?? '');
                  if ('richText' in v && Array.isArray(v.richText)) {
                    return v.richText.map((rt: any) => rt.text).join('');
                  }
                  return JSON.stringify(v);
                }
                return String(v).trim();
              })
              .filter(Boolean)
          : [];
        if (vals.length > 0) {
          lines.push(vals.join(' | '));
        }
      });
    });
    return lines.join('\n');
  }

  // 2. PDF (.pdf) via dynamic CDN pdf.js
  if (ext === 'pdf') {
    const buffer = await file.arrayBuffer();
    try {
      const pdfjsUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.mjs';
      const pdfWorkerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs';
      const pdfjsLib: any = await import(/* @vite-ignore */ pdfjsUrl);
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      const maxPages = Math.min(pdf.numPages, 20);
      const pageTexts: string[] = [];

      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item: any) => item.str);
        pageTexts.push(`--- 第 ${i} 页 ---\n` + strings.join(' '));
      }
      return pageTexts.join('\n\n');
    } catch (err) {
      console.warn('PDF.js load fallback:', err);
      // Fallback: extract printable ASCII/UTF-8 chunks
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const raw = decoder.decode(buffer);
      const matches = raw.match(/[\u4e00-\u9fa5A-Za-z0-9\-\/\.\s\+]{4,}/g) || [];
      return matches.slice(0, 500).join('\n');
    }
  }

  // 3. CSV / TXT / MD / JSON
  return await file.text();
}

/**
 * Unified LLM Caller supporting OpenAI-compatible, Gemini native, and Anthropic formats
 */
export async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  settings: AISettingsState
): Promise<string> {
  const { apiFormat, baseUrl, apiKey, model, enableWebSearch } = settings;

  if (!apiKey.trim()) {
    throw new Error('请先点击右上角「AI 设置」配置有效的 API Key');
  }

  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');

  // 1. Google Gemini Native API (supports Google Search Grounding)
  if (apiFormat === 'gemini') {
    const endpoint = `${cleanBaseUrl}/models/${model}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
    const body: any = {
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
      },
    };

    if (enableWebSearch) {
      body.tools = [{ google_search: {} }];
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API 请求失败 (${res.status}): ${errText.slice(0, 200)}`);
    }

    const data = await res.json();
    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: any) => p.text || '')
        .join('\n') || '';
    return text;
  }

  // 2. Anthropic Claude Native API
  if (apiFormat === 'anthropic') {
    const endpoint = `${cleanBaseUrl}/messages`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey.trim(),
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Anthropic API 请求失败 (${res.status}): ${errText.slice(0, 200)}`);
    }

    const data = await res.json();
    return data?.content?.[0]?.text || '';
  }

  // 3. OpenAI Standard / Compatible API (DeepSeek, OpenAI, Qwen, SiliconFlow, OpenRouter, etc.)
  const endpoint = `${cleanBaseUrl}/chat/completions`;
  const body: any = {
    model,
    temperature: 0.2,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  };

  // DashScope / Qwen supports enable_search in OpenAI-compatible mode
  if (enableWebSearch && cleanBaseUrl.includes('dashscope')) {
    body.enable_search = true;
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API 请求失败 (${res.status}): ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}

/**
 * Extract JSON array or object safely from LLM markdown output
 */
function extractJSONFromResponse(raw: string): any {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : raw.trim();

  const firstBracket = candidate.indexOf('[');
  const lastBracket = candidate.lastIndexOf(']');
  const firstBrace = candidate.indexOf('{');
  const lastBrace = candidate.lastIndexOf('}');

  if (firstBracket !== -1 && lastBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
    return JSON.parse(candidate.slice(firstBracket, lastBracket + 1));
  }
  if (firstBrace !== -1 && lastBrace !== -1) {
    return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
  }
  return JSON.parse(candidate);
}

/**
 * Analyze raw quote text/Excel/PDF and return structured network devices with auto-completed official specs
 */
export async function analyzeQuoteWithAI(
  rawText: string,
  settings: AISettingsState
): Promise<ParsedQuoteItem[]> {
  const systemPrompt = `你是一位资深企业级网络设备架构师与报价专家（精通华为 Huawei、新华三 H3C、思科 Cisco、锐捷 Ruijie、Arista、FS.com 全系交换机、路由器、防火墙、无线AP及光模块）。
你的任务是从用户提供的报价单、表格或文本中提取所有网络设备，并自动补全缺失的官方硬件参数（严格依据厂商官网技术白皮书真实数据）。

请严格返回 JSON 数组格式（不要附加多余解释），数组中每个对象的字段定义如下：
[
  {
    "brand": "Huawei" | "H3C" | "Cisco" | "Ruijie" | "Arista" | "FS.com",
    "series": "产品系列，如 CloudEngine S5735-L",
    "model": "准确产品型号，如 S5735-L48P4X-A1",
    "part_number": "官方物料编码 P/N（若原文未提供，请按官方标准补全，如 02353GBH 或同型号标识）",
    "category": "switch" | "router" | "firewall" | "wireless_ap" | "transceiver" | "power_module" | "cable",
    "form_factor": "1U" | "2U" | "Modular" | "Desktop" | "Ceiling" | "Module",
    "layer": "L2" | "L2+" | "L3" | "DataCenter" | "Security" | "Accessory",
    "ports_summary": "标准端口描述，如 48 x 10/100/1000Base-T (PoE+) + 4 x 10GE SFP+",
    "downlink_speed": "1G" | "10G" | "25G" | "100G",
    "uplink_speed": "1G" | "10G" | "25G" | "40G" | "100G",
    "switching_capacity_gbps": 数字(交换容量Gbps，如 176),
    "forwarding_rate_mpps": 数字(包转发率Mpps，如 132),
    "poe_supported": 布尔值(true/false),
    "poe_budget_watts": 数字(PoE功率W，无则为0),
    "power_type": "fixed" | "modular",
    "power_slots": 数字(电源槽位数，1或2),
    "default_included_power": 数字(出厂标配含几个电源，0/1/2),
    "redundancy_supported": 布尔值(是否支持双电源冗余),
    "list_price_gpl": 数字或null(目录指导价/面价),
    "quoted_unit_price": 数字或null(文件中的实际单价/报价，若无则为null),
    "quantity": 数字(数量，默认为1),
    "area_group": "核心层" | "汇聚层" | "接入层" | "外联安全区" | "数据中心",
    "official_spec_url": "厂商官网对应产品页URL",
    "description": "一句话核心特性描述",
    "ai_completed": 布尔值(若原文缺失技术规格且由你根据官网知识补全，设为 true)
  }
]`;

  const userPrompt = `请分析以下报价单/设备清单内容，提取所有产品并补全官方技术参数：\n\n${rawText.slice(0, 24000)}`;

  const responseText = await callLLM(systemPrompt, userPrompt, settings);
  const parsed = extractJSONFromResponse(responseText);
  const list = Array.isArray(parsed) ? parsed : [parsed];

  return list.map((item: any, idx: number) => ({
    tempId: `ai-${Date.now()}-${idx}`,
    selected: true,
    brand: item.brand ? String(item.brand).trim() : 'Huawei',
    series: item.series || `${item.brand || 'Huawei'} Series`,
    model: item.model || 'Unknown-Model',
    part_number: item.part_number || item.model || 'TBD',
    category: item.category || 'switch',
    form_factor: item.form_factor || '1U',
    layer: item.layer || 'L2+',
    ports_summary: item.ports_summary || '标准以太网端口配置',
    downlink_speed: item.downlink_speed || '1G',
    uplink_speed: item.uplink_speed || '10G',
    switching_capacity_gbps: Number(item.switching_capacity_gbps) || 0,
    forwarding_rate_mpps: Number(item.forwarding_rate_mpps) || 0,
    poe_supported: Boolean(item.poe_supported),
    poe_budget_watts: Number(item.poe_budget_watts) || 0,
    power_type: item.power_type === 'modular' ? 'modular' : 'fixed',
    power_slots: Number(item.power_slots) || 1,
    default_included_power:
      item.default_included_power !== undefined ? Number(item.default_included_power) : 1,
    redundancy_supported: Boolean(item.redundancy_supported),
    list_price_gpl: item.list_price_gpl ? Number(item.list_price_gpl) : null,
    quoted_unit_price: item.quoted_unit_price ? Number(item.quoted_unit_price) : null,
    quantity: Number(item.quantity) || 1,
    area_group: item.area_group || '接入层',
    official_spec_url: item.official_spec_url || 'https://e.huawei.com',
    description: item.description || `${item.model} 企业级网络设备`,
    ai_completed: item.ai_completed ?? true,
  }));
}

/**
 * Convert a ParsedQuoteItem into a standard DeviceItem
 */
export function convertParsedToDeviceItem(p: ParsedQuoteItem): DeviceItem {
  const today = new Date().toISOString().split('T')[0];
  const slug = `${p.brand.toLowerCase().replace(/[^a-z0-9]/g, '')}-${p.model
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')}`;

  const gpl = p.list_price_gpl ?? (p.quoted_unit_price ? Math.round(p.quoted_unit_price / 0.3) : null);

  return {
    id: slug,
    brand: p.brand,
    series: p.series,
    model: p.model,
    part_number: p.part_number,
    category: p.category,
    lifecycle: 'active',
    description: p.description,
    specs: {
      form_factor: p.form_factor,
      ports: {
        summary: p.ports_summary,
        downlink: p.ports_summary,
        downlink_count: 48,
        downlink_speed: p.downlink_speed,
        uplink: p.uplink_speed,
        uplink_count: 4,
        uplink_speed: p.uplink_speed,
      },
      switching_capacity_gbps: p.switching_capacity_gbps,
      forwarding_rate_mpps: p.forwarding_rate_mpps,
      poe: {
        supported: p.poe_supported,
        budget_watts: p.poe_supported ? p.poe_budget_watts : undefined,
        standard: p.poe_supported ? 'PoE+' : 'None',
      },
      layer: p.layer,
      power_supply: {
        type: p.power_type,
        slots: p.power_slots,
        default_included: p.default_included_power,
        default_power_watts: p.poe_supported ? 600 : 150,
        redundancy_supported: p.redundancy_supported,
      },
      airflow: 'front-to-back',
    },
    pricing: {
      currency: 'CNY',
      list_price_gpl: gpl,
      cost_estimate: p.quoted_unit_price,
      discount_reference: gpl && p.quoted_unit_price ? Number((p.quoted_unit_price / gpl).toFixed(2)) : 0.3,
      price_verified_at: today,
      source_quote_type: p.quoted_unit_price ? 'distributor' : gpl ? 'vendor_gpl' : 'none',
    },
    metadata: {
      official_spec_url: p.official_spec_url.startsWith('http')
        ? p.official_spec_url
        : 'https://e.huawei.com',
      specs_verified_at: today,
      contributor: 'AI Parser',
      tags: [p.brand, p.layer, p.poe_supported ? 'PoE+' : '标准交换'],
    },
  };
}

/**
 * Lookup official specifications for a single device model via AI + Web Search
 */
export async function lookupSingleDeviceSpecsWithAI(
  brand: string,
  model: string,
  settings: AISettingsState
): Promise<Partial<ParsedQuoteItem>> {
  const results = await analyzeQuoteWithAI(
    `请查询厂商官网白皮书，补全该设备的全部精确技术参数与官方指导价：品牌 ${brand}，型号 ${model}`,
    settings
  );
  return results[0] || {};
}

