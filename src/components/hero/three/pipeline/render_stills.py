"""One model, environment, saved camera rig and AgX pipeline for all v3 stills.
Blender --background --python <this file> [-- process/01 brand/S4]
"""
import bpy, math, re, json, sys
import numpy as np
from pathlib import Path
from mathutils import Vector

PIPE=Path(__file__).resolve().parent;ROOT=PIPE.parents[4]
SOURCE=ROOT/'assets/3d/source';OUT=PIPE/'verification/stills';OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(SOURCE/'farnsworth-v3.blend'))
scene=bpy.context.scene
car={o.name:o for o in scene.objects if o.type=='MESH'}
css=(ROOT/'src/app/globals.css').read_text()
tokens=dict(re.findall(r'(--[\w-]+)\s*:\s*([^;{}]+);',css))
def token(name):
    value=tokens[name].strip()
    return token(value[4:-1]) if value.startswith('var(') else value
def linear(color):
    color=color.lstrip('#'); values=[int(color[i:i+2],16)/255 for i in (0,2,4)]
    return tuple(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in values)
def material(name,color,rough=.6,metal=0):
    m=bpy.data.materials.new(name);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*linear(color),1)
    p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal
    return m

ink=material('record ink',token('--bg'));paper=material('record paper',token('--text'),.96)
steel=material('brushed bench',token('--accent'),.48,.8)
dark=material('studio hardware',token('--surface'),.8)
primer=material('primer',token('--text-2'),.94,.05)
intact=material('diagram intact',token('--accent-intact'),.6)
replaced=material('diagram replaced',token('--accent-replaced'),.7)
label=material('metal etching',token('--text'),.8)
paint=bpy.data.materials['paint']
font=bpy.data.fonts.load(str(SOURCE/'fonts/GeistMono-Regular.ttf'))

props=[]
def finish(obj,name,mat):
    obj.name=name;obj.data.materials.append(mat);props.append(obj)
    return obj
def box(name,pos,size,mat,bevel=.01):
    bpy.ops.mesh.primitive_cube_add(size=1,location=pos);o=bpy.context.object;o.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        mod=o.modifiers.new('machined edge','BEVEL');mod.width=bevel;mod.segments=3
        bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
        mod=o.modifiers.new('weighted normals','WEIGHTED_NORMAL');bpy.ops.object.modifier_apply(modifier=mod.name)
    return finish(o,name,mat)
def cylinder(name,a,b,radius,mat):
    a,b=Vector(a),Vector(b);bpy.ops.mesh.primitive_cylinder_add(vertices=48,radius=radius,depth=(b-a).length,location=(a+b)/2)
    o=bpy.context.object;o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler()
    return finish(o,name,mat)
def text(name,body,pos,size,mat,rotation=(0,0,0)):
    curve=bpy.data.curves.new(name,'FONT');curve.body=body;curve.font=font;curve.size=size
    curve.space_line=1.45;curve.extrude=.00012;curve.resolution_u=2
    o=bpy.data.objects.new(name,curve);scene.collection.objects.link(o);o.location=pos;o.rotation_euler=rotation
    return finish(o,name,mat)

# Shared original 1K equirectangular environment, used by Blender and WebGL.
# Values are linear radiance from three neutral studio softboxes, not a photo.
w,h=1024,512
theta,phi=np.meshgrid(np.linspace(-math.pi,math.pi,w),np.linspace(-math.pi/2,math.pi/2,h))
radiance=np.full((h,w),.025,dtype=np.float32)
for az,el,sx,sy,power in [(0,1.05,.70,.16,3.0),(2.3,.45,.55,.10,2.2),(-1.4,.2,.6,.25,.7)]:
    dx=np.arctan2(np.sin(theta-az),np.cos(theta-az));dy=phi-el
    radiance+=power*np.exp(-((dx/sx)**8+(dy/sy)**8)*.7)
