# CI 验证记录

日期：2026-10-10。本地 macOS、Node.js v25.5.0；真实 Ubuntu/Node.js 24 验证见后续 Actions 链接。

- `npm run check:traceability`：5 条验收标准结构检查通过。
- 临时移除 AC-003 映射后运行同一命令：退出码 1，并明确指出缺失映射；原文件已恢复。
- `npm run typecheck`：通过。
- `npm test`：11 项通过。
- `npm run build`：通过。
- `npm run test:e2e`：4 项通过；生成 HTML 报告。
- `git diff --check`：通过。

首次结构检查未识别中文冒号；修正为同时支持中英文冒号后验证通过。

真实 CI：源码提交 `2ba5288` 在 [Actions 运行 38020248482](https://github.com/cxlfly-cyril/sdd-sdlc-demo/actions/runs/38020248482) 全部通过，Acceptance checks 耗时 35 秒；browser-results 报告上传成功。此后仅补充验证文档，PR 最新提交的 Checks 仍须通过。本阶段未部署，也未配置强制分支保护。
