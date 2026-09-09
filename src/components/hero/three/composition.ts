import { Mesh, Object3D, Vector3 } from "three";
import { PARTS } from "./parts";

export const CAMERA_DIRECTION = new Vector3(5.8, 3.3, 8.6).normalize();
export const CAMERA_RIGHT = new Vector3().crossVectors(new Vector3(0, 1, 0), CAMERA_DIRECTION).normalize();
export const CAMERA_UP = new Vector3().crossVectors(CAMERA_DIRECTION, CAMERA_RIGHT).normalize();
export const FINAL_YAW = 0;
const vertical = new Vector3(0, 1, 0);

export type ProjectedBounds = { minX: number; maxX: number; minY: number; maxY: number };

/** Exact assembled vertex envelope, computed once per loaded LOD. */
export function measureModel(model: Object3D, exploded = false): ProjectedBounds {
  model.updateMatrixWorld(true);
  const bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
  const point = new Vector3();
  const offsets = new Map(PARTS.map((part) => [part.name, new Vector3(...part.offset)]));
  model.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    let parent: Object3D | null = object;
    while (parent && !offsets.has(parent.name)) parent = parent.parent;
    const offset = exploded && parent ? offsets.get(parent.name) : undefined;
    const positions = object.geometry.getAttribute("position");
    for (let i = 0; i < positions.count; i++) {
      point.fromBufferAttribute(positions, i).applyMatrix4(object.matrixWorld);
      if (offset) point.add(offset);
      point.applyAxisAngle(vertical, FINAL_YAW);
      const x = point.dot(CAMERA_RIGHT), y = point.dot(CAMERA_UP);
      bounds.minX = Math.min(bounds.minX, x); bounds.maxX = Math.max(bounds.maxX, x);
      bounds.minY = Math.min(bounds.minY, y); bounds.maxY = Math.max(bounds.maxY, y);
    }
  });
  return bounds;
}

/** Frame the actual Porsche envelope, with independent portrait composition. */
export function frameModel(width: number, height: number, bounds: ProjectedBounds) {
  width = Math.max(width, 1); height = Math.max(height, 1);
  const portrait = width < 768;
  const groundlineY = portrait ? .80 : .87;
  const allowedTop = portrait ? .42 : .43;
  const pixelsPerUnit = Math.min(
    (portrait ? .94 : .80) * width / (bounds.maxX - bounds.minX),
    (groundlineY - allowedTop) * height / (bounds.maxY - bounds.minY),
  );
  const viewHeight = height / pixelsPerUnit;
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = bounds.minY + (groundlineY - .5) * viewHeight;
  return { viewHeight, centerX, centerY, pixelsPerUnit };
}
