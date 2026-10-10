export interface Task { id: string; title: string; completed: boolean }
export function addTask(tasks: Task[], title: string, id = crypto.randomUUID()): Task[] {
  const trimmed = title.trim();
  if (!trimmed) throw new Error('请输入任务标题。'); // AC-002
  return [...tasks, { id, title: trimmed, completed: false }]; // AC-001
}
export function toggleTask(tasks: Task[], id: string): Task[] {
  return tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task); // AC-003
}
export function deleteTask(tasks: Task[], id: string): Task[] {
  return tasks.filter(task => task.id !== id); // AC-004
}
