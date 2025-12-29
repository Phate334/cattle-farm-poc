"""
註冊功能測試
"""

import pytest
from playwright.sync_api import Page, expect
from test_helpers import (
    expect_auth_page,
    expect_user_page,
    register,
    login,
    get_stored_users,
    expect_message,
    generate_random_username,
)


@pytest.mark.auth
class TestAuthRegister:
    """註冊功能測試集"""
    
    def test_should_switch_to_register_form(self, page_setup: Page):
        """應該能夠切換到註冊表單"""
        page = page_setup
        expect_auth_page(page)
        
        # 點擊註冊連結
        page.click("#show-register")
        
        # 應該顯示註冊表單
        expect(page.locator("#register-form.active")).to_be_visible()
        expect(page.locator("#register-form h2")).to_contain_text("會員註冊")
    

    
    def test_login_after_registration(self, page_setup: Page):
        """註冊後應該可以登入"""
        page = page_setup
        username = generate_random_username()
        password = "password123"
        
        # 註冊
        register(page, username, password)
        page.wait_for_timeout(2000)
        
        # 登入
        login(page, username, password)
        
        # 應該跳轉到使用者頁面
        expect_user_page(page)
        expect(page.locator("#user-username")).to_contain_text(username)
    
    def test_password_mismatch_should_show_error(self, page_setup: Page):
        """密碼不一致應該顯示錯誤"""
        page = page_setup
        page.click("#show-register")
        
        # 填寫不一致的密碼
        page.fill("#register-username", "testuser")
        page.fill("#register-password", "password123")
        page.fill("#register-password-confirm", "password456")
        
        # 提交表單
        page.click('#register-form button[type="submit"]')
        
        # 應該顯示錯誤訊息
        expect_message(page, "#auth-message", "兩次輸入的密碼不一致", "error")
    

    

    

    
    def test_switch_back_to_login_form(self, page_setup: Page):
        """可以從註冊表單切換回登入表單"""
        page = page_setup
        
        # 切換到註冊表單
        page.click("#show-register")
        expect(page.locator("#register-form.active")).to_be_visible()
        
        # 切換回登入表單
        page.click("#show-login")
        expect(page.locator("#login-form.active")).to_be_visible()
        expect(page.locator("#login-form h2")).to_contain_text("會員登入")
