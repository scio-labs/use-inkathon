/**
 * Decodes the error message from an extrinsic's error event.
 */
export type ExstrinsicThrowErrorMessage = 'UserCancelled' | 'TokenBelowMinimum' | 'Error'
export const getExtrinsicErrorMessage = (errorEvent: any): ExstrinsicThrowErrorMessage => {
  let errorMessage: ExstrinsicThrowErrorMessage = 'Error'

  // Somewhat hacky way to detect user cancellations, but all wallets throw different errors.
  if (
    errorEvent?.message?.match(
      /(user reject request|cancelled|rejected by user|user rejected approval)/i,
    )
  ) {
    errorMessage = 'UserCancelled'
  }

  // Decode the error code from the RPC error message.
  const errorText = errorEvent?.toString?.()
  const rpcErrorCode =
    errorText && typeof errorText === 'string' ? errorText.match(/RpcError: (\d+):/i)?.[1] : null
  switch (rpcErrorCode) {
    case '1010':
      errorMessage = 'TokenBelowMinimum'
      break
    default:
      break
  }

  return errorMessage
}
