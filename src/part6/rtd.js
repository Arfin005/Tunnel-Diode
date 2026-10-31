/* ================= Part 6: resonant-tunnelling diode — physics ================= */
const HB2M=0.0381; // ħ²/(2m₀) in eV·nm²
const RTD0={W:5,d1:2.5,d2:2.5,U:0.5,m:0.067,EF:0.05,T:300,gs:1,jb:150};
function rp(p){const P=Object.assign({},RTD0);for(const k in RTD0)if(p&&p[k]!=null)P[k]=p[k];P.L=P.d1+P.W+P.d2;P.f=(P.d1+P.W/2)/P.L;P.lv=wellLevels(P.U,P.W,P.m);return P}
/* finite square well (depth U, width W, mass m): bound levels from the even/odd transcendental equations */
const _wl={};
function wellLevels(U,W,m){
  const key=U+','+W+','+m;if(_wl[key])return _wl[key];
  const a=W/2,z0=a*Math.sqrt(m*U/HB2M),out=[];
  for(let n=0;n<12;n++){
    const lo=n*Math.PI/2+1e-9;if(lo>=z0)break;const hi=Math.min((n+1)*Math.PI/2-1e-9,z0);
    const f=n%2===0?z=>z*Math.tan(z)-Math.sqrt(Math.max(0,z0*z0-z*z)):z=>-z/Math.tan(z)-Math.sqrt(Math.max(0,z0*z0-z*z));
    let x0=lo,x1=hi;for(let i=0;i<70;i++){const xm=(x0+x1)/2;if(f(xm)>0)x1=xm;else x0=xm}
    const z=(x0+x1)/2;out.push(z*z*HB2M/(m*a*a));
  }
  return _wl[key]=out;
}
function Einf(n,W,m){return n*n*Math.PI*Math.PI*HB2M/(m*W*W)}
/* exact single rectangular barrier: Ek kinetic energy outside, Ub barrier height above that band edge */
function Trect(Ek,Ub,d,m){
  if(Ek<=0)return 0;
  if(Math.abs(Ub-Ek)<1e-9)Ub+=1e-7;
  if(Ub>Ek){const k=Math.sqrt(m*(Ub-Ek)/HB2M),s=Math.sinh(k*d);return 1/(1+Ub*Ub*s*s/(4*Ek*(Ub-Ek)))}
  const k=Math.sqrt(m*(Ek-Ub)/HB2M),s=Math.sin(k*d);return 1/(1+Ub*Ub*s*s/(4*Ek*(Ek-Ub)));
}
/* conduction-band profile under bias (linear drop over barrier-well-barrier) */
function Ux(P,V,x){const L=P.L;if(x<0)return 0;if(x<P.d1)return P.U-V*x/L;if(x<P.d1+P.W)return -V*x/L;if(x<L)return P.U-V*x/L;return -V}
function regions(P,V){
  const out=[{U:0,L:0,x:0}],ns=V===0?1:6;let x=0;
  for(const [len,top] of [[P.d1,P.U],[P.W,0],[P.d2,P.U]]){const dl=len/ns;for(let i=0;i<ns;i++){const xm=x+(i+.5)*dl;out.push({U:top-V*xm/P.L,L:dl,x:x+i*dl})}x+=len}
  out.push({U:-V,L:0,x:P.L});return out;
}
/* transfer matrix (constant effective mass) */
const C_={mul:(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]],div:(a,b)=>{const q=b[0]*b[0]+b[1]*b[1];return [(a[0]*b[0]+a[1]*b[1])/q,(a[1]*b[0]-a[0]*b[1])/q]},add:(a,b)=>[a[0]+b[0],a[1]+b[1]],sub:(a,b)=>[a[0]-b[0],a[1]-b[1]],exp:z=>{const e=Math.exp(z[0]);return [e*Math.cos(z[1]),e*Math.sin(z[1])]},abs2:a=>a[0]*a[0]+a[1]*a[1]};
function kc(m,E,U){let d=m*(E-U)/HB2M;if(Math.abs(d)<1e-12)d=1e-12;return d>0?[Math.sqrt(d),0]:[0,Math.sqrt(-d)]}
function tmmMats(P,E,V,R){
  R=R||regions(P,V);const ks=R.map(r=>kc(P.m,E,r.U));const I=[];
  let M=[[[1,0],[0,0]],[[0,0],[1,0]]];
  for(let j=0;j<R.length-1;j++){
    const k=ks[j],k1=ks[j+1],r=C_.div(k,k1),Lj=R[j].L;
    const ph=C_.exp(C_.mul([0,1],[k[0]*Lj,k[1]*Lj])),pm=C_.exp(C_.mul([0,-1],[k[0]*Lj,k[1]*Lj]));
    const p1=C_.add([1,0],r),m1=C_.sub([1,0],r);
    const Ij=[[C_.mul([.5,0],C_.mul(p1,ph)),C_.mul([.5,0],C_.mul(m1,pm))],[C_.mul([.5,0],C_.mul(m1,ph)),C_.mul([.5,0],C_.mul(p1,pm))]];
    I.push(Ij);
    M=[[C_.add(C_.mul(Ij[0][0],M[0][0]),C_.mul(Ij[0][1],M[1][0])),C_.add(C_.mul(Ij[0][0],M[0][1]),C_.mul(Ij[0][1],M[1][1]))],
       [C_.add(C_.mul(Ij[1][0],M[0][0]),C_.mul(Ij[1][1],M[1][0])),C_.add(C_.mul(Ij[1][0],M[0][1]),C_.mul(Ij[1][1],M[1][1]))]];
  }
  return {M,I,ks,R};
}
function tmmT(P,E,V,R){if(E<=0)return 0;const {M,ks}=tmmMats(P,E,V,R);const k0=ks[0][0],kN=ks[ks.length-1][0];if(kN<=0)return 0;return clamp((k0/kN)/C_.abs2(M[1][1]),0,1)}
/* wavefunction ψ(x) for a wave incident from the emitter */
function tmmPsi(P,E,V){
  const R=regions(P,V),{M,I,ks}=tmmMats(P,E,V,R);let AB=[[1,0],C_.div(C_.mul([-1,0],M[1][0]),M[1][1])];const co=[AB];
  for(const Ij of I){AB=[C_.add(C_.mul(Ij[0][0],AB[0]),C_.mul(Ij[0][1],AB[1])),C_.add(C_.mul(Ij[1][0],AB[0]),C_.mul(Ij[1][1],AB[1]))];co.push(AB)}
  return x=>{let j=0;for(let i=1;i<R.length;i++)if(x>=R[i].x)j=i;const k=ks[j],dx=x-(j===0?0:R[j].x),A=co[j][0],B=co[j][1];
    return C_.add(C_.mul(A,C_.exp(C_.mul([0,1],[k[0]*dx,k[1]*dx]))),C_.mul(B,C_.exp(C_.mul([0,-1],[k[0]*dx,k[1]*dx]))))};
}
/* resonance peaks of the exact T(E): position, height, FWHM */
const _pk={};
function tmmPeaks(P,V=0,Emax){
  Emax=Emax||Math.max(P.U*1.15,0.05);const key=[P.W,P.d1,P.d2,P.U,P.m,V,Emax].join();if(_pk[key])return _pk[key];
  const R=regions(P,V),n=3000,Es=lin(1e-5,Emax,n),Ts=Es.map(E=>tmmT(P,E,V,R)),pk=[];
  for(let i=1;i<n-1;i++)if(Ts[i]>Ts[i-1]&&Ts[i]>=Ts[i+1]&&Ts[i]>1e-6){
    let a=Es[i-1],b=Es[i+1];for(let it=0;it<50;it++){const c=b-(b-a)/1.618,d=a+(b-a)/1.618;if(tmmT(P,c,V,R)>tmmT(P,d,V,R))b=d;else a=c}
    const E0=(a+b)/2,T0=tmmT(P,E0,V,R),half=T0/2;
    const side=s=>{let lo=E0,hi=E0+s*1e-6;for(let k=0;k<60&&tmmT(P,hi,V,R)>half;k++)hi=E0+(hi-E0)*2;for(let it=0;it<50;it++){const md=(lo+hi)/2;if(tmmT(P,md,V,R)>half)lo=md;else hi=md}return Math.abs((lo+hi)/2-E0)};
    pk.push({E:E0,T:T0,w:side(1)+side(-1)});
  }
  return _pk[key]=pk;
}
/* resonance model used for the current: guide's Eq. 64 peak, ΔE = ħ/τ width, level shift f·qV (Eq. 71) */
function resPar(P,n,V){
  // barrier transmissions taken at the level's own kinetic energy (resonance strength fixed, position shifted by f·qV)
  const E0=P.lv[n],Ee=E0-P.f*V;
  const TE=Trect(E0,P.U,P.d1,P.m),TC=Trect(E0,P.U,P.d2,P.m);
  const v=Math.sqrt(2*E0*Q/(P.m*M0)),G=HBAR*v/(2*P.W*1e-9)*(TE+TC)/Q;
  return {E:Ee,TE,TC,G,Tp:4*TE*TC/Math.pow(TE+TC,2),tau:HBAR/(G*Q)};
}
function Tbw(P,E,V,rs){rs=rs||P.lv.map((_,n)=>resPar(P,n,V));const Gs=P.gs*1e-3;let s=0;for(const r of rs){const Gt=r.G+Gs;s+=r.Tp*(r.G/2)*(Gt/2)/((E-r.E)**2+(Gt/2)**2)}return Math.min(1,s)}
const lse=x=>x>35?x:Math.log1p(Math.exp(x));
function Nsup(P,E){const kT=KB*P.T;return kT*lse((P.EF-E)/kT)} // ∝ Eq. 66 without the m*/πħ² prefactor (eV)
function Ssup(P,E,V){const kT=KB*P.T;return kT*(lse((P.EF-E)/kT)-lse((P.EF-E-V)/kT))}
function PREF(m){return Q*M0*m/(2*Math.PI*Math.PI*HBAR**3)*Q*Q/1e4} // A/cm² per eV²
function Jres(P,V){
  const kT=KB*P.T,Emax=P.EF+16*kT+0.02,rs=P.lv.map((_,n)=>resPar(P,n,V)),Gs=P.gs*1e-3;
  const E=lin(1e-5,Emax,260);for(const r of rs){const Gt=r.G+Gs;if(r.E+10*Gt>0&&r.E-10*Gt<Emax)for(let i=0;i<=160;i++){const e=r.E+Gt*10*(i/80-1);if(e>0&&e<Emax)E.push(e)}}
  E.sort((a,b)=>a-b);let s=0,prev=null;
  for(const e of E){const y=Tbw(P,e,V,rs)*Ssup(P,e,V);if(prev)s+=(e-prev[0])*(y+prev[1])/2;prev=[e,y]}
  return PREF(P.m)*s;
}
function Jbg(P,V){return P.jb*(P.T/300)**2*Math.exp(-(0.25/KB)*(1/P.T-1/300))*(Math.exp(V/0.25)-1)}
function Jtot(P,V){return Jres(P,V)+Jbg(P,V)}
function vmax(P){const last=P.lv.length?P.lv[Math.min(1,P.lv.length-1)]:0.2;return clamp(last/P.f*1.5,0.6,1.8)}
const _jv={};
function jvCurve(P){
  const key=[P.W,P.d1,P.d2,P.U,P.m,P.EF,P.T,P.gs,P.jb].join();if(_jv[key])return _jv[key];
  const Vm=vmax(P),Vs=lin(0,Vm,361),J=Vs.map(v=>Jtot(P,v));
  const ext=[];for(let i=1;i<J.length-1;i++){if(J[i]>J[i-1]&&J[i]>=J[i+1])ext.push({t:'max',i});else if(J[i]<J[i-1]&&J[i]<=J[i+1])ext.push({t:'min',i})}
  const pk=ext.filter(e=>e.t==='max'),vl=ext.filter(e=>e.t==='min');
  const pts={a:{V:Vs[3],J:J[3]}};
  if(pk[0])pts.b={V:Vs[pk[0].i],J:J[pk[0].i]};const v1=vl.find(e=>pk[0]&&e.i>pk[0].i);if(v1)pts.c={V:Vs[v1.i],J:J[v1.i]};
  const p2=pk.find(e=>v1&&e.i>v1.i);if(p2){pts.d={V:Vs[p2.i],J:J[p2.i]};const v2=vl.find(e=>e.i>p2.i);const ie=v2?Math.round((p2.i+v2.i)/2):Math.min(J.length-1,p2.i+8);pts.e={V:Vs[ie],J:J[ie]}}
  return _jv[key]={Vs,J,pts,Vm,pvr:pts.b&&pts.c?pts.b.J/pts.c.J:NaN};
}
const jAt=(c,V)=>{const n=c.Vs.length-1,u=clamp(V/c.Vm,0,1)*n,i=Math.min(n-1,Math.floor(u)),f=u-i;return c.J[i]*(1-f)+c.J[i+1]*f};
function lvlStatus(P,n,V){const E=P.lv[n]-P.f*V;return E>P.EF?['above E_F — few electrons','warn']:E>=0?['inside E_C … E_F window — resonant','good']:['below E_C — injection forbidden','bad']}

/* ================= shared parameter definitions ================= */
const SP={
  W:R('W','Well width $W$',2,10,0.05,5,'nm',{f:v=>v.toFixed(2)+' nm'}),
  d1:R('d1','Emitter barrier $d_{B1}$',1,5,0.05,2.5,'nm',{f:v=>v.toFixed(2)+' nm'}),
  d2:R('d2','Collector barrier $d_{B2}$',1,5,0.05,2.5,'nm',{f:v=>v.toFixed(2)+' nm'}),
  U:R('U','Barrier height $ΔE_C$',0.15,1.0,0.01,0.5,'eV',{f:v=>v.toFixed(2)+' eV'}),
  m:R('m','Effective mass $m*$',0.03,0.12,0.001,0.067,'m₀',{f:v=>v.toFixed(3)+' m₀'}),
  EF:R('EF','Emitter $E_F − E_C$',0.01,0.15,0.001,0.05,'eV',{f:v=>(v*1000).toFixed(0)+' meV'}),
  T:R('T','Temperature $T$',4,400,1,300,'K',{f:v=>v+' K'}),
  gs:R('gs','Scattering broadening $Γ_s$',0.1,15,0.1,1,'meV',{f:v=>v.toFixed(1)+' meV'}),
  jb:LR('jb','Background (thermionic + leakage)',1,1e4,150,'A/cm²',{f:v=>num(v,2)+' A/cm²'}),
  V:R('V','Bias $V$',0,1.8,0.001,0.1,'V',{f:v=>v.toFixed(3)+' V'})
};
const RC={E:'#5b9cff',B:'#f6b23c',Wl:'#3fd29b',lvl:['#3fd29b','#38d6e8','#a98bff','#ff9ab4']};
const Jfmt=j=>Math.abs(j)>=1e3?num(j,3)+' A/cm²':j.toFixed(1)+' A/cm²';

