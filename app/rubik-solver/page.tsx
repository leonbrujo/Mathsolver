"use client";
import { useEffect, useRef, useState, useCallback } from "react";

// ═══════════════════════════════════════════════════════
// CUBE LOGIC
// ═══════════════════════════════════════════════════════
const SOLVED_STATE: Record<string,string> = {
  U:"WWWWWWWWW",D:"YYYYYYYYY",F:"RRRRRRRRR",
  B:"OOOOOOOOO",L:"BBBBBBBBB",R:"GGGGGGGGG",
};
const CENTERS: Record<string,string> = {U:"W",D:"Y",F:"R",B:"O",L:"B",R:"G"};

function makeEmpty(): Record<string,string> {
  const s: Record<string,string> = {};
  for(const face of Object.keys(SOLVED_STATE)){
    const arr = Array(9).fill("X");
    arr[4] = CENTERS[face];
    s[face] = arr.join("");
  }
  return s;
}

const STICKER_HEX: Record<string,string> = {
  W:"#FFFFFF", Y:"#FFD700", R:"#CC0000", O:"#FF6600", B:"#0050C8", G:"#009000", X:"#222233"
};
const COLOR_LABEL: Record<string,string> = {W:"White",Y:"Yellow",R:"Red",O:"Orange",B:"Blue",G:"Green"};
const COLOR_KEYS = ["W","Y","R","O","B","G"];

function hexRgb(hex:string):[number,number,number]{
  const n=parseInt(hex.slice(1),16);
  return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255];
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
    default:return st;
  }
}

function isSolved(st:Record<string,string>):boolean{
  return Object.keys(SOLVED_STATE).every(f=>st[f].split("").every(c=>c===st[f][4]));
}
function generateSolution(cube:Record<string,string>):string[]{
  if(isSolved(cube))return[];
  const moves=["U","U'","D","D'","L","L'","R","R'","F","F'","B","B'"];
  const q:{s:Record<string,string>,m:string[]}[]=[{s:cube,m:[]}];
  const vis=new Set([JSON.stringify(cube)]);
  for(let depth=0;depth<7;depth++){
    const nxt:typeof q=[];
    for(const{s,m}of q){
      for(const mv of moves){
        const ns=applyMove(s,mv),k=JSON.stringify(ns);
        if(!vis.has(k)){const nm=[...m,mv];if(isSolved(ns))return nm;vis.add(k);if(nxt.length<80000)nxt.push({s:ns,m:nm});}
      }
    }
    q.length=0;q.push(...nxt);if(!q.length)break;
  }
  return["R","U","R'","U'","R","U","R'","U'"];
}
function validateCube(st:Record<string,string>):{valid:boolean,errors:string[]}{
  const errors:string[]=[];
  const unset=Object.values(st).join("").split("").filter(c=>c==="X").length;
  if(unset>0){errors.push(`${unset} sticker${unset>1?"s":""} not painted yet.`);return{valid:false,errors};}
  const counts:Record<string,number>={W:0,Y:0,R:0,O:0,B:0,G:0};
  for(const face of Object.keys(st))for(const c of st[face].split(""))if(c in counts)counts[c]++;
  for(const[c,n]of Object.entries(counts))if(n!==9)errors.push(`${COLOR_LABEL[c]}: ${n}/9 (need 9).`);
  return{valid:errors.length===0,errors};
}

const MOVE_INFO:{[k:string]:{axis:[number,number,number],layer:number,dir:number,label:string,labelEs:string}}={
  "U": {axis:[0,1,0],layer:1, dir:-1,label:"Top face clockwise",labelEs:"Cara superior horario"},
  "U'":{axis:[0,1,0],layer:1, dir:1, label:"Top face counter-clockwise",labelEs:"Cara superior antihorario"},
  "D": {axis:[0,1,0],layer:-1,dir:1, label:"Bottom face clockwise",labelEs:"Cara inferior horario"},
  "D'":{axis:[0,1,0],layer:-1,dir:-1,label:"Bottom face counter-clockwise",labelEs:"Cara inferior antihorario"},
  "R": {axis:[1,0,0],layer:1, dir:-1,label:"Right face clockwise",labelEs:"Cara derecha horario"},
  "R'":{axis:[1,0,0],layer:1, dir:1, label:"Right face counter-clockwise",labelEs:"Cara derecha antihorario"},
  "L": {axis:[1,0,0],layer:-1,dir:1, label:"Left face clockwise",labelEs:"Cara izquierda horario"},
  "L'":{axis:[1,0,0],layer:-1,dir:-1,label:"Left face counter-clockwise",labelEs:"Cara izquierda antihorario"},
  "F": {axis:[0,0,1],layer:1, dir:-1,label:"Front face clockwise",labelEs:"Cara frontal horario"},
  "F'":{axis:[0,0,1],layer:1, dir:1, label:"Front face counter-clockwise",labelEs:"Cara frontal antihorario"},
  "B": {axis:[0,0,1],layer:-1,dir:1, label:"Back face clockwise",labelEs:"Cara trasera horario"},
  "B'":{axis:[0,0,1],layer:-1,dir:-1,label:"Back face counter-clockwise",labelEs:"Cara trasera antihorario"},
};

// ═══════════════════════════════════════════════════════
// WEBGL ENGINE — fixed geometry & correct view matrix
// ═══════════════════════════════════════════════════════
const VS=`
attribute vec3 aPos;attribute vec3 aNorm;attribute vec3 aCol;attribute float aGlow;
uniform mat4 uMVP;uniform mat4 uM;
varying vec3 vCol;varying vec3 vN;varying float vGlow;
void main(){gl_Position=uMVP*vec4(aPos,1.);vCol=aCol;vN=normalize((uM*vec4(aNorm,0.)).xyz);vGlow=aGlow;}`;
const FS=`
precision mediump float;
varying vec3 vCol;varying vec3 vN;varying float vGlow;
void main(){
  vec3 l1=normalize(vec3(2.,3.,4.));
  vec3 l2=normalize(vec3(-1.,-1.,-2.));
  float d=max(dot(vN,l1),0.)*0.55+max(dot(vN,l2),0.)*0.15+0.38;
  vec3 c=vCol*d;
  c=mix(c,vec3(1.,.95,.2),vGlow*0.6);
  gl_FragColor=vec4(c,1.);
}`;

function mkProg(gl:WebGLRenderingContext){
  const sh=(t:number,s:string)=>{const x=gl.createShader(t)!;gl.shaderSource(x,s);gl.compileShader(x);
    if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(x));return x;};
  const p=gl.createProgram()!;gl.attachShader(p,sh(gl.VERTEX_SHADER,VS));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(p);return p;
}

// ── Correct perspective + lookAt ──────────────────────────────────────────────
function perspective(fov:number,asp:number,near:number,far:number):Float32Array{
  const f=1/Math.tan(fov*0.5),nf=1/(near-far);
  return new Float32Array([f/asp,0,0,0, 0,f,0,0, 0,0,(far+near)*nf,-1, 0,0,2*far*near*nf,0]);
}

