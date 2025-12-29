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
        self.page.wait_for_timeout(2000)
        
        # 登入
        login(self.page, self.test_username, self.test_password)
        expect_user_page(self.page)
        yield
    
    def test_user_page_displays_correctly(self):
        """使用者頁面應該顯示正確的標題和使用者名稱"""
        # 使用更具體的選擇器
        expect(self.page.locator("#user-page h1")).to_contain_text("會員中心")
        expect(self.page.locator("#user-username")).to_contain_text(self.test_username)
        
        # 檢查遊戲區域存在
        game_section = self.page.locator(".game-section")
        expect(game_section).to_be_visible()
    
    def test_user_can_view_points(self):
        """使用者應該能夠點擊狀態按鈕查看點數"""
        # 點擊狀態按鈕
        status_btn = self.page.locator("#user-status-btn")
        expect(status_btn).to_be_visible()
        status_btn.click()
        self.page.wait_for_timeout(500)
        
        # 檢查點數區域顯示
        points_section = self.page.locator(".points-section")
        expect(points_section).to_be_visible()
        expect(points_section.locator("h2")).to_contain_text("我的點數")
        
        # 新註冊使用者的點數應該是 0
        points_number = self.page.locator("#user-points")
        expect(points_number).to_contain_text("0")
    
    def test_user_can_view_account_info(self):
        """使用者應該能夠點擊狀態按鈕查看帳號資訊"""
        # 點擊狀態按鈕
        status_btn = self.page.locator("#user-status-btn")
        status_btn.click()
        self.page.wait_for_timeout(500)
        
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
    

    def test_user_page_shows_points_label(self):
        """使用者頁面應該顯示點數標籤（點擊狀態按鈕後）"""
        # 點擊狀態按鈕
        status_btn = self.page.locator("#user-status-btn")
        status_btn.click()
        self.page.wait_for_timeout(500)
        
        points_label = self.page.locator(".points-label")
        expect(points_label).to_be_visible()
        expect(points_label).to_contain_text("點")
    
    def test_user_page_shows_points_description(self):
        """使用者頁面應該顯示點數說明（點擊狀態按鈕後）"""
        # 點擊狀態按鈕
        status_btn = self.page.locator("#user-status-btn")
        status_btn.click()
        self.page.wait_for_timeout(500)
        
        points_description = self.page.locator(".points-description")
        expect(points_description).to_be_visible()
        expect(points_description).to_contain_text("這些點數可用於遊戲中的各項功能")


