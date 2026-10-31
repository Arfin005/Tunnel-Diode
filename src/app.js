/* ================= app: routing, controls, stage loop ================= */
const c3=$('#c3'),c2=$('#c2'),hv=$('#hv'),screenEl=$('#screen');
const ST={page:null,vi:0,view:null,p:{},S:{},inst:null,dirty:true,T:0,playing:MOTION};
const byId=Object.fromEntries(PAGES.map((p,i)=>[p.id,i]));
function lite(s){return runs(String(s)).map(r=>r.k===1?`<sub>${r.t}</sub>`:r.k===2?`<sup>${r.t}</sup>`:r.t.replace(/</g,'&lt;')).join('')}

/* ---------- 3D setup ---------- */
let R3=null;
let R3WHY='';
function init3(){
  if(typeof THREE==='undefined'){R3WHY='lib';return}
  const opts=[{antialias:true,alpha:true},{antialias:false,alpha:true},{antialias:false,alpha:true,powerPreference:'low-power',failIfMajorPerformanceCaveat:false}];
  for(const o of opts){
    try{
      const renderer=new THREE.WebGLRenderer(Object.assign({canvas:c3},o));
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setClearColor(0x000000,0);
      const cam=new THREE.PerspectiveCamera(42,1,0.05,400);R3={renderer,cam,orbit:new Orbit(cam,c3),scene:null,ray:new THREE.Raycaster()};
      c3.addEventListener('webglcontextlost',e=>{e.preventDefault();R3WHY='lost';const keep=R3;R3=null;if(ST.view&&ST.view.kind==='3d')mount(ST.vi);R3=keep},false);
      c3.addEventListener('webglcontextrestored',()=>{R3WHY='';if(ST.view&&ST.view.kind==='3d')mount(ST.vi)},false);
      return;
    }catch(e){R3=null;R3WHY='webgl'}
  }
}
function no3dHTML(){
  const why=R3WHY==='lib'?'The 3D engine (three.js) did not load in this browser.':R3WHY==='lost'?'The graphics context was lost (the GPU was reset or is busy).':R3WHY==='err'?'This 3D scene hit an error while drawing.':'WebGL could not start in this browser. Hardware acceleration may be switched off (browser settings → System → "Use graphics acceleration").';
  const alt=ST.page.v.map((s,i)=>[s,i]).filter(([s])=>VIEWS[s[0]].kind!=='3d');
  return `<div class="calc"><div class="step on"><h4>3D view unavailable</h4>${why}${alt.length?`<br><br>Other views for this section:<br>${alt.map(([s,i])=>`<button class="try" data-alt="${i}">${lite(s[1])}</button>`).join(' ')}`:''}<br><br><small>WebGL check: open <span style="font-family:var(--f-mono)">get.webgl.org</span> in this browser.</small></div></div>`;
}
function newScene(){
  const s=new THREE.Scene();
  s.add(new THREE.HemisphereLight(0xbcd3ff,0x0b0f18,0.75));
  const d=new THREE.DirectionalLight(0xffffff,0.85);d.position.set(5,9,7);s.add(d);
  const d2=new THREE.DirectionalLight(0x88aaff,0.3);d2.position.set(-6,3,-5);s.add(d2);
  s.add(new THREE.AmbientLight(0xffffff,0.15));
  const root=new THREE.Group();s.add(root);return {s,root};
}
function pick(e,objs){
  const r=c3.getBoundingClientRect(),v=new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);
  R3.ray.setFromCamera(v,R3.cam);const h=R3.ray.intersectObjects(objs,false);return h.length?h[0].object:null;
}

/* ---------- sizing ---------- */
let SW=0,SH=0;
function resize(){
  const r=screenEl.getBoundingClientRect();SW=Math.max(10,Math.round(r.width));SH=Math.max(10,Math.round(r.height));
  const dpr=Math.min(window.devicePixelRatio||1,2);c2.width=SW*dpr;c2.height=SH*dpr;
  if(R3){R3.renderer.setSize(SW,SH,false);R3.cam.aspect=SW/SH;R3.cam.updateProjectionMatrix()}
  ST.dirty=true;
}
new ResizeObserver(resize).observe(screenEl);

