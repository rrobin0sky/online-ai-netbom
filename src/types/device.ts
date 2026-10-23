import { z } from 'zod';

export const DeviceSpecSchema = z.object({
  form_factor: z.enum(['1U', '2U', '3U', '4U', 'Modular', 'Desktop', 'Ceiling', 'Module']),
  ports: z.object({
    summary: z.string(),
    downlink: z.string(),
    downlink_count: z.number().default(0),
    downlink_speed: z.string().default('1G'),
    uplink: z.string(),
    uplink_count: z.number().default(0),
    uplink_speed: z.string().default('10G'),
  }),
  switching_capacity_gbps: z.number().default(0),
  forwarding_rate_mpps: z.number().default(0),
  poe: z.object({
    supported: z.boolean().default(false),
    budget_watts: z.number().optional(),
    standard: z.enum(['PoE', 'PoE+', 'PoE++', 'None']).default('None'),
  }),
  layer: z.enum(['L2', 'L2+', 'L3', 'DataCenter', 'Security', 'Accessory']),
  power_supply: z.object({
    type: z.enum(['fixed', 'modular', 'passive', 'external']),
    slots: z.number().default(1),
    default_included: z.number().default(1),
    default_power_watts: z.number().default(0),
    redundancy_supported: z.boolean().default(false),
  }),
  airflow: z.enum(['front-to-back', 'back-to-front', 'side-to-side', 'fanless', 'none']).default('front-to-back'),
  stacking: z.object({
    supported: z.boolean().default(false),
    max_units: z.number().optional(),
  }).optional(),
});

export const DevicePricingSchema = z.object({
  currency: z.enum(['CNY', 'USD']).default('CNY'),
  list_price_gpl: z.number().nullable().default(null),
  cost_estimate: z.number().nullable().default(null),
  discount_reference: z.number().nullable().default(0.3),
  price_verified_at: z.string().nullable().default(null),
  source_quote_type: z.enum(['vendor_gpl', 'distributor', 'user_custom', 'none']).default('none'),
});

export const DeviceMetadataSchema = z.object({
  official_spec_url: z.string().url(),
  specs_verified_at: z.string(),
  contributor: z.string().default('bin0sky'),
  tags: z.array(z.string()).default([]),
  compatible_accessories: z.object({
    power_modules: z.array(z.string()).optional(),
    transceivers: z.array(z.string()).optional(),
    cables: z.array(z.string()).optional(),
  }).optional(),
});

export const DeviceItemSchema = z.object({
  id: z.string(),
  brand: z.string().min(1),
  series: z.string(),
  model: z.string(),
  part_number: z.string(),
  category: z.enum(['switch', 'router', 'firewall', 'wireless_ap', 'transceiver', 'power_module', 'cable']),
  lifecycle: z.enum(['active', 'eol', 'announcement']).default('active'),
  replacement_model: z.string().nullable().optional(),
  description: z.string(),
  specs: DeviceSpecSchema,
  pricing: DevicePricingSchema,
  metadata: DeviceMetadataSchema,
});

export type DeviceItem = z.infer<typeof DeviceItemSchema>;
export type DeviceSpec = z.infer<typeof DeviceSpecSchema>;
export type DevicePricing = z.infer<typeof DevicePricingSchema>;
export type DeviceMetadata = z.infer<typeof DeviceMetadataSchema>;

/**
 * Item in the user's active BOM (Bill of Materials)
 */
export interface BOMItem {
  uid: string; // Unique row id in the BOM
  device: DeviceItem;
  quantity: number;
  areaGroup: string; // e.g. "核心层", "接入层", "服务器机房", "外联区"
  
  // Custom pricing override per item
  customUnitPrice: number | null; // 未税单价 override (if null, derived from cost_estimate or GPL)
  itemDiscountRate: number | null; // If null, uses global discount
  itemTaxRate?: number; // 单行独立增值税率 (e.g. 0.13, 0.09, 0.06, 0.03, 0)
  notes?: string;

  // Selected accessories with quantity
  selectedAccessories?: {
    accessoryId: string;
    accessoryName: string;
    partNumber: string;
    quantity: number;
    unitPrice: number;
  }[];
}
