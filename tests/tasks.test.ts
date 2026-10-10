import { describe, it, expect } from 'vitest';
import { addTask, toggleTask, deleteTask } from '../src/tasks';
import { loadTasks, saveTasks } from '../src/storage';
describe('验收与存储', () => {
 it('AC-001 trims title, starts incomplete and preserves input', () => { const original = []; expect(addTask(original, '  阅读  ', '1')).toEqual([{id:'1',title:'阅读',completed:false}]); expect(original).toEqual([]); });
 it('AC-002 rejects blank input', () => { expect(() => addTask([], ' \t\n')).toThrow('请输入任务标题'); });
 it('AC-003 toggles only selected ID and can restore', () => { const tasks = addTask(addTask([], '同名', '1'), '同名', '2'); const changed = toggleTask(tasks,'2'); expect(changed.map(t=>t.completed)).toEqual([false,true]); expect(toggleTask(changed,'2')).toEqual(tasks); });
 it('AC-004 deletes only selected duplicate title', () => { const tasks = addTask(addTask([], '同名', '1'), '同名', '2'); expect(deleteTask(tasks,'1').map(t=>t.id)).toEqual(['2']); });
 it('AC-005 persists completion and deletion', () => { let raw: string|null=null; const storage={getItem:()=>raw,setItem:(_key:string,value:string)=>{raw=value;}}; const tasks=deleteTask(toggleTask(addTask(addTask([], '甲','1'),'乙','2'),'2'),'1'); expect(saveTasks(storage,tasks)).toBe(''); expect(loadTasks(storage).tasks).toEqual(tasks); });
 it('accepts missing storage as empty', () => { expect(loadTasks({getItem:()=>null,setItem:()=>{}})).toEqual({tasks:[],warning:''}); });
 it.each(['{broken','{}','[{"id":"1","title":"a","completed":"false"}]','[{"id":"1","title":"a","completed":false},{"id":"1","title":"b","completed":false}]'])('recovers malformed data: %s', raw => { const loaded=loadTasks({getItem:()=>raw,setItem:()=>{}}); expect(loaded.tasks).toEqual([]); expect(loaded.warning).not.toBe(''); });
 it('handles unavailable reads and writes', () => { const storage={getItem:()=>{throw new Error('blocked');},setItem:()=>{throw new Error('quota');}}; expect(loadTasks(storage).warning).not.toBe(''); expect(saveTasks(storage,[])).toContain('刷新后可能丢失'); });
});
