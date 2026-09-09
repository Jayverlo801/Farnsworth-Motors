"use client";

/* eslint-disable react-hooks/immutability -- R3F exposes mutable Three.js scene/renderer objects; mutation in useFrame is its documented rendering API, not React state mutation. */

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei/core/Environment";
import {
  AgXToneMapping, Color, Fog, Group, MathUtils, Matrix4, Mesh, Object3D,
  Quaternion, RectAreaLight, Vector3, type OrthographicCamera,
} from "three";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import type { HeroSceneProps } from "../types";
import { loadGT3RS, disposeObject, type Palette } from "./model";
import { PARTS } from "./parts";
import { CAMERA_DIRECTION, CAMERA_RIGHT, CAMERA_UP, frameModel, measureModel } from "./composition";
import { completionProgress, partProgress, pushProgress, smoothstep, FrameHealth,
  FULL_ASSEMBLED, SHORT_ASSEMBLED, FULL_END, SHORT_END } from "./timeline";

const MAX_DPR = { high: 2, medium: 1.5, low: 1 };
// Land above the continuous hood surface, away from door seams and the cabin.
const paintCamera = new Vector3(1.55, 1.43, .09);
const paintTarget = new Vector3(1.48, 1.09, -.18);

type Props = HeroSceneProps & { palette: Palette; fail: (reason: string) => void };

