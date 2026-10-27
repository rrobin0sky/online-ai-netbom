import React, { useState } from 'react';
import { RotateCcw, Plus, Edit3, X, Check, Settings2, Trash2 } from 'lucide-react';
import {
  useBOMStore,
  getMergedCatalog,
  getMergedServiceCatalog,
  DEFAULT_BRANDS,
  DEFAULT_SERVICE_CATEGORIES,
} from '../store/useBOMStore';

interface FilterSidebarProps {
  onOpenAddService?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  onOpenAddService,
}) => {
  const {
    workspaceTab,
    setWorkspaceTab,
    selectedServiceCategory,
    setSelectedServiceCategory,
    selectedBrand,
    setSelectedBrand,
    selectedCategory,
    setSelectedCategory,
    selectedSpeed,
    setSelectedSpeed,
    poeOnly,
    setPoeOnly,
    hideEol,
    setHideEol,
    recentOnly,
    setRecentOnly,
    unpricedOnly,
    setUnpricedOnly,
    trashView,
    setTrashView,
    searchQuery,
    setSearchQuery,
    customDevices,
    deletedDeviceIds,
    purgedDeviceIds,
    customServices,
    deletedServiceIds,
    purgedServiceIds,
    restoreDefaultServices,
    brands,
    brandRenames,
    addBrand,
    renameBrand,
    deleteBrand,
    resetBrands,
  } = useBOMStore();

  const [isManagingBrands, setIsManagingBrands] = useState(false);
  const [newBrandInput, setNewBrandInput] = useState('');
  const [editingBrand, setEditingBrand] = useState<string | null>(null);
  const [editingBrandValue, setEditingBrandValue] = useState('');

  const activeBrands = brands?.length ? brands : DEFAULT_BRANDS;
  const allDevices = getMergedCatalog(
    customDevices,
    deletedDeviceIds,
    brandRenames,
    purgedDeviceIds
  );
  const allServices = getMergedServiceCatalog(customServices, deletedServiceIds, purgedServiceIds);
  const activeDeletedCount = deletedDeviceIds.filter(
    (id) => !(purgedDeviceIds || []).includes(id)
  ).length;
  const activeDeletedServiceCount = (deletedServiceIds || []).filter(
    (id) => !(purgedServiceIds || []).includes(id)
  ).length;

  const layers = [
    { id: 'all', label: '全部' },
    { id: 'Security', label: '安全网关' },
    { id: 'L3', label: '核心/汇聚' },
    { id: 'L2+', label: '接入/PoE' },
    { id: 'Server', label: '计算服务器' },
    { id: 'Storage', label: '集中存储' },
    { id: 'Software', label: '系统软件' },
    { id: 'Peripherals', label: '外设/辅材' },
  ];

  const speeds = [
    { id: 'all', label: '全部' },
    { id: '1G', label: '1GE' },
    { id: '10G', label: '10GE' },
    { id: '25G', label: '25GE' },
    { id: '100G', label: '100GE' },
  ];

  const pillClass = (active: boolean) =>
    `h-7 px-2.5 rounded-md text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap border ${
      active
        ? 'bg-white/[0.12] border-white/25 text-white font-semibold'
        : 'bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.07]'
    }`;

  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandInput.trim()) return;
    addBrand(newBrandInput.trim());
    setNewBrandInput('');
  };

  const handleConfirmRename = (oldName: string) => {
    if (editingBrandValue.trim() && editingBrandValue.trim() !== oldName) {
      renameBrand(oldName, editingBrandValue.trim());
    }
    setEditingBrand(null);
    setEditingBrandValue('');
  };

  return (
    <section className="w-full space-y-2.5">
      {/* Mobile Search Input */}
      <div className="block md:hidden">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索型号、线材、人工、费用..."
          className="w-full h-8 glass-input rounded-lg px-3 text-xs"
        />
      </div>

      {/* Horizontal Top Filter Bar */}
      <div className="glass-panel rounded-xl px-3.5 py-2.5 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
          <div className="flex flex-wrap items-center gap-y-2 gap-x-3">
            {/* Workspace Mode Switcher: 网络设备 vs 弱电与服务 */}
            <div className="flex items-center gap-1 pr-2 border-r border-white/10">
              <button
                type="button"
                onClick={() => setWorkspaceTab('devices')}
                className={pillClass(workspaceTab === 'devices')}
              >
                <span>网络设备</span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {allDevices.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setWorkspaceTab('services')}
                className={pillClass(workspaceTab === 'services')}
              >
                <span>弱电与服务</span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {allServices.length}
                </span>
              </button>
            </div>

            {workspaceTab === 'devices' ? (
              <>
                {/* Brand Pills + Manage Toggle */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-zinc-500 mr-0.5 font-medium">品牌</span>
                  <button
                    onClick={() => setSelectedBrand('all')}
                    className={pillClass(selectedBrand === 'all')}
                  >
                    <span>全部</span>
                  </button>

                  {activeBrands.map((b) => {
                    const count = allDevices.filter((d) => d.brand === b).length;
                    if (editingBrand === b) {
                      return (
                        <div
                          key={b}
                          className="h-7 inline-flex items-center gap-1 bg-zinc-900 border border-white/20 rounded-md px-2"
                        >
                          <input
                            type="text"
                            value={editingBrandValue}
                            onChange={(e) => setEditingBrandValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleConfirmRename(b);
                              if (e.key === 'Escape') setEditingBrand(null);
                            }}
                            autoFocus
                            className="w-20 bg-transparent text-xs text-zinc-100 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleConfirmRename(b)}
                            className="text-zinc-300 hover:text-white"
                            title="保存"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingBrand(null)}
                            className="text-zinc-500 hover:text-zinc-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div key={b} className="inline-flex items-center">
                        <button
                          onClick={() => setSelectedBrand(b)}
                          className={pillClass(selectedBrand === b)}
                        >
                          <span>{b}</span>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {count}
                          </span>
                        </button>

                        {isManagingBrands && (
                          <div className="h-7 inline-flex items-center gap-0.5 ml-1 bg-white/[0.04] border border-white/10 rounded-md px-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBrand(b);
                                setEditingBrandValue(b);
                              }}
                              className="text-zinc-400 hover:text-white p-0.5"
                              title="改名"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`确定移除品牌「${b}」吗？`)) {
                                  deleteBrand(b);
                                }
                              }}
                              className="text-zinc-500 hover:text-zinc-200 p-0.5"
                              title="删除"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setIsManagingBrands(!isManagingBrands)}
                    className={pillClass(isManagingBrands)}
                    title="管理品牌"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    {isManagingBrands && <span>完成</span>}
                  </button>
                </div>

                <div className="hidden xl:block h-4 w-[1px] bg-white/10" />

                {/* Layer Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-zinc-500 mr-0.5 font-medium">层级</span>
                  {layers.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setSelectedCategory(l.id)}
                      className={pillClass(selectedCategory === l.id)}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>

                <div className="hidden xl:block h-4 w-[1px] bg-white/10" />

                {/* Speed Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-zinc-500 mr-0.5 font-medium">速率</span>
                  {speeds.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSpeed(s.id)}
                      className={pillClass(selectedSpeed === s.id)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              /* Low-voltage / Service Categories */
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-zinc-500 mr-0.5 font-medium">类型</span>
                <button
                  onClick={() => setSelectedServiceCategory('all')}
                  className={pillClass(selectedServiceCategory === 'all')}
                >
                  <span>全部</span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {allServices.length}
                  </span>
                </button>
                {DEFAULT_SERVICE_CATEGORIES.map((cat) => {
                  const count = allServices.filter((s) => s.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedServiceCategory(cat)}
                      className={pillClass(selectedServiceCategory === cat)}
                    >
                      <span>{cat}</span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Quick Filter Pills: PoE | 隐藏停产 | 最近录入 | 待核价 | 回收站 */}
          {workspaceTab === 'devices' ? (
            <div className="flex items-center gap-1.5 flex-wrap ml-auto">
              <button
                type="button"
                onClick={() => setPoeOnly(!poeOnly)}
                className={pillClass(poeOnly)}
              >
                <span>PoE</span>
              </button>

              <button
                type="button"
                onClick={() => setHideEol(!hideEol)}
                className={pillClass(hideEol)}
              >
                <span>隐藏停产</span>
              </button>

              <button
                type="button"
                onClick={() => setRecentOnly(!recentOnly)}
                className={pillClass(recentOnly)}
                title="仅显示我导入或新增的设备"
              >
                <span>最近录入</span>
                {customDevices.length > 0 && (
                  <span className="text-[10px] font-mono text-zinc-500">
                    {customDevices.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setUnpricedOnly(!unpricedOnly)}
                className={pillClass(unpricedOnly)}
                title="筛选未填单价或价格超过90天未更新的设备"
              >
                <span>待核价</span>
              </button>

              <button
                type="button"
                onClick={() => setTrashView(!trashView)}
                className={pillClass(trashView)}
                title="查看并恢复已删除的设备"
              >
                <Trash2 className="w-3 h-3 text-zinc-400" />
                <span>回收站</span>
                {activeDeletedCount > 0 && (
                  <span className="text-[10px] font-mono text-zinc-500">
                    {activeDeletedCount}
                  </span>
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs ml-auto">
              {onOpenAddService && (
                <button
                  type="button"
                  onClick={onOpenAddService}
                  className={pillClass(false)}
                >
                  <Plus className="w-3.5 h-3.5 text-zinc-400" />
                  <span>新增条目</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setTrashView(!trashView)}
                className={pillClass(trashView)}
                title="查看并恢复已删除的弱电与服务项"
              >
                <Trash2 className="w-3 h-3 text-zinc-400" />
                <span>回收站</span>
                {activeDeletedServiceCount > 0 && (
                  <span className="text-[10px] font-mono text-zinc-500">
                    {activeDeletedServiceCount}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Inline Brand Management Strip */}
        {workspaceTab === 'devices' && isManagingBrands && (
          <div className="pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
            <form onSubmit={handleAddBrand} className="flex items-center gap-2">
              <input
                type="text"
                value={newBrandInput}
                onChange={(e) => setNewBrandInput(e.target.value)}
                placeholder="输入新品牌名称..."
                className="h-7 glass-input rounded-md px-2.5 text-xs text-zinc-100 w-44"
              />
              <button type="submit" className={pillClass(false)}>
                <Plus className="w-3 h-3" />
                <span>新增品牌</span>
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                if (confirm('恢复默认品牌列表？')) resetBrands();
              }}
              className={pillClass(false)}
            >
              <RotateCcw className="w-3 h-3" />
              <span>重置品牌</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
