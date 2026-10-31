/* ================= 3D views ================= */
const V3=(o)=>Object.assign({kind:'3d'},o);
const DEG=Math.PI/180;
function setInst(mesh,i,x,y,z,s=1){const m=new THREE.Matrix4();m.compose(new THREE.Vector3(x,y,z),new THREE.Quaternion(),new THREE.Vector3(s,s,s));mesh.setMatrixAt(i,m)}
function inst(geo,col,n,o={}){const m=new THREE.InstancedMesh(geo,new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:o.ei??0.5,roughness:.35,transparent:!!o.op,opacity:o.op||1}),n);m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);return m}

/* ---------- concept map ---------- */
const CONCEPT=[
  {t:'p⁺ − n⁺',s:'heavy doping',go:'why-special',p:[-6.4,1.6,0]},
  {t:'W_d ↓',s:'thin barrier',go:'ordinary-vs-tunnel',p:[-3.2,1.9,-1.2]},
  {t:'T_t ↑',s:'tunnelling',go:'tunnelling-probability',p:[0,2.1,0]},
  {t:'I_P, V_P',s:'peak point',go:'region-1',p:[3.2,1.9,1.2]},
  {t:'dI/dV < 0',s:'NDR region',go:'region-2',p:[6.4,1.6,0]},
  {t:'Gap states',s:'excess current',go:'excess-mechanism',p:[1.8,-1.4,1.6]},
  {t:'Diffusion',s:'current',go:'diffusion',p:[-2.6,-1.6,0.6]},
  {t:'R_s, L_s, C_j, −R',s:'equivalent circuit',go:'equivalent-circuit',p:[6.0,-1.6,-1.2]}
];
const CEDGES=[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[4,7]];
function conceptView(NODES,EDGES,HI,CAP){return V3({title:'Topic map — click any block to open it',sub:'Concept ⇒ Formula ⇒ Derivation ⇒ Physical meaning ⇒ Exam tip',home:{r:21,th:0.18,ph:1.32,t:[0,0.2,0]},
  params:[K('flow','Animate the flow',true)],
  build(S){
    const g=S.root,nodes=[],pulses=[],curves=[];
    NODES.forEach((c,i)=>{
      const w=Math.max(2.3,c.t.length*0.19+0.6);const box=new THREE.Mesh(new THREE.BoxGeometry(w,1.25,0.5),mat(i===HI?'#3a1630':'#16233a',{emissive:i===HI?'#3a0f26':'#0d1a30',emissiveIntensity:.6}));
      box.position.set(...c.p);box.userData={go:c.go,i};g.add(box);nodes.push(box);
      const ed=new THREE.LineSegments(new THREE.EdgesGeometry(box.geometry),new THREE.LineBasicMaterial({color:i===HI?0xff5c8a:0x6ea2ff}));box.add(ed);
      const t1=tlabel(c.t,{size:.5,color:'#ffffff',weight:600,font:MATHF,depth:false,order:8});t1.position.set(0,0.2,0.32);box.add(t1);
      const t2=tlabel(c.s,{size:.32,color:'#9fb3d1',font:SANS,depth:false,order:8});t2.position.set(0,-0.3,0.32);box.add(t2);
    });
    EDGES.forEach(([a,b])=>{const A=new THREE.Vector3(...NODES[a].p),B=new THREE.Vector3(...NODES[b].p);const M_=A.clone().add(B).multiplyScalar(.5);M_.z+=0.9;
      const cv=new THREE.CatmullRomCurve3([A,M_,B]);curves.push(cv);const tb=new THREE.Mesh(new THREE.TubeGeometry(cv,40,0.035,6),mat('#6ea2ff',{emissive:'#2c5bd0',emissiveIntensity:.8,transparent:true,opacity:.75}));g.add(tb);
      for(let k=0;k<3;k++){const s=ball(0.09,'#38d6e8',{ei:1.2});s.userData={cv,o:k/3};g.add(s);pulses.push(s)}});
    const fl=new THREE.Mesh(new THREE.CircleGeometry(11,64),mat('#0e1622',{transparent:true,opacity:.6}));fl.rotation.x=-Math.PI/2;fl.position.y=-2.8;g.add(fl);
    g.add(tlabel(CAP,{size:.36,pos:[0,3.6,0],color:'#9fb3d1',font:SANS}));
    let hov=null;
    S.orbit.onHover=e=>{const h=S.pick(e,nodes);if(hov&&hov!==h)hov.scale.set(1,1,1);hov=h;if(h){h.scale.set(1.08,1.08,1.08);S.canvas.style.cursor='pointer'}else S.canvas.style.cursor=''};
    S.orbit.onClick=e=>{const h=S.pick(e,nodes);if(h)go(h.userData.go)};
    let flow=true;
    return {update(p){flow=p.flow},tick(t){if(!flow)return;for(const s of pulses){const u=(t*0.25+s.userData.o)%1;s.position.copy(s.userData.cv.getPoint(u))}nodes.forEach((n,i)=>{n.position.y=NODES[i].p[1]+Math.sin(t*1.2+i)*0.05})}};
  },
  read(){return [['blocks',NODES.length+' concepts'],['links',EDGES.length+' causal links'],['tip','click a block to jump']]}
})}
VIEWS.concept=conceptView(CONCEPT,CEDGES,4,'Learning path · Part 5');

/* ---------- complex wavefunction through a barrier ---------- */
const cx={m:(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]],a:(a,b)=>[a[0]+b[0],a[1]+b[1]],s:(a,b)=>[a[0]-b[0],a[1]-b[1]],d:(a,b)=>{const q=b[0]*b[0]+b[1]*b[1];return [(a[0]*b[0]+a[1]*b[1])/q,(a[1]*b[0]-a[0]*b[1])/q]},e:th=>[Math.cos(th),Math.sin(th)],k:(a,s)=>[a[0]*s,a[1]*s]};
function waveSolve(p){
  const k=Math.sqrt(p.m*p.E/0.0381),q=Math.sqrt(p.m*p.U/0.0381),a=p.a;
  const C1=cx.e(k*a),D1=cx.k(cx.m([0,k],C1),1/q),ch=Math.cosh(q*a),sh=Math.sinh(q*a);
  const psi0=cx.s(cx.k(C1,ch),cx.k(D1,sh)),dpsi0=cx.k(cx.a(cx.k(C1,-sh),cx.k(D1,ch)),q);
  const s=cx.d([2,0],cx.a(psi0,cx.d(dpsi0,[0,k])));const r=cx.s(cx.m(s,psi0),[1,0]);
  const f=x=>{if(x<0)return cx.a(cx.e(k*x),cx.m(r,cx.e(-k*x)));if(x<=a){const u=x-a;return cx.m(s,cx.a(cx.k(C1,Math.cosh(q*u)),cx.k(D1,Math.sinh(q*u))))}return cx.m(s,cx.e(k*x))};
  return {k,q,r,t:s,T:s[0]**2+s[1]**2,R:r[0]**2+r[1]**2,f};
}
VIEWS.wave=V3({title:'Quantum tunnelling — the complex wavefunction ψ(x)',sub:'Ribbon = ψ as a rotating phasor (Re up, Im sideways); back wall = |ψ|²',home:{r:12.5,th:0.55,ph:1.2,t:[0,0,0]},
  params:[R('a','Barrier width $a$',0.3,6,0.05,1.2,'nm',{f:v=>v.toFixed(2)+' nm'}),R('U','Barrier above $E$',0.02,1,0.01,0.25,'eV',{f:v=>v.toFixed(2)+' eV'}),R('E','Electron energy $E$',0.02,0.5,0.01,0.12,'eV',{f:v=>v.toFixed(2)+' eV'}),R('m','Effective mass $m*$',0.02,1,0.01,0.07,'m₀',{f:v=>v.toFixed(2)+' m₀'}),K('dens','Show |ψ|² on the back wall',true)],
  build(S){
    const g=S.root,N=520,dyn=new THREE.Group();g.add(dyn);
    const pos=new Float32Array(N*2*3),col=new Float32Array(N*2*3),idx=[];for(let i=0;i<N-1;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}
    const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.BufferAttribute(pos,3));rg.setAttribute('color',new THREE.BufferAttribute(col,3));rg.setIndex(idx);
    const rib=new THREE.Mesh(rg,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,transparent:true,opacity:.55,depthWrite:false}));g.add(rib);
    const tp=new Float32Array(N*3),tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.BufferAttribute(tp,3));const tipL=new THREE.Line(tg,new THREE.LineBasicMaterial({color:0xffffff}));g.add(tipL);
    g.add(polyline([[-7.5,0,0],[7.5,0,0]],0x8191aa,{op:.6}));
    let sol=null,X0=-12,X1=10,sx=1,amp=1.25,P;
    const wx=x=>(x-X0)*sx-7.2;
    return {
      update(p){P=p;clearGroup(dyn);sol=waveSolve(p);X0=-10;X1=p.a+10;sx=14.4/(X1-X0);
        const bw=Math.max(0.08,p.a*sx),bh=0.6+p.U*3.2;
        const bar=new THREE.Mesh(new THREE.BoxGeometry(bw,bh*2,3.2),mat('#f6b23c',{transparent:true,opacity:.16,emissive:'#f6b23c',emissiveIntensity:.25,depthWrite:false}));bar.position.set(wx(p.a/2),0,0);dyn.add(bar);
        const be=new THREE.LineSegments(new THREE.EdgesGeometry(bar.geometry),new THREE.LineBasicMaterial({color:0xf6b23c,transparent:true,opacity:.7}));be.position.copy(bar.position);dyn.add(be);
        dyn.add(tlabel('barrier  a = '+p.a.toFixed(2)+' nm',{size:.4,pos:[wx(p.a/2),bh+0.35,0],color:'#f6b23c'}));
        dyn.add(tlabel('incident + reflected',{size:.4,pos:[-4.6,2.4,0],color:'#9fb3d1',font:SANS}));
        dyn.add(tlabel('transmitted  |t|² = '+num(sol.T,3),{size:.4,pos:[4.4,2.4,0],color:'#3fd29b',font:SANS}));
        if(p.dens){const pts=[],sc=0.55;for(let i=0;i<N;i++){const x=lerp(X0,X1,i/(N-1)),v=sol.f(x);pts.push([wx(x),-2.0+Math.min(3.6,(v[0]**2+v[1]**2)*sc),-1.9])}
          dyn.add(polyline(pts,0xff5c8a));dyn.add(polyline([[-7.2,-2,-1.9],[7.2,-2,-1.9]],0x8191aa,{op:.5}));dyn.add(tlabel('|ψ|²',{size:.3,pos:[-7.6,-1.4,-1.9],color:'#ff5c8a'}))}
      },
      tick(t){if(!sol)return;const w=MOTION?t*2.2:0;for(let i=0;i<N;i++){const x=lerp(X0,X1,i/(N-1)),v=cx.m(sol.f(x),cx.e(-w)),X=wx(x),y=v[0]*amp,z=v[1]*amp;
        pos.set([X,0,0,X,y,z],i*6);tp.set([X,y,z],i*3);const h=(Math.atan2(v[1],v[0])/(2*Math.PI)+1)%1;const c=new THREE.Color().setHSL(0.55+0.25*h,0.85,0.55);col.set([c.r*.4,c.g*.4,c.b*.4,c.r,c.g,c.b],i*6)}
        rg.attributes.position.needsUpdate=true;rg.attributes.color.needsUpdate=true;tg.attributes.position.needsUpdate=true;rg.computeBoundingSphere();tg.computeBoundingSphere()}
    };
  },
  read(p){const s=waveSolve(p);return [['k',s.k.toFixed(3)+' nm⁻¹'],['κ',s.q.toFixed(3)+' nm⁻¹'],['|t|² transmitted',num(s.T,3),s.T>0.05?'good':s.T>1e-4?'warn':'bad'],['|r|² reflected',num(s.R,3)],['|t|²+|r|²',(s.T+s.R).toFixed(4)],['decay length 1/κ',(1/s.q).toFixed(2)+' nm']]}
});

