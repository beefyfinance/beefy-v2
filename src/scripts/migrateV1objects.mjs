/*********
Node.js script to refresh the v2 app with the vaults-and-boosts state found in the v1 app.

NOTE: DO NOT RUN THIS SCRIPT if the v1 app is no longer the source of truth for the system! 
			v2 vault and boost descriptors not seen among v1 descriptors will be REMOVED!

"New" vaults and boosts in v1 are pulled into v2, and outdated properties in current v2 
vaults are refreshed with their v1 counterparts. Associated logo/icon files are accounted 
for as well. In other words, v1 is considered the source of truth in this operation.

Script should be run from the root "beefy-v2" directory with fresh "beefy-app" sources in 
a _sibling_ directory. A working Node.js environment off the beefy-v2 directory is 
assumed. Linux command line to invoke the script:

node --loader ts-node/esm  src/scripts/migrateV1objects.mjs

Progress will be printed to standard output and standard error.

Aspects of a full migration which this script cannot perform are two:
(a) The v2 "Vamp" vault strategy type (key "stratType"). This cannot be reliably 
programmatically discerned from the v1 object descriptor. This property may however be 
added to the v1 object in anticipation of future use in v2. This script will 
accmmodatingly copy it over.
(b) The v2 child array of vault risk factors (key "risks"). Concept unnknown in v1. This 
array may however be added to the v1 object in anticipation of future use in v2. This 
script will accommodatingly copy it over.

To assist the maintainer in manually updating these v2 aspects, an output file with an 
array-listing of the IDs of the v2 vaults and boosts which have been adjusted is created: 
V1objectsMigrated.log. The file is placed in the directory from which the command is 
run. To cut down onrepository pollution, the maintainer may avoid pushing this file into 
the staging repository.

Development
+ v0.7.1.2 AllTrades: add similar hack handling of special beJoestaking pool
+ v-.7.1.1 chebiN: fixed bug to stop deletion of the beFTM earnings pool in v2
+ v0.7.1.0 AllTrades & chebiN: fixed bug in reflecting deposits-paused and vault-status 
											properties; handled edge case of EOL suffix on earnings pools
+ v0.7.0.7 AllTrades: finish hack handling of special beFTM staking pool
+ v0.7.0.6 AllTrades: hack handling of special beFTM staking pool
+ v0.7.0.5 AllTrades: add Moonbeam blockchain
+ v0.7.0.4 AllTrades: add Aurora blockchain
+ v0.7.0.3 AllTrades: add Metis blockchain
+ v0.7.0.2 AllTrades: add Fuse blockchain
+ v0.7.0.1 AllTrades: small bugfix to preserve common-partner references
+ v0.7 AllTrades: migrate boosts as well as vaults
+ v0.5.6.0.1 AllTrades: small bugfix
+ v0.5.6.0.0 AllTrades: fix bug where v1 deposits-paused property was not being reflected 
												over to v2
+ v0.5.5.0.4 AllTrades: small bugfix
+ v0.5.5.0.3 AllTrades: small bugfix
+ v0.5.5.0.2 AllTrades: add support for Cronos chain
+ v0.5.5.0.1 AllTrades: adjustment to preserve the new & special v2 bifi-gov vault objects
+ v0.5.5 AllTrades
  - add support for the Moonriver chain
	- support TypeScript when importing v2 data
+ v0.5 AllTrades
  - add support for the Celo chain, and prep for other chains going forward by allowing 
		the target v2 vault-descriptor file to be generated automatically if not found
  - prune v2 vaults not found among v1 vaults
	- improve data output both to console and into output file
+ v0.4 AllTrades: handle EOL'd v1 vaults properly and so prevent vault-object duplication  
	in v2
+ v0.3 AllTrades: accomodate v2 property-anticipation in v1 vault objects
+ v0.1.0.1 AllTrades: moved script into a new src/script, incorporated Arbitrum
+ v0.1 AllTrades
**********/

import mO_FS from 'fs';

const mAO_CHAIN = [{S_SRC: "bsc"}, 
									{S_SRC: "heco"}, 
									{S_SRC: "fantom"}, 
									{S_SRC: "polygon", S_GVPOOL_SFX_ALIAS: "polygon"},
									{S_SRC: "avalanche", S_TRGT_ALIAS: "avax", S_ABOOK_ALIAS: "avax"},
									{S_SRC: "harmony", S_ABOOK_ALIAS: "one", S_GVPOOL_SFX_ALIAS: "harmony"}, 
									{S_SRC: "arbitrum"},
									{S_SRC: "celo"}, 
									{S_SRC: "moonriver", S_GVPOOL_SFX_ALIAS: "moonriver"},
									{S_SRC: "cronos", S_GVPOOL_SFX_ALIAS: "cronos"},
									{S_SRC: "fuse"}, 
									{S_SRC: "metis"},
									{S_SRC: "aurora", S_GVPOOL_SFX_ALIAS: "aurora"},
									{S_SRC: "moonbeam", S_GVPOOL_SFX_ALIAS: "moonbeam"},
									{S_SRC: "emerald"}],
			mS_PRPNM_ID = "id", mS_PRPNM_ASSTS = "assets", mS_PRPNM_STRAT_TYP = "stratType", 
			mS_PRPNM_CHAIN = "network", mS_PRPNM_LOGO = "logo", mS_PRPNM_RISKS = "risks",
			mS_PRPNM_CTRCT = "earnContractAddress", mS_PRPNM_TYP = "type", 
			mS_PRPNM_DEPOST_PSD = "depositsPaused", mS_PRPNM_STATUS = "status", 
			mS_PRPNM_ID_VLT = "poolId", mS_PRPNM_PTNRS = "partners", mS_PRPNM_SOCL = "social", 
			mS_PRPNM_TKN = "tokenAddress", mS_PRPNM_VLT_ID = "poolId", 
			mS_PRPNM_PTNR_CTX = "O_CTX", mS_PRPNM_MOD = "O_MOD", mS_PRPNM_CMN_PTNRS = "AO_PTNRS", 
			mS_PRPNM_PTNR = "O_ptnr", mS_PRPNM_NM = "S_NM", mS_PRPNM_CHKD = "s_chkd", 
			mS_DIR_BASE = import.meta.url.slice( 'file://'.length, 1000).split( '/').slice( 
																																				0, -4).join( '/'),
			mAS_STRAT_TYP = [ "", "SingleStake", "StratLP", "StratMultiLP", "Vamp"];
const mO_PRPNM_PTNR_GRPHC = {logo: "", background: ""};
const moAO_SRC_VLTS = {}, mo_trgtVlts = {};


async function P_loadChainVaults( O_CHN)	{
	//note the specified chain's source and target vault data such that the target data 
	//	is efficiently searchable
	[moAO_SRC_VLTS[ O_CHN.S_SRC], mo_trgtVlts[ O_CHN.S_SRC]] = await Promise.all( [
		(async () => (await import( `../../../beefy-app/src/features/configure/vault/${
																				O_CHN.S_SRC}_pools.js`))[O_CHN.S_SRC + 'Pools'])(), 
		(async () => (await import( `../config/vault/${O_CHN.S_TRGT_ALIAS ? 
																							O_CHN.S_TRGT_ALIAS : O_CHN.S_SRC}.tsx`).then( 
																							O_MOD => O_MOD.pools.reduce( (o, O) => {
							if (o[ O[ mS_PRPNM_ID]])
								throw `Duplicate ${O_CHN.S_SRC} target vault-ID (${O[ mS_PRPNM_ID]}`;
							o[ O[ mS_PRPNM_ID]] = O; return o;}, {}), 
												() => ({})) ))()
		]);

	console.log( "loaded vaults: " + O_CHN.S_SRC);
} //P_loadChainVaults(


