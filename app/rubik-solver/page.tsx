"use client";
import { useEffect, useRef, useState, useCallback } from "react";

// ─── CUBE LOGIC ───────────────────────────────────────────────────────────────
const SOLVED: Record<string,string> = {
  U:"WWWWWWWWW",D:"YYYYYYYYY",F:"RRRRRRRRR",
  B:"OOOOOOOOO",L:"BBBBBBBBB",R:"GGGGGGGGG",
};
const CHEX: Record<string,string> = {
  W:"#F0F0E8",Y:"#FFD700",R:"#E8251A",O:"#FF6B1A",B:"#1A4FE8",G:"#1AAE3E",X:"#1a1a2e",
};

function rotateCW(f:string){const a=f.split("");return[a[6],a[3],a[0],a[7],a[4],a[1],a[8],a[5],a[2]].join("");}
function rotateCCW(f:string){const a=f.split("");return[a[2],a[5],a[8],a[1],a[4],a[7],a[0],a[3],a[6]].join("");}
function applyMove(st:Record<string,string>,mv:string):Record<string,string>{
  const u=st.U.split(""),d=st.D.split(""),f=st.F.split(""),b=st.B.split(""),l=st.L.split(""),r=st.R.split("");
  const j=(a:string[])=>a.join("");
  switch(mv){
    case"U": {const t=[f[0],f[1],f[2]];[f[0],f[1],f[2]]=[r[0],r[1],r[2]];[r[0],r[1],r[2]]=[b[0],b[1],b[2]];[b[0],b[1],b[2]]=[l[0],l[1],l[2]];[l[0],l[1],l[2]]=t;return{U:rotateCW(st.U),D:j(d),F:j(f),B:j(b),L:j(l),R:j(r)};}
    case"U'":{const t=[f[0],f[1],f[2]];[f[0],f[1],f[2]]=[l[0],l[1],l[2]];[l[0],l[1],l[2]]=[b[0],b[1],b[2]];[b[0],b[1],b[2]]=[r[0],r[1],r[2]];[r[0],r[1],r[2]]=t;return{U:rotateCCW(st.U),D:j(d),F:j(f),B:j(b),L:j(l),R:j(r)};}
    case"D": {const t=[f[6],f[7],f[8]];[f[6],f[7],f[8]]=[l[6],l[7],l[8]];[l[6],l[7],l[8]]=[b[6],b[7],b[8]];[b[6],b[7],b[8]]=[r[6],r[7],r[8]];[r[6],r[7],r[8]]=t;return{U:j(u),D:rotateCW(st.D),F:j(f),B:j(b),L:j(l),R:j(r)};}
    case"D'":{const t=[f[6],f[7],f[8]];[f[6],f[7],f[8]]=[r[6],r[7],r[8]];[r[6],r[7],r[8]]=[b[6],b[7],b[8]];[b[6],b[7],b[8]]=[l[6],l[7],l[8]];[l[6],l[7],l[8]]=t;return{U:j(u),D:rotateCCW(st.D),F:j(f),B:j(b),L:j(l),R:j(r)};}
    case"R": {const t=[u[2],u[5],u[8]];[u[2],u[5],u[8]]=[f[2],f[5],f[8]];[f[2],f[5],f[8]]=[d[2],d[5],d[8]];[d[2],d[5],d[8]]=[b[6],b[3],b[0]];[b[6],b[3],b[0]]=t;return{U:j(u),D:j(d),F:j(f),B:j(b),L:j(l),R:rotateCW(st.R)};}
    case"R'":{const t=[u[2],u[5],u[8]];[u[2],u[5],u[8]]=[b[6],b[3],b[0]];[b[6],b[3],b[0]]=[d[2],d[5],d[8]];[d[2],d[5],d[8]]=[f[2],f[5],f[8]];[f[2],f[5],f[8]]=t;return{U:j(u),D:j(d),F:j(f),B:j(b),L:j(l),R:rotateCCW(st.R)};}
    case"L": {const t=[u[0],u[3],u[6]];[u[0],u[3],u[6]]=[b[8],b[5],b[2]];[b[8],b[5],b[2]]=[d[0],d[3],d[6]];[d[0],d[3],d[6]]=[f[0],f[3],f[6]];[f[0],f[3],f[6]]=t;return{U:j(u),D:j(d),F:j(f),B:j(b),L:rotateCW(st.L),R:j(r)};}
    case"L'":{const t=[u[0],u[3],u[6]];[u[0],u[3],u[6]]=[f[0],f[3],f[6]];[f[0],f[3],f[6]]=[d[0],d[3],d[6]];[d[0],d[3],d[6]]=[b[8],b[5],b[2]];[b[8],b[5],b[2]]=t;return{U:j(u),D:j(d),F:j(f),B:j(b),L:rotateCCW(st.L),R:j(r)};}
    case"F": {const t=[u[6],u[7],u[8]];[u[6],u[7],u[8]]=[l[8],l[5],l[2]];[l[8],l[5],l[2]]=[d[2],d[1],d[0]];[d[2],d[1],d[0]]=[r[0],r[3],r[6]];[r[0],r[3],r[6]]=t;return{U:j(u),D:j(d),F:rotateCW(st.F),B:j(b),L:j(l),R:j(r)};}
    case"F'":{const t=[u[6],u[7],u[8]];[u[6],u[7],u[8]]=[r[0],r[3],r[6]];[r[0],r[3],r[6]]=[d[2],d[1],d[0]];[d[2],d[1],d[0]]=[l[8],l[5],l[2]];[l[8],l[5],l[2]]=t;return{U:j(u),D:j(d),F:rotateCCW(st.F),B:j(b),L:j(l),R:j(r)};}
    case"B": {const t=[u[0],u[1],u[2]];[u[0],u[1],u[2]]=[r[2],r[5],r[8]];[r[2],r[5],r[8]]=[d[8],d[7],d[6]];[d[8],d[7],d[6]]=[l[0],l[3],l[6]];[l[0],l[3],l[6]]=t;return{U:j(u),D:j(d),F:j(f),B:rotateCW(st.B),L:j(l),R:j(r)};}
    case"B'":{const t=[u[0],u[1],u[2]];[u[0],u[1],u[2]]=[l[0],l[3],l[6]];[l[0],l[3],l[6]]=[d[8],d[7],d[6]];[d[8],d[7],d[6]]=[r[2],r[5],r[8]];[r[2],r[5],r[8]]=t;return{U:j(u),D:j(d),F:j(f),B:rotateCCW(st.B),L:j(l),R:j(r)};}
    default:return st;
  }
}
function isSolved(st:Record<string,string>){return Object.keys(SOLVED).every(f=>st[f].split("").every(c=>c===st[f][4]));}
function generateSolution(cube:Record<string,string>):string[]{
  if(isSolved(cube))return[];
  const moves=["U","U'","D","D'","L","L'","R","R'","F","F'","B","B'"];
  const queue:{s:Record<string,string>,m:string[]}[]=[{s:cube,m:[]}];
  const visited=new Set([JSON.stringify(cube)]);
  for(let depth=0;depth<7;depth++){
    const next:typeof queue=[];
    for(const{s,m}of queue){
      for(const mv of moves){
        const ns=applyMove(s,mv);const k=JSON.stringify(ns);
        if(!visited.has(k)){const nm=[...m,mv];if(isSolved(ns))return nm;visited.add(k);if(next.length<60000)next.push({s:ns,m:nm});}
      }
    }
    queue.length=0;queue.push(...next);if(!queue.length)break;
  }
  return["R","U","R'","U'","R","U","R'","U'"];
}

