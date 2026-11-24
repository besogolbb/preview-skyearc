"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Lightweight Three.js blueprint overlay for the dark photo hero: a glowing
 * ground grid and a wireframe house that draws itself in, then turns slowly.
 * Lines blend additively, so they read as light over the navy shade.
 *
 * The CSS grid (.blueprint-fallback) is always rendered underneath and is the
 * whole overlay on phones (<768px), under prefers-reduced-motion, or when
 * WebGL is unavailable. three.js is only downloaded when it will run.
 */
export default function BlueprintCanvas({ color: lineColor = "#5ec8e5" }: { color?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    const small = window.matchMedia("(max-width: 767px)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (small.matches || still.matches || !hasWebGL()) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    import("three").then((THREE) => {
      if (disposed || !el) return;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);
      el.appendChild(renderer.domElement);
      renderer.domElement.setAttribute("aria-hidden", "true");

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);

      const color = new THREE.Color(lineColor);
      const lineMat = (opacity: number) =>
        new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending });

      const group = new THREE.Group();
      scene.add(group);

      // Ground grid
      const grid: number[] = [];
      const N = 30;
      const S = 1.2;
      for (let i = -N; i <= N; i++) {
        grid.push(-N * S, 0, i * S, N * S, 0, i * S);
        grid.push(i * S, 0, -N * S, i * S, 0, N * S);
      }
      const gridGeo = new THREE.BufferGeometry();
      gridGeo.setAttribute("position", new THREE.Float32BufferAttribute(grid, 3));
      const gridMat = lineMat(0.1);
      group.add(new THREE.LineSegments(gridGeo, gridMat));

      // House: gable box + roof + door/window outlines + footprint offset
      const W = 6, D = 4.4, H = 3, R = 1.9;
      const x0 = -W / 2, x1 = W / 2, z0 = -D / 2, z1 = D / 2;
      const segs: number[] = [];
      const seg = (a: number[], b: number[]) => segs.push(...a, ...b);
      // footprint + top plate
      for (const y of [0, H]) {
        seg([x0, y, z0], [x1, y, z0]); seg([x1, y, z0], [x1, y, z1]);
        seg([x1, y, z1], [x0, y, z1]); seg([x0, y, z1], [x0, y, z0]);
      }
      // studs at corners and along long walls
      for (const x of [x0, x0 + W / 3, x0 + (2 * W) / 3, x1]) { seg([x, 0, z0], [x, H, z0]); seg([x, 0, z1], [x, H, z1]); }
      // gable ends + ridge
      seg([x0, H, z0], [x0, H + R, 0]); seg([x0, H + R, 0], [x0, H, z1]);
      seg([x1, H, z0], [x1, H + R, 0]); seg([x1, H + R, 0], [x1, H, z1]);
      seg([x0, H + R, 0], [x1, H + R, 0]);
      // rafters
      for (const x of [x0 + W / 4, 0, x1 - W / 4]) { seg([x, H, z0], [x, H + R, 0]); seg([x, H + R, 0], [x, H, z1]); }
      // door + window on the front wall (z1)
      seg([-0.5, 0, z1], [-0.5, 2.1, z1]); seg([-0.5, 2.1, z1], [0.5, 2.1, z1]); seg([0.5, 2.1, z1], [0.5, 0, z1]);
      seg([1.4, 1.0, z1], [2.4, 1.0, z1]); seg([2.4, 1.0, z1], [2.4, 2.1, z1]);
      seg([2.4, 2.1, z1], [1.4, 2.1, z1]); seg([1.4, 2.1, z1], [1.4, 1.0, z1]);
      seg([-2.4, 1.0, z1], [-1.4, 1.0, z1]); seg([-1.4, 1.0, z1], [-1.4, 2.1, z1]);
      seg([-1.4, 2.1, z1], [-2.4, 2.1, z1]); seg([-2.4, 2.1, z1], [-2.4, 1.0, z1]);
      // dimension line in front of the house
      const dz = z1 + 1.1;
      seg([x0, 0.01, dz], [x1, 0.01, dz]);
      seg([x0, 0.01, dz - 0.25], [x0, 0.01, dz + 0.25]);
      seg([x1, 0.01, dz - 0.25], [x1, 0.01, dz + 0.25]);

      const houseGeo = new THREE.BufferGeometry();
      houseGeo.setAttribute("position", new THREE.Float32BufferAttribute(segs, 3));
      const vertexCount = segs.length / 3;
      houseGeo.setDrawRange(0, 0);
      const houseMat = lineMat(0.5);
      const house = new THREE.LineSegments(houseGeo, houseMat);
      group.add(house);

      const fit = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / Math.max(h, 1);
        // Keep the house in the right half on wide screens
        camera.setViewOffset(w, h, -w * 0.13, -h * 0.02, w, h);
        camera.position.set(12, 7.5, 13.5);
        camera.lookAt(0, 1.6, 0);
        camera.updateProjectionMatrix();
      };
      fit();
      const ro = new ResizeObserver(fit);
      ro.observe(el);

      let raf = 0;
      let running = false;
      const t0 = performance.now();
      const DRAW_MS = 1800;

      const frame = (now: number) => {
        const t = now - t0;
        const p = Math.min(t / DRAW_MS, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        houseGeo.setDrawRange(0, Math.floor((eased * vertexCount) / 2) * 2);
        group.rotation.y = -0.35 + Math.sin(t / 14000) * 0.22;
        renderer.render(scene, camera);
        if (running) raf = requestAnimationFrame(frame);
      };
      const start = () => { if (!running) { running = true; raf = requestAnimationFrame(frame); } };
      const stop = () => { running = false; cancelAnimationFrame(raf); };

      const io = new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? start() : stop()));
      io.observe(el);
      const onVis = () => (document.hidden ? stop() : start());
      document.addEventListener("visibilitychange", onVis);

      // If the viewer flips to reduced motion or a narrow window, drop back to the gradient.
      const onChange = () => { if (small.matches || still.matches) { cleanup?.(); setLive(false); } };
      small.addEventListener("change", onChange);
      still.addEventListener("change", onChange);

      setLive(true);

      cleanup = () => {
        stop();
        io.disconnect();
        ro.disconnect();
        document.removeEventListener("visibilitychange", onVis);
        small.removeEventListener("change", onChange);
        still.removeEventListener("change", onChange);
        gridGeo.dispose(); houseGeo.dispose(); gridMat.dispose(); houseMat.dispose();
        renderer.dispose();
        renderer.domElement.remove();
        cleanup = undefined;
      };
    }).catch(() => {
      /* three failed to load: the CSS gradient stays */
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [lineColor]);

  return (
    <div className="blueprint" data-live={live || undefined} aria-hidden="true">
      <div className="blueprint-fallback" />
      <div ref={host} className="blueprint-canvas" />
    </div>
  );
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