/* ---------- p+ n+ junction crystal ---------- */
function junctionT(N){const W_=Wdep(N),F=2*0.86/(W_*1e-9);return {W:W_,F,T:Ttun(0.66,F,0.05)}}
VIEWS.junction=V3({title:'p⁺ − n⁺ junction: doping sets the barrier width',sub:'Ionised dopants in the depletion layer, free carriers outside, electrons tunnelling n⁺ → p⁺',home:{r:12,th:0.45,ph:1.15,t:[0,0.2,0]},
  params:[LR('N','Doping $N_A = N_D$',1e18,2e20,2e19,'cm⁻³',{f:v=>num(v,2)+' cm⁻³'}),K('tun','Tunnelling electrons',true),K('field','Field arrows',true)],
  build(S){
    const g=S.root,dyn=new THREE.Group();g.add(dyn);let parts=[],Ww=1,rate=0,pm=null,pin=null,P_;
    const sg=new THREE.SphereGeometry(0.07,10,8),ig=new THREE.SphereGeometry(0.1,10,8);
    return {
      update(p){P_=p;clearGroup(dyn);const J=junctionT(p.N);Ww=clamp(J.W*0.11,0.3,5.2);rate=clamp((Math.log10(J.T)+14)/14,0,1);
        const L=6.2,Hh=1.2,D=1.2;
        const mk_=(x0,x1,c,op)=>{const m_=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,Hh*2,D*2),mat(c,{transparent:true,opacity:op,depthWrite:false}));m_.position.x=(x0+x1)/2;dyn.add(m_);const e=new THREE.LineSegments(new THREE.EdgesGeometry(m_.geometry),new THREE.LineBasicMaterial({color:c,transparent:true,opacity:.5}));e.position.copy(m_.position);dyn.add(e)};
        mk_(-L,-Ww/2,'#f6b23c',.08);mk_(-Ww/2,Ww/2,'#ff5c8a',.13);mk_(Ww/2,L,'#5b9cff',.08);
        const R_=rng(7),ions=[];for(let x=-L+0.3;x<L;x+=0.55)for(let y=-0.9;y<=0.95;y+=0.6)for(let z=-0.9;z<=0.95;z+=0.6)ions.push([x+(R_()-.5)*.05,y,z]);
        const acc=inst(ig,'#f6b23c',ions.length,{ei:.3}),don=inst(ig,'#5b9cff',ions.length,{ei:.3});let na=0,nd=0;
        ions.forEach(([x,y,z])=>{if(x<0)setInst(acc,na++,x,y,z,Math.abs(x)<Ww/2?1.25:0.7);else setInst(don,nd++,x,y,z,Math.abs(x)<Ww/2?1.25:0.7)});acc.count=na;don.count=nd;dyn.add(acc,don);
        const fr_=ions.filter(([x])=>Math.abs(x)>Ww/2+0.1);pm=inst(sg,'#ffcf7a',fr_.length,{ei:.9});pin=fr_.map(([x,y,z])=>[x+0.27,y+0.3,z+0.3,x<0]);dyn.add(pm);
        pm.material.color.set('#ffffff');pm.instanceColor=null;
        dyn.add(tlabel('p⁺ (acceptors −, holes)',{size:.4,pos:[-L/2-0.4,1.75,0],color:'#f6b23c',font:SANS}));
        dyn.add(tlabel('n⁺ (donors +, electrons)',{size:.4,pos:[L/2+0.4,1.75,0],color:'#5b9cff',font:SANS}));
        dyn.add(polyline([[-Ww/2,1.45,D],[-Ww/2,1.65,D],[Ww/2,1.65,D],[Ww/2,1.45,D]],0xff5c8a));
        dyn.add(tlabel('W_d = '+J.W.toFixed(1)+' nm',{size:.46,pos:[0,2.0,D],color:'#ff9ab4'}));
        if(p.field){const n=Math.round(clamp(J.F/0.4e8,2,12));for(let i=0;i<n;i++){const y=lerp(-0.9,0.9,(i+.5)/n),len=Math.max(0.25,Ww*0.8);const ar=new THREE.ArrowHelper(new THREE.Vector3(-1,0,0),new THREE.Vector3(len/2,y,D+0.02),len,0xff5c8a,Math.min(0.25,len*0.35),0.12);dyn.add(ar)}
          dyn.add(tlabel('ℰ ≈ '+(J.F/1e8).toFixed(2)+' MV/cm',{size:.4,pos:[0,-1.65,D],color:'#ff5c8a'}))}
        parts=[];if(p.tun){const pg=new THREE.SphereGeometry(0.11,12,10);for(let i=0;i<14;i++){const s=new THREE.Mesh(pg,new THREE.MeshBasicMaterial({color:0x7fe9ff,transparent:true}));s.userData={ph:i/14,y:lerp(-0.8,0.8,(i*0.37)%1),z:lerp(-0.8,0.8,(i*0.61)%1),ok:rng(i+3)()<rate};dyn.add(s);parts.push(s)}}
      },
      tick(t){
        if(pm&&pin){const m=new THREE.Matrix4();pin.forEach(([x,y,z,isP],i)=>{const j=MOTION?0.06:0;m.makeTranslation(x+Math.sin(t*3+i)*j,y+Math.cos(t*2.6+i*1.3)*j,z+Math.sin(t*2.2+i*.7)*j);pm.setMatrixAt(i,m)});pm.instanceMatrix.needsUpdate=true;
          if(!pm.userData.c){pm.userData.c=1;const c=new THREE.Color();pin.forEach(([,,,isP],i)=>{pm.setColorAt(i,c.set(isP?'#ffb347':'#7fb2ff'))});pm.instanceColor.needsUpdate=true}}
        for(const s of parts){const u=MOTION?(t*0.35+s.userData.ph)%1:s.userData.ph;const xs=3.2,xe=Ww/2;let x,o=1;
          if(u<0.45){x=lerp(xs,xe,u/0.45)}
          else if(s.userData.ok){x=lerp(xe,-xs,(u-0.45)/0.55);o=Math.abs(x)<Ww/2?0.45:1}
          else{x=lerp(xe,xs,(u-0.45)/0.55);o=0.6}
          s.position.set(x,s.userData.y,s.userData.z);s.material.opacity=o;s.material.color.set(s.userData.ok&&u>0.45?0x7fffc5:0x7fe9ff)}
      }
    };
  },
  read(p){const J=junctionT(p.N);return [['W_d',J.W.toFixed(1)+' nm',J.W<12?'good':'warn'],['ℰ',(J.F/1e8).toFixed(2)+' MV/cm'],['T_t (E_x = E_g, m* = 0.05)',num(J.T,2),J.T>1e-4?'good':'bad'],['crossings shown','log-scaled rate']]}
});

