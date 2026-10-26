import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DeviceItem, BOMItem } from '../types/device';
import { AccessoryItem, SEED_DEVICES, SEED_ACCESSORIES } from '../data/seedDevices';
import { EngineeringItem, BOMServiceItem, SEED_SERVICES } from '../data/seedServices';
import { SCENE_TEMPLATES, ProjectTemplate } from '../data/templates';
import LZString from 'lz-string';

export const DEFAULT_BRANDS = ['Huawei', 'H3C', 'Cisco', 'Ruijie', 'FS.com'];
export const DEFAULT_SERVICE_CATEGORIES = ['弱电材料', '布线人工', '作业费', '项目管理费'];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

interface BOMState {
  // Project settings
  projectName: string;
  clientName: string;
  creatorName: string;
  quoteValidityDays: number;
  globalDiscountRate: number;
  targetMarginRate: number;
  taxRate: number; // Default equipment VAT rate (e.g. 0.13)

  // Workspace view mode
  workspaceTab: 'devices' | 'services';
  selectedServiceCategory: string;

  // BOM Cart Items & Catalog customizations
  items: BOMItem[];
  serviceItems: BOMServiceItem[];
  customDevices: DeviceItem[];
  deletedDeviceIds: string[];
  deletedCustomDevices: DeviceItem[];
  purgedDeviceIds: string[];
  customServices: EngineeringItem[];
  deletedServiceIds: string[];
  templates: ProjectTemplate[];
  brands: string[];
  brandRenames: Record<string, string>;

  // UI state
  isDrawerOpen: boolean;
  isSaveModalOpen: boolean;
  isSyncing: boolean;
  syncCode: string;
  syncPassword: string;
  lastSyncedAt: number | null;
  diffDeviceIds: string[];

  // Search & Filter state
  searchQuery: string;
  selectedBrand: string | 'all';
  selectedCategory: string | 'all';
  selectedSpeed: string | 'all';
  poeOnly: boolean;
  hideEol: boolean;
  recentOnly: boolean;
  unpricedOnly: boolean;
  trashView: boolean;

  // Actions
  setWorkspaceTab: (tab: 'devices' | 'services') => void;
  setSelectedServiceCategory: (cat: string) => void;

  setSyncCode: (code: string) => void;
  setSyncPassword: (pass: string) => void;
  setSaveModalOpen: (open: boolean) => void;
  saveToCloud: (code?: string, pass?: string) => Promise<{ success: boolean; message: string }>;
  loadFromCloud: (code: string, pass?: string) => Promise<{ success: boolean; message: string }>;

  setProjectName: (name: string) => void;
  setClientName: (client: string) => void;
  setQuoteValidityDays: (days: number) => void;
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
  updateCustomPrice: (uid: string, priceExclTax: number | null) => void;
  updateItemTaxRate: (uid: string, rate: number) => void;
  updateItemDiscount: (uid: string, rate: number | null) => void;
  updateItemNotes: (uid: string, notes: string) => void;
  addAccessoryToItem: (uid: string, accessory: AccessoryItem, quantity?: number) => void;
  updateAccessoryQuantity: (uid: string, accessoryId: string, quantity: number) => void;
  updateAccessoryPrice: (uid: string, accessoryId: string, unitPrice: number) => void;
  removeAccessoryFromItem: (uid: string, accessoryId: string) => void;

  // Service / Low-voltage / Labor / Fee BOM Actions
  addServiceItem: (item: EngineeringItem, quantity?: number) => void;
  addBlankServiceRow: (category?: string) => void;
  removeServiceItem: (uid: string) => void;
  updateServiceItem: (uid: string, patch: Partial<BOMServiceItem>) => void;
  updateServicePrice: (uid: string, value: number, isInclTax: boolean) => void;
  updateServiceTaxRate: (uid: string, taxRate: number) => void;

  // Service Catalog Actions
  addCustomService: (item: EngineeringItem) => void;
  deleteServiceCatalogItem: (id: string) => void;
  restoreDefaultServices: () => void;

  // Device Catalog & Trash Actions
  addCustomDevice: (device: DeviceItem) => void;
  deleteDevice: (deviceId: string) => void;
  restoreDevice: (deviceId: string) => void;
  permanentlyDeleteDevice: (deviceId: string) => void;
  emptyTrash: () => void;
  restoreDefaultDevices: () => void;

