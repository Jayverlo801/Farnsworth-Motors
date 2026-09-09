"""Inspect the exported LOD geometry in the saved Blender studio.

Uses the uncompressed export underlying each verified meshopt file. This is
not a WebGL lighting or device-performance test. Never saves the source scene.
"""
import bpy, hashlib, json
from pathlib import Path
from mathutils import Vector

PIPE = Path(__file__).resolve().parent
ROOT = PIPE.parents[4]
SOURCE = ROOT / 'assets/3d/source/gt3rs-study'
OUT = PIPE / 'verification/gt3rs-lods'
OUT.mkdir(parents=True, exist_ok=True)
source = SOURCE / 'gt3rs-study.blend'
source_hash = hashlib.sha256(source.read_bytes()).hexdigest()
manifest = json.loads((SOURCE / 'model-manifest.json').read_text())
bpy.ops.wm.open_mainfile(filepath=str(source))
scene = bpy.context.scene
scene.frame_set(270)
scene.camera = bpy.data.objects['CAMERA / hero']
for part in manifest['parts']:
    bpy.data.objects.remove(bpy.data.objects[part['name']], do_unlink=True)
scene.render.resolution_x = 1200
scene.render.resolution_y = 750
scene.render.resolution_percentage = 100
scene.cycles.samples = 48
scene.cycles.denoiser = 'OPENIMAGEDENOISE'
scene.cycles.denoising_use_gpu = True
scene.render.use_persistent_data = True
prefs = bpy.context.preferences.addons['cycles'].preferences
prefs.compute_device_type = 'OPTIX'
prefs.get_devices()
for device in prefs.devices:
    device.use = device.type != 'CPU'
scene.cycles.device = 'GPU'
for lod in ['high', 'medium', 'low']:
    previous = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(SOURCE / f'gt3rs-study-{lod}-raw.glb'))
    imported = set(bpy.data.objects) - previous
    bpy.context.view_layer.update()
    points = [obj.matrix_world @ Vector(corner) for obj in imported
              if obj.type == 'MESH' for corner in obj.bound_box]
    size = [max(p[axis] for p in points) - min(p[axis] for p in points)
            for axis in range(3)]
    assert 4.5 < size[0] < 4.65 and 1.25 < size[2] < 1.4, size
    scene.render.filepath = str(OUT / f'{lod}.png')
    bpy.ops.render.render(write_still=True)
    print('GT3_LOD_INSPECTION', lod, size, flush=True)
    for obj in imported:
        bpy.data.objects.remove(obj, do_unlink=True)
assert source_hash == hashlib.sha256(source.read_bytes()).hexdigest()
