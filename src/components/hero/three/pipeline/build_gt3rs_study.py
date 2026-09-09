"""Reference-led Porsche 992 GT3 RS visualization. Original authored geometry.

Blender 4.5: --background --python build_gt3rs_study.py [-- --draft | --preview]
--preview writes only to ignored verification output; production source is untouched.
X = nose, Y = vehicle left, Z = up. Reference dimensions are not factory CAD.
"""
import bpy, math, json, sys
from pathlib import Path
from mathutils import Vector

PIPE = Path(__file__).resolve().parent
sys.path.insert(0,str(PIPE))
from gt3rs_export_helpers import web_source_mesh, lod_ratios, preserve_source_normals, export_web_glb
ROOT = PIPE.parents[4]
PREVIEW = '--preview' in sys.argv
OUT = PIPE/'verification/gt3rs-refinement' if PREVIEW else ROOT/'assets/3d/source/gt3rs-study'
OUT.mkdir(parents=True, exist_ok=True)
DRAFT = '--draft' in sys.argv or PREVIEW
VIEWS = next((arg.split('=',1)[1].split(',') for arg in sys.argv if arg.startswith('--views=')),None)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for block in list(bpy.data.materials): bpy.data.materials.remove(block)
PARTS = {}
CUTS = {}
SKINS = {}

def linear(h):
    rgb = [int(h[i:i+2], 16)/255 for i in (0,2,4)]
    return tuple(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in rgb)

def material(name, color, rough=.4, metal=0, coat=0):
    m=bpy.data.materials.new(name);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=(*linear(color),1)
    p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal
    p.inputs['Coat Weight'].default_value=coat;p.inputs['Coat Roughness'].default_value=.085
    return m

paint=material('paint','A7AAAD',.24,.62,.75)
carbon=material('carbon','141619',.34,0,.22)
carbon.node_tree.nodes.get('Principled BSDF').inputs['Specular IOR Level'].default_value=.25
rubber=material('rubber','161719',.88)
alloy=material('aluminum','474B50',.23,.78,.28)
bright=material('polished alloy','C2C5C9',.22,.93)
black=material('intake shadow','08090B',.84)
interior=material('interior','222326',.87)
glass=material('glass','D3DDE0',.045,0,0)
glass.node_tree.nodes.get('Principled BSDF').inputs['Transmission Weight'].default_value=1
glass.node_tree.nodes.get('Principled BSDF').inputs['IOR'].default_value=1.46
glass.node_tree.nodes.get('Principled BSDF').inputs['Specular IOR Level'].default_value=.24
optic=material('projector optic','697787',.11,.34,.95)
side_glass=material('tinted side glazing','26343A',.055,0,0)
side_glass.node_tree.nodes.get('Principled BSDF').inputs['Transmission Weight'].default_value=.80
side_glass.node_tree.nodes.get('Principled BSDF').inputs['IOR'].default_value=1.46
side_glass.node_tree.nodes.get('Principled BSDF').inputs['Specular IOR Level'].default_value=.12
lamp=material('lamp reflector','B8BCC4',.15,.95)
led=material('light','F4F4F2',.2,.2)
p=led.node_tree.nodes.get('Principled BSDF');p.inputs['Emission Color'].default_value=(*linear('F4F4F2'),1);p.inputs['Emission Strength'].default_value=1.4
red=material('rear lamp','66272A',.24,.2,.8)
red.node_tree.nodes.get('Principled BSDF').inputs['Emission Color'].default_value=(*linear('BD3937'),1)
red.node_tree.nodes.get('Principled BSDF').inputs['Emission Strength'].default_value=1.8
clear_lens=material('headlamp lens','C0C8CC',.025,0,.2)
clear_lens.node_tree.nodes.get('Principled BSDF').inputs['Transmission Weight'].default_value=1
clear_lens.node_tree.nodes.get('Principled BSDF').inputs['IOR'].default_value=1.46
caliper=material('caliper','DDAC2D',.31,.24,.5)
# Fine original carbon weave, using surface-generated coordinates, saved in source.
n=carbon.node_tree.nodes;l=carbon.node_tree.links
tex=n.new('ShaderNodeTexCoord');mapn=n.new('ShaderNodeMapping')
mapn.inputs['Rotation'].default_value[2]=math.pi/4;l.new(tex.outputs['Generated'],mapn.inputs['Vector'])
weave=n.new('ShaderNodeTexChecker');weave.inputs['Scale'].default_value=155
weave.inputs['Color1'].default_value=(*linear('0D0F11'),1);weave.inputs['Color2'].default_value=(*linear('17191B'),1)
l.new(mapn.outputs[0],weave.inputs['Vector']);l.new(weave.outputs['Color'],n.get('Principled BSDF').inputs['Base Color'])

def cut_prism(o,outline,axis,lo,hi):
    """Cut a true duct through a closed panel, retaining the authored surface."""
    verts=[]
    for depth in [lo,hi]:
        for a,b in outline:
            verts.append((a,b,depth) if axis=='Z' else ((depth,a,b) if axis=='X' else (a,depth,b)))
    count=len(outline)
    faces=[tuple(reversed(range(count))),tuple(range(count,count*2))]
    faces += [(i,(i+1)%count,(i+1)%count+count,i+count) for i in range(count)]
    data=bpy.data.meshes.new('temporary duct cutter');data.from_pydata(verts,[],faces);data.update()
    cutter=bpy.data.objects.new('temporary duct cutter',data);bpy.context.collection.objects.link(cutter)
    bpy.ops.object.select_all(action='DESELECT');cutter.select_set(True);bpy.context.view_layer.objects.active=cutter
    bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.normals_make_consistent(inside=False);bpy.ops.object.mode_set(mode='OBJECT')
    bpy.context.view_layer.objects.active=o
    normal_source=o.copy();normal_source.data=o.data.copy();normal_source.name='temporary surface normals'
    bpy.context.collection.objects.link(normal_source);normal_source.hide_render=True
    mod=o.modifiers.new('Recessed air duct','BOOLEAN');mod.operation='DIFFERENCE';mod.solver='EXACT';mod.object=cutter
    mod.use_self=True;mod.use_hole_tolerant=True
    bpy.ops.object.modifier_apply(modifier=mod.name)
    assert len(o.data.polygons)>0,f'Boolean removed entire panel: {o.name} {axis}'
    # Preserve the smooth designed paint field across topology introduced by cuts.
    normals=o.modifiers.new('Continuous paint normals','DATA_TRANSFER');normals.object=normal_source
    normals.use_loop_data=True;normals.data_types_loops={'CUSTOM_NORMAL'};normals.loop_mapping='POLYINTERP_NEAREST'
    bpy.ops.object.modifier_apply(modifier=normals.name)
    bpy.data.objects.remove(cutter,do_unlink=True)
    bpy.data.objects.remove(normal_source,do_unlink=True)

def collect(name,o,mat):
    # Mesh operators may inherit the active object's material. Replace that slot;
    # appending leaves polygon material_index=0 pointing at the inherited paint.
    o.data.materials.clear()
    o.data.materials.append(mat)
    for p in o.data.polygons:p.use_smooth=len(p.vertices)<=4
    PARTS.setdefault(name,[]).append(o)
    return o

def mesh(name,verts,faces,mat,solid=0):
    data=bpy.data.meshes.new(name+' surface');data.from_pydata(verts,[],faces);data.update()
    o=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(o)
    bpy.context.view_layer.objects.active=o
    if solid:
        mod=o.modifiers.new('panel return','SOLIDIFY');mod.thickness=solid
        bpy.ops.object.modifier_apply(modifier=mod.name)
    if len(faces)<=2 and len(verts)<20:
        mod=o.modifiers.new('laminate edge','BEVEL');mod.width=.002;mod.segments=3
        bpy.ops.object.modifier_apply(modifier=mod.name)
        mod=o.modifiers.new('laminate normals','WEIGHTED_NORMAL');bpy.ops.object.modifier_apply(modifier=mod.name)
    return collect(name,o,mat)

