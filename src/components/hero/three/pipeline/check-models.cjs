const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const budgets={high:[120000,2500000],medium:[60000,1500000],low:[30000,800000]};
const contract=fs.readFileSync(path.join(__dirname,'../parts.ts'),'utf8').split('] as const')[0].match(/"[a-zA-Z_]+"/g).map(x=>JSON.parse(x));
const results={};
for(const [lod,[triMax,byteMax]]of Object.entries(budgets)){
  const buffer=fs.readFileSync('public/3d/coupe-'+lod+'.glb');
  assert.equal(buffer.readUInt32LE(0),0x46546c67);
  const gltf=JSON.parse(buffer.subarray(20,20+buffer.readUInt32LE(12)).toString());
  const names=new Set(gltf.nodes.map(n=>n.name));
  for(const name of contract)assert.ok(names.has(name),lod+': '+name);
  let triangles=0;
  for(const mesh of gltf.meshes)for(const primitive of mesh.primitives){
    triangles+=gltf.accessors[primitive.indices].count/3;
  }
  assert.ok(triangles<=triMax,`Triangle budget ${lod}: ${triangles}`);
  assert.ok(buffer.length<=byteMax,`Wire budget ${lod}: ${buffer.length}`);
  assert.ok(gltf.extensionsRequired.includes('EXT_meshopt_compression'));
  assert.ok(gltf.materials.some(m=>m.occlusionTexture),'Baked AO missing');
  results[lod]={triangles,bytes:buffer.length,parts:contract.length,extensions:gltf.extensionsUsed};
}
console.log(JSON.stringify(results,null,2));
fs.writeFileSync(path.join(__dirname,'verification','model-report.json'),JSON.stringify(results,null,2));