/* ---------- 2D band-profile helper ---------- */
function drawBand(g,pl,P,V,o={}){
  const xs=lin(-8,P.L+8,600);
  pl.pts([[-8,0],[0,0],[0,P.EF],[-8,P.EF]],{c:null,fc:'rgba(91,156,255,.35)',close:true});
  pl.pts([[P.L,-V],[P.L+8,-V],[P.L+8,P.EF-V],[P.L,P.EF-V]],{c:null,fc:'rgba(91,156,255,.22)',close:true});
  pl.pts(xs.map(x=>[x,Ux(P,V,x)]),{c:C.tot,w:2.4});
  pl.pts([[-8,P.EF],[0,P.EF]],{c:C.cyan,w:1.3,dash:[5,4]});pl.pts([[P.L,P.EF-V],[P.L+8,P.EF-V]],{c:C.cyan,w:1.3,dash:[5,4]});
  pl.text(-7.6,P.EF+0.02,'E_F',C.cyan);pl.text(-7.6,-0.03,'E_C',C.ink);
  P.lv.forEach((E0,n)=>{const E=E0-P.f*V,x0=P.d1,x1=P.d1+P.W;const st=E>P.EF?'#8191aa':E>=0?RC.lvl[0]:C.ndr;
    pl.pts([[x0,E0-V*x0/P.L],[x1,E0-V*x1/P.L]],{c:st,w:2.6});pl.text(x1+0.2,E0-V*x1/P.L,'E_'+(n+1),st);
    if(E>=0&&E<=P.EF&&o.arrow!==false){const g2=pl.g;arrow(g2,pl.X(-3),pl.Y(E),pl.X(P.L+3),pl.Y(E),'rgba(63,210,155,.85)',2,8)}});
  if(o.lab!==false){pl.text(-4,-0.12,'emitter n⁺',C.mute,'center');pl.text(P.L+4,-V-0.12,'collector n⁺',C.mute,'center')}
}

/* ================= 2D views ================= */
VIEWS.rT={kind:'2d',title:'Transmission T(E) of the double barrier',sub:'Exact transfer-matrix result (solid) · single barrier (dashed) · off-resonance product T_ET_C (dotted)',
  params:[SP.W,SP.d1,SP.d2,SP.U,SP.m,R('V','Bias $V$',0,0.6,0.005,0,'V',{f:v=>v.toFixed(3)+' V'}),K('logy','Logarithmic T axis',true),K('inf','Infinite-well levels (Eq. 62)',true)],
  draw(g,W,H,p,t,S){
    const P=rp(p),Em=P.U*1.15,[b]=boxes(W,H,[1],{t:48,l:80});const pl=new P2(g,b,{x:[0,Em],y:p.logy?[1e-8,1.5]:[0,1.1],logy:p.logy,xl:'Electron energy E − E_C (eV)',yl:'T(E)'});pl.frame();
    const R_=regions(P,p.V);
    pl.curve(E=>Trect(E,P.U,P.d1,P.m),{c:C.x,w:1.5,dash:[6,4],n:300});
    pl.curve(E=>Trect(E,P.U,P.d1,P.m)*Trect(E,P.U,P.d2,P.m),{c:C.vio,w:1.4,dash:[2,3],n:300});
    pl.curve(E=>tmmT(P,E,p.V,R_),{c:C.cyan,w:2.6,n:1400});
    if(p.inf)for(let n=1;n<=4;n++){const E=Einf(n,P.W,P.m);if(E<Em)pl.vline(E,'rgba(255,255,255,.35)',[2,4],'∞-well E_'+n)}
    const pk=tmmPeaks(P,p.V,Em);pk.forEach((q,i)=>pl.dot(q.E,q.T,RC.lvl[i%4],5,'E_'+(i+1)+' = '+(q.E*1000).toFixed(0)+' meV',8,-12));S.pk=pk;
    pl.vline(P.U,C.mute,[5,4],'barrier top');
    legend(g,b.x,24,[[C.cyan,'double barrier (exact)'],[C.x,'single barrier',[6,4]],[C.vio,'T_E·T_C',[2,3]]]);
  },
  read(p,S){const pk=S.pk||[];const o=pk.slice(0,3).map((q,i)=>['E_'+(i+1)+' · T · ΔE',(q.E*1000).toFixed(1)+' meV · '+num(q.T,2)+' · '+(q.w*1000).toFixed(2)+' meV']);
    if(pk[0])o.push(['τ₁ = ħ/ΔE',si(HBAR/(pk[0].w*Q),'s')]);o.push(['∞-well E₁',(Einf(1,p.W,p.m)*1000).toFixed(0)+' meV']);return o}
};

VIEWS.rLevels={kind:'2d',title:'Quantized levels E_n vs well width',sub:'Dashed: ideal infinite well (Eq. 62) · solid: finite barrier of height ΔE_C',drag:'W',
  params:[SP.W,SP.U,SP.m],
  draw(g,W,H,p,t,S){
    const wide=W>620,bw=wide?W*0.68:W;const [b]=boxes(bw,H,[1],{t:48,l:80});const pl=new P2(g,b,{x:[2,10],y:[0,Math.max(0.6,p.U*1.4)],xl:'Well width W (nm)',yl:'E_n − E_{Cw} (eV)'});S.main=pl;pl.frame();
    pl.hline(p.U,C.x,[5,4],'barrier top ΔE_C');
    for(let n=1;n<=3;n++){pl.curve(w=>Einf(n,w,p.m),{c:RC.lvl[n-1],w:1.5,dash:[6,4]});pl.curve(w=>wellLevels(p.U,w,p.m)[n-1],{c:RC.lvl[n-1],w:2.6,n:160})}
    pl.vline(p.W,'rgba(255,255,255,.3)',[3,3]);
    const fl=wellLevels(p.U,p.W,p.m);for(let n=1;n<=3;n++){pl.dot(p.W,Einf(n,p.W,p.m),RC.lvl[n-1],4);if(fl[n-1]!=null)pl.dot(p.W,fl[n-1],'#fff',5,'E_'+n,8,-10)}
    if(wide){const x0=bw+30,yb=H-60,sc=(H-130)/Math.max(0.6,p.U*1.4);rich(g,'Ladder at W = '+p.W.toFixed(1)+' nm',x0,40,{size:12,font:SANS,weight:600});
      g.strokeStyle=C.x;g.setLineDash([4,3]);g.beginPath();g.moveTo(x0,yb-p.U*sc);g.lineTo(W-20,yb-p.U*sc);g.stroke();g.setLineDash([]);
      for(let n=1;n<=4;n++){const Ei=Einf(n,p.W,p.m),Ef=fl[n-1];if(yb-Ei*sc>50){g.strokeStyle=hexA(RC.lvl[n-1],.5);g.setLineDash([4,3]);g.beginPath();g.moveTo(x0,yb-Ei*sc);g.lineTo(x0+60,yb-Ei*sc);g.stroke();g.setLineDash([])}
        if(Ef!=null){g.strokeStyle=RC.lvl[n-1];g.lineWidth=3;g.beginPath();g.moveTo(x0+70,yb-Ef*sc);g.lineTo(W-24,yb-Ef*sc);g.stroke();g.lineWidth=1;rich(g,'E_'+n,W-24,yb-Ef*sc-9,{size:11,align:'right',color:RC.lvl[n-1]})}}
      rich(g,'∞ well',x0+30,yb+16,{size:10.5,align:'center',color:C.mute});rich(g,'finite',x0+70+(W-94-x0)/2,yb+16,{size:10.5,align:'center',color:C.mute})}
    legend(g,b.x,24,[['#fff','finite well'],['#8191aa','infinite well',[6,4]]]);
  },
  read(p){const fl=wellLevels(p.U,p.W,p.m),E1=Einf(1,p.W,p.m);return [['E₁ infinite',(E1*1000).toFixed(1)+' meV'],['E₁ finite',fl[0]!=null?(fl[0]*1000).toFixed(1)+' meV':'—','good'],['E₂/E₁ infinite','4.00'],['E₂/E₁ finite',fl[1]?(fl[1]/fl[0]).toFixed(2):'only 1 bound level'],['bound levels',String(fl.length)],['W/2 → E₁ ×','4 (ideal)']]}
};

VIEWS.rWellwf={kind:'2d',anim:true,title:'Bound states of the quantum well',sub:'Each ψ_n is drawn at its energy; the tails leaking into the barriers make W_effective > W',
  params:[SP.W,SP.U,SP.m,K('anim','Animate phase (e^{−iE_nt/ħ})',true)],
  draw(g,W,H,p,t){
    const fl=wellLevels(p.U,p.W,p.m),a=p.W/2,xr=a+4;const [b]=boxes(W,H,[1],{t:48,l:80});const pl=new P2(g,b,{x:[-xr,xr],y:[-0.05,p.U*1.35],xl:'Position x (nm)',yl:'Energy (eV)'});pl.frame();
    pl.pts([[-xr,p.U],[-a,p.U],[-a,0],[a,0],[a,p.U],[xr,p.U]],{c:C.tot,w:2.4});
    pl.vband(-xr,-a,'rgba(246,178,60,.07)','AlGaAs',C.x);pl.vband(a,xr,'rgba(246,178,60,.07)','AlGaAs',C.x);
    const amp=p.U*0.13;
    fl.forEach((E,n)=>{const k=Math.sqrt(p.m*E/HB2M),kap=Math.sqrt(p.m*(p.U-E)/HB2M),ev=n%2===0;
      const inn=x=>ev?Math.cos(k*x):Math.sin(k*x),edge=inn(a);const psi=x=>Math.abs(x)<=a?inn(x):(ev?1:Math.sign(x))*edge*Math.exp(-kap*(Math.abs(x)-a));
      const ph=p.anim&&MOTION?Math.cos(t*(2+n*1.5)):1;pl.hline(E,hexA(RC.lvl[n%4],.4),[3,3]);
      pl.curve(x=>E+amp*psi(x)*ph,{c:RC.lvl[n%4],w:2.4,n:400});pl.text(xr-0.2,E+0.01,'E_'+(n+1)+' = '+(E*1000).toFixed(0)+' meV',RC.lvl[n%4],'right');
      if(n===0){const pen=1/kap;pl.vline(a+pen,'rgba(255,255,255,.4)',[2,3]);pl.vline(-a-pen,'rgba(255,255,255,.4)',[2,3],'W_eff ≈ W + 2/κ')}});
  },
  read(p){const fl=wellLevels(p.U,p.W,p.m);const kap=fl[0]!=null?Math.sqrt(p.m*(p.U-fl[0])/HB2M):NaN;return [['bound levels',String(fl.length)],['E₁',fl[0]!=null?(fl[0]*1000).toFixed(1)+' meV':'—'],['penetration 1/κ',(1/kap).toFixed(2)+' nm'],['W_eff ≈ W + 2/κ',(p.W+2/kap).toFixed(2)+' nm'],['E₁ finite < ∞',fl[0]<Einf(1,p.W,p.m)?'yes':'—','good']]}
};

VIEWS.rHetero={kind:'2d',title:'GaAs | AlGaAs heterostructure band alignment',sub:'Conduction-band offset ΔE_C traps electrons; valence-band offset ΔE_V traps holes',
  params:[R('x','Al fraction $x$ in $Al_xGa_{1−x}As$',0.05,0.45,0.01,0.3,'',{f:v=>v.toFixed(2)}),SEL('st','Structure',[['het','single heterojunction'],['qw','quantum well AlGaAs|GaAs|AlGaAs'],['db','double barrier (RTD)']],'het'),R('q','Offset split $ΔE_C/ΔE_g$',0.55,0.7,0.01,0.65,'',{f:v=>v.toFixed(2)})],
  draw(g,W,H,p,t){
    const Eg1=1.424,Eg2=1.424+1.247*p.x,dEc=p.q*(Eg2-Eg1),dEv=(1-p.q)*(Eg2-Eg1);const [b]=boxes(W,H,[1],{t:48,l:80});
    const pl=new P2(g,b,{x:[0,30],y:[-1.9,dEc+0.4],xl:'Position (nm)',yl:'Energy relative to GaAs E_C (eV)'});pl.frame();
    const seg=p.st==='het'?[[0,15,0],[15,30,1]]:p.st==='qw'?[[0,10,1],[10,20,0],[20,30,1]]:[[0,8,0],[8,11,1],[11,19,0],[19,22,1],[22,30,0]];
    const ec=[],ev=[];seg.forEach(([a,c,al])=>{const e1=al?dEc:0,e2=al?-Eg1-dEv:-Eg1;ec.push([a,e1],[c,e1]);ev.push([a,e2],[c,e2]);pl.vband(a,c,al?'rgba(246,178,60,.06)':'rgba(91,156,255,.05)',al?'AlGaAs':'GaAs',al?C.x:C.t)});
    pl.pts(ec,{c:C.t,w:2.6});pl.pts(ev,{c:C.x,w:2.6});
    const xb=seg.find(s=>s[2])[0];const X=pl.X(xb)+8;arrow(g,X,pl.Y(0),X,pl.Y(dEc),C.cyan,1.8,6);rich(g,'ΔE_C = '+(dEc*1000).toFixed(0)+' meV',X+6,pl.Y(dEc/2),{size:11.5,color:C.cyan});
    arrow(g,X,pl.Y(-Eg1),X,pl.Y(-Eg1-dEv),C.ndr,1.8,6);rich(g,'ΔE_V = '+(dEv*1000).toFixed(0)+' meV',X+6,pl.Y(-Eg1-dEv/2),{size:11.5,color:C.ndr});
    pl.text(1,0.05,'E_C',C.t);pl.text(1,-Eg1+0.05,'E_V',C.x);
  },
  read(p){const Eg2=1.424+1.247*p.x,d=Eg2-1.424;return [['E_g GaAs','1.424 eV'],['E_g AlGaAs',Eg2.toFixed(3)+' eV'],['ΔE_C',(p.q*d*1000).toFixed(0)+' meV','good'],['ΔE_V',((1-p.q)*d*1000).toFixed(0)+' meV']]}
};

