export const MARKER = '<!-- sdd-monitor:pages:v1 -->';

export async function reconcileIncident(api, health, evidence) {
  const issues = await api.listOpen();
  const incidents = issues.filter(issue => !issue.pull_request && issue.body?.includes(MARKER));
  if (!health.ok) {
    if (incidents.length) return { action: 'ongoing', issue: incidents[0].number };
    const created = await api.create({
      title: '[Monitor] Pages availability failure',
      body: `${MARKER}\n\n监控目标：${evidence.site}\n检测时间：${evidence.time}\n失败原因：\n\n${health.error}\n\n运行证据：${evidence.run}\n\n请结合规格和运行日志诊断，经 PR 审阅后修复。此事件不表示已完成诊断。`,
    });
    return { action: 'opened', issue: created.number };
  }
  for (const incident of incidents) {
    await api.comment(incident.number, `站点及页面资产检查已恢复。\n\n检测时间：${evidence.time}\n运行证据：${evidence.run}\n\n此结果仅证明可用性，业务验收见部署工作流。`);
    await api.close(incident.number);
  }
  return { action: incidents.length ? 'recovered' : 'healthy', issues: incidents.map(issue => issue.number) };
}
