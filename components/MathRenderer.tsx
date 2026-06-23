'use client'

import { useEffect, useRef } from 'react'

interface Props {
  text: string
}

export default function MathRenderer({ text }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current || !text) return

    const render = async () => {
      try {
        const katex = (await import('katex')).default

        // Split text into math and non-math parts
        const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]*?\$)/g)

        const html = parts.map((part) => {
          if (part.startsWith('$$') && part.endsWith('$$')) {
            const math = part.slice(2, -2)
            try {
              return katex.renderToString(math, { displayMode: true, throwOnError: false })
            } catch {
              return `<span>${part}</span>`
            }
          } else if (part.startsWith('$') && part.endsWith('$')) {
            const math = part.slice(1, -1)
            try {
              return katex.renderToString(math, { displayMode: false, throwOnError: false })
            } catch {
              return `<span>${part}</span>`
            }
          }
          return part.replace(/\n/g, '<br/>')
        }).join('')

        if (ref.current) ref.current.innerHTML = html
      } catch (e) {
        if (ref.current) ref.current.textContent = text
      }
    }

    render()
  }, [text])

  return <div ref={ref} className="leading-relaxed" />
}
