"""
新功能測試：狀態視圖切換與乳牛倒數計時
"""

import pytest
from playwright.sync_api import Page, expect
from test_helpers import (
    login,
    register,
    generate_random_username,
    expect_user_page,
)


@pytest.mark.user
class TestStatusViewSwitching:
    """測試狀態視圖切換功能"""
    
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
    
    def test_game_view_is_visible_initially(self):
        """登入後應該先顯示遊戲視圖"""
        game_view = self.page.locator("#game-view")
        expect(game_view).to_be_visible()
        
        status_view = self.page.locator("#status-view")
        # 檢查 status_view 是否有 hidden class
        classes = status_view.get_attribute("class")
        assert "hidden" in classes, f"status_view 應該包含 hidden class，但實際為: {classes}"
    
    def test_clicking_status_button_switches_to_status_view(self):
        """點擊狀態按鈕應該切換到狀態視圖"""
        # 確認初始狀態
        game_view = self.page.locator("#game-view")
        status_view = self.page.locator("#status-view")
        expect(game_view).to_be_visible()
        
        # 點擊狀態按鈕
        status_btn = self.page.locator("#user-status-btn")
        status_btn.click()
        self.page.wait_for_timeout(500)
        
        # 驗證視圖切換
        game_classes = game_view.get_attribute("class")
        assert "hidden" in game_classes, f"game_view 應該包含 hidden class，但實際為: {game_classes}"
        
        status_classes = status_view.get_attribute("class")
        assert "hidden" not in status_classes, f"status_view 不應該包含 hidden class，但實際為: {status_classes}"
        expect(status_view).to_be_visible()
    
    def test_status_view_shows_points_and_account_info(self):
        """狀態視圖應該顯示點數和帳號資訊"""
        # 切換到狀態視圖
        status_btn = self.page.locator("#user-status-btn")
        status_btn.click()
        self.page.wait_for_timeout(500)
        
        # 驗證點數區域
        points_section = self.page.locator(".points-section")
        expect(points_section).to_be_visible()
        expect(points_section.locator("h2")).to_contain_text("我的點數")
        
        # 驗證帳號資訊區域
        info_section = self.page.locator(".info-section")
        expect(info_section).to_be_visible()
        expect(info_section.locator("h2")).to_contain_text("帳號資訊")
    
    def test_back_to_game_button_exists_in_status_view(self):
        """狀態視圖應該有返回遊戲按鈕"""
        # 切換到狀態視圖
        status_btn = self.page.locator("#user-status-btn")
        status_btn.click()
        self.page.wait_for_timeout(500)
        
        # 驗證返回按鈕存在
        back_btn = self.page.locator("#back-to-game-btn")
        expect(back_btn).to_be_visible()
        expect(back_btn).to_contain_text("返回遊戲")
    
    def test_clicking_back_button_returns_to_game_view(self):
        """點擊返回按鈕應該回到遊戲視圖"""
        game_view = self.page.locator("#game-view")
        status_view = self.page.locator("#status-view")
        
        # 切換到狀態視圖
        status_btn = self.page.locator("#user-status-btn")
        status_btn.click()
        self.page.wait_for_timeout(500)
        expect(status_view).to_be_visible()
        
        # 點擊返回按鈕
        back_btn = self.page.locator("#back-to-game-btn")
        back_btn.click()
        self.page.wait_for_timeout(500)
        
        # 驗證回到遊戲視圖
        game_classes = game_view.get_attribute("class")
        assert "hidden" not in game_classes, f"game_view 不應該包含 hidden class，但實際為: {game_classes}"
        expect(game_view).to_be_visible()
        
        status_classes = status_view.get_attribute("class")
        assert "hidden" in status_classes, f"status_view 應該包含 hidden class，但實際為: {status_classes}"


