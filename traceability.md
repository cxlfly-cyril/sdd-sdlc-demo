# 验收追溯

实现与验证对应如下。映射检查只验证结构，不证明测试符合业务语义。

| 标准 | 实现 | 单元测试（tests/tasks.test.ts） | 浏览器测试（tests/e2e/todo.spec.ts） |
| --- | --- | --- | --- |
| AC-001 | src/tasks.ts、src/main.ts | trims title, starts incomplete and preserves input | 添加后显示裁剪标题并清空输入 |
| AC-002 | src/tasks.ts、src/main.ts | rejects blank input | 空输入显示提示且不新增 |
| AC-003 | src/tasks.ts、src/main.ts | toggles only selected ID and can restore | 同名任务中只切换目标并恢复 |
| AC-004 | src/tasks.ts、src/main.ts | deletes only selected duplicate title | 删除同名任务之一，另一项保持完成 |
| AC-005 | src/storage.ts、src/main.ts | persists completion and deletion | 刷新保留状态、删除后再次刷新 |

补充单元测试验证无历史数据、损坏 JSON、错误数据结构、重复 ID、存储读写异常。补充浏览器测试验证 HTML 形式标题按文本显示、损坏数据提示及存储不可用时仍可添加任务。

具体执行结果见 [验证记录](changes/001-initial/verification.md)。
