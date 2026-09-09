"""Render the actual saved Blender assembly, not an image animation."""
import bpy, json, hashlib, shutil, sys
from pathlib import Path
PIPE=Path(__file__).resolve().parent;ROOT=PIPE.parents[4]
OUT=ROOT/'assets/3d/source/gt3rs-study';FRAMES=PIPE/'verification/gt3rs-motion'
FRAMES.mkdir(parents=True,exist_ok=True)
source_sha256=hashlib.sha256((OUT/'gt3rs-study.blend').read_bytes()).hexdigest()
bpy.ops.wm.open_mainfile(filepath=str(OUT/'gt3rs-study.blend'))
scene=bpy.context.scene;scene.camera=bpy.data.objects['CAMERA / hero']
scene.render.resolution_x=1280;scene.render.resolution_y=800;scene.render.resolution_percentage=100
scene.cycles.samples=80;scene.cycles.use_denoising=True;scene.cycles.denoiser='OPENIMAGEDENOISE'
scene.cycles.denoising_use_gpu=True
scene.render.use_persistent_data=True
scene.cycles.use_adaptive_sampling=True;scene.cycles.adaptive_threshold=.035
scene.cycles.max_bounces=6;scene.cycles.transmission_bounces=4
scene.cycles.glossy_bounces=3;scene.cycles.diffuse_bounces=2
try:
    prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='OPTIX';prefs.get_devices()
    for d in prefs.devices:d.use=d.type!='CPU'
    if any(d.use for d in prefs.devices):scene.cycles.device='GPU'
except Exception:pass
scene.render.image_settings.file_format='PNG'
parts=json.loads((OUT/'model-manifest.json').read_text())['parts']
last_signature=None;last_file=None;rendered=0;holds=0
test='--test' in sys.argv
start=next((int(a.split('=',1)[1]) for a in sys.argv if a.startswith('--start=')),1)
assert 1<=start<=270
for frame in ([270] if test else range(1,271)):
    scene.frame_set(frame);scene.render.filepath=str(FRAMES/f'{frame:04}.png')
    if test:scene.render.filepath=str(FRAMES/'quality-test.png')
    signature=(scene.camera.data.lens,tuple(tuple(bpy.data.objects[p['name']].matrix_world[j]) for p in parts for j in range(4)))
    if not test and frame<start:
        # Resume only an interrupted render with this source and quality settings.
        assert Path(scene.render.filepath).is_file(),f'Missing checkpoint frame {frame}'
        if signature==last_signature:holds+=1
        else:rendered+=1
    elif signature==last_signature:
        # An exact static hold uses the identical physically rendered pose.
        # No frame interpolation, optical flow, or generated motion is involved.
        shutil.copyfile(last_file,scene.render.filepath);holds+=1
    else:
        bpy.ops.render.render(write_still=True);rendered+=1
    last_signature=signature;last_file=scene.render.filepath
    if frame%15==0:print('GT3_MOTION_FRAME',frame,flush=True)
assert source_sha256==hashlib.sha256((OUT/'gt3rs-study.blend').read_bytes()).hexdigest(),'Source changed during the render'
report={'sourceSha256':source_sha256,'width':1280,'height':800,'fps':30,'frames':270,'durationSeconds':9,'cyclesSamples':80,'denoiser':'OpenImageDenoise','renderedPoses':rendered,'identicalHoldFrames':holds,'resumedFrames':start-1}
if not test:(OUT/'motion-verification.json').write_text(json.dumps(report,indent=2))
print('GT3_MOTION_COMPLETE',json.dumps(report),flush=True)
