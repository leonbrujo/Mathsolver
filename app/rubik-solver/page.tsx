"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";

// ═══════════════════════════════════════════════════════
// CUBE LOGIC
// ═══════════════════════════════════════════════════════
const SOLVED: Record<string,string> = {
  U:"WWWWWWWWW", D:"YYYYYYYYY", F:"RRRRRRRRR",
  B:"OOOOOOOOO", L:"BBBBBBBBB", R:"GGGGGGGGG",
};
const CENTERS: Record<string,string> = {U:"W",D:"Y",F:"R",B:"O",L:"B",R:"G"};

// Only U(W) and D(Y) centers are locked — others are user-editable
const LOCKED_CENTERS: Record<string,string> = {U:"W", D:"Y"};

function makeEmpty(): Record<string,string> {
  return Object.fromEntries(Object.keys(SOLVED).map(f => {
    const a = Array(9).fill("X");
    if (LOCKED_CENTERS[f]) a[4] = LOCKED_CENTERS[f];
    return [f, a.join("")];
  }));
}

const COLORS: Record<string,{bg:string,border:string}> = {
  W:{bg:"#FFFFFF",border:"#ddd"}, Y:{bg:"#FFD700",border:"#e6b800"},
  R:{bg:"#CC0000",border:"#990000"}, O:{bg:"#FF6600",border:"#cc5200"},
  B:{bg:"#0050C8",border:"#003d99"}, G:{bg:"#009000",border:"#006600"},
  X:{bg:"#1a1a2e",border:"#111"},
};
const COLOR_KEYS = ["W","Y","R","O","B","G"];
const COLOR_LABEL: Record<string,string> = {W:"White",Y:"Yellow",R:"Red",O:"Orange",B:"Blue",G:"Green"};

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
  return Object.keys(SOLVED).every(f=>st[f].split("").every(c=>c===st[f][4]));
}
function generateSolution(cube:Record<string,string>):string[]{
  if(isSolved(cube))return[];
  const moves=["U","U'","D","D'","L","L'","R","R'","F","F'","B","B'"];
  const q:{s:Record<string,string>,m:string[]}[]=[{s:cube,m:[]}];
  const vis=new Set([JSON.stringify(cube)]);
  for(let depth=0;depth<7;depth++){
    const nxt:typeof q=[];
    for(const{s,m}of q)for(const mv of moves){
      const ns=applyMove(s,mv),k=JSON.stringify(ns);
      if(!vis.has(k)){const nm=[...m,mv];if(isSolved(ns))return nm;vis.add(k);if(nxt.length<80000)nxt.push({s:ns,m:nm});}
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
  for(const[c,n]of Object.entries(counts))if(n!==9)errors.push(`${COLOR_LABEL[c]}: ${n}/9`);
  return{valid:errors.length===0,errors};
}

const MOVE_INFO:{[k:string]:{axis:string,layer:number,dir:number,label:string,labelEs:string}}={
  "U": {axis:"Y",layer:1, dir:-1,label:"Top face clockwise",labelEs:"Cara superior horario"},
  "U'":{axis:"Y",layer:1, dir:1, label:"Top face counter-clockwise",labelEs:"Cara superior antihorario"},
  "D": {axis:"Y",layer:-1,dir:1, label:"Bottom face clockwise",labelEs:"Cara inferior horario"},
  "D'":{axis:"Y",layer:-1,dir:-1,label:"Bottom face counter-clockwise",labelEs:"Cara inferior antihorario"},
  "R": {axis:"X",layer:1, dir:1, label:"Right face clockwise",labelEs:"Cara derecha horario"},
  "R'":{axis:"X",layer:1, dir:-1,label:"Right face counter-clockwise",labelEs:"Cara derecha antihorario"},
  "L": {axis:"X",layer:-1,dir:-1,label:"Left face clockwise",labelEs:"Cara izquierda horario"},
  "L'":{axis:"X",layer:-1,dir:1, label:"Left face counter-clockwise",labelEs:"Cara izquierda antihorario"},
  "F": {axis:"Z",layer:1, dir:1, label:"Front face clockwise",labelEs:"Cara frontal horario"},
  "F'":{axis:"Z",layer:1, dir:-1,label:"Front face counter-clockwise",labelEs:"Cara frontal antihorario"},
  "B": {axis:"Z",layer:-1,dir:-1,label:"Back face clockwise",labelEs:"Cara trasera horario"},
  "B'":{axis:"Z",layer:-1,dir:1, label:"Back face counter-clockwise",labelEs:"Cara trasera antihorario"},
};

// ═══════════════════════════════════════════════════════
// CSS 3D CUBE RENDERER
// ═══════════════════════════════════════════════════════
// Face net: which face to show on each side of the CSS cube
// CSS cube faces: front=F, back=B, left=L, right=R, top=U, bottom=D
const CSS_FACE_MAP = [
  {css:"translateZ(150px)",              face:"F", rotX:0,   rotY:0},
  {css:"rotateY(180deg) translateZ(150px)", face:"B", rotX:0, rotY:180},
  {css:"rotateY(-90deg) translateZ(150px)", face:"L", rotX:0, rotY:-90},
  {css:"rotateY(90deg) translateZ(150px)",  face:"R", rotX:0, rotY:90},
  {css:"rotateX(90deg) translateZ(150px)",  face:"U", rotX:90,rotY:0},
  {css:"rotateX(-90deg) translateZ(150px)", face:"D", rotX:-90,rotY:0},
];

// For each CSS face, the sticker grid layout
// U face: when viewed from top (X rotated 90), row0=back(B side), col order = L to R
// We need mapping: CSS face position → cube face + reading order
// Precomputed sticker order for each face when viewed from outside:
const FACE_STICKER_ORDER: Record<string,number[]> = {
  F:[0,1,2,3,4,5,6,7,8],
  B:[2,1,0,5,4,3,8,7,6], // mirrored horizontally
  L:[0,1,2,3,4,5,6,7,8],
  R:[0,1,2,3,4,5,6,7,8],
  U:[0,1,2,3,4,5,6,7,8],
  D:[0,1,2,3,4,5,6,7,8],
};

interface CubeProps {
  state: Record<string,string>;
  rotX: number;
  rotY: number;
  animMove: string|null;
  animProgress: number;
  selectedFace?: string;
  onStickerClick?: (face:string, idx:number) => void;
}

function CSSCube({state, rotX, rotY, animMove, animProgress, selectedFace, onStickerClick}: CubeProps) {
  const SIZE = 300; // px, total cube size
  const S = SIZE; // half
  const HALF = SIZE / 2;

  // Compute layer rotation for current animation
  const getLayerRotation = (face: string): string => {
    if (!animMove) return "";
    const info = MOVE_INFO[animMove];
    if (!info) return "";
    // Check if this CSS face belongs to the moving layer
    const faceToAxis: Record<string,{axis:string,layer:number}> = {
      U:{axis:"Y",layer:1}, D:{axis:"Y",layer:-1},
      F:{axis:"Z",layer:1}, B:{axis:"Z",layer:-1},
      R:{axis:"X",layer:1}, L:{axis:"X",layer:-1},
    };
    const fInfo = faceToAxis[face];
    if (!fInfo || fInfo.axis !== info.axis || fInfo.layer !== info.layer) return "";
    const angle = info.dir * 90 * animProgress;
    if (info.axis === "Y") return `rotateY(${angle}deg)`;
    if (info.axis === "X") return `rotateX(${angle}deg)`;
    return `rotateZ(${angle}deg)`;
  };

  return (
    <div style={{
      width: SIZE, height: SIZE,
      position: "relative",
      transformStyle: "preserve-3d",
      transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
      transition: animMove ? "none" : "transform 0.1s",
    }}>
      {CSS_FACE_MAP.map(({css, face}) => {
        const faceState = state[face] ?? "XXXXXXXXX";
        const order = FACE_STICKER_ORDER[face];
        const layerRot = getLayerRotation(face);
        const isSelected = selectedFace === face;

        return (
          <div key={face} style={{
            position: "absolute",
            width: SIZE, height: SIZE,
            transform: `${css}`,
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
          }}>
            {/* Extra wrapper for layer animation */}
            <div style={{
              width: "100%", height: "100%",
              transform: layerRot,
              transition: animMove ? `transform ${0.4}s cubic-bezier(0.25,0.46,0.45,0.94)` : "none",
              transformOrigin: "center center",
            }}>
              {/* Black plastic background */}
              <div style={{
                width: "100%", height: "100%",
                background: "#111",
                borderRadius: 6,
                padding: 6,
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gridTemplateRows: "repeat(3, 1fr)",
                gap: 5,
                boxShadow: isSelected
                  ? "0 0 0 4px #FFD700, 0 0 20px rgba(255,215,0,0.5)"
                  : "inset 0 0 20px rgba(0,0,0,0.5)",
              }}>
                {order.map((sIdx, gridIdx) => {
                  const colorKey = faceState[sIdx] ?? "X";
                  const col = COLORS[colorKey] ?? COLORS.X;
                  const isCenter = sIdx === 4;
                  const isLocked = isCenter && (face === "U" || face === "D");
                  return (
                    <div
                      key={gridIdx}
                      onClick={() => !isLocked && onStickerClick?.(face, sIdx)}
                      style={{
                        background: col.bg,
                        borderRadius: 4,
                        border: `2px solid ${col.border}`,
                        cursor: isCenter ? "default" : "pointer",
                        boxShadow: `inset 0 2px 4px rgba(255,255,255,0.25), inset 0 -2px 4px rgba(0,0,0,0.3)`,
                        transition: "all 0.15s",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {/* Shine effect */}
                      <div style={{
                        position: "absolute", top: 0, left: 0,
                        width: "60%", height: "50%",
                        background: "rgba(255,255,255,0.2)",
                        borderRadius: "0 0 100% 0",
                      }}/>
                      {isLocked && (
                        <div style={{
                          position: "absolute", inset: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.35)",
                        }}>🔒</div>
                      )}
                      {isCenter && !isLocked && (
                        <div style={{
                          position: "absolute", inset: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.3)",
                        }}>●</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// LANGUAGES
// ═══════════════════════════════════════════════════════
type Lang = "en"|"es"|"pt"|"fr"|"de"|"zh";
const LANGS = [
  {code:"en" as Lang, flag:"🇺🇸", name:"English"},
  {code:"es" as Lang, flag:"🇪🇸", name:"Español"},
  {code:"pt" as Lang, flag:"🇧🇷", name:"Português"},
  {code:"fr" as Lang, flag:"🇫🇷", name:"Français"},
  {code:"de" as Lang, flag:"🇩🇪", name:"Deutsch"},
  {code:"zh" as Lang, flag:"🇨🇳", name:"中文"},
];
const T: Record<string,Partial<Record<Lang,string>>> = {
  hint:{en:"Tap stickers to paint · Drag to rotate",es:"Toca stickers para pintar · Arrastra para rotar",pt:"Toque para pintar · Arraste para girar",fr:"Appuyez pour peindre · Faites glisser",de:"Antippen · Ziehen zum Drehen",zh:"点击涂色 · 拖动旋转"},
  scan:{en:"📷 Scan face",es:"📷 Escanear cara",pt:"📷 Escanear face",fr:"📷 Scanner",de:"📷 Scannen",zh:"📷 扫描"},
  solve:{en:"Solve",es:"Resolver",pt:"Resolver",fr:"Résoudre",de:"Lösen",zh:"求解"},
  reset:{en:"Reset",es:"Reiniciar",pt:"Reiniciar",fr:"Réinitialiser",de:"Reset",zh:"重置"},
  undo:{en:"Undo",es:"Deshacer",pt:"Desfazer",fr:"Annuler",de:"Rückgängig",zh:"撤销"},
  fill:{en:"Fill solved",es:"Rellenar",pt:"Preencher",fr:"Remplir",de:"Ausfüllen",zh:"填充"},
  ready:{en:"Ready to solve! ✓",es:"¡Listo para resolver! ✓",pt:"Pronto! ✓",fr:"Prêt! ✓",de:"Bereit! ✓",zh:"准备好！✓"},
  stepOf:{en:"Step",es:"Paso",pt:"Passo",fr:"Étape",de:"Schritt",zh:"步"},
  of:{en:"of",es:"de",pt:"de",fr:"sur",de:"von",zh:"共"},
  play:{en:"▶",es:"▶",pt:"▶",fr:"▶",de:"▶",zh:"▶"},
  pause:{en:"⏸",es:"⏸",pt:"⏸",fr:"⏸",de:"⏸",zh:"⏸"},
  solved:{en:"Solved! 🎉",es:"¡Resuelto! 🎉",pt:"Resolvido! 🎉",fr:"Résolu! 🎉",de:"Gelöst! 🎉",zh:"已解！🎉"},
  back:{en:"← Back",es:"← Volver",pt:"← Voltar",fr:"← Retour",de:"← Zurück",zh:"← 返回"},
  aiBtn:{en:"🤖 Explain",es:"🤖 Explicar",pt:"🤖 Explicar",fr:"🤖 Expliquer",de:"🤖 Erklären",zh:"🤖 解释"},
  scanHint:{en:"Point camera at ONE face, then tap Scan",es:"Apunta la cámara a UNA cara y toca Escanear",pt:"Aponte a câmera para UMA face",fr:"Pointez vers UNE face",de:"Kamera auf EINE Seite",zh:"将相机对准一个面"},
  scanning:{en:"Analyzing…",es:"Analizando…",pt:"Analisando…",fr:"Analyse…",de:"Analysiere…",zh:"分析中…"},
};
const tx = (k:string, l:Lang) => T[k]?.[l] ?? T[k]?.en ?? k;

const FACE_LABEL: Record<string,{en:string,es:string}> = {
  F:{en:"Front",es:"Frente"}, B:{en:"Back",es:"Atrás"},
  L:{en:"Left",es:"Izquierda"}, R:{en:"Right",es:"Derecha"},
  U:{en:"Top",es:"Arriba"}, D:{en:"Bottom",es:"Abajo"},
};

// ═══════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════

// ── Side Color Picker sub-component ─────────────────────────────────────────
function SideColorPicker({face, label, sideColors, setSideColors, HEX, NAME, SIDE_OPTS}:{
  face:string, label:string,
  sideColors:Record<string,string>,
  setSideColors:React.Dispatch<React.SetStateAction<Record<string,string>>>,
  HEX:Record<string,string>, NAME:Record<string,string>, SIDE_OPTS:string[]
}) {
  const cur = sideColors[face] ?? "R";
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{position:"relative"}}>
      <button
        onClick={()=>setOpen(o=>!o)}
        style={{width:80,height:80,borderRadius:14,
          background:HEX[cur]??"#333",
          border:`3px solid rgba(255,255,255,${open?0.9:0.25})`,
          display:"flex",flexDirection:"column",alignItems:"center",
          justifyContent:"center",gap:4,cursor:"pointer",
          boxShadow:open?`0 0 20px ${HEX[cur]}88`:"none",
          transition:"all 0.2s"}}>
        <span style={{fontSize:11,fontWeight:800,
          color:cur==="W"||cur==="Y"?"#333":"#fff",
          textShadow:cur==="W"||cur==="Y"?"none":"0 1px 3px rgba(0,0,0,0.5)"}}>
          {label.split(" ")[0]}
        </span>
        <span style={{fontSize:9,fontWeight:600,
          color:cur==="W"||cur==="Y"?"#555":"rgba(255,255,255,0.7)"}}>
          {NAME[cur]}
        </span>
      </button>
      {open && (
        <div style={{position:"absolute",zIndex:100,
          top:"50%",left:"50%",transform:"translate(-50%,-50%)",
          background:"#1a1a2e",border:"1.5px solid rgba(255,255,255,0.15)",
          borderRadius:14,padding:8,
          display:"flex",gap:6,flexWrap:"wrap",width:100,
          boxShadow:"0 12px 40px rgba(0,0,0,0.7)"}}>
          {SIDE_OPTS.map(c=>(
            <button key={c}
              onClick={()=>{setSideColors(s=>({...s,[face]:c}));setOpen(false);}}
              style={{width:36,height:36,borderRadius:9,background:HEX[c],
                border:`2px solid ${cur===c?"#fff":"transparent"}`,cursor:"pointer",
                transform:cur===c?"scale(1.1)":"scale(1)",
                transition:"all 0.15s"}}>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RubikSolverPage() {
  const [cubeState, setCubeState] = useState<Record<string,string>>(makeEmpty());
  const [selColor, setSelColor] = useState("R");
  const [phase, setPhase] = useState<"paint"|"solving"|"done">("paint");
  const [solution, setSolution] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [spd, setSpd] = useState(1.0);
  const [lang, setLang] = useState<Lang>("en");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [validation, setValidation] = useState<{valid:boolean,errors:string[]}>({valid:false,errors:[]});
  const [undoStack, setUndoStack] = useState<Record<string,string>[]>([]);
  const [animMove, setAnimMove] = useState<string|null>(null);
  const [animProgress, setAnimProgress] = useState(0);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const [scanSetup, setScanSetup] = useState(false); // step 0: choose 4 side colors
  const [scanFace, setScanFace] = useState<string>("F");
  const [scanning, setScanning] = useState(false);
  const [camStream, setCamStream] = useState<MediaStream|null>(null);
  const [selectedFaceHl, setSelectedFaceHl] = useState<string|undefined>();
  // side color assignments: F/R/B/L
  const [sideColors, setSideColors] = useState<Record<string,string>>({F:"R",R:"B",B:"O",L:"G"});

  // Orbit
  const [rotX, setRotX] = useState(-25);
  const [rotY, setRotY] = useState(35);
  const drag = useRef({down:false,sx:0,sy:0,lx:0,ly:0,moved:false});
  const cubeRef = useRef<HTMLDivElement>(null);

  const stateRef = useRef(cubeState);
  stateRef.current = cubeState;
  const solRef = useRef(solution);
  solRef.current = solution;
  const stepRef = useRef(step);
  stepRef.current = step;
  const spdRef = useRef(spd);
  spdRef.current = spd;
  const playRef = useRef(playing);
  playRef.current = playing;
  const animRef = useRef(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  // capRef removed — canvas created dynamically
  const pendingStreamRef = useRef<MediaStream|null>(null);

  useEffect(() => {
    // Assign stream to video when scan screen appears (not setup screen)
    if (showScan && !scanSetup && videoRef.current && pendingStreamRef.current) {
      videoRef.current.srcObject = pendingStreamRef.current;
      videoRef.current.play().catch(()=>{});
    }
  }, [showScan, scanSetup]);

  const syncState = useCallback((st: Record<string,string>) => {
    setCubeState({...st});
    setValidation(validateCube(st));
  }, []);

  useEffect(() => { syncState(makeEmpty()); }, []);

  // ── DRAG TO ROTATE ────────────────────────────────────
  useEffect(() => {
    const el = cubeRef.current;
    if (!el) return;
    const THRESH = 5;

    const onDown = (e: MouseEvent | TouchEvent) => {
      const t = e instanceof MouseEvent ? e : e.touches[0];
      drag.current = {down:true, sx:t.clientX, sy:t.clientY, lx:t.clientX, ly:t.clientY, moved:false};
    };
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!drag.current.down) return;
      if (e instanceof TouchEvent) e.preventDefault();
      const t = e instanceof MouseEvent ? e : e.touches[0];
      const dx = t.clientX - drag.current.lx, dy = t.clientY - drag.current.ly;
      const tdx = t.clientX - drag.current.sx, tdy = t.clientY - drag.current.sy;
      if (Math.sqrt(tdx*tdx+tdy*tdy) > THRESH) drag.current.moved = true;
      if (drag.current.moved) {
        setRotY(y => y + dx * 0.5);
        setRotX(x => Math.max(-80, Math.min(80, x - dy * 0.5)));
      }
      drag.current.lx = t.clientX; drag.current.ly = t.clientY;
    };
    const onUp = () => { drag.current.down = false; };

    el.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    el.addEventListener("touchstart", onDown, {passive:false});
    el.addEventListener("touchmove", onMove, {passive:false});
    el.addEventListener("touchend", onUp);
    return () => {
      el.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      el.removeEventListener("touchstart", onDown);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onUp);
    };
  }, []);

  // ── STICKER CLICK ─────────────────────────────────────
  const handleStickerClick = useCallback((face: string, idx: number) => {
    if (phase !== "paint" || animRef.current) return;
    // Block only U/D centers (White/Yellow are orientation references)
    if (idx === 4 && (face === "U" || face === "D")) return;
    setUndoStack(s => [...s.slice(-19), JSON.parse(JSON.stringify(stateRef.current))]);
    const arr = stateRef.current[face].split("");
    arr[idx] = selColor;
    syncState({...stateRef.current, [face]: arr.join("")});
  }, [phase, selColor, syncState]);

  // ── ANIMATION ─────────────────────────────────────────
  const runAnim = useCallback((move: string, onDone: () => void) => {
    animRef.current = true;
    setAnimMove(move);
    setAnimProgress(0);
    setSelectedFaceHl(move.replace("'",""));
    const duration = Math.max(200, 400 / spdRef.current);
    const start = performance.now();
    const tick = () => {
      const t = Math.min((performance.now() - start) / duration, 1);
      setAnimProgress(t);
      if (t < 1) { requestAnimationFrame(tick); }
      else {
        setAnimMove(null); setAnimProgress(0); setSelectedFaceHl(undefined);
        animRef.current = false;
        onDone();
      }
    };
    requestAnimationFrame(tick);
  }, []);

  const runMoveSequence = useCallback((moves: string[], startState: Record<string,string>, startStep: number) => {
    if (!moves.length) {
      setPlaying(false); playRef.current = false;
      setPhase("done"); return;
    }
    const [first, ...rest] = moves;
    runAnim(first, () => {
      const newState = applyMove(startState, first);
      setCubeState({...newState});
      setStep(startStep + 1);
      setTimeout(() => {
        if (playRef.current) runMoveSequence(rest, newState, startStep + 1);
      }, Math.max(50, 120 / spdRef.current));
    });
  }, [runAnim]);

  // ── SOLVE CONTROLS ────────────────────────────────────
  const handleSolve = () => {
    const steps = generateSolution(stateRef.current);
    setSolution(steps); setStep(0); setAiText("");
    setPhase(steps.length === 0 ? "done" : "solving");
  };

  const handlePlay = () => {
    if (animRef.current || phase === "done") return;
    const remaining = solRef.current.slice(stepRef.current);
    if (!remaining.length) { setPhase("done"); return; }
    setPlaying(true); playRef.current = true;
    runMoveSequence(remaining, stateRef.current, stepRef.current);
  };
  const handlePause = () => { setPlaying(false); playRef.current = false; };

  const handleNext = () => {
    if (animRef.current || stepRef.current >= solRef.current.length) return;
    const mv = solRef.current[stepRef.current];
    const cur = {...stateRef.current};
    runAnim(mv, () => {
      const ns = applyMove(cur, mv);
      setCubeState({...ns});
      setStep(s => s + 1);
    });
  };
  const handlePrev = () => {
    if (animRef.current || stepRef.current <= 0) return;
    const mv = solRef.current[stepRef.current - 1];
    const inv = (m: string) => m.endsWith("'") ? m.slice(0,-1) : m+"'";
    const cur = {...stateRef.current};
    runAnim(inv(mv), () => {
      const ns = applyMove(cur, inv(mv));
      setCubeState({...ns});
      setStep(s => s - 1);
    });
  };
  const handleReset = () => {
    const fresh = makeEmpty();
    syncState(fresh); setSolution([]); setStep(0);
    setPhase("paint"); setAiText(""); setUndoStack([]);
    setPlaying(false); playRef.current = false;
    setAnimMove(null); setAnimProgress(0); animRef.current = false;
    stopCamera();
  };
  const handleUndo = () => {
    setUndoStack(s => {
      if (!s.length) return s;
      const prev = s[s.length-1]; syncState(prev); return s.slice(0,-1);
    });
  };

  // ── CAMERA SCAN ───────────────────────────────────────
  const startCamera = async () => {
    // Show color setup first, then open camera
    setScanSetup(true);
    setShowScan(true);
    setScanFace("U");
  };
  const startCameraAfterSetup = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video:{facingMode:"environment",width:{ideal:1280},height:{ideal:720}}
      });
      pendingStreamRef.current = stream;
      setCamStream(stream);
      setScanSetup(false);  // show camera AFTER stream acquired
      setScanFace("U");
    } catch(e) {
      alert("Camera access denied. Please allow camera permissions in your browser settings.");
    }
  };
  const stopCamera = () => {
    camStream?.getTracks().forEach(t=>t.stop());
    setCamStream(null); setShowScan(false); setScanSetup(false); setScanning(false);
  };
  const captureAndScan = async () => {
    const video = videoRef.current;
    if (!video) { alert("Camera not ready. Please try again."); return; }
    setScanning(true);
    // Create canvas dynamically — avoids ref timing issues
    const c = document.createElement("canvas");
    c.width = video.videoWidth || 640;
    c.height = video.videoHeight || 480;
    const ctx = c.getContext("2d");
    if (!ctx) { setScanning(false); return; }
    ctx.drawImage(video, 0, 0);
    const b64 = c.toDataURL("image/jpeg", 0.85).split(",")[1];
    try {
      const res = await fetch("/api/rubik-scan",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({imageBase64:b64,face:scanFace})});
      const data = await res.json();
      if (data.colors?.length===9) {
        const arr=[...data.colors];
        // Use center colors from sideColors setup (never override)
        const centerMap: Record<string,string> = {U:"W",D:"Y",...sideColors};
        if(centerMap[scanFace]) arr[4]=centerMap[scanFace];
        syncState({...stateRef.current,[scanFace]:arr.join("")});
        // Auto-advance
        const FACE_ORDER_ADV = ["U","D","F","R","B","L"];
        const curIdx = FACE_ORDER_ADV.indexOf(scanFace);
        const nextFace = curIdx < FACE_ORDER_ADV.length-1 ? FACE_ORDER_ADV[curIdx+1] : null;
        if(nextFace) setScanFace(nextFace);
        else stopCamera();
      } else { alert("Could not detect colors. Try better lighting."); }
    } catch { alert("Scan failed."); }
    setScanning(false);
  };

  const askAI = async () => {
    setAiLoading(true); setAiText("");
    const mv = solution[step-1] || solution[0];
    try {
      const res = await fetch("/api/rubik-ai",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({move:mv,stepNum:step,total:solution.length,lang})});
      const data = await res.json(); setAiText(data.explanation||"");
    } catch { setAiText("Error."); }
    setAiLoading(false);
  };

  const counts: Record<string,number> = Object.fromEntries(COLOR_KEYS.map(k=>[k,0]));
  for (const face of Object.keys(cubeState)) for (const c of cubeState[face].split("")) if (c in counts) counts[c]++;
  const curMove = solution[step];
  const curInfo = MOVE_INFO[curMove];
  const curLang = LANGS.find(l=>l.code===lang)??LANGS[0];

  return (
    <div style={{height:"100dvh",display:"flex",flexDirection:"column",
      fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Inter',sans-serif",
      overflow:"hidden", background:"linear-gradient(160deg,#7EC8E3 0%,#A8D8EA 40%,#87CEEB 100%)"}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes pop{0%{transform:scale(0.8);opacity:0}60%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes cubeSlowSpin{
          0%{transform:rotateX(-15deg) rotateY(0deg)}
          100%{transform:rotateX(-15deg) rotateY(360deg)}
        }
        @keyframes cubeRotateIn{from{opacity:0;transform:scale(0.7) rotateY(-30deg)}to{opacity:1}}
        @keyframes cubeSettle_U{0%{transform:rotateX(-22deg) rotateY(-150deg) scale(0.7);opacity:0}60%{opacity:1}100%{transform:rotateX(-22deg) rotateY(0deg) scale(1);opacity:1}} 
        @keyframes cubeSettle_D{0%{transform:rotateX(-22deg) rotateY(-150deg) scale(0.7);opacity:0}60%{opacity:1}100%{transform:rotateX(-22deg) rotateY(0deg) scale(1);opacity:1}} 
        @keyframes cubeSettle_F{0%{transform:rotateX(-22deg) rotateY(-150deg) scale(0.7);opacity:0}60%{opacity:1}100%{transform:rotateX(-22deg) rotateY(0deg) scale(1);opacity:1}} 
        @keyframes cubeSettle_R{0%{transform:rotateX(-22deg) rotateY(-240deg) scale(0.7);opacity:0}60%{opacity:1}100%{transform:rotateX(-22deg) rotateY(-90deg) scale(1);opacity:1}} 
        @keyframes cubeSettle_B{0%{transform:rotateX(-22deg) rotateY(30deg) scale(0.7);opacity:0}60%{opacity:1}100%{transform:rotateX(-22deg) rotateY(180deg) scale(1);opacity:1}} 
        @keyframes cubeSettle_L{0%{transform:rotateX(-22deg) rotateY(-60deg) scale(0.7);opacity:0}60%{opacity:1}100%{transform:rotateX(-22deg) rotateY(90deg) scale(1);opacity:1}} 
        .btn{border:none;cursor:pointer;font-family:inherit;transition:all 0.18s;outline:none;}
        .btn:active{transform:scale(0.93)!important;}
      `}</style>

      {/* HEADER */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"10px 16px 8px",background:"rgba(126,200,227,0.7)",backdropFilter:"blur(20px)",
        borderBottom:"1px solid rgba(255,255,255,0.4)",flexShrink:0,zIndex:30}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:9,
            background:"linear-gradient(135deg,#FF6B00,#FFAA00)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,
            boxShadow:"0 3px 12px rgba(255,107,0,0.4)"}}>🧩</div>
          <span style={{fontWeight:800,fontSize:18,letterSpacing:"-0.5px",
            color:"#fff",textShadow:"0 1px 6px rgba(0,0,0,0.25)"}}>
            Rubik<span style={{color:"#FF6B00",textShadow:"0 1px 6px rgba(255,107,0,0.4)"}}>Solver</span>
          </span>
        </div>
        <div style={{position:"relative"}}>
          <button className="btn" onClick={()=>setShowLangMenu(m=>!m)} style={{
            display:"flex",alignItems:"center",gap:7,padding:"7px 13px",borderRadius:12,
            border:"1.5px solid rgba(255,255,255,0.6)",background:"rgba(255,255,255,0.3)",
            color:"#fff",fontWeight:700,fontSize:13,backdropFilter:"blur(10px)",
            boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>
            <span style={{fontSize:18}}>{curLang.flag}</span>
            <span>{curLang.code.toUpperCase()}</span>
            <span style={{fontSize:10,opacity:0.7}}>▾</span>
          </button>
          {showLangMenu && (
            <div style={{position:"absolute",right:0,top:"calc(100% + 8px)",
              background:"rgba(255,255,255,0.98)",backdropFilter:"blur(20px)",
              borderRadius:16,border:"1px solid rgba(0,0,0,0.08)",
              boxShadow:"0 20px 60px rgba(0,0,0,0.25)",overflow:"hidden",zIndex:100,minWidth:175}}
              onMouseLeave={()=>setShowLangMenu(false)}>
              {LANGS.map(l=>(
                <button key={l.code} className="btn" onClick={()=>{setLang(l.code);setShowLangMenu(false);}}
                  style={{display:"flex",alignItems:"center",gap:10,width:"100%",
                    padding:"11px 16px",background:lang===l.code?"rgba(255,107,0,0.08)":"transparent",
                    color:lang===l.code?"#FF6B00":"#222",fontSize:14,fontWeight:lang===l.code?700:400,textAlign:"left"}}>
                  <span style={{fontSize:20}}>{l.flag}</span>{l.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3D CUBE VIEWPORT */}
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",
        perspective:"800px",minHeight:0,position:"relative",overflow:"hidden"}}
        ref={cubeRef}>
        {/* Subtle floor shadow */}
        <div style={{position:"absolute",bottom:"15%",left:"50%",transform:"translateX(-50%)",
          width:200,height:30,background:"rgba(0,0,0,0.12)",borderRadius:"50%",filter:"blur(12px)"}}/>
        <CSSCube
          state={cubeState}
          rotX={rotX} rotY={rotY}
          animMove={animMove}
          animProgress={animProgress}
          selectedFace={selectedFaceHl}
          onStickerClick={handleStickerClick}
        />
        {/* Rotate hint */}
        <div style={{position:"absolute",bottom:12,left:0,right:0,textAlign:"center",
          fontSize:11,color:"rgba(255,255,255,0.6)",letterSpacing:"0.3px",pointerEvents:"none"}}>
          {tx("hint",lang)}
        </div>
      </div>

      {/* CAMERA OVERLAY */}
      {showScan && (()=>{
        const HEX: Record<string,string> = {
          W:"#FFFFFF",Y:"#FFD700",R:"#CC0000",O:"#FF6600",B:"#0050C8",G:"#009000",X:"#333"
        };
        const NAME: Record<string,string> = {
          W:"White",Y:"Yellow",R:"Red",O:"Orange",B:"Blue",G:"Green",X:"?"
        };
        const SIDE_OPTS = ["R","O","B","G"]; // possible side colors
        const FACE_ORDER = ["U","D","F","R","B","L"];
        const centerMap: Record<string,string> = {U:"W",D:"Y",...sideColors};

        // ── SETUP SCREEN: choose 4 side colors ──────────────────────────
        if(scanSetup) {
          // 4 positions: Front / Right / Back / Left
          // shown as a cross diagram
          const positions = [
            {face:"F", label:"Front"},
            {face:"R", label:"Right"},
            {face:"B", label:"Back"},
            {face:"L", label:"Left"},
          ];
          // available colors (not yet assigned to another face)
          const usedColors = Object.values(sideColors);

          return (
            <div style={{position:"fixed",inset:0,zIndex:50,
              background:"linear-gradient(160deg,#0d0d1a 0%,#131325 100%)",
              display:"flex",flexDirection:"column",
              padding:"0 0 max(20px,env(safe-area-inset-bottom)) 0"}}>

              {/* Header */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                padding:"14px 18px 10px",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
                <button className="btn" onClick={stopCamera} style={{
                  color:"#aaa",background:"rgba(255,255,255,0.06)",borderRadius:12,
                  padding:"7px 14px",fontSize:13,fontWeight:600,
                  border:"1px solid rgba(255,255,255,0.1)"}}>✕ Cancel</button>
                <span style={{color:"#fff",fontWeight:800,fontSize:15}}>Set cube colors</span>
                <div style={{width:70}}/>
              </div>

              <div style={{flex:1,overflowY:"auto",padding:"16px 18px"}}>
                {/* Fixed colors */}
                <div style={{marginBottom:18}}>
                  <p style={{color:"#666",fontSize:12,fontWeight:600,
                    letterSpacing:"0.8px",marginBottom:10}}>FIXED (standard orientation)</p>
                  <div style={{display:"flex",gap:10}}>
                    {[{face:"U",color:"W"},{face:"D",color:"Y"}].map(({face,color})=>(
                      <div key={face} style={{flex:1,background:"rgba(255,255,255,0.05)",
                        borderRadius:14,padding:"12px",display:"flex",
                        alignItems:"center",gap:10,
                        border:"1.5px solid rgba(255,255,255,0.1)"}}>
                        <div style={{width:32,height:32,borderRadius:8,
                          background:HEX[color],
                          border:"2px solid rgba(0,0,0,0.2)",flexShrink:0}}/>
                        <div>
                          <div style={{color:"#aaa",fontSize:10,fontWeight:600}}>
                            {face==="U"?"TOP":"BOTTOM"}
                          </div>
                          <div style={{color:"#fff",fontWeight:700,fontSize:13}}>{NAME[color]}</div>
                        </div>
                        <div style={{marginLeft:"auto",fontSize:16}}>🔒</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Side color cross diagram */}
                <p style={{color:"#666",fontSize:12,fontWeight:600,
                  letterSpacing:"0.8px",marginBottom:12}}>TAP TO SET SIDE COLORS</p>

                {/* Cross layout: B top, L-F-R middle, (nothing bottom) */}
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,marginBottom:20}}>
                  {/* Back */}
                  <SideColorPicker face="B" label="Back" sideColors={sideColors}
                    setSideColors={setSideColors} HEX={HEX} NAME={NAME} SIDE_OPTS={SIDE_OPTS}/>
                  {/* L F R row */}
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <SideColorPicker face="L" label="Left" sideColors={sideColors}
                      setSideColors={setSideColors} HEX={HEX} NAME={NAME} SIDE_OPTS={SIDE_OPTS}/>
                    {/* Center placeholder */}
                    <div style={{width:80,height:80,borderRadius:14,
                      background:"rgba(255,255,255,0.03)",
                      border:"1.5px dashed rgba(255,255,255,0.08)",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:24}}>🧩</div>
                    <SideColorPicker face="R" label="Right" sideColors={sideColors}
                      setSideColors={setSideColors} HEX={HEX} NAME={NAME} SIDE_OPTS={SIDE_OPTS}/>
                  </div>
                  {/* Front */}
                  <SideColorPicker face="F" label="Front (facing you)" sideColors={sideColors}
                    setSideColors={setSideColors} HEX={HEX} NAME={NAME} SIDE_OPTS={SIDE_OPTS}/>
                </div>

                {/* Validation */}
                {new Set(Object.values(sideColors)).size < 4 && (
                  <div style={{background:"rgba(255,107,0,0.1)",border:"1px solid rgba(255,107,0,0.3)",
                    borderRadius:12,padding:"10px 14px",marginBottom:12}}>
                    <p style={{color:"#FF9500",fontSize:13,margin:0}}>
                      ⚠ Each side must have a different color
                    </p>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div style={{padding:"0 18px"}}>
                <button className="btn" onClick={startCameraAfterSetup}
                  disabled={new Set(Object.values(sideColors)).size < 4}
                  style={{width:"100%",padding:"16px",borderRadius:18,
                    fontWeight:800,fontSize:17,border:"none",
                    background:new Set(Object.values(sideColors)).size===4
                      ?"linear-gradient(135deg,#FF6B00,#FFAA00)"
                      :"rgba(255,255,255,0.08)",
                    color:new Set(Object.values(sideColors)).size===4?"#fff":"#555",
                    boxShadow:new Set(Object.values(sideColors)).size===4
                      ?"0 6px 24px rgba(255,107,0,0.45)":"none"}}>
                  Open Camera → Start Scanning
                </button>
              </div>
            </div>
          );
        }

        // ── SCAN SCREEN ─────────────────────────────────────────────────
        const seqIdx = FACE_ORDER.indexOf(scanFace);
        const camColorKey = centerMap[scanFace] ?? "X";
        const accentColor = HEX[camColorKey] ?? "#FF6B00";
        const camColorName = NAME[camColorKey] ?? "?";

        // What color is UP and to the RIGHT in the viewfinder for each face
        const ORIENT: Record<string,{up:string,right:string,animRotY:number,desc:string}> = {
          U:  {up:"B",  right:"R", animRotY:0,   desc:"WHITE on top → tilt toward you, camera looks DOWN"},
          D:  {up:"F",  right:"R", animRotY:0,   desc:"YELLOW on top → flip cube, camera looks DOWN"},
          F:  {up:"U",  right:"R", animRotY:0,   desc:"Hold normally → camera sees FRONT face"},
          R:  {up:"U",  right:"B", animRotY:-90, desc:"Rotate cube 90° right → camera sees RIGHT face"},
          B:  {up:"U",  right:"L", animRotY:180, desc:"Rotate 180° → camera sees BACK face"},
          L:  {up:"U",  right:"F", animRotY:90,  desc:"Rotate cube 90° left → camera sees LEFT face"},
        };
        const orient = ORIENT[scanFace] ?? ORIENT.F;
        const upColorKey    = centerMap[orient.up]    ?? "X";
        const rightColorKey = centerMap[orient.right] ?? "X";

        return (
          <div style={{position:"fixed",inset:0,zIndex:50,display:"flex",
            flexDirection:"column",background:"#070710"}}>

            {/* ── TOP BAR ── */}
            <div style={{flexShrink:0,display:"flex",alignItems:"center",
              justifyContent:"space-between",padding:"12px 16px",
              borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
              <button className="btn" onClick={stopCamera} style={{
                color:"#aaa",background:"rgba(255,255,255,0.07)",borderRadius:12,
                padding:"7px 14px",fontSize:13,fontWeight:600,
                border:"1px solid rgba(255,255,255,0.1)"}}>✕ Stop</button>
              {/* Progress */}
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                {FACE_ORDER.map((fc,i)=>{
                  const ck=centerMap[fc]??"X";
                  const hex=HEX[ck]??"#555";
                  const done=!cubeState[fc]?.includes("X")&&fc!==scanFace;
                  const isCur=fc===scanFace;
                  return (
                    <button key={fc} className="btn"
                      onClick={()=>setScanFace(fc)}
                      style={{width:isCur?18:12,height:isCur?18:12,padding:0,
                        borderRadius:"50%",
                        background:done?"#4CAF50":isCur?hex:"rgba(255,255,255,0.12)",
                        border:isCur?`3px solid #fff`:"2px solid transparent",
                        transition:"all 0.3s",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:7,color:"#fff",fontWeight:900}}>
                      {done?"✓":""}
                    </button>
                  );
                })}
              </div>
              <button className="btn" onClick={()=>{
                const ni=seqIdx+1;
                if(ni<FACE_ORDER.length)setScanFace(FACE_ORDER[ni]);
                else stopCamera();
              }} style={{color:"#aaa",background:"rgba(255,255,255,0.07)",
                borderRadius:12,padding:"7px 14px",fontSize:13,fontWeight:600,
                border:"1px solid rgba(255,255,255,0.1)"}}>Skip →</button>
            </div>

            {/* ── ANIMATED CUBE (big, ~45% of screen) ── */}
            <div style={{flexShrink:0,
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
              padding:"10px 16px 6px",
              background:"rgba(0,0,0,0.3)"}}>

              {/* Step label */}
              <div style={{marginBottom:8,display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:12,height:12,borderRadius:"50%",
                  background:accentColor,boxShadow:`0 0 8px ${accentColor}`}}/>
                <span style={{color:"#fff",fontWeight:800,fontSize:14,letterSpacing:"-0.2px"}}>
                  Face {seqIdx+1} of 6 — <span style={{color:accentColor}}>{camColorName}</span>
                </span>
              </div>

              {/* Big animated CSS cube */}
              <div style={{perspective:"320px",width:160,height:160,
                display:"flex",alignItems:"center",justifyContent:"center"}}>
                {/* Slow continuous Y rotation wrapper — gives life to the cube */}
                <div style={{
                  transformStyle:"preserve-3d",
                  animation:"cubeSlowSpin 8s linear infinite",
                }}>
                <div key={scanFace} style={{
                  width:90,height:90,position:"relative",
                  transformStyle:"preserve-3d",
                  // Continuously spin then settle on target face
                  animation:`cubeSettle_${scanFace} 1.0s ease-out forwards`,
                }}>
                  {([
                    {fc:"F", tr:"translateZ(45px)",              nx:0,  ny:0},
                    {fc:"B", tr:"rotateY(180deg) translateZ(45px)", nx:0, ny:0},
                    {fc:"R", tr:"rotateY(90deg) translateZ(45px)",  nx:0, ny:0},
                    {fc:"L", tr:"rotateY(-90deg) translateZ(45px)", nx:0, ny:0},
                    {fc:"U", tr:"rotateX(90deg) translateZ(45px)",  nx:0, ny:0},
                    {fc:"D", tr:"rotateX(-90deg) translateZ(45px)", nx:0, ny:0},
                  ] as {fc:string,tr:string,nx:number,ny:number}[]).map(({fc,tr})=>{
                    const ck = centerMap[fc] ?? "X";
                    const hex = HEX[ck] ?? "#333";
                    const isTarget = fc === scanFace;
                    const bg = isTarget ? hex : (hex === "#FFFFFF" ? "#e8e8e0" : hex);
                    return (
                      <div key={fc} style={{
                        position:"absolute",width:90,height:90,transform:tr,
                        background:isTarget?bg:"#1a1a2e",
                        border:`${isTarget?3:1.5}px solid ${isTarget?"#fff":"rgba(255,255,255,0.12)"}`,
                        borderRadius:6,
                        boxShadow:isTarget
                          ?`0 0 30px ${hex}88, inset 0 0 15px rgba(255,255,255,0.15)`
                          :"none",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        overflow:"hidden",
                      }}>
                        {/* 3x3 grid lines on all faces */}
                        {isTarget && (
                          <>
                            <div style={{position:"absolute",inset:0,
                              display:"grid",gridTemplateColumns:"repeat(3,1fr)",
                              gridTemplateRows:"repeat(3,1fr)",gap:2,padding:4}}>
                              {Array(9).fill(0).map((_,i)=>(
                                <div key={i} style={{
                                  background:i===4
                                    ?"rgba(255,255,255,0.6)"
                                    :`${hex}cc`,
                                  borderRadius:2,
                                  border:"1px solid rgba(255,255,255,0.2)"
                                }}/>
                              ))}
                            </div>
                            {/* Camera icon overlay */}
                            <div style={{position:"absolute",inset:0,
                              display:"flex",alignItems:"center",justifyContent:"center",
                              fontSize:28,filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.5))"}}>
                              📷
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
                </div>{/* end slow spin wrapper */}
              </div>

              {/* Orientation labels around cube */}
              <div style={{display:"flex",gap:16,alignItems:"center",marginTop:6}}>
                {/* UP color */}
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <span style={{color:"#666",fontSize:11,fontWeight:600}}>⬆ TOP</span>
                  <div style={{width:20,height:20,borderRadius:5,
                    background:upColorKey==="W"?"#f0f0e8":HEX[upColorKey]??"#333",
                    border:"1.5px solid rgba(255,255,255,0.2)"}}/>
                  <span style={{color:"#aaa",fontSize:11,fontWeight:700}}>
                    {NAME[upColorKey]??"?"}
                  </span>
                </div>
                <div style={{width:1,height:16,background:"rgba(255,255,255,0.1)"}}/>
                {/* RIGHT color */}
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <span style={{color:"#666",fontSize:11,fontWeight:600}}>RIGHT →</span>
                  <div style={{width:20,height:20,borderRadius:5,
                    background:rightColorKey==="W"?"#f0f0e8":HEX[rightColorKey]??"#333",
                    border:"1.5px solid rgba(255,255,255,0.2)"}}/>
                  <span style={{color:"#aaa",fontSize:11,fontWeight:700}}>
                    {NAME[rightColorKey]??"?"}
                  </span>
                </div>
              </div>

              {/* Text instruction */}
              <p style={{color:"#777",fontSize:11,lineHeight:1.4,
                textAlign:"center",margin:"8px 0 0",
                maxWidth:280}}>
                {orient.desc}
              </p>
            </div>

            {/* ── CAMERA VIEWFINDER ── */}
            <div style={{position:"relative",flex:1,minHeight:0,overflow:"hidden"}}>
              <video ref={videoRef} autoPlay playsInline muted
                style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
              {/* 3×3 guide */}
              <div style={{position:"absolute",top:"50%",left:"50%",zIndex:2,
                transform:"translate(-50%,-50%)",
                width:"min(62vw,210px)",height:"min(62vw,210px)",
                border:`3px solid ${accentColor}`,borderRadius:10,
                boxShadow:`0 0 0 9999px rgba(0,0,0,0.42),0 0 24px ${accentColor}55`}}>
                {[1,2].map(i=>(
                  <div key={"h"+i} style={{position:"absolute",top:`${i*33.33}%`,
                    left:0,width:"100%",height:"1.5px",
                    background:`${accentColor}77`}}/>
                ))}
                {[1,2].map(i=>(
                  <div key={"v"+i} style={{position:"absolute",left:`${i*33.33}%`,
                    top:0,width:"1.5px",height:"100%",
                    background:`${accentColor}77`}}/>
                ))}
                {/* ↑ UP hint */}
                <div style={{position:"absolute",top:-22,left:0,right:0,
                  textAlign:"center",fontSize:10,fontWeight:800,
                  color:"#fff",textShadow:"0 1px 6px rgba(0,0,0,1)",
                  letterSpacing:"0.3px"}}>
                  ⬆ {NAME[upColorKey]} is UP
                </div>
              </div>
            </div>

            {/* ── SCAN BUTTON ── */}
            <div style={{flexShrink:0,background:"rgba(4,4,12,0.99)",
              padding:"12px 16px",
              paddingBottom:"max(18px,env(safe-area-inset-bottom))"}}>
              <button className="btn" onClick={captureAndScan} disabled={scanning}
                style={{width:"100%",padding:"17px",borderRadius:18,
                  fontWeight:800,fontSize:17,border:"none",
                  background:scanning
                    ?"rgba(255,255,255,0.07)"
                    :`linear-gradient(135deg,${accentColor},${accentColor}bb)`,
                  color:scanning?"#666":"#fff",
                  boxShadow:scanning?"none":`0 6px 24px ${accentColor}55`,
                  display:"flex",alignItems:"center",justifyContent:"center",gap:12,
                  transition:"all 0.2s"}}>
                {scanning
                  ? <><span style={{animation:"spin 1s linear infinite",fontSize:20,display:"inline-block"}}>⟳</span> Analyzing with AI…</>
                  : <><span style={{fontSize:22}}>📷</span> Scan — <span style={{textTransform:"uppercase",letterSpacing:"0.5px"}}>{camColorName}</span> face</>}
              </button>
            </div>
          </div>
        );
      })()}

      {/* BOTTOM PANEL */}
      <div style={{flexShrink:0,background:"rgba(255,255,255,0.95)",backdropFilter:"blur(30px)",
        borderTop:"1px solid rgba(0,0,0,0.06)",padding:"14px 16px 22px",
        borderRadius:"24px 24px 0 0",boxShadow:"0 -8px 40px rgba(0,0,0,0.18)",
        maxHeight:"50vh",overflowY:"auto"}}>

        {/* PAINT PHASE */}
        {phase==="paint" && (
          <div style={{animation:"fadeUp 0.3s ease"}}>
            {/* Color palette */}
            <div style={{display:"flex",gap:9,justifyContent:"center",marginBottom:14,alignItems:"flex-end"}}>
              {COLOR_KEYS.map(k => {
                const n = counts[k]; const ok = n===9; const over = n>9;
                return (
                  <div key={k} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                    <button className="btn" onClick={()=>setSelColor(k)} style={{
                      width:46,height:46,borderRadius:13,background:COLORS[k].bg,
                      border:"2px solid "+COLORS[k].border,
                      outline:selColor===k?"4px solid #FF6B00":"3px solid transparent",
                      outlineOffset:"2px",
                      transform:selColor===k?"scale(1.2)":"scale(1)",
                      boxShadow:selColor===k
                        ?"0 6px 20px rgba(255,107,0,0.5),0 0 0 2px #fff"
                        :"0 3px 10px rgba(0,0,0,0.2)",
                    }}/>
                    <span style={{fontSize:11,fontWeight:700,
                      color:ok?"#2E7D32":over?"#CC0000":"#aaa"}}>{n}/9</span>
                  </div>
                );
              })}
            </div>

            {/* Validation */}
            {validation.errors.length>0 && (
              <div style={{background:"#FFF8E1",border:"1px solid #FFCC80",borderRadius:12,
                padding:"9px 13px",marginBottom:12}}>
                {validation.errors.slice(0,2).map((e,i)=>(
                  <p key={i} style={{fontSize:12,color:"#E65100",margin:i?"3px 0 0":0}}>⚠ {e}</p>
                ))}
              </div>
            )}
            {validation.valid && (
              <div style={{background:"#E8F5E9",border:"1px solid #A5D6A7",borderRadius:12,
                padding:"9px 13px",marginBottom:12,textAlign:"center"}}>
                <span style={{fontSize:13,color:"#2E7D32",fontWeight:700}}>{tx("ready",lang)}</span>
              </div>
            )}

            {/* Primary actions */}
            <div style={{display:"flex",gap:9,justifyContent:"center",marginBottom:9}}>
              <button className="btn" onClick={handleSolve} disabled={!validation.valid} style={{
                flex:1,padding:"13px 0",borderRadius:16,fontWeight:800,fontSize:16,
                background:validation.valid?"linear-gradient(135deg,#FF6B00,#FFAA00)":"rgba(0,0,0,0.08)",
                color:validation.valid?"#fff":"#ccc",
                boxShadow:validation.valid?"0 6px 22px rgba(255,107,0,0.45)":"none"}}>
                {tx("solve",lang)} →
              </button>
              <button className="btn" onClick={startCamera} style={{
                flex:1,padding:"13px 0",borderRadius:16,fontWeight:700,fontSize:15,
                background:"linear-gradient(135deg,#1976D2,#42A5F5)",color:"#fff",
                boxShadow:"0 4px 16px rgba(25,118,210,0.4)"}}>
                {tx("scan",lang)}
              </button>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>
              {[
                {label:"↩ "+tx("undo",lang), action:handleUndo, disabled:!undoStack.length},
                {label:"🎯 "+tx("fill",lang), action:()=>syncState(JSON.parse(JSON.stringify(SOLVED))), disabled:false},
                {label:"✕ "+tx("reset",lang), action:handleReset, disabled:false},
              ].map(({label,action,disabled})=>(
                <button key={label} className="btn" onClick={action} disabled={disabled} style={{
                  flex:1,padding:"10px 8px",borderRadius:12,fontWeight:600,fontSize:13,
                  background:"rgba(0,0,0,0.06)",color:disabled?"#ccc":"#444",border:"none"}}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SOLVING / DONE */}
        {(phase==="solving"||phase==="done") && (
          <div style={{animation:"fadeUp 0.3s ease"}}>
            {/* Current move card */}
            {phase==="solving"&&curMove && (
              <div style={{display:"flex",alignItems:"center",gap:14,
                background:"linear-gradient(135deg,rgba(255,107,0,0.07),rgba(255,170,0,0.05))",
                border:"1.5px solid rgba(255,107,0,0.2)",borderRadius:18,padding:"13px 16px",marginBottom:12}}>
                <div style={{width:62,height:62,borderRadius:16,flexShrink:0,
                  background:"linear-gradient(135deg,#FF6B00,#FFAA00)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:26,fontWeight:900,fontFamily:"monospace",color:"#fff",
                  boxShadow:"0 6px 20px rgba(255,107,0,0.5)",animation:"pop 0.3s ease",
                  letterSpacing:"-1px"}}>
                  {curMove}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,color:"#aaa",fontWeight:600,marginBottom:3}}>
                    {tx("stepOf",lang)} {step+1} {tx("of",lang)} {solution.length}
                  </div>
                  <div style={{fontSize:14,fontWeight:700,color:"#222",marginBottom:7}}>
                    {lang==="es"?curInfo?.labelEs:curInfo?.label}
                  </div>
                  <div style={{height:5,background:"rgba(0,0,0,0.07)",borderRadius:3}}>
                    <div style={{height:"100%",borderRadius:3,transition:"width 0.4s ease",
                      background:"linear-gradient(90deg,#FF6B00,#FFAA00)",
                      width:`${solution.length?(step/solution.length)*100:0}%`}}/>
                  </div>
                </div>
              </div>
            )}
            {phase==="done" && (
              <div style={{textAlign:"center",padding:"8px 0 14px",animation:"pop 0.4s ease"}}>
                <div style={{fontSize:42}}>🎉</div>
                <div style={{fontSize:18,fontWeight:800,color:"#2E7D32",marginTop:4}}>
                  {tx("solved",lang)}
                </div>
              </div>
            )}

            {/* Move chips */}
            <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:12}}>
              {solution.map((m,i)=>(
                <span key={i} style={{
                  display:"inline-flex",alignItems:"center",padding:"4px 10px",
                  borderRadius:8,fontFamily:"monospace",fontSize:13,fontWeight:800,
                  background:i<step?"rgba(46,125,50,0.12)":i===step?"rgba(255,107,0,0.18)":"rgba(0,0,0,0.05)",
                  color:i<step?"#2E7D32":i===step?"#FF6B00":"#ccc",
                  border:`1px solid ${i===step?"rgba(255,107,0,0.35)":i<step?"rgba(46,125,50,0.25)":"transparent"}`,
                  textDecoration:i<step?"line-through":"none"}}>
                  {m}
                </span>
              ))}
            </div>

            {/* Player */}
            <div style={{display:"flex",gap:10,justifyContent:"center",alignItems:"center",marginBottom:10}}>
              <button className="btn" onClick={handlePrev} disabled={step===0||animRef.current} style={{
                width:50,height:50,borderRadius:"50%",fontSize:18,
                background:"rgba(0,0,0,0.07)",color:step===0?"#ccc":"#333",border:"none"}}>‹</button>
              {playing
                ?<button className="btn" onClick={handlePause} style={{
                    width:66,height:66,borderRadius:"50%",fontSize:26,
                    background:"linear-gradient(135deg,#FF6B00,#FFAA00)",color:"#fff",border:"none",
                    boxShadow:"0 6px 22px rgba(255,107,0,0.5)"}}>⏸</button>
                :<button className="btn" onClick={handlePlay} disabled={phase==="done"} style={{
                    width:66,height:66,borderRadius:"50%",fontSize:26,
                    background:phase==="done"?"rgba(0,0,0,0.08)":"linear-gradient(135deg,#FF6B00,#FFAA00)",
                    color:phase==="done"?"#ccc":"#fff",border:"none",
                    boxShadow:phase==="done"?"none":"0 6px 22px rgba(255,107,0,0.5)"}}>▶</button>}
              <button className="btn" onClick={handleNext} disabled={step>=solution.length} style={{
                width:50,height:50,borderRadius:"50%",fontSize:18,
                background:"rgba(0,0,0,0.07)",color:step>=solution.length?"#ccc":"#333",border:"none"}}>›</button>
              <div style={{display:"flex",gap:4,marginLeft:4}}>
                {[0.5,1,2].map(s=>(
                  <button key={s} className="btn" onClick={()=>setSpd(s)} style={{
                    width:36,height:36,borderRadius:9,fontWeight:800,fontSize:11,
                    background:spd===s?"#FF6B00":"rgba(0,0,0,0.06)",
                    color:spd===s?"#fff":"#999",border:"1px solid",
                    borderColor:spd===s?"#FF6B00":"rgba(0,0,0,0.1)"}}>
                    {s}×
                  </button>
                ))}
              </div>
            </div>

            <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
              <button className="btn" onClick={handleReset} style={{
                padding:"9px 18px",borderRadius:12,fontWeight:600,fontSize:13,
                background:"rgba(0,0,0,0.06)",color:"#444",border:"none"}}>
                {tx("back",lang)}
              </button>
              {step>0 && (
                <button className="btn" onClick={askAI} disabled={aiLoading} style={{
                  padding:"9px 18px",borderRadius:12,fontWeight:600,fontSize:13,
                  background:"rgba(0,0,0,0.06)",color:"#444",border:"none"}}>
                  {aiLoading?"⏳…":tx("aiBtn",lang)}
                </button>
              )}
            </div>
            {aiText && (
              <div style={{marginTop:10,background:"rgba(255,107,0,0.06)",
                border:"1px solid rgba(255,107,0,0.15)",borderRadius:12,padding:"10px 12px",
                animation:"fadeUp 0.3s ease"}}>
                <p style={{fontSize:13,color:"#555",lineHeight:1.55,margin:0}}>{aiText}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
