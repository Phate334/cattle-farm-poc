/**
 * 遊戲管理模組
 * 負責處理養牛遊戲的邏輯
 */

const GameManager = {
  GAME_DATA_KEY: 'cattleFarmGameData',
  hungerTimers: {}, // 儲存每頭牛的計時器

  /**
   * 初始化遊戲數據
   */
  initGameData(userId) {
    const gameData = this.getGameData(userId);
    if (!gameData) {
      const newGameData = {
        userId: userId,
        grass: 0,
        cattle: [
          {
            id: 1,
            name: '乳牛 #1',
            hunger: 0,
            maxHunger: 100,
            timerEndTime: null
          },
          {
            id: 2,
            name: '乳牛 #2',
            hunger: 0,
            maxHunger: 100,
            timerEndTime: null
          },
          {
            id: 3,
            name: '乳牛 #3',
            hunger: 0,
            maxHunger: 100,
            timerEndTime: null
          }
        ]
      };
      this.saveGameData(newGameData);
      return newGameData;
    }
    return gameData;
  },

  /**
   * 取得遊戲數據
   */
  getGameData(userId) {
    const allGameData = localStorage.getItem(this.GAME_DATA_KEY);
    if (!allGameData) return null;
    
    const gameDataMap = JSON.parse(allGameData);
    return gameDataMap[userId] || null;
  },

  /**
   * 儲存遊戲數據
   */
  saveGameData(gameData) {
    const allGameData = localStorage.getItem(this.GAME_DATA_KEY);
    const gameDataMap = allGameData ? JSON.parse(allGameData) : {};
    
    gameDataMap[gameData.userId] = gameData;
    localStorage.setItem(this.GAME_DATA_KEY, JSON.stringify(gameDataMap));
  },

  /**
   * 購買牧草
   */
  buyGrass(userId, amount) {
    const user = UserManager.getUserById(userId);
    if (!user) {
      return { success: false, message: '找不到使用者' };
    }

    if (amount <= 0) {
      return { success: false, message: '購買數量必須大於 0' };
    }

    // 檢查點數是否足夠（1 點數 = 1 牧草）
    if (user.points < amount) {
      return { success: false, message: '點數不足，無法購買牧草' };
    }

    // 扣除點數
    const newPoints = user.points - amount;
    const updateResult = UserManager.updatePoints(userId, newPoints);
    if (!updateResult.success) {
      return updateResult;
    }

    // 增加牧草
    const gameData = this.initGameData(userId);
    gameData.grass += amount;
    this.saveGameData(gameData);

    return { 
      success: true, 
      message: `成功購買 ${amount} 個牧草`,
      grass: gameData.grass,
      points: newPoints
    };
  },

  /**
   * 餵養乳牛
   */
  feedCattle(userId, cattleId) {
    const gameData = this.getGameData(userId);
    if (!gameData) {
      return { success: false, message: '找不到遊戲資料' };
    }

    // 檢查牧草是否足夠
    if (gameData.grass < 1) {
      return { success: false, message: '牧草不足，請先購買牧草' };
    }

    // 找到對應的乳牛
    const cattle = gameData.cattle.find(c => c.id === cattleId);
    if (!cattle) {
      return { success: false, message: '找不到這頭乳牛' };
    }

    // 檢查飽食度是否已滿
    if (cattle.hunger >= cattle.maxHunger) {
      return { success: false, message: '這頭乳牛已經吃飽了！' };
    }

    // 扣除牧草
    gameData.grass -= 1;

    // 增加飽食度（每次餵食增加 10）
    cattle.hunger = Math.min(cattle.hunger + 10, cattle.maxHunger);

    // 如果飽食度達到最大值，設定計時器結束時間（60秒後）
    if (cattle.hunger >= cattle.maxHunger) {
      cattle.timerEndTime = Date.now() + 60000; // 60秒 = 60000毫秒
    }

    this.saveGameData(gameData);

    return {
      success: true,
      message: `成功餵養乳牛！飽食度：${cattle.hunger}/${cattle.maxHunger}`,
      grass: gameData.grass,
      hunger: cattle.hunger,
      timerEndTime: cattle.timerEndTime
    };
  },

  /**
   * 更新乳牛倒數計時
   */
  updateCattleTimers(userId) {
    const gameData = this.getGameData(userId);
    if (!gameData) return;

    let hasChanges = false;
    gameData.cattle.forEach(cattle => {
      if (cattle.timerEndTime && cattle.hunger > 0) {
        const now = Date.now();
        if (now >= cattle.timerEndTime) {
          // 時間到，清空飽食度
          cattle.hunger = 0;
          cattle.timerEndTime = null;
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      this.saveGameData(gameData);
    }

    return gameData;
  },

  /**
   * 取得乳牛剩餘時間（秒）
   */
  getCattleRemainingTime(cattle) {
    if (!cattle.timerEndTime || cattle.hunger === 0) {
      return null;
    }

    const remaining = Math.max(0, Math.ceil((cattle.timerEndTime - Date.now()) / 1000));
    return remaining;
  },

  /**
   * 取得乳牛狀態
   */
  getCattleStatus(userId, cattleId) {
    const gameData = this.getGameData(userId);
    if (!gameData) return null;

    const cattle = gameData.cattle.find(c => c.id === cattleId);
    return cattle;
  }
};
