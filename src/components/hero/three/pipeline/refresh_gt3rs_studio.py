"""Refresh only studio framing/background/renders; preserve the authored model."""
import bpy, sys
from pathlib import Path
PIPE=Path(__file__).resolve().parent;OUT=PIPE.parents[4]/'assets/3d/source/gt3rs-study'
bpy.ops.wm.open_mainfile(filepath=str(OUT/'gt3rs-study.blend'))
scene=bpy.context.scene;world=scene.world;n=world.node_tree.nodes;l=world.node_tree.links
def linear(h):
    values=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    return tuple(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in values)
if not n.get('Camera backdrop'):
    flat=n.new('ShaderNodeBackground');flat.name='Camera backdrop';flat.inputs['Color'].default_value=(*linear('080A0C'),1);flat.inputs['Strength'].default_value=.7
    ray=n.new('ShaderNodeLightPath');mix=n.new('ShaderNodeMixShader')
    l.new(ray.outputs['Is Camera Ray'],mix.inputs[0]);l.new(n.get('Background').outputs[0],mix.inputs[1]);l.new(flat.outputs[0],mix.inputs[2]);l.new(mix.outputs[0],n.get('World Output').inputs['Surface'])
floor=bpy.data.objects['STUDIO / floor'];floor.dimensions.x=2000;floor.dimensions.y=2000
try:
    prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='OPTIX';prefs.get_devices()
    for d in prefs.devices:d.use=d.type!='CPU'
    if any(d.use for d in prefs.devices):scene.cycles.device='GPU'
except Exception:pass
scene.render.use_persistent_data=True
selected=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
for name,camera,frame in [('hero','hero',270),('rear','rear',270),('side','side',270),('exploded','hero',1)]:
    if selected and name not in selected:continue
    floor.hide_render=name=='side'
    scene.camera=bpy.data.objects['CAMERA / '+camera];scene.frame_set(frame)
    scene.render.filepath=str(OUT/(name+'.png'));bpy.ops.render.render(write_still=True)
    print('GT3_STUDIO_RENDER',name,flush=True)
scene.camera=bpy.data.objects['CAMERA / hero'];scene.frame_set(270)
floor.hide_render=False
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gt3rs-study.blend'),compress=True)
print('GT3_STUDIO_COMPLETE',flush=True)
