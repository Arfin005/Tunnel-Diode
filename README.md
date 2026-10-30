# Tunnel Diode Lab

An interactive study companion for **Tunnel Diode: Current-Voltage Characteristics and Device Performance (Part 5)**.
Every section and subsection of the guide (1 → 25.4, 72 pages) has its explanation on the left and one or more live
visualisations on the right: 3D scenes (Three.js), interactive plots, circuit simulations and a step-by-step calculator.

Open `index.html` in a browser (it loads Three.js r128 from cdnjs and fonts from Google Fonts).

## Structure

| File | Contents |
| --- | --- |
| `src/head.html`, `src/body.html` | Styles (light/dark tokens) and page shell |
| `src/core.js` | Math typesetting, physics model (J = J_t + J_x + J_d, Eq. 24 tunnelling, Z_in, f_r, f_x), 2D plotter, 3D helpers |
| `src/views2d.js` | Plots and simulations: I-V, state overlap, transmission, E_x, T_t, ln J_x, diffusion, Eq. 29 lab, slopes, PVR, temperature, Z_in(f), stability map, RK4 oscillator, switching, load line, amplifier, worked-example calculator |
| `src/views3d.js` | 3D scenes: topic map, complex wavefunction through a barrier, junction crystal, energy-band diagram with excess-current routes, surfaces, current curtains, fabrication animations, equivalent circuit, C_j, spreading resistance, Z_in locus |
| `src/content.js` | Text of every section/subsection and which views each one offers |
| `src/app.js` | Routing, view tabs, controls, readouts, render loop |

Rebuild after editing `src/`:

```bash
./build.sh
```

## Model notes

- Material curves (Si, Ge, GaSb, GaAs) use Eq. 29 with the valley current tuned so each reproduces the guide's PVR (4, 8, 12, 28).
- The worked example (section 24) reproduces the guide's R_min = 10 Ω, f_r0 ≈ 47.7 GHz, f_x0 ≈ 69.4 GHz and 20 V/ns.
- Eq. 34 is implemented with the 2π factor the guide flags as missing from its printed page.
- The supplied PDF ends partway through section 25.4; content after that point is not covered.
