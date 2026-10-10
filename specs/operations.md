# 运行监控约定

范围：在线演示的可用性监控，不替代 AC-001—005 浏览器业务验收。

- MON-001：检查站点 HTTP、应用标题、JS 和 CSS 可访问，资产不能返回 HTML；短暂失败重试后再判定。
- MON-002：检查失败时创建带目标、时间、失败原因和 Actions 证据的故障 Issue。
- MON-003：同一目标有未关闭监控 Issue 时，不重复创建或反复评论；普通 Issue 和 PR 不参与恢复处理。
- MON-004：检查恢复后，向监控 Issue 记录恢复证据并关闭；无事件的正常运行保持安静。

频率：每 30 分钟；也可在 Pages monitor 工作流手动运行。并发串行，防止重复建单。GitHub 定时执行可能延迟；公开仓库连续 60 天无活动时计划任务可能自动停用，参见 [官方事件说明](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)。

后续 Agent 从事件诊断并建立修复 PR，本阶段不自动修复。