function P_loadAllVaultData()	{
	const aP = [];
	for (const O_CHN of mAO_CHAIN)
		aP.push( P_loadChainVaults( O_CHN));

	return Promise.all( aP);
} //P_loadAllVaultData(


//NOTE: Function currently has side-effect of copying logo files over from v1 to v2. 
//	Consider logging these as actions to be taken into the output object so that the side 
//	effect can be removed, if perhaps only for this function.
async function Po_resolveVaults()	{
	//efficiently load both source and target data, and the target data such that it's 
	//	efficiently searchable
	await P_loadAllVaultData();
	console.log( "All vault arrays loaded successfully for processing.");

	const O_hits = {};
	let o_trgtChn, i_pruned = 0, i_added = 0, b_dirty, o_DirSingleLogo, o_Dirent = {}, 
			o_singleLogo = {};

	//for each chain...
	const O_PROP_IGNR = {}; 
	for (const O_CHN of mAO_CHAIN)	{
		const S_TYP_RMVD = "REMOVED", S_TYP_ADD = "Added", S_TYP_UPDT = "synced", 
					S_PRPNM_LGO = "logo-copied", S_PRPNM_EOLD = "EOLd",
					S_TRGT_CHN = O_CHN.S_TRGT_ALIAS ? O_CHN.S_TRGT_ALIAS : O_CHN.S_SRC;

		console.log( `Sync v1 vaults to v2: ${O_CHN.S_SRC}`); 
		o_trgtChn = mo_trgtVlts[ O_CHN.S_SRC];

		//for each source vault on the chain...
		let s, o;
		for (const O_SRC of moAO_SRC_VLTS[ O_CHN.S_SRC])	{
			let o_trgt;

			//if the vault is known in target vault array already (including accounting for the 
			//	possibility that the source vault has been updated to end-of-life but its target 
			//	counterpart [v2] not yet)...
			s = null; o = null;
			const S_ID_SRC = O_SRC[ mS_PRPNM_ID];
			if (o_trgt = (o_trgtChn[ S_ID_SRC] || ((s = S_ID_SRC.split( 
																				/[-=]eol[0-9a-z]?$/)[ 0]) && S_ID_SRC !== s && 
																				(o = o_trgtChn[ s]) && O_SRC[ mS_PRPNM_CTRCT] === 
																				o[ mS_PRPNM_CTRCT] ? o : null)))	{
				//note that we've encountered this target vault
				const S_PRPNM_HIT = S_TRGT_CHN + " vault: " + S_ID_SRC, 
							O_hit = {[mS_PRPNM_ID]: S_PRPNM_HIT};

				//if the target vault's ID needs changing to reflect the end-of-life status of the
				//	source vault, make it so, and make a note of this major change
				if (o)	{
					O_hit[ mS_PRPNM_TYP] = S_TYP_UPDT; O_hit[ S_PRPNM_EOLD] = true;
					o_trgtChn[ S_ID_SRC] = o_trgt;
					o_trgt[ mS_PRPNM_ID] = S_ID_SRC;
					delete o_trgtChn[ s];
				}

				//for each relevant property in the vault's source descripter...
				let b_pausedStatusProcessd = false;
				for (const S in O_SRC)	{
					//If the target vault descriptor doesn't need to be tested (because we already 
					//	know the property's value or the property is obsolete), loop for the next 
					//	property. Or if the target's value already matches the source value, loop.
					if (S in {[mS_PRPNM_ID]: "", ...O_PROP_IGNR} || o_trgt[ S] === O_SRC[ S])
						continue;

					//Since the source vault descriptor represents the system's source of truth, 
					//	the target's descriptor needs to be updated to match. If this property is 
					//	the assets-array or risks-array property...
					let b_pausedPrp, b_eol;
					if (mS_PRPNM_ASSTS === S || mS_PRPNM_RISKS === S)	{
						//if the array's contents match exactly the target counterpart's, loop for the 
						//	descriptor's next property
						if (o_trgt[ S] && O_SRC[ S].length == o_trgt[ S].length && o_trgt[ S].every( 
																													(s, i) => O_SRC[ S][ i] === s))
							continue;

						//update the target's counterpart array, and ensure it's noted that an update 
						//	to the vault occurred
						o_trgt[ S] = [...O_SRC[ S]];
						O_hit[ mS_PRPNM_TYP] = S_TYP_UPDT;
					//else if this is the deposits-paused or vault-status property, handle the 
					//	interrelationship of these properties as the target requires...
					}else if ((b_pausedPrp = mS_PRPNM_DEPOST_PSD === S) || mS_PRPNM_STATUS === S)	{
						//if this interrelated pair of properties has already been processed for this 
						//	vault, loop for the next source property
						if (b_pausedStatusProcessd)
							continue;

						//if prompted first by the deposits-paused property...
						if (b_pausedPrp)	{
							//if the vault is now fully turned off...
							if ('eol' === O_SRC[ mS_PRPNM_STATUS])	{
								//if the target does not yet reflect this status, make it so now, and 
								//	ensure it's noted that an update to the vault has occurred
								if ('eol' !== o_trgt[ mS_PRPNM_STATUS])	{
									o_trgt[ mS_PRPNM_STATUS] = 'eol';
									O_hit[ mS_PRPNM_TYP] = S_TYP_UPDT;
								}
							//else if the source deposits-paused and vault-status property 
							//	interrelationship differs from what the target vault shows, update  
							//	the target's status, and ensure it's noted that an update to the vault 
							//	has occurred
							}else if (O_SRC[ S] ? 'active' === o_trgt[ mS_PRPNM_STATUS] : 'paused' === 
																																o_trgt[ mS_PRPNM_STATUS])	{
								o_trgt[ S] = O_SRC[ S];
								o_trgt[ mS_PRPNM_STATUS] = O_SRC[ S] ? 'paused' : 'active';
								O_hit[ mS_PRPNM_TYP] = S_TYP_UPDT;
							} //if ('eol' === O_SRC[ mS_PRPNM_STATUS])
						//else if the source vault has an active deposits-paused status which the 
						//	target doesn't reflect, reflect it now, and ensure it's noted that an 
						//	update to the vault has occurred
						}else if ((b_eol = 'eol' === O_SRC[ S]) || O_SRC[ mS_PRPNM_DEPOST_PSD] && 
																									'paused' !== o_trgt[ mS_PRPNM_STATUS])	{
							if (b_eol)
								o_trgt[ S] = O_SRC[ S];
							else
								o_trgt[ mS_PRPNM_STATUS] = O_SRC[ mS_PRPNM_DEPOST_PSD] ? 'paused' : 
																																									'active';
							O_hit[ mS_PRPNM_TYP] = S_TYP_UPDT;
						} //if (b_pausedPrp)

						//note that the deposits-paused and vault-status property interrelationship has 
						//	been processed for this vault, and loop for the next source property
						b_pausedStatusProcessd = true;
						continue;
					//Else update the target's counterpart property, since it is outdated. Also if 
					//	it's the logo file that's been updated, go ahead and copy over the file.
					}else	{
						//update the target's counterpart property, and note that a change was brought 
						//	over
						o_trgt[ S] = O_SRC[ S];
						O_hit[ mS_PRPNM_TYP] = S_TYP_UPDT;

						//if it's the logo file that's been updated..., 
						if (mS_PRPNM_LOGO === S)
							try	{
								//go ahead and copy over the file, and note that this was done
								copyOverSrcImage( O_SRC[ S]);
								O_hit[ S_PRPNM_LGO] = S;
								console.log( `  Migrated updated logo of vault ${O_SRC[ mS_PRPNM_ID]}`);
							} catch (O)	{
								console.error( `  Failed to copy over obstensibly updated logo of vault ${
																O_SRC[ mS_PRPNM_ID]}:\n   beefy-app/src/images/${O_SRC[ 
																S]} (Error: ${O}`);
							}
					} //if (mS_PRPNM_ASSTS === S)
				} //for (const S in O_SRC)

				//register particular notes on this vault, and if an update occurred, ensure it's 
				//	noted also that a change to the target array of vault descriptors has occurred 
				O_hits[ S_PRPNM_HIT] = O_hit;
				if (O_hit[ mS_PRPNM_TYP])
					o_trgtChn.b_dirty = true;

				//loop for the next source vault
				continue;
			} //if (o_trgt = (o_trgtChn[ S_ID_SRC] ||

			//Since unknown in the target environment, reflect the source vault descriptor into 
			//	the target array, First, if no vault logo is specified...
			const S_LOGO = O_SRC[ mS_PRPNM_LOGO]; 
			if (!S_LOGO)	{
				//insofar as still needed, copy each constituent asset's icon from the default 
				//	source repository
				if (!o_DirSingleLogo)	{
					const S = `${mS_DIR_BASE}/beefy-app/src/images/single-assets`;
					try	{
						o_DirSingleLogo = mO_FS.opendirSync( S);
					} catch (E)	{
						console.error( `  Failed to open expected source directory ${S}`);
						o_DirSingleLogo = false; o_Dirent = null;	//sentinels to shut down any work 
																											//	against this missing repository
					}
				} //if (!o_DirSingleLogo)
				let s_ASST;
				try	{
					const S_PROCESSD = ':';
					for (s_ASST of O_SRC[ mS_PRPNM_ASSTS])	{
						s = o_singleLogo[ s_ASST];
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
							mO_FS.copyFileSync( `${mS_DIR_BASE}/beefy-app/src/images/single-assets/${s}`, 
																`${mS_DIR_BASE}/beefy-v2/src/images/single-assets/${s}`);
						}else
							console.error( `  Failed to locate icon for ${O_SRC[ 
																	mS_PRPNM_CHAIN]} asset ${s_ASST} of new vault ${O_SRC[ 
																	mS_PRPNM_ID]}`);
					} //for (s_ASST of O_SRC[ mS_PRPNM_ASSTS])
				} catch (O)	{
					console.error( `  Failed to copy over an expected icon for ${O_SRC[ 
																	mS_PRPNM_CHAIN]} asset ${s_ASST} of new vault ${O_SRC[ 
																	mS_PRPNM_ID]}\n   (Error: ${O}`);
				} //try
			//else copy the _specified_ logo over
			}else
				try	{
					copyOverSrcImage( S_LOGO);
				} catch (O)	{
					console.error( `  Failed to copy over specified logo of new vault ${O_SRC[ 
													mS_PRPNM_ID]}:\n   beefy-app/src/images/${S_LOGO} (Error: ${O}`);
				}

			//reflect the source vault descriptor to the target array such that it adheres to 
			//	the format desired by the target 
			o = {...O_SRC};
			o[ mS_PRPNM_ASSTS] = [...O_SRC[ mS_PRPNM_ASSTS]];
			for (const S in O_PROP_IGNR) if (S in o) delete o[ S];
			if (O_SRC[ mS_PRPNM_RISKS])
				o[ mS_PRPNM_RISKS] = [...O_SRC[ mS_PRPNM_RISKS]];
			if (o[ mS_PRPNM_ASSTS])	{
				if (!o[ mS_PRPNM_STRAT_TYP])	{
					const I = o[ mS_PRPNM_ASSTS].length;
//TODO?: somehow programatically set 'Vamp' stratType
					o[ mS_PRPNM_STRAT_TYP] = mAS_STRAT_TYP[ I < 3 ? I : 3]; 
				}
			}else
				console.error( `  Asset list missing on source vault ${o[ mS_PRPNM_ID]} on ${o[ 
																															mS_PRPNM_CHAIN]} chain`);
			o[ mS_PRPNM_CHAIN] = O_CHN.S_TRGT_ALIAS ? O_CHN.S_TRGT_ALIAS : O_CHN.S_SRC;

			//reflect the interrelationship between the source deposits-paused and vault-status 
			//	properties as required by the target
			if (O_SRC[ mS_PRPNM_DEPOST_PSD])
				delete o[ mS_PRPNM_DEPOST_PSD];
			if (O_SRC[ mS_PRPNM_DEPOST_PSD] && 'eol' !== O_SRC[ mS_PRPNM_STATUS])
				o[ mS_PRPNM_STATUS] = 'paused';

			//register the newly reflected vault descriptor in the target-vault list, and ensure 
			//	it's noted that a change to the overall target vault array has occurred, and add  
			//	the vault's ID to a running list of target vaults encountered, including a 
			//	special note that this one was newly added
			o_trgtChn[ o[ mS_PRPNM_ID]] = o;
			i_added++;
			O_hits[ s = o[ mS_PRPNM_CHAIN] + " vault: " + o[ mS_PRPNM_ID]] = 
																						{[mS_PRPNM_ID]: s, [mS_PRPNM_TYP]: S_TYP_ADD};
			o_trgtChn.b_dirty = true;
		} //for (const O_SRC of moAO_SRC_VLTS[ O_CHN.S_SRC]

		//All source vaults on this chain having been processed, cycle through the list of 
		//	_regular_ vaults (i.e. not earnings pools) on the target platform (v2) and delete 
		//	those that are unknown on the source platform (v1), the last word on what exists on 
		//	Beefy. Also note any such deletions.
		const I = i_pruned;
		Object.values( o_trgtChn).forEach( O_trgt => {
			if (!(O_trgt && Object === O_trgt.constructor) || (s = O_trgt[ 
										mS_PRPNM_ID]).includes( "bifi-gov") || "beefy-beFTM-earnings" === s || 
										"beefy-beJoe-earnings" === s || s.endsWith('-earnings'))
				return;
			const S = S_TRGT_CHN + " vault: " + O_trgt[ mS_PRPNM_ID];
			if (O_hits[ S])
				return;
			delete o_trgtChn[ O_trgt[ mS_PRPNM_ID]];
			O_hits[ S] = {[mS_PRPNM_ID]: S, [mS_PRPNM_TYP]: S_TYP_RMVD};
			i_pruned++;
		}); //Object.values( o_trgtChn).forEach(
		if (i_pruned > I)
			o_trgtChn.b_dirty = true;

		//if no change has been noted prior to processing this chain and a change to this  
		//	chain's target array of vaults was encountered, note now _overall_ that change has 
		//	been located
		if (!b_dirty)
			b_dirty = o_trgtChn.b_dirty;
	} //for (const O_CHN of mAO_CHAIN)

	return b_dirty ? {O_hits, I_ADDED: i_added, I_PRUNED: i_pruned} : null;
} //Po_resolveVaults(


