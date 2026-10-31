/* ================= view registry & param constructors ================= */
const VIEWS={};
const R=(id,l,min,max,step,v,u='',o={})=>({id,l,t:'r',min,max,step,v,u,...o});
const LR=(id,l,min,max,v,u='',o={})=>({id,l,t:'r',min,max,v,u,log:true,...o});
const SEL=(id,l,opts,v)=>({id,l,t:'s',opts,v});
const K=(id,l,v)=>({id,l,t:'c',v});
const MATSEL=SEL('mat','Material',[['Ge','Ge (PVR 8:1)'],['Si','Si (PVR 4:1)'],['GaSb','GaSb (PVR 12:1)'],['GaAs','GaAs (PVR 28:1)']],'Ge');
const mA=x=>si(x*1e-3,'A');
const regCls=r=>r==='II'?'bad':r==='III'?'warn':'good';

/* ---------- shared energy model for band pictures ---------- */
function bandE(V){const {Eg,Vn,Vp}=BAND;return {EvL:0,EcL:Eg,EFL:-Vp,EcR:V-Vp-Vn,EvR:V-Vp-Vn-Eg,EFR:V-Vp}}
function fermi(E,EF,kT){return 1/(1+Math.exp(clamp((E-EF)/kT,-60,60)))}
function bandX(x,e,w=1){const s=smooth((x+w)/(2*w));return {Ec:e.EcL+(e.EcR-e.EcL)*s,Ev:e.EvL+(e.EvR-e.EvL)*s}}
function tunI(V,kT){const e=bandE(V);let s=0;const n=400,a=-0.9,b=0.9;for(let i=0;i<n;i++){const E=a+(b-a)*(i+.5)/n;const gc=E>e.EcR?Math.sqrt(E-e.EcR):0,gv=E<e.EvL?Math.sqrt(e.EvL-E):0;if(gc&&gv)s+=gc*gv*(fermi(E,e.EFR,kT)-fermi(E,e.EFL,kT))}return s*(b-a)/n}
const _tunCache={};
function tunCurve(T){const k=Math.round(T);if(_tunCache[k])return _tunCache[k];const kT=KB*T;const Vs=lin(0,0.5,101),Is=Vs.map(v=>tunI(v,kT));const mx=Math.max(...Is);const o={Vs,Is:Is.map(v=>v/mx),Vpk:Vs[Is.indexOf(mx)],mx};_tunCache[k]=o;return o}
function routePts(V,r){
  const e=bandE(V),EC=(e.EcR+e.EFR)/2,ED=(e.EFL+e.EvL)/2,xn=1.6,xp=-1.6;
  if(r==1)return [{x:xn,E:EC,n:'C'},{x:xn,E:ED,k:'drop',n:'B'},{x:xp,E:ED,k:'tun',n:'D'}];
  if(r==2)return [{x:xn,E:EC,n:'C'},{x:xp,E:EC,k:'tun',n:'A'},{x:xp,E:ED,k:'drop',n:'D'}];
  if(r==3)return [{x:xn,E:EC,n:'C'},{x:0.45,E:EC,k:'tun',n:'A'},{x:-0.45,E:ED,k:'hop',n:'B'},{x:xp,E:ED,k:'tun',n:'D'}];
  const n=4,xs=lin(xn,xp,n+1),Es=lin(EC,ED,n+1),o=[{x:xn,E:EC,n:'C'}];
  for(let i=1;i<=n;i++){o.push({x:xs[i],E:Es[i-1],k:'tun',n:i<n?'':''});o.push({x:xs[i],E:Es[i],k:'drop',n:i<n?'E'+i:'D'})}
  return o;
}
const ROUTE_TXT={1:'C ↓ B ⇝ D',2:'C ⇝ A ↓ D',3:'C ⇝ A → B ⇝ D',4:'C → E₁ → E₂ → E₃ → D'};

/* ---------- 1 · I-V master plot ---------- */
VIEWS.iv={kind:'2d',title:'Forward I-V characteristic',sub:'Drag on the plot to move the bias point',drag:'V',
  params:[MATSEL,R('V','Bias $V$',0,1.3,0.001,0.15,'V',{f:v=>v.toFixed(3)+' V'}),SEL('hl','Highlight region',[['none','None'],['I','I · rising'],['II','II · NDR'],['III','III · excess'],['IV','IV · diffusion']],'none'),K('comp','Show the three components',true),K('tan','Tangent at the bias point',true),K('logy','Logarithmic current axis',false)],
  draw(g,W,H,p,t,S){
    const mt=MATS[p.mat],m=mt.m,P=mt.P,Vmax=mt.Vmax,V=Math.min(p.V,Vmax);
    const [b]=boxes(W,H,[1],{t:48});
    const pl=new P2(g,b,{x:[0,Vmax],y:p.logy?[P.Iv*0.01,P.Ip*5]:[0,P.Ip*1.3],logy:p.logy,xl:'Forward voltage V (V)',yl:'Current I (mA)'});S.main=pl;
    const d=0.12*(P.Vv-P.Vp);
    for(const [n,a,b2,c] of [['I',0,P.Vp,'91,156,255'],['II',P.Vp,P.Vv-d,'255,92,138'],['III',P.Vv-d,P.Vv+d,'246,178,60'],['IV',P.Vv+d,Vmax,'63,210,155']]){
      const on=p.hl===n;pl.vband(a,b2,`rgba(${c},${on?0.22:p.hl==='none'?0.07:0.025})`,n,on?C.tot:C.mute)}
    pl.frame();
    if(p.comp){pl.curve(v=>It(m,v),{c:C.t,w:1.7,dash:[6,4]});pl.curve(v=>Ix(m,v),{c:C.x,w:1.7,dash:[6,4]});pl.curve(v=>Id(m,v),{c:C.d,w:1.7,dash:[6,4]})}
    pl.curve(v=>Itot(m,v),{c:C.tot,w:2.8});
    pl.dot(P.Vp,P.Ip,C.ndr,5,'P(V_P, I_P)');pl.dot(P.Vv,P.Iv,C.ndr,5,'V(V_V, I_V)',8,16);
    const I=Itot(m,V),G=dI(m,V);
    if(p.tan&&!p.logy){const dv=Vmax*0.09;pl.pts([[V-dv,I-G*dv],[V+dv,I+G*dv]],{c:G<0?C.ndr:C.cyan,w:2.2})}
    pl.vline(V,'rgba(255,255,255,.3)',[3,3]);pl.dot(V,I,'#ffffff',6);
    legend(g,b.x,24,p.comp?[[C.tot,'J total'],[C.t,'J_t tunnel',[6,4]],[C.x,'J_x excess',[6,4]],[C.d,'J_d diffusion',[6,4]]]:[[C.tot,'J total']]);
  },
  read(p){const mt=MATS[p.mat],m=mt.m,P=mt.P,V=Math.min(p.V,mt.Vmax);const I=Itot(m,V),G=dI(m,V),r=region(m,V,P);
    const c=[It(m,V),Ix(m,V),Id(m,V)],dom=['J_t tunnelling','J_x excess','J_d diffusion'][c.indexOf(Math.max(...c))];
    return [['V',V.toFixed(3)+' V'],['I',mA(I)],['G = dI/dV',si(G*1e-3,'S'),G<0?'bad':'good'],['r_d = dV/dI',Math.abs(G)<1e-9?'→ ∞':si(1000/G,'Ω'),G<0?'bad':''],['Region',REGNAME[r],regCls(r)],['Dominant',dom],['V_P / I_P',P.Vp.toFixed(3)+' V / '+mA(P.Ip)],['V_V / I_V',P.Vv.toFixed(3)+' V / '+mA(P.Iv)],['PVR',P.pvr.toFixed(1)+' : 1']]}
};

/* ---------- state overlap picture (DOS) ---------- */
VIEWS.dos={kind:'2d',anim:true,title:'Occupied vs empty states across the junction',sub:'Left: p⁺ valence band · right: n⁺ conduction band · pink = states that can tunnel',drag:'V',
  params:[R('V','Bias $V$',0,0.45,0.001,0.06,'V',{f:v=>v.toFixed(3)+' V'}),R('T','Temperature $T$',20,400,1,300,'K',{f:v=>v+' K'})],
  draw(g,W,H,p,t,S){
    const kT=KB*p.T,e=bandE(p.V),tc=tunCurve(p.T);
    const wide=W>600;const L=62;
    const b1={x:L,y:46,w:wide?(W-L)*0.6-30:W-L-18,h:H-96};
    const pl=new P2(g,b1,{x:[-1.15,1.15],y:[-0.42,0.42],xl:'p⁺ side  ←  density of states  →  n⁺ side',yl:'Electron energy E (eV)',noxt:false});
    pl.frame();
    const nrm=0.75,Es=lin(-0.42,0.42,260);
    // VB p-side
    const gv=E=>E<e.EvL?Math.sqrt(e.EvL-E)/nrm:0, gc=E=>E>e.EcR?Math.sqrt(E-e.EcR)/nrm:0;
    pl.pts([[0,-0.42],...Es.map(E=>[-gv(E)*fermi(E,e.EFL,kT),E]),[0,0.42]],{c:null,fc:'rgba(91,156,255,0.22)',close:true});
    for(const E of Es){const h=gv(E)*(1-fermi(E,e.EFL,kT));if(h>0.003){g.fillStyle='rgba(246,178,60,0.55)';const y=pl.Y(E);g.fillRect(pl.X(-h),y-1,pl.X(0)-pl.X(-h),2.2)}}
    pl.pts(Es.map(E=>[-gv(E),E]),{c:'rgba(246,178,60,.9)',w:1.5});
    pl.pts([[0,-0.42],...Es.map(E=>[gc(E)*fermi(E,e.EFR,kT),E]),[0,0.42]],{c:null,fc:'rgba(91,156,255,0.55)',close:true});
    pl.pts(Es.map(E=>[gc(E),E]),{c:'rgba(91,156,255,.95)',w:1.5});
    // overlap
    let mx=0;const ov=Es.map(E=>{const v=gc(E)*fermi(E,e.EFR,kT)*gv(E)*(1-fermi(E,e.EFL,kT));mx=Math.max(mx,v);return v});
    Es.forEach((E,i)=>{if(ov[i]>1e-4){const a=clamp(ov[i]/0.25,0,1);g.fillStyle=`rgba(255,92,138,${0.15+0.7*a})`;const y=pl.Y(E);g.fillRect(pl.X(-0.16),y-1.4,pl.X(0.16)-pl.X(-0.16),2.8)}});
    if(mx>1e-4&&MOTION){const k=(t*0.8)%1;for(let j=0;j<5;j++){const i=Es.length*((j*0.19+k*0.07)%1)|0;const E=Es[clamp(i,0,Es.length-1)];const best=Es.reduce((a,E2,ii)=>ov[ii]>ov[a]?ii:a,0);const Er=Es[best]+((j-2)*0.012);const x=lerp(0.5,-0.5,(k+j*0.2)%1);pl.dot(x,Er,'#ffffff',2.4)}}
    pl.hline(e.EFL,C.x,[5,4]);pl.hline(e.EFR,C.cyan,[5,4]);
    pl.text(-1.12,e.EFL+0.02,'E_{Fp}',C.x);pl.text(1.12,e.EFR+0.02,'E_{Fn}',C.cyan,'right');
    pl.text(-1.12,e.EvL+0.02,'E_V (p⁺)',C.ink);pl.text(1.12,e.EcR-0.03,'E_C (n⁺)',C.ink,'right');
    g.save();g.strokeStyle='rgba(255,255,255,.35)';g.setLineDash([2,3]);g.beginPath();g.moveTo(pl.X(-1.15),pl.Y(e.EvL));g.lineTo(pl.X(0),pl.Y(e.EvL));g.moveTo(pl.X(0),pl.Y(e.EcR));g.lineTo(pl.X(1.15),pl.Y(e.EcR));g.stroke();g.restore();
    if(e.EcR>e.EvL)pl.text(0,0.38,'no overlap → direct tunnelling stops','#ffb0c4','center');
    // current panel
    const b2=wide?{x:b1.x+b1.w+58,y:46,w:W-(b1.x+b1.w+58)-16,h:Math.min(H-96,320)}:null;
    if(b2){const p2=new P2(g,b2,{x:[0,0.5],y:[0,1.15],xl:'V (V)',yl:'tunnel current (norm.)',ylOff:40});p2.frame();
      p2.vband(0,tc.Vpk,'rgba(91,156,255,.07)','rising');p2.vband(tc.Vpk,BAND.Vn+BAND.Vp,'rgba(255,92,138,.08)','falling');
      p2.pts(tc.Vs.map((v,i)=>[v,tc.Is[i]]),{c:C.t,w:2.4});p2.dot(p.V,tunI(p.V,kT)/tc.mx,'#fff',5.5);
      p2.vline(BAND.Vn+BAND.Vp,C.ndr,[4,4],"V'_n+V'_p");}
    const y0=b2?b2.y+b2.h+60:H;if(b2&&y0<H-60){g.fillStyle=C.mute;g.font=`12px ${SANS}`;
      const lines=['Blue fill: occupied electron states.  Amber: empty states (holes) in the p⁺ valence band.','Pink bar: energies where an occupied n⁺ state faces an empty p⁺ state — only there can an electron tunnel horizontally.','Forward bias raises the n⁺ side by qV: the overlap first grows (region I) and then shrinks (region II).'];
      const words=lines.join(' ').split(' ');let ln='',yy=y0;for(const w of words){if(g.measureText(ln+w).width>b2.w){g.fillText(ln,b2.x-40,yy);ln='';yy+=18;if(yy>H-30)break}ln+=w+' '}if(yy<=H-30)g.fillText(ln,b2.x-40,yy)}
  },
  read(p){const e=bandE(p.V),kT=KB*p.T;const lo=Math.max(e.EcR,e.EFL),hi=Math.min(e.EFR,e.EvL);const tc=tunCurve(p.T);
    const w=Math.max(0,hi-lo);const st=p.V<tc.Vpk?'rising (region I)':p.V<BAND.Vn+BAND.Vp?'falling (NDR)':'≈ 0 (needs gap states)';
    return [['qV',(p.V*1000).toFixed(0)+' meV'],['Overlap window',(w*1000).toFixed(0)+' meV',w>0?'good':'bad'],['Direct tunnelling',st,p.V<tc.Vpk?'good':p.V<0.2?'bad':'warn'],["V'_n + V'_p",((BAND.Vn+BAND.Vp)*1000).toFixed(0)+' mV'],['kT',(kT*1000).toFixed(1)+' meV']]}
};