/* ---------- 3D energy-band diagram ---------- */
VIEWS.band=V3({title:'Energy-band diagram of the p⁺ − n⁺ junction',sub:'Blue balls: electrons · amber rings: empty states (holes) · bright streaks: tunnelling electrons',home:{r:13.5,th:0.3,ph:1.3,t:[0.2,2.4,0]},
  params:[R('V','Forward bias $V$',0,0.5,0.001,0.06,'V',{f:v=>v.toFixed(3)+' V'}),SEL('route','Excess-current route',[['0','none'],['1','1 · C ↓ B ⇝ D'],['2','2 · C ⇝ A ↓ D'],['3','3 · C ⇝ A → B ⇝ D'],['4','4 · staircase']],'0'),K('gap','Localized gap states',false),K('lab','Labels',true),K('ex','Show $E_x = q(ψ_{bi} − V)$',false)],
  build(S){
    const g=S.root,dyn=new THREE.Group(),rt=new THREE.Group();g.add(dyn,rt);
    const XS=1.25,Ey=E=>(E+0.75)*3.2,Wx=x=>x*XS,Dz=1.5;
    const eg=new THREE.SphereGeometry(0.075,10,8),hg=new THREE.TorusGeometry(0.075,0.025,6,14);
    const NE=260,NV=420,NH=150,ND=120;
    const cbE=inst(eg,'#6ea2ff',NE,{ei:.7}),vbE=inst(eg,'#3d5f9e',NV,{ei:.35}),hol=inst(hg,'#f6b23c',NH,{ei:.8}),dvb=inst(eg,'#3d5f9e',ND,{ei:.3});g.add(cbE,vbE,hol,dvb);
    const R_=rng(11),seeds=Array.from({length:NV+NE+NH+ND},()=>[R_(),R_(),R_()]);
    const flux=[];for(let i=0;i<26;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(0.09,12,10),new THREE.MeshBasicMaterial({color:0xbff3ff,transparent:true}));s.userData={ph:i/26,ez:R_(),z:lerp(-1.2,1.2,R_())};g.add(s);flux.push(s)}
    const rider=ball(0.14,'#ffffff',{ei:1.5});rt.add(rider);
    // energy axis
    const ax=[];for(let E=-0.6;E<=0.81;E+=0.2){ax.push(-5.6,Ey(E),-Dz,-5.45,Ey(E),-Dz);g.add(tlabel(E.toFixed(1),{size:.22,pos:[-5.95,Ey(E),-Dz],color:'#8191aa'}))}
    g.add(segs([-5.6,0,-Dz,-5.6,Ey(0.85),-Dz,...ax],0x8191aa,.7));g.add(tlabel('E (eV)',{size:.26,pos:[-5.75,Ey(0.85)+0.35,-Dz],color:'#c9d3e1'}));
    let e,ovl=[0,0],route=[];
    return {
      update(p){clearGroup(dyn);clearGroup(rt);rt.add(rider);e=bandE(p.V);
        const xs=lin(-4,4,121);
        const sheet=(fn,c)=>{const pos=[];xs.forEach(x=>{const y=Ey(fn(x));pos.push(Wx(x),y,-Dz,Wx(x),y,Dz)});const idx=[];for(let i=0;i<xs.length-1;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}
          const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();
          const m_=new THREE.Mesh(geo,mat(c,{transparent:true,opacity:.42,side:THREE.DoubleSide,emissive:c,emissiveIntensity:.35,depthWrite:false}));dyn.add(m_);
          dyn.add(polyline(xs.map(x=>[Wx(x),Ey(fn(x)),Dz]),new THREE.Color(c).getHex()));dyn.add(polyline(xs.map(x=>[Wx(x),Ey(fn(x)),-Dz]),new THREE.Color(c).getHex(),{op:.5}))};
        sheet(x=>Math.min(0.88,bandX(x,e).Ec),'#5b9cff');sheet(x=>Math.max(-0.78,bandX(x,e).Ev),'#f6b23c');
        const back=(fn,top,c)=>{const pos=[];xs.forEach(x=>{pos.push(Wx(x),Ey(fn(x)),-Dz-0.01,Wx(x),Ey(top),-Dz-0.01)});const idx=[];for(let i=0;i<xs.length-1;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);dyn.add(new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.07,side:THREE.DoubleSide,depthWrite:false})))};
        back(x=>Math.min(0.88,bandX(x,e).Ec),0.9,'#5b9cff');back(x=>Math.max(-0.78,bandX(x,e).Ev),-0.78,'#f6b23c');
        const fermi=(x0,x1,E,c)=>{const pl_=new THREE.Mesh(new THREE.PlaneGeometry(Wx(x1)-Wx(x0),Dz*2),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.16,side:THREE.DoubleSide,depthWrite:false}));pl_.rotation.x=-Math.PI/2;pl_.position.set((Wx(x0)+Wx(x1))/2,Ey(E),0);dyn.add(pl_);dyn.add(polyline([[Wx(x0),Ey(E),Dz],[Wx(x1),Ey(E),Dz]],new THREE.Color(c).getHex(),{dash:.12}))};
        fermi(-4,0,e.EFL,'#f6b23c');fermi(0,4,e.EFR,'#38d6e8');
        // particles
        let k=0;const m4=new THREE.Matrix4();
        for(let i=0;i<NE;i++){const [a,b,c]=seeds[k++];const x=lerp(1.05,4,a),E=e.EcR+(e.EFR-e.EcR)*Math.pow(b,2/3);setInst(cbE,i,Wx(x),Ey(E),lerp(-1.3,1.3,c))}
        for(let i=0;i<NV;i++){const [a,b,c]=seeds[k++];const x=lerp(-4,-1.05,a),E=lerp(-0.74,e.EFL,b);setInst(vbE,i,Wx(x),Ey(E),lerp(-1.3,1.3,c))}
        for(let i=0;i<NH;i++){const [a,b,c]=seeds[k++];const x=lerp(-4,-1.05,a),E=lerp(e.EFL,e.EvL,Math.pow(b,0.8));const s_=Ey(E);m4.makeRotationX(Math.PI/2);m4.setPosition(Wx(x),s_,lerp(-1.3,1.3,c));hol.setMatrixAt(i,m4)}
        let nd=0;for(let i=0;i<ND;i++){const [a,b,c]=seeds[k++];const x=lerp(1.05,4,a),E=lerp(-0.74,e.EvR,b);if(E<e.EvR&&E>-0.75)setInst(dvb,nd++,Wx(x),Ey(E),lerp(-1.3,1.3,c))}dvb.count=nd;
        [cbE,vbE,hol,dvb].forEach(m_=>m_.instanceMatrix.needsUpdate=true);
        ovl=[Math.max(e.EcR,e.EFL),Math.min(e.EFR,e.EvL)];
        if(p.lab){const L=(s,x,E,c,sz=.42)=>dyn.add(tlabel(s,{size:sz,pos:[Wx(x),Ey(E),Dz+0.05],color:c}));
          L('E_C',-3.6,e.EcL+0.06,'#8fbaff');L('E_V',-3.6,e.EvL+0.07,'#ffc76a');L('E_{Fp}',-2.4,e.EFL-0.07,'#ffc76a');L('E_{Fn}',3.4,e.EFR+0.07,'#7fe9ff');L('E_C',3.6,e.EcR-0.07,'#8fbaff');
          L('p⁺',-4.4,0.78,'#ffc76a',.62);L('n⁺',4.4,0.78,'#8fbaff',.62);
          if(p.V>0.01){dyn.add(polyline([[Wx(4.3),Ey(e.EFL),Dz],[Wx(4.3),Ey(e.EFR),Dz]],0xffffff));L('qV',4.65,(e.EFL+e.EFR)/2,'#ffffff',.3);dyn.add(polyline([[Wx(0),Ey(e.EFL),Dz],[Wx(4.3),Ey(e.EFL),Dz]],0xffffff,{dash:.08,op:.5}))}}
        if(p.ex){const x=-0.1,top=Ey(e.EcL),bot=Ey(e.EcR);dyn.add(polyline([[Wx(x),bot,Dz+0.1],[Wx(x),top,Dz+0.1]],0xff5c8a));dyn.add(tlabel('E_x ≈ q(ψ_{bi} − V) = '+(e.EcL-e.EcR).toFixed(2)+' eV',{size:.3,pos:[Wx(x)+2.2,(top+bot)/2,Dz+0.1],color:'#ff9ab4'}))}
        // gap states & routes
        route=+p.route?routePts(p.V,+p.route):[];
        const gs=new THREE.OctahedronGeometry(0.14);
        if(p.gap&&!route.length){const r2=rng(5);for(let i=0;i<22;i++){const x=lerp(-1.6,1.6,r2()),b=bandX(x,e);const E=lerp(b.Ev+0.05,b.Ec-0.05,r2());const o=new THREE.Mesh(gs,mat('#a98bff',{emissive:'#a98bff',emissiveIntensity:.7}));o.position.set(Wx(x),Ey(E),lerp(-1.2,1.2,r2()));dyn.add(o)}}
        if(route.length){for(let i=1;i<route.length;i++){const a=route[i-1],c=route[i];const A=[Wx(a.x),Ey(a.E),0],B=[Wx(c.x),Ey(c.E),0];
            if(c.k==='drop'){const pts=[];for(let j=0;j<=30;j++){const f=j/30;pts.push([A[0]+0.08*Math.sin(f*Math.PI*8),lerp(A[1],B[1],f),0])}rt.add(tube(pts,0.035,'#ff6b5b',{ei:.8}))}
            else rt.add(tube([A,B],0.04,c.k==='hop'?'#a98bff':'#38d6e8',{ei:.9,op:.85}))}
          route.forEach(q=>{if(!q.n)return;const gap=q.n==='A'||q.n==='B'||/^E/.test(q.n);const o=gap?new THREE.Mesh(gs,mat('#a98bff',{emissive:'#a98bff',emissiveIntensity:.9})):ball(0.13,q.n==='C'?'#6ea2ff':'#f6b23c',{ei:1});o.position.set(Wx(q.x),Ey(q.E),0);rt.add(o);rt.add(tlabel(q.n.replace(/E(\d)/,'E_$1'),{size:.34,pos:[Wx(q.x)+0.3,Ey(q.E)+0.3,0],color:'#ffffff',weight:600}))})}
        rider.visible=!!route.length;
      },
      tick(t){
        const has=ovl[1]>ovl[0];
        for(const s of flux){if(!has){s.visible=false;continue}s.visible=true;const u=MOTION?(t*0.5+s.userData.ph)%1:s.userData.ph;const E=lerp(ovl[0],ovl[1],s.userData.ez);s.position.set(Wx(lerp(1.2,-1.2,u)),Ey(E),s.userData.z);s.material.opacity=Math.sin(u*Math.PI)}
        if(route.length){const n=route.length-1,ph=MOTION?(t*0.45)%(n+0.6):n,k=Math.min(n-1,Math.floor(ph)),f=clamp(ph-k,0,1),a=route[k],c=route[k+1];rider.position.set(Wx(lerp(a.x,c.x,f)),Ey(lerp(a.E,c.E,f)),0)}
      }
    };
  },
  read(p){const e=bandE(p.V),lo=Math.max(e.EcR,e.EFL),hi=Math.min(e.EFR,e.EvL),w=Math.max(0,hi-lo);const tc=tunCurve(300);
    const st=p.V<tc.Vpk?['rising','good']:p.V<BAND.Vn+BAND.Vp?['falling (NDR)','bad']:['≈ 0 — excess current only','warn'];
    return [['qV',(p.V*1000).toFixed(0)+' meV'],['overlap window',(w*1000).toFixed(0)+' meV'],['direct tunnelling',st[0],st[1]],['E_x = q(ψ_{bi} − V)',(e.EcL-e.EcR).toFixed(3)+' eV'],...(+p.route?[['route',ROUTE_TXT[p.route]]]:[])]}
});

/* ---------- generic surface view ---------- */
function surfView(o){return V3({title:o.title,sub:o.sub,params:o.params,home:o.home||{r:14,th:0.78,ph:1.08,t:[0,1.3,0]},read:o.read,
  build(S){const g=new THREE.Group(),mk_=new THREE.Group();S.root.add(g,mk_);let key='',sf=null;
    return {update(p){const k=o.key(p);if(k!==key){key=k;clearGroup(g);sf=surf(g,Object.assign({f:(x,z)=>o.f(x,z,p)},o.cfg(p)))}
      clearGroup(mk_);if(o.mark){const mm=o.mark(p);if(mm){const cfg=o.cfg(p);
        if(mm.zs!=null){const xs=cfg.xlog?lin(Math.log10(cfg.xr[0]),Math.log10(cfg.xr[1]),120).map(v=>10**v):lin(cfg.xr[0],cfg.xr[1],120);const pts=xs.map(x=>{const v=o.f(x,mm.zs,p);return isFinite(v)&&(!cfg.ylog||v>0)?sf.W(x,v,mm.zs).add(new THREE.Vector3(0,0.03,0)):null}).filter(Boolean);if(pts.length>1)mk_.add(tube(pts,0.04,'#ffffff',{ei:.6}))}
        if(mm.x!=null){const v=o.f(mm.x,mm.z,p);if(isFinite(v)&&(!cfg.ylog||v>0)){const P_=sf.W(mm.x,v,mm.z);const b=ball(0.13,'#ff5c8a',{ei:1.2});b.position.copy(P_);mk_.add(b);mk_.add(polyline([[P_.x,0,P_.z],[P_.x,P_.y,P_.z]],0xff5c8a,{dash:.1}));if(mm.lab)mk_.add(tlabel(mm.lab,{size:.3,pos:[P_.x,P_.y+0.45,P_.z],color:'#ffffff',bg:'rgba(10,15,22,.75)',depth:false,order:9}))}}}}},tick(){}}}})}

