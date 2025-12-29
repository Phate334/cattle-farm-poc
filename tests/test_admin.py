"""
管理員功能測試
"""

import pytest
from playwright.sync_api import Page, expect
from test_helpers import (
    login,
    logout,
    expect_auth_page,
    expect_admin_page,
)


@pytest.mark.admin
class TestAdmin:
    """管理員功能測試集"""
    
    @pytest.fixture(autouse=True)
    def setup_admin(self, page_setup: Page):
        """每個測試前以管理員身份登入"""
        self.page = page_setup
        login(self.page, "admin", "admin")
        expect_admin_page(self.page)
        yield
    
    def test_admin_page_displays_correctly(self):
        """管理員頁面應該顯示正確的標題和使用者名稱"""
        # 使用更具體的選擇器
        expect(self.page.locator("#admin-page h1")).to_contain_text("管理員後臺")
        expect(self.page.locator("#admin-username")).to_contain_text("admin")
    



    def test_error_when_no_user_selected(self):
        """未選擇使用者時應該顯示錯誤訊息"""
        # 不選擇使用者直接填寫點數
        self.page.fill("#points-amount", "100")
        self.page.click('#assignPointsForm button[type="submit"]')
        
        # 應該顯示錯誤訊息
        message = self.page.locator("#admin-message")
        message.wait_for(state="visible", timeout=10000)
        expect(message).to_be_visible()
        expect(message).to_contain_text("請選擇使用者")
        expect(message).to_have_class("message error")
    

    def test_admin_can_logout(self):
        """管理員應該能夠登出"""
        logout(self.page)
        
        # 應該返回登入頁面
        expect_auth_page(self.page)
        expect(self.page.locator("#login-form.active")).to_be_visible()
    
    def test_no_users_message_displayed(self, page_setup: Page):
        """沒有一般使用者時應該顯示提示訊息"""
        # 直接以管理員登入（不建立其他使用者）
        page = page_setup
        login(page, "admin", "admin")
        expect_admin_page(page)
        
        # 應該顯示無使用者訊息
        no_users = page.locator(".no-users")
        expect(no_users).to_be_visible()
        expect(no_users).to_contain_text("目前沒有一般使用者")
