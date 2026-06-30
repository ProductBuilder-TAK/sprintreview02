import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSecretCode, SECRET_CODES } from '@/hooks/useSecretCode'

function simulateKeys(keys: string[]) {
  keys.forEach((key) => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key }))
  })
}

describe('useSecretCode', () => {
  it('detects StarAc sequence (↑↑↓↓)', () => {
    const onUnlock = vi.fn()
    renderHook(() => useSecretCode(onUnlock))

    simulateKeys(['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'])

    expect(onUnlock).toHaveBeenCalledWith('starac', 'StarAc débloqué !')
  })

  it('detects HowMany sequence (←←→→)', () => {
    const onUnlock = vi.fn()
    renderHook(() => useSecretCode(onUnlock))

    simulateKeys(['ArrowLeft', 'ArrowLeft', 'ArrowRight', 'ArrowRight'])

    expect(onUnlock).toHaveBeenCalledWith('howmany', 'How Many débloqué !')
  })

  it('detects hide-secrets sequence (↓↓↑↑)', () => {
    const onUnlock = vi.fn()
    renderHook(() => useSecretCode(onUnlock))

    simulateKeys(['ArrowDown', 'ArrowDown', 'ArrowUp', 'ArrowUp'])

    expect(onUnlock).toHaveBeenCalledWith('hide-secrets', 'Onglets secrets masqués')
  })

  it('detects Pearson sequence (p-e-a-r)', () => {
    const onUnlock = vi.fn()
    renderHook(() => useSecretCode(onUnlock))

    simulateKeys(['p', 'e', 'a', 'r'])

    expect(onUnlock).toHaveBeenCalledWith('pearson', 'Corrélation Pearson débloquée !')
  })

  it('detects Burndown sequence (b-u-r-n)', () => {
    const onUnlock = vi.fn()
    renderHook(() => useSecretCode(onUnlock))

    simulateKeys(['b', 'u', 'r', 'n'])

    expect(onUnlock).toHaveBeenCalledWith('burndown', 'Burndown Chart débloqué !')
  })

  it('does not trigger on partial sequences', () => {
    const onUnlock = vi.fn()
    renderHook(() => useSecretCode(onUnlock))

    simulateKeys(['ArrowUp', 'ArrowUp', 'ArrowDown']) // Missing last ↓

    expect(onUnlock).not.toHaveBeenCalled()
  })

  it('has all expected secret codes', () => {
    expect(SECRET_CODES).toHaveLength(6)
    const names = SECRET_CODES.map((c) => c.name)
    expect(names).toContain('starac')
    expect(names).toContain('howmany')
    expect(names).toContain('hide-secrets')
    expect(names).toContain('individual')
    expect(names).toContain('pearson')
    expect(names).toContain('burndown')
  })
})
