"""
Playwright 測試輔助工具函數
"""

from playwright.sync_api import Page, expect
import time


def clear_local_storage(page: Page) -> None:
    """清除 LocalStorage 資料"""
    page.evaluate("() => localStorage.clear()")


def wait_for_page_load(page: Page) -> None:
    """等待頁面載入完成"""
    page.wait_for_load_state("networkidle")


def expect_auth_page(page: Page) -> None:
    """檢查是否在登入頁面"""
    auth_page = page.locator("#auth-page.active")
    auth_page.wait_for(state="visible", timeout=10000)
    expect(auth_page).to_be_visible()


def expect_admin_page(page: Page) -> None:
    """檢查是否在管理員頁面"""
    admin_page = page.locator("#admin-page.active")
    admin_page.wait_for(state="visible", timeout=10000)
    expect(admin_page).to_be_visible()


def expect_user_page(page: Page) -> None:
    """檢查是否在使用者頁面"""
    user_page = page.locator("#user-page.active")
    user_page.wait_for(state="visible", timeout=10000)
    expect(user_page).to_be_visible()


def login(page: Page, username: str, password: str) -> None:
    """執行登入操作"""
    # 確保在登入頁面
    login_form = page.locator("#login-form.active")
    login_form.wait_for(state="visible", timeout=10000)
    expect(login_form).to_be_visible()
    
    # 填寫登入表單
    page.fill("#login-username", username)
    page.fill("#login-password", password)
    
    # 點擊登入按鈕並等待導航
    page.click('button[type="submit"]')
    
    # 等待頁面跳轉完成 - 等待 auth-page 隱藏或其他頁面顯示
    page.wait_for_timeout(1000)


def register(page: Page, username: str, password: str) -> None:
    """執行註冊操作"""
    # 等待並點擊切換到註冊表單的按鈕
    show_register_btn = page.locator("#show-register")
    show_register_btn.wait_for(state="visible", timeout=10000)
    show_register_btn.click()
    
    # 確保在註冊頁面
    register_form = page.locator("#register-form.active")
    register_form.wait_for(state="visible", timeout=10000)
    expect(register_form).to_be_visible()
    
    # 填寫註冊表單
    page.fill("#register-username", username)
    page.fill("#register-password", password)
    page.fill("#register-password-confirm", password)
    
    # 點擊註冊按鈕
    page.click('#register-form button[type="submit"]')
    
    # 等待註冊完成（等待訊息出現）
    page.wait_for_timeout(2000)


def logout(page: Page) -> None:
    """執行登出操作"""
    # 尋找登出按鈕（管理員或使用者頁面）
    admin_logout = page.locator("#admin-logout")
    user_logout = page.locator("#user-logout")
    
    # 使用 try-catch 來處理可見性檢查
    try:
        if admin_logout.is_visible(timeout=1000):
            admin_logout.click()
        elif user_logout.is_visible(timeout=1000):
            user_logout.click()
    except:
        # 如果都不可見，嘗試直接點擊可能存在的
        if admin_logout.count() > 0:
            admin_logout.click()
        elif user_logout.count() > 0:
            user_logout.click()
    
    # 等待返回登入頁面
    page.wait_for_timeout(500)
    expect_auth_page(page)


def get_stored_users(page: Page) -> list:
    """取得 LocalStorage 中的使用者資料"""
    users_json = page.evaluate("""
        () => {
            const usersJson = localStorage.getItem('cattleFarmUsers');
            return usersJson ? JSON.parse(usersJson) : [];
        }
    """)
    return users_json


def get_current_user(page: Page) -> dict:
    """取得當前登入使用者"""
    current_user = page.evaluate("""
        () => {
            const userJson = localStorage.getItem('cattleFarmCurrentUser');
            return userJson ? JSON.parse(userJson) : null;
        }
    """)
    return current_user


def expect_message(page: Page, message_locator: str, text: str, msg_type: str = None) -> None:
    """檢查訊息顯示"""
    message = page.locator(message_locator)
    # 使用 Playwright 的 wait 而不是直接 expect
    message.wait_for(state="visible", timeout=10000)
    expect(message).to_be_visible()
    expect(message).to_contain_text(text)
    if msg_type:
        # 修正：應該檢查完整的 class 字串，不是 regex
        expect(message).to_have_class(f"message {msg_type}")


def generate_random_username() -> str:
    """產生隨機使用者名稱（用於測試）"""
    import time
    import random
    timestamp = int(time.time() * 1000)
    random_num = random.randint(0, 999)
    return f"testuser_{timestamp}_{random_num}"
