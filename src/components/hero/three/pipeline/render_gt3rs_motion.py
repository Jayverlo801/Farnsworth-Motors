"""Render the actual saved Blender assembly, not an image animation."""
import bpy, json
from pathlib import Path
PIPE=Path(__file__).resolve().parent;ROOT=PIPE.parents[4]
OUT=ROOT/'assets/3d/source/gt3rs-study';FRAMES=PIPE/'verification/gt3rs-motion'
FRAMES.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(OUT/'gt3rs-study.blend'))
scene=bpy.context.scene;scene.camera=bpy.data.objects['CAMERA / hero']
scene.render.resolution_x=960;scene.render.resolution_y=600;scene.render.resolution_percentage=100
scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.render.use_persistent_data=True
scene.cycles.use_adaptive_sampling=True;scene.cycles.adaptive_threshold=.1
scene.cycles.max_bounces=6;scene.cycles.transmission_bounces=4
scene.cycles.glossy_bounces=3;scene.cycles.diffuse_bounces=2
try:
    prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='OPTIX';prefs.get_devices()
    for d in prefs.devices:d.use=d.type!='CPU'
    if any(d.use for d in prefs.devices):scene.cycles.device='GPU'
except Exception:pass
scene.render.image_settings.file_format='PNG'
for frame in range(1,271):
    scene.frame_set(frame);scene.render.filepath=str(FRAMES/f'{frame:04}.png')
    bpy.ops.render.render(write_still=True)
    if frame%15==0:print('GT3_MOTION_FRAME',frame,flush=True)
print('GT3_MOTION_COMPLETE',flush=True)
