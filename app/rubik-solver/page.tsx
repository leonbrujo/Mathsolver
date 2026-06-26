"use client";
import { useEffect, useRef, useState, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// CUBE LOGIC
// ═══════════════════════════════════════════════════════════════
const SOLVED_STATE: Record<string,string> = {
  U:"WWWWWWWWW", D:"YYYYYYYYY", F:"RRRRRRRRR",
  B:"OOOOOOOOO", L:"BBBBBBBBB", R:"GGGGGGGGG",
};

// Empty state (all unset = 'X')
function makeEmptyState(): Record<string,string> {
  const s: Record<string,string> = {};
  // Centers are fixed: W,Y,R,O,B,G
  const centers: Record<string,string> = {U:"W",D:"Y",F:"R",B:"O",L:"B",R:"G"};
  for(const face of Object.keys(SOLVED_STATE)){
    const arr = Array(9).fill("X");
    arr[4] = centers[face]; // center locked
    s[face] = arr.join("");
  }
  return s;
}

const COLOR_HEX: Record<string,string> = {
  W:"#F2F0E6", Y:"#FFD200", R:"#C41230", O:"#FF6B00", B:"#0046AD", G:"#009B48", X:"#1c1c2e"
};
const COLOR_LABEL: Record<string,string> = {W:"White",Y:"Yellow",R:"Red",O:"Orange",B:"Blue",G:"Green"};
const COLOR_KEYS = ["W","Y","R","O","B","G"];

function hexToRgb(hex:string):[number,number,number]{
  return[parseInt(hex.slice(1,3),16)/255,parseInt(hex.slice(3,5),16)/255,parseInt(hex.slice(5,7),16)/255];
}

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
    default: return st;
  }
}

function isSolved(st:Record<string,string>):boolean{
  return Object.keys(SOLVED_STATE).every(f=>st[f].split("").every(c=>c===st[f][4]));
}

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
        if(!visited.has(k)){
          const nm=[...m,mv];
          if(isSolved(ns))return nm;
          visited.add(k);
          if(next.length<80000)next.push({s:ns,m:nm});
        }
      }
    }
    queue.length=0;queue.push(...next);
    if(!queue.length)break;
  }
  return["R","U","R'","U'","R","U","R'","U'"];
}

// Validation
function validateCube(st:Record<string,string>):{valid:boolean,errors:string[]}{
  const errors:string[]=[];
  // Check for unset stickers
  let totalUnset=0;
  for(const face of Object.keys(st)){
    const arr=st[face].split("");
    const unset=arr.filter(c=>c==="X").length;
    totalUnset+=unset;
  }
  if(totalUnset>0){errors.push(`${totalUnset} sticker${totalUnset>1?"s":""} not painted yet.`);return{valid:false,errors};}
  // Count colors
  const counts:Record<string,number>={W:0,Y:0,R:0,O:0,B:0,G:0};
  for(const face of Object.keys(st)){
    for(const c of st[face].split("")){
      if(c in counts)counts[c]++;
    }
  }
  for(const [c,n] of Object.entries(counts)){
    if(n!==9)errors.push(`${COLOR_LABEL[c]}: ${n} stickers (need exactly 9).`);
  }
  return{valid:errors.length===0,errors};
}

// Move info
const MOVE_AXIS:{[k:string]:{axis:[number,number,number],layer:number,dir:number,label:string}}={
  "U": {axis:[0,1,0],layer:1, dir:-1,label:"Top face clockwise"},
  "U'":{axis:[0,1,0],layer:1, dir:1, label:"Top face counter-clockwise"},
  "D": {axis:[0,1,0],layer:-1,dir:1, label:"Bottom face clockwise"},
  "D'":{axis:[0,1,0],layer:-1,dir:-1,label:"Bottom face counter-clockwise"},
  "R": {axis:[1,0,0],layer:1, dir:-1,label:"Right face clockwise"},
  "R'":{axis:[1,0,0],layer:1, dir:1, label:"Right face counter-clockwise"},
  "L": {axis:[1,0,0],layer:-1,dir:1, label:"Left face clockwise"},
  "L'":{axis:[1,0,0],layer:-1,dir:-1,label:"Left face counter-clockwise"},
  "F": {axis:[0,0,1],layer:1, dir:-1,label:"Front face clockwise"},
  "F'":{axis:[0,0,1],layer:1, dir:1, label:"Front face counter-clockwise"},
  "B": {axis:[0,0,1],layer:-1,dir:1, label:"Back face clockwise"},
  "B'":{axis:[0,0,1],layer:-1,dir:-1,label:"Back face counter-clockwise"},
};

// ═══════════════════════════════════════════════════════════════
// WEBGL ENGINE
// ═══════════════════════════════════════════════════════════════
const VS=`
attribute vec3 aPos;attribute vec3 aNorm;attribute vec3 aColor;attribute float aHighlight;
uniform mat4 uMVP;uniform mat4 uModel;
varying vec3 vColor;varying vec3 vNorm;varying float vHighlight;
void main(){gl_Position=uMVP*vec4(aPos,1.0);vColor=aColor;vNorm=normalize((uModel*vec4(aNorm,0.0)).xyz);vHighlight=aHighlight;}`;

const FS=`
precision mediump float;
varying vec3 vColor;varying vec3 vNorm;varying float vHighlight;
void main(){
  vec3 light1=normalize(vec3(2.0,3.0,4.0));
  vec3 light2=normalize(vec3(-1.0,-1.0,-2.0));
  float d1=max(dot(vNorm,light1),0.0);
  float d2=max(dot(vNorm,light2),0.0)*0.3;
  float amb=0.38;
  vec3 col=vColor*(amb+d1*0.55+d2);
  // highlight glow
  col=mix(col,col+vec3(0.3,0.28,0.05)*vHighlight,vHighlight);
  gl_FragColor=vec4(col,1.0);
}`;

function createProgram(gl:WebGLRenderingContext,vs:string,fs:string):WebGLProgram{
  const mkShader=(type:number,src:string)=>{
    const s=gl.createShader(type)!;gl.shaderSource(s,src);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(s);return s;
  };
  const p=gl.createProgram()!;
  gl.attachShader(p,mkShader(gl.VERTEX_SHADER,vs));
  gl.attachShader(p,mkShader(gl.FRAGMENT_SHADER,fs));
  gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw gl.getProgramInfoLog(p);
  return p;
}

