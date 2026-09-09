"""Promote the verified preview geometry, then render every production view.

No decimated preview or unverified source may be promoted. This avoids another
expensive Boolean rebuild of a mesh that has already been visually inspected.
"""
import bpy, hashlib, json
from pathlib import Path
PIPE=Path(__file__).resolve().parent;ROOT=PIPE.parents[4]
PREVIEW=PIPE/'verification/gt3rs-refinement';OUT=ROOT/'assets/3d/source/gt3rs-study'
source=PREVIEW/'gt3rs-study.blend'
checked=json.loads((PREVIEW/'verification.json').read_text())
assert checked['passed'] and checked['sourceSha256']==hashlib.sha256(source.read_bytes()).hexdigest(), 'Verify the current preview first'
manifest=json.loads((PREVIEW/'model-manifest.json').read_text())
assert manifest['sourceTriangles']==checked['sourceTriangles']
assert len(manifest['parts'])==58
bpy.ops.wm.open_mainfile(filepath=str(source))
scene=bpy.context.scene;scene.frame_set(270)
scene.render.resolution_x=3000;scene.render.resolution_y=1875
scene.render.resolution_percentage=100;scene.cycles.samples=160
scene.cycles.denoiser='OPENIMAGEDENOISE';scene.cycles.denoising_use_gpu=True
scene.render.use_persistent_data=True
prefs=bpy.context.preferences.addons['cycles'].preferences
prefs.compute_device_type='OPTIX';prefs.get_devices()
for device in prefs.devices:device.use=device.type!='CPU'
scene.cycles.device='GPU'
floor=bpy.data.objects['STUDIO / floor'];cove=bpy.data.objects['STUDIO / cove']
for name,camera,frame in [('hero','hero',270),('rear','rear',270),('side','side',270),('exploded','hero',1)]:
    scene.camera=bpy.data.objects['CAMERA / '+camera];scene.frame_set(frame)
    floor.hide_render=name=='side';cove.hide_render=name=='side'
    scene.render.filepath=str(OUT/(name+'.png'));bpy.ops.render.render(write_still=True)
    print('GT3_PRODUCTION_RENDER',name,flush=True)
scene.camera=bpy.data.objects['CAMERA / hero'];scene.frame_set(270)
floor.hide_render=False;cove.hide_render=False
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gt3rs-study.blend'),compress=True)
manifest['lods']={}
(OUT/'model-manifest.json').write_text(json.dumps(manifest,indent=2))
print('GT3_PREVIEW_PROMOTED',manifest['sourceTriangles'],flush=True)