@pytest.mark.user
@pytest.mark.game
class TestMultipleCattle:
    """測試多頭乳牛功能"""
    
    @pytest.fixture(autouse=True)
    def setup_user_with_points(self, page_setup: Page):
        """每個測試前註冊使用者並給予點數"""
        self.page = page_setup
        self.test_username = generate_random_username()
        self.test_password = "password123"
        
        # 註冊使用者
        register(self.page, self.test_username, self.test_password)
        self.page.wait_for_timeout(2000)
        
        # 登入
        login(self.page, self.test_username, self.test_password)
        expect_user_page(self.page)
        
        # 等待頁面完全載入
        self.page.wait_for_timeout(2000)
        
        # 給予使用者一些點數
        self.page.evaluate("""
            () => {
                const users = JSON.parse(localStorage.getItem('cattleFarmUsers'));
                const currentUser = JSON.parse(localStorage.getItem('cattleFarmCurrentUser'));
                if (users && currentUser) {
                    const user = users.find(u => u.id === currentUser.id);
                    if (user) {
                        user.points = 200;
                        localStorage.setItem('cattleFarmUsers', JSON.stringify(users));
                        currentUser.points = 200;
                        localStorage.setItem('cattleFarmCurrentUser', JSON.stringify(currentUser));
                    }
                }
            }
        """)
        
        # 重新載入頁面以更新顯示
        self.page.reload()
        self.page.wait_for_timeout(1000)
        expect_user_page(self.page)
        yield
    
    def test_three_cattle_are_displayed(self):
        """應該顯示三頭乳牛"""
        cattle_1 = self.page.locator("#cattle-1")
        cattle_2 = self.page.locator("#cattle-2")
        cattle_3 = self.page.locator("#cattle-3")
        
        expect(cattle_1).to_be_visible()
        expect(cattle_2).to_be_visible()
        expect(cattle_3).to_be_visible()
    
    def test_each_cattle_has_unique_name(self):
        """每頭乳牛應該有唯一的名稱"""
        cattle_1_name = self.page.locator("#cattle-1 .cattle-name")
        cattle_2_name = self.page.locator("#cattle-2 .cattle-name")
        cattle_3_name = self.page.locator("#cattle-3 .cattle-name")
        
        expect(cattle_1_name).to_contain_text("乳牛 #1")
        expect(cattle_2_name).to_contain_text("乳牛 #2")
        expect(cattle_3_name).to_contain_text("乳牛 #3")
    
    def test_each_cattle_has_timer_display(self):
        """每頭乳牛應該有計時器顯示"""
        cattle_1_timer = self.page.locator("#cattle-1-timer")
        cattle_2_timer = self.page.locator("#cattle-2-timer")
        cattle_3_timer = self.page.locator("#cattle-3-timer")
        
        expect(cattle_1_timer).to_be_visible()
        expect(cattle_2_timer).to_be_visible()
        expect(cattle_3_timer).to_be_visible()
    
    def test_initial_timer_shows_dashes(self):
        """初始狀態計時器應該顯示 --"""
        cattle_1_timer = self.page.locator("#cattle-1-timer")
        expect(cattle_1_timer).to_contain_text("--")
    
    def test_can_feed_all_three_cattle(self):
        """應該可以餵養所有三頭乳牛"""
        # 先購買牧草
        self.page.fill("#grass-amount", "30")
        self.page.click("#buy-grass-btn")
        self.page.wait_for_timeout(1000)
        
        # 餵養三頭乳牛
        for cattle_id in [1, 2, 3]:
            self.page.click(f"#cattle-{cattle_id}")
            self.page.wait_for_timeout(500)
            
            # 驗證飽食度增加
            hunger = self.page.locator(f"#cattle-{cattle_id}-hunger")
            expect(hunger).to_contain_text("10")


