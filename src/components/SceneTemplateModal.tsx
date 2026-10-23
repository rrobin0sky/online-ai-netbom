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
  } = useBOMStore();

  const [editingTmpl, setEditingTmpl] = useState<ProjectTemplate | null>(null);
  const [isSavingCurrent, setIsSavingCurrent] = useState(false);
  const [newTmplName, setNewTmplName] = useState('');
  const [newTmplBadge, setNewTmplBadge] = useState('自定义方案');
  const [newTmplDesc, setNewTmplDesc] = useState('');

  if (!isOpen) return null;

  const activeTemplates = templates?.length ? templates : SCENE_TEMPLATES;
  const allDevices = getMergedCatalog(customDevices, deletedDeviceIds);

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
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-5xl max-h-[90vh] glass-panel-elevated rounded-2xl flex flex-col z-10 shadow-2xl overflow-hidden border border-white/15">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <LayoutTemplate className="w-4 h-4 text-zinc-300" />
            <h2 className="text-sm font-bold text-zinc-100">场景方案模板</h2>
            <span className="text-[11px] font-mono text-zinc-500">
              支持加载、编辑或将当前 BOM 存为模板
            </span>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && !isSavingCurrent && !editingTmpl && (
              <button
                type="button"
                onClick={() => setIsSavingCurrent(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-100 text-xs font-medium transition-colors"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>将当前 BOM 存为模板</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (confirm('恢复为系统内置默认模板？')) resetTemplates();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
              title="重置默认模板"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置默认</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Save Current BOM as Template Form */}
        {isSavingCurrent && (
          <div className="p-4 bg-white/[0.03] border-b border-white/10 space-y-3 text-xs">
            <div className="font-semibold text-zinc-200">
              将当前 BOM 清单（共 {items.length} 项设备）保存为新模板
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={newTmplName}
                onChange={(e) => setNewTmplName(e.target.value)}
                placeholder="模板名称 (如：分支机构 100人标准网)"
                className="glass-input rounded-lg px-3 py-1.5 text-zinc-100"
              />
              <input
                type="text"
                value={newTmplBadge}
                onChange={(e) => setNewTmplBadge(e.target.value)}
                placeholder="分类标签 (如：分支园区)"
                className="glass-input rounded-lg px-3 py-1.5 text-zinc-100"
              />
              <input
                type="text"
                value={newTmplDesc}
                onChange={(e) => setNewTmplDesc(e.target.value)}
                placeholder="简要说明..."
                className="glass-input rounded-lg px-3 py-1.5 text-zinc-100"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSavingCurrent(false)}
                className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveCurrent}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-zinc-100 text-zinc-900 font-semibold hover:bg-white"
              >
                <Check className="w-3.5 h-3.5" />
                <span>保存模板</span>
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
                className="text-zinc-400 hover:text-white"
              >
                返回模板列表
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">模板名称</label>
                <input
                  type="text"
                  value={editingTmpl.name}
                  onChange={(e) =>
                    setEditingTmpl({ ...editingTmpl, name: e.target.value })
                  }
                  className="w-full glass-input rounded-lg px-3 py-1.5 text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">标签</label>
                <input
                  type="text"
                  value={editingTmpl.badge}
                  onChange={(e) =>
                    setEditingTmpl({ ...editingTmpl, badge: e.target.value })
                  }
                  className="w-full glass-input rounded-lg px-3 py-1.5 text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">描述说明</label>
                <input
                  type="text"
                  value={editingTmpl.description}
                  onChange={(e) =>
                    setEditingTmpl({ ...editingTmpl, description: e.target.value })
                  }
                  className="w-full glass-input rounded-lg px-3 py-1.5 text-zinc-100"
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
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200"
                >
                  <Plus className="w-3.5 h-3.5" /> 添加设备行
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
                      className="glass-input rounded px-2 py-1 text-zinc-200"
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
                      className="flex-1 min-w-[200px] glass-input rounded px-2 py-1 text-zinc-100"
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
                        className="w-16 glass-input rounded px-2 py-1 text-center font-mono text-zinc-100"
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
                      className="p-1 text-zinc-500 hover:text-zinc-200"
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
                className="px-4 py-1.5 rounded-lg text-zinc-400 hover:text-white"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-zinc-100 text-zinc-900 font-semibold hover:bg-white"
              >
                <Check className="w-3.5 h-3.5" />
                <span>保存修改</span>
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
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-zinc-300 border border-white/10">
                      {tmpl.badge}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingTmpl(tmpl)}
                        className="p-1 text-zinc-400 hover:text-zinc-100 rounded hover:bg-white/5"
                        title="修改此模板"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`确定删除模板「${tmpl.name}」吗？`)) {
                            deleteTemplate(tmpl.id);
                          }
                        }}
                        className="p-1 text-zinc-500 hover:text-zinc-200 rounded hover:bg-white/5"
                        title="删除此模板"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-100 mb-1.5 leading-snug">
                    {tmpl.name}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                    {tmpl.description}
                  </p>

                  {/* Included Summary */}
                  <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 space-y-1 text-[11px] mb-4">
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

                {/* Action Button */}
                <button
                  onClick={() => handleApply(tmpl)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-semibold transition-all active:scale-95"
                >
                  <span>应用此模板</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
