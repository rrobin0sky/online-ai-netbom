import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DeviceItem, BOMItem } from '../types/device';
import { AccessoryItem } from '../data/seedDevices';
import LZString from 'lz-string';

interface BOMState {
  // Project settings
  projectName: string;
  clientName: string;
  creatorName: string;
  globalDiscountRate: number; // e.g. 0.3 for 30% GPL
  targetMarginRate: number;   // e.g. 0.25 for 25% margin
  taxRate: number;            // e.g. 0.13 for 13% VAT

  // BOM Cart Items
  items: BOMItem[];

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

  addItem: (device: DeviceItem, areaGroup?: string) => void;
  removeItem: (uid: string) => void;
  updateQuantity: (uid: string, quantity: number) => void;
  updateAreaGroup: (uid: string, group: string) => void;
  updateCustomPrice: (uid: string, price: number | null) => void;
  updateItemDiscount: (uid: string, rate: number | null) => void;
  updateItemNotes: (uid: string, notes: string) => void;
  addAccessoryToItem: (uid: string, accessory: AccessoryItem, quantity?: number) => void;
  removeAccessoryFromItem: (uid: string, accessoryId: string) => void;
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

      addItem: (device, areaGroup = '汇聚接入层') => {
        set((state) => {
          // Check if same device already exists in this area group
          const existing = state.items.find(
            (i) => i.device.id === device.id && i.areaGroup === areaGroup
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.uid === existing.uid ? { ...i, quantity: i.quantity + 1 } : i
              ),
              isDrawerOpen: true,
            };
          }

          const newItem: BOMItem = {
            uid: `${device.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            device,
            quantity: 1,
            areaGroup,
            customUnitPrice: null,
            itemDiscountRate: null,
            notes: '',
            selectedAccessories: [],
          };

          return {
            items: [...state.items, newItem],
            isDrawerOpen: true,
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
          const payload = JSON.parse(decompressed);
          // We can reconstruct items
          // Handled in initialization or component mount
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
      }),
    }
  )
);
