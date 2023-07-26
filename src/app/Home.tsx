'use client';

import Button from '@/elements/buttons/Button';
import { gaslessMint } from '@/utils/biconomy';
import Image from 'next/image';
import { useState } from 'react';

const Home = () => {
  const [isMinting, setIsMinting] = useState(false);

  const mintNft = async () => {
    const wallet = '0x610BF39748F50e45215F8d5eA3B69527Ca3b32bd';

    try {
      setIsMinting(true);
      const res = await gaslessMint(wallet, '1');
      console.log(res);
    } catch (error) {
      console.log('error: ', error);
    }

    setIsMinting(false);
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center flex-col gap-4 relative  bg-zinc-900">
      <h1 className="bg-gradient-to-r from-primary to-zinc-100 bg-clip-text text-transparent font-extrabold tracking-tight text-4xl">
        Gas Free Mint
      </h1>
      <Image
        className={isMinting ? 'animate-pulse' : ''}
        src="/gas_pump.png"
        width={200}
        height={200}
        alt="gas"
      />
      <div className="scale-125 mt-4">
        <Button onClick={mintNft} disabled={isMinting}>
          {isMinting ? 'Minting' : 'Click me'}
        </Button>
      </div>
    </div>
  );
};

export default Home;