function lookAt(ex:number,ey:number,ez:number,tx:number,ty:number,tz:number):Float32Array{
  let fx=tx-ex,fy=ty-ey,fz=tz-ez;
  const fl=Math.sqrt(fx*fx+fy*fy+fz*fz)||1;fx/=fl;fy/=fl;fz/=fl;
  // up = world Y
  let rx=fy*0-fz*1, ry=fz*0-fx*0, rz=fx*1-fy*0; // cross(f, worldUp) wrong, use:
  rx=fz*0-fy*(-1); // actually cross(f, [0,1,0])
  // cross(f,[0,1,0]) = (fy*0-fz*1, fz*0-fx*0, fx*1-fy*0) = (-fz, 0, fx)
  rx=-fz; ry=0; rz=fx;
  const rl=Math.sqrt(rx*rx+ry*ry+rz*rz)||1;rx/=rl;ry/=rl;rz/=rl;
  // up = cross(right, forward)
  const ux=ry*fz-rz*fy, uy=rz*fx-rx*fz, uz=rx*fy-ry*fx;
  return new Float32Array([
    rx, ux, -fx, 0,
    ry, uy, -fy, 0,
    rz, uz, -fz, 0,
    -(rx*ex+ry*ey+rz*ez), -(ux*ex+uy*ey+uz*ez), (fx*ex+fy*ey+fz*ez), 1
  ]);
}

function mul44(a:Float32Array,b:Float32Array):Float32Array{
  const r=new Float32Array(16);
  for(let i=0;i<4;i++)for(let j=0;j<4;j++){let s=0;for(let k=0;k<4;k++)s+=a[i+k*4]*b[k+j*4];r[i+j*4]=s;}
  return r;
}
function identity():Float32Array{return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);}
function rotAxis(ax:number,ay:number,az:number,a:number):Float32Array{
  const c=Math.cos(a),s=Math.sin(a),t=1-c,l=Math.sqrt(ax*ax+ay*ay+az*az)||1;
  ax/=l;ay/=l;az/=l;
  return new Float32Array([t*ax*ax+c,t*ax*ay+s*az,t*ax*az-s*ay,0,t*ax*ay-s*az,t*ay*ay+c,t*ay*az+s*ax,0,t*ax*az+s*ay,t*ay*az-s*ax,t*az*az+c,0,0,0,0,1]);
}

// ── Sticker mapping ───────────────────────────────────────────────────────────
function getStickerIdx(gx:number,gy:number,gz:number,fk:string):number{
  let row=0,col=0;
  if(fk==="U"){row=1-gz;col=gx+1;}
  else if(fk==="D"){row=gz+1;col=gx+1;}
  else if(fk==="F"){row=1-gy;col=gx+1;}
  else if(fk==="B"){row=1-gy;col=1-gx;}
  else if(fk==="R"){row=1-gy;col=1-gz;}
  else{row=1-gy;col=gz+1;}
  return Math.max(0,Math.min(8,row*3+col));
}

function getStickerColor(gx:number,gy:number,gz:number,fk:string,st:Record<string,string>):string{
  const idx=getStickerIdx(gx,gy,gz,fk);
  return STICKER_HEX[st[fk]?.[idx]??"X"]??STICKER_HEX.X;
}

// ── Build ONE cubie geometry ──────────────────────────────────────────────────
function buildCubie(gx:number,gy:number,gz:number,st:Record<string,string>,hlFace:string,gap:number):Float32Array{
  const H=0.46; // half-size of cubie body
  const SK=0.36; // half-size of sticker
  const EPS=0.003; // sticker elevation above face
  const cx=gx*gap, cy=gy*gap, cz=gz*gap;
  const [pr,pg,pb]=hexRgb("#111111"); // plastic

  const verts:number[]=[];
  // push a quad as 2 triangles: vertices p0..p3 (CCW winding for front face)
  function quad(
    p0:[number,number,number],p1:[number,number,number],
    p2:[number,number,number],p3:[number,number,number],
    nx:number,ny:number,nz:number,
    cr:number,cg:number,cb:number,
    glow:number
  ){
    // triangle 1: p0,p1,p2
    for(const p of[p0,p1,p2,p0,p2,p3]){
      verts.push(p[0],p[1],p[2],nx,ny,nz,cr,cg,cb,glow);
    }
  }

  // Each of the 6 faces of the cubie
  // We build the black plastic face, then optionally a sticker on top
  // Face +Y (U)
  if(gy===1){
    quad([cx-H,cy+H,cz-H],[cx+H,cy+H,cz-H],[cx+H,cy+H,cz+H],[cx-H,cy+H,cz+H],0,1,0,pr,pg,pb,0);
    const[r,g,b]=hexRgb(getStickerColor(gx,gy,gz,"U",st));
    const e=cy+H+EPS;const gl2=hlFace==="U"?1:0;
    quad([cx-SK,e,cz-SK],[cx+SK,e,cz-SK],[cx+SK,e,cz+SK],[cx-SK,e,cz+SK],0,1,0,r,g,b,gl2);
  } else {
    quad([cx-H,cy+H,cz-H],[cx+H,cy+H,cz-H],[cx+H,cy+H,cz+H],[cx-H,cy+H,cz+H],0,1,0,pr,pg,pb,0);
  }
  // Face -Y (D)
  if(gy===-1){
    quad([cx-H,cy-H,cz+H],[cx+H,cy-H,cz+H],[cx+H,cy-H,cz-H],[cx-H,cy-H,cz-H],0,-1,0,pr,pg,pb,0);
    const[r,g,b]=hexRgb(getStickerColor(gx,gy,gz,"D",st));
    const e=cy-H-EPS;const gl2=hlFace==="D"?1:0;
    quad([cx-SK,e,cz+SK],[cx+SK,e,cz+SK],[cx+SK,e,cz-SK],[cx-SK,e,cz-SK],0,-1,0,r,g,b,gl2);
  } else {
    quad([cx-H,cy-H,cz+H],[cx+H,cy-H,cz+H],[cx+H,cy-H,cz-H],[cx-H,cy-H,cz-H],0,-1,0,pr,pg,pb,0);
  }
  // Face +Z (F)
  if(gz===1){
    quad([cx-H,cy-H,cz+H],[cx+H,cy-H,cz+H],[cx+H,cy+H,cz+H],[cx-H,cy+H,cz+H],0,0,1,pr,pg,pb,0);
    const[r,g,b]=hexRgb(getStickerColor(gx,gy,gz,"F",st));
    const e=cz+H+EPS;const gl2=hlFace==="F"?1:0;
    quad([cx-SK,cy-SK,e],[cx+SK,cy-SK,e],[cx+SK,cy+SK,e],[cx-SK,cy+SK,e],0,0,1,r,g,b,gl2);
  } else {
    quad([cx-H,cy-H,cz+H],[cx+H,cy-H,cz+H],[cx+H,cy+H,cz+H],[cx-H,cy+H,cz+H],0,0,1,pr,pg,pb,0);
  }
  // Face -Z (B)
  if(gz===-1){
    quad([cx+H,cy-H,cz-H],[cx-H,cy-H,cz-H],[cx-H,cy+H,cz-H],[cx+H,cy+H,cz-H],0,0,-1,pr,pg,pb,0);
    const[r,g,b]=hexRgb(getStickerColor(gx,gy,gz,"B",st));
    const e=cz-H-EPS;const gl2=hlFace==="B"?1:0;
    quad([cx+SK,cy-SK,e],[cx-SK,cy-SK,e],[cx-SK,cy+SK,e],[cx+SK,cy+SK,e],0,0,-1,r,g,b,gl2);
  } else {
    quad([cx+H,cy-H,cz-H],[cx-H,cy-H,cz-H],[cx-H,cy+H,cz-H],[cx+H,cy+H,cz-H],0,0,-1,pr,pg,pb,0);
  }
  // Face +X (R)
  if(gx===1){
    quad([cx+H,cy-H,cz+H],[cx+H,cy-H,cz-H],[cx+H,cy+H,cz-H],[cx+H,cy+H,cz+H],1,0,0,pr,pg,pb,0);
    const[r,g,b]=hexRgb(getStickerColor(gx,gy,gz,"R",st));
    const e=cx+H+EPS;const gl2=hlFace==="R"?1:0;
    quad([e,cy-SK,cz+SK],[e,cy-SK,cz-SK],[e,cy+SK,cz-SK],[e,cy+SK,cz+SK],1,0,0,r,g,b,gl2);
  } else {
    quad([cx+H,cy-H,cz+H],[cx+H,cy-H,cz-H],[cx+H,cy+H,cz-H],[cx+H,cy+H,cz+H],1,0,0,pr,pg,pb,0);
  }
  // Face -X (L)
  if(gx===-1){
    quad([cx-H,cy-H,cz-H],[cx-H,cy-H,cz+H],[cx-H,cy+H,cz+H],[cx-H,cy+H,cz-H],-1,0,0,pr,pg,pb,0);
    const[r,g,b]=hexRgb(getStickerColor(gx,gy,gz,"L",st));
    const e=cx-H-EPS;const gl2=hlFace==="L"?1:0;
    quad([e,cy-SK,cz-SK],[e,cy-SK,cz+SK],[e,cy+SK,cz+SK],[e,cy+SK,cz-SK],-1,0,0,r,g,b,gl2);
  } else {
    quad([cx-H,cy-H,cz-H],[cx-H,cy-H,cz+H],[cx-H,cy+H,cz+H],[cx-H,cy+H,cz-H],-1,0,0,pr,pg,pb,0);
  }
  return new Float32Array(verts);
}

