"""Original GT3 RS-inspired modeling study. No imported meshes or photo textures.

Blender 4.5: --background --python build_gt3rs_study.py [-- --draft | --preview]
--preview writes only to ignored verification output; production source is untouched.
X = nose, Y = vehicle left, Z = up. Dimensions are artistic estimates, not CAD.
"""
import bpy, math, json, sys
from pathlib import Path
from mathutils import Vector

PIPE = Path(__file__).resolve().parent
ROOT = PIPE.parents[4]
PREVIEW = '--preview' in sys.argv
OUT = PIPE/'verification/gt3rs-refinement' if PREVIEW else ROOT/'assets/3d/source/gt3rs-study'
OUT.mkdir(parents=True, exist_ok=True)
DRAFT = '--draft' in sys.argv or PREVIEW
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for block in list(bpy.data.materials): bpy.data.materials.remove(block)
PARTS = {}
CUTS = {}

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

paint=material('paint','A7AAAD',.265,.44,.65)
carbon=material('carbon','141619',.34,0,.22)
carbon.node_tree.nodes.get('Principled BSDF').inputs['Specular IOR Level'].default_value=.25
rubber=material('rubber','161719',.88)
alloy=material('aluminum','303238',.26,.72,.22)
bright=material('polished alloy','C2C5C9',.22,.93)
black=material('intake shadow','08090B',.84)
interior=material('interior','222326',.87)
glass=material('glass','C8D4D5',.035,0,0)
glass.node_tree.nodes.get('Principled BSDF').inputs['Transmission Weight'].default_value=1
glass.node_tree.nodes.get('Principled BSDF').inputs['IOR'].default_value=1.46
lamp=material('lamp reflector','B8BCC4',.15,.95)
led=material('light','F4F4F2',.2,.2)
p=led.node_tree.nodes.get('Principled BSDF');p.inputs['Emission Color'].default_value=(*linear('F4F4F2'),1);p.inputs['Emission Strength'].default_value=1.4
red=material('rear lamp','66272A',.24,.2,.8)
red.node_tree.nodes.get('Principled BSDF').inputs['Emission Color'].default_value=(*linear('BD3937'),1)
red.node_tree.nodes.get('Principled BSDF').inputs['Emission Strength'].default_value=1.8
clear_lens=material('headlamp lens','C0C8CC',.025,0,.2)
clear_lens.node_tree.nodes.get('Principled BSDF').inputs['Transmission Weight'].default_value=1
clear_lens.node_tree.nodes.get('Principled BSDF').inputs['IOR'].default_value=1.46
caliper=material('caliper','A99860',.36,.50)
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
    bpy.ops.object.modifier_apply(modifier=mod.name)
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

def interp(x,keys):
    for i in range(len(keys)-1):
        a,va=keys[i];b,vb=keys[i+1]
        if x<=b:
            t=max(0,(x-a)/(b-a));prev=keys[max(0,i-1)];nxt=keys[min(len(keys)-1,i+2)]
            m0=(vb-prev[1])/(b-prev[0]);m1=(nxt[1]-va)/(nxt[0]-a)
            return (2*t**3-3*t*t+1)*va+(t**3-2*t*t+t)*(b-a)*m0+(-2*t**3+3*t*t)*vb+(t**3-t*t)*(b-a)*m1
    return keys[-1][1]

