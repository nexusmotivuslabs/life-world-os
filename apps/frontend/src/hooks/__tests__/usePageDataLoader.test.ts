/**
 * usePageDataLoader Hook Tests
 *
 * Tests for page data loading: single load on mount, retry, error handling,
 * and that a stable loadFn does not cause an infinite loop.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePageDataLoader } from '../usePageDataLoader'

const emptyOptions = {}

describe('usePageDataLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts with loading true and null data', () => {
    const loadFn = vi.fn().mockImplementation(() => new Promise(() => {}))
    const { result } = renderHook(() => usePageDataLoader(loadFn, emptyOptions))

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
    expect(result.current.retry).toBeDefined()
  })

  it('calls loadFn once on mount and sets data when resolved', async () => {
    const data = { items: [1, 2, 3] }
    let resolvePromise!: (v: typeof data) => void
    const promise = new Promise<typeof data>((r) => { resolvePromise = r })
    const loadFn = vi.fn(() => promise)
    const { result } = renderHook(() => usePageDataLoader(loadFn, emptyOptions))

    await act(async () => {
      resolvePromise(data)
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(loadFn).toHaveBeenCalledTimes(1)
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toEqual(data)
    expect(result.current.error).toBeNull()
  })

  it('sets error when loadFn rejects', async () => {
    const err = new Error('Network failed')
    let rejectPromise!: (e: Error) => void
    const promise = new Promise<never>((_, r) => { rejectPromise = r })
    const loadFn = vi.fn(() => promise)
    const { result } = renderHook(() => usePageDataLoader(loadFn, emptyOptions))

    await act(async () => {
      rejectPromise(err)
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBe('Network failed')
  })

  it('uses generic error message when rejection is not an Error', async () => {
    let rejectPromise!: (e: string) => void
    const promise = new Promise<never>((_, r) => { rejectPromise = r })
    const loadFn = vi.fn(() => promise)
    const { result } = renderHook(() => usePageDataLoader(loadFn, emptyOptions))

    await act(async () => {
      rejectPromise('string error')
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('Failed to load data')
  })

  it('retry calls loadFn again and updates data', async () => {
    const data = { items: [1, 2, 3] }
    let resolveFirst!: (v: typeof data) => void
    const firstPromise = new Promise<typeof data>((r) => { resolveFirst = r })
    const loadFn = vi.fn(() => firstPromise)
    const { result } = renderHook(() => usePageDataLoader(loadFn, emptyOptions))

    await act(async () => {
      resolveFirst(data)
      await Promise.resolve()
      await Promise.resolve()
    })
    expect(loadFn).toHaveBeenCalledTimes(1)
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toEqual(data)

    const newData = { items: [4, 5, 6] }
    let resolveSecond!: (v: typeof newData) => void
    const secondPromise = new Promise<typeof newData>((r) => { resolveSecond = r })
    loadFn.mockReturnValue(secondPromise)
    await act(async () => {
      result.current.retry()
    })
    await act(async () => {
      resolveSecond(newData)
      await Promise.resolve()
      await Promise.resolve()
    })
    expect(result.current.data).toEqual(newData)
    expect(loadFn).toHaveBeenCalledTimes(2)
  })

  it('retry after error clears error and loads again', async () => {
    const err = new Error('First error')
    let rejectPromise!: (e: Error) => void
    const promise = new Promise<never>((_, r) => { rejectPromise = r })
    const loadFn = vi.fn(() => promise)
    const { result } = renderHook(() => usePageDataLoader(loadFn, emptyOptions))

    await act(async () => {
      rejectPromise(err)
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
    })
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('First error')

    let resolveRetry!: (v: { ok: boolean }) => void
    const retryPromise = new Promise<{ ok: boolean }>((r) => { resolveRetry = r })
    loadFn.mockReturnValue(retryPromise)
    await act(async () => {
      result.current.retry()
    })
    await act(async () => {
      resolveRetry({ ok: true })
      await Promise.resolve()
      await Promise.resolve()
    })
    expect(result.current.error).toBeNull()
    expect(result.current.data).toEqual({ ok: true })
  })

  it('calls onSuccess when load succeeds', async () => {
    const data = { x: 1 }
    const onSuccess = vi.fn()
    const options = { onSuccess }
    let resolvePromise!: (v: typeof data) => void
    const promise = new Promise<typeof data>((r) => { resolvePromise = r })
    const loadFn = vi.fn(() => promise)
    renderHook(() => usePageDataLoader(loadFn, options))

    await act(async () => {
      resolvePromise(data)
      await Promise.resolve()
      await Promise.resolve()
    })
    expect(onSuccess).toHaveBeenCalledWith(data)
  })

  it('calls onError when load fails', async () => {
    const err = new Error('Fail')
    const onError = vi.fn()
    const options = { onError }
    let rejectPromise!: (e: Error) => void
    const promise = new Promise<never>((_, r) => { rejectPromise = r })
    const loadFn = vi.fn(() => promise)
    renderHook(() => usePageDataLoader(loadFn, options))

    await act(async () => {
      rejectPromise(err)
      await Promise.resolve()
      await Promise.resolve()
    })
    expect(onError).toHaveBeenCalledWith(err)
  })
})