function persistVaultsSync( {I_ADDED, I_PRUNED})	{
	//for each changed target array (one per chain), commit it to persistent storage as a 
	//	loadable JavaScript file
	for (const O_CHN of mAO_CHAIN)	{
		const o_VLTS = mo_trgtVlts[ O_CHN.S_SRC];
		if (!o_VLTS.b_dirty)
			continue;
		delete o_VLTS.b_dirty;
		console.log( "Writing updated v2 vault descriptors file: " + O_CHN.S_SRC);
		mO_FS.writeFileSync( `${mS_DIR_BASE}/beefy-v2/src/config/vault/${O_CHN.S_TRGT_ALIAS ? 
																	O_CHN.S_TRGT_ALIAS : O_CHN.S_SRC}.tsx`, 
																	`export const pools = ${JSON.stringify( Object.values( 
																	o_VLTS), null, 2).replace( /"([^"]+)":/g, "$1:")};`);
	} //for (const O_CHN `

	console.log( `\nFinished vault sync.\n  ${I_ADDED} v1 vaults added to v2\n  ${
									I_PRUNED} v2 vaults pruned\nOperation detail in V1objectsMigrated.log`);

} //persistVaultsSync(


function persistBoostsSync( {I_ADDED, I_PRUNED}, 
														o_BOOSTS)	{
	//for each target array (one per chain) in which change was identifed...
	console.log();
	for (const O_CHN of mAO_CHAIN)	{
		const o_BSTS = o_BOOSTS[ O_CHN.S_SRC];
		if (!o_BSTS.b_dirty)
			continue;
		delete o_BSTS.b_dirty;

		const aS = [];

		//Commit the array to persistent storage as a loadable JavaScript file. First, for 
		//	each known common-partner descriptor...
		console.log( "Writing updated v2 boost descriptors file: " + O_CHN.S_SRC);
		const AO_PTNRS = o_BSTS[ Symbol.for( mS_PRPNM_PTNR_CTX)][ mS_PRPNM_CMN_PTNRS];
		AO_PTNRS.forEach( O_PTNR => {
			//if the descriptor is no longer referenced anywhere, loop for the next 
			//	common-partner descriptor
			if (!O_PTNR[ mS_PRPNM_CHKD])	{
				console.log( `  Removing now-unused common-partner const '${O_PTNR[ 
																																					mS_PRPNM_NM]}'`);
				return;
			}else if (TrgtCommonPartner.S_DRTY === O_PTNR[ mS_PRPNM_CHKD])
				console.log( `  Adding or updating common-partner const '${O_PTNR[ mS_PRPNM_NM]}'`);

			//render the descriptor as the sourcecode of a local JavaScript object and make a 
			//	note of it
			aS.push( `const ${O_PTNR[ mS_PRPNM_NM]} = ` + JSON.stringify( O_PTNR[ mS_PRPNM_PTNR], 
																																					null, 2) + ";");
		}); //AO_PTNRS.forEach( O_PTNR =>
	
		//write out the chain's array of boost descriptors as a JavaScript sourcecode file, 
		//	preceding the array with any noted common-partner descriptors and preserving any 
		//	reference a boost descriptor has to one of the common-partner descriptors
		let s = JSON.stringify( Object.values( o_BSTS), null, 2);
		const S_BSTS = "export const pools = " + (aS.length ? TrgtCommonPartner.s_deJSONtag( 
																																						s) : s) + ";";

		mO_FS.writeFileSync( `${mS_DIR_BASE}/beefy-v2/src/config/boost/${O_CHN.S_TRGT_ALIAS ? 
												O_CHN.S_TRGT_ALIAS : O_CHN.S_SRC}.tsx`, ((aS.length ? aS.join( 
												"\n\n") + "\n\n\n" : '') + S_BSTS).replace( /"([^"]+)":/g, "$1:"));
	} //for (const O_CHN `

	console.log( `\nFinished boost sync.\n  ${I_ADDED} v1 boosts added to v2\n  ${
									I_PRUNED} v2 boosts pruned\nOperation detail in V1objectsMigrated.log`);
} //persistBoostsSync(