export function Reconstruction({ mode, quality, paused, scrollProgress, onReady, onAssembled, palette, fail }: Props) {
  const { gl, camera, scene, size, setDpr, invalidate } = useThree();
  const [model, setModel] = useState<Object3D | null>(null);
  const vehicle = useRef<Group>(null);
  const sweep = useRef<RectAreaLight>(null);
  const callbacks = useRef({ onReady, onAssembled, fail });
  const played = useRef({ time: 0, ready: false, assembled: false, resume: true, warmupFrames: 3, lastModel: null as Object3D | null });
  const assembledNotified = useRef(false);
  const health = useRef(new FrameHealth());
  const dpr = useRef(1);
  const pointer = useRef({ x: 0, y: 0 });
  const currentPointer = useRef({ x: 0, y: 0 });
  const target = useMemo(() => new Vector3(), []);
  const position = useMemo(() => new Vector3(), []);
  const fog = useMemo(() => new Fog(palette.bg, 15, 32), [palette.bg]);
  const background = useMemo(() => new Color(palette.bg), [palette.bg]);
  const bounds = useMemo(() => model ? measureModel(model) : null, [model]);
  const explodedBounds = useMemo(() => model ? measureModel(model, true) : null, [model]);
  const framing = useMemo(() => bounds ? frameModel(size.width, size.height, bounds) : null, [bounds, size.width, size.height]);
  const explodedFraming = useMemo(() => explodedBounds ? frameModel(size.width, size.height, explodedBounds) : null, [explodedBounds, size.width, size.height]);

  useEffect(() => { callbacks.current = { onReady, onAssembled, fail }; }, [onReady, onAssembled, fail]);

  useEffect(() => {
    RectAreaLightUniformsLib.init();
    gl.toneMapping = AgXToneMapping;
    gl.transmissionResolutionScale = .5;
    gl.autoClear = false;
    gl.setClearColor(background, 1);
    scene.background = background;
    scene.fog = fog;
    const canvas = gl.domElement;
    const contextLost = (event: Event) => { event.preventDefault(); callbacks.current.fail("context-lost"); };
    canvas.addEventListener("webglcontextlost", contextLost);
    // Input capability comes from the actual event, without device/media queries.
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || mode === "static") return;
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      pointer.current.x = MathUtils.clamp((event.clientX - bounds.left) / bounds.width * 2 - 1, -1, 1);
      pointer.current.y = MathUtils.clamp((event.clientY - bounds.top) / bounds.height * 2 - 1, -1, 1);
    };
    const leave = () => { pointer.current.x = 0; pointer.current.y = 0; };
    // The canvas does not intercept page links; use the enclosing hero as input surface.
    const input = canvas.closest("section") ?? canvas.parentElement?.parentElement?.parentElement;
    if (!paused) {
      input?.addEventListener("pointermove", move as EventListener, { passive: true });
      input?.addEventListener("pointerleave", leave, { passive: true });
    }
    return () => {
      canvas.removeEventListener("webglcontextlost", contextLost);
      input?.removeEventListener("pointermove", move as EventListener);
      input?.removeEventListener("pointerleave", leave);
    };
  }, [background, camera, fog, gl, mode, paused, scene]);

  useEffect(() => {
    dpr.current = Math.min(window.devicePixelRatio || 1, MAX_DPR[quality]);
    setDpr(dpr.current);
    health.current.reset();
  }, [quality, setDpr]);

  useEffect(() => {
    played.current.resume = true;
    health.current.reset();
    if (!paused) invalidate();
  }, [paused, invalidate]);

  useEffect(() => {
    if (paused || mode !== "static") return;
    return scrollProgress.on("change", () => invalidate());
  }, [invalidate, mode, paused, scrollProgress]);

  useEffect(() => {
    const controller = new AbortController();
    const owned = new Set<Object3D>();
    queueMicrotask(() => { if (!controller.signal.aborted) setModel(null); });
    async function load() {
      // The draft low LOD has surface damage; never flash it as a bootstrap.
      // High is only 780 KB, so load the selected quality directly.
      if (quality === "low") { callbacks.current.fail("low-quality-poster"); return; }
      const loaded = await loadGT3RS(`/3d/gt3rs-study/${quality}.glb`, controller.signal);
      if (controller.signal.aborted) { disposeObject(loaded); return; }
      owned.add(loaded);
      setModel(loaded);
    }
    void load().catch((error: unknown) => {
      if (!controller.signal.aborted) callbacks.current.fail(error instanceof Error && error.message === "model-parts-missing" ? error.message : "model-fetch-failed");
    });
    return () => {
      controller.abort();
      owned.forEach(disposeObject);
    };
  }, [quality]);

  // A primitive's resources are intentionally not disposed by R3F. We own them above.
  const parts = useMemo(() => model ? PARTS.map((part) => {
    const object = model.getObjectByName(part.name)!;
    return { object, home: object.position.clone(),
      offset: new Vector3(...part.offset) };
  }) : [], [model]);

  useEffect(() => () => {
    gl.renderLists.dispose();
  }, [gl]);

  useFrame((_, rawDelta) => {
    if (paused || !model || !vehicle.current || !framing || !explodedFraming) return;
    const state = played.current;
    const newModel = state.lastModel !== model;
    const resumed = state.resume;
    state.resume = false;
    const delta = resumed || newModel ? 0 : Math.min(rawDelta, .1);
    const end = mode === "full" ? FULL_END : mode === "short" ? SHORT_END : 0;
    state.time = Math.min(end, state.time + delta);
    state.lastModel = model;
    if (newModel) state.warmupFrames = 3;
    if (newModel || resumed) health.current.reset();
    const completion = completionProgress(state.time, mode);
    const assembleAt = mode === "full" ? FULL_ASSEMBLED : mode === "short" ? SHORT_ASSEMBLED : 0;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const p = partProgress(i, state.time, mode);
      const remaining = 1 - p;
      part.object.position.copy(part.home).addScaledVector(part.offset, remaining);
    }
    vehicle.current.position.y = 0;
    vehicle.current.rotation.y = 0;
    if (state.time >= assembleAt && !state.assembled) {
      state.assembled = true;
      // Notify after this assembled frame is rendered, below.
    }
    const p = pushProgress(scrollProgress.get());
    const frameProgress = mode === "full" ? smoothstep(state.time / FULL_ASSEMBLED) : 1;
    target.copy(CAMERA_RIGHT).multiplyScalar(MathUtils.lerp(explodedFraming.centerX, framing.centerX, frameProgress))
      .addScaledVector(CAMERA_UP, MathUtils.lerp(explodedFraming.centerY, framing.centerY, frameProgress));
    position.copy(target).addScaledVector(CAMERA_DIRECTION, 12).lerp(paintCamera, p);
    target.lerp(paintTarget, p);
    if (state.assembled && mode !== "static") {
      const damping = 1 - Math.exp(-delta * 4);
      currentPointer.current.x += (pointer.current.x - currentPointer.current.x) * damping;
      currentPointer.current.y += (pointer.current.y - currentPointer.current.y) * damping;
      const yaw = currentPointer.current.x * MathUtils.degToRad(1.5) * (1-p);
      const x = position.x, z = position.z;
      position.x = x * Math.cos(yaw) - z * Math.sin(yaw);
      position.z = x * Math.sin(yaw) + z * Math.cos(yaw);
      position.y += currentPointer.current.y * .10 * (1-p);
    }
    camera.position.copy(position); camera.lookAt(target);
    const ortho = camera as OrthographicCamera;
    const viewHeight = MathUtils.lerp(MathUtils.lerp(explodedFraming.viewHeight, framing.viewHeight, frameProgress), .32, p);
    ortho.top = viewHeight / 2; ortho.bottom = -viewHeight / 2;
    ortho.right = viewHeight * size.width / Math.max(size.height, 1) / 2; ortho.left = -ortho.right;
    ortho.updateProjectionMatrix();
    gl.toneMappingExposure = 1.1 - .15 * p;
    // Fog softens the final silhouette; it is the same token as the page background.
    fog.near = MathUtils.lerp(20, .025, p);
    fog.far = MathUtils.lerp(40, .65, p);
    if (sweep.current) {
      sweep.current.position.set(-4 + completion * 8, 3.3, 1.5);
      sweep.current.lookAt(0, .8, 0);
      sweep.current.intensity = mode === "static" ? 0 : Math.sin(completion * Math.PI) * .5;
    }
    // Priority 1 takes over rendering. onReady is strictly AFTER the first real draw.
    // Reserve the wordmark band even during exploded parts / the paint push.
    gl.setScissorTest(false); gl.setClearColor(background, 1); gl.clear();
    gl.setScissor(0, 0, size.width, size.height * (size.width < 768 ? .62 : .60));
    gl.setScissorTest(true); gl.render(scene, camera); gl.setScissorTest(false);
    if (!state.ready) { state.ready = true; callbacks.current.onReady(); }
    if (state.assembled && !assembledNotified.current) {
      assembledNotified.current = true; callbacks.current.onAssembled();
    }
    // Initial paint/transmission shader compilation and GPU uploads are not
    // steady-state frame rate. Exclude their first three presented frames;
    // the unchanged two-second guard still handles genuinely slow animation.
    if (state.warmupFrames > 0) { state.warmupFrames--; health.current.reset(); return; }
    if (newModel || resumed || mode === "static") return;
    const sample = health.current.sample(rawDelta);
    if (!sample) return;
    if (sample.unavailable) { callbacks.current.fail("low-fps"); return; }
    // Reductions only: prevents quality oscillation on marginal devices.
    if (sample.fps < 45 && dpr.current > .8) {
      dpr.current = Math.max(.8, dpr.current - .2); setDpr(dpr.current);
    }
  }, 1);

  return <>
    <Environment files="/3d/studio-neutral.hdr" background={false} environmentIntensity={.8} />
    <rectAreaLight color={palette.surface} intensity={6} width={5} height={2.4} position={[1.6, 4.5, 3]} rotation={[-1.02, .2, 0]} />
    <rectAreaLight color={palette.surface} intensity={4} width={4} height={.7} position={[-3, 2.8, -2.6]} rotation={[-.6, -2.3, 0]} />
    <rectAreaLight ref={sweep} color={palette.surface} intensity={0} width={.5} height={4} />
    <group ref={vehicle}>{model && <primitive object={model} dispose={null} />}</group>
    <ContactShadow color={palette.bg2} />
    {bounds && framing && <GroundLine color={palette.lineStrong} low={bounds.minY} width={(bounds.maxX-bounds.minX)*1.15} pixelSize={1/framing.pixelsPerUnit} />}
  </>;
}

