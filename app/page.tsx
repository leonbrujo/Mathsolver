'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useUser, UserButton } from '@clerk/nextjs'
import dynamic from 'next/dynamic'

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
    if (isLoaded && !user) {
      window.location.href = 'https://accounts.math.quiz-quests.com/sign-in?redirect_url=https://math.quiz-quests.com/'
    }
  }, [isLoaded, user])

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
      setError('Failed to start checkout. Please try again.')
    } finally {
      setCheckingOut(false)
    }
  }

  const resolver = async () => {
    if (!texto.trim() && !imagen) return
    setCargando(true)
    setError('')
    setSolucion(null)

    try {
      const res = await fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: texto.trim(), imagenBase64: imagen?.base64, mimeType: imagen?.mimeType }),
      })

      if (res.status === 403) {
        setShowPaywall(true)
        setCargando(false)
        return
      }

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setSolucion(data)
      setUsesLeft(data.usesLeft)
      if (data.isSubscribed || data.isAdmin) setSubscribed(true)
      if (data.usesLeft === 0) setShowPaywall(true)

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setCargando(false)
    }
  }

  const limpiar = () => {
    setTexto(''); setImagen(null); setSolucion(null)
    setError(''); setShowPaywall(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  if (!isLoaded) return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <main className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-10 bg-surface border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">∑</div>
          <span className="font-semibold text-white text-sm">MathSolver</span>
          <span className="text-xs text-gray-500 hidden sm:block">by Quiz Quests</span>
        </div>
        <div className="flex items-center gap-3">
          {!subscribed && usesLeft !== null && (
            <span className="text-xs text-gray-400 border border-border px-2 py-1 rounded-lg">
              {usesLeft} free {usesLeft === 1 ? 'solve' : 'solves'} left
            </span>
          )}
          {subscribed && (
            <span className="text-xs text-accent border border-accent/30 px-2 py-1 rounded-lg">✓ Pro</span>
          )}
          {(solucion || error || showPaywall) && (
            <button onClick={limpiar} className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-border">
              New
            </button>
          )}
          <UserButton afterSignOutUrl="https://accounts.math.quiz-quests.com/sign-in?redirect_url=https://math.quiz-quests.com/" />
        </div>
      </header>

      <div className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full flex flex-col gap-5">

        {subscribed && !solucion && (
          <div className="bg-accent/10 border border-accent/30 rounded-2xl p-3 text-center text-accent text-sm font-medium">
            🎉 Unlimited access unlocked!
          </div>
        )}

        {!solucion && !cargando && !showPaywall && (
          <div className="text-center pt-2 pb-1">
            <h1 className="text-2xl font-bold text-white leading-tight">
              Solve any<br /><span className="text-primary">math problem</span>
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              Hi {user?.firstName || 'there'} 👋 — type or snap a photo
            </p>
          </div>
        )}

        {/* Paywall */}
        {showPaywall && (
          <div className="flex flex-col items-center gap-5 py-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-3xl">🔒</div>
            <div>
              <h2 className="text-xl font-bold text-white">You've used your 3 free solves</h2>
              <p className="text-gray-400 text-sm mt-2">Subscribe to keep solving unlimited problems</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5 w-full max-w-sm">
              <div className="text-3xl font-bold text-white mb-1">$4.99<span className="text-base font-normal text-gray-400">/month</span></div>
              <ul className="text-sm text-gray-300 text-left mt-3 flex flex-col gap-2 mb-5">
                <li>✓ Unlimited math problems</li>
                <li>✓ Step-by-step solutions</li>
                <li>✓ Photo input support</li>
                <li>✓ All math topics</li>
              </ul>
              <button onClick={handleSubscribe} disabled={checkingOut}
                className="w-full bg-primary hover:bg-purple-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all text-sm active:scale-95">
                {checkingOut ? 'Loading...' : 'Subscribe now →'}
              </button>
            </div>
            <button onClick={limpiar} className="text-gray-500 text-xs hover:text-gray-300">← Back</button>
          </div>
        )}

        {/* Input */}
        {!solucion && !showPaywall && (
          <div className="flex flex-col gap-3">
            <textarea value={texto} onChange={(e) => setTexto(e.target.value)}
              placeholder="e.g. Solve x² + 5x + 6 = 0" rows={3}
              className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-white placeholder-gray-500 text-sm resize-none focus:outline-none focus:border-primary transition-colors"
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) resolver() }}
            />
            {!imagen ? (
              <div onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f?.type.startsWith('image/')) handleImagen(f) }}
                onDragOver={(e) => e.preventDefault()} onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-border rounded-2xl p-4 text-center cursor-pointer hover:border-primary transition-colors">
                <div className="text-2xl mb-1">📷</div>
                <p className="text-gray-400 text-xs">Tap to upload a photo of the problem</p>
                <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImagen(f) }} />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-border">
                <img src={imagen.preview} alt="Problem" className="w-full max-h-48 object-contain bg-card" />
                <button onClick={() => { setImagen(null); if (fileRef.current) fileRef.current.value = '' }}
                  className="absolute top-2 right-2 bg-surface/80 backdrop-blur rounded-full w-7 h-7 flex items-center justify-center text-gray-300 hover:text-white text-xs">✕</button>
              </div>
            )}
            <button onClick={resolver} disabled={cargando || (!texto.trim() && !imagen)}
              className="w-full bg-primary hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-all text-sm active:scale-95">
              {cargando ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Solving...
                </span>
              ) : 'Solve →'}
            </button>
          </div>
        )}

        {error && <div className="bg-red-900/30 border border-red-500/40 rounded-2xl p-4 text-red-300 text-sm">{error}</div>}

        {cargando && (
          <div className="flex flex-col gap-3 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="bg-card rounded-2xl p-4 h-20 border border-border" />)}
          </div>
        )}

        {solucion && (
          <div ref={resultRef} className="flex flex-col gap-4">
            <span className="bg-primary/20 text-primary text-xs font-medium px-3 py-1 rounded-full border border-primary/30 self-start">{solucion.tipo}</span>

            <div className="flex flex-col gap-3">
              {solucion.pasos.map((paso, i) => (
                <div key={i} className="step-card bg-card border border-border rounded-2xl p-4" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center mt-0.5">{paso.numero}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold mb-1">{paso.titulo}</p>
                      <div className="text-gray-300 text-sm math-output"><MathRenderer text={paso.contenido} /></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-accent/10 border border-accent/30 rounded-2xl p-4">
              <p className="text-accent text-xs font-semibold uppercase tracking-wide mb-2">✓ Final Answer</p>
              <div className="text-white text-base font-medium math-output"><MathRenderer text={solucion.respuesta} /></div>
            </div>

            {solucion.consejo && (
              <div className="bg-card border border-border rounded-2xl p-4">
                <p className="text-yellow-400 text-xs font-semibold mb-1">💡 Tip</p>
                <p className="text-gray-300 text-sm">{solucion.consejo}</p>
              </div>
            )}

            {!subscribed && solucion.usesLeft === 0 && (
              <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 text-center">
                <p className="text-white text-sm font-semibold mb-1">That was your last free solve 🎓</p>
                <p className="text-gray-400 text-xs mb-3">Subscribe to keep solving unlimited problems</p>
                <button onClick={handleSubscribe} disabled={checkingOut}
                  className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-purple-600 transition-all active:scale-95 disabled:opacity-50">
                  {checkingOut ? 'Loading...' : 'Get unlimited access — $4.99/mo'}
                </button>
              </div>
            )}

            <button onClick={limpiar} className="w-full border border-border text-gray-300 hover:text-white hover:border-primary py-4 rounded-2xl transition-all text-sm font-medium active:scale-95">
              + New problem
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
