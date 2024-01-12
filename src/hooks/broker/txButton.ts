import {
    signedTx,
    unsignedTx
} from '@/utils';
import { CurrentAccount } from '@/utils/broker_tx';
import { ApiPromise } from '@polkadot/api';
import { useEffect, useState } from 'react';


export interface TxButtonProps {
  api: ApiPromise;
  setStatus: (status: string | null) => void;
  attrs: {
    palletRpc: string;
    callable: string;
    inputParams: any[];
    paramFields: any[];
  };
  type: 'SIGNED-TX' | 'UNSIGNED-TX';
  currentAccount: CurrentAccount;
  txOnClickHandler: null;
}

interface UseTxButtonResult {
  transaction: () => Promise<void>;
  status: string | null;
  allParamsFilled: () => boolean;
}

export const useTxButton = ({ 
    api, attrs, type, currentAccount, txOnClickHandler }: TxButtonProps): UseTxButtonResult => {
  const [status, setStatus] = useState<string | null>(null);
  const [unsub, setUnsub] = useState<(() => void) | null>(null);
  const [sudoKey, setSudoKey] = useState<string | null>(null);

  const { palletRpc, callable, inputParams, paramFields } = attrs

  const isUnsigned = () => type === 'UNSIGNED-TX'
  const isSigned = () => type === 'SIGNED-TX'

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

  // Main transaction handler
  const transaction = async () => {
    if (typeof unsub === 'function') {
      unsub()
      setUnsub(null)
    }

    setStatus('Sending...')

    if (isSigned()) {
        await signedTx(api, attrs, setStatus, setUnsub, currentAccount);
    } else if (isUnsigned()) {
        await unsignedTx(api, attrs, setStatus, setUnsub);
    }
      
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

  // Expose necessary functions and state
  return { transaction, status, allParamsFilled };
};