async function P_loadSrcBoosts( S_CHN)	{
	//parse and reformat the source's boost-descriptor database file to make it simpler to 
	//	load and its common "partner" elements available to be copied over into a source 
	//	file  which fits the target's requirements
  let s_src = mO_FS.readFileSync( `${mS_DIR_BASE}/beefy-app/src/features/configure/stake/${
																											S_CHN}_stake.js`).toString().replace( 
																											/^.* govPoolABI[ ,].*$/gm, '');
	let aS = [];
	s_src = s_src.replace( /^const ([^\s]+) =/gm, (S_MTCH, S_VAR) => (aS.push( S_VAR), 
																																			'export ' + S_MTCH));

	//load the result as a normal array of boost descriptors with added context that will be 
	//	needed when formulating a persistent version of the data for the target
  const O_MOD = await import( 'data:text/javascript;base64,' + Buffer.from( 
																															s_src).toString( 'base64')), 
				aO_src = O_MOD[ S_CHN + 'StakePools'];
	if (aS.length)	{
		let aO = [];
		aS.forEach( S => aO.push( { [mS_PRPNM_PTNR]: O_MOD[ S], [mS_PRPNM_NM]: S}));
		aO_src[ Symbol.for( mS_PRPNM_PTNR_CTX)] = {[mS_PRPNM_MOD]: O_MOD, [mS_PRPNM_CMN_PTNRS]: 
																																											aO};
	}
	return aO_src;
} //P_loadSrcBoosts(


class TrgtCommonPartner {
	constructor( O_SRC, 
								S_CHKD)	{
		Object.assign( this, O_SRC);
		if (S_CHKD)
			this[ mS_PRPNM_CHKD] = S_CHKD;
	}

	static S_DRTY = 'D'; 	//const not allowed in class, so will Object.freeze() the class 
	static S_VETD = 'V';	//	instead

	//Remove any special tags surrounding common-partner referenes found within a given 
	//	string. 
	static s_deJSONtag( S)	{
		return S.replace( /">>([^<]+)<<"/gm, "$1");
	}

	//Tag the common-partner reference within standard object-stringification processing.
	toJSON()	{ return `>>${this[ mS_PRPNM_NM]}<<`; }
} //class TrgtCommonPartner
Object.freeze( TrgtCommonPartner);


async function P_loadTrgtBoosts( O_CHN)	{
	//parse and reformat the target's boost-descriptor database file to allow its common 
	//	"partner" elements to be updated
	let s_src;
	try	{
  	s_src = mO_FS.readFileSync( `${mS_DIR_BASE}/beefy-v2/src/config/boost/${
																									O_CHN.S_TRGT_ALIAS ? O_CHN.S_TRGT_ALIAS : 
																									O_CHN.S_SRC}.tsx`).toString();
	} catch (E)	{
		if ('ENOENT' === E.code)
			return {[Symbol.for( mS_PRPNM_PTNR_CTX)]: {[mS_PRPNM_CMN_PTNRS]: []}};
		throw E;
	}
	const aS_VAR = [];
	s_src = s_src.replace( /^const ([^\s]+) =/gm, (S_MTCH, S_VAR) => (aS_VAR.push( S_VAR), 
																																			'export ' + S_MTCH));

	//load the result as a table of boost descriptors with added context that will be needed  
	//	when formulating a persistent version of the data for the target
	let o_MOD;
  const O_trgt = await import( 'data:text/javascript;base64,' + Buffer.from( 
																													s_src).toString( 'base64')).then( 
									O_MOD => (o_MOD = O_MOD).pools.reduce( (o, O) => {
												if (o[ O[ mS_PRPNM_ID]])
													throw `Duplicate ${O_CHN.S_SRC} v2 boost-ID (${O[ mS_PRPNM_ID]}`;
												o[ O[ mS_PRPNM_ID]] = O; return o;}, {}),
									() => ({}));
	const aO = [];
	if (aS_VAR.length)
		aS_VAR.forEach( S => aO.push( new TrgtCommonPartner( {[mS_PRPNM_PTNR]: o_MOD[ S], 
																																			[mS_PRPNM_NM]: S})));
	O_trgt[ Symbol.for( mS_PRPNM_PTNR_CTX)] = {[mS_PRPNM_MOD]: o_MOD, [mS_PRPNM_CMN_PTNRS]: 
																																											aO};
	return O_trgt;
} //P_loadTrgtBoosts(


