import './style.css';
import { addTask, toggleTask, deleteTask } from './tasks';
import { loadTasks, saveTasks, type StoragePort } from './storage';
const storage: StoragePort = {
  getItem: key => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
};
const loaded = loadTasks(storage);
let tasks = loaded.tasks;
const list = document.querySelector<HTMLUListElement>('#tasks')!;
const input = document.querySelector<HTMLInputElement>('#task-title')!;
const error = document.querySelector<HTMLElement>('#error')!;
const notice = document.querySelector<HTMLElement>('#notice')!;
notice.textContent = loaded.warning;
function persist() { const warning = saveTasks(storage, tasks); if (warning) notice.textContent = warning; }
function render() {
  list.replaceChildren();
  tasks.forEach(task => {
    const row = document.createElement('li'); row.dataset.id = task.id;
    const label = document.createElement('label'); label.className = 'task';
    const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = task.completed;
    const title = document.createElement('span'); title.textContent = task.title;
    checkbox.addEventListener('change', () => { tasks = toggleTask(tasks, task.id); persist(); render(); list.querySelector<HTMLInputElement>(`li[data-id="${CSS.escape(task.id)}"] input`)?.focus(); });
    label.append(checkbox, title);
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'remove'; remove.textContent = '删除'; remove.setAttribute('aria-label', `删除任务：${task.title}`);
    remove.addEventListener('click', () => { const index = tasks.findIndex(item => item.id === task.id); tasks = deleteTask(tasks, task.id); persist(); render(); (list.querySelectorAll<HTMLButtonElement>('.remove')[Math.min(index, tasks.length - 1)] ?? input).focus(); });
    row.append(label, remove); list.append(row);
  });
  document.querySelector<HTMLElement>('#empty')!.hidden = tasks.length !== 0;
  document.querySelector<HTMLElement>('#count')!.textContent = `${tasks.filter(task => task.completed).length} / ${tasks.length} 已完成`;
}
document.querySelector<HTMLFormElement>('#task-form')!.addEventListener('submit', event => {
  event.preventDefault();
  try { tasks = addTask(tasks, input.value); error.textContent = ''; input.removeAttribute('aria-invalid'); input.value = ''; persist(); render(); }
  catch (cause) { error.textContent = (cause as Error).message; input.setAttribute('aria-invalid', 'true'); }
  input.focus();
});
render();
