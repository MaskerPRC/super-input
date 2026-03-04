# n8n + PC Agent 集成指南

## 快速开始

1. 在 n8n 中导入 `n8n-pc-agent-workflow.json`
2. 激活 workflow
3. 在 PC Agent 设置页配置：
   - **推送端点 URL**: `http://your-n8n-host:5678/webhook/pc-agent/events`
   - **轮询端点 URL**: `http://your-n8n-host:5678/webhook/pc-agent/commands`
   - **轮询间隔**: `5000` (5秒)
   - **启用轮询**: 开启

## Workflow 结构

### 1. 轮询指令接口 (GET /webhook/pc-agent/commands)

PC Agent 定时请求此接口获取待执行指令。

**响应格式:**

```json
{
  "commands": [
    {
      "action": "notification",
      "data": { "title": "标题", "body": "内容" }
    },
    {
      "action": "dialog",
      "data": { "type": "info", "title": "提示", "message": "消息内容" }
    }
  ]
}
```

返回空数组 `{ "commands": [] }` 表示无指令。

### 2. 事件接收接口 (POST /webhook/pc-agent/events)

PC Agent 检测到系统事件时 POST 到此接口。

**请求体示例:**

```json
{
  "event_type": "clipboard",
  "event_data": {
    "content_type": "text",
    "content": "复制的文字内容",
    "length": 12,
    "hash": "abc123"
  },
  "timestamp": "2026-03-05T12:00:00.000Z"
}
```

## 可用的 action 指令类型

| action | data 字段 | 说明 |
|--------|----------|------|
| `notification` | `{ title, body, icon? }` | 系统通知 |
| `dialog` | `{ type, title, message, buttons?, detail? }` | 弹窗对话框 |
| `clipboard` | `{ type:'text'\|'image', content }` | 写入剪贴板 |
| `shell-open` | `{ target }` | 打开 URL 或文件 |
| `screenshot` | `{ fullscreen?: boolean }` | 截图 (返回 base64) |
| `tts` | `{ text, rate?, voice? }` | 文字转语音 |

## 各指令 data 示例

```json
// 通知
{ "action": "notification", "data": { "title": "新消息", "body": "你有一条新消息" } }

// 弹窗
{ "action": "dialog", "data": { "type": "question", "title": "确认", "message": "确定要执行吗？", "buttons": ["确定", "取消"] } }

// 写入剪贴板
{ "action": "clipboard", "data": { "type": "text", "content": "写入到剪贴板的文字" } }

// 打开网页
{ "action": "shell-open", "data": { "target": "https://example.com" } }

// 截图
{ "action": "screenshot", "data": {} }

// 语音播报
{ "action": "tts", "data": { "text": "你好，这是语音播报测试" } }
```

## 事件类型 (event_type)

| event_type | 说明 |
|-----------|------|
| `clipboard` | 剪贴板变化 (文字/图片/文件) |
| `window` | 活动窗口切换 |
| `power` | 电源事件 (开机/休眠/唤醒/关机) |
| `lock` | 锁屏/解锁 |
| `usb` | USB 设备插拔 |
| `network` | 网络连接/IP 变化 |
| `idle` | 系统空闲/活跃 |
| `browser` | 浏览器扩展上报 |
