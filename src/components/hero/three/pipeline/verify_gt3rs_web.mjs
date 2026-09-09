// Decode the shipped files with the same Three.js loader/meshopt pair as the site.
// No browser shim or WebGL context is needed: these are self-contained PBR meshes.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { Box3, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const root = process.cwd();
const directory = path.join(root, 'public/3d/gt3rs-study');
const manifest = JSON.parse(await fs.readFile(path.join(directory, 'manifest.json'), 'utf8'));
await MeshoptDecoder.ready;
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const report = { passed: true, decoder: 'Three.js GLTFLoader + MeshoptDecoder', lods: {} };

for (const [lod, expected] of Object.entries(manifest.lods)) {
  const bytes = await fs.readFile(path.join(directory, `${lod}.glb`));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), expected.sha256, `${lod}: compressed file changed since packaging`);
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  const { scene } = await loader.parseAsync(buffer, '');
  scene.updateMatrixWorld(true);
  let triangles = 0;
  let drawMeshes = 0;
  let maxHomeError = 0;
  const materials = new Set();
  for (const part of manifest.parts) {
    const object = scene.getObjectByName(part.name);
    assert.ok(object, `${lod}: missing assembly component ${part.name}`);
    const position = object.getWorldPosition(new Vector3());
    const error = position.distanceTo(new Vector3(...part.home));
    assert.ok(object.userData.farnsworthAssemblyPivot, `${lod}: missing stable pivot wrapper`);
    assert.ok(error < 0.00001, `${lod}: ${part.name} is not at its assembled transform: ${error}`);
    maxHomeError = Math.max(maxHomeError, error);
    let partMeshes = 0;
    object.traverse(child => { if (child.isMesh) partMeshes++; });
    assert.ok(partMeshes, `${lod}: ${part.name} has no renderable geometry`);
  }
  scene.traverse(object => {
    if (!object.isMesh) return;
    drawMeshes++;
    const geometry = object.geometry;
    const positions = geometry.getAttribute('position');
    const normals = geometry.getAttribute('normal');
    assert.ok(positions && normals, `${lod}/${object.name}: missing positions/normals`);
    for (const attribute of [positions, normals]) {
      for (let i = 0; i < attribute.count; i++) {
        assert.ok(Number.isFinite(attribute.getX(i)) && Number.isFinite(attribute.getY(i)) && Number.isFinite(attribute.getZ(i)), `${lod}/${object.name}: non-finite decoded geometry`);
      }
    }
    const index = geometry.getIndex();
    assert.ok(index, `${lod}/${object.name}: missing indices`);
    for (let i = 0; i < index.count; i++) assert.ok(index.getX(i) < positions.count, `${lod}: invalid index`);
    triangles += index.count / 3;
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      assert.ok(material.isMeshStandardMaterial || material.isMeshPhysicalMaterial);
      materials.add(material.name);
    }
  });
  assert.equal(triangles, expected.triangles, `${lod}: decoded triangle count mismatch`);
  assert.equal(bytes.byteLength, expected.bytes, `${lod}: stale manifest byte count`);
  const bounds = new Box3().setFromObject(scene);
  const raw = await fs.readFile(path.join(root, 'assets/3d/source/gt3rs-study', `gt3rs-study-${lod}-raw.glb`));
  const rawScene = (await loader.parseAsync(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength), '')).scene;
  rawScene.updateMatrixWorld(true);
  const rawBounds = new Box3().setFromObject(rawScene);
  const boundsError = Math.max(bounds.min.distanceTo(rawBounds.min), bounds.max.distanceTo(rawBounds.max));
  assert.ok(boundsError < 0.001, `${lod}: decoded bounds moved more than 1 mm during compression`);
  let maxPartBoundsError = 0;
  for (const part of manifest.parts) {
    const a = new Box3().setFromObject(scene.getObjectByName(part.name));
    const b = new Box3().setFromObject(rawScene.getObjectByName(part.name));
    const error = Math.max(a.min.distanceTo(b.min), a.max.distanceTo(b.max));
    assert.ok(error < 0.001, `${lod}/${part.name}: component geometry shifted during compression`);
    maxPartBoundsError = Math.max(maxPartBoundsError, error);
  }
  const size = bounds.getSize(new Vector3());
  assert.ok(size.x > 4 && size.x < 5.5 && size.y > 1 && size.y < 2.5 && size.z > 1.5 && size.z < 3, `${lod}: bad dimensions or axis conversion`);
  report.lods[lod] = { sha256: expected.sha256, parts: manifest.parts.length, drawMeshes, triangles, maxHomeErrorMeters: maxHomeError, compressionBoundsErrorMeters: boundsError, maxPartBoundsErrorMeters: maxPartBoundsError, sizeMeters: size.toArray(), materials: [...materials].sort() };
}
await fs.writeFile(path.join(root, 'assets/3d/source/gt3rs-study/web-verification.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
