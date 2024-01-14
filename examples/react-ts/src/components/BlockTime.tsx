import { VoidFn } from '@polkadot/api/types';
import { useInkathon } from '@poppyseed/lastic-sdk';
import { useEffect, useState } from 'react';
import { Card, Grid, Icon, Statistic } from 'semantic-ui-react';

function Main() {
  const { api } = useInkathon();
  const [blockNumber, setBlockNumber] = useState(0);
  const [blockNumberFinalized, setBlockNumberFinalized] = useState(0);
  const [blockNumberTimer, setBlockNumberTimer] = useState(0);

  useEffect(() => {
    if (!api) return;

    const bestNumber = api.derive.chain.bestNumber;
    const bestFinalizedNumber = api.derive.chain.bestNumberFinalized;

    let unsubscribeBestNumber: VoidFn | null = null;
    let unsubscribeBestFinalizedNumber: VoidFn | null = null;

    if (bestNumber) {
      bestNumber(number => {
        const num = number.toNumber();
        setBlockNumber(isNaN(num) ? 0 : num);
        setBlockNumberTimer(0);
      })
      .then(unsub => {
        unsubscribeBestNumber = unsub;
      })
      .catch(console.error);
    }

    if (bestFinalizedNumber) {
      bestFinalizedNumber(number => {
        const num = number.toNumber();
        setBlockNumberFinalized(isNaN(num) ? 0 : num);
      })
      .then(unsub => {
        unsubscribeBestFinalizedNumber = unsub;
      })
      .catch(console.error);
    }

    return () => {
      if (unsubscribeBestNumber) unsubscribeBestNumber();
      if (unsubscribeBestFinalizedNumber) unsubscribeBestFinalizedNumber();
    };
  }, [api]);

  useEffect(() => {
    const id = setInterval(() => {
      setBlockNumberTimer(time => time + 1);
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return (
    <Grid.Column>
      <Card>
        <Card.Content textAlign="center">
          <Statistic
            className="block_number"
            label={'Current Block'}
            value={blockNumber}
          />
          <Statistic
            className="block_number"
            label={'Finalized Block'}
            value={blockNumberFinalized}
          />
        </Card.Content>
        <Card.Content extra>
          <Icon name="time" /> {blockNumberTimer}
        </Card.Content>
      </Card>
    </Grid.Column>
  );
}

export default function BlockNumber() {
  return <Main />;
}
