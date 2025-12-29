/**
 * 管理員功能測試
 */

const { test, expect } = require('@playwright/test');
const {
  clearLocalStorage,
  waitForPageLoad,
  login,
  logout,
  expectAuthPage,
  expectAdminPage,
  register,
  getStoredUsers,
  generateRandomUsername,
} = require('./test-helpers');

test.describe('管理員功能測試', () => {
  test.beforeEach(async ({ page }) => {
    // 每個測試前清除 LocalStorage 並重新載入頁面
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await waitForPageLoad(page);
    
    // 以管理員身份登入
    await login(page, 'admin', 'admin');
    await expectAdminPage(page);
  });

  test('管理員頁面應該顯示正確的標題和使用者名稱', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('管理員後臺');
    await expect(page.locator('#admin-username')).toContainText('admin');
  });

  test('管理員應該能夠看到使用者列表', async ({ page }) => {
    // 登出並註冊一個測試使用者
    await logout(page);
    const testUser = generateRandomUsername();
    await register(page, testUser, 'password123');
    await page.waitForTimeout(2000);
    
    // 重新以管理員登入
    await login(page, 'admin', 'admin');
    await expectAdminPage(page);
    
    // 應該看到使用者列表
    const usersTable = page.locator('.users-table');
    await expect(usersTable).toBeVisible();
    
    // 應該包含測試使用者
    await expect(page.locator('.users-table')).toContainText(testUser);
  });

  test('管理員應該能夠為使用者指派點數', async ({ page }) => {
    // 登出並註冊一個測試使用者
    await logout(page);
    const testUser = generateRandomUsername();
    await register(page, testUser, 'password123');
    await page.waitForTimeout(2000);
    
    // 重新以管理員登入
    await login(page, 'admin', 'admin');
    await expectAdminPage(page);
    
    // 選擇使用者
    const userSelect = page.locator('#target-user');
    await userSelect.selectOption({ label: new RegExp(testUser) });
    
    // 填寫點數
    await page.fill('#points-amount', '100');
    
    // 提交表單
    await page.click('#assignPointsForm button[type="submit"]');
    
    // 等待操作完成
    await page.waitForTimeout(500);
    
    // 應該顯示成功訊息
    const message = page.locator('#admin-message');
    await expect(message).toBeVisible();
    await expect(message).toContainText('成功');
    await expect(message).toContainText('100');
    
    // 檢查使用者列表中的點數已更新
    await expect(page.locator('.users-table')).toContainText('100');
    
    // 檢查 LocalStorage 中的資料
    const users = await getStoredUsers(page);
    const updatedUser = users.find(u => u.username === testUser);
    expect(updatedUser.points).toBe(100);
  });

  test('管理員應該能夠多次為同一使用者增加點數', async ({ page }) => {
    // 登出並註冊一個測試使用者
    await logout(page);
    const testUser = generateRandomUsername();
    await register(page, testUser, 'password123');
    await page.waitForTimeout(2000);
    
    // 重新以管理員登入
    await login(page, 'admin', 'admin');
    await expectAdminPage(page);
    
    // 第一次指派 50 點
    await page.locator('#target-user').selectOption({ label: new RegExp(testUser) });
    await page.fill('#points-amount', '50');
    await page.click('#assignPointsForm button[type="submit"]');
    await page.waitForTimeout(500);
    
    // 第二次指派 30 點
    await page.locator('#target-user').selectOption({ label: new RegExp(testUser) });
    await page.fill('#points-amount', '30');
    await page.click('#assignPointsForm button[type="submit"]');
    await page.waitForTimeout(500);
    
    // 檢查 LocalStorage 中的總點數
    const users = await getStoredUsers(page);
    const updatedUser = users.find(u => u.username === testUser);
    expect(updatedUser.points).toBe(80); // 50 + 30
  });

  test('未選擇使用者時應該顯示錯誤訊息', async ({ page }) => {
    // 不選擇使用者直接填寫點數
    await page.fill('#points-amount', '100');
    await page.click('#assignPointsForm button[type="submit"]');
    
    // 應該顯示錯誤訊息
    const message = page.locator('#admin-message');
    await expect(message).toBeVisible();
    await expect(message).toContainText('請選擇使用者');
    await expect(message).toHaveClass(/error/);
  });

  test('點數數量無效時應該顯示錯誤訊息', async ({ page }) => {
    // 登出並註冊一個測試使用者
    await logout(page);
    const testUser = generateRandomUsername();
    await register(page, testUser, 'password123');
    await page.waitForTimeout(2000);
    
    // 重新以管理員登入
    await login(page, 'admin', 'admin');
    await expectAdminPage(page);
    
    // 選擇使用者但不填寫點數
    await page.locator('#target-user').selectOption({ label: new RegExp(testUser) });
    await page.click('#assignPointsForm button[type="submit"]');
    
    // 應該顯示錯誤訊息
    const message = page.locator('#admin-message');
    await expect(message).toBeVisible();
    await expect(message).toContainText('請輸入有效的點數數量');
  });

  test('管理員應該能夠登出', async ({ page }) => {
    await logout(page);
    
    // 應該返回登入頁面
    await expectAuthPage(page);
    await expect(page.locator('#login-form.active')).toBeVisible();
  });

  test('沒有一般使用者時應該顯示提示訊息', async ({ page }) => {
    // 管理員登入後，如果沒有一般使用者
    const noUsers = page.locator('.no-users');
    await expect(noUsers).toBeVisible();
    await expect(noUsers).toContainText('目前沒有一般使用者');
  });
});
