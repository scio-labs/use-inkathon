import { ContractCallOutcome } from '@polkadot/api-contract/types'

/**
 * Unwraps a Weights V2 result type or errors if there is no 'ok' value.
 */
export const unwrapResultOrError = <T = any>(
  outcome: Pick<ContractCallOutcome, 'result' | 'output'>,
): T => {
  const { result, output } = outcome
  if (!result?.isOk || !output) {
    throw new Error(`Error while unwrapping: ${result.toString()}`)
  }
  return (output.toPrimitive() as { ok: T }).ok
}

/**
 * Unwraps a Weights V2 result type or returns the given default if there is no 'ok' value.
 */
export const unwrapResultOrDefault = <T = any>(
  outcome: Pick<ContractCallOutcome, 'result' | 'output'>,
  defaultValue: T,
): T => {
  const { result, output } = outcome
  let unwrappedResult: T = defaultValue
  if (result?.isOk && !!output) {
    unwrappedResult = (output.toPrimitive() as { ok: T }).ok
  }
  return unwrappedResult
}
