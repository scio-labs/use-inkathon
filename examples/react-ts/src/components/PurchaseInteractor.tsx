import { TxButtonProps, useBalance, useInkathon, useTxButton } from '@poppyseed/lastic-sdk'
import { ChangeEvent, useState } from 'react'
import { Form, Grid, Input, InputOnChangeData } from 'semantic-ui-react'

export default function PurchaseInteractor() {
  const { api, activeSigner, activeAccount, addToast } = useInkathon()
  const { balanceFormatted } = useBalance(activeAccount?.address, true)

  const [param, setParam] = useState('')

  const handleInputChange = (_: ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => {
    setParam(data.value)
  }

  const txButtonProps: TxButtonProps = {
    api,
    setStatus: (status: string | null) => console.log('tx status:', status),
    addToast: addToast,
    attrs: {
      palletRpc: 'broker',
      callable: 'purchase',
      inputParams: [param],
      paramFields: [{ name: 'param', type: 'TYPE', optional: false }],
    },
    type: 'SIGNED-TX',
    activeAccount,
    activeSigner,
  }

  const { transaction, status, allParamsFilled } = useTxButton(txButtonProps)

  if (!api || !activeSigner || !activeAccount) {
    return null
  }

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
          <div>
            Using account: {activeAccount?.address}, {balanceFormatted}
          </div>
          <button onClick={transaction} disabled={!allParamsFilled()}>
            Submit
          </button>
        </Form.Field>
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  )
}