def smooth(t):return max(0,min(1,t))**2*(3-2*max(0,min(1,t)))
def width(x):return interp(x,[(-2.24,.90),(-1.72,1.025),(-1.30,1.015),(-.72,.92),(0,.887),(.59,.923),(1.24,.965),(1.75,.937),(2.31,.91)])
def centerz(x):return interp(x,[(-2.24,.775),(-1.75,.89),(-1.35,.88),(-.65,.81),(.52,.835),(1.12,.807),(1.72,.727),(2.31,.605)])
def shoulder(x):return interp(x,[(-2.24,.76),(-1.72,.902),(-1.30,.922),(-.72,.84),(0,.832),(.59,.86),(1.24,.880),(1.75,.785),(2.31,.635)])
def crown(x):return interp(x,[(-2.24,.79),(-1.7,.970),(-1.3,.978),(-.7,.875),(0,.862),(.6,.89),(1.23,.930),(1.70,.840),(2.31,.651)])
def wrapx(x,q):return x-(.13+.23*q*q)*smooth((x-1.85)/.46)+.13*q*q*smooth((-x-1.9)/.34)
def hood_edge(x):return .667-.070*smooth((x-.70)/1.50) if x>.56 else .667
def upper(x,q):
    q=max(0,min(1,q))
    # C1 crown, then a rolled shoulder with near-vertical tangent at the flank.
    if q<=.5:z=centerz(x)+.008*(q/.5)**2
    elif q<=.82:z=centerz(x)+.008+(crown(x)-centerz(x)-.008)*smooth((q-.5)/.32)
    else:z=shoulder(x)+(crown(x)-shoulder(x))*math.sqrt(max(0,1-((q-.82)/.18)**2))
    xp,yp=wrapx(x,q),q*width(x)*.988
    d=math.sqrt(((xp-1.805)/.240)**2+((yp-.735)/.172)**2)
    flatten=.72*smooth((1.6-d)/.60)
    lens_plane=.783-.66*(xp-1.805)-.10*(yp-.735)
    z=z*(1-flatten)+lens_plane*flatten
    return (xp,yp,z)
def arch(x):
    z=.18
    for cx,r,cz in [(-1.31,.402,.364),(1.16,.389,.352)]:
        d=abs(x-cx)
        if d<r:z=max(z,cz+math.sqrt(r*r-d*d))
    return z
