"""
登入功能測試
"""

import pytest
from playwright.sync_api import Page, expect
from tests.test_helpers import (
    expect_auth_page,
    expect_admin_page,
    login,
    get_current_user,
    expect_message,
)


@pytest.mark.auth
class TestAuthLogin:
    """登入功能測試集"""
    
    def test_should_display_login_page(self, page_setup: Page):
        """應該顯示登入頁面"""
        page = page_setup
        expect_auth_page(page)
        expect(page.locator("#login-form.active")).to_be_visible()
        expect(page.locator("h2")).to_contain_text("會員登入")
    
    def test_admin_login_success(self, page_setup: Page):
        """使用預設管理員帳號登入成功"""
        page = page_setup
        login(page, "admin", "admin")
        
        # 應該跳轉到管理員頁面
        expect_admin_page(page)
        
        # 檢查管理員名稱顯示
        expect(page.locator("#admin-username")).to_contain_text("admin")
        
        # 檢查 LocalStorage 中的當前使用者
        current_user = get_current_user(page)
        assert current_user is not None
        assert current_user["username"] == "admin"
        assert current_user["role"] == "admin"
    
    def test_login_with_wrong_credentials(self, page_setup: Page):
        """使用錯誤的帳號密碼應該登入失敗"""
        page = page_setup
        login(page, "wronguser", "wrongpass")
        
        # 應該停留在登入頁面
        expect_auth_page(page)
        
        # 應該顯示錯誤訊息
        expect_message(page, "#auth-message", "帳號或密碼錯誤", "error")
    
    def test_empty_credentials_should_show_error(self, page_setup: Page):
        """空白帳號或密碼應該顯示錯誤"""
        page = page_setup
        
        # 不填寫任何資料直接提交
        page.click('#login-form button[type="submit"]')
        
        # 應該停留在登入頁面
        expect_auth_page(page)
        
        # 檢查 HTML5 驗證（瀏覽器原生驗證）
        username_input = page.locator("#login-username")
        expect(username_input).to_have_attribute("required", "")
    
    def test_login_state_persists_after_reload(self, page_setup: Page):
        """登入後重新整理頁面應該保持登入狀態"""
        page = page_setup
        login(page, "admin", "admin")
        expect_admin_page(page)
        
        # 重新整理頁面
        page.reload()
        page.wait_for_load_state("networkidle")
        
        # 應該仍在管理員頁面
        expect_admin_page(page)
        expect(page.locator("#admin-username")).to_contain_text("admin")