@pytest.mark.user
@pytest.mark.game
class TestCattleCountdownTimer:
    """測試乳牛倒數計時功能"""
    
    @pytest.fixture(autouse=True)
    def setup_user_with_points(self, page_setup: Page):
        """每個測試前註冊使用者並給予點數"""
        self.page = page_setup
        self.test_username = generate_random_username()
        self.test_password = "password123"
        
        # 註冊使用者
        register(self.page, self.test_username, self.test_password)
        self.page.wait_for_timeout(2000)
        
        # 登入
        login(self.page, self.test_username, self.test_password)
        expect_user_page(self.page)
        
        # 等待頁面完全載入
        self.page.wait_for_timeout(2000)
        
        # 給予使用者一些點數
        self.page.evaluate("""
            () => {
                const users = JSON.parse(localStorage.getItem('cattleFarmUsers'));
                const currentUser = JSON.parse(localStorage.getItem('cattleFarmCurrentUser'));
                if (users && currentUser) {
                    const user = users.find(u => u.id === currentUser.id);
                    if (user) {
                        user.points = 200;
                        localStorage.setItem('cattleFarmUsers', JSON.stringify(users));
                        currentUser.points = 200;
                        localStorage.setItem('cattleFarmCurrentUser', JSON.stringify(currentUser));
                    }
                }
            }
        """)
        
        # 重新載入頁面以更新顯示
        self.page.reload()
        self.page.wait_for_timeout(1000)
        expect_user_page(self.page)
        yield
    
    def test_timer_starts_when_cattle_is_full(self):
        """當乳牛飽食度達到最大值時，計時器應該開始"""
        # 購買牧草
        self.page.fill("#grass-amount", "50")
        self.page.click("#buy-grass-btn")
        self.page.wait_for_timeout(1000)
        
        # 餵養乳牛直到飽食度達到 100
        for i in range(10):
            self.page.click("#cattle-1")
            self.page.wait_for_timeout(300)
        
        # 等待一下讓計時器更新
        self.page.wait_for_timeout(1000)
        
        # 驗證飽食度為 100
        hunger = self.page.locator("#cattle-1-hunger")
        expect(hunger).to_contain_text("100")
        
        # 驗證計時器顯示數字（應該是 60 或接近 60）
        timer = self.page.locator("#cattle-1-timer")
        timer_text = timer.inner_text()
        assert timer_text != "--", "計時器應該顯示數字而不是 --"
        timer_value = int(timer_text)
        assert 55 <= timer_value <= 60, f"計時器應該在 55-60 秒之間，實際為 {timer_value}"
    
    def test_timer_counts_down(self):
        """計時器應該倒數計時"""
        # 購買牧草並餵養乳牛到飽
        self.page.fill("#grass-amount", "50")
        self.page.click("#buy-grass-btn")
        self.page.wait_for_timeout(1000)
        
        for i in range(10):
            self.page.click("#cattle-1")
            self.page.wait_for_timeout(300)
        
        # 等待計時器初始化
        self.page.wait_for_timeout(1000)
        
        # 記錄初始時間
        timer = self.page.locator("#cattle-1-timer")
        initial_time = int(timer.inner_text())
        
        # 等待 3 秒
        self.page.wait_for_timeout(3000)
        
        # 記錄新時間
        new_time = int(timer.inner_text())
        
        # 驗證時間有減少
        assert new_time < initial_time, f"計時器應該倒數，但從 {initial_time} 變成 {new_time}"
        assert initial_time - new_time >= 2, "計時器應該至少減少 2 秒"
    
    def test_hunger_resets_after_timer_expires(self):
        """計時器結束後飽食度應該清零"""
        # 購買牧草並餵養乳牛到飽
        self.page.fill("#grass-amount", "50")
        self.page.click("#buy-grass-btn")
        self.page.wait_for_timeout(1000)
        
        for i in range(10):
            self.page.click("#cattle-1")
            self.page.wait_for_timeout(300)
        
        # 驗證飽食度為 100
        hunger = self.page.locator("#cattle-1-hunger")
        expect(hunger).to_contain_text("100")
        
        # 使用 JavaScript 加速計時器（將結束時間設為現在）
        self.page.evaluate("""
            () => {
                const gameData = JSON.parse(localStorage.getItem('cattleFarmGameData'));
                const currentUser = JSON.parse(localStorage.getItem('cattleFarmCurrentUser'));
                if (gameData && currentUser) {
                    const userGameData = gameData[currentUser.id];
                    if (userGameData && userGameData.cattle) {
                        userGameData.cattle[0].timerEndTime = Date.now() - 1000; // 設為過去的時間
                        localStorage.setItem('cattleFarmGameData', JSON.stringify(gameData));
                    }
                }
            }
        """)
        
        # 等待計時器更新（每秒更新一次）
        self.page.wait_for_timeout(2000)
        
        # 驗證飽食度已清零
        expect(hunger).to_contain_text("0")
        
        # 驗證計時器顯示 --
        timer = self.page.locator("#cattle-1-timer")
        expect(timer).to_contain_text("--")
    
    def test_game_hint_mentions_timer(self):
        """遊戲提示應該提到計時器功能"""
        hint = self.page.locator(".game-hint")
        expect(hint).to_be_visible()
        hint_text = hint.inner_text()
        assert "一分鐘" in hint_text or "60" in hint_text or "清空" in hint_text, "遊戲提示應該提到飽食度清空功能"
