import { useInkathon, useTxButton } from '@poppyseed/lastic-sdk';
import { useState } from 'react';
import { Form, Grid, Input } from 'semantic-ui-react';

export default function PurchaseInteractor() {
  const { api } = useInkathon();
  const [param, setParam] = useState('');

  const handleInputChange = (_, { value }) => setParam(value);

  const txButtonProps = {
    api,
    attrs: {
      palletRpc: 'broker',
      callable: 'purchase',
      inputParams: [param],
      paramFields: [{ name: 'param', type: 'TYPE', optional: false }],
    },
    type: 'SIGNED-TX',
  };

  const { transaction, status } = useTxButton(txButtonProps);

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
          <button onClick={transaction} disabled={!param}>
            Submit
          </button>
        </Form.Field>
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  );
}