/* ---------- cause → effect chains ---------- */
const CHAINS=[
  {t:'Heavy doping makes tunnelling possible',n:['N_A, N_D ↑','W_d ↓','ℰ ↑','P_{tunnel} ↑']},
  {t:'Region I: current rises with bias',n:['V ↑','occupied-empty alignment ↑','tunnelling transitions ↑','I_t ↑']},
  {t:'Region II: current falls with bias',n:['V ↑','band-state overlap ↓','tunnelling electrons ↓','I_t ↓']},
  {t:'Bias lowers the effective barrier for excess current',n:['V ↑','ψ_{bi} − V ↓','E_x ↓','T_t ↑','J_x ↑']},
  {t:'Effective mass',n:['m*_x ↑','√m*_x ↑','K ↑','T_t ↓']},
  {t:'Barrier energy',n:['E_x ↑','E_x^{3/2} ↑','K ↑','T_t ↓↓']},
  {t:'Peak current is set by doping',n:['N_A, N_D ↑','W_d ↓','ℰ ↑','T_t ↑','I_P ↑']},
  {t:'Valley current is set by defects',n:['D_x ↑','J_x ↑','I_V ↑','I_P/I_V ↓']},
  {t:'Temperature (heavily doped diode)',n:['T ↑','E_g ↓','barrier energy ↓','T_t ↑','I_P ↑']},
  {t:'Modern epitaxy, peak side',n:['sharper doping','W_d ↓','I_P ↑','I_P/I_V ↑']},
  {t:'Modern epitaxy, valley side',n:['defects ↓','D_x ↓','I_V ↓','I_P/I_V ↑']},
  {t:'Narrow depletion layer and speed',n:['W_d ↓','I_P ↑↑','C_j ↑ (slower)','I_P/C_j ↑','faster switching']},
  {t:'Low series inductance keeps the diode stable',n:['L_s ↓','f_{x0} ↑','f_{x0} > f_{r0}','no self-oscillation']},
  {t:'Tunnelling diode family at a glance',n:['p⁺–n⁺ heavy doping','thin barrier','tunnelling','peak point','NDR region','circuit −R']}
];
function chainView(LIST){return {kind:'2d',anim:true,title:'Cause → effect chain',sub:'Each step drives the next — watch the signal propagate',
  params:[SEL('c','Chain',LIST.map((c,i)=>[String(i),c.t]),'0'),R('sp','Speed',0.2,2,0.1,0.8,'×',{f:v=>v.toFixed(1)+'×'})],
  draw(g,W,H,p,t){
    const ch=LIST[+p.c]||LIST[0],n=ch.n.length;rich(g,ch.t,W/2,40,{align:'center',size:16,font:SANS,weight:600,color:C.tot});
    g.font=`15px ${MONO}`;const ws=ch.n.map(s=>richW(g,s,15,MONO)+34);
    const maxW=W-60,rows=[];let cur=[],cw=0;ws.forEach((w,i)=>{if(cw+w+(cur.length?54:0)>maxW&&cur.length){rows.push(cur);cur=[];cw=0}cur.push(i);cw+=w+(cur.length>1?54:0)});rows.push(cur);
    const rowH=96,top=H/2-rows.length*rowH/2+20,pos=[];
    rows.forEach((r,ri)=>{const tw=r.reduce((a,i)=>a+ws[i],0)+54*(r.length-1);let x=W/2-tw/2;r.forEach(i=>{pos[i]={x,y:top+ri*rowH,w:ws[i],h:46};x+=ws[i]+54})});
    const ph=(t*p.sp)%(n+1.5),k=Math.floor(ph),f=ph-k;
    for(let i=0;i<n-1;i++){const a=pos[i],b=pos[i+1];const sameRow=Math.abs(a.y-b.y)<1;const lit=i<k;const col=lit?C.cyan:'rgba(150,170,200,.4)';
      if(sameRow){arrow(g,a.x+a.w+6,a.y+a.h/2,b.x-6,b.y+b.h/2,col,2.2);if(i===k)g.fillStyle='#fff',g.beginPath(),g.arc(lerp(a.x+a.w+6,b.x-6,f),a.y+a.h/2,4,0,7),g.fill()}
      else{g.save();g.strokeStyle=col;g.lineWidth=2.2;g.beginPath();g.moveTo(a.x+a.w/2,a.y+a.h+4);g.lineTo(a.x+a.w/2,a.y+a.h+24);g.lineTo(b.x+b.w/2,a.y+a.h+24);g.stroke();g.restore();arrow(g,b.x+b.w/2,a.y+a.h+24,b.x+b.w/2,b.y-5,col,2.2)}}
    ch.n.forEach((s,i)=>{const q=pos[i],lit=i<=k;g.save();rrect(g,q.x,q.y,q.w,q.h,8);g.fillStyle=lit?'rgba(56,214,232,0.14)':'rgba(255,255,255,0.03)';g.fill();g.strokeStyle=lit?C.cyan:'rgba(150,170,200,.35)';g.lineWidth=lit?2:1;g.stroke();g.restore();
      const up=/↑/.test(s),dn=/↓/.test(s);rich(g,s,q.x+q.w/2,q.y+q.h/2,{align:'center',size:15,color:lit?(up?'#7ff0c5':dn?'#ff9ab4':C.tot):C.mute})});
    g.fillStyle=C.mute;g.font=`12px ${SANS}`;g.textAlign='center';g.fillText('Green ↑ = quantity increases · pink ↓ = quantity decreases',W/2,H-24);g.textAlign='left';
  },
  read(p){const ch=LIST[+p.c]||LIST[0];return [['Links',String(ch.n.length-1)],['Start',ch.n[0]],['Result',ch.n[ch.n.length-1]]]}
}}
VIEWS.chain=chainView(CHAINS);

/* ---------- ordinary diode vs tunnel diode ---------- */
VIEWS.compare={kind:'2d',title:'Ordinary p-n diode vs tunnel diode',sub:'Same axes, forward and reverse bias',drag:'V',
  params:[R('V','Bias $V$',-0.25,0.8,0.001,0.15,'V',{f:v=>v.toFixed(3)+' V'}),K('logy','Show |I| on a log axis',false)],
  draw(g,W,H,p,t,S){
    const m=DEF,ord=v=>1e-11*(Math.exp(v/0.02585)-1);
    const [b]=boxes(W,H,[1],{t:48});const pl=new P2(g,b,{x:[-0.25,0.8],y:p.logy?[1e-6,100]:[-15,15],logy:p.logy,xl:'Applied voltage V (V)',yl:p.logy?'|I| (mA)':'Current I (mA)'});S.main=pl;
    pl.vband(DEF.Vp,MATS.Ge.P.Vv,'rgba(255,92,138,.08)','NDR only in the tunnel diode',C.ndr);pl.frame();
    const f=p.logy?(fn=>v=>Math.abs(fn(v))):(fn=>fn);
    pl.curve(f(ord),{c:C.vio,w:2.6});pl.curve(f(v=>Itot(m,v)),{c:C.tot,w:2.6});
    const a=f(ord)(p.V),c=f(v=>Itot(m,v))(p.V);pl.vline(p.V,'rgba(255,255,255,.3)',[3,3]);pl.dot(p.V,a,C.vio,5.5);pl.dot(p.V,c,'#fff',5.5);
    if(!p.logy){pl.text(-0.24,-12,'tunnel diode conducts strongly in reverse',C.ink);pl.text(0.55,10,'ordinary diode turns on near 0.6 V',C.vio)}
    legend(g,b.x,24,[[C.tot,'tunnel diode (p⁺–n⁺)'],[C.vio,'ordinary p-n diode']]);
  },
  read(p){const g1=dI(DEF,p.V),g2=1e-11/0.02585*Math.exp(p.V/0.02585);return [['I tunnel',mA(Itot(DEF,p.V))],['I ordinary',mA(1e-11*(Math.exp(p.V/0.02585)-1))],['dI/dV tunnel',si(g1*1e-3,'S'),g1<0?'bad':'good'],['dI/dV ordinary',si(g2*1e-3,'S'),'good'],['W_d tunnel','≈ 5–10 nm'],['W_d ordinary','≈ 100 nm – µm']]}
};

/* ---------- barrier transmission ---------- */
VIEWS.trans={kind:'2d',title:'Transmission through a rectangular barrier',sub:'Exact result (solid) vs the WKB-style estimate e^{−2κa} (dashed)',drag:'a',
  params:[R('a','Barrier width $a$',0.5,12,0.1,4,'nm',{f:v=>v.toFixed(1)+' nm'}),R('U','Barrier height above $E$',0.05,1,0.01,0.3,'eV',{f:v=>v.toFixed(2)+' eV'}),R('E','Electron energy $E$',0.02,0.5,0.01,0.1,'eV',{f:v=>v.toFixed(2)+' eV'}),R('m','Effective mass $m*$',0.02,1,0.01,0.07,'m₀',{f:v=>v.toFixed(2)+' m₀'})],
  draw(g,W,H,p,t,S){
    const [b]=boxes(W,H,[1],{t:48});const pl=new P2(g,b,{x:[0.5,12],y:[1e-12,1],logy:true,xl:'Barrier width a (nm)',yl:'Transmission probability T'});S.main=pl;
    pl.vband(5,10,'rgba(56,214,232,.07)','tunnel-diode W_d ≈ 5–10 nm',C.cyan);pl.frame();
    const TT=(a,U)=>{const k=Math.sqrt(p.m*U/0.0381),V0=p.E+U,s=Math.sinh(k*a);return 1/(1+V0*V0*s*s/(4*p.E*U))};
    for(const [f,a] of [[0.5,.35],[2,.35]])pl.curve(x=>TT(x,p.U*f),{c:C.t,w:1.4,a});
    pl.curve(x=>TT(x,p.U),{c:C.t,w:2.8});pl.curve(x=>Math.exp(-2*Math.sqrt(p.m*p.U/0.0381)*x),{c:C.x,w:1.8,dash:[6,4]});
    pl.dot(p.a,TT(p.a,p.U),'#fff',6,'T = '+num(TT(p.a,p.U),2));
    legend(g,b.x,24,[[C.t,'exact T(a)'],[C.x,'e^{−2κa}',[6,4]],['rgba(91,156,255,.5)','height ×½ and ×2']]);
  },
  read(p){const k=Math.sqrt(p.m*p.U/0.0381),V0=p.E+p.U,s=Math.sinh(k*p.a);const T=1/(1+V0*V0*s*s/(4*p.E*p.U));return [['κ',k.toFixed(3)+' nm⁻¹'],['decay length 1/κ',(1/k).toFixed(2)+' nm'],['T exact',num(T,3),T>1e-3?'good':T>1e-8?'warn':'bad'],['e^{−2κa}',num(Math.exp(-2*k*p.a),3)],['Doubling a gives T ×',num(Math.exp(-2*k*p.a),2)]]}
};

