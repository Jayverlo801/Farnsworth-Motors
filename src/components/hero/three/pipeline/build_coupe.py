"""Original Farnsworth study, generated with Blender 4.5. No third-party mesh.

Run: blender --background --python build_coupe.py -- <pipeline/source>
Coordinates here: X front, Y left, Z up. glTF export converts to Y up.
"""
import bpy
import math
import sys
import json
from pathlib import Path
from mathutils import Vector

SOURCE = Path(__file__).resolve().parent
OUT = Path(sys.argv[sys.argv.index('--') + 1]).resolve() if '--' in sys.argv else SOURCE / 'source'
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def linear_hex(h):
    rgb = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    return tuple(v / 12.92 if v <= .04045 else ((v+.055)/1.055)**2.4 for v in rgb)

def material(name, color, rough=.5, metal=0, coat=0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*linear_hex(color), 1)
    p.inputs['Roughness'].default_value = rough
    p.inputs['Metallic'].default_value = metal
    p.inputs['Coat Weight'].default_value = coat
    p.inputs['Coat Roughness'].default_value = .1
    return m

paint = material('paint', '9A9C9E', .45, .6, 1)
rubber = material('rubber', '151517', .88)
alloy = material('aluminum', 'B8BCC4', .32, .85)
dark = material('interior', '1D1D20', .95)
glass = material('glass', '151517', .14, .2, 1)
light = material('light', 'F4F4F2', .22, .25)
trim = material('trim', '3A3A40', .38, .7)
PARTS = {}

def collect(name, obj, mat):
    obj.data.materials.append(mat)
    for face in obj.data.polygons:
        face.use_smooth = len(face.vertices) <= 4
    PARTS.setdefault(name, []).append(obj)
    return obj

def box(name, pos, size, mat, bevel=.035):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos)
    o = bpy.context.object
    o.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = o.modifiers.new('machined edge', 'BEVEL')
        mod.width = bevel
        mod.segments = 3
        bpy.ops.object.modifier_apply(modifier=mod.name)
        n = o.modifiers.new('surface normals', 'WEIGHTED_NORMAL')
        bpy.ops.object.modifier_apply(modifier=n.name)
    return collect(name, o, mat)

def mesh(name, verts, faces, mat, solid=0):
    data = bpy.data.meshes.new(name + '_surface')
    data.from_pydata(verts, [], faces)
    data.update()
    o = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(o)
    bpy.context.view_layer.objects.active = o
    if solid:
        mod = o.modifiers.new('panel return', 'SOLIDIFY')
        mod.thickness = solid
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return collect(name, o, mat)

def patch(name, fn, nu, nv, mat, solid=0):
    verts = [fn(i/nu, j/nv) for i in range(nu+1) for j in range(nv+1)]
    faces = []
    for i in range(nu):
        for j in range(nv):
            a = i*(nv+1)+j
            faces.append((a, a+nv+1, a+nv+2, a+1))
    return mesh(name, verts, faces, mat, solid)

def cylinder(name, a, b, radius, mat, vertices=32):
    a, b = Vector(a), Vector(b)
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=(b-a).length, location=(a+b)/2)
    o = bpy.context.object
    o.rotation_euler = (b-a).to_track_quat('Z', 'Y').to_euler()
    return collect(name, o, mat)

def torus(name, pos, major, minor, mat, major_segments=64, minor_segments=12):
    bpy.ops.mesh.primitive_torus_add(major_segments=major_segments, minor_segments=minor_segments,
        location=pos, major_radius=major, minor_radius=minor, rotation=(math.pi/2, 0, 0))
    return collect(name, bpy.context.object, mat)

def interp(x, keys):
    for i in range(len(keys)-1):
        a, va = keys[i]; b, vb = keys[i+1]
        if x <= b:
            t = max(0, (x-a)/(b-a))
            prev = keys[max(0,i-1)]
            nxt = keys[min(len(keys)-1,i+2)]
            m0 = (vb-prev[1])/(b-prev[0])
            m1 = (nxt[1]-va)/(nxt[0]-a)
            return (2*t**3-3*t*t+1)*va + (t**3-2*t*t+t)*(b-a)*m0 + (-2*t**3+3*t*t)*vb + (t**3-t*t)*(b-a)*m1
    return keys[-1][1]

