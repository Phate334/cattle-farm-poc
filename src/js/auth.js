/**
 * 登入/註冊介面處理模組
 */

const Auth = {
  /**
   * 初始化登入/註冊介面
   */
  init() {
    // 取得頁面元素
    this.authPage = document.getElementById('auth-page');
    this.loginForm = document.getElementById('login-form');
    this.registerForm = document.getElementById('register-form');
    this.messageEl = document.getElementById('auth-message');

    // 綁定表單切換
    document.getElementById('show-register').addEventListener('click', (e) => {
      e.preventDefault();
      this.showRegisterForm();
    });

    document.getElementById('show-login').addEventListener('click', (e) => {
      e.preventDefault();
      this.showLoginForm();
    });

    // 綁定登入表單提交
    document.getElementById('loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    // 綁定註冊表單提交
    document.getElementById('registerForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleRegister();
    });
  },

  /**
   * 顯示登入表單
   */
  showLoginForm() {
    this.loginForm.classList.add('active');
    this.registerForm.classList.remove('active');
    this.clearMessage();
    this.clearForms();
  },

  /**
   * 顯示註冊表單
   */
  showRegisterForm() {
    this.loginForm.classList.remove('active');
    this.registerForm.classList.add('active');
    this.clearMessage();
    this.clearForms();
  },

  /**
   * 處理登入
   */
  handleLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
      this.showMessage('請輸入帳號和密碼', 'error');
      return;
    }

    const result = UserManager.login(username, password);
    
    if (result.success) {
      this.showMessage(result.message, 'success');
      // 延遲跳轉，讓使用者看到成功訊息
      setTimeout(() => {
        this.redirectToUserPage();
      }, 500);
    } else {
      this.showMessage(result.message, 'error');
    }
  },

  /**
   * 處理註冊
   */
  handleRegister() {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const passwordConfirm = document.getElementById('register-password-confirm').value;

    // 驗證欄位
    if (!username || !password || !passwordConfirm) {
      this.showMessage('請填寫所有欄位', 'error');
      return;
    }

    if (password !== passwordConfirm) {
      this.showMessage('兩次輸入的密碼不一致', 'error');
      return;
    }

    const result = UserManager.register(username, password);
    
    if (result.success) {
      this.showMessage(result.message + '，即將跳轉到登入頁面', 'success');
      // 延遲跳轉到登入表單
      setTimeout(() => {
        this.showLoginForm();
        // 自動填入帳號
        document.getElementById('login-username').value = username;
      }, 1500);
    } else {
      this.showMessage(result.message, 'error');
    }
  },

  /**
   * 顯示訊息
   */
  showMessage(message, type) {
    this.messageEl.textContent = message;
    this.messageEl.className = `message ${type}`;
    this.messageEl.style.display = 'block';
  },

  /**
   * 清除訊息
   */
  clearMessage() {
    this.messageEl.textContent = '';
    this.messageEl.className = 'message';
    this.messageEl.style.display = 'none';
  },

  /**
   * 清除表單
   */
  clearForms() {
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
  },

  /**
   * 重導向到使用者頁面
   */
  redirectToUserPage() {
    const user = UserManager.getCurrentUser();
    if (!user) return;

    // 隱藏登入頁面
    this.authPage.classList.remove('active');

    // 根據角色顯示對應頁面
    if (user.role === 'admin') {
      AdminPage.show();
    } else {
      UserPage.show();
    }
  }
};