/** Screen-aligned contact hairline, registered to the tire envelope. */
function GroundLine({ color, low, width, pixelSize }: { color: string; low: number; width: number; pixelSize: number }) {
  const uniforms = useMemo(() => ({ shade: { value: new Color(color) } }), [color]);
  const quaternion = useMemo(() => new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(CAMERA_RIGHT, CAMERA_UP, CAMERA_DIRECTION)), []);
  const position = useMemo(() => CAMERA_UP.clone().multiplyScalar(low), [low]);
  return <mesh position={position} quaternion={quaternion} renderOrder={10}>
    <planeGeometry args={[width, pixelSize]} />
    <shaderMaterial transparent depthWrite={false} depthTest={false} uniforms={uniforms}
      vertexShader="varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}"
      fragmentShader={"uniform vec3 shade; varying vec2 vUv; void main(){float a=smoothstep(0.,.3,vUv.x)*smoothstep(0.,.3,1.-vUv.x)*.55;gl_FragColor=vec4(shade,a);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}"} />
  </mesh>;
}

/** Analytic soft contact shadow: one draw, no offscreen shadow-camera passes. */
function ContactShadow({ color }: { color: string }) {
  const mesh = useRef<Mesh>(null);
  const uniforms = useMemo(() => ({ shade: { value: new Color(color) } }), [color]);
  return <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, .018, 0]} renderOrder={-1}>
    <planeGeometry args={[6.5, 3.1]} />
    <shaderMaterial transparent depthWrite={false} uniforms={uniforms}
      vertexShader="varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}"
      fragmentShader={"uniform vec3 shade; varying vec2 vUv; void main(){vec2 p=(vUv-.5)*2.;float a=exp(-3.6*dot(p,p))*.38;gl_FragColor=vec4(shade*.2,a);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}"} />
  </mesh>;
}
