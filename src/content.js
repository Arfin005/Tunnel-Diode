/* ================= content: every section & subsection of the guide ================= */
const r=String.raw;
const TRY=(v,set,label)=>`<button class="try" data-v="${v}" data-set="${set}">${lite(label)}</button>`;
const PAGES=[
{id:'learning-map',n:'1',t:'Learning Map',
 v:[['concept','Topic map'],['chain','Formula chain',{c:'13'}]],
 b:r`<p>The whole topic follows one chain of cause and effect. Extremely heavy doping makes the junction barrier thin; a thin barrier lets electrons <span class="kw">tunnel</span>; tunnelling produces a <span class="kw">peak</span> in current followed by a region where current <em>falls</em> as voltage rises (<span class="kw">negative differential resistance</span>, NDR). Two further currents, the <span class="kw">excess</span> current through gap states and the ordinary <span class="kw">diffusion</span> current, complete the curve, and the device is finally modelled by the circuit $R_s$, $L_s$, $C_j$, $−R$.</p>
<p>Every page in this lab follows the same rhythm: <strong>Concept ⇒ Formula ⇒ Derivation ⇒ Physical meaning ⇒ Exam tip</strong>. The right-hand stage shows each idea as a live 3D scene or an interactive plot. The tabs above the stage list every visualisation available for the page; the sliders underneath change the physics.</p>
<div class="co lab"><b>In the lab</b><p>The 3D topic map is clickable: click any block to jump to the page that explains it. Drag to orbit, scroll to zoom.</p>${TRY(1,'c=13','Play the full chain')}</div>
<h3>Main learning targets</h3>
<ol><li>Understand why extremely heavy doping produces quantum tunnelling.</li><li>Explain every region of the tunnel-diode $I$-$V$ characteristic.</li><li>Separate the total current into direct tunnelling, excess, and diffusion components.</li><li>Derive the excess-current equations and interpret every parameter physically.</li><li>Understand peak-to-valley ratio, temperature effects, and material dependence.</li><li>Model the diode using $L_s$, $R_s$, $C_j$, and the negative resistance $−R$.</li><li>Derive $R_{min}$, $f_r$, $f_x$, $f_{r0}$, and $f_{x0}$.</li><li>Solve numerical problems and avoid the main conceptual and exam traps.</li></ol>`},

{id:'why-special',n:'2',t:'Why a Tunnel Diode Is Special',
 v:[['wave','Wavefunction'],['junction','Junction crystal'],['trans','T vs width'],['chain','Doping chain',{c:'0'}]],
 b:r`<p>A <span class="kw">tunnel diode</span> is an extremely heavily doped $p^+ − n^+$ junction diode. Both sides are <em>degenerately</em> doped:</p>
$$\B{N_A ↑↑↑,   N_D ↑↑↑}$$
<p>where $N_A$ and $N_D$ are the acceptor and donor concentrations. Heavy doping produces the cause-effect chain</p>
$$\B{N_A, N_D ↑ ⇒ W_d ↓ ⇒ ℰ ↑ ⇒ P_{tunnel} ↑}$$
<p>where $W_d$ is the depletion width and $ℰ$ is the junction electric field. The depletion layer may be only a few nanometres wide:</p>
$$W_d ≈ 5 \t{nm to} 10 \t{nm}$$
<p>At this scale an electron must be treated as both a particle and a matter wave. Consequently it can penetrate a potential-energy barrier even when $E_{electron} &lt; E_{barrier}$. This is <span class="kw">quantum-mechanical tunnelling</span>.</p>
<div class="co idea"><b>Physical intuition</b><p>A classical ball cannot cross a hill unless its energy exceeds the hill height. An electron's wavefunction extends <em>into and through</em> a thin barrier. If the barrier is thin enough, a nonzero part of the wave appears on the other side, so the electron can be detected across the barrier without climbing over it.</p></div>
<div class="co lab"><b>In the lab</b><p>The <em>Wavefunction</em> view solves Schrödinger's equation exactly for a rectangular barrier. The ribbon is ψ(x) drawn as a rotating phasor; inside the barrier it decays exponentially, and what survives on the right is the transmitted wave. Make the barrier thicker and watch the transmitted ribbon shrink.</p>${TRY(0,'a=0.6','Thin barrier (0.6 nm)')}${TRY(0,'a=3','Thick barrier (3 nm)')}${TRY(1,'N=2e18','Light doping')}${TRY(1,'N=1.5e20','Very heavy doping')}</div>`},

{id:'ordinary-vs-tunnel',n:'2.1',t:'Ordinary diode versus tunnel diode',
 v:[['compare','I-V comparison'],['junction','Depletion width',{N:2e18}],['iv','Tunnel I-V',{V:0.15,hl:'II'}]],
 b:r`<div class="tw"><table class="t"><thead><tr><th>Property</th><th>Ordinary $p$-$n$ diode</th><th>Tunnel diode</th></tr></thead><tbody>
<tr><td><strong>Doping</strong></td><td>Moderate</td><td>Extremely high, $p^+ − n^+$</td></tr>
<tr><td><strong>Depletion width</strong></td><td>Relatively wide</td><td>Extremely narrow</td></tr>
<tr><td><strong>Main low-voltage current</strong></td><td>Minority-carrier diffusion</td><td>Quantum tunnelling</td></tr>
<tr><td><strong>Minority-carrier storage</strong></td><td>Significant</td><td>Very small</td></tr>
<tr><td><strong>Negative differential resistance</strong></td><td>No</td><td>Yes</td></tr>
<tr><td><strong>Typical operation</strong></td><td>Rectification and switching</td><td>Microwave oscillation, amplification, ultrafast switching</td></tr></tbody></table></div>
<p>The defining small-signal property of the tunnel diode is</p>
$$\B{\f{dI}{dV} &lt; 0}$$
<p>which is called <span class="kw">negative differential resistance</span> or <span class="kw">NDR</span>.</p>
<div class="co lab"><b>In the lab</b><p>The comparison plot overlays both diodes on the same axes. The tunnel diode conducts at almost zero bias, falls in the NDR window, and even conducts heavily in reverse (reverse tunnelling), while the ordinary diode stays off until about 0.6 V.</p>${TRY(0,'V=0.2','Bias inside the NDR window')}${TRY(0,'logy=1','Log |I| view')}${TRY(1,'N=2e18','Moderate doping: wide W_d')}${TRY(1,'N=1.5e20','Tunnel-diode doping')}</div>`},

{id:'iv-characteristic',n:'3',t:'Complete Current-Voltage Characteristic',
 v:[['iv','I-V curve'],['iv3','I-V surface'],['comp3','Current curtains']],
 b:r`<p>The important points on the forward curve are</p>
$$\B{P(V_P, I_P)}   \t{and}   \B{V(V_V, I_V)}$$
<p>where $V_P$ and $I_P$ are the peak voltage and current, while $V_V$ and $I_V$ are the valley voltage and current. The forward characteristic is divided into four regions:</p>
$$\B{\t{Increasing tunnelling} ⇒ \t{NDR} ⇒ \t{excess current} ⇒ \t{diffusion current}}$$
<div class="co lab"><b>In the lab</b><p>Drag across the I-V plot to move the bias point. The readout gives $I$, the slope $G = dI/dV$, the differential resistance $r_d$, the region, and which current component dominates. The dashed curves are the three components $J_t$, $J_x$, $J_d$ that add up to the white total.</p>${TRY(0,'V=0.04;hl=I','Region I')}${TRY(0,'V=0.18;hl=II','Region II')}${TRY(0,'V=0.31;hl=III','Region III')}${TRY(0,'V=0.47;hl=IV','Region IV')}${TRY(0,'mat=GaAs','Switch to GaAs')}</div>`},

{id:'region-1',n:'3.1',t:'Region I: 0 < V < V_P — increasing tunnelling current',
 v:[['band','3D band diagram',{V:0.04}],['dos','State overlap',{V:0.04}],['iv','I-V',{V:0.04,hl:'I'}],['chain','Chain',{c:'1'}]],
 b:r`<p>At $V = 0$ tunnelling occurs equally in both directions, $I_→ = I_←$, so</p>
$$I_{net} = I_→ − I_← = 0$$
<p>When a small forward voltage is applied, occupied states on the $n^+$ side line up with empty states on the $p^+$ side:</p>
$$V ↑ ⇒ \t{occupied-empty state alignment} ↑ ⇒ \t{available transitions} ↑ ⇒ I_t ↑$$
<p>Hence</p>
$$\B{0 &lt; V &lt; V_P  ⇒  \f{dI}{dV} &gt; 0}$$
<p>At the peak point $V = V_P$, $I = I_P$, and the overlap of occupied and empty energy states is <strong>maximum</strong>.</p>
<div class="co lab"><b>In the lab</b><p>In the 3D band diagram, blue balls are electrons and amber rings are empty states in the $p^+$ valence band. Bright streaks crossing the junction are tunnelling electrons: they only travel horizontally, at energies where an occupied state faces an empty one. The <em>State overlap</em> view computes the tunnelling current from that overlap.</p>${TRY(0,'V=0','V = 0: no net flow')}${TRY(0,'V=0.05','Small forward bias')}${TRY(1,'V=0.08','Overlap near maximum')}</div>`},

{id:'region-2',n:'3.2',t:'Region II: V_P < V < V_V — negative differential resistance',
 v:[['band','3D band diagram',{V:0.15}],['dos','State overlap',{V:0.15}],['iv','I-V & tangent',{V:0.15,hl:'II'}],['chain','Chain',{c:'2'}]],
 b:r`<p>After the peak voltage, the occupied states on one side and the empty states on the other move <em>out of alignment</em>:</p>
$$V ↑ ⇒ \t{band-state overlap} ↓ ⇒ \t{tunnelling electrons} ↓ ⇒ I_t ↓$$
<p>Thus</p>
$$\B{V ↑  \t{but}  I ↓}  ⇒  \B{\f{dI}{dV} &lt; 0}$$
<p>The differential resistance is</p>
$$\B{r_d = \f{dV}{dI} = (\f{dI}{dV})^{−1} &lt; 0}$$
<div class="co trap"><b>Critical conceptual trap</b><p>Negative differential resistance does <strong>not</strong> mean the terminal voltage or current is negative. In the NDR region $V &gt; 0$ and $I &gt; 0$, but for a small change $ΔV &gt; 0$, $ΔI &lt; 0$, so $r_d ≈ ΔV/ΔI &lt; 0$.</p></div>
<div class="co idea"><b>Simple analogy</b><p>Imagine an unusual water valve. You open it further, but the internal passage becomes less aligned, so the flow decreases. The opening corresponds to $V$, the flow to $I$. In the NDR region, $V ↑$ but $I ↓$.</p></div>
<div class="co lab"><b>In the lab</b><p>The tangent at the bias point turns pink when its slope is negative. In the band diagram, raise $V$ and watch the tunnelling streaks thin out as the filled $n^+$ band slides above the empty $p^+$ states.</p>${TRY(2,'V=0.1;hl=II','Steepest negative slope')}${TRY(0,'V=0.15','Overlap shrinking')}${TRY(0,'V=0.2','Overlap gone')}</div>`},

{id:'region-3',n:'3.3',t:'Region III: near V = V_V — excess-current region',
 v:[['band','Band + gap states',{V:0.3,gap:true}],['iv','I-V components',{V:0.31,hl:'III',comp:true}],['comp3','Current curtains',{V:0.31}]],
 b:r`<p>For an ideal tunnel diode, direct tunnelling would fall to about zero when</p>
$$\B{V ≥ V'_n + V'_p}$$
<p>because the direct band-to-band overlap is lost. Ideally $J_t → 0$. In practice, however,</p>
$$J_{actual} &gt; J_{normal diffusion}$$
<p>The additional current is the <span class="kw">excess-current density</span> $J_x$. At the valley point $V = V_V$, $I = I_V$.</p>
<p>The valley current is nonzero because <strong>localized states within the forbidden gap</strong> provide indirect tunnelling routes.</p>
<div class="co lab"><b>In the lab</b><p>The violet octahedra in the band diagram are localized gap states. At this bias the filled $n^+$ conduction band sits completely above the $p^+$ valence band, so direct horizontal tunnelling is impossible; the gap states are the only bridge.</p>${TRY(0,'V=0.3;gap=1','Show gap states')}${TRY(0,'V=0.3;route=1','Show an excess route')}${TRY(1,'V=0.31;hl=III;logy=1','Valley on a log axis')}</div>`},

{id:'region-4',n:'3.4',t:'Region IV: V > V_V — ordinary diffusion-current region',
 v:[['iv','I-V (log)',{V:0.5,hl:'IV',logy:true}],['jd','Diffusion law',{V:0.45}],['band','Band diagram',{V:0.5}]],
 b:r`<p>At higher forward voltage, normal minority-carrier injection dominates:</p>
$$J_d = J_0 [\t{exp}(\f{qV}{kT}) − 1]$$
<p>For appreciable forward bias, $\t{exp}(qV/kT) ≫ 1$, so</p>
$$\B{J_d ≈ J_0 \t{exp}(\f{qV}{kT})}$$
<p>Therefore $V ↑ ⇒ J_d ↑↑↑$ — the current climbs exponentially, exactly like an ordinary diode.</p>
<div class="co lab"><b>In the lab</b><p>On a log current axis the diffusion branch becomes a straight line with slope $1/(kT/q)$, about one decade every 60 mV at room temperature.</p>${TRY(0,'V=0.55;hl=IV;logy=1','Deep in region IV')}${TRY(1,'V=0.1','Small V: the −1 matters')}</div>`},

{id:'components',n:'4',t:'Three Current Components',
 v:[['comp3','Current curtains'],['dom','Dominance'],['iv','I-V components',{comp:true}]],
 b:r`<p>The complete static current density is</p>
$$\B{J = J_t + J_x + J_d}$$
<ul><li>$J_t$ = direct band-to-band tunnelling current density,</li><li>$J_x$ = excess or defect-assisted tunnelling current density,</li><li>$J_d$ = ordinary minority-carrier diffusion current density.</li></ul>
<p>As forward voltage rises the dominant term changes: $J_t$ when $V$ is small, $J_x$ near $V ≈ V_V$, and $J_d$ for $V &gt; V_V$.</p>
<div class="co memo"><b>Memory trick: TED</b><p>$\B{\t{Tunnelling} ⇒ \t{Excess} ⇒ \t{Diffusion}}$ — as forward voltage increases, remember the sequence <strong>T-E-D</strong>.</p></div>
<div class="co lab"><b>In the lab</b><p>Each component is drawn as its own curtain, with the total at the front. Slide the glass plane through the bias range and read the three values. The <em>Dominance</em> view shows each term's share of the total.</p>${TRY(0,'V=0.05','T')}${TRY(0,'V=0.31','E')}${TRY(0,'V=0.52','D')}${TRY(1,'mat=GaAs','Dominance in GaAs')}</div>`},

{id:'excess-mechanism',n:'5',t:'Excess-Current Mechanism and Energy-Band Interpretation',
 v:[['band','Band diagram',{V:0.3,gap:true}],['route','Route diagram',{r:'1'}]],
 b:r`<p>In an energy-band diagram the <strong>horizontal</strong> direction is physical position and the <strong>vertical</strong> direction is electron energy. The symbols are:</p>
<ul><li>$E_C$: conduction-band edge; $E_V$: valence-band edge;</li><li>$E_{Fn}$: $n$-side Fermi level; $E_{Fp}$: $p$-side Fermi level;</li><li>$C$: occupied state in the $n^+$ conduction band;</li><li>$D$: available state associated with the $p^+$ valence band;</li><li>$A$ and $B$: localized defect or impurity states inside the forbidden gap.</li></ul>
<div class="co trap"><b>How to read transition arrows</b><p>A vertical downward arrow does not mean the electron physically falls downward in the device. It means $\B{\t{electron energy} ↓}$, usually through phonon emission, lattice interaction, impurity interaction or another energy-relaxation process. A horizontal or diagonal transition through the junction represents tunnelling.</p></div>
<div class="co lab"><b>In the lab</b><p>Both views use the same convention: dashed cyan segments are tunnelling (horizontal), wavy red segments are energy loss (vertical), violet is impurity-band hopping.</p>${TRY(0,'route=1','Route 1 in 3D')}${TRY(1,'r=3','Route 3 flat')}</div>`},

{id:'stepping-stones',n:'5.1',t:'Localized states as stepping stones',
 v:[['route','Route diagram',{r:'3'}],['band','Band diagram',{V:0.3,route:'3'}]],
 b:r`<p>Without intermediate gap states, the electron must cross the barrier in one step. With localized states it can use intermediate levels:</p>
$$C ⟶ A ⟶ B ⟶ D$$
<div class="co idea"><b>Stepping-stone analogy</b><p>Direct tunnelling is like jumping across a ditch in one jump. Defect-assisted tunnelling is like crossing by stepping on stones inside the ditch. The stones do not remove the ditch; they provide intermediate routes that make the total transition more probable.</p></div>
<div class="co lab"><b>In the lab</b><p>Each short hop is far more probable than one long tunnel because tunnelling probability falls exponentially with distance (see section 7).</p>${TRY(0,'r=3','C → A → B → D')}${TRY(0,'r=4','Many stones: staircase')}</div>`},

{id:'routes',n:'5.2',t:'Possible tunnelling routes',
 v:[['route','Route diagram',{r:'1'}],['band','3D band diagram',{V:0.3,route:'1'}]],
 b:r`<p>The guide lists four ways an electron at $C$ can reach an empty state $D$ once the direct overlap is gone:</p>
<div class="tw"><table class="t"><thead><tr><th>Route</th><th>Path</th><th>Steps</th></tr></thead><tbody>
<tr><td>1</td><td>$C ↓ B ⇝ D$</td><td>energy loss, then tunnel</td></tr>
<tr><td>2</td><td>$C ⇝ A ↓ D$</td><td>tunnel, then energy loss</td></tr>
<tr><td>3</td><td>$C ⇝ A → B ⇝ D$</td><td>tunnel, impurity-band hop, tunnel</td></tr>
<tr><td>4</td><td>$C → E_1 → E_2 → … → D$</td><td>staircase of tunnel and loss steps</td></tr></tbody></table></div>
<div class="co lab"><b>In the lab</b><p>Pick a route with the selector, or use the shortcuts below. The readout counts tunnelling and energy-loss steps and gives the total energy the electron must shed.</p>${TRY(0,'r=1','Route 1')}${TRY(0,'r=2','Route 2')}${TRY(0,'r=3','Route 3')}${TRY(0,'r=4','Route 4')}</div>`},

{id:'route-1',n:'5.2.1',t:'Route 1: C → B → D',
 v:[['route','Route diagram',{r:'1'}],['band','3D band diagram',{V:0.3,route:'1'}]],
 b:r`<p>The electron loses energy from state $C$ to a localized level $B$, and then tunnels from $B$ to $D$:</p>
$$\B{C ↓ B ⇝ D}$$
<p>This is considered the <strong>basic excess-current mechanism</strong>. The first step is an energy-relaxation process (phonon emission or impurity interaction), not tunnelling; only the second, horizontal step crosses the junction.</p>
<div class="co lab"><b>In the lab</b>${TRY(0,'r=1;V=0.25','Just past the valley')}${TRY(0,'r=1;V=0.45','Higher bias')}${TRY(1,'route=1','Same route in 3D')}</div>`},

{id:'route-2',n:'5.2.2',t:'Route 2: C → A → D',
 v:[['route','Route diagram',{r:'2'}],['band','3D band diagram',{V:0.3,route:'2'}]],
 b:r`<p>The electron tunnels from $C$ to a localized level $A$ and then loses energy to reach $D$:</p>
$$\B{C ⇝ A ↓ D}$$
<p>The order is reversed with respect to route 1: tunnelling first, at constant energy, into a gap state on the $p^+$ side, followed by relaxation down into the empty valence-band state.</p>
<div class="co lab"><b>In the lab</b>${TRY(0,'r=2','Animate route 2')}${TRY(1,'route=2','Same route in 3D')}</div>`},

{id:'route-3',n:'5.2.3',t:'Route 3: C → A → B → D',
 v:[['route','Route diagram',{r:'3'}],['band','3D band diagram',{V:0.3,route:'3'}]],
 b:r`<p>The electron tunnels from $C$ to $A$, moves through impurity-band states from $A$ to $B$, and tunnels from $B$ to $D$:</p>
$$\B{C ⇝ A → B ⇝ D}$$
<p>The $A → B$ part may be interpreted as <strong>impurity-band conduction accompanied by energy dissipation</strong>, which is why it runs diagonally (position and energy both change).</p>
<div class="co lab"><b>In the lab</b>${TRY(0,'r=3','Animate route 3')}${TRY(1,'route=3','Same route in 3D')}</div>`},

{id:'route-4',n:'5.2.4',t:'Route 4: staircase tunnelling',
 v:[['route','Route diagram',{r:'4'}],['band','3D band diagram',{V:0.3,route:'4'}]],
 b:r`<p>When the density of localized states is high, $D_x ↑↑$, the electron may follow a sequence</p>
$$C → E_1 → E_2 → E_3 → ⋯ → D$$
<p>The staircase contains a series of tunnelling steps and vertical energy-relaxation steps:</p>
$$\B{\t{staircase path} = ∑(\t{tunnelling transition} + \t{energy-loss transition})}$$
<div class="co lab"><b>In the lab</b><p>Each tread of the staircase is a short horizontal tunnel; each riser is a small energy loss.</p>${TRY(0,'r=4','Animate the staircase')}${TRY(1,'route=4','Staircase in 3D')}</div>`},

{id:'effective-energy',n:'6',t:'Effective Tunnelling Energy E_x',
 v:[['ex','Energy budget'],['band','Band diagram',{V:0.3,ex:true}],['chain','Chain',{c:'3'}]],
 b:r`<p>For an electron tunnelling from $B$ to $D$, the effective energy interval is</p>
$$E_x ≈ E_g + q(V'_n + V'_p) − qV ≈ q(ψ_{bi} − V)$$(23)
<ul><li>$E_g$ is the semiconductor bandgap; $q$ the magnitude of electronic charge; $V$ the applied forward voltage;</li><li>$V'_n$ and $V'_p$ describe the Fermi-level penetration into the $n$- and $p$-side bands of a degenerate junction;</li><li>$ψ_{bi}$ is the built-in junction potential.</li></ul>
<p>Because the diode is degenerately doped, $qψ_{bi} ≈ E_g + q(V'_n + V'_p)$. Forward bias opposes the built-in potential, so the effective barrier voltage is $ψ_{effective} = ψ_{bi} − V$; multiplying by charge gives $E_x = q(ψ_{bi} − V)$. Therefore</p>
$$\B{V ↑ ⇒ ψ_{bi} − V ↓ ⇒ E_x ↓ ⇒ T_t ↑ ⇒ J_x ↑}$$
<div class="co lab"><b>In the lab</b><p>The left bar shows the energy budget $E_g + q(V'_n+V'_p) = qψ_{bi}$; forward bias $qV$ eats into it and leaves $E_x$. The lower plot shows the tunnelling probability rising as $E_x$ shrinks.</p>${TRY(0,'V=0.1','Low bias')}${TRY(0,'V=0.5','High bias')}${TRY(1,'V=0.3;ex=1','E_x in the band diagram')}</div>`},

{id:'tunnelling-probability',n:'7',t:'Tunnelling Probability',
 v:[['tt3','T_t surface'],['tt','T_t sweeps'],['wave','Wavefunction']],
 b:r`<p>The tunnelling probability is approximately</p>
$$\B{T_t ≈ \t{exp}[− \f{4\s{2m*_x} E_x^{3/2}}{3qħℰ}]}$$(24)
<p>where $m*_x$ is the appropriate effective tunnelling mass, $ħ = h/(2π)$, and $ℰ$ is the junction electric field. Define</p>
$$K = \f{4\s{2m*_x} E_x^{3/2}}{3qħℰ}   ⇒   \B{T_t = e^{−K}}$$
<p>Because the dependence is exponential, a modest change in $K$ may cause an enormous change in current.</p>
<div class="co lab"><b>In the lab</b><p>The surface plots $\t{log}_{10} T_t$ over $E_x$ and $ℰ$, computed from equation (24) in SI units. Move the marker and watch $K$ and $T_t$ in the readout. The readout also lists how much $T_t$ changes when each variable doubles.</p>${TRY(0,'E=0.3;F=4','Easy: low barrier, strong field')}${TRY(0,'E=1.1;F=0.6','Hard: high barrier, weak field')}</div>`},

{id:'effective-mass',n:'7.1',t:'Effect of effective mass',
 v:[['tt','T_t vs m*',{sw:'m'}],['wave','Wavefunction',{m:0.07}],['chain','Chain',{c:'4'}]],
 b:r`$$m*_x ↑ ⇒ \s{m*_x} ↑ ⇒ K ↑ ⇒ T_t ↓$$
<p>Hence</p>
$$\B{\t{lighter effective mass} ⇒ \t{easier tunnelling}}$$
<p>This is one reason direct-gap III-V materials with light conduction-band masses (GaAs, GaSb) make good tunnel diodes.</p>
<div class="co lab"><b>In the lab</b>${TRY(0,'sw=m;m=0.03','Light mass')}${TRY(0,'sw=m;m=0.4','Heavy mass')}${TRY(1,'m=0.03','Wave with light mass')}${TRY(1,'m=0.6','Wave with heavy mass')}</div>`},

{id:'barrier-energy',n:'7.2',t:'Effect of barrier energy',
 v:[['tt','T_t vs E_x',{sw:'E'}],['tt3','T_t surface'],['chain','Chain',{c:'5'}]],
 b:r`$$E_x ↑ ⇒ E_x^{3/2} ↑ ⇒ K ↑ ⇒ T_t ↓↓$$
<p>Conversely, $E_x ↓ ⇒ T_t ↑↑$. The 3/2 power makes $T_t$ more sensitive to barrier energy than to mass: doubling $E_x$ multiplies $K$ by $2^{3/2} ≈ 2.83$.</p>
<div class="co lab"><b>In the lab</b>${TRY(0,'sw=E;E=0.3','Low barrier')}${TRY(0,'sw=E;E=1.1','High barrier')}</div>`},

{id:'electric-field',n:'7.3',t:'Effect of electric field',
 v:[['tt','T_t vs ℰ',{sw:'F'}],['junction','Junction crystal'],['chain','Chain',{c:'0'}]],
 b:r`$$ℰ ↑ ⇒ K ↓ ⇒ T_t ↑$$
<p>Since approximately $ℰ ≈ ΔV / W_d$, we obtain</p>
$$\B{N_A, N_D ↑ ⇒ W_d ↓ ⇒ ℰ ↑ ⇒ T_t ↑}$$
<div class="co lab"><b>In the lab</b><p>In the junction crystal the pink field arrows get denser as doping squeezes the depletion layer.</p>${TRY(0,'sw=F;F=0.6','Weak field')}${TRY(0,'sw=F;F=4','Strong field')}${TRY(1,'N=3e18','Moderate doping')}${TRY(1,'N=1.5e20','Heavy doping')}</div>`},

{id:'excess-current',n:'8',t:'Excess-Current Density',
 v:[['jx3','J_x surface'],['lnjx','ln J_x line']],
 b:r`<p>Let $D_x$ be the volume density of occupied localized states near the relevant gap level. Then</p>
$$\B{J_x ≈ C_2 D_x T_t}$$(25)
<p>where $C_2$ is a proportionality constant. This follows the general engineering principle</p>
$$\B{\t{current} ∝ \t{number of available carriers or states} × \t{transition probability}}$$
<p>Therefore $D_x ↑ ⇒ J_x ↑$ and $T_t ↑ ⇒ J_x ↑$. Substitution of the tunnelling relations gives</p>
$$\B{J_x ≈ C_2 D_x \t{exp}\{−C_3[E_g + q(V'_n + V'_p) − qV]\}}$$(26)
<p>where $C_3$ is another constant. The exponent may be rearranged as $−C_3[E_g + q(V'_n + V'_p)] + C_3qV$, hence $J_x ∝ \t{exp}(C_3qV)$ and</p>
$$\B{V ↑ ⇒ J_x ↑ \t{exponentially}}$$
<p>provided the approximation $qV ≪ E_g$ remains valid.</p>
<div class="co lab"><b>In the lab</b><p>The surface is $\t{log}_{10} J_x$ over bias and defect density: linear in $D_x$ (a constant shift on a log axis), exponential in $V$ (a straight slope).</p>${TRY(0,'D=0.2','Clean crystal')}${TRY(0,'D=8','Defective crystal')}</div>`},

{id:'valley-normalized',n:'8.1',t:'Valley-normalized excess-current equation',
 v:[['lnjx','ln J_x line'],['iv','I-V components',{V:0.31,comp:true,logy:true}]],
 b:r`<p>The excess current may be rewritten as</p>
$$\B{J_x = J_V \t{exp}[C_4(V − V_V)]}$$(27)
<p>At $V = V_V$: $J_x = J_V e^{0} = J_V$ — the expression is automatically anchored at the valley point. Taking the natural logarithm,</p>
$$\t{ln} J_x = C_4V + (\t{ln} J_V − C_4V_V)$$
<p>This is a straight line $y = mx + c$, so a plot of $\t{ln} J_x$ against $V$ has slope $\B{d(\t{ln} J_x)/dV = C_4}$. Differentiating (27): $dJ_x/dV = C_4J_x$, which is positive for $C_4 &gt; 0$.</p>
<div class="co trap"><b>Important conclusion</b><p>The excess current does <strong>not</strong> itself create negative differential resistance. The NDR is produced primarily by the decrease of direct band-to-band tunnelling current after the peak.</p></div>
<div class="co lab"><b>In the lab</b><p>The slope triangle measures $C_4$ directly; change $C_4$ and the line pivots about the valley anchor.</p>${TRY(0,'C4=4','Shallow slope')}${TRY(0,'C4=16','Steep slope')}</div>`},

{id:'diffusion',n:'9',t:'Ordinary Diffusion Current',
 v:[['jd','Diffusion law'],['jd3','J_d surface']],
 b:r`<p>The conventional minority-carrier current is</p>
$$\B{J_d = J_0[\t{exp}(\f{qV}{kT}) − 1]}$$(28)
<p>where $J_0$ is the reverse saturation current density, $k$ is Boltzmann's constant and $T$ is absolute temperature. For appreciable forward bias $\t{exp}(qV/kT) ≫ 1$, so</p>
$$\B{J_d ≈ J_0 \t{exp}(\f{qV}{kT})}$$
<p>This explains why the $−1$ term is omitted in the approximate total-current equation.</p>
<div class="co lab"><b>In the lab</b><p>The lower panel shows the error made by dropping $−1$: it equals $1/(e^{qV/kT} − 1)$, below 1 % once $V &gt; 0.12$ V at room temperature.</p>${TRY(0,'V=0.05','Tiny bias: approximation fails')}${TRY(0,'V=0.3','Approximation excellent')}${TRY(0,'T=400','Hot device')}</div>`},

{id:'static-equation',n:'10',t:'Complete Static Current Equation',
 v:[['eqlab','Equation lab'],['comp3','Current curtains']],
 b:r`<p>The total current density is $J = J_t + J_x + J_d$. A common analytical model is</p>
$$\B{J = \f{J_PV}{V_P}\t{exp}(1 − \f{V}{V_P}) + J_V\t{exp}[C_4(V − V_V)] + J_0\t{exp}(\f{qV}{kT})}$$(29)
<div class="co lab"><b>In the lab</b><p>Every constant in equation (29) has its own slider. The readout reports the peak, valley and PVR that the equation actually produces, plus the minimum negative resistance found numerically.</p>${TRY(0,'Jv=2.5','Raise J_V: valley lifts')}${TRY(0,'Jv=0.3','Lower J_V: deep valley')}${TRY(0,'lJ0=-5.5','Raise J_0: diffusion arrives early')}</div>`},

{id:'tunnelling-term',n:'10.1',t:'Direct tunnelling-current term',
 v:[['deriv','J_t term',{d:false}],['eqlab','Equation lab']],
 b:r`<p>The direct tunnelling-current component is</p>
$$\B{J_t = \f{J_PV}{V_P}\t{exp}(1 − \f{V}{V_P})}$$
<p>At $V = 0$: $J_t = 0$, so $\B{J_t(0) = 0}$. At $V = V_P$:</p>
$$J_t = \f{J_PV_P}{V_P}e^{1−1} = J_Pe^0 = J_P   ⇒   \B{J_t(V_P) = J_P}$$
<p>The linear factor $V/V_P$ makes the current start from zero; the exponential factor $e^{1−V/V_P}$ eventually kills it. The product rises, peaks exactly at $V_P$ and decays.</p>
<div class="co lab"><b>In the lab</b>${TRY(0,'Vp=0.035','Small V_P')}${TRY(0,'Vp=0.15','Large V_P')}</div>`},

{id:'maximum-at-vp',n:'10.2',t:'Why the expression produces a maximum at V_P',
 v:[['deriv','J_t and slope',{d:true}]],
 b:r`<p>Differentiate using the product rule:</p>
$$\f{dJ_t}{dV} = \f{J_P}{V_P}e^{1−V/V_P} + \f{J_PV}{V_P}e^{1−V/V_P}(−\f{1}{V_P}) = \f{J_P}{V_P}e^{1−V/V_P}(1 − \f{V}{V_P})$$
$$\B{\f{dJ_t}{dV} = \f{J_P}{V_P}e^{1−V/V_P}(1 − \f{V}{V_P})}$$
<p>At $V = V_P$, $1 − V_P/V_P = 0$, so $dJ_t/dV|_{V=V_P} = 0$. For $V &lt; V_P$ the bracket is positive and $dJ_t/dV &gt; 0$; for $V &gt; V_P$ it is negative and $dJ_t/dV &lt; 0$. Therefore</p>
$$\B{V &lt; V_P ⇒ J_t ↑}    \B{V &gt; V_P ⇒ J_t ↓}$$
<div class="co lab"><b>In the lab</b><p>The lower panel is the derivative: green where positive, pink where negative, crossing zero exactly at $V_P$. The orange line marks the inflection at $2V_P$, where the slope is most negative — this is where $R_{min}$ comes from (section 16.1).</p>${TRY(0,'V=0.05','Exactly at V_P')}${TRY(0,'V=0.1','At 2V_P: steepest fall')}</div>`},

{id:'negative-slope',n:'10.3',t:'Exact condition for a negative total slope',
 v:[['slope','Slope balance'],['iv','I-V tangent',{V:0.2,hl:'II'}]],
 b:r`<p>The total differential conductance is</p>
$$\f{dJ}{dV} = \f{dJ_t}{dV} + \f{dJ_x}{dV} + \f{dJ_d}{dV}$$
<p>Inside the NDR region $dJ_t/dV &lt; 0$, $dJ_x/dV &gt; 0$ and $dJ_d/dV &gt; 0$. Therefore the total slope is negative only when</p>
$$\B{|\f{dJ_t}{dV}| &gt; \f{dJ_x}{dV} + \f{dJ_d}{dV}}$$
<p>As voltage increases further, $J_t$ keeps decreasing while $J_x$ and $J_d$ rise. Eventually $dJ_x/dV + dJ_d/dV &gt; |dJ_t/dV|$, so the total slope becomes positive again after the valley.</p>
<div class="co lab"><b>In the lab</b><p>The shaded window is where the blue curve beats the amber one. Scale the excess current up and watch the NDR window shrink — too many gap states can erase NDR entirely.</p>${TRY(0,'k=4','4× excess current')}${TRY(0,'k=0.3','Clean device')}</div>`},

{id:'dominant-current',n:'11',t:'Dominant Current in Each Voltage Region',
 v:[['dom','Dominance'],['comp3','Current curtains']],
 b:r`<div class="tw"><table class="t"><thead><tr><th>Voltage region</th><th>Dominant current</th><th>Physical behaviour</th></tr></thead><tbody>
<tr><td>$0 &lt; V &lt; V_P$</td><td>Direct tunnelling $J_t$</td><td>Current rises as state overlap increases</td></tr>
<tr><td>$V_P &lt; V &lt; V_V$</td><td>Falling direct tunnelling $J_t$</td><td>Negative differential resistance</td></tr>
<tr><td>$V ≈ V_V$</td><td>Excess current $J_x$</td><td>Defect-assisted valley-current floor</td></tr>
<tr><td>$V &gt; V_V$</td><td>Diffusion current $J_d$</td><td>Exponential ordinary-diode rise</td></tr></tbody></table></div>
<div class="co lab"><b>In the lab</b><p>The stacked area shows the fraction of the total carried by each component; the region labels sit on top.</p>${TRY(0,'V=0.03','Row 1')}${TRY(0,'V=0.2','Row 2')}${TRY(0,'V=0.31','Row 3')}${TRY(0,'V=0.5','Row 4')}</div>`},

{id:'pvr',n:'12',t:'Peak-to-Valley Current Ratio',
 v:[['bars','Material bars'],['norm','Normalised curves']],
 b:r`<p>The peak-to-valley current ratio is</p>
$$\B{\t{PVR} = \f{I_P}{I_V}}$$
<p>A high PVR means a large peak tunnelling current, a small valley current, a stronger NDR region, better switching contrast, and improved oscillator and amplifier performance. Approximate values quoted in the guide:</p>
<div class="tw"><table class="t"><thead><tr><th>Material</th><th>Approximate $I_P/I_V$</th></tr></thead><tbody><tr><td>Si</td><td class="num">4 : 1</td></tr><tr><td>Ge</td><td class="num">8 : 1</td></tr><tr><td>GaSb</td><td class="num">12 : 1</td></tr><tr><td>GaAs</td><td class="num">28 : 1</td></tr></tbody></table></div>
<p>Thus, for the stated data, $\B{\t{GaAs} &gt; \t{GaSb} &gt; \t{Ge} &gt; \t{Si}}$ in peak-to-valley ratio.</p>
<div class="co trap"><b>Normalized-graph trap</b><p>When a graph uses the normalized vertical axis $I/I_P$, the curves compare shape and peak-to-valley ratio. They do not directly compare the absolute peak current of different materials.</p></div>
<div class="co lab"><b>In the lab</b><p>The material models here are tuned so each reproduces the quoted PVR exactly. Toggle normalisation off in the second view to see why the trap matters.</p>${TRY(1,'norm=1','Normalised I/I_P')}${TRY(1,'norm=0','Absolute current')}</div>`},

{id:'peak-control',n:'12.1',t:'What controls the peak current?',
 v:[['ipdop','Doping chain'],['chain','Chain',{c:'6'}]],
 b:r`<p>The peak current depends on</p>
$$I_P = f(N_A, N_D, m*, E_g, W_d, \t{profile sharpness})$$
<p>The main chain is</p>
$$\B{N_A, N_D ↑ ⇒ W_d ↓ ⇒ ℰ ↑ ⇒ T_t ↑ ⇒ I_P ↑}$$
<div class="co lab"><b>In the lab</b><p>Three linked panels follow the chain for a symmetric abrupt Ge junction: depletion width from Poisson's equation, peak field, then tunnelling probability from equation (24). The shaded band marks the 5–10 nm range typical of tunnel diodes.</p>${TRY(0,'N=3e18','N = 3×10¹⁸ cm⁻³')}${TRY(0,'N=1e20','N = 10²⁰ cm⁻³')}</div>`},

{id:'valley-control',n:'12.2',t:'What controls the valley current?',
 v:[['defect','Defect sweep'],['chain','Chain',{c:'7'}]],
 b:r`<p>The valley current depends strongly on the concentration and distribution of localized states in the forbidden gap:</p>
$$D_x ↑ ⇒ J_x ↑ ⇒ I_V ↑$$
<p>Therefore</p>
$$\B{\t{defect density} ↑ ⇒ \f{I_P}{I_V} ↓}$$
<div class="co lab"><b>In the lab</b>${TRY(0,'D=0.1','Very clean')}${TRY(0,'D=1','Reference Ge')}${TRY(0,'D=20','Heavily defective')}</div>`},

{id:'improve-pvr',n:'12.3',t:'How to improve PVR',
 v:[['pvr3','PVR landscape'],['profile','Profile & defects']],
 b:r`<p>A high PVR requires $\B{I_P ↑ + I_V ↓}$. This is achieved by</p>
$$\B{\t{high doping} + \t{sharp doping profile} + \t{low defect density}}$$
<div class="co memo"><b>Memory formula</b><p>$\B{\t{Sharp junction} ⇒ I_P ↑}$    $\B{\t{Clean crystal} ⇒ I_V ↓}$</p></div>
<div class="co lab"><b>In the lab</b><p>The landscape plots PVR over doping and defect density; the summit is the corner with heavy doping and few defects.</p>${TRY(0,'N=1.5e20;D=0.06','Summit')}${TRY(0,'N=6e18;D=8','Valley floor')}</div>`},

{id:'temperature',n:'13',t:'Temperature Effect on Peak Current',
 v:[['temp','I-V vs T'],['temp3','I(V,T) surface'],['chain','Chain',{c:'8'}]],
 b:r`<p>The peak tunnelling current depends mainly on a state-overlap or density factor $D$ and on the bandgap $E_g$. Generally</p>
$$\B{\f{dE_g}{dT} &lt; 0}$$
<p>Therefore $T ↑ ⇒ E_g ↓ ⇒ \t{barrier energy} ↓ ⇒ T_t ↑ ⇒ I_P ↑$. For very heavily doped tunnel diodes the temperature effect on $D$ is relatively small, so bandgap reduction dominates: $\B{\t{high doping} ⇒ T ↑ ⇒ I_P ↑}$. For more lightly doped devices the decrease of $D$ with temperature may dominate: $T ↑ ⇒ D ↓ ⇒ I_P ↓$. Thus</p>
$$\B{\f{dI_P}{dT} \t{may be positive or negative, depending on doping and material}}$$
<p>The guide also notes that electron bombardment and pressure affect the $I$-$V$ characteristic; detailed equations for those effects are outside the supplied pages.</p>
<div class="co lab"><b>In the lab</b><p>$E_g(T)$ uses the Varshni law for Ge; $J_0$ scales as $T^3 \t{exp}(−E_g/kT)$, so the diffusion wall moves left quickly when hot.</p>${TRY(0,'dop=heavy;T=400','Heavy doping, hot')}${TRY(0,'dop=light;T=400','Light doping, hot')}</div>`},

{id:'fabrication',n:'14',t:'Tunnel-Diode Fabrication Techniques',
 v:[['fab','Process animation',{proc:'ball'}],['profile','Profile outcome',{proc:'alloy',L:8,D:3}]],
 b:r`<p>Every fabrication method has the same two goals: dope both sides degenerately, and make the transition between them as abrupt as possible. The guide covers the classic alloy methods, the planar process and modern low-temperature epitaxy.</p>
<div class="co lab"><b>In the lab</b><p>Pick a process from the selector; each animation loops through its stages, and the readout names the current stage.</p>${TRY(0,'proc=ball','Ball alloy')}${TRY(0,'proc=pulse','Pulse bond')}${TRY(0,'proc=planar','Planar')}${TRY(0,'proc=mbe','MBE')}${TRY(0,'proc=mocvd','MOCVD')}</div>`},

{id:'ball-alloy',n:'14.1',t:'Ball-alloy method',
 v:[['fab','Ball alloy',{proc:'ball'}]],
 b:r`<p>A small metal-alloy pellet containing a counter-dopant is placed on a heavily doped semiconductor substrate. A precisely controlled temperature-time cycle under an inert or hydrogen atmosphere allows the alloy and dopant to enter the semiconductor surface. Example:</p>
$$p^+\t{-Ge substrate} + \t{As-doped Sn ball} ⇒ n^+ \t{surface region} ⇒ n^+ − p^+ \t{tunnel junction}$$
<p>The dopant must have <strong>high solid solubility</strong> so that extremely heavy doping can be achieved.</p>`},

{id:'pulse-bond',n:'14.2',t:'Pulse-bond method',
 v:[['fab','Pulse bond',{proc:'pulse'}]],
 b:r`<p>In the pulse-bond process,</p>
$$\B{\t{contact formation} + \t{junction formation}}$$
<p>occur simultaneously. A short pulse rapidly introduces the counter-dopant from the metal alloy into the semiconductor.</p>`},

{id:'planar',n:'14.3',t:'Planar process',
 v:[['fab','Planar',{proc:'planar'}]],
 b:r`<p>Planar tunnel-diode fabrication uses solution growth, diffusion, controlled alloying and planar semiconductor technology. It improves control of junction area, surface geometry and compatibility with integrated-circuit processing.</p>`},

{id:'epitaxial',n:'14.4',t:'Modern epitaxial methods',
 v:[['fab','MBE',{proc:'mbe'}],['fab','MOCVD',{proc:'mocvd'}]],
 b:r`<p>Modern tunnel diodes commonly use <strong>low-temperature epitaxial growth</strong>, in which dopants are incorporated while the semiconductor layer is being grown. Because growth is layer by layer, the doping can switch from $p^+$ to $n^+$ within a few atomic layers.</p>`},

{id:'mbe',n:'14.4.1',t:'MBE',
 v:[['fab','MBE',{proc:'mbe'}]],
 b:r`$$\B{\t{MBE} = \t{Molecular-Beam Epitaxy}}$$
<p>It uses atomic or molecular beams under ultra-high vacuum and provides excellent thickness control, abrupt interfaces, precise doping and low contamination.</p>
<div class="co lab"><b>In the lab</b><p>Watch the shutter switch the dopant beam halfway through: the $p^+$ layer stops and the $n^+$ layer starts with no graded transition.</p></div>`},

{id:'mocvd',n:'14.4.2',t:'MOCVD',
 v:[['fab','MOCVD',{proc:'mocvd'}]],
 b:r`$$\B{\t{MOCVD} = \t{Metal-Organic Chemical Vapour Deposition}}$$
<p>Metal-organic gaseous precursors react near a heated substrate to form high-quality semiconductor layers. The method offers controlled composition, good scalability and strong suitability for compound semiconductors.</p>`},

{id:'modern-performance',n:'14.5',t:'Why modern processes improve performance',
 v:[['profile','Profile & PVR'],['chain','Peak side',{c:'9'}],['chain','Valley side',{c:'10'}]],
 b:r`<p>Modern epitaxial growth produces higher and sharper doping profiles: $\t{sharper doping} ⇒ W_d ↓ ⇒ I_P ↑$. It also produces lower defect densities: $\t{defects} ↓ ⇒ D_x ↓ ⇒ I_V ↓$. Therefore</p>
$$\B{I_P ↑,  I_V ↓  ⇒  \f{I_P}{I_V} ↑}$$
<div class="co lab"><b>In the lab</b><p>Choose a process preset: it sets a typical grading length and defect level, and the bars show the resulting peak, valley and PVR.</p>${TRY(0,'proc=alloy;L=8;D=3','Alloy junction')}${TRY(0,'proc=mbe;L=0.8;D=0.6','MBE junction')}</div>`},

{id:'equivalent-circuit',n:'15',t:'Equivalent Circuit of a Tunnel Diode',
 v:[['circ','3D circuit'],['zin','Z_{in}(f)']],
 b:r`<p>The high-frequency equivalent circuit contains four elements:</p>
$$\B{L_s,  R_s,  C_j,  −R}$$
<p>The series elements $L_s$ and $R_s$ (interconnect, lead, contact) are followed by the intrinsic parallel combination $C_j ∥ (−R)$ — the tunnel diode itself.</p>
<div class="co lab"><b>In the lab</b><p>Highlight each element in the 3D circuit for a one-line role description. Current dots split between $C_j$ and $−R$ at the junction node.</p>${TRY(0,'hl=Ls','L_s')}${TRY(0,'hl=Rs','R_s')}${TRY(0,'hl=Cj','C_j')}${TRY(0,'hl=R','−R')}</div>`},

{id:'neg-resistance',n:'15.1',t:'Negative differential resistance −R',
 v:[['iv','Tangent on I-V',{V:0.1,hl:'II',tan:true}],['gr','r_d(V)',{lo:'r'}]],
 b:r`<p>The element $−R$ represents the local small-signal resistance at a chosen DC bias inside the NDR region:</p>
$$−R = \f{dV}{dI} &lt; 0$$
<p>It is <strong>not</strong> a separate physical resistor. In most equations $R &gt; 0$ denotes the magnitude:</p>
$$\B{r_d = −R,  R &gt; 0}$$
<p>Because it is a slope, its value changes with the bias point.</p>
<div class="co lab"><b>In the lab</b>${TRY(0,'V=0.065;hl=II','Shallow slope: large R')}${TRY(0,'V=0.1;hl=II','Steepest: R = R_{min}')}</div>`},

{id:'junction-capacitance',n:'15.2',t:'Junction capacitance C_j',
 v:[['cap','Plate capacitor']],
 b:r`<p>The depletion region stores charge and behaves approximately as</p>
$$\B{C_j ≈ \f{εA}{W_d}}$$
<p>where $ε$ is semiconductor permittivity, $A$ is junction area and $W_d$ is depletion width. Thus $A ↑ ⇒ C_j ↑$ and $W_d ↓ ⇒ C_j ↑$. Because tunnel diodes have a very thin depletion region, $C_j$ can be appreciable. The capacitance is commonly specified at the <strong>valley voltage</strong>.</p>
<div class="co lab"><b>In the lab</b>${TRY(0,'W=4','Thin depletion')}${TRY(0,'W=25','Thick depletion')}${TRY(0,'A=50','Small area')}</div>`},

{id:'series-resistance',n:'15.3',t:'Series resistance R_s',
 v:[['spread','Spreading resistance']],
 b:r`<p>The total series resistance includes</p>
$$R_s = R_{lead} + R_{contact} + R_{bond} + R_{interconnect} + R_{spread}$$
<p>The semiconductor spreading resistance is approximately</p>
$$\B{R_{spread} ≈ \f{ρ}{2d}}$$
<p>where $ρ$ is resistivity and $d$ is the diameter of the diode area. Therefore $d ↑ ⇒ R_{spread} ↓$ and $ρ ↑ ⇒ R_{spread} ↑$. Dimensional check: $Ω·m / m = Ω$.</p>
<div class="co lab"><b>In the lab</b>${TRY(0,'d=3','Tiny contact')}${TRY(0,'d=40','Large contact')}</div>`},

{id:'series-inductance',n:'15.4',t:'Series inductance L_s',
 v:[['xl','X_L vs f'],['circ','3D circuit',{hl:'Ls'}]],
 b:r`<p>Series inductance arises from interconnects, wire bonds, device leads and external connecting wires. Its reactance is</p>
$$\B{X_L = ωL_s},  ω = 2πf$$
<p>Therefore $f ↑ ⇒ X_L ↑$. Even a very small inductance becomes important at microwave frequencies.</p>
<div class="co lab"><b>In the lab</b><p>The dashed pink line is the diode's $|−R|$. Where $X_L$ crosses it, the lead inductance is as large as the useful negative resistance.</p>${TRY(0,'L=5','5 pH package')}${TRY(0,'L=2000','2 nH wire lead')}</div>`},

{id:'conductance',n:'16',t:'Differential Conductance and Resistance',
 v:[['gr','G and r_d',{lo:'G'}],['iv','I-V tangent',{tan:true}]],
 b:r`<p>Differential conductance is</p>
$$\B{G = \f{dI}{dV}}$$
<p>Its sign through the characteristic is $\B{G: + ⟶ 0 ⟶ − ⟶ 0 ⟶ +}$: before the peak $G &gt; 0$; at the peak $G = 0$; between peak and valley $G &lt; 0$; at the valley $G = 0$; after the valley $G &gt; 0$. Differential resistance is</p>
$$\B{r_d = \f{dV}{dI} = (\f{dI}{dV})^{−1} = \f{1}{G}}$$
<p>so $G &gt; 0 ⇒ r_d &gt; 0$ and $G &lt; 0 ⇒ r_d &lt; 0$. At the peak and valley $G = 0$, so $\B{|r_d| → ∞}$.</p>
<div class="co trap"><b>High-value exam trap</b><p>At the peak and valley, the <strong>conductance</strong> is zero. The differential resistance is not zero; its magnitude tends to infinity: $G = 0 ⇏ r_d = 0$, $G = 0 ⇒ |r_d| → ∞$.</p></div>
<div class="co lab"><b>In the lab</b>${TRY(0,'lo=G','G(V)')}${TRY(0,'lo=r','r_d(V)')}${TRY(0,'V=0.05;lo=r','At the peak')}</div>`},

{id:'rmin-meaning',n:'16.1',t:'Meaning of R_{min}',
 v:[['gr','r_d(V)',{lo:'r',V:0.1}],['rmin','R_{min} check']],
 b:r`<p>Inside the NDR region the $I$-$V$ slope becomes most negative at an inflection point, where $|dI/dV|$ is maximum. Since $|r_d| = 1/|dI/dV|$, the magnitude of negative resistance becomes minimum there. This minimum magnitude is denoted $R_{min}$; the actual differential resistance is $−R_{min}$.</p>
<div class="co lab"><b>In the lab</b><p>For the $J_t$ term of equation (29) alone, the inflection sits exactly at $V = 2V_P$ and gives $R_{min} = e·V_P/I_P ≈ 2.72V_P/I_P$ (see the derivative view in 10.2). The excess and diffusion terms add positive slope, which pushes the true $R_{min}$ a little higher. The second view compares these with the rule of thumb in section 17.</p>${TRY(0,'lo=r;V=0.1','Mark R_{min}')}${TRY(1,'full=0','J_t only')}</div>`},

{id:'rmnf-meaning',n:'16.2',t:'Meaning of R_{mnf}',
 v:[['gr','Noise measure',{lo:'n',V:0.2}]],
 b:r`<p>A second useful bias point is sometimes identified by $R_{mnf}$, the negative-resistance magnitude corresponding to the <span class="kw">minimum noise figure</span>. It is selected from noise-performance considerations rather than from the steepest $I$-$V$ slope. Therefore</p>
$$\B{R_{mnf} \t{need not be equal to} R_{min}}$$
<p>The two serve different design objectives: $R_{min}$ → maximum magnitude of negative conductance; $R_{mnf}$ → minimum-noise operating bias.</p>
<div class="co lab"><b>In the lab</b><p>The lower panel plots the shot-noise figure of merit $qI|r_d|/2kT$ across the NDR region (shot noise grows with bias current $I$; gain improves as $|r_d|$ falls). Its minimum defines $R_{mnf}$, which lands at a lower current than the $R_{min}$ bias.</p></div>`},

{id:'rmin-approx',n:'17',t:'Approximate Minimum Negative Resistance',
 v:[['rmin3','R_{min} surface'],['rmin','Accuracy check']],
 b:r`<p>The guide gives</p>
$$\B{R_{min} ≈ \f{2V_P}{I_P}}$$(30)
<p>where $V_P$ and $I_P$ are the peak voltage and peak current. Unit check: $V/A = Ω$. The main consequence is $\B{I_P ↑ ⇒ R_{min} ↓}$ — a large peak current produces a stronger, lower-magnitude negative resistance.</p>
<div class="co lab"><b>In the lab</b>${TRY(0,'Vp=0.1;Ip=20','Worked-example values (10 Ω)')}${TRY(0,'Ip=2','Small I_P')}</div>`},

{id:'input-impedance',n:'18',t:'Derivation of the Input Impedance',
 v:[['zin','Z_{in}(f)'],['zin3','Z_{in} locus 3D'],['circ','3D circuit']],
 b:r`<p>The intrinsic parallel branch is $−R ∥ C_j$. Its admittance is</p>
$$Y_p = −\f{1}{R} + jωC_j   ⇒   Z_p = \f{1}{−1/R + jωC_j}$$
<p>Multiplying by the complex conjugate gives</p>
$$Z_p = −\f{R}{1 + (ωRC_j)^2} − j\f{ωC_jR^2}{1 + (ωRC_j)^2}$$
<p>Adding the series elements $R_s + jωL_s$ yields</p>
$$\B{Z_{in} = [R_s − \f{R}{1 + (ωRC_j)^2}] + j[ωL_s − \f{ωC_jR^2}{1 + (ωRC_j)^2}]}$$(31)
<p>Hence $ℜ\{Z_{in}\} = R_s − R/[1 + (ωRC_j)^2]$ and $ℑ\{Z_{in}\} = ωL_s − ωC_jR^2/[1 + (ωRC_j)^2]$.</p>
<div class="co lab"><b>In the lab</b><p>The 3D locus traces $(\t{log} f, ℜ, ℑ)$ at once; its wall shadows are the two curves of the 2D view.</p></div>`},

{id:'low-frequency',n:'18.1',t:'Low-frequency behaviour',
 v:[['zin','Z_{in}(f)',{f:0.2}]],
 b:r`<p>As $ω → 0$, $(ωRC_j)^2 → 0$, so $\B{Z_{in} ≈ R_s − R}$. For net negative resistance $R_s − R &lt; 0$, therefore</p>
$$\B{R &gt; R_s}$$
<p>If $R_s$ is too large, it cancels the useful negative resistance.</p>
<div class="co lab"><b>In the lab</b>${TRY(0,'Rs=1;R=10;f=0.2','R ≫ R_s')}${TRY(0,'Rs=12;R=10;f=0.2','R_s > R: no gain')}</div>`},

{id:'high-frequency',n:'18.2',t:'High-frequency behaviour',
 v:[['zin','Z_{in}(f)',{f:100}],['zin3','Z_{in} locus 3D',{f:100}]],
 b:r`<p>As $ω$ increases, $R/[1 + (ωRC_j)^2] ↓$, so the effective negative resistance is increasingly shunted by $C_j$. At the same time $ωL_s ↑$. Therefore high-frequency performance is limited by both capacitance and inductance.</p>
<div class="co memo"><b>Three-word memory trick</b><p>$\B{R_s \t{wastes},  C_j \t{shunts},  L_s \t{resonates}}$</p></div>
<div class="co lab"><b>In the lab</b>${TRY(0,'Cj=5','Large C_j: early shunting')}${TRY(0,'Ls=500','Large L_s')}</div>`},

{id:'resistive-cutoff',n:'19',t:'Resistive Cutoff Frequency f_r',
 v:[['zin','Re{Z_{in}} = 0'],['fr3','f_r surface']],
 b:r`<p>The resistive cutoff occurs when the real part of the input impedance becomes zero:</p>
$$R_s − \f{R}{1 + (ωRC_j)^2} = 0 ⇒ (ωRC_j)^2 = \f{R}{R_s} − 1 ⇒ ω_r = \f{1}{RC_j}\s{\f{R}{R_s} − 1}$$
<p>Since $ω_r = 2πf_r$,</p>
$$\B{f_r = \f{1}{2πRC_j}\s{\f{R}{R_s} − 1}}$$(32)
<p>For $f &lt; f_r$ the real part may remain negative; at $f = f_r$, $ℜ\{Z_{in}\} = 0$; above $f_r$, $ℜ\{Z_{in}\} &gt; 0$. Thus $\B{f_r = \t{highest frequency for net negative resistance}}$. For $f_r$ to be real, $R/R_s − 1 &gt; 0$, so $\B{R &gt; R_s}$ — the same condition as the low-frequency circuit.</p>
<div class="co lab"><b>In the lab</b>${TRY(1,'Rs=0.5','Low R_s')}${TRY(1,'Rs=5','High R_s')}</div>`},

{id:'reactive-cutoff',n:'20',t:'Reactive Cutoff or Self-Resonant Frequency f_x',
 v:[['zin','Im{Z_{in}} = 0'],['fx3','f_x surface']],
 b:r`<p>The reactive cutoff occurs when $ℑ\{Z_{in}\} = 0$:</p>
$$ωL_s − \f{ωC_jR^2}{1 + (ωRC_j)^2} = 0 ⇒ L_s = \f{C_jR^2}{1 + (ωRC_j)^2} ⇒ ω_x^2 = \f{1}{L_sC_j} − \f{1}{(RC_j)^2}$$
$$\B{f_x = \f{1}{2π}\s{\f{1}{L_sC_j} − \f{1}{(RC_j)^2}}}$$(33)
<p>At $f = f_x$ the input is purely resistive, which is why $f_x$ is also called the <span class="kw">self-resonant frequency</span>. For a real $f_x$, $1/(L_sC_j) &gt; 1/(R^2C_j^2)$, which gives</p>
$$\B{L_s &lt; R^2C_j}$$
<p>Therefore $L_s ↓ ⇒ f_x ↑$.</p>
<div class="co lab"><b>In the lab</b><p>The surface has a hole where $L_s ≥ R^2C_j$ — there is no real self-resonance there.</p>${TRY(1,'R=5','Small R: bigger hole')}${TRY(1,'R=50','Large R')}</div>`},

{id:'cutoff-rmin',n:'21',t:'Cutoff Frequencies at R = R_{min}',
 v:[['ladder','f_r, f_x vs bias']],
 b:r`<p>Because the negative resistance is bias dependent, $R = R(V)$, the cutoff frequencies also vary with bias. At the bias where $R = R_{min}$, the frequencies are denoted $f_{r0}$ and $f_{x0}$.</p>
<div class="co lab"><b>In the lab</b><p>Move the bias through the NDR window. $|r_d(V)|$ is computed from the I-V model, and $f_r$, $f_x$ are evaluated at every point. The $R_{min}$ bias gives the highest $f_r$ and the lowest $f_x$.</p>${TRY(0,'V=0.1','At R_{min}')}${TRY(0,'V=0.27','Near the valley')}</div>`},

{id:'max-resistive-cutoff',n:'21.1',t:'Maximum resistive cutoff frequency',
 v:[['ladder','f_r vs bias'],['fr3','f_r surface']],
 b:r`<p>Substitution of $R = R_{min}$ into equation (32) gives</p>
$$\B{f_{r0} = \f{1}{2πR_{min}C_j}\s{\f{R_{min}}{R_s} − 1}}$$(34)
<p>and $\B{f_{r0} ≥ f_r}$. Because $R_{min}$ corresponds to the strongest negative differential conductance, it gives the maximum resistive cutoff frequency.</p>
<div class="co trap"><b>Printed-equation note</b><p>The supplied page appears to omit the factor $π$ in the denominator of equation (34). Direct substitution into equation (32), together with $ω = 2πf$, requires the denominator $2πR_{min}C_j$. The omission is therefore almost certainly a typographical error.</p></div>
<div class="co lab"><b>In the lab</b><p>Strictly, $f_r(R)$ peaks at $R = 2R_s$; whenever $R_{min} &gt; 2R_s$ (true for any useful diode) the highest $f_r$ inside the NDR window is the one at $R_{min}$.</p></div>`},

{id:'min-reactive-cutoff',n:'21.2',t:'Minimum reactive cutoff frequency',
 v:[['ladder','f_x vs bias'],['fx3','f_x surface']],
 b:r`$$\B{f_{x0} = \f{1}{2π}\s{\f{1}{L_sC_j} − \f{1}{(R_{min}C_j)^2}}}$$(35)
<p>and $\B{f_{x0} ≤ f_x}$. At the $R_{min}$ bias, $f_{r0}$ is the maximum resistive cutoff and $f_{x0}$ is the minimum reactive cutoff.</p>
<div class="co lab"><b>In the lab</b>${TRY(0,'Ls=5','L_s = 5 pH')}${TRY(0,'Ls=100','L_s = 100 pH')}</div>`},

{id:'stability',n:'22',t:'Oscillation and Stability Conditions',
 v:[['stab','Stability map'],['osc','Time-domain sim',{Vb:0.15,Rs:2,L:1,Cj:2}],['chain','Chain',{c:'12'}]],
 b:r`<p>At $f = f_{x0}$ the input reactance is zero, $ℑ\{Z_{in}\} = 0$. If the real part is still negative at that frequency, the diode can sustain oscillation. The guide states that internal oscillation may occur when</p>
$$\B{f_{r0} &gt; f_{x0}}$$
<p>This means the diode still exhibits negative resistance when its reactance becomes zero. For stable operation without unwanted internal self-oscillation, the preferred ordering is</p>
$$\B{f_{x0} &gt; f_{r0}}$$
<p>For an operating frequency $f_0$, one also desires $\B{f_0 ≪ f_{r0}}$ and preferably $\B{f_0 &lt; f_{r0} &lt; f_{x0}}$. Low series inductance helps satisfy this ordering:</p>
$$L_s ↓ ⇒ f_{x0} ↑ ⇒ f_{x0} &gt; f_{r0}$$
<p>For a deliberately designed tunnel-diode oscillator, an external resonant network selects the desired oscillation frequency.</p>
<div class="co lab"><b>In the lab</b><p>The map classifies every $(L_s, R_s)$ pair. The time-domain view integrates the full nonlinear circuit (bias source, $R_s$, $L$, $C$ and the diode's I-V curve): with the bias in the NDR region and enough inductance it oscillates; with little inductance it settles.</p>${TRY(0,'Ls=3;Rs=1','Low L_s: stable')}${TRY(0,'Ls=500;Rs=1','High L_s')}${TRY(1,'Vb=0.15;Rs=2;L=2','Oscillating')}${TRY(1,'Vb=0.15;Rs=2;L=0.03','Settles (small L)')}</div>`},

{id:'speed-index',n:'23',t:'Switching Speed and Speed Index',
 v:[['sw','Switching sim'],['speed','I_P/C_j vs W_d']],
 b:r`<p>For a capacitor $\B{I = C\f{dV}{dt}}$, therefore $\B{\f{dV}{dt} = \f{I}{C}}$. For a tunnel diode the characteristic current and capacitance are represented by $I_P$ and $C_j$. Hence the speed index is</p>
$$\B{\t{Speed index} = \f{I_P}{C_j}}$$
<p>Its unit is $A/F = (C/s)/(C/V) = V/s$. Thus $I_P/C_j$ measures the approximate voltage slew capability of the junction.</p>
<div class="co lab"><b>In the lab</b><p>The switching view drives the diode with a current slightly above $I_P$: the voltage runs up the first branch, then slews across the NDR region to the diffusion branch. The readout compares the simulated 10–90 % time with $C_jΔV/I_P$.</p>${TRY(0,'Cj=0.3','Small C_j: fast')}${TRY(0,'Cj=5','Large C_j: slow')}</div>`},

{id:'narrow-depletion',n:'23.1',t:'Why a narrow depletion width improves speed',
 v:[['speed','I_P/C_j vs W_d'],['chain','Chain',{c:'11'}]],
 b:r`<p>The capacitance varies approximately as $C_j ∝ 1/W_d$, so $W_d ↓ ⇒ C_j ↑$. At first this seems harmful. However, tunnelling current increases approximately exponentially as the barrier becomes thinner:</p>
$$I_P ∝ e^{−αW_d}$$
<p>The exponential increase of $I_P$ normally dominates the approximately inverse increase of $C_j$. Therefore</p>
$$\B{W_d ↓ ⇒ I_P ↑↑ ⇒ \f{I_P}{C_j} ↑ ⇒ \t{faster switching}}$$
<div class="co trap"><b>Conceptual trap</b><p>A narrow depletion layer increases $C_j$, but it increases tunnelling current much more strongly. Therefore the overall speed index can still improve.</p></div>
<div class="co lab"><b>In the lab</b>${TRY(0,'W=4','W_d = 4 nm')}${TRY(0,'W=20','W_d = 20 nm')}</div>`},

{id:'worked-example',n:'24',t:'Worked Numerical Example',
 v:[['calc','Calculator'],['ladder','Bias sweep',{Rs:1,Cj:1,Ls:5}]],
 b:r`<p>Suppose</p>
$$V_P = 0.10 \t{V},  I_P = 20 \t{mA},  R_s = 1 Ω,  C_j = 1 \t{pF},  L_s = 5 \t{pH}$$
<p>The four sub-steps below compute $R_{min}$, $f_{r0}$, $f_{x0}$ and the speed index. The calculator on the right performs every step with the numbers substituted; change any input and all results update.</p>`},

{id:'calc-rmin',n:'24.1',t:'Calculate R_{min}',
 v:[['calc','Calculator',{st:'1'}]],
 b:r`$$R_{min} ≈ \f{2V_P}{I_P} = \f{2(0.10)}{20 × 10^{−3}} = 10 Ω$$
<p>Therefore $\B{R_{min} = 10 Ω}$ and $\B{r_d = −10 Ω}$.</p>`},

{id:'calc-fr0',n:'24.2',t:'Calculate f_{r0}',
 v:[['calc','Calculator',{st:'2'}]],
 b:r`$$f_{r0} = \f{1}{2πR_{min}C_j}\s{\f{R_{min}}{R_s} − 1} = \f{1}{2π(10)(1 × 10^{−12})}\s{\f{10}{1} − 1} = \f{3}{2π × 10^{−11}} ≈ 47.7 \t{GHz}$$
<p>Thus $\B{f_{r0} ≈ 47.7 \t{GHz}}$.</p>`},

{id:'calc-fx0',n:'24.3',t:'Calculate f_{x0}',
 v:[['calc','Calculator',{st:'3'}]],
 b:r`$$\f{1}{L_sC_j} = \f{1}{(5 × 10^{−12})(1 × 10^{−12})} = 2 × 10^{23},   \f{1}{(R_{min}C_j)^2} = \f{1}{(10 × 10^{−12})^2} = 10^{22}$$
$$f_{x0} = \f{1}{2π}\s{2 × 10^{23} − 10^{22}} = \f{1}{2π}\s{1.9 × 10^{23}} ≈ 69.4 \t{GHz}$$
<p>Hence $\B{f_{x0} ≈ 69.4 \t{GHz}}$. Comparison: $\B{f_{x0} &gt; f_{r0}}$, which is the preferred ordering for avoiding unwanted internal oscillation.</p>`},

{id:'calc-speed',n:'24.4',t:'Calculate the speed index',
 v:[['calc','Calculator',{st:'4'}],['sw','Switching sim',{Cj:1}]],
 b:r`$$\f{I_P}{C_j} = \f{20 × 10^{−3}}{1 × 10^{−12}} = 2 × 10^{10} \t{V/s} = 20 \t{V/ns}$$
<p>Therefore $\B{\t{Speed index} = 20 \t{V/ns}}$. For an ideal voltage change $ΔV = 0.1$ V,</p>
$$t ≈ \f{C_jΔV}{I_P} = \f{(1 × 10^{−12})(0.1)}{20 × 10^{−3}} = 5 \t{ps}$$
<p>A practical circuit will be slower because of external resistance, inductance, capacitance and finite source impedance.</p>`},

{id:'applications',n:'25',t:'Practical Applications',
 v:[['osc','Oscillator'],['sw','Switching'],['load','Bistable'],['amp','Amplifier']],
 b:r`<p>The supplied pages list four applications, each built on the NDR region or on the absence of minority-carrier storage.</p>
<div class="co note"><b>Source note</b><p>The supplied PDF ends partway through section 25.4 (its pages are numbered up to 28, but only 23 are present). Material after "$P_{DC} ⟶ P_{AC}$" is not covered here.</p></div>`},

{id:'microwave-oscillator',n:'25.1',t:'Microwave oscillator',
 v:[['osc','Time-domain sim',{Vb:0.15,Rs:2,L:1,Cj:2}]],
 b:r`<p>The negative resistance can compensate resonator loss:</p>
$$−R + R_{loss} ≈ 0$$
<p>This permits sustained high-frequency oscillation. Applications include microwave sources, local oscillators and radar circuits.</p>
<div class="co lab"><b>In the lab</b><p>The phase plane shows the trajectory settling onto a limit cycle wrapped around the NDR part of the I-V curve.</p>${TRY(0,'Vb=0.15;L=1;Cj=2','GHz oscillator')}${TRY(0,'Vb=0.03','Bias in region I: no oscillation')}</div>`},

{id:'high-speed-switching',n:'25.2',t:'High-speed switching',
 v:[['sw','Switching sim'],['speed','Speed vs W_d']],
 b:r`<p>Tunnelling does not require long minority-carrier storage and recombination:</p>
$$\t{storage delay} ↓↓ ⇒ \t{switching speed} ↑↑$$
<p>Tunnel diodes can switch on picosecond time scales.</p>`},

{id:'bistable-memory',n:'25.3',t:'Bistable memory circuits',
 v:[['load','Load line']],
 b:r`<p>A suitable load line can intersect the tunnel-diode characteristic at two stable operating points. These states may represent $\B{0}$ and $\B{1}$. Therefore tunnel diodes can be used in memory cells, pulse circuits and switching logic.</p>
<div class="co lab"><b>In the lab</b><p>With a large load resistor the load line cuts the curve three times: the outer points (green) are stable, the middle one in the NDR region (pink) is not.</p>${TRY(0,'Vs=0.5;RL=40','Bistable')}${TRY(0,'Vs=0.25;RL=8','Single point')}</div>`},

{id:'nr-amplifier',n:'25.4',t:'Negative-resistance amplifier',
 v:[['amp','Reflection gain']],
 b:r`<p>The diode converts DC bias power into AC signal power:</p>
$$P_{DC} ⟶ P_{AC}$$
<div class="co note"><b>Source note</b><p>The supplied PDF stops here. The reflection-gain view on the right is a standard illustration of the same idea: a negative resistance terminating a line of impedance $Z_0$ reflects more power than it receives, with $|Γ| = (R + Z_0)/(R − Z_0)$, and is stable for $R &gt; Z_0$.</p></div>`}
];
PAGES.forEach(p=>{p.lvl=p.n.split('.').length;const par=p.n.split('.').slice(0,-1).join('.');const q=PAGES.find(x=>x.n===par);if(q)p.parent=q.id});
