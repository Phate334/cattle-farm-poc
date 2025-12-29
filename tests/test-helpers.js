/**
 * Playwright 測試輔助工具函數
 */

const { expect } = require('@playwright/test');

/**
 * 清除 LocalStorage 資料
 */
async function clearLocalStorage(page) {
  await page.evaluate(() => {
    localStorage.clear();
  });
}

/**
 * 等待頁面載入完成
 */
async function waitForPageLoad(page) {
  await page.waitForLoadState('networkidle');
}

/**
 * 檢查是否在登入頁面
 */
async function expectAuthPage(page) {
  await expect(page.locator('#auth-page.active')).toBeVisible();
}

/**
 * 檢查是否在管理員頁面
 */
async function expectAdminPage(page) {
  await expect(page.locator('#admin-page.active')).toBeVisible();
}

/**
 * 檢查是否在使用者頁面
 */
async function expectUserPage(page) {
  await expect(page.locator('#user-page.active')).toBeVisible();
}

/**
 * 執行登入操作
 */
async function login(page, username, password) {
  // 確保在登入頁面
  const loginForm = page.locator('#login-form.active');
  await expect(loginForm).toBeVisible();
  
  // 填寫登入表單
  await page.fill('#login-username', username);
  await page.fill('#login-password', password);
  
  // 點擊登入按鈕
  await page.click('button[type="submit"]');
  
  // 等待頁面跳轉
  await page.waitForTimeout(1000);
}

/**
 * 執行註冊操作
 */
async function register(page, username, password) {
  // 切換到註冊表單
  await page.click('#show-register');
  
  // 確保在註冊頁面
  const registerForm = page.locator('#register-form.active');
  await expect(registerForm).toBeVisible();
  
  // 填寫註冊表單
  await page.fill('#register-username', username);
  await page.fill('#register-password', password);
  await page.fill('#register-password-confirm', password);
  
  // 點擊註冊按鈕
  await page.click('#register-form button[type="submit"]');
  
  // 等待註冊完成
  await page.waitForTimeout(2000);
}

/**
 * 執行登出操作
 */
async function logout(page) {
  // 尋找登出按鈕（管理員或使用者頁面）
  const adminLogout = page.locator('#admin-logout');
  const userLogout = page.locator('#user-logout');
  
  if (await adminLogout.isVisible()) {
    await adminLogout.click();
  } else if (await userLogout.isVisible()) {
    await userLogout.click();
  }
  
  // 等待返回登入頁面
  await page.waitForTimeout(500);
  await expectAuthPage(page);
}

/**
 * 取得 LocalStorage 中的使用者資料
 */
async function getStoredUsers(page) {
  return await page.evaluate(() => {
    const usersJson = localStorage.getItem('cattleFarmUsers');
    return usersJson ? JSON.parse(usersJson) : [];
  });
}

/**
 * 取得當前登入使用者
 */
async function getCurrentUser(page) {
  return await page.evaluate(() => {
    const userJson = localStorage.getItem('cattleFarmCurrentUser');
    return userJson ? JSON.parse(userJson) : null;
  });
}

/**
 * 檢查訊息顯示
 */
async function expectMessage(page, messageLocator, text, type) {
  const message = page.locator(messageLocator);
  await expect(message).toBeVisible();
  await expect(message).toHaveText(new RegExp(text));
  if (type) {
    await expect(message).toHaveClass(new RegExp(type));
  }
}

/**
 * 產生隨機使用者名稱（用於測試）
 */
function generateRandomUsername() {
  return `testuser_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

module.exports = {
  clearLocalStorage,
  waitForPageLoad,
  expectAuthPage,
  expectAdminPage,
  expectUserPage,
  login,
  register,
  logout,
  getStoredUsers,
  getCurrentUser,
  expectMessage,
  generateRandomUsername,
};