VIEWS.rBall={kind:'2d',anim:true,title:'Classical ball vs quantum electron at a barrier',sub:'Same energy E < U₀: the ball always returns; the wave leaks a fraction T through',
  params:[R('E','Energy ratio $E/U_0$',0.1,0.95,0.01,0.6,'',{f:v=>v.toFixed(2)}),R('d','Barrier thickness $d$',0.3,4,0.05,1,'nm',{f:v=>v.toFixed(2)+' nm'}),R('m','Effective mass $m*$',0.03,1,0.01,0.067,'m₀',{f:v=>v.toFixed(3)+' m₀'})],
  draw(g,W,H,p,t){
    const U0=0.3,E=p.E*U0,T=Trect(E,U0,p.d,p.m);const bs=boxes(W,H,[1,1],{t:44,gap:44,l:30});
    [['Classical: ball on a hill',0],['Quantum: wavefunction at a barrier',1]].forEach(([ttl,k])=>{const B=bs[k];rich(g,ttl,B.x,B.y-12,{size:12.5,font:SANS,weight:600});
      const base=B.y+B.h-14,top=B.y+24,hx=B.x+B.w*0.5,hw=Math.max(18,p.d*B.w*0.06),sc=(base-top)/U0;
      g.strokeStyle=C.tot;g.lineWidth=2;g.beginPath();g.moveTo(B.x,base);g.lineTo(hx-hw/2,base);g.lineTo(hx-hw/2,base-U0*sc);g.lineTo(hx+hw/2,base-U0*sc);g.lineTo(hx+hw/2,base);g.lineTo(B.x+B.w,base);g.stroke();
      g.fillStyle='rgba(246,178,60,.15)';g.fillRect(hx-hw/2,base-U0*sc,hw,U0*sc);
      g.strokeStyle='rgba(56,214,232,.6)';g.setLineDash([4,4]);g.beginPath();g.moveTo(B.x,base-E*sc);g.lineTo(B.x+B.w,base-E*sc);g.stroke();g.setLineDash([]);rich(g,'E',B.x+4,base-E*sc-9,{size:11,color:C.cyan});
      if(k===0){const u=MOTION?(t*0.35)%1:0.3;const reach=hx-hw/2-60*(1-p.E)-12;const x=u<0.5?lerp(B.x+20,reach,u*2):lerp(reach,B.x+20,(u-0.5)*2);g.fillStyle=C.x;g.beginPath();g.arc(x,base-10,9,0,7);g.fill();rich(g,'T = 0 (always reflected)',B.x+B.w-4,top,{size:11.5,align:'right',color:C.ndr})}
      else{const kk=0.25,ph=MOTION?t*4:0;g.strokeStyle=C.cyan;g.lineWidth=2;g.beginPath();const amp=(base-top)*0.22,y0=base-E*sc;
        for(let x=B.x;x<B.x+B.w;x+=2){let y;if(x<hx-hw/2)y=y0-amp*Math.cos(kk*(x-B.x)-ph)*0.9;else if(x<hx+hw/2){const f=(x-(hx-hw/2))/hw;y=y0-amp*0.9*Math.exp(Math.log(Math.max(Math.sqrt(T),1e-4))*f)*Math.cos(kk*(hx-hw/2-B.x)-ph)}else y=y0-amp*0.9*Math.sqrt(T)*Math.cos(kk*(x-B.x)-ph);x===B.x?g.moveTo(x,y):g.lineTo(x,y)}g.stroke();
        rich(g,'T = '+num(T,3),B.x+B.w-4,top,{size:11.5,align:'right',color:C.d})}});
  },
  read(p){const U0=0.3,E=p.E*U0,T=Trect(E,U0,p.d,p.m),k=Math.sqrt(p.m*(U0-E)/HB2M);return [['κ',k.toFixed(3)+' nm⁻¹'],['T exact',num(T,3),'good'],['e^{−2κd}',num(Math.exp(-2*k*p.d),3)],['classical T','0','bad']]}
};

VIEWS.rSwing={kind:'2d',anim:true,title:'Resonance analogy: pushing a swing',sub:'Response is large only when the push frequency matches the natural frequency f₀',
  params:[R('f','Push frequency $f_{push}/f_0$',0.3,2,0.005,1,'',{f:v=>v.toFixed(3)}),R('Q','Quality factor $Q$',2,60,1,15,'',{f:v=>v.toFixed(0)})],
  draw(g,W,H,p,t){
    const A=r=>1/Math.sqrt((1-r*r)**2+(r/p.Q)**2);const wide=W>600,lw=wide?W*0.58:W;const [b]=boxes(lw,wide?H:H*0.55,[1],{t:48,l:80});
    const pl=new P2(g,b,{x:[0.3,2],y:[0,A(1)*1.15],xl:'f_push / f₀  (↔ E_incoming / E_n)',yl:'amplitude (↔ T(E))'});pl.frame();pl.curve(A,{c:C.d,w:2.6,n:600});pl.dot(p.f,A(p.f),'#fff',6);pl.vline(1,C.mute,[3,3],'resonance');
    const cx0=wide?lw+(W-lw)/2:W/2,cy0=wide?70:H*0.62,Lp=wide?Math.min(170,H*0.5):H*0.28,amp=clamp(A(p.f)/A(1),0.02,1)*0.9;const th=amp*Math.sin(MOTION?t*3:0.7);
    g.strokeStyle=C.mute;g.lineWidth=3;g.beginPath();g.moveTo(cx0-70,cy0);g.lineTo(cx0+70,cy0);g.stroke();
    const x=cx0+Lp*Math.sin(th),y=cy0+Lp*Math.cos(th);g.strokeStyle=C.ink;g.lineWidth=2;g.beginPath();g.moveTo(cx0,cy0);g.lineTo(x,y);g.stroke();g.fillStyle=C.x;g.fillRect(x-18,y-4,36,8);
    rich(g,Math.abs(p.f-1)<0.03?'pushing at f₀ → large motion':'off resonance → small motion',cx0,cy0+Lp+40,{align:'center',size:12,color:Math.abs(p.f-1)<0.03?C.d:C.ndr,font:SANS});
  },
  read(p){const A=r=>1/Math.sqrt((1-r*r)**2+(r/p.Q)**2);return [['amplitude / max',(A(p.f)/A(1)).toFixed(3),Math.abs(p.f-1)<0.03?'good':'warn'],['FWHM ≈ f₀/Q',(1/p.Q).toFixed(3)]]}
};

const HIST=[[1973,'Prediction','Tsu & Esaki predict NDR in a double-barrier structure, after their work on superlattices.'],[1974,'Experimental demonstration','Chang and coworkers demonstrate the structure and its electrical characteristics.'],[1982,'Rapid improvement (early 1980s)','Better crystal growth (MBE, MOCVD) gives sharper interfaces and reproducible devices.'],[1985,'Room-temperature operation','Room-temperature NDR is reported.']];
VIEWS.rTime={kind:'2d',anim:true,title:'Historical development of the RTD',sub:'Four milestones; crystal quality ↑ ⇒ interface quality ↑ ⇒ RTD performance ↑',
  params:[SEL('k','Highlight',[['-1','animate through'],['0','1973'],['1','1974'],['2','early 1980s'],['3','1985']],'-1')],
  draw(g,W,H,p,t){
    const x0=60,x1=W-60,y=H*0.42,X=yr=>x0+(yr-1971)/(1987-1971)*(x1-x0);const cur=+p.k>=0?+p.k:Math.floor((MOTION?t*0.4:0)%4);
    g.strokeStyle=C.axis;g.lineWidth=3;g.beginPath();g.moveTo(x0,y);g.lineTo(x1,y);g.stroke();
    for(let yr=1972;yr<=1986;yr+=2){g.fillStyle=C.mute;g.font=`10.5px ${MONO}`;g.textAlign='center';g.fillText(yr,X(yr),y+22)}
    HIST.forEach(([yr,ttl],i)=>{const on=i===cur;g.fillStyle=on?C.cyan:'#3a4a63';g.beginPath();g.arc(X(yr),y,on?11:7,0,7);g.fill();rich(g,i===2?'early 80s':String(yr),X(yr),y-(i%2?-46:-30)*(i%2?1:-1)-(i%2?0:0),{align:'center',size:12,color:on?C.cyan:C.ink});
      rich(g,ttl,X(yr),i%2?y+56:y-36,{align:'center',size:12,color:on?C.tot:C.mute,font:SANS,weight:600})});
    const [yr,ttl,txt]=HIST[cur];g.fillStyle='rgba(56,214,232,.08)';rrect(g,40,H*0.62,W-80,72,10);g.fill();rich(g,ttl,56,H*0.62+22,{size:13.5,font:SANS,weight:600,color:C.cyan});
    g.fillStyle=C.ink;g.font=`13px ${SANS}`;g.textAlign='left';g.fillText(txt.length*7>W-120?txt.slice(0,Math.floor((W-120)/7))+'…':txt,56,H*0.62+50);
  },
  read(){return [['enablers','MBE · MOCVD'],['control','few nm, few atomic layers']]}
};

VIEWS.rTetc={kind:'2d',title:'Resonant transmission T(E_n) = 4T_ET_C/(T_E+T_C)²',sub:'Matched barriers give unity; mismatch lowers the peak but it stays far above T_ET_C',drag:'TE',
  params:[LR('TE','Emitter barrier $T_E$',1e-5,0.5,1e-3,'',{f:v=>num(v,3)}),LR('TC','Collector barrier $T_C$',1e-5,0.5,1e-3,'',{f:v=>num(v,3)})],
  draw(g,W,H,p,t,S){
    const [b]=boxes(W,H,[1],{t:48,l:80});const pl=new P2(g,b,{x:[1e-5,0.5],logx:true,y:[1e-10,2],logy:true,xl:'T_E (log scale)',yl:'transmission'});S.main=pl;pl.frame();
    const res=te=>4*te*p.TC/(te+p.TC)**2;pl.curve(res,{c:C.d,w:2.8,n:400});pl.curve(te=>te*p.TC,{c:C.vio,w:2.2,dash:[6,4],n:200});
    pl.vline(p.TC,C.mute,[3,3],'T_E = T_C');pl.dot(p.TE,res(p.TE),'#fff',6,'T(E_n) = '+num(res(p.TE),3));pl.dot(p.TE,p.TE*p.TC,C.vio,5,'T_ET_C = '+num(p.TE*p.TC,2),8,14);
    legend(g,b.x,24,[[C.d,'at resonance, Eq. 64'],[C.vio,'off resonance, Eq. 63',[6,4]]]);
  },
  read(p){const r=4*p.TE*p.TC/(p.TE+p.TC)**2,o=p.TE*p.TC;return [['T(E_n)',num(r,4),r>0.9?'good':''],['T_off = T_ET_C',num(o,3)],['enhancement',num(r/o,3)+'×','good'],['symmetry T_E/T_C',num(p.TE/p.TC,3)]]}
};

VIEWS.rSupply={kind:'2d',title:'Electron supply function N(E) — Eq. 66',sub:'kT·ln[1 + e^{(E_F−E)/kT}] for several temperatures; the T → 0 limit is the straight line (E_F − E)',drag:'E',
  params:[SP.EF,SP.T,R('E','Probe energy $E$',0,0.2,0.001,0.02,'eV',{f:v=>(v*1000).toFixed(0)+' meV'}),SP.m],
  draw(g,W,H,p,t,S){
    const [b]=boxes(W,H,[1],{t:48,l:80});const pre=p.m*M0/(Math.PI*HBAR*HBAR)*Q;const ymax=(p.EF+0.04)*1.05;
    const pl=new P2(g,b,{x:[0,0.2],y:[0,ymax],xl:'Longitudinal energy E − E_C (eV)',yl:'N(E) / (m*/πħ²)   (eV)'});S.main=pl;pl.vband(0,p.EF,'rgba(91,156,255,.07)','occupied window',C.t);pl.frame();
    for(const T of [77,200,400])pl.curve(E=>Nsup({EF:p.EF,T},E),{c:C.mute,w:1.2,a:.6});
    pl.curve(E=>Math.max(0,p.EF-E),{c:C.x,w:1.8,dash:[6,4]});pl.curve(E=>Nsup({EF:p.EF,T:p.T},E),{c:C.cyan,w:2.8});
    pl.vline(p.EF,C.cyan,[4,4],'E_F');pl.dot(p.E,Nsup({EF:p.EF,T:p.T},p.E),'#fff',6);
    legend(g,b.x,24,[[C.cyan,'T = '+p.T+' K'],[C.mute,'77 · 200 · 400 K'],[C.x,'T → 0: E_F − E',[6,4]]]);
  },
  read(p){const pre=p.m*M0/(Math.PI*HBAR*HBAR);const n=Nsup(p,p.E);return [['kT',(KB*p.T*1000).toFixed(1)+' meV'],['N(E)/(m*/πħ²)',(n*1000).toFixed(2)+' meV'],['N(E)',num(pre*n*Q*1e-4,3)+' cm⁻²'],['low-T value',(Math.max(0,p.EF-p.E)*1000).toFixed(1)+' meV']]}
};

