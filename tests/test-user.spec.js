/**
 * 一般使用者功能測試
 */

const { test, expect } = require('@playwright/test');
const {
  clearLocalStorage,
  waitForPageLoad,
  login,
  logout,
  expectAuthPage,
  expectUserPage,
  register,
  generateRandomUsername,
} = require('./test-helpers');

test.describe('一般使用者功能測試', () => {
  let testUsername;
  let testPassword;

  test.beforeEach(async ({ page }) => {
    // 每個測試前清除 LocalStorage 並重新載入頁面
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    await waitForPageLoad(page);
    
    // 註冊一個測試使用者
    testUsername = generateRandomUsername();
    testPassword = 'password123';
    await register(page, testUsername, testPassword);
    await page.waitForTimeout(2000);
    
    // 以測試使用者登入
    await login(page, testUsername, testPassword);
    await expectUserPage(page);
  });

  test('使用者頁面應該顯示正確的標題和使用者名稱', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('會員中心');
    await expect(page.locator('#user-username')).toContainText(testUsername);
  });

  test('使用者應該能夠看到自己的點數', async ({ page }) => {
    // 檢查點數區域
    const pointsSection = page.locator('.points-section');
    await expect(pointsSection).toBeVisible();
    await expect(pointsSection.locator('h2')).toContainText('我的點數');
    
    // 新註冊使用者的點數應該是 0
    const pointsNumber = page.locator('#user-points');
    await expect(pointsNumber).toContainText('0');
  });

  test('使用者應該能夠看到帳號資訊', async ({ page }) => {
    // 檢查帳號資訊區域
    const infoSection = page.locator('.info-section');
    await expect(infoSection).toBeVisible();
    await expect(infoSection.locator('h2')).toContainText('帳號資訊');
    
    // 檢查帳號
    const userAccount = page.locator('#user-account');
    await expect(userAccount).toContainText(testUsername);
    
    // 檢查註冊日期
    const userCreated = page.locator('#user-created');
    await expect(userCreated).not.toBeEmpty();
    
    // 檢查上次登入時間
    const userLastLogin = page.locator('#user-last-login');
    await expect(userLastLogin).not.toBeEmpty();
  });

  test('使用者應該能夠登出', async ({ page }) => {
    await logout(page);
    
    // 應該返回登入頁面
    await expectAuthPage(page);
    await expect(page.locator('#login-form.active')).toBeVisible();
  });

  test('使用者重新登入後應該看到相同的資料', async ({ page }) => {
    // 登出
    await logout(page);
    
    // 重新登入
    await login(page, testUsername, testPassword);
    await expectUserPage(page);
    
    // 應該看到相同的使用者名稱
    await expect(page.locator('#user-username')).toContainText(testUsername);
    await expect(page.locator('#user-account')).toContainText(testUsername);
  });

  test('管理員指派點數後使用者應該能看到更新的點數', async ({ page }) => {
    // 登出並以管理員登入
    await logout(page);
    await login(page, 'admin', 'admin');
    
    // 為測試使用者指派 150 點
    await page.locator('#target-user').selectOption({ label: new RegExp(testUsername) });
    await page.fill('#points-amount', '150');
    await page.click('#assignPointsForm button[type="submit"]');
    await page.waitForTimeout(500);
    
    // 登出管理員並以測試使用者重新登入
    await logout(page);
    await login(page, testUsername, testPassword);
    await expectUserPage(page);
    
    // 檢查點數是否已更新
    const pointsNumber = page.locator('#user-points');
    await expect(pointsNumber).toContainText('150');
  });

  test('使用者頁面應該顯示點數標籤', async ({ page }) => {
    const pointsLabel = page.locator('.points-label');
    await expect(pointsLabel).toBeVisible();
    await expect(pointsLabel).toContainText('點');
  });

  test('使用者頁面應該顯示點數說明', async ({ page }) => {
    const pointsDescription = page.locator('.points-description');
    await expect(pointsDescription).toBeVisible();
    await expect(pointsDescription).toContainText('這些點數可用於遊戲中的各項功能');
  });

  test('頁面重新整理後應該保持登入狀態並顯示最新資料', async ({ page }) => {
    // 登出並以管理員身份為使用者增加點數
    await logout(page);
    await login(page, 'admin', 'admin');
    await page.locator('#target-user').selectOption({ label: new RegExp(testUsername) });
    await page.fill('#points-amount', '200');
    await page.click('#assignPointsForm button[type="submit"]');
    await page.waitForTimeout(500);
    
    // 登出管理員並以測試使用者登入
    await logout(page);
    await login(page, testUsername, testPassword);
    await expectUserPage(page);
    
    // 重新整理頁面
    await page.reload();
    await waitForPageLoad(page);
    
    // 應該仍在使用者頁面且點數正確
    await expectUserPage(page);
    await expect(page.locator('#user-points')).toContainText('200');
  });
});