/* ---------- effective tunnelling energy Ex ---------- */
VIEWS.ex={kind:'2d',title:'Effective tunnelling energy E_x = q(ψ_{bi} − V)',sub:'Energy budget (left) and how bias lowers E_x and raises T_t (right)',drag:'V',
  params:[R('V','Bias $V$',0,0.7,0.001,0.3,'V',{f:v=>v.toFixed(3)+' V'}),R('Eg','Band gap $E_g$',0.3,1.5,0.01,0.66,'eV',{f:v=>v.toFixed(2)+' eV'}),R('pen',"Fermi penetration $V'_n+V'_p$",0.05,0.4,0.01,0.2,'V',{f:v=>v.toFixed(2)+' V'}),R('F','Junction field $ℰ$',0.5,5,0.1,2,'MV/cm',{f:v=>v.toFixed(1)+' MV/cm'}),R('m','Tunnelling mass $m*$',0.02,0.5,0.01,0.05,'m₀',{f:v=>v.toFixed(2)+' m₀'})],
  draw(g,W,H,p,t,S){
    const psi=p.Eg+p.pen,Ex=Math.max(1e-3,psi-p.V);const lw=W>640?Math.min(250,W*0.32):0;
    if(lw){const x0=30,base=H-70,sc=(H-170)/(psi*1.05);
      rich(g,'Energy budget (eV)',x0,42,{size:12,font:SANS,weight:600});
      const bar=(y0,h,c,lab,x)=>{g.fillStyle=c;g.fillRect(x,base-y0*sc-h*sc,70,h*sc);if(lab)rich(g,lab,x+78,base-y0*sc-h*sc/2,{size:12})};
      bar(0,p.Eg,'rgba(91,156,255,.55)','E_g',x0);bar(p.Eg,p.pen,'rgba(169,139,255,.6)',"q(V'_n+V'_p)",x0);
      g.strokeStyle=C.ink;g.setLineDash([3,3]);g.strokeRect(x0+0.5,base-psi*sc,70,psi*sc);g.setLineDash([]);
      rich(g,'qψ_{bi} = '+psi.toFixed(2),x0,base-psi*sc-14,{size:12,color:C.tot});
      const x1=x0+150;bar(0,Ex,'rgba(255,92,138,.6)','',x1);bar(Ex,Math.min(p.V,psi),'rgba(63,210,155,.45)','',x1);
      rich(g,'E_x',x1+35,base-Ex*sc/2,{align:'center',size:13,color:'#fff'});if(p.V*sc>16)rich(g,'qV',x1+35,base-Ex*sc-p.V*sc/2,{align:'center',size:13,color:'#fff'});
      g.strokeStyle=C.axis;g.beginPath();g.moveTo(x0-6,base+.5);g.lineTo(x1+80,base+.5);g.stroke()}
    const bs=boxes(W,H,[1,1],{x0:lw,t:46,gap:40});
    const p1=new P2(g,bs[0],{x:[0,0.7],y:[0,1.6],xl:'',yl:'E_x (eV)',noxt:true});S.main=p1;p1.frame();
    p1.curve(v=>Math.max(0,psi-v),{c:C.ndr,w:2.6});p1.dot(p.V,Ex,'#fff',5.5,'E_x = '+Ex.toFixed(3)+' eV');
    const p2=new P2(g,bs[1],{x:[0,0.7],y:[1e-15,1],logy:true,xl:'Forward bias V (V)',yl:'T_t'});p2.frame();
    p2.curve(v=>Ttun(Math.max(1e-3,psi-v),p.F*1e8,p.m),{c:C.d,w:2.6});p2.dot(p.V,Ttun(Ex,p.F*1e8,p.m),'#fff',5.5);
  },
  read(p){const psi=p.Eg+p.pen,Ex=Math.max(1e-3,psi-p.V);return [['qψ_{bi}',psi.toFixed(3)+' eV'],['E_x',Ex.toFixed(3)+' eV'],['K',Kfac(Ex,p.F*1e8,p.m).toFixed(2)],['T_t = e^{−K}',num(Ttun(Ex,p.F*1e8,p.m),3)],['T_t gain per +0.1 V',num(Ttun(Math.max(1e-3,Ex-0.1),p.F*1e8,p.m)/Ttun(Ex,p.F*1e8,p.m),3)+'×','good']]}
};

/* ---------- tunnelling probability sweeps ---------- */
VIEWS.tt={kind:'2d',title:'Tunnelling probability T_t = exp(−K)',sub:'Sweep one variable; faint curves show the second variable ×½ and ×2',
  params:[SEL('sw','Sweep',[['m','effective mass m*'],['E','barrier energy E_x'],['F','electric field ℰ']],'m'),R('m','Effective mass $m*$',0.02,0.5,0.01,0.05,'m₀',{f:v=>v.toFixed(2)+' m₀'}),R('E','Barrier energy $E_x$',0.1,1.2,0.01,0.6,'eV',{f:v=>v.toFixed(2)+' eV'}),R('F','Field $ℰ$',0.3,5,0.05,2,'MV/cm',{f:v=>v.toFixed(2)+' MV/cm'})],
  draw(g,W,H,p,t,S){
    const cfg={m:{r:[0.02,0.5],l:'Effective mass m*/m₀',f:(x,k)=>Ttun(p.E*(k),p.F*1e8,x),fam:'E_x'},E:{r:[0.1,1.2],l:'Barrier energy E_x (eV)',f:(x,k)=>Ttun(x,p.F*1e8,p.m*k),fam:'m*'},F:{r:[0.3,5],l:'Junction field ℰ (MV/cm)',f:(x,k)=>Ttun(p.E,x*1e8,p.m*k),fam:'m*'}}[p.sw];
    const [b]=boxes(W,H,[1],{t:48});const pl=new P2(g,b,{x:cfg.r,y:[1e-20,1],logy:true,xl:cfg.l,yl:'T_t'});pl.frame();
    pl.curve(x=>cfg.f(x,0.5),{c:C.t,w:1.4,a:.45});pl.curve(x=>cfg.f(x,2),{c:C.t,w:1.4,a:.45});pl.curve(x=>cfg.f(x,1),{c:C.t,w:2.8});
    const x=p[p.sw==='m'?'m':p.sw==='E'?'E':'F'];pl.dot(x,cfg.f(x,1),'#fff',6,'T_t = '+num(cfg.f(x,1),2));
    legend(g,b.x,24,[[C.t,'T_t'],['rgba(91,156,255,.45)',cfg.fam+' ×½ (upper) and ×2 (lower)']]);
  },
  read(p){const K=Kfac(p.E,p.F*1e8,p.m);return [['K',K.toFixed(3)],['T_t',num(Math.exp(-K),3),K<7?'good':K<20?'warn':'bad'],['m* ×2 → T_t ×',num(Math.exp(-K*(Math.SQRT2-1)),2)],['E_x ×2 → T_t ×',num(Math.exp(-K*(2**1.5-1)),2)],['ℰ ×2 → T_t ×',num(Math.exp(K/2),2)]]}
};

/* ---------- excess current: ln Jx vs V ---------- */
VIEWS.lnjx={kind:'2d',title:'Valley-normalised excess current',sub:'ln J_x is a straight line in V with slope C_4, anchored at (V_V, ln J_V)',drag:'V',
  params:[R('V','Bias $V$',0,0.7,0.001,0.45,'V',{f:v=>v.toFixed(3)+' V'}),R('Jv','Valley current $J_V$',0.05,3,0.01,1.04,'mA',{f:v=>v.toFixed(2)+' mA'}),R('Vv','Valley voltage $V_V$',0.15,0.6,0.005,0.33,'V',{f:v=>v.toFixed(3)+' V'}),R('C4','Slope $C_4$',1,20,0.1,6,'V⁻¹',{f:v=>v.toFixed(1)+' V⁻¹'})],
  draw(g,W,H,p,t,S){
    const f=v=>p.Jv*Math.exp(p.C4*(v-p.Vv));const bs=boxes(W,H,[1.4,1],{t:46,gap:40});
    const lo=Math.log(f(0)),hi=Math.log(f(0.7));const p1=new P2(g,bs[0],{x:[0,0.7],y:[Math.floor(lo)-0.5,Math.ceil(hi)+0.5],xl:'',yl:'ln J_x',noxt:true});S.main=p1;p1.frame();
    p1.curve(v=>Math.log(f(v)),{c:C.x,w:2.8});p1.dot(p.Vv,Math.log(p.Jv),C.ndr,5.5,'anchor (V_V, ln J_V)',8,16);
    const v0=p.V,v1=Math.min(0.69,p.V+0.1);const y0=Math.log(f(v0)),y1=Math.log(f(v1));
    p1.pts([[v0,y0],[v1,y0],[v1,y1]],{c:C.cyan,w:1.6,dash:[4,3]});p1.text(v1+0.008,(y0+y1)/2,'slope = C_4 = '+p.C4.toFixed(1),C.cyan);p1.dot(v0,y0,'#fff',5.5);
    const p2=new P2(g,bs[1],{x:[0,0.7],y:[0,Math.min(f(0.7),p.Jv*8)],xl:'Forward bias V (V)',yl:'J_x (mA)'});p2.frame();p2.curve(f,{c:C.x,w:2.4,fill:0,fa:.12});p2.curve(f,{c:C.x,w:2.4});p2.dot(p.V,f(p.V),'#fff',5);
  },
  read(p){const f=v=>p.Jv*Math.exp(p.C4*(v-p.Vv));return [['J_x(V)',mA(f(p.V))],['J_x(V_V)',mA(p.Jv)+' (anchor)'],['dJ_x/dV = C_4 J_x',si(p.C4*f(p.V)*1e-3,'S'),'good'],['×e every',(1/p.C4*1000).toFixed(0)+' mV'],['Sign of slope','positive → no NDR','good']]}
};

/* ---------- diffusion current ---------- */
VIEWS.jd={kind:'2d',title:'Ordinary diffusion current',sub:'Full J_0[exp(qV/kT) − 1] vs the approximation J_0 exp(qV/kT)',drag:'V',
  params:[R('V','Bias $V$',0,0.7,0.001,0.4,'V',{f:v=>v.toFixed(3)+' V'}),R('T','Temperature $T$',200,420,1,300,'K',{f:v=>v+' K'}),LR('J0','Saturation $J_0$',1e-10,1e-5,1e-7,'mA',{f:v=>num(v,2)+' mA'}),K('logy','Logarithmic current axis',true)],
  draw(g,W,H,p,t,S){
    const vt=KB*p.T,full=v=>p.J0*(Math.exp(v/vt)-1),apx=v=>p.J0*Math.exp(v/vt);const bs=boxes(W,H,[1.5,1],{t:46,gap:40});
    const p1=new P2(g,bs[0],{x:[0,0.7],y:p.logy?[p.J0*0.05,1e3]:[0,30],logy:p.logy,xl:'',yl:'J_d (mA)',noxt:true});S.main=p1;p1.frame();
    p1.curve(apx,{c:C.x,w:1.8,dash:[6,4]});p1.curve(full,{c:C.d,w:2.8});p1.dot(p.V,full(p.V),'#fff',5.5);
    const p2=new P2(g,bs[1],{x:[0,0.7],y:[1e-12,100],logy:true,xl:'Forward bias V (V)',yl:'error %'});p2.frame();
    p2.curve(v=>100/(Math.exp(v/vt)-1),{c:C.ndr,w:2.4});p2.hline(1,C.mute,[3,3],'1 %');p2.dot(p.V,100/(Math.exp(p.V/vt)-1),'#fff',5);
    legend(g,bs[0].x,24,[[C.d,'J_0[exp(qV/kT) − 1]'],[C.x,'J_0 exp(qV/kT)',[6,4]],[C.ndr,'error of dropping −1']]);
  },
  read(p){const vt=KB*p.T,e=Math.exp(p.V/vt);return [['kT/q',(vt*1000).toFixed(2)+' mV'],['exp(qV/kT)',num(e,3)],['J_d',mA(p.J0*(e-1))],['error of approx.',num(100/(e-1),2)+' %',100/(e-1)<1?'good':'warn'],['×10 every',(vt*Math.LN10*1000).toFixed(1)+' mV']]}
};

/* ---------- complete static equation lab ---------- */
function labModel(p){return mk({Ip:p.Jp,Vp:p.Vp,Iv:p.Jv,Vv:p.Vv,C4:p.C4,I0:10**p.lJ0})}
VIEWS.eqlab={kind:'2d',title:'J = J_t + J_x + J_d — equation (29) lab',sub:'Change every constant and watch peak, valley and PVR respond',drag:'V',
  params:[R('Jp','$J_P$',1,20,0.1,10,'mA',{f:v=>v.toFixed(1)+' mA'}),R('Vp','$V_P$',0.03,0.2,0.001,0.05,'V',{f:v=>v.toFixed(3)+' V'}),R('Jv','$J_V$',0.05,3,0.01,1.04,'mA',{f:v=>v.toFixed(2)+' mA'}),R('Vv','$V_V$',0.15,0.6,0.005,0.33,'V',{f:v=>v.toFixed(3)+' V'}),R('C4','$C_4$',1,20,0.1,6,'V⁻¹',{f:v=>v.toFixed(1)}),R('lJ0','log₁₀ $J_0$',-10,-5,0.05,-7.2,'',{f:v=>'10'+sup(v.toFixed(1))+' mA'}),R('V','Bias $V$',0,0.6,0.001,0.15,'V',{f:v=>v.toFixed(3)+' V'}),K('logy','Log current axis',false)],
  draw(g,W,H,p,t,S){
    const m=labModel(p),P=pv(m,0.6);const [b]=boxes(W,H,[1],{t:48});
    const pl=new P2(g,b,{x:[0,0.6],y:p.logy?[1e-3,p.Jp*5]:[0,p.Jp*1.35],logy:p.logy,xl:'Forward voltage V (V)',yl:'Current density J (mA, unit area)'});S.main=pl;
    pl.vband(P.Vp,P.Vv,'rgba(255,92,138,.08)','NDR',C.ndr);pl.frame();
    pl.curve(v=>It(m,v),{c:C.t,w:1.8,dash:[6,4]});pl.curve(v=>Ix(m,v),{c:C.x,w:1.8,dash:[6,4]});pl.curve(v=>Id(m,v),{c:C.d,w:1.8,dash:[6,4]});pl.curve(v=>Itot(m,v),{c:C.tot,w:2.8});
    pl.dot(P.Vp,P.Ip,C.ndr,5,'peak');pl.dot(P.Vv,P.Iv,C.ndr,5,'valley',8,16);pl.dot(p.V,Itot(m,p.V),'#fff',6);
    legend(g,b.x,24,[[C.tot,'J total'],[C.t,'J_t tunnel',[6,4]],[C.x,'J_x excess',[6,4]],[C.d,'J_d diffusion',[6,4]]]);
  },
  read(p){const m=labModel(p),P=pv(m,0.6),G=dI(m,p.V);return [['J(V)',mA(Itot(m,p.V))],['dJ/dV',si(G*1e-3,'S'),G<0?'bad':'good'],['peak',P.Vp.toFixed(3)+' V · '+mA(P.Ip)],['valley',P.Vv.toFixed(3)+' V · '+mA(P.Iv)],['PVR',P.pvr.toFixed(2)+' : 1',P.pvr>6?'good':'warn'],['R_{min} (numeric)',si(P.Rmin,'Ω')]]}
};

