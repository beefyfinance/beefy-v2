//Node.js script to be run from root beefy-v2 directory with original "beefy-app" 
// sources in a sibling directory

import * as FS from 'fs';

//const mAO_CHAIN = ["bsc", "heco", "fantom", "polygon", "avalanche"];
const mAO_CHAIN = [{S_SRC: "bsc"}, 
										{S_SRC: "heco"}, 
										{S_SRC: "fantom"}, 
										{S_SRC: "polygon"},
										{S_SRC: "avalanche", S_TRGT_ALIAS: "avax"}];
const mS_PROPNM_ID = "id", mS_PROPNM_ASSTS = "assets", mS_PROPNM_STRAT_TYP = "stratType", 
			mS_PROPNM_CHAIN = "network", mS_PROPNM_LOGO = "logo", 
			mAS_STRAT_TYP = [ "", "SingleStake", "StratLP", "StratMultiLP", "Vamp"];
const moAO_SRC = {}, mo_trgt = {}; 


async function p_loadChain( O_CHN)	{
	//note the specified chain's source and target vault data such that the target data 
	//	is efficiently searchable
//	const O = await import( 
//										`../../../beefy-app/src/features/configure/vault/${O_CHN}_pools.js`);
//	const O = (await import( 
//										`../../../beefy-app/src/features/configure/vault/${O_CHN}_pools.js`))[ O_CHN + 'Pools'];
//										`../../../scratch/${O_CHN}_pools.js`))[ O_CHN + 'Pools'];
//										`../config/vault/${O_CHN}.js`)).pools;
//										`../../../scratch/${O_CHN}.js`)).pools_Bss;
//										`../config/vault/${O_CHN}.js`))[ 'pools'];
//console.log( O);
//console.log( O[ O_CHN + 'Pools']);
//console.log( O.pools);
//return;
/*	await Promise.all( [async() => {moAO_SRC[ O_CHN] = (await import( 
										`../../../beefy-app/src/features/configure/vault/${O_CHN}_pools.js`)
										)[ O_CHN + 'Pools'];
*//*										.catch( O => {
											console.error( O);
											throw "err loading src: " + O_CHN;
										}))[ O_CHN + 'Pools'];*/
//console.log( moAO_SRC[ O_CHN])
//console.log( moAO_SRC)
//return;
//let i = 0;
/*	mo_trgt[ O_CHN] = (await import( `../config/vault/${O_CHN}.js`)).pools.reduce( 
																																			(o, O) => {
*//*										.catch( O => {
											console.error( O);
											throw "err loading trgt: " + O_CHN;
										})).pools.reduce( (o, O) => {*/
//if ( i++ < 5) console.log( "vault: " + O.id);
/*		o[ O.id] = O;
		return o;
	}, {});
*//*await Promise.all( [import( 
                     `../../../beefy-app/src/features/configure/vault/${O_CHN}_pools.js`), 
											import( `../config/vault/${O_CHN}.js`)])
											.catch( O => console.error( "erroR: " + O));
*//*await Promise.all( [async () => 
		moAO_SRC[ O_CHN] = (await import( 
                     `../../../beefy-app/src/features/configure/vault/${O_CHN}_pools.js`))[
    																																		O_CHN + 'Pools'], 
											async () => 
		mo_trgt[ O_CHN] = (await import( 
											`../config/vault/${O_CHN}.js`)).pools.reduce( (o, O) => {
if ( i++ < 5) console.log( "vault: " + O.id);
				o[ O.id] = O;
				return o;
			}, {})]).catch( O => console.error( "erroR: " + O));
*///await Promise.all( [(async () => console.log( "a1"))(),
//											(async () => console.log( "a2"))()]);
//await Promise.all( [console.log( "a1"),
//											console.log( "a2")]);
//console.log( "returning"); return;
//	await Promise.all( [(async () => {
//console.log( "load src: " + O_CHN); 
/*	await Promise.all( [(async () => {
console.log( "load src: " + O_CHN); 
		moAO_SRC[ O_CHN] = (await import( 
                     `../../../beefy-app/src/features/configure/vault/${O_CHN}_pools.js`))[
      																																O_CHN + 'Pools']})(), 
											(async () => 
		mo_trgt[ O_CHN] = (await import( 
											`../config/vault/${O_CHN}.js`)).pools.reduce( (o, O) => {
//if ( i++ < 5) console.log( "vault: " + O.id);
			o[ O.id] = O;
			return o;
		}, {}))()]);//.catch( O => console.error( "erroR: " + O));
*/[moAO_SRC[ O_CHN.S_SRC], mo_trgt[ O_CHN.S_SRC]] = await Promise.all( [
		(async () => (await import( 
									`../../../beefy-app/src/features/configure/vault/${O_CHN.S_SRC}_pools.js`))
									[O_CHN.S_SRC + 'Pools'])(), 
		(async () => (await import( 
													`../config/vault/${O_CHN.S_TRGT_ALIAS ? O_CHN.S_TRGT_ALIAS : 
													O_CHN.S_SRC}.js`)).pools.reduce( (o, O) => {
									if (o[ O[ mS_PROPNM_ID]])
										throw `Duplicate ${O_CHN.S_SRC} target vault-ID (${O[ mS_PROPNM_ID]}`;
									o[ O[ mS_PROPNM_ID]] = O; return o;}, {}))()
//	).catch( O => console.error( "erroR: " + O));
		])//.catch( O => {throw (O)});//console.error( "erroR: " + O));

//	mo_trgt[ O_CHN] = (await import( `../config/vault/${O_CHN}.js`)).pools;
//	mo_trgt[ O_CHN] = mo_trgt;
//if ("avalanche" === O_CHN.S_SRC)
//if ("heco" === O_CHN)
//console.log( mo_trgt[ O_CHN.S_SRC]);
//console.log( mo_trgt);
console.log( "loaded: " + O_CHN.S_SRC);
} //p_loadChain(


