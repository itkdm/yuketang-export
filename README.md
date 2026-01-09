## 布吉岛雨课堂导出工具 - 总览

雨课堂试卷导出合集，包含 **浏览器扩展（Manifest v3）** 与 **独立用户脚本** 两种形态。支持：
- 小窗试卷（iframe 题）导出
- 无图试卷（正常试卷）导出
- 双格式导出：Markdown / JSON
- 面板开关、模式自动检测、蓝色科技感 UI

---

### 目录结构
- `extension/`：浏览器扩展源码（推荐给大多数用户）
  - `manifest.json`、`content.js`、`popup.*` 等
  - 详细说明：`extension/README.md`
- `userscripts/`：用户脚本版本
  - `布吉岛雨课堂导出工具 - 小窗试卷版.md`
  - `布吉岛雨课堂导出工具 - 无图试卷版.md`
  - 说明：`userscripts/README.md`
- `test/`：调试/样例数据

---

### 快速使用
- **浏览器扩展（推荐）**
  1) 打开 `chrome://extensions` 或 `edge://extensions`  
  2) 打开“开发者模式”  
  3) “加载已解压的扩展程序” → 选择 `extension/`
  4) 页面右侧会出现导出面板，开关可在弹出层控制

- **用户脚本**
  1) 安装 Tampermonkey / Violentmonkey  
  2) 新建脚本，复制对应 `.md` 中的内容保存  
  3) 访问对应页面即可看到导出按钮

---

### 特色亮点
- 自动检测页面类型，自动切换模式
- 两个导出格式：Markdown / JSON
- 仅导出你有权限看到的题目与答案
- UI：蓝色科技感卡片，右侧居中浮动，带开关
- SPA 兼容：监听 URL 变化重新挂载面板

---

### 常见问答
- **为什么有两个模式？** 小窗试卷（iframe）与无图试卷接口不同，需分开处理。  
- **数据是否上传？** 全部在本地处理，不会上传到服务器。

---

### 开发者信息
- 作者：布吉岛 / itkdm
- 仓库：`https://github.com/itkdm/yuketang-export`


