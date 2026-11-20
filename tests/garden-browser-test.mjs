import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir,mkdtemp} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createServer} from 'node:http';

const cwd=process.cwd(), dist=resolve(cwd,'dist');
const out=resolve(cwd,'output/garden-qa');
const miss=process.argv.includes('--missing-model');
await mkdir(out,{recursive:true});
const profile=await mkdtemp(resolve(out,'chrome-'));
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.glb':'model/gltf-binary'};
const server=createServer(async(req,res)=>{
 try{let path=new URL(req.url,'http://127.0.0.1').pathname;if(path.endsWith('/'))path+='index.html';if(miss&&path.endsWith('.glb')){res.writeHead(404).end();return;}const p=resolve(dist,'.'+path);if(!p.startsWith(dist+'/'))throw Error();res.setHeader('Content-Type',types[extname(p)]??'application/octet-stream');res.end(await readFile(p));}catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const port=server.address().port;
const chromePath=process.env.GONGAN_CHROME??'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const c=spawn(chromePath,['--headless','--disable-background-networking','--disable-default-apps','--no-first-run','--disable-component-update','--remote-debugging-port=0','--remote-debugging-address=127.0.0.1','--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function wait(f,msg){for(let i=0;i<100;i++){let v;try{v=await f()}catch{}if(v)return v;await sleep(150)}throw Error(msg);}
let ws;
try{
 const cport=Number((await wait(()=>readFile(resolve(profile,'DevToolsActivePort'),'utf8'),'no Chrome debugger')).split('\n')[0]);
 const targets=await (await fetch('http://127.0.0.1:'+cport+'/json/list')).json();
 ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
 await new Promise((r,e)=>{ws.addEventListener('open',r,{once:true});ws.addEventListener('error',e,{once:true});});
 let id=0;const pending=new Map();
 ws.addEventListener('message',e=>{let m=JSON.parse(e.data);if(pending.has(m.id)){const [r,j]=pending.get(m.id);pending.delete(m.id);m.error?j(m.error):r(m.result);}});
 const send=(method,params={})=>new Promise((r,j)=>{pending.set(++id,[r,j]);ws.send(JSON.stringify({id,method,params}));});
 const ev=async expression=>(await send('Runtime.evaluate',{expression,returnByValue:true})).result.value;
 await send('Page.enable');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await send('Page.navigate',{url:'http://127.0.0.1:'+port+'/garden/'});
 const state=await wait(()=>ev("document.querySelector('.garden')?.dataset.render"),'garden did not settle');
 const diag=await ev("({width:innerWidth,scroll:document.documentElement.scrollWidth,canvas:document.querySelector('canvas')?.width??0,label:document.querySelector('#garden-status').textContent})");
 console.log(JSON.stringify({state,...diag}));
 assert.equal(diag.width,390);
 assert.equal(diag.scroll,390);
 assert.equal(state,miss?'fallback':'webgl');
 const shot=await send('Page.captureScreenshot',{format:'png'});
 await writeFile(resolve(out,miss?'garden-fallback-390.png':'garden-webgl-390.png'),Buffer.from(shot.data,'base64'));
 if(!miss){
  assert.ok(diag.canvas>0);
  assert.equal(await ev("(()=>{const b=document.querySelector('#garden-motion');if(b.hidden||b.getAttribute('aria-pressed')!=='false')return false;b.click();const ok=b.getAttribute('aria-pressed')==='true';b.click();return ok&&b.getAttribute('aria-pressed')==='false'})()"),true);
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await wait(()=>ev("document.querySelector('#garden-motion').hidden"),'reduced motion did not hide control');
 }
 console.log('PASS: 390px real Chromium render, no overflow'+(miss?', missing model uses static fallback':', motion toggle and reduced-motion preference'));
}finally{ws?.close();c.kill();server.close();}