VIEWS.iv3={...surfView({title:'I-V surface: how one parameter reshapes the curve',sub:'White tube = the current slice · pink ball = your bias point',
  params:[SEL('dim','Third axis',[['T','temperature T'],['Vp','peak voltage V_P'],['Iv','excess level J_V'],['Ip','peak current I_P']],'T'),R('z','Slice position',0,1,0.01,0.4,'',{f:v=>(v*100).toFixed(0)+' %'}),R('V','Bias $V$',0,0.6,0.001,0.15,'V',{f:v=>v.toFixed(3)+' V'})],
  key:p=>p.dim,
  cfg:p=>{const Z={T:[220,420,'T (K)'],Vp:[0.04,0.12,'V_P (V)'],Iv:[0.1,2,'J_V (mA)'],Ip:[2,20,'I_P (mA)']}[p.dim];return {xr:[0,0.6],zr:[Z[0],Z[1]],yr:[0,18],xl:'V (V)',yl:'I (mA)',zl:Z[2],nx:80,nz:40}},
  f:(V,z,p)=>{const b=DEF;const m=p.dim==='T'?tModel(z,true):mk({...b,[p.dim]:z});return Math.min(18,Itot(m,V))},
  mark:p=>{const Z={T:[220,420],Vp:[0.04,0.12],Iv:[0.1,2],Ip:[2,20]}[p.dim];const z=lerp(Z[0],Z[1],p.z);return {zs:z,x:p.V,z,lab:'I = '+mA(Math.min(18,Itot(p.dim==='T'?tModel(z,true):mk({...DEF,[p.dim]:z}),p.V)))}},
  read:p=>{const Z={T:[220,420,'T','K'],Vp:[0.04,0.12,'V_P','V'],Iv:[0.1,2,'J_V','mA'],Ip:[2,20,'I_P','mA']}[p.dim];const z=lerp(Z[0],Z[1],p.z);const m=p.dim==='T'?tModel(z,true):mk({...DEF,[p.dim]:z});const P=pv(m,0.6);return [[Z[2],num(z,3)+' '+Z[3]],['peak',P.Vp.toFixed(3)+' V · '+mA(P.Ip)],['valley',P.Vv.toFixed(3)+' V · '+mA(P.Iv)],['PVR',P.pvr.toFixed(2)+' : 1']]}})};

VIEWS.tt3={...surfView({title:'T_t over barrier energy and field',sub:'Surface height = log₁₀ T_t from equation (24)',
  params:[R('m','Effective mass $m*$',0.02,0.5,0.01,0.05,'m₀',{f:v=>v.toFixed(2)+' m₀'}),R('E','Marker $E_x$',0.1,1.2,0.01,0.6,'eV',{f:v=>v.toFixed(2)+' eV'}),R('F','Marker $ℰ$',0.3,5,0.05,2,'MV/cm',{f:v=>v.toFixed(2)+' MV/cm'})],
  key:p=>String(p.m),cfg:()=>({xr:[0.1,1.2],zr:[0.3,5],yr:[-20,0],xl:'E_x (eV)',zl:'ℰ (MV/cm)',yl:'log₁₀ T_t',nx:70,nz:50}),
  f:(E,F,p)=>Math.max(-20,Math.log10(Ttun(E,F*1e8,p.m))),mark:p=>({x:p.E,z:p.F,lab:'T_t = '+num(Ttun(p.E,p.F*1e8,p.m),2)}),
  read:p=>{const K_=Kfac(p.E,p.F*1e8,p.m);return [['K',K_.toFixed(2)],['T_t',num(Math.exp(-K_),3),K_<7?'good':'bad']]}})};

VIEWS.jx3={...surfView({title:'Excess current over bias and defect density',sub:'log₁₀ J_x = log₁₀(C_2D_xT_t): more states and more bias both raise J_x',
  params:[R('V','Bias $V$',0,0.6,0.001,0.33,'V',{f:v=>v.toFixed(3)+' V'}),LR('D','Defect density (relative)',0.1,10,1,'×',{f:v=>num(v,2)+'×'}),R('C4','$C_4$',2,15,0.1,8,'V⁻¹',{f:v=>v.toFixed(1)})],
  key:p=>String(p.C4),cfg:()=>({xr:[0,0.6],zr:[0.1,10],zlog:true,yr:[-3,1.5],xl:'V (V)',zl:'D_x (rel.)',yl:'log₁₀ J_x (mA)',nx:70,nz:40}),
  f:(V,D,p)=>Math.log10(D*0.44*Math.exp(p.C4*(V-0.33))),mark:p=>({x:p.V,z:p.D,zs:p.D,lab:'J_x = '+mA(p.D*0.44*Math.exp(p.C4*(p.V-0.33)))}),
  read:p=>[['J_x',mA(p.D*0.44*Math.exp(p.C4*(p.V-0.33)))],['∝ D_x','linear'],['∝ V','exponential, slope C_4']]})};

VIEWS.jd3={...surfView({title:'Diffusion current over bias and temperature',sub:'log₁₀ J_d with J_0 ∝ T³ exp(−E_g/kT)',
  params:[R('V','Bias $V$',0,0.6,0.001,0.45,'V',{f:v=>v.toFixed(3)+' V'}),R('T','Temperature $T$',220,420,1,300,'K',{f:v=>v+' K'})],
  key:()=>'x',cfg:()=>({xr:[0,0.6],zr:[220,420],yr:[-10,3],xl:'V (V)',zl:'T (K)',yl:'log₁₀ J_d (mA)',nx:70,nz:40}),
  f:(V,T)=>Math.max(-10,Math.min(3,Math.log10(Id(tModel(T,true),V)+1e-30))),mark:p=>({x:p.V,z:p.T,zs:p.T,lab:'J_d = '+mA(Id(tModel(p.T,true),p.V))}),
  read:p=>[['J_d',mA(Id(tModel(p.T,true),p.V))],['kT/q',(KB*p.T*1000).toFixed(1)+' mV']]})};

VIEWS.temp3={...surfView({title:'I(V, T) surface',sub:'Peak ridge moves with temperature; diffusion wall rises steeply when hot',
  params:[SEL('dop','Doping',[['heavy','very heavy'],['light','lighter']],'heavy'),R('T','Slice $T$',220,420,1,300,'K',{f:v=>v+' K'}),R('V','Bias $V$',0,0.6,0.001,0.065,'V',{f:v=>v.toFixed(3)+' V'})],
  key:p=>p.dop,cfg:()=>({xr:[0,0.6],zr:[220,420],yr:[0,16],xl:'V (V)',zl:'T (K)',yl:'I (mA)',nx:80,nz:40}),
  f:(V,T,p)=>Math.min(16,Itot(tModel(T,p.dop==='heavy'),V)),mark:p=>({zs:p.T,x:p.V,z:p.T,lab:'I = '+mA(Itot(tModel(p.T,p.dop==='heavy'),p.V))}),
  read:p=>{const P=pv(tModel(p.T,p.dop==='heavy'),0.6);return [['I_P',mA(P.Ip)],['I_V',mA(P.Iv)],['PVR',P.pvr.toFixed(2)+' : 1']]}})};

function pvrModel(N,D){const T0=Ttun(0.66,2*0.86/(Wdep(2e19)*1e-9),0.05),T=Ttun(0.66,2*0.86/(Wdep(N)*1e-9),0.05);const Ip=10*T/T0;return {Ip,Iv:0.05*Ip+0.6*D}}
VIEWS.pvr3={...surfView({title:'PVR landscape over doping and defect density',sub:'High doping lifts I_P, clean crystal lowers I_V — the summit needs both',
  params:[LR('N','Doping $N$',5e18,2e20,2e19,'cm⁻³',{f:v=>num(v,2)+' cm⁻³'}),LR('D','Defect density (relative)',0.05,10,1,'×',{f:v=>num(v,2)+'×'})],
  key:()=>'x',cfg:()=>({xr:[5e18,2e20],xlog:true,zr:[0.05,10],zlog:true,yr:[-1,1.4],xl:'N (cm⁻³)',zl:'D_x (rel.)',yl:'log₁₀ PVR',nx:60,nz:40}),
  f:(N,D)=>{const q=pvrModel(N,D);return clamp(Math.log10(q.Ip/q.Iv),-1,1.4)},mark:p=>{const q=pvrModel(p.N,p.D);return {x:p.N,z:p.D,lab:'PVR '+(q.Ip/q.Iv).toFixed(1)}},
  read:p=>{const q=pvrModel(p.N,p.D);return [['I_P (rel.)',q.Ip.toFixed(2)],['I_V (rel.)',q.Iv.toFixed(2)],['PVR',(q.Ip/q.Iv).toFixed(1)+' : 1',q.Ip/q.Iv>8?'good':'warn']]}})};

VIEWS.rmin3={...surfView({title:'R_{min} ≈ 2V_P/I_P over peak voltage and current',sub:'Large I_P gives a small, strong negative resistance',
  params:[R('Vp','$V_P$',0.04,0.2,0.001,0.1,'V',{f:v=>v.toFixed(3)+' V'}),LR('Ip','$I_P$',1,50,20,'mA',{f:v=>v.toFixed(1)+' mA'})],
  key:()=>'x',cfg:()=>({xr:[0.04,0.2],zr:[1,50],zlog:true,yr:[0,2.7],xl:'V_P (V)',zl:'I_P (mA)',yl:'log₁₀ R_{min} (Ω)',nx:60,nz:50}),
  f:(Vp,Ip)=>Math.log10(2*Vp/(Ip*1e-3)),mark:p=>({x:p.Vp,z:p.Ip,zs:p.Ip,lab:'R_{min} = '+(2*p.Vp/(p.Ip*1e-3)).toFixed(1)+' Ω'}),
  read:p=>[['R_{min}',(2*p.Vp/(p.Ip*1e-3)).toFixed(2)+' Ω'],['r_d','−'+(2*p.Vp/(p.Ip*1e-3)).toFixed(2)+' Ω']]})};

