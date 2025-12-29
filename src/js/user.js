/**
 * 一般使用者介面處理模組
 */

const UserPage = {
  timerInterval: null, // 儲存計時器間隔 ID

  /**
   * 初始化使用者頁面
   */
  init() {
    this.userPage = document.getElementById('user-page');
    this.gameView = document.getElementById('game-view');
    this.statusView = document.getElementById('status-view');

    // 綁定登出按鈕
    document.getElementById('user-logout').addEventListener('click', () => {
      this.handleLogout();
    });

    // 綁定狀態按鈕
    document.getElementById('user-status-btn').addEventListener('click', () => {
      this.showStatusView();
    });

    // 綁定返回遊戲按鈕
    document.getElementById('back-to-game-btn').addEventListener('click', () => {
      this.showGameView();
    });

    // 綁定購買牧草按鈕
    document.getElementById('buy-grass-btn').addEventListener('click', () => {
      this.handleBuyGrass();
    });

    // 綁定乳牛點擊事件
    const cattleContainer = document.getElementById('cattle-container');
    cattleContainer.addEventListener('click', (e) => {
      const cattleItem = e.target.closest('.cattle-item');
      if (cattleItem) {
        const cattleId = parseInt(cattleItem.dataset.cattleId);
        this.handleFeedCattle(cattleId);
      }
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

    // 初始化遊戲數據
    GameManager.initGameData(user.id);

    // 更新使用者資訊
    this.updateUserInfo(user);

    // 更新遊戲資訊
    this.updateGameInfo(user.id);

    // 顯示遊戲視圖
    this.showGameView();

    // 開始更新計時器
    this.startTimerUpdates(user.id);
  },

  /**
   * 隱藏使用者頁面
   */
  hide() {
    this.userPage.classList.remove('active');
    // 停止計時器更新
    this.stopTimerUpdates();
  },

  /**
   * 顯示遊戲視圖
   */
  showGameView() {
    this.gameView.classList.remove('hidden');
    this.statusView.classList.add('hidden');
  },

  /**
   * 顯示狀態視圖
   */
  showStatusView() {
    this.gameView.classList.add('hidden');
    this.statusView.classList.remove('hidden');
    
    // 更新狀態頁面的資料
    const user = UserManager.getCurrentUser();
    if (user) {
      this.updateUserInfo(user);
    }
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
  },

  /**
   * 更新遊戲資訊
   */
  updateGameInfo(userId) {
    const user = UserManager.getUserById(userId);
    const gameData = GameManager.updateCattleTimers(userId);

    // 更新資源顯示
    document.getElementById('game-points').textContent = user.points;
    document.getElementById('game-grass').textContent = gameData ? gameData.grass : 0;

    // 更新乳牛狀態和計時器
    if (gameData && gameData.cattle) {
      gameData.cattle.forEach(cattle => {
        const hungerElement = document.getElementById(`cattle-${cattle.id}-hunger`);
        if (hungerElement) {
          hungerElement.textContent = cattle.hunger;
        }

        const timerElement = document.getElementById(`cattle-${cattle.id}-timer`);
        if (timerElement) {
          const remainingTime = GameManager.getCattleRemainingTime(cattle);
          if (remainingTime !== null && cattle.hunger > 0) {
            timerElement.textContent = remainingTime;
          } else {
            timerElement.textContent = '--';
          }
        }
      });
    }
  },

  /**
   * 開始更新計時器
   */
  startTimerUpdates(userId) {
    // 清除現有的計時器
    this.stopTimerUpdates();
    
    // 每秒更新一次
    this.timerInterval = setInterval(() => {
      this.updateGameInfo(userId);
    }, 1000);
  },

  /**
   * 停止更新計時器
   */
  stopTimerUpdates() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },

  /**
   * 處理購買牧草
   */
  handleBuyGrass() {
    const user = UserManager.getCurrentUser();
    if (!user) return;

    const amountInput = document.getElementById('grass-amount');
    const amount = parseInt(amountInput.value);

    if (isNaN(amount) || amount <= 0) {
      this.showGameMessage('請輸入有效的購買數量', 'error');
      return;
    }

    const result = GameManager.buyGrass(user.id, amount);
    
    if (result.success) {
      this.showGameMessage(result.message, 'success');
      this.updateGameInfo(user.id);
      // 同時更新狀態頁面的點數
      document.getElementById('user-points').textContent = result.points;
      amountInput.value = '1'; // 重置輸入
    } else {
      this.showGameMessage(result.message, 'error');
    }
  },

  /**
   * 處理餵養乳牛
   */
  handleFeedCattle(cattleId) {
    const user = UserManager.getCurrentUser();
    if (!user) return;

    const result = GameManager.feedCattle(user.id, cattleId);

    if (result.success) {
      this.showGameMessage(result.message, 'success');
      this.updateGameInfo(user.id);
    } else {
      this.showGameMessage(result.message, 'error');
    }
  },

  /**
   * 顯示遊戲訊息
   */
  showGameMessage(message, type = 'info') {
    const messageElement = document.getElementById('game-message');
    messageElement.textContent = message;
    messageElement.className = 'message';
    
    if (type === 'success') {
      messageElement.classList.add('success');
    } else if (type === 'error') {
      messageElement.classList.add('error');
    }

    // 3 秒後清除訊息
    setTimeout(() => {
      messageElement.textContent = '';
      messageElement.className = 'message';
    }, 3000);
  }
};
