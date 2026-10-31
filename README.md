# Tunnel Diode Lab · Resonant Tunneling Lab

Interactive study companions for two parts of the Professional EEE study guide. Every section and subsection has its
explanation on the left and one or more live visualisations on the right: 3D scenes (Three.js), interactive plots,
circuit simulations and step-by-step calculators.

| Page | Guide | Coverage |
| --- | --- | --- |
| `index.html` | Part 5 — Tunnel Diode: Current-Voltage Characteristics and Device Performance | sections 1 → 25.4 (72 pages) |
| `rtd.html` | Part 6 — Resonant-Tunneling Diode | sections 1 → 32.4 (95 pages) |

Open either file in a browser. Three.js r128 (MIT, `src/vendor/`) is embedded, so 3D works without any CDN; only the fonts come from Google Fonts.

## Structure

| File | Contents |
| --- | --- |
| `src/head.html`, `src/body.html` | Styles (light/dark tokens) and page shell |
| `src/core.js` | Math typesetting, physics model (J = J_t + J_x + J_d, Eq. 24 tunnelling, Z_in, f_r, f_x), 2D plotter, 3D helpers |
| `src/views2d.js` | Plots and simulations: I-V, state overlap, transmission, E_x, T_t, ln J_x, diffusion, Eq. 29 lab, slopes, PVR, temperature, Z_in(f), stability map, RK4 oscillator, switching, load line, amplifier, worked-example calculator |
| `src/views3d.js` | 3D scenes: topic map, complex wavefunction through a barrier, junction crystal, energy-band diagram with excess-current routes, surfaces, current curtains, fabrication animations, equivalent circuit, C_j, spreading resistance, Z_in locus |
| `src/part5/content.js` | Part 5 text and the views each section offers |
| `src/part6/rtd.js` | Part 6 physics (finite-well levels, transfer-matrix T(E) and ψ(x), resonance-model J-V from Eqs. 64–66) and its 2D/3D views |
| `src/part6/content.js` | Part 6 text and the views each section offers |
| `src/app.js` | Routing, view tabs, controls, readouts, render loop |

Rebuild both pages after editing `src/` (pass a directory to also write artifact-ready copies without the document skeleton):

```bash
./build.sh
```

## Model notes

- Material curves (Si, Ge, GaSb, GaAs) use Eq. 29 with the valley current tuned so each reproduces the guide's PVR (4, 8, 12, 28).
- The worked example (section 24) reproduces the guide's R_min = 10 Ω, f_r0 ≈ 47.7 GHz, f_x0 ≈ 69.4 GHz and 20 V/ns.
- Eq. 34 is implemented with the 2π factor the guide flags as missing from its printed page.
- The supplied Part 5 PDF ends partway through section 25.4; content after that point is not covered.

### Part 6

- T(E) and ψ(x) are exact transfer-matrix solutions (constant effective mass, linear bias drop across barrier–well–barrier).
- The J-V uses the guide's resonance picture: Breit–Wigner peaks of height 4T_ET_C/(T_E+T_C)² and width ħ/τ at E_n − f·qV
  (f = 1/2 for symmetric barriers, Eq. 71), integrated against the Tsu–Esaki supply (Eq. 66), plus a phenomenological
  thermionic/leakage background ∝ T²e^{−qΦ_B/kT}. Defaults give V_P ≈ 0.20 V (ideal 2E₁/q = 0.215 V), J_P ≈ 3×10⁵ A/cm², PVR ≈ 7 at 300 K.
- Checks: infinite-well E₁ = 0.2245 eV for W = 5 nm, m* = 0.067m₀ (guide: 0.225 eV); symmetric resonance T = 1; 0.1/0.01 ⇒ 0.331; r_d = −62.5 Ω.
- The supplied Part 6 PDF has 26 of 31 pages and ends after section 32.4.
