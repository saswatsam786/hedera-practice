import express from "express";

import {
  Client,
  PrivateKey,
  AccountCreateTransaction,
  AccountBalanceQuery,
  Hbar,
  TransferTransaction,
} from "@hashgraph/sdk";

import dotenv from "dotenv";
dotenv.config();
// require("dotenv").config();

const app = express();

app.get("/", (req, res) => {
  res.send("Server is running");
});

// app.post("/createAccount", async (req, res) => {
//   const newAccountPrivateKey = await PrivateKey.generate();
//   const newAccountPublicKey = newAccountPrivateKey.publicKey;

//   //Create a new account with 1,000 tinybar starting balance
//   const newAccountTransactionResponse = await new AccountCreateTransaction()
//     .setKey(newAccountPublicKey)
//     .setInitialBalance(Hbar.fromTinybars(1000))
//     .execute(client);

//   // Get the new account ID
//   const getReceipt = await newAccountTransactionResponse.getReceipt(client);
//   const newAccountId = getReceipt.accountId;
//   console.log("The new account ID is: " + newAccountId);

//   res.send(`The new account id is ${newAccountId}`);
// });

async function main() {
  //Grab your Hedera testnet account ID and private key from your .env file
  const myAccountId = process.env.MY_ACCOUNT_ID;
  const myPrivateKey = process.env.MY_PRIVATE_KEY;

  // If we weren't able to grab it, we should throw a new error
  if (myAccountId == null || myPrivateKey == null) {
    throw new Error(
      "Environment variables myAccountId and myPrivateKey must be present"
    );
  }

  // Create our connection to the Hedera network
  // The Hedera JS SDK makes this really easy!
  const client = Client.forTestnet();
  client.setOperator(myAccountId, myPrivateKey);

  //Create the account balance query
  const query = new AccountBalanceQuery().setAccountId(myAccountId);

  //Submit the query to a Hedera network
  const accountBalance = await query.execute(client);

  //Print the balance of hbars
  console.log(
    "The hbar account balance for this account is " + accountBalance.hbars
  );

  //v2.0.7

  app.get("/createAccount", async (req, res) => {
    //Create new keys
    const newAccountPrivateKey = await PrivateKey.generate();
    console.log(newAccountPrivateKey);
    const newAccountPublicKey = newAccountPrivateKey.publicKey;

    //Create a new account with 1,000 tinybar starting balance
    const newAccountTransactionResponse = await new AccountCreateTransaction()
      .setKey(newAccountPublicKey)
      .setInitialBalance(new Hbar(10))
      .execute(client);

    // Get the new account ID
    const getReceipt = await newAccountTransactionResponse.getReceipt(client);
    const newAccountId = getReceipt.accountId;
    console.log("The new account ID is: " + newAccountId);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({
      status: "success",
      id: `${newAccountId}`,
      key: `${newAccountPrivateKey}`,
    });
  });

  app.post("/transferMoney/:id/:key", async (req, res) => {
    try {
      const id = req.params.id;
      const key = req.params.key;
      console.log(id);
      const transaction = new TransferTransaction()
        .addHbarTransfer(id, new Hbar(-3))
        .addHbarTransfer("0.0.2978176", new Hbar(3));

      const client = Client.forTestnet();
      client.setOperator(id, key);
      const query = new AccountBalanceQuery().setAccountId(id);
      let accountBalance = await query.execute(client);
      //Print the balance of hbars
      console.log(
        "The hbar account balance for this account is " + accountBalance.hbars
      );

      //Submit the transaction to a Hedera network
      const txResponse = await transaction.execute(client);

      //Request the receipt of the transaction
      const receipt = await txResponse.getReceipt(client);

      //Get the transaction consensus status
      const transactionStatus = receipt.status;

      console.log(
        "The transaction consensus status is " + transactionStatus.toString()
      );

      accountBalance = await query.execute(client);
      console.log(
        "The hbar account balance for this account is " + accountBalance.hbars
      );
    } catch (error) {
      console.log(error);
    }
  });
  //Verify the account balance
  //   const accountBalance = await new AccountBalanceQuery()
  //     .setAccountId(newAccountId)
  //     .execute(client);

  //   console.log(
  //     "The new account balance is: " +
  //       accountBalance.hbars.toTinybars() +
  //       " tinybar."
  //   );

  //  *******Transfering money from one account to another created above******
  //Create the transfer transaction

  /*const transferTransactionResponse = await new TransferTransaction()
    .addHbarTransfer(myAccountId, Hbar.fromTinybars(-1000)) //Sending account
    .addHbarTransfer(newAccountId, Hbar.fromTinybars(1000)) //Receiving account
    .execute(client);

  //Verify the transaction reached consensus
  const transactionReceipt = await transferTransactionResponse.getReceipt(
    client
  );
  console.log(
    "The transfer transaction from my account to the new account was: " +
      transactionReceipt.status.toString()
  );

  //Request the cost of the query
  const getBalanceCost = await new AccountBalanceQuery()
    .setAccountId(newAccountId)
    .getCost(client);

  console.log("The cost of query is: " + getBalanceCost);

  //Check the new account's balance
  const getNewBalance = await new AccountBalanceQuery()
    .setAccountId(newAccountId)
    .execute(client);

  console.log(
    "The account balance after the transfer is: " +
      getNewBalance.hbars.toTinybars() +
      " tinybar."
  );*/
}
main();

app.listen(3000, () => {
  console.log("SERVER RUNNING ON PORT 3000...");
});
