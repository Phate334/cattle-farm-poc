/**
 * 登入功能測試
 */

const { test, expect } = require('@playwright/test');
const {
  clearLocalStorage,
  waitForPageLoad,
  expectAuthPage,
  expectAdminPage,
  expectUserPage,
  login,
  getCurrentUser,
  expectMessage,
} = require('./test-helpers');

test.describe('登入功能測試', () => {
  test.beforeEach(async ({ page }) => {
    // 每個測試前清除 LocalStorage 並重新載入頁面
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await waitForPageLoad(page);
  });

  test('應該顯示登入頁面', async ({ page }) => {
    await expectAuthPage(page);
    await expect(page.locator('#login-form.active')).toBeVisible();
    await expect(page.locator('h2')).toContainText('會員登入');
  });

  test('使用預設管理員帳號登入成功', async ({ page }) => {
    await login(page, 'admin', 'admin');
    
    // 應該跳轉到管理員頁面
    await expectAdminPage(page);
    
    // 檢查管理員名稱顯示
    await expect(page.locator('#admin-username')).toContainText('admin');
    
    // 檢查 LocalStorage 中的當前使用者
    const currentUser = await getCurrentUser(page);
    expect(currentUser).not.toBeNull();
    expect(currentUser.username).toBe('admin');
    expect(currentUser.role).toBe('admin');
  });

  test('使用錯誤的帳號密碼應該登入失敗', async ({ page }) => {
    await login(page, 'wronguser', 'wrongpass');
    
    // 應該停留在登入頁面
    await expectAuthPage(page);
    
    // 應該顯示錯誤訊息
    await expectMessage(page, '#auth-message', '帳號或密碼錯誤', 'error');
  });

  test('空白帳號或密碼應該顯示錯誤', async ({ page }) => {
    // 不填寫任何資料直接提交
    await page.click('#login-form button[type="submit"]');
    
    // 應該停留在登入頁面
    await expectAuthPage(page);
    
    // 檢查 HTML5 驗證（瀏覽器原生驗證）
    const usernameInput = page.locator('#login-username');
    await expect(usernameInput).toHaveAttribute('required', '');
  });

  test('登入後重新整理頁面應該保持登入狀態', async ({ page }) => {
    await login(page, 'admin', 'admin');
    await expectAdminPage(page);
    
    // 重新整理頁面
    await page.reload();
    await waitForPageLoad(page);
    
    // 應該仍在管理員頁面
    await expectAdminPage(page);
    await expect(page.locator('#admin-username')).toContainText('admin');
  });
});
