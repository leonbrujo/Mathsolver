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

// Vivid, saturated sticker colors — like a real Rubik's cube
const STICKER_HEX: Record<string,string> = {
  W:"#FFFFFF", Y:"#FFD700", R:"#CC0000", O:"#FF6600", B:"#0050C8", G:"#009000", X:"#2a2a3a"
};
const COLOR_LABEL: Record<string,string> = {W:"White",Y:"Yellow",R:"Red",O:"Orange",B:"Blue",G:"Green"};
const COLOR_KEYS = ["W","Y","R","O","B","G"];
const CUBIE_COLOR = "#111111"; // near-black plastic

function hexRgb(hex:string):[number,number,number]{
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
  for(const[c,n]of Object.entries(counts))if(n!==9)errors.push(`${COLOR_LABEL[c]}: ${n}/9 stickers.`);
  return{valid:errors.length===0,errors};
}

const MOVE_INFO:{[k:string]:{axis:[number,number,number],layer:number,dir:number,label:string,labelEs:string}}={
  "U": {axis:[0,1,0],layer:1, dir:-1,label:"Top face — clockwise",labelEs:"Cara superior — horario"},
  "U'":{axis:[0,1,0],layer:1, dir:1, label:"Top face — counter-clockwise",labelEs:"Cara superior — antihorario"},
  "D": {axis:[0,1,0],layer:-1,dir:1, label:"Bottom face — clockwise",labelEs:"Cara inferior — horario"},
  "D'":{axis:[0,1,0],layer:-1,dir:-1,label:"Bottom face — counter-clockwise",labelEs:"Cara inferior — antihorario"},
  "R": {axis:[1,0,0],layer:1, dir:-1,label:"Right face — clockwise",labelEs:"Cara derecha — horario"},
  "R'":{axis:[1,0,0],layer:1, dir:1, label:"Right face — counter-clockwise",labelEs:"Cara derecha — antihorario"},
  "L": {axis:[1,0,0],layer:-1,dir:1, label:"Left face — clockwise",labelEs:"Cara izquierda — horario"},
  "L'":{axis:[1,0,0],layer:-1,dir:-1,label:"Left face — counter-clockwise",labelEs:"Cara izquierda — antihorario"},
  "F": {axis:[0,0,1],layer:1, dir:-1,label:"Front face — clockwise",labelEs:"Cara frontal — horario"},
  "F'":{axis:[0,0,1],layer:1, dir:1, label:"Front face — counter-clockwise",labelEs:"Cara frontal — antihorario"},
  "B": {axis:[0,0,1],layer:-1,dir:1, label:"Back face — clockwise",labelEs:"Cara trasera — horario"},
  "B'":{axis:[0,0,1],layer:-1,dir:-1,label:"Back face — counter-clockwise",labelEs:"Cara trasera — antihorario"},
};

// ═══════════════════════════════════════════════════════
// WEBGL ENGINE
// ═══════════════════════════════════════════════════════
const VS=`
attribute vec3 aPos;attribute vec3 aNorm;attribute vec3 aColor;attribute float aGlow;
uniform mat4 uMVP;uniform mat4 uModel;
varying vec3 vColor;varying vec3 vNorm;varying float vGlow;
void main(){gl_Position=uMVP*vec4(aPos,1.);vColor=aColor;vNorm=normalize((uModel*vec4(aNorm,0.)).xyz);vGlow=aGlow;}`;

const FS=`
precision mediump float;
varying vec3 vColor;varying vec3 vNorm;varying float vGlow;
void main(){
  vec3 l1=normalize(vec3(1.5,2.5,3.));
  vec3 l2=normalize(vec3(-1.,-1.,-1.5));
  float d1=max(dot(vNorm,l1),0.);
  float d2=max(dot(vNorm,l2),0.)*0.25;
  float amb=0.42;
  vec3 col=vColor*(amb+d1*0.52+d2);
  // highlight layer glow
  col=mix(col,vec3(1.,.92,.3),vGlow*0.55);
  gl_FragColor=vec4(col,1.);
}`;

function mkProg(gl:WebGLRenderingContext,vs:string,fs:string):WebGLProgram{
  const sh=(t:number,s:string)=>{const x=gl.createShader(t)!;gl.shaderSource(x,s);gl.compileShader(x);return x;};
  const p=gl.createProgram()!;gl.attachShader(p,sh(gl.VERTEX_SHADER,vs));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);return p;
}

