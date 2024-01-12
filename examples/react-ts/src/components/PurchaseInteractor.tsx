import { TxButtonProps, useInkathon, useTxButton } from '@poppyseed/lastic-sdk';
import { useState } from 'react';
import { Form, Grid, Input } from 'semantic-ui-react';

export default function PurchaseInteractor() {
  const { api, currentAccount } = useInkathon(); // Assuming useInkathon provides currentAccount
  const [param, setParam] = useState('');

  const handleInputChange = (_, { value }) => setParam(value);

  const txButtonProps: TxButtonProps = {
    api,
    setStatus: (status: string | null) => console.log('tx status:', status),
    attrs: {
      palletRpc: 'broker',
      callable: 'purchase',
      inputParams: [param],
      paramFields: [{ name: 'param', type: 'TYPE', optional: false }],
    },
    type: 'SIGNED-TX',
    currentAccount,
    txOnClickHandler: null, // Define if needed
  };

  const { transaction, status, allParamsFilled } = useTxButton(txButtonProps);

  return (
    <Grid.Column width={8}>
      <h4>Broker Pallet - Purchase Interaction</h4>
      <Form>
        <Form.Field>
          <label>Price Limit</label>
          <Input
            fluid
            type="text"
            placeholder="Enter parameter"
            value={param}
            onChange={handleInputChange}
          />
        </Form.Field>
        <Form.Field style={{ textAlign: 'center' }}>
          <button onClick={transaction} disabled={!allParamsFilled()}>
            Submit
          </button>
        </Form.Field>
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  );
}