@pytest.mark.user
@pytest.mark.game
class TestUserGame:
    """一般使用者遊戲功能測試集"""
    
    @pytest.fixture(autouse=True)
    def setup_user_with_points(self, page_setup: Page):
        """每個測試前註冊使用者並給予點數"""
        self.page = page_setup
        self.test_username = generate_random_username()
        self.test_password = "password123"
        
        # 註冊使用者
        register(self.page, self.test_username, self.test_password)
        self.page.wait_for_timeout(2000)
        
        # 給予使用者一些點數（透過 LocalStorage 直接修改）
        self.page.evaluate("""
            () => {
                const users = JSON.parse(localStorage.getItem('cattleFarmUsers'));
                const currentUser = JSON.parse(localStorage.getItem('cattleFarmCurrentUser'));
                const user = users.find(u => u.id === currentUser.id);
                if (user) {
                    user.points = 100;
                    localStorage.setItem('cattleFarmUsers', JSON.stringify(users));
                    currentUser.points = 100;
                    localStorage.setItem('cattleFarmCurrentUser', JSON.stringify(currentUser));
                }
            }
        """)
        
        # 重新載入頁面以更新顯示
        self.page.reload()
        self.page.wait_for_timeout(1000)
        expect_user_page(self.page)
        yield
    
    def test_game_section_displays(self):
        """遊戲區域應該正確顯示"""
        game_section = self.page.locator(".game-section")
        expect(game_section).to_be_visible()
        expect(game_section.locator("h2")).to_contain_text("養牛遊戲")
        
        # 檢查資源顯示
        expect(self.page.locator("#game-points")).to_be_visible()
        expect(self.page.locator("#game-grass")).to_be_visible()
        
        # 檢查購買牧草區域
        buy_grass_section = self.page.locator(".buy-grass-section")
        expect(buy_grass_section).to_be_visible()
        
        # 檢查乳牛區域
        cattle_area = self.page.locator(".cattle-area")
        expect(cattle_area).to_be_visible()
    
    def test_user_can_buy_grass(self):
        """使用者應該能夠用點數購買牧草"""
        # 檢查初始狀態
        expect(self.page.locator("#game-points")).to_contain_text("100")
        expect(self.page.locator("#game-grass")).to_contain_text("0")
        
        # 輸入購買數量
        self.page.fill("#grass-amount", "10")
        
        # 點擊購買按鈕
        self.page.click("#buy-grass-btn")
        self.page.wait_for_timeout(1000)
        
        # 驗證點數減少
        expect(self.page.locator("#game-points")).to_contain_text("90")
        
        # 驗證牧草增加
        expect(self.page.locator("#game-grass")).to_contain_text("10")
        
        # 驗證成功訊息
        message = self.page.locator("#game-message.success")
        expect(message).to_be_visible()
        expect(message).to_contain_text("成功購買 10 個牧草")
    
    def test_user_cannot_buy_grass_with_insufficient_points(self):
        """使用者點數不足時不能購買牧草"""
        # 嘗試購買超過點數的牧草
        self.page.fill("#grass-amount", "200")
        self.page.click("#buy-grass-btn")
        self.page.wait_for_timeout(1000)
        
        # 驗證錯誤訊息
        message = self.page.locator("#game-message.error")
        expect(message).to_be_visible()
        expect(message).to_contain_text("點數不足")
    
    def test_cattle_displays_correctly(self):
        """乳牛應該正確顯示"""
        cattle_item = self.page.locator("#cattle-1")
        expect(cattle_item).to_be_visible()
        
        # 檢查乳牛名稱
        expect(cattle_item.locator(".cattle-name")).to_contain_text("乳牛 #1")
        
        # 檢查飽食度
        expect(cattle_item.locator("#cattle-1-hunger")).to_contain_text("0")
    
    def test_user_can_feed_cattle(self):
        """使用者應該能夠餵養乳牛"""
        # 先購買牧草
        self.page.fill("#grass-amount", "5")
        self.page.click("#buy-grass-btn")
        self.page.wait_for_timeout(1000)
        
        # 驗證有牧草
        expect(self.page.locator("#game-grass")).to_contain_text("5")
        
        # 點擊乳牛餵養
        self.page.click("#cattle-1")
        self.page.wait_for_timeout(1000)
        
        # 驗證牧草減少
        expect(self.page.locator("#game-grass")).to_contain_text("4")
        
        # 驗證飽食度增加
        expect(self.page.locator("#cattle-1-hunger")).to_contain_text("10")
        
        # 驗證成功訊息
        message = self.page.locator("#game-message.success")
        expect(message).to_be_visible()
    
    def test_user_cannot_feed_cattle_without_grass(self):
        """使用者沒有牧草時不能餵養乳牛"""
        # 確認沒有牧草
        expect(self.page.locator("#game-grass")).to_contain_text("0")
        
        # 嘗試點擊乳牛
        self.page.click("#cattle-1")
        self.page.wait_for_timeout(1000)
        
        # 驗證錯誤訊息
        message = self.page.locator("#game-message.error")
        expect(message).to_be_visible()
        expect(message).to_contain_text("牧草不足")
    
    def test_cattle_hunger_has_maximum(self):
        """乳牛飽食度應該有上限"""
        # 購買足夠的牧草
        self.page.fill("#grass-amount", "50")
        self.page.click("#buy-grass-btn")
        self.page.wait_for_timeout(1000)
        
        # 多次餵養乳牛
        for i in range(12):  # 餵養 12 次應該會達到上限 100
            self.page.click("#cattle-1")
            self.page.wait_for_timeout(500)
        
        # 驗證飽食度不超過 100
        hunger_text = self.page.locator("#cattle-1-hunger").inner_text()
        hunger_value = int(hunger_text)
        assert hunger_value <= 100, f"飽食度 {hunger_value} 超過上限 100"