async function P_loadChainBoosts( O_CHN, oAO_SRC_BSTS, o_trgtBsts)	{
	//note the specified chain's source and target boost data such that the target data is 
	//	efficiently searchable
	[oAO_SRC_BSTS[ O_CHN.S_SRC], o_trgtBsts[ O_CHN.S_SRC]] = await Promise.all( [
		P_loadSrcBoosts( O_CHN.S_SRC),
		P_loadTrgtBoosts( O_CHN)
	]);
	console.log( "loaded boosts: " + O_CHN.S_SRC);
} //P_loadChainBoosts(


function P_loadAllBoostData( oAO_SRC_BSTS, 
																		o_trgtBsts)	{
	const aP = [];
	for (const O_CHN of mAO_CHAIN)
		aP.push( P_loadChainBoosts( O_CHN, oAO_SRC_BSTS, o_trgtBsts));

	return Promise.all( aP);
} //P_loadAllBoostData(


function copyOverSrcImage( S)	{
	const I = S.lastIndexOf( '/');
	const S_PTH = I > 0 ? `${mS_DIR_BASE}/beefy-v2/src/images/${S.slice( 0, I)}` : null;
	if (S_PTH && !mO_FS.existsSync( S_PTH))
		mO_FS.mkdirSync( S_PTH, {recursive: true});
	mO_FS.copyFileSync( `${mS_DIR_BASE}/beefy-app/src/images/${S}`, `${mS_DIR_BASE
																															}/beefy-v2/src/images/${S}`);
} //copyOverSrcImage(