def patch(name,fn,nu,nv,mat,solid=0,omit=None):
    verts=[fn(i/nu,j/nv) for i in range(nu+1) for j in range(nv+1)]
    faces=[]
    for i in range(nu):
        for j in range(nv):
            a=i*(nv+1)+j
            if omit and omit((i+.5)/nu,(j+.5)/nv):continue
            faces.append((a,a+nv+1,a+nv+2,a+1))
    return mesh(name,verts,faces,mat,solid)

def box(name,pos,size,mat,bevel=.015):
    bpy.ops.mesh.primitive_cube_add(size=1,location=pos);o=bpy.context.object;o.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        mod=o.modifiers.new('edge radius','BEVEL');mod.width=bevel;mod.segments=3
        bpy.ops.object.modifier_apply(modifier=mod.name)
        mod=o.modifiers.new('weighted normals','WEIGHTED_NORMAL');bpy.ops.object.modifier_apply(modifier=mod.name)
    return collect(name,o,mat)

def cylinder(name,a,b,r,mat,n=32):
    a,b=Vector(a),Vector(b);bpy.ops.mesh.primitive_cylinder_add(vertices=n,radius=r,depth=(b-a).length,location=(a+b)/2)
    o=bpy.context.object;o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler()
    return collect(name,o,mat)

def tube(name,points,r,mat,closed=False):
    curve=bpy.data.curves.new(name,'CURVE');curve.dimensions='3D';curve.resolution_u=1
    curve.bevel_depth=r;curve.bevel_resolution=2
    s=curve.splines.new('POLY');s.points.add(len(points)-1);s.use_cyclic_u=closed
    for p,co in zip(s.points,points):p.co=(*co,1)
    o=bpy.data.objects.new(name,curve);bpy.context.collection.objects.link(o)
    bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
    bpy.ops.object.convert(target='MESH');return collect(name,bpy.context.object,mat)

def ellipse(name,center,a,b,rx,ry,r,mat):
    center,a,b=Vector(center),Vector(a),Vector(b)
    return tube(name,[center+a*(math.cos(t*math.tau/96)*rx)+b*(math.sin(t*math.tau/96)*ry) for t in range(96)],r,mat,True)

def lettering(name,label,width,height,fn,mat,italic=False):
    """Convert original typeset lettering to editable, surface-conformed mesh."""
    curve=bpy.data.curves.new(name+' lettering','FONT');curve.body=label
    curve.align_x='CENTER';curve.align_y='CENTER';curve.resolution_u=8
    font=Path('C:/Windows/Fonts/arialbi.ttf' if italic else 'C:/Windows/Fonts/bahnschrift.ttf')
    if font.is_file():curve.font=bpy.data.fonts.get(font.name) or bpy.data.fonts.load(str(font))
    o=bpy.data.objects.new(name+' lettering',curve);bpy.context.collection.objects.link(o)
    bpy.context.view_layer.update()
    bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
    bpy.ops.object.convert(target='MESH');o=bpy.context.object
    lo=[min(v.co[i] for v in o.data.vertices) for i in range(2)]
    hi=[max(v.co[i] for v in o.data.vertices) for i in range(2)]
    for v in o.data.vertices:
        x=(v.co.x-(lo[0]+hi[0])/2)*width/(hi[0]-lo[0])
        y=(v.co.y-(lo[1]+hi[1])/2)*height/(hi[1]-lo[1])
        v.co=fn(x,y)
    return collect(name,o,mat)

def interp(x,keys):
    for i in range(len(keys)-1):
        a,va=keys[i];b,vb=keys[i+1]
        if x<=b:
            t=max(0,(x-a)/(b-a));prev=keys[max(0,i-1)];nxt=keys[min(len(keys)-1,i+2)]
            m0=(vb-prev[1])/(b-prev[0]);m1=(nxt[1]-va)/(nxt[0]-a)
            return (2*t**3-3*t*t+1)*va+(t**3-2*t*t+t)*(b-a)*m0+(-2*t**3+3*t*t)*vb+(t**3-t*t)*(b-a)*m1
    return keys[-1][1]

def smooth(t):return max(0,min(1,t))**2*(3-2*max(0,min(1,t)))
def width(x):return interp(x,[(-2.24,.89),(-1.72,.951),(-1.30,.960),(-.72,.917),(0,.888),(.59,.929),(1.24,.963),(1.75,.945),(2.31,.91)])
def centerz(x):return interp(x,[(-2.24,.81),(-1.75,.87),(-1.35,.885),(-.65,.818),(.52,.829),(1.12,.805),(1.72,.737),(2.31,.623)])
def shoulder(x):return interp(x,[(-2.24,.79),(-1.72,.882),(-1.30,.883),(-.72,.842),(0,.825),(.59,.839),(1.24,.853),(1.75,.777),(2.31,.620)])
def crown(x):return interp(x,[(-2.24,.815),(-1.7,.930),(-1.3,.945),(-.7,.880),(0,.851),(.6,.875),(1.23,.900),(1.70,.850),(2.31,.645)])
def wrapx(x,q):return x-(.13+.23*q*q)*smooth((x-1.85)/.46)+.27*q*q*smooth((-x-1.9)/.34)
def hood_edge(x):return .674-.097*smooth((x-.70)/1.50) if x>.56 else .667
def upper(x,q):
    q=max(0,min(1,q))
    # Smooth, broad fender crown: no narrow bulge beside a flat bonnet.
    if q<=.42:z=centerz(x)+.009*(q/.42)**2
    elif q<=.82:z=centerz(x)+.009+(crown(x)-centerz(x)-.009)*smooth((q-.42)/.40)
    else:z=shoulder(x)+(crown(x)-shoulder(x))*math.sqrt(max(0,1-((q-.82)/.18)**2))
    xp,yp=wrapx(x,q),q*width(x)*.988
    d=math.sqrt(((xp-1.80)/.181)**2+((yp-.742)/.156)**2)
    flatten=1-smooth((d-1.0)/.90)
    lens_plane=.745-.69*(xp-1.80)-.10*(yp-.742)
    z=z*(1-flatten)+lens_plane*flatten
    return (xp,yp,z)
def arch(x):
    z=.18
    for cx,r,cz in [(-1.31,.390,.3672),(1.16,.373,.35025)]:
        d=abs(x-cx)
        # Tangential return below wheel centre; not a vertical slit in the arch.
        if d<r:z=max(z,cz+math.sqrt(r*r-d*d))
        elif d<r+.060:z=max(z,.18+(cz-.18)*(1-smooth((d-r)/.060)))
    return z
def sidepoint(x,t,sign):
    bottom=arch(x);top=upper(x,1)[2];z=bottom+(top-bottom)*t
    y=width(x)*.988+.008*math.sin(math.pi*t)-.028*(1-t)**4
    waist=smooth((x+1.10)/.35)*(1-smooth((x-.40)/.30))
    y-=.041*math.exp(-((z-.46)/.19)**2)*waist*math.sin(math.pi*t)**2
    v=max(0,min(1,(z-.145)/(upper(2.31,1)[2]-.145)))
    xw=wrapx(x,1)+(.15*math.sin(math.pi*v)+.06*(1-v))*smooth((x-1.85)/.46)
    rv=max(0,min(1,(z-.18)/(upper(-2.24,1)[2]-.18)))
    xw+=(.05*(1-rv)**2-.015*math.sin(math.pi*rv))*smooth((-x-1.9)/.34)
    return (xw,sign*y,z)

# Three separable panels each side, two real doors. Dense surface sampling keeps
# the rolled arch openings and shoulder reflections continuous without Subsurf.
def door_seam(x,t):
    if -.77<x<-.74:return x-.055*math.sin(math.pi*t)+.12*(1-t)**4
    if .54<x<.58:return x+.015*math.sin(math.pi*t)-.060*(1-t)**2
    return x
