# NetBOM — 企业级网络设备选型与智能物料报价工作台

> 专为网络架构师、售前工程师与系统集成商打造的现代化设备选型、参数横向比选、辅件防呆校验与工程报价单生成工具。

![NetBOM Preview](https://img.shields.io/badge/Status-Active-emerald?style=flat-square)
![Stack](https://img.shields.io/badge/Stack-React%2019%20%2B%20Vite%206%20%2B%20Tailwind%20v4-sky?style=flat-square)
![Local-First](https://img.shields.io/badge/Architecture-Local--First%20Privacy-purple?style=flat-square)
![Ecosystem](https://img.shields.io/badge/Ecosystem-bin0sky.tech-amber?style=flat-square)

---

## 🌟 核心特性与解决的行业痛点

1. **官方真实规格溯源与防呆**
   - 告别参数靠猜：每款收录设备均严格对应厂商官网技术白皮书，标注准确物料订货号（P/N）与核验时间戳。
   - 避免停产风险：标明设备生命周期（在售 / EOL退市），停产设备直接提示推荐替代型号，规避招投标违规风险。
   - 辅件防呆：针对裸机（出厂不带电源）机型自动预警，支持一键配齐原厂/兼容双电源、10G/25G 光模块与 DAC 高速线缆。

2. **动态价格与商务测算引擎**
   - 收录公开目录指导价（GPL / List Price）。
   - 阶梯提货折扣调节滑动条（如 2.8 折、3.5 折），实时联动测算对客报价。
   - 支持表格内双击即时覆盖自定义协议底价，支持设置税率（13% 专票、6% 普票、免税）。

3. **工业级 Excel 报价单导出 (`exceljs`)**
   - 拒绝简陋纯文本表格：一键导出符合国内工程招投标规范的商务 Excel 报价单。
   - 包含专业科技蓝深色表头、自适应列宽、斑马线排版、大写人民币自动转换。
   - **内置真实 Excel 动态计算公式**：生成 `=G5*K5`（数量*单价）、`=SUM(...)` 合计，方便商务人员二次编辑。

4. **100% Local-First 商业机密安全**
   - 无需登录、无需注册，所有工程草稿、客户底价与项目方案全部保存在本地浏览器（LocalStorage / IndexedDB），商业敏感数据绝不上传服务器。

5. **永久分享链接 (URL Compression)**
   - 借助 `lz-string` 算法将整套方案压缩至 URL 参数中，生成分享链接发给同事，对方打开即可无缝加载完整方案并继续协同修改。

---

## 🛠️ 技术选型 (Tech Stack)

| 模块 | 选型技术 | 说明 |
| :--- | :--- | :--- |
| **构建框架** | Vite 6 + React 19 + TypeScript | 极致快速的热更新与现代 React 架构 |
| **样式系统** | Tailwind CSS v4 (`@tailwindcss/vite`) | 深空灰暗黑拟态与流体玻璃质感 |
| **图标库** | Lucide React | 丰富的服务器、光纤、端口与电气硬件矢量图标 |
| **状态持久化** | Zustand + persist | 本地优先，离线存盘，防误关闭丢失方案 |
| **导出引擎** | `exceljs` | 浏览器端原生生成带样式与公式的高级 Excel |
| **数据约束** | `zod` | 严格保证录入数据的完整性与时间溯源要求 |
| **生态集成** | `public/nav-pill.js` | 与 `bin0sky.tech` 门户统一导航胶囊互通 |

---

## 📁 目录组织架构

```text
online-ai-netbom/
├── public/
│   ├── favicon.svg          # 苹果圆角拟态图标
│   └── nav-pill.js          # 全局生态导航胶囊
├── src/
│   ├── components/
│   │   ├── Header.tsx       # 顶部玻璃导航栏、全局搜索、BOM 状态角标
│   │   ├── FilterSidebar.tsx # 品牌、速率、PoE、EOL 组合筛选器
│   │   ├── DeviceCard.tsx   # 硬件参数卡片、端口矩阵、官网直链
│   │   ├── DeviceCatalog.tsx# 设备网格流与匹配状态栏
│   │   ├── BOMDrawer.tsx    # 核心物料清单工作台、税率折扣滑块、辅件选配
│   │   └── DeviceDiffModal.tsx # 多机型横向 Diff 差异参数并排高亮对比
│   ├── data/
│   │   └── seedDevices.ts   # 官方核验设备库 (华为、H3C、思科、锐捷、飞速等)
│   ├── schema/
│   ├── store/
│   │   └── useBOMStore.ts   # Zustand 全局响应式状态与持久化
│   ├── types/
│   │   └── device.ts        # Zod 规格模型与 TypeScript 接口定义
│   ├── utils/
│   │   └── excel-export.ts  # exceljs 工业级工程报价单生成器
│   ├── App.tsx              # 主视图容器与 URL 方案解析
│   ├── index.css            # Tailwind v4 主样式
│   └── main.tsx             # 应用挂载入口
├── package.json
└── vite.config.ts
```

---

## 🚀 本地开发与启动

```bash
# 1. 进入项目根目录
cd online-ai-netbom

# 2. 启动本地开发服务器
npm run dev

# 3. 生产打包构建 (静态产物输出至 dist/ 目录)
npm run build
```

---

## 🏛️ 融入 bin0sky.tech 生态

该项目设计为纯静态输出（SPA），可直接挂载至 Cloudflare Pages 或边缘网关：
- 独立域名：`bom.bin0sky.tech`
- 单主域名统一路径：`bin0sky.tech/bom`