VIEWS.rInteg={kind:'2d',title:'Current integrand N(E)·T(E) at bias V',sub:'J = (q/2πħ)∫N(E)T(E)dE — only energies where both supply and transmission are large contribute',
  params:[R('V','Bias $V$',0,0.6,0.001,0.15,'V',{f:v=>v.toFixed(3)+' V'}),SP.EF,SP.T,SP.W,SP.d1,SP.d2,SP.gs,K('tmm','Overlay exact T(E) at this bias',true)],
  draw(g,W,H,p,t,S){
    const P=rp(p),kT=KB*P.T,Em=P.EF+12*kT+0.03,rs=P.lv.map((_,n)=>resPar(P,n,p.V));const bs=boxes(W,H,[1,1],{t:46,gap:40,l:80});
    const p1=new P2(g,bs[0],{x:[0,Em],y:[1e-7,2],logy:true,yl:'T(E)',noxt:true});p1.frame();
    if(p.tmm){const R_=regions(P,p.V);p1.curve(E=>tmmT(P,E,p.V,R_),{c:C.mute,w:1.3,n:1500})}
    p1.curve(E=>Tbw(P,E,p.V,rs),{c:C.cyan,w:2.4,n:1500});rs.forEach((r,i)=>{if(r.E>0&&r.E<Em)p1.vline(r.E,RC.lvl[i],[3,3],'E_'+(i+1)+'(V)')});
    const sup=E=>Ssup(P,E,p.V),mx=sup(0)*1.15;const p2=new P2(g,bs[1],{x:[0,Em],y:[0,mx],xl:'Energy E − E_C (emitter) (eV)',yl:'supply (meV)'});p2.frame();
    p2.curve(sup,{c:C.t,w:2.2});const prod=E=>Tbw(P,E,p.V,rs)*sup(E);p2.curve(prod,{c:C.d,fill:0,fa:.35,n:1500});p2.curve(prod,{c:C.d,w:2,n:1500});
    S.J=Jres(P,p.V);legend(g,bs[0].x,24,[[C.cyan,'T(E) resonance model'],...(p.tmm?[[C.mute,'exact T(E)']]:[]),[C.t,'N(E) supply'],[C.d,'N·T (area ∝ J)']]);
  },
  read(p,S){const P=rp(p),r=resPar(P,0,p.V);return [['E₁(V) − E_C',(r.E*1000).toFixed(1)+' meV',r.E<0?'bad':r.E<=P.EF?'good':'warn'],['T_E, T_C',num(r.TE,2)+', '+num(r.TC,2)],['ΔE = ħ/τ',(r.G*1000).toFixed(2)+' meV'],['τ',si(r.tau,'s')],['J_resonant',Jfmt(S.J||0)]]}
};

VIEWS.rJV={kind:'2d',title:'RTD J-V characteristic with points (a)–(e)',sub:'Left: band profile at your bias · right: J-V from Eqs. 64–66 (resonances) plus a thermionic/leakage background',drag:'V',
  params:[SP.V,SP.EF,SP.T,SP.W,SP.d1,SP.d2,SP.U,SP.gs,SP.jb,SEL('pt','Jump to point',[['-','—'],['a','(a) near-zero bias'],['b','(b) first peak'],['c','(c) first valley'],['d','(d) second peak'],['e','(e) second NDR']],'-'),SEL('ax','J axis',[['lin','linear, full range'],['first','linear, zoom on first resonance'],['log','logarithmic']],'lin')],
  draw(g,W,H,p,t,S){
    const P=rp(p),cv=jvCurve(P),V=Math.min(p.V,cv.Vm);const wide=W>640,lw=wide?W*0.42:W;
    const bb=wide?{x:56,y:48,w:lw-70,h:H-96}:{x:56,y:44,w:W-74,h:H*0.42};
    const pb=new P2(g,bb,{x:[-8,P.L+8],y:[-Math.max(0.3,V)-0.1,P.U+0.12],xl:'x (nm)',yl:'E (eV)',title:'band profile'});pb.frame();drawBand(g,pb,P,V);
    const bj=wide?{x:lw+78,y:48,w:W-lw-96,h:H-96}:{x:80,y:H*0.42+90,w:W-98,h:H*0.58-136};
    const zoom=p.ax==='first'&&cv.pts.c,xm=zoom?Math.min(cv.Vm,cv.pts.c.V*1.7):cv.Vm,jm=zoom?cv.pts.b.J*1.3:Math.max(...cv.J)*1.15;
    const pj=new P2(g,bj,{x:[0,xm],y:p.ax==='log'?[Math.max(1,cv.J[1]*0.3),Math.max(...cv.J)*3]:[0,jm],logy:p.ax==='log',xl:'Bias V (V)',yl:'J (A/cm²)',ylOff:68});S.main=pj;
    if(cv.pts.b&&cv.pts.c)pj.vband(cv.pts.b.V,cv.pts.c.V,'rgba(255,92,138,.08)','NDR',C.ndr);if(cv.pts.d&&cv.pts.e)pj.vband(cv.pts.d.V,cv.pts.e.V+(cv.pts.e.V-cv.pts.d.V),'rgba(255,92,138,.06)','NDR',C.ndr);
    pj.frame();pj.pts(cv.Vs.map((v,i)=>[v,Jbg(P,v)]),{c:C.mute,w:1.3,dash:[4,4]});pj.pts(cv.Vs.map((v,i)=>[v,cv.J[i]]),{c:C.tot,w:2.6});
    for(const k of ['a','b','c','d','e'])if(cv.pts[k])pj.dot(cv.pts[k].V,cv.pts[k].J,C.x,4.5,'('+k+')',6,-12);
    pj.vline(V,'rgba(255,255,255,.3)',[3,3]);pj.dot(V,jAt(cv,V),'#fff',6);S.cv=cv;
  },
  onSet(k,v,p){if(k==='pt'&&v!=='-'){const q=jvCurve(rp(p)).pts[v];if(q)return {V:q.V}}if(k==='V'&&p.pt!=='-'){const q=jvCurve(rp(p)).pts[p.pt];if(!q||Math.abs(q.V-v)>1e-6)return {pt:'-'}}},
  read(p,S){const P=rp(p),cv=S.cv||jvCurve(P),V=Math.min(p.V,cv.Vm);const st=lvlStatus(P,0,V),J=jAt(cv,V);const i=clamp(Math.round(V/cv.Vm*(cv.Vs.length-1)),1,cv.Vs.length-2),dJ=(cv.J[i+1]-cv.J[i-1])/(cv.Vs[i+1]-cv.Vs[i-1]);
    return [['E₁(V) − E_C',((P.lv[0]-P.f*V)*1000).toFixed(0)+' meV'],['E₁ status',st[0],st[1]],['J',Jfmt(J)],['dJ/dV',num(dJ,3)+' A/cm²/V',dJ<0?'bad':'good'],['V_P / J_P',cv.pts.b?cv.pts.b.V.toFixed(3)+' V / '+Jfmt(cv.pts.b.J):'—'],['J_V',cv.pts.c?Jfmt(cv.pts.c.J):'—'],['PVR',isFinite(cv.pvr)?cv.pvr.toFixed(1)+' : 1':'—',cv.pvr>3?'good':'warn'],['ideal V_P = 2(E₁−E_C)/q',(P.lv[0]/P.f).toFixed(3)+' V']]}
};

VIEWS.rDisp={kind:'2d',title:'k-space picture: emitter states vs well subband',sub:'Energy and lateral momentum must both match; the emitter can only supply k_x² ≥ 0',
  params:[R('d','Level position $E_1 − E_C$',-0.04,0.12,0.001,0.03,'eV',{f:v=>(v*1000).toFixed(0)+' meV'}),SP.EF,SP.m],
  draw(g,W,H,p,t){
    const kF=Math.sqrt(p.m*p.EF/HB2M),kmax=kF*1.6;const half=(W-80)/2;const bl={x:56,y:56,w:half-30,h:H-110},br={x:56+half+40,y:56,w:half-30,h:H-110};
    const yr=[-0.06,p.EF*1.8+0.03];const pe=new P2(g,bl,{x:[0,kmax],y:yr,xl:'k (nm⁻¹)',yl:'E − E_C (eV)',title:'Emitter (3D bulk)'});pe.frame();
    const par=k=>HB2M*k*k/p.m;pe.pts([[0,0],...lin(0,kF,60).map(k=>[k,par(k)]),[0,p.EF]],{c:null,fc:'rgba(150,170,200,.25)',close:true});pe.curve(par,{c:C.t,w:2.4});pe.hline(p.EF,C.cyan,[5,4],'E_F');
    const pw=new P2(g,br,{x:[0,kmax],y:yr,xl:'k_⊥ (nm⁻¹)',yl:'',title:'Well subband E_1 + ħ²k_⊥²/2m*'});pw.frame();pw.curve(k=>p.d+par(k),{c:C.d,w:2.4});pw.hline(p.EF,C.cyan,[5,4]);pw.hline(0,C.mute,[2,3],'E_C');
    const ok=p.d>=0&&p.d<=p.EF,above=p.d>p.EF;const col=ok?C.d:above?C.x:C.ndr;
    arrow(g,bl.x+bl.w+8,pe.Y(Math.max(p.d,-0.05)),br.x-8,pw.Y(Math.max(p.d,-0.05)),col,2.6,10);
    if(p.d>=0){const kx=Math.sqrt(p.m*p.d/HB2M);pe.dot(kx,p.d,col,5.5,'k_x = '+kx.toFixed(3),8,-12)}
    rich(g,ok?'allowed: real k_x, occupied, momentum matched':above?'E_1 > E_F: few occupied electrons':'E_1 < E_C: k_x² < 0 — no propagating emitter state',W/2,H-18,{align:'center',size:12.5,color:col,font:SANS});
  },
  read(p){const kF=Math.sqrt(p.m*p.EF/HB2M);const kx2=p.m*p.d/HB2M;return [['k_F',kF.toFixed(3)+' nm⁻¹'],['k_x²',kx2.toFixed(4)+' nm⁻²',kx2<0?'bad':'good'],['k_x',kx2>=0?Math.sqrt(kx2).toFixed(3)+' nm⁻¹':'imaginary'],['supply ∝ E_F − (E_1−E_C)',(p.d<0?'0 (forbidden)':(Math.max(0,p.EF-p.d)*1000).toFixed(0)+' meV'),p.d<0||p.d>p.EF?'bad':'good']]}
};

VIEWS.rVp={kind:'2d',title:'Peak voltage: ideal vs measured',sub:'V_P ≈ 2(E_n − E_C)/q for a symmetric structure; extra drops make the measured V_P larger',
  params:[R('E','$E_n − E_C$',0.02,0.3,0.001,0.12,'eV',{f:v=>(v*1000).toFixed(0)+' meV'}),R('sp','Spacer drop $V_s$',0,0.15,0.005,0.04,'V',{f:v=>v.toFixed(3)+' V'}),R('acc','Emitter/collector field penetration',0,0.15,0.005,0.05,'V',{f:v=>v.toFixed(3)+' V'}),R('ch','Well-charge correction',0,0.1,0.005,0.02,'V',{f:v=>v.toFixed(3)+' V'}),R('IR','Series drop $IR_s$',0,0.2,0.005,0.05,'V',{f:v=>v.toFixed(3)+' V'})],
  draw(g,W,H,p,t){
    const Vi=2*p.E,parts=[['V_{B1}+V_W+V_{B2} (ideal)',Vi,C.d],['spacers V_s',p.sp,C.vio],['field penetration',p.acc,C.cyan],['well charge',p.ch,C.x],['IR_s',p.IR,C.ndr]],tot=parts.reduce((a,b)=>a+b[1],0);
    const bs=boxes(W,H,[1,0.55],{t:50,gap:60});const pl=new P2(g,bs[0],{x:[0,0.3],y:[0,0.65],xl:'E_n − E_C (eV)',yl:'V_P (V)'});pl.frame();
    pl.curve(e=>2*e,{c:C.d,w:2.6});pl.curve(e=>2*e+tot-Vi,{c:C.ndr,w:2,dash:[6,4]});pl.dot(p.E,Vi,C.d,6,'ideal '+Vi.toFixed(3)+' V');pl.dot(p.E,tot,C.ndr,6,'measured '+tot.toFixed(3)+' V',8,14);
    const B=bs[1],sc=B.w/Math.max(0.8,tot*1.05);let x=B.x;rich(g,'V_applied =',B.x,B.y-10,{size:12,font:SANS,weight:600});
    parts.forEach(([l,v,c])=>{if(v<=0)return;g.fillStyle=c;g.fillRect(x,B.y+4,v*sc,26);if(v*sc>70)rich(g,l,x+4,B.y+17,{size:10.5,color:'#0a0f16'});x+=v*sc});
    legend(g,B.x,B.y+B.h-6,parts.slice(1).map(([l,,c])=>[c,l]));
  },
  read(p){const Vi=2*p.E,tot=Vi+p.sp+p.acc+p.ch+p.IR;return [['V_P ideal',Vi.toFixed(3)+' V'],['V_P measured',tot.toFixed(3)+' V','warn'],['excess',(tot-Vi).toFixed(3)+' V'],['example 0.12 eV','→ 0.24 V']]}
};

VIEWS.rPVR={kind:'2d',title:'Peak-to-valley ratio and temperature',sub:'J_P comes from tunnelling (weak T dependence); J_V has a thermionic part ∝ T²e^{−qΦ_B/kT}',
  params:[SP.T,SP.jb,SP.gs,SP.W,SP.d1,SP.d2],
  draw(g,W,H,p,t){
    const P=rp(p),cv=jvCurve(P);const bs=boxes(W,H,[1.4,1],{t:46,gap:40,l:80});
    const jm=Math.max(...cv.J)*1.15;const p1=new P2(g,bs[0],{x:[0,cv.Vm],y:[0,jm],xl:'Bias V (V)',yl:'J (A/cm²)',ylOff:66});p1.frame();
    for(const T of [77,200,400]){const c2=jvCurve(rp({...p,T}));p1.pts(c2.Vs.map((v,i)=>[v,c2.J[i]]),{c:C.mute,w:1.1,a:.55})}
    p1.pts(cv.Vs.map((v,i)=>[v,cv.J[i]]),{c:p.T>250?C.red:C.t,w:2.6});
    if(cv.pts.b)p1.dot(cv.pts.b.V,cv.pts.b.J,C.d,5.5,'J_P');if(cv.pts.c)p1.dot(cv.pts.c.V,cv.pts.c.J,C.ndr,5.5,'J_V',8,14);
    const Ts=lin(50,420,30),pv_=Ts.map(T=>jvCurve(rp({...p,T})).pvr);const p2=new P2(g,bs[1],{x:[50,420],y:[0.5,Math.max(10,...pv_.filter(isFinite))*1.3],logy:true,xl:'Temperature T (K)',yl:'PVR'});p2.frame();
    p2.pts(Ts.map((T,i)=>[T,pv_[i]]).filter(q=>isFinite(q[1])),{c:C.d,w:2.4});if(isFinite(cv.pvr))p2.dot(p.T,cv.pvr,'#fff',5.5);
    legend(g,bs[0].x,24,[[p.T>250?C.red:C.t,'T = '+p.T+' K'],[C.mute,'77 · 200 · 400 K']]);
  },
  read(p){const cv=jvCurve(rp(p));return [['J_P',cv.pts.b?Jfmt(cv.pts.b.J):'—'],['J_V',cv.pts.c?Jfmt(cv.pts.c.J):'—'],['PVR',isFinite(cv.pvr)?cv.pvr.toFixed(2)+' : 1':'—',cv.pvr>5?'good':'warn'],['example 2×10⁵ / 2.5×10⁴','= 8']]}
};

