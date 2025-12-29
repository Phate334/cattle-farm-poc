# 畜牧養牛遊戲 - 會員系統 POC

這是一個畜牧養牛遊戲的概念驗證專案，目前實作了基本的會員系統功能。

## 功能特色

### 會員系統
- ✅ 使用者註冊與登入
- ✅ 資料儲存在瀏覽器 LocalStorage（概念驗證用途）
- ✅ 預設管理員帳號（帳號: `admin` / 密碼: `admin`）
- ✅ 管理員後臺介面
- ✅ 一般使用者介面

### 管理員功能
- 查看所有使用者列表
- 為使用者指派點數
- 查看使用者註冊日期與登入記錄

### 一般使用者功能
- 查看個人點數餘額
- 查看帳號資訊
- 查看註冊與登入記錄

## 技術規格

- **前端框架**: Vanilla JavaScript（純 JavaScript，無使用框架）
- **樣式**: 原生 CSS3
- **資料儲存**: LocalStorage（前端瀏覽器儲存）
- **部署**: GitHub Pages
- **CI/CD**: GitHub Actions

## 快速開始

### 本地開發

1. 複製專案到本地
```bash
git clone https://github.com/Phate334/cattle-farm-poc.git
cd cattle-farm-poc
```

2. 使用本地伺服器開啟（避免 CORS 問題）
```bash
# 使用 Python
python -m http.server 8000

# 或使用 Node.js http-server
npx http-server
```

3. 在瀏覽器開啟 `http://localhost:8000`

### 預設帳號

#### 管理員帳號
- 帳號: `admin`
- 密碼: `admin`

#### 測試流程
1. 使用管理員帳號登入，進入後臺管理介面
2. 註冊新的一般使用者帳號
3. 使用管理員為新使用者指派點數
4. 登出後使用新帳號登入，查看點數

## 專案結構

```
cattle-farm-poc/
├── .github/
│   ├── workflows/          # GitHub Actions 部署設定
│   └── copilot-instructions.md  # 專案開發指引
├── src/
│   ├── js/                 # JavaScript 模組
│   │   ├── user-manager.js # 使用者管理核心模組
│   │   ├── auth.js         # 登入/註冊介面
│   │   ├── admin.js        # 管理員介面
│   │   ├── user.js         # 一般使用者介面
│   │   └── app.js          # 應用程式主程式
│   └── css/                # 樣式檔案
│       ├── main.css        # 全域樣式
│       ├── auth.css        # 登入/註冊樣式
│       ├── admin.css       # 管理員介面樣式
│       └── user.css        # 使用者介面樣式
├── index.html              # 主要入口檔案
└── README.md
```

## 資料結構

### 使用者資料
```javascript
{
  id: string,           // 唯一識別碼
  username: string,     // 帳號
  password: string,     // 密碼（注意：實際應用應加密）
  role: string,         // 角色（admin/user）
  points: number,       // 點數
  createdAt: string,    // 註冊日期（ISO 8601）
  lastLogin: string     // 最後登入時間（ISO 8601）
}
```

## 開發規範

請參考 [專案開發指引](.github/copilot-instructions.md) 了解完整的開發規範與最佳實踐。

### 核心規則
- 使用 Vanilla JavaScript，不使用任何框架
- 所有介面文字使用正體中文（繁體中文）
- 遵循 ES6+ 語法規範
- 保持程式碼模組化與可讀性

## 注意事項

⚠️ **這是一個概念驗證專案**
- 資料儲存在瀏覽器端，清除瀏覽器資料會導致資料遺失
- 密碼未加密，不適合用於生產環境
- 無後端驗證，僅供展示前端功能

## 未來規劃

- [ ] 養牛遊戲核心機制
- [ ] 點數消耗系統
- [ ] 成就系統
- [ ] 資源管理功能

## 授權

MIT License

---

最後更新日期：2025-12-29