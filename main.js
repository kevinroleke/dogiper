import GetPrice from './prices.js';
import Delay from './functions.js';
import { Dump, Approve } from './dump.js';
import ethers from 'ethers';
import ChainId from '@traderjoe-xyz/sdk'
import * as readline from 'readline-sync';

async function main() {
	const a1 = await readline.question('Price check interval (ms) [5000]? ');
	const a2 = await readline.question('Amount of SnowDog (SDOG) [0.0001]? ');
	const a3 = await readline.question('Limit price (MIM) [2000]? ');
	const a4 = await readline.question('Slippage tolerance (percentage) [10]? ')
	const a5 = await readline.question('Sleep until 2:55PM EST 11/25/21 [yes]? ');
	const a6 = await readline.question('Retry with larger slippage if swap fails [yes]? ');

	let delay, amount, limit, slippage, sleep, retry;
	
	if (!a1) {
		delay = 5000;
	} else {
		delay = parseInt(a1);
	}

	if (!a2) {
		amount = 0.0001;
	} else {
		amount = parseFloat(a2);
	}

	if (!a3) {
		limit = 2000;
	} else {
		limit = parseFloat(a3);
	}

	if (!a4) {
		slippage = "5"; // 5% slippage 
	} else {
		slippage = a3;
	}

	if (a5 == "no") {
		sleep = false;
	} else {
		sleep = true;
	}

	if (a6 == "no") {
		retry = false;
	} else {
		retry = true;
	}

	const chainId = ChainId.AVALANCHE;
        const provider = new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc', chainId);

	const wallet = new ethers.Wallet(
                Buffer.from(
                        process.env.PRIVATE_KEY,
                        "hex"
                )
        )
        const signer = wallet.connect(provider)

	let res = await Approve(amount, provider, signer);
	if (!res) {
		console.log('Unable to approve SDOG. Did you enter a valid amount?');
		return;
	} else {
		console.log(`Approved ${amount} SDOG for spending by the TraderJoe Router.`);
	}

	if (sleep) {
		const ms = new Date(2021, 10, 25, 19, 55, 0, 0).getTime() - new Date().getTime();
		console.log(`Waiting ${ms}ms until starting sniper.`);
		await Delay(ms);
	}

	let dumped = false;
	while (!dumped) {
		let price = await GetPrice(provider);
		console.log(price);

		if (price > limit) {
			let res = await Dump(amount, provider, signer, wallet.address, slippage);
			if (res) {
				console.log(`dumped ${amount} SDOG`);
				dumped = true;
			} else if (!retry) {
				console.log(`failed to dump SDOG`);
				return;
			} else {
				console.log(`failed to dump SDOG`);
				slippage += 3;
			}
		}

		await Delay(delay);
	}
}

if (process.env.PRIVATE_KEY == undefined) {
	console.log('Provide your private key with the env var PRIVATE_KEY');
} else {
	await main();
}