/* ---------- Jt term and its derivative ---------- */
VIEWS.deriv={kind:'2d',title:'The direct-tunnelling term and its slope',sub:'J_t(0)=0, J_t(V_P)=J_P, dJ_t/dV changes sign exactly at V_P',drag:'V',
  params:[R('Jp','$J_P$',2,20,0.1,10,'mA',{f:v=>v.toFixed(1)+' mA'}),R('Vp','$V_P$',0.03,0.2,0.001,0.05,'V',{f:v=>v.toFixed(3)+' V'}),R('V','Bias $V$',0,0.6,0.001,0.1,'V',{f:v=>v.toFixed(3)+' V'}),K('d','Show derivative panel',true),K('fam','Show family for other $V_P$',true)],
  draw(g,W,H,p,t,S){
    const jt=(v,vp=p.Vp)=>p.Jp*(v/vp)*Math.exp(1-v/vp),dj=v=>p.Jp/p.Vp*Math.exp(1-v/p.Vp)*(1-v/p.Vp);
    const bs=boxes(W,H,p.d?[1.2,1]:[1],{t:46,gap:40});
    const p1=new P2(g,bs[0],{x:[0,0.6],y:[0,p.Jp*1.25],xl:p.d?'':'Forward voltage V (V)',yl:'J_t (mA)',noxt:p.d});S.main=p1;p1.frame();
    if(p.fam)for(const k of [0.6,1.6,2.4])p1.curve(v=>jt(v,p.Vp*k),{c:C.t,w:1.2,a:.35});
    p1.curve(v=>jt(v),{c:C.t,w:2.8});p1.hline(p.Jp,C.mute,[3,3]);p1.vline(p.Vp,C.ndr,[4,4],'V_P');
    p1.dot(0,0,C.d,5,'J_t(0) = 0',8,-12);p1.dot(p.Vp,p.Jp,C.ndr,5.5,'J_t(V_P) = J_P');p1.dot(p.V,jt(p.V),'#fff',5.5);
    if(p.d){const mx=p.Jp/p.Vp*1.05;const p2=new P2(g,bs[1],{x:[0,0.6],y:[-mx*0.45,mx],xl:'Forward voltage V (V)',yl:'dJ_t/dV (mS)'});p2.frame();
      p2.curve(v=>Math.max(0,dj(v)),{c:C.d,fill:0,fa:.18});p2.curve(v=>Math.min(0,dj(v)),{c:C.ndr,fill:0,fa:.22});p2.curve(dj,{c:C.tot,w:2.4});
      p2.vline(p.Vp,C.ndr,[4,4]);p2.vline(2*p.Vp,C.x,[2,3],'inflection 2V_P');p2.dot(p.V,dj(p.V),'#fff',5.5);
      p2.text(p.Vp*0.5,mx*0.85,'+  rising','#7ff0c5','center');p2.text(Math.min(0.5,p.Vp*3),-mx*0.3,'−  falling','#ff9ab4','center')}
  },
  read(p){const x=p.V/p.Vp,jt=p.Jp*x*Math.exp(1-x),dj=p.Jp/p.Vp*Math.exp(1-x)*(1-x);return [['V/V_P',x.toFixed(3)],['J_t',mA(jt)],['dJ_t/dV',si(dj*1e-3,'S'),dj<0?'bad':'good'],['1 − V/V_P',(1-x).toFixed(3)],['steepest fall at','V = 2V_P = '+(2*p.Vp).toFixed(3)+' V'],['|r|_min of J_t','e·V_P/J_P = '+si(Math.E*p.Vp/p.Jp*1000,'Ω')]]}
};

/* ---------- negative total slope condition ---------- */
VIEWS.slope={kind:'2d',title:'When is the total slope negative?',sub:'NDR exists only where |dJ_t/dV| > dJ_x/dV + dJ_d/dV',drag:'V',
  params:[MATSEL,R('V','Bias $V$',0,1.3,0.001,0.2,'V',{f:v=>v.toFixed(3)+' V'}),R('k','Excess-current scale',0.2,5,0.05,1,'×',{f:v=>v.toFixed(2)+'×'})],
  draw(g,W,H,p,t,S){
    const mt=MATS[p.mat],m=mk({...mt.m,Iv:mt.m.Iv*p.k}),Vmax=mt.Vmax;const bs=boxes(W,H,[1.3,1],{t:46,gap:40});
    const a=v=>Math.max(0,-dI(m,v,It)),b=v=>dI(m,v,Ix)+dI(m,v,Id);const ymax=Math.max(...lin(0,Vmax,100).map(a))*1.15;
    const p1=new P2(g,bs[0],{x:[0,Vmax],y:[0,ymax],yl:'slope (mS)',noxt:true});S.main=p1;
    let s0=null;const xs=lin(0,Vmax,400);for(const v of xs){const nd=a(v)>b(v)&&dI(m,v,It)<0;if(nd&&s0===null)s0=v;if(!nd&&s0!==null){p1.vband(s0,v,'rgba(255,92,138,.12)','NDR',C.ndr);s0=null}}
    p1.frame();p1.curve(a,{c:C.t,w:2.6});p1.curve(b,{c:C.x,w:2.6});p1.vline(p.V,'rgba(255,255,255,.3)',[3,3]);p1.dot(p.V,a(p.V),C.t,5);p1.dot(p.V,b(p.V),C.x,5);
    legend(g,bs[0].x,24,[[C.t,'|dJ_t/dV| (falling part)'],[C.x,'dJ_x/dV + dJ_d/dV']]);
    const P=pv(m,Vmax);const p2=new P2(g,bs[1],{x:[0,Vmax],y:[0,P.Ip*1.3],xl:'Forward voltage V (V)',yl:'J (mA)'});p2.frame();
    p2.curve(v=>Itot(m,v),{c:C.tot,w:2.4});p2.dot(p.V,Itot(m,p.V),'#fff',5.5);
  },
  read(p){const mt=MATS[p.mat],m=mk({...mt.m,Iv:mt.m.Iv*p.k});const a=-dI(m,p.V,It),b=dI(m,p.V,Ix)+dI(m,p.V,Id),tot=dI(m,p.V);
    return [['dJ_t/dV',si(-a*1e-3,'S')],['dJ_x/dV + dJ_d/dV',si(b*1e-3,'S')],['dJ/dV total',si(tot*1e-3,'S'),tot<0?'bad':'good'],['Condition',a>b?'|dJ_t| > rest → NDR':'rest wins → positive',a>b?'bad':'good'],['PVR',pv(m,mt.Vmax).pvr.toFixed(2)+' : 1']]}
};

/* ---------- dominance ---------- */
VIEWS.dom={kind:'2d',title:'Which current dominates?',sub:'Share of J_t, J_x and J_d in the total at each bias',drag:'V',
  params:[MATSEL,R('V','Bias $V$',0,1.3,0.001,0.2,'V',{f:v=>v.toFixed(3)+' V'})],
  draw(g,W,H,p,t,S){
    const mt=MATS[p.mat],m=mt.m,P=mt.P,Vmax=mt.Vmax;const bs=boxes(W,H,[1.3,1],{t:46,gap:40});
    const p1=new P2(g,bs[0],{x:[0,Vmax],y:[0,1],yl:'fraction of J',noxt:true});S.main=p1;p1.frame();
    const xs=lin(0.002,Vmax,300),fr=xs.map(v=>{const a=It(m,v),b=Ix(m,v),c=Id(m,v),s=a+b+c;return [a/s,(a+b)/s]});
    p1.pts([[xs[0],0],...xs.map((v,i)=>[v,fr[i][0]]),[Vmax,0]],{c:null,fc:'rgba(91,156,255,.55)',close:true});
    p1.pts([...xs.map((v,i)=>[v,fr[i][0]]),...xs.map((v,i)=>[v,fr[i][1]]).reverse()],{c:null,fc:'rgba(246,178,60,.55)',close:true});
    p1.pts([...xs.map((v,i)=>[v,fr[i][1]]),[Vmax,1],[xs[0],1]],{c:null,fc:'rgba(63,210,155,.55)',close:true});
    p1.vline(p.V,'#fff',[],null,2);
    const d=0.12*(P.Vv-P.Vp);for(const [n,a] of [['I',P.Vp/2],['II',(P.Vp+P.Vv-d)/2],['III',P.Vv],['IV',Math.min(Vmax*0.95,P.Vv+d+(Vmax-P.Vv)/2)]])p1.text(a,0.94,n,'#fff','center',13);
    const p2=new P2(g,bs[1],{x:[0,Vmax],y:[0,P.Ip*1.3],xl:'Forward voltage V (V)',yl:'J (mA)'});p2.frame();
    p2.curve(v=>It(m,v),{c:C.t,w:1.8});p2.curve(v=>Ix(m,v),{c:C.x,w:1.8});p2.curve(v=>Id(m,v),{c:C.d,w:1.8});p2.curve(v=>Itot(m,v),{c:C.tot,w:2.6});p2.dot(p.V,Itot(m,p.V),'#fff',5);
    legend(g,bs[0].x,24,[[C.t,'J_t tunnelling'],[C.x,'J_x excess'],[C.d,'J_d diffusion']]);
  },
  read(p){const m=MATS[p.mat].m,a=It(m,p.V),b=Ix(m,p.V),c=Id(m,p.V),s=a+b+c;const r=region(m,p.V,MATS[p.mat].P);return [['J_t share',(a/s*100).toFixed(1)+' %'],['J_x share',(b/s*100).toFixed(1)+' %'],['J_d share',(c/s*100).toFixed(1)+' %'],['Region',REGNAME[r],regCls(r)]]}
};

/* ---------- normalised I/IP for materials ---------- */
VIEWS.norm={kind:'2d',title:'Peak-to-valley ratio by material',sub:'Normalised I/I_P compares shape and PVR — not absolute current',
  params:[K('norm','Normalise to $I/I_P$',true),SEL('hl','Emphasise',[['all','all'],['Si','Si'],['Ge','Ge'],['GaSb','GaSb'],['GaAs','GaAs']],'all')],
  draw(g,W,H,p,t,S){
    const [b]=boxes(W,H,[1],{t:48});const ymax=p.norm?1.2:17;const pl=new P2(g,b,{x:[0,1.3],y:[0,ymax],xl:'Forward voltage V (V)',yl:p.norm?'I / I_P':'I (mA)'});pl.frame();
    for(const k of ['Si','Ge','GaSb','GaAs']){const s=MATS[k],sc=p.norm?1/s.P.Ip:1,on=p.hl==='all'||p.hl===k;
      pl.curve(v=>Itot(s.m,v)*sc,{c:s.col,w:on?2.6:1.2,a:on?1:.3});if(on){pl.dot(s.P.Vv,s.P.Iv*sc,s.col,4.5,k+'  '+s.target+':1',8,14)}}
    legend(g,b.x,24,['Si','Ge','GaSb','GaAs'].map(k=>[MATS[k].col,k]));
    if(!p.norm)rich(g,'Absolute currents depend on area and doping — compare PVR, not height',b.x+b.w-4,b.y+14,{align:'right',size:11,color:C.x});
  },
  read(){return ['Si','Ge','GaSb','GaAs'].map(k=>[k+' PVR',MATS[k].P.pvr.toFixed(1)+' : 1',MATS[k].P.pvr>10?'good':''])}
};

/* ---------- what controls IP: doping chain ---------- */
VIEWS.ipdop={kind:'2d',title:'Doping → W_d → ℰ → T_t → I_P',sub:'Symmetric abrupt Ge junction, V_bi ≈ 0.86 V',drag:'N',
  params:[LR('N','Doping $N_A=N_D$',2e18,2e20,2e19,'cm⁻³',{f:v=>num(v,2)+' cm⁻³'}),R('m','Tunnelling mass $m*$',0.02,0.3,0.005,0.05,'m₀',{f:v=>v.toFixed(3)+' m₀'}),R('E','Barrier $E_x$',0.3,1.2,0.01,0.66,'eV',{f:v=>v.toFixed(2)+' eV'})],
  draw(g,W,H,p,t,S){
    const bs=boxes(W,H,[1,1,1.2],{t:40,gap:26});const x=[2e18,2e20];const F=N=>2*0.86/(Wdep(N)*1e-9);const T=N=>Ttun(p.E,F(N),p.m);
    const p1=new P2(g,bs[0],{x,logx:true,y:[0,45],yl:'W_d (nm)',noxt:true,title:'depletion width'});S.main=p1;p1.frame();p1.hband(5,10,'rgba(56,214,232,.08)');p1.curve(Wdep,{c:C.cyan,w:2.4});p1.dot(p.N,Wdep(p.N),'#fff',5);
    const p2=new P2(g,bs[1],{x,logx:true,y:[0,7],yl:'ℰ (MV/cm)',noxt:true,title:'peak junction field'});p2.frame();p2.curve(N=>F(N)/1e8,{c:C.vio,w:2.4});p2.dot(p.N,F(p.N)/1e8,'#fff',5);
    const p3=new P2(g,bs[2],{x,logx:true,y:[1e-30,1],logy:true,xl:'Doping N (cm⁻³)',yl:'T_t ∝ I_P',title:'tunnelling probability'});p3.frame();p3.curve(T,{c:C.d,w:2.6});p3.dot(p.N,T(p.N),'#fff',5);
  },
  read(p){const W_=Wdep(p.N),F=2*0.86/(W_*1e-9),T=Ttun(p.E,F,p.m),T2=Ttun(p.E,2*0.86/(Wdep(p.N*2)*1e-9),p.m);return [['W_d',W_.toFixed(1)+' nm',W_<12?'good':'warn'],['ℰ',(F/1e8).toFixed(2)+' MV/cm'],['T_t',num(T,3)],['doubling N → I_P ×',num(T2/T,3),'good']]}
};

