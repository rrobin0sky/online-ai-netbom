import React from 'react';
import { X, Layers, ArrowRight } from 'lucide-react';
import { SCENE_TEMPLATES, ProjectTemplate } from '../data/templates';
import { useBOMStore } from '../store/useBOMStore';
import { useI18n } from '../i18n';

interface SceneTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SceneTemplateModal: React.FC<SceneTemplateModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { loadSceneTemplate } = useBOMStore();
  const { t, lang } = useI18n();

  if (!isOpen) return null;

  const handleApply = (template: ProjectTemplate) => {
    loadSceneTemplate(template.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl glass-panel-elevated rounded-3xl flex flex-col z-10 shadow-2xl overflow-hidden border border-white/15 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {t('template.title')}
                <span className="text-xs font-mono font-normal text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                  1-Click Load
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {t('template.subtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5 max-h-[75vh] overflow-y-auto">
          {SCENE_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className="glass-panel rounded-2xl p-5 flex flex-col justify-between hover:border-indigo-500/40 hover:shadow-xl transition-all duration-300"
            >
              <div>
                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 mb-2 font-mono">
                  {lang === 'zh' ? tmpl.badge : (tmpl.badgeEn || tmpl.badge)}
                </span>
                <h3 className="text-sm font-bold text-white mb-2 leading-snug">
                  {lang === 'zh' ? tmpl.name : (tmpl.nameEn || tmpl.name)}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {lang === 'zh' ? tmpl.description : (tmpl.descriptionEn || tmpl.description)}
                </p>

                {/* Included Summary */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-[11px] mb-4">
                  <div className="text-[10px] uppercase font-mono text-slate-500">
                    {lang === 'zh' ? '预置物料构成：' : 'Pre-Configured Items:'}
                  </div>
                  {tmpl.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-slate-300"
                    >
                      <span className="font-mono text-slate-400">
                        {lang === 'zh' ? item.areaGroup : (item.areaGroupEn || item.areaGroup)}
                      </span>
                      <span className="font-mono text-sky-400 font-bold">
                        x{item.quantity} {lang === 'zh' ? '台' : 'units'}
                      </span>
                    </div>
                  ))}
                  <div className="pt-1 border-t border-white/5 text-[10px] text-slate-400 flex justify-between">
                    <span>{lang === 'zh' ? '推荐行业折扣:' : 'Rec. Discount:'}</span>
                    <span className="font-mono text-amber-400 font-semibold">
                      {(tmpl.recommendedDiscount * 10).toFixed(1)} {lang === 'zh' ? '折' : 'x'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleApply(tmpl)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-indigo-500/20 hover:bg-indigo-500 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <span>{t('template.apply')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