//NOTE: Function currently has side-effect of copying logo files over from v1 to v2. 
//	Consider logging these as actions to be taken into the output object so that the side 
//	effect can be removed, if perhaps only for this function.
async function Po_resolveBoosts( OAO_SRC_VLTS, 
																	oAO_SRC_BSTS, 
																	o_trgtBsts)	{
	//efficiently load both source and target data tables, and the target's such that it's 
	//	efficiently searchable
	await P_loadAllBoostData( oAO_SRC_BSTS, o_trgtBsts);
	console.log( "All boost arrays loaded successully for processing.");

	const O_hits = {};
	let o_trgtChn, i_pruned = 0, i_added = 0, b_dirty, o_DirSingleLogo, o_Dirent = {}, 
			o_singleLogo = {};

	//for each chain...
	const O_PROP_IGNR = {token: "", tokenDecimals: "", tokenAddress: "", tokenOracle: "", 
												tokenOracleId: "", periodFinish: ""};
	for (const O_CHN of mAO_CHAIN)	{
		const S_TYP_RMVD = "REMOVED", S_TYP_ADD = "Added", S_TYP_UPDT = "synced", 
					S_PRPNM_GRPHC = "graphic-copied", 
					S_TRGT_CHN = O_CHN.S_TRGT_ALIAS ? O_CHN.S_TRGT_ALIAS : O_CHN.S_SRC;

		console.log( `Sync v1 boosts to v2: ${O_CHN.S_SRC}`);
		o_trgtChn = o_trgtBsts[ O_CHN.S_SRC];

		const O_CMN_PTNR_SRC = oAO_SRC_BSTS[ O_CHN.S_SRC][ Symbol.for( mS_PRPNM_PTNR_CTX)], 
					O_cmnPtnrTrgt = o_trgtChn[ Symbol.for( mS_PRPNM_PTNR_CTX)];

		//prepare a table of the chain's _vault_ data such that it's efficiently searchable for 
		//	our purpose
		const O_SRC_VLTS = OAO_SRC_VLTS[ O_CHN.S_SRC].reduce( (o_vlts, O_VLT) => {
							const S = O_VLT[ mS_PRPNM_CTRCT], S_LWR = S.toLowerCase();
			        if (o_vlts[ S_LWR])
								console.error( `  Duplicate source-vault contract uncovered:\n    id: ${
																							O_VLT[ mS_PRPNM_ID]}\n    contract: ${S}`);
							else
								o_vlts[ S_LWR] = O_VLT;
			        return o_vlts;}, {});
 
		//for each source boost on the chain...
		const S_NTV = (await import( 'blockchain-addressbook')).addressBook[ 
																							O_CHN.S_ABOOK_ALIAS ? O_CHN.S_ABOOK_ALIAS : 
																							O_CHN.S_SRC].tokens.WNATIVE.symbol.slice( 1);
		let s, o;
		for (const O_SRC of oAO_SRC_BSTS[ O_CHN.S_SRC])	{
			//if this is the Beefy earnings pool or the unusual Fantom beFTM or Avalanche beJoe or beQI
			//	pool, loop for the next boost to analyze
			const S_ID = O_SRC[ mS_PRPNM_ID];
			if (S_ID.startsWith( 'bifi-') && (S_ID.endsWith( '-' + (!O_CHN.S_GVPOOL_SFX_ALIAS ? 
															S_NTV.toLowerCase() : O_CHN.S_GVPOOL_SFX_ALIAS)) ||  
															S_ID.endsWith( '-' + (!O_CHN.S_GVPOOL_SFX_ALIAS ? 
															S_NTV.toLowerCase() : O_CHN.S_GVPOOL_SFX_ALIAS) + '-eol')) && 
															'BIFI' === O_SRC.token && (S_NTV === O_SRC.earnedToken ||  
															'W' + S_NTV === O_SRC.earnedToken) || 'moo_beFTM' === S_ID || 
															'moo_beJOE' === S_ID || 'moo_beQI' === S_ID || 'moo_beCAKE' === S_ID)
				continue;

			let o_trgt;
			let b_drty = false;

			//determine the vault that the boost works atop of
			const S_VLT_ID = O_SRC_VLTS[ O_SRC[ mS_PRPNM_TKN].toLowerCase()][ mS_PRPNM_ID];

			//if the boost is known in the target enironment already...
			s = null; o = null;
			if (o_trgt = (o_trgtChn[ S_ID]))	{
				//note that we've encountered this boost on the target side
				const S_PRPNM_HIT = S_TRGT_CHN + " boost: " + S_ID, 
							O_hit = {[mS_PRPNM_ID]: S_PRPNM_HIT};

				//if the associated-vault property in the target source descriptor needs changing, 
				//	do so and note that change in the descriptor has been identified
				if (S_VLT_ID !== o_trgt[ mS_PRPNM_VLT_ID])	{
					o_trgt[ mS_PRPNM_VLT_ID] = S_VLT_ID;
					b_drty = true;
				}
				
				//for each top-level property in the boost's source descriptor...
				const O_PROP_IGNR_ = {[mS_PRPNM_ID]: "", ...O_PROP_IGNR};
				for (const S_PROP in O_SRC)	{
					//If the counterpart target property doesn't need to be considered (because we 
					//	already know its value or the property is obsolete), loop for the next 
					//	property. If comparison remains necessary because no relevant change in the 
					//	boost's descriptor has been identified yet, and the target's value does match 
					//	the source's, loop.
					if (S_PROP in O_PROP_IGNR_ || !b_drty && o_trgt[ S_PROP] === O_SRC[ S_PROP])
						continue;

					//if this property is the boost's array of partners...
					if (mS_PRPNM_PTNRS === S_PROP)	{
						//for each source partner...
						O_SRC[ S_PROP].forEach( (O_PTNR, I) => {
							//if this is one of the common partners noted in the chain's source table...
							const O_CTX = O_CMN_PTNR_SRC?.[ mS_PRPNM_CMN_PTNRS].find( O => O_PTNR == O[ 
																																						mS_PRPNM_PTNR]);
							if (O_CTX)	{
								//if no counterpart common-partner descriptor is present in the target 
								//	environment...
								const O_ctxTrgt = O_cmnPtnrTrgt[ mS_PRPNM_CMN_PTNRS].find( O => O_CTX[ 
																												mS_PRPNM_NM] === O[ mS_PRPNM_NM]);
								if (!O_ctxTrgt)	{
									//for each graphic file associated with the partner...
									for (const S in mO_PRPNM_PTNR_GRPHC)	{
										const S_FILE = O_CTX[ mS_PRPNM_PTNR][ S];

										//if the file's path matches what the target's current descriptor 
										//	references, loop for the next graphic
										if (S_FILE === o_trgt[ S_PROP][ I]?.[ S])
											continue;

										//copy over the file
										try	{
											copyOverSrcImage( S_FILE);
											if (!Array.isArray( O_hit[ S_PRPNM_GRPHC]))
												O_hit[ S_PRPNM_GRPHC] = !O_hit[ S_PRPNM_GRPHC] ? S_FILE : [O_hit[ 
																																	S_PRPNM_GRPHC], S_FILE];
											else
												O_hit[ S_PRPNM_GRPHC].push( S_FILE);
											console.log( `  Migrated updated graphic of boost ${S_ID}`);
										} catch (O)	{
											console.error( 
														`  Failed to copy over obstensibly updated graphic af boost ${
														S_ID}:\n   beefy-app/src/images/${S_FILE} (Error: ${O}`);
										} //try
									} //for (const S in mO_PRPNM_PTNR_GRPHC)

									//add the common-partner descriptor over into the target environment and 
									//	note that it needs to be persisted
									const O = new TrgtCommonPartner( O_CTX, TrgtCommonPartner.S_DRTY);
									O_cmnPtnrTrgt[ mS_PRPNM_CMN_PTNRS].push( O[ mS_PRPNM_PTNR]);
	
									//change the target's partner reference to the newly formed  
									//	common-partner descriptor
									o_trgt[ S_PROP][ I] = O;
								//else the target side has a matching common-partner descriptor, so...
								}else	{
									//mark this partner constituent of the target boost descriptor as tied to 
									//	the target-side common-partner descriptor, if only in case the 
									//	target's array of vaults needs to be persisted
									o_trgt[ S_PROP][ I] = O_ctxTrgt;

									//if the counterpart common-partner descriptor on the target's side has 
									//	not yet been vetted for change, do it now
									if (!O_ctxTrgt[ mS_PRPNM_CHKD])
										vetCommonPartner( O_PTNR, O_ctxTrgt, S_ID, O_hit);
								} //if (!O_ctxTrgt)

								//if no change to the boost descriptor has been located yet but some was in 
								//	the common-partner descriptor, flow that note of change through onto 
								//	the boost descriptor
								if (TrgtCommonPartner.S_DRTY === O_ctxTrgt[ mS_PRPNM_CHKD])
									b_drty = true;
							//else we're dealing with a directly specified partner...
							}else	{
								//for each graphic file associated with the partner...
								for (const S in mO_PRPNM_PTNR_GRPHC)	{
									const S_FILE = O_PTNR[ S];

									//if the file's path matches what the target's current descriptor 
									//	references, loop for the next graphic
									if (S_FILE === o_trgt[ S_PROP][ I]?.[ S])
										continue;

									//copy over the file and note that change in the boost descriptor has 
									//	been identified
									try	{
										copyOverSrcImage( S_FILE);
										if (!Array.isArray( O_hit[ S_PRPNM_GRPHC]))
											O_hit[ S_PRPNM_GRPHC] = !O_hit[ S_PRPNM_GRPHC] ? S_FILE : [O_hit[ 
																																	S_PRPNM_GRPHC], S_FILE];
										else
											O_hit[ S_PRPNM_GRPHC].push( S_FILE);
										console.log( `  Migrated updated graphic of boost ${S_ID}`);
									} catch (O)	{
										console.error( 
														`  Failed to copy over obstensibly updated graphic of boost ${
														S_ID}:\n   beefy-app/src/images/${S_FILE } (Error: ${O}`);
									} //try
									b_drty = true;
								} //for (const S in mO_PRPNM_PTNR_GRPHC)

								//if change has already been located in this boost descriptor or if the 
								//	target's partner is bound to one of its (old?) common-partner 
								//	descriptors...
								const B_TRGT_CMN_PTNR = O_cmnPtnrTrgt[ mS_PRPNM_CMN_PTNRS].some( O => O[ 
																							mS_PRPNM_PTNR] === o_trgt[ S_PROP][ I]);
								if (b_drty || B_TRGT_CMN_PTNR)	{
									//Overwrite the target's partner descriptor with the source's version 
									//	(whose structure is known). Unless target's partner was specified by 
									//	a common-partner descriptor, preserve any known, special target-only 
									//	properties.
									if (!B_TRGT_CMN_PTNR)	{
										if (o = o_trgt[ S_PROP][ I][ mS_PRPNM_SOCL])
											Object.assign( o, O_PTNR[ mS_PRPNM_SOCL]);
										Object.assign( o_trgt[ S_PROP][ I], O_PTNR);
										if (o)
											o_trgt[ S_PROP][ I][ mS_PRPNM_SOCL] = o;
									}else
										o_trgt[ S_PROP][ I] = O_PTNR;

									//note that change to the boost descriptor has been identified and loop 
									//	for the next partner
									b_drty = true;
									return;
								} //if (b_drty || O_CTX_TRGT)

								//for each source, partner property not already processed...
								for (const S in O_PTNR)	{
									if (mO_PRPNM_PTNR_GRPHC.hasOwnProperty( S))
										continue;

									//If change has been located in the current boost descriptor, for 
									//	efficiency, just overwrite the property with the source's value, 
									//	while preserving unknown target sub-properties if the property is 
									//	the social-media descriptor. Then loop for the next property.
									if (b_drty)	{
										if (mS_PRPNM_SOCL === S)
											Object.assign( o_trgt[ S_PROP][ I][ S], O_PTNR[ S]);
										else
											o_trgt[ S_PROP][ I][ S] = O_PTNR[ S];
										continue;
									} //if (b_drty)

									//if the property matches, loop for the next property
									if (o_trgt[ S_PROP][ I][ S] === O_PTNR[ S])
										continue;

									//if this is not the social-media composite property...
									if (mS_PRPNM_SOCL !== S)	{
										//overwrite the property with the source's value and note that change 
										//	has been located in the current boost descriptor
										o_trgt[ S_PROP][ I][ s] = O_PTNR[ S];
										b_drty = true;
									//else dig into the composite property...
									}else
										//for each social-media sub-property...
										for (const S_ in O_PTNR[ S])	{
											//if no change has yet been located in the composite property and  
											//	this sub-property matches, loop for the next sub-property
											if (!b_drty && o_trgt[ S_PROP][ I][ S][ S_] === O_PTNR[ S][ S_])
												continue;

											//overwrite the sub-property with the source's value and note, 
											//	perhaps redundantly, that change has been located in the current 
											//	boost descriptor
											o_trgt[ S_PROP][ I][ S][ S_] = O_PTNR[ S][ S_];
											b_drty = true;
										} //for (const S_ in O_PTNR[ S])
								} //for (const S in O_PTNR)
							} //if (O_CTX)
						}); //O_SRC[ S_PROP].forEach( O_PTNR,
					//else if this is the logo-file property...
					}else if (mS_PRPNM_LOGO === S_PROP)	{
						//if the path has changed, copy over the file, note that this was done, and 
						//	note, perhaps redundantly, that change in the boost descriptor has been 
						//	identified
						if (O_SRC[ S_PROP] !== o_trgt[ S_PROP])	{
							try	{
								copyOverSrcImage( O_SRC[ S_PROP]);
								O_hit[ S_PRPNM_LGO] = S_PROP;
								console.log( `  Migrated updated logo of boost ${S_ID}`);
							} catch (O)	{
								console.error( `  Failed to copy over obstensibly updated logo of boost ${
																												S_ID}:\n   beefy-app/src/images/${
																												O_SRC[ S_PROP]} (Error: ${O}`);
							}
							b_drty = true;
							o_trgt[ S_PROP] = O_SRC[ S_PROP];
						} //if (O_SRC[ S_PROP] !== o_trgt[ S_PROP])
					//else if this is the optional token-list property...
					}else if (mS_PRPNM_ASSTS === S_PROP)	{
						//if no change has been located yet in the boost descriptor and the list's 
						//	contents match exactly the target counterpart's, loop for the boost's next 
						//	property
						if (!b_drty && o_trgt[ S_PROP] && O_SRC[ S_PROP].length == o_trgt[ 
																									S_PROP].length && o_trgt[ S_PROP].every( 
																									(S, I) => O_SRC[ S_PROP][ I] === S))
							continue;

						//Update the target's counterpart array, and note, perhaps redundantly, that an 
						//	update to the boost occurred. (Underlying logo files are assumed copied 
						//	already as needed during the vault-synchronization piece.)
						b_drty = true;
						o_trgt[ S_PROP] = [...O_SRC[ S_PROP]];
					//Else overwrite the target's top-level counterpart property, since it is either 
					//	outdated or inefficient to comparison test. If the former, note that change 
					//	has now been identified.
					}else	{
						o_trgt[ S_PROP] = O_SRC[ S_PROP];
						if (!b_drty)
							b_drty = true;
					} //if (mS_PRPNM_PTNRS === S_PROP)
				} //for (const S_PROP in O_SRC)

				//register particular notes on this boost, and if an update occurred, ensure it's 
				//	noted also that a change to the target array of boost descriptors has occurred 
				if (b_drty)
					O_hit[ mS_PRPNM_TYP] = S_TYP_UPDT;
				O_hits[ S_PRPNM_HIT] = O_hit;
				if (b_drty)
					o_trgtChn.b_dirty = true;

				//loop for the next source boost
				continue;
			} //if (o_trgt = (o_trgtChn[ S_ID]))|

			//New to the target environment, reflect this boost now into the target array such 
			//	that it adheres to the format used on that side. First, take care of top-level 
			//	simple properties and any present asset array.
			o = {[mS_PRPNM_ID]: S_ID, [mS_PRPNM_ID_VLT]: S_VLT_ID, ...O_SRC};
			if (O_SRC[ mS_PRPNM_ASSTS])
				o[ mS_PRPNM_ASSTS] = [...O_SRC[ mS_PRPNM_ASSTS]];
			for (const S in O_PROP_IGNR) if (S in o) delete o[ S];

			//if a boost logo is specified, copy it over
			const S_LOGO = O_SRC[ mS_PRPNM_LOGO]; 
			if (S_LOGO)
				try	{
					copyOverSrcImage( S_LOGO);
				} catch (O)	{
					console.error( `  Failed to copy over specified logo of new boost ${
																	S_ID}:\n   beefy-app/src/images/${S_LOGO} (Error: ${O}`);
				}

			//for each source boost partner...
			O_SRC[ mS_PRPNM_PTNRS].forEach( (O_PTNR, I) => {
				//if this is one of the common partners noted in the chain's source table...
				const O_CTX = O_CMN_PTNR_SRC?.[ mS_PRPNM_CMN_PTNRS].find( O => O_PTNR == O[ 
																																					mS_PRPNM_PTNR]);
				if (O_CTX)	{
					//if the target environment possesses a common-partner descriptor of the same 
					//	name...
					const O_ctxTrgt = O_cmnPtnrTrgt[ mS_PRPNM_CMN_PTNRS].find( O => O_CTX[ 
																												mS_PRPNM_NM] === O[ mS_PRPNM_NM]);
					if (O_ctxTrgt)	{
						//bind to the target boost's partner entry the counterpart descriptor which has 
						//	been enhanced to facilitate persistence of a refrence to it
						o[ mS_PRPNM_PTNRS][ I] = O_ctxTrgt;

						//if the descriptor hasn't been vetted yet, ensure it matches up with the 
						//	source's version
						if (!O_ctxTrgt[ mS_PRPNM_CHKD])
							vetCommonPartner( O_PTNR, O_ctxTrgt, S_ID, null);
					//else introduce the common-partner descriptor into the target environment...
					}else	{
						//for each graphic file associated with the partner...
						for (const S in mO_PRPNM_PTNR_GRPHC)	{
							//copy the file into the target environment
							const S_FILE = O_PTNR[ S];
							try	{
								copyOverSrcImage( O_PTNR[ S]);
							} catch (O)	{
								console.error( `  Failed to copy over graphic noted in boost ${S_ID
																	}:\n   beefy-app/src/images/${O_PTNR[ S]} (Error: ${O}`);
							}
						} //for (const S in mO_PRPNM_PTNR_GRPHC)
	
						//bind to the target boost's partner entry a counterpart common-partner 
						//	descriptor that's been enhanced to facilitate persistence of a reference 
						//	to it, and note that the common partner descriptor itself needs to be 
						//	persisted
						const O = new TrgtCommonPartner( O_CTX, TrgtCommonPartner.S_DRTY);
						O_cmnPtnrTrgt[ mS_PRPNM_CMN_PTNRS].push( O);
						o[ mS_PRPNM_PTNRS][ I] = O;
					} //if (O_ctxTrgt)
				//else the source's explicit partner needs to be reflected into the target 
				//	environment...
				}else
					//for each graphic file associated with the partner...
					for (const S in mO_PRPNM_PTNR_GRPHC)	{
						//copy the file into the target environment
						const S_FILE = O_PTNR[ S];
						try	{
							copyOverSrcImage( S_FILE);
						} catch (O)	{
							console.error( `  Failed to copy over graphic noted in boost ${S_ID
																			}:\n   beefy-app/src/images/${S_FILE} (Error: ${O}`);
						}
					} //for (const S in mO_PRPNM_PTNR_GRPHC)

					//UNNECESSARY, RIGHT? bind the source partner descriptor into the new target 
					//	descriptor being staged
			}); //O_SRC[ mS_PRPNM_PTNRS].forEach(

			//register the newly reflected boost descriptor in the target-boost list, and ensure 
			//	it's noted that a change to the overall target boost array has occurred, and add  
			//	the boost's ID to a running list of target boosts encountered, including a 
			//	special note that this one was newly added
			o_trgtChn[ o[ mS_PRPNM_ID]] = o;
			i_added++;
			O_hits[ s = S_TRGT_CHN + " boost: " + o[ mS_PRPNM_ID]] = {[mS_PRPNM_ID]: s, 
																																[mS_PRPNM_TYP]: S_TYP_ADD};
			o_trgtChn.b_dirty = true;
		} //for (const O_SRC of oAO_SRC_BSTS[ O_CHN.S_SRC])

		//All source boosts on this chain having been processed, cycle through the list of 
		//	boosts on the target platform (v2) and delete those that are unknown on the 
		//	source platform (v1), the last word on what exists on Beefy. Also note any such 
		//	deletions.
		const I = i_pruned;
		Object.values( o_trgtChn).forEach( O_trgt => {
			if (!(O_trgt && Object === O_trgt.constructor))
				return;
			const S = S_TRGT_CHN + " boost: " + O_trgt[ mS_PRPNM_ID];
			if (O_hits[ S])
				return;
			delete o_trgtChn[ O_trgt[ mS_PRPNM_ID]];
			O_hits[ S] = {[mS_PRPNM_ID]: S, [mS_PRPNM_TYP]: S_TYP_RMVD};
			i_pruned++;
		}); //Object.values( o_trgtChn).forEach(
		if (i_pruned > I)
			o_trgtChn.b_dirty = true;

		//if no change has been noted prior to processing this chain and a change to this  
		//	chain's target array of boosts was encountered, note now _overall_ that change has 
		//	been located
		if (!b_dirty)
			b_dirty = o_trgtChn.b_dirty;
	} //for (const O_CHN of mAO_CHAIN)

	return b_dirty ? {O_hits, I_ADDED: i_added, I_PRUNED: i_pruned} : null;
} //Po_resolveBoosts(

