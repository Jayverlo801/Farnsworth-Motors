import {
  Mesh, MeshStandardMaterial, type Object3D,
  type Material, Texture, type BufferGeometry,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { PARTS } from "./parts";

export interface Palette {
  bg: string; bg2: string; surface: string; lineStrong: string;
  text: string; accent: string; warm: string;
}

export function readPalette(element: HTMLElement): Palette {
  const styles = getComputedStyle(element);
  const read = (name: string) => {
    const value = styles.getPropertyValue(name).trim();
    if (!value || !CSS.supports("color", value)) throw new Error("missing-design-tokens");
    return value;
  };
  return { bg: read("--bg"), bg2: read("--bg-2"), surface: read("--surface"),
    lineStrong: read("--line-strong"), text: read("--text"), accent: read("--accent"), warm: read("--accent-warm") };
}

/** Models belong to one mount. No useGLTF global cache or shared disposed resources. */
export async function loadGT3RS(url: string, signal: AbortSignal): Promise<Object3D> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("model-fetch-failed");
  const data = await response.arrayBuffer();
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.parseAsync(data, "/3d/gt3rs-study/");
  const root = gltf.scene;
  if (signal.aborted) { disposeObject(root); throw new DOMException("Aborted", "AbortError"); }
  if (PARTS.some((part) => {
    const node = root.getObjectByName(part.name);
    return !node || !node.userData.farnsworthAssemblyPivot ||
      node.position.toArray().some((value, axis) => Math.abs(value - part.home[axis]) > .0001);
  })) {
    disposeObject(root); throw new Error("model-parts-missing");
  }
  // Preserve the authored silver paint, black rubber/carbon, glazing and
  // yellow calipers. Page text/accent colors are not automotive materials.
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    object.castShadow = false; object.receiveShadow = false;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const mat of materials) {
      if (!(mat instanceof MeshStandardMaterial)) continue;
      mat.envMapIntensity = 1;
    }
  });
  root.userData.asset = url;
  return root;
}

export function disposeObject(object: Object3D) {
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();
  const textures = new Set<Texture>();
  object.traverse((child) => {
    if (!(child instanceof Mesh)) return;
    geometries.add(child.geometry);
    for (const mat of Array.isArray(child.material) ? child.material : [child.material]) {
      materials.add(mat);
      for (const value of Object.values(mat)) if (value instanceof Texture) textures.add(value);
    }
  });
  textures.forEach((texture) => {
    const image = texture.image as { close?: () => void } | undefined;
    image?.close?.(); texture.dispose();
  });
  materials.forEach((material) => material.dispose());
  geometries.forEach((geometry) => geometry.dispose());
}
