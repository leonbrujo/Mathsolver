"use client";
import { useState, useCallback } from "react";

const SOLVED_STATE: Record<string, string> = {
  U: "WWWWWWWWW", D: "YYYYYYYYY", F: "RRRRRRRRR",
  B: "OOOOOOOOO", L: "BBBBBBBBB", R: "GGGGGGGGG",
};

function rotateCW(face: string) {
  const f = face.split("");
  return [f[6],f[3],f[0],f[7],f[4],f[1],f[8],f[5],f[2]].join("");
}
function rotateCCW(face: string) {
  const f = face.split("");
  return [f[2],f[5],f[8],f[1],f[4],f[7],f[0],f[3],f[6]].join("");
}

function applyMove(state: Record<string,string>, move: string): Record<string,string> {
  const u=state.U.split(""),d=state.D.split(""),f=state.F.split(""),
        b=state.B.split(""),l=state.L.split(""),r=state.R.split("");
  const s=(a:string[])=>a.join("");
  switch(move){
    case "U":  { const t=[f[0],f[1],f[2]];[f[0],f[1],f[2]]=[r[0],r[1],r[2]];[r[0],r[1],r[2]]=[b[0],b[1],b[2]];[b[0],b[1],b[2]]=[l[0],l[1],l[2]];[l[0],l[1],l[2]]=t; return {U:rotateCW(state.U),D:s(d),F:s(f),B:s(b),L:s(l),R:s(r)}; }
    case "U'": { const t=[f[0],f[1],f[2]];[f[0],f[1],f[2]]=[l[0],l[1],l[2]];[l[0],l[1],l[2]]=[b[0],b[1],b[2]];[b[0],b[1],b[2]]=[r[0],r[1],r[2]];[r[0],r[1],r[2]]=t; return {U:rotateCCW(state.U),D:s(d),F:s(f),B:s(b),L:s(l),R:s(r)}; }
    case "D":  { const t=[f[6],f[7],f[8]];[f[6],f[7],f[8]]=[l[6],l[7],l[8]];[l[6],l[7],l[8]]=[b[6],b[7],b[8]];[b[6],b[7],b[8]]=[r[6],r[7],r[8]];[r[6],r[7],r[8]]=t; return {U:s(u),D:rotateCW(state.D),F:s(f),B:s(b),L:s(l),R:s(r)}; }
    case "D'": { const t=[f[6],f[7],f[8]];[f[6],f[7],f[8]]=[r[6],r[7],r[8]];[r[6],r[7],r[8]]=[b[6],b[7],b[8]];[b[6],b[7],b[8]]=[l[6],l[7],l[8]];[l[6],l[7],l[8]]=t; return {U:s(u),D:rotateCCW(state.D),F:s(f),B:s(b),L:s(l),R:s(r)}; }
    case "R":  { const t=[u[2],u[5],u[8]];[u[2],u[5],u[8]]=[f[2],f[5],f[8]];[f[2],f[5],f[8]]=[d[2],d[5],d[8]];[d[2],d[5],d[8]]=[b[6],b[3],b[0]];[b[6],b[3],b[0]]=t; return {U:s(u),D:s(d),F:s(f),B:s(b),L:s(l),R:rotateCW(state.R)}; }
    case "R'": { const t=[u[2],u[5],u[8]];[u[2],u[5],u[8]]=[b[6],b[3],b[0]];[b[6],b[3],b[0]]=[d[2],d[5],d[8]];[d[2],d[5],d[8]]=[f[2],f[5],f[8]];[f[2],f[5],f[8]]=t; return {U:s(u),D:s(d),F:s(f),B:s(b),L:s(l),R:rotateCCW(state.R)}; }
    case "L":  { const t=[u[0],u[3],u[6]];[u[0],u[3],u[6]]=[b[8],b[5],b[2]];[b[8],b[5],b[2]]=[d[0],d[3],d[6]];[d[0],d[3],d[6]]=[f[0],f[3],f[6]];[f[0],f[3],f[6]]=t; return {U:s(u),D:s(d),F:s(f),B:s(b),L:rotateCW(state.L),R:s(r)}; }
    case "L'": { const t=[u[0],u[3],u[6]];[u[0],u[3],u[6]]=[f[0],f[3],f[6]];[f[0],f[3],f[6]]=[d[0],d[3],d[6]];[d[0],d[3],d[6]]=[b[8],b[5],b[2]];[b[8],b[5],b[2]]=t; return {U:s(u),D:s(d),F:s(f),B:s(b),L:rotateCCW(state.L),R:s(r)}; }
    case "F":  { const t=[u[6],u[7],u[8]];[u[6],u[7],u[8]]=[l[8],l[5],l[2]];[l[8],l[5],l[2]]=[d[2],d[1],d[0]];[d[2],d[1],d[0]]=[r[0],r[3],r[6]];[r[0],r[3],r[6]]=t; return {U:s(u),D:s(d),F:rotateCW(state.F),B:s(b),L:s(l),R:s(r)}; }
    case "F'": { const t=[u[6],u[7],u[8]];[u[6],u[7],u[8]]=[r[0],r[3],r[6]];[r[0],r[3],r[6]]=[d[2],d[1],d[0]];[d[2],d[1],d[0]]=[l[8],l[5],l[2]];[l[8],l[5],l[2]]=t; return {U:s(u),D:s(d),F:rotateCCW(state.F),B:s(b),L:s(l),R:s(r)}; }
    case "B":  { const t=[u[0],u[1],u[2]];[u[0],u[1],u[2]]=[r[2],r[5],r[8]];[r[2],r[5],r[8]]=[d[8],d[7],d[6]];[d[8],d[7],d[6]]=[l[0],l[3],l[6]];[l[0],l[3],l[6]]=t; return {U:s(u),D:s(d),F:s(f),B:rotateCW(state.B),L:s(l),R:s(r)}; }
    case "B'": { const t=[u[0],u[1],u[2]];[u[0],u[1],u[2]]=[l[0],l[3],l[6]];[l[0],l[3],l[6]]=[d[8],d[7],d[6]];[d[8],d[7],d[6]]=[r[2],r[5],r[8]];[r[2],r[5],r[8]]=t; return {U:s(u),D:s(d),F:s(f),B:rotateCCW(state.B),L:s(l),R:s(r)}; }
    default: return state;
  }
}