const I4=():Float32Array=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
function m4mul(a:Float32Array,b:Float32Array):Float32Array{
  const r=new Float32Array(16);
  for(let i=0;i<4;i++)for(let j=0;j<4;j++){let s=0;for(let k=0;k<4;k++)s+=a[i+k*4]*b[k+j*4];r[i+j*4]=s;}
  return r;
}
function m4persp(fov:number,asp:number,n:number,f:number):Float32Array{
  const t=1/Math.tan(fov/2),nf=1/(n-f);
  return new Float32Array([t/asp,0,0,0,0,t,0,0,0,0,(f+n)*nf,-1,0,0,2*f*n*nf,0]);
}
function m4rotAxis(ax:number,ay:number,az:number,a:number):Float32Array{
  const c=Math.cos(a),s=Math.sin(a),t=1-c,l=Math.sqrt(ax*ax+ay*ay+az*az)||1;
  ax/=l;ay/=l;az/=l;
  return new Float32Array([t*ax*ax+c,t*ax*ay+s*az,t*ax*az-s*ay,0,t*ax*ay-s*az,t*ay*ay+c,t*ay*az+s*ax,0,t*ax*az+s*ay,t*ay*az-s*ax,t*az*az+c,0,0,0,0,1]);
}
function mkView(cx:number,cy:number,cz:number):Float32Array{
  const d=Math.sqrt(cx*cx+cy*cy+cz*cz)||1;
  const fx=-cx/d,fy=-cy/d,fz=-cz/d;
  const rl=Math.sqrt(fz*fz+fx*fx)||1;
  const rx=fz/rl,rz=-fx/rl;
  const ux=fy*rz,uy=fz*rx-fx*rz,uz=-fy*rx;
  return new Float32Array([rx,ux,-fx,0,0,uy,-fy,0,rz,uz,-fz,0,-(rx*cx+0*cy+rz*cz),-(ux*cx+uy*cy+uz*cz),(fx*cx+fy*cy+fz*cz),1]);
}

function getStickerInfo(gx:number,gy:number,gz:number,fk:string):{face:string,idx:number}{
  let row=0,col=0;
  if(fk==="U"){row=1-gz;col=gx+1;}
  else if(fk==="D"){row=gz+1;col=gx+1;}
  else if(fk==="F"){row=1-gy;col=gx+1;}
  else if(fk==="B"){row=1-gy;col=1-gx;}
  else if(fk==="R"){row=1-gy;col=1-gz;}
  else{row=1-gy;col=gz+1;}
  return{face:fk,idx:Math.max(0,Math.min(8,row*3+col))};
}

function getCubieColors(gx:number,gy:number,gz:number,st:Record<string,string>):Record<string,string>{
  const c:Record<string,string>={};
  const pairs:[boolean,string][]=[
    [gy===1,"U"],[gy===-1,"D"],[gz===1,"F"],[gz===-1,"B"],[gx===1,"R"],[gx===-1,"L"]
  ];
  for(const[vis,fk]of pairs){
    if(vis){const{idx}=getStickerInfo(gx,gy,gz,fk);c[fk]=STICKER_HEX[st[fk]?.[idx]??"X"]??STICKER_HEX.X;}
  }
  return c;
}

function buildGeo(gx:number,gy:number,gz:number,faceColors:Record<string,string>,hlFace:string,gap:number):Float32Array{
  const S=0.46,ST=0.35,OFF=0.002;
  const cx=gx*gap,cy=gy*gap,cz=gz*gap;
  const [br,bg,bb]=hexRgb(CUBIE_COLOR);
  const verts:number[]=[];

  function quad(ps:[number,number,number][],n:[number,number,number],col:[number,number,number],glow:number){
    const tris=[[0,1,2],[0,2,3]];
    for(const tri of tris)for(const i of tri)verts.push(...ps[i],...n,...col,glow);
  }

  const FACES=[
    {fk:"U",n:[0,1,0] as[number,number,number],vis:gy===1,
     body:[[-S,S,-S],[S,S,-S],[S,S,S],[-S,S,S]] as[number,number,number][],
     stk:[[-ST,S+OFF,-ST],[ST,S+OFF,-ST],[ST,S+OFF,ST],[-ST,S+OFF,ST]] as[number,number,number][]},
    {fk:"D",n:[0,-1,0] as[number,number,number],vis:gy===-1,
     body:[[-S,-S,S],[S,-S,S],[S,-S,-S],[-S,-S,-S]] as[number,number,number][],
     stk:[[-ST,-S-OFF,ST],[ST,-S-OFF,ST],[ST,-S-OFF,-ST],[-ST,-S-OFF,-ST]] as[number,number,number][]},
    {fk:"F",n:[0,0,1] as[number,number,number],vis:gz===1,
     body:[[-S,-S,S],[S,-S,S],[S,S,S],[-S,S,S]] as[number,number,number][],
     stk:[[-ST,-ST,S+OFF],[ST,-ST,S+OFF],[ST,ST,S+OFF],[-ST,ST,S+OFF]] as[number,number,number][]},
    {fk:"B",n:[0,0,-1] as[number,number,number],vis:gz===-1,
     body:[[S,-S,-S],[-S,-S,-S],[-S,S,-S],[S,S,-S]] as[number,number,number][],
     stk:[[ST,-ST,-S-OFF],[-ST,-ST,-S-OFF],[-ST,ST,-S-OFF],[ST,ST,-S-OFF]] as[number,number,number][]},
    {fk:"R",n:[1,0,0] as[number,number,number],vis:gx===1,
     body:[[S,-S,S],[S,-S,-S],[S,S,-S],[S,S,S]] as[number,number,number][],
     stk:[[S+OFF,-ST,ST],[S+OFF,-ST,-ST],[S+OFF,ST,-ST],[S+OFF,ST,ST]] as[number,number,number][]},
    {fk:"L",n:[-1,0,0] as[number,number,number],vis:gx===-1,
     body:[[-S,-S,-S],[-S,-S,S],[-S,S,S],[-S,S,-S]] as[number,number,number][],
     stk:[[-S-OFF,-ST,-ST],[-S-OFF,-ST,ST],[-S-OFF,ST,ST],[-S-OFF,ST,-ST]] as[number,number,number][]},
  ];

  for(const face of FACES){
    const body=face.body.map(([x,y,z])=>[cx+x,cy+y,cz+z] as[number,number,number]);
    quad(body,face.n,[br,bg,bb],0);
    if(face.vis && faceColors[face.fk]){
      const rgb=hexRgb(faceColors[face.fk]);
      const stk=face.stk.map(([x,y,z])=>[cx+x,cy+y,cz+z] as[number,number,number]);
      const glow=hlFace===face.fk?1:0;
      quad(stk,face.n,rgb,glow);
    }
  }
  return new Float32Array(verts);
}