VIEWS.fr3={...surfView({title:'Resistive cutoff f_r over R and C_j',sub:'Flat floor where R ≤ R_s: no net negative resistance at any frequency',
  params:[R('Rs','Series $R_s$',0.2,10,0.1,1,'Ω',{f:v=>v.toFixed(1)+' Ω'}),R('R','Marker $R$',2,60,0.5,10,'Ω',{f:v=>v.toFixed(1)+' Ω'}),LR('Cj','Marker $C_j$',0.2,10,1,'pF',{f:v=>si(v*1e-12,'F')})],
  key:p=>String(p.Rs),cfg:()=>({xr:[2,60],zr:[0.2,10],zlog:true,yr:[-1,2.5],xl:'R (Ω)',zl:'C_j (pF)',yl:'log₁₀ f_r (GHz)',nx:70,nz:44}),
  f:(R_,Cj,p)=>{const v=fr(R_,p.Rs,Cj*1e-12);return isNaN(v)?-1:clamp(Math.log10(v/1e9),-1,2.5)},mark:p=>({x:p.R,z:p.Cj,zs:p.Cj,lab:'f_r = '+si(fr(p.R,p.Rs,p.Cj*1e-12),'Hz')}),
  read:p=>[['f_r',si(fr(p.R,p.Rs,p.Cj*1e-12),'Hz')],['R/R_s',(p.R/p.Rs).toFixed(2),p.R>p.Rs?'good':'bad']]})};

VIEWS.fx3={...surfView({title:'Self-resonant frequency f_x over L_s and C_j',sub:'Holes where L_s ≥ R²C_j: f_x is not real',
  params:[R('R','$R$',2,60,0.5,10,'Ω',{f:v=>v.toFixed(1)+' Ω'}),LR('Ls','Marker $L_s$',1,2000,5,'pH',{f:v=>si(v*1e-12,'H')}),LR('Cj','Marker $C_j$',0.2,10,1,'pF',{f:v=>si(v*1e-12,'F')})],
  key:p=>String(p.R),cfg:()=>({xr:[1,2000],xlog:true,zr:[0.2,10],zlog:true,yr:[0,3],xl:'L_s (pH)',zl:'C_j (pF)',yl:'log₁₀ f_x (GHz)',nx:64,nz:44}),
  f:(L,Cj,p)=>{const v=fx(p.R,Cj*1e-12,L*1e-12);return isNaN(v)?NaN:clamp(Math.log10(v/1e9),0,3)},mark:p=>({x:p.Ls,z:p.Cj,zs:p.Cj,lab:'f_x = '+si(fx(p.R,p.Cj*1e-12,p.Ls*1e-12),'Hz')}),
  read:p=>[['f_x',si(fx(p.R,p.Cj*1e-12,p.Ls*1e-12),'Hz')],['R²C_j',si(p.R*p.R*p.Cj*1e-12,'H')],['L_s < R²C_j?',p.Ls*1e-12<p.R*p.R*p.Cj*1e-12?'yes · real f_x':'no',p.Ls*1e-12<p.R*p.R*p.Cj*1e-12?'good':'bad']]})};

/* ---------- three current curtains ---------- */
VIEWS.comp3=V3({title:'The three current components as curtains',sub:'J_t, J_x, J_d and their sum J — the glass plane marks your bias',home:{r:14,th:0.95,ph:1.12,t:[0,1.2,0]},
  params:[MATSEL,R('V','Bias $V$',0,1.3,0.001,0.2,'V',{f:v=>v.toFixed(3)+' V'}),K('logy','Logarithmic height',false)],
  build(S){const g=new THREE.Group(),mk_=new THREE.Group();S.root.add(g,mk_);let key='',map;
    const lanes=[['J_t',It,'#5b9cff',-1.8],['J_x',Ix,'#f6b23c',-0.6],['J_d',Id,'#3fd29b',0.6],['J',Itot,'#eef3fa',1.8]];
    return {update(p){const mt=MATS[p.mat],P=mt.P,Vmax=mt.Vmax;const yr=p.logy?[P.Iv*0.01,P.Ip*5]:[0,P.Ip*1.3];const k=p.mat+p.logy;
      const ax0={X:v=>-3.6+v/Vmax*7.2,Y:v=>3.2*frac(clamp(v,yr[0],yr[1]),yr,p.logy)};
      if(k!==key){key=k;clearGroup(g);axes3(g,{size:[7.2,3.2,4.8],xr:[0,Vmax],zr:[0,1],yr,ylog:p.logy,xl:'V (V)',yl:'I (mA)',noZ:true});
        for(const [n,f,c,z] of lanes){const N=160,pos=[],idx=[];for(let i=0;i<N;i++){const v=Vmax*i/(N-1),y=ax0.Y(f(mt.m,Math.max(1e-4,v)));pos.push(ax0.X(v),0,z,ax0.X(v),y,z)}for(let i=0;i<N-1;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}
          const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);g.add(new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:n==='J'?.16:.26,side:THREE.DoubleSide,depthWrite:false})));
          g.add(tube(Array.from({length:N},(_,i)=>{const v=Vmax*i/(N-1);return [ax0.X(v),ax0.Y(f(mt.m,Math.max(1e-4,v))),z]}),n==='J'?0.04:0.03,c,{ei:.7,seg:N}));
          g.add(tlabel(n,{size:.38,pos:[-4.2,0.35,z],color:c}))}}
      clearGroup(mk_);const V=Math.min(p.V,Vmax),x=ax0.X(V);const pl_=new THREE.Mesh(new THREE.PlaneGeometry(4.6,3.4),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.07,side:THREE.DoubleSide,depthWrite:false}));pl_.rotation.y=Math.PI/2;pl_.position.set(x,1.7,0);mk_.add(pl_);
      const pe=new THREE.LineSegments(new THREE.EdgesGeometry(pl_.geometry),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.4}));pe.rotation.y=Math.PI/2;pe.position.copy(pl_.position);mk_.add(pe);
      for(const [n,f,c,z] of lanes){const v=f(mt.m,Math.max(1e-4,V));const b=ball(0.1,c,{ei:1});b.position.set(x,ax0.Y(v),z);mk_.add(b);mk_.add(tlabel(mA(v),{size:.26,pos:[x+0.6,ax0.Y(v)+0.25,z],color:c,bg:'rgba(10,15,22,.7)',depth:false,order:9}))}},tick(){}}},
  read(p){const m=MATS[p.mat].m,V=Math.min(p.V,MATS[p.mat].Vmax);return [['J_t',mA(It(m,V))],['J_x',mA(Ix(m,V))],['J_d',mA(Id(m,V))],['J',mA(Itot(m,V))],['region',REGNAME[region(m,V,MATS[p.mat].P)],regCls(region(m,V,MATS[p.mat].P))]]}
});

/* ---------- PVR bars ---------- */
VIEWS.bars=V3({title:'Material comparison',sub:'Bar height for the chosen metric; values from the tuned model',home:{r:12,th:0.55,ph:1.15,t:[0,1.5,0]},
  params:[SEL('met','Metric',[['pvr','peak-to-valley ratio'],['Ip','peak current I_P'],['Iv','valley current I_V'],['Vv','valley voltage V_V']],'pvr')],
  build(S){const g=S.root,bars=[],keys=['Si','Ge','GaSb','GaAs'];
    const fl=new THREE.Mesh(new THREE.PlaneGeometry(10,5),mat('#101826'));fl.rotation.x=-Math.PI/2;g.add(fl);g.add(new THREE.GridHelper(10,20,0x2a3a52,0x1a2536));
    keys.forEach((k,i)=>{const c=MATS[k].col;const b=new THREE.Mesh(new THREE.BoxGeometry(1.1,1,1.1),mat(c,{emissive:c,emissiveIntensity:.35,roughness:.3}));b.position.set(-3.3+i*2.2,0.5,0);b.userData={h:0.01,tgt:1};g.add(b);bars.push(b);
      g.add(tlabel(k,{size:.42,pos:[-3.3+i*2.2,-0.01,1.1],color:c,weight:600}))});
    let labs=[];
    return {update(p){labs.forEach(l=>{g.remove(l);disposeObj(l)});labs=[];const v=keys.map(k=>({pvr:MATS[k].P.pvr,Ip:MATS[k].P.Ip,Iv:MATS[k].P.Iv,Vv:MATS[k].P.Vv})[p.met]);const mx=Math.max(...v);
      const u={pvr:' : 1',Ip:' mA',Iv:' mA',Vv:' V'}[p.met];bars.forEach((b,i)=>{b.userData.tgt=Math.max(0.05,v[i]/mx*4);const l=tlabel(num(v[i],3)+u,{size:.34,color:'#ffffff',bg:'rgba(10,15,22,.7)'});b.userData.l=l;labs.push(l);g.add(l)})},
      tick(t,dt){bars.forEach(b=>{b.userData.h=lerp(b.userData.h,b.userData.tgt,MOTION?Math.min(1,dt*4):1);b.scale.y=b.userData.h;b.position.y=b.userData.h/2;if(b.userData.l)b.userData.l.position.set(b.position.x,b.userData.h+0.4,0)})}}},
  read(){return ['Si','Ge','GaSb','GaAs'].map(k=>[k,MATS[k].P.pvr.toFixed(1)+' : 1'])}
});

