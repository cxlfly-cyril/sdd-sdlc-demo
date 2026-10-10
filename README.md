# sdd-sdlc-demo

用一个任务清单应用演示规格驱动开发和 AI-native SDLC。

## 当前阶段

第 4 步：任务清单与验收测试已合并，接入 GitHub Actions CI；部署和维护自动化仍为后续步骤。

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

追溯结构检查不能代替业务验收。请等待 CI 通过后人工审阅合并；仓库尚未配置强制分支保护。
