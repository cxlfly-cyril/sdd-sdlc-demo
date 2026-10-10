# Pages 方案

复用 CI 验收作业，追加 /sdd-sdlc-demo/ 生产构建及 preview 浏览器测试，避免子路径资产错误。PR 只验证；main 验收成功后上传 dist，依赖 acceptance 的 deploy 作业发布。

Pages 使用 Actions 发布源；部署权限限定为 pages: write 和 id-token: write。发布后等待 HTML、JS、CSS 可访问，再用已有浏览器验收验证实际站点；测试数据仅存在测试浏览器的 localStorage。报告保留 7 天。

线上验收失败会使工作流失败，但不会自动回滚。恢复方式：在 PR 中 revert 故障变更，合并后重新发布；临时重新运行最后成功提交的 main 发布工作流也可恢复旧版本。

参考：[Vite 发布说明](https://vite.dev/guide/static-deploy.html)、[GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。
