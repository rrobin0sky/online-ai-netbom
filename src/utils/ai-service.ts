import ExcelJS from 'exceljs';
import { AISettingsState } from '../store/useAIStore';
import { DeviceItem } from '../types/device';
import { EngineeringItem, createEngineeringItem } from '../data/seedServices';

export type QuoteItemType = 'device' | 'service';

export interface ParsedQuoteItem {
  tempId: string;
  selected: boolean;
  item_type: QuoteItemType; // 'device' | 'service'
  brand: string;
  series: string;
  model: string;
  name?: string;
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

  // Low-voltage service fields
  service_category?: '弱电材料' | '布线人工' | '作业费' | '项目管理费';
  unit?: string;
  pricing_mode?: 'fixed' | 'percent';
  tax_rate?: number;
}

/**
 * Intelligent keyword detection to determine whether an item belongs to low-voltage engineering
 */
export function isLikelyLowVoltageService(text: string): boolean {
  if (!text) return false;
  return /机柜|PDU|配线架|理线|网线|双绞线|光缆|跳线|尾纤|水晶头|面板|模块面板|底盒|管线|线管|桥架|线槽|人工|施工|布线|熔接|打线|点位|调试|安装|作业费|管理费|割接|培训|维保|质保|验收|辅材/i.test(
    text
  );
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
 * Analyze raw quote text/Excel/PDF and return structured network devices or low-voltage services with dual-track automatic classification
 */
export async function analyzeQuoteWithAI(
  rawText: string,
  settings: AISettingsState
): Promise<ParsedQuoteItem[]> {
  const systemPrompt = `你是一位资深企业级网络工程师与弱电智能化系统集成报价专家。
用户会提供一份采购清单、报价单表格或物料文本（可能包含网络硬件、弱电线缆机房辅材以及施工安装人工取费的混合清单）。
你的任务是对每一项内容进行【智能双轨分类】，准确识别它是属于【网络硬件设备 (device)】还是【弱电工程与辅材服务 (service)】：

【智能双轨分类规则】：
1. "device" (网络硬件设备)：
   - 核心交换机、汇聚交换机、接入交换机、路由器、企业网关、下一代防火墙、无线AP/AC控制器、SFP/SFP+/QSFP光模块、交换机电源模块等。
   - 自动推导并检索厂商官网硬件技术参数（端口规格、交换容量、包转发率、PoE功率、双电源支持）。

2. "service" (弱电材料、布线施工人工、工程作业与管理费)：
   - 弱电材料/机房辅材：标准服务器机柜(42U/24U/12U)、机柜PDU插排、六类/超五类网线(双绞线)、室内/室外光缆、光纤跳线、尾纤、光纤配线架(ODF)、网络配线架、理线架/理线器、网络水晶头、信息面板、PVC线管/桥架、接地铜排等。
   - 布线人工：网络综合布线人工施工、信息点位打线测试、光纤熔接、桥架敷设、穿线放线人工等。
   - 作业费与调试：网络设备上架安装、交换机VLAN与堆叠配置调试、路由策略联调、防火墙策略配置、系统割接上线演练、工程测试验收等。
   - 项目管理费：工程项目管理协调费、安全文明施工费、系统质保服务费等。

请严格返回合法的 JSON 数组格式（不要附带任何多余解释），数组中每个对象的字段定义如下：
[
  {
    "item_type": "device" | "service",
    "brand": "品牌（如 Huawei、H3C、Cisco、康普、大唐电信、图腾机柜、国产通用等）",
    "name": "产品或服务名称（如：华为 S5735-L48P4X-A1 交换机 或 42U标准服务器机柜 或 六类非屏蔽双绞线 或 综合布线点位施工人工）",
    "model": "准确产品型号（设备填写如 S5735-L48P4X-A1；弱电材料填写如 2000*600*1000 或 CAT6-305M，人工或服务可同名称）",
    "part_number": "订货物料编码 P/N（如有，没有则填型号或短横杠）",
    "description": "详细规格描述或施工工作内容",
    "quantity": 数量数字（默认为 1）,
    "quoted_unit_price": 单价数字或 null（文件中提取的实际含税单价，若无则为 null）,
    "list_price_gpl": 目录指导价数字或 null（设备类尽量估算或补全官网指导价）,
    "area_group": "施工或安装区域（如：核心机房、楼层接入、办公室点位、数据中心、外联区）",

    // 若 item_type 为 "device"，请尽量补全以下硬件参数：
    "category": "switch" | "router" | "firewall" | "wireless_ap" | "transceiver" | "power_module" | "cable",
    "form_factor": "1U" | "2U" | "Modular" | "Desktop" | "Ceiling" | "Module",
    "layer": "L2" | "L2+" | "L3" | "DataCenter" | "Security" | "Accessory",
    "ports_summary": "标准端口描述，如 48 x 10/100/1000Base-T (PoE+) + 4 x 10GE SFP+",
    "downlink_speed": "1G" | "10G" | "25G" | "100G",
    "uplink_speed": "1G" | "10G" | "25G" | "40G" | "100G",
    "switching_capacity_gbps": 数字(交换容量Gbps),
    "forwarding_rate_mpps": 数字(包转发率Mpps),
    "poe_supported": 布尔值,
    "poe_budget_watts": 数字(PoE功率W),
    "power_type": "fixed" | "modular",
    "redundancy_supported": 布尔值,
    "official_spec_url": "厂商官网产品页URL",
    "ai_completed": 布尔值,

    // 若 item_type 为 "service"，请补全以下工程服务字段：
    "service_category": "弱电材料" | "布线人工" | "作业费" | "项目管理费",
    "unit": "单位，如 台 | 箱 | 米 | 条 | 点 | 项 | 次 | 套",
    "pricing_mode": "fixed" | "percent",
    "tax_rate": 对应税率数字（弱电材料通常为 0.13，施工安装人工通常为 0.09，现代服务/管理通常为 0.06）
  }
]`;

  const userPrompt = `请分析以下报价单/清单内容，进行【网络设备】与【弱电工程】智能双轨提取：\n\n${rawText.slice(0, 24000)}`;

  const responseText = await callLLM(systemPrompt, userPrompt, settings);
  const parsed = extractJSONFromResponse(responseText);
  const list = Array.isArray(parsed) ? parsed : [parsed];

  return list.map((item: any, idx: number) => {
    const rawTextCombined = `${item.name || ''} ${item.model || ''} ${item.description || ''} ${item.brand || ''}`;
    const detectedService = item.item_type === 'service' || isLikelyLowVoltageService(rawTextCombined);
    const itemType: QuoteItemType = detectedService ? 'service' : 'device';

    // Infer service category if service
    let serviceCat: '弱电材料' | '布线人工' | '作业费' | '项目管理费' = '弱电材料';
    if (item.service_category) {
      serviceCat = item.service_category;
    } else if (/人工|施工|布线|熔接|打线/i.test(rawTextCombined)) {
      serviceCat = '布线人工';
    } else if (/作业|安装|调试|配置|割接|培训/i.test(rawTextCombined)) {
      serviceCat = '作业费';
    } else if (/管理|质保|维保|配合/i.test(rawTextCombined)) {
      serviceCat = '项目管理费';
    }

    // Default unit
    let defaultUnit = item.unit || '台';
    if (!item.unit && itemType === 'service') {
      if (/线|缆/i.test(rawTextCombined)) defaultUnit = '箱';
      else if (/人工|点位/i.test(rawTextCombined)) defaultUnit = '点';
      else if (/作业|调试|管理|系统/i.test(rawTextCombined)) defaultUnit = '项';
      else if (/跳线/i.test(rawTextCombined)) defaultUnit = '条';
      else defaultUnit = '台';
    }

    const defaultTax =
      item.tax_rate !== undefined
        ? Number(item.tax_rate)
        : serviceCat === '弱电材料'
        ? 0.13
        : serviceCat === '布线人工' || serviceCat === '作业费'
        ? 0.09
        : 0.06;

    return {
      tempId: `ai-${Date.now()}-${idx}`,
      selected: true,
      item_type: itemType,
      brand: item.brand ? String(item.brand).trim() : itemType === 'service' ? '综合弱电' : 'Huawei',
      series: item.series || (itemType === 'service' ? serviceCat : `${item.brand || 'Huawei'} Series`),
      model: item.model || item.name || '通用项目',
      name: item.name || item.model || '未命名项目',
      part_number: item.part_number || item.model || '-',
      category: item.category || 'switch',
      form_factor: item.form_factor || '1U',
      layer: item.layer || 'L2+',
      ports_summary: item.ports_summary || (itemType === 'service' ? item.description || serviceCat : '标准端口配置'),
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
      area_group: item.area_group || (itemType === 'service' ? '综合布线区' : '接入层'),
      official_spec_url: item.official_spec_url || 'https://e.huawei.com',
      description: item.description || item.name || `${item.model} 项目`,
      ai_completed: item.ai_completed ?? true,
      service_category: serviceCat,
      unit: defaultUnit,
      pricing_mode: item.pricing_mode === 'percent' ? 'percent' : 'fixed',
      tax_rate: defaultTax,
    };
  });
}

/**
 * Convert a ParsedQuoteItem into an EngineeringItem (Low-voltage service/materials)
 */
export function convertParsedToEngineeringItem(p: ParsedQuoteItem): EngineeringItem {
  const slug = `srv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const incl = p.quoted_unit_price ?? 0;
  const tax = p.tax_rate ?? (p.service_category === '弱电材料' ? 0.13 : 0.09);
  const excl = Math.round((incl / (1 + tax)) * 100) / 100;

  return createEngineeringItem({
    id: slug,
    category: p.service_category || '弱电材料',
    brand: p.brand || '综合布线',
    name: p.name || p.model || '弱电项目',
    model: p.model || '-',
    part_number: p.part_number || '-',
    specs: p.description || p.ports_summary || '标准弱电及工程施工规范',
    unit: p.unit || '项',
    pricingMode: p.pricing_mode || 'fixed',
    unitPriceInclTax: incl,
    taxRate: tax,
    notes: p.description || '',
  });
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