VIEWS.rBarrier={kind:'2d',title:'Barrier-thickness trade-off',sub:'Thin: high current, broad leaky resonance · thick: low current, narrow selective resonance',drag:'d',
  params:[R('d','Barrier thickness $d_B$',1,5,0.05,2.5,'nm',{f:v=>v.toFixed(2)+' nm'}),SP.W,SP.U,SP.m],
  draw(g,W,H,p,t,S){
    const ds=lin(1,5,41),rows=ds.map(d=>{const P=rp({...p,d1:d,d2:d,gs:0.1,jb:0,T:300});const r=resPar(P,0,0);return {d,G:r.G*1000,tau:r.tau,J:Jres(P,P.lv[0]/P.f*0.98)}});
    const bs=boxes(W,H,[1,1],{t:46,gap:40,l:80});const p1=new P2(g,bs[0],{x:[1,5],y:[1e-3,1e3],logy:true,yl:'ΔE = ħ/τ (meV)',noxt:true});S.main=p1;p1.frame();
    p1.pts(rows.map(r=>[r.d,r.G]),{c:C.vio,w:2.6});const cur=rows.reduce((a,b)=>Math.abs(b.d-p.d)<Math.abs(a.d-p.d)?b:a);p1.dot(cur.d,cur.G,'#fff',5.5,'ΔE = '+num(cur.G,3)+' meV');
    const jr=rows.map(r=>r.J).filter(x=>x>0);const p2=new P2(g,bs[1],{x:[1,5],y:[Math.max(1,Math.min(...jr)/2),Math.max(...jr)*2],logy:true,xl:'Barrier thickness d_B (nm)',yl:'J_P (A/cm²)',ylOff:52});p2.frame();
    p2.pts(rows.filter(r=>r.J>0).map(r=>[r.d,r.J]),{c:C.d,w:2.6});p2.dot(cur.d,cur.J,'#fff',5.5,Jfmt(cur.J));S.cur=cur;
  },
  read(p,S){const c=S.cur;if(!c)return [];return [['ΔE',num(c.G,3)+' meV'],['τ',si(c.tau,'s')],['J_P (coherent)',Jfmt(c.J)],['verdict',p.d<2?'high current · leaky':p.d>3.5?'selective · low current':'balanced',p.d<2||p.d>3.5?'warn':'good']]}
};

VIEWS.rWellT={kind:'2d',title:'Quantum-well width trade-off',sub:'Narrow well: high, widely spaced levels · wide well: more levels, closely spaced',drag:'W',
  params:[SP.W,SP.U,SP.m],
  draw(g,W,H,p,t,S){
    const bs=boxes(W,H,[1.2,1],{t:46,gap:40,l:80});const p1=new P2(g,bs[0],{x:[2,10],y:[0,p.U*1.1],yl:'E_n (eV)',noxt:true});S.main=p1;p1.frame();p1.hline(p.U,C.x,[5,4],'ΔE_C');
    for(let n=0;n<4;n++)p1.curve(w=>wellLevels(p.U,w,p.m)[n],{c:RC.lvl[n],w:2.4,n:160});p1.vline(p.W,'rgba(255,255,255,.3)',[3,3]);
    const fl=wellLevels(p.U,p.W,p.m);fl.slice(0,4).forEach((E,n)=>p1.dot(p.W,E,RC.lvl[n],5,'E_'+(n+1),8,-8));
    const p2=new P2(g,bs[1],{x:[2,10],y:[0,p.U],xl:'Well width W (nm)',yl:'ΔE_{12} (eV)'});p2.frame();p2.curve(w=>{const l=wellLevels(p.U,w,p.m);return l.length>1?l[1]-l[0]:NaN},{c:C.cyan,w:2.6,n:160});
    if(fl.length>1)p2.dot(p.W,fl[1]-fl[0],'#fff',5.5,'spacing '+((fl[1]-fl[0])*1000).toFixed(0)+' meV');
  },
  read(p){const fl=wellLevels(p.U,p.W,p.m);return [['levels',String(fl.length)],['E₁',(fl[0]*1000).toFixed(0)+' meV'],['E₂ − E₁',fl[1]?((fl[1]-fl[0])*1000).toFixed(0)+' meV':'—'],['peak spacing ≈ 2ΔE₁₂/q',fl[1]?(2*(fl[1]-fl[0])).toFixed(2)+' V':'—']]}
};

VIEWS.rHyst={kind:'2d',title:'Well charge, feedback and hysteresis',sub:'Stored charge Q_w = −qN_w shifts the levels: V_eff = V − βJ. Up and down sweeps then differ',
  params:[R('beta','Charge feedback $β$',0,0.6,0.01,0.25,'V per J_P',{f:v=>v.toFixed(2)}),R('V','Bias $V$',0,0.6,0.001,0.25,'V',{f:v=>v.toFixed(3)+' V'})],
  draw(g,W,H,p,t,S){
    const P=rp({}),cv=jvCurve(P),Jp=cv.pts.b?cv.pts.b.J:Math.max(...cv.J);const f=v=>jAt(cv,clamp(v,0,cv.Vm));
    const sweep=dir=>{const Vs=lin(0,0.6,301);if(dir<0)Vs.reverse();let J=f(0);const o=[];for(const V of Vs){for(let k=0;k<60;k++){J=0.5*J+0.5*f(V-p.beta*J/Jp)}o.push([V,J])}return o};
    const up=sweep(1),dn=sweep(-1);const [b]=boxes(W,H,[1],{t:48,l:80});const pl=new P2(g,b,{x:[0,0.6],y:[0,Jp*1.3],xl:'Applied bias V (V)',yl:'J (A/cm²)',ylOff:66});S.main=pl;pl.frame();
    pl.pts(cv.Vs.map((v,i)=>[v,cv.J[i]]),{c:C.mute,w:1.2,dash:[4,4]});pl.pts(up,{c:C.d,w:2.6});pl.pts(dn,{c:C.ndr,w:2.2});
    const ju=up.find(q=>q[0]>=p.V)||up[up.length-1],jd=[...dn].reverse().find(q=>q[0]>=p.V)||dn[0];pl.dot(p.V,ju[1],C.d,5.5);pl.dot(p.V,jd[1],C.ndr,5.5);S.hy=Math.abs(ju[1]-jd[1])>Jp*0.05;
    legend(g,b.x,24,[[C.d,'up sweep'],[C.ndr,'down sweep'],[C.mute,'no charge feedback',[4,4]]]);
  },
  read(p,S){return [['state at V',S.hy?'bistable — depends on history':'single-valued',S.hy?'warn':'good'],['effects','V_P shift · hysteresis · bistability']]}
};

VIEWS.rCompare={kind:'2d',title:'RTD vs conventional (Esaki) tunnel diode',sub:'Both normalised to their first peak; the RTD can show several NDR regions',
  params:[K('norm','Normalise to the first peak',true)],
  draw(g,W,H,p,t){
    const cv=jvCurve(rp({}));const Jp=cv.pts.b?cv.pts.b.J:1;const [b]=boxes(W,H,[1],{t:48,l:80});const pl=new P2(g,b,{x:[0,cv.Vm],y:[0,p.norm?2.2:Math.max(...cv.J)*1.1],xl:'Bias V (V)',yl:p.norm?'J / J_P':'J (A/cm²)',ylOff:52});pl.frame();
    pl.pts(cv.Vs.map((v,i)=>[v,cv.J[i]/(p.norm?Jp:1)]),{c:C.d,w:2.6});if(p.norm){const P5=MATS.Ge.P;pl.curve(v=>Itot(DEF,v)/P5.Ip,{c:C.t,w:2.4})}
    legend(g,b.x,24,[[C.d,'RTD (quantized-level alignment)'],...(p.norm?[[C.t,'Esaki diode (band overlap)']]:[])]);
  },
  read(){return [['tunnel diode','band overlap'],['RTD','quantized-level alignment'],['NDR regions','one vs several']]}
};

VIEWS.rSpeed={kind:'2d',title:'Transit time and maximum frequency',sub:'t_tr ~ L/v — a few-nanometre active region gives sub-picosecond transit',drag:'L',
  params:[LR('L','Active length $L$',1,1000,15,'nm',{f:v=>num(v,3)+' nm'}),LR('v','Electron velocity $v$',1e4,1e6,3e5,'m/s',{f:v=>num(v,2)+' m/s'})],
  draw(g,W,H,p,t,S){
    const [b]=boxes(W,H,[1],{t:48,l:80});const pl=new P2(g,b,{x:[1,1000],logx:true,y:[1e7,1e15],logy:true,xl:'Active length L (nm)',yl:'f ≈ 1/(2πt_tr) (Hz)'});S.main=pl;pl.frame();
    const f=L=>p.v/(2*Math.PI*L*1e-9);pl.hband(7e11,1e12,'rgba(63,210,155,.1)');pl.hline(7e11,C.d,[4,4],'700 GHz demonstrated');pl.hline(1e12,C.x,[2,3],'1 THz projected');
    pl.curve(f,{c:C.cyan,w:2.8});pl.dot(p.L,f(p.L),'#fff',6,si(f(p.L),'Hz'));pl.vband(100,1000,'rgba(255,92,138,.06)','diffusion-length devices',C.ndr);
  },
  read(p){const tt=p.L*1e-9/p.v;return [['t_tr = L/v',si(tt,'s')],['f ≈ 1/(2πt_tr)',si(1/(2*Math.PI*tt),'Hz'),'good'],['t_storage','≈ 0']]}
};

/* RTD oscillator: Vb → L → (C ∥ G_L ∥ RTD) */
function rtdI(cv,A){return v=>jAt(cv,clamp(v,0,cv.Vm))*A*1e-8*1e3} // mA for area A (µm²)
VIEWS.rOsc={kind:'2d',anim:true,title:'RTD oscillator — |g_d| > G_L',sub:'Bias source → L → (C ∥ loss conductance G_L ∥ RTD); RK4 time-domain simulation',
  params:[R('Vb','Bias $V_B$',0,0.6,0.001,0.24,'V',{f:v=>v.toFixed(3)+' V'}),R('A','Diode area $A$',1,20,0.5,4,'µm²',{f:v=>v.toFixed(1)+' µm²'}),R('GL','Loss conductance $G_L$',0,30,0.1,3,'mS',{f:v=>v.toFixed(1)+' mS'}),LR('L','Inductance $L$',0.01,5,0.3,'nH',{f:v=>si(v*1e-9,'H')}),LR('C','Capacitance $C$',0.02,5,0.2,'pF',{f:v=>si(v*1e-12,'F')})],
  draw(g,W,H,p,t,S){
    const cv=jvCurve(rp({})),I=rtdI(cv,p.A);const key=[p.Vb,p.A,p.GL,p.L,p.C].join();
    if(S.key!==key){S.key=key;const per=2*Math.PI*Math.sqrt(p.L*p.C)*31.623,Tend=per*30,dt=per/300,N=Math.ceil(Tend/dt),every=Math.max(1,Math.floor(N/1500));let i=0,v=0;const ts=[],vs=[],is=[];
      const fn=(i,v)=>[(p.Vb-v)/p.L,(i-I(v)-p.GL*v)*1e-3/p.C];
      for(let k=0;k<N;k++){const a=fn(i,v),b=fn(i+a[0]*dt/2,v+a[1]*dt/2),c=fn(i+b[0]*dt/2,v+b[1]*dt/2),d=fn(i+c[0]*dt,v+c[1]*dt);i+=dt/6*(a[0]+2*b[0]+2*c[0]+d[0]);v=clamp(v+dt/6*(a[1]+2*b[1]+2*c[1]+d[1]),-0.2,1.5);if(k%every===0){ts.push(k*dt);vs.push(v);is.push(i)}}
      const h=Math.floor(vs.length*0.6),tail=vs.slice(h),mean=tail.reduce((a,b)=>a+b,0)/tail.length;const cr=[];for(let k=h+1;k<vs.length;k++)if(vs[k-1]<mean&&vs[k]>=mean)cr.push(ts[k]);
      S.s={ts,vs,is,amp:Math.max(...tail)-Math.min(...tail),f0:cr.length>2?(cr.length-1)/(cr[cr.length-1]-cr[0])*1e12:0,Tend};}
    const s=S.s,n=s.ts.length,wide=W>640,lw=wide?W*0.58:W;const [b1]=boxes(lw,wide?H:H*0.5,[1],{t:46});
    const p1=new P2(g,b1,{x:[0,s.Tend/1000],y:[Math.min(...s.vs)-0.02,Math.max(...s.vs)+0.02],xl:'time (ns)',yl:'v (V)'});p1.frame();p1.pts(s.ts.map((x,k)=>[x/1000,s.vs[k]]),{c:C.cyan,w:1.5});
    const k=MOTION?Math.floor((t*0.12%1)*n):n-1;p1.dot(s.ts[k]/1000,s.vs[k],'#fff',4.5);
    const b2=wide?{x:lw+56,y:46,w:W-lw-74,h:H-92}:{x:62,y:H*0.5+40,w:W-80,h:H*0.5-80};const im=Math.max(...cv.J)*p.A*1e-5*1.3;
    const imx=Math.max(...lin(0,0.55,60).map(I),...s.is)*1.15;const p2=new P2(g,b2,{x:[0,0.55],y:[Math.min(0,...s.is),imx],xl:'v (V)',yl:'i (mA)',title:'phase plane'});p2.frame();p2.curve(I,{c:'rgba(238,243,250,.6)',w:1.6});
    p2.curve(v=>I(v)+p.GL*v,{c:C.mute,w:1.1,dash:[4,4]});p2.pts(s.vs.map((v,j)=>[v,s.is[j]]),{c:C.ndr,w:1.2,a:.85});p2.dot(s.vs[k],s.is[k],'#fff',4.5);
  },
  read(p,S){const cv=jvCurve(rp({})),I=rtdI(cv,p.A),gd=(I(p.Vb+0.002)-I(p.Vb-0.002))/0.004;const s=S.s;const osc=s&&s.amp>0.01&&s.f0>0;
    return [['g_d at V_B',gd.toFixed(2)+' mS',gd<0?'good':'bad'],['|g_d| > G_L ?',gd<0&&-gd>p.GL?'yes':'no',gd<0&&-gd>p.GL?'good':'bad'],['oscillation',osc?'sustained':'none / decays',osc?'good':'warn'],['frequency',osc?si(s.f0,'Hz'):'—'],['f₀ = 1/2π√LC',si(1/(2*Math.PI*Math.sqrt(p.L*1e-9*p.C*1e-12)),'Hz')]]}
};

