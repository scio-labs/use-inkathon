import { ApiPromise, SubmittableResult } from '@polkadot/api';
import { web3FromSource } from '@polkadot/extension-dapp';
import { Signer } from '@polkadot/types/types';
import { Dispatch, SetStateAction } from 'react';
import { transformParams } from './broker';
import { txErrHandler, txResHandler } from './broker_handler';

export interface CurrentAccount {
    address: string;
    meta: {
      source: string;
      isInjected: boolean;
    };
  }

interface TransactionParams {
  palletRpc: string;
  callable: string;
  inputParams: any[];
  paramFields: any[];
}

type AccountOrPair = [string, { signer: Signer }] | null;

const getFromAcct = async (
    currentAccount: CurrentAccount
) : Promise<AccountOrPair> => {
    const {
        address,
        meta: { source, isInjected },
      } = currentAccount
  
      if (!isInjected) {
        return [currentAccount]
      }

    // currentAccount is injected from polkadot-JS extension, need to return the addr and signer object.
    // ref: https://polkadot.js.org/docs/extension/cookbook#sign-and-send-a-transaction
    const injector = await web3FromSource(currentAccount.meta.source)

    if (!injector) {
        return null;
      }

    return [address, { signer: injector.signer }]
  }

const signedTx = async (
  api: ApiPromise,
  { palletRpc, callable, inputParams, paramFields }: TransactionParams,
  setStatus: Dispatch<SetStateAction<string | null>>,
  setUnsub: Dispatch<SetStateAction<any>>,
  currentAccount: CurrentAccount
) => {
  const fromAcct = await getFromAcct(currentAccount);
  const transformed = transformParams(paramFields, inputParams);

    // Check if fromAcct is not null and has the correct structure
  if (!fromAcct || fromAcct.length !== 2) {
    setStatus('Error: Unable to retrieve account information.');
    return;
  }
  const [address, signerObj] = fromAcct;

  const txExecute = transformed
    ? api.tx[palletRpc][callable](...transformed)
    : api.tx[palletRpc][callable]();

  const unsub = await txExecute
    .signAndSend(address, signerObj, (result: SubmittableResult) => txResHandler(setStatus, api, result))
    .catch((err: Error) => txErrHandler(setStatus, err));

  setUnsub(() => unsub);
};

const unsignedTx = async (
  api: ApiPromise,
  { palletRpc, callable, inputParams, paramFields }: TransactionParams,
  setStatus: Dispatch<SetStateAction<string | null>>,
  setUnsub: Dispatch<SetStateAction<any>> // Replace 'any' with a specific type if possible
) => {
  const transformed = transformParams(paramFields, inputParams);

  const txExecute = transformed
    ? api.tx[palletRpc][callable](...transformed)
    : api.tx[palletRpc][callable]();

  const unsub = await txExecute
    .send((result: SubmittableResult) => txResHandler(setStatus, api, result))
    .catch((err: Error) => txErrHandler(setStatus, err));

  setUnsub(() => unsub);
};

export { getFromAcct, signedTx, unsignedTx };
