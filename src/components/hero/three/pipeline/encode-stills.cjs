const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const input=path.join(__dirname,'verification/stills');
const descriptions={
 '01':'Illustrative body-reference tag on a coupe door jamb; not an actual VIN.',
 '02':'Illustrative subframe measurement datum and demonstration readout.',
 '03':'A model quarter panel transitioning from matte primer to satin paint.',
 '04':'An illustrative lift pad positioned beneath the coupe sill.',
 '05':'An illustrative vehicle-record sheet on a brushed-steel bench; not an inventory record.',
 '06':'The fictional finished coupe viewed from the rear in a dark studio.',
};
(async()=>{
  const report={process:[],brand:[]},montage=[];
  const names=fs.readdirSync(input).filter(n=>n.endsWith('.png')).sort((a,b)=>a.startsWith('process')===b.startsWith('process')?a.localeCompare(b):a.startsWith('process')?-1:1);
  for(const [index,file]of names.entries()){
    const [group,id]=file.replace('.png','').split('-');const dir=path.join('public/images',group);fs.mkdirSync(dir,{recursive:true});
    const entry={id,illustrative:true,alt:descriptions[group==='process'?id:'']||`Farnsworth fictional coupe brand study ${id}; not actual inventory photography.`,variants:[]};
    for(const scale of [1,2])for(const format of ['webp','avif']){
      const name=`${id}${scale===2?'@2x':''}.${format}`,out=path.join(dir,name);
      let image=sharp(path.join(input,file)).resize(800*scale).toColorspace('srgb');
      image=format==='avif'?image.avif({quality:65,effort:6}):image.webp({quality:88,effort:6});
      const info=await image.toFile(out);
      entry.variants.push({src:`/images/${group}/${name}`,width:info.width,height:info.height,bytes:info.size,type:`image/${format}`,scale});
    }
    report[group].push(entry);
    const thumb=await sharp(path.join(input,file)).resize(400,270,{fit:'contain',background:'#0b0b0c'}).png().toBuffer();
    montage.push({input:thumb,left:(index%4)*400,top:Math.floor(index/4)*300+30});
    montage.push({input:Buffer.from(`<svg width="400" height="30"><text x="12" y="21" font-family="monospace" font-size="14" fill="#f4f4f2">${group.toUpperCase()} / ${id}</text></svg>`),left:(index%4)*400,top:Math.floor(index/4)*300});
  }
  for(const group of ['process','brand'])fs.writeFileSync(`public/images/${group}/manifest.json`,JSON.stringify(report[group],null,2));
  await sharp({create:{width:1600,height:Math.ceil(names.length/4)*300,channels:4,background:'#0b0b0c'}}).composite(montage).png().toFile(path.join(__dirname,'verification/stills-contact-sheet.png'));
  console.log(JSON.stringify({process:report.process.length,brand:report.brand.length,files:names.length*4,bytes:[...report.process,...report.brand].flatMap(x=>x.variants).reduce((a,b)=>a+b.bytes,0)},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