VIEWS.rMulti={kind:'2d',title:'Multiple stable states — memory & multivalued logic',sub:'A load line crossing a multi-peak J-V gives several stable operating points',
  params:[R('Vs','Supply $V_S$',0,2.4,0.005,0.95,'V',{f:v=>v.toFixed(3)+' V'}),R('RL','Load $R_L$',10,2000,1,350,'Ω',{f:v=>v.toFixed(0)+' Ω'}),R('A','Diode area $A$',1,20,0.5,4,'µm²',{f:v=>v.toFixed(1)+' µm²'}),LR('jb','Background (thermionic + leakage)',1,1e4,1000,'A/cm²',{f:v=>num(v,2)+' A/cm²'})],
  draw(g,W,H,p,t,S){
    const cv=jvCurve(rp({jb:p.jb})),I=rtdI(cv,p.A);const [b]=boxes(W,H,[1],{t:48,l:80});const im=Math.max(...cv.J)*p.A*1e-5*1.3;
    const pl=new P2(g,b,{x:[0,cv.Vm],y:[0,im],xl:'Diode voltage V (V)',yl:'I (mA)'});pl.frame();pl.curve(I,{c:C.tot,w:2.6,n:500});pl.curve(v=>(p.Vs-v)/p.RL*1000,{c:C.x,w:2,dash:[6,4]});
    const xs=[];let pr=null;for(let k=0;k<=1500;k++){const v=k*cv.Vm/1500,r=(p.Vs-v)/p.RL*1000-I(v);if(pr!==null&&Math.sign(r)!==Math.sign(pr))xs.push(v);pr=r}
    let st=0;xs.forEach(v=>{const s=I(v+0.003)-I(v-0.003)>0;if(s)st++;pl.dot(v,I(v),s?C.d:C.ndr,6,s?'state '+(st-1):'unstable',8,-14)});S.st=st;S.n=xs.length;
  },
  read(p,S){return [['intersections',String(S.n||0)],['stable states',String(S.st||0),S.st>2?'good':''],['logic levels',S.st>2?'multivalued (0,1,2…)':S.st===2?'binary memory':'—']]}
};

VIEWS.rTol={kind:'2d',title:'Fabrication tolerance: one monolayer matters',sub:'ΔW ⇒ ΔE_n ⇒ ΔV_P  (one GaAs monolayer ≈ 0.283 nm)',drag:'W',
  params:[SP.W,SP.U,SP.m,R('ml','Thickness error',0,3,1,1,'monolayers',{f:v=>'± '+v+' ML'})],
  draw(g,W,H,p,t,S){
    const dW=p.ml*0.2827,E=w=>wellLevels(p.U,w,p.m)[0],Vp=w=>2*E(w);const [b]=boxes(W,H,[1],{t:48,l:80});const pl=new P2(g,b,{x:[2,10],y:[0,Math.min(1.2,2*E(2)*1.05)],xl:'Well width W (nm)',yl:'V_P ≈ 2E₁/q (V)'});S.main=pl;
    pl.vband(p.W-dW,p.W+dW,'rgba(255,92,138,.12)','± '+p.ml+' ML',C.ndr);pl.frame();pl.curve(Vp,{c:C.cyan,w:2.6,n:200});
    pl.dot(p.W,Vp(p.W),'#fff',6,'V_P = '+Vp(p.W).toFixed(3)+' V');if(p.ml){pl.dot(p.W-dW,Vp(p.W-dW),C.ndr,4.5);pl.dot(p.W+dW,Vp(p.W+dW),C.ndr,4.5)}
  },
  read(p){const dW=p.ml*0.2827,E=w=>wellLevels(p.U,w,p.m)[0];const d=(E(p.W-dW)-E(p.W+dW))/2;return [['ΔW',dW.toFixed(3)+' nm'],['ΔE₁',(d*1000).toFixed(1)+' meV'],['ΔV_P',(2*d*1000).toFixed(0)+' mV',2*d>0.03?'bad':'warn']]}
};

const calcV=(title,params,body)=>({kind:'html',title,sub:'Every input is live; results recompute instantly',params,render(el,p){el.innerHTML=`<div class="calc"><div class="step on">${body(p)}</div></div>`},read:p=>[]});
VIEWS.rCalcE1=calcV('Section 7 — first quantum-well level',[SP.W,SP.m,SP.U],p=>{const ms=p.m*M0,E1=6.62607e-34**2/(8*ms*(p.W*1e-9)**2)/Q;return `<h4>Ideal infinite well, n = 1</h4>
  ${M(`W = ${p.W.toFixed(2)} \\t{nm},  m* = ${p.m.toFixed(3)}m_0,  m_0 = 9.11 × 10^{−31} \\t{kg}`)}<br>${M(`m* = ${p.m.toFixed(3)}(9.11 × 10^{−31}) ≈ ${num(ms,3)} \\t{kg}`)}<br>
  ${M('E_1 − E_{Cw} = \\f{h^2}{8m*W^2}')}, with ${M('h = 6.626 × 10^{−34}')} J·s ⇒ <span class="res">${E1.toFixed(3)} eV</span><br>
  Finite barrier ${M(`ΔE_C = ${p.U.toFixed(2)}`)} eV: <span class="res">${(wellLevels(p.U,p.W,p.m)[0]*1000).toFixed(0)} meV</span> &lt; ${(E1*1000).toFixed(0)} meV<br><small>Guide: W = 5 nm, m* = 0.067m₀ ⇒ 0.225 eV; a practical finite well gives ~0.1 eV.</small>`});
VIEWS.rCalcVp=calcV('Section 20 — ideal peak voltage',[R('E','$E_n − E_C$',0.02,0.3,0.001,0.12,'eV',{f:v=>(v*1000).toFixed(0)+' meV'})],p=>`<h4>Symmetric double barrier</h4>${M(`E_n − E_C = ${p.E.toFixed(3)} \\t{eV}`)}<br>${M('V_P ≈ \\f{2(E_n − E_C)}{q}')} = <span class="res">${(2*p.E).toFixed(3)} V</span><br><small>Guide: 0.12 eV ⇒ 0.24 V (using 1 eV/q = 1 V).</small>`);
VIEWS.rCalcPVR=calcV('Section 21 — peak-to-valley ratio',[LR('Jp','$J_P$',1e4,1e6,2e5,'A/cm²',{f:v=>num(v,3)}),LR('Jv','$J_V$',1e3,1e5,2.5e4,'A/cm²',{f:v=>num(v,3)})],p=>`<h4>PVR = J_P / J_V</h4>${M(`J_P = ${num(p.Jp,3)} \\t{A/cm}^2,  J_V = ${num(p.Jv,3)} \\t{A/cm}^2`)}<br>${M('PVR = \\f{J_P}{J_V}')} = <span class="res">${(p.Jp/p.Jv).toFixed(2)}</span><br><small>Guide: 2.0×10⁵ / 2.5×10⁴ = 8.</small>`);
VIEWS.rCalcRd=calcV('Section 27 — differential resistance',[LR('Jp','$J_P$',1e4,1e6,2e5,'A/cm²',{f:v=>num(v,3)}),R('Vp','$V_P$',0.1,0.5,0.005,0.25,'V',{f:v=>v.toFixed(3)+' V'}),LR('Jv','$J_V$',1e3,1e5,4e4,'A/cm²',{f:v=>num(v,3)}),R('Vv','$V_V$',0.15,0.8,0.005,0.35,'V',{f:v=>v.toFixed(3)+' V'}),LR('A','Area $A$',0.1,10,1,'µm²',{f:v=>v.toFixed(2)+' µm²'})],p=>{const dV=p.Vv-p.Vp,dJ=p.Jv-p.Jp,rA=dV/dJ,rd=rA/(p.A*1e-8);return `<h4>Slope between peak and valley</h4>
  ${M(`ΔV = V_V − V_P = ${p.Vv.toFixed(3)} − ${p.Vp.toFixed(3)} = ${dV.toFixed(3)} \\t{V}`)}<br>${M(`ΔJ = J_V − J_P = ${num(dJ,3)} \\t{A/cm}^2`)}<br>
  ${M('r_dA = \\f{ΔV}{ΔJ}')} = <span class="res">${num(rA,3)} Ω·cm²</span><br>${M(`A = ${p.A.toFixed(2)} µ\\t{m}^2 = ${num(p.A*1e-8,3)} \\t{cm}^2`)}<br>${M('r_d = \\f{r_dA}{A}')} = <span class="res">${rd.toFixed(1)} Ω</span> ${dV>0&&dJ<0?'— negative sign confirms NDR':'— needs V_V > V_P and J_V < J_P'}<br><small>Guide: −6.25×10⁻⁷ Ω·cm² and −62.5 Ω for 1 µm².</small>`});
VIEWS.rCalcRes=calcV('Section 9.2 — resonant enhancement',[LR('TE','$T_E$',1e-5,0.5,1e-3,'',{f:v=>num(v,3)}),LR('TC','$T_C$',1e-5,0.5,1e-3,'',{f:v=>num(v,3)})],p=>{const r=4*p.TE*p.TC/(p.TE+p.TC)**2;return `<h4>Off resonance vs on resonance</h4>${M(`T_E = ${num(p.TE,3)},  T_C = ${num(p.TC,3)}`)}<br>${M('T_{off} = T_ET_C')} = <span class="res">${num(p.TE*p.TC,3)}</span><br>${M('T(E_n) = \\f{4T_ET_C}{(T_E + T_C)^2}')} = <span class="res">${num(r,4)}</span><br>${M('T_{res}/T_{off}')} = <span class="res">${num(r/(p.TE*p.TC),3)}</span><br><small>Guide: 10⁻³ and 10⁻³ ⇒ 1 and 10⁶; 0.1 and 0.01 ⇒ 0.331.</small>`});

/* chains for Part 6 */
const RCHAINS=[
  {t:'Topic flow',n:['Basic concept','Quantum well','Resonance','Peak current','NDR','Applications']},
  {t:'Resonance raises current',n:['E_{electron} ≈ E_n','resonance','T(E) ↑↑','J ↑↑']},
  {t:'Misalignment gives NDR',n:['V ↑','E_n misaligned','T(E) ↓','J ↓']},
  {t:'Crystal growth',n:['crystal quality ↑','interface quality ↑','RTD performance ↑']},
  {t:'Barrier thickness and tunnelling',n:['d ↑','2κd ↑','e^{−2κd} ↓','T ↓↓']},
  {t:'Barrier height and mass',n:['U_0 ↑ or m* ↑','κ ↑','T ↓']},
  {t:'Heavily doped contacts',n:['n ↑','E_F ↑','R_C ↓','R_s ↓']},
  {t:'Why the active region is undoped',n:['doping in active region ↑','scattering ↑','resonance quality ↓']},
  {t:'Spacer layers',n:['doped contact','spacer','barrier','dopant contamination ↓']},
  {t:'Barrier thickness and resonance width',n:['d_B ↑','escape probability ↓','τ ↑','ΔE ↓']},
  {t:'Bias moves the level',n:['E_1 > E_F','E_C < E_1 < E_F','E_1 ≈ E_C','E_1 < E_C']},
  {t:'Rising current',n:['E_1 < E_F','f(E_1) ↑','N(E_1) ↑','J ↑']},
  {t:'First NDR region',n:['V ↑','compatible states ↓','T_{effective} ↓','J ↓']},
  {t:'Small effective mass',n:['m* ↓','κ ↓','T_E ↑↑','J_P ↑']},
  {t:'Temperature and valley current',n:['T ↑','−qΦ_B/kT less negative','J_V ↑↑','PVR ↓']},
  {t:'Speed',n:['L ~ nm','t_{tr} ↓↓','f_{max} ↑↑']},
  {t:'Oscillation energy flow',n:['DC source','RTD negative conductance','AC resonator','sustained oscillation']},
  {t:'Fabrication sensitivity',n:['ΔW','ΔE_n','ΔV_P']},
  {t:'Valley leakage',n:['defects, thermionic, phonons ↑','J_V ↑','J_P/J_V ↓']},
  {t:'Parasitics',n:['R_s ↑ or C_j ↑','f_{RC} ↓']}
];
VIEWS.rchain=chainView(RCHAINS);

