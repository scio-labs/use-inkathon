import { transformParams, txErrHandler, txResHandler } from '@/utils';
import { ApiPromise } from '@polkadot/api';
import { web3FromSource } from '@polkadot/extension-dapp';
import { useEffect, useState } from 'react';

interface TxButtonProps {
  api: ApiPromise;
  setStatus: (status: string | null) => void;
  attrs: {
    palletRpc: string;
    callable: string;
    inputParams: any[];
    paramFields: any[];
  };
  type: 'QUERY' | 'RPC' | 'SIGNED-TX' | 'UNSIGNED-TX' | 'SUDO-TX' | 'UNCHECKED-SUDO-TX' | 'CONSTANT';
  currentAccount: any;
}

interface UseTxButtonResult {
  transaction: () => Promise<void>;
  status: string | null;
  isSudoer: (acctPair: any) => boolean;
  allParamsFilled: () => boolean;
}

export const useTxButton = ({ api, attrs, type, currentAccount }: TxButtonProps): UseTxButtonResult => {
  const [status, setStatus] = useState<string | null>(null);
  const [unsub, setUnsub] = useState(null)
  const [sudoKey, setSudoKey] = useState<string | null>(null);

  const { palletRpc, callable, inputParams, paramFields } = attrs

  const isQuery = () => type === 'QUERY'
  const isSudo = () => type === 'SUDO-TX'
  const isUncheckedSudo = () => type === 'UNCHECKED-SUDO-TX'
  const isUnsigned = () => type === 'UNSIGNED-TX'
  const isSigned = () => type === 'SIGNED-TX'
  const isRpc = () => type === 'RPC'
  const isConstant = () => type === 'CONSTANT'

  useEffect(() => {
    const loadSudoKey = async () => {
      if (!api || !api.query.sudo) {
        return;
      }
      const key = await api.query.sudo.key();
      setSudoKey(key.isEmpty ? null : key.toString());
    };

    loadSudoKey();
  }, [api]);

  const getFromAcct = async () => {
    const {
      address,
      meta: { source, isInjected },
    } = currentAccount

    if (!isInjected) {
      return [currentAccount]
    }

    // currentAccount is injected from polkadot-JS extension, need to return the addr and signer object.
    // ref: https://polkadot.js.org/docs/extension/cookbook#sign-and-send-a-transaction
    const injector = await web3FromSource(source)
    return [address, { signer: injector.signer }]
  }

  const sudoTx = async () => {
    const fromAcct = await getFromAcct()
    const transformed = transformParams(paramFields, inputParams)
    // transformed can be empty parameters
    const txExecute = transformed
      ? api.tx.sudo.sudo(api.tx[palletRpc][callable](...transformed))
      : api.tx.sudo.sudo(api.tx[palletRpc][callable]())

    const unsub = txExecute
      .signAndSend(...fromAcct, txResHandler)
      .catch(txErrHandler)

    setUnsub(() => unsub)
  }

  const uncheckedSudoTx = async () => {
    const fromAcct = await getFromAcct()
    const txExecute = api.tx.sudo.sudoUncheckedWeight(
      api.tx[palletRpc][callable](...inputParams),
      0
    )

    const unsub = txExecute
      .signAndSend(...fromAcct, txResHandler)
      .catch(txErrHandler)

    setUnsub(() => unsub)
  }

  const signedTx = async () => {
    const fromAcct = await getFromAcct()
    const transformed = transformParams(paramFields, inputParams)
    // transformed can be empty parameters

    const txExecute = transformed
      ? api.tx[palletRpc][callable](...transformed)
      : api.tx[palletRpc][callable]()

    const unsub = await txExecute
      .signAndSend(...fromAcct, txResHandler)
      .catch(txErrHandler)

    setUnsub(() => unsub)
  }

  const unsignedTx = async () => {
    const transformed = transformParams(paramFields, inputParams)
    // transformed can be empty parameters
    const txExecute = transformed
      ? api.tx[palletRpc][callable](...transformed)
      : api.tx[palletRpc][callable]()

    const unsub = await txExecute.send(txResHandler).catch(txErrHandler)
    setUnsub(() => unsub)
  }

  const queryResHandler = (result: any) => {
    result.isNone ? setStatus('None') : setStatus(result.toString())
  }

  const query = async () => {
    const transformed = transformParams(paramFields, inputParams)
    const unsub = await api.query[palletRpc][callable](
      ...transformed,
      queryResHandler
    )

    setUnsub(() => unsub)
  }

  const rpc = async () => {
    const transformed = transformParams(paramFields, inputParams, {
      emptyAsNull: false,
    })
    const unsub = await api.rpc[palletRpc][callable](
      ...transformed,
      queryResHandler
    )
    setUnsub(() => unsub)
  }

  const constant = () => {
    const result = api.consts[palletRpc][callable]
    result.isNone ? setStatus('None') : setStatus(result.toString())
  }

  // Main transaction handler
  const transaction = async () => {
    if (typeof unsub === 'function') {
      unsub()
      setUnsub(null)
    }

    setStatus('Sending...')

    const asyncFunc =
      (isSudo() && sudoTx) ||
      (isUncheckedSudo() && uncheckedSudoTx) ||
      (isSigned() && signedTx) ||
      (isUnsigned() && unsignedTx) ||
      (isQuery() && query) ||
      (isRpc() && rpc) ||
      (isConstant() && constant)

    await asyncFunc()

    return txOnClickHandler && typeof txOnClickHandler === 'function'
      ? txOnClickHandler(unsub)
      : null
  }

  const allParamsFilled = () => {
    if (paramFields.length === 0) {
      return true
    }

    return paramFields.every((paramField, ind) => {
      const param = inputParams[ind]
      if (paramField.optional) {
        return true
      }
      if (param == null) {
        return false
      }

      const value = typeof param === 'object' ? param.value : param
      return value !== null && value !== ''
    })
  }

  const isSudoer = (acctPair: any | null) => {
    if (!sudoKey || !acctPair) {
      return false
    }
    return acctPair.address === sudoKey
  }

  // Expose necessary functions and state
  return { transaction, status, isSudoer, allParamsFilled };
};
