import { Mesh, Object3D, Vector3 } from "three";
import reference from "../../../../public/3d/reference/hero-composition.json";

export const COMPOSITION = reference;
export const SVG_BODY_LENGTH = 919;
export const SVG_WIDTH = 1200;
export const CAMERA_DIRECTION = new Vector3(4, 2.4, 10).normalize();
export const CAMERA_RIGHT = new Vector3().crossVectors(new Vector3(0, 1, 0), CAMERA_DIRECTION).normalize();
export const CAMERA_UP = new Vector3().crossVectors(CAMERA_DIRECTION, CAMERA_RIGHT).normalize();
export const FINAL_YAW = 7 * Math.PI / 180;
const vertical = new Vector3(0, 1, 0);

export type ProjectedBounds = { minX: number; maxX: number; minY: number; maxY: number };

/** Exact assembled vertex envelope, computed once per loaded LOD. */
export function measureModel(model: Object3D): ProjectedBounds {
  model.updateMatrixWorld(true);
  const bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
  const point = new Vector3();
  model.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const positions = object.geometry.getAttribute("position");
    for (let i = 0; i < positions.count; i++) {
      point.fromBufferAttribute(positions, i).applyMatrix4(object.matrixWorld).applyAxisAngle(vertical, FINAL_YAW);
      const x = point.dot(CAMERA_RIGHT), y = point.dot(CAMERA_UP);
      bounds.minX = Math.min(bounds.minX, x); bounds.maxX = Math.max(bounds.maxX, x);
      bounds.minY = Math.min(bounds.minY, y); bounds.maxY = Math.max(bounds.maxY, y);
    }
  });
  return bounds;
}

/** carBox is the exported SVG stage (1200 units wide), not its 919-unit body. */
export function frameModel(width: number, height: number, bounds: ProjectedBounds) {
  width = Math.max(width, 1); height = Math.max(height, 1);
  const { carBox, groundlineY, wordmarkBand } = COMPOSITION;
  const allowedTop = Math.max(carBox.y, wordmarkBand.y1 + .03);
  const pixelsPerUnit = Math.min(
    carBox.w * width * SVG_BODY_LENGTH / SVG_WIDTH / (bounds.maxX - bounds.minX),
    (groundlineY - allowedTop) * height / (bounds.maxY - bounds.minY),
  );
  const viewHeight = height / pixelsPerUnit;
  const centerX = (bounds.minX + bounds.maxX) / 2 + (.5 - carBox.x - carBox.w / 2) * width / pixelsPerUnit;
  const centerY = bounds.minY + (groundlineY - .5) * viewHeight;
  return { viewHeight, centerX, centerY, pixelsPerUnit };
}
