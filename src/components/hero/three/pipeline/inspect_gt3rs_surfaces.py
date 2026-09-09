"""Isolated lighting/occlusion diagnosis; never changes the production source."""
import bpy
from pathlib import Path
PIPE=Path(__file__).resolve().parent
OUT=PIPE/'verification/gt3rs-refinement'
bpy.ops.wm.open_mainfile(filepath=str(OUT/'gt3rs-study.blend'))
scene=bpy.context.scene;scene.frame_set(270)
scene.camera=bpy.data.objects['CAMERA / side'];scene.cycles.samples=24
bpy.data.objects['STUDIO / floor'].hide_render=True
bpy.data.objects['STUDIO / cove'].hide_render=True
prefs=bpy.context.preferences.addons['cycles'].preferences
prefs.compute_device_type='OPTIX';prefs.get_devices()
for device in prefs.devices:device.use=device.type!='CPU'
scene.cycles.device='GPU';scene.cycles.denoising_use_gpu=True
for name in ['glass_L','glass_R','glass_windshield','glass_rear']:
    bpy.data.objects[name].hide_render=True
scene.render.filepath=str(OUT/'glass-occlusion-check.png')
bpy.ops.render.render(write_still=True)