for sign,side in [(1,'L'),(-1,'R')]:
    for stem,a,b in [('quarter_R',-2.24,-.756),('door_F',-.750,.555),('quarter_F',.561,2.31)]:
        name=stem+side
        patch(name,lambda u,v,a=a,b=b,s=sign:sidepoint(door_seam(a,v)+(door_seam(b,v)-door_seam(a,v))*u,v,s),128,28,paint)
        # Shoulder strip bridges to the cabin or hood without flattening fenders.
        patch(name,lambda u,v,a=a,b=b,s=sign:(lambda x:(lambda p:(p[0],p[1]*s,p[2]))(upper(x,hood_edge(x)+(1-hood_edge(x))*v)))(a+(b-a)*u),128,24,paint)
        # Close ONLY the painted skin before adding trim, lettering and cards.
        # Solidifying the whole semantic group also inflates closed trim meshes.
        bpy.ops.object.select_all(action='DESELECT')
        for item in PARTS[name]:item.select_set(True)
        bpy.context.view_layer.objects.active=PARTS[name][0];bpy.ops.object.join()
        skin=bpy.context.object
        bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.mesh.remove_doubles(threshold=.00001);bpy.ops.mesh.normals_make_consistent(inside=False)
        bpy.ops.object.mode_set(mode='OBJECT')
        mod=skin.modifiers.new('Painted shell return','SOLIDIFY');mod.thickness=.004
        bpy.ops.object.modifier_apply(modifier=mod.name)
        PARTS[name]=[skin];SKINS[name]=skin
    # Rocker has a raised outer winglet at the front wheel's trailing edge.
    patch('side_skirt_'+side,lambda u,v,s=sign:(-.85+1.55*u,s*(.89+.035*math.sin(v*math.pi)),.13+.085*v),35,6,carbon,.014)
    # Body-color recessed handle and the small horizontal shadow below its pull.
    handle_x=-.42;handle_z=.750;handle_t=(handle_z-arch(handle_x))/(upper(handle_x,1)[2]-arch(handle_x))
    handle_y=sidepoint(handle_x,handle_t,sign)[1]
    box('door_F'+side,(handle_x,handle_y+sign*.001,handle_z),(.227,.009,.045),black,.021)
    box('door_F'+side,(handle_x,handle_y+sign*.010,handle_z+.004),(.210,.014,.035),paint,.017)
    # Rear brake-cooling opening: an inlaid taper, shaped along the quarter.
    def vent(u,v,s=sign):
        x=-.90+.082*v+.190*(u-.5)*math.sin(math.pi*v)**.43
        z=.585+.254*v;t=(z-arch(x))/(upper(x,1)[2]-arch(x));p=sidepoint(x,t,s)
        return (p[0],p[1],z)
    patch('rear_vent_'+side,lambda u,v,s=sign:(lambda p:(p[0],p[1]-s*.062,p[2]))(vent(u,v,s)),18,32,black,.003)
    contour=[vent(0,.02+.96*i/40) for i in range(41)]+[vent(1,.98-.96*i/40) for i in range(41)]
    CUTS['quarter_R'+side]=[([(p[0],p[2]) for p in contour],'Y',sign*.92-.20,sign*.92+.20)]
    tube('rear_vent_'+side,contour,.003,paint,True)
    mesh('rear_vent_'+side,contour+[(p[0],p[1]-sign*.060,p[2]) for p in contour],[(i,(i+1)%len(contour),(i+1)%len(contour)+len(contour),i+len(contour)) for i in range(len(contour))],carbon)
    # Arch louvers follow the front fender crown.
    patch('fender_louver_'+side,lambda u,v,s=sign:(lambda p:(p[0],s*p[1],p[2]-.036))(upper(.97+.43*u,.775+.17*v)),24,14,black,.002)
    corners=[upper(x,q) for x,q in [(.98,.78),(1.39,.78),(1.39,.94),(.98,.94)]]
    CUTS['quarter_F'+side]=[([(p[0],p[1]*sign) for p in corners],'Z',.810,1.10)]
    for k in range(3):
        x=1.01+k*.13
        patch('fender_louver_'+side,lambda u,v,x=x,s=sign:(lambda p:(p[0],s*p[1],p[2]-.016+.019*u))(upper(x+.07*u,.778+.165*v)),6,18,carbon,.0025)
    # Vertical outer aero blade, behind the front wheel.
    points=[(.775,sign*.941,.13),(.746,sign*.956,.650),(.635,sign*.947,.678),(.573,sign*.930,.13)]
    mesh('arch_blade_'+side,points,[(0,1,2,3)],carbon,.008)
    # Surface-conforming identity stripe and crisp typography, not a flat card.
    def decal_point(x,z,s=sign,offset=.0012):
        t=(z-arch(x))/(upper(x,1)[2]-arch(x));p=sidepoint(x,t,s)
        return (p[0],p[1]+s*offset,z)
    patch('door_F'+side,lambda u,v,s=sign:decal_point(-.683+1.19*u,.247+.112*v,s),64,8,carbon)
    lettering('door_F'+side,'GT3 RS',1.04,.074,lambda x,z,s=sign:decal_point(-.087-sign*x,.303+z,s,.0020),paint,True)
    # Small clearcoat shut line around the fuel flap, on the right-hand fender.
    if side=='R':
        tube('quarter_FR',[decal_point(.700+.061*math.cos(i*math.tau/96),.774+.061*math.sin(i*math.tau/96),-1,.0007) for i in range(96)],.0008,carbon,True)

def deck_patch(name,a,b):
    # Hood/deck bounded by longitudinal seams against shoulder strips.
    def fn(u,v):
        x=a+(b-a)*u;q=(v*2-1)*(hood_edge(x)-.003);p=upper(x,abs(q))
        return (p[0],p[1]*(1 if q>=0 else -1),p[2])
    return patch(name,fn,64,52,paint,.006)
hood_shell=deck_patch('hood',.572,2.306)
deck_patch('trunk',-2.237,-1.358)

# Deep radiator-extraction ducts, with thin molded lips and internal vanes.
for sign in [-1,1]:
    outline=[(.96,sign*.16),(1.63,sign*.225),(1.63,sign*.435),(.96,sign*.405)]
    cut_prism(hood_shell,outline,'Z',.50,1.20)
    def hoodvent(u,v,s=sign):
        x=.955+.68*u;y=s*(.16+.065*u+(.245-.035*u)*v);q=abs(y)/(width(x)*.988);p=upper(x,q)
        return (p[0],y,p[2])
    patch('hood',lambda u,v,s=sign:(lambda p:(p[0],p[1],p[2]-.052))(hoodvent(u,v,s)),24,12,black,.003)
    edges=[hoodvent(i/36,0,sign) for i in range(37)]+[hoodvent(1,i/16,sign) for i in range(1,17)]+[hoodvent(1-i/36,1,sign) for i in range(1,37)]+[hoodvent(0,1-i/16,sign) for i in range(1,16)]
    mesh('hood',edges+[(p[0],p[1],p[2]-.055) for p in edges],[(i,(i+1)%len(edges),(i+1)%len(edges)+len(edges),i+len(edges)) for i in range(len(edges))],carbon)
    patch('hood',lambda u,v,s=sign:(lambda p:(p[0],p[1],p[2]+.025*math.sin(u*math.pi/2)))(hoodvent(.005+.235*u,v,s)),12,18,paint,.004)
    for v in [.34,.68]:
        patch('hood',lambda u,w,v=v,s=sign:(lambda p:(p[0],p[1],p[2]-.05+.041*w))(hoodvent(.22+.765*u,v,s)),24,2,carbon,.002)

