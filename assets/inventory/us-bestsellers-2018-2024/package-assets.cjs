const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

const base = __dirname;
const root = path.resolve(base, '../../..');
const web = path.join(root, 'public/images/inventory/us-bestsellers-2018-2024');
const originals = path.join(base, 'originals');
const exists = async (p) => fs.access(p).then(() => true, () => false);
const escape = (s) => String(s).replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));

async function main() {
  const plan = JSON.parse(await fs.readFile(path.join(base, 'generation-plan.json'), 'utf8'));
  const sources = JSON.parse(await fs.readFile(path.join(base, 'source-map.json'), 'utf8'));
  await fs.mkdir(originals, {recursive: true});
  await fs.mkdir(web, {recursive: true});
  const entries = [];
  for (const v of plan.vehicles) {
    const source = sources.find(s => s.slug === v.slug)?.source;
    if (!source) continue;
    const original = path.join(originals, v.slug + '.png');
    if (!await exists(original)) await fs.copyFile(source, original, require('node:fs').constants.COPYFILE_EXCL);
    const full = path.join(web, v.slug + '.webp');
    const card = path.join(web, v.slug + '-card.webp');
    if (!await exists(full)) await sharp(original).webp({quality: 90, effort: 6}).toFile(full);
    if (!await exists(card)) await sharp(original).resize({width: 800, withoutEnlargement: true}).webp({quality: 86, effort: 6}).toFile(card);
    const [meta, stats, small, originalStats] = await Promise.all([sharp(full).metadata(), fs.stat(full), fs.stat(card), fs.stat(original)]);
    entries.push({id: 'FM-ASSET-' + String(v.index).padStart(2,'0'), slug:v.slug, year:v.year, make:v.make, model:v.model, trim:v.trim, category:v.category, exteriorColor:v.color, generated:true, usage:'Illustrative sample imagery; not an actual inventory photograph', alt:'Generated studio illustration of a ' + v.year + ' ' + v.make + ' ' + v.model + ' ' + v.trim + ' in ' + v.color, src:'/images/inventory/us-bestsellers-2018-2024/' + v.slug + '.webp', thumbnail:'/images/inventory/us-bestsellers-2018-2024/' + v.slug + '-card.webp', original:'assets/inventory/us-bestsellers-2018-2024/originals/' + v.slug + '.png', width:meta.width, height:meta.height, bytes:stats.size, thumbnailBytes:small.size, originalBytes:originalStats.size});
  }
  const manifest = {collection:plan.collection,generated:true,count:entries.length,selectionMethod:plan.selectionMethod,sources:plan.sources,images:entries};
  await fs.writeFile(path.join(web, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  const cards = entries.map(v => `<figure><a href="${v.slug}.webp" target="_blank" rel="noopener"><img src="${v.slug}-card.webp" alt="${escape(v.alt)}" width="800" height="533" loading="lazy"></a><figcaption><small>${v.year} / ${v.category}</small><h2>${escape(v.make)} ${escape(v.model)}</h2><p>${escape(v.trim)} · ${escape(v.exteriorColor)}</p><a href="${v.slug}.webp" download>Download image ↗</a></figcaption></figure>`).join('\n');
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Farnsworth / Inventory image library</title><style>*{box-sizing:border-box}body{margin:0;background:#141515;color:#eeeae2;font-family:Arial,sans-serif}header{padding:64px 5vw 42px;border-bottom:1px solid #353635}header small{letter-spacing:.18em;font-size:11px;color:#a5a49f}h1{font-size:clamp(30px,5vw,58px);font-weight:500;letter-spacing:-.045em;margin:22px 0 14px}header p{max-width:690px;color:#aeafa9;font-size:15px;line-height:1.7}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:42px 24px;padding:40px 5vw 70px}figure{margin:0;min-width:0}img{display:block;width:100%;height:auto;background:#353535;border-radius:2px}figcaption{padding:16px 0}small{color:#979b95;letter-spacing:.12em;font-size:10px;text-transform:uppercase}h2{font-size:19px;letter-spacing:-.025em;font-weight:500;margin:9px 0}p{color:#aaa;font-size:12px}a{color:inherit;text-decoration:none}figcaption a{display:inline-block;margin-top:9px;font-size:11px;color:#c8cec4;border-bottom:1px solid #666;padding-bottom:3px}a:focus-visible{outline:2px solid #bcd0b4;outline-offset:5px}footer{padding:20px 5vw 45px;color:#a5a49f;font-size:12px;line-height:1.6}footer a{text-decoration:underline}@media(max-width:1050px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){.grid{grid-template-columns:1fr}header{padding-top:40px}}</style></head><body><header><small>FARNSWORTH MOTORS / ASSET LIBRARY 01</small><h1>Familiar cars. A consistent look.</h1><p>${entries.length} generated inventory images. Popular U.S. models, with selected model years from 2018–2024. Charcoal studio, front three-quarter view, full-resolution downloads.</p><small>AI-GENERATED SAMPLE IMAGERY · NO VEHICLE AVAILABILITY IMPLIED</small></header><main class="grid">${cards}</main><footer>Model-year and trim depictions are illustrative. Use photographs of the specific vehicle for live sales listings. <a href="manifest.json">Asset manifest</a> · <a href="contact-sheet.jpg">View all images</a></footer></body></html>`;
  await fs.writeFile(path.join(web, 'index.html'), html);
  if (entries.length === 20) {
    const cols = 4, cellW = 420, imageH = 280, cellH = 350, gap = 24, margin = 40, headerH = 110;
    const width = margin*2 + cols*cellW + (cols-1)*gap;
    const height = headerH + 5*cellH + 4*gap + margin;
    const layers = [];
    for (let i=0;i<entries.length;i++) {
      const v = entries[i], left=margin+(i%cols)*(cellW+gap), top=headerH+Math.floor(i/cols)*(cellH+gap);
      layers.push({input:await sharp(path.join(web,v.slug+'.webp')).resize(cellW,imageH,{fit:'contain'}).jpeg({quality:90}).toBuffer(),left,top});
      const label = `<svg width="${cellW}" height="70"><text x="0" y="28" font-family="Arial" font-size="19" fill="#edeae3">${escape(v.year+' '+v.make+' '+v.model)}</text><text x="0" y="53" font-family="Arial" font-size="14" fill="#a4a7a0">${escape(v.trim+' / '+v.exteriorColor)}</text></svg>`;
      layers.push({input:Buffer.from(label),left,top:top+imageH});
    }
    const header=`<svg width="${width}" height="100"><text x="40" y="40" font-family="Arial" font-size="27" fill="#edeae3" letter-spacing="2">FARNSWORTH MOTORS</text><text x="40" y="72" font-family="Arial" font-size="15" fill="#a4a7a0">20 INVENTORY ASSETS / 2018–2024 MODEL YEARS / AI-GENERATED SAMPLE IMAGERY</text></svg>`;
    layers.push({input:Buffer.from(header),left:0,top:0});
    await sharp({create:{width,height,channels:3,background:'#171919'}}).composite(layers).jpeg({quality:91}).toFile(path.join(web,'contact-sheet.jpg'));
  }
  console.log(JSON.stringify({count:entries.length,originalBytes:entries.reduce((a,v)=>a+v.originalBytes,0),webBytes:entries.reduce((a,v)=>a+v.bytes,0),thumbnailBytes:entries.reduce((a,v)=>a+v.thumbnailBytes,0),webDirectory:web,originalDirectory:originals},null,2));
}
main().catch(e=>{console.error(e);process.exit(1)});
