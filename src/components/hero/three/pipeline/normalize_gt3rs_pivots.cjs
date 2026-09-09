// Quantization can move mesh-node origins while preserving their visible geometry.
// Wrap each compressed mesh in a stable, named assembly parent at the source pivot.
// The child retains all dequantization transforms. The binary payload is untouched.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = process.cwd();
const native = JSON.parse(fs.readFileSync(path.join(root, 'assets/3d/source/gt3rs-study/model-manifest.json'), 'utf8'));
for (const lod of ['high', 'medium', 'low']) {
  const file = path.join(root, 'public/3d/gt3rs-study', lod + '.glb');
  const data = fs.readFileSync(file);
  assert.equal(data.readUInt32LE(0), 0x46546c67);
  const jsonLength = data.readUInt32LE(12);
  const gltf = JSON.parse(data.subarray(20, 20 + jsonLength).toString());
  for (const part of native.parts) {
    const index = gltf.nodes.findIndex(node => node.name === part.name);
    assert.ok(index >= 0, `${lod}: missing ${part.name}`);
    const node = gltf.nodes[index];
    const home = [part.assembled[0], part.assembled[2], -part.assembled[1]].map(value => value === 0 ? 0 : value);
    if (node.extras?.farnsworthAssemblyPivot) {
      assert.deepEqual(node.translation, home, `${lod}: stale normalized pivot`);
      continue;
    }
    assert.ok(!node.matrix, `${lod}: unexpected matrix transform`);
    assert.ok(!gltf.nodes.some(parent => parent.children?.includes(index)), `${lod}: expected source part at scene root`);
    const parentIndex = gltf.nodes.length;
    gltf.nodes.push({ name: part.name, translation: home, children: [index], extras: { farnsworthAssemblyPivot: true } });
    node.name = part.name + '__geometry';
    node.translation = (node.translation || [0, 0, 0]).map((value, axis) => value - home[axis]);
    let replaced = false;
    for (const scene of gltf.scenes) {
      scene.nodes = scene.nodes.map(child => {
        if (child !== index) return child;
        replaced = true;
        return parentIndex;
      });
    }
    assert.ok(replaced, `${lod}: ${part.name} was not in a scene`);
  }
  const json = Buffer.from(JSON.stringify(gltf));
  const padded = Buffer.alloc(Math.ceil(json.length / 4) * 4, 0x20);
  json.copy(padded);
  const remainingChunks = data.subarray(20 + jsonLength);
  const header = Buffer.alloc(20);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(20 + padded.length + remainingChunks.length, 8);
  header.writeUInt32LE(padded.length, 12);
  header.writeUInt32LE(0x4e4f534a, 16);
  fs.writeFileSync(file, Buffer.concat([header, padded, remainingChunks]));
  console.log(`${lod}: ${native.parts.length} stable assembly pivots`);
}