// ═══════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════
type Lang="en"|"es"|"pt"|"fr"|"de"|"zh";
const LANGS:{code:Lang,flag:string,name:string}[]=[
  {code:"en",flag:"🇺🇸",name:"English"},
  {code:"es",flag:"🇪🇸",name:"Español"},
  {code:"pt",flag:"🇧🇷",name:"Português"},
  {code:"fr",flag:"🇫🇷",name:"Français"},
  {code:"de",flag:"🇩🇪",name:"Deutsch"},
  {code:"zh",flag:"🇨🇳",name:"中文"},
];

const T:{[k:string]:{[l in Lang]:string}}={
  tagline:{en:"Scan, paint & solve your Rubik's Cube",es:"Fotografía, pinta y resuelve tu Cubo Rubik",pt:"Fotografe, pinte e resolva seu Cubo Rubik",fr:"Photographiez, peignez et résolvez votre Rubik's Cube",de:"Fotografieren, malen und Ihren Rubik's Cube lösen",zh:"拍照、涂色并求解您的魔方"},
  tapToPaint:{en:"Select a color · Tap stickers to paint · Drag to rotate",es:"Selecciona un color · Toca stickers para pintar · Arrastra para rotar",pt:"Selecione uma cor · Toque nos adesivos para pintar · Arraste para girar",fr:"Sélectionnez une couleur · Appuyez sur les autocollants · Faites glisser pour faire pivoter",de:"Farbe wählen · Sticker antippen · Ziehen zum Drehen",zh:"选择颜色 · 点击贴纸上色 · 拖动旋转"},
  solve:{en:"Solve",es:"Resolver",pt:"Resolver",fr:"Résoudre",de:"Lösen",zh:"求解"},
  reset:{en:"Reset",es:"Reiniciar",pt:"Reiniciar",fr:"Réinitialiser",de:"Zurücksetzen",zh:"重置"},
  undo:{en:"Undo",es:"Deshacer",pt:"Desfazer",fr:"Annuler",de:"Rückgängig",zh:"撤销"},
  fillSolved:{en:"Auto-fill (solved)",es:"Rellenar (resuelto)",pt:"Preencher (resolvido)",fr:"Remplir (résolu)",de:"Auto-ausfüllen",zh:"自动填充"},
  ready:{en:"Ready to solve!",es:"¡Listo para resolver!",pt:"Pronto para resolver!",fr:"Prêt à résoudre!",de:"Bereit zum Lösen!",zh:"准备好求解！"},
  stepOf:{en:"Step",es:"Paso",pt:"Passo",fr:"Étape",de:"Schritt",zh:"步骤"},
  of:{en:"of",es:"de",pt:"de",fr:"sur",de:"von",zh:"共"},
  prev:{en:"Previous",es:"Anterior",pt:"Anterior",fr:"Précédent",de:"Zurück",zh:"上一步"},
  next:{en:"Next",es:"Siguiente",pt:"Próximo",fr:"Suivant",de:"Weiter",zh:"下一步"},
  play:{en:"Play",es:"Play",pt:"Reproduzir",fr:"Lire",de:"Abspielen",zh:"播放"},
  pause:{en:"Pause",es:"Pausa",pt:"Pausar",fr:"Pause",de:"Pause",zh:"暂停"},
  speed:{en:"Speed",es:"Velocidad",pt:"Velocidade",fr:"Vitesse",de:"Geschwindigkeit",zh:"速度"},
  solved:{en:"Cube solved! 🎉",es:"¡Cubo resuelto! 🎉",pt:"Cubo resolvido! 🎉",fr:"Cube résolu! 🎉",de:"Würfel gelöst! 🎉",zh:"魔方已解! 🎉"},
  aiExplain:{en:"Explain with AI",es:"Explicar con IA",pt:"Explicar com IA",fr:"Expliquer avec IA",de:"Mit KI erklären",zh:"用AI解释"},
  back:{en:"← Back to edit",es:"← Volver a editar",pt:"← Voltar para editar",fr:"← Retour à l'édition",de:"← Zurück zur Bearbeitung",zh:"← 返回编辑"},
};
const tx=(k:string,l:Lang)=>T[k]?.[l]??T[k]?.en??k;

