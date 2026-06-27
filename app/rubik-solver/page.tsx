"use client";
import { useState, useRef, useEffect, useCallback } from "react";

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
  const [scanFace, setScanFace] = useState<string>("F");
  const [scanning, setScanning] = useState(false);
  const [camStream, setCamStream] = useState<MediaStream|null>(null);
  const [selectedFaceHl, setSelectedFaceHl] = useState<string|undefined>();

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
    if (showScan && videoRef.current && pendingStreamRef.current) {
      videoRef.current.srcObject = pendingStreamRef.current;
      videoRef.current.play().catch(()=>{});
    }
  }, [showScan]);

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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment",width:{ideal:1280},height:{ideal:720}}});
      pendingStreamRef.current = stream;
      setCamStream(stream);
      setShowScan(true);
      // stream assigned to video via useEffect after render
    } catch(e) { alert("Camera access denied. Please allow camera permissions."); }
  };
  const stopCamera = () => {
    camStream?.getTracks().forEach(t=>t.stop());
    setCamStream(null); setShowScan(false); setScanning(false);
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
        const arr=[...data.colors]; arr[4]=CENTERS[scanFace];
        syncState({...stateRef.current,[scanFace]:arr.join("")});
        const order = ["F","R","B","L","U","D"];
        const next = order[order.indexOf(scanFace)+1];
        if (next) setScanFace(next); else stopCamera();
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
      {showScan && (
        <div style={{position:"fixed",inset:0,zIndex:50,display:"flex",flexDirection:"column",background:"#000"}}>
          {/* Video area */}
          <div style={{position:"relative",flex:1,minHeight:0,overflow:"hidden"}}>
            <video ref={videoRef} autoPlay playsInline muted
              style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
            {/* Top bar */}
            <div style={{position:"absolute",top:0,left:0,right:0,zIndex:3,
              display:"flex",alignItems:"center",justifyContent:"space-between",
              padding:"14px 16px",
              background:"linear-gradient(to bottom,rgba(0,0,0,0.75),transparent)"}}>
              <button className="btn" onClick={stopCamera} style={{
                color:"#fff",background:"rgba(0,0,0,0.5)",borderRadius:20,
                padding:"8px 18px",fontSize:14,fontWeight:600,
                border:"1px solid rgba(255,255,255,0.25)"}}>
                ✕ Cancel
              </button>
              <span style={{fontWeight:700,fontSize:15,color:"#FFD700",
                textShadow:"0 1px 6px rgba(0,0,0,0.9)"}}>
                📷 {FACE_LABEL[scanFace]?.en} face
              </span>
              <div style={{width:80}}/>
            </div>
            {/* 3x3 guide */}
            <div style={{position:"absolute",top:"50%",left:"50%",zIndex:2,
              transform:"translate(-50%,-50%)",
              width:"min(70vw,250px)",height:"min(70vw,250px)",
              border:"3px solid #FFD700",borderRadius:10,
              boxShadow:"0 0 0 9999px rgba(0,0,0,0.5),0 0 20px rgba(255,215,0,0.4)"}}>
              {[1,2].map(i=>(
                <div key={"h"+i} style={{position:"absolute",top:`${i*33.33}%`,left:0,
                  width:"100%",height:"1.5px",background:"rgba(255,215,0,0.6)"}}/>
              ))}
              {[1,2].map(i=>(
                <div key={"v"+i} style={{position:"absolute",left:`${i*33.33}%`,top:0,
                  width:"1.5px",height:"100%",background:"rgba(255,215,0,0.6)"}}/>
              ))}
            </div>
          </div>

          {/* Bottom controls — fixed, always on screen */}
          <div style={{flexShrink:0,background:"#0a0a0a",
            padding:"12px 16px 20px",
            paddingBottom:"max(20px,env(safe-area-inset-bottom))"}}>
            {/* Face buttons */}
            <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:12,flexWrap:"wrap"}}>
              {["F","R","B","L","U","D"].map(fc=>(
                <button key={fc} className="btn" onClick={()=>setScanFace(fc)} style={{
                  padding:"7px 12px",borderRadius:10,fontSize:13,fontWeight:700,
                  background:scanFace===fc?"#FF6B00":"rgba(255,255,255,0.07)",
                  color:scanFace===fc?"#fff":"#777",
                  border:`1.5px solid ${scanFace===fc?"#FF6B00":"rgba(255,255,255,0.12)"}`}}>
                  {FACE_LABEL[fc]?.en}
                </button>
              ))}
            </div>
            {/* Capture button */}
            <button
              className="btn"
              onClick={captureAndScan}
              disabled={scanning}
              style={{
                width:"100%",padding:"17px",borderRadius:18,
                fontWeight:800,fontSize:17,border:"none",
                background:scanning
                  ?"rgba(255,255,255,0.08)"
                  :"linear-gradient(135deg,#FF6B00,#FFAA00)",
                color:scanning?"#888":"#fff",
                boxShadow:scanning?"none":"0 6px 24px rgba(255,107,0,0.55)",
                display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
              {scanning
                ? <span>⏳ Analyzing with AI…</span>
                : <span>📷 &nbsp;Scan {FACE_LABEL[scanFace]?.en} face</span>}
            </button>
          </div>
        </div>
      )}

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