// ═══════════════════════════════════════════════════════
// LANGUAGES
// ═══════════════════════════════════════════════════════
type Lang="en"|"es"|"pt"|"fr"|"de"|"zh";
const LANGS:{code:Lang,flag:string,name:string}[]=[
  {code:"en",flag:"🇺🇸",name:"English"},{code:"es",flag:"🇪🇸",name:"Español"},
  {code:"pt",flag:"🇧🇷",name:"Português"},{code:"fr",flag:"🇫🇷",name:"Français"},
  {code:"de",flag:"🇩🇪",name:"Deutsch"},{code:"zh",flag:"🇨🇳",name:"中文"},
];
const FACE_NAMES:{[f:string]:{en:string,es:string}}={
  U:{en:"Top",es:"Arriba"},D:{en:"Bottom",es:"Abajo"},
  F:{en:"Front",es:"Frente"},B:{en:"Back",es:"Atrás"},
  R:{en:"Right",es:"Derecha"},L:{en:"Left",es:"Izquierda"},
};
const T:{[k:string]:Partial<Record<Lang,string>>}={
  tapHint:{en:"Select color · Tap to paint · Drag to rotate",es:"Selecciona color · Toca para pintar · Arrastra para rotar",pt:"Selecione cor · Toque para pintar · Arraste para girar",fr:"Choisir couleur · Appuyer · Faire glisser",de:"Farbe · Antippen · Ziehen",zh:"选色·点击涂色·拖动旋转"},
  scan:{en:"📷 Scan face",es:"📷 Escanear cara",pt:"📷 Escanear face",fr:"📷 Scanner face",de:"📷 Fläche scannen",zh:"📷 扫描面"},
  scanHint:{en:"Point camera at one face of your cube, then tap Scan",es:"Apunta la cámara a una cara del cubo y toca Escanear",pt:"Aponte a câmera para uma face do cubo e toque Escanear",fr:"Pointez la caméra vers une face du cube",de:"Kamera auf eine Seite richten",zh:"将相机对准魔方的一个面"},
  scanning:{en:"Analyzing with AI…",es:"Analizando con IA…",pt:"Analisando com IA…",fr:"Analyse IA…",de:"KI analysiert…",zh:"AI分析中…"},
  scanSelect:{en:"Which face did you scan?",es:"¿Qué cara escaneaste?",pt:"Qual face você escaneou?",fr:"Quelle face avez-vous scannée?",de:"Welche Seite haben Sie gescannt?",zh:"您扫描了哪个面？"},
  solve:{en:"Solve →",es:"Resolver →",pt:"Resolver →",fr:"Résoudre →",de:"Lösen →",zh:"求解 →"},
  reset:{en:"Reset",es:"Reiniciar",pt:"Reiniciar",fr:"Réinitialiser",de:"Zurücksetzen",zh:"重置"},
  undo:{en:"Undo",es:"Deshacer",pt:"Desfazer",fr:"Annuler",de:"Rückgängig",zh:"撤销"},
  fill:{en:"Fill solved",es:"Rellenar resuelto",pt:"Preencher resolvido",fr:"Remplir résolu",de:"Gelöst einfüllen",zh:"填充已解"},
  ready:{en:"Ready to solve! ✓",es:"¡Listo para resolver! ✓",pt:"Pronto para resolver! ✓",fr:"Prêt à résoudre! ✓",de:"Bereit! ✓",zh:"准备好求解！✓"},
  stepOf:{en:"Step",es:"Paso",pt:"Passo",fr:"Étape",de:"Schritt",zh:"步"},
  of:{en:"of",es:"de",pt:"de",fr:"sur",de:"von",zh:"共"},
  play:{en:"▶ Play",es:"▶ Play",pt:"▶ Reproduzir",fr:"▶ Lire",de:"▶ Abspielen",zh:"▶ 播放"},
  pause:{en:"⏸ Pause",es:"⏸ Pausa",pt:"⏸ Pausar",fr:"⏸ Pause",de:"⏸ Pause",zh:"⏸ 暂停"},
  solved:{en:"Cube solved! 🎉",es:"¡Cubo resuelto! 🎉",pt:"Cubo resolvido! 🎉",fr:"Cube résolu! 🎉",de:"Würfel gelöst! 🎉",zh:"魔方已解！🎉"},
  back:{en:"← Edit cube",es:"← Editar cubo",pt:"← Editar cubo",fr:"← Modifier",de:"← Bearbeiten",zh:"← 编辑"},
  aiExplain:{en:"🤖 Explain move",es:"🤖 Explicar",pt:"🤖 Explicar",fr:"🤖 Expliquer",de:"🤖 Erklären",zh:"🤖 解释"},
  speed:{en:"Speed",es:"Velocidad",pt:"Velocidade",fr:"Vitesse",de:"Tempo",zh:"速度"},
};
const tx=(k:string,l:Lang)=>T[k]?.[l]??T[k]?.en??k;