export default function RubikSolverPage(){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const glRef=useRef<WebGLRenderingContext|null>(null);
  const progRef=useRef<WebGLProgram|null>(null);

  const stateRef=useRef<Record<string,string>>(makeEmpty());
  const orbitRef=useRef({theta:0.6,phi:0.38,zoom:7.2});
  const animRef=useRef<{move:string,t:number,spd:number}|null>(null);
  const queueRef=useRef<string[]>([]);
  const hlFaceRef=useRef("");
  const isPlayingRef=useRef(false);
  const speedRef=useRef(1.0);
  const pointerRef=useRef({down:false,sx:0,sy:0,lx:0,ly:0,moved:false});

  const [cubeState,setCubeState]=useState<Record<string,string>>(makeEmpty());
  const [selColor,setSelColor]=useState("R");
  const [phase,setPhase]=useState<"paint"|"solving"|"done">("paint");
  const [solution,setSolution]=useState<string[]>([]);
  const [step,setStep]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [speed,setSpeed]=useState(1.0);
  const [lang,setLang]=useState<Lang>("en");
  const [showLangMenu,setShowLangMenu]=useState(false);
  const [validation,setValidation]=useState<{valid:boolean,errors:string[]}>({valid:false,errors:[]});
  const [undoStack,setUndoStack]=useState<Record<string,string>[]>([]);
  const [animating,setAnimating]=useState(false);
  const [aiText,setAiText]=useState("");
  const [aiLoading,setAiLoading]=useState(false);
  const stepRef=useRef(0);

  const syncState=useCallback((st:Record<string,string>)=>{
    stateRef.current=st;setCubeState({...st});setValidation(validateCube(st));
  },[]);

  useEffect(()=>{syncState(makeEmpty());},[]);
  useEffect(()=>{speedRef.current=speed;},[speed]);
  useEffect(()=>{stepRef.current=step;},[step]);

  // ── WEBGL INIT ─────────────────────────
  useEffect(()=>{
    const canvas=canvasRef.current!;
    const gl=canvas.getContext("webgl",{antialias:true,alpha:false});
    if(!gl)return;
    glRef.current=gl;
    gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);
    // Sky-blue-ish background like the reference app
    gl.clearColor(0.56,0.75,0.95,1);
    progRef.current=mkProg(gl,VS,FS);
    gl.useProgram(progRef.current);

    const resize=()=>{
      const dpr=Math.min(window.devicePixelRatio,2);
      canvas.width=canvas.clientWidth*dpr;canvas.height=canvas.clientHeight*dpr;
      gl.viewport(0,0,canvas.width,canvas.height);
    };
    resize();window.addEventListener("resize",resize);

    let raf:number;
    const loop=()=>{raf=requestAnimationFrame(loop);draw();};
    loop();
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);};
  },[]);

  // ── DRAW ────────────────────────────────
  const draw=useCallback(()=>{
    const gl=glRef.current,prog=progRef.current,canvas=canvasRef.current;
    if(!gl||!prog||!canvas)return;

    let mrMat:Float32Array|null=null;
    let mrAxis:[number,number,number]=[0,1,0];
    let mrLayer=1;

    if(animRef.current){
      const a=animRef.current;
      a.t=Math.min(a.t+a.spd,1);
      const e=a.t<0.5?2*a.t*a.t:-1+(4-2*a.t)*a.t;
      const info=MOVE_INFO[a.move];
      if(info){mrAxis=info.axis;mrLayer=info.layer;mrMat=m4rotAxis(info.axis[0],info.axis[1],info.axis[2],info.dir*(Math.PI/2)*e);}
      if(a.t>=1){
        stateRef.current=applyMove(stateRef.current,a.move);
        setCubeState({...stateRef.current});
        animRef.current=null;hlFaceRef.current="";

        if(queueRef.current.length>0){
          const nxt=queueRef.current.shift()!;
          const newStep=stepRef.current+1;
          setStep(newStep);stepRef.current=newStep;
          const delay=isPlayingRef.current?Math.max(60,160/speedRef.current):0;
          const doNext=()=>{
            if(!isPlayingRef.current&&queueRef.current.length>0)return;
            const i2=MOVE_INFO[nxt];if(i2)hlFaceRef.current=nxt.replace("'","");
            animRef.current={move:nxt,t:0,spd:0.02*speedRef.current};
          };
          if(delay>0)setTimeout(doNext,delay);else doNext();
        }else{
          setAnimating(false);setPlaying(false);isPlayingRef.current=false;
          if(stepRef.current>=solution.length)setPhase("done");
        }
      }
    }

    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    const{theta,phi,zoom}=orbitRef.current;
    const camX=zoom*Math.sin(phi)*Math.sin(theta);
    const camY=zoom*Math.cos(phi);
    const camZ=zoom*Math.sin(phi)*Math.cos(theta);
    const asp=canvas.width/canvas.height;
    const vp=m4mul(m4persp(Math.PI/5,asp,0.1,100),mkView(camX,camY,camZ));

    const uMVP=gl.getUniformLocation(prog,"uMVP");
    const uModel=gl.getUniformLocation(prog,"uModel");
    const aPos=gl.getAttribLocation(prog,"aPos");
    const aNorm=gl.getAttribLocation(prog,"aNorm");
    const aColor=gl.getAttribLocation(prog,"aColor");
    const aGlow=gl.getAttribLocation(prog,"aGlow");
    const STRIDE=10*4,GAP=1.06;

    for(let gx=-1;gx<=1;gx++)for(let gy=-1;gy<=1;gy++)for(let gz=-1;gz<=1;gz++){
      const cols=getCubieColors(gx,gy,gz,stateRef.current);
      const geo=buildGeo(gx,gy,gz,cols,hlFaceRef.current,GAP);
      let model=I4();
      if(mrMat){
        const ai=mrAxis[0]!==0?0:mrAxis[1]!==0?1:2;
        if(Math.round([gx,gy,gz][ai])===mrLayer)model=m4mul(mrMat,model);
      }
      gl.uniformMatrix4fv(uMVP,false,m4mul(vp,model));
      gl.uniformMatrix4fv(uModel,false,model);
      const buf=gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,geo,gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(aPos);gl.vertexAttribPointer(aPos,3,gl.FLOAT,false,STRIDE,0);
      gl.enableVertexAttribArray(aNorm);gl.vertexAttribPointer(aNorm,3,gl.FLOAT,false,STRIDE,12);
      gl.enableVertexAttribArray(aColor);gl.vertexAttribPointer(aColor,3,gl.FLOAT,false,STRIDE,24);
      gl.enableVertexAttribArray(aGlow);gl.vertexAttribPointer(aGlow,1,gl.FLOAT,false,STRIDE,36);
      gl.drawArrays(gl.TRIANGLES,0,geo.length/10);
      gl.deleteBuffer(buf);
    }
  },[solution]);

  // ── PROJECTION ──────────────────────────
  const project=(wx:number,wy:number,wz:number,w:number,h:number)=>{
    const{theta,phi,zoom}=orbitRef.current;
    const camX=zoom*Math.sin(phi)*Math.sin(theta),camY=zoom*Math.cos(phi),camZ=zoom*Math.sin(phi)*Math.cos(theta);
    const asp=w/h;
    const vp=m4mul(m4persp(Math.PI/5,asp,0.1,100),mkView(camX,camY,camZ));
    const clip=[vp[0]*wx+vp[4]*wy+vp[8]*wz+vp[12],vp[1]*wx+vp[5]*wy+vp[9]*wz+vp[13],vp[2]*wx+vp[6]*wy+vp[10]*wz+vp[14],vp[3]*wx+vp[7]*wy+vp[11]*wz+vp[15]];
    if(clip[3]<=0)return null;
    return{sx:((clip[0]/clip[3])+1)/2*w,sy:((1-clip[1]/clip[3]))/2*h,depth:clip[2]/clip[3]};
  };

  const findSticker=(cx:number,cy:number,w:number,h:number)=>{
    const{theta,phi,zoom}=orbitRef.current;
    const camX=zoom*Math.sin(phi)*Math.sin(theta),camY=zoom*Math.cos(phi),camZ=zoom*Math.sin(phi)*Math.cos(theta);
    const GAP=1.06;
    type Hit={dist:number,gx:number,gy:number,gz:number,fk:string,face:string,idx:number,depth:number};
    const hits:Hit[]=[];

    for(let gx=-1;gx<=1;gx++)for(let gy=-1;gy<=1;gy++)for(let gz=-1;gz<=1;gz++){
      const wx=gx*GAP,wy=gy*GAP,wz=gz*GAP;
      const faceList:[string,number,number,number,number,number,number,boolean][]=[
        ["U",wx,wy+0.48,wz,0,1,0,gy===1],
        ["D",wx,wy-0.48,wz,0,-1,0,gy===-1],
        ["F",wx,wy,wz+0.48,0,0,1,gz===1],
        ["B",wx,wy,wz-0.48,0,0,-1,gz===-1],
        ["R",wx+0.48,wy,wz,1,0,0,gx===1],
        ["L",wx-0.48,wy,wz,-1,0,0,gx===-1],
      ];
      for(const[fk,sx,sy,sz,nx,ny,nz,vis] of faceList){
        if(!vis)continue;
        const dot=nx*(wx-camX)+ny*(wy-camY)+nz*(wz-camZ);
        if(dot>=0)continue;
        const p=project(sx,sy,sz,w,h);if(!p)continue;
        const d=Math.sqrt((p.sx-cx)**2+(p.sy-cy)**2);
        const info=getStickerInfo(gx,gy,gz,fk);
        const cur=hits[0];
        if(!cur||d<cur.dist||(Math.abs(d-cur.dist)<8&&p.depth<cur.depth)){
          hits[0]={dist:d,gx,gy,gz,fk,...info,depth:p.depth};
        }
      }
    }
    const h0=hits[0];
    return(h0&&h0.dist<65)?h0:null;
  };

  // ── POINTER EVENTS ──────────────────────
  useEffect(()=>{
    const canvas=canvasRef.current!;
    const THRESH=7;

    const onDown=(e:MouseEvent|TouchEvent)=>{
      const t=e instanceof MouseEvent?e:e.touches[0];
      pointerRef.current={down:true,sx:t.clientX,sy:t.clientY,lx:t.clientX,ly:t.clientY,moved:false};
    };
    const onMove=(e:MouseEvent|TouchEvent)=>{
      if(!pointerRef.current.down)return;
      if(e instanceof TouchEvent&&e.touches.length===2){
        // pinch zoom
        const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
        if(pointerRef.current.moved)orbitRef.current.zoom=Math.max(4,Math.min(12,orbitRef.current.zoom-(d-pointerRef.current.ly)*0.02));
        pointerRef.current.ly=d;return;
      }
      if(e instanceof TouchEvent)e.preventDefault();
      const t=e instanceof MouseEvent?e:e.touches[0];
      const dx=t.clientX-pointerRef.current.lx,dy=t.clientY-pointerRef.current.ly;
      const tdx=t.clientX-pointerRef.current.sx,tdy=t.clientY-pointerRef.current.sy;
      if(Math.sqrt(tdx*tdx+tdy*tdy)>THRESH)pointerRef.current.moved=true;
      if(pointerRef.current.moved){
        orbitRef.current.theta-=dx*0.007;
        orbitRef.current.phi=Math.max(0.1,Math.min(Math.PI-0.1,orbitRef.current.phi+dy*0.007));
      }
      pointerRef.current.lx=t.clientX;pointerRef.current.ly=t.clientY;
    };
    const onUp=(e:MouseEvent|TouchEvent)=>{
      if(!pointerRef.current.down)return;
      const wasMoved=pointerRef.current.moved;
      pointerRef.current.down=false;
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
    const onWheel=(e:WheelEvent)=>{e.preventDefault();orbitRef.current.zoom=Math.max(4,Math.min(12,orbitRef.current.zoom+e.deltaY*0.004));};

    canvas.addEventListener("mousedown",onDown);
    window.addEventListener("mousemove",onMove);
    window.addEventListener("mouseup",onUp);
    canvas.addEventListener("wheel",onWheel,{passive:false});
    canvas.addEventListener("touchstart",onDown,{passive:false});
    canvas.addEventListener("touchmove",onMove,{passive:false});
    canvas.addEventListener("touchend",onUp,{passive:false});
    return()=>{
      canvas.removeEventListener("mousedown",onDown);
      window.removeEventListener("mousemove",onMove);
      window.removeEventListener("mouseup",onUp);
      canvas.removeEventListener("wheel",onWheel);
      canvas.removeEventListener("touchstart",onDown);
      canvas.removeEventListener("touchmove",onMove);
      canvas.removeEventListener("touchend",onUp);
    };
  },[phase,selColor,animating,syncState]);

  // ── SOLVE ───────────────────────────────
  const handleSolve=()=>{
    const steps=generateSolution(stateRef.current);
    setSolution(steps);setStep(0);stepRef.current=0;
    setPhase(steps.length===0?"done":"solving");
    setAiText("");setAnimating(false);queueRef.current=[];animRef.current=null;
  };

  const startAnim=(mv:string)=>{
    const info=MOVE_INFO[mv];if(info)hlFaceRef.current=mv.replace("'","");
    animRef.current={move:mv,t:0,spd:0.025*speedRef.current};setAnimating(true);
  };

  const handlePlay=()=>{
    if(phase==="done"||animRef.current)return;
    const remaining=solution.slice(stepRef.current);if(!remaining.length){setPhase("done");return;}
    isPlayingRef.current=true;setPlaying(true);
    queueRef.current=[...remaining.slice(1)];
    startAnim(remaining[0]);
  };
  const handlePause=()=>{isPlayingRef.current=false;setPlaying(false);queueRef.current=[];};
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
    isPlayingRef.current=false;animRef.current=null;queueRef.current=[];
    hlFaceRef.current="";setAnimating(false);
  };
  const handleUndo=()=>{
    setUndoStack(s=>{if(!s.length)return s;const prev=s[s.length-1];syncState(prev);return s.slice(0,-1);});
  };

  const askAI=async()=>{
    setAiLoading(true);setAiText("");
    const mv=solution[step-1]||solution[0];
    try{
      const res=await fetch("/api/rubik-ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({move:mv,stepNum:step,total:solution.length,lang})});
      const data=await res.json();setAiText(data.explanation||"");
    }catch{setAiText("Error connecting to AI.");}
    setAiLoading(false);
  };

  const counts:Record<string,number>={W:0,Y:0,R:0,O:0,B:0,G:0};
  for(const face of Object.keys(cubeState))for(const c of cubeState[face].split(""))if(c in counts)counts[c]++;
  const curMove=solution[step];
  const curInfo=MOVE_INFO[curMove];
  const curLangObj=LANGS.find(l=>l.code===lang)??LANGS[0];

  return(
    <div style={{height:"100dvh",display:"flex",flexDirection:"column",
      fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Inter',sans-serif",
      color:"#1a1a2e",overflow:"hidden",background:"#90C0F5"}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes pop{0%{transform:scale(0.8);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .btn{border:none;cursor:pointer;font-family:inherit;font-weight:700;transition:all 0.18s;border-radius:14px;letter-spacing:-0.2px;}
        .btn:active{transform:scale(0.94)!important;}
        .btn-solve{background:linear-gradient(135deg,#FF6B00,#FF9500);color:#fff;font-size:16px;padding:13px 32px;box-shadow:0 6px 20px rgba(255,107,0,0.45);border-radius:16px;}
        .btn-solve:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(255,107,0,0.55);}
        .btn-solve:disabled{opacity:0.45;transform:none;box-shadow:none;cursor:not-allowed;}
        .btn-sm{background:rgba(255,255,255,0.3);color:#1a1a2e;font-size:13px;padding:9px 16px;border:1px solid rgba(255,255,255,0.5);backdrop-filter:blur(8px);}
        .btn-sm:hover{background:rgba(255,255,255,0.5);}
        .btn-sm:disabled{opacity:0.4;cursor:not-allowed;}
        .btn-nav{background:rgba(255,255,255,0.9);color:#1a1a2e;border-radius:50px;width:52px;height:52px;font-size:20px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.2);}
        .btn-nav:hover{background:#fff;transform:scale(1.06);}
        .btn-nav:disabled{opacity:0.3;cursor:not-allowed;}
        .btn-play{background:linear-gradient(135deg,#4CAF50,#2E7D32);color:#fff;border-radius:50px;width:64px;height:64px;font-size:24px;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(46,125,50,0.5);}
        .btn-play:hover{transform:scale(1.06);}
        .color-dot{border:none;cursor:pointer;border-radius:12px;transition:all 0.18s;position:relative;}
        .color-dot.sel{transform:scale(1.22);box-shadow:0 0 0 3px #fff,0 0 0 5px #FF6B00,0 4px 16px rgba(0,0,0,0.3);}
        .color-dot:hover:not(.sel){transform:scale(1.1);}
        .chip{display:inline-flex;align-items:center;padding:4px 10px;border-radius:8px;font-family:monospace;font-size:13px;font-weight:800;transition:all 0.2s;}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"10px 16px 8px",background:"rgba(144,192,245,0.7)",backdropFilter:"blur(20px)",
        borderBottom:"1px solid rgba(255,255,255,0.3)",flexShrink:0,zIndex:30}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#FF6B00,#FF9500)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,
            boxShadow:"0 3px 10px rgba(255,107,0,0.4)"}}>🧩</div>
          <div>
            <span style={{fontWeight:800,fontSize:18,letterSpacing:"-0.5px",color:"#1a1a2e"}}>
              Rubik<span style={{color:"#FF6B00"}}>Solver</span>
            </span>
          </div>
        </div>

        {/* Language picker */}
        <div style={{position:"relative"}}>
          <button onClick={()=>setShowLangMenu(m=>!m)} style={{
            display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:12,
            border:"1px solid rgba(255,255,255,0.5)",background:"rgba(255,255,255,0.3)",
            cursor:"pointer",backdropFilter:"blur(8px)",fontSize:14,fontWeight:600,color:"#1a1a2e"}}>
            <span style={{fontSize:18}}>{curLangObj.flag}</span>
            <span style={{fontSize:12}}>{curLangObj.code.toUpperCase()}</span>
            <span style={{fontSize:10,opacity:0.6}}>▼</span>
          </button>
          {showLangMenu&&(
            <div style={{position:"absolute",right:0,top:"calc(100% + 6px)",
              background:"rgba(255,255,255,0.95)",backdropFilter:"blur(20px)",
              borderRadius:14,border:"1px solid rgba(0,0,0,0.1)",
              boxShadow:"0 12px 40px rgba(0,0,0,0.2)",overflow:"hidden",zIndex:100,minWidth:160}}
              onMouseLeave={()=>setShowLangMenu(false)}>
              {LANGS.map(l=>(
                <button key={l.code} onClick={()=>{setLang(l.code);setShowLangMenu(false);}}
                  style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 14px",
                    border:"none",background:lang===l.code?"rgba(255,107,0,0.1)":"transparent",
                    cursor:"pointer",fontSize:14,fontWeight:lang===l.code?700:500,
                    color:lang===l.code?"#FF6B00":"#1a1a2e",textAlign:"left"}}>
                  <span style={{fontSize:20}}>{l.flag}</span>
                  <span>{l.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── CANVAS (sky blue bg, big cube) ── */}
      <canvas ref={canvasRef} style={{flex:1,display:"block",width:"100%",minHeight:0,
        touchAction:"none",userSelect:"none",cursor:"crosshair"}}/>

      {/* ── BOTTOM PANEL ── */}
      <div style={{flexShrink:0,background:"rgba(255,255,255,0.92)",backdropFilter:"blur(30px)",
        borderTop:"1px solid rgba(0,0,0,0.08)",padding:"14px 16px 18px",
        borderRadius:"20px 20px 0 0",boxShadow:"0 -4px 30px rgba(0,0,0,0.12)",
        maxHeight:"48vh",overflowY:"auto"}}>

        {/* PAINT */}
        {phase==="paint"&&(<div style={{animation:"fadeUp 0.3s ease"}}>
          <p style={{fontSize:12,color:"#888",textAlign:"center",marginBottom:12,letterSpacing:"0.1px"}}>
            {tx("tapToPaint",lang)}
          </p>

          {/* Color palette — big, finger-friendly */}
          <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:14}}>
            {COLOR_KEYS.map(k=>(
              <div key={k} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <button className={`color-dot${selColor===k?" sel":""}`}
                  onClick={()=>setSelColor(k)}
                  style={{width:44,height:44,background:STICKER_HEX[k],
                    boxShadow:selColor!==k?"0 3px 8px rgba(0,0,0,0.2)":"none"}}>
                </button>
                <span style={{fontSize:11,fontWeight:700,
                  color:counts[k]===9?"#2E7D32":counts[k]>9?"#CC0000":"#888"}}>
                  {counts[k]}
                </span>
              </div>
            ))}
          </div>

          {/* Validation */}
          {validation.errors.length>0&&(
            <div style={{background:"#FFF3E0",border:"1px solid #FFB74D",borderRadius:12,
              padding:"8px 12px",marginBottom:12}}>
              {validation.errors.slice(0,2).map((e,i)=>(
                <p key={i} style={{fontSize:12,color:"#E65100",margin:i?`4px 0 0`:0}}>⚠ {e}</p>
              ))}
            </div>
          )}
          {validation.valid&&(
            <div style={{background:"#E8F5E9",border:"1px solid #81C784",borderRadius:12,
              padding:"8px 12px",marginBottom:12,textAlign:"center"}}>
              <span style={{fontSize:13,color:"#2E7D32",fontWeight:700}}>✓ {tx("ready",lang)}</span>
            </div>
          )}

          {/* Buttons */}
          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="btn btn-solve" onClick={handleSolve} disabled={!validation.valid}>
              {tx("solve",lang)} →
            </button>
            <button className="btn btn-sm" onClick={handleUndo} disabled={!undoStack.length}
              style={{borderRadius:14}}>↩ {tx("undo",lang)}</button>
            <button className="btn btn-sm" onClick={()=>syncState(JSON.parse(JSON.stringify(SOLVED_STATE)))}
              style={{borderRadius:14}}>🎯 {tx("fillSolved",lang)}</button>
            <button className="btn btn-sm" onClick={handleReset} style={{borderRadius:14}}>
              ✕ {tx("reset",lang)}
            </button>
          </div>
        </div>)}

        {/* SOLVING / DONE */}
        {(phase==="solving"||phase==="done")&&(<div style={{animation:"fadeUp 0.3s ease"}}>

          {/* Current move card */}
          {phase==="solving"&&curMove&&(
            <div style={{display:"flex",alignItems:"center",gap:14,
              background:"linear-gradient(135deg,rgba(255,107,0,0.08),rgba(255,149,0,0.08))",
              border:"1px solid rgba(255,107,0,0.2)",borderRadius:16,padding:"12px 14px",marginBottom:12}}>
              <div style={{width:58,height:58,borderRadius:14,
                background:"linear-gradient(135deg,#FF6B00,#FF9500)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:24,fontWeight:900,fontFamily:"monospace",color:"#fff",
                flexShrink:0,boxShadow:"0 4px 16px rgba(255,107,0,0.4)",
                animation:"pop 0.3s ease"}}>
                {curMove}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:11,color:"#999",marginBottom:2,fontWeight:600}}>
                  {tx("stepOf",lang)} {step+1} {tx("of",lang)} {solution.length}
                </div>
                <div style={{fontSize:14,fontWeight:700,color:"#1a1a2e",marginBottom:6}}>
                  {lang==="es"?curInfo?.labelEs:curInfo?.label}
                </div>
                <div style={{height:4,background:"rgba(0,0,0,0.08)",borderRadius:2}}>
                  <div style={{height:"100%",borderRadius:2,transition:"width 0.35s ease",
                    background:"linear-gradient(90deg,#FF6B00,#FF9500)",
                    width:`${(step/solution.length)*100}%`}}/>
                </div>
              </div>
            </div>
          )}

          {phase==="done"&&(
            <div style={{textAlign:"center",padding:"8px 0 12px",animation:"pop 0.4s ease"}}>
              <div style={{fontSize:36,marginBottom:4}}>🎉</div>
              <div style={{fontSize:17,fontWeight:800,color:"#2E7D32"}}>{tx("solved",lang)}</div>
            </div>
          )}

          {/* Move chips */}
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:12}}>
            {solution.map((m,i)=>(
              <span key={i} className="chip" style={{
                background:i<step?"rgba(46,125,50,0.15)":i===step?"rgba(255,107,0,0.2)":"rgba(0,0,0,0.06)",
                color:i<step?"#2E7D32":i===step?"#FF6B00":"#aaa",
                border:`1px solid ${i===step?"rgba(255,107,0,0.4)":i<step?"rgba(46,125,50,0.3)":"transparent"}`,
                textDecoration:i<step?"line-through":"none"}}>
                {m}
              </span>
            ))}
          </div>

          {/* Player controls */}
          <div style={{display:"flex",gap:10,justifyContent:"center",alignItems:"center",marginBottom:12}}>
            <button className="btn btn-nav" onClick={handlePrev} disabled={step===0||animating}>←</button>
            {playing
              ?<button className="btn btn-play" onClick={handlePause}>⏸</button>
              :<button className="btn btn-play" onClick={handlePlay} disabled={phase==="done"||animating}>▶</button>}
            <button className="btn btn-nav" onClick={handleNext} disabled={step>=solution.length||animating}>→</button>

            <div style={{display:"flex",gap:4,marginLeft:8}}>
              {[0.5,1,2].map(s=>(
                <button key={s} onClick={()=>setSpeed(s)} style={{
                  width:36,height:36,borderRadius:10,border:"1px solid",cursor:"pointer",
                  fontSize:11,fontWeight:800,transition:"all 0.15s",
                  background:speed===s?"#FF6B00":"rgba(0,0,0,0.06)",
                  borderColor:speed===s?"#FF6B00":"rgba(0,0,0,0.1)",
                  color:speed===s?"#fff":"#888"}}>{s}×</button>
              ))}
            </div>
          </div>

          {/* Back + AI */}
          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="btn btn-sm" onClick={handleReset} style={{borderRadius:14}}>
              {tx("back",lang)}
            </button>
            {step>0&&(
              <button className="btn btn-sm" onClick={askAI} disabled={aiLoading} style={{borderRadius:14}}>
                {aiLoading?"⏳...":"🤖 "+tx("aiExplain",lang)}
              </button>
            )}
          </div>

          {/* AI text */}
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
