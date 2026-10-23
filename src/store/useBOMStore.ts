import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DeviceItem, BOMItem } from '../types/device';
import { AccessoryItem, SEED_DEVICES, SEED_ACCESSORIES } from '../data/seedDevices';
import { SCENE_TEMPLATES, ProjectTemplate } from '../data/templates';
import LZString from 'lz-string';

interface BOMState {
  // Project settings
  projectName: string;
  clientName: string;
  creatorName: string;
  globalDiscountRate: number; // e.g. 0.3 for 30% GPL
  targetMarginRate: number;   // e.g. 0.25 for 25% margin
  taxRate: number;            // e.g. 0.13 for 13% VAT

  // BOM Cart Items & Catalog customizations
  items: BOMItem[];
  customDevices: DeviceItem[];
  deletedDeviceIds: string[];
  templates: ProjectTemplate[];

  // UI state
  isDrawerOpen: boolean;
  diffDeviceIds: string[]; // Compare 2-4 items

  // Search & Filter state
  searchQuery: string;
  selectedBrand: string | 'all';
  selectedCategory: string | 'all';
  selectedSpeed: string | 'all';
  poeOnly: boolean;
  hideEol: boolean;

  // Actions
  setProjectName: (name: string) => void;
  setClientName: (client: string) => void;
  setGlobalDiscountRate: (rate: number) => void;
  setTargetMarginRate: (rate: number) => void;
  setTaxRate: (rate: number) => void;

  addItem: (
    device: DeviceItem,
    areaGroup?: string,
    quantity?: number,
    customUnitPrice?: number | null
  ) => void;
  removeItem: (uid: string) => void;
  updateQuantity: (uid: string, quantity: number) => void;
  updateAreaGroup: (uid: string, group: string) => void;
  updateCustomPrice: (uid: string, price: number | null) => void;
  updateItemDiscount: (uid: string, rate: number | null) => void;
  updateItemNotes: (uid: string, notes: string) => void;
  addAccessoryToItem: (uid: string, accessory: AccessoryItem, quantity?: number) => void;
  updateAccessoryQuantity: (uid: string, accessoryId: string, quantity: number) => void;
  updateAccessoryPrice: (uid: string, accessoryId: string, unitPrice: number) => void;
  removeAccessoryFromItem: (uid: string, accessoryId: string) => void;

  addCustomDevice: (device: DeviceItem) => void;
  deleteDevice: (deviceId: string) => void;
  restoreDefaultDevices: () => void;

  loadSceneTemplate: (templateId: string) => void;
  saveCurrentBOMAsTemplate: (name: string, badge: string, description: string) => void;
  updateTemplate: (template: ProjectTemplate) => void;
  deleteTemplate: (templateId: string) => void;
  resetTemplates: () => void;

  clearBOM: () => void;

  toggleDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
  toggleDiffDevice: (id: string) => void;
  clearDiff: () => void;

  setSearchQuery: (query: string) => void;
  setSelectedBrand: (brand: string) => void;
  setSelectedCategory: (cat: string) => void;
  setSelectedSpeed: (speed: string) => void;
  setPoeOnly: (poe: boolean) => void;
  setHideEol: (hide: boolean) => void;

  // Export & Share
  generateShareUrl: () => string;
  loadFromShareCode: (code: string) => boolean;
}

