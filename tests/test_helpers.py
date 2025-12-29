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
    expect(page.locator("#auth-page.active")).to_be_visible()


def expect_admin_page(page: Page) -> None:
    """檢查是否在管理員頁面"""
    expect(page.locator("#admin-page.active")).to_be_visible()


def expect_user_page(page: Page) -> None:
    """檢查是否在使用者頁面"""
    expect(page.locator("#user-page.active")).to_be_visible()


def login(page: Page, username: str, password: str) -> None:
    """執行登入操作"""
    # 確保在登入頁面
    login_form = page.locator("#login-form.active")
    expect(login_form).to_be_visible()
    
    # 填寫登入表單
    page.fill("#login-username", username)
    page.fill("#login-password", password)
    
    # 點擊登入按鈕
    page.click('button[type="submit"]')
    
    # 等待頁面跳轉
    time.sleep(1)


def register(page: Page, username: str, password: str) -> None:
    """執行註冊操作"""
    # 切換到註冊表單
    page.click("#show-register")
    
    # 確保在註冊頁面
    register_form = page.locator("#register-form.active")
    expect(register_form).to_be_visible()
    
    # 填寫註冊表單
    page.fill("#register-username", username)
    page.fill("#register-password", password)
    page.fill("#register-password-confirm", password)
    
    # 點擊註冊按鈕
    page.click('#register-form button[type="submit"]')
    
    # 等待註冊完成
    time.sleep(2)


def logout(page: Page) -> None:
    """執行登出操作"""
    # 尋找登出按鈕（管理員或使用者頁面）
    admin_logout = page.locator("#admin-logout")
    user_logout = page.locator("#user-logout")
    
    if admin_logout.is_visible():
        admin_logout.click()
    elif user_logout.is_visible():
        user_logout.click()
    
    # 等待返回登入頁面
    time.sleep(0.5)
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
    expect(message).to_be_visible()
    expect(message).to_contain_text(text)
    if msg_type:
        expect(message).to_have_class(f".*{msg_type}.*")


def generate_random_username() -> str:
    """產生隨機使用者名稱（用於測試）"""
    import time
    import random
    timestamp = int(time.time() * 1000)
    random_num = random.randint(0, 999)
    return f"testuser_{timestamp}_{random_num}"