# Dome and glazing. Three-dimensional, rounded 911-like greenhouse.
RZ=[(-1.58,.879),(-1.36,1.005),(-1.12,1.132),(-.85,1.218),(-.48,1.260),(-.13,1.246),(.08,1.179),(.38,.997),(.57,.843)]
RW=[(-1.58,.751),(-1.36,.710),(-1.12,.680),(-.85,.650),(-.48,.640),(-.13,.645),(.08,.666),(.38,.739),(.57,.784)]
def canopy(x,q):return (x,q*interp(x,RW),interp(x,RZ)-.058*q*q)
patch('roof',lambda u,v:canopy(-.87+.948*u,v*2-1),44,44,paint,.008)
patch('roof',lambda u,v:(lambda p:(p[0],p[1],p[2]-.014))(canopy(-.86+.925*u,(v*2-1)*.976)),44,36,interior,.004)
patch('glass_windshield',lambda u,v:canopy(.087+.479*u,(v*2-1)*.975),30,40,glass,.003)
patch('glass_rear',lambda u,v:canopy(-1.566+.687*u,(v*2-1)*.954),40,40,glass,.003)
# Ceramic frit/seals give the glazing an actual manufactured edge.
for name,a,b,qmax in [('glass_windshield',.087,.566,.975),('glass_rear',-1.566,-.879,.954)]:
    border=[canopy(a+(b-a)*i/60,-qmax) for i in range(61)]+[canopy(b,-qmax+2*qmax*i/60) for i in range(1,61)]+[canopy(b-(b-a)*i/60,qmax) for i in range(1,61)]+[canopy(a,qmax-2*qmax*i/60) for i in range(1,60)]
    tube(name,[(p[0],p[1],p[2]+.0015) for p in border],.008,black,True)
    # Ceramic border is a surface band, not an oversized round rubber tube.
    for s in [-1,1]:
        patch(name,lambda u,v,a=a,b=b,q=qmax,s=s:(lambda p:(p[0],p[1],p[2]+.003))(canopy(a+(b-a)*u,s*(q-.028*v))),48,3,black)
    for end,direction in [(a,1),(b,-1)]:
        patch(name,lambda u,v,e=end,d=direction,q=qmax:(lambda p:(p[0],p[1],p[2]+.003))(canopy(e+d*.030*v,(u*2-1)*q)),40,3,black)
for sign in [-1,1]:
    tube('glass_windshield',[(lambda p:(p[0],p[1],p[2]+.009))(canopy(.529-.027*math.sin(i*math.pi/32),sign*(.03+.66*i/32))) for i in range(33)],.005,black)
    # Two restrained roof guides; no decorative fins or extra animated names.
    patch('roof',lambda u,v,s=sign:(lambda p:(p[0],p[1],p[2]+.023*math.sin(math.pi*u)*v))(canopy(-.73+.53*u,s*.67)),30,2,carbon,.003)
for sign,side in [(1,'L'),(-1,'R')]:
    def window(x,t,s=sign):
        bottom=interp(x,[(-1.58,.879),(-1.36,.907),(-1.0,.872),(-.75,.847),(.20,.831),(.57,.835)])
        top=interp(x,RZ)-.058
        return (x,s*((width(x)*.84)*(1-t)+interp(x,RW)*t),bottom+(top-bottom)*t)
    patch('glass_'+side,lambda u,v:window(-1.350+1.84*u,v),80,20,side_glass,.003)
    # B-pillar separates rear quarter glass from the actual front door glass.
    patch('roof',lambda u,v,s=sign:(lambda p:(p[0],p[1]+s*.004,p[2]))(window(-.784+.052*u,v,s)),6,20,black,.006)
    # Broad rear pillar and slender front pillar join the roof to the shoulders.
    for a,b in [(-1.58,-1.355),(.493,.57)]:
        patch('roof',lambda u,v,a=a,b=b:window(a+(b-a)*u,v),18,14,paint,.008)
    tube('roof',[window(x,1,sign) for x in [-1.36+i*1.92/120 for i in range(121)]],.009,paint)
    tube('roof',[window(x,0,sign) for x in [-1.36+i*1.92/120 for i in range(121)]],.007,carbon)
    # Sills below the greenhouse fill the inboard shoulder gap.
    patch('roof',lambda u,v,s=sign:(lambda x:(x,s*((width(x)*.667)*(1-v)+(width(x)*.84)*v),upper(x,.667)[2]*(1-v)+window(x,0,s)[2]*v))(-1.578+2.145*u),80,12,paint,.005)
    cylinder('mirror_'+side,(.36,sign*.785,.875),(.33,sign*.941,.909),.021,carbon,20)
    # Streamlined mirror shell, rounded rather than cuboid.
    patch('mirror_'+side,lambda u,v,s=sign:(.30+.143*math.cos(u*math.tau)*math.sin(v*math.pi),s*(.948+.065*math.sin(u*math.tau)*math.sin(v*math.pi)),.936+.050*math.cos(v*math.pi)),48,24,paint)
    box('mirror_'+side,(.177,sign*.948,.933),(.008,.105,.057),lamp,.016)

# Ovoid headlamps lie on the sloping fender, with actual inset reflectors and DRL.
for sign,side in [(1,'L'),(-1,'R')]:
    cx,cy=1.80,sign*.742
    def lenspos(a,r=1,raisez=0):
        x=cx+.181*math.cos(a)*r;y=cy+sign*.156*math.sin(a)*r
        return (x,y,.745-.69*(x-cx)-.10*sign*(y-cy)+raisez)
    contour=[lenspos(i*math.tau/120,.977)[:2] for i in range(120)]
    CUTS.setdefault('quarter_F'+side,[]).append((contour,'Z',.45,1.1))
    patch('headlight_'+side,lambda u,v:lenspos(u*math.tau,v,-.048*(1-v*v)),96,24,black,.005)
    tube('headlight_'+side,[lenspos(i*math.tau/120,1,.004) for i in range(120)],.0045,carbon,True)
    tube('headlight_'+side,[lenspos(i*math.tau/120,.89,-.007) for i in range(120)],.0035,bright,True)
    normal=Vector((.69,sign*.10,1)).normalized();a=Vector((0,1,-sign*.10)).normalized();b=normal.cross(a).normalized()
    for dx,radius in [(-.070,.039),(.052,.056)]:
        p=Vector((cx+dx,cy,.745-.69*dx-.022))
        patch('headlight_'+side,lambda u,v,p=p,r=radius:tuple(p+a*(math.cos(u*math.tau)*(r+.012*v))+b*(math.sin(u*math.tau)*(r+.012*v))-normal*(.023*(1-v)**2)),64,10,lamp)
        ellipse('headlight_'+side,p,a,b,radius,radius,.0035,bright)
        patch('headlight_'+side,lambda u,v,p=p,r=radius:tuple(p+a*(math.cos(u*math.tau)*r*v)+b*(math.sin(u*math.tau)*r*v)+normal*(.011*(1-v*v))),64,12,optic,.002)
    for angle in [math.pi*.25,math.pi*.75,math.pi*1.25,math.pi*1.75]:
        p=Vector(lenspos(angle,.64,-.009))
        tube('headlight_'+side,[p+a*t for t in [-.014,.014]],.005,led)
    patch('headlight_'+side,lambda u,v:lenspos(u*math.tau,v,.004+.016*(1-v*v)),96,24,clear_lens,.0018)

# Continuous curved fascias, with openings cut directly out of their grid.
def front(u,v):
    q=u*2-1;y=q*.91*.988;top=upper(2.31,abs(q))[2];z=.145+(top-.145)*v
    x=2.18-.23*q*q+.15*math.sin(v*math.pi)+.06*(1-v)
    t=max(0,min(1,(z-.18)/(upper(2.31,1)[2]-.18)))
    y=q*(.91*.988+.008*math.sin(math.pi*t)-.028*(1-t)**4)
    return (x,y,z)
def hole(u,v):
    y=abs((u*2-1)*.91);z=.145+.49*v
    middle=y<.64 and .205<z<.465 and ((y/.64)**8+((z-.335)/.135)**8)<1
    side=.713<y<.858 and .236<z<.396
    return middle or side
fascia=patch('front_bumper',front,100,38,paint,.012)
def aperture(y,z,ry,rz):
    return [(y+ry*math.copysign(abs(math.cos(t*math.tau/96))**.33,math.cos(t*math.tau/96)),z+rz*math.copysign(abs(math.sin(t*math.tau/96))**.5,math.sin(t*math.tau/96))) for t in range(96)]
cut_prism(fascia,aperture(0,.322,.786,.132),'X',1.80,2.60)
for sign in [-1,1]:cut_prism(fascia,aperture(sign*.678,.492,.142,.018),'X',1.82,2.60)
patch('front_bumper',lambda u,v:(2.254-.23*((u*2-1)*.80/.91)**2,(u*2-1)*.80,.18+.29*v),80,20,black)
# A real recessed wire grille, following the bumper's curvature.
for k in range(101):
    y=-.75+k*1.50/100
    cylinder('front_bumper',(2.263-.23*(y/.91)**2,y,.199),(2.263-.23*(y/.91)**2,y,.445),.0011,alloy,6)