  addBrand: (brandName: string) => void;
  renameBrand: (oldName: string, newName: string) => void;
  deleteBrand: (brandName: string) => void;
  resetBrands: () => void;

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
  setRecentOnly: (recent: boolean) => void;
  setUnpricedOnly: (unpriced: boolean) => void;
  setTrashView: (trash: boolean) => void;

  generateShareUrl: () => string;
  loadFromShareCode: (code: string) => boolean;
}

export const useBOMStore = create<BOMState>()(
  persist(
    (set, get) => ({
      projectName: '企业综合网络改造与集成方案',
      clientName: '某重点企事业单位 / 数据中心',
      creatorName: '网络规划架构部',
      quoteValidityDays: 30,
      globalDiscountRate: 0.30,
      targetMarginRate: 0.25,
      taxRate: 0.13,

      workspaceTab: 'devices',
      selectedServiceCategory: 'all',

      items: [],
      serviceItems: [],
      customDevices: [],
      deletedDeviceIds: [],
      deletedCustomDevices: [],
      purgedDeviceIds: [],
      customServices: [],
      deletedServiceIds: [],
      templates: SCENE_TEMPLATES,
      brands: DEFAULT_BRANDS,
      brandRenames: {},

      isDrawerOpen: false,
      isSaveModalOpen: false,
      isSyncing: false,
      syncCode: 'BOM-8823',
      syncPassword: '',
      lastSyncedAt: null,
      diffDeviceIds: [],

      searchQuery: '',
      selectedBrand: 'all',
      selectedCategory: 'all',
      selectedSpeed: 'all',
      poeOnly: false,
      hideEol: true,
      recentOnly: false,
      unpricedOnly: false,
      trashView: false,

      setSyncCode: (syncCode) => set({ syncCode }),
      setSyncPassword: (syncPassword) => set({ syncPassword }),
      setSaveModalOpen: (isSaveModalOpen) => set({ isSaveModalOpen }),

      setWorkspaceTab: (workspaceTab) => set({ workspaceTab, trashView: false }),
      setSelectedServiceCategory: (selectedServiceCategory) => set({ selectedServiceCategory }),

      setProjectName: (projectName) => set({ projectName }),
      setClientName: (clientName) => set({ clientName }),
      setQuoteValidityDays: (quoteValidityDays) => set({ quoteValidityDays }),
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
            itemTaxRate: state.taxRate,
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
            i.uid === uid
              ? { ...i, customUnitPrice: customUnitPrice !== null ? round2(customUnitPrice) : null }
              : i
          ),
        }));
      },

      updateItemTaxRate: (uid, itemTaxRate) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.uid === uid ? { ...i, itemTaxRate } : i
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

      // === Service / Low-voltage / Labor / Fee Actions ===
      addServiceItem: (service, quantity = 1) => {
        const safeQty = Math.max(1, quantity);
        set((state) => {
          const currentList = state.serviceItems || [];
          const existing = currentList.find((s) => s.item.id === service.id);
          if (existing) {
            return {
              serviceItems: currentList.map((s) =>
                s.uid === existing.uid
                  ? {
                      ...s,
                      quantity: s.pricingMode === 'percent' ? 1 : s.quantity + safeQty,
                    }
                  : s
              ),
            };
          }

          const newEntry: BOMServiceItem = {
            uid: `srv-${service.id}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            item: service,
            quantity: service.pricingMode === 'percent' ? 1 : safeQty,
            pricingMode: service.pricingMode,
            unitPriceExclTax: service.unitPriceExclTax,
            unitPriceInclTax: service.unitPriceInclTax,
            percentageRate: service.percentageRate ?? 5,
            taxRate: service.taxRate,
            notes: service.notes || '',
          };

          return {
            serviceItems: [...currentList, newEntry],
          };
        });
      },

      addBlankServiceRow: (category = '弱电材料') => {
        const defaultTax =
          category === '弱电材料' ? 0.13 : category === '项目管理费' ? 0.06 : 0.09;
        const defaultUnit =
          category === '弱电材料'
            ? '米'
            : category === '布线人工'
            ? '点'
            : category === '作业费'
            ? '项'
            : '项';
        const isPercent = category === '项目管理费';
        const newItem: EngineeringItem = {
          id: `custom-srv-${Date.now()}`,
          category,
          brand: category,
          name: `自定义${category}`,
          model: '标准规格',
          part_number: `SRV-${Math.floor(100 + Math.random() * 900)}`,
          specs: '按工程现场标准执行',
          unit: isPercent ? '%' : defaultUnit,
          pricingMode: isPercent ? 'percent' : 'fixed',
          unitPriceExclTax: round2(100 / (1 + defaultTax)),
          unitPriceInclTax: 100,
          percentageRate: 5,
          taxRate: defaultTax,
        };
        get().addServiceItem(newItem, 1);
      },

      removeServiceItem: (uid) => {
        set((state) => ({
          serviceItems: (state.serviceItems || []).filter((s) => s.uid !== uid),
        }));
      },

      updateServiceItem: (uid, patch) => {
        set((state) => ({
          serviceItems: (state.serviceItems || []).map((s) => {
            if (s.uid !== uid) return s;
            const updatedItem = {
              ...s.item,
              ...(patch.item || {}),
            };
            return {
              ...s,
              ...patch,
              item: updatedItem,
            };
          }),
        }));
      },

      updateServicePrice: (uid, value, isInclTax) => {
        const safeVal = Math.max(0, Number(value) || 0);
        set((state) => ({
          serviceItems: (state.serviceItems || []).map((s) => {
            if (s.uid !== uid) return s;
            if (isInclTax) {
              return {
                ...s,
                pricingMode: 'fixed',
                unitPriceInclTax: round2(safeVal),
                unitPriceExclTax: round2(safeVal / (1 + s.taxRate)),
              };
            } else {
              return {
                ...s,
                pricingMode: 'fixed',
                unitPriceExclTax: round2(safeVal),
                unitPriceInclTax: round2(safeVal * (1 + s.taxRate)),
              };
            }
          }),
        }));
      },

      updateServiceTaxRate: (uid, taxRate) => {
        set((state) => ({
          serviceItems: (state.serviceItems || []).map((s) => {
            if (s.uid !== uid) return s;
            return {
              ...s,
              taxRate,
              unitPriceInclTax: round2(s.unitPriceExclTax * (1 + taxRate)),
            };
          }),
        }));
      },

      addCustomService: (srv) => {
        set((state) => ({
          customServices: [srv, ...(state.customServices || []).filter((c) => c.id !== srv.id)],
          deletedServiceIds: (state.deletedServiceIds || []).filter((id) => id !== srv.id),
          serviceItems: (state.serviceItems || []).map((si) =>
            si.item.id === srv.id
              ? {
                  ...si,
                  item: srv,
                  taxRate: srv.taxRate,
                  pricingMode: srv.pricingMode,
                  unitPriceExclTax: srv.unitPriceExclTax,
                  unitPriceInclTax: srv.unitPriceInclTax,
                  percentageRate: srv.percentageRate ?? si.percentageRate,
                }
              : si
          ),
        }));
      },

      deleteServiceCatalogItem: (id) => {
        set((state) => ({
          customServices: (state.customServices || []).filter((c) => c.id !== id),
          deletedServiceIds: (state.deletedServiceIds || []).includes(id)
            ? state.deletedServiceIds
            : [...(state.deletedServiceIds || []), id],
        }));
      },

      restoreDefaultServices: () => {
        set({ deletedServiceIds: [] });
      },

      addCustomDevice: (device) => {
        set((state) => {
          const currentBrands = state.brands?.length ? state.brands : DEFAULT_BRANDS;
          const nextBrands = currentBrands.includes(device.brand)
            ? currentBrands
            : [...currentBrands, device.brand];
          return {
            brands: nextBrands,
            customDevices: [device, ...state.customDevices.filter((d) => d.id !== device.id)],
            deletedDeviceIds: state.deletedDeviceIds.filter((id) => id !== device.id),
            deletedCustomDevices: (state.deletedCustomDevices || []).filter(
              (d) => d.id !== device.id
            ),
            items: state.items.map((item) =>
              item.device.id === device.id ? { ...item, device } : item
            ),
          };
        });
      },

      deleteDevice: (deviceId) => {
        set((state) => {
          const customDev = state.customDevices.find((d) => d.id === deviceId);
          return {
            customDevices: state.customDevices.filter((d) => d.id !== deviceId),
            deletedCustomDevices: customDev
              ? [
                  customDev,
                  ...(state.deletedCustomDevices || []).filter((d) => d.id !== deviceId),
                ]
              : state.deletedCustomDevices || [],
            deletedDeviceIds: state.deletedDeviceIds.includes(deviceId)
              ? state.deletedDeviceIds
              : [...state.deletedDeviceIds, deviceId],
            diffDeviceIds: state.diffDeviceIds.filter((id) => id !== deviceId),
          };
        });
      },

      restoreDevice: (deviceId) => {
        set((state) => {
          const restoredCustom = (state.deletedCustomDevices || []).find(
            (d) => d.id === deviceId
          );
          const nextDeletedIds = state.deletedDeviceIds.filter((id) => id !== deviceId);
          return {
            deletedDeviceIds: nextDeletedIds,
            deletedCustomDevices: (state.deletedCustomDevices || []).filter(
              (d) => d.id !== deviceId
            ),
            customDevices: restoredCustom
              ? [restoredCustom, ...state.customDevices.filter((d) => d.id !== deviceId)]
              : state.customDevices,
            trashView: nextDeletedIds.length === 0 ? false : state.trashView,
          };
        });
      },

      permanentlyDeleteDevice: (deviceId) => {
        set((state) => {
          const nextDeletedIds = state.deletedDeviceIds.filter((id) => id !== deviceId);
          const nextPurged = (state.purgedDeviceIds || []).includes(deviceId)
            ? state.purgedDeviceIds
            : [...(state.purgedDeviceIds || []), deviceId];
          return {
            deletedDeviceIds: nextDeletedIds,
            purgedDeviceIds: nextPurged,
            deletedCustomDevices: (state.deletedCustomDevices || []).filter(
              (d) => d.id !== deviceId
            ),
            customDevices: state.customDevices.filter((d) => d.id !== deviceId),
            trashView: nextDeletedIds.length === 0 ? false : state.trashView,
          };
        });
      },

      emptyTrash: () => {
        set((state) => {
          const currentPurged = state.purgedDeviceIds || [];
          const currentDeleted = state.deletedDeviceIds || [];
          const mergedPurged = Array.from(new Set([...currentPurged, ...currentDeleted]));
          return {
            deletedDeviceIds: [],
            purgedDeviceIds: mergedPurged,
            deletedCustomDevices: [],
            trashView: false,
          };
        });
      },

      restoreDefaultDevices: () => {
        set((state) => ({
          deletedDeviceIds: [],
          customDevices: [
            ...(state.deletedCustomDevices || []),
            ...state.customDevices,
          ],
          deletedCustomDevices: [],
          trashView: false,
        }));
      },

      addBrand: (brandName) => {
        const clean = brandName.trim();
        if (!clean) return;
        set((state) => {
          const current = state.brands?.length ? state.brands : DEFAULT_BRANDS;
          if (current.includes(clean)) return state;
          return { brands: [...current, clean] };
        });
      },

      renameBrand: (oldName, newName) => {
        const clean = newName.trim();
        if (!clean || clean === oldName) return;
        set((state) => {
          const currentBrands = state.brands?.length ? state.brands : DEFAULT_BRANDS;
          const nextBrands = currentBrands.map((b) => (b === oldName ? clean : b));
          const nextRenames = { ...(state.brandRenames || {}) };
          Object.keys(nextRenames).forEach((k) => {
            if (nextRenames[k] === oldName) nextRenames[k] = clean;
          });
          nextRenames[oldName] = clean;

          return {
            brands: Array.from(new Set(nextBrands)),
            brandRenames: nextRenames,
            selectedBrand: state.selectedBrand === oldName ? clean : state.selectedBrand,
            customDevices: state.customDevices.map((d) =>
              d.brand === oldName ? { ...d, brand: clean } : d
            ),
            items: state.items.map((item) =>
              item.device.brand === oldName
                ? { ...item, device: { ...item.device, brand: clean } }
                : item
            ),
          };
        });
      },

      deleteBrand: (brandName) => {
        set((state) => {
          const currentBrands = state.brands?.length ? state.brands : DEFAULT_BRANDS;
          return {
            brands: currentBrands.filter((b) => b !== brandName),
            selectedBrand: state.selectedBrand === brandName ? 'all' : state.selectedBrand,
          };
        });
      },

      resetBrands: () => {
        set({
          brands: DEFAULT_BRANDS,
          brandRenames: {},
          selectedBrand: 'all',
        });
      },

      loadSceneTemplate: (templateId) => {
        const currentTemplates = get().templates?.length ? get().templates : SCENE_TEMPLATES;
        const template = currentTemplates.find((t) => t.id === templateId);
        if (!template) return;

        const allAvailableDevices = getMergedCatalog(
          get().customDevices,
          get().deletedDeviceIds,
          get().brandRenames
        );
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
            itemTaxRate: get().taxRate,
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

      clearBOM: () => set({ items: [], serviceItems: [] }),

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
      setRecentOnly: (recentOnly) =>
        set({ recentOnly, trashView: false }),
      setUnpricedOnly: (unpricedOnly) =>
        set({ unpricedOnly, trashView: false }),
      setTrashView: (trashView) =>
        set({
          trashView,
          recentOnly: trashView ? false : get().recentOnly,
          unpricedOnly: trashView ? false : get().unpricedOnly,
        }),

      generateShareUrl: () => {
        const state = get();
        const payload = {
          p: state.projectName,
          c: state.clientName,
          v: state.quoteValidityDays,
          d: state.globalDiscountRate,
          m: state.targetMarginRate,
          t: state.taxRate,
          items: state.items.map((i) => ({
            id: i.device.id,
            q: i.quantity,
            g: i.areaGroup,
            p: i.customUnitPrice,
            d: i.itemDiscountRate,
            tx: i.itemTaxRate,
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

      saveToCloud: async (targetCode, pass) => {
        const state = get();
        const code = (targetCode || state.syncCode || 'BOM-8823').trim().toUpperCase();
        const password = pass !== undefined ? pass : state.syncPassword;
        set({ isSyncing: true });
        try {
          const payload = {
            projectName: state.projectName,
            clientName: state.clientName,
            creatorName: state.creatorName,
            quoteValidityDays: state.quoteValidityDays,
            globalDiscountRate: state.globalDiscountRate,
            targetMarginRate: state.targetMarginRate,
            taxRate: state.taxRate,
            items: state.items,
            serviceItems: state.serviceItems,
            customDevices: state.customDevices,
            deletedDeviceIds: state.deletedDeviceIds,
            deletedCustomDevices: state.deletedCustomDevices,
            purgedDeviceIds: state.purgedDeviceIds,
            customServices: state.customServices,
            deletedServiceIds: state.deletedServiceIds,
            templates: state.templates,
            brands: state.brands,
            brandRenames: state.brandRenames,
          };

          const res = await fetch('https://bin0sky.tech/api/bom/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, pass: password, payload }),
          });

          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error || '保存到云端失败');
          }

          set({
            syncCode: code,
            syncPassword: password,
            lastSyncedAt: Date.now(),
            isSyncing: false,
          });
          return { success: true, message: `已成功保存到云端，同步码：${code}` };
        } catch (err: any) {
          set({ isSyncing: false });
          return { success: false, message: err?.message || '网络或服务异常' };
        }
      },

      loadFromCloud: async (inputCode, pass) => {
        const cleanCode = (inputCode || '').trim().toUpperCase();
        if (!cleanCode) {
          return { success: false, message: '请输入同步码' };
        }
        set({ isSyncing: true });
        try {
          const url = new URL('https://bin0sky.tech/api/bom/sync');
          url.searchParams.set('code', cleanCode);
          if (pass) url.searchParams.set('pass', pass.trim());

          const res = await fetch(url.toString());
          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error || '从云端读取失败');
          }

          const p = data.payload || {};
          set({
            syncCode: cleanCode,
            syncPassword: pass || '',
            lastSyncedAt: data.updatedAt || Date.now(),
            isSyncing: false,
            ...(p.projectName !== undefined ? { projectName: p.projectName } : {}),
            ...(p.clientName !== undefined ? { clientName: p.clientName } : {}),
            ...(p.creatorName !== undefined ? { creatorName: p.creatorName } : {}),
            ...(p.quoteValidityDays !== undefined ? { quoteValidityDays: p.quoteValidityDays } : {}),
            ...(p.globalDiscountRate !== undefined ? { globalDiscountRate: p.globalDiscountRate } : {}),
            ...(p.targetMarginRate !== undefined ? { targetMarginRate: p.targetMarginRate } : {}),
            ...(p.taxRate !== undefined ? { taxRate: p.taxRate } : {}),
            ...(p.items ? { items: p.items } : {}),
            ...(p.serviceItems ? { serviceItems: p.serviceItems } : {}),
            ...(p.customDevices ? { customDevices: p.customDevices } : {}),
            ...(p.deletedDeviceIds ? { deletedDeviceIds: p.deletedDeviceIds } : {}),
            ...(p.deletedCustomDevices ? { deletedCustomDevices: p.deletedCustomDevices } : {}),
            ...(p.purgedDeviceIds ? { purgedDeviceIds: p.purgedDeviceIds } : {}),
            ...(p.customServices ? { customServices: p.customServices } : {}),
            ...(p.deletedServiceIds ? { deletedServiceIds: p.deletedServiceIds } : {}),
            ...(p.templates ? { templates: p.templates } : {}),
            ...(p.brands ? { brands: p.brands } : {}),
            ...(p.brandRenames ? { brandRenames: p.brandRenames } : {}),
          });

          return { success: true, message: `成功载入云端项目 [${cleanCode}]` };
        } catch (err: any) {
          set({ isSyncing: false });
          return { success: false, message: err?.message || '网络或服务异常' };
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
        quoteValidityDays: state.quoteValidityDays,
        globalDiscountRate: state.globalDiscountRate,
        targetMarginRate: state.targetMarginRate,
        taxRate: state.taxRate,
        items: state.items,
        serviceItems: state.serviceItems,
        customDevices: state.customDevices,
        deletedDeviceIds: state.deletedDeviceIds,
        deletedCustomDevices: state.deletedCustomDevices,
        purgedDeviceIds: state.purgedDeviceIds,
        customServices: state.customServices,
        deletedServiceIds: state.deletedServiceIds,
        templates: state.templates,
        brands: state.brands,
        brandRenames: state.brandRenames,
        syncCode: state.syncCode,
        syncPassword: state.syncPassword,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);

/**
 * Merge custom/edited devices with SEED_DEVICES, excluding deletedDeviceIds and purgedDeviceIds, and applying brandRenames
 */
export function getMergedCatalog(
  customDevices: DeviceItem[],
  deletedDeviceIds: string[] = [],
  brandRenames: Record<string, string> = {},
  purgedDeviceIds: string[] = []
): DeviceItem[] {
  const hiddenSet = new Set([...deletedDeviceIds, ...purgedDeviceIds]);
  const customMap = new Map(customDevices.map((d) => [d.id, d]));
  const overriddenSeed = SEED_DEVICES.map((s) => {
    const dev = customMap.get(s.id) || s;
    const renamedBrand = brandRenames[dev.brand] || dev.brand;
    return renamedBrand !== dev.brand ? { ...dev, brand: renamedBrand } : dev;
  });
  const seedIds = new Set(SEED_DEVICES.map((s) => s.id));
  const brandNewCustom = customDevices.filter((c) => !seedIds.has(c.id));
  return [...brandNewCustom, ...overriddenSeed].filter((d) => !hiddenSet.has(d.id));
}

/**
 * Get deleted devices in the Trash / Recycle Bin, excluding permanently purged ones
 */
export function getDeletedDevicesCatalog(
  deletedDeviceIds: string[] = [],
  deletedCustomDevices: DeviceItem[] = [],
  brandRenames: Record<string, string> = {},
  purgedDeviceIds: string[] = []
): DeviceItem[] {
  const purgedSet = new Set(purgedDeviceIds);
  const activeDeletedIds = deletedDeviceIds.filter((id) => !purgedSet.has(id));
  const deletedSet = new Set(activeDeletedIds);

  const deletedSeeds = SEED_DEVICES.filter((s) => deletedSet.has(s.id)).map((dev) => {
    const renamedBrand = brandRenames[dev.brand] || dev.brand;
    return renamedBrand !== dev.brand ? { ...dev, brand: renamedBrand } : dev;
  });
  const seedIds = new Set(SEED_DEVICES.map((s) => s.id));
  const deletedCustom = (deletedCustomDevices || []).filter(
    (c) => deletedSet.has(c.id) && !seedIds.has(c.id)
  );
  return [...deletedCustom, ...deletedSeeds];
}

/**
 * Merge custom/edited engineering services with SEED_SERVICES, excluding deletedServiceIds
 */
export function getMergedServiceCatalog(
  customServices: EngineeringItem[] = [],
  deletedServiceIds: string[] = []
): EngineeringItem[] {
  const deletedSet = new Set(deletedServiceIds);
  const customMap = new Map(customServices.map((s) => [s.id, s]));
  const overriddenSeed = SEED_SERVICES.map((s) => customMap.get(s.id) || s);
  const seedIds = new Set(SEED_SERVICES.map((s) => s.id));
  const brandNewCustom = customServices.filter((c) => !seedIds.has(c.id));
  return [...brandNewCustom, ...overriddenSeed].filter((s) => !deletedSet.has(s.id));
}
