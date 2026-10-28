import React, { useState, useMemo } from 'react';
import {
  Plus,
  Minus,
  Check,
  ChevronDown,
  ChevronUp,
  Edit3,
  Trash2,
  SearchX,
  X,
  Lock,
  RotateCcw,
} from 'lucide-react';
import {
  useBOMStore,
  getMergedServiceCatalog,
  getDeletedServicesCatalog,
  DEFAULT_SERVICE_CATEGORIES,
} from '../store/useBOMStore';
import { EngineeringItem } from '../data/seedServices';

const CARD_BTN =
  'h-7 px-2.5 rounded-md bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-zinc-200 hover:text-white text-xs font-medium inline-flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap';

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

interface ServiceCardProps {
  item: EngineeringItem;
  isTrash?: boolean;
  onEdit: (item: EngineeringItem) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ item, isTrash = false, onEdit }) => {
  const {
    serviceItems,
    addServiceItem,
    deleteServiceCatalogItem,
    restoreService,
    permanentlyDeleteService,
    isCostUnlocked,
    setCostModalOpen,
    isAdmin,
  } = useBOMStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [addQty, setAddQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const inBomEntry = (serviceItems || []).find((s) => s.item.id === item.id);
  const inBomQty = inBomEntry ? inBomEntry.quantity : 0;
  const isAdded = inBomQty > 0 || justAdded;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addServiceItem(item, addQty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`确定从库中删除「${item.name}」吗？`)) {
      deleteServiceCatalogItem(item.id);
    }
  };

  const handleRestore = (e: React.MouseEvent) => {
    e.stopPropagation();
    restoreService(item.id);
  };

  const handlePermanentDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`确定从回收站彻底删除「${item.name}」吗？彻底删除后不可恢复。`)) {
      permanentlyDeleteService(item.id);
    }
  };

  return (
    <div className="glass-panel rounded-xl p-3.5 transition-all duration-150 hover:border-white/20">
      {/* Primary Compact Area */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="cursor-pointer select-none"
      >
        <div className="flex items-start justify-between gap-2.5">
          {/* Left: Category + Name */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-medium bg-white/[0.05] text-zinc-300 border border-white/10">
                {item.category}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-400 bg-white/[0.03] border border-white/5">
                税 {(item.taxRate * 100).toFixed(0)}%
              </span>
            </div>
            <h3 className="text-sm font-bold text-zinc-100 tracking-tight truncate mt-1">
              {item.name}
            </h3>
            <div className="text-xs text-zinc-400 truncate mt-0.5">
              {item.model}
            </div>
          </div>

          {/* Right: Price Display */}
          <div className="text-right flex-shrink-0">
            {item.pricingMode === 'percent' ? (
              <div>
                <div className="text-sm font-bold font-mono text-zinc-100">
                  {item.percentageRate ?? 5}%
                </div>
                <div className="text-[10px] font-mono text-zinc-500">
                  按比例计费
                </div>
              </div>
            ) : isCostUnlocked ? (
              <div>
                <div className="text-sm font-bold font-mono text-zinc-100">
                  ¥{item.unitPriceInclTax.toLocaleString()}
                  <span className="text-[11px] font-normal text-zinc-400">
                    /{item.unit}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-zinc-500">
                  未税 ¥{item.unitPriceExclTax.toLocaleString()}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCostModalOpen(true);
                }}
                className="mt-1 text-[10px] font-medium text-zinc-400 hover:text-zinc-200 bg-white/[0.04] hover:bg-white/[0.08] px-1.5 py-0.5 rounded border border-white/10 inline-flex items-center gap-1 transition-colors cursor-pointer"
                title="输入口令查看内部工程成本"
              >
                <Lock className="w-2.5 h-2.5 text-zinc-500" />
                <span>成本锁定</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-white/5">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={CARD_BTN}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
              <span>收起</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              <span>详情</span>
            </>
          )}
        </button>

        {isTrash ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleRestore}
              className={CARD_BTN}
              title="还原到弱电服务库"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
              <span>还原</span>
            </button>
            <button
              type="button"
              onClick={handlePermanentDelete}
              className={`${CARD_BTN} hover:text-rose-300`}
              title="从回收站彻底删除"
            >
              <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>彻底删除</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            {item.pricingMode !== 'percent' && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center bg-white/[0.04] border border-white/10 rounded-md overflow-hidden h-7"
              >
                <button
                  type="button"
                  onClick={() => setAddQty((q) => Math.max(1, q - 1))}
                  className="w-6 h-full flex items-center justify-center hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  min={1}
                  value={addQty}
                  onChange={(e) => setAddQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-8 text-center bg-transparent font-mono text-xs font-medium text-zinc-100 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setAddQty((q) => q + 1)}
                  className="w-6 h-full flex items-center justify-center hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleAdd}
              className={`${CARD_BTN} ${
                isAdded ? 'bg-white/[0.12] border-white/25 text-white' : ''
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    已加{inBomQty > 0 && item.pricingMode !== 'percent' ? ` (${inBomQty})` : ''}
                  </span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 text-zinc-400" />
                  <span>清单</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Collapsible Details */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-white/10 space-y-2.5 text-xs animate-in fade-in duration-150">
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 bg-black/30 rounded-lg p-2.5 border border-white/5 text-xs">
            <div>
              <span className="text-zinc-500">编码:</span>{' '}
              <span className="font-mono text-zinc-200">{item.part_number}</span>
            </div>
            <div>
              <span className="text-zinc-500">单位:</span>{' '}
              <span className="text-zinc-200">{item.unit}</span>
            </div>
            <div>
              <span className="text-zinc-500">未税价:</span>{' '}
              <span className="font-mono text-zinc-200">
                ¥{item.unitPriceExclTax.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-zinc-500">含税价:</span>{' '}
              <span className="font-mono text-zinc-200">
                ¥{item.unitPriceInclTax.toLocaleString()}
              </span>
            </div>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">{item.specs}</p>

          {isAdmin && !isTrash && (
            <div className="flex items-center justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => onEdit(item)}
                className={CARD_BTN}
              >
                <Edit3 className="w-3 h-3 text-zinc-400" />
                <span>编辑</span>
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className={CARD_BTN}
              >
                <Trash2 className="w-3 h-3 text-zinc-400" />
                <span>删除</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface ServiceCatalogProps {
  isAddModalOpen: boolean;
  onCloseAddModal: () => void;
}

export const ServiceCatalog: React.FC<ServiceCatalogProps> = ({
  isAddModalOpen,
  onCloseAddModal,
}) => {
  const {
    customServices,
    deletedServiceIds,
    deletedCustomServices,
    purgedServiceIds,
    selectedServiceCategory,
    searchQuery,
    addCustomService,
    trashView,
    setTrashView,
    restoreDefaultServices,
    emptyTrash,
  } = useBOMStore();

  const [editingItem, setEditingItem] = useState<EngineeringItem | null>(null);

  // Form states for Add / Edit Modal
  const [category, setCategory] = useState<string>('弱电材料');
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [specs, setSpecs] = useState('');
  const [unit, setUnit] = useState('米');
  const [pricingMode, setPricingMode] = useState<'fixed' | 'percent'>('fixed');
  const [taxRate, setTaxRate] = useState<number>(0.13);
  const [priceExcl, setPriceExcl] = useState<string>('88.50');
  const [priceIncl, setPriceIncl] = useState<string>('100');
  const [percentRate, setPercentRate] = useState<string>('5');

  const openEditor = (item: EngineeringItem | null) => {
    if (item) {
      setEditingItem(item);
      setCategory(item.category);
      setName(item.name);
      setModel(item.model);
      setPartNumber(item.part_number);
      setSpecs(item.specs);
      setUnit(item.unit);
      setPricingMode(item.pricingMode);
      setTaxRate(item.taxRate);
      setPriceExcl(String(item.unitPriceExclTax));
      setPriceIncl(String(item.unitPriceInclTax));
      setPercentRate(String(item.percentageRate ?? 5));
    } else {
      setEditingItem(null);
      const defaultCat =
        selectedServiceCategory !== 'all' ? selectedServiceCategory : '弱电施工';
      const defaultTax =
        defaultCat === '弱电施工' ? 0.09 : 0.06;
      setCategory(defaultCat);
      setName('');
      setModel('');
      setPartNumber(`SRV-${Math.floor(100 + Math.random() * 900)}`);
      setSpecs('');
      setUnit(defaultCat === '弱电施工' ? '式' : defaultCat === '实施与割接' ? '人日' : '项');
      setPricingMode(defaultCat === '项目管理费' ? 'percent' : 'fixed');
      setTaxRate(defaultTax);
      setPriceIncl('100');
      setPriceExcl(String(round2(100 / (1 + defaultTax))));
      setPercentRate('5');
    }
  };

  React.useEffect(() => {
    if (isAddModalOpen) {
      openEditor(null);
    }
  }, [isAddModalOpen]);

  const allServices = useMemo(() => {
    if (trashView) {
      return getDeletedServicesCatalog(
        deletedServiceIds,
        deletedCustomServices,
        purgedServiceIds
      );
    }
    return getMergedServiceCatalog(customServices, deletedServiceIds, purgedServiceIds);
  }, [
    trashView,
    customServices,
    deletedServiceIds,
    deletedCustomServices,
    purgedServiceIds,
  ]);

  const filteredServices = useMemo(() => {
    return allServices.filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = (
          s.name.toLowerCase().includes(q) ||
          s.model.toLowerCase().includes(q) ||
          s.specs.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.part_number.toLowerCase().includes(q)
        );
        if (!matches) return false;
      }
      if (trashView) {
        return true;
      }
      if (
        selectedServiceCategory !== 'all' &&
        s.category !== selectedServiceCategory
      ) {
        return false;
      }
      return true;
    });
  }, [allServices, trashView, selectedServiceCategory, searchQuery]);

  // Bidirectional calculation handlers in modal
  const handleExclChange = (val: string) => {
    setPriceExcl(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setPriceIncl(String(round2(num * (1 + taxRate))));
    } else {
      setPriceIncl('');
    }
  };

  const handleInclChange = (val: string) => {
    setPriceIncl(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setPriceExcl(String(round2(num / (1 + taxRate))));
    } else {
      setPriceExcl('');
    }
  };

  const handleTaxChange = (newTax: number) => {
    setTaxRate(newTax);
    const inclNum = parseFloat(priceIncl);
    if (!isNaN(inclNum)) {
      setPriceExcl(String(round2(inclNum / (1 + newTax))));
    }
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const excl = round2(parseFloat(priceExcl) || 0);
    const incl = round2(parseFloat(priceIncl) || 0);
    const saved: EngineeringItem = {
      id: editingItem?.id || `srv-custom-${Date.now()}`,
      category: category.trim() || '弱电材料',
      brand: category.trim() || '工程配套',
      name: name.trim(),
      model: model.trim() || '标准规格',
      part_number: partNumber.trim() || 'SRV-001',
      specs: specs.trim() || name.trim(),
      unit: pricingMode === 'percent' ? '%' : unit.trim() || '项',
      pricingMode,
      unitPriceExclTax: excl,
      unitPriceInclTax: incl,
      percentageRate: parseFloat(percentRate) || 5,
      taxRate,
    };
    addCustomService(saved);
    setEditingItem(null);
    onCloseAddModal();
  };

  const showModal = isAddModalOpen || editingItem !== null;

  return (
    <div className="flex-1 min-w-0 space-y-3">
      {/* Recycle Bin Header Bar when in Trash View */}
      {trashView && (
        <div className="glass-panel rounded-xl px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>
              回收站（共 {filteredServices.length} 项已删除弱电服务，可单独还原或全部还原）
            </span>
          </div>
          <div className="flex items-center gap-2">
            {filteredServices.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={restoreDefaultServices}
                  className="h-7 px-2.5 rounded-md bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-zinc-200 hover:text-white text-xs font-medium inline-flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                  <span>全部还原</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        '确定彻底清空弱电服务回收站吗？清空后将无法还原。'
                      )
                    ) {
                      emptyTrash();
                    }
                  }}
                  className="h-7 px-2.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs font-medium inline-flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>彻底清空回收站</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setTrashView(false)}
              className="h-7 px-2.5 rounded-md bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-zinc-400 hover:text-white text-xs font-medium inline-flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>退出回收站</span>
            </button>
          </div>
        </div>
      )}

      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 items-start">
          {filteredServices.map((srv) => (
            <ServiceCard
              key={srv.id}
              item={srv}
              isTrash={trashView}
              onEdit={(item) => openEditor(item)}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-10 text-center space-y-3 max-w-sm mx-auto my-8">
          <SearchX className="w-7 h-7 text-zinc-500 mx-auto" />
          <div className="text-sm font-bold text-zinc-200">
            {trashView ? '回收站为空' : '无匹配弱电或服务项'}
          </div>
        </div>
      )}

      {/* Add / Edit Engineering Item Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            onClick={() => {
              setEditingItem(null);
              onCloseAddModal();
            }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <div className="relative w-full max-w-lg glass-panel-elevated rounded-2xl flex flex-col z-10 shadow-2xl border border-white/15 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-100">
                {editingItem ? `编辑：${editingItem.name}` : '新增弱电材料 / 人工 / 费用项'}
              </h2>
              <button
                onClick={() => {
                  setEditingItem(null);
                  onCloseAddModal();
                }}
                className="h-8 w-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-medium mb-1 block">费用类别</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const cat = e.target.value;
                      setCategory(cat);
                      if (!editingItem) {
                        const nextTax =
                          cat === '弱电施工'
                            ? 0.09
                            : 0.06;
                        handleTaxChange(nextTax);
                      }
                    }}
                    className="w-full h-8 glass-input rounded-lg px-2.5 text-zinc-100"
                  >
                    {DEFAULT_SERVICE_CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-zinc-900">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 font-medium mb-1 block">编码 / 定额号</label>
                  <input
                    type="text"
                    value={partNumber}
                    onChange={(e) => setPartNumber(e.target.value)}
                    className="w-full h-8 glass-input rounded-lg px-2.5 font-mono text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-medium mb-1 block">项目名称 *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="如 JDG镀锌线管 Φ20 / 布线人工"
                    className="w-full h-8 glass-input rounded-lg px-2.5 font-bold text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 font-medium mb-1 block">规格型号 / 计费标准</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="如 DN20×1.2mm / 单点放线端接"
                    className="w-full h-8 glass-input rounded-lg px-2.5 text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 font-medium mb-1 block">技术参数 / 施工说明</label>
                <input
                  type="text"
                  value={specs}
                  onChange={(e) => setSpecs(e.target.value)}
                  placeholder="详细施工内容或材料标准..."
                  className="w-full h-8 glass-input rounded-lg px-2.5 text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-zinc-400 font-medium mb-1 block">计价方式</label>
                  <select
                    value={pricingMode}
                    onChange={(e) => setPricingMode(e.target.value as 'fixed' | 'percent')}
                    className="w-full h-8 glass-input rounded-lg px-2 text-zinc-100"
                  >
                    <option value="fixed" className="bg-zinc-900">固定单价</option>
                    <option value="percent" className="bg-zinc-900">按比例 (%)</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 font-medium mb-1 block">单位</label>
                  <input
                    type="text"
                    value={pricingMode === 'percent' ? '%' : unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="米 / 箱 / 点 / 项 / 台班"
                    className="w-full h-8 glass-input rounded-lg px-2.5 text-zinc-100"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 font-medium mb-1 block">增值税率</label>
                  <select
                    value={taxRate}
                    onChange={(e) => handleTaxChange(parseFloat(e.target.value))}
                    className="w-full h-8 glass-input rounded-lg px-2 text-zinc-100 font-mono"
                  >
                    <option value="0.13" className="bg-zinc-900">13% (材料/设备)</option>
                    <option value="0.09" className="bg-zinc-900">9% (工程施工)</option>
                    <option value="0.06" className="bg-zinc-900">6% (技术服务)</option>
                    <option value="0.03" className="bg-zinc-900">3% (小规模)</option>
                    <option value="0" className="bg-zinc-900">0% (未税)</option>
                  </select>
                </div>
              </div>

              {pricingMode === 'percent' ? (
                <div>
                  <label className="text-zinc-400 font-medium mb-1 block">
                    取费比例 (% ，按设备+弱电施工总额自动计算)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={percentRate}
                    onChange={(e) => setPercentRate(e.target.value)}
                    className="w-full h-8 glass-input rounded-lg px-2.5 font-mono text-zinc-100"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  <div>
                    <label className="text-zinc-400 font-medium mb-1 block">
                      未税单价 (元) — 自动联动
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={priceExcl}
                      onChange={(e) => handleExclChange(e.target.value)}
                      className="w-full h-8 glass-input rounded-lg px-2.5 font-mono text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 font-medium mb-1 block">
                      含税单价 (元) — 自动联动
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={priceIncl}
                      onChange={(e) => handleInclChange(e.target.value)}
                      className="w-full h-8 glass-input rounded-lg px-2.5 font-mono font-bold text-zinc-100"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    onCloseAddModal();
                  }}
                  className={CARD_BTN}
                >
                  取消
                </button>
                <button type="submit" className={CARD_BTN}>
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
