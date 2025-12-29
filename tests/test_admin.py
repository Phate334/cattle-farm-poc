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
    register,
    get_stored_users,
    generate_random_username,
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
    
    def test_admin_can_view_user_list(self):
        """管理員應該能夠看到使用者列表"""
        # 登出並註冊一個測試使用者
        logout(self.page)
        test_user = generate_random_username()
        register(self.page, test_user, "password123")
        self.page.wait_for_timeout(2000)
        
        # 重新以管理員登入
        login(self.page, "admin", "admin")
        expect_admin_page(self.page)
        
        # 應該看到使用者列表
        users_table = self.page.locator(".users-table")
        expect(users_table).to_be_visible()
        
        # 應該包含測試使用者
        expect(self.page.locator(".users-table")).to_contain_text(test_user)
    
    def test_admin_can_assign_points(self):
        """管理員應該能夠為使用者指派點數"""
        # 登出並註冊一個測試使用者
        logout(self.page)
        test_user = generate_random_username()
        register(self.page, test_user, "password123")
        self.page.wait_for_timeout(2000)
        
        # 重新以管理員登入
        login(self.page, "admin", "admin")
        expect_admin_page(self.page)
        
        # 等待並選擇使用者
        user_select = self.page.locator("#target-user")
        user_select.wait_for(state="visible", timeout=10000)
        user_select.select_option(label=test_user, timeout=10000)
        
        # 填寫點數
        self.page.fill("#points-amount", "100")
        
        # 提交表單
        self.page.click('#assignPointsForm button[type="submit"]')
        
        # 等待操作完成
        self.page.wait_for_timeout(500)
        
        # 應該顯示成功訊息
        message = self.page.locator("#admin-message")
        message.wait_for(state="visible", timeout=10000)
        expect(message).to_be_visible()
        expect(message).to_contain_text("成功")
        expect(message).to_contain_text("100")
        
        # 檢查使用者列表中的點數已更新
        expect(self.page.locator(".users-table")).to_contain_text("100")
        
        # 檢查 LocalStorage 中的資料
        users = get_stored_users(self.page)
        updated_user = next((u for u in users if u["username"] == test_user), None)
        assert updated_user["points"] == 100
    
    def test_admin_can_assign_points_multiple_times(self):
        """管理員應該能夠多次為同一使用者增加點數"""
        # 登出並註冊一個測試使用者
        logout(self.page)
        test_user = generate_random_username()
        register(self.page, test_user, "password123")
        self.page.wait_for_timeout(2000)
        
        # 重新以管理員登入
        login(self.page, "admin", "admin")
        expect_admin_page(self.page)
        
        # 第一次指派 50 點
        user_select = self.page.locator("#target-user")
        user_select.wait_for(state="visible", timeout=10000)
        user_select.select_option(label=test_user, timeout=10000)
        self.page.fill("#points-amount", "50")
        self.page.click('#assignPointsForm button[type="submit"]')
        self.page.wait_for_timeout(500)
        
        # 第二次指派 30 點
        self.page.locator("#target-user").select_option(label=test_user, timeout=10000)
        self.page.fill("#points-amount", "30")
        self.page.click('#assignPointsForm button[type="submit"]')
        self.page.wait_for_timeout(500)
        
        # 檢查 LocalStorage 中的總點數
        users = get_stored_users(self.page)
        updated_user = next((u for u in users if u["username"] == test_user), None)
        assert updated_user["points"] == 80  # 50 + 30
    
    def test_error_when_no_user_selected(self):
        """未選擇使用者時應該顯示錯誤訊息"""
        # 不選擇使用者直接填寫點數
        self.page.fill("#points-amount", "100")
        self.page.click('#assignPointsForm button[type="submit"]')
        
        # 應該顯示錯誤訊息
        message = self.page.locator("#admin-message")
        expect(message).to_be_visible()
        expect(message).to_contain_text("請選擇使用者")
        expect(message).to_have_class(".*error.*")
    
    def test_error_when_invalid_points_amount(self):
        """點數數量無效時應該顯示錯誤訊息"""
        # 登出並註冊一個測試使用者
        logout(self.page)
        test_user = generate_random_username()
        register(self.page, test_user, "password123")
        self.page.wait_for_timeout(2000)
        
        # 重新以管理員登入
        login(self.page, "admin", "admin")
        expect_admin_page(self.page)
        
        # 選擇使用者但不填寫點數
        user_select = self.page.locator("#target-user")
        user_select.wait_for(state="visible", timeout=10000)
        user_select.select_option(label=test_user, timeout=10000)
        self.page.click('#assignPointsForm button[type="submit"]')
        
        # 應該顯示錯誤訊息
        message = self.page.locator("#admin-message")
        message.wait_for(state="visible", timeout=10000)
        expect(message).to_be_visible()
        expect(message).to_contain_text("請輸入有效的點數數量")
    
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
