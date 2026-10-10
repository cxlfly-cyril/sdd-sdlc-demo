import { test, expect } from '@playwright/test';
test('AC-001–005: add, reject blank, toggle, delete by ID and persist', async ({ page }) => {
 await page.goto('./');
 const input=page.getByLabel('下一件要做的事');
 await page.getByRole('button',{name:'添加任务'}).click();
 await expect(page.getByRole('alert')).toHaveText('请输入任务标题。'); // AC-002
 await input.fill('  阅读  '); await page.getByRole('button',{name:'添加任务'}).click();
 await expect(input).toHaveValue(''); await expect(page.locator('#tasks li')).toHaveCount(1);
 await expect(page.locator('#tasks li span')).toHaveText('阅读'); // AC-001
 await input.fill('阅读'); await page.getByRole('button',{name:'添加任务'}).click();
 const checks=page.getByRole('checkbox'); await checks.nth(1).check(); await expect(checks.nth(0)).not.toBeChecked();
 await checks.nth(1).uncheck(); await expect(checks.nth(1)).not.toBeChecked(); await checks.nth(1).check(); // AC-003
 await page.reload(); await expect(page.getByRole('checkbox').nth(1)).toBeChecked(); // AC-005
 await page.locator('#tasks li').nth(0).hover();
 await page.getByRole('button',{name:'删除任务：阅读',exact:true}).nth(0).click();
 await expect(page.locator('#tasks li')).toHaveCount(1); await expect(page.getByRole('checkbox')).toBeChecked(); // AC-004
 await page.reload(); await expect(page.locator('#tasks li')).toHaveCount(1); await expect(page.getByRole('checkbox')).toBeChecked(); // AC-005
});
test('titles render as text, including HTML-like content',async({page})=>{
 await page.goto('./'); await page.getByLabel('下一件要做的事').fill('<img src=x onerror=alert(1)>'); await page.getByRole('button',{name:'添加任务'}).click();
 await expect(page.locator('#tasks li span')).toHaveText('<img src=x onerror=alert(1)>'); await expect(page.locator('#tasks img')).toHaveCount(0);
});
test('malformed stored data recovers with a visible notice',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('sdd-todo-v1','{broken')); await page.goto('./');
 await expect(page.locator('#empty')).toBeVisible(); await expect(page.locator('#notice')).toContainText('无法读取');
 await page.getByLabel('下一件要做的事').fill('恢复后新增'); await page.getByRole('button',{name:'添加任务'}).click(); await expect(page.locator('#tasks li')).toHaveCount(1);
});
test('unavailable storage allows session-only operations',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked');}});}); await page.goto('./');
 await expect(page.locator('#notice')).toContainText('无法读取'); await page.getByLabel('下一件要做的事').fill('临时任务'); await page.getByRole('button',{name:'添加任务'}).click();
 await expect(page.locator('#tasks li')).toHaveCount(1); await expect(page.locator('#notice')).toContainText('当前页面');
});

test('AC-004 desktop delete reveals on row hover and keyboard focus', async ({page}) => {
 await page.goto('./');
 await page.getByLabel('下一件要做的事').fill('桌面任务');
 await page.getByRole('button',{name:'添加任务'}).click();
 await page.getByLabel('下一件要做的事').blur();
 await page.mouse.move(0,0);
 const remove=page.getByRole('button',{name:'删除任务：桌面任务',exact:true});
 await expect(remove).toHaveCSS('opacity','0');
 await expect(remove).toHaveCSS('pointer-events','none');
 await page.locator('#tasks li').hover();
 await expect(remove).toHaveCSS('opacity','1');
 await page.mouse.move(0,0);
 await expect(remove).toHaveCSS('opacity','0');
 await page.getByLabel('下一件要做的事').focus();
 await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
 await expect(remove).toBeFocused(); await expect(remove).toHaveCSS('opacity','1');
 await page.keyboard.press('Enter'); await expect(page.locator('#tasks li')).toHaveCount(0);
});
test('AC-004 mobile delete remains visible and supports touch', async ({browser,baseURL}) => {
 const context=await browser.newContext({baseURL,viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 try {
  const page=await context.newPage(); await page.goto('./');
  await page.getByLabel('下一件要做的事').fill('手机任务'); await page.getByRole('button',{name:'添加任务'}).tap();
  await page.getByLabel('下一件要做的事').blur();
  const remove=page.getByRole('button',{name:'删除任务：手机任务',exact:true});
  await expect(remove).toHaveCSS('opacity','1');
  const box=await remove.boundingBox(); expect(box.width).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44);
  await remove.tap(); await expect(page.locator('#tasks li')).toHaveCount(0);
 } finally {await context.close();}
});
