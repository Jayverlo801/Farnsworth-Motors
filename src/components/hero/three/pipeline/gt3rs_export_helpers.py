"""Preserve authored shading while making portable GT3 RS web exports."""
import bpy, bmesh


def lod_ratios(meshes, lod, budget):
    """Spend detail on glazing where tiny surface errors break reflections."""
    protected = {'glass_windshield', 'glass_rear', 'glass_L', 'glass_R'}
    counts = {}
    for name, mesh in meshes.items():
        mesh.calc_loop_triangles()
        counts[name] = len(mesh.loop_triangles)
    glazing_ratio = {'high': 1.0, 'medium': .70, 'low': .40}[lod]
    reserved = sum(count for name, count in counts.items() if name in protected) * glazing_ratio
    remaining = sum(count for name, count in counts.items() if name not in protected)
    # Collapsing small, constrained parts does not always hit a requested ratio.
    common_ratio = min(1, (budget - reserved - 512) / remaining)
    assert 0 < common_ratio <= 1
    return {name: glazing_ratio if name in protected else common_ratio for name in meshes}


def web_source_mesh(obj):
    """Use single-surface glazing so simplification cannot bridge both panes.

    The native model keeps physical glass thickness. glTF transmission uses a
    double-sided exterior sheet; collapsing a 3 mm solid shell folds its outer
    and inner surfaces together and produces visibly zigzagging reflections.
    """
    mesh = obj.data.copy()
    glazing = {'glass', 'tinted side glazing', 'headlamp lens'}
    if not any(material and material.name in glazing for material in mesh.materials):
        # BMesh round-tripping would discard custom paint/spoke loop normals.
        return mesh
    bm = bmesh.new()
    bm.from_mesh(mesh)
    bm.normal_update()
    remove = []
    for face in bm.faces:
        material = mesh.materials[face.material_index]
        if material.name not in glazing:
            continue
        outward = face.normal.y * (1 if obj.name == 'glass_L' else -1) if obj.name in {'glass_L', 'glass_R'} else face.normal.z
        if outward <= .05:
            remove.append(face)
    bmesh.ops.delete(bm, geom=remove, context='FACES')
    bm.to_mesh(mesh)
    bm.free()
    mesh.update()
    return mesh


def preserve_source_normals(obj, source_mesh):
    """Decimation may alter topology, but not the designed reflection field."""
    reference = obj.copy()
    reference.data = source_mesh
    reference.animation_data_clear()
    reference.name = 'temporary LOD normal source'
    bpy.context.collection.objects.link(reference)
    reference.hide_render = True
    reference.select_set(False)
    try:
        bpy.context.view_layer.objects.active = obj
        modifier = obj.modifiers.new('Authored source normals', 'DATA_TRANSFER')
        modifier.object = reference
        modifier.use_loop_data = True
        modifier.data_types_loops = {'CUSTOM_NORMAL'}
        modifier.loop_mapping = 'POLYINTERP_NEAREST'
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    finally:
        bpy.data.objects.remove(reference, do_unlink=True)


def export_web_glb(filepath):
    """Export constant PBR carbon, then restore the native procedural weave.

    glTF cannot encode a Blender Checker Texture; leaving that link attached
    silently exports a missing baseColorFactor, which defaults to white.
    """
    carbon = bpy.data.materials['carbon']
    tree = carbon.node_tree
    color = tree.nodes.get('Principled BSDF').inputs['Base Color']
    assert max(color.default_value[:3]) < .02, 'Carbon fallback must stay dark'
    connections = [(link.from_socket, link.to_socket) for link in color.links]
    for link in list(color.links):
        tree.links.remove(link)
    try:
        bpy.ops.export_scene.gltf(
            filepath=str(filepath), export_format='GLB', use_selection=True,
            export_apply=True, export_animations=False, export_current_frame=True,
            export_cameras=False, export_lights=False,
        )
    finally:
        for output, input_socket in connections:
            tree.links.new(output, input_socket)
