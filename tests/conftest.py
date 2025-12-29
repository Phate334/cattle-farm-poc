"""
Pytest 配置和共用 fixtures
"""

import pytest
import subprocess
import time
import signal
import os
from playwright.sync_api import Page
from test_helpers import clear_local_storage, wait_for_page_load


# HTTP 伺服器進程
http_server_process = None


def pytest_configure(config):
    """Pytest 啟動時的配置"""
    global http_server_process
    
    # 啟動 Python HTTP 伺服器
    print("\n🚀 啟動 HTTP 伺服器 (port 8000)...")
    http_server_process = subprocess.Popen(
        ["python", "-m", "http.server", "8000"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        preexec_fn=os.setsid if os.name != 'nt' else None
    )
    
    # 等待伺服器啟動
    time.sleep(2)
    print("✅ HTTP 伺服器已啟動\n")


def pytest_unconfigure(config):
    """Pytest 結束時的清理"""
    global http_server_process
    
    if http_server_process:
        print("\n🛑 關閉 HTTP 伺服器...")
        if os.name == 'nt':
            # Windows
            http_server_process.terminate()
        else:
            # Unix/Linux/Mac
            os.killpg(os.getpgid(http_server_process.pid), signal.SIGTERM)
        
        http_server_process.wait()
        print("✅ HTTP 伺服器已關閉\n")


@pytest.fixture(scope="function")
def page_setup(page: Page):
    """每個測試前的頁面設置"""
    # 前往首頁
    page.goto("/")
    
    # 清除 LocalStorage
    clear_local_storage(page)
    
    # 重新載入頁面
    page.reload()
    
    # 等待頁面載入
    wait_for_page_load(page)
    
    yield page
    
    # 測試後清理（如果需要）
    pass
