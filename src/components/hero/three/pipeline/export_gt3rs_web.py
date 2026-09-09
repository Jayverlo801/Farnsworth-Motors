"""Re-export web LODs from the editable source without rebuilding or rendering."""
import bpy, json
from pathlib import Path

PIPE=Path(__file__).resolve().parent;OUT=PIPE.parents[4]/'assets/3d/source/gt3rs-study'
bpy.ops.wm.open_mainfile(filepath=str(OUT/'gt3rs-study.blend'))
manifest=json.loads((OUT/'model-manifest.json').read_text())
scene=bpy.context.scene;scene.frame_set(270)
objects=[bpy.data.objects[p['name']] for p in manifest['parts']]
source_meshes={o.name:o.data for o in objects}
bpy.ops.object.select_all(action='DESELECT')
for o in objects:o.select_set(True)
for lod,budget in [('high',118000),('medium',58000),('low',28000)]:
    ratio=min(1,budget/manifest['sourceTriangles']);tris=0
    for o in objects:
        o.data=source_meshes[o.name].copy();bpy.context.view_layer.objects.active=o
        if ratio<1:
            m=o.modifiers.new('web LOD','DECIMATE');m.ratio=ratio
            bpy.ops.object.modifier_apply(modifier=m.name)
        o.data.validate();o.data.update()
        o.data.calc_loop_triangles();tris+=len(o.data.loop_triangles)
    scene.frame_set(270)
    bpy.ops.export_scene.gltf(filepath=str(OUT/('gt3rs-study-'+lod+'-raw.glb')),export_format='GLB',use_selection=True,export_apply=True,export_animations=False,export_current_frame=True,export_cameras=False,export_lights=False)
    assert tris<=budget,f'{lod}: validated LOD exceeds target budget'
    manifest['lods'][lod]={'triangles':tris}
    print('GT3_EXPORT',lod,tris,flush=True)
# Do not save this temporary decimated scene over the high-detail source.
(OUT/'model-manifest.json').write_text(json.dumps(manifest,indent=2))
