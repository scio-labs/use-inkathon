import utils from '@/utils';
import { bnFromHex } from '@polkadot/util';

const txResHandler = (setStatus: React.Dispatch<React.SetStateAction<string | null>>, { events, status, txHash }) =>{
    status.isFinalized
      ? setStatus(`😉 Finalized. Block hash: ${status.asFinalized.toString()}`)
      : setStatus(`Current transaction status: ${status.type}`)

      // Loop through Vec<EventRecord> to display all events
      events.forEach(({ _, event: { data, method, section } }) => {
        if ((section + ":" + method) === 'system:ExtrinsicFailed' ) {
          // extract the data for this event
          const [dispatchError, dispatchInfo] = data;
          console.log(`dispatchinfo: ${dispatchInfo}`)
          let errorInfo;
          
          // decode the error
          if (dispatchError.isModule) {
            // for module errors, we have the section indexed, lookup
            // (For specific known errors, we can also do a check against the
            // api.errors.<module>.<ErrorName>.is(dispatchError.asModule) guard)
            const mod = dispatchError.asModule
            const error = api.registry.findMetaError(
                new Uint8Array([mod.index.toNumber(), bnFromHex(mod.error.toHex().slice(0, 4)).toNumber()])
            )
            let message = `${error.section}.${error.name}${
                Array.isArray(error.docs) ? `(${error.docs.join('')})` : error.docs || ''
            }`
            
            errorInfo = `${message}`;
            console.log(`Error-info::${JSON.stringify(error)}`)
          } else {
            // Other, CannotLookup, BadOrigin, no extra info
            errorInfo = dispatchError.toString();
          }
          setStatus(`😞 Transaction Failed! ${section}.${method}::${errorInfo}`)
        } else if (section + ":" + method === 'system:ExtrinsicSuccess' ) {
          setStatus(`❤️️ Transaction successful! tx hash: ${txHash} , Block hash: ${status.asFinalized.toString()}`)
        }
      });
  }

const txErrHandler = (setStatus: React.Dispatch<React.SetStateAction<string | null>>, err: any) => {
  setStatus(`😞 Transaction Failed: ${err.toString()}`);
};

const transformParams = (
    paramFields: any[],
    inputParams: any[],
    opts = { emptyAsNull: true }
  ) => {
    // if `opts.emptyAsNull` is true, empty param value will be added to res as `null`.
    //   Otherwise, it will not be added
    const paramVal = inputParams.map(inputParam => {
      // To cater the js quirk that `null` is a type of `object`.
      if (
        typeof inputParam === 'object' &&
        inputParam !== null &&
        typeof inputParam.value === 'string'
      ) {
        return inputParam.value.trim()
      } else if (typeof inputParam === 'string') {
        return inputParam.trim()
      }
      return inputParam
    })
    const params = paramFields.map((field, ind) => ({
      ...field,
      value: paramVal[ind] || null,
    }))

    return params.reduce((memo, { type = 'string', value }) => {
      if (value == null || value === '')
        return opts.emptyAsNull ? [...memo, null] : memo

      let converted = value

      // Deal with a vector
      if (type.indexOf('Vec<') >= 0) {
        converted = converted.split(',').map(e => e.trim())
        converted = converted.map(single =>
          isNumType(type)
            ? single.indexOf('.') >= 0
              ? Number.parseFloat(single)
              : Number.parseInt(single)
            : single
        )
        return [...memo, converted]
      }

      // Deal with a single value
      if (isNumType(type)) {
        converted =
          converted.indexOf('.') >= 0
            ? Number.parseFloat(converted)
            : Number.parseInt(converted)
      }
      return [...memo, converted]
    }, [])
  }

const isNumType = (type: string) => {
    utils.paramConversion.num.some(el => type.indexOf(el) >= 0)
}


export {
    isNumType, transformParams, txErrHandler, txResHandler
};
