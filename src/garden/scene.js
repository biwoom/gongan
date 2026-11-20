import {WebGLRenderer, Scene, PerspectiveCamera, Color, Fog, HemisphereLight, DirectionalLight, SRGBColorSpace, ACESFilmicToneMapping, Vector3} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const garden=document.querySelector('.garden');
const viewport=garden.querySelector('.viewport');
const status=document.querySelector('#garden-status');
const button=document.querySelector('#garden-motion');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let renderer, camera, world, motion=false, ready=false, frame=0, motionStart=0, progress=0, startProgress=0, contextLost=false;
const home=new Vector3();
const target=new Vector3(.70,4.9,-19);
const ray=new Vector3();
function size(){
  if(!renderer||!camera)return;
  const w=Math.max(1,viewport.clientWidth),h=Math.max(1,viewport.clientHeight);
  camera.aspect=w/h;
  camera.fov=camera.aspect<.7?70:camera.aspect<1?61:48;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
  renderer.setSize(w,h,false);
  if(ready)renderer.render(world,camera);
}
function tick(now){
  if(!motion||document.hidden||reduced.matches)return;
  const t=Math.min(1,startProgress+(now-motionStart)/12000);
  progress=t;
  const a=(1-Math.cos(t*Math.PI))/2;
  camera.position.copy(home).addScaledVector(ray,a*.95);
  camera.lookAt(target);
  renderer.render(world,camera);
  if(t<1)frame=requestAnimationFrame(tick);else{motion=false;sync();button.hidden=true;}
}
function sync(){button.textContent=motion?'움직임 멈추기':'천천히 바라보기';button.setAttribute('aria-pressed',String(motion));}
function stop(){motion=false;cancelAnimationFrame(frame);sync();}
function fallback(message){
  stop();ready=false;button.hidden=true;
  renderer?.domElement.remove();
  status.textContent=message;
  garden.dataset.render='fallback';
}
async function start(){
  try{
    renderer=new WebGLRenderer({antialias:true,powerPreference:'low-power',alpha:false});
    renderer.outputColorSpace=SRGBColorSpace;
    renderer.toneMapping=ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.16;
    renderer.domElement.style.visibility='hidden';
    viewport.append(renderer.domElement);
    renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;fallback('이 기기에서는 정원 그림으로 보여드려요.');});
    world=new Scene();
    world.background=new Color('#8eb8c6');
    world.fog=new Fog('#8eb8c6',26,110);
    world.add(new HemisphereLight('#d6f2f0','#436969',1.8));
    const sun=new DirectionalLight('#fff2d5',2.0);sun.position.set(10,15,6);world.add(sun);
    const gltf=await new GLTFLoader().loadAsync(garden.dataset.model);
    if(contextLost)return;
    world.add(gltf.scene);
    world.updateMatrixWorld(true);
    const authored=gltf.cameras.find(c=>c.name==='Garden_Camera'&&c.isPerspectiveCamera);
    camera=new PerspectiveCamera(58,1,.1,180);
    if(authored){authored.getWorldPosition(camera.position);authored.getWorldQuaternion(camera.quaternion);camera.getWorldDirection(ray);target.copy(camera.position).addScaledVector(ray,25);}
    else{camera.position.set(0,2.65,7.7);camera.lookAt(target);camera.getWorldDirection(ray);}
    home.copy(camera.position);
    ready=true;
    size();
    renderer.domElement.style.visibility='visible';
    garden.dataset.render='webgl';
    status.textContent='';
    button.hidden=reduced.matches;
    const ro=new ResizeObserver(size);ro.observe(viewport);
  }catch(e){console.info('Garden preview uses static presentation:',e.message);fallback('이 기기에서는 정원 그림으로 보여드려요.');}
}
button.addEventListener('click',()=>{if(!ready||reduced.matches)return;if(motion){stop();return;}if(progress>=1)return;startProgress=progress;motion=true;motionStart=performance.now();sync();frame=requestAnimationFrame(tick);});
reduced.addEventListener('change',()=>{if(reduced.matches)stop();button.hidden=!ready||reduced.matches||progress>=1;});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
window.addEventListener('pagehide',stop);
start();