/* ---------- what controls IV: defects ---------- */
VIEWS.defect={kind:'2d',title:'Defect density sets the valley floor',sub:'More gap states → more excess current → lower PVR',
  params:[LR('D','Defect density $D_x$ (relative)',0.05,30,1,'×',{f:v=>num(v,2)+'×'})],
  draw(g,W,H,p,t,S){
    const base=MATS.Ge.m,P0=pv(base);const bs=boxes(W,H,[1.3,1],{t:46,gap:40});
    const p1=new P2(g,bs[0],{x:[0,0.6],y:[0,P0.Ip*1.3],xl:'Forward voltage V (V)',yl:'I (mA)'});p1.frame();
    for(const d of [0.1,1,10])if(Math.abs(Math.log10(d/p.D))>0.15)p1.curve(v=>Itot(mk({...base,Iv:base.Iv*d}),v),{c:C.mute,w:1.2,a:.5});
    const m=mk({...base,Iv:base.Iv*p.D}),P=pv(m,0.6);p1.curve(v=>Itot(m,v),{c:C.tot,w:2.8});p1.curve(v=>Ix(m,v),{c:C.x,w:1.8,dash:[6,4]});p1.dot(P.Vv,P.Iv,C.ndr,5.5,'I_V = '+mA(P.Iv),8,-14);
    const p2=new P2(g,bs[1],{x:[0.05,30],logx:true,y:[0.5,60],logy:true,xl:'Relative defect density D_x',yl:'PVR'});p2.frame();
    p2.curve(d=>pv(mk({...base,Iv:base.Iv*d}),0.6).pvr,{c:C.ndr,w:2.6,n:120});p2.dot(p.D,P.pvr,'#fff',5.5,P.pvr.toFixed(1)+' : 1');
  },
  read(p){const P=pv(mk({...MATS.Ge.m,Iv:MATS.Ge.m.Iv*p.D}),0.6);return [['I_P',mA(P.Ip)],['I_V',mA(P.Iv)],['PVR',P.pvr.toFixed(2)+' : 1',P.pvr>8?'good':P.pvr>3?'warn':'bad']]}
};

/* ---------- temperature ---------- */
function tModel(T,heavy){const Eg=0.7437-4.774e-4*T*T/(T+235),Eg3=0.7437-4.774e-4*9e4/535;const a=heavy?0.0012:-0.0025;
  const b=MATS.Ge.m;return mk({...b,T,Eg,Ip:b.Ip*(1+a*(T-300)),Iv:b.Iv*(1+0.002*(T-300)),I0:b.I0*(T/300)**3*Math.exp(-(Eg/(KB*T)-Eg3/(KB*300)))})}
VIEWS.temp={kind:'2d',title:'Temperature dependence of the I-V curve',sub:'Heavily doped: band-gap shrink wins, I_P rises · lighter doping: I_P falls',
  params:[R('T','Temperature $T$',220,420,1,300,'K',{f:v=>v+' K'}),SEL('dop','Doping',[['heavy','very heavy (dI_P/dT > 0)'],['light','lighter (dI_P/dT < 0)']],'heavy')],
  draw(g,W,H,p,t,S){
    const heavy=p.dop==='heavy';const bs=boxes(W,H,[1.4,1],{t:46,gap:40});
    const p1=new P2(g,bs[0],{x:[0,0.6],y:[0,14],xl:'Forward voltage V (V)',yl:'I (mA)'});p1.frame();
    for(const T of [240,300,360,420])p1.curve(v=>Itot(tModel(T,heavy),v),{c:C.mute,w:1.1,a:.6});
    const m=tModel(p.T,heavy);p1.curve(v=>Itot(m,v),{c:p.T>300?C.red:C.t,w:2.8});const P=pv(m,0.6);p1.dot(P.Vp,P.Ip,C.ndr,5.5,'I_P = '+mA(P.Ip));
    legend(g,bs[0].x,24,[[p.T>300?C.red:C.t,'T = '+p.T+' K'],[C.mute,'240 · 300 · 360 · 420 K']]);
    const p2=new P2(g,bs[1],{x:[220,420],y:[6,14],xl:'Temperature T (K)',yl:'I_P (mA)'});p2.frame();
    p2.curve(T=>pv(tModel(T,heavy),0.6).Ip,{c:heavy?C.d:C.ndr,w:2.6,n:80});p2.dot(p.T,P.Ip,'#fff',5.5);
  },
  read(p){const heavy=p.dop==='heavy',m=tModel(p.T,heavy),P=pv(m,0.6),d=(pv(tModel(p.T+1,heavy),0.6).Ip-pv(tModel(p.T-1,heavy),0.6).Ip)/2;
    return [['E_g(T)',m.Eg.toFixed(4)+' eV'],['I_P',mA(P.Ip)],['dI_P/dT',(d*1000).toFixed(1)+' µA/K',d>0?'good':'bad'],['I_V',mA(P.Iv)],['PVR',P.pvr.toFixed(2)+' : 1']]}
};

/* ---------- doping profile sharpness ---------- */
VIEWS.profile={kind:'2d',title:'Sharp profile + clean crystal = high PVR',sub:'Net doping across the junction for the chosen grading length',
  params:[SEL('proc','Process preset',[['alloy','Ball alloy'],['planar','Planar diffusion'],['mocvd','MOCVD'],['mbe','MBE'],['custom','Custom']],'mbe'),R('L','Grading length $L$',0.3,20,0.1,0.8,'nm',{f:v=>v.toFixed(1)+' nm'}),LR('D','Defect density (relative)',0.1,10,0.6,'×',{f:v=>num(v,2)+'×'})],
  preset:{alloy:{L:8,D:3},planar:{L:12,D:2},mocvd:{L:1.5,D:0.8},mbe:{L:0.8,D:0.6}},
  draw(g,W,H,p,t,S){
    const bs=boxes(W,H,[1.3,1],{t:46,gap:40});const p1=new P2(g,bs[0],{x:[-30,30],y:[-1.2,1.2],xl:'Position x (nm)',yl:'(N_D − N_A)/N'});p1.frame();
    const erf=x=>{const s=Math.sign(x);x=Math.abs(x);const t2=1/(1+0.3275911*x);return s*(1-(((((1.061405429*t2-1.453152027)*t2)+1.421413741)*t2-0.284496736)*t2+0.254829592)*t2*Math.exp(-x*x))};
    p1.curve(x=>erf(x/p.L),{c:C.cyan,w:2.8});p1.curve(x=>Math.sign(x),{c:C.mute,w:1.2,dash:[4,4]});
    const W0=5.5,We=Math.sqrt(W0*W0+(1.6*p.L)**2);p1.vband(-We/2,We/2,'rgba(255,92,138,.12)','W_d ≈ '+We.toFixed(1)+' nm',C.ndr);
    p1.text(-28,0.95,'n⁺',C.cyan);p1.text(25,-0.95,'p⁺',C.x);
    const Ip=Math.exp(-0.35*(We-W0)),Iv=0.08*Ip+0.05*p.D,pvr=Ip/Iv;const p2=new P2(g,bs[1],{x:[0,3],y:[0,1.15],yl:'relative',noxt:true});p2.frame();
    const bars=[['I_P',Ip,C.t],['I_V',Iv,C.x],['PVR/20',Math.min(1.1,pvr/20),C.d]];
    bars.forEach(([l,v,c],i)=>{g.fillStyle=c;const x0=p2.X(i+0.25),x1=p2.X(i+0.75);g.fillRect(x0,p2.Y(v),x1-x0,p2.Y(0)-p2.Y(v));rich(g,l,(x0+x1)/2,p2.Y(0)+14,{align:'center',size:12})});
    rich(g,'PVR = '+pvr.toFixed(1)+' : 1',p2.X(2.5),p2.Y(Math.min(1.1,pvr/20))-12,{align:'center',size:12,color:C.tot});
  },
  read(p){const W0=5.5,We=Math.sqrt(W0*W0+(1.6*p.L)**2),Ip=Math.exp(-0.35*(We-W0)),Iv=0.08*Ip+0.05*p.D;return [['W_d effective',We.toFixed(1)+' nm'],['I_P (rel.)',Ip.toFixed(3)],['I_V (rel.)',Iv.toFixed(3)],['PVR',(Ip/Iv).toFixed(1)+' : 1',Ip/Iv>10?'good':'warn']]}
};

/* ---------- series inductance ---------- */
VIEWS.xl={kind:'2d',title:'Series inductance reactance X_L = ωL_s',sub:'Even picohenries matter at microwave frequencies',drag:'f',
  params:[LR('L','Series inductance $L_s$',1,5000,100,'pH',{f:v=>si(v*1e-12,'H')}),LR('f','Frequency $f$',0.1,300,10,'GHz',{f:v=>si(v*1e9,'Hz')}),R('R','|−R| for comparison',2,60,0.5,18,'Ω',{f:v=>v.toFixed(1)+' Ω'})],
  draw(g,W,H,p,t,S){
    const [b]=boxes(W,H,[1],{t:48});const pl=new P2(g,b,{x:[0.1,300],logx:true,y:[1e-3,1e4],logy:true,xl:'Frequency f (GHz)',yl:'Reactance X_L (Ω)'});S.main=pl;pl.frame();
    for(const k of [0.1,10])pl.curve(f=>2*Math.PI*f*1e9*p.L*k*1e-12,{c:C.vio,w:1.2,a:.45});
    pl.curve(f=>2*Math.PI*f*1e9*p.L*1e-12,{c:C.vio,w:2.8});pl.hline(p.R,C.ndr,[5,4],'|−R| = '+p.R+' Ω');
    const fc=p.R/(2*Math.PI*p.L*1e-12)/1e9;pl.vline(fc,C.ndr,[2,3],'X_L = |R| at '+si(fc*1e9,'Hz'));
    pl.dot(p.f,2*Math.PI*p.f*1e9*p.L*1e-12,'#fff',6);
    legend(g,b.x,24,[[C.vio,'X_L for L_s'],['rgba(169,139,255,.45)','L_s ×0.1 and ×10']]);
  },
  read(p){const X=2*Math.PI*p.f*1e9*p.L*1e-12;return [['ω',si(2*Math.PI*p.f*1e9,'rad/s')],['X_L',si(X,'Ω'),X<p.R/5?'good':X<p.R?'warn':'bad'],['X_L / |R|',(X/p.R).toFixed(3)]]}
};

/* ---------- conductance, resistance, noise ---------- */
VIEWS.gr={kind:'2d',title:'Differential conductance and resistance',sub:'G: + → 0 → − → 0 → +   ·   |r_d| → ∞ where G = 0',drag:'V',
  params:[R('V','Bias $V$',0,0.6,0.001,0.1,'V',{f:v=>v.toFixed(3)+' V'}),SEL('lo','Lower panel',[['G','G = dI/dV'],['r','r_d = 1/G'],['n','noise measure → R_{mnf}']],'G')],
  draw(g,W,H,p,t,S){
    const m=DEF,P=MATS.Ge.P;const bs=boxes(W,H,[1,1.2],{t:46,gap:40});
    const p1=new P2(g,bs[0],{x:[0,0.6],y:[0,P.Ip*1.3],yl:'I (mA)',noxt:true});S.main=p1;p1.vband(P.Vp,P.Vv,'rgba(255,92,138,.08)');p1.frame();
    p1.curve(v=>Itot(m,v),{c:C.tot,w:2.6});const I=Itot(m,p.V),G=dI(m,p.V);p1.pts([[p.V-0.05,I-G*0.05],[p.V+0.05,I+G*0.05]],{c:G<0?C.ndr:C.cyan,w:2.2});p1.dot(p.V,I,'#fff',5.5);
    p1.dot(P.Vg,Itot(m,P.Vg),C.x,4.5,'R_{min}',8,-12);
    let p2;
    if(p.lo==='G'){p2=new P2(g,bs[1],{x:[0,0.6],y:[-70,170],xl:'Forward voltage V (V)',yl:'G (mS)'});p2.frame();
      p2.curve(v=>Math.max(0,dI(m,v)),{c:C.d,fill:0,fa:.18});p2.curve(v=>Math.min(0,dI(m,v)),{c:C.ndr,fill:0,fa:.25});p2.curve(v=>dI(m,v),{c:C.tot,w:2.4});
      p2.dot(P.Vp,0,C.ndr,4.5,'G = 0 at peak',8,-14);p2.dot(P.Vv,0,C.ndr,4.5,'G = 0 at valley',8,14);p2.dot(P.Vg,P.gmin,C.x,4.5,'most negative G',8,14);p2.dot(p.V,G,'#fff',5.5)}
    else if(p.lo==='r'){p2=new P2(g,bs[1],{x:[0,0.6],y:[-150,150],xl:'Forward voltage V (V)',yl:'r_d (Ω)'});p2.frame();
      const r=v=>1000/dI(m,v);p2.curve(r,{c:C.tot,w:2.4,n:900});p2.vline(P.Vp,C.mute,[3,3],'|r_d| → ∞');p2.vline(P.Vv,C.mute,[3,3],'|r_d| → ∞');
      p2.hline(-P.Rmin,C.x,[5,4],'−R_{min} = −'+P.Rmin.toFixed(1)+' Ω');p2.dot(P.Vg,-P.Rmin,C.x,5);p2.dot(p.V,clamp(r(p.V),-150,150),'#fff',5.5)}
    else{const M_=v=>{const g2=dI(m,v);return g2<0?Itot(m,v)*1e-3*(1000/-g2)/(2*0.02585):NaN};
      let best=P.Vp,bm=Infinity;for(let i=1;i<200;i++){const v=lerp(P.Vp,P.Vv,i/200);const mm=M_(v);if(mm<bm){bm=mm;best=v}}
      p2=new P2(g,bs[1],{x:[0,0.6],y:[0,30],xl:'Forward voltage V (V)',yl:'qI|r_d|/2kT'});p2.vband(P.Vp,P.Vv,'rgba(255,92,138,.06)');p2.frame();
      p2.curve(M_,{c:C.vio,w:2.6,n:500});p2.dot(best,bm,C.vio,5.5,'min → R_{mnf} = '+(1000/-dI(m,best)).toFixed(1)+' Ω',8,-14);p2.dot(P.Vg,M_(P.Vg),C.x,5,'R_{min} bias',8,16);S.mnf={best,R:1000/-dI(m,best)}}
  },
  read(p,S){const m=DEF,P=MATS.Ge.P,G=dI(m,p.V);const o=[['G',si(G*1e-3,'S'),G<0?'bad':'good'],['r_d',Math.abs(G)<0.05?'→ ∞':si(1000/G,'Ω'),G<0?'bad':''],['R_{min}',P.Rmin.toFixed(1)+' Ω at '+P.Vg.toFixed(3)+' V'],['2V_P/I_P',(2*P.Vp/P.Ip*1000).toFixed(1)+' Ω']];if(S.mnf)o.push(['R_{mnf}',S.mnf.R.toFixed(1)+' Ω at '+S.mnf.best.toFixed(3)+' V']);return o}
};

