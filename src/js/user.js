/**
 * 一般使用者介面處理模組
 */

const UserPage = {
  /**
   * 初始化使用者頁面
   */
  init() {
    this.userPage = document.getElementById('user-page');

    // 綁定登出按鈕
    document.getElementById('user-logout').addEventListener('click', () => {
      this.handleLogout();
    });
  },

  /**
   * 顯示使用者頁面
   */
  show() {
    const user = UserManager.getCurrentUser();
    if (!user) {
      this.redirectToAuth();
      return;
    }

    // 顯示使用者頁面
    this.userPage.classList.add('active');

    // 更新使用者資訊
    this.updateUserInfo(user);
  },

  /**
   * 隱藏使用者頁面
   */
  hide() {
    this.userPage.classList.remove('active');
  },

  /**
   * 更新使用者資訊
   */
  updateUserInfo(user) {
    // 更新使用者名稱
    document.getElementById('user-username').textContent = user.username;

    // 更新點數
    document.getElementById('user-points').textContent = user.points;

    // 更新帳號資訊
    document.getElementById('user-account').textContent = user.username;
    document.getElementById('user-created').textContent = UserManager.formatDateTime(user.createdAt);
    document.getElementById('user-last-login').textContent = UserManager.formatDateTime(user.lastLogin);
  },

  /**
   * 處理登出
   */
  handleLogout() {
    UserManager.logout();
    this.hide();
    
    // 確保隱藏管理員頁面
    document.getElementById('admin-page').classList.remove('active');
    
    this.redirectToAuth();
  },

  /**
   * 重導向到登入頁面
   */
  redirectToAuth() {
    // 確保顯示登入頁面
    const authPage = document.getElementById('auth-page');
    authPage.classList.add('active');
    Auth.showLoginForm();
  }
};