/* ---------- fabrication processes ---------- */
const FABSTAGE={
  ball:[[0,0.2,'Alloy pellet (Sn + As) placed on p⁺-Ge'],[0.2,0.4,'Heating in H₂ / inert gas'],[0.4,0.7,'Pellet melts, As diffuses into Ge'],[0.7,1,'Cooling: n⁺ regrowth layer → n⁺–p⁺ junction']],
  pulse:[[0,0.35,'Alloy-tipped wire lowered onto substrate'],[0.35,0.5,'Short current pulse'],[0.5,1,'Contact and junction form at the same time']],
  planar:[[0,0.25,'Oxide mask grown on wafer'],[0.25,0.45,'Window opened in the oxide'],[0.45,0.75,'Counter-dopant diffused / alloyed through window'],[0.75,1,'Metal contact deposited']],
  mbe:[[0,0.45,'p⁺ layer: Ga + As + Be beams (UHV)'],[0.45,0.55,'Shutter switch — abrupt interface'],[0.55,1,'n⁺ layer: Ga + As + Si beams']],
  mocvd:[[0,0.5,'Metal-organic + hydride gases flow over hot susceptor'],[0.5,1,'Precursors crack at the surface → epitaxial layer grows']]
};
VIEWS.fab=V3({title:'Fabrication process — animated',sub:'Timeline loops; read the current stage below',home:{r:12,th:0.6,ph:1.1,t:[0,0.6,0]},
  params:[SEL('proc','Process',[['ball','14.1 Ball alloy'],['pulse','14.2 Pulse bond'],['planar','14.3 Planar'],['mbe','14.4.1 MBE'],['mocvd','14.4.2 MOCVD']],'ball'),R('sp','Speed',0.2,2,0.1,1,'×',{f:v=>v.toFixed(1)+'×'}),K('lab','Labels',true)],
  build(S){const g=S.root,dyn=new THREE.Group();g.add(dyn);let tk=()=>{},sp=1,proc='ball';S.fab={u:0};
    const plat=new THREE.Mesh(new THREE.CylinderGeometry(6,6,0.2,64),mat('#0f1724'));plat.position.y=-1.1;g.add(plat);
    const L=(s,pos,c='#c9d3e1',sz=.3)=>{const l=tlabel(s,{size:sz,pos,color:c,font:SANS});dyn.add(l);return l};
    const builders={
      ball(p){const sub=new THREE.Mesh(new THREE.BoxGeometry(5,1.2,3.4),mat('#8a5a2b',{emissive:'#3a1a00',emissiveIntensity:.3}));sub.position.y=-0.4;dyn.add(sub);
        const bl=ball(0.6,'#c8ccd6',{ei:.1,seg:32});dyn.add(bl);const lens=new THREE.Mesh(new THREE.SphereGeometry(1,40,20,0,Math.PI*2,Math.PI/2,Math.PI/2),mat('#5b9cff',{transparent:true,opacity:.75,emissive:'#5b9cff',emissiveIntensity:.4}));lens.position.y=0.2;dyn.add(lens);
        const dops=[];for(let i=0;i<40;i++){const d=ball(0.05,'#7fe9ff',{ei:1.2});d.userData={a:i*2.4,r:(i%7)/7};dyn.add(d);dops.push(d)}
        const gas=[];const r2=rng(3);for(let i=0;i<50;i++){const d=ball(0.035,'#9fb3d1',{op:.5});d.userData={x:lerp(-5,5,r2()),y:lerp(0.5,3.5,r2()),z:lerp(-2,2,r2()),s:r2()};dyn.add(d);gas.push(d)}
        if(p.lab){L('p⁺-Ge substrate',[-2.2,-0.4,1.9],'#ffc78a');L('Sn + As alloy pellet',[1.9,1.9,0]);L('H₂ atmosphere',[-3.5,3.2,0],'#9fb3d1')}const nl=p.lab?L('n⁺ regrowth region',[2.3,-0.2,1.9],'#8fbaff'):null;
        return u=>{const drop=smooth(u/0.2),heat=smooth((u-0.2)/0.2)*(1-smooth((u-0.75)/0.25)),melt=smooth((u-0.4)/0.3),grow=smooth((u-0.4)/0.45);
          bl.position.y=lerp(3,0.2+0.6*(1-melt*0.55),drop);bl.scale.set(1+melt*0.5,1-melt*0.55,1+melt*0.5);bl.material.emissive.set(heat>0.05?'#ff7a2a':'#c8ccd6');bl.material.emissiveIntensity=0.1+heat*0.9;sub.material.emissiveIntensity=0.3+heat*0.6;
          lens.scale.set(0.2+grow*1.0,0.01+grow*0.55,0.2+grow*0.9);lens.visible=grow>0.01;if(nl)nl.visible=grow>0.3;
          dops.forEach(d=>{const k=((u-0.4)/0.4+d.userData.r)%1;d.visible=u>0.4&&u<0.85;const a=d.userData.a,rr=k*0.9;d.position.set(Math.cos(a)*rr*0.9,0.25-k*0.55,Math.sin(a)*rr*0.8)});
          gas.forEach((d,i)=>{d.position.set(d.userData.x+Math.sin(u*20+i)*0.2,d.userData.y+Math.sin(u*14+i*2)*0.15,d.userData.z)})}},
      pulse(p){const sub=new THREE.Mesh(new THREE.BoxGeometry(5,1.2,3.4),mat('#8a5a2b'));sub.position.y=-0.4;dyn.add(sub);
        const wire=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,4,12),mat('#d9dee8',{metalness:.6,roughness:.3}));dyn.add(wire);const tip=ball(0.18,'#c8ccd6');dyn.add(tip);
        const lens=new THREE.Mesh(new THREE.SphereGeometry(0.6,32,16,0,Math.PI*2,Math.PI/2,Math.PI/2),mat('#5b9cff',{transparent:true,opacity:.8,emissive:'#5b9cff',emissiveIntensity:.5}));lens.position.y=0.2;dyn.add(lens);
        const ring=new THREE.Mesh(new THREE.TorusGeometry(1,0.03,8,48),new THREE.MeshBasicMaterial({color:0xfff2a8,transparent:true}));ring.rotation.x=Math.PI/2;ring.position.y=0.22;dyn.add(ring);
        const flash=new THREE.PointLight(0xfff2a8,0,8);flash.position.set(0,0.8,0);dyn.add(flash);
        if(p.lab){L('alloy-tipped wire',[1.6,2.6,0]);L('p⁺ substrate',[-2.2,-0.4,1.9],'#ffc78a')}const nl=p.lab?L('contact + junction',[1.9,0.6,1.2],'#8fbaff'):null;
        return u=>{const d=smooth(u/0.35);wire.position.y=lerp(4.6,2.45,d);tip.position.y=wire.position.y-2;const pl_=u>0.35&&u<0.5?Math.sin((u-0.35)/0.15*Math.PI):0;flash.intensity=pl_*6;ring.scale.setScalar(0.2+((u-0.35)/0.15)*2.5);ring.visible=pl_>0;ring.material.opacity=pl_;
          const gr=smooth((u-0.38)/0.12);lens.scale.set(gr,gr*0.7,gr);lens.visible=gr>0.01;if(nl)nl.visible=gr>0.5;tip.material.emissiveIntensity=0.2+pl_*2}},
      planar(p){const sub=new THREE.Mesh(new THREE.BoxGeometry(6,1,4),mat('#8a5a2b'));sub.position.y=-0.5;dyn.add(sub);
        const ox=[];const mkox=(x,w)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,0.25,4),mat('#dfe7f3',{transparent:true,opacity:.55}));o.position.set(x,0.12,0);dyn.add(o);ox.push(o);return o};
        const oL=mkox(-1.85,2.3),oR=mkox(1.85,2.3),oM=mkox(0,1.4);const well=new THREE.Mesh(new THREE.BoxGeometry(1.4,0.6,2.2),mat('#5b9cff',{transparent:true,opacity:.75,emissive:'#5b9cff',emissiveIntensity:.4}));dyn.add(well);
        const pad=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.18,2.4),mat('#d4b45a',{metalness:.7,roughness:.3}));dyn.add(pad);
        const rain=[];const r2=rng(9);for(let i=0;i<60;i++){const d=ball(0.045,'#7fe9ff',{ei:1.1});d.userData={x:lerp(-2.8,2.8,r2()),z:lerp(-1.8,1.8,r2()),o:r2()};dyn.add(d);rain.push(d)}
        if(p.lab){L('SiO₂ mask',[-2.2,0.7,2.2]);L('heavily doped substrate',[-2.2,-0.6,2.2],'#ffc78a')}const nl=p.lab?L('diffused n⁺ region',[1.9,-0.3,2.2],'#8fbaff'):null;
        return u=>{const op=1-smooth((u-0.25)/0.2);oM.scale.y=Math.max(0.01,op);oM.visible=op>0.02;ox.forEach(o=>o.scale.set(1,smooth(u/0.2)+0.001,1));
          const gr=smooth((u-0.45)/0.3);well.scale.set(1,Math.max(0.01,gr),1);well.position.y=-0.3*gr+0.01;well.visible=gr>0.02;if(nl)nl.visible=gr>0.4;
          rain.forEach(d=>{const k=(u*6+d.userData.o)%1;d.visible=u>0.45&&u<0.75;const y=3-k*3.2;const inside=Math.abs(d.userData.x)<0.7&&Math.abs(d.userData.z)<1.1;d.position.set(d.userData.x,inside?y:Math.max(0.35,y),d.userData.z)});
          const pd=smooth((u-0.78)/0.15);pad.visible=pd>0.01;pad.position.y=lerp(2.5,0.35,pd)}},
      mbe(p){const ch=new THREE.Mesh(new THREE.SphereGeometry(4.6,32,20),new THREE.MeshBasicMaterial({color:0x6ea2ff,wireframe:true,transparent:true,opacity:.07}));ch.position.y=1;dyn.add(ch);
        const hold=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.4,0.15,40),mat('#5d6675',{metalness:.6}));hold.position.y=3.0;dyn.add(hold);
        const lay=[];const cols=['#f6b23c','#5b9cff'];for(let i=0;i<2;i++){const l=new THREE.Mesh(new THREE.CylinderGeometry(1.25,1.25,0.01,40),mat(cols[i],{emissive:cols[i],emissiveIntensity:.35}));dyn.add(l);lay.push(l)}
        const cells=[['Ga','#ffd166',-2.6],['As','#a98bff',0],['Be / Si','#ff6b5b',2.6]];const beams=[];
        cells.forEach(([n,c,x],i)=>{const cn=new THREE.Mesh(new THREE.ConeGeometry(0.45,1.1,24,1,true),mat(c,{side:THREE.DoubleSide,emissive:c,emissiveIntensity:.3}));cn.position.set(x,-0.5,0.6*(i-1));cn.lookAt(0,3,0);cn.rotateX(Math.PI/2);dyn.add(cn);if(p.lab)L(n+' cell',[x,-1.3,0.6*(i-1)],c);
          for(let k=0;k<26;k++){const d=ball(0.05,c,{ei:1.2});d.userData={o:k/26,from:new THREE.Vector3(x,-0.3,0.6*(i-1)),j:new THREE.Vector3((Math.random()-.5)*1.4,0,(Math.random()-.5)*1.4),cell:i};dyn.add(d);beams.push(d)}});
        if(p.lab){L('ultra-high vacuum',[-3.6,4.4,0],'#9fb3d1');L('heated rotating substrate',[2.7,3.4,0])}
        return (u,t)=>{hold.rotation.y=t*0.8;const t1=smooth(u/0.45),t2=smooth((u-0.55)/0.45);lay[0].scale.y=Math.max(1,t1*30);lay[0].position.y=2.92-0.005*lay[0].scale.y;lay[1].scale.y=Math.max(1,t2*30);lay[1].position.y=lay[0].position.y-0.005*lay[0].scale.y-0.005*lay[1].scale.y;lay[1].visible=u>0.55;
          beams.forEach(d=>{const k=(t*0.9+d.userData.o)%1;const on=d.userData.cell<2?(u<0.45||u>0.55):true;d.visible=on;const to=new THREE.Vector3(0,2.85,0).add(d.userData.j);d.position.lerpVectors(d.userData.from,to,k);d.material.color.set(d.userData.cell===2?(u<0.5?'#ff6b5b':'#7fe9ff'):d.material.color)})}},
      mocvd(p){const tube_=new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.6,9,40,1,true),new THREE.MeshStandardMaterial({color:0x9fc4ff,transparent:true,opacity:.12,side:THREE.DoubleSide,depthWrite:false}));tube_.rotation.z=Math.PI/2;tube_.position.y=0.6;dyn.add(tube_);
        const sus=new THREE.Mesh(new THREE.BoxGeometry(3.2,0.4,2),mat('#5a2a1a',{emissive:'#ff4a1a',emissiveIntensity:.6}));sus.position.y=-0.5;dyn.add(sus);
        const waf=new THREE.Mesh(new THREE.CylinderGeometry(0.9,0.9,0.06,40),mat('#8a5a2b'));waf.position.y=-0.27;dyn.add(waf);const film=new THREE.Mesh(new THREE.CylinderGeometry(0.9,0.9,0.01,40),mat('#5b9cff',{emissive:'#5b9cff',emissiveIntensity:.4}));dyn.add(film);
        const gas=[];const r2=rng(17);const gc=['#ffd166','#a98bff','#7fe9ff'];for(let i=0;i<120;i++){const d=ball(0.05,gc[i%3],{ei:1});d.userData={o:r2(),y:lerp(-0.1,1.9,r2()),z:lerp(-1.2,1.2,r2())};dyn.add(d);gas.push(d)}
        if(p.lab){L('TMGa + AsH₃ + dopant gas →',[-3.2,2.6,0]);L('heated susceptor',[0,-1.2,1.4],'#ff9a7a');L('exhaust →',[4.0,2.6,0],'#9fb3d1')}
        return (u,t)=>{const gr=smooth(u);film.scale.y=Math.max(1,gr*25);film.position.y=-0.24+0.005*film.scale.y;sus.material.emissiveIntensity=0.5+0.2*Math.sin(t*3);
          gas.forEach(d=>{const sp_=0.35+0.25*(1-Math.abs(d.userData.y-0.9)/1.0);const k=(t*sp_*0.5+d.userData.o)%1;const x=lerp(-4.4,4.4,k);let y=d.userData.y;if(Math.abs(x)<1.6&&y<0.6){y=lerp(y,-0.2,1-Math.abs(x)/1.6)}d.position.set(x,y,d.userData.z);d.material.opacity=1;d.visible=!(Math.abs(x)<0.9&&y<-0.1)})}}
    };
    return {update(p){sp=p.sp;if(p.proc!==proc||!S.fab.built||p.lab!==S.fab.lab){proc=p.proc;S.fab.lab=p.lab;clearGroup(dyn);tk=builders[p.proc](p);S.fab.built=1;S.fab.t0=null}S.fab.proc=p.proc},
      tick(t){if(S.fab.t0==null)S.fab.t0=t;const u=MOTION?((t-S.fab.t0)*0.1*sp)%1:0.85;S.fab.u=u;tk(u,t)}}},
  read(p,S){const st=FABSTAGE[p.proc],u=(S.fab&&S.fab.u)||0;const cur=st.find(([a,b])=>u>=a&&u<b)||st[st.length-1];return [['stage',cur[2]],['progress',(u*100).toFixed(0)+' %'],['step',(st.indexOf(cur)+1)+' / '+st.length]]},live:true
});

