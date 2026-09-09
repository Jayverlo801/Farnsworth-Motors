"""Fit the original model to the page's authoritative SVG, then export v3 assets.
Blender 4.5: --background --python src/components/hero/three/pipeline/align_coupe.py
"""
import bpy, math, json, re
from pathlib import Path
from xml.etree import ElementTree as ET
from mathutils import Vector

PIPE = Path(__file__).resolve().parent
ROOT = PIPE.parents[4]
SOURCE = ROOT / 'assets/3d/source'
SOURCE.mkdir(parents=True, exist_ok=True)
OUT = PIPE / 'source'
OUT.mkdir(exist_ok=True)
VERIFY = PIPE / 'verification'
VERIFY.mkdir(exist_ok=True)
REFERENCE = ROOT / 'public/3d/reference/coupe-side.svg'
SCALE = 4.68 / 919
CENTER = (187 + 1106) / 2
GROUND = 452
bpy.ops.wm.open_mainfile(filepath=str(PIPE / 'hero-coupe.blend'))

def lerp(x, keys):
    if x <= keys[0][0]: return keys[0][1]
    for (a,va),(b,vb) in zip(keys,keys[1:]):
        if x <= b: return va+(vb-va)*(x-a)/(b-a)
    return keys[-1][1]

def hermite(x, keys):
    for i in range(len(keys)-1):
        a,va=keys[i]; b,vb=keys[i+1]
        if x<=b:
            t=max(0,(x-a)/(b-a)); prev=keys[max(0,i-1)]; nxt=keys[min(len(keys)-1,i+2)]
            m0=(vb-prev[1])/(b-prev[0]); m1=(nxt[1]-va)/(nxt[0]-a)
            return (2*t**3-3*t*t+1)*va+(t**3-2*t*t+t)*(b-a)*m0+(-2*t**3+3*t*t)*vb+(t**3-t*t)*(b-a)*m1
    return keys[-1][1]

# Sample the SVG's actual outer cubic path, not a guessed replacement silhouette.
svg=ET.parse(REFERENCE).getroot()
body_path=next(e.attrib['d'] for e in svg.iter() if e.tag.endswith('path'))
tokens=re.findall(r'[A-Za-z]|-?\d*\.?\d+(?:e[-+]?\d+)?',body_path)
points=[]; i=0; p=(0,0)
while i<len(tokens):
    op=tokens[i]; i+=1
    if op=='A': break # The remaining contour is wheel arches / lower sill.
    if op in ('M','L'):
        q=tuple(map(float,tokens[i:i+2])); i+=2
        for k in range(21):
            t=k/20; points.append((p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t))
        p=q
    elif op=='C':
        a=tuple(map(float,tokens[i:i+2])); b=tuple(map(float,tokens[i+2:i+4])); q=tuple(map(float,tokens[i+4:i+6])); i+=6
        for k in range(101):
            t=k/100; u=1-t
            points.append(tuple(u**3*p[j]+3*u*u*t*a[j]+3*u*t*t*b[j]+t**3*q[j] for j in (0,1)))
        p=q
    else: raise ValueError('Unexpected reference command: '+op)
top=[]
for sx in range(187,1107):
    candidates=[y for x,y in points if abs(x-sx)<1.5 and y>0]
    top.append((sx,min(candidates) if candidates else (top[-1][1] if top else 320)))

XKEY=[(-2.367,187),(-2.34,187),(-1.48,300),(-1.465,310),(-1.035,470),(-.9,508),(-.72,580),(-.2,680),(.16,732),(.755,818),(.89,838),(1.48,920),(2.34,1106),(2.367,1106)]
BELT=[(187,320),(224,269),(262,260),(310,254),(508,266),(806,272),(818,268),(1070,305),(1106,330)]
OLD_BELT=[(-2.34,.86),(-1.50,1.085),(-.7,1.04),(.65,1.045),(1.5,1.075),(2.34,.84)]
OLD_ROOF=[(-1.465,1.09),(-1.08,1.43),(-.72,1.515),(-.2,1.52),(.16,1.445),(.755,1.065)]

def old_bottom(x):
    z=.285
    for c in [-1.48,1.48]:
        if abs(x-c)<.455: z=max(z,.425+math.sqrt(.455**2-(x-c)**2))
    return z

