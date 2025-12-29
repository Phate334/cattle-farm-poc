"""
一般使用者功能測試
"""

import pytest
from playwright.sync_api import Page, expect
from test_helpers import (
    login,
    logout,
    expect_auth_page,
    expect_user_page,
    register,
    generate_random_username,
    wait_for_page_load,
)


@pytest.mark.user
class TestUser:
    """一般使用者功能測試集"""
    
    @pytest.fixture(autouse=True)
    def setup_user(self, page_setup: Page):
        """每個測試前註冊並登入一個測試使用者"""
        self.page = page_setup
        self.test_username = generate_random_username()
        self.test_password = "password123"
        
        # 註冊使用者
        register(self.page, self.test_username, self.test_password)
        import time
        time.sleep(2)
        
        # 登入
        login(self.page, self.test_username, self.test_password)
        expect_user_page(self.page)
        yield
    
    def test_user_page_displays_correctly(self):
        """使用者頁面應該顯示正確的標題和使用者名稱"""
        expect(self.page.locator("h1")).to_contain_text("會員中心")
        expect(self.page.locator("#user-username")).to_contain_text(self.test_username)
    
    def test_user_can_view_points(self):
        """使用者應該能夠看到自己的點數"""
        # 檢查點數區域
        points_section = self.page.locator(".points-section")
        expect(points_section).to_be_visible()
        expect(points_section.locator("h2")).to_contain_text("我的點數")
        
        # 新註冊使用者的點數應該是 0
        points_number = self.page.locator("#user-points")
        expect(points_number).to_contain_text("0")
    
    def test_user_can_view_account_info(self):
        """使用者應該能夠看到帳號資訊"""
        # 檢查帳號資訊區域
        info_section = self.page.locator(".info-section")
        expect(info_section).to_be_visible()
        expect(info_section.locator("h2")).to_contain_text("帳號資訊")
        
        # 檢查帳號
        user_account = self.page.locator("#user-account")
        expect(user_account).to_contain_text(self.test_username)
        
        # 檢查註冊日期
        user_created = self.page.locator("#user-created")
        expect(user_created).not_to_be_empty()
        
        # 檢查上次登入時間
        user_last_login = self.page.locator("#user-last-login")
        expect(user_last_login).not_to_be_empty()
    
    def test_user_can_logout(self):
        """使用者應該能夠登出"""
        logout(self.page)
        
        # 應該返回登入頁面
        expect_auth_page(self.page)
        expect(self.page.locator("#login-form.active")).to_be_visible()
    
    def test_user_sees_same_data_after_relogin(self):
        """使用者重新登入後應該看到相同的資料"""
        # 登出
        logout(self.page)
        
        # 重新登入
        login(self.page, self.test_username, self.test_password)
        expect_user_page(self.page)
        
        # 應該看到相同的使用者名稱
        expect(self.page.locator("#user-username")).to_contain_text(self.test_username)
        expect(self.page.locator("#user-account")).to_contain_text(self.test_username)
    
    def test_user_sees_updated_points_after_admin_assignment(self):
        """管理員指派點數後使用者應該能看到更新的點數"""
        # 登出並以管理員登入
        logout(self.page)
        login(self.page, "admin", "admin")
        
        # 為測試使用者指派 150 點
        self.page.locator("#target-user").select_option(label=self.test_username, timeout=5000)
        self.page.fill("#points-amount", "150")
        self.page.click('#assignPointsForm button[type="submit"]')
        import time
        time.sleep(0.5)
        
        # 登出管理員並以測試使用者重新登入
        logout(self.page)
        login(self.page, self.test_username, self.test_password)
        expect_user_page(self.page)
        
        # 檢查點數是否已更新
        points_number = self.page.locator("#user-points")
        expect(points_number).to_contain_text("150")
    
    def test_user_page_shows_points_label(self):
        """使用者頁面應該顯示點數標籤"""
        points_label = self.page.locator(".points-label")
        expect(points_label).to_be_visible()
        expect(points_label).to_contain_text("點")
    
    def test_user_page_shows_points_description(self):
        """使用者頁面應該顯示點數說明"""
        points_description = self.page.locator(".points-description")
        expect(points_description).to_be_visible()
        expect(points_description).to_contain_text("這些點數可用於遊戲中的各項功能")
    
    def test_login_state_persists_after_reload_with_updated_points(self):
        """頁面重新整理後應該保持登入狀態並顯示最新資料"""
        # 登出並以管理員身份為使用者增加點數
        logout(self.page)
        login(self.page, "admin", "admin")
        self.page.locator("#target-user").select_option(label=self.test_username, timeout=5000)
        self.page.fill("#points-amount", "200")
        self.page.click('#assignPointsForm button[type="submit"]')
        import time
        time.sleep(0.5)
        
        # 登出管理員並以測試使用者登入
        logout(self.page)
        login(self.page, self.test_username, self.test_password)
        expect_user_page(self.page)
        
        # 重新整理頁面
        self.page.reload()
        wait_for_page_load(self.page)
        
        # 應該仍在使用者頁面且點數正確
        expect_user_page(self.page)
        expect(self.page.locator("#user-points")).to_contain_text("200")
