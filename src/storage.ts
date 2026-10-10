import type { Task } from './tasks';
export const STORAGE_KEY = 'sdd-todo-v1';
export interface StoragePort { getItem(key: string): string | null; setItem(key: string, value: string): void }
export function loadTasks(storage: StoragePort): { tasks: Task[]; warning: string } {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw === null) return { tasks: [], warning: '' };
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data) || !data.every(item => item && typeof item.id === 'string' && item.id &&
      typeof item.title === 'string' && item.title.trim() && typeof item.completed === 'boolean') ||
      new Set(data.map(item => item.id)).size !== data.length) throw new Error('Invalid data');
    return { tasks: data.map(({ id, title, completed }) => ({ id, title, completed })), warning: '' }; // AC-005
  } catch {
    return { tasks: [], warning: '无法读取已保存的任务，已进入空列表。你可以继续使用；刷新后数据可能丢失。' };
  }
}
export function saveTasks(storage: StoragePort, tasks: Task[]): string {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(tasks)); return ''; } // AC-005
  catch { return '任务仅保留在当前页面，无法保存；刷新后可能丢失。'; }
}
