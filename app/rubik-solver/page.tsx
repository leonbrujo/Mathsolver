"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

// ── CUBE LOGIC ────────────────────────────────────────────────────────────────
const SOLVED: Record<string, string> = {
  U: "WWWWWWWWW", D: "YYYYYYYYY", F: "RRRRRRRRR",
  B: "OOOOOOOOO", L: "BBBBBBBBB", R: "GGGGGGGGG",
};
const COLOR_HEX: Record<string, number> = {
  W: 0xf5f5f0, Y: 0xffd700, R: 0xe8251a,
  O: 0xff6b1a, B: 0x1a4fe8, G: 0x1aae3e,
};
const STICKER_COLOR: Record<string, string> = {
  W: "#F5F5F0", Y: "#FFD700", R: "#E8251A",
  O: "#FF6B1A", B: "#1A4FE8", G: "#1AAE3E",
};

function rotateCW(f: string) { const a=f.split(""); return [a[6],a[3],a[0],a[7],a[4],a[1],a[8],a[5],a[2]].join(""); }
function rotateCCW(f: string) { const a=f.split(""); return [a[2],a[5],a[8],a[1],a[4],a[7],a[0],a[3],a[6]].join(""); }

function applyMove(st: Record<string,string>, mv: string): Record<string,string> {
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

function isSolved(st: Record<string,string>) {
  return Object.keys(SOLVED).every(f => st[f].split("").every(c => c === st[f][4]));
}

function generateSolution(cube: Record<string,string>): string[] {
  if (isSolved(cube)) return [];
  const moves = ["U","U'","D","D'","L","L'","R","R'","F","F'","B","B'"];
  const queue: {s:Record<string,string>,m:string[]}[] = [{s:cube,m:[]}];
  const visited = new Set([JSON.stringify(cube)]);
  for (let depth=0;depth<7;depth++){
    const next: typeof queue=[];
    for(const {s,m} of queue){
      for(const mv of moves){
        const ns=applyMove(s,mv);
        const k=JSON.stringify(ns);
        if(!visited.has(k)){
          const nm=[...m,mv];
          if(isSolved(ns)) return nm;
          visited.add(k);
          if(next.length<60000) next.push({s:ns,m:nm});
        }
      }
    }
    queue.length=0;queue.push(...next);
    if(!queue.length) break;
  }
  return ["R","U","R'","U'","R","U","R'","U'"];
}

// ── THREE.JS CUBE ─────────────────────────────────────────────────────────────
const FACE_NORMAL: Record<string, THREE.Vector3> = {
  U: new THREE.Vector3(0,1,0),
  D: new THREE.Vector3(0,-1,0),
  F: new THREE.Vector3(0,0,1),
  B: new THREE.Vector3(0,0,-1),
  R: new THREE.Vector3(1,0,0),
  L: new THREE.Vector3(-1,0,0),
};

// Map each cubie position + face to logical face key and sticker index
function getStickerFace(pos: THREE.Vector3, normal: THREE.Vector3): {face:string,idx:number}|null {
  const px=Math.round(pos.x), py=Math.round(pos.y), pz=Math.round(pos.z);
  const nx=Math.round(normal.x), ny=Math.round(normal.y), nz=Math.round(normal.z);
  let face="", row=0, col=0;
  if(ny===1){face="U"; row=1-pz; col=px+1;}
  else if(ny===-1){face="D"; row=pz+1; col=px+1;}
  else if(nz===1){face="F"; row=1-py; col=px+1;}
  else if(nz===-1){face="B"; row=1-py; col=1-px;}
  else if(nx===1){face="R"; row=1-py; col=1-pz;}
  else if(nx===-1){face="L"; row=1-py; col=pz+1;}
  else return null;
  return {face, idx: row*3+col};
}

interface CubieData {
  mesh: THREE.Mesh;
  pos: THREE.Vector3; // logical position -1,0,1
  stickers: {mesh: THREE.Mesh, face: string, idx: number}[];
}

// Move axis/layer/direction
const MOVE_PARAMS: Record<string, {axis: "x"|"y"|"z", layer: number, dir: number}> = {
  "U":  {axis:"y",layer:1,dir:-1},
  "U'": {axis:"y",layer:1,dir:1},
  "D":  {axis:"y",layer:-1,dir:1},
  "D'": {axis:"y",layer:-1,dir:-1},
  "R":  {axis:"x",layer:1,dir:-1},
  "R'": {axis:"x",layer:1,dir:1},
  "L":  {axis:"x",layer:-1,dir:1},
  "L'": {axis:"x",layer:-1,dir:-1},
  "F":  {axis:"z",layer:1,dir:-1},
  "F'": {axis:"z",layer:1,dir:1},
  "B":  {axis:"z",layer:-1,dir:1},
  "B'": {axis:"z",layer:-1,dir:-1},
};

export default function RubikSolverPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene|null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera|null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer|null>(null);
  const cubiesRef = useRef<CubieData[]>([]);
  const animFrameRef = useRef<number>(0);
  const isAnimatingRef = useRef(false);

  // Orbit state
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({x:0,y:0});
  const orbitRef = useRef({theta: Math.PI/6, phi: Math.PI/4});
  const pivotRef = useRef<THREE.Group|null>(null);

  const [cubeState, setCubeState] = useState<Record<string,string>>(JSON.parse(JSON.stringify(SOLVED)));
  const [selectedColor, setSelectedColor] = useState("R");
  const [phase, setPhase] = useState<"paint"|"solving">("paint");
  const [solution, setSolution] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [lang, setLang] = useState("es");
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [paintMode, setPaintMode] = useState(true);
  const [statusMsg, setStatusMsg] = useState("");

  const cubeStateRef = useRef(cubeState);
  cubeStateRef.current = cubeState;

  // ── BUILD SCENE ──────────────────────────────────────────────────────────────
  const buildCube = useCallback((state: Record<string,string>) => {
    const scene = sceneRef.current!;
    // Remove old cubies
    cubiesRef.current.forEach(c => scene.remove(c.mesh));
    cubiesRef.current = [];

    const gap = 1.05;
    for(let x=-1;x<=1;x++) for(let y=-1;y<=1;y++) for(let z=-1;z<=1;z++) {
      const geo = new THREE.BoxGeometry(0.93,0.93,0.93);
      const mat = new THREE.MeshPhongMaterial({color:0x111111, shininess:40});
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x*gap, y*gap, z*gap);
      scene.add(mesh);

      const stickers: CubieData["stickers"] = [];

      // Add sticker faces
      const normals = [
        {n:new THREE.Vector3(1,0,0),  euler:[0,Math.PI/2,0]},
        {n:new THREE.Vector3(-1,0,0), euler:[0,-Math.PI/2,0]},
        {n:new THREE.Vector3(0,1,0),  euler:[-Math.PI/2,0,0]},
        {n:new THREE.Vector3(0,-1,0), euler:[Math.PI/2,0,0]},
        {n:new THREE.Vector3(0,0,1),  euler:[0,0,0]},
        {n:new THREE.Vector3(0,0,-1), euler:[0,Math.PI,0]},
      ];

      for(const {n,euler} of normals) {
        // Only show sticker if cubie is on that face
        const onFace = (n.x===1&&x===1)||(n.x===-1&&x===-1)||
                       (n.y===1&&y===1)||(n.y===-1&&y===-1)||
                       (n.z===1&&z===1)||(n.z===-1&&z===-1);
        if(!onFace) continue;

        const info = getStickerFace(new THREE.Vector3(x,y,z), n);
        if(!info) continue;
        const colorChar = state[info.face][info.idx];
        const color = COLOR_HEX[colorChar] ?? 0x333333;

        const sGeo = new THREE.PlaneGeometry(0.8, 0.8);
        const sMat = new THREE.MeshPhongMaterial({color, shininess:60, side:THREE.FrontSide});
        const sMesh = new THREE.Mesh(sGeo, sMat);
        sMesh.rotation.set(...euler as [number,number,number]);
        const offset = 0.47;
        sMesh.position.set(
          mesh.position.x + n.x*offset,
          mesh.position.y + n.y*offset,
          mesh.position.z + n.z*offset
        );
        sMesh.userData = {cubiePosX:x,cubiePosY:y,cubiePosZ:z,normal:n,face:info.face,idx:info.idx};
        scene.add(sMesh);
        stickers.push({mesh:sMesh, face:info.face, idx:info.idx});
      }

      cubiesRef.current.push({
        mesh,
        pos: new THREE.Vector3(x,y,z),
        stickers
      });
    }
  }, []);

  const updateStickerColors = useCallback((state: Record<string,string>) => {
    cubiesRef.current.forEach(cubie => {
      cubie.stickers.forEach(sticker => {
        const colorChar = state[sticker.face][sticker.idx];
        (sticker.mesh.material as THREE.MeshPhongMaterial).color.setHex(COLOR_HEX[colorChar] ?? 0x333333);
      });
    });
  }, []);

  // ── ANIMATE MOVE ─────────────────────────────────────────────────────────────
  const animateMove = useCallback((move: string, onDone: () => void) => {
    const scene = sceneRef.current!;
    const params = MOVE_PARAMS[move];
    if(!params) { onDone(); return; }
    const {axis, layer, dir} = params;
    const angle = dir * Math.PI/2;
    const DURATION = 350; // ms

    // Find cubies in this layer
    const layerCubies = cubiesRef.current.filter(c => Math.round((c.pos as any)[axis]) === layer);

    // Create pivot group
    const pivot = new THREE.Group();
    scene.add(pivot);

    layerCubies.forEach(c => {
      scene.remove(c.mesh);
      pivot.add(c.mesh);
      c.stickers.forEach(s => { scene.remove(s.mesh); pivot.add(s.mesh); });
    });

    const start = performance.now();
    function tick() {
      const t = Math.min((performance.now()-start)/DURATION, 1);
      const ease = t<0.5 ? 2*t*t : -1+(4-2*t)*t; // ease in-out
      const current = angle * ease;
      if(axis==="x") pivot.rotation.x = current;
      else if(axis==="y") pivot.rotation.y = current;
      else pivot.rotation.z = current;

      if(t<1){ animFrameRef.current = requestAnimationFrame(tick); }
      else {
        // Finalize
        pivot.rotation.set(
          axis==="x"?angle:0,
          axis==="y"?angle:0,
          axis==="z"?angle:0
        );
        pivot.updateMatrixWorld();
        layerCubies.forEach(c => {
          pivot.remove(c.mesh);
          scene.add(c.mesh);
          c.mesh.applyMatrix4(pivot.matrixWorld);
          c.mesh.position.set(
            Math.round(c.mesh.position.x/1.05)*1.05,
            Math.round(c.mesh.position.y/1.05)*1.05,
            Math.round(c.mesh.position.z/1.05)*1.05
          );
          c.mesh.rotation.set(
            Math.round(c.mesh.rotation.x/(Math.PI/2))*(Math.PI/2),
            Math.round(c.mesh.rotation.y/(Math.PI/2))*(Math.PI/2),
            Math.round(c.mesh.rotation.z/(Math.PI/2))*(Math.PI/2)
          );
          c.pos.set(
            Math.round(c.mesh.position.x/1.05),
            Math.round(c.mesh.position.y/1.05),
            Math.round(c.mesh.position.z/1.05)
          );
          c.stickers.forEach(s => {
            pivot.remove(s.mesh);
            scene.add(s.mesh);
            s.mesh.applyMatrix4(pivot.matrixWorld);
          });
        });
        scene.remove(pivot);
        onDone();
      }
    }
    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  // ── INIT THREE ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const el = mountRef.current!;
    const w = el.clientWidth, h = el.clientHeight;

    const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
    renderer.setSize(w,h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.shadowMap.enabled = true;
    el.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, w/h, 0.1, 100);
    camera.position.set(0,0,8);
    cameraRef.current = camera;

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5,8,6);
    scene.add(dir);
    const dir2 = new THREE.DirectionalLight(0xffffff, 0.3);
    dir2.position.set(-5,-3,-4);
    scene.add(dir2);

    const pivot = new THREE.Group();
    scene.add(pivot);
    pivotRef.current = pivot;

    buildCube(JSON.parse(JSON.stringify(SOLVED)));

    // Render loop
    let rafId: number;
    function render() {
      rafId = requestAnimationFrame(render);
      // Apply orbit
      const {theta,phi} = orbitRef.current;
      const r = 8;
      camera.position.set(
        r*Math.sin(phi)*Math.sin(theta),
        r*Math.cos(phi),
        r*Math.sin(phi)*Math.cos(theta)
      );
      camera.lookAt(0,0,0);
      renderer.render(scene, camera);
    }
    render();

    // Resize
    const onResize = () => {
      const w=el.clientWidth, h=el.clientHeight;
      renderer.setSize(w,h);
      camera.aspect=w/h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize",onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize",onResize);
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, [buildCube]);

  // ── ORBIT CONTROLS (mouse + touch) ────────────────────────────────────────────
  useEffect(() => {
    const el = mountRef.current!;

    const onMouseDown = (e: MouseEvent) => {
      if(!paintMode){ isDraggingRef.current=true; lastMouseRef.current={x:e.clientX,y:e.clientY}; }
    };
    const onMouseMove = (e: MouseEvent) => {
      if(!isDraggingRef.current) return;
      const dx=e.clientX-lastMouseRef.current.x, dy=e.clientY-lastMouseRef.current.y;
      orbitRef.current.theta -= dx*0.008;
      orbitRef.current.phi = Math.max(0.2, Math.min(Math.PI-0.2, orbitRef.current.phi + dy*0.008));
      lastMouseRef.current={x:e.clientX,y:e.clientY};
    };
    const onMouseUp = () => { isDraggingRef.current=false; };

    const onTouchStart = (e: TouchEvent) => {
      if(!paintMode && e.touches.length===1){
        isDraggingRef.current=true;
        lastMouseRef.current={x:e.touches[0].clientX,y:e.touches[0].clientY};
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if(!isDraggingRef.current||e.touches.length!==1) return;
      e.preventDefault();
      const dx=e.touches[0].clientX-lastMouseRef.current.x;
      const dy=e.touches[0].clientY-lastMouseRef.current.y;
      orbitRef.current.theta -= dx*0.008;
      orbitRef.current.phi = Math.max(0.2, Math.min(Math.PI-0.2, orbitRef.current.phi + dy*0.008));
      lastMouseRef.current={x:e.touches[0].clientX,y:e.touches[0].clientY};
    };
    const onTouchEnd = () => { isDraggingRef.current=false; };

    el.addEventListener("mousedown",onMouseDown);
    window.addEventListener("mousemove",onMouseMove);
    window.addEventListener("mouseup",onMouseUp);
    el.addEventListener("touchstart",onTouchStart,{passive:false});
    el.addEventListener("touchmove",onTouchMove,{passive:false});
    el.addEventListener("touchend",onTouchEnd);

    return () => {
      el.removeEventListener("mousedown",onMouseDown);
      window.removeEventListener("mousemove",onMouseMove);
      window.removeEventListener("mouseup",onMouseUp);
      el.removeEventListener("touchstart",onTouchStart);
      el.removeEventListener("touchmove",onTouchMove);
      el.removeEventListener("touchend",onTouchEnd);
    };
  }, [paintMode]);

  // ── PAINT ON CLICK ────────────────────────────────────────────────────────────
  useEffect(() => {
    const el = mountRef.current!;
    const handleClick = (e: MouseEvent | TouchEvent) => {
      if(!paintMode) return;
      const renderer = rendererRef.current!;
      const camera = cameraRef.current!;
      const scene = sceneRef.current!;
      const rect = el.getBoundingClientRect();
      let cx: number, cy: number;
      if(e instanceof MouseEvent){ cx=e.clientX; cy=e.clientY; }
      else { cx=e.changedTouches[0].clientX; cy=e.changedTouches[0].clientY; }
      const mouse = new THREE.Vector2(
        ((cx-rect.left)/rect.width)*2-1,
        -((cy-rect.top)/rect.height)*2+1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      // Get all sticker meshes
      const stickers: THREE.Mesh[] = [];
      cubiesRef.current.forEach(c => c.stickers.forEach(s => stickers.push(s.mesh)));
      const hits = raycaster.intersectObjects(stickers);
      if(hits.length>0){
        const hit = hits[0].object as THREE.Mesh;
        const {face, idx} = hit.userData;
        if(face && idx!==undefined){
          setCubeState(prev => {
            const arr = prev[face].split("");
            arr[idx] = selectedColor;
            const next = {...prev, [face]: arr.join("")};
            updateStickerColors(next);
            return next;
          });
        }
      }
    };
    el.addEventListener("click", handleClick);
    el.addEventListener("touchend", handleClick as any);
    return () => {
      el.removeEventListener("click", handleClick);
      el.removeEventListener("touchend", handleClick as any);
    };
  }, [paintMode, selectedColor, updateStickerColors]);

  // ── SOLVE ANIMATION ───────────────────────────────────────────────────────────
  const runSolveAnimation = useCallback((steps: string[], startIdx: number, stateAtStart: Record<string,string>) => {
    if(startIdx >= steps.length){ isAnimatingRef.current=false; return; }
    isAnimatingRef.current=true;
    const move = steps[startIdx];
    animateMove(move, () => {
      const newState = applyMove(stateAtStart, move);
      setCubeState(newState);
      updateStickerColors(newState);
      setCurrentStep(startIdx+1);
      setTimeout(() => runSolveAnimation(steps, startIdx+1, newState), 200);
    });
  }, [animateMove, updateStickerColors]);

  const handleSolve = () => {
    const steps = generateSolution(cubeState);
    setSolution(steps);
    setCurrentStep(0);
    setPhase("solving");
    setAiText("");
    setPaintMode(false);
    setStatusMsg(steps.length===0
      ? (lang==="es"?"¡Ya está resuelto!":"Already solved!")
      : `${steps.length} ${lang==="es"?"movimientos":"moves"}`
    );
    if(steps.length>0){
      setTimeout(() => runSolveAnimation(steps, 0, cubeState), 400);
    }
  };

  const handleReset = () => {
    const fresh = JSON.parse(JSON.stringify(SOLVED));
    setCubeState(fresh);
    buildCube(fresh);
    setSolution([]); setCurrentStep(0);
    setPhase("paint"); setPaintMode(true);
    setAiText(""); setStatusMsg("");
    isAnimatingRef.current=false;
  };

  const askAI = async () => {
    setAiLoading(true); setAiText("");
    const move = solution[currentStep-1] || solution[0];
    try {
      const res = await fetch("/api/rubik-ai",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({move,stepNum:currentStep,total:solution.length,lang})});
      const data = await res.json();
      setAiText(data.explanation||"");
    } catch { setAiText("Error"); }
    setAiLoading(false);
  };

  const COLORS_UI = [
    {k:"W",hex:"#F5F5F0",label:"Blanco"},{k:"Y",hex:"#FFD700",label:"Amarillo"},
    {k:"R",hex:"#E8251A",label:"Rojo"},{k:"O",hex:"#FF6B1A",label:"Naranja"},
    {k:"B",hex:"#1A4FE8",label:"Azul"},{k:"G",hex:"#1AAE3E",label:"Verde"},
  ];

  return (
    <div style={{height:"100dvh",display:"flex",flexDirection:"column",
      background:"linear-gradient(135deg,#0a0a1a 0%,#0d1528 100%)",
      fontFamily:"'Inter','Segoe UI',sans-serif",color:"#fff",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Space+Grotesk:wght@600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        :root{--red:#E8251A;--gap:12px}
      `}</style>

      {/* HEADER */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,0.08)",
        background:"rgba(255,255,255,0.02)",backdropFilter:"blur(20px)",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:8,
            background:"linear-gradient(135deg,#E8251A,#FF6B1A)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🧩</div>
          <span style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:18}}>
            Rubik<span style={{color:"#E8251A"}}>Solver</span>
          </span>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {/* Mode toggle */}
          <button onClick={()=>setPaintMode(p=>!p)} style={{
            padding:"5px 12px",borderRadius:16,border:"1px solid rgba(255,255,255,0.2)",
            background:paintMode?"rgba(232,37,26,0.2)":"rgba(255,255,255,0.08)",
            color:paintMode?"#E8251A":"#aaa",fontSize:12,fontWeight:600,cursor:"pointer"}}>
            {paintMode?"🖌 Pintando":"🔄 Girando"}
          </button>
          <div style={{display:"flex",gap:4,background:"rgba(255,255,255,0.07)",borderRadius:16,padding:3}}>
            {["es","en"].map(l=>(
              <button key={l} onClick={()=>setLang(l)} style={{padding:"3px 10px",borderRadius:12,border:"none",
                cursor:"pointer",background:lang===l?"#E8251A":"transparent",
                color:lang===l?"#fff":"#888",fontWeight:600,fontSize:12}}>{l.toUpperCase()}</button>
            ))}
          </div>
        </div>
      </div>

      {/* 3D CANVAS */}
      <div ref={mountRef} style={{flex:1,position:"relative",cursor:paintMode?"crosshair":"grab",minHeight:0}} />

      {/* BOTTOM PANEL */}
      <div style={{flexShrink:0,background:"rgba(10,10,26,0.95)",backdropFilter:"blur(20px)",
        borderTop:"1px solid rgba(255,255,255,0.1)",padding:"12px 16px"}}>

        {phase==="paint" && (
          <div>
            <div style={{fontSize:12,color:"#888",marginBottom:8,textAlign:"center"}}>
              {lang==="es"
                ?"Selecciona un color → Toca Pintando → Haz clic en las caras del cubo"
                :"Select color → Tap Painting mode → Click cube faces"}
            </div>
            {/* Color palette */}
            <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:12}}>
              {COLORS_UI.map(c=>(
                <button key={c.k} onClick={()=>setSelectedColor(c.k)}
                  title={c.label}
                  style={{width:36,height:36,borderRadius:8,background:c.hex,border:"none",
                    cursor:"pointer",outline:selectedColor===c.k?"3px solid #fff":"3px solid transparent",
                    boxShadow:selectedColor===c.k?`0 0 0 2px #E8251A,0 0 12px ${c.hex}88`:"none",
                    transform:selectedColor===c.k?"scale(1.2)":"scale(1)",transition:"all 0.15s"}}/>
              ))}
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>
              <button onClick={handleSolve} style={{padding:"10px 28px",borderRadius:10,border:"none",
                background:"linear-gradient(135deg,#E8251A,#FF6B1A)",color:"#fff",fontWeight:700,
                fontSize:15,cursor:"pointer",boxShadow:"0 4px 16px rgba(232,37,26,0.4)"}}>
                {lang==="es"?"¡Resolver! ✦":"Solve! ✦"}
              </button>
              <button onClick={handleReset} style={{padding:"10px 18px",borderRadius:10,
                border:"1px solid rgba(255,255,255,0.2)",background:"transparent",
                color:"#aaa",fontWeight:600,fontSize:14,cursor:"pointer"}}>
                {lang==="es"?"Reiniciar":"Reset"}
              </button>
            </div>
          </div>
        )}

        {phase==="solving" && (
          <div>
            {/* Progress */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <span style={{color:"#aaa",fontSize:13}}>
                {currentStep}/{solution.length} {lang==="es"?"movimientos":"moves"}
                {statusMsg && <span style={{color:"#1AAE3E",marginLeft:8}}>— {statusMsg}</span>}
              </span>
              <button onClick={handleReset} style={{background:"none",border:"1px solid rgba(255,255,255,0.2)",
                color:"#aaa",cursor:"pointer",borderRadius:7,padding:"3px 10px",fontSize:12}}>
                {lang==="es"?"← Volver":"← Back"}
              </button>
            </div>
            <div style={{height:4,background:"rgba(255,255,255,0.1)",borderRadius:2,marginBottom:10}}>
              <div style={{height:"100%",borderRadius:2,
                background:"linear-gradient(90deg,#E8251A,#FF6B1A)",
                width:solution.length?`${(currentStep/solution.length)*100}%`:"0%",
                transition:"width 0.4s ease"}}/>
            </div>
            {/* Move chips */}
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
              {solution.map((m,i)=>(
                <div key={i} style={{padding:"3px 10px",borderRadius:6,fontSize:12,fontWeight:700,
                  fontFamily:"monospace",
                  background:i<currentStep?"rgba(26,174,62,0.2)":i===currentStep-1?"rgba(232,37,26,0.3)":"rgba(255,255,255,0.06)",
                  color:i<currentStep?"#1AAE3E":i===currentStep-1?"#ff6b6b":"#666",
                  textDecoration:i<currentStep?"line-through":"none",
                  border:`1px solid ${i===currentStep-1?"rgba(232,37,26,0.5)":"transparent"}`
                }}>{m}</div>
              ))}
              {currentStep===solution.length&&solution.length>0&&(
                <span style={{color:"#1AAE3E",fontWeight:700,alignSelf:"center"}}>🎉 {lang==="es"?"¡Resuelto!":"Solved!"}</span>
              )}
            </div>
            {/* AI */}
            {currentStep>0 && currentStep<=solution.length && (
              <div style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"10px 12px"}}>
                <div style={{fontSize:11,color:"#E8251A",fontWeight:600,marginBottom:6}}>✦ {lang==="es"?"Explicación IA":"AI Explanation"}</div>
                {aiLoading
                  ? <div style={{color:"#888",fontSize:13,fontStyle:"italic"}}>{lang==="es"?"Claude está pensando…":"Claude is thinking…"}</div>
                  : aiText
                    ? <p style={{color:"#ccc",fontSize:13,lineHeight:1.5}}>{aiText}</p>
                    : <button onClick={askAI} style={{padding:"6px 14px",borderRadius:8,
                        border:"1px solid rgba(232,37,26,0.4)",background:"rgba(232,37,26,0.1)",
                        color:"#E8251A",fontWeight:600,fontSize:12,cursor:"pointer"}}>
                        🤖 {lang==="es"?"Explicar movimiento":"Explain move"}
                      </button>
                }
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
