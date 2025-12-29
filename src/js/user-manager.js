/**
 * 使用者管理模組
 * 負責處理使用者資料的儲存、讀取與驗證
 */

const UserManager = {
  STORAGE_KEY: 'cattleFarmUsers',
  CURRENT_USER_KEY: 'cattleFarmCurrentUser',

  /**
   * 初始化系統，建立預設管理員帳號
   */
  init() {
    const users = this.getAllUsers();
    
    // 如果沒有任何使用者，建立預設管理員帳號
    if (users.length === 0) {
      const adminUser = {
        id: this.generateId(),
        username: 'admin',
        password: 'admin', // 注意：實際應用中應該加密密碼
        role: 'admin',
        points: 0,
        createdAt: new Date().toISOString(),
        lastLogin: null
      };
      this.saveUser(adminUser);
    }
  },

  /**
   * 產生唯一 ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  /**
   * 取得所有使用者
   */
  getAllUsers() {
    const usersJson = localStorage.getItem(this.STORAGE_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  },

  /**
   * 儲存使用者資料
   */
  saveUser(userData) {
    const users = this.getAllUsers();
    const existingIndex = users.findIndex(u => u.id === userData.id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = userData;
    } else {
      users.push(userData);
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  },

  /**
   * 依據帳號取得使用者
   */
  getUserByUsername(username) {
    const users = this.getAllUsers();
    return users.find(u => u.username === username);
  },

  /**
   * 依據 ID 取得使用者
   */
  getUserById(id) {
    const users = this.getAllUsers();
    return users.find(u => u.id === id);
  },

  /**
   * 註冊新使用者
   */
  register(username, password) {
    // 驗證帳號是否已存在
    if (this.getUserByUsername(username)) {
      return { success: false, message: '此帳號已被註冊' };
    }

    // 驗證帳號長度
    if (username.length < 3) {
      return { success: false, message: '帳號長度至少需要 3 個字元' };
    }

    // 驗證密碼長度
    if (password.length < 6) {
      return { success: false, message: '密碼長度至少需要 6 個字元' };
    }

    // 建立新使用者
    const newUser = {
      id: this.generateId(),
      username: username,
      password: password, // 注意：實際應用中應該加密密碼
      role: 'user',
      points: 0,
      createdAt: new Date().toISOString(),
      lastLogin: null
    };

    this.saveUser(newUser);
    return { success: true, message: '註冊成功' };
  },

  /**
   * 使用者登入
   */
  login(username, password) {
    const user = this.getUserByUsername(username);

    if (!user) {
      return { success: false, message: '帳號或密碼錯誤' };
    }

    if (user.password !== password) {
      return { success: false, message: '帳號或密碼錯誤' };
    }

    // 更新最後登入時間
    user.lastLogin = new Date().toISOString();
    this.saveUser(user);

    // 儲存當前登入使用者
    this.setCurrentUser(user);

    return { success: true, message: '登入成功', user: user };
  },

  /**
   * 使用者登出
   */
  logout() {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  },

  /**
   * 設定當前登入使用者
   */
  setCurrentUser(user) {
    // 移除敏感資訊
    const safeUser = {
      id: user.id,
      username: user.username,
      role: user.role,
      points: user.points,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    };
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(safeUser));
  },

  /**
   * 取得當前登入使用者
   */
  getCurrentUser() {
    const userJson = localStorage.getItem(this.CURRENT_USER_KEY);
    if (!userJson) return null;
    
    const currentUser = JSON.parse(userJson);
    // 從資料庫取得最新資料
    return this.getUserById(currentUser.id);
  },

  /**
   * 檢查是否已登入
   */
  isLoggedIn() {
    return this.getCurrentUser() !== null;
  },

  /**
   * 檢查當前使用者是否為管理員
   */
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  },

  /**
   * 更新使用者點數
   */
  updatePoints(userId, points) {
    const user = this.getUserById(userId);
    if (!user) {
      return { success: false, message: '找不到使用者' };
    }

    if (points < 0) {
      return { success: false, message: '點數不能為負數' };
    }

    user.points = points;
    this.saveUser(user);

    // 如果是當前使用者，更新當前使用者資料
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      this.setCurrentUser(user);
    }

    return { success: true, message: '點數更新成功' };
  },

  /**
   * 取得所有一般使用者（排除管理員）
   */
  getRegularUsers() {
    const users = this.getAllUsers();
    return users.filter(u => u.role === 'user');
  },

  /**
   * 格式化日期時間
   */
  formatDateTime(isoString) {
    if (!isoString) return '尚未登入';
    const date = new Date(isoString);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }
};

// 初始化系統
UserManager.init();
