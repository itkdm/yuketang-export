// popup.js - 处理扩展弹窗的逻辑

document.addEventListener('DOMContentLoaded', async () => {
  const toggle = document.getElementById('extensionToggle');
  
  // 加载当前开关状态
  chrome.storage.local.get(['extensionEnabled'], (result) => {
    // 默认开启（如果未设置）
    const enabled = result.extensionEnabled !== false;
    toggle.checked = enabled;
  });

  // 监听开关变化
  toggle.addEventListener('change', (e) => {
    const enabled = e.target.checked;
    chrome.storage.local.set({ extensionEnabled: enabled }, () => {
      // 通知所有标签页更新（忽略发送失败的标签页，例如未注入内容脚本的页面）
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          try {
            chrome.tabs.sendMessage(tab.id, {
              action: 'toggleChanged',
              enabled: enabled
            });
          } catch (_) {
            // 忽略错误
          }
        });
      });
    });
  });
});

