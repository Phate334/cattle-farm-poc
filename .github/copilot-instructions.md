# GitHub Copilot 專案指引

本文件為畜牧養牛遊戲 POC 專案的開發規範與指引。

## 專案概述

這是一個關於畜牧養牛的遊戲概念驗證（POC）專案，用於展示前端遊戲機制與會員系統。

## 核心規則

### 1. 專案架構與部署

- **專案類型**：純前端專案
- **部署平台**：GitHub Pages
- **CI/CD 要求**：
  - 推送合併到主分支後，自動觸發 GitHub Actions 部署流程
  - 需要建立 `.github/workflows` 目錄並設定自動化部署腳本
  - 確保部署流程包含建置（如有需要）和靜態檔案發布

### 2. 專案檔案結構規範

- 使用清晰且語意化的目錄命名
- 建議的檔案結構：
  ```
  cattle-farm-poc/
  ├── .github/
  │   └── workflows/          # GitHub Actions 工作流程
  ├── src/
  │   ├── js/                 # JavaScript 檔案
  │   ├── css/                # 樣式檔案
  │   ├── assets/             # 靜態資源（圖片、音效等）
  │   └── utils/              # 工具函式
  ├── index.html              # 主要入口檔案
  └── README.md
  ```
- 不同功能模組應分離在不同檔案中
- 檔案命名使用小寫字母，單字間使用連字符（kebab-case）

### 3. 技術棧選擇

- **強制要求**：使用 Vanilla JavaScript（純 JavaScript）
- **禁止使用**：React、Vue、Angular 或其他 JavaScript 框架
- **目的**：降低專案複雜度，保持輕量化
- **允許使用**：
  - 原生 Web APIs
  - CSS3 和 HTML5 特性
  - 輕量級的原生 JavaScript 函式庫（如有必要，需評估）

### 4. 會員系統規範

- **儲存位置**：前端瀏覽器（LocalStorage 或 IndexedDB）
- **功能要求**：
  - 會員註冊與登入功能
  - 會員點數系統
  - 資料持久化儲存在客戶端
  - 資料結構應清晰且易於擴展
- **注意事項**：
  - 本專案為展示用途，不涉及真實的後端驗證
  - 需實作基本的前端資料驗證

### 5. 語言與文字規範

- **強制規定**：所有前端介面文字一律使用正體中文（繁體中文）
- **用語習慣**：遵循台灣地區的慣用語
- **適用範圍**：
  - UI 按鈕文字
  - 提示訊息
  - 遊戲說明
  - 錯誤訊息
  - 註解與文件（建議使用中文，但程式碼註解可視情況使用英文）
- **範例**：
  - ✅ 「登入」、「註冊」、「點數」
  - ❌ 「登录」、「注册」、「积分」

## 編碼規範

### JavaScript 規範

- 使用 ES6+ 語法
- 使用 `const` 和 `let`，避免使用 `var`
- 函式命名使用駝峰式命名法（camelCase）
- 類別命名使用帕斯卡命名法（PascalCase）
- 適當添加註解說明複雜邏輯
- 遵循模組化原則，每個檔案負責單一功能

### HTML 規範

- 使用語意化標籤
- 保持良好的縮排與結構
- 標籤屬性使用雙引號

### CSS 規範

- 使用類別選擇器，避免過度使用 ID 選擇器
- 遵循 BEM 命名規範或其他一致的命名方式
- 將樣式按功能模組分類在不同檔案中

## 開發流程

1. **功能開發**：
   - 在新分支上進行功能開發
   - 保持提交訊息清晰明確
   - **必須先執行測試確保功能正常運作**

2. **測試要求**：
   - **所有程式碼變更都必須先執行自動化測試**
   - 在提交 Pull Request 前必須確保所有測試通過
   - 如果新增功能，應該同時新增對應的測試案例
   - 測試指令：`npm test`
   - 本地開發伺服器：`npm run serve` 或 `python -m http.server 8000`

3. **程式碼審查**：
   - 確認符合專案規範
   - 檢查中文用語正確性
   - 驗證沒有引入第三方框架
   - **確認所有測試都已通過**

4. **合併與部署**：
   - 合併到主分支後自動觸發 CI/CD
   - 確認 GitHub Pages 部署成功
   - 確認 GitHub Actions 測試流程執行成功

## 遊戲功能開發指引

### 會員系統實作建議

```javascript
// 使用 LocalStorage 儲存會員資料
const UserManager = {
  saveUser: (userData) => {
    localStorage.setItem('cattleFarmUser', JSON.stringify(userData));
  },
  getUser: () => {
    return JSON.parse(localStorage.getItem('cattleFarmUser'));
  },
  updatePoints: (points) => {
    const user = UserManager.getUser();
    user.points = points;
    UserManager.saveUser(user);
  }
};
```

### 遊戲資料結構建議

- 會員資料：`{ id, username, points, createdAt, lastLogin }`
- 牛隻資料：`{ id, name, type, level, health, value }`
- 遊戲狀態：`{ cattle: [], resources: {}, achievements: [] }`

## 注意事項

- 本專案為 POC（概念驗證），重點在於展示核心機制
- 優先考慮功能實現，其次考慮效能最佳化
- 保持程式碼簡潔易讀
- 定期更新 README.md 說明專案進度與功能
- **變更程式碼後必須執行測試以確保功能正常**

## 測試系統

本專案使用 Playwright 進行端對端測試，測試涵蓋所有核心功能。

### 測試環境設定

1. 安裝依賴項：
   ```bash
   npm install
   ```

2. 安裝 Playwright 瀏覽器：
   ```bash
   npx playwright install
   ```

### 執行測試

- 執行所有測試：`npm test`
- 執行測試（帶瀏覽器視窗）：`npm run test:headed`
- 執行測試（互動式 UI）：`npm run test:ui`
- 除錯模式：`npm run test:debug`

### 測試覆蓋範圍

測試案例位於 `./tests` 目錄：
- `test-auth-login.spec.js` - 登入功能測試
- `test-auth-register.spec.js` - 註冊功能測試
- `test-admin.spec.js` - 管理員功能測試
- `test-user.spec.js` - 一般使用者功能測試
- `test-helpers.js` - 測試輔助工具函數

### CI/CD 自動化測試

- GitHub Actions 會在推送到 `main` 或 `develop` 分支時自動執行測試
- Pull Request 也會觸發自動化測試
- 測試報告會自動上傳為 Artifacts，可在 Actions 頁面下載查看

## 參考資源

- [MDN Web Docs](https://developer.mozilla.org/zh-TW/) - 繁體中文版本
- [GitHub Pages 文件](https://docs.github.com/en/pages)
- [GitHub Actions 文件](https://docs.github.com/en/actions)
- [Playwright 文件](https://playwright.dev/) - 自動化測試框架

---

最後更新日期：2025-12-29
