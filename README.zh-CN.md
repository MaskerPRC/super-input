# PC Agent

English | [English](README.md)

> 桌面系统监控与控制代理 — 黑白新粗野主义风格

PC Agent 是一个基于 Electron 的桌面代理应用，用于监控 PC 系统事件并通过本地 REST API 触发各种操作。支持与 n8n 等自动化平台集成，实现 PC 端的远程控制与事件推送。

![Dashboard](docs/images/dashboard.png)

---

## 功能特性

### 系统监控器

| 监控器 | 说明 |
|--------|------|
| **剪贴板** | 文字、图片、文件变化监听，可配置类型和大小过滤 |
| **窗口** | 活动窗口追踪（窗口标题、进程名） |
| **电源** | 开机、休眠、唤醒、关机 |
| **锁屏** | 锁屏 / 解锁检测 |
| **USB** | 设备插拔检测 |
| **网络** | 连接状态与 IP 变化 |
| **空闲** | 系统空闲检测 |

### 本地 REST API

内置 Express 服务器，监听 `127.0.0.1:18677`，提供交互式文档 `/api/docs`。

| 接口 | 功能 |
|------|------|
| `POST /api/actions/notification` | 系统通知 |
| `POST /api/actions/dialog` | 自定义弹窗（九宫格定位、持续置顶） |
| `POST /api/actions/clipboard` | 写入剪贴板 |
| `POST /api/actions/shell-open` | 打开 URL / 文件 |
| `POST /api/actions/screenshot` | 屏幕截图（返回 base64 PNG） |
| `POST /api/actions/tts` | 文字转语音 |
| `GET /api/status` | 系统与监控器状态 |
| `POST /api/browser/command` | 浏览器扩展指令 |

### 轮询引擎

轮询外部服务获取待执行指令，通过本地 API 执行。适用于 n8n Webhook 集成 — 无需开放入站端口。

### 浏览器扩展

Chrome Manifest V3 扩展，支持双向浏览器控制：打开/关闭标签页、导航、执行脚本、获取页面信息、截图等。

### 中英双语

完整的中文/英文界面支持，可在设置中切换。

---

## 界面截图

<table>
<tr>
<td><img src="docs/images/dashboard.png" alt="仪表盘" /></td>
<td><img src="docs/images/event-log.png" alt="事件日志" /></td>
</tr>
<tr>
<td align="center"><b>仪表盘</b> — 统计数据、监控状态、实时事件</td>
<td align="center"><b>事件日志</b> — 可筛选的事件历史</td>
</tr>
<tr>
<td><img src="docs/images/settings-language.png" alt="设置 - 语言与API" /></td>
<td><img src="docs/images/settings-monitors.png" alt="设置 - 监控器" /></td>
</tr>
<tr>
<td align="center"><b>设置</b> — 语言、外部 API 配置</td>
<td align="center"><b>设置</b> — API 服务、监控器开关</td>
</tr>
<tr>
<td><img src="docs/images/settings-clipboard.png" alt="设置 - 剪贴板" /></td>
<td><img src="docs/images/api-docs.png" alt="API 文档" /></td>
</tr>
<tr>
<td align="center"><b>设置</b> — 剪贴板过滤、日志维护</td>
<td align="center"><b>API 文档</b> — 交互式测试页面</td>
</tr>
<tr>
<td colspan="2"><img src="docs/images/api-dialog-test.png" alt="弹窗API测试" /></td>
</tr>
<tr>
<td colspan="2" align="center"><b>弹窗 API</b> — 自定义新粗野风格弹窗，支持九宫格定位</td>
</tr>
</table>

---

## 快速开始

### 环境要求

- Node.js >= 20
- npm

### 安装与开发

```bash
npm install
npm run dev
```

### 构建

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

---

## API 使用

### 基础地址

```
http://127.0.0.1:18677
```

所有 POST 接口接受 `Content-Type: application/json`。

### 发送通知

```bash
curl -X POST http://127.0.0.1:18677/api/actions/notification \
  -H "Content-Type: application/json" \
  -d '{"title": "你好", "body": "来自 PC Agent"}'
```

### 弹窗（支持定位与置顶）

```bash
curl -X POST http://127.0.0.1:18677/api/actions/dialog \
  -H "Content-Type: application/json" \
  -d '{
    "type": "info",
    "title": "提醒",
    "message": "任务已完成",
    "buttons": ["确定", "取消"],
    "position": "bottom-right",
    "alwaysOnTop": true
  }'
```

**position 可选值：** `top-left` `top-center` `top-right` `center-left` `center` `center-right` `bottom-left` `bottom-center` `bottom-right`

### 屏幕截图

```bash
curl -X POST http://127.0.0.1:18677/api/actions/screenshot \
  -H "Content-Type: application/json" -d '{}'
```

### 文字转语音

```bash
curl -X POST http://127.0.0.1:18677/api/actions/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "你好世界", "rate": 1.0}'
```

### 交互式文档

在浏览器中打开 `http://127.0.0.1:18677/api/docs` 即可使用完整的 API 交互测试页面。

---

## n8n 集成

PC Agent 采用轮询模式集成 — 应用主动轮询你的 n8n Webhook 获取指令，无需开放入站端口。

### 轮询响应格式

外部服务需返回以下格式：

```json
{
  "commands": [
    { "action": "notification", "data": { "title": "你好", "body": "来自 n8n" } },
    { "action": "tts", "data": { "text": "任务完成" } }
  ]
}
```

完整的 n8n 工作流示例见 [examples/](examples/) 目录。

---

## 浏览器扩展

1. 打开 `chrome://extensions/` → 启用开发者模式
2. 点击「加载已解压的扩展程序」→ 选择 `browser-extension/` 文件夹
3. 扩展会自动连接 `127.0.0.1:18677`

支持的指令：`open-tab` `close-tab` `navigate` `get-page-info` `get-tabs` `execute-script` `get-selection` `screenshot`

---

## 发布

通过 GitHub Actions 自动构建，推送版本标签即可触发：

```bash
git tag v1.0.0
git push origin v1.0.0
```

自动构建 Windows (.exe)、macOS (.dmg)、Linux (.AppImage, .deb)，并创建 GitHub Release 附带所有安装包。

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Electron 33 + electron-vite |
| 前端 | Vue 3 (Composition API) + Vue Router |
| 后端 | Express 4 (本地 API 服务) |
| 数据库 | SQLite (better-sqlite3, WAL 模式) |
| 语言 | TypeScript |
| 主题 | 新粗野主义（黑白配色、3px 粗边框、硬阴影、等宽字体） |
| 构建 | electron-builder |

## 开源协议

MIT