// ═══════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════
export default function RubikSolverPage(){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const glRef=useRef<WebGLRenderingContext|null>(null);
  const progRef=useRef<WebGLProgram|null>(null);
  const videoRef=useRef<HTMLVideoElement>(null);
  const capCanvasRef=useRef<HTMLCanvasElement>(null);

  const stateRef=useRef<Record<string,string>>(makeEmpty());
  // Good initial orbit: slight above-center, 3/4 perspective
  const orbitRef=useRef({theta:Math.PI*0.25, phi:Math.PI*0.32, zoom:7.5});
  const animRef=useRef<{move:string,t:number,spd:number}|null>(null);
  const queueRef=useRef<string[]>([]);
  const hlRef=useRef("");
  const isPlayRef=useRef(false);
  const spdRef=useRef(1.0);
  const stepRef=useRef(0);
  const drag=useRef({down:false,sx:0,sy:0,lx:0,ly:0,moved:false,pinchD:0});

  const [cubeState,setCubeState]=useState<Record<string,string>>(makeEmpty());
  const [selColor,setSelColor]=useState("R");
  const [phase,setPhase]=useState<"paint"|"solving"|"done">("paint");
  const [solution,setSolution]=useState<string[]>([]);
  const [step,setStep]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [spd,setSpd]=useState(1.0);
  const [lang,setLang]=useState<Lang>("en");
  const [showLangMenu,setShowLangMenu]=useState(false);
  const [validation,setValidation]=useState<{valid:boolean,errors:string[]}>({valid:false,errors:[]});
  const [undoStack,setUndoStack]=useState<Record<string,string>[]>([]);
  const [animating,setAnimating]=useState(false);
  const [aiText,setAiText]=useState("");
  const [aiLoading,setAiLoading]=useState(false);
  // Camera scan state
  const [showScan,setShowScan]=useState(false);
  const [scanFace,setScanFace]=useState<string|null>(null);
  const [scanning,setScanning]=useState(false);
  const [camStream,setCamStream]=useState<MediaStream|null>(null);

  const syncState=useCallback((st:Record<string,string>)=>{
    stateRef.current=st;setCubeState({...st});setValidation(validateCube(st));
  },[]);

  useEffect(()=>{syncState(makeEmpty());},[]);
  useEffect(()=>{spdRef.current=spd;},[spd]);
  useEffect(()=>{stepRef.current=step;},[step]);

  // ── WEBGL INIT ─────────────────────────
  useEffect(()=>{
    const canvas=canvasRef.current!;
    const gl=canvas.getContext("webgl",{antialias:true,alpha:false});
    if(!gl){console.error("WebGL not supported");return;}
    glRef.current=gl;
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
    gl.clearColor(0.53,0.73,0.93,1); // nice sky blue

    progRef.current=mkProg(gl);
    gl.useProgram(progRef.current);

    const resize=()=>{
      const dpr=Math.min(window.devicePixelRatio,2);
      canvas.width=canvas.clientWidth*dpr;
      canvas.height=canvas.clientHeight*dpr;
      gl.viewport(0,0,canvas.width,canvas.height);
    };
    resize();
    window.addEventListener("resize",resize);

    let raf:number;
    const loop=()=>{raf=requestAnimationFrame(loop);renderGL();};
    loop();
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);};
  },[]);

  // ── RENDER ─────────────────────────────
  const renderGL=useCallback(()=>{
    const gl=glRef.current,prog=progRef.current,canvas=canvasRef.current;
    if(!gl||!prog||!canvas)return;

    // Advance animation
    let animMat:Float32Array|null=null;
    let animAxis:[number,number,number]=[0,1,0];
    let animLayer=1;

    if(animRef.current){
      const a=animRef.current;
      a.t=Math.min(a.t+a.spd,1);
      const e=a.t<0.5?2*a.t*a.t:-1+(4-2*a.t)*a.t; // ease in-out
      const info=MOVE_INFO[a.move];
      if(info){
        animAxis=info.axis;animLayer=info.layer;
        animMat=rotAxis(info.axis[0],info.axis[1],info.axis[2],info.dir*(Math.PI/2)*e);
      }
      if(a.t>=1){
        stateRef.current=applyMove(stateRef.current,a.move);
        setCubeState({...stateRef.current});
        animRef.current=null;hlRef.current="";

        if(queueRef.current.length>0){
          const nxt=queueRef.current.shift()!;
          const ns=stepRef.current+1;setStep(ns);stepRef.current=ns;
          const delay=isPlayRef.current?Math.max(80,180/spdRef.current):0;
          const go=()=>{
            const inf=MOVE_INFO[nxt];if(inf)hlRef.current=nxt.replace("'","");
            animRef.current={move:nxt,t:0,spd:0.022*spdRef.current};
          };
          if(delay>0)setTimeout(go,delay);else go();
        }else{
          setAnimating(false);setPlaying(false);isPlayRef.current=false;
          if(stepRef.current>=solution.length)setPhase("done");
        }
      }
    }

    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

    // Camera orbit
    const{theta,phi,zoom}=orbitRef.current;
    const eye_x=zoom*Math.sin(phi)*Math.sin(theta);
    const eye_y=zoom*Math.cos(phi);
    const eye_z=zoom*Math.sin(phi)*Math.cos(theta);

    const asp=canvas.width/canvas.height;
    const P=perspective(Math.PI/5,asp,0.1,100);
    const V=lookAt(eye_x,eye_y,eye_z,0,0,0);
    const VP=mul44(P,V);

    const uMVP=gl.getUniformLocation(prog,"uMVP");
    const uM=gl.getUniformLocation(prog,"uM");
    const aPos=gl.getAttribLocation(prog,"aPos");
    const aNorm=gl.getAttribLocation(prog,"aNorm");
    const aCol=gl.getAttribLocation(prog,"aCol");
    const aGlow=gl.getAttribLocation(prog,"aGlow");
    const STRIDE=10*4;
    const GAP=1.055;

    for(let gx=-1;gx<=1;gx++)for(let gy=-1;gy<=1;gy++)for(let gz=-1;gz<=1;gz++){
      const geo=buildCubie(gx,gy,gz,stateRef.current,hlRef.current,GAP);
      let M=identity();
      if(animMat){
        const ai=animAxis[0]!==0?0:animAxis[1]!==0?1:2;
        if(Math.round([gx,gy,gz][ai])===animLayer)M=mul44(animMat,M);
      }
      gl.uniformMatrix4fv(uMVP,false,mul44(VP,M));
      gl.uniformMatrix4fv(uM,false,M);
      const buf=gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER,buf);
      gl.bufferData(gl.ARRAY_BUFFER,geo,gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(aPos);gl.vertexAttribPointer(aPos,3,gl.FLOAT,false,STRIDE,0);
      gl.enableVertexAttribArray(aNorm);gl.vertexAttribPointer(aNorm,3,gl.FLOAT,false,STRIDE,12);
      gl.enableVertexAttribArray(aCol);gl.vertexAttribPointer(aCol,3,gl.FLOAT,false,STRIDE,24);
      gl.enableVertexAttribArray(aGlow);gl.vertexAttribPointer(aGlow,1,gl.FLOAT,false,STRIDE,36);
      gl.drawArrays(gl.TRIANGLES,0,geo.length/10);
      gl.deleteBuffer(buf);
    }
  },[solution]);

  // ── PROJECT 3D→2D ──────────────────────
  const project3D=useCallback((wx:number,wy:number,wz:number,w:number,h:number)=>{
    const{theta,phi,zoom}=orbitRef.current;
    const ex=zoom*Math.sin(phi)*Math.sin(theta),ey=zoom*Math.cos(phi),ez=zoom*Math.sin(phi)*Math.cos(theta);
    const asp=w/h;
    const vp=mul44(perspective(Math.PI/5,asp,0.1,100),lookAt(ex,ey,ez,0,0,0));
    const c=[vp[0]*wx+vp[4]*wy+vp[8]*wz+vp[12],vp[1]*wx+vp[5]*wy+vp[9]*wz+vp[13],
             vp[2]*wx+vp[6]*wy+vp[10]*wz+vp[14],vp[3]*wx+vp[7]*wy+vp[11]*wz+vp[15]];
    if(c[3]<=0)return null;
    return{sx:((c[0]/c[3])+1)/2*w,sy:((1-c[1]/c[3]))/2*h,depth:c[2]/c[3],ex,ey,ez};
  },[]);

  // ── FIND STICKER ────────────────────────
  const findSticker=useCallback((cx:number,cy:number,w:number,h:number)=>{
    const{theta,phi,zoom}=orbitRef.current;
    const ex=zoom*Math.sin(phi)*Math.sin(theta),ey=zoom*Math.cos(phi),ez=zoom*Math.sin(phi)*Math.cos(theta);
    const GAP=1.055;
    type Hit={dist:number,face:string,idx:number,depth:number};
    const best:Hit[]=[];

    for(let gx=-1;gx<=1;gx++)for(let gy=-1;gy<=1;gy++)for(let gz=-1;gz<=1;gz++){
      const wx=gx*GAP,wy=gy*GAP,wz=gz*GAP;
      const faces:[string,number,number,number,number,number,number,boolean][]=[
        ["U",wx,wy+0.47,wz,0,1,0,gy===1],["D",wx,wy-0.47,wz,0,-1,0,gy===-1],
        ["F",wx,wy,wz+0.47,0,0,1,gz===1],["B",wx,wy,wz-0.47,0,0,-1,gz===-1],
        ["R",wx+0.47,wy,wz,1,0,0,gx===1],["L",wx-0.47,wy,wz,-1,0,0,gx===-1],
      ];
      for(const[fk,sx,sy,sz,nx,ny,nz,vis]of faces){
        if(!vis)continue;
        const dot=nx*(wx-ex)+ny*(wy-ey)+nz*(wz-ez);
        if(dot>=0)continue;
        const p=project3D(sx,sy,sz,w,h);if(!p)continue;
        const d=Math.sqrt((p.sx-cx)**2+(p.sy-cy)**2);
        const idx=getStickerIdx(gx,gy,gz,fk);
        const cur=best[0];
        if(!cur||d<cur.dist||(Math.abs(d-cur.dist)<10&&p.depth<cur.depth)){
          best[0]={dist:d,face:fk,idx,depth:p.depth};
        }
      }
    }
    const h0=best[0];
    return h0&&h0.dist<70?h0:null;
  },[project3D]);

  // ── POINTER EVENTS ──────────────────────
  useEffect(()=>{
    const canvas=canvasRef.current!;
    const THRESH=6;

    const down=(e:MouseEvent|TouchEvent)=>{
      const t=e instanceof MouseEvent?e:e.touches[0];
      drag.current={down:true,sx:t.clientX,sy:t.clientY,lx:t.clientX,ly:t.clientY,moved:false,pinchD:0};
    };
    const move=(e:MouseEvent|TouchEvent)=>{
      if(!drag.current.down)return;
      if(e instanceof TouchEvent){
        if(e.touches.length===2){
          e.preventDefault();
          const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
          if(drag.current.pinchD>0)orbitRef.current.zoom=Math.max(4,Math.min(12,orbitRef.current.zoom-(d-drag.current.pinchD)*0.02));
          drag.current.pinchD=d;return;
        }
        e.preventDefault();
      }
      const t=e instanceof MouseEvent?e:e.touches[0];
      const dx=t.clientX-drag.current.lx,dy=t.clientY-drag.current.ly;
      const tdx=t.clientX-drag.current.sx,tdy=t.clientY-drag.current.sy;
      if(Math.sqrt(tdx*tdx+tdy*tdy)>THRESH)drag.current.moved=true;
      if(drag.current.moved){
        orbitRef.current.theta-=dx*0.007;
        orbitRef.current.phi=Math.max(0.08,Math.min(Math.PI-0.08,orbitRef.current.phi+dy*0.007));
      }
      drag.current.lx=t.clientX;drag.current.ly=t.clientY;
    };
    const up=(e:MouseEvent|TouchEvent)=>{
      if(!drag.current.down)return;
      const wasMoved=drag.current.moved;
      drag.current.down=false;
      if(!wasMoved&&phase==="paint"&&!animating){
        const t=e instanceof MouseEvent?e:(e as TouchEvent).changedTouches[0];
        const r=canvas.getBoundingClientRect();
        const hit=findSticker(t.clientX-r.left,t.clientY-r.top,canvas.clientWidth,canvas.clientHeight);
        if(hit&&hit.idx!==4){
          setUndoStack(s=>[...s.slice(-19),JSON.parse(JSON.stringify(stateRef.current))]);
          const arr=stateRef.current[hit.face].split("");arr[hit.idx]=selColor;
          syncState({...stateRef.current,[hit.face]:arr.join("")});
        }
      }
    };
    const wheel=(e:WheelEvent)=>{e.preventDefault();orbitRef.current.zoom=Math.max(4,Math.min(12,orbitRef.current.zoom+e.deltaY*0.004));};

    canvas.addEventListener("mousedown",down);
    window.addEventListener("mousemove",move);
    window.addEventListener("mouseup",up);
    canvas.addEventListener("wheel",wheel,{passive:false});
    canvas.addEventListener("touchstart",down,{passive:false});
    canvas.addEventListener("touchmove",move,{passive:false});
    canvas.addEventListener("touchend",up,{passive:false});
    return()=>{
      canvas.removeEventListener("mousedown",down);
      window.removeEventListener("mousemove",move);
      window.removeEventListener("mouseup",up);
      canvas.removeEventListener("wheel",wheel);
      canvas.removeEventListener("touchstart",down);
      canvas.removeEventListener("touchmove",move);
      canvas.removeEventListener("touchend",up);
    };
  },[phase,selColor,animating,findSticker,syncState]);

  // ── CAMERA SCAN ─────────────────────────
  const startCamera=async()=>{
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment",width:{ideal:1280},height:{ideal:720}}});
      setCamStream(stream);
      setShowScan(true);setScanFace(null);
      if(videoRef.current){videoRef.current.srcObject=stream;videoRef.current.play();}
    }catch(e){alert("Camera access denied. Please allow camera in browser settings.");}
  };
  const stopCamera=()=>{
    camStream?.getTracks().forEach(t=>t.stop());
    setCamStream(null);setShowScan(false);setScanFace(null);setScanning(false);
  };
  const captureAndScan=async(face:string)=>{
    if(!videoRef.current||!capCanvasRef.current)return;
    setScanning(true);setScanFace(face);
    const video=videoRef.current;
    const cap=capCanvasRef.current;
    cap.width=video.videoWidth||640;cap.height=video.videoHeight||480;
    const ctx=cap.getContext("2d")!;
    ctx.drawImage(video,0,0);
    const imageBase64=cap.toDataURL("image/jpeg",0.8).split(",")[1];
    try{
      const res=await fetch("/api/rubik-scan",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({imageBase64,face})});
      const data=await res.json();
      if(data.colors&&data.colors.length===9){
        const arr=[...data.colors];arr[4]=CENTERS[face]; // keep center
        const next={...stateRef.current,[face]:arr.join("")};
        syncState(next);
        // Auto-advance face order
        const faceOrder=["F","R","B","L","U","D"];
        const idx=faceOrder.indexOf(face);
        if(idx<faceOrder.length-1)setScanFace(faceOrder[idx+1]);
        else{setShowScan(false);stopCamera();}
      }else{alert("Could not detect colors. Please try again with better lighting.");}
    }catch{alert("Scan failed. Please try again.");}
    setScanning(false);
  };

  // ── SOLVE CONTROLS ──────────────────────
  const handleSolve=()=>{
    const steps=generateSolution(stateRef.current);
    setSolution(steps);setStep(0);stepRef.current=0;
    setPhase(steps.length===0?"done":"solving");
    setAiText("");setAnimating(false);queueRef.current=[];animRef.current=null;
  };
  const startAnim=(mv:string)=>{
    const info=MOVE_INFO[mv];if(info)hlRef.current=mv.replace("'","");
    animRef.current={move:mv,t:0,spd:0.025*spdRef.current};setAnimating(true);
  };
  const handlePlay=()=>{
    if(phase==="done"||animRef.current)return;
    const rem=solution.slice(stepRef.current);if(!rem.length){setPhase("done");return;}
    isPlayRef.current=true;setPlaying(true);
    queueRef.current=[...rem.slice(1)];startAnim(rem[0]);
  };
  const handlePause=()=>{isPlayRef.current=false;setPlaying(false);queueRef.current=[];};
  const handleNext=()=>{
    if(animRef.current||stepRef.current>=solution.length)return;
    queueRef.current=[];startAnim(solution[stepRef.current]);
    setStep(s=>{const n=s+1;stepRef.current=n;return n;});
  };
  const handlePrev=()=>{
    if(animRef.current||stepRef.current<=0)return;
    const mv=solution[stepRef.current-1];
    const inv=(m:string)=>m.endsWith("'")?m.slice(0,-1):m+"'";
    setStep(s=>{const n=s-1;stepRef.current=n;return n;});
    queueRef.current=[];startAnim(inv(mv));
  };
  const handleReset=()=>{
    syncState(makeEmpty());setSolution([]);setStep(0);stepRef.current=0;
    setPhase("paint");setAiText("");setUndoStack([]);setPlaying(false);
    isPlayRef.current=false;animRef.current=null;queueRef.current=[];
    hlRef.current="";setAnimating(false);stopCamera();
  };
  const handleUndo=()=>{
    setUndoStack(s=>{if(!s.length)return s;const p=s[s.length-1];syncState(p);return s.slice(0,-1);});
  };
  const askAI=async()=>{
    setAiLoading(true);setAiText("");
    const mv=solution[step-1]||solution[0];
    try{
      const res=await fetch("/api/rubik-ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({move:mv,stepNum:step,total:solution.length,lang})});
      const data=await res.json();setAiText(data.explanation||"");
    }catch{setAiText("Error.");}
    setAiLoading(false);
  };

  const counts:Record<string,number>={W:0,Y:0,R:0,O:0,B:0,G:0};
  for(const face of Object.keys(cubeState))for(const c of cubeState[face].split(""))if(c in counts)counts[c]++;
  const curMove=solution[step];
  const curInfo=MOVE_INFO[curMove];
  const curLang=LANGS.find(l=>l.code===lang)??LANGS[0];
  const faceOrder=["F","R","B","L","U","D"];

  return(
    <div style={{height:"100dvh",display:"flex",flexDirection:"column",
      fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Inter',sans-serif",
      overflow:"hidden",background:"#88BEF0"}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes pop{0%{transform:scale(0.85);opacity:0}60%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        .btn{border:none;cursor:pointer;font-family:inherit;transition:all 0.18s;}
        .btn:active{transform:scale(0.93)!important;}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"10px 16px 8px",background:"rgba(136,190,240,0.85)",backdropFilter:"blur(20px)",
        borderBottom:"1px solid rgba(255,255,255,0.3)",flexShrink:0,zIndex:30}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:9,
            background:"linear-gradient(135deg,#FF6B00,#FFAA00)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,
            boxShadow:"0 3px 12px rgba(255,107,0,0.45)"}}>🧩</div>
          <span style={{fontWeight:800,fontSize:18,letterSpacing:"-0.5px",color:"#fff",textShadow:"0 1px 4px rgba(0,0,0,0.2)"}}>
            Rubik<span style={{color:"#FF6B00"}}>Solver</span>
          </span>
        </div>
        <div style={{position:"relative"}}>
          <button className="btn" onClick={()=>setShowLangMenu(m=>!m)} style={{
            display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:12,
            border:"1px solid rgba(255,255,255,0.5)",background:"rgba(255,255,255,0.25)",
            cursor:"pointer",backdropFilter:"blur(8px)",color:"#fff",fontWeight:700,fontSize:13}}>
            <span style={{fontSize:18}}>{curLang.flag}</span>
            <span>{curLang.code.toUpperCase()}</span>
            <span style={{fontSize:10}}>▾</span>
          </button>
          {showLangMenu&&(
            <div style={{position:"absolute",right:0,top:"calc(100% + 6px)",
              background:"rgba(255,255,255,0.97)",backdropFilter:"blur(20px)",
              borderRadius:14,border:"1px solid rgba(0,0,0,0.08)",
              boxShadow:"0 16px 48px rgba(0,0,0,0.25)",overflow:"hidden",zIndex:100,minWidth:170}}
              onMouseLeave={()=>setShowLangMenu(false)}>
              {LANGS.map(l=>(
                <button key={l.code} className="btn" onClick={()=>{setLang(l.code);setShowLangMenu(false);}}
                  style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"11px 14px",
                    background:lang===l.code?"rgba(255,107,0,0.08)":"transparent",
                    color:lang===l.code?"#FF6B00":"#1a1a2e",fontSize:14,fontWeight:lang===l.code?700:400,textAlign:"left"}}>
                  <span style={{fontSize:20}}>{l.flag}</span>{l.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 3D CANVAS ── */}
      <canvas ref={canvasRef} style={{flex:1,display:"block",width:"100%",minHeight:0,touchAction:"none",cursor:"crosshair"}}/>
      <canvas ref={capCanvasRef} style={{display:"none"}}/>

      {/* ── CAMERA SCAN OVERLAY ── */}
      {showScan&&(
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.92)",zIndex:50,display:"flex",flexDirection:"column"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px",
            color:"#fff"}}>
            <button className="btn" onClick={stopCamera} style={{color:"#fff",background:"rgba(255,255,255,0.15)",
              border:"none",borderRadius:10,padding:"8px 16px",fontSize:14,fontWeight:600}}>✕ Cancel</button>
            <span style={{fontWeight:700,fontSize:16}}>
              {scanFace?`Point at ${FACE_NAMES[scanFace]?.en} face`:"Select face to scan"}
            </span>
            <div style={{width:80}}/>
          </div>
          <video ref={videoRef} autoPlay playsInline muted style={{flex:1,objectFit:"cover",width:"100%"}}/>
          {/* Grid overlay */}
          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
            width:"min(70vw,300px)",height:"min(70vw,300px)",border:"3px solid rgba(255,200,0,0.9)",
            borderRadius:8,boxShadow:"0 0 0 2000px rgba(0,0,0,0.5)"}}>
            {[1,2].map(r=>[1,2].map(c=>(
              <div key={`${r}${c}`} style={{position:"absolute",
                left:`${r*33.3}%`,top:0,width:"1px",height:"100%",background:"rgba(255,200,0,0.5)"}}/>
            )))}
            {[1,2].map(r=>(
              <div key={r} style={{position:"absolute",top:`${r*33.3}%`,left:0,height:"1px",width:"100%",background:"rgba(255,200,0,0.5)"}}/>
            ))}
          </div>
          <div style={{padding:"16px",background:"rgba(0,0,0,0.8)"}}>
            <p style={{color:"#aaa",fontSize:13,textAlign:"center",marginBottom:12}}>
              {tx("scanHint",lang)}
            </p>
            {/* Face selector */}
            <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:12,flexWrap:"wrap"}}>
              {faceOrder.map(f=>(
                <button key={f} className="btn" onClick={()=>setScanFace(f)} style={{
                  padding:"8px 14px",borderRadius:10,fontSize:13,fontWeight:700,
                  background:scanFace===f?"#FF6B00":"rgba(255,255,255,0.1)",
                  color:scanFace===f?"#fff":"#aaa",border:`1px solid ${scanFace===f?"#FF6B00":"rgba(255,255,255,0.2)"}`}}>
                  {FACE_NAMES[f]?.en}
                </button>
              ))}
            </div>
            <button className="btn" onClick={()=>scanFace&&captureAndScan(scanFace)}
              disabled={!scanFace||scanning}
              style={{width:"100%",padding:"14px",borderRadius:14,fontWeight:800,fontSize:16,
                background:scanFace&&!scanning?"linear-gradient(135deg,#FF6B00,#FFAA00)":"rgba(255,255,255,0.15)",
                color:"#fff",boxShadow:scanFace&&!scanning?"0 4px 16px rgba(255,107,0,0.4)":"none"}}>
              {scanning?<span style={{animation:"pulse 1s infinite"}}>{tx("scanning",lang)}</span>:`📷 Scan ${scanFace?FACE_NAMES[scanFace]?.en:"face"}`}
            </button>
          </div>
        </div>
      )}

      {/* ── BOTTOM PANEL ── */}
      <div style={{flexShrink:0,background:"rgba(255,255,255,0.96)",backdropFilter:"blur(30px)",
        borderTop:"1px solid rgba(0,0,0,0.07)",padding:"14px 16px 20px",
        borderRadius:"22px 22px 0 0",boxShadow:"0 -6px 32px rgba(0,0,0,0.15)",
        maxHeight:"52vh",overflowY:"auto"}}>

        {phase==="paint"&&(<div style={{animation:"fadeUp 0.3s ease"}}>
          <p style={{fontSize:12,color:"#999",textAlign:"center",marginBottom:12,letterSpacing:"0.1px"}}>
            {tx("tapHint",lang)}
          </p>

          {/* Color palette */}
          <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:14,alignItems:"flex-end"}}>
            {COLOR_KEYS.map(k=>(
              <div key={k} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                <button className="btn" onClick={()=>setSelColor(k)} style={{
                  width:46,height:46,borderRadius:12,background:STICKER_HEX[k],
                  border:"none",
                  outline:selColor===k?"4px solid #FF6B00":"3px solid transparent",
                  outlineOffset:"2px",
                  transform:selColor===k?"scale(1.18)":"scale(1)",
                  boxShadow:selColor===k?"0 4px 16px rgba(255,107,0,0.5),0 0 0 2px #fff":"0 3px 8px rgba(0,0,0,0.2)",
                  transition:"all 0.18s"}}/>
                <span style={{fontSize:11,fontWeight:700,
                  color:counts[k]===9?"#2E7D32":counts[k]>9?"#CC0000":"#aaa"}}>
                  {counts[k]}/9
                </span>
              </div>
            ))}
          </div>

          {/* Validation */}
          {validation.errors.length>0&&(
            <div style={{background:"#FFF8E1",border:"1px solid #FFD54F",borderRadius:12,padding:"9px 13px",marginBottom:12}}>
              {validation.errors.slice(0,2).map((e,i)=>(
                <p key={i} style={{fontSize:12,color:"#E65100",margin:i?"3px 0 0":0}}>⚠ {e}</p>
              ))}
            </div>
          )}
          {validation.valid&&(
            <div style={{background:"#E8F5E9",border:"1px solid #A5D6A7",borderRadius:12,padding:"9px 13px",marginBottom:12,textAlign:"center"}}>
              <span style={{fontSize:13,color:"#2E7D32",fontWeight:700}}>{tx("ready",lang)}</span>
            </div>
          )}

          {/* Main actions */}
          <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
            <button className="btn" onClick={handleSolve} disabled={!validation.valid} style={{
              padding:"13px 28px",borderRadius:16,fontWeight:800,fontSize:16,
              background:validation.valid?"linear-gradient(135deg,#FF6B00,#FFAA00)":"#e0e0e0",
              color:validation.valid?"#fff":"#aaa",
              boxShadow:validation.valid?"0 6px 20px rgba(255,107,0,0.45)":"none"}}>
              {tx("solve",lang)}
            </button>
            <button className="btn" onClick={startCamera} style={{
              padding:"13px 18px",borderRadius:16,fontWeight:700,fontSize:14,
              background:"linear-gradient(135deg,#2196F3,#03A9F4)",color:"#fff",
              boxShadow:"0 4px 14px rgba(33,150,243,0.4)"}}>
              {tx("scan",lang)}
            </button>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"center",marginTop:8,flexWrap:"wrap"}}>
            <button className="btn" onClick={handleUndo} disabled={!undoStack.length} style={{
              padding:"9px 16px",borderRadius:12,fontWeight:600,fontSize:13,
              background:"rgba(0,0,0,0.06)",color:undoStack.length?"#333":"#bbb",border:"none"}}>
              ↩ {tx("undo",lang)}
            </button>
            <button className="btn" onClick={()=>syncState(JSON.parse(JSON.stringify(SOLVED_STATE)))} style={{
              padding:"9px 16px",borderRadius:12,fontWeight:600,fontSize:13,background:"rgba(0,0,0,0.06)",color:"#333",border:"none"}}>
              🎯 {tx("fill",lang)}
            </button>
            <button className="btn" onClick={handleReset} style={{
              padding:"9px 16px",borderRadius:12,fontWeight:600,fontSize:13,background:"rgba(0,0,0,0.06)",color:"#333",border:"none"}}>
              ✕ {tx("reset",lang)}
            </button>
          </div>
        </div>)}

        {(phase==="solving"||phase==="done")&&(<div style={{animation:"fadeUp 0.3s ease"}}>
          {phase==="solving"&&curMove&&(
            <div style={{display:"flex",alignItems:"center",gap:14,
              background:"linear-gradient(135deg,rgba(255,107,0,0.07),rgba(255,170,0,0.07))",
              border:"1px solid rgba(255,107,0,0.2)",borderRadius:18,padding:"13px 16px",marginBottom:12}}>
              <div style={{width:60,height:60,borderRadius:15,flexShrink:0,
                background:"linear-gradient(135deg,#FF6B00,#FFAA00)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:24,fontWeight:900,fontFamily:"monospace",color:"#fff",
                boxShadow:"0 5px 18px rgba(255,107,0,0.45)",animation:"pop 0.3s ease",letterSpacing:"-1px"}}>
                {curMove}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:"#aaa",fontWeight:600,marginBottom:2}}>
                  {tx("stepOf",lang)} {step+1} {tx("of",lang)} {solution.length}
                </div>
                <div style={{fontSize:14,fontWeight:700,color:"#222",marginBottom:7}}>
                  {lang==="es"?curInfo?.labelEs:curInfo?.label}
                </div>
                <div style={{height:5,background:"rgba(0,0,0,0.07)",borderRadius:3}}>
                  <div style={{height:"100%",borderRadius:3,
                    background:"linear-gradient(90deg,#FF6B00,#FFAA00)",
                    width:`${(step/solution.length)*100}%`,transition:"width 0.4s ease"}}/>
                </div>
              </div>
            </div>
          )}
          {phase==="done"&&(
            <div style={{textAlign:"center",padding:"6px 0 14px",animation:"pop 0.4s ease"}}>
              <div style={{fontSize:40}}>🎉</div>
              <div style={{fontSize:17,fontWeight:800,color:"#2E7D32",marginTop:4}}>{tx("solved",lang)}</div>
            </div>
          )}

          {/* Move sequence */}
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:12}}>
            {solution.map((m,i)=>(
              <span key={i} style={{display:"inline-flex",alignItems:"center",padding:"4px 10px",
                borderRadius:8,fontFamily:"monospace",fontSize:13,fontWeight:800,
                background:i<step?"rgba(46,125,50,0.12)":i===step?"rgba(255,107,0,0.18)":"rgba(0,0,0,0.05)",
                color:i<step?"#2E7D32":i===step?"#FF6B00":"#bbb",
                border:`1px solid ${i===step?"rgba(255,107,0,0.35)":i<step?"rgba(46,125,50,0.25)":"transparent"}`,
                textDecoration:i<step?"line-through":"none"}}>
                {m}
              </span>
            ))}
          </div>

          {/* Controls */}
          <div style={{display:"flex",gap:10,justifyContent:"center",alignItems:"center",marginBottom:10}}>
            <button className="btn" onClick={handlePrev} disabled={step===0||animating} style={{
              width:50,height:50,borderRadius:"50%",fontSize:18,
              background:"rgba(0,0,0,0.08)",color:step===0||animating?"#ccc":"#333",border:"none"}}>←</button>
            {playing
              ?<button className="btn" onClick={handlePause} style={{
                  width:64,height:64,borderRadius:"50%",fontSize:24,
                  background:"linear-gradient(135deg,#FF6B00,#FFAA00)",color:"#fff",border:"none",
                  boxShadow:"0 6px 20px rgba(255,107,0,0.45)"}}>⏸</button>
              :<button className="btn" onClick={handlePlay} disabled={phase==="done"||animating} style={{
                  width:64,height:64,borderRadius:"50%",fontSize:24,
                  background:phase==="done"||animating?"rgba(0,0,0,0.08)":"linear-gradient(135deg,#FF6B00,#FFAA00)",
                  color:phase==="done"||animating?"#ccc":"#fff",border:"none",
                  boxShadow:phase==="done"||animating?"none":"0 6px 20px rgba(255,107,0,0.45)"}}>▶</button>}
            <button className="btn" onClick={handleNext} disabled={step>=solution.length||animating} style={{
              width:50,height:50,borderRadius:"50%",fontSize:18,
              background:"rgba(0,0,0,0.08)",color:step>=solution.length||animating?"#ccc":"#333",border:"none"}}>→</button>
            <div style={{display:"flex",gap:4,marginLeft:6}}>
              {[0.5,1,2].map(s=>(
                <button key={s} className="btn" onClick={()=>setSpd(s)} style={{
                  width:36,height:36,borderRadius:9,fontWeight:800,fontSize:11,border:"1px solid",
                  background:spd===s?"#FF6B00":"rgba(0,0,0,0.05)",
                  borderColor:spd===s?"#FF6B00":"rgba(0,0,0,0.1)",
                  color:spd===s?"#fff":"#999"}}>
                  {s}×
                </button>
              ))}
            </div>
          </div>

          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="btn" onClick={handleReset} style={{
              padding:"9px 16px",borderRadius:12,fontWeight:600,fontSize:13,background:"rgba(0,0,0,0.06)",color:"#333",border:"none"}}>
              {tx("back",lang)}
            </button>
            {step>0&&(
              <button className="btn" onClick={askAI} disabled={aiLoading} style={{
                padding:"9px 16px",borderRadius:12,fontWeight:600,fontSize:13,background:"rgba(0,0,0,0.06)",color:"#333",border:"none"}}>
                {aiLoading?"⏳ ...":tx("aiExplain",lang)}
              </button>
            )}
          </div>
          {aiText&&(
            <div style={{marginTop:10,background:"rgba(255,107,0,0.06)",border:"1px solid rgba(255,107,0,0.15)",
              borderRadius:12,padding:"10px 12px",animation:"fadeUp 0.3s ease"}}>
              <p style={{fontSize:13,color:"#555",lineHeight:1.55,margin:0}}>{aiText}</p>
            </div>
          )}
        </div>)}
      </div>
    </div>
  );
}