def new_bottom(sx):
    sy=404
    for c in (300,920):
        if abs(sx-c)<60: sy=min(sy,404-math.sqrt(60**2-(sx-c)**2))
    return (GROUND-sy)*SCALE

objects=[o for o in bpy.context.scene.objects if o.type=='MESH']
for o in objects:
    transform=o.matrix_world.copy()
    for v in o.data.vertices:
        x,y,z=transform@v.co
        sx=lerp(x,XKEY); nx=(sx-CENTER)*SCALE
        belt=(GROUND-lerp(sx,BELT))*SCALE
        name=o.name
        if name.startswith(('wheel_','brake_')):
            oldc=1.48 if '_F' in name else -1.48; newc=920 if '_F' in name else 300
            k=52*SCALE/.397
            nx=(newc-CENTER)*SCALE+(x-oldc)*k
            nz=52*SCALE+(z-.425)*k
        elif name.startswith(('quarter_','door_')):
            a=old_bottom(x); b=hermite(x,OLD_BELT)
            t=(z-a)/max(.03,b-a)
            nz=new_bottom(sx)+t*(belt-new_bottom(sx))
        elif name in ('hood','trunk'):
            nz=belt+(z-hermite(x,OLD_BELT))*.65
        elif name=='roof' or name.startswith('glass_'):
            oldbase=hermite(x,OLD_BELT)
            oldtop=hermite(x,OLD_ROOF)+.035
            roof=(GROUND-lerp(sx,top))*SCALE
            t=max(0,min(1,(z-oldbase)/max(.025,oldtop-oldbase)))
            nz=belt+(roof-belt)*t
        elif name in ('front_bumper','rear_bumper') or name.startswith(('headlight','taillight','trim_')):
            t=(z-.285)/max(.1,hermite(x,OLD_BELT)-.285)
            nz=.2444+t*(belt-.2444)
        elif name.startswith('mirror_'):
            nz=belt+(z-1.045)*.7
        else: nz=z*.78
        v.co=(nx,y,nz)
    o.matrix_world.identity()
    bpy.context.view_layer.objects.active=o
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True)
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY',center='BOUNDS')
    o.data.update()

# Bake against the fitted body; all LODs retain this atlas.
bpy.ops.object.select_all(action='DESELECT')
for o in objects:o.select_set(True)
bpy.context.view_layer.objects.active=objects[0]
scene=bpy.context.scene
scene.render.engine='CYCLES';scene.cycles.samples=32
ao=bpy.data.images.get('coupe-occlusion')
for m in bpy.data.materials:
    if not m.use_nodes:continue
    for node in m.node_tree.nodes:
        if node.type=='TEX_IMAGE' and node.image==ao:m.node_tree.nodes.active=node
bpy.ops.object.bake(type='AO')
ao.filepath_raw=str(OUT/'coupe-ao-v3.png');ao.file_format='PNG';ao.save();ao.pack()
source_meshes={o.name:o.data.copy() for o in objects}
stats={}
for lod,ratio in [('high',1),('medium',.52),('low',.24)]:
    total=0
    for o in objects:
        o.data=source_meshes[o.name].copy();bpy.context.view_layer.objects.active=o
        if ratio<1:
            mod=o.modifiers.new('LOD simplification','DECIMATE');mod.ratio=ratio
            bpy.ops.object.modifier_apply(modifier=mod.name)
        o.data.calc_loop_triangles();total+=len(o.data.loop_triangles)
    bpy.ops.export_scene.gltf(filepath=str(OUT/f'coupe-{lod}-v3-raw.glb'),export_format='GLB',use_selection=True,export_apply=True,export_animations=False,export_cameras=False,export_lights=False)
    stats[lod]={'triangles':total,'parts':len(objects)}
for o in objects:o.data=source_meshes[o.name].copy()
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE/'farnsworth-v3.blend'))
(SOURCE/'model-reference.json').write_text(json.dumps({'scale':SCALE,'svgCenterX':CENTER,'svgGroundY':GROUND,'wheelCentersSvg':[300,920],'wheelRadiusSvg':52,'bodyLengthSvg':919,'lods':stats},indent=2))
print('V3_MODEL_COMPLETE',json.dumps(stats),flush=True)