for z in [.208+i*.016 for i in range(15)]:
    tube('front_bumper',[(2.268-.23*(y/.91)**2,y,z) for y in [-.755+i*1.51/50 for i in range(51)]],.0011,alloy)
for sign in [-1,1]:
    tube('front_bumper',[(2.325-.23*(y/.91)**2,y,.492) for y in [sign*(.56+i*.245/24) for i in range(25)]],.009,black)
    tube('front_bumper',[(2.336-.23*(y/.91)**2,y,.491) for y in [sign*(.565+i*.234/24) for i in range(25)]],.0022,lamp)
    # Angled grille cheeks continue into the lower carbon lip.
    patch('front_bumper',lambda u,v,s=sign:(2.300-.23*((.52+.20*u)/.91)**2-.048*v,s*(.52+.20*u+.035*v),.185+.256*v),14,12,carbon,.005)
patch('splitter',lambda u,v:(2.19+.19*v-.25*(u*2-1)**2,(u*2-1)*.947,.13+.018*math.sin(v*math.pi)),80,6,carbon,.018)
for sign,side in [(1,'L'),(-1,'R')]:
    mesh('splitter',[(2.15,sign*.940,.14),(2.14,sign*.944,.26),(1.99,sign*.949,.45),(1.94,sign*.943,.456),(2.02,sign*.935,.15)],[(0,1,2,3,4)],carbon,.006)

def rear(u,v):
    q=u*2-1;y=q*.90*.988;top=upper(-2.24,abs(q))[2]
    z=.18+(top-.18)*v;t=max(0,min(1,(z-.18)/(upper(-2.24,1)[2]-.18)))
    y=q*(.89*.988+.008*math.sin(math.pi*t)-.028*(1-t)**4)
    return (-2.24+.27*q*q+.05*(1-v)**2-.015*math.sin(v*math.pi),y,z)
patch('rear_bumper',rear,80,30,paint,.010)
# Body-to-fascia seams must agree geometrically after headlamp surface shaping.
seam_error=0
for endpoint,fn,bottom in [(2.31,front,.145),(-2.24,rear,.18)]:
    top=upper(endpoint,1)[2]
    for i in range(101):
        p=Vector(sidepoint(endpoint,i/100,1));q=Vector(fn(1,(p.z-bottom)/(top-bottom)))
        seam_error=max(seam_error,(p-q).length)
assert seam_error<.00001, f'Open fascia seam: {seam_error}m'
patch('rear_bumper',lambda u,v:(lambda p:(p[0]-.009,p[1],p[2]))(rear(.030+.94*u,.015+.38*v)),64,12,carbon,.005)
patch('rear_bumper',lambda u,v:(lambda p:(p[0]-.007,p[1],p[2]))(rear(.33+.34*u,.53+.16*v)),24,8,carbon,.004)
patch('diffuser',lambda u,v:(-2.28+.15*(u*2-1)**2+.22*v,(u*2-1)*.895,.13+.14*v),64,10,carbon,.012)
for y in [-.70,-.45,-.16,.16,.45,.70]:
    mesh('diffuser',[(-2.28,y,.105),(-1.96,y,.14),(-1.96,y,.25),(-2.28,y,.185)],[(0,1,2,3)],carbon,.006)
for sign,side in [(1,'L'),(-1,'R')]:
    pts=[]
    for y in [sign*(.015+i*.82/60) for i in range(61)]:
        u=(y/(.90*.988)+1)/2;top=upper(-2.24,abs(u*2-1))[2]
        p=rear(u,(.715-.18)/(top-.18));pts.append((p[0]-.012,y,.715))
    tube('taillight_'+side,pts,.013,black)
    tube('taillight_'+side,[(p[0]-.014,p[1],p[2]+.001) for p in pts],.005,red)
    cylinder('exhaust',(-2.15,sign*.105,.240),(-2.257,sign*.105,.240),.049,alloy,64)
    cylinder('exhaust',(-2.258,sign*.105,.240),(-2.260,sign*.105,.240),.043,black,64)
    ellipse('exhaust',(-2.261,sign*.105,.240),(0,1,0),(0,0,1),.046,.046,.0025,bright)
def rear_mark(y,z):
    q=abs(y)/(.89*.988);top=upper(-2.24,q)[2]
    p=rear((y/(.89*.988)+1)/2,(z-.18)/(top-.18))
    return (p[0]-.015,p[1],z)
lettering('rear_bumper','P O R S C H E',.60,.030,lambda x,z:rear_mark(-x,.770+z),carbon)
lettering('rear_bumper','GT3 RS',.235,.027,lambda x,z:rear_mark(-x,.658+z),carbon,True)
for i in range(14):
    y=-.57+i*.088
    tube('trunk',[(lambda p:(p[0],y,p[2]+.004))(upper(x,abs(y)/(width(x)*.988))) for x in [-2.11+j*.34/20 for j in range(21)]],.0045,carbon)

# Inverted-airfoil wing with two independent elements and swept endplates.
def airfoil(name,x0,chord,z0,span):
    def foil(u,v):
        y=(u*2-1)*span;theta=v*math.tau;t=(1-math.cos(theta))/2
        x=x0+chord*t+.055*(abs(y)/span)**3
        thickness=.05*chord*math.sin(theta)*(1-.55*t)
        z=z0-.055*math.sin(t*math.pi)+.045*t+thickness
        return (x,y,z)
    return patch(name,foil,64,30,carbon)
airfoil('wing_main',-2.19,.35,1.208,.919)
airfoil('wing_flap',-2.285,.14,1.255,.919)
for sign,side in [(1,'L'),(-1,'R')]:
    profile=[(-2.290,1.205),(-2.308,1.306),(-2.255,1.322),(-1.868,1.295),(-1.802,1.237),(-1.930,1.208)]
    mesh('wing_endplate_'+side,[(x,sign*.926,z) for x,z in profile],[tuple(range(len(profile)))],carbon,.007)
for sign in [-1,1]:
    # Smooth, thin swan-neck ribbons support the upper surface of the airfoil.
    xkeys=[(0,-1.72),(.35,-1.77),(.64,-1.84),(.84,-2.030),(1,-2.075)]
    zkeys=[(0,.910),(.35,1.11),(.64,1.293),(.84,1.289),(1,1.255)]
    verts=[]
    for i in range(49):
        t=i/48;x=interp(t,xkeys);z=interp(t,zkeys)
        dx=interp(min(1,t+.002),xkeys)-interp(max(0,t-.002),xkeys)
        dz=interp(min(1,t+.002),zkeys)-interp(max(0,t-.002),zkeys)
        length=math.hypot(dx,dz);nx,nz=-dz/length,dx/length
        half=.026-.003*t
        for edge,depth in [(-1,-.010),(1,-.010),(1,.010),(-1,.010)]:
            verts.append((x+nx*half*edge,sign*.51+depth,z+nz*half*edge))
    faces=[(0,3,2,1),(192,193,194,195)]
    for i in range(48):
        for j in range(4):faces.append((i*4+j,i*4+(j+1)%4,(i+1)*4+(j+1)%4,(i+1)*4+j))
    support=mesh('wing_supports',verts,faces,carbon)
    for face in support.data.polygons:face.use_smooth=False
    box('wing_supports',(-1.72,sign*.51,.906),(.14,.072,.019),carbon,.008)
    for x in [-2.030,-1.974]:
        cylinder('wing_supports',(x,sign*.51,1.28),(x,sign*.51,1.297),.006,bright,12)
    cylinder('wing_flap',(-2.179,sign*.55,1.231),(-2.221,sign*.55,1.273),.011,alloy,24)

