"""Render orthographic silhouette proof and export semantic SVG record diagrams."""
import bpy, math, json
from pathlib import Path
from mathutils import Vector

PIPE=Path(__file__).resolve().parent;ROOT=PIPE.parents[4]
SOURCE=ROOT/'assets/3d/source';VERIFY=PIPE/'verification'
DEST=ROOT/'public/3d/diagram';DEST.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(SOURCE/'farnsworth-v3.blend'))
objects=[o for o in bpy.context.scene.objects if o.type=='MESH']
S=4.68/919;CX=646.5

def project(v,view):
    return (v.x/S+CX,452-v.z/S) if view=='side' else (v.x/S+CX,250-v.y/S)

def hull(points):
    points=sorted(set(points))
    def cross(a,b,c):return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
    lower=[];upper=[]
    for p in points:
        while len(lower)>=2 and cross(lower[-2],lower[-1],p)<=0:lower.pop()
        lower.append(p)
    for p in reversed(points):
        while len(upper)>=2 and cross(upper[-2],upper[-1],p)<=0:upper.pop()
        upper.append(p)
    return lower[:-1]+upper[:-1]

def simplify(points,eps=.8):
    if len(points)<3:return points
    a,b=points[0],points[-1];dx=b[0]-a[0];dy=b[1]-a[1];length=math.hypot(dx,dy)
    distances=[abs(dy*(p[0]-a[0])-dx*(p[1]-a[1]))/length if length else math.dist(p,a) for p in points]
    k=max(range(len(points)),key=lambda i:distances[i])
    if distances[k]<=eps:return [a,b]
    return simplify(points[:k+1],eps)[:-1]+simplify(points[k:],eps)

def outlines(o,view):
    points=[project(o.matrix_world@v.co,view) for v in o.data.vertices]
    edge_counts={}
    for face in o.data.polygons:
        for edge in face.edge_keys:edge_counts[edge]=edge_counts.get(edge,0)+1
    edges={e for e,n in edge_counts.items() if n==1}
    adjacency={}
    for a,b in edges:adjacency.setdefault(a,[]).append(b);adjacency.setdefault(b,[]).append(a)
    loops=[]
    while edges:
        a,b=edges.pop();chain=[a,b]
        while chain[-1]!=chain[0]:
            c=next((c for c in adjacency[chain[-1]] if tuple(sorted((chain[-1],c))) in edges),None)
            if c is None:break
            edges.remove(tuple(sorted((chain[-1],c))));chain.append(c)
        loop=simplify([points[i] for i in chain])
        if len(loop)>3:loops.append(loop)
    if not loops:loops=[simplify(hull(points)+hull(points)[:1])]
    return loops

def is_structure(name):return name.startswith(('chassis','subframe','suspension','brake'))
def is_body(name):return name.startswith(('hood','trunk','roof','door','quarter','front_bumper','rear_bumper'))

for view in ('top','side'):
    parts=[]
    # Structure is a semantic wrapper for the existing RecordDiagram's intact selector.
    for structural in (False,True):
        if structural:parts.append('<g data-part="structure">')
        for o in objects:
            if is_structure(o.name)!=structural:continue
            paths=[]
            for loop in outlines(o,view):
                d='M'+' L'.join(f'{x:.1f},{y:.1f}' for x,y in loop)+' Z'
                paths.append(f'<path d="{d}"/>')
            fill='var(--bg-2,#151517)' if is_body(o.name) else 'none'
            parts.append(f'<g id="{o.name}" data-part="{o.name}" fill="{fill}">'+''.join(paths)+'</g>')
        if structural:parts.append('</g>')
    content='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 500" role="img" aria-label="Farnsworth fictional coupe '+view+' part diagram" stroke="var(--text-2,#99999f)" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round" fill="none">'+''.join(parts)+'</svg>'
    assert len(content.encode())<40000,(view,len(content))
    (DEST/f'coupe-{view}.svg').write_text(content)
    print('DIAGRAM',view,len(content.encode()),flush=True)

scene=bpy.context.scene
scene.render.engine='BLENDER_WORKBENCH'
scene.display.shading.light='FLAT';scene.display.shading.color_type='SINGLE'
scene.display.shading.single_color=(1,1,1);scene.display.shading.show_shadows=False
scene.display.shading.show_cavity=False;scene.display.shading.show_specular_highlight=False
scene.render.film_transparent=True
scene.render.resolution_x=1200;scene.render.resolution_y=500;scene.render.resolution_percentage=100
data=bpy.data.cameras.new('Silhouette calibration camera');camera=bpy.data.objects.new(data.name,data);scene.collection.objects.link(camera)
data.type='ORTHO';data.ortho_scale=1200*S
camera.location=((600-CX)*S,-10,(452-250)*S)
camera.rotation_euler=(Vector((camera.location.x,0,camera.location.z))-camera.location).to_track_quat('-Z','Y').to_euler()
scene.camera=camera;scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA'
scene.render.filepath=str(VERIFY/'side-silhouette.png');bpy.ops.render.render(write_still=True)
print('SILHOUETTE_COMPLETE',flush=True)
