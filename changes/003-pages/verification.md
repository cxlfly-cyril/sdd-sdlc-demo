# Pages 验证记录

2026-10-10 本地验证：

- Pages API 创建及回读确认 build_type 为 workflow，地址为 https://cxlfly-cyril.github.io/sdd-sdlc-demo/ 。
- `npm run check:traceability`：5 条结构映射通过。
- `npm run build -- --base=/sdd-sdlc-demo/`：类型检查及构建通过。
- 子路径 preview 的页面、JS、CSS 检查通过。
- `PLAYWRIGHT_BASE_URL=http://127.0.0.1:4174/sdd-sdlc-demo/ npm run test:e2e`：4 项通过。
- `git diff --check`：通过。

首次 preview 未设置 base，资产检查未通过；补充 preview 的 --base 参数后通过。

PR CI：[38021505829](https://github.com/cxlfly-cyril/sdd-sdlc-demo/actions/runs/38021505829) 全部通过（59 秒）。

真实发布和线上验收：用户合并 PR #4 后，[main CI 38021632785](https://github.com/cxlfly-cyril/sdd-sdlc-demo/actions/runs/38021632785) 全部成功。Acceptance checks 55 秒，Deploy and verify Pages 64 秒；线上浏览器测试和报告上传通过。在线地址：https://cxlfly-cyril.github.io/sdd-sdlc-demo/ 。
