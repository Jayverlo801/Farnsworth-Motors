"""Blender-native model/animation verification; no visual-quality claims inferred."""
import bpy, json, math, hashlib
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

PIPE=Path(__file__).resolve().parent;ROOT=PIPE.parents[4]
OUT=ROOT/'assets/3d/source/gt3rs-study'
bpy.ops.wm.open_mainfile(filepath=str(OUT/'gt3rs-study.blend'))
scene=bpy.context.scene;manifest=json.loads((OUT/'model-manifest.json').read_text())
parts=manifest['parts'];names=[p['name'] for p in parts]
assert len(names)==len(set(names))==58
assert 'door_RL' not in names and 'door_RR' not in names, 'Do not invent rear doors'
assert all(n in names for n in ['hood','roof','wing_main','wing_flap','wing_supports','headlight_L','headlight_R','wheel_FL','wheel_RR'])
errors={};bounds={};triangles=0;materials={}
for frame in [1,90,150,210,270]:
    scene.frame_set(frame);points=[];max_error=0
    for part in parts:
        o=bpy.data.objects[part['name']]
        assert o.type=='MESH' and o.animation_data and o.animation_data.action
        assert len(o.data.polygons)>0
        if frame in [1,210,270]:
            expected=Vector(part['assembled'])
            if frame==1:expected+=Vector(part['explodedOffset'])
            max_error=max(max_error,(o.location-expected).length)
        for v in o.data.vertices:
            p=o.matrix_world@v.co
            assert all(math.isfinite(c) for c in p),o.name+' has non-finite coordinates'
            points.append(p)
        if frame==270:
            o.data.calc_loop_triangles();triangles+=len(o.data.loop_triangles)
            materials[o.name]=sorted({o.data.materials[p.material_index].name for p in o.data.polygons})
    if frame in [1,210,270]:
        assert max_error<.00001, f'Assembly error {frame}: {max_error}'
        errors[str(frame)]=max_error
    projected=[world_to_camera_view(scene,bpy.data.objects['CAMERA / hero'],p) for p in points]
    b={'left':min(p.x for p in projected),'right':max(p.x for p in projected),'bottom':min(p.y for p in projected),'top':max(p.y for p in projected)}
    assert all(0<=v<=1 for v in b.values()),f'Camera clips frame {frame}: {b}'
    bounds[str(frame)]=b
assert triangles==manifest['sourceTriangles']
assert materials['wing_main']==['carbon']
assert 'headlamp lens' in materials['headlight_R']
assert 'rubber' in materials['wheel_FR'] and 'aluminum' in materials['wheel_FR']
assert 'rear lamp' in materials['taillight_R']
assert scene.render.resolution_x==3000 and scene.render.resolution_y==1875
assert 'STUDIO / cove' in bpy.data.objects, 'Missing seamless studio backdrop'
assert bpy.data.materials['glass'].node_tree.nodes.get('Principled BSDF').inputs['Transmission Weight'].default_value>.95
# Rays into the two hood ducts must hit the modeled floor below the paint surface.
hood=bpy.data.objects['hood'];inverse=hood.matrix_world.inverted();duct_depths=[]
for sign in [-1,1]:
    heights=[]
    for y in [.11,.32]:
        hit,point,normal,index=hood.ray_cast(inverse@Vector((1.40,sign*y,2.0)),Vector((0,0,-1)))
        assert hit, 'Missing hood skin or duct floor'
        heights.append((hood.matrix_world@point).z)
    depth=heights[0]-heights[1]
    assert .025<depth<.10,f'Hood duct is not recessed: {depth}'
    duct_depths.append(depth)
report={'passed':True,'sourceSha256':hashlib.sha256((OUT/'gt3rs-study.blend').read_bytes()).hexdigest(),'sourceTriangles':triangles,'separateParts':len(parts),
        'assemblyErrorMeters':errors,'cameraBoundsNormalized':bounds,
        'renderSize':[3000,1875],'hoodDuctDepthMeters':duct_depths,'nativeAnimation':{'fps':30,'frames':270,'durationSeconds':9},
        'checks':['finite geometry','58 unique animated parts','no invented rear doors','exact exploded/assembled transforms','hero camera contains model at sampled frames','carbon/rubber/lens/lamp material assignments','transmissive glazing','ray-verified recessed hood ducts','seamless studio cove'],
        'limitations':['Artistic similarity, not factory dimensional accuracy.','No claim of photorealism from automated checks.','Website integration and physical-device performance are separate acceptance steps.']}
(OUT/'verification.json').write_text(json.dumps(report,indent=2))
print('GT3_VERIFIED',json.dumps(report),flush=True)