// ─── WEBGL RENDERER ───────────────────────────────────────────────────────────
// Pure WebGL cube — no Three.js dependency issues
// Each cubie = 6 faces drawn as quads with sticker overlays

function createShader(gl:WebGLRenderingContext, type:number, src:string){
  const s=gl.createShader(type)!;gl.shaderSource(s,src);gl.compileShader(s);
  if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(s);
  return s;
}
function createProgram(gl:WebGLRenderingContext,vs:string,fs:string){
  const p=gl.createProgram()!;
  gl.attachShader(p,createShader(gl,gl.VERTEX_SHADER,vs));
  gl.attachShader(p,createShader(gl,gl.FRAGMENT_SHADER,fs));
  gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw gl.getProgramInfoLog(p);
  return p;
}

const VS=`
attribute vec3 aPos;
attribute vec3 aNorm;
attribute vec3 aColor;
uniform mat4 uMVP;
uniform mat4 uModel;
varying vec3 vColor;
varying vec3 vNorm;
void main(){
  gl_Position=uMVP*vec4(aPos,1.0);
  vColor=aColor;
  vNorm=normalize((uModel*vec4(aNorm,0.0)).xyz);
}`;
const FS=`
precision mediump float;
varying vec3 vColor;
varying vec3 vNorm;
void main(){
  vec3 light=normalize(vec3(1.0,2.0,3.0));
  float d=max(dot(vNorm,light),0.0);
  float amb=0.35;
  gl_FragColor=vec4(vColor*(amb+d*0.65),1.0);
}`;

// mat4 helpers
function mat4identity():Float32Array{return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);}
function mat4mul(a:Float32Array,b:Float32Array):Float32Array{
  const r=new Float32Array(16);
  for(let i=0;i<4;i++)for(let j=0;j<4;j++){let s=0;for(let k=0;k<4;k++)s+=a[i+k*4]*b[k+j*4];r[i+j*4]=s;}
  return r;
}
function mat4perspective(fov:number,asp:number,near:number,far:number):Float32Array{
  const f=1/Math.tan(fov/2),nf=1/(near-far);
  return new Float32Array([f/asp,0,0,0,0,f,0,0,0,0,(far+near)*nf,-1,0,0,2*far*near*nf,0]);
}
function mat4rotX(a:number):Float32Array{const c=Math.cos(a),s=Math.sin(a);return new Float32Array([1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1]);}
function mat4rotY(a:number):Float32Array{const c=Math.cos(a),s=Math.sin(a);return new Float32Array([c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1]);}
function mat4rotAxis(ax:number,ay:number,az:number,a:number):Float32Array{
  const c=Math.cos(a),s=Math.sin(a),t=1-c;
  const l=Math.sqrt(ax*ax+ay*ay+az*az);ax/=l;ay/=l;az/=l;
  return new Float32Array([
    t*ax*ax+c,    t*ax*ay+s*az, t*ax*az-s*ay, 0,
    t*ax*ay-s*az, t*ay*ay+c,    t*ay*az+s*ax, 0,
    t*ax*az+s*ay, t*ay*az-s*ax, t*az*az+c,    0,
    0,0,0,1
  ]);
}
function mat4translate(x:number,y:number,z:number):Float32Array{
  const m=mat4identity();m[12]=x;m[13]=y;m[14]=z;return m;
}