/* ---------- Rmin check ---------- */
VIEWS.rmin={kind:'2d',title:'How good is R_{min} ≈ 2V_P/I_P?',sub:'|r_d| across the NDR region for the J_t term alone and for the full model',
  params:[R('Vp','$V_P$',0.03,0.2,0.001,0.05,'V',{f:v=>v.toFixed(3)+' V'}),R('Ip','$I_P$',1,50,0.5,10,'mA',{f:v=>v.toFixed(1)+' mA'}),K('full','Add excess + diffusion terms',true)],
  draw(g,W,H,p,t,S){
    const mt=mk({...MATS.Ge.m,Ip:p.Ip,Vp:p.Vp,Iv:MATS.Ge.m.Iv*p.Ip/10});const R2=2*p.Vp/p.Ip*1000,Re=Math.E*p.Vp/p.Ip*1000;
    const [b]=boxes(W,H,[1],{t:48});const pl=new P2(g,b,{x:[0,8],y:[0,Re*4],xl:'V / V_P',yl:'|r_d| in the NDR region (Ω)'});pl.frame();
    const rj=x=>{const d=p.Ip/p.Vp*Math.exp(1-x)*(1-x);return d<0?1000/-d:NaN};pl.curve(rj,{c:C.t,w:2.6,n:600});
    if(p.full)pl.curve(x=>{const d=dI(mt,x*p.Vp);return d<0?1000/-d:NaN},{c:C.tot,w:2.2,n:600});
    pl.hline(R2,C.x,[5,4],'2V_P/I_P = '+R2.toFixed(2)+' Ω');pl.hline(Re,C.d,[2,3],'e·V_P/I_P = '+Re.toFixed(2)+' Ω');pl.dot(2,Re,C.t,5.5,'J_t only: min at V = 2V_P',8,16);
    if(p.full){const P=pv(mt,1.2);pl.dot(P.Vg/p.Vp,P.Rmin,'#fff',5.5,'full model R_{min} = '+P.Rmin.toFixed(2)+' Ω',8,-14)}
    legend(g,b.x,24,[[C.t,'J_t term only'],...(p.full?[[C.tot,'full J_t + J_x + J_d']]:[])]);
  },
  read(p){const mt=mk({...MATS.Ge.m,Ip:p.Ip,Vp:p.Vp,Iv:MATS.Ge.m.Iv*p.Ip/10});const P=pv(mt,1.2);return [['2V_P/I_P',(2*p.Vp/p.Ip*1000).toFixed(2)+' Ω'],['e·V_P/I_P',(Math.E*p.Vp/p.Ip*1000).toFixed(2)+' Ω'],['full model',P.Rmin.toFixed(2)+' Ω'],['I_P ×2 → R_{min} ×','0.5','good']]}
};

/* ---------- input impedance vs frequency ---------- */
const ZP=[R('R','|−R|',2,100,0.5,10,'Ω',{f:v=>v.toFixed(1)+' Ω'}),R('Rs','Series $R_s$',0.1,20,0.1,1,'Ω',{f:v=>v.toFixed(1)+' Ω'}),LR('Cj','Junction $C_j$',0.1,20,1,'pF',{f:v=>si(v*1e-12,'F')}),LR('Ls','Series $L_s$',1,3000,5,'pH',{f:v=>si(v*1e-12,'H')}),LR('f','Frequency $f$',0.1,1000,10,'GHz',{f:v=>si(v*1e9,'Hz')})];
function zRead(p){const z=Zin(p.f*1e9,p.R,p.Rs,p.Cj*1e-12,p.Ls*1e-12),a=fr(p.R,p.Rs,p.Cj*1e-12),b=fx(p.R,p.Cj*1e-12,p.Ls*1e-12);
  return [['Re{Z_{in}}',si(z.re,'Ω'),z.re<0?'good':'bad'],['Im{Z_{in}}',si(z.im,'Ω')],['f_r',isNaN(a)?'none (R ≤ R_s)':si(a,'Hz'),isNaN(a)?'bad':''],['f_x',isNaN(b)?'none (L_s ≥ R²C_j)':si(b,'Hz'),isNaN(b)?'warn':''],['ordering',isNaN(a)?'no NDR':isNaN(b)?'—':b>a?'f_x > f_r · stable':'f_r > f_x · may self-oscillate',isNaN(a)?'bad':b>a?'good':'bad']]}
VIEWS.zin={kind:'2d',title:'Input impedance Z_{in}(f)',sub:'Real part (negative = useful gain) and imaginary part, with cutoffs f_r and f_x',drag:'f',
  params:ZP,
  draw(g,W,H,p,t,S){
    const [b]=boxes(W,H,[1],{t:48});const Y=Math.max(p.R,p.Rs)*1.3;const pl=new P2(g,b,{x:[0.1,1000],logx:true,y:[-Y,Y],xl:'Frequency f (GHz)',yl:'Z_{in} components (Ω)'});S.main=pl;
    const a=fr(p.R,p.Rs,p.Cj*1e-12),c=fx(p.R,p.Cj*1e-12,p.Ls*1e-12);
    if(!isNaN(a))pl.vband(0.1,a/1e9,'rgba(63,210,155,.07)','Re{Z_{in}} < 0',C.d);pl.frame();
    const z=f=>Zin(f*1e9,p.R,p.Rs,p.Cj*1e-12,p.Ls*1e-12);
    pl.curve(f=>z(f).re,{c:C.d,w:2.8,n:500});pl.curve(f=>z(f).im,{c:C.vio,w:2.8,n:500});
    pl.hline(p.Rs,C.mute,[2,3],'R_s');pl.hline(p.Rs-p.R,C.mute,[2,3],'R_s − R');
    if(!isNaN(a))pl.vline(a/1e9,C.d,[5,4],'f_r = '+si(a,'Hz'));if(!isNaN(c))pl.vline(c/1e9,C.vio,[5,4],'f_x = '+si(c,'Hz'));
    const zz=z(p.f);pl.dot(p.f,zz.re,C.d,5.5);pl.dot(p.f,zz.im,C.vio,5.5);pl.vline(p.f,'rgba(255,255,255,.3)',[3,3]);
    legend(g,b.x,24,[[C.d,'Re{Z_{in}} = R_s − R/[1+(ωRC_j)²]'],[C.vio,'Im{Z_{in}} = ωL_s − ωC_jR²/[1+(ωRC_j)²]']]);
  },
  read:zRead
};

/* ---------- cutoff ladder across the NDR region ---------- */
VIEWS.ladder={kind:'2d',title:'f_r and f_x as the bias moves through the NDR region',sub:'R = |r_d(V)|; the R_{min} bias gives the highest f_r (f_{r0}) and lowest f_x (f_{x0})',drag:'V',
  params:[R('V','Bias inside NDR $V$',0.052,0.3,0.001,0.1,'V',{f:v=>v.toFixed(3)+' V'}),R('Rs','Series $R_s$',0.1,8,0.1,1,'Ω',{f:v=>v.toFixed(1)+' Ω'}),LR('Cj','Junction $C_j$',0.2,10,1,'pF',{f:v=>si(v*1e-12,'F')}),LR('Ls','Series $L_s$',1,1000,5,'pH',{f:v=>si(v*1e-12,'H')})],
  draw(g,W,H,p,t,S){
    const m=DEF,P=MATS.Ge.P,Rv=v=>{const d=dI(m,v);return d<0?1000/-d:NaN};const bs=boxes(W,H,[1,1.4],{t:46,gap:40});
    const p1=new P2(g,bs[0],{x:[P.Vp,P.Vv],y:[0,200],yl:'|r_d| (Ω)',noxt:true});S.main=p1;p1.frame();p1.curve(Rv,{c:C.ndr,w:2.4,n:400});p1.dot(P.Vg,P.Rmin,C.x,5.5,'R_{min} = '+P.Rmin.toFixed(1)+' Ω',8,-14);p1.dot(p.V,Rv(p.V),'#fff',5.5);
    const p2=new P2(g,bs[1],{x:[P.Vp,P.Vv],y:[1,1000],logy:true,xl:'Bias V in the NDR region (V)',yl:'frequency (GHz)'});p2.frame();
    p2.curve(v=>fr(Rv(v),p.Rs,p.Cj*1e-12)/1e9,{c:C.d,w:2.6,n:400});p2.curve(v=>fx(Rv(v),p.Cj*1e-12,p.Ls*1e-12)/1e9,{c:C.vio,w:2.6,n:400});
    const a0=fr(P.Rmin,p.Rs,p.Cj*1e-12),b0=fx(P.Rmin,p.Cj*1e-12,p.Ls*1e-12);
    p2.dot(P.Vg,a0/1e9,C.d,5.5,'f_{r0} = '+si(a0,'Hz'),8,14);if(!isNaN(b0))p2.dot(P.Vg,b0/1e9,C.vio,5.5,'f_{x0} = '+si(b0,'Hz'),8,-14);
    p2.vline(p.V,'rgba(255,255,255,.3)',[3,3]);
    legend(g,bs[0].x,24,[[C.d,'f_r(V)'],[C.vio,'f_x(V)'],[C.ndr,'|r_d(V)|']]);
  },
  read(p){const m=DEF,P=MATS.Ge.P,d=dI(m,p.V),Rr=d<0?1000/-d:NaN;const a=fr(Rr,p.Rs,p.Cj*1e-12),b=fx(Rr,p.Cj*1e-12,p.Ls*1e-12),a0=fr(P.Rmin,p.Rs,p.Cj*1e-12),b0=fx(P.Rmin,p.Cj*1e-12,p.Ls*1e-12);
    return [['R at bias',isNaN(Rr)?'outside NDR':Rr.toFixed(1)+' Ω'],['f_r',si(a,'Hz')],['f_x',si(b,'Hz')],['f_{r0} (max)',si(a0,'Hz'),'good'],['f_{x0} (min)',isNaN(b0)?'none':si(b0,'Hz')],['ordering',isNaN(b0)?'—':b0>a0?'f_{x0} > f_{r0} · stable':'f_{r0} > f_{x0} · self-oscillation',b0>a0?'good':'bad']]}
};

/* ---------- stability map ---------- */
VIEWS.stab={kind:'2d',title:'Stability map over (L_s, R_s)',sub:'Classification at the R_{min} bias, cells computed from equations (34) and (35)',
  params:[LR('Ls','Series $L_s$',1,3000,5,'pH',{f:v=>si(v*1e-12,'H')}),R('Rs','Series $R_s$',0.1,15,0.1,1,'Ω',{f:v=>v.toFixed(1)+' Ω'}),R('Rmin','$R_{min}$',3,60,0.5,10,'Ω',{f:v=>v.toFixed(1)+' Ω'}),LR('Cj','$C_j$',0.2,10,1,'pF',{f:v=>si(v*1e-12,'F')})],
  draw(g,W,H,p,t,S){
    const [b]=boxes(W,H,[1],{t:48,b:62});const pl=new P2(g,b,{x:[1,3000],logx:true,y:[0.1,15],xl:'Series inductance L_s (pH)',yl:'Series resistance R_s (Ω)'});
    const nx=Math.round(b.w/5),ny=Math.round(b.h/5);const cw=b.w/nx,ch=b.h/ny;
    const cls=(L,Rs)=>{if(Rs>=p.Rmin)return 0;const b0=fx(p.Rmin,p.Cj*1e-12,L*1e-12);if(isNaN(b0))return 1;const a0=fr(p.Rmin,Rs,p.Cj*1e-12);return a0>b0?2:3};
    const COL=['rgba(90,100,120,.45)','rgba(169,139,255,.35)','rgba(255,92,138,.45)','rgba(63,210,155,.35)'];
    for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){const L=pl.ix(b.x+(i+.5)*cw),Rs=lerp(15,0.1,(j+.5)/ny);g.fillStyle=COL[cls(L,Rs)];g.fillRect(b.x+i*cw,b.y+j*ch,cw+.5,ch+.5)}
    pl.frame();pl.dot(p.Ls,p.Rs,'#fff',6.5);
    const lg2=[[COL[3],'stable: f_{x0} > f_{r0}'],[COL[2],'self-oscillation: f_{r0} > f_{x0}'],[COL[1],'no self-resonance (L_s ≥ R²C_j)'],[COL[0],'no NDR (R_s ≥ R_{min})']];
    let x=b.x;lg2.forEach(([c,l])=>{g.fillStyle=c;g.fillRect(x,18,14,12);x+=20;x+=rich(g,l,x,24,{size:11})+16;if(x>W-160){x=b.x}});
  },
  read(p){const a=fr(p.Rmin,p.Rs,p.Cj*1e-12),b=fx(p.Rmin,p.Cj*1e-12,p.Ls*1e-12);const st=p.Rs>=p.Rmin?['no NDR','bad']:isNaN(b)?['no self-resonance','warn']:a>b?['self-oscillation risk','bad']:['stable','good'];
    return [['f_{r0}',si(a,'Hz')],['f_{x0}',isNaN(b)?'none':si(b,'Hz')],['R_{min}²C_j',si(p.Rmin*p.Rmin*p.Cj*1e-12,'H')],['verdict',st[0],st[1]]]}
};