/* ================= 3D views ================= */
const RNODES=[
  {t:'Barrier | Well | Barrier',s:'basic concept',go:'rtd-central-idea',p:[-6.6,1.7,0]},
  {t:'E_n ∝ n²/W²',s:'quantum well',go:'rtd-quantization',p:[-3.3,2.0,-1.2]},
  {t:'E = E_n',s:'resonance',go:'rtd-transmission',p:[0,2.2,0]},
  {t:'J_P at E_1 ≈ E_C',s:'peak current',go:'rtd-points',p:[3.3,2.0,1.2]},
  {t:'dJ/dV < 0',s:'NDR',go:'rtd-jv',p:[6.6,1.7,0]},
  {t:'k_⊥ conserved',s:'core physics',go:'rtd-momentum',p:[3.4,-1.5,1.5]},
  {t:'THz · logic',s:'applications',go:'rtd-applications',p:[-1.0,-1.6,0.6]},
  {t:'power · tolerance',s:'limitations',go:'rtd-limitations',p:[-5.6,-1.5,-1.0]}
];
VIEWS.rconcept=conceptView(RNODES,[[0,1],[1,2],[2,3],[3,4],[4,5],[4,6],[6,7]],4,'Learning path · Part 6');

/* layer stack */
VIEWS.rStack=V3({title:'GaAs/AlGaAs RTD layer stack',sub:'n⁺ emitter | i-AlGaAs barrier | i-GaAs well | i-AlGaAs barrier | n⁺ collector — with the conduction-band profile above',home:{r:13,th:0.55,ph:1.12,t:[0,0.6,0]},
  params:[SP.W,SP.d1,SP.d2,K('sp','Undoped spacer layers (≈1.5 nm)',true),SEL('hl','Explain layer',[['none','—'],['em','emitter'],['b1','barrier 1'],['qw','quantum well'],['b2','barrier 2'],['co','collector'],['sp','spacers']],'none')],
  build(S){const g=S.root,dyn=new THREE.Group();g.add(dyn);let parts=[];
    const INFO={em:'n⁺-GaAs emitter: large electron supply, low contact resistance',b1:'i-AlGaAs: first tunnelling barrier',qw:'i-GaAs well: holds the quantized states E₁, E₂, …',b2:'i-AlGaAs: second barrier, controls escape to the collector',co:'n⁺-GaAs collector: receives transmitted electrons',sp:'undoped spacers: keep dopants out of the active region'};
    return {update(p){clearGroup(dyn);parts=[];const s=0.33,ts=p.sp?1.5:0;const lay=[['em',8,RC.E,'n⁺-GaAs emitter',true],...(p.sp?[['sp',ts,'#7f8ea6','spacer',false]]:[]),['b1',p.d1,RC.B,'i-AlGaAs',false],['qw',p.W,RC.Wl,'i-GaAs well',false],['b2',p.d2,RC.B,'i-AlGaAs',false],...(p.sp?[['sp',ts,'#7f8ea6','spacer',false]]:[]),['co',8,RC.E,'n⁺-GaAs collector',true]];
      const tot=lay.reduce((a,l)=>a+l[1],0)*s;let x=-tot/2;const r2=rng(4);
      lay.forEach(([k,w,c,lab,dop])=>{const ww=w*s,on=p.hl===k;const m_=new THREE.Mesh(new THREE.BoxGeometry(ww,2.4,2.4),mat(c,{transparent:true,opacity:on?0.85:0.42,emissive:c,emissiveIntensity:on?0.6:0.15,depthWrite:false}));m_.position.set(x+ww/2,0,0);dyn.add(m_);
        const e=new THREE.LineSegments(new THREE.EdgesGeometry(m_.geometry),new THREE.LineBasicMaterial({color:c,transparent:true,opacity:.7}));e.position.copy(m_.position);dyn.add(e);
        if(ww>0.4||k==='qw')dyn.add(tlabel(lab,{size:k==='em'||k==='co'?.34:.26,pos:[x+ww/2,-1.6-(k==='b1'||k==='b2'?0.35:0),1.3],color:c,font:SANS}));
        if(dop)for(let i=0;i<40;i++){const d=ball(0.05,'#cfe0ff',{ei:.6});d.position.set(x+r2()*ww,lerp(-1.1,1.1,r2()),lerp(-1.1,1.1,r2()));dyn.add(d)}
        if(k==='b1'||k==='qw'||k==='b2'){dyn.add(polyline([[x,1.45,1.25],[x,1.6,1.25],[x+ww,1.6,1.25],[x+ww,1.45,1.25]],0xffffff));dyn.add(tlabel((k==='qw'?'W':k==='b1'?'d_{B1}':'d_{B2}')+' = '+w.toFixed(1)+' nm',{size:.24,pos:[x+ww/2,1.85,1.25],color:'#ffffff'}))}
        parts.push({k,x0:x,x1:x+ww});x+=ww});
      const prof=[];parts.forEach(q=>{const Ue=q.k==='b1'||q.k==='b2'?1:0;prof.push([q.x0,2.6+Ue*0.9,-1.2],[q.x1,2.6+Ue*0.9,-1.2])});for(let i=0;i<prof.length-1;i++)dyn.add(tube([prof[i],prof[i+1]],0.035,'#eef3fa',{ei:.5}));
      const qw=parts.find(q=>q.k==='qw');const P=rp(p);P.lv.slice(0,2).forEach((E,n)=>{const y=2.6+E/P.U*0.9;if(y<3.5)dyn.add(tube([[qw.x0,y,-1.2],[qw.x1,y,-1.2]],0.03,RC.lvl[n],{ei:1}))});
      dyn.add(tlabel('E_C profile',{size:.3,pos:[-tot/2-0.2,3.0,-1.2],color:'#c9d3e1'}));
      if(p.hl!=='none')dyn.add(tlabel(INFO[p.hl],{size:.3,pos:[0,4.1,0],color:'#ffffff',font:SANS,bg:'rgba(10,15,22,.8)'}));
      const fl=[];for(let i=0;i<24;i++){const b=ball(0.07,'#7fe9ff',{ei:1.3});b.userData={o:i/24,y:lerp(-0.9,0.9,(i*0.37)%1),z:lerp(-0.9,0.9,(i*0.61)%1)};dyn.add(b);fl.push(b)}S.fl=fl;S.span=[-tot/2,tot/2,qw.x0,qw.x1]},
      tick(t){const [a,b,w0,w1]=S.span||[0,0,0,0];(S.fl||[]).forEach(q=>{let u=MOTION?(t*0.18+q.userData.o)%1:q.userData.o;let x=lerp(a,b,u);if(x>w0&&x<w1){const f=(x-w0)/(w1-w0);x=w0+(w1-w0)*(0.5+0.5*Math.sin((f-0.5)*Math.PI))}q.position.set(x,q.userData.y,q.userData.z)})}}},
  read(p){const P=rp(p);return [['sequence','n⁺|i-AlGaAs|i-GaAs|i-AlGaAs|n⁺'],['W',p.W+' nm'],['E₁ (ΔE_C 0.5 eV)',(P.lv[0]*1000).toFixed(0)+' meV'],['barriers equal?',Math.abs(p.d1-p.d2)<0.01?'yes (T_E = T_C)':'no (T_E ≠ T_C)',Math.abs(p.d1-p.d2)<0.01?'good':'warn']]}
});

/* 3D band diagram under bias */
VIEWS.rBand3=V3({title:'RTD conduction band under bias',sub:'Emitter Fermi sea (blue), quasi-bound levels (glowing sheets), electrons crossing when a level sits between E_C and E_F',home:{r:9.5,th:0.32,ph:1.28,t:[0.4,1.1,0]},
  params:[R('V','Bias $V$',0,0.6,0.001,0.12,'V',{f:v=>v.toFixed(3)+' V'}),SP.EF,SP.W,SP.d1,SP.d2,SP.U],
  build(S){const g=S.root,dyn=new THREE.Group();g.add(dyn);let P,V=0,sea,flux=[];const Xs=x=>(x-P.L/2)*0.28,Ey=E=>E*5+1.2,Dz=1.4;
    const eg=new THREE.SphereGeometry(0.06,8,6),R_=rng(21),seeds=Array.from({length:520},()=>[R_(),R_(),R_()]);
    return {update(p){clearGroup(dyn);P=rp(p);V=p.V;const xs=lin(-10,P.L+10,400);const pos=[];xs.forEach(x=>{const y=Ey(Ux(P,V,x));pos.push(Xs(x),y,-Dz,Xs(x),y,Dz)});const idx=[];for(let i=0;i<xs.length-1;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();dyn.add(new THREE.Mesh(geo,mat('#9fb3d1',{transparent:true,opacity:.35,side:THREE.DoubleSide,emissive:'#5b6b85',emissiveIntensity:.3,depthWrite:false})));
      dyn.add(polyline(xs.map(x=>[Xs(x),Ey(Ux(P,V,x)),Dz]),0xeef3fa));
      sea=inst(eg,'#6ea2ff',seeds.length,{ei:.8});let n=0;seeds.forEach(([a,b,c],i)=>{const left=i<330;const x=left?lerp(-10,-0.3,a):lerp(P.L+0.3,P.L+10,a);const E=(left?0:-V)+P.EF*Math.pow(b,2/3);setInst(sea,n++,Xs(x),Ey(E),lerp(-Dz*0.9,Dz*0.9,c))});sea.count=n;dyn.add(sea);
      const fl=(x0,x1,E,c)=>{const pl_=new THREE.Mesh(new THREE.PlaneGeometry(Xs(x1)-Xs(x0),Dz*2),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false}));pl_.rotation.x=-Math.PI/2;pl_.position.set((Xs(x0)+Xs(x1))/2,Ey(E),0);dyn.add(pl_)};
      fl(-10,0,P.EF,'#38d6e8');fl(P.L,P.L+10,P.EF-V,'#38d6e8');
      P.lv.forEach((E0,k)=>{const E=E0-P.f*V,col=E>P.EF?'#8191aa':E>=0?RC.lvl[0]:'#ff5c8a';const x0=P.d1,x1=P.d1+P.W;const y0=Ey(E0-V*x0/P.L),y1=Ey(E0-V*x1/P.L);
        const sh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.45,side:THREE.DoubleSide,depthWrite:false}));const geo2=new THREE.BufferGeometry();geo2.setAttribute('position',new THREE.Float32BufferAttribute([Xs(x0),y0,-Dz,Xs(x1),y1,-Dz,Xs(x0),y0,Dz,Xs(x1),y1,Dz],3));geo2.setIndex([0,1,2,1,3,2]);sh.geometry.dispose();sh.geometry=geo2;dyn.add(sh);
        dyn.add(tlabel('E_'+(k+1),{size:.42,pos:[Xs(x1)+0.35,y1,Dz],color:col}))});
      dyn.add(tlabel('E_F',{size:.32,pos:[Xs(-10)-0.4,Ey(P.EF),Dz],color:'#7fe9ff'}));dyn.add(tlabel('emitter',{size:.32,pos:[Xs(-5),Ey(-0.12),Dz],color:'#9fb3d1',font:SANS}));dyn.add(tlabel('collector',{size:.32,pos:[Xs(P.L+5),Ey(-V-0.12),Dz],color:'#9fb3d1',font:SANS}));
      flux=[];const E1=P.lv[0]-P.f*V;if(E1>=0&&E1<=P.EF){const nF=Math.round(6+20*(P.EF-E1)/P.EF);for(let i=0;i<nF;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(0.09,10,8),new THREE.MeshBasicMaterial({color:0x9ff7d0,transparent:true}));b.userData={o:i/nF,z:lerp(-Dz*0.8,Dz*0.8,R_()),E:E1};dyn.add(b);flux.push(b)}}},
      tick(t){flux.forEach(b=>{const u=MOTION?(t*0.3+b.userData.o)%1:b.userData.o;const x=lerp(-4,P.L+4,u);b.position.set(Xs(x),Ey(b.userData.E),b.userData.z);b.material.opacity=Math.sin(u*Math.PI)})}}},
  read(p){const P=rp(p),st=lvlStatus(P,0,p.V);return [['E₁(V) − E_C',((P.lv[0]-P.f*p.V)*1000).toFixed(0)+' meV'],['status',st[0],st[1]],['ideal V_P',(P.lv[0]/P.f).toFixed(3)+' V'],['J (model)',Jfmt(Jtot(P,p.V))]]}
});