def belt(x):
    return interp(x, [(-2.34,.86),(-1.50,1.085),(-.7,1.04),(.65,1.045),(1.5,1.075),(2.34,.84)])

def halfwidth(x):
    return interp(x, [(-2.34,.81),(-1.65,.985),(-.6,.91),(.5,.905),(1.55,.975),(2.34,.80)])

def archbottom(x):
    z = .285
    for center in [-1.48, 1.48]:
        d = abs(x-center)
        if d < .455:
            z = max(z, .425+math.sqrt(.455**2-d*d))
    return z

def sidepoint(x, t, sign):
    z0 = archbottom(x)
    z = z0+(belt(x)-z0)*t
    # Tight shoulder, fuller flanks, tucked-under rocker.
    y = halfwidth(x) - .055*t**5 - .085*(1-t)**5
    return (x, sign*y, z)

for sign, side in [(1,'L'),(-1,'R')]:
    for name,a,b in [('quarter_R',-2.32,-.90),('door_R',-.886,-.52),('door_F',-.507,.89),('quarter_F',.905,2.32)]:
        patch(name+side, lambda u,v,a=a,b=b,s=sign: sidepoint(a+(b-a)*u,v,s), 120, 16, paint)
    # Discreet flush handles, part of each front door.
    box('door_F'+side, (-.34,sign*.920,.93), (.17,.018,.025), trim, .008)

# Continuous crown across hood and rear deck; all edge locations meet the belt.
def deck(x,u):
    y=(u*2-1)*(halfwidth(x)-.057)
    return (x,y,belt(x)+.042*(1-(u*2-1)**2))

patch('hood', lambda u,v: deck(.755+1.57*u,v), 40, 30, paint)
patch('trunk', lambda u,v: deck(-2.32+.87*u,v), 24, 30, paint)

ROOF_Z=[(-1.465,1.09),(-1.08,1.43),(-.72,1.515),(-.2,1.52),(.16,1.445),(.755,1.065)]
ROOF_W=[(-1.465,.865),(-1.08,.72),(-.72,.70),(-.2,.69),(.16,.70),(.755,.858)]
def canopy(x,v):
    p=v*2-1
    return (x,p*interp(x,ROOF_W),interp(x,ROOF_Z)+.035*(1-p*p))

patch('roof', lambda u,v: canopy(-1.035+1.18*u,v), 34, 30, paint)
patch('glass_windshield', lambda u,v: canopy(.157+.588*u,.025+.95*v), 22, 26, glass)
patch('glass_rear', lambda u,v: canopy(-1.45+.40*u,.03+.94*v), 22, 26, glass)
for sign,side in [(1,'L'),(-1,'R')]:
    # Side glass rests under a gently curved roof rail, not a boxy cabin.
    def window(u,v,s=sign):
        x=-1.39+2.075*u
        top=interp(x,ROOF_Z)-.015
        bottom=belt(x)+.025
        z=bottom+(top-bottom)*v
        y=(halfwidth(x)-.063)*(1-v)+interp(x,ROOF_W)*v
        return (x,s*y,z)
    patch('glass_'+side, window, 55, 12, glass)
    # A and C pillars are narrow, painted ribbons.
    for a,b in [(.68,.755),(-1.465,-1.39)]:
        patch('roof',lambda u,v,a=a,b=b,s=sign: (lambda p:(p[0],p[1],p[2]))(window((a+(b-a)*u+1.39)/2.075,v,s)),8,12,paint)
    # A continuous rail avoids the sparkling joints of separate tube segments.
    curve=bpy.data.curves.new('roof rail','CURVE'); curve.dimensions='3D'
    curve.bevel_depth=.012; curve.bevel_resolution=3; curve.resolution_u=2
    spline=curve.splines.new('NURBS'); spline.points.add(40)
    for i,p in enumerate(spline.points):
        x=-1.40+2.11*i/40
        p.co=(x,sign*interp(x,ROOF_W),interp(x,ROOF_Z),1)
    spline.order_u=4; spline.use_endpoint_u=True
    rail=bpy.data.objects.new('rail',curve); bpy.context.collection.objects.link(rail)
    bpy.ops.object.select_all(action='DESELECT'); rail.select_set(True)
    bpy.context.view_layer.objects.active=rail; bpy.ops.object.convert(target='MESH')
    collect('roof',bpy.context.object,paint)