# Rolling assemblies: profiled tire carcass, forged Y-spokes, center lock, rotor.
for cx,axle,rad,ww,wy in [(-1.31,'R',.36720,.335,.791),(1.16,'F',.35025,.275,.815)]:
    cz=rad+.014
    rim=.2667 if axle=='R' else .2540
    for sign,side in [(1,'L'),(-1,'R')]:
        suffix=axle+side;name='wheel_'+suffix;cy=sign*wy
        profile=[(-ww*.47,rim),(-ww*.50,rad-.057),(-ww*.495,rad-.035),(-ww*.44,rad-.012),(-ww*.31,rad-.001),(-ww*.20,rad),(.20*ww,rad),(.31*ww,rad-.001),(.44*ww,rad-.012),(.495*ww,rad-.035),(.50*ww,rad-.057),(.47*ww,rim)]
        def tire(u,v):
            index=v*(len(profile)-1);i=min(int(index),len(profile)-2);t=index-i
            y=profile[i][0]*(1-t)+profile[i+1][0]*t;r=profile[i][1]*(1-t)+profile[i+1][1]*t
            return (cx+math.sin(u*math.tau)*r,cy+y,cz+math.cos(u*math.tau)*r)
        patch(name,tire,144,27,rubber)
        for dy in [-.073,-.025,.025,.073]:
            tube(name,[(cx+math.sin(a*math.tau/144)*(rad+.0004),cy+dy,cz+math.cos(a*math.tau/144)*(rad+.0004)) for a in range(144)],.0018,black,True)
        facey=cy+sign*(ww*.475)
        # Shallow barrel; machined outer lip and smaller inner bead.
        patch(name,lambda u,v:(cx+math.sin(u*math.tau)*(rim+.003*math.sin(v*math.pi)),facey-sign*.20*v,cz+math.cos(u*math.tau)*(rim+.003*math.sin(v*math.pi))),144,10,alloy)
        ellipse(name,(cx,facey,cz),(1,0,0),(0,0,1),rim,rim,.004,alloy)
        ellipse(name,(cx,facey-sign*.009,cz),(1,0,0),(0,0,1),rim-.011,rim-.011,.002,bright)
        cylinder(name,(cx,facey-sign*.07,cz),(cx,facey+.002*sign,cz),.066,alloy,48)
        cylinder(name,(cx,facey+.003*sign,cz),(cx,facey+.012*sign,cz),.036,bright,12)
        cylinder(name,(cx,facey+.013*sign,cz),(cx,facey+.014*sign,cz),.024,carbon,32)
        lettering(name,'RS',.026,.013,lambda x,z:(cx-sign*x,facey+sign*.0145,cz+z),bright,True)
        tyre_label='335/30 ZR21' if axle=='R' else '275/35 ZR20'
        lettering(name,tyre_label,.175,.010,lambda x,z:(cx-sign*math.sin(x/(rad-.038))*(rad-.038+z),cy+sign*(ww*.502),cz+math.cos(x/(rad-.038))*(rad-.038+z)),rubber)
        # Molded shoulder blocks and small radial sidewall ribs catch grazing light.
        for k in range(64):
            angle=k*math.tau/64
            for end in [-1,1]:
                tube(name,[(cx+math.sin(angle+.055*t)*(rad-.012-.019*t),cy+end*ww*(.44+.055*t),cz+math.cos(angle+.055*t)*(rad-.012-.019*t)) for t in [i/4 for i in range(5)]],.0008,black)
        # Five clean Y-spokes: cast/forged section, concavity and radiused edges.
        outline=[(.052,-.022),(.119,-.023),(.244,-.073),(.260,-.058),(.178,-.009),(.145,0),(.178,.009),(.260,.058),(.244,.073),(.119,.023),(.052,.022)]
        for k in range(5):
            angle=k*math.tau/5;verts=[];count=len(outline)
            for depth in [-.009,.009]:
                for r,t in outline:
                    r*=rim/.2667;t*=rim/.2667
                    verts.append((cx+math.sin(angle)*r+math.cos(angle)*t,facey-sign*(.055*(1-r/rim)**1.45)+depth,cz+math.cos(angle)*r-math.sin(angle)*t))
            faces=[tuple(reversed(range(count))),tuple(range(count,count*2))]+[(j,(j+1)%count,(j+1)%count+count,j+count) for j in range(count)]
            spoke=mesh(name,verts,faces,alloy)
            for face in spoke.data.polygons:face.use_smooth=False
            mod=spoke.modifiers.new('Forged edge radius','BEVEL');mod.width=.0022;mod.segments=3
            bpy.ops.object.modifier_apply(modifier=mod.name)
            mod=spoke.modifiers.new('Machined normals','WEIGHTED_NORMAL');bpy.ops.object.modifier_apply(modifier=mod.name)
        by=facey-sign*.075
        cylinder('brake_'+suffix,(cx,by-sign*.025,cz),(cx,by,cz),.225,alloy,96)
        for rr in [.135,.185,.214]:
            ellipse('brake_'+suffix,(cx,by+sign*.001,cz),(1,0,0),(0,0,1),rr,rr,.0013,bright)
        for k in range(32):
            a=k*math.tau/32
            for rr in [.16,.202]:
                x=cx+math.sin(a+rr)*rr;z=cz+math.cos(a+rr)*rr
                cylinder('brake_'+suffix,(x,by+sign*.001,z),(x,by+sign*.002,z),.0042,black,8)
        box('brake_'+suffix,(cx-.183,by+sign*.004,cz),(.09,.050,.24),caliper,.025)
        for dx in [-.18,.18]:cylinder('suspension_'+suffix,(cx+dx,sign*.40,.32),(cx,sign*.77,cz),.025,alloy,16)
        cylinder('suspension_'+suffix,(cx,sign*.74,cz),(cx-.06,sign*.67,.82),.032,carbon,24)
        # Visible, modeled coil spring rather than a plain cylinder.
        tube('suspension_'+suffix,[(cx-.025+math.cos(t*math.tau*6)*.059,sign*.69+math.sin(t*math.tau*6)*.059,.45+.31*t) for t in [i/150 for i in range(151)]],.007,alloy)

# Intentionally simplified hidden structure and cockpit, not repair evidence.
box('chassis',(0,0,.24),(3.85,1.54,.105),interior,.055)
for sign in [-1,1]:box('chassis',(-.02,sign*.70,.33),(3.60,.085,.15),alloy,.025)
for x,axle in [(1.16,'F'),(-1.31,'R')]:
    box('subframe_'+axle,(x,0,.30),(.56,1.40,.085),carbon,.025)
    cylinder('subframe_'+axle,(x,-.78,.35),(x,.78,.35),.036,alloy)
for y,name in [(.39,'seat_driver'),(-.39,'seat_passenger')]:
    box(name,(-.16,y,.434),(.57,.40,.095),carbon,.042)
    box(name,(-.115,y,.483),(.47,.326,.077),interior,.035)
    def seat_back(u,v,y=y):
        width=interp(u,[(0,.176),(.30,.195),(.63,.226),(.77,.207),(.83,.132),(1,.106)])
        q=v*2-1
        return (-.432-.136*u+.036*(1-q*q)+.078*abs(q)**4,y+q*width,.49+.644*u)
    shell=patch(name,seat_back,56,32,carbon,.009)
    for side in [-1,1]:
        cut_prism(shell,aperture(y+side*.060,1.002,.034,.021),'X',-.70,-.20)
    patch(name,lambda u,v:(lambda p:(p[0]+.015,p[1],p[2]))(seat_back(.06+.655*u,.15+.70*v)),42,24,interior,.015)
    patch(name,lambda u,v:(lambda p:(p[0]+.014,p[1],p[2]))(seat_back(.84+.135*u,.12+.76*v)),16,24,interior,.014)
    for dy in [-.187,.187]:box(name,(-.16,y+dy,.539),(.43,.055,.146),interior,.026)
    for q in [.17,.83]:
        tube(name,[(lambda p:(p[0]+.026,p[1],p[2]))(seat_back(.08+.62*i/64,q)) for i in range(65)],.0008,alloy)
    for side in [-1,1]:
        patch(name,lambda u,v,s=side,y=y:(-.402-.125*u,y+s*(.077+.012*u)+.021*(v-.5),.51+.464*u),30,3,black,.0015)
