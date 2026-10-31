/* ================= Part 6 content: Resonant-Tunneling Diode ================= */
const r=String.raw;
const TRY=(v,set,label)=>`<button class="try" data-v="${v}" data-set="${set}">${lite(label)}</button>`;
const PAGES=[
{id:'rtd-learning-map',n:'1',t:'Learning Map',
 v:[['rconcept','Topic map'],['rchain','Flow',{c:'0'}]],
 b:r`<p>The resonant-tunneling diode is built up in one line: <strong>basic concept → quantum well → resonance → peak current → NDR → applications</strong>. Two thin barriers trap a nanometre-wide well; the well only admits certain energies; electrons whose energy matches one of them pass almost freely; and when bias pushes that level out of reach the current collapses.</p>
<div class="co lab"><b>In the lab</b><p>The topic map is clickable — each block opens its section. The stage on the right uses an exact transfer-matrix solution for transmission and the guide's own resonance formulas for current, so every slider changes real physics.</p>${TRY(1,'c=0','Play the topic flow')}</div>
<h3>Learning targets</h3>
<ol><li>Build the RTD concept from classical barriers to quantum tunneling.</li><li>Understand the GaAs/AlGaAs double-barrier heterostructure and every layer's purpose.</li><li>Derive the quantized-energy formula and interpret all proportionalities.</li><li>Explain coherent resonant transmission, sequential tunneling, resonance width and lifetime.</li><li>Derive the current-density and electron-supply expressions physically and mathematically.</li><li>Explain the complete $J$-$V$ characteristic, including points (a)–(e), peak current, valley current and multiple NDR regions.</li><li>Master the energy- and lateral-momentum-conservation argument behind current collapse.</li><li>Calculate quantized energies, resonant transmission, peak voltage, PVR and differential resistance.</li><li>Understand temperature effects, design trade-offs, applications, limitations and exam traps.</li></ol>`},

{id:'rtd-central-idea',n:'2',t:'Central Idea of the Resonant-Tunneling Diode',
 v:[['rBand3','3D band diagram'],['rStack','Layer stack'],['rchain','Resonance chain',{c:'1'}],['rchain','NDR chain',{c:'2'}]],
 b:r`<p>A <span class="kw">resonant-tunneling diode</span>, abbreviated $\B{\t{RTD}}$, is a semiconductor device containing two extremely thin barriers separated by a nanometre-scale quantum well:</p>
$$\B{\t{Barrier} | \t{Quantum well} | \t{Barrier}}$$
<p>It is therefore also called a <strong>double-barrier diode</strong>. Electrons must tunnel through both barriers. Tunneling becomes exceptionally strong when the energy of an incoming electron matches one of the permitted quantum-well states:</p>
$$\B{E = E_n}$$
<p>This matching is called <span class="kw">resonance</span>: $\B{E_{electron} ≈ E_n ⇒ \t{resonance} ⇒ T(E) ↑↑ ⇒ J ↑↑}$, where $T(E)$ is the transmission probability, $J$ the current density and $E_n$ the $n$th quantized well level. When the applied voltage increases further, the energy alignment is lost:</p>
$$\B{V ↑ ⇒ E_n \t{misaligned} ⇒ T(E) ↓ ⇒ J ↓}$$
<p>Thus $V ↑$ but $J ↓$, which produces <span class="kw">negative differential resistance</span>: $\B{dJ/dV &lt; 0}$.</p>
<div class="co memo"><b>One-line memory statement</b><p>Energy match ⇒ maximum tunneling;  energy-momentum mismatch ⇒ current collapse.</p></div>
<div class="co lab"><b>In the lab</b><p>In the 3D band diagram, move the bias. When the green level sits between the emitter's $E_C$ and $E_F$, electrons stream through; when it drops below $E_C$ it turns red and the stream stops.</p>${TRY(0,'V=0.05','Level above E_F')}${TRY(0,'V=0.15','Resonant')}${TRY(0,'V=0.3','Below E_C: collapse')}</div>`},

{id:'rtd-history',n:'3',t:'Historical Development',
 v:[['rTime','Timeline'],['fab','MBE growth',{proc:'mbe'}],['fab','MOCVD growth',{proc:'mocvd'}],['rchain','Chain',{c:'3'}]],
 b:r`<p>The RTD developed in four stages:</p>
<ol><li><strong>Prediction – 1973:</strong> Tsu and Esaki predicted that a double-barrier quantum structure could exhibit negative differential resistance, following their pioneering work on superlattices.</li><li><strong>Experimental demonstration – 1974:</strong> Chang and coworkers demonstrated the structure and its electrical characteristics.</li><li><strong>Rapid improvement – early 1980s:</strong> better crystal-growth techniques produced sharper interfaces and more reproducible devices: $\t{crystal quality} ↑ ⇒ \t{interface quality} ↑ ⇒ \t{RTD performance} ↑$.</li><li><strong>Room-temperature operation – 1985:</strong> room-temperature NDR was reported.</li></ol>
<p>The two enabling crystal-growth technologies were $\B{\t{MBE} = \t{Molecular Beam Epitaxy}}$ and $\B{\t{MOCVD} = \t{Metal-Organic Chemical Vapor Deposition}}$. They control semiconductor thickness on the scale of a few nanometres, often only a few atomic layers.</p>`},

{id:'rtd-preliminaries',n:'4',t:'Essential Preliminary Concepts',
 v:[['rHetero','Building blocks',{st:'db'}],['rchain','Chain',{c:'0'}]],
 b:r`<p>Before studying the RTD, four foundations must be clear:</p>
$$\B{\t{Quantum tunneling} + \t{Heterojunction} + \t{Quantum well} + \t{Resonance}}$$
<p>The subsections below build each one with its own visualisation.</p>`},

{id:'rtd-classical-quantum',n:'4.1',t:'Classical barrier versus quantum barrier',
 v:[['rBall','Ball vs wave'],['wave','3D wavefunction',{a:1,U:0.3,E:0.12}],['rchain','Chain',{c:'4'}]],
 b:r`<p>The same barrier behaves completely differently for a classical particle and for a quantum particle. The next two pages take each picture in turn.</p>
<div class="co lab"><b>In the lab</b><p>Top: a ball with $E &lt; U_0$ always rolls back. Bottom: a wave of the same energy decays inside the barrier and leaks a fraction $T$ through.</p>${TRY(0,'d=0.5','Thin barrier')}${TRY(0,'d=3','Thick barrier')}</div>`},

{id:'rtd-classical',n:'4.1.1',t:'Classical picture',
 v:[['rBall','Ball on a hill']],
 b:r`<p>Imagine a ball approaching a hill. If $E_{ball} &lt; U_{hill}$, the ball cannot cross the hill. Classical mechanics therefore predicts <strong>zero transmission</strong>.</p>`},

{id:'rtd-quantum-picture',n:'4.1.2',t:'Quantum-mechanical picture',
 v:[['wave','3D wavefunction',{a:1,U:0.3,E:0.12}],['trans','T vs thickness',{U:0.3,m:0.067}],['rchain','Chain',{c:'5'}]],
 b:r`<p>An electron is described not only as a particle but also by a wavefunction $ψ(x)$. In a classically forbidden barrier the wavefunction does not immediately become zero; it decays approximately as $ψ(x) ∝ e^{−κx}$. A finite amplitude may therefore reach the opposite side. Consequently $\B{E &lt; U_0 ⇏ T = 0}$ and instead $\B{E &lt; U_0 ⇒ 0 &lt; T &lt; 1}$ — this is <span class="kw">quantum tunneling</span>. For a simple rectangular barrier:</p>
$$\B{T ∝ e^{−2κd}},   \B{κ = \f{\s{2m*(U_0 − E)}}{ħ}}$$
<p>Here $d$ is barrier thickness, $U_0$ barrier height, $E$ electron energy, $m*$ effective mass and $ħ = h/(2π)$.</p>
<div class="co note"><b>Cause-and-effect relations</b><p>$d ↑ ⇒ 2κd ↑ ⇒ e^{−2κd} ↓ ⇒ T ↓↓$;  $U_0 ↑ ⇒ U_0 − E ↑ ⇒ κ ↑ ⇒ T ↓$;  $m* ↑ ⇒ κ ↑ ⇒ T ↓$, so $m* ↓ ⇒ T ↑$. Because the dependence on $d$, $U_0$ and $m*$ is exponential, an atomic-scale change can cause an enormous change in current.</p></div>
<div class="co lab"><b>In the lab</b>${TRY(0,'a=0.6','Thin barrier')}${TRY(0,'a=3','Thick barrier')}${TRY(1,'a=5','T at d = 5 nm')}</div>`},

{id:'rtd-heterojunction',n:'4.2',t:'Heterojunction',
 v:[['rHetero','Band alignment',{st:'het'}]],
 b:r`<p>A <span class="kw">heterojunction</span> is a junction formed between two different semiconductor materials, for example $\B{\t{GaAs} | \t{AlGaAs}}$. Because the two materials have different band gaps, electron affinities and band-edge positions, their energy bands do not join continuously. At the interface:</p>
$$\B{ΔE_C = \t{conduction-band discontinuity}},   \B{ΔE_V = \t{valence-band discontinuity}}$$
<p>The conduction-band offset $ΔE_C$ can form a barrier for electrons, while the valence-band offset $ΔE_V$ can form a barrier for holes.</p>
<div class="co lab"><b>In the lab</b><p>The Al fraction $x$ sets $E_g(\t{AlGaAs}) ≈ 1.424 + 1.247x$ eV; about 65 % of the gap difference appears in the conduction band.</p>${TRY(0,'x=0.15','x = 0.15')}${TRY(0,'x=0.4','x = 0.4')}</div>`},

{id:'rtd-quantum-well',n:'4.3',t:'Quantum well',
 v:[['rWellwf','Bound states'],['rHetero','AlGaAs|GaAs|AlGaAs',{st:'qw'}],['rLevels','E_n vs W']],
 b:r`<p>Consider the layer sequence $\B{\t{AlGaAs} | \t{GaAs} | \t{AlGaAs}}$. The GaAs conduction-band edge is lower than the AlGaAs conduction-band edge, so the thin GaAs region forms an energy well. Because its width $W$ is only a few nanometres, electron motion perpendicular to the interfaces is confined, and the permitted confinement energies become discrete:</p>
$$\B{E_1, E_2, E_3, …}$$
<p>These are called quantized levels, subband bottoms or quasi-bound states.</p>
<div class="co lab"><b>In the lab</b><p>The wavefunctions are solved exactly for a finite well. Narrow the well and watch the levels rise and the upper ones disappear over the barrier top.</p>${TRY(0,'W=3','Narrow well')}${TRY(0,'W=9','Wide well')}</div>`},

{id:'rtd-resonance',n:'4.4',t:'Resonance',
 v:[['rSwing','Swing analogy'],['rT','T(E) peaks']],
 b:r`<p>A useful analogy is a swing. A push at the wrong frequency produces little motion; a push at the natural frequency produces a large response: $f_{push} ≠ f_0 ⇒ \t{small motion}$, $f_{push} = f_0 ⇒ \t{large motion}$. Similarly, $E_{incoming} ≠ E_n ⇒ T(E)$ is small, whereas</p>
$$\B{E_{incoming} = E_n ⇒ T(E) \t{becomes very large}}$$
<p>Thus $\B{\t{Energy matching} ⟺ \t{resonance}}$.</p>
<div class="co lab"><b>In the lab</b>${TRY(0,'f=1','Push at f₀')}${TRY(0,'f=0.7','Push off resonance')}${TRY(1,'logy=0','Electron T(E) on a linear axis')}</div>`},

{id:'rtd-structure',n:'5',t:'Physical Structure of an RTD',
 v:[['rStack','Layer stack'],['rBand3','Band profile']],
 b:r`<p>A typical GaAs/AlGaAs RTD has the sequence</p>
$$\B{n^+\t{-GaAs} | i\t{-AlGaAs} | i\t{-GaAs} | i\t{-AlGaAs} | n^+\t{-GaAs}}$$
<p>where $n^+$ denotes heavily doped $n$-type material and $i$ an intrinsic (approximately undoped) layer. Electrons flow from the $n^+$ emitter, through barrier 1 ($d_{B1}$), the GaAs quantum well ($W ≈ 5$ nm) and barrier 2 ($d_{B2}$), into the $n^+$ collector.</p>
<div class="co lab"><b>In the lab</b><p>The 3D stack is drawn to scale. Dopant atoms appear only in the contacts; the conduction-band profile and the first levels float above.</p>${TRY(0,'hl=qw','Explain the well')}${TRY(0,'sp=0','Remove spacers')}</div>`},

{id:'rtd-layers',n:'5.1',t:'Layer-by-layer function',
 v:[['rStack','Layer stack',{hl:'em'}]],
 b:r`<div class="tw"><table class="t"><thead><tr><th>Layer</th><th>Material example</th><th>Main function</th></tr></thead><tbody>
<tr><td><strong>Emitter</strong></td><td>$n^+$-GaAs</td><td>Supplies a large population of electrons and provides low series/contact resistance.</td></tr>
<tr><td><strong>Barrier 1</strong></td><td>$i$-AlGaAs</td><td>First quantum-mechanical tunneling barrier.</td></tr>
<tr><td><strong>Quantum well</strong></td><td>$i$-GaAs</td><td>Supports the quantized states $E_1, E_2, …$</td></tr>
<tr><td><strong>Barrier 2</strong></td><td>$i$-AlGaAs</td><td>Second tunneling barrier; controls escape to the collector.</td></tr>
<tr><td><strong>Collector</strong></td><td>$n^+$-GaAs</td><td>Receives transmitted electrons and completes current flow.</td></tr></tbody></table></div>
<div class="co lab"><b>In the lab</b>${TRY(0,'hl=em','Emitter')}${TRY(0,'hl=b1','Barrier 1')}${TRY(0,'hl=qw','Well')}${TRY(0,'hl=b2','Barrier 2')}${TRY(0,'hl=co','Collector')}</div>`},

{id:'rtd-doped-contacts',n:'5.2',t:'Why are emitter and collector heavily doped?',
 v:[['rSupply','Supply vs E_F',{EF:0.05}],['rchain','Chain',{c:'6'}]],
 b:r`<p>Heavy $n$-type doping gives $n ↑ ⇒$ electron concentration $↑$, so $E_F ↑$, $R_C ↓$, $R_s ↓$. Therefore</p>
$$\B{n^+ \t{region} ⇒ \t{large electron supply and low resistance}}$$
<div class="co lab"><b>In the lab</b><p>Raising $E_F$ (heavier doping) widens the window of occupied emitter states that can feed the resonance.</p>${TRY(0,'EF=0.02','Light doping')}${TRY(0,'EF=0.12','Heavy doping')}</div>`},

{id:'rtd-undoped',n:'5.3',t:'Why are the well and barriers undoped?',
 v:[['rT','Sharp resonance'],['rJV','J-V vs broadening',{gs:8}],['rchain','Chain',{c:'7'}]],
 b:r`<p>Dopants introduce ionized impurities and random electrostatic potentials. These cause impurity scattering, level broadening, nonuniform fields, degraded coherence and increased valley leakage:</p>
$$\B{\t{Doping in the active region} ↑ ⇒ \t{scattering} ↑ ⇒ \t{resonance quality} ↓}$$
<p>Therefore the active well and barrier layers are kept approximately undoped.</p>
<div class="co lab"><b>In the lab</b><p>In the J-V view, the scattering broadening $Γ_s$ stands in for impurity scattering: raise it and the valley fills in.</p>${TRY(1,'gs=0.5','Clean active region')}${TRY(1,'gs=12','Heavily scattered')}</div>`},

{id:'rtd-spacers',n:'5.4',t:'Why are spacer layers used?',
 v:[['rStack','Layer stack',{hl:'sp',sp:true}],['rchain','Chain',{c:'8'}]],
 b:r`<p>Very thin undoped GaAs spacers, typically $\B{t_s ≈ 1.5 \t{nm}}$, may be placed adjacent to the barriers. They reduce dopant diffusion into the active region:</p>
$$\t{Doped contact} → \t{spacer} → \t{barrier} ⇒ \t{dopant contamination} ↓$$
<p>This improves interface quality, resonance sharpness and peak-to-valley ratio.</p>
<div class="co lab"><b>In the lab</b>${TRY(0,'sp=1;hl=sp','With spacers')}${TRY(0,'sp=0;hl=none','Without spacers')}</div>`},

{id:'rtd-dimensions',n:'5.5',t:'Typical dimensions and materials',
 v:[['rLevels','E_n vs W',{W:5,U:0.3}],['rT','T(E) with typical values']],
 b:r`<p>The source values are approximately</p>
$$\B{W ≈ 5 \t{nm}},  \B{1.5 \t{nm} ≲ d_B ≲ 5 \t{nm}},  \B{0.2 \t{eV} ≲ ΔE_C ≲ 0.5 \t{eV}},  \B{E_n − E_C ∼ 0.1 \t{eV in practical finite wells}}$$
<p>Common material combinations include GaAs/AlGaAs and GaInAs/AlInAs.</p>
<div class="co lab"><b>In the lab</b><p>With $W = 5$ nm and $ΔE_C$ between 0.2 and 0.5 eV, the finite-well $E_1$ lands near 0.08–0.11 eV — the guide's "~0.1 eV".</p>${TRY(0,'U=0.2','ΔE_C = 0.2 eV')}${TRY(0,'U=0.5','ΔE_C = 0.5 eV')}</div>`},

{id:'rtd-identical',n:'5.6',t:'Must the two barriers be identical?',
 v:[['rTetc','T(E_n) vs symmetry'],['rT','Asymmetric T(E)',{d1:2,d2:3.5}]],
 b:r`<p>No. In general $d_1 ≠ d_2$, $U_1 ≠ U_2$, $T_E ≠ T_C$. However, ideal unity resonant transmission requires matched emitter- and collector-barrier transmissions:</p>
$$\B{T_E = T_C}$$
<div class="co lab"><b>In the lab</b>${TRY(0,'TE=0.001;TC=0.001','Matched')}${TRY(0,'TE=0.1;TC=0.01','Mismatched (0.331)')}${TRY(1,'d1=2;d2=3.5','Exact T(E), unequal barriers')}</div>`},

{id:'rtd-quantization',n:'6',t:'Quantization inside the Quantum Well',
 v:[['rLevels','E_n vs W'],['rWellwf','Standing waves'],['rT','T(E) peaks']],
 b:r`<p>Consider an ideal infinite quantum well of width $W$. The electron wave must form a standing wave: $\B{W = nλ_n/2}$, so $\B{λ_n = 2W/n}$. Using the de Broglie relation, $p_n = h/λ_n = nh/(2W)$. The kinetic energy is $p_n^2/(2m*)$, so $E_n − E_{Cw} = \f{1}{2m*}(\f{nh}{2W})^2$. Hence:</p>
$$\B{E_n − E_{Cw} = \f{h^2n^2}{8m*W^2}}$$(62)
$$\B{E_n − E_{Cw} = \f{π^2ħ^2n^2}{2m*W^2}}   (h = 2πħ)$$
<p>where $E_{Cw}$ is the conduction-band edge inside the well.</p>
<div class="co lab"><b>In the lab</b><p>Dashed curves are equation (62); solid curves are the exact finite-well levels for the chosen barrier height.</p>${TRY(0,'W=5','W = 5 nm')}${TRY(0,'W=2.5','Halve W')}</div>`},

{id:'rtd-symbols',n:'6.1',t:'Meaning of every symbol',
 v:[['rLevels','E_n vs W']],
 b:r`<div class="tw"><table class="t"><thead><tr><th>Symbol</th><th>Meaning</th></tr></thead><tbody>
<tr><td>$E_n$</td><td>$n$th quantized energy level</td></tr><tr><td>$E_{Cw}$</td><td>Conduction-band edge inside the quantum well</td></tr><tr><td>$h$</td><td>Planck constant</td></tr><tr><td>$ħ$</td><td>Reduced Planck constant, $ħ = h/(2π)$</td></tr><tr><td>$m*$</td><td>Semiconductor effective electron mass</td></tr><tr><td>$W$</td><td>Quantum-well width</td></tr><tr><td>$n$</td><td>Quantum number, $n = 1, 2, 3, …$</td></tr></tbody></table></div>`},

{id:'rtd-proportionalities',n:'6.2',t:'Important proportionalities',
 v:[['rLevels','E_n vs W'],['rTs','T(E,W) surface',{ax:'W'}]],
 b:r`<p>From equation (62):</p>
$$\B{E_n − E_{Cw} ∝ n^2},   \B{E_n − E_{Cw} ∝ \f{1}{m*}},   \B{E_n − E_{Cw} ∝ \f{1}{W^2}}$$
<p>Thus $n ↑ ⇒ E_n ↑$ as $n^2$; $W ↓ ⇒ E_n ↑↑$; $m* ↓ ⇒ E_n ↑$. For an ideal infinite well, $E_2 − E_{Cw} = 4(E_1 − E_{Cw})$ and $E_3 − E_{Cw} = 9(E_1 − E_{Cw})$. If $W$ is halved, $W → W/2 ⇒ E_n − E_{Cw} → 4(E_n − E_{Cw})$.</p>
<div class="co lab"><b>In the lab</b><p>The readout reports $E_2/E_1$ for both wells: exactly 4 for the infinite well, less for a finite one. In the 3D surface the resonance ridges fall like $1/W^2$.</p>${TRY(0,'W=4','W = 4 nm')}${TRY(0,'W=8','W = 8 nm')}${TRY(0,'m=0.04','Lighter mass')}</div>`},

{id:'rtd-approximate',n:'6.3',t:'Why Equation (62) is approximate',
 v:[['rWellwf','Penetration'],['rLevels','Finite vs infinite']],
 b:r`<p>Equation (62) assumes an infinitely high barrier, $U_{barrier} → ∞$. In a real RTD the barriers are finite. The wavefunction penetrates into them, making the effective confinement width larger: $W_{effective} &gt; W$. Because $E_n ∝ 1/W^2$,</p>
$$\B{E_{n,finite well} &lt; E_{n,infinite well}}$$
<p>A finite barrier also supports only a limited number of bound or quasi-bound levels below the barrier top.</p>
<div class="co lab"><b>In the lab</b><p>The dotted lines mark $W + 2/κ$, the effective width set by the decay length $1/κ$ of the ground state.</p>${TRY(0,'U=0.2','Low barrier: deep penetration')}${TRY(0,'U=1','High barrier')}</div>`},

{id:'rtd-example-level',n:'7',t:'Numerical Example: First Quantum-Well Level',
 v:[['rCalcE1','Calculator'],['rLevels','Ladder',{W:5}]],
 b:r`<p>Given $W = 5$ nm, $m* = 0.067m_0$, $m_0 = 9.11 × 10^{−31}$ kg, then $m* = 0.067(9.11 × 10^{−31}) ≈ 6.10 × 10^{−32}$ kg. For $n = 1$,</p>
$$E_1 − E_{Cw} = \f{h^2}{8m*W^2}$$
<p>with $h = 6.626 × 10^{−34}$ J·s and $W = 5 × 10^{−9}$ m. The ideal infinite-well value is approximately $\B{E_1 − E_{Cw} ≈ 0.225 \t{eV}}$. For a finite well, $\B{E_{1,real} &lt; 0.225 \t{eV}}$, and a practical value may be of the order of 0.1 eV, depending on barrier height and material system.</p>
<div class="co trap"><b>Exam trap: free-electron mass versus effective mass</b><p>Do not automatically use $m_0$. For semiconductor quantum-well calculations, use the stated effective mass $m*$ unless the problem explicitly instructs otherwise.</p></div>
<div class="co lab"><b>In the lab</b>${TRY(0,'m=0.067','m* = 0.067m₀ (correct)')}${TRY(0,'m=0.12','Larger m*')}</div>`},

{id:'rtd-single-double',n:'8',t:'Single-Barrier versus Double-Barrier Tunneling',
 v:[['rT','T(E) comparison'],['rWave3','3D wave in the well']],
 b:r`<p>A single barrier and a double barrier respond very differently to energy: one is smooth and monotonic, the other has sharp peaks. The subsections compare them.</p>
<div class="co lab"><b>In the lab</b><p>Dashed amber: one barrier. Solid cyan: two barriers with a well between them — notice the sharp peaks reaching $T = 1$.</p></div>`},

{id:'rtd-single',n:'8.1',t:'Single barrier',
 v:[['rT','T(E)',{logy:true}],['trans','T vs width',{U:0.4,m:0.067}]],
 b:r`<p>For a single barrier, the transmission probability generally increases monotonically with incident energy:</p>
$$E ↑ ⇒ T(E) ↑,   \f{dT}{dE} &gt; 0$$
<p>There are no sharp cavity resonances caused by an intermediate confined state.</p>`},

{id:'rtd-double',n:'8.2',t:'Double barrier',
 v:[['rWave3','3D wave at resonance',{at:'E1'}],['rT','T(E)']],
 b:r`<p>In a double-barrier device, the electron wave enters the well and is repeatedly reflected: $ψ_{forward} ⇄ ψ_{reflected}$. When the total round-trip phase satisfies</p>
$$\B{2kW + ϕ_1 + ϕ_2 = 2πn}$$
<p>the wave amplitudes add constructively: $ψ_1 + ψ_2 + ψ_3 + ⋯ ⇒ |ψ|^2 ↑↑$. Therefore</p>
$$\B{\t{Constructive interference} ⇒ \t{resonant buildup} ⇒ T(E) ↑↑}$$
<div class="co lab"><b>In the lab</b><p>Snap to $E_1$: the wave inside the well grows many times larger than the incident wave, and the transmitted wave equals the incident one ($T = 1$). Move off resonance and the wave reflects.</p>${TRY(0,'at=E1','At E₁')}${TRY(0,'at=E2','At E₂')}${TRY(0,'at=free;E=0.07','Off resonance')}</div>`},

{id:'rtd-fabry-perot',n:'8.3',t:'Fabry–Perot resonator analogy',
 v:[['rFabry','Optical cavity'],['rWave3','Electron analogue']],
 b:r`<p>An optical Fabry–Perot cavity contains two partially reflecting mirrors. Light bounces between them and becomes strongly transmitted at resonance. An RTD is the matter-wave analogue.</p>
<div class="tw"><table class="t"><thead><tr><th>Optical Fabry–Perot cavity</th><th>Resonant-tunneling diode</th></tr></thead><tbody>
<tr><td>Photon</td><td>Electron</td></tr><tr><td>Light wave</td><td>Electron matter wave</td></tr><tr><td>Mirror</td><td>Semiconductor barrier</td></tr><tr><td>Optical cavity</td><td>Quantum well</td></tr><tr><td>Resonant frequency</td><td>Resonant electron energy</td></tr><tr><td>High optical transmission</td><td>High electron transmission</td></tr></tbody></table></div>
<p>$\B{\t{Fabry–Perot resonance} ⟺ \t{resonant electron tunneling}}$</p>
<div class="co lab"><b>In the lab</b>${TRY(0,'lam=1','On resonance')}${TRY(0,'lam=1.03','Slightly detuned')}${TRY(0,'Rm=0.97','Highly reflective mirrors')}</div>`},

{id:'rtd-transmission',n:'9',t:'Transmission Away from and at Resonance',
 v:[['rTetc','Eq. 63 vs Eq. 64'],['rT','Exact T(E)']],
 b:r`<p>Let $T_E$ be the transmission probability through the emitter-side barrier and $T_C$ through the collector-side barrier.</p>
<div class="co lab"><b>In the lab</b><p>The transmission-formula view plots both equations against $T_E$ for a chosen $T_C$; the exact view shows the dotted product $T_ET_C$ far below the resonant peaks.</p></div>`},

{id:'rtd-off-resonance',n:'9.1',t:'Away from resonance',
 v:[['rTetc','T_ET_C'],['rCalcRes','Calculator',{TE:1e-2,TC:1e-3}]],
 b:r`<p>Away from a quantized level, the electron must pass both barriers without constructive resonant enhancement. Approximately:</p>
$$\B{T(E) = T_ET_C}$$(63)
<p>For example, if $T_E = 10^{−2}$ and $T_C = 10^{−3}$, then $\B{T(E) = 10^{−5}}$. Off-resonant transmission can be extremely small.</p>`},

{id:'rtd-at-resonance',n:'9.2',t:'Exactly at resonance',
 v:[['rTetc','Eq. 64'],['rWave3','Buildup at E₁']],
 b:r`<p>When $E = E_n$, the wavefunction builds up in the well and the resonant transmission becomes</p>
$$\B{T(E_n) = \f{4T_ET_C}{(T_E + T_C)^2}}$$(64)`},

{id:'rtd-symmetric',n:'9.2.1',t:'Symmetrical barriers',
 v:[['rCalcRes','Calculator'],['rTetc','Formula plot',{TE:1e-3,TC:1e-3}]],
 b:r`<p>If $T_E = T_C = T_B$, then $T(E_n) = \f{4T_B^2}{(2T_B)^2} = 1$. Therefore $\B{T(E_n) = 1}$ for an ideal symmetric coherent double barrier — theoretically perfect transmission, even when each individual barrier is highly opaque.</p>
<div class="co idea"><b>One-million-fold resonant enhancement</b><p>Let $T_E = T_C = 10^{−3}$. Away from resonance $T_{off} = T_ET_C = 10^{−6}$. At resonance $T_{res} = 1$. Hence $\B{T_{res}/T_{off} = 10^6}$ — resonance increases transmission by a factor of one million.</p></div>`},

{id:'rtd-asymmetric',n:'9.2.2',t:'Asymmetrical barriers',
 v:[['rCalcRes','Calculator',{TE:0.1,TC:0.01}],['rT','Exact T(E)',{d1:2,d2:3.5}]],
 b:r`<p>Suppose $T_E = 0.1$ and $T_C = 0.01$. Then</p>
$$T(E_n) = \f{4(0.1)(0.01)}{(0.1 + 0.01)^2} = \f{0.004}{0.0121} ≈ 0.331$$
<p>Thus $\B{T_E ≠ T_C ⇒ T(E_n) &lt; 1}$. The peak remains much larger than the off-resonant value $T_ET_C = 0.001$, but ideal unity transmission is lost.</p>`},

{id:'rtd-width-lifetime',n:'10',t:'Transmission Peaks, Resonance Width, and Lifetime',
 v:[['rT','T(E) peaks',{logy:false}],['rBarrier','Width vs d_B'],['rchain','Chain',{c:'9'}]],
 b:r`<p>The transmission coefficient $T(E)$ has sharp peaks at $\B{E = E_1, E_2, E_3, …}$, so that $E ≠ E_n ⇒ T(E) ≪ 1$ and $E = E_n ⇒ T(E)$ becomes very large. Each peak corresponds to one quasi-bound quantum-well state. The energy width of a resonant state is approximately</p>
$$\B{ΔE ≈ \f{ħ}{τ}}$$
<p>where $ΔE$ is the resonance broadening and $τ$ the electron lifetime inside the well. This follows from the energy-time uncertainty relation $ΔE Δt ∼ ħ$, $Δt ∼ τ$. Therefore $τ ↑ ⇒ ΔE ↓$ and $τ ↓ ⇒ ΔE ↑$.</p>
<div class="co note"><b>Barrier thickness and resonance width</b><p>$d_B ↑ ⇒$ escape probability $↓ ⇒ τ ↑ ⇒ ΔE ↓$;  $d_B ↓ ⇒$ escape probability $↑ ⇒ τ ↓ ⇒ ΔE ↑$. Thick barriers produce narrow resonances but smaller current; thin barriers produce broader resonances and larger current.</p></div>
<div class="co lab"><b>In the lab</b><p>The readout of the T(E) view gives each peak's width $ΔE$ (FWHM of the exact curve) and $τ = ħ/ΔE$.</p>${TRY(0,'d1=1.5;d2=1.5;logy=0','Thin barriers')}${TRY(0,'d1=4;d2=4;logy=0','Thick barriers')}</div>`},

{id:'rtd-current-density',n:'11',t:'Resonant-Tunneling Current Density',
 v:[['rInteg','N·T integrand'],['rJV','J-V']],
 b:r`<p>The resonant-tunneling current density is</p>
$$\B{J = \f{q}{2πħ}∫N(E)T(E)dE}$$(65)
<p>Since $h = 2πħ$, it may also be written $J = \f{q}{h}∫N(E)T(E)dE$. At each energy the contribution depends on two independent requirements:</p>
<ol><li><strong>Electron supply:</strong> are electrons available at that energy? Described by $N(E)$.</li><li><strong>Quantum transmission:</strong> can those electrons cross the double barrier? Described by $T(E)$.</li></ol>
<p>Hence $dJ ∝ N(E)T(E)dE$, and summing over all energies gives the integral.</p>
<div class="co idea"><b>Why both factors are essential</b><p>$N(E)$ large, $T(E) ≈ 0 ⇒ J ≈ 0$;  $T(E) ≈ 1$, $N(E) ≈ 0 ⇒ J ≈ 0$. Therefore large current requires both $N(E) ↑$ and $T(E) ↑$.</p></div>
<div class="co lab"><b>In the lab</b><p>The green area is $N(E)T(E)$: it is only large where a transmission peak sits inside the supply.</p>${TRY(0,'V=0.05','Peak above the supply')}${TRY(0,'V=0.18','Peak inside the supply')}${TRY(0,'V=0.3','Peak below E_C')}</div>`},

{id:'rtd-supply',n:'12',t:'Electron Supply Function',
 v:[['rSupply','N(E)'],['rKs','Fermi sphere']],
 b:r`<p>The number of electrons available from the emitter is</p>
$$\B{N(E) = \f{kTm*}{πħ^2}\t{ln}[1 + \t{exp}(\f{E_F − E}{kT})]}$$(66)
<p>where $k$ is Boltzmann's constant, $T$ absolute temperature, $m*$ effective mass, $E_F$ the emitter Fermi level and $E$ the longitudinal electron energy relevant to tunneling.</p>`},

{id:'rtd-logarithm',n:'12.1',t:'Why does a logarithm appear?',
 v:[['rKs','Fermi sphere'],['rSupply','N(E)']],
 b:r`<p>The emitter is three-dimensional. Electron energy contains both longitudinal and transverse components: $k = k_xx̂ + k_⊥$. For one fixed longitudinal energy, many transverse states may be occupied. Summing the Fermi–Dirac occupation over the two-dimensional transverse density of states gives</p>
$$∫D_{2D}(E_⊥)f(E + E_⊥)dE_⊥$$
<p>where $D_{2D} ∝ m*/(πħ^2)$. This integration produces $kT\t{ln}[1 + e^{(E_F−E)/(kT)}]$. Thus $\B{\t{Logarithm} ⇐ \t{integration over all allowed lateral electron states}}$.</p>
<div class="co lab"><b>In the lab</b><p>In the Fermi sphere, every electron with the same $k_x$ lies on one disk; the disk's area is the lateral-state sum. At $T → 0$ that area is $π(k_F^2 − k_x^2) ∝ E_F − E$.</p></div>`},

{id:'rtd-low-temperature',n:'12.2',t:'Low-temperature interpretation',
 v:[['rSupply','N(E) at low T',{T:20}]],
 b:r`<p>At $T → 0$ the Fermi–Dirac function approaches a step. For $E &lt; E_F$, $(E_F − E)/kT ≫ 1$ and $\t{ln}(1 + e^x) ≈ x$, so $N(E) ≈ \f{m*}{πħ^2}(E_F − E)$. For $E &gt; E_F$ the supply is approximately zero:</p>
$$\B{N(E) ≈ \f{m*}{πħ^2}(E_F − E)  \t{for} E &lt; E_F,   0 \t{for} E &gt; E_F}$$
<p>At low temperature the emitter therefore supplies mainly states below $E_F$.</p>
<div class="co lab"><b>In the lab</b>${TRY(0,'T=4','T = 4 K')}${TRY(0,'T=300','T = 300 K')}</div>`},

{id:'rtd-bias',n:'13',t:'Effect of Applied Bias',
 v:[['rBand3','3D band diagram'],['rJV','Band + J-V'],['rchain','Level sequence',{c:'10'}]],
 b:r`<p>At zero bias $E_{F,E} = E_{F,C}$ and the net current is nearly zero because forward and backward flows are nearly equal. Applying a voltage changes the relative positions of the emitter conduction-band edge $E_C$, the emitter Fermi level $E_F$, the quantum levels $E_1, E_2, …$ and the collector bands. Increasing voltage tilts the potential profile: $V ↑ ⇒ ℰ ↑ ⇒$ bands tilt. It is convenient to picture the well levels moving downward relative to the emitter:</p>
$$E_1 &gt; E_F ⇒ E_C &lt; E_1 &lt; E_F ⇒ E_1 ≈ E_C ⇒ E_1 &lt; E_C$$
<p>This sequence generates the rising-current, peak, NDR and valley portions of the RTD characteristic.</p>
<div class="co lab"><b>In the lab</b>${TRY(0,'V=0.03','E₁ > E_F')}${TRY(0,'V=0.14','E_C < E₁ < E_F')}${TRY(0,'V=0.21','E₁ ≈ E_C')}${TRY(0,'V=0.3','E₁ < E_C')}</div>`},

{id:'rtd-coherent-sequential',n:'14',t:'Coherent Tunneling, Nonideal Effects, and Sequential Tunneling',
 v:[['rWave3','Coherent wave'],['rJV','Effect of broadening',{gs:6}]],
 b:r`<p>Two limiting pictures describe transport through the well: fully coherent (one quantum system, phase preserved) and sequential (two separate tunneling events). Real devices sit between them because of scattering.</p>`},

{id:'rtd-coherent',n:'14.1',t:'Ideal coherent tunneling',
 v:[['rWave3','Coherent wave',{at:'E1'}],['rT','Exact T(E)']],
 b:r`<p>In a fully coherent description, $\t{Emitter} ⟺ \t{Well} ⟺ \t{Collector}$ forms one continuous quantum system. The electron phase is preserved, and the Schrödinger equation must be solved simultaneously across all three regions. Interference then determines the resonant peaks.</p>
<div class="co lab"><b>In the lab</b><p>The wave and T(E) views do exactly this: a transfer-matrix solution of the Schrödinger equation across emitter, barriers, well and collector.</p></div>`},

{id:'rtd-nonideal',n:'14.2',t:'Why real devices are less ideal',
 v:[['rJV','J-V vs Γ_s',{gs:6,jb:600}],['rPVR','PVR vs T']],
 b:r`<p>Practical RTDs experience</p>
$$\B{\t{impurity scattering} + \t{interface roughness} + \t{phonon scattering} + \t{thermionic emission}}$$
<p>and also inelastic scattering, phonon-assisted tunneling, charge accumulation and level broadening. These mechanisms cause phase coherence $↓$, level sharpness $↓$, $J_V ↑$, PVR $↓$.</p>
<div class="co lab"><b>In the lab</b>${TRY(0,'gs=0.5;jb=20','Near ideal')}${TRY(0,'gs=10;jb=2000','Strongly nonideal')}</div>`},

{id:'rtd-sequential',n:'14.3',t:'Sequential tunneling model',
 v:[['rInteg','Injection-limited current'],['rBand3','Band diagram']],
 b:r`<p>In the sequential model, $\t{Emitter} →^{Γ_E} \t{Well} →^{Γ_C} \t{Collector}$. The tunneling events are treated as separate and substantially uncorrelated:</p>
<ol><li>The electron tunnels from emitter to well.</li><li>It remains in the well for a lifetime $τ$ and may scatter or lose phase coherence.</li><li>It tunnels from the well to the collector.</li></ol>
<p>In many practical devices, escape to the collector is less constrained than injection from the emitter, so emitter-to-well injection determines the current.</p>
<div class="co lab"><b>In the lab</b><p>The current model here treats scattering broadening $Γ_s$ in this sequential spirit: it widens each resonance while keeping its area (the injected flux) fixed.</p></div>`},

{id:'rtd-jv',n:'15',t:'RTD Current-Voltage Characteristic and NDR',
 v:[['rJV','Band + J-V'],['rJs','J(V,T) surface'],['rCompare','vs tunnel diode']],
 b:r`<p>A typical RTD characteristic contains current rises, peaks, falling-current NDR regions, valleys and possibly several repeated peak-valley pairs associated with $E_1, E_2, …$ The marked points are (a) near-zero bias, (b) the first peak $(V_P, J_P)$, (c) the first valley $J_V$, (d) the second peak and (e) a point on the second NDR region.</p>
<div class="co lab"><b>In the lab</b><p>The J-V curve is computed from equations 64–66 (resonance strength, width $ħ/τ$, supply $N(E)$) plus a thermionic/leakage background. Drag across it and watch the band diagram follow.</p>${TRY(0,'pt=b','Point (b)')}${TRY(0,'pt=c','Point (c)')}${TRY(0,'pt=d','Point (d)')}</div>`},

{id:'rtd-ndr',n:'15.1',t:'What exactly is negative differential resistance?',
 v:[['rJV','Slope readout',{V:0.23,ax:'first'}]],
 b:r`<p>Static resistance is $R = V/I$. Differential resistance and conductance are</p>
$$\B{r_d = \f{dV}{dI}},   \B{g_d = \f{dI}{dV}}$$
<p>In the NDR region $\B{dI/dV &lt; 0} ⟺ \B{dV/dI &lt; 0}$. Therefore $\B{V ↑ ⇒ I ↓}$.</p>
<div class="co trap"><b>NDR does not mean negative voltage or negative current</b><p>The RTD may still have $V &gt; 0$ and $I &gt; 0$. NDR means only that the <em>local slope</em> of the $I$-$V$ curve is negative. The device does not create energy by itself; it converts power from the DC source into oscillations or pulses.</p></div>
<div class="co lab"><b>In the lab</b>${TRY(0,'V=0.23','Inside the first NDR region')}${TRY(0,'V=0.1','Positive slope')}</div>`},

{id:'rtd-points',n:'16',t:'Detailed Explanation of Points (a)–(e)',
 v:[['rJV','Band + J-V',{ax:'first'}],['rBand3','3D band diagram']],
 b:r`<p>Each labelled point of the characteristic corresponds to one position of the well levels relative to the emitter's $E_C$ and $E_F$. Step through them with the shortcuts, or open each subsection.</p>
<div class="co lab"><b>In the lab</b>${TRY(0,'pt=a','(a)')}${TRY(0,'pt=b','(b)')}${TRY(0,'pt=c','(c)')}${TRY(0,'pt=d','(d)')}${TRY(0,'pt=e','(e)')}</div>`},

{id:'rtd-point-a',n:'16.1',t:'Point (a): near-zero bias',
 v:[['rJV','Point (a)',{pt:'a',ax:'first'}],['rBand3','3D',{V:0.02}]],
 b:r`<p>At approximately zero voltage the structure is nearly symmetrical. Forward and backward tunneling flows are almost equal: $J_{E→C} ≈ J_{C→E}$, $J_{net} ≈ 0$. The first level may also lie above the Fermi level, $E_1 &gt; E_F$, so very few occupied emitter electrons are available. Hence $\B{J ≈ 0}$.</p>`},

{id:'rtd-a-to-b',n:'16.2',t:'From (a) to (b): first current rise',
 v:[['rJV','Rising branch',{V:0.12,ax:'first'}],['rKs','Fermi sphere',{V:0.12}],['rchain','Chain',{c:'11'}]],
 b:r`<p>As bias increases, $E_1$ shifts downward. When $\B{E_C &lt; E_1 &lt; E_F}$, occupied emitter electrons, energy matching and momentum-compatible states become available. Therefore $V ↑ ⇒ N(E_1) ↑ ⇒ J ↑$.</p>
<div class="co lab"><b>In the lab</b><p>In the Fermi sphere, the green resonance disk grows as $E_1$ moves down toward $E_C$.</p>${TRY(1,'V=0.08','Small disk')}${TRY(1,'V=0.18','Large disk')}</div>`},

{id:'rtd-point-b',n:'16.3',t:'Point (b): first resonance and peak current',
 v:[['rJV','Point (b)',{pt:'b',ax:'first'}],['rKs','Fermi sphere',{V:0.2}]],
 b:r`<p>At low temperature, the maximum compatible electron supply occurs approximately when $\B{E_1 ≈ E_C}$. The transmission is resonantly large and the current reaches $\B{J = J_P}$ at the peak voltage $\B{V = V_P}$.</p>`},

{id:'rtd-b-to-c',n:'16.4',t:'From (b) to (c): first NDR region',
 v:[['rJV','First NDR',{V:0.23,ax:'first'}],['rDisp','k-space',{d:-0.02}],['rchain','Chain',{c:'12'}]],
 b:r`<p>Further bias moves the first level below the emitter conduction-band edge: $\B{E_1 &lt; E_C}$. The number of occupied states satisfying both energy and lateral-momentum conservation falls sharply. Thus</p>
$$\B{V ↑ ⇒ \t{compatible states} ↓ ⇒ T_{effective} ↓ ⇒ J ↓}$$
<p>and therefore $dJ/dV &lt; 0$.</p>`},

{id:'rtd-point-c',n:'16.5',t:'Point (c): first valley',
 v:[['rJV','Point (c)',{pt:'c',ax:'first'}],['rPVR','Valley vs T']],
 b:r`<p>After the first resonance is lost, the current reaches the valley value $\B{J = J_V}$. It is not zero because of thermionic emission, phonon-assisted tunneling, inelastic tunneling, direct off-resonant tunneling, defect-assisted processes and a finite thermal tail above $E_F$.</p>
<div class="co lab"><b>In the lab</b>${TRY(0,'pt=c;jb=20;gs=0.5','Low leakage')}${TRY(0,'pt=c;jb=3000;gs=6','High leakage')}</div>`},

{id:'rtd-c-to-d',n:'16.6',t:'From (c) to (d): second resonance',
 v:[['rJV','Second rise',{V:0.6}],['rBand3','3D',{V:0.6}]],
 b:r`<p>At higher bias, $E_2$ moves into the occupied emitter window: $\B{E_C &lt; E_2 &lt; E_F}$. A second resonant channel appears, so $J$ rises again.</p>`},

{id:'rtd-point-d',n:'16.7',t:'Point (d): second current peak',
 v:[['rJV','Point (d)',{pt:'d'}]],
 b:r`<p>When $\B{E_2 ≈ E_C}$, the second resonant current becomes maximum, producing the second current peak.</p>`},

{id:'rtd-d-to-e',n:'16.8',t:'From (d) to (e): second NDR region',
 v:[['rJV','Point (e)',{pt:'e'}],['rMulti','Multiple states']],
 b:r`<p>When $E_2 &lt; E_C$, the second resonance also loses energy-momentum compatibility. The current decreases again, producing another NDR region and another valley.</p>
<div class="co memo"><b>Meaning of multiple quantum levels</b><p>$E_1 ⇒$ first peak,  $E_2 ⇒$ second peak,  $E_3 ⇒$ third peak, … In practice, higher peaks are often hidden by large background thermionic and leakage currents.</p></div>`},

{id:'rtd-momentum',n:'17',t:'Energy and Momentum Conservation: The Core Physics of NDR',
 v:[['rKs','Fermi sphere'],['rDisp','Dispersion']],
 b:r`<p>Let tunneling occur in the $x$-direction. The electron wavevector is decomposed as $\B{k = k_xx̂ + k_⊥}$, where $k_x$ is perpendicular to the interfaces and $k_⊥$ parallel to them. Therefore</p>
$$\B{k^2 = k_x^2 + k_⊥^2}$$(70)`},

{id:'rtd-energy-well',n:'17.1',t:'Energy inside the quantum well',
 v:[['rDisp','Subband parabola']],
 b:r`<p>Motion in the $x$-direction is confined, so the corresponding energy is quantized and included in $E_n$. Motion parallel to the interfaces remains free:</p>
$$\B{E_w = E_n + \f{ħ^2k_⊥^2}{2m*}}$$(67)
<p>The first term is the discrete subband bottom; the second is continuous lateral kinetic energy. Only the bottom of each subband is quantized; above it, energy is continuous, $E(k_⊥) = E_n + ħ^2k_⊥^2/2m*$, so each subband is parabolic in $k_⊥$.</p>
<div class="co trap"><b>Important conceptual trap</b><p>Incorrect: "An electron in the well can have only exactly $E_1$, $E_2$ or $E_3$." Correct: $\B{\t{confinement energy is discrete, but lateral kinetic energy is continuous}}$.</p></div>`},

{id:'rtd-energy-emitter',n:'17.2',t:'Energy in the emitter',
 v:[['rDisp','Emitter parabola'],['rKs','Fermi sphere']],
 b:r`<p>The emitter is approximately a three-dimensional bulk semiconductor: $E = E_C + ħ^2k^2/2m*$. Using $k^2 = k_x^2 + k_⊥^2$:</p>
$$\B{E = E_C + \f{ħ^2k_x^2}{2m*} + \f{ħ^2k_⊥^2}{2m*}}$$(68)
<p>The emitter energy consists of the conduction-band edge, longitudinal kinetic energy and lateral kinetic energy.</p>`},

{id:'rtd-lateral',n:'17.3',t:'Why is lateral momentum conserved?',
 v:[['rKs','Fermi sphere'],['rStack','Uniform interfaces']],
 b:r`<p>The ideal interfaces are uniform in the lateral $y$- and $z$-directions: $∂U/∂y = 0$, $∂U/∂z = 0$. Hence $F_y = −∂U/∂y = 0$ and $F_z = −∂U/∂z = 0$. No lateral force is available to change lateral momentum, so</p>
$$\B{k_{⊥,emitter} = k_{⊥,well}}$$
<p>However, $k_x$ need not be conserved because the potential changes sharply along $x$.</p>`},

{id:'rtd-resonance-condition',n:'17.4',t:'Derivation of the resonance condition',
 v:[['rDisp','Matching'],['rKs','Resonance disk']],
 b:r`<p>Energy conservation requires $E_{emitter} = E_{well}$:</p>
$$E_C + \f{ħ^2k_x^2}{2m*} + \f{ħ^2k_⊥^2}{2m*} = E_n + \f{ħ^2k_⊥^2}{2m*}$$
<p>Because lateral momentum is conserved, the lateral-energy terms cancel:</p>
$$\B{E_C + \f{ħ^2k_x^2}{2m*} = E_n}$$(69)
<p>Hence $\B{ħ^2k_x^2/2m* = E_n − E_C}$ and $\B{k_x = \s{2m*(E_n − E_C)}/ħ}$.</p>
<div class="co lab"><b>In the lab</b><p>The resonance disk in the Fermi sphere sits exactly at this $k_x$; the readout gives $k_x/k_F$.</p></div>`},

{id:'rtd-collapse',n:'17.5',t:'Why the current collapses when E_n < E_C',
 v:[['rKs','Disk vanishes',{V:0.3}],['rDisp','Imaginary k_x',{d:-0.02}]],
 b:r`<p>For a real propagating emitter state, $k_x^2 ≥ 0$. Equation (69) therefore requires $E_n − E_C ≥ 0 ⟹ \B{E_n ≥ E_C}$. If $E_n &lt; E_C$, then $k_x^2 &lt; 0$, so $k_x$ becomes imaginary rather than representing an occupied propagating state. The number of electrons satisfying both energy and lateral-momentum conservation collapses:</p>
$$\B{E_n &lt; E_C ⇒ \t{resonant injection prohibited} ⇒ J ↓}$$
<p>This is the deepest physical origin of NDR.</p>
<div class="co lab"><b>In the lab</b>${TRY(0,'V=0.18','Just before collapse')}${TRY(0,'V=0.25','After collapse')}</div>`},

{id:'rtd-kspace',n:'18',t:'Interpretation of the k-Space Tunneling Diagrams',
 v:[['rDisp','Fig. 5 interactive'],['rKs','3D Fermi sphere']],
 b:r`<p>The left panel of the k-space view shows the emitter states filled up to $E_F$; the right panel shows the well subband. An arrow joins them at the energy of $E_1$: blue when tunneling is allowed, red when it is suppressed.</p>`},

{id:'rtd-allowed',n:'18.1',t:'Allowed resonance: E_C < E_1 < E_F',
 v:[['rDisp','Allowed',{d:0.03}],['rKs','Disk inside sphere',{V:0.15}]],
 b:r`<p>Here $E_1 − E_C &gt; 0$, so a real longitudinal wavevector exists: $k_x = \s{2m*(E_1 − E_C)}/ħ ∈ ℝ$. Because $E_1 &lt; E_F$, the corresponding emitter states are occupied. Energy conservation, lateral-momentum conservation and state occupancy are all satisfied:</p>
$$\B{\t{energy match} + \t{momentum match} + \t{occupied initial state} ⇒ \t{resonant tunneling}}$$`},

{id:'rtd-suppressed',n:'18.2',t:'Suppressed resonance: E_1 < E_C',
 v:[['rDisp','Suppressed',{d:-0.025}],['rKs','No disk',{V:0.28}]],
 b:r`<p>When $E_1 &lt; E_C$, one may attempt to match total energy using a large lateral momentum $k_⊥$. However, $k^2 = k_x^2 + k_⊥^2 ⇒ k ≥ k_⊥$. At low temperature occupied emitter states lie inside the Fermi sphere, $k ≤ k_F$. If the required $k_⊥ &gt; k_F$, then no occupied emitter state is available. Therefore</p>
$$\B{\t{No occupied momentum-compatible state} ⇒ \t{tunneling probability drops sharply}}$$`},

{id:'rtd-below-ef',n:'19',t:'Why Current Starts below E_F and Peaks near E_C',
 v:[['rJV','Rise and peak',{T:20,V:0.15,ax:'first'}],['rSupply','Supply window',{T:20}],['rKs','Disk area']],
 b:r`<p>Initially $E_1 &gt; E_F$, so the occupation probability and electron supply are very small: $f(E_1) ≈ 0$, $N(E_1) ≈ 0$, $J ≈ 0$. As bias lowers $E_1$ below the Fermi level, $E_1 &lt; E_F ⇒ f(E_1) ↑ ⇒ N(E_1) ↑ ⇒ J ↑$. The occupied longitudinal-energy window is approximately $\B{E_C ≤ E_x ≤ E_F}$. As $E_1$ moves from $E_F$ toward $E_C$, more transverse phase space contributes and the compatible supply increases. At low temperature the current therefore becomes maximum approximately when $\B{E_1 ≈ E_C}$. When $E_1 &lt; E_C$ the momentum-conserving resonance condition fails, so $E_C$ is approximately the lower boundary of strong resonant injection.</p>
<div class="co lab"><b>In the lab</b><p>At 20 K the J-V rise is almost a straight ramp ending in a cliff at $E_1 = E_C$ — the triangle predicted by $N(E) ∝ E_F − E$.</p>${TRY(0,'T=20;V=0.2','20 K, at the peak')}${TRY(0,'T=300;V=0.2','300 K')}</div>`},

{id:'rtd-peak-voltage',n:'20',t:'Peak Voltage',
 v:[['rCalcVp','Calculator'],['rVp','Ideal vs measured'],['rJV','J-V peak']],
 b:r`<p>For a symmetrical double-barrier structure, approximately half of the applied voltage develops across each barrier. To shift the relative energy by $E_n − E_C$, $qV_P/2 ≈ E_n − E_C$. Therefore</p>
$$\B{V_P ≈ \f{2(E_n − E_C)}{q}}$$(71)
<div class="co idea"><b>Peak-voltage calculation</b><p>If $E_n − E_C = 0.12$ eV then, using 1 eV/q = 1 V, $V_P ≈ 2(0.12) = \B{0.24 \t{V}}$.</p></div>
<div class="co lab"><b>In the lab</b><p>The J-V readout lists the ideal $2E_1/q$ next to the computed peak; thermal smearing and level width put the peak slightly earlier.</p></div>`},

{id:'rtd-practical-vp',n:'20.1',t:'Why practical V_P is larger',
 v:[['rVp','Voltage budget']],
 b:r`<p>The terminal voltage is distributed across several regions:</p>
$$\B{V_{applied} = V_{B1} + V_W + V_{B2} + V_{spacers} + V_{contacts} + IR_s}$$
<ol><li><strong>Electric-field penetration:</strong> the field penetrates into the emitter and collector, producing additional voltage drop.</li><li><strong>Spacer-layer drop:</strong> undoped spacers have finite field and thickness, so $V_s = ℰ_sd_s$.</li><li><strong>Charge accumulation in the well:</strong> a sheet charge $Q_w = −qN_w$ changes the electric fields so that $ℰ_1 ≠ ℰ_2$, requiring additional voltage for alignment.</li><li><strong>Series resistance:</strong> contacts and access layers add $V_{R_s} = IR_s$.</li></ol>
<p>Therefore $\B{V_{P,measured} &gt; V_{P,ideal}}$.</p>
<div class="co lab"><b>In the lab</b>${TRY(0,'sp=0;acc=0;ch=0;IR=0','Ideal only')}${TRY(0,'sp=0.08;acc=0.1;ch=0.05;IR=0.15','Realistic device')}</div>`},

{id:'rtd-pvr',n:'21',t:'Peak-to-Valley Current Ratio',
 v:[['rCalcPVR','Calculator'],['rPVR','J-V and PVR']],
 b:r`<p>A critical measure of RTD quality is</p>
$$\B{\t{PVR} = \f{J_P}{J_V}}$$
<p>where $J_P$ is peak current density and $J_V$ valley current density. A larger PVR means stronger NDR, clearer switching, larger oscillator gain margin, better separation of logic states and improved device quality.</p>
<div class="co idea"><b>PVR calculation</b><p>Given $J_P = 2.0 × 10^5$ A/cm² and $J_V = 2.5 × 10^4$ A/cm², $\t{PVR} = 2.0 × 10^5 / 2.5 × 10^4 = \B{8}$.</p></div>`},

{id:'rtd-peak-current',n:'22',t:'Approximate Peak-Current Equation',
 v:[['rInteg','Narrow resonance'],['rBarrier','J_P vs d_B']],
 b:r`<p>For a narrow resonance, the current integral may be approximated by treating the resonance as a peak of effective width $ΔE$: $J = qN(V)T_E(V)ΔE/(2πħ)$. Using $ΔE ≈ ħ/τ$:</p>
$$\B{J ≈ \f{qN(V)T_E(V)}{2πτ}}$$(72)`},

{id:'rtd-integral-product',n:'22.1',t:'Why the integral becomes a product',
 v:[['rInteg','Integrand',{V:0.15,gs:0.3}]],
 b:r`<p>The exact current contains $∫N(E)T(E)dE$. If $T(E)$ is sharply concentrated near $E_n$, then $N(E)$ changes slowly over that tiny interval, so $N(E) ≈ N(E_n)$. Therefore</p>
$$∫N(E)T(E)dE ≈ N(E_n)∫T(E)dE$$
<p>The area of the narrow transmission peak is approximately proportional to $T_EΔE$. Hence the integral becomes the product of electron supply, barrier transmission and resonance width.</p>
<div class="co lab"><b>In the lab</b><p>With a narrow resonance the green integrand is a thin spike whose height follows the blue supply curve — the product picture made visible.</p></div>`},

{id:'rtd-effective-mass',n:'23',t:'Why a Small Effective Mass is Advantageous',
 v:[['rT','T(E) vs m*',{m:0.045}],['rchain','Chain',{c:'13'}]],
 b:r`<p>Barrier transmission behaves approximately as $T_E ∝ e^{−2κd}$, $κ = \s{2m*(U_0 − E)}/ħ$. If $m*$ decreases, $m* ↓ ⇒ κ ↓ ⇒ T_E ↑↑$ exponentially. Although the electron supply contains the factor $N(E) ∝ m*$, the exponential increase in transmission can dominate the linear reduction in supply. Therefore</p>
$$\B{m* ↓ ⇒ J_P ↑ \t{in many practical designs}}$$
<p>This is why GaInAs/AlInAs can be advantageous over GaAs/AlGaAs for high-current RTDs: GaInAs generally has a smaller electron effective mass and therefore stronger tunneling.</p>
<div class="co lab"><b>In the lab</b>${TRY(0,'m=0.067','GaAs-like')}${TRY(0,'m=0.041','GaInAs-like')}</div>`},

{id:'rtd-temperature',n:'24',t:'Temperature Dependence',
 v:[['rPVR','PVR vs T'],['rJs','J(V,T) surface'],['rchain','Chain',{c:'14'}]],
 b:r`<p>The peak and the valley respond very differently to temperature, because they come from different physics: tunneling for the peak, partly thermally activated processes for the valley.</p>`},

{id:'rtd-temp-peak',n:'24.1',t:'Peak current',
 v:[['rPVR','J_P vs T'],['rJs','Surface']],
 b:r`<p>Peak current is produced mainly by quantum tunneling, which is not a thermally activated over-barrier process. Therefore $\B{J_P \t{is comparatively weakly dependent on temperature}}$; relative to thermionic current, $∂J_P/∂T ≈ 0$. High-performance devices have demonstrated peak-current densities in the approximate mid-$10^5$ A/cm² range.</p>`},

{id:'rtd-temp-valley',n:'24.2',t:'Valley current',
 v:[['rPVR','Valley vs T'],['rJs','Surface']],
 b:r`<p>Valley current contains a substantial thermionic-emission component. A simplified thermionic dependence is</p>
$$\B{J_{th} ∝ T^2e^{−qΦ_B/(kT)}}$$
<p>As temperature rises, $−qΦ_B/kT$ becomes less negative, so $J_V ↑↑$. Therefore $\B{T ↓ ⇒ J_V ↓ ⇒ \t{PVR} ↑}$.</p>
<div class="co lab"><b>In the lab</b>${TRY(0,'T=77','77 K')}${TRY(0,'T=300','300 K')}${TRY(0,'T=400','400 K')}</div>`},

{id:'rtd-thermal-tail',n:'24.3',t:'Thermal-tail tunneling',
 v:[['rSupply','Tail above E_F',{T:400,E:0.08}],['rInteg','Integrand',{T:400,V:0.05}]],
 b:r`<p>At finite temperature the Fermi–Dirac distribution does not terminate sharply at $E_F$: $f(E &gt; E_F) ≠ 0$. A small number of electrons above $E_F$ may tunnel through higher quantized levels $E_2, E_3, …$ This adds background or valley current, especially when adjacent levels are closely spaced: $ΔE_{n,n+1} ↓ ⇒$ thermal access to higher levels $↑$.</p>`},

{id:'rtd-higher-peaks',n:'25',t:'Why Higher Current Peaks Are Difficult to Observe',
 v:[['rJV','Background vs peak 2',{jb:4000,V:0.7}],['rMulti','Load line']],
 b:r`<p>Ideally $E_1 ⇒$ peak 1, $E_2 ⇒$ peak 2, $E_3 ⇒$ peak 3, … In practice, at larger voltage, thermionic current $↑$, leakage current $↑$, phonon-assisted processes $↑$, level broadening $↑$. Therefore</p>
$$\B{\t{higher-level resonant signal} ≪ \t{large background current}}$$
<p>and the second or higher peaks are often weak or unobservable.</p>
<div class="co lab"><b>In the lab</b>${TRY(0,'jb=50;V=0.7','Low background')}${TRY(0,'jb=8000;V=0.7','Large background')}</div>`},

{id:'rtd-design',n:'26',t:'RTD Design Trade-Offs',
 v:[['rBarrier','Barrier thickness'],['rWellT','Well width'],['rTetc','Symmetry']],
 b:r`<p>Every structural parameter trades one figure of merit against another. The four subsections cover barrier thickness, well width, barrier symmetry and well charge.</p>`},

{id:'rtd-barrier-thickness',n:'26.1',t:'Barrier thickness',
 v:[['rBarrier','ΔE and J_P vs d_B'],['rT','T(E)']],
 b:r`<p>For thinner barriers $d_B ↓ ⇒ T ↑ ⇒ J_P ↑$. However, $d_B ↓ ⇒ τ ↓ ⇒ ΔE ↑$, which can increase resonance broadening, leakage and valley current, and reduce PVR. For thicker barriers $d_B ↑ ⇒ T ↓ ⇒ J_P ↓$, but $d_B ↑ ⇒ τ ↑ ⇒ ΔE ↓$, which gives a narrower resonance and may reduce leakage.</p>
<div class="co idea"><b>Barrier design is a current-selectivity trade-off</b><p>$\B{\t{Thin barrier} ⇒ \t{high current but broad/leaky resonance}}$<br>$\B{\t{Thick barrier} ⇒ \t{low current but narrow/selective resonance}}$</p></div>
<div class="co lab"><b>In the lab</b>${TRY(0,'d=1.5','Thin')}${TRY(0,'d=4.5','Thick')}</div>`},

{id:'rtd-well-width',n:'26.2',t:'Quantum-well width',
 v:[['rWellT','Levels and spacing'],['rTs','T(E,W)',{ax:'W'}]],
 b:r`<p>Because $E_n − E_{Cw} ∝ 1/W^2$, a narrower well gives $W ↓ ⇒ E_n ↑$, $ΔE_{n,n+1} ↑$. This increases level spacing and can separate resonant peaks more clearly. A wider well gives $W ↑ ⇒ E_n ↓$, $ΔE_{n,n+1} ↓$. It may support more bound states, but closely spaced levels can increase unwanted higher-level tunneling.</p>
<div class="co lab"><b>In the lab</b>${TRY(0,'W=3.5','Narrow well')}${TRY(0,'W=9','Wide well')}</div>`},

{id:'rtd-symmetry',n:'26.3',t:'Barrier symmetry',
 v:[['rTetc','T(E_n) vs T_E/T_C'],['rT','Exact asymmetric',{d1:2,d2:3}]],
 b:r`<p>The resonant peak transmission is $T(E_n) = 4T_ET_C/(T_E + T_C)^2$. It is maximum when $\B{T_E = T_C ⇒ T(E_n) = 1}$. Strong asymmetry lowers peak transmission. However, moderate intentional asymmetry may improve collector extraction, reduce charge accumulation, alter peak current and modify switching behaviour.</p>`},

{id:'rtd-well-charge',n:'26.4',t:'Well charge and electrostatic feedback',
 v:[['rHyst','Hysteresis']],
 b:r`<p>The well charge is approximately $Q_w = −qN_w$. Charge accumulation modifies the electric-field distribution and can cause</p>
$$\B{\t{peak-voltage shift} + \t{hysteresis} + \t{bistability} + \t{unequal barrier voltage drops}}$$
<div class="co lab"><b>In the lab</b><p>A simple self-consistent model: the stored charge, proportional to the current, opposes the applied bias. With strong feedback the up and down sweeps separate into a hysteresis loop.</p>${TRY(0,'beta=0','No feedback')}${TRY(0,'beta=0.4;V=0.25','Strong feedback')}</div>`},

{id:'rtd-rd-example',n:'27',t:'Differential-Resistance Numerical Example',
 v:[['rCalcRd','Calculator'],['rJV','Slope on the J-V',{V:0.23}]],
 b:r`<p>Suppose the current density decreases from $J_P = 2.0 × 10^5$ A/cm² at $V_P = 0.25$ V to $J_V = 4.0 × 10^4$ A/cm² at $V_V = 0.35$ V. Then $ΔV = V_V − V_P = 0.10$ V and $ΔJ = J_V − J_P = −1.6 × 10^5$ A/cm². The differential resistance-area product is</p>
$$r_dA = \f{ΔV}{ΔJ} = \f{0.10}{−1.6 × 10^5} = \B{−6.25 × 10^{−7} Ω·\t{cm}^2}$$
<p>For a diode area $A = 1 µ\t{m}^2$, use $1 µ\t{m} = 10^{−4}$ cm ⇒ $A = 10^{−8}$ cm². Therefore</p>
$$r_d = \f{r_dA}{A} = \f{−6.25 × 10^{−7}}{10^{−8}} = \B{−62.5 Ω}$$
<p>The negative sign confirms operation in the NDR region.</p>`},

{id:'rtd-vs-tunnel',n:'28',t:'RTD versus Conventional Tunnel Diode',
 v:[['rCompare','J-V comparison'],['rBand3','RTD band picture']],
 b:r`<div class="tw"><table class="t"><thead><tr><th>Property</th><th>Conventional tunnel diode</th><th>Resonant-tunneling diode</th></tr></thead><tbody>
<tr><td><strong>Basic structure</strong></td><td>Heavily doped $p^+$-$n^+$ junction</td><td>Double-barrier semiconductor heterostructure</td></tr>
<tr><td><strong>Main mechanism</strong></td><td>Interband tunneling caused by band overlap</td><td>Resonance through quantized quantum-well states</td></tr>
<tr><td><strong>Barrier system</strong></td><td>Depletion-region barrier</td><td>Two nanometre-scale material barriers</td></tr>
<tr><td><strong>Quantum well</strong></td><td>Normally absent</td><td>Essential active region</td></tr>
<tr><td><strong>Energy condition</strong></td><td>Filled and empty band-state overlap</td><td>$E_{electron} ≈ E_n$ with momentum compatibility</td></tr>
<tr><td><strong>NDR regions</strong></td><td>Usually one</td><td>Multiple NDR regions are possible</td></tr>
<tr><td><strong>Typical materials</strong></td><td>Ge, GaAs and related materials</td><td>GaAs/AlGaAs, GaInAs/AlInAs</td></tr>
<tr><td><strong>Functional potential</strong></td><td>Fast switching and oscillation</td><td>THz oscillation, multivalued logic, memory, ultrafast functional circuits</td></tr></tbody></table></div>
<div class="co memo"><b>Memory trick</b><p>$\B{\t{Tunnel diode} = \t{band overlap}}$    $\B{\t{RTD} = \t{quantized-level alignment}}$</p></div>`},

{id:'rtd-fast',n:'29',t:'Why RTDs Are Extremely Fast',
 v:[['rSpeed','Transit time'],['rchain','Chain',{c:'15'}]],
 b:r`<p>Tunneling is an inherently rapid quantum process. The RTD does not require carriers to diffuse through a long base, recombine as minority carriers, or wait for stored minority charge to disappear. Therefore $t_{storage} ≈ 0$. Its active region is only a few nanometres thick, $L ∼ 10^{−9}$ m. A simple transit-time estimate is</p>
$$\B{t_{tr} ∼ \f{L}{v}}$$
<p>Because $L$ is extremely small, $t_{tr} ↓↓ ⇒ f_{max} ↑↑$. RTDs have been demonstrated as oscillators near 700 GHz, and maximum operational frequencies above 1 THz have been projected.</p>`},

{id:'rtd-oscillation',n:'30',t:'How an RTD Produces Oscillation',
 v:[['rOsc','Oscillator simulation'],['rchain','Energy flow',{c:'16'}]],
 b:r`<p>Inside the NDR region $g_d = dI/dV &lt; 0$. Suppose a resonant circuit has positive loss conductance $G_L$. The RTD can sustain oscillation if the magnitude of its negative conductance exceeds the circuit loss:</p>
$$\B{|g_d| &gt; G_L}$$
<p>Then energy flows as $\B{\t{DC source} → \t{RTD negative conductance} → \t{AC resonator} → \t{sustained oscillation}}$. For an ideal $LC$ resonator</p>
$$\B{f_0 = \f{1}{2π\s{LC}}}$$
<p>The practical frequency also depends on junction capacitance $C_j$, series resistance $R_s$, package/interconnect inductance, parasitic capacitance and transmission-line losses.</p>
<div class="co lab"><b>In the lab</b><p>The simulation integrates the full nonlinear circuit with the RTD's J-V curve. The readout checks $|g_d| &gt; G_L$ at your bias.</p>${TRY(0,'Vb=0.24;GL=3','|g_d| > G_L: oscillates')}${TRY(0,'Vb=0.24;GL=25','Too much loss')}${TRY(0,'Vb=0.1','Bias on the rising branch')}</div>`},

{id:'rtd-applications',n:'31',t:'Applications',
 v:[['rOsc','Oscillator'],['rMulti','Multivalued logic'],['rSpeed','Speed']],
 b:r`<p>Seven application areas follow from three properties: NDR, ultrafast tunneling and energy selectivity.</p>`},

{id:'rtd-thz',n:'31.1',t:'Microwave and terahertz oscillators',
 v:[['rOsc','Oscillator',{L:0.05,C:0.05}],['rSpeed','f_max']],
 b:r`<p>The combination $\B{\t{NDR} + \t{ultrafast tunneling} ⇒ \t{high-frequency oscillation}}$ enables millimetre-wave, sub-terahertz and terahertz sources for wireless communication, spectroscopy, imaging, radar and sensing.</p>`},

{id:'rtd-pulse',n:'31.2',t:'Fast pulse-forming circuits',
 v:[['rJV','J_P → J_V drop',{V:0.22}]],
 b:r`<p>The rapid transition $J_P → J_V$ can produce extremely short voltage or current pulses. Applications include pulse generators, sampling circuits and ultrafast switching.</p>`},

{id:'rtd-trigger',n:'31.3',t:'Trigger circuits',
 v:[['rMulti','Threshold',{Vs:0.6,RL:150}]],
 b:r`<p>The nonlinear N-shaped characteristic permits threshold detection: $V → V_{threshold} ⇒$ rapid state transition. Therefore RTDs can operate as high-speed trigger devices.</p>`},

{id:'rtd-multivalued',n:'31.4',t:'Multivalued logic',
 v:[['rMulti','Several stable states',{Vs:1.66,RL:118}]],
 b:r`<p>Conventional binary logic uses 0, 1. An RTD with multiple peaks may support several stable operating regions: 0, 1, 2, 3, … One compact RTD-based circuit may therefore perform a function that would require many conventional components.</p>
<div class="co lab"><b>In the lab</b>${TRY(0,'Vs=1.66;RL=118','Three stable states')}${TRY(0,'Vs=0.95;RL=350','Two states (binary)')}${TRY(0,'Vs=0.4;RL=60','One state')}</div>`},

{id:'rtd-memory',n:'31.5',t:'Memory',
 v:[['rMulti','Load line',{Vs:0.5,RL:200}],['rHyst','Bistability',{beta:0.4}]],
 b:r`<p>An RTD connected to a suitable load may possess several stable operating points, for example $(V_1, I_1)$ and $(V_2, I_2)$, representing stored logic states. Thus $\B{\t{multiple stable operating points} ⇒ \t{memory operation}}$.</p>`},

{id:'rtd-three-terminal',n:'31.6',t:'Three-terminal devices',
 v:[['rBand3','Level control']],
 b:r`<p>RTDs can form building blocks for resonant-tunneling bipolar transistors and resonant-tunneling hot-electron transistors. A third terminal provides control over $E_n$, $J_P$ and $V_P$.</p>
<div class="co lab"><b>In the lab</b><p>Moving a level is what a third terminal does; here the bias slider plays that role.</p></div>`},

{id:'rtd-spectroscopy',n:'31.7',t:'Hot-electron spectroscopy',
 v:[['rT','Energy filter',{logy:false}]],
 b:r`<p>Because $T(E)$ contains narrow energy-selective peaks, an RTD can act as an energy filter for studying energetic or hot-electron distributions.</p>`},

{id:'rtd-limitations',n:'32',t:'Limitations',
 v:[['rFrc','RC limit'],['rTol','Tolerance']],
 b:r`<p>Four limitations constrain practical RTDs: output power, fabrication precision, parasitics and valley leakage.</p>
<div class="co note"><b>Source note</b><p>The supplied PDF has 26 pages (its footer counts 31); the text ends after section 32.4. Material after that point is not covered here.</p></div>`},

{id:'rtd-power',n:'32.1',t:'Limited output power',
 v:[['rOsc','Small-area oscillator',{A:2}]],
 b:r`<p>RTDs are extremely fast, but high output power is difficult because the active area is small, current density is high, heating is significant, parasitic losses increase, and maintaining uniform resonance over a large area is difficult:</p>
$$\B{\t{very high frequency} ✓  \t{high output power difficult}}$$
<div class="co lab"><b>In the lab</b><p>The oscillation swing is limited to roughly the width of the NDR region (~0.1 V) and the current to a few mA for µm² devices — microwatts to milliwatts.</p></div>`},

{id:'rtd-fabrication',n:'32.2',t:'Fabrication difficulty',
 v:[['rTol','One monolayer'],['rchain','Chain',{c:'17'}]],
 b:r`<p>Performance depends strongly on $W$, $d_B$, $ΔE_C$ and $m*$. Because $E_n ∝ 1/W^2$, a tiny thickness error causes $ΔW ⇒ ΔE_n ⇒ ΔV_P$. Even one atomic-layer error can noticeably change device characteristics.</p>
<div class="co lab"><b>In the lab</b>${TRY(0,'W=4;ml=1','±1 ML at W = 4 nm')}${TRY(0,'W=8;ml=1','±1 ML at W = 8 nm')}</div>`},

{id:'rtd-parasitics',n:'32.3',t:'Parasitic effects',
 v:[['rFrc','f_RC surface'],['rchain','Chain',{c:'19'}]],
 b:r`<p>At very high frequency, $R_s$, $C_j$, package inductance and interconnect capacitance become important. A simple RC estimate is</p>
$$\B{f_{RC} ∼ \f{1}{2πR_sC_j}}$$
<p>Therefore $R_s ↑ ⇒ f_{RC} ↓$ and $C_j ↑ ⇒ f_{RC} ↓$.</p>`},

{id:'rtd-valley-leakage',n:'32.4',t:'Valley leakage',
 v:[['rPVR','Valley vs T',{jb:1500}],['rchain','Chain',{c:'18'}]],
 b:r`<p>Defects, thermionic emission, phonons, interface roughness and inelastic processes increase valley current: $J_V ↑ ⇒ J_P/J_V ↓$. Thus PVR and NDR quality deteriorate.</p>
<div class="co lab"><b>In the lab</b>${TRY(0,'jb=30;gs=0.5','Clean device')}${TRY(0,'jb=5000;gs=8','Leaky device')}</div>`}
];
PAGES.forEach(p=>{p.lvl=p.n.split('.').length;const par=p.n.split('.').slice(0,-1).join('.');const q=PAGES.find(x=>x.n===par);if(q)p.parent=q.id});