def sidepoint(x,t,sign):
    bottom=arch(x);top=upper(x,1)[2];z=bottom+(top-bottom)*t
    y=width(x)*.988+.012*math.sin(math.pi*t)-.065*(1-t)**4
    waist=smooth((x+1.10)/.35)*(1-smooth((x-.40)/.30))
    y-=.022*math.exp(-((z-.43)/.17)**2)*waist*math.sin(math.pi*t)**2
    v=max(0,min(1,(z-.145)/(upper(2.31,1)[2]-.145)))
    xw=wrapx(x,1)+(.15*math.sin(math.pi*v)+.06*(1-v))*smooth((x-1.85)/.46)
    rv=max(0,min(1,(z-.18)/(upper(-2.24,1)[2]-.18)))
    xw+=(.16*(1-rv)**2-.06*math.sin(math.pi*rv))*smooth((-x-1.9)/.34)
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
    # Rocker has a raised outer winglet at the front wheel's trailing edge.
    patch('side_skirt_'+side,lambda u,v,s=sign:(-.85+1.55*u,s*(.89+.035*math.sin(v*math.pi)),.13+.085*v),35,6,carbon,.014)
    # Body-color recessed handle and the small horizontal shadow below its pull.
    box('door_F'+side,(-.40,sign*.929,.733),(.205,.009,.046),black,.020)
    box('door_F'+side,(-.40,sign*.938,.742),(.181,.020,.027),paint,.012)
    # Rear brake-cooling opening: an inlaid taper, shaped along the quarter.
    def vent(u,v,s=sign):
        x=-.86-.065*v+.17*(u-.5)*math.sin(math.pi*v)**.55
        z=.55+.285*v;t=(z-arch(x))/(upper(x,1)[2]-arch(x));p=sidepoint(x,t,s)
        return (p[0],p[1],z)
    patch('rear_vent_'+side,lambda u,v,s=sign:(lambda p:(p[0],p[1]-s*.062,p[2]))(vent(u,v,s)),18,32,black,.003)
    contour=[vent(0,.02+.96*i/40) for i in range(41)]+[vent(1,.98-.96*i/40) for i in range(41)]
    CUTS['quarter_R'+side]=[([(p[0],p[2]) for p in contour],'Y',sign*.92-.20,sign*.92+.20)]
    tube('rear_vent_'+side,contour,.003,paint,True)
    mesh('rear_vent_'+side,contour+[(p[0],p[1]-sign*.060,p[2]) for p in contour],[(i,(i+1)%len(contour),(i+1)%len(contour)+len(contour),i+len(contour)) for i in range(len(contour))],carbon)
    # Arch louvers follow the front fender crown.
    patch('fender_louver_'+side,lambda u,v,s=sign:(lambda p:(p[0],s*p[1],p[2]-.036))(upper(.97+.43*u,.775+.17*v)),24,14,black,.002)
    corners=[upper(x,q) for x,q in [(.98,.78),(1.39,.78),(1.39,.94),(.98,.94)]]
    CUTS['quarter_F'+side]=[([(p[0],p[1]*sign) for p in corners],'Z',.70,1.10)]
    for k in range(3):
        x=1.01+k*.13
        patch('fender_louver_'+side,lambda u,v,x=x,s=sign:(lambda p:(p[0],s*p[1],p[2]-.016+.019*u))(upper(x+.07*u,.778+.165*v)),6,18,carbon,.0025)
    # Vertical outer aero blade, behind the front wheel.
    points=[(.71,sign*.970,.16),(.66,sign*.977,.64),(.605,sign*.975,.66),(.57,sign*.963,.16)]
    mesh('arch_blade_'+side,points,[(0,1,2,3)],carbon,.008)

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
RZ=[(-1.47,.875),(-1.18,1.085),(-.85,1.245),(-.48,1.322),(-.13,1.305),(.08,1.233),(.38,1.02),(.57,.848)]
RW=[(-1.47,.775),(-1.18,.695),(-.85,.662),(-.48,.655),(-.13,.653),(.08,.673),(.38,.744),(.57,.803)]
def canopy(x,q):return (x,q*interp(x,RW),interp(x,RZ)-.058*q*q)
patch('roof',lambda u,v:canopy(-.87+.948*u,v*2-1),44,44,paint,.008)
patch('glass_windshield',lambda u,v:canopy(.087+.479*u,(v*2-1)*.975),30,40,glass,.003)
patch('glass_rear',lambda u,v:canopy(-1.455+.576*u,(v*2-1)*.954),32,36,glass,.003)
# Ceramic frit/seals give the glazing an actual manufactured edge.
for name,a,b,qmax in [('glass_windshield',.087,.566,.975),('glass_rear',-1.455,-.879,.954)]:
    border=[canopy(a+(b-a)*i/60,-qmax) for i in range(61)]+[canopy(b,-qmax+2*qmax*i/60) for i in range(1,61)]+[canopy(b-(b-a)*i/60,qmax) for i in range(1,61)]+[canopy(a,qmax-2*qmax*i/60) for i in range(1,60)]
    tube(name,[(p[0],p[1],p[2]+.0015) for p in border],.0075,black,True)
for sign in [-1,1]:
    tube('glass_windshield',[(lambda p:(p[0],p[1],p[2]+.009))(canopy(.529-.027*math.sin(i*math.pi/32),sign*(.03+.66*i/32))) for i in range(33)],.005,black)
    # Two restrained roof guides; no decorative fins or extra animated names.
    patch('roof',lambda u,v,s=sign:(lambda p:(p[0],p[1],p[2]+.023*math.sin(math.pi*u)*v))(canopy(-.73+.53*u,s*.67)),30,2,carbon,.003)
