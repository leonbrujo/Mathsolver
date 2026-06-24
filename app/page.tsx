'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useUser, UserButton, SignIn } from '@clerk/nextjs'
import dynamic from 'next/dynamic'
import './landing.css'

const MathRenderer = dynamic(() => import('../components/MathRenderer'), { ssr: false })

interface Paso { numero: number; titulo: string; contenido: string }
interface Solucion {
  tipo: string; pasos: Paso[]; respuesta: string; consejo?: string
  usesLeft: number | null; isAdmin: boolean; isSubscribed: boolean
}

export default function Home() {
  const { user, isLoaded } = useUser()
  const [texto, setTexto] = useState('')
  const [imagen, setImagen] = useState<{ base64: string; preview: string; mimeType: string } | null>(null)
  const [solucion, setSolucion] = useState<Solucion | null>(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [usesLeft, setUsesLeft] = useState<number | null>(null)
  const [showPaywall, setShowPaywall] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('subscribed') === 'true') {
      setSubscribed(true)
      window.history.replaceState({}, '', '/')
    }
  }, [])

  const handleImagen = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setImagen({ base64: dataUrl.split(',')[1], preview: dataUrl, mimeType: file.type })
    }
    reader.readAsDataURL(file)
  }, [])

  const handleSubscribe = async () => {
    setCheckingOut(true)
    try {
      const res = await fetch('/api/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      setError('Failed to start checkout.')
    } finally {
      setCheckingOut(false)
    }
  }

  const resolver = async () => {
    if (!texto.trim() && !imagen) return
    setCargando(true); setError(''); setSolucion(null)
    try {
      const res = await fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: texto.trim(), imagenBase64: imagen?.base64, mimeType: imagen?.mimeType }),
      })
      if (res.status === 403) { setShowPaywall(true); setCargando(false); return }
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setSolucion(data); setUsesLeft(data.usesLeft)
      if (data.isSubscribed || data.isAdmin) setSubscribed(true)
      if (data.usesLeft === 0) setShowPaywall(true)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (e: any) {
      setError(e.message || 'Something went wrong.')
    } finally { setCargando(false) }
  }

  const limpiar = () => {
    setTexto(''); setImagen(null); setSolucion(null)
    setError(''); setShowPaywall(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  // Loading
  if (!isLoaded) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D0D1A' }}>
      <div style={{ width: 28, height: 28, border: '2px solid rgba(124,58,237,0.3)', borderTop: '2px solid #7C3AED', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  // Landing page
  if (!user) return (
    <div className="landing">
      <div className="g1"/><div className="g2"/><div className="g3"/>
      <div className="l-inner">

        <nav className="l-nav">
          <div className="l-logo">
            <div className="l-logo-box">∑</div>
            <div>
              <div className="l-logo-name">MathSolver AI</div>
              <div className="l-logo-by">by Quiz Quests</div>
            </div>
          </div>
          <div className="l-nav-right">
            <span className="l-nav-hint">✨ 3 free solves to start</span>
            <span className="l-nav-pill">Free to start</span>
          </div>
        </nav>

        <div className="l-hero">
          {/* Left */}
          <div>
            <div className="l-tag">
              <div className="l-tag-dot"/>
              AI-powered math tutor
            </div>
            <h1 className="l-h1">
              Stuck on math?<br/>
              <span className="l-grad">Get unstuck instantly.</span>
            </h1>
            <p className="l-sub">
              Type any problem or snap a photo of your homework. Get step-by-step solutions with full explanations — not just the answer.
            </p>

            <div className="l-pills">
              {[
                { l: 'Algebra', bg: 'rgba(124,58,237,.12)', b: 'rgba(124,58,237,.4)', c: '#C4B5FD' },
                { l: 'Calculus', bg: 'rgba(6,182,212,.12)', b: 'rgba(6,182,212,.4)', c: '#67E8F9' },
                { l: 'Geometry', bg: 'rgba(52,211,153,.12)', b: 'rgba(52,211,153,.4)', c: '#6EE7B7' },
                { l: 'Arithmetic', bg: 'rgba(236,72,153,.12)', b: 'rgba(236,72,153,.4)', c: '#F9A8D4' },
                { l: 'Statistics', bg: 'rgba(251,191,36,.12)', b: 'rgba(251,191,36,.4)', c: '#FCD34D' },
                { l: 'Trigonometry', bg: 'rgba(99,102,241,.12)', b: 'rgba(99,102,241,.4)', c: '#A5B4FC' },
              ].map(p => (
                <span key={p.l} className="l-pill" style={{ background: p.bg, borderColor: p.b, color: p.c }}>{p.l}</span>
              ))}
            </div>

            <div className="l-free">
              <span style={{ fontSize: 28, flexShrink: 0 }}>🎁</span>
              <div className="l-free-txt">
                <strong style={{ color: '#34D399' }}>3 free solves</strong> when you sign up — no credit card needed. Then <strong style={{ color: '#34D399' }}>$3.99/month</strong> for unlimited access.
              </div>
            </div>

            <div className="l-feat">
              {[
                { i: '📐', t: 'Step-by-step', d: 'Every problem broken into clear numbered steps with full explanations.' },
                { i: '📷', t: 'Snap a photo', d: 'Point your camera at any problem — textbook or handwritten notes.' },
                { i: '💡', t: 'Tips to learn', d: 'Each solution ends with a tip so you remember the concept next time.' },
              ].map(f => (
                <div key={f.t} className="l-fc">
                  <div className="l-fc-icon">{f.i}</div>
                  <div className="l-fc-title">{f.t}</div>
                  <div className="l-fc-desc">{f.d}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - login */}
          <div>
            <div className="l-card">
              <div className="l-card-title">Start solving now</div>
              <div className="l-card-sub">Join thousands of students</div>
              <SignIn
                appearance={{
                  elements: {
                    rootBox: { width: '100%' },
                    card: { background: 'transparent', border: 'none', boxShadow: 'none', padding: 0, width: '100%' },
                    headerTitle: { display: 'none' },
                    headerSubtitle: { display: 'none' },
                    socialButtonsBlockButton: { background: 'white', color: '#333', borderRadius: 10, fontSize: 14, fontWeight: '500' },
                    dividerLine: { background: 'rgba(255,255,255,0.1)' },
                    dividerText: { color: 'rgba(255,255,255,0.3)', fontSize: 12 },
                    formFieldInput: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', borderRadius: 10, fontSize: 14 },
                    formFieldLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
                    formButtonPrimary: { background: 'linear-gradient(135deg,#7C3AED,#06B6D4)', borderRadius: 10, fontSize: 14, fontWeight: '500' },
                    footerActionText: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
                    footerActionLink: { color: '#A78BFA', fontSize: 12 },
                    identityPreviewText: { color: 'white' },
                    identityPreviewEditButtonIcon: { color: '#A78BFA' },
                  }
                }}
              />
            </div>
            <div className="l-stats">
              {[{ n: '10k+', l: 'Problems solved' }, { n: '4.9★', l: 'Student rating' }, { n: 'Free', l: 'To get started' }].map(s => (
                <div key={s.l} className="l-stat">
                  <div className="l-stat-num">{s.n}</div>
                  <div className="l-stat-lbl">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // App (logged in)
  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#0F0F1A' }}>
      <style>{`
        @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .step-card{animation:slideUp .3s ease forwards}
      `}</style>

      <header style={{ position: 'sticky', top: 0, zIndex: 10, background: '#0F0F1A', borderBottom: '1px solid #2A2A4A', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#7C3AED,#EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: 14 }}>∑</div>
          <span style={{ fontWeight: 600, color: 'white', fontSize: 14 }}>MathSolver</span>
          <span style={{ fontSize: 11, color: '#6B7280' }}>by Quiz Quests</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!subscribed && usesLeft !== null && (
            <span style={{ fontSize: 11, color: '#9CA3AF', border: '1px solid #2A2A4A', padding: '4px 10px', borderRadius: 8 }}>
              {usesLeft} free {usesLeft === 1 ? 'solve' : 'solves'} left
            </span>
          )}
          {subscribed && <span style={{ fontSize: 11, color: '#00D4AA', border: '1px solid rgba(0,212,170,.3)', padding: '4px 10px', borderRadius: 8 }}>✓ Pro</span>}
          {(solucion || error || showPaywall) && (
            <button onClick={limpiar} style={{ fontSize: 11, color: '#9CA3AF', padding: '4px 10px', borderRadius: 8, border: '1px solid #2A2A4A', background: 'transparent', cursor: 'pointer' }}>New</button>
          )}
          <UserButton afterSignOutUrl="https://accounts.math.quiz-quests.com/sign-in?redirect_url=https://math.quiz-quests.com/" />
        </div>
      </header>

      <div style={{ flex: 1, padding: '24px 16px', maxWidth: 640, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {subscribed && !solucion && (
          <div style={{ background: 'rgba(0,212,170,.1)', border: '1px solid rgba(0,212,170,.3)', borderRadius: 16, padding: 12, textAlign: 'center', color: '#00D4AA', fontSize: 14 }}>🎉 Unlimited access unlocked!</div>
        )}

        {!solucion && !cargando && !showPaywall && (
          <div style={{ textAlign: 'center', paddingTop: 8 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'white', lineHeight: 1.3 }}>
              Solve any<br />
              <span style={{ background: 'linear-gradient(90deg,#A78BFA,#06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>math problem</span>
            </h1>
            <p style={{ color: '#6B7280', fontSize: 13, marginTop: 8 }}>Hi {user?.firstName || 'there'} 👋 — type or snap a photo</p>
          </div>
        )}

        {showPaywall && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, paddingTop: 24, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(124,58,237,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🔒</div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>You've used your 3 free solves</h2>
              <p style={{ color: '#6B7280', fontSize: 13, marginTop: 8 }}>Subscribe to keep solving unlimited problems</p>
            </div>
            <div style={{ background: '#1A1A2E', border: '1px solid #2A2A4A', borderRadius: 16, padding: 20, width: '100%', maxWidth: 340 }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: 'white', marginBottom: 4 }}>$3.99<span style={{ fontSize: 14, fontWeight: 400, color: '#6B7280' }}>/month</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12, marginBottom: 20, textAlign: 'left' }}>
                {['Unlimited math problems', 'Step-by-step solutions', 'Photo input support', 'All math topics'].map(f => (
                  <div key={f} style={{ fontSize: 13, color: '#D1D5DB' }}>✓ {f}</div>
                ))}
              </div>
              <button onClick={handleSubscribe} disabled={checkingOut} style={{ width: '100%', background: 'linear-gradient(135deg,#7C3AED,#06B6D4)', color: 'white', border: 'none', borderRadius: 12, padding: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: checkingOut ? 0.5 : 1 }}>
                {checkingOut ? 'Loading...' : 'Subscribe now →'}
              </button>
            </div>
            <button onClick={limpiar} style={{ color: '#6B7280', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer' }}>← Back</button>
          </div>
        )}

        {!solucion && !showPaywall && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <textarea value={texto} onChange={e => setTexto(e.target.value)} placeholder="e.g. Solve x² + 5x + 6 = 0" rows={3}
              style={{ width: '100%', background: '#1A1A2E', border: '1px solid #2A2A4A', borderRadius: 16, padding: '12px 16px', color: 'white', fontSize: 14, resize: 'none', outline: 'none' }}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) resolver() }}
            />
            {!imagen ? (
              <div onClick={() => fileRef.current?.click()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f?.type.startsWith('image/')) handleImagen(f) }}
                onDragOver={e => e.preventDefault()}
                style={{ border: '2px dashed #2A2A4A', borderRadius: 16, padding: 16, textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>📷</div>
                <p style={{ color: '#6B7280', fontSize: 12 }}>Tap to upload a photo of the problem</p>
                <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleImagen(f) }} />
              </div>
            ) : (
              <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid #2A2A4A' }}>
                <img src={imagen.preview} alt="Problem" style={{ width: '100%', maxHeight: 192, objectFit: 'contain', background: '#1A1A2E' }} />
                <button onClick={() => { setImagen(null); if (fileRef.current) fileRef.current.value = '' }}
                  style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(15,15,26,.8)', border: 'none', borderRadius: '50%', width: 28, height: 28, color: '#D1D5DB', cursor: 'pointer', fontSize: 12 }}>✕</button>
              </div>
            )}
            <button onClick={resolver} disabled={cargando || (!texto.trim() && !imagen)}
              style={{ width: '100%', background: 'linear-gradient(135deg,#7C3AED,#06B6D4)', color: 'white', border: 'none', borderRadius: 16, padding: 16, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: (cargando || (!texto.trim() && !imagen)) ? 0.4 : 1 }}>
              {cargando ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin .8s linear infinite', display: 'inline-block' }} />
                  Solving...
                </span>
              ) : 'Solve →'}
            </button>
          </div>
        )}

        {error && <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 16, padding: 16, color: '#FCA5A5', fontSize: 14 }}>{error}</div>}

        {cargando && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => <div key={i} style={{ background: '#1A1A2E', borderRadius: 16, height: 80, border: '1px solid #2A2A4A', opacity: .6 }} />)}
          </div>
        )}

        {solucion && (
          <div ref={resultRef} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span style={{ background: 'rgba(124,58,237,.2)', color: '#C4B5FD', fontSize: 12, fontWeight: 500, padding: '4px 12px', borderRadius: 20, border: '1px solid rgba(124,58,237,.3)', alignSelf: 'flex-start' }}>{solucion.tipo}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {solucion.pasos.map((paso, i) => (
                <div key={i} className="step-card" style={{ background: '#1A1A2E', border: '1px solid #2A2A4A', borderRadius: 16, padding: 16, animationDelay: `${i * 60}ms` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: '50%', background: 'rgba(124,58,237,.2)', color: '#C4B5FD', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>{paso.numero}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: 'white', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{paso.titulo}</p>
                      <div style={{ color: '#D1D5DB', fontSize: 13 }}><MathRenderer text={paso.contenido} /></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(0,212,170,.1)', border: '1px solid rgba(0,212,170,.3)', borderRadius: 16, padding: 16 }}>
              <p style={{ color: '#00D4AA', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>✓ Final Answer</p>
              <div style={{ color: 'white', fontSize: 16, fontWeight: 500 }}><MathRenderer text={solucion.respuesta} /></div>
            </div>
            {solucion.consejo && (
              <div style={{ background: '#1A1A2E', border: '1px solid #2A2A4A', borderRadius: 16, padding: 16 }}>
                <p style={{ color: '#FCD34D', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>💡 Tip</p>
                <p style={{ color: '#D1D5DB', fontSize: 13 }}>{solucion.consejo}</p>
              </div>
            )}
            {!subscribed && solucion.usesLeft === 0 && (
              <div style={{ background: 'rgba(124,58,237,.1)', border: '1px solid rgba(124,58,237,.3)', borderRadius: 16, padding: 16, textAlign: 'center' }}>
                <p style={{ color: 'white', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>That was your last free solve 🎓</p>
                <p style={{ color: '#6B7280', fontSize: 12, marginBottom: 12 }}>Subscribe for unlimited access</p>
                <button onClick={handleSubscribe} disabled={checkingOut}
                  style={{ background: 'linear-gradient(135deg,#7C3AED,#06B6D4)', color: 'white', border: 'none', borderRadius: 12, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: checkingOut ? 0.5 : 1 }}>
                  {checkingOut ? 'Loading...' : 'Get unlimited — $3.99/mo'}
                </button>
              </div>
            )}
            <button onClick={limpiar} style={{ width: '100%', border: '1px solid #2A2A4A', color: '#D1D5DB', background: 'transparent', borderRadius: 16, padding: 16, fontSize: 14, cursor: 'pointer' }}>
              + New problem
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