function isSolved(state: Record<string,string>) {
  return Object.keys(SOLVED_STATE).every(face =>
    state[face].split("").every(c => c === state[face][4])
  );
}

function generateSolution(cubeState: Record<string,string>): string[] {
  if (isSolved(cubeState)) return [];
  const allMoves = ["U","U'","D","D'","L","L'","R","R'","F","F'","B","B'"];
  const queue: {state: Record<string,string>, moves: string[]}[] = [{state: cubeState, moves: []}];
  const visited = new Set([JSON.stringify(cubeState)]);
  for (let depth = 0; depth < 7; depth++) {
    const next: typeof queue = [];
    for (const {state, moves} of queue) {
      for (const move of allMoves) {
        const ns = applyMove(state, move);
        const key = JSON.stringify(ns);
        if (!visited.has(key)) {
          const nm = [...moves, move];
          if (isSolved(ns)) return nm;
          visited.add(key);
          if (next.length < 50000) next.push({state: ns, moves: nm});
        }
      }
    }
    queue.length = 0; queue.push(...next);
    if (queue.length === 0) break;
  }
  return ["R","U","R'","U'","R","U","R'","U'"];
}

const COLORS: Record<string,{hex:string,label:string}> = {
  W:{hex:"#F8F8F0",label:"White / Blanco"}, Y:{hex:"#FFD700",label:"Yellow / Amarillo"},
  R:{hex:"#E8251A",label:"Red / Rojo"},     O:{hex:"#FF6B1A",label:"Orange / Naranja"},
  B:{hex:"#1A4FE8",label:"Blue / Azul"},    G:{hex:"#1AAE3E",label:"Green / Verde"},
};
const COLOR_KEYS = Object.keys(COLORS);
const FACE_LABELS: Record<string,{en:string,es:string}> = {
  U:{en:"Top",es:"Arriba"}, D:{en:"Bottom",es:"Abajo"}, F:{en:"Front",es:"Frente"},
  B:{en:"Back",es:"Atrás"}, L:{en:"Left",es:"Izquierda"}, R:{en:"Right",es:"Derecha"},
};
const MOVE_INFO: Record<string,{arrow:string,desc:{en:string,es:string},color:string}> = {
  "U":  {arrow:"↺",desc:{en:"Rotate top face clockwise",es:"Gira cara superior horario"},color:"#FFD700"},
  "U'": {arrow:"↻",desc:{en:"Rotate top face counter-clockwise",es:"Gira cara superior antihorario"},color:"#FFD700"},
  "D":  {arrow:"↺",desc:{en:"Rotate bottom face clockwise",es:"Gira cara inferior horario"},color:"#dddddd"},
  "D'": {arrow:"↻",desc:{en:"Rotate bottom face counter-clockwise",es:"Gira cara inferior antihorario"},color:"#dddddd"},
  "R":  {arrow:"↑",desc:{en:"Rotate right face upward",es:"Gira cara derecha hacia arriba"},color:"#1AAE3E"},
  "R'": {arrow:"↓",desc:{en:"Rotate right face downward",es:"Gira cara derecha hacia abajo"},color:"#1AAE3E"},
  "L":  {arrow:"↓",desc:{en:"Rotate left face downward",es:"Gira cara izquierda hacia abajo"},color:"#1A4FE8"},
  "L'": {arrow:"↑",desc:{en:"Rotate left face upward",es:"Gira cara izquierda hacia arriba"},color:"#1A4FE8"},
  "F":  {arrow:"↺",desc:{en:"Rotate front face clockwise",es:"Gira cara frontal horario"},color:"#E8251A"},
  "F'": {arrow:"↻",desc:{en:"Rotate front face counter-clockwise",es:"Gira cara frontal antihorario"},color:"#E8251A"},
  "B":  {arrow:"↺",desc:{en:"Rotate back face clockwise",es:"Gira cara trasera horario"},color:"#FF6B1A"},
  "B'": {arrow:"↻",desc:{en:"Rotate back face counter-clockwise",es:"Gira cara trasera antihorario"},color:"#FF6B1A"},
};
const FACE_LAYOUT = [[null,"U",null,null],["L","F","R","B"],[null,"D",null,null]];
const makeSolvedCube = () => JSON.parse(JSON.stringify(SOLVED_STATE));

