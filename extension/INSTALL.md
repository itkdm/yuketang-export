# 安装指南

## 快速开始

### Chrome / Edge 浏览器

1. **打开扩展管理页面**
   - Chrome: 访问 `chrome://extensions/`
   - Edge: 访问 `edge://extensions/`

2. **启用开发者模式**
   - 在页面右上角找到"开发者模式"开关
   - 点击开启

3. **加载扩展**
   - 点击"加载已解压的扩展程序"按钮
   - 选择 `extension` 文件夹
   - 点击"选择文件夹"

4. **完成安装**
   - 扩展会出现在扩展列表中
   - 确保扩展已启用（开关为蓝色）

### Firefox 浏览器

1. **打开调试页面**
   - 访问 `about:debugging#/runtime/this-firefox`

2. **临时载入扩展**
   - 点击"临时载入附加组件"按钮
   - 选择 `extension/manifest.json` 文件

3. **完成安装**
   - 扩展会出现在列表中
   - 注意：Firefox 需要每次重启后重新加载（临时载入）

## 使用说明

### 小窗试卷模式

1. 访问雨课堂小窗试卷页面：
   - `https://www.yuketang.cn/v2/web/studentQuiz/xxxxx`
   - `https://www.yuketang.cn/v/quiz/quiz_info/xxxxx`

2. 页面右侧会自动显示导出面板

3. 确认模式选择为"小窗试卷模式"

4. 点击"一键导出JSON"或"一键导出MD"

5. 文件会自动下载

### 无图试卷模式

1. 访问考试结果页面：
   - `https://examination.xuetangx.com/result/xxxxx`
   - `https://examination.xuetangx.com/exam_room/xxx?exam_id=xxxxx`

2. 页面右侧会自动显示导出面板

3. 确认模式选择为"无图试卷模式"

4. 点击"一键导出MD"或"一键导出JSON"

5. 文件会自动下载

## 模式切换

- 扩展会自动检测页面类型并切换到对应模式
- 也可以通过下拉框手动切换模式
- 切换模式后，按钮会相应更新

## 常见问题

### Q: 扩展没有显示面板？

A: 检查以下几点：
1. 确保在支持的页面（小窗试卷或考试结果页）
2. 等待页面完全加载（可能需要1-2秒）
3. 检查浏览器控制台是否有错误信息
4. 尝试刷新页面

### Q: 导出失败？

A: 可能的原因：
1. 网络连接问题
2. 页面未完全加载
3. 权限不足（无图试卷模式需要查看答案权限）
4. 检查浏览器控制台的错误信息

### Q: 如何查看错误信息？

A: 
1. 按 F12 打开开发者工具
2. 切换到"Console"标签
3. 查看红色错误信息

### Q: 扩展图标不显示？

A: 
- 这是正常的，如果还没有添加图标文件
- 扩展功能不受影响
- 可以按照 ICONS.md 说明添加图标

## 卸载

### Chrome / Edge

1. 访问扩展管理页面
2. 找到"布吉岛雨课堂导出工具"
3. 点击"移除"按钮

### Firefox

1. 重启浏览器（临时载入的扩展会自动移除）
2. 或访问 `about:debugging#/runtime/this-firefox` 手动移除

## 更新

### Chrome / Edge

1. 访问扩展管理页面
2. 找到扩展，点击"重新加载"按钮
3. 或删除后重新加载新版本

### Firefox

1. 重新临时载入新版本的 manifest.json

## 技术支持

如遇问题，请访问：
- GitHub: https://github.com/itkdm/yuketang-export