for sign,side in [(1,'L'),(-1,'R')]:
    def window(x,t,s=sign):
        bottom=.827+.013*math.cos(x*2);top=interp(x,RZ)-.06
        return (x,s*((width(x)*.84)*(1-t)+interp(x,RW)*t),bottom+(top-bottom)*t)
    patch('glass_'+side,lambda u,v:window(-1.275+1.77*u,v),70,14,glass,.003)
    # B-pillar separates rear quarter glass from the actual front door glass.
    patch('roof',lambda u,v,s=sign:(lambda p:(p[0],p[1]+s*.004,p[2]))(window(-.774+.044*u,v,s)),4,14,black,.006)
    # Broad rear pillar and slender front pillar join the roof to the shoulders.
    for a,b in [(-1.47,-1.28),(.50,.57)]:
        patch('roof',lambda u,v,a=a,b=b:window(a+(b-a)*u,v),18,14,paint,.008)
    tube('roof',[(x,sign*interp(x,RW),interp(x,RZ)-.06) for x in [-1.29+i*1.85/100 for i in range(101)]],.010,paint)
    tube('roof',[(x,sign*(width(x)*.84),.827+.013*math.cos(x*2)) for x in [-1.28+i*1.84/100 for i in range(101)]],.009,carbon)
    # Sills below the greenhouse fill the inboard shoulder gap.
    patch('roof',lambda u,v,s=sign:(lambda x:(x,s*((width(x)*.667)*(1-v)+(width(x)*.84)*v),upper(x,.667)[2]*(1-v)+(.827+.013*math.cos(x*2))*v))(-1.357+1.925*u),60,10,paint,.005)
    cylinder('mirror_'+side,(.36,sign*.815,.885),(.33,sign*1.015,.925),.024,carbon,20)
    # Streamlined mirror shell, rounded rather than cuboid.
    patch('mirror_'+side,lambda u,v,s=sign:(.30+.145*math.cos(u*math.tau)*math.sin(v*math.pi),s*(1.022+.065*math.sin(u*math.tau)*math.sin(v*math.pi)),.951+.051*math.cos(v*math.pi)),40,20,paint)
    box('mirror_'+side,(.177,sign*1.022,.95),(.008,.107,.058),lamp,.016)

# Ovoid headlamps lie on the sloping fender, with actual inset reflectors and DRL.
for sign,side in [(1,'L'),(-1,'R')]:
    cx,cy=1.815,sign*.735
    def lenspos(a,r=1,raisez=0):
        x=cx+.245*math.cos(a)*r;y=cy+sign*.157*math.sin(a)*r
        p=upper(x,abs(y)/(width(x)*.988));return (p[0],y,p[2]+.006+raisez)
    patch('headlight_'+side,lambda u,v:lenspos(u*math.tau,v),96,16,black,.006)
    tube('headlight_'+side,[lenspos(i*math.tau/120,1) for i in range(120)],.0045,carbon,True)
    tube('headlight_'+side,[lenspos(i*math.tau/120,.86,.002) for i in range(120)],.0035,led,True)
    for dx in [-.087,.078]:
        x=cx+dx;p=Vector(lenspos(0,0));p.x=wrapx(x,abs(cy)/(width(x)*.988));p.z=upper(x,abs(cy)/(width(x)*.988))[2]+.013
        normal=Vector((.58,sign*.18,.79)).normalized();a=Vector((0,1,0));b=normal.cross(a).normalized()
        ellipse('headlight_'+side,p,a,b,.046,.047,.005,lamp)
        cylinder('headlight_'+side,p-normal*.007,p+normal*.004,.037,glass,40)
    for k in [-1,1]:
        for d in [-1,1]:
            x=cx+k*.118;y=cy+sign*d*.075;pt=upper(x,abs(y)/(width(x)*.988))
            box('headlight_'+side,(pt[0],y,pt[2]+.011),(.020,.025,.004),led,.002)
    patch('headlight_'+side,lambda u,v:lenspos(u*math.tau,v,.008+.017*(1-v*v)),96,20,clear_lens,.002)

# Continuous curved fascias, with openings cut directly out of their grid.
def front(u,v):
    q=u*2-1;y=q*.91*.988;top=upper(2.31,abs(q))[2];z=.145+(top-.145)*v
    x=2.18-.23*q*q+.15*math.sin(v*math.pi)+.06*(1-v)
    t=max(0,min(1,(z-.18)/(upper(2.31,1)[2]-.18)))
    y=q*(.91*.988+.012*math.sin(math.pi*t)-.065*(1-t)**4)
    return (x,y,z)
