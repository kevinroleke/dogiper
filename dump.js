import { ChainId, Token, Fetcher, Route, Percent, Trade, TradeType, TokenAmount } from '@traderjoe-xyz/sdk';
import {ethers} from 'ethers';

export async function Approve(amount, provider, signer) {
	const sdogAddr = "0xde9e52f1838951e4d2bb6c59723b003c353979b6";
	const traderJoeRouterAddr = "0x60aE616a2155Ee3d9A68541Ba4544862310933d4";

	const abi = ["function approve(address _spender, uint256 _value) public returns (bool success)"]
	const sdogContract = new ethers.Contract(ethers.utils.getAddress(sdogAddr), abi, signer);

	const tx = await sdogContract.approve(ethers.utils.getAddress(traderJoeRouterAddr), ethers.utils.parseUnits(amount.toString(), 9));
	
	console.log(`TXHASH: ${tx.hash}`);

	const receipt = await tx.wait();
	return receipt.status;
}

export async function Dump(amount, provider, signer, to, slippage) {
	const mimAddr = "0x130966628846bfd36ff31a822705796e8cb8c18d";
	const sdogAddr = "0xde9e52f1838951e4d2bb6c59723b003c353979b6";
	const traderJoeRouterAddr = "0x60aE616a2155Ee3d9A68541Ba4544862310933d4";

	const chainId = ChainId.AVALANCHE;

    	const abi = ['function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
		    'function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)'];
	const traderJoeRouterContract = new ethers.Contract(ethers.utils.getAddress(traderJoeRouterAddr), abi, signer);

	const MIM = await Fetcher.fetchTokenData(chainId, ethers.utils.getAddress(mimAddr), provider);
	const SDOG = await Fetcher.fetchTokenData(chainId, ethers.utils.getAddress(sdogAddr), provider);

	const pair = await Fetcher.fetchPairData(MIM, SDOG, provider);
	const route = new Route([pair], SDOG);
	
	const trade = new Trade(
  		route,
  		new TokenAmount(SDOG, ethers.utils.parseUnits(amount.toString(), 9)),
  		TradeType.EXACT_INPUT
	);

	const slippageTolerance = new Percent(slippage, "100");
	const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw.toString();
	
	const path = [SDOG.address, MIM.address];
	const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
	const tx = await traderJoeRouterContract.swapExactTokensForTokens(
		ethers.utils.parseUnits(amount.toString(), 9),
		amountOutMin,
		path, to, deadline,
		{ gasLimit: ethers.utils.hexlify(200000), gasPrice: ethers.utils.parseUnits("35", "gwei") }
	);

	console.log(`TXHASH: ${tx.hash}`)

	const receipt = await tx.wait();
	return receipt.status;
}
