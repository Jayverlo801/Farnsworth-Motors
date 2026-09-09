"""Recover the site's already-downloaded Geist Mono for Blender text meshes."""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
root=Path.cwd();out=root/'assets/3d/source/fonts';out.mkdir(parents=True,exist_ok=True)
for file in (root/'.next/static/media').glob('*.woff2'):
    font=TTFont(file)
    names=font['name'].names
    family=next((n.toUnicode() for n in names if n.nameID==1),'')
    if 'Geist Mono' not in family or ord('A') not in font.getBestCmap():continue
    if 'fvar' in font:font=instantiateVariableFont(font,{'wght':400},inplace=False)
    font.flavor=None;font.save(out/'GeistMono-Regular.ttf')
    license_text='\n\n'.join(dict.fromkeys(n.toUnicode() for n in names if n.nameID in (0,13,14)))
    (out/'FONT-LICENSE.txt').write_text(license_text,encoding='utf8')
    print('FONT_READY',family,file.name);break
else:raise RuntimeError('The site Geist Mono Latin font was not found')