def hole(u,v):
    y=abs((u*2-1)*.91);z=.145+.49*v
    middle=y<.64 and .205<z<.465 and ((y/.64)**8+((z-.335)/.135)**8)<1
    side=.713<y<.858 and .236<z<.396
    return middle or side
fascia=patch('front_bumper',front,100,38,paint,.012)
def aperture(y,z,ry,rz):
    return [(y+ry*math.copysign(abs(math.cos(t*math.tau/96))**.33,math.cos(t*math.tau/96)),z+rz*math.copysign(abs(math.sin(t*math.tau/96))**.5,math.sin(t*math.tau/96))) for t in range(96)]
cut_prism(fascia,aperture(0,.330,.644,.129),'X',1.85,2.60)
for sign in [-1,1]:cut_prism(fascia,aperture(sign*.787,.323,.071,.084),'X',1.82,2.60)
patch('front_bumper',lambda u,v:(2.265-.18*((u*2-1)*.70/.91)**2,(u*2-1)*.70,.20+.28*v),62,16,black)
for k in range(81):
    y=-.61+k*1.22/80
    cylinder('front_bumper',(2.275-.18*(y/.91)**2,y,.223),(2.275-.18*(y/.91)**2,y,.435),.0012,carbon,6)
for z in [.23+i*.018 for i in range(12)]:
    tube('front_bumper',[(2.282-.18*(y/.91)**2,y,z) for y in [-.62+i*1.24/40 for i in range(41)]],.0012,carbon)
for sign in [-1,1]:
    patch('front_bumper',lambda u,v,s=sign:(2.302-.23*((.64+.19*u)/.91)**2,s*(.64+.19*u),.36+.072*v),14,5,black,.004)
    patch('front_bumper',lambda u,v,s=sign:(2.252-.23*((.70+.17*u)/.91)**2,s*(.70+.17*u),.23+.19*v),14,8,black)
    tube('front_bumper',[(2.32-.23*(y/.91)**2,y,.43) for y in [sign*(.66+i*.17/12) for i in range(13)]],.004,led)
patch('splitter',lambda u,v:(2.19+.19*v-.25*(u*2-1)**2,(u*2-1)*.947,.13+.018*math.sin(v*math.pi)),80,6,carbon,.018)
for sign,side in [(1,'L'),(-1,'R')]:
    mesh('splitter',[(2.17,sign*.95,.145),(2.19,sign*.946,.20),(2.05,sign*.942,.38),(2.00,sign*.940,.385)],[(0,1,2,3)],carbon,.005)

def rear(u,v):
    q=u*2-1;y=q*.90*.988;top=upper(-2.24,abs(q))[2]
    z=.18+(top-.18)*v;t=max(0,min(1,(z-.18)/(upper(-2.24,1)[2]-.18)))
    y=q*(.90*.988+.012*math.sin(math.pi*t)-.065*(1-t)**4)
    return (-2.24+.13*q*q+.16*(1-v)**2-.06*math.sin(v*math.pi),y,z)
patch('rear_bumper',rear,80,30,paint,.010)
# Body-to-fascia seams must agree geometrically after headlamp surface shaping.
seam_error=0
for endpoint,fn,bottom in [(2.31,front,.145),(-2.24,rear,.18)]:
    top=upper(endpoint,1)[2]
    for i in range(101):
        p=Vector(sidepoint(endpoint,i/100,1));q=Vector(fn(1,(p.z-bottom)/(top-bottom)))
        seam_error=max(seam_error,(p-q).length)