async function p_loadAllVaultData()	{
	const Af = [];
	for (const O_CHN of mAO_CHAIN)	{
//console.log( "chain: " + O_CHN.S_SRC);
		Af.push( (async () => (await p_loadChain( O_CHN)))());
//		Af.push( async () => await p_loadChain( O_CHN));
//		let b = false;
//		try	{
//			p_loadChain( O_CHN).catch( O => {console.error( "caught: " + O); throw (O);});
//			p_loadChain( O_CHN);//.catch( O => {b = true; console.error( "ER ROr: " + O);});
/*			if (b)	{
				console.error( "stopping");
				break;
			}
*/	//		p_loadChain( O_CHN).catch( O => {throw (O)});//console.error( "ER ROr: " + O));
	//break;
/*		} catch (O)	{
	console.log( "ERROR ERROR ERROR");
			console.error( "error: " + O);
		}
*/	} //for (const O_CHN
//console.log( Af);
//	return new Promise(() => true);
	return Promise.all( Af);
//	return true;
} //p_loadAllVaultData(


async function p_main()	{
	//efficiently load both source and target data, and the target data such that it's 
	//	efficiently searchable
	try	{
		await p_loadAllVaultData();
//		var x = await p_loadAllVaultData();//.catch( O => {console.error( "caught2: " + O);});
//		var x = await p_loadAllVaultData().catch( O => {console.error( "caught2: " + O);});
//		var x = await new Promise( loadAllVaultData).catch( O => {console.error( "caught2: " + O);});
//console.log( mo_trgt[ "avalanche"]);
//console.log( "all awaited? " + x);
	} catch (O)	{
		console.error( O);
		return;
	} //try

	let S_DIR_BASE = import.meta.url.slice( 'file://'.length, 1000).split( '/').slice( 
																																				0, -4).join( '/');
	let o_trgtChn, aS_added = [], o_DirSingleLogo, o_Dirent = {}, o_singleLogo = {};

	//for each chain..
	const O_PROP_IGNR = {depositsPaused: ""}; 
	for (const O_CHN of mAO_CHAIN)	{
		console.log( `Sync v1 vaults to v2, ${O_CHN.S_SRC} chain...`); 
		o_trgtChn = mo_trgt[ O_CHN.S_SRC];

		//for each source vault...
		for (const O_SRC of moAO_SRC[ O_CHN.S_SRC])	{
			let o_trgt;

			//if the vault is present in target array already...
			if (o_trgt = o_trgtChn[ O_SRC[ mS_PROPNM_ID]])	{
				//for each relevant property in the source descripter...
				for (const S in O_SRC)	{
					//If the target vault descriptor doesn't need to be tested (because we already 
					//	know the property or it's obsolete), loop for the next property. Or, since 
					//	the source vault descriptor is the latest truth, if the property matches 
					//	the target's counterpart, loop. 
					if (S in {[mS_PROPNM_ID]: "", ...O_PROP_IGNR} || o_trgt[ S] === O_SRC[ S])
						continue;

					//Since the source vault descriptor represents the system's source of truth, 
					//	the target's descriptor needs to be updated to match. If this property is 
					//	the vault's assets-array property...
					if (mS_PROPNM_ASSTS === S)	{
						//if the array's contents match exactly the target counterpart's, loop for the 
						//	descriptor's next property
						if (O_SRC[ S].length == o_trgt[ S].length && o_trgt[ S].every( (s, i) => 
																																	O_SRC[ S][ i] === s))
							continue;

						//update the target's counterpart property
						o_trgt[ S] = [...O_SRC[ S]];
					//else update the target's counterpart property, since it's outdated. Also if 
					//	it's the logo file that's been updated, go ahead and copy over the file now
					}else	{
						o_trgt[ S] = O_SRC[ S];
						if (mS_PROPNM_LOGO === S)
							try	{
								FS.copyFileSync( `${S_DIR_BASE}/beefy-app/src/images/${O_SRC[ S]}`, 
																				`${S_DIR_BASE}/beefy-v2/src/images/${O_SRC[ S]}`);
								console.log( `Migrated updated logo of vault ${O_SRC[ mS_PROPNM_ID]}`);
							} catch (O)	{
								console.error( 
														`Failed to copy over obstensibly updated logo of vault ${O_SRC[ 
														mS_PROPNM_ID]}: \n   beefy-app/src/images/${O_SRC[ 
														S]} (Error: ${O}`);
							}
					} //if (mS_PROPNM_ASSTS === S)

					//ensure it's noted that a change to the target array of vault descriptors 
					//	has occurred 
					if (!o_trgtChn.b_dirty)
						o_trgtChn.b_dirty = true;
				} //for (const S in O_SRC)

				//loop for the next source vault
				continue;
			} //if (o_trgt = o_trgtChn[ O_SRC[ mS_PROPNM_ID]]

			//Since unknown in the target environment, time to add a copy of the source vault 
			//	descriptor to the array, First, if no vault logo is specified...
			const S_LOGO = O_SRC[ mS_PROPNM_LOGO]; 
			if (!S_LOGO)	{
				//insofar as still needed, copy each asset's icon from the default source repository
				if (!o_DirSingleLogo)	{
					const S = `${S_DIR_BASE}/beefy-app/src/images/single-assets`;
					try	{
						o_DirSingleLogo = FS.opendirSync( S);
					} catch (O)	{
						console.error( `Failed to open expected source directory ${S}`);
						o_DirSingleLogo = false; o_Dirent = null;	//sentinels to shut down any work 
																											//	against this missing repository
					}
				} //if (!o_DirSingleLogo)
				let s_ASST;
				try	{
					const S_PROCESSD = ':';
					for (s_ASST of O_SRC[ mS_PROPNM_ASSTS])	{
						let s = o_singleLogo[ s_ASST];
						if (!s && o_Dirent)	{
							while (o_Dirent = o_DirSingleLogo.readSync())	{
								let i;
								if (!( o_Dirent.isFile() && (i = o_Dirent.name.lastIndexOf( '.')) > 0 && 
																		++i < o_Dirent.name.length - 1 && 
																		['svg', 'webp', 'png'].includes( o_Dirent.name.slice( 
																		i - o_Dirent.name.length).toLowerCase())))
									continue;
								s = o_Dirent.name.slice( 0, i - 1);
								o_singleLogo[ s] = o_Dirent.name;
								if (s_ASST === s)
									break;
							} //while (o_Dirent = 
							s = o_Dirent ? o_Dirent.name : null;
						}else if (S_PROCESSD === s)
							continue;
						if (s)	{
							o_singleLogo[ s_ASST] = S_PROCESSD;
							FS.copyFileSync( `${S_DIR_BASE}/beefy-app/src/images/single-assets/${s}`, 
																`${S_DIR_BASE}/beefy-v2/src/images/single-assets/${s}`);
						}else
							console.error( `Failed to locate icon for ${O_SRC[ 
																	mS_PROPNM_CHAIN]} asset ${s_ASST} of new vault ${O_SRC[ 
																	mS_PROPNM_ID]}`);
					} //for (s_ASST of O_SRC[ mS_PROPNM_ASSTS])
				} catch (O)	{
					console.error( `Failed to copy over an expected icon for ${O_SRC[ 
																	mS_PROPNM_CHAIN]} asset ${s_ASST} of new vault ${O_SRC[ 
																	mS_PROPNM_ID]}\n  (Error: ${O}`);
				} //try
			//else copy over the logo specified in the source descriptor
			}else
				try	{
					FS.copyFileSync( `${S_DIR_BASE}/beefy-app/src/images/${S_LOGO}`, 
														`${S_DIR_BASE}/beefy-v2/src/images/${S_LOGO}`);
				} catch (O)	{
					console.error( `Failed to copy over specified logo of new vault ${O_SRC[ 
													mS_PROPNM_ID]}:\n   beefy-app/src/images/${S_LOGO} (Error: ${O}`);
				} //try

			//form a copy of the source vault descriptor to the array,adjusting as needed to 
			//	match the target format
			let o = {...O_SRC}; o[ mS_PROPNM_ASSTS] = [...O_SRC[ mS_PROPNM_ASSTS]];
			for (const S in O_PROP_IGNR) if (S in o) delete o[S];
			if (o[ mS_PROPNM_ASSTS])	{
				const I = o[ mS_PROPNM_ASSTS].length;
//TODO?: somehow programatically set 'Vamp' stratType
				o[ mS_PROPNM_STRAT_TYP] = mAS_STRAT_TYP[ I < 3 ? I : 3]; 
			}else
				console.error( `Asset list missing on source vault ${o[ mS_PROPNM_ID]} on ${o[ 
																															mS_PROPNM_CHAIN]} chain`);
			o[ mS_PROPNM_CHAIN] = O_CHN.S_TRGT_ALIAS ? O_CHN.S_TRGT_ALIAS : O_CHN.S_SRC;
			o_trgtChn[ o[ mS_PROPNM_ID]] = o;

			//Both ensure it's noted that a change to the target vault array has occurred and add 
			//	the vault's ID to a running list of descriptors migrated.
			if (!o_trgtChn.sirty)
				o_trgtChn.b_dirty = true;
			aS_added.push( o[ mS_PROPNM_CHAIN] + ": " + o[ mS_PROPNM_ID]);
		} //for (const O_SRC of moAO_SRC[ O_CHN.S_SRC]
	} //for (const O_CHN of mAO_CHAIN)

	//if nothing has changed, our work is done
	if (!aS_added.length)	{
		console.log( "No v1 changes to sync over to v2. Finished.");
		return;
	}

	//tell maintainer the v1 vaults migrated to v2
	FS.writeFileSync( `${S_DIR_BASE}/beefy-v2/vaultsAddedFromV1.txt`, JSON.stringify( 
																																	aS_added, null, 2));

	//for each changed target array, commit it to persistent storage
//	let S;
//	const FS = require( 'fs');
	for (const O_CHN of mAO_CHAIN)	{
//for ([S, o_trgtChn] of Object.entries( mo_trgt))	{
		o_trgtChn = mo_trgt[ O_CHN.S_SRC];
		if (!o_trgtChn.b_dirty)
			continue;
		console.log( "Writing updated v2 vault descriptors file: " + O_CHN.S_SRC);
//console.log( import.meta.url.split( '/').slice( 0, -2));		
		delete o_trgtChn.b_dirty;
		FS.writeFileSync( `${S_DIR_BASE}/beefy-v2/src/config/vault/${O_CHN.S_TRGT_ALIAS ? 
										O_CHN.S_TRGT_ALIAS : O_CHN.S_SRC}.js`, 
										`export const pools = ${JSON.stringify( Object.values( o_trgtChn), 
										null, 2).replace( /"([^"]+)":/g, "$1:")};`);
	} //for (o_trgtChn of mo_trgt)

	console.log( "Finished v1-to-v2 vault sync.");
} //p_main(

p_main();