pixels=np.ones((h,w,4),dtype=np.float32)
pixels[:,:,:3]=radiance[:,:,None]*np.array(linear(token('--text')),dtype=np.float32)
environment=bpy.data.images.new('Farnsworth neutral studio',width=w,height=h,float_buffer=True)
environment.pixels.foreach_set(pixels.ravel());environment.file_format='HDR'
environment.filepath_raw=str(ROOT/'public/3d/studio-neutral.hdr');environment.save();environment.pack()
world=bpy.data.worlds.new('Farnsworth shared studio');world.use_nodes=True;scene.world=world
nodes=world.node_tree.nodes;nodes.clear()
env=nodes.new('ShaderNodeTexEnvironment');env.image=environment
background=nodes.new('ShaderNodeBackground');background.inputs['Strength'].default_value=.45
world.node_tree.links.new(env.outputs['Color'],background.inputs['Color'])
# Camera rays see the page's graphite token; reflections see the shared environment.
flat=nodes.new('ShaderNodeBackground');flat.inputs['Color'].default_value=(*linear(token('--bg')),1)
path=nodes.new('ShaderNodeLightPath');mix=nodes.new('ShaderNodeMixShader');output=nodes.new('ShaderNodeOutputWorld')
world.node_tree.links.new(path.outputs['Is Camera Ray'],mix.inputs[0]);world.node_tree.links.new(background.outputs[0],mix.inputs[1]);world.node_tree.links.new(flat.outputs[0],mix.inputs[2]);world.node_tree.links.new(mix.outputs[0],output.inputs[0])
def area(name,pos,power,size,ratio,target=(0,0,.6)):
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='RECTANGLE';data.size=size;data.size_y=size*ratio
    data.color=linear(token('--text'));o=bpy.data.objects.new(name,data);scene.collection.objects.link(o);o.location=pos
    o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
    return o
area('Key / common rig',(1.6,-3,4.5),950,5,.48)
area('Rim / common rig',(-3,2.6,2.8),650,4,.175)

asphalt=material('dark asphalt',token('--bg-2'),.96)
noise=asphalt.node_tree.nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=180
bump=asphalt.node_tree.nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.16;bump.inputs['Distance'].default_value=.012
asphalt.node_tree.links.new(noise.outputs['Fac'],bump.inputs['Height']);asphalt.node_tree.links.new(bump.outputs[0],asphalt.node_tree.nodes.get('Principled BSDF').inputs['Normal'])
floor=box('Studio ground',(0,0,-.065),(200,200,.10),asphalt,0)

start=len(props)
box('Door-jamb tag',(-.56,-.945,.865),(.40,.008,.15),steel,.006)
text('Tag identification','FM / DESIGN STUDY\nBODY REFERENCE 001\nNO VEHICLE VIN',(-.735,-.951,.906),.016,label,(math.pi/2,0,0))
for x in (-.742,-.378):
    for z in (.805,.925):cylinder('Tag rivet',(x,-.948,z),(x,-.955,z),.004,steel)
tag=props[start:]

start=len(props)
point=(1.40,-.71,.34)
cylinder('Datum contact',(1.40,-.71,.29),point,.032,steel)
cylinder('Datum indicator',point,(1.66,-.71,.57),.003,intact)
cylinder('Datum indicator baseline',(1.66,-.71,.57),(2.12,-.71,.57),.003,intact)
text('Illustrative measurement','DATUM A  /  000.0\nILLUSTRATIVE READING',(1.66,-.716,.63),.030,label,(math.pi/2,0,0))
gauge=props[start:]

start=len(props)
box('Masked transition',(-1.18,-.934,.68),(.018,.006,.51),paper,.002)
tape=props[start:]

start=len(props)
box('Lift arm',(-.46,-1.14,.03),(.22,1.10,.16),dark,.016)
cylinder('Lift control pad',(-.46,-.69,.11),(-.46,-.69,.227),.10,steel)
lift=props[start:]