/* ---------- time-domain oscillator ---------- */
function simOsc(p){
  const m=DEF,L=p.L,Cp=p.Cj,Rs=p.Rs,Vb=p.Vb;const per=2*Math.PI*Math.sqrt(L*Cp)*31.623;
  const Tend=Math.min(2e5,Math.max(per*16,L/Math.max(Rs,0.5)*1000*6));
  let dt=Math.min(per/400,Cp*1.0);if(Tend/dt>2.5e5)dt=Tend/2.5e5;
  const N=Math.ceil(Tend/dt),every=Math.max(1,Math.floor(N/1600));
  let i=0,v=0;const f=(i,v)=>{v=clamp(v,-0.3,1.0);return [(Vb-Rs*i/1000-v)/L,(i-Itot(m,v))*1e-3/Cp]};
  const ts=[],vs=[],is=[];
  for(let k=0;k<N;k++){
    const a=f(i,v),b=f(i+a[0]*dt/2,v+a[1]*dt/2),c=f(i+b[0]*dt/2,v+b[1]*dt/2),d=f(i+c[0]*dt,v+c[1]*dt);
    i+=dt/6*(a[0]+2*b[0]+2*c[0]+d[0]);v+=dt/6*(a[1]+2*b[1]+2*c[1]+d[1]);v=clamp(v,-0.3,1.0);
    if(k%every===0){ts.push(k*dt);vs.push(v);is.push(i)}
  }
  const h=Math.floor(vs.length/2),tail=vs.slice(h),mean=tail.reduce((a,b)=>a+b,0)/tail.length;let cr=[];for(let k=h+1;k<vs.length;k++)if(vs[k-1]<mean&&vs[k]>=mean)cr.push(ts[k]);
  const amp=Math.max(...tail)-Math.min(...tail);const f0=cr.length>2&&amp>0.005?(cr.length-1)/(cr[cr.length-1]-cr[0])*1e12:0;
  const ops=[];let prev=null;for(let k=0;k<=600;k++){const vv=k/1000;const r=(Vb-vv)*1000/Rs-Itot(m,vv);if(prev!==null&&Math.sign(r)!==Math.sign(prev.r))ops.push(vv);prev={r}}
  return {ts,vs,is,amp,f0,ops,Tend};
}
VIEWS.osc={kind:'2d',anim:true,title:'Tunnel-diode oscillator — time-domain simulation',sub:'Bias source → R_s → L_s → (C_j ∥ nonlinear diode). RK4 integration of the equivalent circuit',
  params:[R('Vb','Bias source $V_B$',0,0.7,0.001,0.15,'V',{f:v=>v.toFixed(3)+' V'}),R('Rs','Series $R_s$',0.2,40,0.1,2,'Ω',{f:v=>v.toFixed(1)+' Ω'}),LR('L','Inductance $L$',0.02,20,1,'nH',{f:v=>si(v*1e-9,'H')}),LR('Cj','Capacitance $C$',0.2,20,2,'pF',{f:v=>si(v*1e-12,'F')})],
  draw(g,W,H,p,t,S){
    const key=[p.Vb,p.Rs,p.L,p.Cj].join();if(S.key!==key){S.key=key;S.sim=simOsc(p)}const s=S.sim,n=s.ts.length;
    const wide=W>640;const lw=wide?W*0.58:W;const bs=boxes(lw,wide?H:H*0.55,[1,1],{t:46,gap:34});
    const p1=new P2(g,bs[0],{x:[0,s.Tend/1000],y:[-0.05,0.75],yl:'v (V)',noxt:true});p1.frame();p1.pts(s.ts.map((t2,k)=>[t2/1000,s.vs[k]]),{c:C.cyan,w:1.6});
    const imax=Math.max(14,...s.is)*1.05,imin=Math.min(0,...s.is);
    const p2=new P2(g,bs[1],{x:[0,s.Tend/1000],y:[imin,imax],xl:'time (ns)',yl:'i (mA)'});p2.frame();p2.pts(s.ts.map((t2,k)=>[t2/1000,s.is[k]]),{c:C.x,w:1.6});
    const k=MOTION?Math.floor((t*0.12%1)*n):n-1;p1.dot(s.ts[k]/1000,s.vs[k],'#fff',4.5);p2.dot(s.ts[k]/1000,s.is[k],'#fff',4.5);
    const b3=wide?{x:lw+56,y:46,w:W-lw-74,h:H-92}:{x:62,y:H*0.55+40,w:W-80,h:H*0.45-80};
    const p3=new P2(g,b3,{x:[-0.05,0.75],y:[imin,imax],xl:'v (V)',yl:'i (mA)',title:'phase plane'});p3.frame();
    p3.curve(v=>Itot(DEF,v),{c:'rgba(238,243,250,.55)',w:1.6});p3.curve(v=>(p.Vb-v)*1000/p.Rs,{c:C.mute,w:1.2,dash:[4,4]});
    p3.pts(s.vs.map((v,j)=>[v,s.is[j]]),{c:C.ndr,w:1.3,a:.85});p3.dot(s.vs[k],s.is[k],'#fff',4.5);
    for(const v of s.ops)p3.dot(v,Itot(DEF,v),dI(DEF,v)<0?C.ndr:C.d,4);
  },
  read(p,S){if(!S.sim)return [];const s=S.sim;const op=s.ops.find(v=>dI(DEF,v)<0);const osc=s.amp>0.01&&s.f0>0;
    return [['DC points',s.ops.length+' ('+s.ops.map(v=>v.toFixed(2)).join(', ')+' V)'],['in NDR?',op!==undefined?'yes · r_d = '+(1000/dI(DEF,op)).toFixed(1)+' Ω':'no',op!==undefined?'good':''],['oscillation',osc?'sustained':'decays / none',osc?'good':'warn'],['frequency',osc?si(s.f0,'Hz'):'—'],['swing Δv',(s.amp*1000).toFixed(0)+' mV'],['LC estimate',si(1/(2*Math.PI*Math.sqrt(p.L*1e-9*p.Cj*1e-12)),'Hz')]]}
};

/* ---------- switching transient ---------- */
function simSw(p){const m=DEF,P=MATS.Ge.P,Iin=P.Ip*p.k,Cp=p.Cj;let v=0;const dt=0.02*Cp,ts=[],vs=[];let tt=0;
  for(let k=0;k<200000&&tt<5000;k++){const dv=(Iin-Itot(m,v))*1e-3/Cp;v+=dv*dt;tt+=dt;if(k%20===0){ts.push(tt);vs.push(v)}if(Math.abs(dv)<1e-7&&v>P.Vv)break}
  const vf=vs[vs.length-1],v1=P.Vp+0.1*(vf-P.Vp),v2=P.Vp+0.9*(vf-P.Vp);const t1=ts[vs.findIndex(x=>x>=v1)],t2=ts[vs.findIndex(x=>x>=v2)];return {ts,vs,vf,t1,t2,Iin}}
VIEWS.sw={kind:'2d',anim:true,title:'Switching from the peak to the diffusion branch',sub:'A current slightly above I_P forces a jump; C_j limits the slew rate dV/dt = I/C',
  params:[LR('Cj','Junction $C_j$',0.2,10,1,'pF',{f:v=>si(v*1e-12,'F')}),R('k','Drive current $I/I_P$',1.01,1.6,0.01,1.1,'×',{f:v=>v.toFixed(2)+'×'})],
  draw(g,W,H,p,t,S){
    const key=p.Cj+','+p.k;if(S.key!==key){S.key=key;S.s=simSw(p)}const s=S.s,P=MATS.Ge.P;const wide=W>640,lw=wide?W*0.55:W;
    const [b1]=boxes(lw,wide?H:H*0.55,[1],{t:48});const tmax=s.ts[s.ts.length-1];
    const p1=new P2(g,b1,{x:[0,tmax],y:[0,s.vf*1.15],xl:'time (ps)',yl:'diode voltage (V)'});p1.frame();
    if(s.t1!=null&&s.t2!=null)p1.vband(s.t1,s.t2,'rgba(56,214,232,.12)','10–90 %',C.cyan);
    p1.pts(s.ts.map((x,i)=>[x,s.vs[i]]),{c:C.cyan,w:2.6});const k=MOTION?Math.floor((t*0.25%1)*s.ts.length):s.ts.length-1;p1.dot(s.ts[k],s.vs[k],'#fff',5);
    const b2=wide?{x:lw+56,y:48,w:W-lw-74,h:H-94}:{x:62,y:H*0.55+40,w:W-80,h:H*0.45-80};
    const p2=new P2(g,b2,{x:[0,0.6],y:[0,P.Ip*1.4],xl:'V (V)',yl:'I (mA)',title:'path on the I-V curve'});p2.frame();
    p2.curve(v=>Itot(DEF,v),{c:C.tot,w:2.2});p2.hline(s.Iin,C.x,[5,4],'drive I');
    arrow(g,p2.X(P.Vp),p2.Y(s.Iin),p2.X(s.vf)-6,p2.Y(s.Iin),C.cyan,2.2);p2.dot(P.Vp,s.Iin,C.ndr,4.5,'A');p2.dot(s.vf,s.Iin,C.d,4.5,'B');p2.dot(s.vs[k],Itot(DEF,s.vs[k]),'#fff',4.5);
  },
  read(p,S){if(!S.s)return [];const s=S.s,P=MATS.Ge.P,dV=s.vf-P.Vp;return [['speed index I_P/C_j',si(P.Ip*1e-3/(p.Cj*1e-12),'V/s')],['ΔV',(dV*1000).toFixed(0)+' mV'],['estimate C_jΔV/I_P',si(p.Cj*1e-12*dV/(P.Ip*1e-3),'s')],['simulated 10–90 %',s.t1!=null&&s.t2!=null?si((s.t2-s.t1)*1e-12,'s'):'—']]}
};

/* ---------- speed vs depletion width ---------- */
VIEWS.speed={kind:'2d',title:'Narrow W_d: C_j grows, but I_P grows faster',sub:'C_j ∝ 1/W_d  ·  I_P ∝ e^{−αW_d}  ·  speed index = I_P/C_j',drag:'W',
  params:[R('W','Depletion width $W_d$',3,30,0.1,8,'nm',{f:v=>v.toFixed(1)+' nm'}),R('a','Decay constant α',0.1,0.6,0.01,0.35,'nm⁻¹',{f:v=>v.toFixed(2)+' nm⁻¹'})],
  draw(g,W,H,p,t,S){
    const Ip=w=>10*Math.exp(-p.a*(w-10)),Cj=w=>10/w,SI=w=>Ip(w)*1e-3/(Cj(w)*1e-12)/1e9;
    const [b]=boxes(W,H,[1],{t:48});const pl=new P2(g,b,{x:[3,30],y:[1e-3,1e4],logy:true,xl:'Depletion width W_d (nm)',yl:'value (log scale)'});S.main=pl;pl.frame();
    pl.curve(Ip,{c:C.t,w:2.6});pl.curve(Cj,{c:C.x,w:2.6});pl.curve(SI,{c:C.d,w:2.8});
    pl.vline(p.W,'rgba(255,255,255,.3)',[3,3]);pl.dot(p.W,Ip(p.W),C.t,5);pl.dot(p.W,Cj(p.W),C.x,5);pl.dot(p.W,SI(p.W),C.d,5.5);
    legend(g,b.x,24,[[C.t,'I_P (mA)'],[C.x,'C_j (pF)'],[C.d,'I_P/C_j (V/ns)']]);
  },
  read(p){const Ip=10*Math.exp(-p.a*(p.W-10)),Cj=10/p.W;return [['I_P',mA(Ip)],['C_j',si(Cj*1e-12,'F')],['speed index',si(Ip*1e-3/(Cj*1e-12),'V/s'),'good'],['halve W_d → speed ×',num(Math.exp(p.a*p.W/2)/2,3),'good']]}
};

/* ---------- bistable load line ---------- */
VIEWS.load={kind:'2d',title:'Load line and bistable states',sub:'Three intersections → two stable states (0 and 1) and one unstable middle point',
  params:[R('Vs','Supply $V_S$',0,1.2,0.005,0.5,'V',{f:v=>v.toFixed(3)+' V'}),R('RL','Load $R_L$',5,200,0.5,40,'Ω',{f:v=>v.toFixed(1)+' Ω'})],
  draw(g,W,H,p,t,S){
    const m=DEF,P=MATS.Ge.P;const [b]=boxes(W,H,[1],{t:48});const pl=new P2(g,b,{x:[0,0.6],y:[0,P.Ip*1.4],xl:'Diode voltage V (V)',yl:'I (mA)'});pl.frame();
    pl.curve(v=>Itot(m,v),{c:C.tot,w:2.6});pl.curve(v=>(p.Vs-v)*1000/p.RL,{c:C.x,w:2,dash:[6,4]});
    const xs=S.x=[];let pr=null;for(let k=0;k<=1200;k++){const v=k*0.6/1200,r=(p.Vs-v)*1000/p.RL-Itot(m,v);if(pr!==null&&Math.sign(r)!==Math.sign(pr))xs.push(v);pr=r}
    const st=xs.filter(v=>dI(m,v)>0);xs.forEach(v=>{const s=dI(m,v)>0;pl.dot(v,Itot(m,v),s?C.d:C.ndr,6,s?(xs.length===3?(v<P.Vp+0.02?'state "0"':'state "1"'):'stable'):'unstable',8,-14)});
    legend(g,b.x,24,[[C.tot,'diode I-V'],[C.x,'load line I = (V_S − V)/R_L',[6,4]]]);
  },
  read(p,S){const xs=S.x||[];return [['intersections',String(xs.length),xs.length===3?'good':''],['states',xs.map(v=>v.toFixed(3)+' V').join(' · ')||'—'],['use',xs.length===3?'bistable memory cell':xs.length===1?'single operating point':'—',xs.length===3?'good':'']]}
};

