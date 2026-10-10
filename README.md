# sdd-sdlc-demo

用一个任务清单应用演示规格驱动开发和 AI-native SDLC。

## 当前阶段

第 6 步：应用已上线且线上验收通过，接入定时可用性监控与故障记录；Agent 诊断修复为后续步骤。

## 产品范围

Vite + TypeScript，无前端框架；任务保存在 localStorage。支持添加、完成和删除任务。

## 文档入口

- [当前业务规格](specs/todo.md)：预期行为的权威依据。
- [初始变更](changes/001-initial/intent.md)：此次目标、方案、任务和验证证据。
- [验收追溯](traceability.md)：验收标准到测试的映射。
- [开发流程](docs/workflow.md)：阶段交接与完成条件。

## 本项目的 Full SDD 约定

持续维护规格，代码和测试可追溯到验收标准，需求变化与缺陷修复同步维护相关产物。此称谓是项目内约定，不是行业认证。

## 计划中的生命周期

Issue → 意图 → 规格审阅 → 方案与任务 → AI 实现和测试 → PR/CI → 人工批准 → 演示部署 → 线上检查 → 事件 Issue → 修复 PR。

## 运行方法

需要 Node.js 22.12+ 或支持当前 Vite 的更新版本。

```bash
npm ci
npm run dev
```

执行验证：

```bash
npm run check:traceability
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

浏览器数据仅保存在当前浏览器；存储损坏或不可用时页面会提示。

## 持续集成

PR 和 main 更新触发 `CI / Acceptance checks`，执行追溯结构检查、类型检查、单元测试、构建和 Chromium 验收。Actions 页面可下载 browser-results 报告；失败时包含 trace 和截图。

追溯结构检查不能代替业务验收。请等待 CI 通过后人工审阅合并；main 已要求通过 Acceptance checks 后才能合并 PR，管理员也受此约束。

## 演示发布

在线地址：<https://cxlfly-cyril.github.io/sdd-sdlc-demo/>。发布与线上验收已通过。

PR 会对仓库子路径下的生产构建执行浏览器验收。main 检查通过后发布 Pages，再验证页面资产与线上业务；失败时查看 Deploy and verify Pages 日志和 online-browser-results 报告。

本地验证生产版本：

```bash
npm run build -- --base=/sdd-sdlc-demo/
npm run preview -- --base=/sdd-sdlc-demo/ --host 127.0.0.1 --port 4174
# 另一个终端
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4174/sdd-sdlc-demo/ npm run test:e2e
```

发布失败的恢复方法见 changes/003-pages/plan.md。浏览器存储按站点来源隔离，本地任务不会迁移到线上。

## 可用性监控

Pages monitor 每 30 分钟检查页面和 JS、CSS；失败时建立一个故障 Issue，持续失败去重，恢复时记录证据并关闭。正常状态不反复评论。Actions 支持手动执行，并保留 monitor-result 报告 7 天。

只读本地检查：`MONITOR_DRY_RUN=1 node scripts/monitor-pages.mjs`。

运行约定见 specs/operations.md。定时执行不是精确的可用性 SLA；真实故障演练和 Agent 自动修复仍待后续验证。

## 只提需求，流程自动跟随

直接向仓库 Agent 描述需求，例如“删除按钮太抢眼，弱化一点，手机上仍方便操作”。Agent 根据 AGENTS.md 自动读取相关规格、判断影响、创建简短 Changes、实现并验证，再提交 PR；用户只负责必要的产品决定和最终合并。

小改动使用 change.json + record.md，不要求用户填写模板。Agent 可用 `npm run change:new -- short-name` 创建记录，`npm run check:change` 检查交付清单。CI 会拦截缺少新记录、遗漏修改文件、无效验收编号、行为变化未更新规格及未填验证结果等情况。

这些检查验证结构与声明，业务语义仍需 Agent 和人工审阅。云端 Agent 是否自动启动属于独立配置；本次固化的是已运行 Agent 的工作流程。