// mat4
const I=():Float32Array=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
function mul(a:Float32Array,b:Float32Array):Float32Array{
  const r=new Float32Array(16);
  for(let i=0;i<4;i++)for(let j=0;j<4;j++){let s=0;for(let k=0;k<4;k++)s+=a[i+k*4]*b[k+j*4];r[i+j*4]=s;}
  return r;
}
function perspective(fov:number,asp:number,n:number,f:number):Float32Array{
  const t=1/Math.tan(fov/2),nf=1/(n-f);
  return new Float32Array([t/asp,0,0,0,0,t,0,0,0,0,(f+n)*nf,-1,0,0,2*f*n*nf,0]);
}
function rotAxis(ax:number,ay:number,az:number,a:number):Float32Array{
  const c=Math.cos(a),s=Math.sin(a),t=1-c,l=Math.sqrt(ax*ax+ay*ay+az*az);
  ax/=l;ay/=l;az/=l;
  return new Float32Array([t*ax*ax+c,t*ax*ay+s*az,t*ax*az-s*ay,0,t*ax*ay-s*az,t*ay*ay+c,t*ay*az+s*ax,0,t*ax*az+s*ay,t*ay*az-s*ax,t*az*az+c,0,0,0,0,1]);
}

function buildViewMatrix(camX:number,camY:number,camZ:number):Float32Array{
  const dist=Math.sqrt(camX*camX+camY*camY+camZ*camZ);
  const fx=-camX/dist,fy=-camY/dist,fz=-camZ/dist;
  const rx=fz,ry=0,rz=-fx,rl=Math.sqrt(rx*rx+rz*rz)||1;
  const rx2=rx/rl,rz2=rz/rl;
  const ux=fy*rz2-fz*0,uy=fz*rx2-fx*rz2,uz=fx*0-fy*rx2;
  return new Float32Array([rx2,ux,-fx,0,0,uy,-fy,0,rz2,uz,-fz,0,
    -(rx2*camX+0*camY+rz2*camZ),-(ux*camX+uy*camY+uz*camZ),(fx*camX+fy*camY+fz*camZ),1]);
}

// Sticker geometry: cubie at (gx,gy,gz), build faces with sticker color overlay
function buildCubieGeo(
  gx:number,gy:number,gz:number,
  faceColors:Record<string,string>,
  highlightFace:string,
  hoverStickerKey:string,
  gap:number
):Float32Array{
  const S=0.48,ST=0.36,O_=0.001;
  const cx=gx*gap,cy=gy*gap,cz=gz*gap;
  const BLACK:[number,number,number]=[0.07,0.07,0.09];
  const verts:number[]=[];

  function quad(
    p0:[number,number,number],p1:[number,number,number],
    p2:[number,number,number],p3:[number,number,number],
    n:[number,number,number],col:[number,number,number],hl:number
  ){
    for(const p of[p0,p1,p2,p0,p2,p3])verts.push(...p,...n,...col,hl);
  }

  const FACES=[
    {fk:"U",n:[0,1,0]  as[number,number,number],vis:gy===1,
     corners:[[-S,S,-S],[S,S,-S],[S,S,S],[-S,S,S]],
     stk:[[-ST,S,-ST],[ST,S,-ST],[ST,S,ST],[-ST,S,ST]]},
    {fk:"D",n:[0,-1,0] as[number,number,number],vis:gy===-1,
     corners:[[-S,-S,S],[S,-S,S],[S,-S,-S],[-S,-S,-S]],
     stk:[[-ST,-S,ST],[ST,-S,ST],[ST,-S,-ST],[-ST,-S,-ST]]},
    {fk:"F",n:[0,0,1]  as[number,number,number],vis:gz===1,
     corners:[[-S,-S,S],[S,-S,S],[S,S,S],[-S,S,S]],
     stk:[[-ST,-ST,S],[ST,-ST,S],[ST,ST,S],[-ST,ST,S]]},
    {fk:"B",n:[0,0,-1] as[number,number,number],vis:gz===-1,
     corners:[[S,-S,-S],[-S,-S,-S],[-S,S,-S],[S,S,-S]],
     stk:[[ST,-ST,-S],[-ST,-ST,-S],[-ST,ST,-S],[ST,ST,-S]]},
    {fk:"R",n:[1,0,0]  as[number,number,number],vis:gx===1,
     corners:[[S,-S,S],[S,-S,-S],[S,S,-S],[S,S,S]],
     stk:[[S,-ST,ST],[S,-ST,-ST],[S,ST,-ST],[S,ST,ST]]},
    {fk:"L",n:[-1,0,0] as[number,number,number],vis:gx===-1,
     corners:[[-S,-S,-S],[-S,-S,S],[-S,S,S],[-S,S,-S]],
     stk:[[-S,-ST,-ST],[-S,-ST,ST],[-S,ST,ST],[-S,ST,-ST]]},
  ];

  for(const face of FACES){
    const c=face.corners.map(([x,y,z])=>[cx+x,cy+y,cz+z] as[number,number,number]);
    quad(c[0],c[1],c[2],c[3],face.n,BLACK,0);
    if(face.vis && faceColors[face.fk]){
      const rgb=hexToRgb(faceColors[face.fk]);
      const sc=face.stk.map(([x,y,z])=>[cx+x,cy+y,cz+z] as[number,number,number]);
      const off=face.n.map(v=>v*O_) as[number,number,number];
      const isHl=highlightFace===face.fk?1:0;
      const skey=`${gx},${gy},${gz},${face.fk}`;
      const isHov=hoverStickerKey===skey?0.5:0;
      quad(
        [sc[0][0]+off[0],sc[0][1]+off[1],sc[0][2]+off[2]],
        [sc[1][0]+off[0],sc[1][1]+off[1],sc[1][2]+off[2]],
        [sc[2][0]+off[0],sc[2][1]+off[1],sc[2][2]+off[2]],
        [sc[3][0]+off[0],sc[3][1]+off[1],sc[3][2]+off[2]],
        face.n,rgb,Math.max(isHl,isHov)
      );
    }
  }
  return new Float32Array(verts);
}