/*
@param O_SRC: source common-partner descriptor
@param O_trgt: context of target-side common partner
@param S_ID: ID of boost descriptor involved
@param O_hit: Optional. */
function vetCommonPartner( O_SRC, 
														O_trgt, 
														S_ID, 
														O_hit)	{
	//for each graphic file associated with the source partner...
	for (const S in mO_PRPNM_PTNR_GRPHC)	{
		const S_FILE = O_SRC[ S];

		//if the file's path matches what the target references, loop for the next graphic
		if (S_FILE === O_trgt[ mS_PRPNM_PTNR][ S])
			continue;

		//copy over the file, and note that change in the common-partner descriptor has been 
		//	located
		try	{
			copyOverSrcImage( S_FILE);
			if (O_hit)
				if (!Array.isArray( O_hit[ S_PRPNM_GRPHC]))
					O_hit[ S_PRPNM_GRPHC] = !O_hit[ S_PRPNM_GRPHC] ? S_FILE : [O_hit[ S_PRPNM_GRPHC], 
																																									S_FILE];
				else
					O_hit[ S_PRPNM_GRPHC].push( S_FILE);
			console.log( `  Migrated updated graphic of boost ${S_ID}`);
		} catch (O)	{
			console.error( `  Failed to copy over obstensibly updated graphic of boost ${
																S_ID}:\n   beefy-app/src/images/${S_FILE} (Error: ${O}`);
		} //try
		O_trgt[ mS_PRPNM_CHKD] = TrgtCommonPartner.S_DRTY;
	} //for (const S in mO_PRPNM_PTNR_GRPHC)

	//if no partner-graphic file was updated...
	if (!O_trgt[ mS_PRPNM_CHKD])	
		//for each of the other source partner properties...
		for (const S in O_SRC)	{
			if (mO_PRPNM_PTNR_GRPHC.hasOwnProperty( S))
				continue;

			//if the proprty doesn't exist on the target's common-partner descriptor, note that 
			//	change to the common-partner descriptor has been located and break out of the 
			//	partner-properties loop
			const X = O_trgt[ mS_PRPNM_PTNR][ S];
			if (undefined === X)	{
				O_trgt[ mS_PRPNM_CHKD] = TrgtCommonPartner.S_DRTY;
				break;
			}

			//if this is the social-media composite property...
			if (mS_PRPNM_SOCL == S)	{
				//for each property in the source social-media descriptor, if the sub-property 
				//	doesn't match what's on the target side, note that change in the common 
				//	partner has been identified and break out of this inner loop
				for (const S_ in O_SRC[ S])
					if (X[ S_] !== O_SRC[ S][ S_])	{
						O_trgt[ mS_PRPNM_CHKD] = TrgtCommonPartner.S_DRTY;
						break;
					}

				//if change in this composite property was just located, break out of the 
				//	partner-properties loop
				if (O_trgt[ mS_PRPNM_CHKD])
					break;
			//else if this partner-property differs from the target's, note that change has been 
			//	located in the common-partner descriptor and break out of the partner-properties 
			//	loop
			}else if (X !== O_SRC[ S])	{
				O_trgt[ mS_PRPNM_CHKD] = TrgtCommonPartner.S_DRTY;
				break;
			} //if (mS_PRPNM_SOCL == S)
		} //for (const S in O_PTNR)

	//vetting complete, if change in the common-partner descriptor has been identified...
	if (O_trgt[ mS_PRPNM_CHKD])	{
		//overwrite the target version with the source's, but in a manner that preserves any 
		//	unknown properties the target might have
//	but maintian a note of the overwritten descriptor in case a 
//	downstream target boost descriptor requires the same fixup
		const O_socl = O_trgt[ mS_PRPNM_PTNR][ mS_PRPNM_SOCL];
		if (O_socl)
			Object.assign( O_socl, O_SRC[ mS_PRPNM_SOCL]);
		Object.assign( O_trgt[ mS_PRPNM_PTNR], O_SRC);
		if (O_socl)
			O_trgt[ mS_PRPNM_PTNR][ mS_PRPNM_SOCL] = O_socl;
	//else mark the target's common-partner descriptor as now vetted
	}else
		O_trgt[ mS_PRPNM_CHKD] = TrgtCommonPartner.S_VETD;
} //vetCommonPartner(


