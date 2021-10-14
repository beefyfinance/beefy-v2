/*********
Node.js script to tell maintainer which tokens lack descriptions in Beefy's 
Node-modularized address book. Script assumes address-book has been built within 
the node_modules tree, and that it's up-to-date (i.e. the latest version of the 
address book.

Script should be run from root "beefy-v2" directory:

node src/scripts/tokensWithoutDescrip.mjs

Progess will be reported to standard out and errors to standard error.

Script creates an output file with a JSON-like listing of useful information about 
each token lacking its descrition: tokensWithoutDescrip.txt. The file is placed in 
directory from which the command is run. The maintainer should move or delete this 
file to ensure it won't be pushed into the main repository.

Development
+ v0.1.0.1 AllTrades: minor code cleanup (superfluous variable removal)
+ v0.1 AllTrades
**********/
import * as FS from 'fs';

const mAO_CHAIN = [{S_DIR: "bsc"}, 
										{S_DIR: "heco"}, 
										{S_DIR: "fantom"}, 
										{S_DIR: "polygon"},
										{S_DIR: "avax"},
										{S_DIR: "one"},
										{S_DIR: "arbitrum"}];
const mS_PROPNM_DESCRIP = "description", mS_PROPNM_NM = "name", mS_PROPNM_SYMBL = "symbol", 
			mS_PROPNM_ADDR = "address", mS_PROPNM_SITE = "website";
const mo_SRC = {};


async function p_loadChain( O_CHN)	{
	//note the specified chain's source token data
	mo_SRC[ O_CHN.S_DIR] = (await import( 
									`../../node_modules/blockchain-addressbook/build/address-book/${
									O_CHN.S_DIR}/tokens/tokens.js`))[ 'tokens']; 

	console.log( "loading: " + O_CHN.S_DIR);
} //p_loadChain(


async function p_loadAllTokenData()	{
	const Af = [];
	for (const O_CHN of mAO_CHAIN)
		Af.push( (async () => (await p_loadChain( O_CHN)))());

	return Promise.all( Af);
} //p_loadAllTokenData(


async function p_main()	{
	//efficiently load source data
	try	{
		await p_loadAllTokenData();
	} catch (O)	{
		console.error( O);
		return;
	}
	console.log( "Each chain's tokens loaded successully for processing.");

	const S_DIR_BASE = import.meta.url.slice( 'file://'.length, 1000).split( '/').slice( 
																																				0, -4).join( '/');

	//for each chain..
	for (const O_CHN of mAO_CHAIN)	{
		console.log( `Analyzing tokens on chain '${O_CHN.S_DIR}'...`);

		//for each token registered on the chain...
		const ao_trgtChn = moao_trgt[ O_CHN.S_DIR] = [];
		for (const S_TKN in mo_SRC[ O_CHN.S_DIR])	{
			const O = mo_SRC[ O_CHN.S_DIR][ S_TKN];

			//if the description property is present, loop for the next token
			if (O[ mS_PROPNM_DESCRIP] && O[ mS_PROPNM_DESCRIP].trim())
				continue;

			//make a note of the token having no description yet
			ao_trgtChn.push( { [S_TKN]: { 
													[mS_PROPNM_NM]: O[ mS_PROPNM_NM], 
													[mS_PROPNM_SYMBL]: O[ mS_PROPNM_SYMBL], 
													[mS_PROPNM_ADDR]: O[ mS_PROPNM_ADDR], 
													[mS_PROPNM_SITE]: O[ mS_PROPNM_SITE]}});
		} //for (const S_TKN of mo_SRC[ O_CHN.S_DIR])
	} //for (const O_CHN in mAO_CHAIN)

	//inform maintainer of the v1 vaults migrated to v2
	FS.writeFileSync( `${S_DIR_BASE}/beefy-v2/tokensWithoutDescrip.txt`, JSON.stringify( 
																																	moao_trgt, null, 2));
	console.log( "Processing complete. Output file written: tokensWithoutDescrip.txt");
} //p_main()

//launch the analysis
p_main();
