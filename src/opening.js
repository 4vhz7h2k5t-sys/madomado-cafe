import { gsap } from 'gsap';
import './opening.css';

const VERTEX = `attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;
const FRAGMENT = `precision highp float;
varying vec2 uv;uniform sampler2D portrait;uniform sampler2D closed;uniform sampler2D wink;
uniform vec2 fit;uniform float time,blink,winking,enter,tilt,lookX,lookY;
float bell(vec2 p,vec2 c,vec2 r){vec2 d=(p-c)/r;return exp(-dot(d,d)*2.);}
float eye(vec2 p,vec2 c){return 1.-smoothstep(.70,1.,length((p-c)/vec2(.095,.102)));}
void main(){
 vec2 q=(vec2(uv.x,1.-uv.y)-.5)*fit*.985+.5;
 float head=1.-smoothstep(.57,.78,q.y);
 vec2 pivot=vec2(.5,.61);vec2 d=q-pivot;
 q+=vec2(-d.y,d.x)*(tilt+lookX*.008)*head;
 q.y+=(1.-enter)*.035*head;
 q.x-=lookX*.003*head;q.y-=lookY*.002*head;
 q.y+=sin(time*2.0)*.0018*bell(q,vec2(.5,.78),vec2(.43,.3));
 q.x+=(q.x-.5)*sin(time*2.)*.0018;
 q.y+=sin(time*2.7+.3)*.0023*bell(q,vec2(.21,.15),vec2(.18,.22));
 q.y+=sin(time*2.3+1.)*.0021*bell(q,vec2(.81,.14),vec2(.18,.23));
 q.y+=sin(time*2.5)*.0020*bell(q,vec2(.19,.78),vec2(.13,.16));
 q.y+=sin(time*2.5+1.)*.0020*bell(q,vec2(.84,.78),vec2(.13,.16));
 vec2 left=vec2(.373,.490),right=vec2(.633,.477);
 float lm=eye(q,left),rm=eye(q,right);float rb=max(blink,winking);
 vec2 openUV=q;
 openUV.y+=(q.y-left.y)*blink*lm*.6+(q.y-right.y)*rb*rm*.6;
 openUV.x-=lookX*.0025*(lm+rm);
 vec4 base=texture2D(portrait,clamp(openUV,0.,1.));
 vec4 shut=texture2D(closed,clamp(q,0.,1.));
 vec4 smile=texture2D(wink,clamp(q,0.,1.));
 base=mix(base,shut,lm*smoothstep(.12,.82,blink));
 vec4 rightClosed=mix(smile,shut,smoothstep(.15,.85,blink));
 base=mix(base,rightClosed,rm*smoothstep(.12,.82,rb));
 float inside=step(0.,q.x)*step(q.x,1.)*step(0.,q.y)*step(q.y,1.);
 // Continue only the photograph's neutral studio ground outside its image bounds.
 vec3 ground=texture2D(portrait,vec2(.018,clamp(q.y,0.,1.))).rgb;
 gl_FragColor=vec4(mix(ground,base.rgb,inside),1.);
}`;

export async function mountOpening() {
  const query = new URLSearchParams(location.search);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const key = 'madomado-welcome-v1';
  let seen = false;
  try { seen = sessionStorage.getItem(key) === 'seen'; } catch { /* Optional storage. */ }
  if (reduce.matches || query.get('motion') === 'reduce' || query.get('opening') === 'off' || location.hash || scrollY > 4 || (seen && query.get('opening') !== 'preview')) return;

  const overlay = document.createElement('div');
  overlay.className = 'mm-opening';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'madomado cafeへようこそ');
  overlay.innerHTML = `<button class="mm-opening-skip" type="button" aria-label="オープニングをスキップ"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="m7 5 10 7-10 7Z"/><path d="M19 5v14"/></svg></button><div class="mm-opening-frame"><div class="mm-opening-viewport"><canvas class="mm-opening-canvas" aria-hidden="true"></canvas><span class="mm-opening-reflection" aria-hidden="true"></span><span class="mm-opening-sill" aria-hidden="true"></span></div></div><span class="mm-opening-welcome">WELCOME!</span><span class="mm-opening-light" aria-hidden="true"></span>`;
  const canvas = overlay.querySelector('canvas');
  const frame = overlay.querySelector('.mm-opening-frame');
  const welcome = overlay.querySelector('.mm-opening-welcome');
  const viewport = overlay.querySelector('.mm-opening-viewport');
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
  if (!gl) return;
  const previousFocus = document.activeElement;
  const inertState = [...document.body.children].filter(el => el instanceof HTMLElement && !['SCRIPT', 'STYLE'].includes(el.tagName)).map(el => [el, el.inert]);
  let disposed = false, animation, raf = 0, program, buffer, watchdog;
  const textures = [];
  const state = { blink: 0, winking: 0, enter: 0, tilt: -.018, lookX: 0, lookY: 0, time: 0 };
  let pointerX = 0, pointerY = 0, started = 0, exiting = false;
  const onSkip = () => finish(true);
  const onKey = event => { if (['PageDown','PageUp','ArrowDown','ArrowUp','End','Home'].includes(event.key)) { finish(true); return; } if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') { event.preventDefault(); finish(true); } if(event.key === 'Tab') { event.preventDefault(); skip.focus(); } };
  const onScroll = () => { if (scrollY > 4) finish(true); };
  const onPointer = e => { pointerX = e.clientX / innerWidth * 2 - 1; pointerY = e.clientY / innerHeight * 2 - 1; };
  const onVisibility = () => { if (document.hidden) finish(true); };
  const initialWidth = innerWidth;
  // Mobile browser chrome changes height while scrolling. Only a layout-width
  // change (including rotation) needs to interrupt the welcome.
  const onResize = () => { if (Math.abs(innerWidth - initialWidth) > 2) finish(true); };
  function cleanup() {
    if (disposed) return;
    disposed = true;
    animation?.kill(); cancelAnimationFrame(raf); clearTimeout(watchdog);
    window.removeEventListener('keydown', onKey); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize); window.removeEventListener('hashchange', onSkip);
    overlay.removeEventListener('pointermove', onPointer); overlay.removeEventListener('wheel',onSkip); overlay.removeEventListener('touchmove',onSkip); document.removeEventListener('visibilitychange', onVisibility); reduce.removeEventListener('change', onSkip); canvas.removeEventListener('webglcontextlost',onSkip);
    inertState.forEach(([el, was]) => { el.inert = was; });
    if (overlay.contains(document.activeElement) && previousFocus instanceof HTMLElement && previousFocus !== document.body) previousFocus.focus({ preventScroll: true });
    overlay.remove();
    textures.forEach(t => gl.deleteTexture(t)); if(buffer)gl.deleteBuffer(buffer); if(program)gl.deleteProgram(program);
  }
  function finish(immediate = false) {
    if (disposed || (exiting && !immediate)) return;
    exiting = true;
    animation?.kill();
    try { sessionStorage.setItem(key, 'seen'); } catch { /* No dependency on storage. */ }
    if (immediate) { cleanup(); return; }
    const handoff = gsap.timeline({ onComplete: cleanup }); animation = handoff;
    // Finish the portrait before revealing the Hero. Two differently shaped
    // windows must never show through each other on a narrow viewport.
    frame.style.transition = 'none';
    handoff.to(skip, { opacity: 0, duration: .1 }, 0);
    handoff.to(welcome, { opacity: 0, y: -6, duration: .18, ease: 'power2.in' }, 0);
    handoff.to(frame, { opacity: 0, y: -6, scale: .99, duration: .22, ease: 'power2.in' }, 0);
    handoff.to(overlay, { opacity: 0, duration: .32, ease: 'power2.inOut' }, .22);
  }
  const mountedAt = performance.now();
  document.body.append(overlay);
  inertState.forEach(([el]) => { el.inert = true; });
  const skip = overlay.querySelector('button'); skip.addEventListener('click', onSkip); skip.focus({ preventScroll: true });
  window.addEventListener('keydown', onKey); window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onResize); window.addEventListener('hashchange', onSkip);
  overlay.addEventListener('pointermove', onPointer); overlay.addEventListener('wheel',onSkip,{passive:true}); overlay.addEventListener('touchmove',onSkip,{passive:true}); document.addEventListener('visibilitychange', onVisibility); reduce.addEventListener('change', onSkip); canvas.addEventListener('webglcontextlost',onSkip);
  watchdog = setTimeout(() => finish(true), 2500);
  function shader(type, source) {
    const s = gl.createShader(type); gl.shaderSource(s, source); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { const message=gl.getShaderInfoLog(s);gl.deleteShader(s);throw new Error(message); } return s;
  }
  try {
    const v = shader(gl.VERTEX_SHADER, VERTEX), f = shader(gl.FRAGMENT_SHADER, FRAGMENT);
    program = gl.createProgram(); gl.attachShader(program, v); gl.attachShader(program, f); gl.linkProgram(program); gl.deleteShader(v);gl.deleteShader(f);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Opening shader link failed');
    gl.useProgram(program); buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const a = gl.getAttribLocation(program,'p'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
    const load = src => new Promise((resolve,reject) => { const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src; });
    let loadDeadline;
    const images = await Promise.race([Promise.all(['/opening/welcome.webp','/opening/blink.webp','/opening/wink.webp'].map(load)),new Promise((_,reject)=>{loadDeadline=setTimeout(()=>reject(new Error('Opening load deadline')),600);})]).finally(()=>clearTimeout(loadDeadline));
    if (disposed) return;
    images.forEach((im,i) => { const t=gl.createTexture();textures.push(t);gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,im);gl.uniform1i(gl.getUniformLocation(program,['portrait','closed','wink'][i]),i); });
    const uniforms = Object.fromEntries(['fit','time','blink','winking','enter','tilt','lookX','lookY'].map(n=>[n,gl.getUniformLocation(program,n)]));
    const size = () => { const r={width:viewport.clientWidth,height:viewport.clientHeight};const d=Math.min(devicePixelRatio,1.5);const w=Math.max(1,Math.round(r.width*d)),h=Math.max(1,Math.round(r.height*d));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.viewport(0,0,canvas.width,canvas.height);const aspect=r.width/r.height,source=images[0].width/images[0].height;gl.uniform2f(uniforms.fit,Math.min(1,aspect/source),Math.min(1,source/aspect)); };
    size(); started=performance.now(); overlay.classList.add('is-ready');
    const draw = now => { if(disposed)return;size();state.time=(now-started)/1000;state.lookX+=(pointerX-state.lookX)*.04;state.lookY+=(pointerY-state.lookY)*.04;for(const [key,value] of Object.entries(state))gl.uniform1f(uniforms[key],value);const expression=state.blink>.75?'blink':state.winking>.75?'wink':'smile';if(overlay.dataset.expression!==expression)overlay.dataset.expression=expression;gl.drawArrays(gl.TRIANGLES,0,6);raf=requestAnimationFrame(draw); };
    raf=requestAnimationFrame(draw);
    animation=gsap.timeline({ onComplete:()=>finish(false) });
    animation.to(state,{enter:1,tilt:.006,duration:.6,ease:'power3.out'},0)
      .fromTo(frame,{y:18,scale:.985},{y:0,scale:1,duration:.68,ease:'power3.out'},0)
      .fromTo(welcome,{y:10,rotation:-5,opacity:0},{y:0,rotation:-2,opacity:1,duration:.4,ease:'power3.out'},.14)
      .to(state,{blink:1,duration:.07,ease:'power2.in'},.43).to(state,{blink:0,duration:.11,ease:'power2.out'},.5)
      .to(state,{tilt:-.018,duration:.38,ease:'sine.inOut'},.63)
      .to(state,{winking:1,duration:.125,ease:'power2.inOut'},.98).to(state,{winking:0,duration:.18,ease:'power2.out'},1.2)
      .to(state,{tilt:0,duration:.3,ease:'sine.inOut'},1.28)
      .to({}, {duration:.14},1.58);
    // Keep the handoff's full 0.54s; absorb modest asset-loading latency in
    // the welcome itself, so the whole visible opening stays near 2.35s.
    const welcomeBudget = Math.max(1, Math.min(1.72, 2.35 - (performance.now() - mountedAt) / 1000 - .54));
    animation.timeScale(1.72 / welcomeBudget);
  } catch { cleanup(); }
}