/* double-barrier wavefunction */
VIEWS.rWave3=V3({title:'Electron wave in the double barrier',sub:'Ribbon = ψ(x) as a rotating phasor (exact transfer matrix). At E = E_n the wave builds up inside the well',home:{r:12.5,th:0.5,ph:1.2,t:[0,0,0]},
  params:[SEL('at','Energy',[['E1','snap to E₁'],['E2','snap to E₂'],['free','use slider']],'E1'),R('E','Electron energy $E$',0.005,0.6,0.0005,0.05,'eV',{f:v=>(v*1000).toFixed(1)+' meV'}),SP.W,SP.d1,SP.d2,SP.U],
  build(S){const g=S.root,N=600,dyn=new THREE.Group();g.add(dyn);
    const pos=new Float32Array(N*6),col=new Float32Array(N*6),idx=[];for(let i=0;i<N-1;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.BufferAttribute(pos,3));rg.setAttribute('color',new THREE.BufferAttribute(col,3));rg.setIndex(idx);
    g.add(new THREE.Mesh(rg,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,transparent:true,opacity:.55,depthWrite:false})));
    const tp=new Float32Array(N*3),tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.BufferAttribute(tp,3));g.add(new THREE.Line(tg,new THREE.LineBasicMaterial({color:0xffffff})));
    let psi=null,X0,X1,sx,amp,P,E;S.info={};
    return {update(p){clearGroup(dyn);P=rp(p);const pk=tmmPeaks(P,0);E=p.at==='E1'&&pk[0]?pk[0].E:p.at==='E2'&&pk[1]?pk[1].E:p.E;psi=tmmPsi(P,E,0);X0=-8;X1=P.L+8;sx=14.4/(X1-X0);
      let mx=0;for(let i=0;i<300;i++){const x=lerp(X0,X1,i/299),v=psi(x);mx=Math.max(mx,Math.sqrt(C_.abs2(v)))}amp=2.0/Math.max(1.2,mx);
      const wx=x=>(x-X0)*sx-7.2;[[0,P.d1],[P.d1+P.W,P.L]].forEach(([a,b])=>{const bx=new THREE.Mesh(new THREE.BoxGeometry((b-a)*sx,4.4,3),mat(RC.B,{transparent:true,opacity:.15,emissive:RC.B,emissiveIntensity:.25,depthWrite:false}));bx.position.set(wx((a+b)/2),0,0);dyn.add(bx);const e=new THREE.LineSegments(new THREE.EdgesGeometry(bx.geometry),new THREE.LineBasicMaterial({color:0xf6b23c,transparent:true,opacity:.6}));e.position.copy(bx.position);dyn.add(e)});
      dyn.add(tlabel('well',{size:.34,pos:[wx(P.d1+P.W/2),2.5,0],color:'#3fd29b',font:SANS}));
      const pts=[];for(let i=0;i<N;i++){const x=lerp(X0,X1,i/(N-1)),v=psi(x);pts.push([wx(x),-2.3+Math.min(3.8,C_.abs2(v)*amp*amp*0.35),-1.6])}dyn.add(polyline(pts,0xff5c8a));dyn.add(tlabel('|ψ|²',{size:.3,pos:[-7.6,-1.8,-1.6],color:'#ff5c8a'}));
      const T=tmmT(P,E,0);S.info={E,T,mx};dyn.add(tlabel('T(E) = '+num(T,3),{size:.4,pos:[4.6,2.5,0],color:T>0.5?'#3fd29b':'#ff9ab4'}));
      this.wx=wx},
      tick(t){if(!psi)return;const w=MOTION?t*2.4:0,wx=this.wx;for(let i=0;i<N;i++){const x=lerp(X0,X1,i/(N-1)),v=C_.mul(psi(x),[Math.cos(-w),Math.sin(-w)]),X=wx(x),y=v[0]*amp,z=v[1]*amp;pos.set([X,0,0,X,y,z],i*6);tp.set([X,y,z],i*3);const h=(Math.atan2(v[1],v[0])/(2*Math.PI)+1)%1,c=new THREE.Color().setHSL(0.55+0.25*h,0.85,0.55);col.set([c.r*.4,c.g*.4,c.b*.4,c.r,c.g,c.b],i*6)}
        rg.attributes.position.needsUpdate=true;rg.attributes.color.needsUpdate=true;tg.attributes.position.needsUpdate=true;rg.computeBoundingSphere();tg.computeBoundingSphere()}}},
  read(p,S){const i=S.info||{};return [['E',i.E!=null?(i.E*1000).toFixed(2)+' meV':'—'],['T(E)',i.T!=null?num(i.T,3):'—',i.T>0.5?'good':'warn'],['max |ψ| (incident = 1)',i.mx?i.mx.toFixed(2):'—'],['off-resonance T_ET_C',num(Trect(i.E||0.05,p.U,p.d1,rp(p).m)*Trect(i.E||0.05,p.U,p.d2,rp(p).m),2)]]}
});

/* emitter Fermi sphere and the resonance disk */
VIEWS.rKs=V3({title:'Emitter Fermi sphere and the resonance condition',sub:'Only electrons on the disk k_x = √(2m*(E_1−E_C))/ħ inside the sphere can tunnel (lateral momentum conserved)',home:{r:10.5,th:0.95,ph:1.2,t:[0.4,0,0]},
  params:[R('V','Bias $V$',0,0.4,0.001,0.17,'V',{f:v=>v.toFixed(3)+' V'}),SP.EF,SP.W,SP.U],
  build(S){const g=S.root,dyn=new THREE.Group();g.add(dyn);const R_=rng(33),pts=[];for(let i=0;i<900;i++){let x,y,z;do{x=R_()*2-1;y=R_()*2-1;z=R_()*2-1}while(x*x+y*y+z*z>1);pts.push([x,y,z])}
    const eg=new THREE.SphereGeometry(0.035,6,5);let sea,hot=[],kxr=null;const Rk=2.4;
    g.add(new THREE.ArrowHelper(new THREE.Vector3(1,0,0),new THREE.Vector3(-3.4,0,0),6.8,0xffffff,0.25,0.12));g.add(tlabel('k_x  (tunnelling direction)',{size:.3,pos:[3.9,-0.45,0],color:'#ffffff'}));g.add(tlabel('k_⊥',{size:.3,pos:[0,3.1,0],color:'#c9d3e1'}));
    return {update(p){clearGroup(dyn);hot=[];const P=rp(p);const d=P.lv[0]-P.f*p.V;const sp=new THREE.Mesh(new THREE.SphereGeometry(Rk,48,32),new THREE.MeshBasicMaterial({color:0x5b9cff,transparent:true,opacity:.08,depthWrite:false}));dyn.add(sp);
      dyn.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.SphereGeometry(Rk,24,12)),new THREE.LineBasicMaterial({color:0x5b9cff,transparent:true,opacity:.18})));dyn.add(tlabel('Fermi sphere  k ≤ k_F',{size:.3,pos:[-2.6,-2.6,0],color:'#8fbaff',font:SANS}));
      kxr=d>=0?Math.sqrt(d/P.EF)*Rk:null;
      sea=inst(eg,'#6ea2ff',pts.length,{ei:.6});pts.forEach((q,i)=>setInst(sea,i,q[0]*Rk,q[1]*Rk,q[2]*Rk));dyn.add(sea);
      if(kxr!=null&&kxr<Rk){const rr=Math.sqrt(Rk*Rk-kxr*kxr);const disk=new THREE.Mesh(new THREE.CircleGeometry(rr,64),new THREE.MeshBasicMaterial({color:0x3fd29b,transparent:true,opacity:.45,side:THREE.DoubleSide,depthWrite:false}));disk.rotation.y=Math.PI/2;disk.position.x=kxr;dyn.add(disk);
        dyn.add(tlabel('resonance disk: π(k_F² − k_x²) ∝ E_F − (E_1 − E_C)',{size:.28,pos:[0.3,Rk+0.75,0],color:'#9ff7d0',bg:'rgba(10,15,22,.7)',depth:false,order:9}));
        pts.forEach(q=>{if(Math.abs(q[0]*Rk-kxr)<0.12){const b=ball(0.05,'#9ff7d0',{ei:1.4});b.userData={y:q[1]*Rk,z:q[2]*Rk,o:R_()};dyn.add(b);hot.push(b)}})}
      else if(kxr!=null){const pl_=new THREE.Mesh(new THREE.PlaneGeometry(4,4),new THREE.MeshBasicMaterial({color:0xf6b23c,transparent:true,opacity:.15,side:THREE.DoubleSide,depthWrite:false}));pl_.rotation.y=Math.PI/2;pl_.position.x=Math.min(kxr,3.3);dyn.add(pl_);dyn.add(tlabel('k_x > k_F: plane misses the sphere (E_1 > E_F)',{size:.26,pos:[0,-3,0],color:'#ffc76a',font:SANS}))}
      else dyn.add(tlabel('E_1 < E_C: k_x² < 0 — no real plane, injection forbidden',{size:.28,pos:[0,-3,0],color:'#ff9ab4',font:SANS}));
      S.r={d,kx:kxr!=null?kxr/Rk:null}},
      tick(t){hot.forEach(b=>{const u=MOTION?(t*0.4+b.userData.o)%1:0;b.position.set((kxr||0)+u*1.6,b.userData.y,b.userData.z);b.material.opacity=1-u})}}},
  read(p,S){const r=S.r||{};const P=rp(p);return [['E₁ − E_C',(r.d*1000).toFixed(0)+' meV',r.d<0?'bad':r.d<=P.EF?'good':'warn'],['k_x / k_F',r.kx!=null?r.kx.toFixed(3):'imaginary'],['disk area / πk_F²',r.kx!=null&&r.kx<1?(1-r.kx*r.kx).toFixed(3):'0']]}
});

/* Fabry–Perot cavity */
VIEWS.rFabry=V3({title:'Optical Fabry–Perot cavity (matter-wave analogue)',sub:'T = 1/[1 + F sin²(δ/2)], F = 4R/(1−R)², δ = 4πL/λ — sharp transmission at resonance',home:{r:12,th:0.55,ph:1.2,t:[0,0,0]},
  params:[R('lam','Wavelength $λ$ (relative to 2L/m)',0.8,1.2,0.0005,1,'',{f:v=>v.toFixed(4)}),R('Rm','Mirror reflectivity $R$',0.3,0.98,0.01,0.85,'',{f:v=>v.toFixed(2)})],
  build(S){const g=S.root,dyn=new THREE.Group();g.add(dyn);let inc,cav,tr,P_={};
    [-1.5,1.5].forEach(x=>{const m_=new THREE.Mesh(new THREE.BoxGeometry(0.12,3,3),mat('#cfd8e6',{metalness:.8,roughness:.15,transparent:true,opacity:.55}));m_.position.x=x;g.add(m_)});
    g.add(tlabel('mirror ↔ barrier',{size:.28,pos:[-1.5,1.9,0],color:'#c9d3e1',font:SANS}));g.add(tlabel('cavity ↔ quantum well',{size:.28,pos:[0,-1.9,0],color:'#3fd29b',font:SANS}));
    const mk=(n)=>{const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3));const l=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xffe08a}));g.add(l);return l};
    inc=mk(200);cav=mk(200);tr=mk(200);
    return {update(p){clearGroup(dyn);const F=4*p.Rm/(1-p.Rm)**2,d=2*Math.PI/p.lam*2,T=1/(1+F*Math.sin(d/2)**2);P_={T,F,lam:p.lam,Rm:p.Rm};dyn.add(tlabel('T = '+T.toFixed(3),{size:.45,pos:[4.6,1.6,0],color:T>0.5?'#3fd29b':'#ff9ab4'}))},
      tick(t){const k=2*Math.PI/(P_.lam*1.5),w=MOTION?t*4:0,set=(l,x0,x1,A,stand)=>{const a=l.geometry.attributes.position;for(let i=0;i<200;i++){const x=lerp(x0,x1,i/199);const y=stand?A*Math.sin(k*(x+1.5))*Math.cos(w):A*Math.sin(k*x-w);a.setXYZ(i,x,y,0)}a.needsUpdate=true;l.geometry.computeBoundingSphere()};
        const T=P_.T||0;set(inc,-6,-1.5,0.8,false);set(cav,-1.5,1.5,clamp(0.8*Math.sqrt(T/(1-P_.Rm)),0.02,1.4),true);set(tr,1.5,6,0.8*Math.sqrt(T),false)}}},
  read(p){const F=4*p.Rm/(1-p.Rm)**2,T=1/(1+F*Math.sin(2*Math.PI/p.lam)**2);return [['T',T.toFixed(4),T>0.5?'good':'warn'],['finesse F',F.toFixed(1)],['analogue','photon ↔ electron · mirror ↔ barrier']]}
});

/* surfaces */
VIEWS.rTs={...surfView({title:'log₁₀ T(E) landscape',sub:'Ridges are resonances; they move down as the well widens (E_n ∝ 1/W²) or as bias increases',
  params:[SEL('ax','Second axis',[['W','well width W'],['V','bias V'],['d','barrier thickness d_B']],'W'),R('E','Marker $E$',0.005,0.55,0.001,0.1,'eV',{f:v=>(v*1000).toFixed(0)+' meV'}),R('z','Marker on second axis',0,1,0.01,0.4,'',{f:v=>(v*100).toFixed(0)+' %'})],
  key:p=>p.ax,cfg:p=>({xr:[0.005,0.55],zr:p.ax==='W'?[3,9]:p.ax==='V'?[0,0.4]:[1.5,4],yr:[-8,0],xl:'E (eV)',zl:p.ax==='W'?'W (nm)':p.ax==='V'?'V (V)':'d_B (nm)',yl:'log₁₀ T',nx:200,nz:40}),
  f:(E,z,p)=>{const P=rp(p.ax==='W'?{W:z}:p.ax==='d'?{d1:z,d2:z}:{});const V=p.ax==='V'?z:0;return Math.max(-8,Math.log10(tmmT(P,E,V)+1e-12))},
  mark:p=>{const zr=p.ax==='W'?[3,9]:p.ax==='V'?[0,0.4]:[1.5,4];const z=lerp(zr[0],zr[1],p.z);return {zs:z,x:p.E,z}},
  read:p=>[['axis',p.ax==='W'?'well width':p.ax==='V'?'bias':'barrier thickness'],['ridge','resonance E_n']]})};

VIEWS.rJs={...surfView({title:'J(V) surface over temperature',sub:'Peaks stay put while the valley floor (thermionic background) rises with T',
  params:[R('T','Slice $T$',20,400,1,300,'K',{f:v=>v+' K'}),SP.jb,SP.gs],
  key:p=>p.jb+','+p.gs,cfg:()=>({xr:[0,1.2],zr:[20,400],yr:[0,5.6],xl:'V (V)',zl:'T (K)',yl:'log₁₀ J (A/cm²)',nx:90,nz:30}),
  f:(V,T,p)=>{const c=jvCurve(rp({T,jb:p.jb,gs:p.gs}));return clamp(Math.log10(jAt(c,Math.min(V,c.Vm))+1),0,5.6)},
  mark:p=>({zs:p.T}),read:p=>{const c=jvCurve(rp(p));return [['PVR at slice',isFinite(c.pvr)?c.pvr.toFixed(1)+' : 1':'—']]}})};

VIEWS.rFrc={...surfView({title:'RC limit f_RC ≈ 1/(2πR_sC_j)',sub:'Parasitic series resistance and junction capacitance cap the usable frequency',
  params:[LR('Rs','Marker $R_s$',1,100,10,'Ω',{f:v=>v.toFixed(1)+' Ω'}),LR('Cj','Marker $C_j$',1,200,20,'fF',{f:v=>v.toFixed(0)+' fF'})],
  key:()=>'x',cfg:()=>({xr:[1,100],xlog:true,zr:[1,200],zlog:true,yr:[9,14],xl:'R_s (Ω)',zl:'C_j (fF)',yl:'log₁₀ f_RC (Hz)',nx:60,nz:50}),
  f:(Rs,Cj)=>Math.log10(1/(2*Math.PI*Rs*Cj*1e-15)),mark:p=>({x:p.Rs,z:p.Cj,lab:'f_RC = '+si(1/(2*Math.PI*p.Rs*p.Cj*1e-15),'Hz')}),
  read:p=>[['f_RC',si(1/(2*Math.PI*p.Rs*p.Cj*1e-15),'Hz')],['R_s ↑ or C_j ↑','f_RC ↓']]})};