/* ---------- table of contents ---------- */
function buildToc(){
  const t=$('#toc');t.innerHTML='<h2>Contents</h2>'+PAGES.map(p=>`<a href="#${p.id}" class="l${p.lvl}" data-id="${p.id}"><span class="n">${p.n}</span><span>${lite(p.t)}</span></a>`).join('');
}
$('#menuBtn').addEventListener('click',()=>$('#toc').classList.toggle('open'));
$('#toc').addEventListener('click',e=>{if(e.target.closest('a'))$('#toc').classList.remove('open')});
function go(id){if(byId[id]==null)return;if(location.hash==='#'+id)render(id);else location.hash=id}
window.addEventListener('hashchange',()=>render(location.hash.slice(1)));

/* ---------- article ---------- */
function render(id){
  if(byId[id]==null)id=PAGES[0].id;
  const i=byId[id],pg=PAGES[i];ST.page=pg;
  document.querySelectorAll('#toc a').forEach(a=>a.classList.toggle('on',a.dataset.id===id));
  const on=$('#toc a.on'),tc=$('#toc');if(on&&(on.offsetTop<tc.scrollTop||on.offsetTop>tc.scrollTop+tc.clientHeight-40))tc.scrollTop=on.offsetTop-80;
  const kids=PAGES.filter(q=>q.parent===id);
  $('#article').innerHTML=`<div class="eyebrow">${pg.lvl===1?'Section':'Subsection'} ${pg.n}<span class="pill">${pg.v.length} visualisation${pg.v.length>1?'s':''}</span></div><h1>${lite(pg.t)}</h1>${md(pg.b)}`+
    (kids.length?`<h3>In this section</h3><div class="subs">${kids.map(k=>`<a href="#${k.id}"><span>${k.n}</span>${lite(k.t)}</a>`).join('')}</div>`:'');
  const pr=PAGES[i-1],nx=PAGES[i+1];
  $('#pager').innerHTML=(pr?`<a href="#${pr.id}"><small>← ${pr.n}</small>${lite(pr.t)}</a>`:'<span></span>')+(nx?`<a class="next" href="#${nx.id}"><small>${nx.n} →</small>${lite(nx.t)}</a>`:'');
  $('#prevBtn').disabled=!pr;$('#nextBtn').disabled=!nx;
  $('#read').scrollTop=0;if(window.innerWidth<=860)window.scrollTo(0,0);
  buildTabs();mount(0);
}
$('#prevBtn').addEventListener('click',()=>{const i=byId[ST.page.id];if(PAGES[i-1])go(PAGES[i-1].id)});
$('#nextBtn').addEventListener('click',()=>{const i=byId[ST.page.id];if(PAGES[i+1])go(PAGES[i+1].id)});
$('#article').addEventListener('click',e=>{
  const b=e.target.closest('.try');if(!b)return;
  const vi=+(b.dataset.v||0),set={};(b.dataset.set||'').split(';').filter(Boolean).forEach(kv=>{const [k,v]=kv.split('=');set[k]=v});
  mount(vi,set);if(window.innerWidth<=860)$('#lab').scrollIntoView({behavior:MOTION?'smooth':'auto'});
});

hv.addEventListener('click',e=>{const b=e.target.closest('[data-alt]');if(b)mount(+b.dataset.alt)});
/* ---------- tabs ---------- */
function buildTabs(){
  $('#tabs').innerHTML=ST.page.v.map((s,i)=>{const v=VIEWS[s[0]];const k=v.kind==='3d'?'3D':v.kind==='html'?'calc':'2D';return `<button class="tab" role="tab" data-i="${i}" aria-selected="false"><span class="k">${k}</span>${s[1]}</button>`}).join('');
}
$('#tabs').addEventListener('click',e=>{const b=e.target.closest('.tab');if(b)mount(+b.dataset.i)});