/* ---------- reflection amplifier ---------- */
VIEWS.amp={kind:'2d',title:'Negative-resistance reflection amplifier',sub:'Γ = (−R − Z_0)/(−R + Z_0): |Γ| > 1 means reflected power exceeds incident power',drag:'R',
  params:[R('R','|−R| of the diode',5,150,0.5,60,'Ω',{f:v=>v.toFixed(1)+' Ω'}),R('Z0','Line impedance $Z_0$',10,100,1,50,'Ω',{f:v=>v.toFixed(0)+' Ω'})],
  draw(g,W,H,p,t,S){
    const G=R=>20*Math.log10(Math.abs((R+p.Z0)/(R-p.Z0)));const [b]=boxes(W,H,[1],{t:48});const pl=new P2(g,b,{x:[5,150],y:[0,40],xl:'|−R| (Ω)',yl:'reflection gain (dB)'});S.main=pl;
    pl.vband(5,p.Z0,'rgba(255,92,138,.08)','R < Z_0: unstable',C.ndr);pl.vband(p.Z0,150,'rgba(63,210,155,.06)','R > Z_0: stable gain',C.d);pl.frame();
    pl.curve(G,{c:C.cyan,w:2.8,n:600});pl.vline(p.Z0,C.mute,[3,3],'R = Z_0 → oscillator');pl.dot(p.R,Math.min(40,G(p.R)),'#fff',6,G(p.R).toFixed(1)+' dB');
  },
  read(p){const g0=Math.abs((p.R+p.Z0)/(p.R-p.Z0));return [['|Γ|',g0.toFixed(3)],['gain',(20*Math.log10(g0)).toFixed(2)+' dB'],['regime',p.R>p.Z0?'stable amplifier':'oscillates',p.R>p.Z0?'good':'bad'],['power flow','P_DC → P_AC']]}
};

/* ---------- excess-current routes (flat band diagram) ---------- */
VIEWS.route={kind:'2d',anim:true,title:'Excess-current routes through gap states',sub:'Dashed cyan = tunnelling · wavy red = energy loss (phonon) · violet = impurity-band hop',
  params:[SEL('r','Route',[['1','1 · C ↓ B ⇝ D'],['2','2 · C ⇝ A ↓ D'],['3','3 · C ⇝ A → B ⇝ D'],['4','4 · staircase']],'1'),R('V','Bias $V$',0.2,0.5,0.001,0.32,'V',{f:v=>v.toFixed(3)+' V'}),K('lab','Show band labels',true)],
  draw(g,W,H,p,t,S){
    const e=bandE(p.V);const [b]=boxes(W,H,[1],{t:48,b:70});const pl=new P2(g,b,{x:[-4,4],y:[-0.75,0.85],xl:'Position (p⁺ side ← junction → n⁺ side)',yl:'Electron energy E (eV)'});pl.frame();
    const xs=lin(-4,4,240),bx=xs.map(x=>bandX(x,e));
    pl.pts([...xs.map((x,i)=>[x,bx[i].Ec]),[4,0.85],[-4,0.85]],{c:null,fc:'rgba(91,156,255,.08)',close:true});
    pl.pts([...xs.map((x,i)=>[x,bx[i].Ev]),[4,-0.75],[-4,-0.75]],{c:null,fc:'rgba(246,178,60,.08)',close:true});
    pl.pts(xs.map((x,i)=>[x,bx[i].Ec]),{c:C.t,w:2.4});pl.pts(xs.map((x,i)=>[x,bx[i].Ev]),{c:C.x,w:2.4});
    pl.pts([[1,e.EcR],[4,e.EcR],[4,e.EFR],[1,e.EFR]],{c:null,fc:'rgba(91,156,255,.45)',close:true});
    pl.pts([[-4,e.EFL],[-1,e.EFL],[-1,e.EvL],[-4,e.EvL]],{c:null,fc:'rgba(246,178,60,.35)',close:true});
    pl.pts([[-4,e.EFL],[0,e.EFL]],{c:C.x,w:1.2,dash:[5,4]});pl.pts([[0,e.EFR],[4,e.EFR]],{c:C.cyan,w:1.2,dash:[5,4]});
    if(p.lab){pl.text(-3.9,e.EcL+0.04,'E_C',C.t);pl.text(-3.9,e.EvL+0.04,'E_V',C.x);pl.text(3.9,e.EFR+0.04,'E_{Fn}',C.cyan,'right');pl.text(-3.9,e.EFL-0.05,'E_{Fp}',C.x);pl.text(-3.2,-0.65,'p⁺',C.x);pl.text(3.2,-0.65,'n⁺',C.t);pl.text(3.9,(e.EcR+e.EFR)/2,'filled CB',C.ink,'right');pl.text(-3.9,(e.EFL+e.EvL)/2+0.01,'empty VB',C.ink)}
    const R_=routePts(p.V,+p.r);
    for(let i=1;i<R_.length;i++){const a=R_[i-1],c=R_[i];
      if(c.k==='tun')pl.pts([[a.x,a.E],[c.x,c.E]],{c:C.cyan,w:2.4,dash:[7,5]});
      else if(c.k==='hop')pl.pts([[a.x,a.E],[c.x,c.E]],{c:C.vio,w:2.4});
      else{const n=40,pts=[];for(let k=0;k<=n;k++){const f=k/n;pts.push([a.x+0.06*Math.sin(f*Math.PI*8),lerp(a.E,c.E,f)])}pl.pts(pts,{c:C.red,w:2})}
    }
    R_.forEach((q,i)=>{if(q.n){const gap=q.n==='A'||q.n==='B'||/^E/.test(q.n);g.save();const X=pl.X(q.x),Y=pl.Y(q.E);g.fillStyle=gap?C.vio:q.n==='C'?C.t:C.x;g.beginPath();if(gap){g.moveTo(X,Y-7);g.lineTo(X+7,Y);g.lineTo(X,Y+7);g.lineTo(X-7,Y)}else g.arc(X,Y,6,0,7);g.closePath();g.fill();g.restore();rich(g,q.n.replace(/E(\d)/,'E_$1'),X+9,Y-11,{size:13,color:'#fff',weight:600})}});
    if(MOTION){const segL=R_.length-1,ph=(t*0.45)%(segL+0.6),k=Math.min(segL-1,Math.floor(ph)),f=clamp(ph-k,0,1),a=R_[k],c=R_[k+1];pl.dot(lerp(a.x,c.x,f),lerp(a.E,c.E,f),'#ffffff',6.5)}
    rich(g,'Route '+p.r+':  '+ROUTE_TXT[p.r],b.x,H-22,{size:14,color:C.tot,font:MONO});
  },
  read(p){const R_=routePts(p.V,+p.r);const tun=R_.filter(q=>q.k==='tun').length,drop=R_.filter(q=>q.k==='drop').length,hop=R_.filter(q=>q.k==='hop').length;const e=bandE(p.V);
    return [['path',ROUTE_TXT[p.r]],['tunnelling steps',String(tun)],['energy-loss steps',String(drop+hop)],['energy lost',(((e.EcR+e.EFR)/2-(e.EFL+e.EvL)/2)*1000).toFixed(0)+' meV'],['direct overlap',e.EcR<e.EvL?'still present':'none — gap states needed',e.EcR<e.EvL?'':'warn']]}
};

/* ---------- worked example calculator (HTML) ---------- */
VIEWS.calc={kind:'html',title:'Worked example — step by step',sub:'Edit any input below; every result recomputes',
  params:[R('Vp','$V_P$',0.02,0.3,0.005,0.1,'V',{f:v=>v.toFixed(3)+' V'}),R('Ip','$I_P$',1,50,0.5,20,'mA',{f:v=>v.toFixed(1)+' mA'}),R('Rs','$R_s$',0.1,5,0.1,1,'Ω',{f:v=>v.toFixed(1)+' Ω'}),R('Cj','$C_j$',0.1,5,0.05,1,'pF',{f:v=>v.toFixed(2)+' pF'}),R('Ls','$L_s$',0.5,50,0.5,5,'pH',{f:v=>v.toFixed(1)+' pH'}),R('dV','Swing $ΔV$',0.02,0.5,0.01,0.1,'V',{f:v=>v.toFixed(2)+' V'}),SEL('st','Highlight step',[['0','all'],['1','24.1 R_{min}'],['2','24.2 f_{r0}'],['3','24.3 f_{x0}'],['4','24.4 speed index']],'0')],
  render(el,p){
    const Rm=2*p.Vp/(p.Ip*1e-3),C_=p.Cj*1e-12,L_=p.Ls*1e-12,a=fr(Rm,p.Rs,C_),b=fx(Rm,C_,L_),si_=p.Ip*1e-3/C_,tt=C_*p.dV/(p.Ip*1e-3);
    const on=k=>p.st==='0'||p.st===String(k)?' on':'';const T1=1/(L_*C_),T2=1/(Rm*C_)**2;
    const ax=v=>40+(Math.log10(v)-9)/(12-9)*640;
    const ladder=`<svg viewBox="0 0 720 120" role="img" aria-label="frequency ladder"><line x1="40" y1="60" x2="680" y2="60" stroke="#3a4a63" stroke-width="2"/>${[1e9,1e10,1e11,1e12].map(v=>`<line x1="${ax(v)}" y1="54" x2="${ax(v)}" y2="66" stroke="#5b6b85"/><text x="${ax(v)}" y="84" fill="#8191aa" font-size="12" text-anchor="middle" font-family="IBM Plex Mono">${si(v,'Hz',1)}</text>`).join('')}
      ${isFinite(a)?`<circle cx="${ax(a)}" cy="60" r="7" fill="#3fd29b"/><text x="${ax(a)}" y="38" fill="#3fd29b" font-size="13" text-anchor="middle" font-family="IBM Plex Mono">f_{r0} ${si(a,'Hz')}</text>`:''}
      ${isFinite(b)?`<circle cx="${ax(b)}" cy="60" r="7" fill="#a98bff"/><text x="${ax(b)}" y="108" fill="#a98bff" font-size="13" text-anchor="middle" font-family="IBM Plex Mono">f_{x0} ${si(b,'Hz')}</text>`:''}</svg>`;
    el.innerHTML=`<div class="calc">
      <div class="step">${M(`V_P = ${p.Vp} \\t{V},  I_P = ${p.Ip} \\t{mA},  R_s = ${p.Rs} Ω,  C_j = ${p.Cj} \\t{pF},  L_s = ${p.Ls} \\t{pH}`)}</div>
      <div class="step${on(1)}"><h4>24.1  Minimum negative resistance</h4>${M(`R_{min} ≈ \\f{2V_P}{I_P} = \\f{2(${p.Vp})}{${p.Ip}×10^{-3}}`)} = <span class="res">${Rm.toFixed(2)} Ω</span> &nbsp;⇒&nbsp; ${M('r_d')} = <span class="res">−${Rm.toFixed(2)} Ω</span></div>
      <div class="step${on(2)}"><h4>24.2  Maximum resistive cutoff</h4>${M(`f_{r0} = \\f{1}{2πR_{min}C_j}\\s{\\f{R_{min}}{R_s} − 1} = \\f{1}{2π(${Rm.toFixed(2)})(${p.Cj}×10^{-12})}\\s{${(Rm/p.Rs).toFixed(2)} − 1}`)} = <span class="res">${isFinite(a)?si(a,'Hz'):'no NDR (R_{min} ≤ R_s)'}</span></div>
      <div class="step${on(3)}"><h4>24.3  Minimum reactive cutoff</h4>${M(`\\f{1}{L_sC_j} = ${num(T1,3)},  \\f{1}{(R_{min}C_j)^2} = ${num(T2,3)}`)}<br>${M('f_{x0} = \\f{1}{2π}\\s{\\f{1}{L_sC_j} − \\f{1}{(R_{min}C_j)^2}}')} = <span class="res">${isFinite(b)?si(b,'Hz'):'not real (L_s ≥ R²C_j)'}</span><br>Comparison: ${isFinite(a)&&isFinite(b)?(b>a?'<span class="res">f_{x0} &gt; f_{r0} — preferred, no internal self-oscillation</span>':'<span style="color:#ff6f93">f_{r0} &gt; f_{x0} — internal oscillation possible</span>'):'—'}</div>
      <div class="step${on(4)}"><h4>24.4  Speed index and switching time</h4>${M(`\\f{I_P}{C_j} = \\f{${p.Ip}×10^{-3}}{${p.Cj}×10^{-12}}`)} = <span class="res">${si(si_,'V/s')} = ${(si_/1e9).toFixed(2)} V/ns</span><br>${M(`t ≈ \\f{C_jΔV}{I_P} = \\f{(${p.Cj}×10^{-12})(${p.dV})}{${p.Ip}×10^{-3}}`)} = <span class="res">${si(tt,'s')}</span></div>
      <div class="step"><h4>Frequency ladder</h4>${ladder}</div></div>`;
  },
  read(p){const Rm=2*p.Vp/(p.Ip*1e-3),a=fr(Rm,p.Rs,p.Cj*1e-12),b=fx(Rm,p.Cj*1e-12,p.Ls*1e-12);return [['R_{min}',Rm.toFixed(2)+' Ω'],['f_{r0}',si(a,'Hz')],['f_{x0}',si(b,'Hz')],['ordering',b>a?'stable':'self-oscillation',b>a?'good':'bad'],['speed',(p.Ip/p.Cj).toFixed(1)+' V/ns']]}
};
