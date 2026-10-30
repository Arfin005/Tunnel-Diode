'use strict';
/* ================= utilities ================= */
const $=(s,r=document)=>r.querySelector(s);
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const lin=(a,b,n)=>Array.from({length:n},(_,i)=>a+(b-a)*i/(n-1));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
function si(x,unit,d=3){
  if(!isFinite(x))return '—';
  if(x===0)return '0 '+unit;
  const P=[[1e12,'T'],[1e9,'G'],[1e6,'M'],[1e3,'k'],[1,''],[1e-3,'m'],[1e-6,'µ'],[1e-9,'n'],[1e-12,'p'],[1e-15,'f'],[1e-18,'a']];
  const a=Math.abs(x);
  for(const [s,p] of P){if(a>=s*0.9995)return (+(x/s).toPrecision(d))+' '+p+unit}
  return x.toExponential(2)+' '+unit;
}
function num(x,d=3){
  if(!isFinite(x))return '—';
  const a=Math.abs(x);
  if(a!==0&&(a>=1e5||a<1e-3)){const e=Math.floor(Math.log10(a));return (x/10**e).toFixed(2)+'×10'+sup(e)}
  return String(+x.toPrecision(d));
}
function sup(n){const m={'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};return String(n).split('').map(c=>m[c]||c).join('')}
var MOTION=!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);

/* ================= tiny TeX-like math markup =================
   x_P, x_{ab}, x^2, \f{num}{den}, \s{radicand}, \t{roman text}, \B{boxed} */
function grp(s,i){
  if(s[i]!=='{')return [s[i]||'',i+1];
  let d=0,j=i;
  for(;j<s.length;j++){if(s[j]==='{')d++;else if(s[j]==='}'){d--;if(!d)break}}
  return [s.slice(i+1,j),j+1];
}
function tex(s){
  let o='',i=0;
  while(i<s.length){
    const c=s[i];
    if(c==='\\'){
      const mm=/^\\([a-zA-Z]+)/.exec(s.slice(i));
      if(!mm){o+=s[i+1]||'';i+=2;continue}
      const n=mm[1];i+=mm[0].length;
      if(n==='f'){const [a,i1]=grp(s,i);const [b,i2]=grp(s,i1);o+=`<span class="fr"><span>${tex(a)}</span><span>${tex(b)}</span></span>`;i=i2}
      else if(n==='s'){const [a,i1]=grp(s,i);o+=`<span class="sq">√<span class="sqb">${tex(a)}</span></span>`;i=i1}
      else if(n==='t'){const [a,i1]=grp(s,i);o+=`<span class="rm">${a}</span>`;i=i1}
      else if(n==='B'){const [a,i1]=grp(s,i);o+=`<span class="bx">${tex(a)}</span>`;i=i1}
      else o+=n;
    }else if(c==='&'&&/^&(lt|gt|amp);/.test(s.slice(i))){const e=/^&(lt|gt|amp);/.exec(s.slice(i))[0];o+=e;i+=e.length;
    }else if(c==='_'||c==='^'){
      let a,j;
      if(s[i+1]==='{'){[a,j]=grp(s,i+1)}else{a=s[i+1];j=i+2}
      const tg=c==='_'?'sub':'sup';o+=`<${tg}>${tex(a)}</${tg}>`;i=j;
    }else if(/[A-Za-z]/.test(c)){
      let j=i;while(j<s.length&&/[A-Za-z]/.test(s[j]))j++;
      const w=s.slice(i,j);o+=(w.length>2||w==='ln'||w==='lg')?`<span class="rm">${w}</span>`:`<i>${w}</i>`;i=j;
    }else if(/[α-ωℰψϵ]/.test(c)){o+=`<i>${c}</i>`;i++}
    else if(c==='{'){const [a,j]=grp(s,i);o+=tex(a);i=j}
    else{o+=c==='<'?'&lt;':c==='>'?'&gt;':c==='&'?'&amp;':c;i++}
  }
  return o;
}
const M=s=>`<span class="m">${tex(s)}</span>`;
function md(s){
  return s.replace(/\$\$([\s\S]+?)\$\$(?:\((\d+)\))?/g,(_,a,n)=>`<div class="eq"><div>${tex(a.trim())}</div>${n?`<span class="eqn">(${n})</span>`:''}</div>`)
          .replace(/\$([^$]+?)\$/g,(_,a)=>M(a));
}

/* ================= physics model ================= */
const KB=8.617333e-5, Q=1.602177e-19, HBAR=1.054572e-34, M0=9.10938e-31, EPS0=8.854188e-12;
const MODEL0={Ip:10,Vp:0.05,Iv:1.04,Vv:0.33,C4:6,I0:6e-8,T:300,Eg:0.66};
function mk(o){return Object.assign({},MODEL0,o)}
function vt(m){return KB*m.T}
function It(m,V){return m.Ip*(V/m.Vp)*Math.exp(1-V/m.Vp)}
function Ix(m,V){return m.Iv*Math.exp(m.C4*(V-m.Vv))}
function Id(m,V){return m.I0*(Math.exp(V/vt(m))-1)}
function Itot(m,V){return It(m,V)+Ix(m,V)+Id(m,V)}
function dI(m,V,f=Itot,h=1e-5){return (f(m,V+h)-f(m,V-h))/(2*h)}
function pv(m,Vmax){
  Vmax=Vmax||m.Vmax||1.4;
  const n=2400;let pk=null,vl=null,prev=Itot(m,1e-4),up=true;
  for(let i=1;i<=n;i++){
    const V=Vmax*i/n,I=Itot(m,V);
    if(up&&I<prev&&!pk){pk={V:Vmax*(i-1)/n,I:prev};up=false}
    else if(!up&&I>prev&&!vl){vl={V:Vmax*(i-1)/n,I:prev};break}
    prev=I;
  }
  if(!pk)pk={V:m.Vp,I:Itot(m,m.Vp)};
  if(!vl)vl={V:Vmax,I:Itot(m,Vmax)};
  // Rmin: most negative slope in NDR
  let gmin=0,vg=pk.V;
  for(let i=0;i<=400;i++){const V=lerp(pk.V,vl.V,i/400),g=dI(m,V);if(g<gmin){gmin=g;vg=V}}
  return {Vp:pk.V,Ip:pk.I,Vv:vl.V,Iv:vl.I,pvr:pk.I/vl.I,gmin,Vg:vg,Rmin:gmin<0?1000/-gmin:Infinity};
}
function region(m,V,P){
  P=P||pv(m);const d=0.12*(P.Vv-P.Vp);
  if(V<P.Vp)return 'I';if(V<P.Vv-d)return 'II';if(V<=P.Vv+d)return 'III';return 'IV';
}
const REGNAME={I:'I · rising tunnelling',II:'II · NDR',III:'III · excess current',IV:'IV · diffusion'};
/* material presets, Iv tuned at load so the model reproduces the quoted PVR */
const MATS={
  Si:{name:'Si',Eg:1.12,Ip:6,Vp:0.08,Vv:0.5,C4:5,target:4,col:'#a98bff',Vmax:1.0,I0k:1},
  Ge:{name:'Ge',Eg:0.66,Ip:10,Vp:0.05,Vv:0.33,C4:6,target:8,col:'#5b9cff',Vmax:0.6,I0k:0.6},
  GaSb:{name:'GaSb',Eg:0.73,Ip:8,Vp:0.045,Vv:0.36,C4:6,target:12,col:'#38d6e8',Vmax:0.7,I0k:1},
  GaAs:{name:'GaAs',Eg:1.42,Ip:15,Vp:0.09,Vv:0.7,C4:4,target:28,col:'#f6b23c',Vmax:1.3,I0k:1}
};
for(const k in MATS){
  const s=MATS[k];s.I0=s.I0k*1e-7*Math.exp(-(s.Eg-0.66)/0.02585);
  let lo=1e-4,hi=20;
  for(let it=0;it<60;it++){const mid=Math.sqrt(lo*hi);const r=pv(mk({...s,Iv:mid})).pvr;if(r>s.target)lo=mid;else hi=mid}
  s.Iv=Math.sqrt(lo*hi);s.m=mk(s);s.P=pv(s.m);
}
const DEF=MATS.Ge.m;
/* band-model energies (eV) used by band diagrams */
const BAND={Eg:0.66,Vn:0.10,Vp:0.10};
/* tunnelling probability (Eq. 24) — Ex in eV, field in V/m, m in m0 */
function Ttun(Ex,F,m){return Math.exp(-4*Math.sqrt(2*m*M0)*Math.pow(Ex*Q,1.5)/(3*Q*HBAR*F))}
function Kfac(Ex,F,m){return 4*Math.sqrt(2*m*M0)*Math.pow(Ex*Q,1.5)/(3*Q*HBAR*F)}
/* depletion width (nm) of symmetric abrupt junction, Ge permittivity */
function Wdep(N,Vbi=0.86,er=16){const n=N*1e6;return Math.sqrt(2*er*EPS0*Vbi/Q*(2/n))*1e9}
/* impedance of the equivalent circuit */
function Zin(f,R,Rs,C,L){const w=2*Math.PI*f,D=1+(w*R*C)**2;return {re:Rs-R/D,im:w*L-w*C*R*R/D}}
function fr(R,Rs,C){return R>Rs?Math.sqrt(R/Rs-1)/(2*Math.PI*R*C):NaN}
function fx(R,C,L){const a=1/(L*C)-1/(R*C)**2;return a>0?Math.sqrt(a)/(2*Math.PI):NaN}

/* ================= stage palette (stage is always dark) ================= */
const C={bg:'#0a0f16',grid:'rgba(140,165,200,0.10)',axis:'rgba(160,180,210,0.5)',ink:'#d6dfeb',mute:'#8191aa',
  t:'#5b9cff',x:'#f6b23c',d:'#3fd29b',tot:'#eef3fa',ndr:'#ff5c8a',vio:'#a98bff',cyan:'#38d6e8',red:'#ff6b5b',hole:'#f6b23c'};
const MONO='"IBM Plex Mono",ui-monospace,monospace', SANS='"IBM Plex Sans",system-ui,sans-serif', MATHF='"STIX Two Text","Times New Roman",serif';

/* rich canvas text: _x / _{..} subscripts, ^x / ^{..} superscripts */
function runs(s){
  const out=[];let i=0,buf='';
  const push=(t,k)=>{if(t)out.push({t,k})};
  while(i<s.length){
    const c=s[i];
    if((c==='_'||c==='^')&&i+1<s.length){
      push(buf,0);buf='';
      let a,j;if(s[i+1]==='{'){[a,j]=grp(s,i+1)}else{a=s[i+1];j=i+2}
      push(a,c==='_'?1:2);i=j;
    }else{buf+=c;i++}
  }
  push(buf,0);return out;
}
function richW(g,s,size,font,wt=''){
  let w=0;for(const r of runs(s)){g.font=`${wt} ${r.k?Math.round(size*0.7):size}px ${font}`;w+=g.measureText(r.t).width}return w;
}
function rich(g,s,x,y,o={}){
  const size=o.size||12,font=o.font||MONO,al=o.align||'left';
  g.save();g.fillStyle=o.color||C.ink;g.textBaseline='middle';
  const w=richW(g,s,size,font,o.weight||'');
  let cx=al==='center'?x-w/2:al==='right'?x-w:x;
  if(o.bg){g.fillStyle=o.bg;g.fillRect(cx-4,y-size*0.75,w+8,size*1.5);g.fillStyle=o.color||C.ink}
  for(const r of runs(s)){
    const sz=r.k?Math.round(size*0.7):size;g.font=`${o.weight||''} ${sz}px ${font}`;
    g.fillText(r.t,cx,y+(r.k===1?size*0.3:r.k===2?-size*0.38:0));cx+=g.measureText(r.t).width;
  }
  g.restore();return w;
}

/* ================= 2D plot helper ================= */
function niceStep(range,n){const raw=range/Math.max(1,n);const p=10**Math.floor(Math.log10(raw));const f=raw/p;return (f<1.5?1:f<3?2:f<7?5:10)*p}
function tickFmt(v,step){if(v===0)return '0';const d=Math.max(0,-Math.floor(Math.log10(step)+1e-9));const a=Math.abs(v);if(a>=1e4||a<1e-3)return num(v,2);return v.toFixed(Math.min(d,4))}
class P2{
  constructor(g,b,o){this.g=g;this.b=b;this.o=o;this.x=o.x;this.y=o.y}
  X(v){const [a,b]=this.x,B=this.b;if(this.o.logx)return B.x+(Math.log10(v)-Math.log10(a))/(Math.log10(b)-Math.log10(a))*B.w;return B.x+(v-a)/(b-a)*B.w}
  Y(v){const [a,b]=this.y,B=this.b;let t;if(this.o.logy){v=Math.max(v,a*1e-6);t=(Math.log10(v)-Math.log10(a))/(Math.log10(b)-Math.log10(a))}else t=(v-a)/(b-a);return B.y+B.h-t*B.h}
  ix(px){const [a,b]=this.x,B=this.b,t=(px-B.x)/B.w;return this.o.logx?10**(Math.log10(a)+t*(Math.log10(b)-Math.log10(a))):a+t*(b-a)}
  tk(r,log,n){
    if(log){const o=[];const e0=Math.ceil(Math.log10(r[0])-1e-9),e1=Math.floor(Math.log10(r[1])+1e-9);const st=Math.max(1,Math.ceil((e1-e0+1)/Math.max(2,n)));for(let e=e0;e<=e1;e+=st)o.push(10**e);return {v:o,s:1}}
    const s=niceStep(r[1]-r[0],n),o=[];for(let v=Math.ceil(r[0]/s-1e-9)*s;v<=r[1]+s*1e-9;v+=s)o.push(Math.abs(v)<s*1e-9?0:v);return {v:o,s};
  }
  frame(){
    const g=this.g,B=this.b,o=this.o;g.save();
    g.fillStyle='rgba(255,255,255,0.018)';g.fillRect(B.x,B.y,B.w,B.h);
    const xt=this.tk(this.x,o.logx,B.w/85),yt=this.tk(this.y,o.logy,B.h/48);
    g.lineWidth=1;g.strokeStyle=C.grid;
    for(const v of xt.v){const X=Math.round(this.X(v))+.5;g.beginPath();g.moveTo(X,B.y);g.lineTo(X,B.y+B.h);g.stroke()}
    for(const v of yt.v){const Y=Math.round(this.Y(v))+.5;g.beginPath();g.moveTo(B.x,Y);g.lineTo(B.x+B.w,Y);g.stroke()}
    g.strokeStyle=C.axis;g.beginPath();g.moveTo(B.x+.5,B.y);g.lineTo(B.x+.5,B.y+B.h+.5);g.lineTo(B.x+B.w,B.y+B.h+.5);g.stroke();
    if(!o.logy&&this.y[0]<0&&this.y[1]>0){const Y=Math.round(this.Y(0))+.5;g.strokeStyle='rgba(200,215,235,0.35)';g.beginPath();g.moveTo(B.x,Y);g.lineTo(B.x+B.w,Y);g.stroke()}
    g.fillStyle=C.mute;g.font=`10.5px ${MONO}`;g.textAlign='center';g.textBaseline='top';
    if(!o.noxt)for(const v of xt.v)g.fillText(o.logx?lg(v):tickFmt(v,xt.s),this.X(v),B.y+B.h+5);
    g.textAlign='right';g.textBaseline='middle';
    for(const v of yt.v)g.fillText(o.logy?lg(v):tickFmt(v,yt.s),B.x-6,this.Y(v));
    g.restore();
    if(o.xl&&!o.noxt)rich(g,o.xl,B.x+B.w/2,B.y+B.h+27,{align:'center',size:11.5,color:C.ink});
    if(o.yl){g.save();g.translate(B.x-(o.ylOff||44),B.y+B.h/2);g.rotate(-Math.PI/2);rich(g,o.yl,0,0,{align:'center',size:11.5,color:C.ink});g.restore()}
    if(o.title)rich(g,o.title,B.x+6,B.y+11,{size:11.5,color:C.ink,font:SANS,weight:600});
  }
  clip(){this.g.save();this.g.beginPath();this.g.rect(this.b.x,this.b.y,this.b.w,this.b.h);this.g.clip()}
  un(){this.g.restore()}
  curve(fn,st={}){
    const g=this.g,n=st.n||360,[a,b]=[st.x0??this.x[0],st.x1??this.x[1]];
    const xs=this.o.logx?lin(Math.log10(a),Math.log10(b),n).map(v=>10**v):lin(a,b,n);
    this.clip();g.beginPath();let pen=false;
    for(const x of xs){const y=fn(x);if(!isFinite(y)||(this.o.logy&&y<=0)){pen=false;continue}const X=this.X(x),Y=clamp(this.Y(y),-1e4,1e4);pen?g.lineTo(X,Y):g.moveTo(X,Y);pen=true}
    if(st.fill!=null){
      const base=this.Y(st.fill);g.lineTo(this.X(xs[xs.length-1]),base);g.lineTo(this.X(xs[0]),base);g.closePath();
      g.fillStyle=st.fc||hexA(st.c||C.t,st.fa??0.15);g.fill();
    }else{g.strokeStyle=st.c||C.t;g.lineWidth=st.w||2;g.setLineDash(st.dash||[]);g.globalAlpha=st.a??1;g.stroke()}
    this.un();
  }
  pts(P,st={}){const g=this.g;this.clip();g.beginPath();P.forEach(([x,y],i)=>{const X=this.X(x),Y=this.Y(y);i?g.lineTo(X,Y):g.moveTo(X,Y)});
    if(st.close)g.closePath();if(st.fc){g.fillStyle=st.fc;g.fill()}if(st.c!==null){g.strokeStyle=st.c||C.t;g.lineWidth=st.w||2;g.setLineDash(st.dash||[]);g.globalAlpha=st.a??1;g.stroke()}this.un()}
  vband(a,b,col,lab,lc){const g=this.g,B=this.b;const x0=clamp(this.X(a),B.x,B.x+B.w),x1=clamp(this.X(b),B.x,B.x+B.w);if(x1<=x0)return;g.fillStyle=col;g.fillRect(x0,B.y,x1-x0,B.h);if(lab)rich(g,lab,(x0+x1)/2,B.y+12,{align:'center',size:11,color:lc||C.ink})}
  hband(a,b,col){const g=this.g,B=this.b;const y0=clamp(this.Y(b),B.y,B.y+B.h),y1=clamp(this.Y(a),B.y,B.y+B.h);g.fillStyle=col;g.fillRect(B.x,y0,B.w,y1-y0)}
  vline(x,col,dash=[4,4],lab,w=1){const g=this.g,B=this.b,X=this.X(x);if(X<B.x-1||X>B.x+B.w+1)return;g.save();g.strokeStyle=col;g.lineWidth=w;g.setLineDash(dash);g.beginPath();g.moveTo(X,B.y);g.lineTo(X,B.y+B.h);g.stroke();g.restore();if(lab)rich(this.g,lab,X+4,B.y+B.h-10,{size:11,color:col,bg:'rgba(10,15,22,.75)'})}
  hline(y,col,dash=[4,4],lab,w=1){const g=this.g,B=this.b,Y=this.Y(y);if(Y<B.y-1||Y>B.y+B.h+1)return;g.save();g.strokeStyle=col;g.lineWidth=w;g.setLineDash(dash);g.beginPath();g.moveTo(B.x,Y);g.lineTo(B.x+B.w,Y);g.stroke();g.restore();if(lab)rich(this.g,lab,B.x+B.w-4,Y-9,{size:11,color:col,align:'right',bg:'rgba(10,15,22,.75)'})}
  dot(x,y,col,r=4.5,lab,dx=8,dy=-12,al='left'){const g=this.g,X=this.X(x),Y=this.Y(y);if(!isFinite(X)||!isFinite(Y))return;const B=this.b;if(Y<B.y-2||Y>B.y+B.h+2||X<B.x-2||X>B.x+B.w+2)return;g.save();g.fillStyle=col;g.strokeStyle='#0a0f16';g.lineWidth=2;g.beginPath();g.arc(X,Y,r,0,7);g.fill();g.stroke();g.restore();if(lab)rich(g,lab,X+dx,Y+dy,{size:11.5,color:col,align:al,bg:'rgba(10,15,22,.72)'})}
  text(x,y,s,col,al='left',size=11.5){rich(this.g,s,this.X(x),this.Y(y),{size,color:col||C.ink,align:al})}
}
function lg(v){const e=Math.round(Math.log10(v));return e===0?'1':e===1?'10':'10'+sup(e)}
function hexA(h,a){if(h.startsWith('rgba'))return h;const n=parseInt(h.slice(1),16);return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`}
function legend(g,x,y,items){let cx=x;g.save();for(const [c,l,dash] of items){g.strokeStyle=c;g.lineWidth=2.4;g.setLineDash(dash||[]);g.beginPath();g.moveTo(cx,y);g.lineTo(cx+16,y);g.stroke();g.setLineDash([]);cx+=22;cx+=rich(g,l,cx,y,{size:11,color:C.ink})+14}g.restore()}
function boxes(W,H,rows,o={}){ // split plotting area into stacked panels
  const L=o.l??62,R=o.r??18,T=o.t??46,Bm=o.b??46,gap=o.gap??30;
  const h=(H-T-Bm-gap*(rows.length-1));const tot=rows.reduce((a,b)=>a+b,0);
  let y=T;return rows.map(f=>{const b={x:L+(o.x0||0),y,w:(o.w||W)-L-R-(o.x0||0),h:h*f/tot};y+=b.h+gap;return b});
}
function arrow(g,x0,y0,x1,y1,col,w=2,head=8){g.save();g.strokeStyle=col;g.fillStyle=col;g.lineWidth=w;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();const a=Math.atan2(y1-y0,x1-x0);g.beginPath();g.moveTo(x1,y1);g.lineTo(x1-head*Math.cos(a-0.4),y1-head*Math.sin(a-0.4));g.lineTo(x1-head*Math.cos(a+0.4),y1-head*Math.sin(a+0.4));g.closePath();g.fill();g.restore()}
function rrect(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}

/* ================= 3D helpers ================= */
const HAS3D=typeof THREE!=='undefined';
function tlabel(s,o={}){
  const fs=56,cv=document.createElement('canvas'),g=cv.getContext('2d');
  const font=o.font||MONO;const w=Math.ceil(richW(g,s,fs,font,o.weight||500))+32;
  cv.width=w;cv.height=Math.round(fs*1.7);
  if(o.bg){g.fillStyle=o.bg;rrect(g,2,2,w-4,cv.height-4,14);g.fill()}
  rich(g,s,14,cv.height/2,{size:fs,color:o.color||'#d6dfeb',font,weight:o.weight||500});
  const tx=new THREE.CanvasTexture(cv);tx.minFilter=THREE.LinearFilter;tx.generateMipmaps=false;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthWrite:false,depthTest:o.depth??true}));
  const sz=o.size||0.32;sp.scale.set(sz*cv.width/cv.height,sz,1);
  if(o.center===false)sp.center.set(0,0.5);
  if(o.pos)sp.position.set(...o.pos);
  sp.renderOrder=o.order||5;return sp;
}
function clearGroup(g){for(const ch of [...g.children]){g.remove(ch);disposeObj(ch)}}
function disposeObj(o){o.traverse(n=>{if(n.geometry)n.geometry.dispose();if(n.material){(Array.isArray(n.material)?n.material:[n.material]).forEach(m=>{if(m.map)m.map.dispose();m.dispose()})}})}
function tube(pts,r,col,o={}){
  const curve=new THREE.CatmullRomCurve3(pts.map(p=>p.isVector3?p:new THREE.Vector3(...p)),false,'catmullrom',o.tension??0.0);
  const geo=new THREE.TubeGeometry(curve,o.seg||Math.max(16,pts.length*3),r,o.rs||8,false);
  const mat=new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:o.ei??0.45,roughness:.4,metalness:.1,transparent:!!o.op,opacity:o.op||1});
  return new THREE.Mesh(geo,mat);
}
function polyline(pts,col,o={}){
  const geo=new THREE.BufferGeometry().setFromPoints(pts.map(p=>p.isVector3?p:new THREE.Vector3(...p)));
  const mat=o.dash?new THREE.LineDashedMaterial({color:col,dashSize:o.dash,gapSize:o.gap||o.dash,transparent:true,opacity:o.op??1}):new THREE.LineBasicMaterial({color:col,transparent:true,opacity:o.op??1});
  const l=new THREE.Line(geo,mat);if(o.dash)l.computeLineDistances();return l;
}
function segs(arr,col,op=1){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));return new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:col,transparent:true,opacity:op}))}
function ball(r,col,o={}){return new THREE.Mesh(new THREE.SphereGeometry(r,o.seg||20,Math.round((o.seg||20)*0.7)),new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:o.ei??0.35,roughness:.35,metalness:.1,transparent:!!o.op,opacity:o.op||1}))}
function mat(col,o={}){return new THREE.MeshStandardMaterial(Object.assign({color:col,roughness:.55,metalness:.08},o))}
const CMAP=['#1b2a6b','#2559c9','#21a3d6','#3fd2b0','#b6e46a','#ffd166'];
function cmap(t){t=clamp(t,0,1)*(CMAP.length-1);const i=Math.min(CMAP.length-2,Math.floor(t));const a=new THREE.Color(CMAP[i]),b=new THREE.Color(CMAP[i+1]);return a.lerp(b,t-i)}
/* axes box: data ranges mapped onto world box centred on x/z, floor at y=0 */
function axes3(g,o){
  const [sx,sy,sz]=o.size;const out=[];
  const tkx=ticks1(o.xr,o.xlog,5),tkz=ticks1(o.zr,o.zlog,4),tky=ticks1(o.yr,o.ylog,4);
  const X=v=>-sx/2+frac(v,o.xr,o.xlog)*sx,Z=v=>-sz/2+frac(v,o.zr,o.zlog)*sz,Y=v=>frac(v,o.yr,o.ylog)*sy;
  for(const v of tkx){const x=X(v);out.push(x,0,-sz/2,x,0,sz/2, x,0,-sz/2,x,sy,-sz/2)}
  if(!o.noZ)for(const v of tkz){const z=Z(v);out.push(-sx/2,0,z,sx/2,0,z, -sx/2,0,z,-sx/2,sy,z)}
  for(const v of tky){const y=Y(v);out.push(-sx/2,y,-sz/2,sx/2,y,-sz/2, -sx/2,y,-sz/2,-sx/2,y,sz/2)}
  g.add(segs(out,0x6f86a8,0.22));
  const fr=[-sx/2,0,-sz/2,sx/2,0,-sz/2, sx/2,0,-sz/2,sx/2,0,sz/2, sx/2,0,sz/2,-sx/2,0,sz/2, -sx/2,0,sz/2,-sx/2,0,-sz/2, -sx/2,0,-sz/2,-sx/2,sy,-sz/2];
  g.add(segs(fr,0x9fb3d1,0.55));
  const fx=o.xfmt||(v=>tickFmt(v,tkx.length>1?Math.abs(tkx[1]-tkx[0]):1)),fz=o.zfmt||(v=>tickFmt(v,tkz.length>1?Math.abs(tkz[1]-tkz[0]):1)),fy=o.yfmt||(v=>tickFmt(v,tky.length>1?Math.abs(tky[1]-tky[0]):1));
  for(const v of tkx)g.add(tlabel(o.xlog?lg(v):fx(v),{size:.24,pos:[X(v),-0.05,sz/2+0.38],color:'#9fb0c8'}));
  if(!o.noZ)for(const v of tkz)g.add(tlabel(o.zlog?lg(v):fz(v),{size:.24,pos:[sx/2+0.5,-0.05,Z(v)],color:'#9fb0c8'}));
  for(const v of tky)g.add(tlabel(o.ylog?lg(v):fy(v),{size:.24,pos:[-sx/2-0.45,Y(v),-sz/2],color:'#9fb0c8'}));
  if(o.xl)g.add(tlabel(o.xl,{size:.3,pos:[0,-0.1,sz/2+0.95],color:'#e3eaf5'}));
  if(o.zl)g.add(tlabel(o.zl,{size:.3,pos:[sx/2+1.45,-0.1,0],color:'#e3eaf5'}));
  if(o.yl)g.add(tlabel(o.yl,{size:.3,pos:[-sx/2-0.4,sy+0.45,-sz/2],color:'#e3eaf5'}));
  return {X,Y,Z};
}
function frac(v,r,log){return log?(Math.log10(v)-Math.log10(r[0]))/(Math.log10(r[1])-Math.log10(r[0])):(v-r[0])/(r[1]-r[0])}
function ticks1(r,log,n){if(log){const o=[];for(let e=Math.ceil(Math.log10(r[0])-1e-9);e<=Math.floor(Math.log10(r[1])+1e-9);e++)o.push(10**e);return o}const s=niceStep(r[1]-r[0],n),o=[];for(let v=Math.ceil(r[0]/s-1e-9)*s;v<=r[1]+1e-9*s;v+=s)o.push(Math.abs(v)<1e-12?0:v);return o}
/* surface z=f(x,z) ; NaN leaves holes */
function surf(g,o){
  const nx=o.nx||64,nz=o.nz||44,size=o.size||[7,3.2,5];
  const xs=o.xlog?lin(Math.log10(o.xr[0]),Math.log10(o.xr[1]),nx).map(v=>10**v):lin(o.xr[0],o.xr[1],nx);
  const zs=o.zlog?lin(Math.log10(o.zr[0]),Math.log10(o.zr[1]),nz).map(v=>10**v):lin(o.zr[0],o.zr[1],nz);
  const V=[];let lo=Infinity,hi=-Infinity;
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){let v=o.f(xs[i],zs[j]);if(o.ylog)v=v>0?v:NaN;V.push(v);if(isFinite(v)){lo=Math.min(lo,v);hi=Math.max(hi,v)}}
  const yr=o.yr||[o.ylog?lo:Math.min(0,lo),hi*(o.ylog?1:1.0001)];
  const ax=axes3(g,{size,xr:o.xr,zr:o.zr,yr,xlog:o.xlog,zlog:o.zlog,ylog:o.ylog,xl:o.xl,yl:o.yl,zl:o.zl,xfmt:o.xfmt,zfmt:o.zfmt,yfmt:o.yfmt});
  const pos=new Float32Array(nx*nz*3),col=new Float32Array(nx*nz*3);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,v=V[k];const yy=isFinite(v)?clamp(ax.Y(v),0,size[1]):0;
    pos[k*3]=ax.X(xs[i]);pos[k*3+1]=yy;pos[k*3+2]=ax.Z(zs[j]);const c=isFinite(v)?cmap(yy/size[1]):new THREE.Color('#2a3446');col[k*3]=c.r;col[k*3+1]=c.g;col[k*3+2]=c.b}
  const idx=[];
  for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const a=j*nx+i,b=a+1,c=a+nx,d=c+1;if([a,b,c,d].every(k=>isFinite(V[k]))){idx.push(a,c,b,b,c,d)}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.setIndex(idx);geo.computeVertexNormals();
  const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.5,metalness:.05,transparent:true,opacity:.93}));
  g.add(mesh);
  const w=[],st=o.wire||4;
  for(let j=0;j<nz;j+=st)for(let i=0;i<nx-1;i++){const a=j*nx+i;if(isFinite(V[a])&&isFinite(V[a+1]))w.push(pos[a*3],pos[a*3+1]+.004,pos[a*3+2],pos[a*3+3],pos[a*3+4]+.004,pos[a*3+5])}
  for(let i=0;i<nx;i+=st)for(let j=0;j<nz-1;j++){const a=j*nx+i,b=a+nx;if(isFinite(V[a])&&isFinite(V[b]))w.push(pos[a*3],pos[a*3+1]+.004,pos[a*3+2],pos[b*3],pos[b*3+1]+.004,pos[b*3+2])}
  g.add(segs(w,0xffffff,0.16));
  return {ax,size,yr,W:(x,y,z)=>new THREE.Vector3(ax.X(x),clamp(ax.Y(y),0,size[1]),ax.Z(z))};
}
/* orbit camera */
class Orbit{
  constructor(cam,el){
    this.cam=cam;this.el=el;this.t=new THREE.Vector3();this.r=12;this.th=0.7;this.ph=1.1;this.spin=false;this.home={r:12,th:.7,ph:1.1,t:[0,0,0]};
    const P=new Map();let ld=0;this.moved=0;
    el.addEventListener('pointerdown',e=>{el.setPointerCapture(e.pointerId);P.set(e.pointerId,{x:e.clientX,y:e.clientY});this.moved=0;this.btn=e.button});
    el.addEventListener('pointermove',e=>{
      const p=P.get(e.pointerId);if(!p){this.onHover&&this.onHover(e);return}
      const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;this.moved+=Math.abs(dx)+Math.abs(dy);
      if(P.size===1){
        if(e.shiftKey||this.btn===2){const s=this.r*0.0016;const right=new THREE.Vector3().setFromMatrixColumn(cam.matrix,0),up=new THREE.Vector3().setFromMatrixColumn(cam.matrix,1);this.t.addScaledVector(right,-dx*s).addScaledVector(up,dy*s)}
        else{this.th-=dx*0.0065;this.ph=clamp(this.ph-dy*0.0065,0.06,Math.PI-0.06)}
      }else if(P.size===2){const a=[...P.values()];const d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(ld)this.r=clamp(this.r*ld/d,2,80);ld=d}
    });
    const up=e=>{if(P.has(e.pointerId)&&this.moved<6&&this.onClick)this.onClick(e);P.delete(e.pointerId);ld=0};
    el.addEventListener('pointerup',up);el.addEventListener('pointercancel',e=>{P.delete(e.pointerId);ld=0});
    el.addEventListener('wheel',e=>{e.preventDefault();this.r=clamp(this.r*Math.exp(e.deltaY*0.0011),2,80)},{passive:false});
    el.addEventListener('contextmenu',e=>e.preventDefault());
  }
  set(h){this.home=h;this.reset()}
  reset(){const h=this.home;this.r=h.r;this.th=h.th;this.ph=h.ph;this.t.set(...h.t)}
  front(){this.th=0;this.ph=Math.PI/2}
  update(dt){if(this.spin)this.th+=dt*0.25;const k=this.cam.aspect<1.35?Math.pow(1.35/this.cam.aspect,0.85):1,r=this.r*k,s=Math.sin(this.ph);this.cam.position.set(this.t.x+r*s*Math.sin(this.th),this.t.y+r*Math.cos(this.ph),this.t.z+r*s*Math.cos(this.th));this.cam.lookAt(this.t)}
}
function rng(seed){let s=seed>>>0||1;return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return ((s>>>0)%100000)/100000}}