start=len(props)
bench=box('Brushed steel bench',(0,0,-.06),(2.2,1.7,.10),steel,.006)
sheet=box('Printed record sheet',(0,0,.003),(.70,.95,.003),paper,.001)
text('Record masthead','FARNSWORTH',(-.294,.385,.0055),.052,ink)
text('Record title','VEHICLE RECORD',(-.294,.323,.0055),.026,ink)
text('Record status','ILLUSTRATIVE / NOT AN INVENTORY RECORD',(-.294,.266,.0055),.014,ink)
text('Record summary','PART                 STATUS\nQUARTER RR           REPLACED / DEMO\nREAR BUMPER          REPLACED / DEMO\nSTRUCTURE            REFERENCE ONLY',(-.294,.174,.0055),.017,ink)
text('Record footnote','MODEL STUDY 001\nNO VIN / NO INSPECTION OR OEM CLAIM',(-.294,-.36,.0055),.015,ink)
for y in (.248,-.319):box('Record hairline',(0,y,.0056),(.59,.0012,.0003),ink,0)
# A small top-view diagram, built from the same object's projected panel bounds.
for name,o in car.items():
    if not name.startswith(('hood','trunk','door','quarter','front_bumper','rear_bumper','chassis')):continue
    pts=[o.matrix_world@v.co for v in o.data.vertices]
    x0,x1=min(p.x for p in pts),max(p.x for p in pts);y0,y1=min(p.y for p in pts),max(p.y for p in pts)
    x0,x1=x0*.115,x1*.115;y0,y1=-.17+y0*.09,-.17+y1*.09
    color=replaced if name in ('quarter_RR','rear_bumper') else intact if name=='chassis' else ink
    for a,b in [((x0,y0),(x1,y0)),((x1,y0),(x1,y1)),((x1,y1),(x0,y1)),((x0,y1),(x0,y0))]:
        cylinder('Printed diagram / '+name,(*a,.006),(*b,.006),.0008,color)
record=props[start:]

start=len(props)
box('Panel shipping cradle',(0,0,.12),(1.80,.85,.23),paper,.008)
text('Panel reference label','OEM PANEL SLOT\nILLUSTRATIVE MODEL\nVERIFY PART RECORD',(-.75,-.431,.22),.043,ink,(math.pi/2,0,0))
cradle=props[start:]

scene.render.engine='CYCLES';scene.cycles.samples=64;scene.cycles.use_denoising=True
try:
    prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='OPTIX';prefs.get_devices()
    for device in prefs.devices:device.use=device.type!='CPU'
    if any(d.use for d in prefs.devices):scene.cycles.device='GPU'
except Exception as e:print('GPU_FALLBACK',str(e),flush=True)
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=-.4
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGB'
scene.render.film_transparent=False;scene.render.resolution_percentage=100

original_slots={n:list(o.data.materials) for n,o in car.items()}
original_indices={n:[p.material_index for p in o.data.polygons] for n,o in car.items()}
original_positions={n:o.location.copy() for n,o in car.items()}
def reset():
    for name,o in car.items():
        o.hide_render=False;o.location=original_positions[name]
        o.data.materials.clear()
        for m in original_slots[name]:o.data.materials.append(m)
        for face,index in zip(o.data.polygons,original_indices[name]):face.material_index=index
    for o in props:o.hide_render=True
def show(group):
    for o in group:o.hide_render=False
def only(names):
    for n,o in car.items():o.hide_render=n not in names
def prime(split=False):
    o=car['quarter_RR'];i=len(o.data.materials);o.data.materials.append(primer)
    for face in o.data.polygons:
        center=o.matrix_world@face.center
        if not split or center.x< -1.18:face.material_index=i
def structure():
    names=[n for n in car if n.startswith(('chassis','subframe','suspension','brake'))];only(names)
    for n in names:
        o=car[n];o.data.materials.clear();o.data.materials.append(intact)
        for face in o.data.polygons:face.material_index=0