# Nose/tail are shaped cross sections with modest dark intake inserts.
for front, name in [(1,'front_bumper'),(-1,'rear_bumper')]:
    def bumper(u,v,f=front):
        p=u*2-1
        x=f*(2.34-.02*abs(p)**3-.025*(1-v)**2*(1-abs(p)))
        y=p*(halfwidth(f*2.32)-.055*v**5-.085*(1-v)**5)
        z=.285+(belt(f*2.32)-.285)*v
        return (x,y,z)
    patch(name,bumper,42,18,paint)
    box(name,(front*2.335,0,.44),(.024,1.30,.125),rubber,.035)
    box('trim_F' if front==1 else 'trim_R',(front*2.32,0,.292),(.05,1.40,.025),trim,.01)
    # One clean horizontal aperture, no marque-shaped grille.
    for y in [-.45,0,.45]:
        box(name,(front*2.367,y,.454),(.01,.011,.11),trim,.003)
    for sign,side in [(1,'L'),(-1,'R')]:
        lamp=('headlight_' if front==1 else 'taillight_')+side
        box(lamp,(front*2.31,sign*.595,.765),(.07,.40,.068),rubber,.025)
        box(lamp,(front*2.351,sign*.595,.771),(.012,.348,.018),light,.007)

# Underskin: a credible, deliberately simplified engineering structure.
box('chassis',(0,0,.31),(3.92,1.52,.11),dark,.06)
for sign in [-1,1]:
    box('chassis',(0,sign*.68,.415),(3.88,.085,.13),alloy,.026)
for x in [-1.8,-.72,.45,1.8]:
    box('chassis',(x,0,.39),(.075,1.35,.12),trim,.015)
for x,axle in [(1.48,'F'),(-1.48,'R')]:
    box('subframe_'+axle,(x,0,.37),(.58,1.45,.10),trim,.03)
    cylinder('subframe_'+axle,(x,-.89,.425),(x,.89,.425),.052,alloy)
    for sign,side in [(1,'L'),(-1,'R')]:
        suffix=axle+side
        for dx in [-.18,.18]:
            cylinder('suspension_'+suffix,(x+dx,sign*.40,.39),(x,sign*.88,.43),.03,alloy,16)
        cylinder('suspension_'+suffix,(x,sign*.81,.43),(x-.06,sign*.70,.85),.037,trim,20)
        # Rotor, caliper, tire, alloy lip, ten engineered spokes.
        cylinder('brake_'+suffix,(x,sign*.95,.425),(x,sign*.985,.425),.235,trim,64)
        box('brake_'+suffix,(x+.19,sign*.99,.43),(.10,.07,.22),alloy,.028)
        torus('wheel_'+suffix,(x,sign*.978,.425),.305,.092,rubber,80,18)
        torus('wheel_'+suffix,(x,sign*1.047,.425),.27,.014,alloy,80,10)
        cylinder('wheel_'+suffix,(x,sign*.94,.425),(x,sign*1.051,.425),.066,alloy,40)
        for k in range(10):
            angle=k*math.tau/10
            a=(x+math.sin(angle)*.056,sign*1.054,.425+math.cos(angle)*.056)
            b=(x+math.sin(angle+.085)*.262,sign*1.046,.425+math.cos(angle+.085)*.262)
            c=box('wheel_'+suffix,tuple((Vector(a)+Vector(b))/2),(.035,.025,(Vector(b)-Vector(a)).length),alloy,.01)
            c.rotation_euler=(Vector(b)-Vector(a)).to_track_quat('Z','Y').to_euler()