/* ---------- equivalent circuit ---------- */
VIEWS.circ=V3({title:'Small-signal equivalent circuit',sub:'L_s and R_s in series with C_j ∥ (−R). Moving dots show current; −R pushes energy back into the circuit',home:{r:13,th:0.32,ph:1.02,t:[0.3,-0.3,0]},
  params:[SEL('hl','Highlight',[['all','all elements'],['Ls','L_s · lead inductance'],['Rs','R_s · series resistance'],['Cj','C_j · junction capacitance'],['R','−R · negative resistance']],'all'),K('flow','Animate current',true)],
  build(S){const g=S.root,parts={},dots=[];
    const board=new THREE.Mesh(new THREE.BoxGeometry(12,0.15,6),mat('#0f2a22',{emissive:'#06150f',emissiveIntensity:.5}));board.position.y=-1.6;g.add(board);
    const wire=(pts)=>{g.add(tube(pts,0.05,'#c9a24a',{ei:.15}))};
    const path1=[[-5,0,0],[-4,0,0]],y0=0;
    // terminal
    const t1=new THREE.Mesh(new THREE.TorusGeometry(0.2,0.06,10,24),mat('#d9dee8',{metalness:.7}));t1.position.set(-5.2,0,0);t1.rotation.y=Math.PI/2;g.add(t1);
    const t2=t1.clone();t2.position.set(-5.2,-1.2,0);g.add(t2);g.add(tlabel('Z_{in}',{size:.42,pos:[-5.9,-0.6,0],color:'#ffffff',font:MATHF}));
    wire([[-5,0,0],[-4.2,0,0]]);
    // inductor coil
    const coil=[];for(let i=0;i<=160;i++){const a=i/160*Math.PI*2*7;coil.push(new THREE.Vector3(-4.2+i/160*2.0,0.32*Math.sin(a),0.32*Math.cos(a)))}
    const L_=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coil),400,0.05,8),mat('#e08a4a',{emissive:'#e08a4a',emissiveIntensity:.3,metalness:.6}));g.add(L_);parts.Ls=[L_];
    wire([[-2.2,0,0],[-1.6,0,0]]);
    // resistor
    const Rb=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.28,1.5,24),mat('#c7b38a'));Rb.rotation.z=Math.PI/2;Rb.position.set(-0.85,0,0);g.add(Rb);parts.Rs=[Rb];
    ['#7a4a1a','#111111','#d4302a','#d4b45a'].forEach((c,i)=>{const b=new THREE.Mesh(new THREE.CylinderGeometry(0.29,0.29,0.1,24),mat(c));b.rotation.z=Math.PI/2;b.position.set(-1.35+i*0.3,0,0);g.add(b)});
    wire([[-0.1,0,0],[2.0,0,0]]);wire([[2,0,0],[2,0,-1.1],[2,-0.15,-1.1]]);wire([[2,0,0],[2,0,1.1],[2,-0.15,1.1]]);
    // capacitor branch (z=-1.1)
    const pA=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.06,0.9),mat('#b9c3d3',{metalness:.7}));pA.position.set(2,-0.25,-1.1);const pB=pA.clone();pB.position.y=-0.75;g.add(pA,pB);parts.Cj=[pA,pB];
    wire([[2,-0.85,-1.1],[2,-1.2,-1.1]]);
    // -R branch (z=+1.1)
    const nr=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.75,0.6),mat('#3a1630',{emissive:'#ff5c8a',emissiveIntensity:.25}));nr.position.set(2,-0.55,1.1);g.add(nr);parts.R=[nr];
    wire([[2,-0.93,1.1],[2,-1.2,1.1]]);wire([[2,-1.2,-1.1],[2,-1.2,1.1]]);wire([[2,-1.2,0],[-5,-1.2,0]]);
    const box=new THREE.Mesh(new THREE.BoxGeometry(1.8,1.6,3.4),new THREE.MeshBasicMaterial({color:0x6ea2ff,transparent:true,opacity:.05,depthWrite:false}));box.position.set(2,-0.55,0);g.add(box);
    const bxe=new THREE.LineSegments(new THREE.EdgesGeometry(box.geometry),new THREE.LineBasicMaterial({color:0x6ea2ff,transparent:true,opacity:.5}));bxe.position.copy(box.position);g.add(bxe);
    const lab={Ls:tlabel('L_s',{size:.42,pos:[-3.2,0.85,0],color:'#ffb27a',font:MATHF}),Rs:tlabel('R_s',{size:.42,pos:[-0.85,0.75,0],color:'#e8d5a8',font:MATHF}),Cj:tlabel('C_j',{size:.42,pos:[2,0.05,-1.85],color:'#c9d3e1',font:MATHF}),R:tlabel('−R',{size:.42,pos:[2,0.05,1.85],color:'#ff9ab4',font:MATHF})};
    Object.values(lab).forEach(l=>g.add(l));g.add(tlabel('intrinsic tunnel diode',{size:.3,pos:[2,1.75,0],color:'#8fbaff',font:SANS}));g.add(tlabel('interconnect · lead · contact',{size:.26,pos:[-2.4,1.5,0],color:'#9fb3d1',font:SANS}));
    const info={Ls:'reactance ωL_s grows with f — resonates with C_j',Rs:'R_s wastes power, cancels part of −R',Cj:'C_j ≈ εA/W_d shunts −R at high f',R:'−R = dV/dI < 0 at the NDR bias'};
    let infoL=null;
    const main=new THREE.CatmullRomCurve3([[-5,0,0],[2,0,0],[2,-1.2,0],[-5,-1.2,0]].map(a=>new THREE.Vector3(...a)),false,'catmullrom',0);
    for(let i=0;i<30;i++){const d=ball(0.07,'#7fe9ff',{ei:1.3});d.userData={o:i/30};g.add(d);dots.push(d)}
    let flow=true;
    return {update(p){flow=p.flow;for(const k in parts)parts[k].forEach(m=>{m.material.emissiveIntensity=(p.hl===k)?1.0:(p.hl==='all'?0.3:0.06)});for(const k in lab)lab[k].material.opacity=p.hl==='all'||p.hl===k?1:0.3;
        if(infoL){g.remove(infoL);disposeObj(infoL);infoL=null}if(p.hl!=='all'){infoL=tlabel(info[p.hl],{size:.3,pos:[0,2.3,0],color:'#ffffff',font:SANS,bg:'rgba(10,15,22,.8)'});g.add(infoL)}},
      tick(t){dots.forEach(d=>{const u=flow&&MOTION?(d.userData.o+t*0.12+0.04*Math.sin(t*3))%1:d.userData.o;const P_=new THREE.Vector3();const s=u;
        if(s<0.4)P_.set(-5+s/0.4*7,0,0);else if(s<0.5){const k=(s-0.4)/0.1,z=(d.userData.o*30%2<1)?-1.1:1.1;P_.set(2,-k*1.2,z)}else P_.set(2-(s-0.5)/0.5*7,-1.2,0);d.position.copy(P_)})}}},
  read(p){const r={all:['elements','L_s, R_s, C_j, −R'],Ls:['X_L','ωL_s'],Rs:['condition','R > R_s for net −R'],Cj:['C_j','≈ εA/W_d'],R:['−R','dV/dI at NDR bias']}[p.hl];return [r,['memory','R_s wastes · C_j shunts · L_s resonates']]}
});

