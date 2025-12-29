/**
 * 註冊功能測試
 */

const { test, expect } = require('@playwright/test');
const {
  clearLocalStorage,
  waitForPageLoad,
  expectAuthPage,
  register,
  login,
  expectUserPage,
  getStoredUsers,
  expectMessage,
  generateRandomUsername,
} = require('./test-helpers');

test.describe('註冊功能測試', () => {
  test.beforeEach(async ({ page }) => {
    // 每個測試前清除 LocalStorage 並重新載入頁面
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await waitForPageLoad(page);
  });

  test('應該能夠切換到註冊表單', async ({ page }) => {
    await expectAuthPage(page);
    
    // 點擊註冊連結
    await page.click('#show-register');
    
    // 應該顯示註冊表單
    await expect(page.locator('#register-form.active')).toBeVisible();
    await expect(page.locator('#register-form h2')).toContainText('會員註冊');
  });

  test('成功註冊新使用者', async ({ page }) => {
    const username = generateRandomUsername();
    const password = 'password123';
    
    await register(page, username, password);
    
    // 應該顯示成功訊息
    await expectMessage(page, '#auth-message', '註冊成功', 'success');
    
    // 應該自動跳轉回登入表單
    await page.waitForTimeout(2000);
    await expect(page.locator('#login-form.active')).toBeVisible();
    
    // 應該自動填入帳號
    const usernameInput = page.locator('#login-username');
    await expect(usernameInput).toHaveValue(username);
    
    // 檢查 LocalStorage 中是否有新使用者
    const users = await getStoredUsers(page);
    const newUser = users.find(u => u.username === username);
    expect(newUser).not.toBeUndefined();
    expect(newUser.role).toBe('user');
    expect(newUser.points).toBe(0);
  });

  test('註冊後應該可以登入', async ({ page }) => {
    const username = generateRandomUsername();
    const password = 'password123';
    
    // 註冊
    await register(page, username, password);
    await page.waitForTimeout(2000);
    
    // 登入
    await login(page, username, password);
    
    // 應該跳轉到使用者頁面
    await expectUserPage(page);
    await expect(page.locator('#user-username')).toContainText(username);
  });

  test('密碼不一致應該顯示錯誤', async ({ page }) => {
    await page.click('#show-register');
    
    // 填寫不一致的密碼
    await page.fill('#register-username', 'testuser');
    await page.fill('#register-password', 'password123');
    await page.fill('#register-password-confirm', 'password456');
    
    // 提交表單
    await page.click('#register-form button[type="submit"]');
    
    // 應該顯示錯誤訊息
    await expectMessage(page, '#auth-message', '兩次輸入的密碼不一致', 'error');
  });

  test('帳號長度少於 3 個字元應該顯示錯誤', async ({ page }) => {
    await page.click('#show-register');
    
    // 填寫短帳號
    await page.fill('#register-username', 'ab');
    await page.fill('#register-password', 'password123');
    await page.fill('#register-password-confirm', 'password123');
    
    // 提交表單
    await page.click('#register-form button[type="submit"]');
    
    // 應該顯示錯誤訊息
    await expectMessage(page, '#auth-message', '帳號長度至少需要 3 個字元', 'error');
  });

  test('密碼長度少於 6 個字元應該顯示錯誤', async ({ page }) => {
    await page.click('#show-register');
    
    // 填寫短密碼
    await page.fill('#register-username', 'testuser');
    await page.fill('#register-password', '12345');
    await page.fill('#register-password-confirm', '12345');
    
    // 提交表單
    await page.click('#register-form button[type="submit"]');
    
    // 應該顯示錯誤訊息
    await expectMessage(page, '#auth-message', '密碼長度至少需要 6 個字元', 'error');
  });

  test('重複註冊相同帳號應該顯示錯誤', async ({ page }) => {
    const username = generateRandomUsername();
    const password = 'password123';
    
    // 第一次註冊
    await register(page, username, password);
    await page.waitForTimeout(2000);
    
    // 切換回註冊表單
    await page.click('#show-register');
    
    // 第二次註冊相同帳號
    await register(page, username, password);
    
    // 應該顯示錯誤訊息
    await expectMessage(page, '#auth-message', '此帳號已被註冊', 'error');
  });

  test('可以從註冊表單切換回登入表單', async ({ page }) => {
    // 切換到註冊表單
    await page.click('#show-register');
    await expect(page.locator('#register-form.active')).toBeVisible();
    
    // 切換回登入表單
    await page.click('#show-login');
    await expect(page.locator('#login-form.active')).toBeVisible();
    await expect(page.locator('#login-form h2')).toContainText('會員登入');
  });
});
