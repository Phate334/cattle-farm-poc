# 測試文件

本目錄包含 Playwright 端對端測試腳本，用於自動化測試畜牧養牛遊戲的會員系統功能。

## 測試檔案說明

### 測試輔助工具
- **test-helpers.js** - 提供測試用的輔助函數，包括：
  - 登入/登出操作
  - 註冊操作
  - LocalStorage 操作
  - 頁面導航與驗證

### 測試案例

#### test-auth-login.spec.js - 登入功能測試
- 驗證登入頁面顯示
- 測試管理員帳號登入
- 測試錯誤的帳號密碼處理
- 測試空白欄位驗證
- 測試登入狀態持久化

#### test-auth-register.spec.js - 註冊功能測試  
- 測試切換到註冊表單
- 測試成功註冊新使用者
- 測試註冊後自動填入帳號
- 測試密碼不一致錯誤處理
- 測試帳號長度驗證
- 測試密碼長度驗證
- 測試重複帳號註冊
- 測試表單切換功能

#### test-admin.spec.js - 管理員功能測試
- 測試管理員頁面顯示
- 測試使用者列表顯示
- 測試指派點數功能
- 測試多次指派點數
- 測試錯誤訊息顯示
- 測試登出功能
- 測試空列表提示

#### test-user.spec.js - 一般使用者功能測試
- 測試使用者頁面顯示
- 測試點數顯示
- 測試帳號資訊顯示
- 測試登出功能
- 測試重新登入
- 測試點數更新
- 測試登入狀態持久化

## 執行測試

### 本地執行
```bash
# 執行所有測試
npm test

# 執行測試並顯示瀏覽器視窗
npm run test:headed

# 使用互動式 UI 執行測試
npm run test:ui

# 除錯模式
npm run test:debug
```

### 測試配置
測試配置檔案為專案根目錄的 `playwright.config.js`，包含：
- 測試超時設定
- 瀏覽器配置（預設使用 Chromium）
- 測試報告設定
- 本地伺服器配置（Python http.server）

## 測試結果

測試報告會自動產生在 `test-results/` 目錄：
- HTML 報告：`test-results/html-report/`
- JSON 報告：`test-results/results.json`
- 失敗時的截圖和影片也會儲存在此目錄

## 注意事項

- 所有測試在執行前都會清除 LocalStorage，確保測試獨立性
- 測試使用隨機產生的使用者名稱，避免衝突
- CI 環境會自動啟用重試機制（最多重試 2 次）
- 測試使用 Python http.server 作為本地開發伺服器

## CI/CD 整合

GitHub Actions 會在以下情況自動執行測試：
- 推送到 `main` 或 `develop` 分支
- 建立或更新 Pull Request

測試報告會自動上傳為 Artifacts，可在 GitHub Actions 頁面下載查看。
