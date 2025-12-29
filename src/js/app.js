/**
 * 應用程式主程式
 */

const App = {
  /**
   * 初始化應用程式
   */
  init() {
    // 初始化各個模組
    Auth.init();
    AdminPage.init();
    UserPage.init();

    // 檢查登入狀態並重導向
    this.checkLoginStatus();
  },

  /**
   * 檢查登入狀態
   */
  checkLoginStatus() {
    const user = UserManager.getCurrentUser();

    if (user) {
      // 已登入，根據角色顯示對應頁面
      if (user.role === 'admin') {
        AdminPage.show();
      } else {
        UserPage.show();
      }
    } else {
      // 未登入，顯示登入頁面
      Auth.showLoginForm();
    }
  }
};

// 等待 DOM 載入完成後初始化應用程式
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