box('dashboard',(.46,0,.795),(.24,1.38,.13),interior,.06)
box('center_console',(.06,0,.51),(.71,.19,.22),carbon,.04)
ellipse('steering_wheel',(.20,.39,.825),(0,1,0),(-.4,0,.916),.14,.14,.017,interior)
cylinder('steering_wheel',(.20,.39,.825),(.26,.39,.80),.046,carbon)
for angle in [0,math.pi,math.pi*1.5]:
    center=Vector((.20,.39,.825));a=Vector((0,1,0));b=Vector((-.4,0,.916))
    direction=a*math.cos(angle)+b*math.sin(angle)
    across=a*(-math.sin(angle))+b*math.cos(angle)
    verts=[tuple(center+direction*r+across*t) for r,t in [(.029,-.023),(.125,-.012),(.125,.012),(.029,.023)]]
    mesh('steering_wheel',verts,[(0,1,2,3)],alloy,.008)
# Instrument binnacle, display bezel, cabin door cards and metallic door pulls.
box('dashboard',(.355,.39,.870),(.19,.39,.077),black,.036)
box('dashboard',(.306,-.055,.803),(.012,.32,.105),carbon,.011)
box('dashboard',(.299,-.055,.806),(.006,.295,.080),optic,.004)
box('center_console',(.073,0,.651),(.10,.080,.033),alloy,.010)
for sign,side in [(1,'L'),(-1,'R')]:
    box('door_F'+side,(-.035,sign*.747,.563),(1.05,.035,.329),interior,.038)
    box('door_F'+side,(-.06,sign*.708,.607),(.47,.080,.066),carbon,.019)
    tube('door_F'+side,[(.25,sign*.704,.72),(.11,sign*.704,.72),(.07,sign*.704,.69)],.007,bright)
for y in [-.57,.57]:
    tube('roll_cage',[(-.79,y,.27),(-.79,y,1.09),(-.71,y*.75,1.18)],.019,alloy)
tube('roll_cage',[(-.71,-.43,1.18),(-.71,.43,1.18)],.019,alloy)
tube('roll_cage',[(-.80,-.57,.33),(-.75,.54,1.09)],.016,alloy)
tube('roll_cage',[(-.80,.57,.33),(-.75,-.54,1.09)],.016,alloy)

# Join only within semantic parts and recenter pivots for the reconstruction.
objects=[]
for name,components in PARTS.items():
    for outline,axis,lo,hi in CUTS.get(name,[]):cut_prism(SKINS[name],outline,axis,lo,hi)
    bpy.ops.object.select_all(action='DESELECT')
    for o in components:o.select_set(True)
    bpy.context.view_layer.objects.active=components[0]
    if len(components)>1:bpy.ops.object.join()
    o=bpy.context.object;o.name=name
    bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY',center='BOUNDS')
    # Recalculate consistent normals per disconnected closed surface.
    bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.remove_doubles(threshold=.00001)
    bpy.ops.mesh.normals_make_consistent(inside=False);bpy.ops.object.mode_set(mode='OBJECT')
    assert len(o.data.polygons)>0, f'Empty component: {name}'
    objects.append(o)

# Calibrate primary packaging to Porsche's published 992 GT3 RS dimensions.
# Preserve circular tires and their nominal track, rather than stretching wheels.
wheelbase_scale=2.457/2.470
for o in objects:
    rolling=o.name.startswith(('wheel_','brake_','suspension_'))
    axle_x=1.16 if o.name.endswith(('FL','FR')) else -1.31
    for v in o.data.vertices:
        p=o.matrix_world@v.co
        p.x=p.x+axle_x*(wheelbase_scale-1) if rolling else p.x*wheelbase_scale
        v.co=o.matrix_world.inverted()@p
all_points=[o.matrix_world@v.co for o in objects for v in o.data.vertices]
min_x=min(p.x for p in all_points);max_x=max(p.x for p in all_points)
middle=(min_x+max_x)/2;desired_min=middle-4.572/2;desired_max=middle+4.572/2
body_names=('quarter_','door_F','front_bumper','rear_bumper')
body_half_width=max(abs((o.matrix_world@v.co).y) for o in objects if o.name.startswith(body_names) for v in o.data.vertices)
body_width_scale=.950/body_half_width
for o in objects:
    rolling=o.name.startswith(('wheel_','brake_','suspension_'))
    for v in o.data.vertices:
        p=o.matrix_world@v.co
        if not rolling:
            p.x+=(desired_max-max_x)*smooth((p.x-1.59)/(max_x-1.59))
            p.x+=(desired_min-min_x)*smooth((-1.74-p.x)/(-1.74-min_x))
            if not o.name.startswith('mirror_'):p.y*=body_width_scale
        v.co=o.matrix_world.inverted()@p
    bpy.context.view_layer.objects.active=o
    bpy.ops.object.select_all(action='DESELECT');o.select_set(True)
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY',center='BOUNDS')
all_points=[o.matrix_world@v.co for o in objects for v in o.data.vertices]
measured_dimensions=[max(p[i] for p in all_points)-min(p[i] for p in all_points) for i in range(3)]
print('GT3_REFERENCE_DIMENSIONS',json.dumps(measured_dimensions),flush=True)

scene=bpy.context.scene;scene.unit_settings.system='METRIC'
scene.render.engine='CYCLES';scene.cycles.samples=40 if DRAFT else 160;scene.cycles.use_denoising=True
scene.cycles.denoiser='OPENIMAGEDENOISE';scene.cycles.denoising_use_gpu=True
scene.render.use_persistent_data=True
try:
    prefs=bpy.context.preferences.addons['cycles'].preferences;prefs.compute_device_type='OPTIX';prefs.get_devices()
    for d in prefs.devices:d.use=d.type!='CPU'
    if any(d.use for d in prefs.devices):scene.cycles.device='GPU'
except Exception:pass
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=-.75
scene.render.resolution_x=1400 if DRAFT else 3000;scene.render.resolution_y=875 if DRAFT else 1875;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGB'
world=bpy.data.worlds.new('Graphite studio');world.use_nodes=True;scene.world=world
world.node_tree.nodes.get('Background').inputs['Color'].default_value=(*linear('B8BCC4'),1)
world.node_tree.nodes.get('Background').inputs['Strength'].default_value=.18
# Keep neutral studio illumination in reflections, but avoid a visible gray
# world/floor boundary in the wider exploded camera.
wn=world.node_tree.nodes;wl=world.node_tree.links
flat=wn.new('ShaderNodeBackground');flat.name='Camera backdrop';flat.inputs['Color'].default_value=(*linear('080A0C'),1)
flat.inputs['Strength'].default_value=.7
ray=wn.new('ShaderNodeLightPath');mix=wn.new('ShaderNodeMixShader')
wl.new(ray.outputs['Is Camera Ray'],mix.inputs[0]);wl.new(wn.get('Background').outputs[0],mix.inputs[1])
wl.new(flat.outputs[0],mix.inputs[2]);wl.new(mix.outputs[0],wn.get('World Output').inputs['Surface'])
floor_mat=material('studio floor','101216',.73)
bpy.ops.mesh.primitive_plane_add(size=140,location=(0,0,.012));floor=bpy.context.object;floor.name='STUDIO / floor'
floor.data.materials.clear();floor.data.materials.append(floor_mat)
# A real curved infinity cove removes the finite-floor/world horizon in wide views.
cove_verts=[]
for j in range(34):
    theta=min(j,32)/32*math.pi/2
    radius=35+22*math.sin(theta);z=.012+22*(1-math.cos(theta)) if j<=32 else 100
    for i in range(192):cove_verts.append((radius*math.cos(i*math.tau/192),radius*math.sin(i*math.tau/192),z))
cove_faces=[]
for j in range(33):
    for i in range(192):
        a=j*192+i;b=j*192+(i+1)%192;cove_faces.append((a,a+192,b+192,b))
data=bpy.data.meshes.new('Studio infinity cove');data.from_pydata(cove_verts,[],cove_faces);data.update()
cove=bpy.data.objects.new('STUDIO / cove',data);bpy.context.collection.objects.link(cove);data.materials.append(floor_mat)
for face in data.polygons:face.use_smooth=True
def area(name,pos,energy,size,size_y,target):
    d=bpy.data.lights.new(name,'AREA');d.energy=energy;d.shape='RECTANGLE';d.size=size;d.size_y=size_y
    o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=pos;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();return o
