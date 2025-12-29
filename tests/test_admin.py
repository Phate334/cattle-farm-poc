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
    




    

    def test_admin_can_logout(self):
        """管理員應該能夠登出"""
        logout(self.page)
        
        # 應該返回登入頁面
        expect_auth_page(self.page)
        expect(self.page.locator("#login-form.active")).to_be_visible()
    

