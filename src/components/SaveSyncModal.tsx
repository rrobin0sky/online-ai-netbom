import React, { useState } from 'react';
import {
  X,
  Cloud,
  CloudUpload,
  CloudDownload,
  Copy,
  Check,
  KeyRound,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Globe,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useBOMStore } from '../store/useBOMStore';

const BTN_UNIFIED =
  'h-8 px-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 text-zinc-200 hover:text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-40';

function generateRandomCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let str = '';
  for (let i = 0; i < 4; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BOM-${str}`;
}

export const SaveSyncModal: React.FC = () => {
  const {
    isSaveModalOpen,
    setSaveModalOpen,
    syncCode,
    setSyncCode,
    syncPassword,
    setSyncPassword,
    lastSyncedAt,
    isSyncing,
    saveToCloud,
    loadFromCloud,
    publishGlobalDefault,
  } = useBOMStore();

  const [activeTab, setActiveTab] = useState<'save' | 'load' | 'publish'>('save');
  const [loadCode, setLoadCode] = useState('');
  const [loadPassword, setLoadPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  if (!isSaveModalOpen) return null;

  const handleSave = async () => {
    setMsg(null);
    const code = (syncCode || 'BOM-8823').trim().toUpperCase();
    const res = await saveToCloud(code, syncPassword);
    setMsg({ text: res.message, isError: !res.success });
  };

  const handleLoad = async () => {
    setMsg(null);
    const code = loadCode.trim().toUpperCase();
    if (!code) {
      setMsg({ text: '请输入项目提取码', isError: true });
      return;
    }
    const res = await loadFromCloud(code, loadPassword);
    setMsg({ text: res.message, isError: !res.success });
    if (res.success) {
      setTimeout(() => {
        setSaveModalOpen(false);
      }, 1500);
    }
  };

  const handlePublish = async () => {
    setMsg(null);
    if (!adminPassword.trim()) {
      setMsg({ text: '请输入管理员口令', isError: true });
      return;
    }
    const res = await publishGlobalDefault(adminPassword.trim());
    setMsg({ text: res.message, isError: !res.success });
  };

  const handleCopyLink = () => {
    const code = (syncCode || 'BOM-8823').trim().toUpperCase();
    const url = `https://bin0sky.tech/#/bom?code=${code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lastSyncStr = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '尚未保存到云端';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        onClick={() => setSaveModalOpen(false)}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg glass-panel-elevated border border-white/15 rounded-2xl flex flex-col z-10 shadow-2xl overflow-hidden bg-zinc-950/95">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-zinc-900/80 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-zinc-300" />
            <h3 className="text-sm font-bold text-zinc-100">云端保存与发布</h3>
          </div>
          <button
            onClick={() => setSaveModalOpen(false)}
            className="h-7 w-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.10] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher (3 Tabs) */}
        <div className="flex border-b border-white/10 bg-zinc-900/40 text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('save');
              setMsg(null);
            }}
            className={`flex-1 py-2.5 px-3 text-center font-medium transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'save'
                ? 'text-white border-b-2 border-white/60 bg-white/[0.04]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CloudUpload className="w-3.5 h-3.5" />
            <span>保存到云端</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('load');
              setMsg(null);
              if (!loadCode && syncCode) setLoadCode(syncCode);
            }}
            className={`flex-1 py-2.5 px-3 text-center font-medium transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'load'
                ? 'text-white border-b-2 border-white/60 bg-white/[0.04]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CloudDownload className="w-3.5 h-3.5" />
            <span>从云端载入</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('publish');
              setMsg(null);
            }}
            className={`flex-1 py-2.5 px-3 text-center font-medium transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'publish'
                ? 'text-white border-b-2 border-white/60 bg-white/[0.04]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>全网发布</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {msg && (
            <div
              className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                msg.isError
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}
            >
              {msg.isError ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <ShieldCheck className="w-4 h-4 shrink-0" />
              )}
              <span>{msg.text}</span>
            </div>
          )}

          {activeTab === 'save' && (
            <>
              <div>
                <label className="block text-zinc-400 font-medium mb-1.5">
                  项目同步码 (提取码)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={syncCode}
                    onChange={(e) => setSyncCode(e.target.value.toUpperCase())}
                    placeholder="如: BOM-8823"
                    className="flex-1 h-9 glass-input rounded-lg px-3 font-mono font-bold text-sm text-zinc-100 uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => setSyncCode(generateRandomCode())}
                    title="重新生成随机码"
                    className={BTN_UNIFIED}
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
                    <span>随机</span>
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-zinc-500">
                  支持自定义英文与数字，在其他电脑上输入该码即可载入整张清单。
                </p>
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1.5">
                  访问口令 (选填，防他人篡改或查看)
                </label>
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-zinc-500 ml-1" />
                  <input
                    type="password"
                    value={syncPassword}
                    onChange={(e) => setSyncPassword(e.target.value)}
                    placeholder="留空则不设口令"
                    className="flex-1 h-9 glass-input rounded-lg px-3 text-xs text-zinc-100"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-white/10">
                <span className="text-[11px] text-zinc-500">上次保存: {lastSyncStr}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={BTN_UNIFIED}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>已复制链接</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                        <span>复制直达链接</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSyncing}
                    className={`${BTN_UNIFIED} bg-white/[0.12] hover:bg-white/[0.18] border-white/20 text-white font-semibold`}
                  >
                    <CloudUpload className="w-3.5 h-3.5" />
                    <span>{isSyncing ? '保存中...' : '保存到云端'}</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'load' && (
            <>
              <div>
                <label className="block text-zinc-400 font-medium mb-1.5">
                  输入项目同步码 (提取码)
                </label>
                <input
                  type="text"
                  value={loadCode}
                  onChange={(e) => setLoadCode(e.target.value.toUpperCase())}
                  placeholder="如: BOM-8823"
                  className="w-full h-9 glass-input rounded-lg px-3 font-mono font-bold text-sm text-zinc-100 uppercase"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1.5">
                  输入访问口令 (若该项目设置了密码)
                </label>
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-zinc-500 ml-1" />
                  <input
                    type="password"
                    value={loadPassword}
                    onChange={(e) => setLoadPassword(e.target.value)}
                    placeholder="若无密码请留空"
                    className="flex-1 h-9 glass-input rounded-lg px-3 text-xs text-zinc-100"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] leading-relaxed">
                提示：从云端拉取将载入此项目码保存的全部设备、弱电服务与报价清单，并替换本地当前未保存的草稿。
              </div>

              <div className="pt-2 flex items-center justify-end border-t border-white/10">
                <button
                  type="button"
                  onClick={handleLoad}
                  disabled={isSyncing}
                  className={`${BTN_UNIFIED} bg-white/[0.12] hover:bg-white/[0.18] border-white/20 text-white font-semibold`}
                >
                  <CloudDownload className="w-3.5 h-3.5" />
                  <span>{isSyncing ? '载入中...' : '载入云端数据'}</span>
                </button>
              </div>
            </>
          )}

          {activeTab === 'publish' && (
            <>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-zinc-200 font-semibold text-xs">
                  <Globe className="w-4 h-4 text-sky-400" />
                  <span>站长管理：发布为全网官方默认</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  使用站长管理员口令，可将您当前录入、编辑整理好的所有设备、指导价、品牌、弱电材料及工程服务发布为全网官方公共基础库。
                </p>
                <div className="text-[11px] text-emerald-400/90 font-medium">
                  ✓ 发布后，全球任何访客打开网页，都将直接默认呈现此最新版本。
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1.5">
                  输入管理员发布口令 (Master Password)
                </label>
                <div className="relative flex items-center">
                  <KeyRound className="absolute left-3 w-4 h-4 text-zinc-500 pointer-events-none" />
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="请输入管理员发布口令"
                    className="w-full h-9 glass-input rounded-lg pl-9 pr-9 text-xs text-zinc-100 placeholder:text-zinc-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-2.5 h-6 w-6 flex items-center justify-center text-zinc-500 hover:text-zinc-300"
                    title={showAdminPassword ? '隐藏口令' : '显示口令'}
                  >
                    {showAdminPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end border-t border-white/10">
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isSyncing}
                  className={`${BTN_UNIFIED} bg-white/[0.12] hover:bg-white/[0.18] border-white/20 text-white font-semibold`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{isSyncing ? '发布中...' : '发布为全网默认'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