export const useBOMStore = create<BOMState>()(
  persist(
    (set, get) => ({
      projectName: '企业综合网络改造与集成方案',
      clientName: '某重点企事业单位 / 数据中心',
      creatorName: '网络规划架构部',
      globalDiscountRate: 0.30,
      targetMarginRate: 0.25,
      taxRate: 0.13,

      items: [],
      customDevices: [],
      deletedDeviceIds: [],
      templates: SCENE_TEMPLATES,

      isDrawerOpen: false,
      diffDeviceIds: [],

      searchQuery: '',
      selectedBrand: 'all',
      selectedCategory: 'all',
      selectedSpeed: 'all',
      poeOnly: false,
      hideEol: true,

      setProjectName: (projectName) => set({ projectName }),
      setClientName: (clientName) => set({ clientName }),
      setGlobalDiscountRate: (globalDiscountRate) => set({ globalDiscountRate }),
      setTargetMarginRate: (targetMarginRate) => set({ targetMarginRate }),
      setTaxRate: (taxRate) => set({ taxRate }),

      addItem: (device, areaGroup = '接入层', quantity = 1, customUnitPrice = null) => {
        const safeQty = Math.max(1, quantity);
        set((state) => {
          const existing = state.items.find(
            (i) => i.device.id === device.id && i.areaGroup === areaGroup
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.uid === existing.uid
                  ? {
                      ...i,
                      quantity: i.quantity + safeQty,
                      customUnitPrice: customUnitPrice !== null ? customUnitPrice : i.customUnitPrice,
                    }
                  : i
              ),
            };
          }

          const newItem: BOMItem = {
            uid: `${device.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            device,
            quantity: safeQty,
            areaGroup,
            customUnitPrice,
            itemDiscountRate: null,
            notes: '',
            selectedAccessories: [],
          };

          return {
            items: [...state.items, newItem],
          };
        });
      },

      removeItem: (uid) => {
        set((state) => ({
          items: state.items.filter((i) => i.uid !== uid),
        }));
      },

      updateQuantity: (uid, quantity) => {
        if (quantity <= 0) {
          get().removeItem(uid);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.uid === uid ? { ...i, quantity } : i)),
        }));
      },

      updateAreaGroup: (uid, areaGroup) => {
        set((state) => ({
          items: state.items.map((i) => (i.uid === uid ? { ...i, areaGroup } : i)),
        }));
      },

      updateCustomPrice: (uid, customUnitPrice) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.uid === uid ? { ...i, customUnitPrice } : i
          ),
        }));
      },

      updateItemDiscount: (uid, itemDiscountRate) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.uid === uid ? { ...i, itemDiscountRate } : i
          ),
        }));
      },

      updateItemNotes: (uid, notes) => {
        set((state) => ({
          items: state.items.map((i) => (i.uid === uid ? { ...i, notes } : i)),
        }));
      },

      addAccessoryToItem: (uid, accessory, quantity = 1) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.uid !== uid) return item;
            const currentAccessories = item.selectedAccessories || [];
            const existingAcc = currentAccessories.find(
              (a) => a.accessoryId === accessory.id
            );
            if (existingAcc) {
              return {
                ...item,
                selectedAccessories: currentAccessories.map((a) =>
                  a.accessoryId === accessory.id
                    ? { ...a, quantity: a.quantity + quantity }
                    : a
                ),
              };
            }
            return {
              ...item,
              selectedAccessories: [
                ...currentAccessories,
                {
                  accessoryId: accessory.id,
                  accessoryName: accessory.name,
                  partNumber: accessory.part_number,
                  quantity,
                  unitPrice: accessory.reference_price,
                },
              ],
            };
          }),
        }));
      },

      updateAccessoryQuantity: (uid, accessoryId, quantity) => {
        if (quantity <= 0) {
          get().removeAccessoryFromItem(uid, accessoryId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) => {
            if (item.uid !== uid) return item;
            return {
              ...item,
              selectedAccessories: (item.selectedAccessories || []).map((a) =>
                a.accessoryId === accessoryId ? { ...a, quantity } : a
              ),
            };
          }),
        }));
      },

      updateAccessoryPrice: (uid, accessoryId, unitPrice) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.uid !== uid) return item;
            return {
              ...item,
              selectedAccessories: (item.selectedAccessories || []).map((a) =>
                a.accessoryId === accessoryId ? { ...a, unitPrice } : a
              ),
            };
          }),
        }));
      },

      removeAccessoryFromItem: (uid, accessoryId) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.uid !== uid) return item;
            return {
              ...item,
              selectedAccessories: (item.selectedAccessories || []).filter(
                (a) => a.accessoryId !== accessoryId
              ),
            };
          }),
        }));
      },

      addCustomDevice: (device) => {
        set((state) => ({
          customDevices: [device, ...state.customDevices.filter((d) => d.id !== device.id)],
          deletedDeviceIds: state.deletedDeviceIds.filter((id) => id !== device.id),
          items: state.items.map((item) =>
            item.device.id === device.id ? { ...item, device } : item
          ),
        }));
      },

      deleteDevice: (deviceId) => {
        set((state) => ({
          customDevices: state.customDevices.filter((d) => d.id !== deviceId),
          deletedDeviceIds: state.deletedDeviceIds.includes(deviceId)
            ? state.deletedDeviceIds
            : [...state.deletedDeviceIds, deviceId],
          diffDeviceIds: state.diffDeviceIds.filter((id) => id !== deviceId),
        }));
      },

      restoreDefaultDevices: () => {
        set({ deletedDeviceIds: [] });
      },

      loadSceneTemplate: (templateId) => {
        const currentTemplates = get().templates?.length ? get().templates : SCENE_TEMPLATES;
        const template = currentTemplates.find((t) => t.id === templateId);
        if (!template) return;

        const allAvailableDevices = [...SEED_DEVICES, ...get().customDevices];
        const newItems: BOMItem[] = [];

        template.items.forEach((itemDef) => {
          const device = allAvailableDevices.find((d) => d.id === itemDef.deviceId);
          if (!device) return;

          const accessories = (itemDef.accessories || []).map((accDef) => {
            const acc = SEED_ACCESSORIES.find((a) => a.id === accDef.accessoryId);
            return {
              accessoryId: accDef.accessoryId,
              accessoryName: acc ? acc.name : '网络配件',
              partNumber: acc ? acc.part_number : '',
              quantity: accDef.quantity,
              unitPrice: acc ? acc.reference_price : 0,
            };
          });

          newItems.push({
            uid: `${device.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            device,
            quantity: itemDef.quantity,
            areaGroup: itemDef.areaGroup,
            customUnitPrice: null,
            itemDiscountRate: null,
            notes: '',
            selectedAccessories: accessories,
          });
        });

        set({
          projectName: template.name,
          globalDiscountRate: template.recommendedDiscount,
          items: newItems,
          isDrawerOpen: true,
        });
      },

      saveCurrentBOMAsTemplate: (name, badge, description) => {
        const state = get();
        if (state.items.length === 0) return;
        const newTemplate: ProjectTemplate = {
          id: `tmpl-${Date.now()}`,
          name: name.trim() || state.projectName || '自定义方案模板',
          badge: badge.trim() || '自定义模板',
          description: description.trim() || `包含 ${state.items.length} 项网络设备配置`,
          recommendedDiscount: state.globalDiscountRate,
          items: state.items.map((item) => ({
            deviceId: item.device.id,
            quantity: item.quantity,
            areaGroup: item.areaGroup,
            accessories: (item.selectedAccessories || []).map((a) => ({
              accessoryId: a.accessoryId,
              quantity: a.quantity,
            })),
          })),
        };
        set((s) => ({
          templates: [newTemplate, ...(s.templates?.length ? s.templates : SCENE_TEMPLATES)],
        }));
      },

      updateTemplate: (updated) => {
        set((state) => ({
          templates: (state.templates?.length ? state.templates : SCENE_TEMPLATES).map((t) =>
            t.id === updated.id ? updated : t
          ),
        }));
      },

      deleteTemplate: (templateId) => {
        set((state) => ({
          templates: (state.templates?.length ? state.templates : SCENE_TEMPLATES).filter(
            (t) => t.id !== templateId
          ),
        }));
      },

      resetTemplates: () => {
        set({ templates: SCENE_TEMPLATES });
      },

      clearBOM: () => set({ items: [] }),

      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
      setDrawerOpen: (isDrawerOpen) => set({ isDrawerOpen }),

      toggleDiffDevice: (id) => {
        set((state) => {
          if (state.diffDeviceIds.includes(id)) {
            return { diffDeviceIds: state.diffDeviceIds.filter((d) => d !== id) };
          }
          if (state.diffDeviceIds.length >= 4) {
            alert('最多同时横向比选 4 款设备');
            return state;
          }
          return { diffDeviceIds: [...state.diffDeviceIds, id] };
        });
      },
      clearDiff: () => set({ diffDeviceIds: [] }),

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedBrand: (selectedBrand) => set({ selectedBrand }),
      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
      setSelectedSpeed: (selectedSpeed) => set({ selectedSpeed }),
      setPoeOnly: (poeOnly) => set({ poeOnly }),
      setHideEol: (hideEol) => set({ hideEol }),

      generateShareUrl: () => {
        const state = get();
        const payload = {
          p: state.projectName,
          c: state.clientName,
          d: state.globalDiscountRate,
          m: state.targetMarginRate,
          t: state.taxRate,
          items: state.items.map((i) => ({
            id: i.device.id,
            q: i.quantity,
            g: i.areaGroup,
            p: i.customUnitPrice,
            d: i.itemDiscountRate,
            n: i.notes,
            acc: i.selectedAccessories,
          })),
        };
        const compressed = LZString.compressToEncodedURIComponent(
          JSON.stringify(payload)
        );
        const url = new URL(window.location.href);
        url.searchParams.set('bom', compressed);
        return url.toString();
      },

      loadFromShareCode: (code) => {
        try {
          const decompressed = LZString.decompressFromEncodedURIComponent(code);
          if (!decompressed) return false;
          JSON.parse(decompressed);
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'netbom_storage_v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        projectName: state.projectName,
        clientName: state.clientName,
        creatorName: state.creatorName,
        globalDiscountRate: state.globalDiscountRate,
        targetMarginRate: state.targetMarginRate,
        taxRate: state.taxRate,
        items: state.items,
        customDevices: state.customDevices,
        deletedDeviceIds: state.deletedDeviceIds,
        templates: state.templates,
      }),
    }
  )
);

/**
 * Merge custom/edited devices with SEED_DEVICES, excluding deletedDeviceIds
 */
export function getMergedCatalog(
  customDevices: DeviceItem[],
  deletedDeviceIds: string[] = []
): DeviceItem[] {
  const deletedSet = new Set(deletedDeviceIds);
  const customMap = new Map(customDevices.map((d) => [d.id, d]));
  const overriddenSeed = SEED_DEVICES.map((s) => customMap.get(s.id) || s);
  const seedIds = new Set(SEED_DEVICES.map((s) => s.id));
  const brandNewCustom = customDevices.filter((c) => !seedIds.has(c.id));
  return [...brandNewCustom, ...overriddenSeed].filter((d) => !deletedSet.has(d.id));
}
