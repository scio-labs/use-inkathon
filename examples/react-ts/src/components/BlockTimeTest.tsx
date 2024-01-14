import {
    blockTimeToUTC,
    getCurrentBlockNumber,
    getCurrentBlockTimeUTC,
    useInkathon
} from '@poppyseed/lastic-sdk';
import { useEffect, useState } from 'react';

export default function BlockTimeTest() {
    const { api } = useInkathon();
    const [time, setTime] = useState("0");
    const [currentBlockNb, setCurrentBlockNb] = useState(0);

    useEffect(() => {
        if (!api) return;

        const fetchTime = async () => {
            const blockTime = await getCurrentBlockTimeUTC(api);
            setTime(blockTime);
            const currentBlock = await getCurrentBlockNumber(api);
            setCurrentBlockNb(currentBlock);
            const blockTimestamp = await blockTimeToUTC(api, 50682);
            console.log(blockTimestamp);

        };

        fetchTime();
    }, [api]);

    return (
        <div>
            <h3>Block Time Test</h3>
            <div>Block Time: {time}</div>
            <div>Current Block: {currentBlockNb}</div>
        </div>
    );
}