assert seam_error<.00001, f'Open fascia seam: {seam_error}m'
patch('rear_bumper',lambda u,v:(lambda p:(p[0]-.009,p[1],p[2]))(rear(.045+.91*u,.05+.34*v)),64,12,black,.005)
patch('rear_bumper',lambda u,v:(lambda p:(p[0]-.007,p[1],p[2]))(rear(.33+.34*u,.53+.16*v)),24,8,carbon,.004)
patch('diffuser',lambda u,v:(-2.28+.15*(u*2-1)**2+.22*v,(u*2-1)*.895,.13+.14*v),64,10,carbon,.012)
for y in [-.70,-.45,-.16,.16,.45,.70]:
    mesh('diffuser',[(-2.28,y,.105),(-1.96,y,.14),(-1.96,y,.25),(-2.28,y,.185)],[(0,1,2,3)],carbon,.006)
for sign,side in [(1,'L'),(-1,'R')]:
    pts=[]
    for y in [sign*(.015+i*.82/60) for i in range(61)]:
        u=(y/(.90*.988)+1)/2;top=upper(-2.24,abs(u*2-1))[2]
        p=rear(u,(.715-.18)/(top-.18));pts.append((p[0]-.012,y,.715))
    tube('taillight_'+side,pts,.019,black)
    tube('taillight_'+side,[(p[0]-.022,p[1],p[2]+.001) for p in pts],.007,red)
    cylinder('exhaust',( -2.18,sign*.112,.235),(-2.30,sign*.112,.235),.052,bright,64)
    cylinder('exhaust',( -2.301,sign*.112,.235),(-2.304,sign*.112,.235),.045,black,64)
    ellipse('exhaust',(-2.305,sign*.112,.235),(0,1,0),(0,0,1),.050,.050,.0025,bright)
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
airfoil('wing_main',-2.28,.40,1.392,1.005)
airfoil('wing_flap',-2.385,.14,1.440,1.005)
for sign,side in [(1,'L'),(-1,'R')]:
    profile=[(-2.38,1.356),(-2.405,1.484),(-2.32,1.519),(-1.91,1.472),(-1.85,1.399),(-2.01,1.361)]
    mesh('wing_endplate_'+side,[(x,sign*1.014,z) for x,z in profile],[tuple(range(len(profile)))],carbon,.008)
for sign in [-1,1]:
    # Smooth, thin swan-neck ribbons support the upper surface of the airfoil.
    xkeys=[(0,-1.72),(.35,-1.80),(.64,-1.92),(.84,-2.14),(1,-2.22)]
    zkeys=[(0,.935),(.35,1.24),(.64,1.464),(.84,1.463),(1,1.435)]
    verts=[]
    for i in range(49):
        t=i/48;x=interp(t,xkeys);z=interp(t,zkeys)
        dx=interp(min(1,t+.002),xkeys)-interp(max(0,t-.002),xkeys)
        dz=interp(min(1,t+.002),zkeys)-interp(max(0,t-.002),zkeys)
        length=math.hypot(dx,dz);nx,nz=-dz/length,dx/length
        half=.033-.005*t
        for edge,depth in [(-1,-.010),(1,-.010),(1,.010),(-1,.010)]:
            verts.append((x+nx*half*edge,sign*.51+depth,z+nz*half*edge))
    faces=[(0,3,2,1),(192,193,194,195)]
    for i in range(48):
        for j in range(4):faces.append((i*4+j,i*4+(j+1)%4,(i+1)*4+(j+1)%4,(i+1)*4+j))
    support=mesh('wing_supports',verts,faces,carbon)
    for face in support.data.polygons:face.use_smooth=False
    box('wing_supports',(-1.72,sign*.51,.940),(.14,.082,.021),carbon,.01)
    for x in [-2.15,-2.08]:
        cylinder('wing_supports',(x,sign*.51,1.454),(x,sign*.51,1.47),.007,bright,12)