/* ---------- mount a view ---------- */
function teardown(){
  if(ST.view&&ST.view.kind==='3d'&&R3&&R3.scene){disposeObj(R3.scene);R3.scene=null;R3.orbit.onHover=null;R3.orbit.onClick=null;c3.style.cursor=''}
  ST.inst=null;
}
function coerce(prm,v){if(prm.t==='c')return v===true||v==='1'||v==='true';if(prm.t==='s')return String(v);return +v}
function mount(vi,set={}){
  teardown();
  const spec=ST.page.v[vi]||ST.page.v[0];ST.vi=vi;const view=VIEWS[spec[0]];ST.view=view;
  const p={};for(const q of view.params)p[q.id]=q.v;Object.assign(p,spec[2]||{});
  for(const k in set){const q=view.params.find(x=>x.id===k);if(q)p[k]=coerce(q,set[k])}
  if(view.onSet)for(const k of Object.keys({...(spec[2]||{}),...set})){Object.assign(p,view.onSet(k,p[k],p)||{})}
  ST.p=p;ST.S={};
  document.querySelectorAll('#tabs .tab').forEach((b,i)=>{b.classList.toggle('on',i===vi);b.setAttribute('aria-selected',i===vi)});
  const hint=view.kind==='3d'?'Drag to orbit · scroll or pinch to zoom · shift-drag to pan':view.drag?'Drag across the plot to move the marker':'';
  $('#vtitle').innerHTML=`<b>${lite(view.title)}</b><small>${lite(view.sub||'')}</small>${hint?`<small class="hint2">${hint}</small>`:''}`;
  const is3=view.kind==='3d',is2=view.kind==='2d',ish=view.kind==='html';
  c3.hidden=!is3;c2.hidden=!is2;hv.hidden=!(ish||(is3&&!R3));
  $('#tSpin').hidden=$('#tFront').hidden=$('#tReset').hidden=!is3;$('#tAnim').hidden=ish;
  if(is3){
    if(!R3){hv.hidden=false;c3.hidden=true;hv.innerHTML=no3dHTML()}
    else{try{const sc=newScene();R3.scene=sc.s;R3.orbit.spin=$('#tSpin').classList.contains('on');
      ST.S={scene:sc.s,root:sc.root,cam:R3.cam,orbit:R3.orbit,canvas:c3,pick};ST.inst=view.build(ST.S);R3.orbit.set(view.home||{r:13,th:0.7,ph:1.1,t:[0,0,0]});ST.inst.update(p)}
      catch(err){console.error(err);ST.inst=null;R3WHY='err';hv.hidden=false;c3.hidden=true;hv.innerHTML=no3dHTML()}}
  }else if(ish){view.render(hv,p)}
  buildControls();ST.dirty=true;updateReadout();
}

/* ---------- controls ---------- */
function fmtVal(q,v){if(q.f)return q.f(v);return (q.t==='r'?num(v,3):v)+(q.u?' '+q.u:'')}
function buildControls(){
  const view=ST.view,p=ST.p,el=$('#controls');
  if(!view.params.length){el.innerHTML='<div class="noctl">This view has no adjustable parameters.</div>';return}
  el.innerHTML=view.params.map(q=>{const id='ctl-'+q.id,lab=md(q.l);
    if(q.t==='r'){const lo=q.log?Math.log10(q.min):q.min,hi=q.log?Math.log10(q.max):q.max,val=q.log?Math.log10(p[q.id]):p[q.id],st=q.log?(hi-lo)/400:q.step;
      return `<div class="ctl"><label for="${id}"><span>${lab}</span><output id="${id}-o">${fmtVal(q,p[q.id])}</output></label><input type="range" id="${id}" data-k="${q.id}" min="${lo}" max="${hi}" step="${st}" value="${val}"></div>`}
    if(q.t==='s')return `<div class="ctl"><label for="${id}"><span>${lab}</span></label><select id="${id}" data-k="${q.id}">${q.opts.map(([v,l])=>`<option value="${v}"${String(p[q.id])===String(v)?' selected':''}>${l}</option>`).join('')}</select></div>`;
    return `<div class="ctl chk"><label for="${id}"><input type="checkbox" id="${id}" data-k="${q.id}"${p[q.id]?' checked':''}><span>${lab}</span></label></div>`;
  }).join('');
}
function setParam(k,raw,fromUI=true){
  const q=ST.view.params.find(x=>x.id===k);if(!q)return;
  let v=q.t==='r'?(q.log?10**(+raw):+raw):q.t==='c'?!!raw:String(raw);ST.p[k]=v;
  if(q.t==='r'){const o=$('#ctl-'+k+'-o');if(o)o.textContent=fmtVal(q,v);if(fromUI!==true){const i=$('#ctl-'+k);if(i)i.value=q.log?Math.log10(v):v}}
  if(ST.view.preset&&k==='proc'&&ST.view.preset[v]){for(const [kk,vv] of Object.entries(ST.view.preset[v]))setParam(kk,ST.view.params.find(x=>x.id===kk).log?Math.log10(vv):vv,false)}
  if(ST.view.onSet&&fromUI!=='hook'){const ch=ST.view.onSet(k,v,ST.p)||{};for(const [kk,vv] of Object.entries(ch)){const q2=ST.view.params.find(x=>x.id===kk);if(!q2)continue;if(q2.t==='s'){ST.p[kk]=String(vv);const sel=$('#ctl-'+kk);if(sel)sel.value=String(vv)}else setParam(kk,q2.log?Math.log10(vv):vv,'hook')}}
  apply();
}
let rq=0;function apply(){if(rq)return;rq=requestAnimationFrame(()=>{rq=0;const v=ST.view;if(v.kind==='3d'&&ST.inst)ST.inst.update(ST.p);else if(v.kind==='html')v.render(hv,ST.p);ST.dirty=true;updateReadout()})}
$('#controls').addEventListener('input',e=>{const t=e.target;if(!t.dataset.k)return;setParam(t.dataset.k,t.type==='checkbox'?t.checked:t.value)});
$('#controls').addEventListener('change',e=>{const t=e.target;if(t.tagName==='SELECT'||t.type==='checkbox')setParam(t.dataset.k,t.type==='checkbox'?t.checked:t.value)});

