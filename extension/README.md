# 布吉岛雨课堂导出工具

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/itkdm/yuketang-export)

一个功能完整的浏览器扩展，用于导出雨课堂试卷内容，支持小窗试卷和无图试卷两种模式。

## ✨ 功能特性

### 两种导出模式

1. **小窗试卷模式**（iframe试卷）
   - 适用于：`www.yuketang.cn/v2/web/*` 和 `www.yuketang.cn/v/quiz/*`
   - 支持 MultipleChoice（选择题）和 FillBlank（填空题）
   - 保留图片URL，不做OCR
   - 导出格式：JSON、Markdown

2. **无图试卷模式**（正常试卷）
   - 适用于：`examination.xuetangx.com/*`
   - 导出题目、选项、答案
   - 仅导出你有权限查看的内容（复习模式）
   - 导出格式：JSON、Markdown

### 核心功能

- ✅ **智能识别**：自动检测页面类型并切换对应模式
- ✅ **模式切换**：支持手动切换导出模式
- ✅ **开关控制**：可随时启用/禁用扩展
- ✅ **权限控制**：仅导出你有权限查看的内容
- ✅ **安全可靠**：所有数据处理在本地完成，不上传任何数据
- ✅ **UI设计**：蓝色科技感设计风格，美观易用

## 📦 安装方法

### 方式一：从源码安装（推荐）

1. **克隆仓库**
   ```bash
   git clone https://github.com/itkdm/yuketang-export.git
   cd yuketang-export/extension
   ```

2. **Chrome / Edge**
   - 打开浏览器，访问 `chrome://extensions/` 或 `edge://extensions/`
   - 开启"开发者模式"（右上角开关）
   - 点击"加载已解压的扩展程序"
   - 选择 `extension` 文件夹
   - 完成安装

3. **Firefox**
   - 打开 Firefox，访问 `about:debugging#/runtime/this-firefox`
   - 点击"临时载入附加组件"
   - 选择 `extension/manifest.json` 文件
   - 完成安装

### 方式二：从扩展商店安装（待上架）

- Edge 扩展商店：待上架
- Chrome Web Store：待上架

## 🚀 使用方法

### 小窗试卷模式

1. 访问雨课堂小窗试卷页面：
   - `https://www.yuketang.cn/v2/web/studentQuiz/xxxxx`
   - `https://www.yuketang.cn/v/quiz/quiz_info/xxxxx`

2. 页面右侧会自动显示导出面板

3. 确认模式选择为"小窗试卷模式"

4. 点击"一键导出JSON"或"一键导出MD"

5. 文件会自动下载到本地

### 无图试卷模式

1. 访问考试结果页面：
   - `https://examination.xuetangx.com/result/xxxxx`
   - `https://examination.xuetangx.com/exam_room/xxx?exam_id=xxxxx`

2. 页面右侧会自动显示导出面板

3. 确认模式选择为"无图试卷模式"

4. 点击"一键导出MD"或"一键导出JSON"

5. 文件会自动下载到本地

### 开关控制

- 点击扩展图标打开设置面板
- 使用"启用扩展"开关控制扩展的启用/禁用
- 关闭后，导出面板将不再显示

## 📁 项目结构

```
extension/
├── manifest.json      # 扩展配置文件
├── content.js         # 内容脚本（主要功能）
├── popup.html         # 扩展弹窗页面
├── popup.js           # 弹窗逻辑脚本
├── icon16.png         # 16x16 图标
├── icon48.png         # 48x48 图标
├── icon128.png        # 128x128 图标
├── README.md          # 项目说明文档
├── INSTALL.md         # 详细安装指南
└── ICONS.md           # 图标说明
```

## 🛠️ 技术实现

- **Manifest V3**：使用最新的扩展规范
- **Content Script**：在页面中注入功能
- **Chrome Storage API**：用于存储用户配置（如开关状态）
- **Fetch API**：跨域请求（通过host_permissions）
- **原生 JavaScript**：无第三方依赖，轻量高效

## 🔒 隐私与安全

### 数据安全

- ✅ **本地处理**：所有数据处理均在用户本地浏览器中进行
- ✅ **不上传数据**：不会向任何服务器上传数据
- ✅ **不收集信息**：不收集用户的个人信息
- ✅ **权限最小化**：仅请求必要的权限

### 权限说明

- `storage`：用于保存用户的扩展设置（如开关状态）
- `host_permissions`：用于访问雨课堂网站以获取试卷数据

### 安全机制

- 无图试卷模式会检查 `show_answer` 权限
- 仅导出用户有权限查看的内容
- 不会绕过网站的权限控制

## ⚙️ 开发说明

### 环境要求

- Chrome 88+ / Edge 88+ / Firefox 109+
- 现代浏览器（支持 ES6+）

### 本地开发

1. **克隆项目**
   ```bash
   git clone https://github.com/itkdm/yuketang-export.git
   cd yuketang-export/extension
   ```

2. **加载扩展**
   - 按照上面的"安装方法"加载扩展

3. **修改代码**
   - 主要代码在 `content.js` 中
   - 修改后，在扩展管理页面点击"重新加载"

4. **调试**
   - 打开扩展管理页面
   - 找到扩展，点击"检查视图" → "content script"
   - 在控制台中查看日志和调试

### 代码结构

- `content.js`：包含所有核心功能
  - 小窗试卷模式的导出逻辑
  - 无图试卷模式的导出逻辑
  - UI组件和样式
  - 模式检测和切换

- `popup.js`：处理扩展弹窗的逻辑
  - 开关状态管理
  - 与content script通信

### 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 更新日志

### v1.0.0 (2026-01-10)

- ✨ 初始版本发布
- ✨ 支持小窗试卷模式导出
- ✨ 支持无图试卷模式导出
- ✨ 自动模式检测
- ✨ 模式手动切换
- ✨ 扩展开关控制
- ✨ 蓝色科技感UI设计
- ✨ JSON和Markdown格式导出

## ❓ 常见问题

### Q: 扩展没有显示面板？

A: 检查以下几点：
1. 确保在支持的页面（小窗试卷或考试结果页）
2. 确保扩展已启用（检查popup中的开关）
3. 等待页面完全加载（可能需要1-2秒）
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

### Q: 数据安全吗？

A: 
- 所有数据处理在本地完成
- 不会上传任何数据到服务器
- 不会收集用户个人信息
- 完全离线工作

### Q: 支持哪些浏览器？

A: 
- Chrome 88+
- Edge 88+
- Firefox 109+

## 📄 许可证

本项目采用 [MIT License](LICENSE) 许可证。

## 👤 作者

**itkdm**

- GitHub: [@itkdm](https://github.com/itkdm)
- 项目链接: [https://github.com/itkdm/yuketang-export](https://github.com/itkdm/yuketang-export)

## 🙏 致谢

- 感谢雨课堂提供的学习平台
- 感谢所有使用和反馈的用户

## ⚠️ 免责声明

本工具仅供学习交流使用，请遵守相关法律法规和网站使用条款。使用者需自行承担使用本工具的风险和责任。

---

如果这个项目对你有帮助，请给个 ⭐ Star 支持一下！