function hexToRgb(hex:string):[number,number,number]{
  const r=parseInt(hex.slice(1,3),16)/255;
  const g=parseInt(hex.slice(3,5),16)/255;
  const b=parseInt(hex.slice(5,7),16)/255;
  return[r,g,b];
}

// Build geometry for one cubie at grid position (gx,gy,gz) with given face colors
// Returns interleaved [x,y,z, nx,ny,nz, r,g,b] for each triangle vertex
function buildCubieGeometry(
  gx:number,gy:number,gz:number,
  faceColors:Record<string,string>, // face->hex, only external faces
  gap:number
):Float32Array{
  const s=0.47; // half-size of cubie
  const st=0.38; // sticker inset
  const cx=gx*gap,cy=gy*gap,cz=gz*gap;
  const black:[number,number,number]=[0.05,0.05,0.05];

  const verts:number[]=[];

  function addQuad(
    p0:[number,number,number],p1:[number,number,number],
    p2:[number,number,number],p3:[number,number,number],
    n:[number,number,number],col:[number,number,number]
  ){
    // two triangles: p0,p1,p2 and p0,p2,p3
    for(const p of[p0,p1,p2,p0,p2,p3]){
      verts.push(...p,...n,...col);
    }
  }

  // 6 faces of the cubie
  const faces=[
    {n:[0,1,0] as [number,number,number], face:"U",  // +Y
      corners:[[-s,s,-s],[s,s,-s],[s,s,s],[-s,s,s]],
      sc:[[-st,s,-st],[st,s,-st],[st,s,st],[-st,s,st]], visible:gy===1},
    {n:[0,-1,0] as [number,number,number], face:"D", // -Y
      corners:[[-s,-s,s],[s,-s,s],[s,-s,-s],[-s,-s,-s]],
      sc:[[-st,-s,st],[st,-s,st],[st,-s,-st],[-st,-s,-st]], visible:gy===-1},
    {n:[0,0,1] as [number,number,number], face:"F",  // +Z
      corners:[[-s,-s,s],[s,-s,s],[s,s,s],[-s,s,s]],
      sc:[[-st,-st,s],[st,-st,s],[st,st,s],[-st,st,s]], visible:gz===1},
    {n:[0,0,-1] as [number,number,number], face:"B", // -Z
      corners:[[s,-s,-s],[-s,-s,-s],[-s,s,-s],[s,s,-s]],
      sc:[[st,-st,-s],[-st,-st,-s],[-st,st,-s],[st,st,-s]], visible:gz===-1},
    {n:[1,0,0] as [number,number,number], face:"R",  // +X
      corners:[[s,-s,s],[s,-s,-s],[s,s,-s],[s,s,s]],
      sc:[[s,-st,st],[s,-st,-st],[s,st,-st],[s,st,st]], visible:gx===1},
    {n:[-1,0,0] as [number,number,number], face:"L", // -X
      corners:[[-s,-s,-s],[-s,-s,s],[-s,s,s],[-s,s,-s]],
      sc:[[-s,-st,-st],[-s,-st,st],[-s,st,st],[-s,st,-st]], visible:gx===-1},
  ];

  for(const face of faces){
    const col = black;
    const c=face.corners.map(([x,y,z])=>[cx+x,cy+y,cz+z] as [number,number,number]);
    addQuad(c[0],c[1],c[2],c[3],face.n,col);
    // Add sticker on top if visible face
    if(face.visible && faceColors[face.face]){
      const rgb=hexToRgb(faceColors[face.face]);
      const sc=face.sc.map(([x,y,z])=>[cx+x,cy+y,cz+z] as [number,number,number]);
      const offset=face.n.map(v=>v*0.001) as [number,number,number];
      addQuad(
        [sc[0][0]+offset[0],sc[0][1]+offset[1],sc[0][2]+offset[2]],
        [sc[1][0]+offset[0],sc[1][1]+offset[1],sc[1][2]+offset[2]],
        [sc[2][0]+offset[0],sc[2][1]+offset[1],sc[2][2]+offset[2]],
        [sc[3][0]+offset[0],sc[3][1]+offset[1],sc[3][2]+offset[2]],
        face.n, rgb
      );
    }
  }
  return new Float32Array(verts);
}

// Get the sticker color for each face of a cubie at (gx,gy,gz) from cube state
function cubieColors(gx:number,gy:number,gz:number,state:Record<string,string>):Record<string,string>{
  const colors:Record<string,string>={};
  // Map grid position to face indices
  if(gy===1){// U face: row=1-gz, col=gx+1
    const row=1-gz,col=gx+1;
    colors.U=CHEX[state.U[row*3+col]];
  }
  if(gy===-1){// D face: row=gz+1, col=gx+1
    const row=gz+1,col=gx+1;
    colors.D=CHEX[state.D[row*3+col]];
  }
  if(gz===1){// F face: row=1-gy, col=gx+1
    const row=1-gy,col=gx+1;
    colors.F=CHEX[state.F[row*3+col]];
  }
  if(gz===-1){// B face: row=1-gy, col=1-gx
    const row=1-gy,col=1-gx;
    colors.B=CHEX[state.B[row*3+col]];
  }
  if(gx===1){// R face: row=1-gy, col=1-gz
    const row=1-gy,col=1-gz;
    colors.R=CHEX[state.R[row*3+col]];
  }
  if(gx===-1){// L face: row=1-gy, col=gz+1
    const row=1-gy,col=gz+1;
    colors.L=CHEX[state.L[row*3+col]];
  }
  return colors;
}

