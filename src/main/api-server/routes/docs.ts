import { Router } from 'express'

const router = Router()

router.get('/', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.send(DOCS_HTML)
})

export default router

const DOCS_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PC Agent — API Docs & Tester</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'JetBrains Mono',monospace;font-size:13px;background:#fff;color:#000;padding:0}
  .header{background:#000;color:#fff;padding:20px 32px;display:flex;align-items:center;justify-content:space-between}
  .header h1{font-size:20px;font-weight:800;text-transform:uppercase;letter-spacing:3px}
  .header .badge{border:1.5px solid #fff;padding:2px 10px;font-size:10px;font-weight:700;letter-spacing:1px}
  .container{max-width:1100px;margin:0 auto;padding:24px 32px}

  .api-card{border:3px solid #000;box-shadow:5px 5px 0 #000;margin-bottom:24px;background:#fff}
  .api-card-header{background:#000;color:#fff;padding:12px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;user-select:none}
  .api-card-header:hover{background:#222}
  .method{padding:2px 10px;font-size:11px;font-weight:800;letter-spacing:1px;border:1.5px solid #fff}
  .method-post{background:#fff;color:#000}
  .method-get{background:transparent;color:#fff}
  .api-path{font-weight:700;font-size:14px;letter-spacing:1px}
  .api-desc{font-size:11px;color:#999;margin-left:auto}
  .api-card-body{padding:16px;display:none}
  .api-card-body.open{display:block}

  .field{margin-bottom:12px}
  .field label{display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
  .field input,.field textarea,.field select{font-family:'JetBrains Mono',monospace;font-size:12px;padding:8px 12px;border:2px solid #000;width:100%;background:#fff;outline:none}
  .field input:focus,.field textarea:focus,.field select:focus{box-shadow:3px 3px 0 #000}
  .field textarea{min-height:80px;resize:vertical}
  .field .hint{font-size:10px;color:#999;margin-top:2px}

  .row{display:flex;gap:12px}
  .row .field{flex:1}

  .btn{display:inline-flex;align-items:center;gap:6px;padding:10px 20px;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;border:3px solid #000;background:#000;color:#fff;cursor:pointer;box-shadow:3px 3px 0 #000;margin-top:4px}
  .btn:hover{background:#fff;color:#000;box-shadow:5px 5px 0 #000;transform:translate(-1px,-1px)}
  .btn:active{box-shadow:1px 1px 0 #000;transform:translate(2px,2px)}

  .response-area{margin-top:12px;border:2px solid #000;background:#f5f5f5;max-height:300px;overflow:auto;display:none}
  .response-area.show{display:block}
  .response-header{background:#000;color:#fff;padding:6px 12px;font-size:11px;font-weight:700;display:flex;justify-content:space-between}
  .response-body{padding:12px;font-size:12px;white-space:pre-wrap;word-break:break-all}
  .response-body.error{color:#c00}

  .section-title{font-size:16px;font-weight:800;text-transform:uppercase;letter-spacing:2px;margin:32px 0 16px;padding-bottom:8px;border-bottom:3px solid #000}

  .quick-ref{border:2px solid #000;padding:16px;margin-bottom:24px;font-size:12px}
  .quick-ref h3{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
  .quick-ref code{background:#f5f5f5;padding:1px 4px;border:1px solid #ddd;font-size:11px}
  .quick-ref table{width:100%;border-collapse:collapse;margin-top:8px}
  .quick-ref th{background:#000;color:#fff;padding:6px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1px}
  .quick-ref td{padding:6px 10px;border-bottom:1px solid #e5e5e5;font-size:11px}
</style>
</head>
<body>
<div class="header">
  <h1>PC Agent API</h1>
  <span class="badge">INTERACTIVE DOCS</span>
</div>

<div class="container">

<div class="quick-ref">
  <h3>Base URL</h3>
  <p><code>http://127.0.0.1:18677</code> &nbsp; | &nbsp; All POST endpoints accept <code>Content-Type: application/json</code></p>
</div>

<!-- ═══ STATUS ═══ -->
<div class="section-title">System</div>

<div class="api-card">
  <div class="api-card-header" onclick="toggle(this)">
    <span class="method method-get">GET</span>
    <span class="api-path">/api/status</span>
    <span class="api-desc">系统状态 / System status</span>
  </div>
  <div class="api-card-body">
    <p style="margin-bottom:12px;color:#555;font-size:12px">获取应用运行状态、系统信息、监控器状态、统计数据</p>
    <button class="btn" onclick="sendReq(this,'GET','/api/status')">SEND REQUEST</button>
    <div class="response-area"><div class="response-header"><span>Response</span><span class="status-code"></span></div><div class="response-body"></div></div>
  </div>
</div>

<!-- ═══ ACTIONS ═══ -->
<div class="section-title">Actions</div>

<!-- Notification -->
<div class="api-card">
  <div class="api-card-header" onclick="toggle(this)">
    <span class="method method-post">POST</span>
    <span class="api-path">/api/actions/notification</span>
    <span class="api-desc">系统通知 / Notification</span>
  </div>
  <div class="api-card-body">
    <div class="row">
      <div class="field"><label>title *</label><input type="text" id="notif-title" value="PC Agent 测试" /></div>
      <div class="field"><label>body *</label><input type="text" id="notif-body" value="这是一条测试通知" /></div>
    </div>
    <button class="btn" onclick="sendReq(this,'POST','/api/actions/notification',{title:v('notif-title'),body:v('notif-body')})">SEND</button>
    <div class="response-area"><div class="response-header"><span>Response</span><span class="status-code"></span></div><div class="response-body"></div></div>
  </div>
</div>

<!-- Dialog -->
<div class="api-card">
  <div class="api-card-header" onclick="toggle(this)">
    <span class="method method-post">POST</span>
    <span class="api-path">/api/actions/dialog</span>
    <span class="api-desc">弹窗对话框 / Dialog</span>
  </div>
  <div class="api-card-body">
    <div class="row">
      <div class="field"><label>type</label>
        <select id="dialog-type"><option>info</option><option>warning</option><option>error</option><option>question</option></select>
      </div>
      <div class="field"><label>title *</label><input type="text" id="dialog-title" value="确认操作" /></div>
    </div>
    <div class="field"><label>message *</label><input type="text" id="dialog-msg" value="你确定要执行此操作吗？" /></div>
    <div class="field"><label>detail</label><input type="text" id="dialog-detail" value="" placeholder="可选的详细说明" /></div>
    <div class="field"><label>buttons (逗号分隔)</label><input type="text" id="dialog-btns" value="确定,取消" /><div class="hint">留空默认 OK</div></div>
    <div class="row">
      <div class="field"><label>position</label>
        <select id="dialog-position">
          <option value="">(默认 / Default)</option>
          <option value="top-left">top-left</option>
          <option value="top-center">top-center</option>
          <option value="top-right">top-right</option>
          <option value="center-left">center-left</option>
          <option value="center">center</option>
          <option value="center-right">center-right</option>
          <option value="bottom-left">bottom-left</option>
          <option value="bottom-center">bottom-center</option>
          <option value="bottom-right">bottom-right</option>
        </select>
        <div class="hint">九宫格位置 / 9-grid position</div>
      </div>
      <div class="field"><label>width</label><input type="number" id="dialog-width" value="420" /><div class="hint">弹窗宽度 px</div></div>
      <div class="field"><label>height</label><input type="number" id="dialog-height" value="260" /><div class="hint">弹窗高度 px</div></div>
    </div>
    <div class="field" style="display:flex;align-items:center;gap:8px"><label style="margin:0">alwaysOnTop</label><input type="checkbox" id="dialog-ontop" style="width:auto" /><span class="hint">持续置顶 / Always on top</span></div>
    <button class="btn" onclick="sendDialog(this)">SEND</button>
    <div class="response-area"><div class="response-header"><span>Response</span><span class="status-code"></span></div><div class="response-body"></div></div>
  </div>
</div>

<!-- Clipboard -->
<div class="api-card">
  <div class="api-card-header" onclick="toggle(this)">
    <span class="method method-post">POST</span>
    <span class="api-path">/api/actions/clipboard</span>
    <span class="api-desc">写入剪贴板 / Clipboard write</span>
  </div>
  <div class="api-card-body">
    <div class="row">
      <div class="field"><label>type</label>
        <select id="clip-type"><option>text</option><option>image</option></select>
        <div class="hint">image 时 content 需为 base64 PNG</div>
      </div>
    </div>
    <div class="field"><label>content *</label><textarea id="clip-content">Hello from PC Agent API!</textarea></div>
    <button class="btn" onclick="sendReq(this,'POST','/api/actions/clipboard',{type:v('clip-type'),content:v('clip-content')})">SEND</button>
    <div class="response-area"><div class="response-header"><span>Response</span><span class="status-code"></span></div><div class="response-body"></div></div>
  </div>
</div>

<!-- Shell Open -->
<div class="api-card">
  <div class="api-card-header" onclick="toggle(this)">
    <span class="method method-post">POST</span>
    <span class="api-path">/api/actions/shell-open</span>
    <span class="api-desc">打开 URL/文件 / Shell open</span>
  </div>
  <div class="api-card-body">
    <div class="field"><label>target *</label><input type="text" id="shell-target" value="https://github.com" /><div class="hint">URL 或本地文件路径</div></div>
    <button class="btn" onclick="sendReq(this,'POST','/api/actions/shell-open',{target:v('shell-target')})">SEND</button>
    <div class="response-area"><div class="response-header"><span>Response</span><span class="status-code"></span></div><div class="response-body"></div></div>
  </div>
</div>

<!-- Screenshot -->
<div class="api-card">
  <div class="api-card-header" onclick="toggle(this)">
    <span class="method method-post">POST</span>
    <span class="api-path">/api/actions/screenshot</span>
    <span class="api-desc">截图 / Screenshot</span>
  </div>
  <div class="api-card-body">
    <p style="margin-bottom:12px;color:#555;font-size:12px">截取当前屏幕，返回 base64 PNG 图片</p>
    <button class="btn" onclick="sendScreenshot(this)">SEND</button>
    <div class="response-area"><div class="response-header"><span>Response</span><span class="status-code"></span></div><div class="response-body"></div></div>
    <div style="margin-top:12px;display:none" class="screenshot-preview"><img style="max-width:100%;border:2px solid #000" /></div>
  </div>
</div>

<!-- TTS -->
<div class="api-card">
  <div class="api-card-header" onclick="toggle(this)">
    <span class="method method-post">POST</span>
    <span class="api-path">/api/actions/tts</span>
    <span class="api-desc">文字转语音 / Text-to-Speech</span>
  </div>
  <div class="api-card-body">
    <div class="field"><label>text *</label><input type="text" id="tts-text" value="你好，这是PC Agent语音测试" /></div>
    <div class="row">
      <div class="field"><label>rate</label><input type="number" id="tts-rate" value="1.0" step="0.1" min="0.1" max="3.0" /><div class="hint">语速 0.1~3.0</div></div>
      <div class="field"><label>voice</label><input type="text" id="tts-voice" value="" placeholder="留空=默认" /></div>
    </div>
    <button class="btn" onclick="sendReq(this,'POST','/api/actions/tts',{text:v('tts-text'),rate:parseFloat(v('tts-rate'))||1.0,voice:v('tts-voice')||undefined})">SEND</button>
    <div class="response-area"><div class="response-header"><span>Response</span><span class="status-code"></span></div><div class="response-body"></div></div>
  </div>
</div>

<!-- ═══ BROWSER ═══ -->
<div class="section-title">Browser Extension</div>

<!-- Browser Command -->
<div class="api-card">
  <div class="api-card-header" onclick="toggle(this)">
    <span class="method method-post">POST</span>
    <span class="api-path">/api/browser/command</span>
    <span class="api-desc">发送浏览器指令 / Browser command</span>
  </div>
  <div class="api-card-body">
    <div class="field"><label>type *</label>
      <select id="br-type">
        <option value="open-tab">open-tab</option>
        <option value="close-tab">close-tab</option>
        <option value="navigate">navigate</option>
        <option value="get-page-info">get-page-info</option>
        <option value="get-tabs">get-tabs</option>
        <option value="execute-script">execute-script</option>
        <option value="get-selection">get-selection</option>
        <option value="screenshot">screenshot</option>
      </select>
    </div>
    <div class="field"><label>data (JSON)</label><textarea id="br-data">{"url": "https://example.com"}</textarea><div class="hint">JSON 格式的指令参数</div></div>
    <button class="btn" onclick="sendBrowserCmd(this)">SEND</button>
    <div class="response-area"><div class="response-header"><span>Response</span><span class="status-code"></span></div><div class="response-body"></div></div>
  </div>
</div>

<!-- Browser Commands Queue -->
<div class="api-card">
  <div class="api-card-header" onclick="toggle(this)">
    <span class="method method-get">GET</span>
    <span class="api-path">/api/browser/commands</span>
    <span class="api-desc">查看待执行指令队列 / Pending commands</span>
  </div>
  <div class="api-card-body">
    <button class="btn" onclick="sendReq(this,'GET','/api/browser/commands')">SEND</button>
    <div class="response-area"><div class="response-header"><span>Response</span><span class="status-code"></span></div><div class="response-body"></div></div>
  </div>
</div>

<!-- ═══ n8n Polling Reference ═══ -->
<div class="section-title">Polling Protocol (n8n 集成)</div>
<div class="quick-ref">
  <h3>轮询响应格式 (外部服务需返回)</h3>
  <table>
    <tr><th>字段</th><th>类型</th><th>说明</th></tr>
    <tr><td>commands</td><td>Array</td><td>指令数组，空数组=无指令</td></tr>
    <tr><td>commands[].action</td><td>String</td><td>notification | dialog | clipboard | shell-open | screenshot | tts</td></tr>
    <tr><td>commands[].data</td><td>Object</td><td>对应 action 的参数</td></tr>
  </table>
  <div style="margin-top:12px">
    <p><strong>示例响应：</strong></p>
    <pre style="background:#f5f5f5;border:1px solid #ddd;padding:8px;margin-top:4px;font-size:11px">{
  "commands": [
    { "action": "notification", "data": { "title": "Hello", "body": "From n8n" } },
    { "action": "tts", "data": { "text": "任务完成" } }
  ]
}</pre>
  </div>
</div>

</div><!-- /container -->

<script>
function v(id){return document.getElementById(id).value}
function toggle(header){header.nextElementSibling.classList.toggle('open')}

async function sendReq(btn,method,path,body){
  const card=btn.closest('.api-card-body');
  const area=card.querySelector('.response-area');
  const statusEl=area.querySelector('.status-code');
  const bodyEl=area.querySelector('.response-body');
  area.classList.add('show');
  bodyEl.textContent='Loading...';
  bodyEl.classList.remove('error');
  statusEl.textContent='';
  try{
    const opts={method,headers:{'Content-Type':'application/json'}};
    if(body)opts.body=JSON.stringify(body);
    const res=await fetch(path,opts);
    statusEl.textContent=res.status+' '+res.statusText;
    const data=await res.json();
    bodyEl.textContent=JSON.stringify(data,null,2);
    if(!res.ok)bodyEl.classList.add('error');
  }catch(e){
    statusEl.textContent='ERROR';
    bodyEl.textContent=e.message;
    bodyEl.classList.add('error');
  }
}

async function sendScreenshot(btn){
  const card=btn.closest('.api-card-body');
  const area=card.querySelector('.response-area');
  const statusEl=area.querySelector('.status-code');
  const bodyEl=area.querySelector('.response-body');
  const preview=card.querySelector('.screenshot-preview');
  area.classList.add('show');
  bodyEl.textContent='Capturing...';
  statusEl.textContent='';
  preview.style.display='none';
  try{
    const res=await fetch('/api/actions/screenshot',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
    statusEl.textContent=res.status+' '+res.statusText;
    const data=await res.json();
    if(data.image){
      bodyEl.textContent='{ "success": true, "image": "[base64 '+data.image.length+' chars]" }';
      preview.style.display='block';
      preview.querySelector('img').src='data:image/png;base64,'+data.image;
    }else{
      bodyEl.textContent=JSON.stringify(data,null,2);
    }
  }catch(e){
    statusEl.textContent='ERROR';
    bodyEl.textContent=e.message;
    bodyEl.classList.add('error');
  }
}

async function sendBrowserCmd(btn){
  const card=btn.closest('.api-card-body');
  let data;
  try{data=JSON.parse(v('br-data'));}catch{data={};}
  sendReq(btn,'POST','/api/browser/command',{type:v('br-type'),data});
}

function sendDialog(btn){
  const body={type:v('dialog-type'),title:v('dialog-title'),message:v('dialog-msg')};
  const detail=v('dialog-detail');if(detail)body.detail=detail;
  const btns=v('dialog-btns');if(btns)body.buttons=btns.split(',');
  const pos=v('dialog-position');if(pos)body.position=pos;
  const w=parseInt(v('dialog-width'));if(w&&w!==420)body.width=w;
  const h=parseInt(v('dialog-height'));if(h&&h!==260)body.height=h;
  if(document.getElementById('dialog-ontop').checked)body.alwaysOnTop=true;
  sendReq(btn,'POST','/api/actions/dialog',body);
}
</script>
</body>
</html>`
