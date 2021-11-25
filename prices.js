import { ChainId, Token, Fetcher, Route } from '@traderjoe-xyz/sdk';
import {ethers} from 'ethers';

export default async function GetPrice(provider) {
	const chainId = ChainId.AVALANCHE;

	const mimAddr = "0x130966628846bfd36ff31a822705796e8cb8c18d";
	const sdogAddr = "0xde9e52f1838951e4d2bb6c59723b003c353979b6";

	const MIM = await Fetcher.fetchTokenData(chainId, ethers.utils.getAddress(mimAddr), provider);
	const SDOG = await Fetcher.fetchTokenData(chainId, ethers.utils.getAddress(sdogAddr), provider);

	const pair = await Fetcher.fetchPairData(MIM, SDOG, provider);

	const route = new Route([pair], SDOG);

	return route.midPrice.toSignificant(6);
}
