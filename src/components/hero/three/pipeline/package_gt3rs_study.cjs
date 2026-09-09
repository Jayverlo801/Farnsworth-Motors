// Encode genuine Blender renders and verify the separately compressed web models.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const sharp=require('sharp');
const root=process.cwd();
const source=path.join(root,'assets/3d/source/gt3rs-study');
const output=path.join(root,'public/3d/gt3rs-study');
const native=JSON.parse(fs.readFileSync(path.join(source,'model-manifest.json'),'utf8'));
const checked=JSON.parse(fs.readFileSync(path.join(source,'verification.json'),'utf8'));
assert.equal(checked.passed,true);
assert.equal(checked.sourceTriangles,native.sourceTriangles,'Stale native verification');
assert.equal(checked.sourceSha256,createHash('sha256').update(fs.readFileSync(path.join(source,'gt3rs-study.blend'))).digest('hex'),'Native source changed since verification');
const manifest={id:'gt3rs-inspired-study',description:native.description,
  status:'model-ready; homepage integration separate',coordinates:'glTF: X nose, Y up, Z vehicle right',
  authoredIn:'Blender 4.5',sourceTriangles:native.sourceTriangles,
  parts:native.parts.map(p=>({name:p.name,stage:p.stage,
    home:[p.assembled[0],p.assembled[2],-p.assembled[1]],
    offset:[p.explodedOffset[0],p.explodedOffset[2],-p.explodedOffset[1]],
    startSeconds:(p.startFrame-1)/30,durationSeconds:(p.endFrame-p.startFrame)/30})),
  lods:{},renders:{},limitations:['Not factory CAD or an exact Porsche replica.','Procedural carbon weave is retained in the Blender source; web materials use the neutral PBR base.','No baked AO atlas yet. WebGL lighting, fallback parity, and device performance remain integration work.']};
for(const [lod,trisMax,bytesMax]of [['high',120000,2500000],['medium',60000,1500000],['low',30000,800000]]){
  const file=path.join(output,lod+'.glb'),data=fs.readFileSync(file);
  assert.equal(data.readUInt32LE(0),0x46546c67);
  assert.equal(data.readUInt32LE(4),2);
  const gltf=JSON.parse(data.subarray(20,20+data.readUInt32LE(12)).toString());
  const names=new Set(gltf.nodes.map(n=>n.name));
  for(const p of native.parts)assert.ok(names.has(p.name),`${lod}: ${p.name} lost`);
  for(const p of native.parts)assert.ok(gltf.nodes.find(n=>n.name===p.name)?.extras?.farnsworthAssemblyPivot,`${lod}: run normalize_gt3rs_pivots.cjs first`);
  const tris=gltf.meshes.reduce((sum,m)=>sum+m.primitives.reduce((n,p)=>n+gltf.accessors[p.indices].count/3,0),0);
  assert.ok(tris<=trisMax,`${lod} triangles: ${tris}`);
  assert.ok(data.length<=bytesMax,`${lod} bytes: ${data.length}`);
  assert.ok(gltf.extensionsRequired.includes('EXT_meshopt_compression'));
  manifest.lods[lod]={url:`/3d/gt3rs-study/${lod}.glb`,triangles:tris,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex'),parts:native.parts.length};
}
(async()=>{
  for(const name of ['hero','rear','side','exploded']){
    const src=path.join(source,name+'.png');const metadata=await sharp(src).metadata();
    assert.equal(metadata.width,3000);assert.equal(metadata.height,1875);
    const file=path.join(output,name+'.webp');
    await sharp(src).resize(2400,1500).webp({quality:94,effort:6}).toFile(file);
    manifest.renders[name]={url:`/3d/gt3rs-study/${name}.webp`,width:2400,height:1500,bytes:fs.statSync(file).size};
  }
  fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2));
  console.log(JSON.stringify({passed:true,lods:manifest.lods,renders:manifest.renders},null,2));
})().catch(error=>{console.error(error);process.exitCode=1});