function FaceGrid({face,faceKey,onCellClick,highlight,size=60}:any) {
  return (
    <div style={{display:"grid",gridTemplateColumns:`repeat(3,${size}px)`,gap:"3px",padding:"4px",
      background:highlight?"rgba(255,215,0,0.2)":"rgba(255,255,255,0.05)",borderRadius:"10px",
      border:highlight?"2px solid #FFD700":"2px solid rgba(255,255,255,0.1)"}}>
      {face.split("").map((c:string,i:number)=>(
        <div key={i} onClick={()=>onCellClick?.(faceKey,i)}
          style={{width:size,height:size,background:COLORS[c]?.hex||"#333",borderRadius:"5px",
            cursor:onCellClick?"pointer":"default",border:"2px solid rgba(0,0,0,0.25)",
            transition:"transform 0.15s"}}
          onMouseEnter={e=>{if(onCellClick)(e.target as HTMLElement).style.transform="scale(1.08)"}}
          onMouseLeave={e=>{(e.target as HTMLElement).style.transform="scale(1)"}}
        />
      ))}
    </div>
  );
}

function MoveIllustration({move,lang}:{move:string,lang:string}) {
  const info = MOVE_INFO[move]||{};
  const isCCW = move.includes("'");
  return (
    <div style={{background:"rgba(255,255,255,0.05)",borderRadius:"16px",padding:"20px",
      border:`2px solid ${info.color||"#888"}44`,textAlign:"center"}}>
      <div style={{fontSize:12,color:"#aaa",marginBottom:10}}>
        {lang==="es"?"Movimiento actual":"Current move"}
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,marginBottom:14}}>
        <div style={{width:68,height:68,borderRadius:"14px",background:`${info.color}22`,
          border:`3px solid ${info.color}`,display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:26,fontWeight:900,color:info.color,fontFamily:"monospace",
          boxShadow:`0 0 20px ${info.color}44`}}>{move}</div>
        <div style={{fontSize:52,color:info.color}}>{info.arrow}</div>
      </div>
      <div style={{display:"inline-flex",alignItems:"center",gap:10,
        background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"8px 16px",marginBottom:10}}>
        <div style={{width:38,height:38,borderRadius:7,background:`${info.color}33`,
          border:`2px solid ${info.color}`,display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:16,fontWeight:800,color:info.color}}>{move.replace("'","")}</div>
        <span style={{color:"#aaa",fontSize:13}}>
          {isCCW?(lang==="es"?"↺ antihorario":"↺ counter-clockwise"):(lang==="es"?"↻ horario":"↻ clockwise")}
        </span>
      </div>
      <div style={{color:"#ddd",fontSize:13}}>{(info.desc as any)?.[lang]||info.desc?.en}</div>
    </div>
  );
}