# Rolling assemblies: profiled tire carcass, forged Y-spokes, center lock, rotor.
for cx,axle,rad,ww,wy in [(-1.31,'R',.362,.30,.864),(1.16,'F',.350,.268,.841)]:
    cz=rad+.015
    for sign,side in [(1,'L'),(-1,'R')]:
        suffix=axle+side;name='wheel_'+suffix;cy=sign*wy
        profile=[(-ww*.5,.265),(-ww*.505,rad-.047),(-ww*.46,rad-.018),(-ww*.32,rad-.002),(-ww*.20,rad),(.20*ww,rad),(.32*ww,rad-.002),(.46*ww,rad-.018),(.505*ww,rad-.047),(.5*ww,.265)]
        def tire(u,v):
            index=v*(len(profile)-1);i=min(int(index),len(profile)-2);t=index-i
            y=profile[i][0]*(1-t)+profile[i+1][0]*t;r=profile[i][1]*(1-t)+profile[i+1][1]*t
            return (cx+math.sin(u*math.tau)*r,cy+y,cz+math.cos(u*math.tau)*r)
        patch(name,tire,144,27,rubber)
        for dy in [-.073,-.025,.025,.073]:
            tube(name,[(cx+math.sin(a*math.tau/144)*(rad+.0004),cy+dy,cz+math.cos(a*math.tau/144)*(rad+.0004)) for a in range(144)],.0018,black,True)
        facey=cy+sign*(ww*.505+.002)
        # Shallow barrel; machined outer lip and smaller inner bead.
        patch(name,lambda u,v:(cx+math.sin(u*math.tau)*(.265+.010*math.sin(v*math.pi)),facey-sign*.20*v,cz+math.cos(u*math.tau)*(.265+.010*math.sin(v*math.pi))),120,7,alloy)
        ellipse(name,(cx,facey,cz),(1,0,0),(0,0,1),.269,.269,.006,bright)
        ellipse(name,(cx,facey-sign*.013,cz),(1,0,0),(0,0,1),.253,.253,.004,alloy)
        cylinder(name,(cx,facey-sign*.07,cz),(cx,facey+.002*sign,cz),.066,alloy,48)
        cylinder(name,(cx,facey+.003*sign,cz),(cx,facey+.012*sign,cz),.036,bright,12)
        cylinder(name,(cx,facey+.013*sign,cz),(cx,facey+.014*sign,cz),.024,carbon,32)
        for k in range(10):
            angle=k*math.tau/10
            for branch in [-1,1]:
                verts=[]
                for j in range(6):
                    t=j/5;r=.052+.21*t;a=angle+branch*.105*smooth((t-.20)/.8)+.065*t
                    half=.014*(1-.43*t);depth=.010
                    y=facey-sign*(.045*math.sin(t*math.pi))
                    for off,dep in [(-half,-depth),(half,-depth),(half,depth),(-half,depth)]:
                        verts.append((cx+math.sin(a)*r+math.cos(a)*off,y+dep,cz+math.cos(a)*r-math.sin(a)*off))
                faces=[(0,3,2,1),(20,21,22,23)]
                for j in range(5):
                    for l in range(4):faces.append((j*4+l,j*4+(l+1)%4,(j+1)*4+(l+1)%4,(j+1)*4+l))
                mesh(name,verts,faces,alloy)
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
for y,name in [(-.39,'seat_driver'),(.39,'seat_passenger')]:
    box(name,(-.18,y,.44),(.57,.43,.115),interior,.05)
    o=box(name,(-.45,y,.735),(.12,.43,.59),carbon,.055);o.rotation_euler.y=-.15
    o=box(name,(-.385,y,.73),(.045,.31,.44),interior,.018);o.rotation_euler.y=-.15
    box(name,(-.51,y,1.065),(.12,.25,.17),interior,.035)
    for dy in [-.19,.19]:box(name,(-.22,y+dy,.53),(.42,.065,.14),interior,.025)
box('dashboard',(.46,0,.795),(.24,1.38,.13),interior,.06)
box('center_console',(.06,0,.51),(.71,.19,.22),carbon,.04)
ellipse('steering_wheel',(.20,-.39,.825),(0,1,0),(-.4,0,.916),.14,.14,.017,interior)
cylinder('steering_wheel',(.20,-.39,.825),(.26,-.39,.80),.046,carbon)
for y in [-.57,.57]:
    tube('roll_cage',[(-.79,y,.27),(-.79,y,1.09),(-.71,y*.75,1.18)],.019,alloy)
