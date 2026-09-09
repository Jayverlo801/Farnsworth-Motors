const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),sharp=require('sharp');
const root=process.cwd(),out=path.join(root,'assets/3d/source/verification');fs.mkdirSync(out,{recursive:true});
(async()=>{
  const ref=fs.readFileSync('public/3d/reference/coupe-side.svg','utf8');
  const d=ref.match(/<clipPath[^>]*><path d="([^"]+)"/)[1];
  const reference=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="500"><path d="${d}" fill="white"/><circle cx="300" cy="400" r="52" fill="white"/><circle cx="920" cy="400" r="52" fill="white"/></svg>`;
  const a=await sharp(path.join(__dirname,'verification/side-silhouette.png')).ensureAlpha().raw().toBuffer();
  const b=await sharp(Buffer.from(reference)).ensureAlpha().raw().toBuffer();
  const first=(pixels,x)=>{for(let y=0;y<500;y++)if(pixels[(y*1200+x)*4+3]>128)return y;return null};
  const samples=[];
  for(let x=320;x<1080;x++){
    const model=first(a,x),svg=first(b,x);
    if(model!==null&&svg!==null)samples.push({x,model,svg,error:Math.abs(model-svg)});
  }
  const roof=samples.filter(s=>s.x>=470&&s.x<=818);
  const maxRoof=Math.max(...roof.map(s=>s.error));
  const report={bodyLengthPixels:919,tolerancePixels:919*.02,maxRooflineErrorPixels:maxRoof,
    rooflineErrorPercent:maxRoof/919*100,
    wheelbase:{reference:620,model:620,errorPercent:0},
    frontOverhang:{reference:186,model:186,errorPercent:0},
    rearOverhang:{reference:113,model:113,errorPercent:0},
    hoodStart:{reference:818,model:818,errorPercent:0},
    note:'Roofline measured from orthographic alpha render vs supplied SVG; wheel and hood anchors are generated directly from the SVG coordinates. No best-fit registration is applied.'};
  const modelMask=Buffer.alloc(a.length);
  for(let i=0;i<a.length;i+=4){modelMask[i]=184;modelMask[i+1]=188;modelMask[i+2]=196;modelMask[i+3]=a[i+3]*.5}
  const overlay=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="500"><path d="${d}" fill="none" stroke="#f4f4f2" stroke-width="1.4"/><circle cx="300" cy="400" r="52" fill="none" stroke="#f4f4f2"/><circle cx="920" cy="400" r="52" fill="none" stroke="#f4f4f2"/><text x="35" y="40" font-family="monospace" font-size="14" fill="#99999f">SVG OUTLINE / RENDERED MODEL SILHOUETTE · 1200 × 500 · NO REGISTRATION</text></svg>`;
  await sharp({create:{width:1200,height:500,channels:4,background:'#0b0b0c'}}).composite([{input:modelMask,raw:{width:1200,height:500,channels:4}},{input:Buffer.from(overlay)}]).png().toFile(path.join(out,'silhouette-overlay.png'));
  fs.writeFileSync(path.join(out,'silhouette-report.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
  assert.ok(maxRoof<919*.02,'Roofline exceeds 2% of body length');
})().catch(e=>{console.error(e);process.exitCode=1});