shots=[
 {'id':'process/01','camera':(.25,-2.30,1.12),'target':(-.56,-.94,.86),'lens':85,'shift':(-.22,0),'fstop':4,'kind':'tag'},
 {'id':'process/02','camera':(2.25,-2.25,1.23),'target':(1.55,-.55,.48),'lens':65,'shift':(-.13,0),'fstop':6,'kind':'gauge'},
 {'id':'process/03','camera':(-1.70,-2.27,1.02),'target':(-1.18,-.90,.68),'lens':80,'shift':(.05,0),'fstop':2.8,'kind':'primer'},
 {'id':'process/04','camera':(-1.35,-2.22,-.03),'target':(-.46,-.69,.24),'lens':65,'shift':(-.13,0),'fstop':5.6,'kind':'lift'},
 {'id':'process/05','camera':(.25,-1.28,1.70),'target':(0,0,0),'lens':48,'shift':(0,.02),'fstop':9,'kind':'record'},
 {'id':'process/06','camera':(-6.5,-7.5,2.8),'target':(0,0,.65),'lens':45,'shift':(0,.20),'fstop':8,'kind':'road'},
 {'id':'brand/S1','camera':(7,-8,3.4),'target':(0,0,.66),'lens':52,'shift':(-.13,.06),'fstop':8,'kind':'finished'},
 {'id':'brand/S2','camera':(-6.5,-7.5,2.8),'target':(0,0,.65),'lens':52,'shift':(0,.06),'fstop':8,'kind':'primed-car'},
 {'id':'brand/S3','camera':(5,-6,4.3),'target':(0,0,.25),'lens':52,'shift':(0,.08),'fstop':8,'kind':'structure'},
 {'id':'brand/S4','camera':(3,-4,2.6),'target':(0,0,.50),'lens':57,'shift':(0,.05),'fstop':8,'kind':'panel'},
 {'id':'brand/S5','camera':(.25,-1.28,1.70),'target':(0,0,0),'lens':48,'shift':(0,.02),'fstop':9,'kind':'record'},
 {'id':'brand/S6','camera':(8,0,1.6),'target':(0,0,.58),'lens':58,'shift':(0,.16),'fstop':8,'kind':'finished'},
 {'id':'brand/S7','camera':(-6.5,-7.5,2.8),'target':(0,0,.65),'lens':52,'shift':(0,.06),'fstop':8,'kind':'received'},
 {'id':'brand/S8','camera':(-6.5,-7.5,2.8),'target':(0,0,.65),'lens':52,'shift':(0,.06),'fstop':8,'kind':'primed-car'},
 {'id':'brand/S9','camera':(-6.5,-7.5,2.8),'target':(0,0,.65),'lens':52,'shift':(0,.06),'fstop':8,'kind':'finished'},
]
selected=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
for shot in shots:
    reset();kind=shot['kind']
    if kind=='tag':only(['door_FL','quarter_RL']);show(tag)
    elif kind=='gauge':only([n for n in car if n.startswith(('subframe_F','suspension_F','chassis'))]);show(gauge)
    elif kind=='primer':prime(True);show(tape)
    elif kind=='lift':only([n for n in car if n.startswith(('chassis','door','subframe'))]);show(lift)
    elif kind=='record':only([]);show(record)
    elif kind=='structure':structure();show([floor])
    elif kind=='panel':
        only(['quarter_RR']);car['quarter_RR'].location+=Vector((1.5,.6,.42));show(cradle);show([floor])
    else:
        show([floor])
        if kind=='primed-car':prime()
        if kind=='received':car['quarter_RR'].location.y+=.035
    data=bpy.data.cameras.new(shot['id']);cam=bpy.data.objects.new('FM / '+shot['id'],data);scene.collection.objects.link(cam)
    cam.location=shot['camera'];cam.rotation_euler=(Vector(shot['target'])-cam.location).to_track_quat('-Z','Y').to_euler()
    data.lens=shot['lens'];data.shift_x,data.shift_y=shot['shift'];data.dof.use_dof=True
    data.dof.aperture_fstop=shot['fstop'];data.dof.focus_distance=(Vector(shot['target'])-cam.location).length
    scene.camera=cam;scene.render.resolution_x=1600;scene.render.resolution_y=1200 if shot['id'].startswith('process') else 1000
    if selected and shot['id'] not in selected:continue
    dest=OUT/(shot['id'].replace('/','-')+'.png');scene.render.filepath=str(dest)
    print('RENDER_START',shot['id'],flush=True);bpy.ops.render.render(write_still=True);print('RENDER_DONE',shot['id'],flush=True)

bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE/'farnsworth-studio.blend'))
(SOURCE/'shot-manifest.json').write_text(json.dumps({'model':'farnsworth-v3.blend','environment':'../../../public/3d/studio-neutral.hdr','colorPipeline':'AgX / Medium High Contrast / exposure -0.4','process1x':[800,600],'process2x':[1600,1200],'brand1x':[800,500],'brand2x':[1600,1000],'shots':shots},indent=2))
print('STILLS_COMPLETE',flush=True)
