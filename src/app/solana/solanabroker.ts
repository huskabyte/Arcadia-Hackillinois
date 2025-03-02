import Wallet1 from "./dummy-wallet-1.json"
import Wallet2 from "./dummy-wallet-2.json"
const { Connection, Keypair, Transaction, SystemProgram, sendAndConfirmTransaction } = require('@solana/web3.js');

// Load the keypair from the JSON file
const secretKey1 = new Uint8Array(Wallet1.Wallet1);
const keypair1 = Keypair.fromSecretKey(secretKey1);

const secretKey2 = new Uint8Array(Wallet2.Wallet2);
const keypair2 = Keypair.fromSecretKey(secretKey2);

// Create a connection to the devnet
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Log the public key of the dummy account
console.log('Dummy Account Public Key:', keypair1.publicKey.toString());
console.log('Dummy Account 2 Public Key:', keypair2.publicKey.toString());

// Now you can send transactions with the dummy account
export async function sendTransaction() {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: keypair2.publicKey,
      toPubkey: keypair1.publicKey,  // Just a dummy transfer to the same account
      lamports: 1000000,
    })
  );

  try {
    const signature = await sendAndConfirmTransaction(connection, transaction, [keypair2]);
    console.log('Transaction successful with signature:', signature);
  } catch (error) {
    console.log('Error sending transaction:', error);
  }
}

export async function getBalance() {
  const balance = await connection.getBalance(keypair1.publicKey).catch((error: any) => {
    console.error(error);
  });
  console.log(balance);
  return balance;
}