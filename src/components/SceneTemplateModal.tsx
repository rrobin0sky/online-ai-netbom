import React, { useState } from 'react';
import {
  X,
  LayoutTemplate,
  ArrowRight,
  Edit3,
  Trash2,
  Plus,
  RotateCcw,
  Check,
  BookmarkPlus,
} from 'lucide-react';
import { ProjectTemplate, SCENE_TEMPLATES } from '../data/templates';
import { useBOMStore, getMergedCatalog } from '../store/useBOMStore';

interface SceneTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BTN_UNIFIED =
  'h-8 px-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-zinc-200 hover:text-white text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap';

export const SceneTemplateModal: React.FC<SceneTemplateModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    templates,
    loadSceneTemplate,
    updateTemplate,
    deleteTemplate,
    resetTemplates,
    saveCurrentBOMAsTemplate,
    items,
    customDevices,
    deletedDeviceIds,
    purgedDeviceIds,
    brandRenames,
    isAdmin,
  } = useBOMStore();

  const [editingTmpl, setEditingTmpl] = useState<ProjectTemplate | null>(null);
  const [isSavingCurrent, setIsSavingCurrent] = useState(false);
  const [newTmplName, setNewTmplName] = useState('');
  const [newTmplBadge, setNewTmplBadge] = useState('自定义方案');
  const [newTmplDesc, setNewTmplDesc] = useState('');

  if (!isOpen) return null;

  const activeTemplates = templates?.length ? templates : SCENE_TEMPLATES;
  const allDevices = getMergedCatalog(
    customDevices,
    deletedDeviceIds,
    brandRenames,
    purgedDeviceIds
  );

  const handleApply = (template: ProjectTemplate) => {
    loadSceneTemplate(template.id);
    onClose();
  };

  const handleSaveCurrent = () => {
    if (!newTmplName.trim()) return;
    saveCurrentBOMAsTemplate(newTmplName, newTmplBadge, newTmplDesc);
    setNewTmplName('');
    setNewTmplDesc('');
    setIsSavingCurrent(false);
  };

  const handleSaveEdit = () => {
    if (!editingTmpl) return;
    updateTemplate(editingTmpl);
    setEditingTmpl(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-md" />

      <div className="relative w-full max-w-5xl max-h-[90vh] glass-panel-elevated rounded-2xl flex flex-col z-10 shadow-2xl overflow-hidden border border-white/15">
        {/* Header */}
        <div className="px-5 py-3 bg-zinc-900/80 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <LayoutTemplate className="w-4 h-4 text-zinc-300" />
            <h2 className="text-sm font-bold text-zinc-100">场景模板</h2>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && items.length > 0 && !isSavingCurrent && !editingTmpl && (
              <button
                type="button"
                onClick={() => setIsSavingCurrent(true)}
                className={BTN_UNIFIED}
              >
                <BookmarkPlus className="w-3.5 h-3.5 text-zinc-400" />
                <span>存为模板</span>
              </button>
            )}

            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('恢复为系统内置默认模板？')) resetTemplates();
                }}
                className={BTN_UNIFIED}
                title="重置默认模板"
              >
                <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                <span>重置</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="h-8 w-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Save Current BOM as Template Form */}
        {isSavingCurrent && (
          <div className="p-4 bg-white/[0.03] border-b border-white/10 space-y-3 text-xs">
            <div className="font-semibold text-zinc-200">
              将当前清单（{items.length} 项）存为新模板
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={newTmplName}
                onChange={(e) => setNewTmplName(e.target.value)}
                placeholder="模板名称..."
                className="h-8 glass-input rounded-lg px-3 text-zinc-100"
              />
              <input
                type="text"
                value={newTmplBadge}
                onChange={(e) => setNewTmplBadge(e.target.value)}
                placeholder="分类标签..."
                className="h-8 glass-input rounded-lg px-3 text-zinc-100"
              />
              <input
                type="text"
                value={newTmplDesc}
                onChange={(e) => setNewTmplDesc(e.target.value)}
                placeholder="简要说明..."
                className="h-8 glass-input rounded-lg px-3 text-zinc-100"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSavingCurrent(false)}
                className={BTN_UNIFIED}
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveCurrent}
                className={BTN_UNIFIED}
              >
                <Check className="w-3.5 h-3.5" />
                <span>保存</span>
              </button>
            </div>
          </div>
        )}

        {/* Template Editor View */}
        {editingTmpl ? (
          <div className="p-5 overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-100">编辑模板：{editingTmpl.name}</h3>
              <button
                type="button"
                onClick={() => setEditingTmpl(null)}
                className={BTN_UNIFIED}
              >
                返回
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">模板名称</label>
                <input
                  type="text"
                  value={editingTmpl.name}
                  onChange={(e) =>
                    setEditingTmpl({ ...editingTmpl, name: e.target.value })
                  }
                  className="w-full h-8 glass-input rounded-lg px-3 text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">标签</label>
                <input
                  type="text"
                  value={editingTmpl.badge}
                  onChange={(e) =>
                    setEditingTmpl({ ...editingTmpl, badge: e.target.value })
                  }
                  className="w-full h-8 glass-input rounded-lg px-3 text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">描述说明</label>
                <input
                  type="text"
                  value={editingTmpl.description}
                  onChange={(e) =>
                    setEditingTmpl({ ...editingTmpl, description: e.target.value })
                  }
                  className="w-full h-8 glass-input rounded-lg px-3 text-zinc-100"
                />
              </div>
            </div>

            {/* Template Items Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-medium">包含设备明细</span>
                <button
                  type="button"
                  onClick={() => {
                    const firstDev = allDevices[0];
                    if (!firstDev) return;
                    setEditingTmpl({
                      ...editingTmpl,
                      items: [
                        ...editingTmpl.items,
                        {
                          deviceId: firstDev.id,
                          quantity: 1,
                          areaGroup: '接入层',
                          accessories: [],
                        },
                      ],
                    });
                  }}
                  className={BTN_UNIFIED}
                >
                  <Plus className="w-3.5 h-3.5" /> 添加行
                </button>
              </div>

              <div className="border border-white/10 rounded-xl overflow-hidden divide-y divide-white/10">
                {editingTmpl.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-black/20 flex flex-wrap items-center gap-3 justify-between"
                  >
                    <select
                      value={item.areaGroup}
                      onChange={(e) => {
                        const next = [...editingTmpl.items];
                        next[idx] = { ...next[idx], areaGroup: e.target.value };
                        setEditingTmpl({ ...editingTmpl, items: next });
                      }}
                      className="h-8 glass-input rounded-lg px-2 text-zinc-200"
                    >
                      <option value="核心汇聚层">核心汇聚层</option>
                      <option value="核心层">核心层</option>
                      <option value="汇聚层">汇聚层</option>
                      <option value="接入层">接入层</option>
                      <option value="楼层接入层">楼层接入层</option>
                      <option value="数据中心">数据中心</option>
                    </select>

                    <select
                      value={item.deviceId}
                      onChange={(e) => {
                        const next = [...editingTmpl.items];
                        next[idx] = { ...next[idx], deviceId: e.target.value };
                        setEditingTmpl({ ...editingTmpl, items: next });
                      }}
                      className="flex-1 min-w-[200px] h-8 glass-input rounded-lg px-2 text-zinc-100"
                    >
                      {allDevices.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.brand} {d.model} ({d.specs.ports.summary})
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500">数量:</span>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => {
                          const next = [...editingTmpl.items];
                          next[idx] = {
                            ...next[idx],
                            quantity: Math.max(1, parseInt(e.target.value) || 1),
                          };
                          setEditingTmpl({ ...editingTmpl, items: next });
                        }}
                        className="w-16 h-8 glass-input rounded-lg px-2 text-center font-mono text-zinc-100"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingTmpl({
                          ...editingTmpl,
                          items: editingTmpl.items.filter((_, i) => i !== idx),
                        });
                      }}
                      className="h-8 w-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 inline-flex items-center justify-center text-zinc-400 hover:text-zinc-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingTmpl(null)}
                className={BTN_UNIFIED}
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className={BTN_UNIFIED}
              >
                <Check className="w-3.5 h-3.5" />
                <span>保存</span>
              </button>
            </div>
          </div>
        ) : (
          /* Templates Grid */
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto">
            {activeTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="glass-panel rounded-xl p-4 flex flex-col justify-between border border-white/10 hover:border-white/25 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/[0.05] text-zinc-300 border border-white/10">
                      {tmpl.badge}
                    </span>
                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingTmpl(tmpl)}
                          className="h-7 w-7 rounded-md bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 inline-flex items-center justify-center text-zinc-400 hover:text-zinc-100"
                          title="编辑"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`确定删除模板「${tmpl.name}」吗？`)) {
                              deleteTemplate(tmpl.id);
                            }
                          }}
                          className="h-7 w-7 rounded-md bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 inline-flex items-center justify-center text-zinc-400 hover:text-zinc-100"
                          title="删除"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-zinc-100 mb-1.5 leading-snug">
                    {tmpl.name}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                    {tmpl.description}
                  </p>

                  {/* Included Summary */}
                  <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 space-y-1 text-xs mb-4">
                    {tmpl.items.map((item, idx) => {
                      const dev = allDevices.find((d) => d.id === item.deviceId);
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-zinc-300 gap-2"
                        >
                          <span className="truncate text-zinc-400">
                            [{item.areaGroup}] {dev ? `${dev.brand} ${dev.model}` : item.deviceId}
                          </span>
                          <span className="font-mono text-zinc-200 font-semibold flex-shrink-0">
                            x{item.quantity}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Button (Same unified color & size) */}
                <button
                  onClick={() => handleApply(tmpl)}
                  className={`${BTN_UNIFIED} w-full`}
                >
                  <span>应用</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
