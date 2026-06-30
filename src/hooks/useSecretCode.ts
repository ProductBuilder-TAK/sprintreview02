import { useEffect, useRef } from 'react'

interface SecretCode {
  name: string
  sequence: string[]
  message: string
}

const SECRET_CODES: SecretCode[] = [
  { name: 'starac', sequence: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'], message: 'StarAc débloqué !' },
  { name: 'howmany', sequence: ['ArrowLeft', 'ArrowLeft', 'ArrowRight', 'ArrowRight'], message: 'How Many débloqué !' },
  { name: 'hide-secrets', sequence: ['ArrowDown', 'ArrowDown', 'ArrowUp', 'ArrowUp'], message: 'Onglets secrets masqués' },
  { name: 'individual', sequence: ['ArrowRight', 'ArrowRight', 'ArrowLeft', 'ArrowLeft'], message: 'Simulation individuelle débloquée !' },
  { name: 'pearson', sequence: ['p', 'e', 'a', 'r'], message: 'Corrélation Pearson débloquée !' },
  { name: 'burndown', sequence: ['b', 'u', 'r', 'n'], message: 'Burndown Chart débloqué !' },
]

const MAX_BUFFER = Math.max(...SECRET_CODES.map((c) => c.sequence.length))

export function useSecretCode(onUnlock: (code: string, message: string) => void) {
  const bufferRef = useRef<string[]>([])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

      bufferRef.current.push(e.key)
      if (bufferRef.current.length > MAX_BUFFER) {
        bufferRef.current.shift()
      }

      for (const code of SECRET_CODES) {
        const bufferEnd = bufferRef.current.slice(-code.sequence.length)
        if (
          bufferEnd.length === code.sequence.length &&
          bufferEnd.every((key, i) => key === code.sequence[i])
        ) {
          onUnlock(code.name, code.message)
          bufferRef.current = []
          break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onUnlock])
}

export { SECRET_CODES }