tube('roll_cage',[(-.71,-.43,1.18),(-.71,.43,1.18)],.019,alloy)
tube('roll_cage',[(-.80,-.57,.33),(-.75,.54,1.09)],.016,alloy)
tube('roll_cage',[(-.80,.57,.33),(-.75,-.54,1.09)],.016,alloy)

# Join only within semantic parts and recenter pivots for the reconstruction.
objects=[]
for name,components in PARTS.items():
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
    if name.startswith(('quarter_','door_F')):
        mod=o.modifiers.new('continuous panel thickness','SOLIDIFY');mod.thickness=.004
        bpy.ops.object.modifier_apply(modifier=mod.name)
    for outline,axis,lo,hi in CUTS.get(name,[]):cut_prism(o,outline,axis,lo,hi)
    objects.append(o)

scene=bpy.context.scene;scene.unit_settings.system='METRIC'
scene.render.engine='CYCLES';scene.cycles.samples=40 if DRAFT else 160;scene.cycles.use_denoising=True
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
floor_mat=material('studio floor','1A1C20',.73)
bpy.ops.mesh.primitive_plane_add(size=140,location=(0,0,.012));floor=bpy.context.object;floor.name='STUDIO / floor';floor.data.materials.append(floor_mat)
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
area('STUDIO / key',(1.0,-3.5,5.5),1300,7,3.0,(0,0,.5))
area('STUDIO / edge',(-2.4,2.5,3.2),1350,5,1.0,(-.4,0,.8))
area('STUDIO / front strip',(4.8,.3,2.7),600,4,1.2,(.9,0,.6))
area('STUDIO / side card',(-1.5,-4.3,1.5),260,5,1.7,(-.5,0,.65))
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
stats={}
total=sum(p['triangles'] for p in manifest)
for lod,budget in ([] if PREVIEW else [('high',118000),('medium',58000),('low',28000)]):
    ratio=min(1,budget/max(1,total));tris=0
    for o in objects:
        o.data=source_meshes[o.name].copy();bpy.context.view_layer.objects.active=o
        if ratio<1:
            m=o.modifiers.new('web LOD','DECIMATE');m.ratio=ratio;bpy.ops.object.modifier_apply(modifier=m.name)
        # Clean decimation artifacts before measuring or handing data to glTF.
        o.data.validate();o.data.update()
        o.data.calc_loop_triangles();tris+=len(o.data.loop_triangles)
    # The glTF exporter otherwise evaluates frame 0 even with animations disabled.
    scene.frame_set(270)
    bpy.ops.export_scene.gltf(filepath=str(OUT/('gt3rs-study-'+lod+'-raw.glb')),export_format='GLB',use_selection=True,export_apply=True,export_animations=False,export_current_frame=True,export_cameras=False,export_lights=False)
    stats[lod]={'triangles':tris}
for o in objects:o.data=source_meshes[o.name]
scene.camera=hero;scene.frame_set(270)
# Useful startup view for an artist opening the saved file.
for screen in bpy.data.screens:
    for a in screen.areas:
        if a.type=='VIEW_3D':a.spaces.active.region_3d.view_perspective='CAMERA'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gt3rs-study.blend'),compress=True)
(OUT/'model-manifest.json').write_text(json.dumps({'description':'Original GT3 RS-inspired artistic study. Not factory CAD or an exact replica.','sourceTriangles':total,'parts':manifest,'lods':stats,'animation':{'fps':30,'frames':270,'assembledFrame':210},'coordinates':'Blender X nose, Y left, Z up'},indent=2))
for name,cam,frame in [('hero',hero,270),('rear',rear_cam,270),('side',side_cam,270),('exploded',hero,1)]:
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