async function P_main()	{
	let o_vaultResolutn, o_boostResolutn;
	const oAO_SRC_BSTS = {}, o_trgtBsts = {}; 

	try	{
		//resolve the changes to be made to v2 vaults
		o_vaultResolutn = await Po_resolveVaults();

		//resolve the changes to be made to v2 "boosts"
		o_boostResolutn = await Po_resolveBoosts( moAO_SRC_VLTS, oAO_SRC_BSTS, o_trgtBsts);

		//if any changes to v2 vaults...
		if (o_vaultResolutn)
			//persist the changes
			persistVaultsSync( o_vaultResolutn);
		//else mention no need to persist
		else
			console.log( 
		"\nNo v1 vault changes to sync over to v2, and no vaults in v2 needed to be pruned.");

		//if any changes to v2 boosts...
		if (o_boostResolutn)	{
			//persist the changes
			persistBoostsSync( o_boostResolutn, o_trgtBsts);
		//else mention no need to persist
		}else
			console.log( 
		"\nNo v1 boost changes to sync over to v2, and no boosts in v2 needed to be pruned.");

		//inform maintainer of the v1 vaults and boosts migrated to v2, and the v2 vaults and 
		//	boosts pruned out
		const o_HITS = {...o_vaultResolutn?.O_hits, ...o_boostResolutn?.O_hits};
		Object.values( o_HITS).forEach( O => {
			if (!O[ mS_PRPNM_TYP])
				delete o_HITS[ O[ mS_PRPNM_ID]];
		});
		mO_FS.writeFileSync( `${mS_DIR_BASE}/beefy-v2/V1objectsMigrated.log`, JSON.stringify( 
																												Object.values( o_HITS), null, 2));
	} catch (E)	{
		console.error( E);
	}
} //P_main(

//launch the migration
P_main();