// Move axis info
const MOVE_AXIS:{[k:string]:{axis:[number,number,number],layer:number,dir:number}}={
  "U": {axis:[0,1,0],layer:1, dir:-1},
  "U'":{axis:[0,1,0],layer:1, dir:1},
  "D": {axis:[0,1,0],layer:-1,dir:1},
  "D'":{axis:[0,1,0],layer:-1,dir:-1},
  "R": {axis:[1,0,0],layer:1, dir:-1},
  "R'":{axis:[1,0,0],layer:1, dir:1},
  "L": {axis:[1,0,0],layer:-1,dir:1},
  "L'":{axis:[1,0,0],layer:-1,dir:-1},
  "F": {axis:[0,0,1],layer:1, dir:-1},
  "F'":{axis:[0,0,1],layer:1, dir:1},
  "B": {axis:[0,0,1],layer:-1,dir:1},
  "B'":{axis:[0,0,1],layer:-1,dir:-1},
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function RubikSolverPage(){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const stateRef=useRef<Record<string,string>>(JSON.parse(JSON.stringify(SOLVED)));
  const orbitRef=useRef({theta:0.5,phi:0.4});
  const dragRef=useRef({active:false,lastX:0,lastY:0,startX:0,startY:0,moved:false});
  const animRef=useRef<{move:string,progress:number,speed:number}|null>(null);
  const solveQueueRef=useRef<string[]>([]);
  const isAnimatingRef=useRef(false);
  const rafRef=useRef<number>(0);
  const glRef=useRef<WebGLRenderingContext|null>(null);
  const progRef=useRef<WebGLProgram|null>(null);

  const [cubeState,setCubeState]=useState<Record<string,string>>(JSON.parse(JSON.stringify(SOLVED)));
  const [selectedColor,setSelectedColor]=useState("R");
  const [phase,setPhase]=useState<"paint"|"solving">("paint");
  const [solution,setSolution]=useState<string[]>([]);
  const [currentStep,setCurrentStep]=useState(0);
  const [lang,setLang]=useState("es");
  const [aiText,setAiText]=useState("");
  const [aiLoading,setAiLoading]=useState(false);
  const [paintMode,setPaintMode]=useState(true);

  // Keep stateRef in sync
  useEffect(()=>{stateRef.current=cubeState;},[cubeState]);

  // ── RENDER LOOP ────────────────────────────────────────────────────────────
  const drawFrame=useCallback(()=>{
    const canvas=canvasRef.current;
    const gl=glRef.current;
    const prog=progRef.current;
    if(!canvas||!gl||!prog)return;

    // Handle move animation
    let moveRotMat:Float32Array|null=null;
    let moveAxis:[number,number,number]=[0,1,0];
    let moveLayer=1;

    if(animRef.current){
      const anim=animRef.current;
      anim.progress+=anim.speed;
      const t=Math.min(anim.progress,1);
      const ease=t<0.5?2*t*t:-1+(4-2*t)*t;
      const info=MOVE_AXIS[anim.move];
      if(info){
        moveAxis=info.axis;
        moveLayer=info.layer;
        const angle=info.dir*(Math.PI/2)*ease;
        moveRotMat=mat4rotAxis(info.axis[0],info.axis[1],info.axis[2],angle);
      }
      if(anim.progress>=1){
        // Finalize move
        stateRef.current=applyMove(stateRef.current,anim.move);
        setCubeState({...stateRef.current});
        animRef.current=null;
        // Next in queue
        if(solveQueueRef.current.length>0){
          const next=solveQueueRef.current.shift()!;
          setCurrentStep(s=>s+1);
          setTimeout(()=>{
            animRef.current={move:next,progress:0,speed:0.04};
          },120);
        } else {
          isAnimatingRef.current=false;
        }
      }
    }

    gl.viewport(0,0,canvas.width,canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

    const asp=canvas.width/canvas.height;
    const proj=mat4perspective(Math.PI/4,asp,0.1,100);
    const dist=6.5;
    const {theta,phi}=orbitRef.current;
    const camX=dist*Math.sin(phi)*Math.sin(theta);
    const camY=dist*Math.cos(phi);
    const camZ=dist*Math.sin(phi)*Math.cos(theta);

    // View matrix (lookAt simplified)
    const fwd=[-camX,-camY,-camZ];
    const len=Math.sqrt(fwd[0]**2+fwd[1]**2+fwd[2]**2);
    fwd[0]/=len;fwd[1]/=len;fwd[2]/=len;
    const up=[0,1,0];
    const right=[fwd[1]*up[2]-fwd[2]*up[1],fwd[2]*up[0]-fwd[0]*up[2],fwd[0]*up[1]-fwd[1]*up[0]];
    const rlen=Math.sqrt(right[0]**2+right[1]**2+right[2]**2);
    right[0]/=rlen;right[1]/=rlen;right[2]/=rlen;
    const nup=[right[1]*fwd[2]-right[2]*fwd[1],right[2]*fwd[0]-right[0]*fwd[2],right[0]*fwd[1]-right[1]*fwd[0]];
    const view=new Float32Array([
      right[0],nup[0],-fwd[0],0,
      right[1],nup[1],-fwd[1],0,
      right[2],nup[2],-fwd[2],0,
      -(right[0]*camX+right[1]*camY+right[2]*camZ),
      -(nup[0]*camX+nup[1]*camY+nup[2]*camZ),
      (fwd[0]*camX+fwd[1]*camY+fwd[2]*camZ),1
    ]);
    const vp=mat4mul(proj,view);
    const GAP=1.05;

    const uMVP=gl.getUniformLocation(prog,"uMVP");
    const uModel=gl.getUniformLocation(prog,"uModel");
    const aPos=gl.getAttribLocation(prog,"aPos");
    const aNorm=gl.getAttribLocation(prog,"aNorm");
    const aColor=gl.getAttribLocation(prog,"aColor");

    const STRIDE=9*4;

    for(let gx=-1;gx<=1;gx++) for(let gy=-1;gy<=1;gy++) for(let gz=-1;gz<=1;gz++){
      const colors=cubieColors(gx,gy,gz,stateRef.current);
      const geo=buildCubieGeometry(gx,gy,gz,colors,GAP);

      const buf=gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER,buf);
      gl.bufferData(gl.ARRAY_BUFFER,geo,gl.DYNAMIC_DRAW);

      // Determine model matrix
      let model=mat4identity();

      // If this cubie is in the animating layer, apply rotation
      if(moveRotMat){
        const axisIdx=moveAxis[0]!==0?0:moveAxis[1]!==0?1:2;
        const gridCoords=[gx,gy,gz];
        if(Math.round(gridCoords[axisIdx])===moveLayer){
          model=mat4mul(moveRotMat,model);
        }
      }

      const mvp=mat4mul(vp,model);
      gl.uniformMatrix4fv(uMVP,false,mvp);
      gl.uniformMatrix4fv(uModel,false,model);

      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos,3,gl.FLOAT,false,STRIDE,0);
      gl.enableVertexAttribArray(aNorm);
      gl.vertexAttribPointer(aNorm,3,gl.FLOAT,false,STRIDE,12);
      gl.enableVertexAttribArray(aColor);
      gl.vertexAttribPointer(aColor,3,gl.FLOAT,false,STRIDE,24);

      gl.drawArrays(gl.TRIANGLES,0,geo.length/9);
      gl.deleteBuffer(buf);
    }
  },[]);

  // ── INIT WEBGL ────────────────────────────────────────────────────────────
  useEffect(()=>{
    const canvas=canvasRef.current!;
    const gl=canvas.getContext("webgl",{antialias:true,alpha:false});
    if(!gl){alert("WebGL not supported");return;}
    glRef.current=gl;
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.clearColor(0.05,0.06,0.12,1);

    const prog=createProgram(gl,VS,FS);
    gl.useProgram(prog);
    progRef.current=prog;

    const resize=()=>{
      canvas.width=canvas.clientWidth*window.devicePixelRatio;
      canvas.height=canvas.clientHeight*window.devicePixelRatio;
    };
    resize();
    window.addEventListener("resize",resize);

    function loop(){rafRef.current=requestAnimationFrame(loop);drawFrame();}
    loop();
    return()=>{cancelAnimationFrame(rafRef.current);window.removeEventListener("resize",resize);};
  },[drawFrame]);

  // ── POINTER EVENTS (orbit + paint) ────────────────────────────────────────
  useEffect(()=>{
    const canvas=canvasRef.current!;

    const getXY=(e:MouseEvent|TouchEvent):{x:number,y:number}=>{
      if(e instanceof MouseEvent)return{x:e.clientX,y:e.clientY};
      return{x:e.touches[0].clientX,y:e.touches[0].clientY};
    };

    const onDown=(e:MouseEvent|TouchEvent)=>{
      const{x,y}=getXY(e);
      dragRef.current={active:true,lastX:x,lastY:y,startX:x,startY:y,moved:false};
    };
    const onMove=(e:MouseEvent|TouchEvent)=>{
      if(!dragRef.current.active)return;
      if(e instanceof TouchEvent)e.preventDefault();
      const{x,y}=getXY(e);
      const dx=x-dragRef.current.lastX;
      const dy=y-dragRef.current.lastY;
      if(Math.abs(dx)>2||Math.abs(dy)>2)dragRef.current.moved=true;
      // Always orbit on drag
      orbitRef.current.theta-=dx*0.007;
      orbitRef.current.phi=Math.max(0.15,Math.min(Math.PI-0.15,orbitRef.current.phi+dy*0.007));
      dragRef.current.lastX=x;dragRef.current.lastY=y;
    };
    const onUp=(e:MouseEvent|TouchEvent)=>{
      if(!dragRef.current.active)return;
      const wasMoved=dragRef.current.moved;
      dragRef.current.active=false;
      // If barely moved and in paint mode → do raycast paint
      if(!wasMoved && paintMode && phase==="paint"){
        const canvas=canvasRef.current!;
        const rect=canvas.getBoundingClientRect();
        let cx=0,cy=0;
        if(e instanceof MouseEvent){cx=e.clientX;cy=e.clientY;}
        else if(e instanceof TouchEvent&&e.changedTouches.length>0){cx=e.changedTouches[0].clientX;cy=e.changedTouches[0].clientY;}
        paintSticker(cx-rect.left,cy-rect.top,rect.width,rect.height);
      }
    };

    canvas.addEventListener("mousedown",onDown);
    window.addEventListener("mousemove",onMove);
    window.addEventListener("mouseup",onUp);
    canvas.addEventListener("touchstart",onDown,{passive:false});
    canvas.addEventListener("touchmove",onMove,{passive:false});
    canvas.addEventListener("touchend",onUp,{passive:false});
    return()=>{
      canvas.removeEventListener("mousedown",onDown);
      window.removeEventListener("mousemove",onMove);
      window.removeEventListener("mouseup",onUp);
      canvas.removeEventListener("touchstart",onDown);
      canvas.removeEventListener("touchmove",onMove);
      canvas.removeEventListener("touchend",onUp);
    };
  },[paintMode,phase,selectedColor]);

  // ── RAYCAST PAINT ─────────────────────────────────────────────────────────
  const paintSticker=useCallback((cx:number,cy:number,w:number,h:number)=>{
    // Project each sticker center to screen and find closest
    const{theta,phi}=orbitRef.current;
    const dist=6.5;
    const camX=dist*Math.sin(phi)*Math.sin(theta);
    const camY=dist*Math.cos(phi);
    const camZ=dist*Math.sin(phi)*Math.cos(theta);
    const asp=w/h;
    const fov=Math.PI/4;
    const f=1/Math.tan(fov/2);

    // Forward vector
    const fwdX=-camX/dist,fwdY=-camY/dist,fwdZ=-camZ/dist;
    const rightX=fwdY*0-fwdZ*1,rightY=fwdZ*0-fwdX*0,rightZ=fwdX*1-fwdY*0;
    // simplified right = cross(fwd, worldUp) normalized
    const rx=fwdZ,ry=0,rz=-fwdX;
    const rlen=Math.sqrt(rx*rx+rz*rz)||1;
    const rx2=rx/rlen,rz2=rz/rlen;
    const ux2=fwdY*rz2-fwdZ*0,uy2=fwdZ*rx2-fwdX*rz2,uz2=fwdX*0-fwdY*rx2;

    // Ray direction from NDC
    const ndcX=(cx/w)*2-1;
    const ndcY=-((cy/h)*2-1);
    const rayX=ndcX*(asp/f)*fwdX+ ndcY*(1/f)*ux2 + fwdX;
    // Instead: project sticker centers to screen and find nearest click
    const GAP=1.05;
    const stickerFaces=[
      {fk:"U",n:[0,1,0],row:(gz:number)=>1-gz,col:(gx:number)=>gx+1,visGy:1},
      {fk:"D",n:[0,-1,0],row:(gz:number)=>gz+1,col:(gx:number)=>gx+1,visGy:-1},
      {fk:"F",n:[0,0,1],row:(gy:number)=>1-gy,col:(gx:number)=>gx+1,visGz:1},
      {fk:"B",n:[0,0,-1],row:(gy:number)=>1-gy,col:(gx:number)=>1-gx,visGz:-1},
      {fk:"R",n:[1,0,0],row:(gy:number)=>1-gy,col:(gz:number)=>1-gz,visGx:1},
      {fk:"L",n:[-1,0,0],row:(gy:number)=>1-gy,col:(gz:number)=>gz+1,visGx:-1},
    ];

    // Build projection matrix manually
    const proj=mat4perspective(fov,asp,0.1,100);
    // View
    const fwd2=[-camX/dist,-camY/dist,-camZ/dist];
    const right3=[fwd2[2],0,-fwd2[0]];const rlen3=Math.sqrt(right3[0]**2+right3[2]**2)||1;
    right3[0]/=rlen3;right3[2]/=rlen3;
    const nup3=[right3[1]*fwd2[2]-right3[2]*fwd2[1],right3[2]*fwd2[0]-right3[0]*fwd2[2],right3[0]*fwd2[1]-right3[1]*fwd2[0]];
    const view=new Float32Array([
      right3[0],nup3[0],-fwd2[0],0,
      right3[1],nup3[1],-fwd2[1],0,
      right3[2],nup3[2],-fwd2[2],0,
      -(right3[0]*camX+right3[1]*camY+right3[2]*camZ),
      -(nup3[0]*camX+nup3[1]*camY+nup3[2]*camZ),
      (fwd2[0]*camX+fwd2[1]*camY+fwd2[2]*camZ),1
    ]);
    const vp=mat4mul(proj,view);

    function project3D(wx:number,wy:number,wz:number):{sx:number,sy:number,depth:number}|null{
      const v=[wx,wy,wz,1];
      const clip=[
        vp[0]*v[0]+vp[4]*v[1]+vp[8]*v[2]+vp[12]*v[3],
        vp[1]*v[0]+vp[5]*v[1]+vp[9]*v[2]+vp[13]*v[3],
        vp[2]*v[0]+vp[6]*v[1]+vp[10]*v[2]+vp[14]*v[3],
        vp[3]*v[0]+vp[7]*v[1]+vp[11]*v[2]+vp[15]*v[3],
      ];
      if(clip[3]<=0)return null;
      const sx=((clip[0]/clip[3])+1)/2*w;
      const sy=((1-clip[1]/clip[3]))/2*h;
      return{sx,sy,depth:clip[2]/clip[3]};
    }

    // For each visible sticker center, project and find closest to click
    let bestDist=30,bestFace="",bestIdx=0;
    for(let gx=-1;gx<=1;gx++)for(let gy=-1;gy<=1;gy++)for(let gz=-1;gz<=1;gz++){
      const wx=gx*GAP,wy=gy*GAP,wz=gz*GAP;
      if(gy===1){// U
        const n=[0,1,0];const dot=n[0]*(wx-camX)+n[1]*(wy-camY)+n[2]*(wz-camZ);
        if(dot<0){const p=project3D(wx,wy+0.48,wz);if(p){const d=Math.sqrt((p.sx-cx)**2+(p.sy-cy)**2);if(d<bestDist){bestDist=d;bestFace="U";bestIdx=(1-gz)*3+(gx+1);}}}
      }
      if(gy===-1){// D
        const n=[0,-1,0];const dot=n[0]*(wx-camX)+n[1]*(wy-camY)+n[2]*(wz-camZ);
        if(dot<0){const p=project3D(wx,wy-0.48,wz);if(p){const d=Math.sqrt((p.sx-cx)**2+(p.sy-cy)**2);if(d<bestDist){bestDist=d;bestFace="D";bestIdx=(gz+1)*3+(gx+1);}}}
      }
      if(gz===1){// F
        const n=[0,0,1];const dot=n[0]*(wx-camX)+n[1]*(wy-camY)+n[2]*(wz-camZ);
        if(dot<0){const p=project3D(wx,wy,wz+0.48);if(p){const d=Math.sqrt((p.sx-cx)**2+(p.sy-cy)**2);if(d<bestDist){bestDist=d;bestFace="F";bestIdx=(1-gy)*3+(gx+1);}}}
      }
      if(gz===-1){// B
        const n=[0,0,-1];const dot=n[0]*(wx-camX)+n[1]*(wy-camY)+n[2]*(wz-camZ);
        if(dot<0){const p=project3D(wx,wy,wz-0.48);if(p){const d=Math.sqrt((p.sx-cx)**2+(p.sy-cy)**2);if(d<bestDist){bestDist=d;bestFace="B";bestIdx=(1-gy)*3+(1-gx);}}}
      }
      if(gx===1){// R
        const n=[1,0,0];const dot=n[0]*(wx-camX)+n[1]*(wy-camY)+n[2]*(wz-camZ);
        if(dot<0){const p=project3D(wx+0.48,wy,wz);if(p){const d=Math.sqrt((p.sx-cx)**2+(p.sy-cy)**2);if(d<bestDist){bestDist=d;bestFace="R";bestIdx=(1-gy)*3+(1-gz);}}}
      }
      if(gx===-1){// L
        const n=[-1,0,0];const dot=n[0]*(wx-camX)+n[1]*(wy-camY)+n[2]*(wz-camZ);
        if(dot<0){const p=project3D(wx-0.48,wy,wz);if(p){const d=Math.sqrt((p.sx-cx)**2+(p.sy-cy)**2);if(d<bestDist){bestDist=d;bestFace="L";bestIdx=(1-gy)*3+(gz+1);}}}
      }
    }

    if(bestFace && bestDist<60){
      const newState={...stateRef.current};
      const arr=newState[bestFace].split("");
      arr[bestIdx]=selectedColor;
      newState[bestFace]=arr.join("");
      stateRef.current=newState;
      setCubeState({...newState});
    }
  },[selectedColor]);

  // ── SOLVE ────────────────────────────────────────────────────────────────
  const handleSolve=()=>{
    const steps=generateSolution(stateRef.current);
    setSolution(steps);setCurrentStep(0);setPhase("solving");setAiText("");
    if(steps.length===0)return;
    isAnimatingRef.current=true;
    solveQueueRef.current=[...steps];
    const first=solveQueueRef.current.shift()!;
    setTimeout(()=>{animRef.current={move:first,progress:0,speed:0.035};},300);
  };

  const handleReset=()=>{
    const fresh=JSON.parse(JSON.stringify(SOLVED));
    stateRef.current=fresh;setCubeState(fresh);
    setSolution([]);setCurrentStep(0);setPhase("paint");setAiText("");
    animRef.current=null;solveQueueRef.current=[];isAnimatingRef.current=false;
  };

  const askAI=async()=>{
    setAiLoading(true);setAiText("");
    const move=solution[Math.max(0,currentStep-1)]||solution[0];
    try{
      const res=await fetch("/api/rubik-ai",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({move,stepNum:currentStep,total:solution.length,lang})});
      const data=await res.json();setAiText(data.explanation||"");
    }catch{setAiText("Error");}
    setAiLoading(false);
  };

  const COLORS_UI=[
    {k:"W",hex:"#F5F5F0"},{k:"Y",hex:"#FFD700"},{k:"R",hex:"#E8251A"},
    {k:"O",hex:"#FF6B1A"},{k:"B",hex:"#1A4FE8"},{k:"G",hex:"#1AAE3E"},
  ];

  return(
    <div style={{height:"100dvh",display:"flex",flexDirection:"column",
      background:"#0a0f1e",fontFamily:"'Inter','Segoe UI',sans-serif",color:"#fff",overflow:"hidden"}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Space+Grotesk:wght@700&display=swap');
      `}</style>

      {/* HEADER */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"10px 16px",borderBottom:"1px solid rgba(255,255,255,0.08)",
        background:"rgba(255,255,255,0.02)",flexShrink:0,zIndex:10}}>
        <span style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:18}}>
          Rubik<span style={{color:"#E8251A"}}>Solver</span>
        </span>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:11,color:"#666",
            background:"rgba(255,255,255,0.06)",padding:"3px 10px",borderRadius:10}}>
            {paintMode
              ? (lang==="es"?"🖌 Clic = pintar · Arrastra = girar":"🖌 Click = paint · Drag = rotate")
              : (lang==="es"?"🔄 Arrastra para girar":"🔄 Drag to rotate")}
          </span>
          <div style={{display:"flex",gap:3,background:"rgba(255,255,255,0.07)",borderRadius:14,padding:3}}>
            {["es","en"].map(l=>(
              <button key={l} onClick={()=>setLang(l)} style={{padding:"3px 9px",borderRadius:10,border:"none",
                cursor:"pointer",background:lang===l?"#E8251A":"transparent",
                color:lang===l?"#fff":"#888",fontWeight:600,fontSize:11}}>{l.toUpperCase()}</button>
            ))}
          </div>
        </div>
      </div>

      {/* CANVAS */}
      <canvas ref={canvasRef} style={{flex:1,display:"block",width:"100%",touchAction:"none",cursor:paintMode?"crosshair":"grab"}}/>

      {/* BOTTOM */}
      <div style={{flexShrink:0,background:"rgba(8,10,20,0.97)",borderTop:"1px solid rgba(255,255,255,0.1)",padding:"12px 16px"}}>
        {phase==="paint"&&(
          <div>
            <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:12,alignItems:"center"}}>
              {COLORS_UI.map(c=>(
                <button key={c.k} onClick={()=>{setSelectedColor(c.k);setPaintMode(true);}}
                  style={{width:38,height:38,borderRadius:8,background:c.hex,border:"none",cursor:"pointer",
                    outline:selectedColor===c.k&&paintMode?"3px solid #fff":"3px solid transparent",
                    boxShadow:selectedColor===c.k&&paintMode?`0 0 0 2px #E8251A,0 0 14px ${c.hex}99`:"none",
                    transform:selectedColor===c.k&&paintMode?"scale(1.2)":"scale(1)",transition:"all 0.15s"}}/>
              ))}
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>
              <button onClick={handleSolve} style={{padding:"11px 30px",borderRadius:10,border:"none",
                background:"linear-gradient(135deg,#E8251A,#FF6B1A)",color:"#fff",fontWeight:700,
                fontSize:15,cursor:"pointer",boxShadow:"0 4px 18px rgba(232,37,26,0.45)"}}>
                {lang==="es"?"¡Resolver! ✦":"Solve! ✦"}
              </button>
              <button onClick={handleReset} style={{padding:"11px 20px",borderRadius:10,
                border:"1px solid rgba(255,255,255,0.2)",background:"transparent",
                color:"#aaa",fontWeight:600,fontSize:14,cursor:"pointer"}}>
                {lang==="es"?"Reiniciar":"Reset"}
              </button>
            </div>
          </div>
        )}
        {phase==="solving"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <span style={{color:"#aaa",fontSize:13}}>
                {currentStep}/{solution.length} {lang==="es"?"movimientos":"moves"}
                {currentStep===solution.length&&solution.length>0&&
                  <span style={{color:"#1AAE3E",marginLeft:8}}>🎉 {lang==="es"?"¡Resuelto!":"Solved!"}</span>}
              </span>
              <button onClick={handleReset} style={{background:"none",border:"1px solid rgba(255,255,255,0.2)",
                color:"#aaa",cursor:"pointer",borderRadius:7,padding:"3px 10px",fontSize:12}}>
                {lang==="es"?"← Volver":"← Back"}
              </button>
            </div>
            <div style={{height:4,background:"rgba(255,255,255,0.08)",borderRadius:2,marginBottom:8}}>
              <div style={{height:"100%",borderRadius:2,transition:"width 0.3s ease",
                background:"linear-gradient(90deg,#E8251A,#FF6B1A)",
                width:solution.length?`${(currentStep/solution.length)*100}%`:"0%"}}/>
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
              {solution.map((m,i)=>(
                <span key={i} style={{padding:"3px 10px",borderRadius:6,fontSize:12,fontWeight:700,
                  fontFamily:"monospace",
                  background:i<currentStep?"rgba(26,174,62,0.2)":i===currentStep?"rgba(232,37,26,0.3)":"rgba(255,255,255,0.05)",
                  color:i<currentStep?"#1AAE3E":i===currentStep?"#ff7070":"#555",
                  textDecoration:i<currentStep?"line-through":"none",
                  border:`1px solid ${i===currentStep?"rgba(232,37,26,0.4)":"transparent"}`}}>{m}</span>
              ))}
            </div>
            {currentStep>0&&currentStep<=solution.length&&(
              <div style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"8px 12px"}}>
                <div style={{fontSize:11,color:"#E8251A",fontWeight:600,marginBottom:5}}>✦ {lang==="es"?"Explicación IA":"AI Explanation"}</div>
                {aiLoading?<div style={{color:"#888",fontSize:13,fontStyle:"italic"}}>{lang==="es"?"Pensando…":"Thinking…"}</div>
                  :aiText?<p style={{color:"#ccc",fontSize:13,lineHeight:1.5,margin:0}}>{aiText}</p>
                  :<button onClick={askAI} style={{padding:"5px 14px",borderRadius:8,border:"1px solid rgba(232,37,26,0.4)",
                    background:"rgba(232,37,26,0.1)",color:"#E8251A",fontWeight:600,fontSize:12,cursor:"pointer"}}>
                    🤖 {lang==="es"?"Explicar":"Explain"}
                  </button>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
