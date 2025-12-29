# 測試文件

本目錄包含 Playwright 端對端測試腳本（Python 版本），用於自動化測試畜牧養牛遊戲的會員系統功能。

## 測試檔案說明

### 測試配置
- **conftest.py** - Pytest 配置和共用 fixtures
  - 自動啟動/關閉 Python HTTP 伺服器
  - 提供 `page_setup` fixture 用於測試前的頁面設置
- **test_helpers.py** - 測試輔助函數，包括：
  - 登入/登出操作
  - 註冊操作
  - LocalStorage 操作
  - 頁面導航與驗證

### 測試案例

#### test_auth_login.py - 登入功能測試
- 驗證登入頁面顯示
- 測試管理員帳號登入
- 測試錯誤的帳號密碼處理
- 測試空白欄位驗證
- 測試登入狀態持久化

#### test_auth_register.py - 註冊功能測試  
- 測試切換到註冊表單
- 測試成功註冊新使用者
- 測試註冊後自動填入帳號
- 測試密碼不一致錯誤處理
- 測試帳號長度驗證
- 測試密碼長度驗證
- 測試重複帳號註冊
- 測試表單切換功能

#### test_admin.py - 管理員功能測試
- 測試管理員頁面顯示
- 測試未選擇使用者的錯誤處理
- 測試登出功能
- 測試空列表提示

#### test_user.py - 一般使用者功能測試
- 測試使用者頁面顯示
- 測試點數顯示
- 測試帳號資訊顯示
- 測試登出功能
- 測試重新登入後資料一致性
- 測試點數標籤顯示
- 測試點數說明顯示

## 環境設置

### 使用 uv 管理環境

本專案使用 [uv](https://github.com/astral-sh/uv) 作為 Python 套件管理工具。

```bash
# 安裝 uv（如果尚未安裝）
curl -LsSf https://astral.sh/uv/install.sh | sh

# 建立虛擬環境並安裝依賴
uv venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
uv pip install playwright pytest pytest-playwright pytest-xdist

# 安裝 Playwright 瀏覽器
playwright install chromium
```

## 執行測試

### 本地執行
```bash
# 啟動虛擬環境
source .venv/bin/activate

# 執行所有測試
pytest

# 執行特定測試檔案
pytest tests/test_auth_login.py

# 執行特定測試類別
pytest tests/test_admin.py::TestAdmin

# 執行特定測試函數
pytest tests/test_auth_login.py::TestAuthLogin::test_admin_login_success

# 執行標記的測試
pytest -m auth  # 只執行認證相關測試
pytest -m admin  # 只執行管理員測試
pytest -m user  # 只執行使用者測試

# 平行執行測試（加速）
pytest -n auto

# 顯示詳細輸出
pytest -v

# 顯示 print 輸出
pytest -s
```

### 測試配置
測試配置位於專案根目錄的 `pyproject.toml` 檔案中：
- 測試目錄: `tests/`
- 測試檔案模式: `test_*.py`
- HTML 報告輸出: `test-results/report.html`
- 預設使用 Chromium 瀏覽器

## 測試結果

測試報告會自動產生在 `test-results/` 目錄：
- HTML 報告：`test-results/report.html`
- 失敗時的截圖和影片也會儲存在測試結果目錄

## 注意事項

- 所有測試在執行前都會清除 LocalStorage，確保測試獨立性
- 測試使用隨機產生的使用者名稱，避免衝突
- HTTP 伺服器由 conftest.py 自動管理（啟動/關閉）
- Python 內建的 http.server 模組用於提供靜態檔案服務

## CI/CD 整合

GitHub Actions 會在以下情況自動執行測試：
- 推送到 `main` 或 `develop` 分支
- 建立或更新 Pull Request

GitHub Actions 使用 uv 進行快速的依賴安裝，並啟用 cache 機制加速後續執行。

測試報告會自動上傳為 Artifacts，可在 GitHub Actions 頁面下載查看。
