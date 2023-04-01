import { program } from "commander";
import log from "loglevel";
import {
  Connection,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

log.setLevel("info");


async function airdrop() {
   const destination = 'YOUR SOLANA ADDRESS'
    const env = "devnet"; // Always use devnet

    async function sleep(ms: number) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function drop(): Promise<any> {
      const conn: Connection = new Connection(clusterApiUrl(env));
      const _destination: PublicKey = new PublicKey(destination);
      const _amount = LAMPORTS_PER_SOL * 2;

      const transientReceiver = Keypair.generate();
      console.log(
        `airdropping funds to intermediary: ${transientReceiver.publicKey.toString()}`
      );

      try {
        const signature = await conn.requestAirdrop(
          transientReceiver.publicKey,
          _amount
        );
        
        await conn.confirmTransaction(signature, "max");
        
        console.log(
          `airdropped ${_amount } lamports to [${transientReceiver.publicKey.toBase58()}]. tx signature: ${signature}`
        );

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: transientReceiver.publicKey,
            toPubkey: _destination,
            lamports: _amount - 5000,
          })
        );

        const sig2 = await sendAndConfirmTransaction(conn, transaction, [
          transientReceiver,
        ]);
        await conn.confirmTransaction(signature, "max");

        return `sent ${_amount} lamports to wallet [${_destination.toString()}]: ${signature}`
      } catch (e: any) {
        console.log("airdrop error: ", e);
      }
    }

    // try tweaking these
    const maxRequestsPer10Seconds = 1; // Maximum number of requests per 10 seconds per IP for a single RPC
    const rateLimitDelay = 10000 / maxRequestsPer10Seconds;
    while (true) {
      let res = await drop();
      console.log(res);
      await sleep(rateLimitDelay);
    }
  };

airdrop();