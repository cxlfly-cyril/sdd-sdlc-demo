# 验收追溯

实现与验证对应如下。映射检查只验证结构，不证明测试符合业务语义。

| 标准 | 实现 | 单元测试（tests/tasks.test.ts） | 浏览器测试（tests/e2e/todo.spec.ts） |
| --- | --- | --- | --- |
| AC-001 | src/tasks.ts、src/main.ts | trims title, starts incomplete and preserves input | 添加后显示裁剪标题并清空输入 |
| AC-002 | src/tasks.ts、src/main.ts | rejects blank input | 空输入显示提示且不新增 |
| AC-003 | src/tasks.ts、src/main.ts | toggles only selected ID and can restore | 同名任务中只切换目标并恢复 |
| AC-004 | src/tasks.ts、src/main.ts、src/style.css | deletes only selected duplicate title | 删除同名任务之一，另一项保持完成；PC 悬停/键盘显示及手机常驻触控 |
| AC-005 | src/storage.ts、src/main.ts | persists completion and deletion | 刷新保留状态、删除后再次刷新 |

补充单元测试验证无历史数据、损坏 JSON、错误数据结构、重复 ID、存储读写异常。补充浏览器测试验证 HTML 形式标题按文本显示、损坏数据提示及存储不可用时仍可添加任务。

具体执行结果见 [验证记录](changes/001-initial/verification.md)。

## 运行监控追溯

| 运行约定 | 实现 | 验证 |
| --- | --- | --- |
| MON-001 | scripts/site-health.mjs、monitor-pages.mjs | tests/monitor.test.ts 的页面/资产成功及 6 种失败场景；真实站点 dry-run |
| MON-002 | scripts/monitor-state.mjs | opens one issue with failure evidence |
| MON-003 | scripts/monitor-state.mjs | repeated failure stays quiet and does not duplicate |
| MON-004 | scripts/monitor-state.mjs | recovery records evidence and closes only monitor incidents |

监控 Issue API 的单元测试使用伪实现，真实事件流转待隔离故障演练确认。
