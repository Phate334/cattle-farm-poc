/**
 * 管理員後臺介面處理模組
 */

const AdminPage = {
  /**
   * 初始化管理員頁面
   */
  init() {
    this.adminPage = document.getElementById('admin-page');
    this.usersListEl = document.getElementById('users-list');
    this.targetUserSelect = document.getElementById('target-user');
    this.messageEl = document.getElementById('admin-message');

    // 綁定登出按鈕
    document.getElementById('admin-logout').addEventListener('click', () => {
      this.handleLogout();
    });

    // 綁定指派點數表單
    document.getElementById('assignPointsForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAssignPoints();
    });
  },

  /**
   * 顯示管理員頁面
   */
  show() {
    const user = UserManager.getCurrentUser();
    if (!user || user.role !== 'admin') {
      this.redirectToAuth();
      return;
    }

    // 顯示管理員頁面
    this.adminPage.classList.add('active');

    // 更新管理員資訊
    document.getElementById('admin-username').textContent = user.username;

    // 載入使用者列表
    this.loadUsersList();
    this.loadUsersSelect();
  },

  /**
   * 隱藏管理員頁面
   */
  hide() {
    this.adminPage.classList.remove('active');
  },

  /**
   * 載入使用者列表
   */
  loadUsersList() {
    const users = UserManager.getRegularUsers();
    
    if (users.length === 0) {
      this.usersListEl.innerHTML = '<p class="no-users">目前沒有一般使用者</p>';
      return;
    }

    let html = '<table class="users-table">';
    html += '<thead><tr><th>帳號</th><th>點數</th><th>註冊日期</th><th>上次登入</th></tr></thead>';
    html += '<tbody>';

    users.forEach(user => {
      html += `
        <tr>
          <td>${this.escapeHtml(user.username)}</td>
          <td class="points-cell">${user.points}</td>
          <td>${UserManager.formatDateTime(user.createdAt)}</td>
          <td>${UserManager.formatDateTime(user.lastLogin)}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    this.usersListEl.innerHTML = html;
  },

  /**
   * 載入使用者選單
   */
  loadUsersSelect() {
    const users = UserManager.getRegularUsers();
    
    // 清空選單
    this.targetUserSelect.innerHTML = '<option value="">請選擇使用者</option>';

    users.forEach(user => {
      const option = document.createElement('option');
      option.value = user.id;
      option.textContent = `${user.username} (目前點數: ${user.points})`;
      this.targetUserSelect.appendChild(option);
    });
  },

  /**
   * 處理指派點數
   */
  handleAssignPoints() {
    const userId = this.targetUserSelect.value;
    const pointsAmount = parseInt(document.getElementById('points-amount').value);

    if (!userId) {
      this.showMessage('請選擇使用者', 'error');
      return;
    }

    if (isNaN(pointsAmount) || pointsAmount < 1) {
      this.showMessage('請輸入有效的點數數量', 'error');
      return;
    }

    const user = UserManager.getUserById(userId);
    if (!user) {
      this.showMessage('找不到使用者', 'error');
      return;
    }

    const newPoints = user.points + pointsAmount;
    const result = UserManager.updatePoints(userId, newPoints);

    if (result.success) {
      this.showMessage(`成功為 ${user.username} 增加 ${pointsAmount} 點數`, 'success');
      // 重新載入使用者列表和選單
      this.loadUsersList();
      this.loadUsersSelect();
      // 清除表單
      document.getElementById('assignPointsForm').reset();
    } else {
      this.showMessage(result.message, 'error');
    }
  },

  /**
   * 處理登出
   */
  handleLogout() {
    UserManager.logout();
    this.hide();
    this.redirectToAuth();
  },

  /**
   * 顯示訊息
   */
  showMessage(message, type) {
    this.messageEl.textContent = message;
    this.messageEl.className = `message ${type}`;
    this.messageEl.style.display = 'block';

    // 3 秒後自動隱藏
    setTimeout(() => {
      this.clearMessage();
    }, 3000);
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
   * 重導向到登入頁面
   */
  redirectToAuth() {
    document.getElementById('auth-page').classList.add('active');
    Auth.showLoginForm();
  },

  /**
   * HTML 轉義（防止 XSS）
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
};
