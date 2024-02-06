import {
  SubstrateDeployment,
  UseInkathonProvider,
  UseInkathonProviderProps,
  contracts,
  useInkathon,
} from '@/index'
import { renderHook } from '@testing-library/react'
import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
const getDeployments = async (): Promise<SubstrateDeployment[]> => {
  return [
    {
      contractId: 'TestContract',
      networkId: contracts.network,
      abi: {},
      address: '5EnufwqqxnkWT6hc1LgjYWQGUsqQCtcr5192K2HuQJtRJgCi',
    },
  ]
}

const createUseInkathonWrapper = (props: Partial<UseInkathonProviderProps> = {}) =>
  function UseInkathonProviderTestWrapper({ children }: { children: React.ReactNode }) {
    return createElement(
      UseInkathonProvider,
      {
        appName: 'Unit Test',
        defaultChain: contracts,
        deployments: Promise.resolve([]),
        ...props,
      },
      children,
    )
  }

describe('useInkathon()', async () => {
  it('initializes', async () => {
    const { result, rerender } = renderHook(() => useInkathon(), {
      wrapper: createUseInkathonWrapper(),
    })
    expect(result.current.isInitialized).toBe(false)
    expect(result.current.initialize).toBeDefined()
    expect(result.current.deployments).toStrictEqual([])
    await result.current.initialize()

    rerender()

    expect(result.current.isInitialized).toBe(true)
  })

  it('initializes with deployments', async () => {
    const { result, rerender } = renderHook(() => useInkathon(), {
      wrapper: createUseInkathonWrapper({ deployments: getDeployments() }),
    })
    expect(result.current.deployments).toStrictEqual([])
    await result.current.initialize()

    rerender()

    expect(result.current.isInitialized).toBe(true)
    expect(result.current.deployments?.length).toBe(1)
  })
})