/* ---------- readouts ---------- */
function updateReadout(){
  const v=ST.view;let rows=[];try{rows=v.read?v.read(ST.p,ST.S)||[]:[]}catch(e){rows=[]}
  $('#readout').innerHTML=rows.map(([a,b,c])=>`<div><span>${lite(a)}</span><b class="${c||''}" title="${String(b).replace(/"/g,'')}">${lite(b)}</b></div>`).join('');
  $('#readout').hidden=!rows.length;
}

/* ---------- 2D drag ---------- */
let dragging=false;
function dragTo(e){const v=ST.view;if(!v.drag||!ST.S.main)return;const r=c2.getBoundingClientRect();const q=v.params.find(x=>x.id===v.drag);if(!q)return;
  let x=ST.S.main.ix(e.clientX-r.left);x=clamp(x,q.min,q.max);setParam(q.id,q.log?Math.log10(x):x,false)}
c2.addEventListener('pointerdown',e=>{if(!ST.view.drag)return;dragging=true;c2.setPointerCapture(e.pointerId);dragTo(e)});
c2.addEventListener('pointermove',e=>{if(dragging)dragTo(e)});
c2.addEventListener('pointerup',()=>{dragging=false});c2.addEventListener('pointercancel',()=>{dragging=false});
c2.style.touchAction='pan-y';

/* ---------- tools ---------- */
$('#tAnim').addEventListener('click',e=>{ST.playing=!ST.playing;MOTION=ST.playing;e.currentTarget.classList.toggle('on',ST.playing);e.currentTarget.textContent=ST.playing?'❚❚':'▶';ST.dirty=true;if(ST.view.kind==='3d'&&ST.inst)ST.inst.update(ST.p)});
$('#tAnim').classList.toggle('on',ST.playing);$('#tAnim').textContent=ST.playing?'❚❚':'▶';
$('#tSpin').addEventListener('click',e=>{if(!R3)return;R3.orbit.spin=!R3.orbit.spin;e.currentTarget.classList.toggle('on',R3.orbit.spin)});
$('#tFront').addEventListener('click',()=>{if(R3)R3.orbit.front()});
$('#tReset').addEventListener('click',()=>{if(R3)R3.orbit.reset()});
$('#tFull').addEventListener('click',()=>{const el=$('#lab');try{if(document.fullscreenElement)document.exitFullscreen();else if(el.requestFullscreen)el.requestFullscreen().catch(()=>{})}catch(e){}});

/* ---------- loop ---------- */
let last=performance.now(),frame=0;
function loop(now){
  requestAnimationFrame(loop); // reschedule first so one bad frame can never stop the animation
  const dt=clamp(((now||performance.now())-last)/1000,0,0.05);last=Math.max(last,now||0);frame++;if(ST.playing)ST.T+=dt;
  const v=ST.view;
  if(v){
    if(v.kind==='3d'&&R3&&ST.inst&&R3.scene){try{ST.inst.tick(ST.T,ST.playing?dt:0,ST.p);R3.orbit.update(dt);R3.renderer.render(R3.scene,R3.cam)}catch(err){console.error(err);ST.inst=null;R3WHY='err';hv.hidden=false;c3.hidden=true;hv.innerHTML=no3dHTML()}if(v.live&&frame%12===0)updateReadout()}
    else if(v.kind==='2d'&&(ST.dirty||(v.anim&&ST.playing))){const g=c2.getContext('2d'),dpr=c2.width/SW;g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,SW,SH);try{v.draw(g,SW,SH,ST.p,ST.T,ST.S)}catch(err){console.error(err)}if(ST.dirty)updateReadout();ST.dirty=false}
  }
}

/* ---------- boot ---------- */
function boot(){buildToc();init3();resize();render(location.hash.slice(1));requestAnimationFrame(loop)}
if(document.fonts&&document.fonts.ready)Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,1500))]).then(boot);else boot();