area('STUDIO / key',(1.0,-3.5,5.5),950,7,1.2,(0,0,.5))
area('STUDIO / edge',(-2.4,2.5,3.2),1350,5,1.0,(-.4,0,.8))
area('STUDIO / front strip',(4.8,.3,2.7),600,4,1.2,(.9,0,.6))
area('STUDIO / side card',(-1.5,-4.3,1.5),110,5,.8,(-.5,0,.65))
def camera(name,pos,target,lens):
    d=bpy.data.cameras.new(name);o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=pos
    o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();d.lens=lens
    d.clip_start=.03;d.clip_end=300;return o
hero=camera('CAMERA / hero',(6.8,-8.3,3.3),(0,0,.77),65)
rear_cam=camera('CAMERA / rear',(-6.8,-8.2,3.0),(-.1,0,.81),58)
side_cam=camera('CAMERA / side',(0,-9,1.05),(0,0,.80),58)
side_cam.data.type='ORTHO';side_cam.data.ortho_scale=5.65
scene.camera=hero
for frame,lens in [(1,43),(150,43),(210,60),(240,65),(270,65)]:
    hero.data.lens=lens;hero.data.keyframe_insert(data_path='lens',frame=frame)
for fc in hero.data.animation_data.action.fcurves:
    for key in fc.keyframe_points:key.interpolation='BEZIER';key.handle_left_type='AUTO_CLAMPED';key.handle_right_type='AUTO_CLAMPED'

def group_for(name):
    if name.startswith(('chassis','subframe','suspension','brake')):return 'structure'
    if name.startswith(('seat','dashboard','steering','roll_cage','center_console')):return 'interior'
    if name.startswith(('wheel','glass','headlight','taillight','mirror','wing','exhaust')):return 'identity'
    return 'body'
def explode(name):
    sign=1 if name.endswith('L') else -1
    if name=='chassis':return Vector((0,0,0))
    if name.startswith(('subframe','suspension','brake')):return Vector((0,sign*.12,-.17))
    if group_for(name)=='interior':return Vector((0,0,.50))
    if name.startswith('wing'):return Vector((-.32,0,.62))
    if name.startswith('wheel'):return Vector((0,sign*.68,0))
    if name.startswith(('door','quarter','side_skirt','rear_vent','fender_louver','arch_blade','mirror')):return Vector((0,sign*.55,.06))
    if name=='hood':return Vector((.20,0,.78))
    if name in ('trunk','rear_bumper','diffuser','exhaust'):return Vector((-.60,0,.08))
    if name in ('front_bumper','splitter'):return Vector((.60,0,.08))
    if name.startswith('glass') or name=='roof':return Vector((0,0,.72))
    if name.startswith('headlight'):return Vector((.26,sign*.18,.28))
    if name.startswith('taillight'):return Vector((-.33,sign*.18,.16))
    return Vector((0,0,.2))

homes={o.name:o.location.copy() for o in objects}
scene.render.fps=30;scene.frame_start=1;scene.frame_end=270
counts={};manifest=[]
for o in objects:
    stage=group_for(o.name);ordinal=counts.get(stage,0);counts[stage]=ordinal+1
    start={'structure':27,'interior':58,'body':91,'identity':145}[stage]+ordinal*1.1
    duration=42 if stage=='body' else 32;end=min(210,round(start+duration))
    offset=explode(o.name)
    for frame,location in [(1,homes[o.name]+offset),(round(start),homes[o.name]+offset),(end,homes[o.name]),(270,homes[o.name])]:
        o.location=location;o.keyframe_insert(data_path='location',frame=frame)
    # Auto-clamped handles prevent assembly overshoot.
    if o.animation_data and o.animation_data.action:
        for fc in o.animation_data.action.fcurves:
            for key in fc.keyframe_points:key.interpolation='BEZIER';key.handle_left_type='AUTO_CLAMPED';key.handle_right_type='AUTO_CLAMPED'
    o.data.calc_loop_triangles();manifest.append({'name':o.name,'stage':stage,'triangles':len(o.data.loop_triangles),'assembled':list(homes[o.name]),'explodedOffset':list(offset),'startFrame':round(start),'endFrame':end})
scene.frame_set(270)
bpy.ops.object.select_all(action='DESELECT')
for o in objects:o.select_set(True)
bpy.context.view_layer.objects.active=objects[0]
# Keep all studio helpers out of the exports. Export original material values;
# Cycles procedural weave remains in .blend; web gets its neutral base material.
source_meshes={o.name:o.data for o in objects}
web_meshes={o.name:web_source_mesh(o) for o in objects} if not PREVIEW else {}
stats={}
total=sum(p['triangles'] for p in manifest)
for lod,budget in ([] if PREVIEW else [('high',118000),('medium',58000),('low',28000)]):
    ratios=lod_ratios(web_meshes,lod,budget);tris=0
    for o in objects:
        o.data=web_meshes[o.name].copy();bpy.context.view_layer.objects.active=o
        ratio=ratios[o.name]
        if ratio<1:
            m=o.modifiers.new('web LOD','DECIMATE');m.ratio=ratio;bpy.ops.object.modifier_apply(modifier=m.name)
        # Clean decimation artifacts before measuring or handing data to glTF.
        o.data.validate();o.data.update()
        preserve_source_normals(o,web_meshes[o.name])
        o.data.calc_loop_triangles();tris+=len(o.data.loop_triangles)
    # The glTF exporter otherwise evaluates frame 0 even with animations disabled.
    scene.frame_set(270)
    export_web_glb(OUT/('gt3rs-study-'+lod+'-raw.glb'))
    stats[lod]={'triangles':tris}
for o in objects:o.data=source_meshes[o.name]
scene.camera=hero;scene.frame_set(270)
# Useful startup view for an artist opening the saved file.
for screen in bpy.data.screens:
    for a in screen.areas:
        if a.type=='VIEW_3D':a.spaces.active.region_3d.view_perspective='CAMERA'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gt3rs-study.blend'),compress=True)
(OUT/'model-manifest.json').write_text(json.dumps({'description':'Original reference-led Porsche 992 GT3 RS visualization; not factory CAD or a verified exact replica.','sourceTriangles':total,'parts':manifest,'lods':stats,'animation':{'fps':30,'frames':270,'assembledFrame':210},'coordinates':'Blender X nose, Y left, Z up','reference':{'source':'https://newsroom.porsche.com/dam/jcr%3A1d390f77-93c3-49c0-89c7-634f5f02b26a/S22_3515_en.pdf','lengthMeters':4.572,'bodyWidthMeters':1.900,'wheelbaseMeters':2.457,'frontTrackMeters':1.630,'rearTrackMeters':1.582,'frontTire':'275/35 ZR20','rearTire':'335/30 ZR21','measuredOverallXYZ':measured_dimensions,'limitation':'Primary packaging is calibrated. Individual surfaces, trim and hidden mechanics are reference-modeled, not measured OEM CAD.'}},indent=2))
for name,cam,frame in [('hero',hero,270),('rear',rear_cam,270),('side',side_cam,270),('exploded',hero,1)]:
    if VIEWS and name not in VIEWS:continue
    scene.camera=cam;scene.frame_set(frame)
    # An orthographic inspection view needs a clean background; its bottom
    # primary rays begin below the floor and would reveal a hard floor cutoff.
    floor.hide_render=name=='side'
    cove.hide_render=name=='side'
    if name=='exploded':cam.data.lens=43
    scene.render.filepath=str(OUT/(name+'.png'));bpy.ops.render.render(write_still=True)
    print('GT3_RENDER_DONE',name,flush=True)
    if name=='exploded':cam.data.lens=65
scene.camera=hero;scene.frame_set(270)
floor.hide_render=False
cove.hide_render=False
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gt3rs-study.blend'),compress=True)
print('GT3_STUDY_COMPLETE',json.dumps({'parts':len(objects),'sourceTriangles':total,'lods':stats}),flush=True)