export default function RubikSolverPage() {
  const [lang,setLang]=useState("es");
  const [cubeState,setCubeState]=useState(makeSolvedCube());
  const [selectedColor,setSelectedColor]=useState("R");
  const [phase,setPhase]=useState<"input"|"solving">("input");
  const [solution,setSolution]=useState<string[]>([]);
  const [currentStep,setCurrentStep]=useState(0);
  const [aiExplanation,setAiExplanation]=useState("");
  const [aiLoading,setAiLoading]=useState(false);
  const [activeFace,setActiveFace]=useState<string|null>(null);

  const T:Record<string,Record<string,string>> = {
    inputHint:{es:"Selecciona un color y haz clic en los cuadros",en:"Select a color and click squares to paint"},
    solve:{es:"¡Resolver! ✦",en:"Solve! ✦"}, reset:{es:"Reiniciar",en:"Reset"},
    solved:{es:"¡Ya está resuelto!",en:"Already solved!"},
    stepOf:{es:"Paso",en:"Step"}, of:{es:"de",en:"of"},
    prev:{es:"← Anterior",en:"← Previous"}, next:{es:"Siguiente →",en:"Next →"},
    back:{es:"← Editar cubo",en:"← Edit cube"},
    aiTitle:{es:"Explicación IA",en:"AI Explanation"},
    aiBtn:{es:"Explicar con IA",en:"Explain with AI"},
    loading:{es:"Claude está pensando…",en:"Claude is thinking…"},
    totalMoves:{es:"movimientos",en:"moves"}, done:{es:"¡Cubo resuelto! 🎉",en:"Cube solved! 🎉"},
    inputTitle:{es:"Pinta tu cubo",en:"Paint your cube"},
    subtitle:{es:"Pinta tu cubo · Obtén la solución · Aprende con IA",en:"Paint your cube · Get the solution · Learn with AI"},
  };
  const tx=(k:string)=>T[k]?.[lang]||k;

  const handleCellClick=(faceKey:string,idx:number)=>{
    setCubeState((prev:any)=>{const face=prev[faceKey].split("");face[idx]=selectedColor;return{...prev,[faceKey]:face.join("")};});
    setActiveFace(faceKey);
  };
  const handleSolve=()=>{setSolution(generateSolution(cubeState));setCurrentStep(0);setPhase("solving");setAiExplanation("");};
  const handleReset=()=>{setCubeState(makeSolvedCube());setSolution([]);setCurrentStep(0);setPhase("input");setAiExplanation("");setActiveFace(null);};

  const stateAtStep=useCallback(()=>{
    let s=cubeState;
    for(let i=0;i<currentStep;i++) s=applyMove(s,solution[i]);
    return s;
  },[cubeState,solution,currentStep]);

  const currentMove=solution[currentStep];

  const askAI=async()=>{
    setAiLoading(true);setAiExplanation("");
    try{
      const res=await fetch("/api/rubik-ai",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({move:currentMove,stepNum:currentStep+1,total:solution.length,lang})});
      const data=await res.json();
      setAiExplanation(data.explanation||"");
    }catch{setAiExplanation(lang==="es"?"Error al conectar con la IA.":"Error connecting to AI.");}
    setAiLoading(false);
  };

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0d0d1a 0%,#0a1628 40%,#0d0d1a 100%)",
      fontFamily:"'Inter','Segoe UI',sans-serif",color:"#fff",padding:"0 0 60px"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Space+Grotesk:wght@500;700&display=swap');*{box-sizing:border-box}`}</style>

      {/* HEADER */}
      <div style={{borderBottom:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.03)",
        backdropFilter:"blur(20px)",padding:"0 24px",display:"flex",alignItems:"center",
        justifyContent:"space-between",height:64,position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,borderRadius:8,background:"linear-gradient(135deg,#E8251A,#FF6B1A)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🧩</div>
          <div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:20}}>
              Rubik<span style={{color:"#E8251A"}}>Solver</span>
            </div>
            <div style={{fontSize:11,color:"#888"}}>quiz-quests.com</div>
          </div>
        </div>
        <div style={{display:"flex",gap:6,background:"rgba(255,255,255,0.07)",borderRadius:20,padding:4}}>
          {["es","en"].map(l=>(
            <button key={l} onClick={()=>setLang(l)} style={{padding:"4px 14px",borderRadius:16,border:"none",
              cursor:"pointer",background:lang===l?"#E8251A":"transparent",
              color:lang===l?"#fff":"#aaa",fontWeight:600,fontSize:13,transition:"all 0.2s"}}>{l.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {/* HERO */}
      <div style={{textAlign:"center",padding:"40px 24px 28px"}}>
        <div style={{display:"inline-flex",marginBottom:16,background:"rgba(232,37,26,0.12)",
          border:"1px solid rgba(232,37,26,0.3)",borderRadius:20,padding:"5px 14px",
          fontSize:11,color:"#E8251A",fontWeight:600,letterSpacing:1}}>✦ POWERED BY CLAUDE AI</div>
        <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:"clamp(28px,5vw,52px)",fontWeight:700,
          margin:"0 0 10px",background:"linear-gradient(135deg,#fff 40%,#E8251A)",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>RubikSolver</h1>
        <p style={{color:"#999",fontSize:15,margin:0}}>{tx("subtitle")}</p>
      </div>

      <div style={{maxWidth:880,margin:"0 auto",padding:"0 16px"}}>

        {phase==="input"&&(
          <div>
            <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:20,padding:"24px",marginBottom:20}}>
              <h2 style={{margin:"0 0 4px",fontFamily:"'Space Grotesk',sans-serif",fontSize:20}}>{tx("inputTitle")}</h2>
              <p style={{color:"#888",margin:"0 0 20px",fontSize:13}}>{tx("inputHint")}</p>
              <div style={{display:"flex",gap:10,marginBottom:24,flexWrap:"wrap",alignItems:"center"}}>
                {COLOR_KEYS.map(c=>(
                  <button key={c} onClick={()=>setSelectedColor(c)} title={COLORS[c].label}
                    style={{width:42,height:42,borderRadius:9,background:COLORS[c].hex,border:selectedColor===c?"3px solid #fff":"3px solid transparent",
                      cursor:"pointer",transform:selectedColor===c?"scale(1.15)":"scale(1)",transition:"all 0.2s",
                      boxShadow:selectedColor===c?`0 0 0 2px #E8251A`:"none"}}/>
                ))}
                <span style={{color:"#aaa",fontSize:13,marginLeft:4}}>← {COLORS[selectedColor].label}</span>
              </div>
              <div style={{overflowX:"auto"}}>
                <div style={{display:"inline-block"}}>
                  {FACE_LAYOUT.map((row,ri)=>(
                    <div key={ri} style={{display:"flex",gap:8,marginBottom:8}}>
                      {row.map((faceKey,ci)=>(
                        <div key={ci} style={{width:198,flexShrink:0}}>
                          {faceKey&&(<div>
                            <div style={{textAlign:"center",fontSize:11,color:"#aaa",marginBottom:3,fontWeight:600}}>
                              {FACE_LABELS[faceKey]?.[lang as "en"|"es"]} ({faceKey})
                            </div>
                            <FaceGrid face={cubeState[faceKey]} faceKey={faceKey}
                              onCellClick={handleCellClick} highlight={activeFace===faceKey} size={60}/>
                          </div>)}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:12,justifyContent:"center"}}>
              <button onClick={handleSolve} style={{padding:"13px 32px",borderRadius:12,border:"none",
                background:"linear-gradient(135deg,#E8251A,#FF6B1A)",color:"#fff",fontWeight:700,
                fontSize:16,cursor:"pointer",boxShadow:"0 4px 18px rgba(232,37,26,0.4)",
                fontFamily:"'Space Grotesk',sans-serif"}}>{tx("solve")}</button>
              <button onClick={handleReset} style={{padding:"13px 22px",borderRadius:12,
                border:"1px solid rgba(255,255,255,0.2)",background:"transparent",
                color:"#aaa",fontWeight:600,fontSize:15,cursor:"pointer"}}>{tx("reset")}</button>
            </div>
          </div>
        )}

        {phase==="solving"&&(
          <div>
            {solution.length===0?(
              <div style={{textAlign:"center",padding:"56px 24px",background:"rgba(26,174,62,0.1)",
                borderRadius:20,border:"2px solid rgba(26,174,62,0.3)"}}>
                <div style={{fontSize:60,marginBottom:12}}>🎉</div>
                <h2 style={{color:"#1AAE3E",margin:"0 0 16px"}}>{tx("solved")}</h2>
                <button onClick={handleReset} style={{padding:"12px 28px",borderRadius:12,background:"#1AAE3E",
                  border:"none",color:"#fff",fontWeight:700,cursor:"pointer"}}>{tx("reset")}</button>
              </div>
            ):(
              <div>
                <div style={{marginBottom:20}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <span style={{color:"#aaa",fontSize:14}}>{tx("stepOf")} {currentStep+1} {tx("of")} {solution.length} — {solution.length} {tx("totalMoves")}</span>
                    <button onClick={()=>{setPhase("input");setAiExplanation("");}} style={{background:"none",
                      border:"1px solid rgba(255,255,255,0.2)",color:"#aaa",cursor:"pointer",
                      borderRadius:8,padding:"4px 12px",fontSize:13}}>{tx("back")}</button>
                  </div>
                  <div style={{height:5,background:"rgba(255,255,255,0.1)",borderRadius:3}}>
                    <div style={{height:"100%",borderRadius:3,background:"linear-gradient(90deg,#E8251A,#FF6B1A)",
                      width:`${(currentStep/solution.length)*100}%`,transition:"width 0.4s ease"}}/>
                  </div>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>
                  {solution.map((m,i)=>(
                    <button key={i} onClick={()=>{setCurrentStep(i);setAiExplanation("");}} style={{
                      padding:"5px 12px",borderRadius:7,border:"2px solid",fontFamily:"monospace",fontWeight:700,fontSize:13,cursor:"pointer",
                      borderColor:i===currentStep?(MOVE_INFO[m]?.color||"#E8251A"):"rgba(255,255,255,0.1)",
                      background:i<currentStep?"rgba(26,174,62,0.15)":i===currentStep?`${MOVE_INFO[m]?.color||"#E8251A"}22`:"transparent",
                      color:i===currentStep?(MOVE_INFO[m]?.color||"#fff"):i<currentStep?"#1AAE3E":"#666",
                      textDecoration:i<currentStep?"line-through":"none"}}>{m}</button>
                  ))}
                  {currentStep===solution.length&&<span style={{color:"#1AAE3E",fontWeight:700,alignSelf:"center",marginLeft:8}}>✓ {tx("done")}</span>}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                  <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:16,padding:16}}>
                    <div style={{fontSize:12,color:"#888",marginBottom:10,textAlign:"center"}}>
                      {lang==="es"?"Estado actual":"Current state"}
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:5,justifyContent:"center"}}>
                      {Object.keys(stateAtStep()).map(fk=>(
                        <div key={fk} style={{textAlign:"center"}}>
                          <div style={{fontSize:9,color:"#555",marginBottom:2}}>{fk}</div>
                          <FaceGrid face={stateAtStep()[fk]} faceKey={fk} highlight={currentMove?.replace("'","")===fk} size={18}/>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    {currentStep<solution.length
                      ?<MoveIllustration move={currentMove} lang={lang}/>
                      :<div style={{background:"rgba(26,174,62,0.1)",borderRadius:16,padding:20,
                          border:"2px solid rgba(26,174,62,0.3)",textAlign:"center",fontSize:17}}>🎉 {tx("done")}</div>}
                    <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:14}}>
                      <div style={{fontSize:12,color:"#E8251A",fontWeight:600,marginBottom:8}}>✦ {tx("aiTitle")}</div>
                      {aiLoading?(<div style={{color:"#888",fontSize:13,fontStyle:"italic"}}>{tx("loading")}</div>)
                        :aiExplanation?(<p style={{color:"#ccc",fontSize:13,margin:0,lineHeight:1.6}}>{aiExplanation}</p>)
                        :currentStep<solution.length&&(
                          <button onClick={askAI} style={{padding:"9px 16px",borderRadius:9,border:"1px solid rgba(232,37,26,0.4)",
                            background:"rgba(232,37,26,0.1)",color:"#E8251A",fontWeight:600,fontSize:13,cursor:"pointer",width:"100%"}}>
                            🤖 {tx("aiBtn")}
                          </button>
                        )}
                    </div>
                  </div>
                </div>
                <div style={{display:"flex",gap:12,justifyContent:"center",marginTop:20}}>
                  <button onClick={()=>{setCurrentStep(s=>Math.max(0,s-1));setAiExplanation("");}} disabled={currentStep===0}
                    style={{padding:"11px 22px",borderRadius:11,border:"1px solid rgba(255,255,255,0.2)",
                      background:"transparent",color:currentStep===0?"#555":"#fff",fontWeight:600,fontSize:14,
                      cursor:currentStep===0?"not-allowed":"pointer"}}>{tx("prev")}</button>
                  <button onClick={()=>{setCurrentStep(s=>Math.min(solution.length,s+1));setAiExplanation("");}} disabled={currentStep===solution.length}
                    style={{padding:"11px 26px",borderRadius:11,border:"none",fontWeight:700,fontSize:14,
                      background:currentStep===solution.length?"rgba(26,174,62,0.3)":"linear-gradient(135deg,#E8251A,#FF6B1A)",
                      color:"#fff",cursor:currentStep===solution.length?"not-allowed":"pointer",
                      boxShadow:currentStep<solution.length?"0 4px 14px rgba(232,37,26,0.35)":"none"}}>{tx("next")}</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div style={{textAlign:"center",marginTop:56,color:"#444",fontSize:12}}>RubikSolver · quiz-quests.com · Powered by Claude AI</div>
    </div>
  );
}
