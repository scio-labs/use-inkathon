import { ApiPromise } from '@polkadot/api';
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
  const [sudoKey, setSudoKey] = useState<string | null>(null);

  // Logic from the TxButton component

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

  // Implement other functions like signedTx, unsignedTx, sudoTx, etc.
  // ...

  // Main transaction handler
  const transaction = async () => {
    if (typeof unsub === 'function') {
      unsub();
      setUnsub(null);
    }

    setStatus('Sending...');

    switch (type) {
      case 'SIGNED-TX':
        await signedTx();
        break;
      // Add cases for other transaction types
      // ...
    }


  // Utility functions (isNumType, transformParams, etc.)
  // ...

  // Expose necessary functions and state
  return { transaction, status, isSudoer, allParamsFilled };
};