for y,name in [(-.40,'seat_driver'),(.40,'seat_passenger')]:
    box(name,(-.27,y,.57),(.64,.52,.14),dark,.065)
    o=box(name,(-.53,y,.91),(.14,.49,.63),dark,.067)
    o.rotation_euler.y=-.15
    box(name,(-.60,y,1.24),(.13,.27,.19),dark,.055)
box('dashboard',(.54,0,.91),(.27,1.53,.18),dark,.08)
torus('steering_wheel',(.30,-.40,.95),.14,.017,trim,48,10)
for sign,side in [(1,'L'),(-1,'R')]:
    cylinder('mirror_'+side,(.56,sign*.88,1.06),(.46,sign*1.09,1.06),.02,trim,16)
    box('mirror_'+side,(.45,sign*1.13,1.08),(.19,.15,.085),paint,.04)

# Join within each semantic part. Recenter origin at its geometric center so
# choreography can rotate each part around itself without shifting its home.
objects=[]
for name, components in PARTS.items():
    bpy.ops.object.select_all(action='DESELECT')
    for o in components: o.select_set(True)
    bpy.context.view_layer.objects.active=components[0]
    bpy.ops.object.join()
    o=bpy.context.object
    o.name=name
    bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY',center='BOUNDS')
    objects.append(o)

# Single 1024 AO atlas. UVs survive decimation, so all LODs share the bake.
bpy.ops.object.select_all(action='DESELECT')
for o in objects: o.select_set(True)
bpy.context.view_layer.objects.active=objects[0]
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.uv.smart_project(angle_limit=math.radians(70),island_margin=.006)
bpy.ops.object.mode_set(mode='OBJECT')
ao=bpy.data.images.new('coupe-occlusion',width=1024,height=1024,alpha=False)
ao.colorspace_settings.name='Non-Color'
for m in [paint,rubber,alloy,dark,glass,light,trim]:
    tex=m.node_tree.nodes.new('ShaderNodeTexImage'); tex.image=ao
    m.node_tree.nodes.active=tex
    # glTF exporter discovers the standard occlusion input by group name.
    group=bpy.data.node_groups.get('glTF Material Output')
    if not group:
        group=bpy.data.node_groups.new('glTF Material Output','ShaderNodeTree')
        group.interface.new_socket(name='Occlusion',in_out='INPUT',socket_type='NodeSocketFloat')
    node=m.node_tree.nodes.new('ShaderNodeGroup'); node.node_tree=group
    m.node_tree.links.new(tex.outputs['Color'],node.inputs['Occlusion'])
scene=bpy.context.scene
scene.render.engine='CYCLES'
scene.cycles.samples=32
scene.render.bake.use_clear=True
scene.render.bake.margin=4
bpy.ops.object.bake(type='AO')
ao.filepath_raw=str(OUT/'coupe-ao.png'); ao.file_format='PNG'; ao.save()

source_meshes={o.name:o.data.copy() for o in objects}
stats={}
for lod,ratio in [('high',1.0),('medium',.52),('low',.24)]:
    total=0
    for o in objects:
        o.data=source_meshes[o.name].copy()
        bpy.context.view_layer.objects.active=o
        if ratio<1:
            mod=o.modifiers.new('LOD simplification','DECIMATE'); mod.ratio=ratio
            bpy.ops.object.modifier_apply(modifier=mod.name)
        o.data.calc_loop_triangles(); total+=len(o.data.loop_triangles)
    bpy.ops.export_scene.gltf(filepath=str(OUT/('coupe-'+lod+'-raw.glb')),
        export_format='GLB',use_selection=True,export_apply=True,
        export_animations=False,export_cameras=False,export_lights=False)
    stats[lod]={'triangles':total,'parts':len(objects)}
    print('LOD',lod,total,flush=True)
for o in objects: o.data=source_meshes[o.name].copy()

# Save the editable source separately from served assets.
ao.pack()
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE/'hero-coupe.blend'))
(OUT/'model-stats.json').write_text(json.dumps({'parts':list(PARTS),'lods':stats},indent=2))
print('FARNSWORTH_MODEL_COMPLETE',json.dumps(stats),flush=True)
