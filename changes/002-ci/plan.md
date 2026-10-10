# CI 方案

单一 Acceptance checks 作业在 Ubuntu、Node.js 24 上执行；npm ci 使用锁文件。Actions 固定到已核验发布版本的提交。

PR、main push 和手动触发均运行同一检查链。权限为 contents: read；同分支旧运行取消，作业最多 15 分钟。

追溯检查验证规格编号唯一、映射完整以及测试源码引用编号，不判定业务语义。Playwright 禁止遗留 test.only；保留 HTML 报告和失败 trace、截图 7 天。

本阶段不部署；合并要求通过 CI 并人工审阅。分支保护强制门禁尚未配置。