/* ---------- parallel plate junction capacitance ---------- */
VIEWS.cap=V3({title:'Junction capacitance C_j ≈ εA/W_d',sub:'Depletion layer as a parallel-plate capacitor: uncovered donor (+) and acceptor (−) charge',home:{r:11,th:0.7,ph:1.15,t:[0,0,0]},
  params:[LR('A','Junction area $A$',10,5000,500,'µm²',{f:v=>num(v,3)+' µm²'}),R('W','Depletion width $W_d$',3,30,0.1,8,'nm',{f:v=>v.toFixed(1)+' nm'}),R('er','Relative permittivity $ε_r$',10,16.5,0.1,16,'',{f:v=>v.toFixed(1)})],
  build(S){const g=S.root,dyn=new THREE.Group();g.add(dyn);let arrows=[];
    return {update(p){clearGroup(dyn);arrows=[];const s=1.2+Math.sqrt(p.A/5000)*4.2,d=0.3+p.W/30*3.4;
      const plate=(y,c)=>{const m_=new THREE.Mesh(new THREE.BoxGeometry(s,0.1,s),mat(c,{metalness:.5,emissive:c,emissiveIntensity:.2}));m_.position.y=y;dyn.add(m_);return m_};
      plate(d/2,'#5b9cff');plate(-d/2,'#f6b23c');
      const di=new THREE.Mesh(new THREE.BoxGeometry(s,d-0.1,s),new THREE.MeshBasicMaterial({color:0xff5c8a,transparent:true,opacity:.07,depthWrite:false}));dyn.add(di);
      const n=Math.max(2,Math.round(s/0.7));for(let i=0;i<n;i++)for(let j=0;j<n;j++){const x=lerp(-s/2+0.3,s/2-0.3,n>1?i/(n-1):0.5),z=lerp(-s/2+0.3,s/2-0.3,n>1?j/(n-1):0.5);
        const pp=ball(0.08,'#7fb2ff',{ei:.9});pp.position.set(x,d/2+0.12,z);dyn.add(pp);const mm=ball(0.08,'#ffb347',{ei:.9});mm.position.set(x,-d/2-0.12,z);dyn.add(mm);
        if((i+j)%2===0){const ar=new THREE.ArrowHelper(new THREE.Vector3(0,-1,0),new THREE.Vector3(x,d/2-0.06,z),d-0.15,0xff5c8a,Math.min(0.2,d*0.25),0.1);dyn.add(ar);arrows.push(ar)}}
      dyn.add(tlabel('n⁺ edge (+ donors)',{size:.3,pos:[s/2+1.3,d/2,0],color:'#8fbaff',font:SANS}));dyn.add(tlabel('p⁺ edge (− acceptors)',{size:.3,pos:[s/2+1.3,-d/2,0],color:'#ffc78a',font:SANS}));
      dyn.add(polyline([[-s/2-0.4,d/2,s/2],[-s/2-0.4,-d/2,s/2]],0xffffff));dyn.add(tlabel('W_d',{size:.32,pos:[-s/2-0.8,0,s/2],color:'#ffffff'}));
      const C_=p.er*EPS0*p.A*1e-12/(p.W*1e-9);dyn.add(tlabel('C_j = '+si(C_,'F'),{size:.42,pos:[0,d/2+1.0,0],color:'#ffffff',bg:'rgba(10,15,22,.7)'}))},
      tick(t){arrows.forEach((a,i)=>{a.setColor(new THREE.Color().setHSL(0.94,0.9,0.55+0.15*Math.sin(t*3+i)))})}}},
  read(p){const C_=p.er*EPS0*p.A*1e-12/(p.W*1e-9);return [['C_j',si(C_,'F')],['A ×2 → C_j','×2'],['W_d ÷2 → C_j','×2'],['ε',si(p.er*EPS0,'F/m')]]}
});

/* ---------- spreading resistance ---------- */
VIEWS.spread=V3({title:'Spreading resistance R_{spread} ≈ ρ/2d',sub:'Current leaves a small contact of diameter d and fans out into the bulk',home:{r:11,th:0.6,ph:1.0,t:[0,-0.6,0]},
  params:[R('d','Contact diameter $d$',2,50,0.5,10,'µm',{f:v=>v.toFixed(1)+' µm'}),LR('rho','Resistivity $ρ$',0.1,10,1,'mΩ·cm',{f:v=>num(v,2)+' mΩ·cm'})],
  build(S){const g=S.root,dyn=new THREE.Group();g.add(dyn);let flows=[];
    const blk=new THREE.Mesh(new THREE.BoxGeometry(8,4,8),new THREE.MeshStandardMaterial({color:0x5b6a80,transparent:true,opacity:.12,depthWrite:false}));blk.position.y=-2;g.add(blk);
    const ble=new THREE.LineSegments(new THREE.EdgesGeometry(blk.geometry),new THREE.LineBasicMaterial({color:0x6ea2ff,transparent:true,opacity:.35}));ble.position.y=-2;g.add(ble);
    return {update(p){clearGroup(dyn);flows=[];const r=0.2+p.d/50*1.8;
      const disk=new THREE.Mesh(new THREE.CylinderGeometry(r,r,0.12,48),mat('#d4b45a',{metalness:.7,emissive:'#d4b45a',emissiveIntensity:.25}));disk.position.y=0.06;dyn.add(disk);
      for(const k of [1,2,3]){const h=new THREE.Mesh(new THREE.SphereGeometry(r*k*1.1,40,20,0,Math.PI*2,Math.PI/2,Math.PI/2),new THREE.MeshBasicMaterial({color:0xff5c8a,transparent:true,opacity:.08/k,side:THREE.DoubleSide,depthWrite:false}));dyn.add(h)}
      const n=36;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,rr=r*0.7*((i%3)+1)/3;const pts=[];for(let k=0;k<=24;k++){const f=k/24;const R2=rr+f*f*3.3;pts.push([Math.cos(a)*R2,-f*3.7,Math.sin(a)*R2])}
        const c=new THREE.CatmullRomCurve3(pts.map(q=>new THREE.Vector3(...q)));dyn.add(new THREE.Mesh(new THREE.TubeGeometry(c,30,0.018,5),new THREE.MeshBasicMaterial({color:0x38d6e8,transparent:true,opacity:.45})));
        const s=ball(0.06,'#bff3ff',{ei:1.4});s.userData={c,o:i/n};dyn.add(s);flows.push(s)}
      dyn.add(tlabel('contact  d = '+p.d.toFixed(1)+' µm',{size:.32,pos:[0,0.6,0],color:'#ffe08a'}));
      const Rv=p.rho*1e-5/(2*p.d*1e-6);dyn.add(tlabel('R_{spread} = '+si(Rv,'Ω'),{size:.42,pos:[0,1.4,0],color:'#ffffff',bg:'rgba(10,15,22,.7)'}))},
      tick(t){flows.forEach(s=>{const u=MOTION?(t*0.3+s.userData.o)%1:s.userData.o;s.position.copy(s.userData.c.getPoint(u))})}}},
  read(p){const Rv=p.rho*1e-5/(2*p.d*1e-6);return [['R_{spread}',si(Rv,'Ω'),Rv<1?'good':'warn'],['ρ',si(p.rho*1e-5,'Ω·m')],['units','Ω·m / m = Ω'],['d ×2 → R','÷2']]}
});

/* ---------- Zin locus in 3D ---------- */
VIEWS.zin3=V3({title:'Z_{in}(f) locus in 3D',sub:'x = log frequency · y = Re{Z_{in}} · z = Im{Z_{in}}; shadows on the walls are the 2D views',home:{r:14,th:0.85,ph:1.15,t:[0,0,0]},
  params:ZP,
  build(S){const g=S.root,dyn=new THREE.Group();g.add(dyn);
    return {update(p){clearGroup(dyn);const Y=Math.max(p.R,p.Rs)*1.2;const X=f=>-4+(Math.log10(f)+1)/4*8,Yf=v=>clamp(v/Y,-1,1)*2.2,Zf=v=>clamp(v/Y,-1,1)*2.2;
      const fs=lin(-1,3,400).map(v=>10**v);const pts=fs.map(f=>{const z=Zin(f*1e9,p.R,p.Rs,p.Cj*1e-12,p.Ls*1e-12);return [X(f),Yf(z.re),Zf(z.im)]});
      dyn.add(tube(pts,0.045,'#38d6e8',{ei:.7,seg:400}));dyn.add(polyline(pts.map(q=>[q[0],q[1],-2.4]),0x3fd29b,{op:.7}));dyn.add(polyline(pts.map(q=>[q[0],-2.4,q[2]]),0xa98bff,{op:.7}));
      const grid=[];for(let k=-1;k<=3;k++){const x=X(10**k);grid.push(x,-2.4,-2.4,x,2.4,-2.4,x,-2.4,-2.4,x,-2.4,2.4);dyn.add(tlabel(si(10**k*1e9,'Hz',1),{size:.24,pos:[x,-2.7,2.6],color:'#9fb0c8'}))}
      grid.push(-4,0,-2.4,4,0,-2.4,-4,-2.4,0,4,-2.4,0);dyn.add(segs(grid,0x6f86a8,.35));
      dyn.add(tlabel('Re{Z_{in}}',{size:.3,pos:[-4.6,2.2,-2.4],color:'#3fd29b'}));dyn.add(tlabel('Im{Z_{in}}',{size:.3,pos:[-4.6,-2.4,2.2],color:'#a98bff'}));dyn.add(tlabel('log f',{size:.3,pos:[4.4,-2.7,2.6],color:'#c9d3e1'}));
      const mark=(f,c,l)=>{if(!isFinite(f))return;const z=Zin(f,p.R,p.Rs,p.Cj*1e-12,p.Ls*1e-12);const b=ball(0.12,c,{ei:1.2});b.position.set(X(f/1e9),Yf(z.re),Zf(z.im));dyn.add(b);dyn.add(tlabel(l,{size:.28,pos:[b.position.x,b.position.y+0.45,b.position.z],color:c,bg:'rgba(10,15,22,.75)',depth:false,order:9}))};
      mark(fr(p.R,p.Rs,p.Cj*1e-12),'#3fd29b','f_r: Re = 0');mark(fx(p.R,p.Cj*1e-12,p.Ls*1e-12),'#a98bff','f_x: Im = 0');mark(p.f*1e9,'#ffffff','f')},tick(){}}},
  read:zRead
});

/* ---------- learning targets (3D checklist) unused fallback ---------- */
