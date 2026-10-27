import React, { useState } from 'react';
import { X, Lock, KeyRound, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';
import { useBOMStore } from '../store/useBOMStore';

const BTN_UNIFIED =
  'h-8 px-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-zinc-200 hover:text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-40';

export const CostUnlockModal: React.FC = () => {
  const { isCostModalOpen, setCostModalOpen, unlockCost } = useBOMStore();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isCostModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!password.trim()) {
      setErrorMsg('请输入解锁口令');
      return;
    }
    const success = unlockCost(password);
    if (success) {
      setPassword('');
      setErrorMsg(null);
    } else {
      setErrorMsg('解锁口令不正确');
    }
  };

  const handleClose = () => {
    setPassword('');
    setErrorMsg(null);
    setCostModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div onClick={handleClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-sm glass-panel-elevated border border-white/15 rounded-2xl flex flex-col z-10 shadow-2xl overflow-hidden bg-zinc-950/95">
        {/* Header */}
        <div className="px-5 py-3.5 bg-zinc-900/80 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-zinc-300" />
            <h3 className="text-sm font-bold text-zinc-100">内部成本价解锁</h3>
          </div>
          <button
            onClick={handleClose}
            className="h-7 w-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5 leading-relaxed text-zinc-400 text-[11px]">
            <p>
              厂商官方<strong className="text-zinc-200">「指导价」</strong>对所有人公开可见。
            </p>
            <p>
              输入内部专属口令后，将解锁所有设备的真实采购成本价、底价折算与项目利润分析。
            </p>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-lg border bg-rose-500/10 border-rose-500/30 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-zinc-400 font-medium mb-1.5">
              输入成本解锁口令
            </label>
            <div className="relative flex items-center">
              <KeyRound className="absolute left-3 w-4 h-4 text-zinc-500 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入口令"
                autoFocus
                className="w-full h-9 glass-input rounded-lg pl-9 pr-9 text-xs text-zinc-100 placeholder:text-zinc-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 h-6 w-6 flex items-center justify-center text-zinc-500 hover:text-zinc-300"
                title={showPassword ? '隐藏口令' : '显示口令'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
            <button type="button" onClick={handleClose} className={BTN_UNIFIED}>
              取消
            </button>
            <button
              type="submit"
              className={`${BTN_UNIFIED} bg-white/[0.12] hover:bg-white/[0.18] border-white/20 text-white font-semibold`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>解锁成本</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