function getStickerInfo(gx:number,gy:number,gz:number,fk:string):{face:string,idx:number}{
  let row=0,col=0;
  if(fk==="U"){row=1-gz;col=gx+1;}
  else if(fk==="D"){row=gz+1;col=gx+1;}
  else if(fk==="F"){row=1-gy;col=gx+1;}
  else if(fk==="B"){row=1-gy;col=1-gx;}
  else if(fk==="R"){row=1-gy;col=1-gz;}
  else{row=1-gy;col=gz+1;}
  return{face:fk,idx:row*3+col};
}

function getCubieColors(gx:number,gy:number,gz:number,st:Record<string,string>):Record<string,string>{
  const c:Record<string,string>={};
  if(gy===1){const{idx}=getStickerInfo(gx,gy,gz,"U");c.U=COLOR_HEX[st.U[idx]]??COLOR_HEX.X;}
  if(gy===-1){const{idx}=getStickerInfo(gx,gy,gz,"D");c.D=COLOR_HEX[st.D[idx]]??COLOR_HEX.X;}
  if(gz===1){const{idx}=getStickerInfo(gx,gy,gz,"F");c.F=COLOR_HEX[st.F[idx]]??COLOR_HEX.X;}
  if(gz===-1){const{idx}=getStickerInfo(gx,gy,gz,"B");c.B=COLOR_HEX[st.B[idx]]??COLOR_HEX.X;}
  if(gx===1){const{idx}=getStickerInfo(gx,gy,gz,"R");c.R=COLOR_HEX[st.R[idx]]??COLOR_HEX.X;}
  if(gx===-1){const{idx}=getStickerInfo(gx,gy,gz,"L");c.L=COLOR_HEX[st.L[idx]]??COLOR_HEX.X;}
  return c;
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
type Phase = "paint"|"solving"|"done";

export default function RubikSolverPage(){
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext|null>(null);
  const progRef = useRef<WebGLProgram|null>(null);
  const rafRef = useRef<number>(0);

  // State that drives rendering (refs for perf, useState for UI)
  const stateRef = useRef<Record<string,string>>(makeEmptyState());
  const orbitRef = useRef({theta:0.55, phi:0.42, zoom:7.0});
  const animRef = useRef<{move:string,t:number,speed:number}|null>(null);
  const solveQueueRef = useRef<string[]>([]);
  const highlightFaceRef = useRef<string>("");
  const hoverKeyRef = useRef<string>("");

  // Drag tracking
  const pointerRef = useRef({down:false,startX:0,startY:0,lastX:0,lastY:0,moved:false,touchDist:0});

  // React state
  const [cubeState, setCubeState] = useState<Record<string,string>>(makeEmptyState());
  const [selectedColor, setSelectedColor] = useState<string>("R");
  const [phase, setPhase] = useState<Phase>("paint");
  const [solution, setSolution] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0); // 0.5=slow, 1=normal, 2=fast
  const [lang, setLang] = useState<"es"|"en">("es");
  const [validation, setValidation] = useState<{valid:boolean,errors:string[]}>({valid:false,errors:[]});
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [undoStack, setUndoStack] = useState<Record<string,string>[]>([]);
  const [hoverSticker, setHoverSticker] = useState<string>("");
  const [animating, setAnimating] = useState(false);
  const isPlayingRef = useRef(false);
  const speedRef = useRef(1.0);

  const syncCubeState = useCallback((st:Record<string,string>)=>{
    stateRef.current = st;
    setCubeState({...st});
    setValidation(validateCube(st));
  },[]);

  // Init
  useEffect(()=>{
    const fresh = makeEmptyState();
    stateRef.current = fresh;
    setCubeState({...fresh});
    setValidation(validateCube(fresh));
  },[]);

  // ── WEBGL INIT ─────────────────────────────────────────────
  useEffect(()=>{
    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl",{antialias:true,alpha:false,preserveDrawingBuffer:false});
    if(!gl){return;}
    glRef.current = gl;
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.clearColor(0.06,0.07,0.13,1);

    const prog = createProgram(gl,VS,FS);
    gl.useProgram(prog);
    progRef.current = prog;

    const resize=()=>{
      const dpr=Math.min(window.devicePixelRatio,2);
      canvas.width=canvas.clientWidth*dpr;
      canvas.height=canvas.clientHeight*dpr;
      gl.viewport(0,0,canvas.width,canvas.height);
    };
    resize();
    window.addEventListener("resize",resize);

    let rafId:number;
    const loop=()=>{rafId=requestAnimationFrame(loop);renderFrame();};
    loop();
    return()=>{cancelAnimationFrame(rafId);window.removeEventListener("resize",resize);};
  },[]);

  // ── RENDER ─────────────────────────────────────────────────
  const renderFrame = useCallback(()=>{
    const gl=glRef.current,prog=progRef.current,canvas=canvasRef.current;
    if(!gl||!prog||!canvas)return;

    // Advance animation
    let moveRotMat:Float32Array|null=null;
    let moveAxisVec:[number,number,number]=[0,1,0];
    let moveLayer=1;

    if(animRef.current){
      const anim=animRef.current;
      anim.t=Math.min(anim.t+anim.speed,1);
      const ease=anim.t<0.5?2*anim.t*anim.t:-1+(4-2*anim.t)*anim.t;
      const info=MOVE_AXIS[anim.move];
      if(info){
        moveAxisVec=info.axis;moveLayer=info.layer;
        const angle=info.dir*(Math.PI/2)*ease;
        moveRotMat=rotAxis(info.axis[0],info.axis[1],info.axis[2],angle);
      }
      if(anim.t>=1){
        // finalize
        const completedMove=anim.move;
        stateRef.current=applyMove(stateRef.current,completedMove);
        setCubeState({...stateRef.current});
        animRef.current=null;
        highlightFaceRef.current="";

        if(solveQueueRef.current.length>0){
          const next=solveQueueRef.current.shift()!;
          setCurrentStep(s=>s+1);
          const delay=isPlayingRef.current?Math.max(50,150/speedRef.current):99999;
          setTimeout(()=>{
            if(isPlayingRef.current||solveQueueRef.current.length===0){
              const info2=MOVE_AXIS[next];
              if(info2)highlightFaceRef.current=["U","D"].includes(next.replace("'",""))?
                (next.replace("'","")):(next.replace("'",""));
              animRef.current={move:next,t:0,speed:0.022*speedRef.current};
              setAnimating(true);
            }
          },isPlayingRef.current?delay:0);
        }else{
          setAnimating(false);
          setIsPlaying(false);
          isPlayingRef.current=false;
          setPhase("done");
        }
      }
    }

    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

    const asp=canvas.width/canvas.height;
    const {theta,phi,zoom}=orbitRef.current;
    const camX=zoom*Math.sin(phi)*Math.sin(theta);
    const camY=zoom*Math.cos(phi);
    const camZ=zoom*Math.sin(phi)*Math.cos(theta);

    const proj=perspective(Math.PI/5,asp,0.1,100);
    const view=buildViewMatrix(camX,camY,camZ);
    const vp=mul(proj,view);

    const uMVP=gl.getUniformLocation(prog,"uMVP");
    const uModel=gl.getUniformLocation(prog,"uModel");
    const aPos=gl.getAttribLocation(prog,"aPos");
    const aNorm=gl.getAttribLocation(prog,"aNorm");
    const aColor=gl.getAttribLocation(prog,"aColor");
    const aHighlight=gl.getAttribLocation(prog,"aHighlight");
    const STRIDE=10*4;
    const GAP=1.06;

    for(let gx=-1;gx<=1;gx++)for(let gy=-1;gy<=1;gy++)for(let gz=-1;gz<=1;gz++){
      const colors=getCubieColors(gx,gy,gz,stateRef.current);
      const hlFace=highlightFaceRef.current;
      const geo=buildCubieGeo(gx,gy,gz,colors,hlFace,hoverKeyRef.current,GAP);

      let model=I();
      if(moveRotMat){
        const axIdx=moveAxisVec[0]!==0?0:moveAxisVec[1]!==0?1:2;
        const gArr=[gx,gy,gz];
        if(Math.round(gArr[axIdx])===moveLayer)model=mul(moveRotMat,model);
      }
      const mvp=mul(vp,model);
      gl.uniformMatrix4fv(uMVP,false,mvp);
      gl.uniformMatrix4fv(uModel,false,model);

      const buf=gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER,buf);
      gl.bufferData(gl.ARRAY_BUFFER,geo,gl.DYNAMIC_DRAW);

      gl.enableVertexAttribArray(aPos);gl.vertexAttribPointer(aPos,3,gl.FLOAT,false,STRIDE,0);
      gl.enableVertexAttribArray(aNorm);gl.vertexAttribPointer(aNorm,3,gl.FLOAT,false,STRIDE,12);
      gl.enableVertexAttribArray(aColor);gl.vertexAttribPointer(aColor,3,gl.FLOAT,false,STRIDE,24);
      gl.enableVertexAttribArray(aHighlight);gl.vertexAttribPointer(aHighlight,1,gl.FLOAT,false,STRIDE,36);

      gl.drawArrays(gl.TRIANGLES,0,geo.length/10);
      gl.deleteBuffer(buf);
    }
  },[]);

  // ── PROJECTION HELPER ──────────────────────────────────────
  const getVP = useCallback(()=>{
    const canvas=canvasRef.current!;
    const{theta,phi,zoom}=orbitRef.current;
    const camX=zoom*Math.sin(phi)*Math.sin(theta);
    const camY=zoom*Math.cos(phi);
    const camZ=zoom*Math.sin(phi)*Math.cos(theta);
    const asp=canvas.clientWidth/canvas.clientHeight;
    return{vp:mul(perspective(Math.PI/5,asp,0.1,100),buildViewMatrix(camX,camY,camZ)),camX,camY,camZ};
  },[]);

  const project3D = useCallback((wx:number,wy:number,wz:number,w:number,h:number):{sx:number,sy:number,depth:number}|null=>{
    const{vp}=getVP();
    const clip=[
      vp[0]*wx+vp[4]*wy+vp[8]*wz+vp[12],
      vp[1]*wx+vp[5]*wy+vp[9]*wz+vp[13],
      vp[2]*wx+vp[6]*wy+vp[10]*wz+vp[14],
      vp[3]*wx+vp[7]*wy+vp[11]*wz+vp[15],
    ];
    if(clip[3]<=0)return null;
    return{sx:((clip[0]/clip[3])+1)/2*w,sy:((1-clip[1]/clip[3]))/2*h,depth:clip[2]/clip[3]};
  },[getVP]);

  // ── FIND STICKER UNDER CURSOR ──────────────────────────────
  const findSticker = useCallback((cx:number,cy:number,w:number,h:number):{gx:number,gy:number,gz:number,fk:string,face:string,idx:number,dist:number,depth:number}|null=>{
    const{camX,camY,camZ}=getVP();
    const GAP=1.06;
    type BestHit={dist:number,gx:number,gy:number,gz:number,fk:string,face:string,idx:number,depth:number};
    let best:BestHit|null=null;

    const tryFace=(gx:number,gy:number,gz:number,fk:string,wx:number,wy:number,wz:number,nx:number,ny:number,nz:number)=>{
      // backface cull
      const dot=nx*(wx-camX)+ny*(wy-camY)+nz*(wz-camZ);
      if(dot>=0)return;
      const p=project3D(wx,wy,wz,w,h);
      if(!p)return;
      const d=Math.sqrt((p.sx-cx)**2+(p.sy-cy)**2);
      const info=getStickerInfo(gx,gy,gz,fk);
      if(!best||d<best.dist||(d<best.dist+5&&p.depth<best.depth)){
        best={dist:d,gx,gy,gz,fk,...info,depth:p.depth};
      }
    };

    for(let gx=-1;gx<=1;gx++)for(let gy=-1;gy<=1;gy++)for(let gz=-1;gz<=1;gz++){
      const wx=gx*GAP,wy=gy*GAP,wz=gz*GAP;
      if(gy===1) tryFace(gx,gy,gz,"U",wx,wy+0.49,wz,0,1,0);
      if(gy===-1)tryFace(gx,gy,gz,"D",wx,wy-0.49,wz,0,-1,0);
      if(gz===1) tryFace(gx,gy,gz,"F",wx,wy,wz+0.49,0,0,1);
      if(gz===-1)tryFace(gx,gy,gz,"B",wx,wy,wz-0.49,0,0,-1);
      if(gx===1) tryFace(gx,gy,gz,"R",wx+0.49,wy,wz,1,0,0);
      if(gx===-1)tryFace(gx,gy,gz,"L",wx-0.49,wy,wz,-1,0,0);
    }
    if(!best||best.dist>55)return null;
    return best;
  },[getVP,project3D]);

  // ── POINTER EVENTS ─────────────────────────────────────────
  useEffect(()=>{
    const canvas=canvasRef.current!;
    const DRAG_THRESHOLD=6;

    const getXY=(e:MouseEvent|Touch)=>{
      const r=canvas.getBoundingClientRect();
      return{x:e.clientX-r.left,y:e.clientY-r.top,raw:{x:e.clientX,y:e.clientY}};
    };

    // Mouse hover
    const onMouseMove=(e:MouseEvent)=>{
      if(pointerRef.current.down){
        const dx=e.clientX-pointerRef.current.lastX;
        const dy=e.clientY-pointerRef.current.lastY;
        const tdx=e.clientX-pointerRef.current.startX;
        const tdy=e.clientY-pointerRef.current.startY;
        if(Math.sqrt(tdx*tdx+tdy*tdy)>DRAG_THRESHOLD)pointerRef.current.moved=true;
        if(pointerRef.current.moved){
          orbitRef.current.theta-=dx*0.007;
          orbitRef.current.phi=Math.max(0.12,Math.min(Math.PI-0.12,orbitRef.current.phi+dy*0.007));
        }
        pointerRef.current.lastX=e.clientX;pointerRef.current.lastY=e.clientY;
      }else{
        // hover
        if(phase==="paint"){
          const r=canvas.getBoundingClientRect();
          const hit=findSticker(e.clientX-r.left,e.clientY-r.top,canvas.clientWidth,canvas.clientHeight);
          const key=hit?`${hit.gx},${hit.gy},${hit.gz},${hit.fk}`:"";
          hoverKeyRef.current=key;
          setHoverSticker(key);
          canvas.style.cursor=hit?"pointer":"default";
        }
      }
    };

    const onMouseDown=(e:MouseEvent)=>{
      pointerRef.current={down:true,startX:e.clientX,startY:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false,touchDist:0};
    };

    const onMouseUp=(e:MouseEvent)=>{
      if(!pointerRef.current.down)return;
      const wasMove=pointerRef.current.moved;
      pointerRef.current.down=false;
      if(!wasMove&&phase==="paint"&&!animating){
        const r=canvas.getBoundingClientRect();
        const hit=findSticker(e.clientX-r.left,e.clientY-r.top,canvas.clientWidth,canvas.clientHeight);
        if(hit&&hit.face!==""){
          // Don't paint center sticker
          if(hit.idx===4)return;
          const prev={...stateRef.current};
          setUndoStack(s=>[...s.slice(-19),JSON.parse(JSON.stringify(prev))]);
          const arr=stateRef.current[hit.face].split("");
          arr[hit.idx]=selectedColor;
          const next={...stateRef.current,[hit.face]:arr.join("")};
          syncCubeState(next);
        }
      }
    };

    // Scroll = zoom
    const onWheel=(e:WheelEvent)=>{
      e.preventDefault();
      orbitRef.current.zoom=Math.max(4,Math.min(12,orbitRef.current.zoom+e.deltaY*0.005));
    };

    // Touch
    let lastTouchDist=0;
    const onTouchStart=(e:TouchEvent)=>{
      e.preventDefault();
      if(e.touches.length===1){
        const t=e.touches[0];
        pointerRef.current={down:true,startX:t.clientX,startY:t.clientY,lastX:t.clientX,lastY:t.clientY,moved:false,touchDist:0};
      }else if(e.touches.length===2){
        lastTouchDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
      }
    };
    const onTouchMove=(e:TouchEvent)=>{
      e.preventDefault();
      if(e.touches.length===1){
        const t=e.touches[0];
        const dx=t.clientX-pointerRef.current.lastX;
        const dy=t.clientY-pointerRef.current.lastY;
        const tdx=t.clientX-pointerRef.current.startX;
        const tdy=t.clientY-pointerRef.current.startY;
        if(Math.sqrt(tdx*tdx+tdy*tdy)>DRAG_THRESHOLD)pointerRef.current.moved=true;
        if(pointerRef.current.moved){
          orbitRef.current.theta-=dx*0.007;
          orbitRef.current.phi=Math.max(0.12,Math.min(Math.PI-0.12,orbitRef.current.phi+dy*0.007));
        }
        pointerRef.current.lastX=t.clientX;pointerRef.current.lastY=t.clientY;
      }else if(e.touches.length===2){
        const dist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
        orbitRef.current.zoom=Math.max(4,Math.min(12,orbitRef.current.zoom-(dist-lastTouchDist)*0.02));
        lastTouchDist=dist;
      }
    };
    const onTouchEnd=(e:TouchEvent)=>{
      if(!pointerRef.current.down)return;
      const wasMove=pointerRef.current.moved;
      pointerRef.current.down=false;
      if(!wasMove&&phase==="paint"&&!animating&&e.changedTouches.length>0){
        const t=e.changedTouches[0];
        const r=canvas.getBoundingClientRect();
        const hit=findSticker(t.clientX-r.left,t.clientY-r.top,canvas.clientWidth,canvas.clientHeight);
        if(hit&&hit.idx!==4){
          const prev={...stateRef.current};
          setUndoStack(s=>[...s.slice(-19),JSON.parse(JSON.stringify(prev))]);
          const arr=stateRef.current[hit.face].split("");
          arr[hit.idx]=selectedColor;
          const next={...stateRef.current,[hit.face]:arr.join("")};
          syncCubeState(next);
        }
      }
    };

    canvas.addEventListener("mousedown",onMouseDown);
    window.addEventListener("mousemove",onMouseMove);
    window.addEventListener("mouseup",onMouseUp);
    canvas.addEventListener("wheel",onWheel,{passive:false});
    canvas.addEventListener("touchstart",onTouchStart,{passive:false});
    canvas.addEventListener("touchmove",onTouchMove,{passive:false});
    canvas.addEventListener("touchend",onTouchEnd,{passive:false});
    return()=>{
      canvas.removeEventListener("mousedown",onMouseDown);
      window.removeEventListener("mousemove",onMouseMove);
      window.removeEventListener("mouseup",onMouseUp);
      canvas.removeEventListener("wheel",onWheel);
      canvas.removeEventListener("touchstart",onTouchStart);
      canvas.removeEventListener("touchmove",onTouchMove);
      canvas.removeEventListener("touchend",onTouchEnd);
    };
  },[phase,selectedColor,animating,findSticker,syncCubeState]);

  // ── SOLVE ──────────────────────────────────────────────────
  const handleSolve=useCallback(()=>{
    const{valid}=validateCube(stateRef.current);
    if(!valid)return;
    const steps=generateSolution(stateRef.current);
    setSolution(steps);
    setCurrentStep(0);
    setPhase(steps.length===0?"done":"solving");
    setAiText("");
    setAnimating(false);
    solveQueueRef.current=[];
    animRef.current=null;
  },[]);

  // Play/Pause
  const handlePlay=useCallback(()=>{
    if(phase==="done")return;
    if(animRef.current)return; // already animating
    const remaining=solution.slice(currentStep);
    if(!remaining.length){setPhase("done");return;}
    isPlayingRef.current=true;
    setIsPlaying(true);
    solveQueueRef.current=[...remaining.slice(1)];
    const first=remaining[0];
    const info=MOVE_AXIS[first];
    if(info)highlightFaceRef.current=first.replace("'","");
    animRef.current={move:first,t:0,speed:0.022*speedRef.current};
    setAnimating(true);
  },[phase,solution,currentStep]);

  const handlePause=useCallback(()=>{
    isPlayingRef.current=false;
    setIsPlaying(false);
    solveQueueRef.current=[];
  },[]);

  const handleNext=useCallback(()=>{
    if(animRef.current||currentStep>=solution.length)return;
    const mv=solution[currentStep];
    setCurrentStep(s=>s+1);
    solveQueueRef.current=[];
    const info=MOVE_AXIS[mv];
    if(info)highlightFaceRef.current=mv.replace("'","");
    animRef.current={move:mv,t:0,speed:0.035*speedRef.current};
    setAnimating(true);
  },[solution,currentStep]);

  const handlePrev=useCallback(()=>{
    if(animRef.current||currentStep<=0)return;
    // Go back by re-solving from initial to currentStep-1
    // For simplicity: just decrement and reverse the move
    const mv=solution[currentStep-1];
    const inverse=(m:string)=>m.endsWith("'")?m.slice(0,-1):m+"'";
    const rev=inverse(mv);
    setCurrentStep(s=>s-1);
    solveQueueRef.current=[];
    const info=MOVE_AXIS[rev];
    if(info)highlightFaceRef.current=rev.replace("'","");
    animRef.current={move:rev,t:0,speed:0.035*speedRef.current};
    setAnimating(true);
  },[solution,currentStep]);

  const handleReset=useCallback(()=>{
    const fresh=makeEmptyState();
    syncCubeState(fresh);
    setSolution([]);setCurrentStep(0);setPhase("paint");
    setAiText("");setUndoStack([]);setIsPlaying(false);
    isPlayingRef.current=false;
    animRef.current=null;solveQueueRef.current=[];
    highlightFaceRef.current="";setAnimating(false);
  },[syncCubeState]);

  const handleUndo=useCallback(()=>{
    setUndoStack(stack=>{
      if(!stack.length)return stack;
      const prev=stack[stack.length-1];
      syncCubeState(prev);
      return stack.slice(0,-1);
    });
  },[syncCubeState]);

  const handleFillSolved=useCallback(()=>{
    syncCubeState(JSON.parse(JSON.stringify(SOLVED_STATE)));
    setUndoStack([]);
  },[syncCubeState]);

  const askAI=async()=>{
    setAiLoading(true);setAiText("");
    const mv=solution[currentStep-1]||solution[0];
    const info=MOVE_AXIS[mv];
    try{
      const res=await fetch("/api/rubik-ai",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({move:mv,stepNum:currentStep,total:solution.length,lang})});
      const data=await res.json();setAiText(data.explanation||"");
    }catch{setAiText("Error connecting to AI.");}
    setAiLoading(false);
  };

  // Sync speed ref
  useEffect(()=>{speedRef.current=speed;},[speed]);

  // Color count display
  const colorCounts:{[k:string]:number}=Object.fromEntries(COLOR_KEYS.map(k=>[k,0]));
  for(const face of Object.keys(cubeState))for(const c of cubeState[face].split(""))if(c in colorCounts)colorCounts[c]++;
  const totalPainted=Object.values(colorCounts).reduce((a,b)=>a+b,0);
  const totalStickers=54-9; // 54 total - 9 centers (already set)
  const unsetCount=Object.values(cubeState).join("").split("").filter(c=>c==="X").length;

  const currentMove=solution[currentStep];
  const moveInfo=MOVE_AXIS[currentMove];

  const T={
    title:{es:"RubikSolver",en:"RubikSolver"},
    subtitle:{es:"Drag to rotate · Tap stickers to paint",en:"Drag to rotate · Tap stickers to paint"},
    selectColor:{es:"Selecciona un color, luego toca los stickers para copiar tu cubo",en:"Select a color, then tap stickers to match your cube"},
    solve:{es:"Resolver",en:"Solve"},
    reset:{es:"Reiniciar",en:"Reset"},
    undo:{es:"Deshacer",en:"Undo"},
    fill:{es:"Cubo resuelto",en:"Fill solved"},
    validating:{es:"Completá todos los stickers",en:"Paint all stickers to solve"},
    readyToSolve:{es:"¡Listo para resolver!",en:"Ready to solve!"},
    stepOf:{es:"Paso",en:"Step"},
    of:{es:"de",en:"of"},
    done:{es:"¡Cubo resuelto! 🎉",en:"Cube solved! 🎉"},
    prev:{es:"Anterior",en:"Previous"},
    next:{es:"Siguiente",en:"Next"},
    play:{es:"Play",en:"Play"},
    pause:{es:"Pausa",en:"Pause"},
    speed:{es:"Velocidad",en:"Speed"},
    aiExplain:{es:"Explicar con IA",en:"Explain with AI"},
    turn:{es:"Gira",en:"Turn"},
  };
  const tx=(k:keyof typeof T)=>T[k][lang];

  return(
    <div style={{height:"100dvh",display:"flex",flexDirection:"column",background:"#0a0e1a",
      fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI','Inter',sans-serif",color:"#fff",overflow:"hidden"}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        :root{--red:#C41230;--accent:#E8341A;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
        .btn{border:none;cursor:pointer;font-family:inherit;font-weight:600;transition:all 0.15s;border-radius:10px;}
        .btn:active{transform:scale(0.96);}
        .btn-primary{background:linear-gradient(135deg,#C41230,#E8341A);color:#fff;box-shadow:0 4px 16px rgba(196,18,48,0.4);}
        .btn-primary:hover{box-shadow:0 6px 20px rgba(196,18,48,0.5);transform:translateY(-1px);}
        .btn-primary:disabled{opacity:0.4;transform:none;box-shadow:none;}
        .btn-ghost{background:rgba(255,255,255,0.07);color:#ccc;border:1px solid rgba(255,255,255,0.12);}
        .btn-ghost:hover{background:rgba(255,255,255,0.12);color:#fff;}
        .btn-ghost:disabled{opacity:0.35;cursor:not-allowed;}
        .move-chip{display:inline-flex;align-items:center;padding:3px 9px;border-radius:6px;font-family:monospace;font-size:12px;font-weight:700;transition:all 0.2s;}
        .color-btn{border:none;cursor:pointer;border-radius:10px;transition:all 0.18s;position:relative;}
        .color-btn:hover{transform:scale(1.08);}
        .color-btn.active{transform:scale(1.15);box-shadow:0 0 0 3px #fff, 0 0 0 5px var(--accent);}
      `}</style>

      {/* ── HEADER ── */}
      <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"10px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)",
        background:"rgba(10,14,26,0.9)",backdropFilter:"blur(20px)",flexShrink:0,zIndex:20}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,borderRadius:7,background:"linear-gradient(135deg,#C41230,#FF6B1A)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🧩</div>
          <div>
            <div style={{fontWeight:800,fontSize:17,letterSpacing:"-0.3px"}}>
              Rubik<span style={{color:"#E8341A"}}>Solver</span>
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:11,color:"#555",letterSpacing:"0.3px",display:"none"}}>
            {tx("subtitle")}
          </span>
          <div style={{display:"flex",gap:3,background:"rgba(255,255,255,0.06)",borderRadius:14,padding:3}}>
            {(["es","en"] as const).map(l=>(
              <button key={l} onClick={()=>setLang(l)} style={{padding:"3px 10px",borderRadius:11,border:"none",
                cursor:"pointer",background:lang===l?"#C41230":"transparent",
                color:lang===l?"#fff":"#666",fontWeight:700,fontSize:11,transition:"all 0.15s"}}>{l.toUpperCase()}</button>
            ))}
          </div>
        </div>
      </header>

      {/* ── CANVAS ── */}
      <canvas ref={canvasRef} style={{flex:1,display:"block",width:"100%",minHeight:0,
        touchAction:"none",userSelect:"none"}}/>

      {/* ── BOTTOM PANEL ── */}
      <div style={{flexShrink:0,background:"rgba(8,11,20,0.98)",borderTop:"1px solid rgba(255,255,255,0.08)",
        padding:"14px 16px 16px",maxHeight:"42vh",overflowY:"auto"}}>

        {/* PAINT PHASE */}
        {phase==="paint"&&(<div style={{animation:"fadeUp 0.3s ease"}}>
          <p style={{fontSize:12,color:"#556",textAlign:"center",marginBottom:12,lineHeight:1.4}}>
            {tx("selectColor")}
          </p>

          {/* Color palette */}
          <div style={{display:"flex",gap:9,justifyContent:"center",marginBottom:14}}>
            {COLOR_KEYS.map(k=>(
              <button key={k} className={`color-btn${selectedColor===k?" active":""}`}
                onClick={()=>setSelectedColor(k)}
                title={COLOR_LABEL[k]}
                style={{width:40,height:40,background:COLOR_HEX[k]}}>
                {selectedColor===k&&<div style={{position:"absolute",bottom:2,right:2,width:8,height:8,
                  borderRadius:"50%",background:"rgba(255,255,255,0.9)",border:"1px solid rgba(0,0,0,0.3)"}}/>}
              </button>
            ))}
          </div>

          {/* Color counts */}
          <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:14,flexWrap:"wrap"}}>
            {COLOR_KEYS.map(k=>{
              const n=colorCounts[k];const ok=n===9;const over=n>9;
              return(<div key={k} style={{display:"flex",alignItems:"center",gap:4,
                padding:"4px 8px",borderRadius:7,
                background:ok?"rgba(0,155,72,0.15)":over?"rgba(196,18,48,0.2)":"rgba(255,255,255,0.05)",
                border:`1px solid ${ok?"rgba(0,155,72,0.3)":over?"rgba(196,18,48,0.4)":"rgba(255,255,255,0.08)"}`}}>
                <div style={{width:10,height:10,borderRadius:3,background:COLOR_HEX[k]}}/>
                <span style={{fontSize:12,fontWeight:700,color:ok?"#1aae3e":over?"#ff4444":"#888"}}>{n}</span>
              </div>);
            })}
          </div>

          {/* Validation */}
          {validation.errors.length>0&&(
            <div style={{background:"rgba(196,18,48,0.12)",border:"1px solid rgba(196,18,48,0.3)",
              borderRadius:10,padding:"8px 12px",marginBottom:12}}>
              {validation.errors.slice(0,2).map((e,i)=>(
                <p key={i} style={{fontSize:12,color:"#ff7070",margin:i>0?"4px 0 0":0}}>⚠ {e}</p>
              ))}
            </div>
          )}
          {validation.valid&&(
            <div style={{background:"rgba(0,155,72,0.12)",border:"1px solid rgba(0,155,72,0.3)",
              borderRadius:10,padding:"8px 12px",marginBottom:12,textAlign:"center"}}>
              <span style={{fontSize:13,color:"#1aae3e",fontWeight:600}}>✓ {tx("readyToSolve")}</span>
            </div>
          )}

          {/* Actions */}
          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="btn btn-primary" onClick={handleSolve}
              disabled={!validation.valid}
              style={{padding:"11px 28px",fontSize:15}}>
              {tx("solve")} →
            </button>
            <button className="btn btn-ghost" onClick={handleUndo}
              disabled={undoStack.length===0}
              style={{padding:"11px 16px",fontSize:14}}>↩ {tx("undo")}</button>
            <button className="btn btn-ghost" onClick={handleFillSolved}
              style={{padding:"11px 16px",fontSize:14}}>🎯 {tx("fill")}</button>
            <button className="btn btn-ghost" onClick={handleReset}
              style={{padding:"11px 16px",fontSize:14}}>✕ {tx("reset")}</button>
          </div>
        </div>)}

        {/* SOLVING PHASE */}
        {(phase==="solving"||phase==="done")&&(<div style={{animation:"fadeUp 0.3s ease"}}>
          {/* Current move display */}
          {phase==="solving"&&currentMove&&(<div style={{display:"flex",alignItems:"center",gap:14,
            background:"rgba(255,255,255,0.04)",borderRadius:12,padding:"10px 14px",marginBottom:12}}>
            <div style={{
              width:56,height:56,borderRadius:12,flexShrink:0,
              background:`rgba(${hexToRgb(COLOR_HEX[moveInfo?moveInfo.axis[0]!==0?"R":moveInfo.axis[1]!==0?"Y":"R":"W"]).map(v=>Math.round(v*255)).join(",")},0.15)`,
              border:"2px solid rgba(255,255,255,0.15)",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:22,fontWeight:900,fontFamily:"monospace",color:"#fff",
              letterSpacing:"-1px"
            }}>{currentMove}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:11,color:"#556",marginBottom:2}}>{tx("stepOf")} {currentStep+1} {tx("of")} {solution.length}</div>
              <div style={{fontSize:14,fontWeight:600,color:"#ddd"}}>{moveInfo?.label||""}</div>
              <div style={{height:3,background:"rgba(255,255,255,0.08)",borderRadius:2,marginTop:6}}>
                <div style={{height:"100%",borderRadius:2,background:"linear-gradient(90deg,#C41230,#FF6B1A)",
                  width:`${((currentStep)/solution.length)*100}%`,transition:"width 0.35s ease"}}/>
              </div>
            </div>
          </div>)}

          {phase==="done"&&(
            <div style={{textAlign:"center",padding:"12px 0",marginBottom:12}}>
              <div style={{fontSize:28,marginBottom:4}}>🎉</div>
              <div style={{fontSize:16,fontWeight:700,color:"#1aae3e"}}>{tx("done")}</div>
            </div>
          )}

          {/* Move sequence */}
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:12}}>
            {solution.map((m,i)=>(
              <span key={i} className="move-chip" style={{
                background:i<currentStep?"rgba(26,174,62,0.18)":i===currentStep?"rgba(196,18,48,0.3)":"rgba(255,255,255,0.05)",
                color:i<currentStep?"#1aae3e":i===currentStep?"#ff9090":"#555",
                border:`1px solid ${i===currentStep?"rgba(196,18,48,0.5)":i<currentStep?"rgba(26,174,62,0.3)":"transparent"}`,
                textDecoration:i<currentStep?"line-through":"none"
              }}>{m}</span>
            ))}
          </div>

          {/* Controls */}
          <div style={{display:"flex",gap:7,justifyContent:"center",alignItems:"center",flexWrap:"wrap",marginBottom:10}}>
            <button className="btn btn-ghost" onClick={handlePrev}
              disabled={currentStep===0||animating}
              style={{padding:"9px 14px",fontSize:13}}>← {tx("prev")}</button>
            {isPlaying
              ?<button className="btn btn-ghost" onClick={handlePause} style={{padding:"9px 18px",fontSize:13}}>⏸ {tx("pause")}</button>
              :<button className="btn btn-primary" onClick={handlePlay}
                disabled={phase==="done"||animating}
                style={{padding:"9px 18px",fontSize:13}}>▶ {tx("play")}</button>}
            <button className="btn btn-ghost" onClick={handleNext}
              disabled={currentStep>=solution.length||animating}
              style={{padding:"9px 14px",fontSize:13}}>{tx("next")} →</button>

            {/* Speed */}
            <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:4}}>
              <span style={{fontSize:11,color:"#556"}}>{tx("speed")}:</span>
              {[0.5,1,2].map(s=>(
                <button key={s} onClick={()=>setSpeed(s)} style={{
                  padding:"4px 8px",borderRadius:6,border:"1px solid",
                  fontSize:11,fontWeight:700,cursor:"pointer",
                  background:speed===s?"rgba(196,18,48,0.25)":"transparent",
                  borderColor:speed===s?"rgba(196,18,48,0.6)":"rgba(255,255,255,0.1)",
                  color:speed===s?"#ff9090":"#666"}}>{s}×</button>
              ))}
            </div>

            <button className="btn btn-ghost" onClick={handleReset}
              style={{padding:"9px 14px",fontSize:13}}>✕ {tx("reset")}</button>
          </div>

          {/* AI */}
          {currentStep>0&&(
            <div style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"10px 12px",
              border:"1px solid rgba(255,255,255,0.07)"}}>
              <div style={{fontSize:11,color:"#C41230",fontWeight:700,marginBottom:6,letterSpacing:"0.5px"}}>
                ✦ AI EXPLANATION
              </div>
              {aiLoading
                ?<div style={{color:"#556",fontSize:13,fontStyle:"italic",animation:"pulse 1.5s infinite"}}>Thinking…</div>
                :aiText
                  ?<p style={{color:"#bbb",fontSize:13,lineHeight:1.55,margin:0}}>{aiText}</p>
                  :<button className="btn btn-ghost" onClick={askAI}
                    style={{padding:"6px 14px",fontSize:12}}>
                    🤖 {tx("aiExplain")}
                  </button>}
            </div>
          )}
        </div>)}
      </div>
    </div>
  );
}
