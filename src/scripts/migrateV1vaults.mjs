/*********
Node.js script to refresh the v2 app with the vaults state found in the v1 app.

NOTE: DO NOT RUN THIS SCRIPT if the v1 app is no longer the source of truth for the system! 
			v2 vault descriptors not seen among v1 descriptors will be REMOVED!

"New" vaults in v1 are pulled into v2, and outdated properties in current v2 vaults are 
refreshed with their v1 counterparts. Associated logo/icon files are accounted for as 
well. In other words, v1 is considered the source of truth in this operation.

Script should be run from root "beefy-v2" directory with fresh "beefy-app" sources in a 
_sibling_ directory. A working Node.js environment off the beefy-v2 directory is assumed. 
Linux command line to invoke the script:

node --loader ts-node/esm  src/scripts/migrateV0vaults.mjs

Progress will be printed to standard output and standard error.

Aspects of a full migration which this script cannot perform are two:
(a) The v2 "Vamp" strategy type (key "stratType"). This cannot be reliably 
programmatically discerned from a v1 input object. This property may however be added to 
the v1 object in anticipation of future use in v2. This script will accmmodatively copy it 
over.
(b) The v2 child array of risk factors (key "risks"). Concept unnknown in v1. This array 
may however be added to the v1 object in anticipation of future use in v2. This script 
will accommodatively copy it over.

To assist the maintainer in manually updating these v2 aspects, an output file with an 
array-listing of the IDs of the v1 vaults which have been added newly to the v2 
environment is created: V1vaultsMigrated.txt. The file is placed in directory from which 
the command is run. To help minimize pollution, the maintainer may avoid pushing this file 
into the staging repository.

Development
+ v0.9.1 AllTrades: fix bug where v1 deposits-paused property was not being reflected over 
											to v2
+ v0.9.0.5 AllTrades: small bugfix
+ v0.9.0.4 AllTrades: small bugfix
+ v0.9.0.3 AllTrades: add support for Cronos chain
+ v0.9.0.2 AllTrades: adjustment to preserve the new & special v2 bifi-gov vault objects
+ v0.9.0.1 AllTrades: switched over to *.tsx v2 targets
+ v0.9 AllTrades
  - add support for Celo chain, and prep for other chains going forward by allowing the 
	  target v2 vault-descriptor file to be generated automatically if not found
  - prune v2 vaults not found among v1 vaults
	- improve data output both to console and into output file
+ v0.8 AllTrades: handle EOL'd v1 vaults properly and so prevent vault-object duplication  
	in v2
+ v0.7 AllTrades: accomodate v2 property-anticipation in v1 vault objects
+ v0.1.0.1 AllTrades: moved script into a new src/script, incorporated Arbitrum
+ v0.1 AllTrades
**********/

import * as FS from 'fs';

const mAO_CHAIN = [{S_SRC: "bsc"}, 
										{S_SRC: "heco"}, 
										{S_SRC: "fantom"}, 
										{S_SRC: "polygon"},
										{S_SRC: "avalanche", S_TRGT_ALIAS: "avax"},
										{S_SRC: "harmony"},
										{S_SRC: "arbitrum"},
										{S_SRC: "celo"}, 
										{S_SRC: "moonriver"},
										{S_SRC: "cronos"}];
const mS_PRPNM_ID = "id", mS_PRPNM_ASSTS = "assets", mS_PRPNM_STRAT_TYP = "stratType", 
			mS_PRPNM_CHAIN = "network", mS_PRPNM_LOGO = "logo", mS_PRPNM_RISKS = "risks",
			mS_PRPNM_CTRCT = "earnContractAddress", mS_PRPNM_TYP = "type", 
			mS_PRPNM_DEPOST_PSD = "depositsPaused", mS_PRPNM_STATUS = "status", 
			mAS_STRAT_TYP = [ "", "SingleStake", "StratLP", "StratMultiLP", "Vamp"];
const moAO_SRC = {}, mo_trgt = {}; 


async function p_loadChain( O_CHN)	{
	//note the specified chain's source and target vault data such that the target data 
	//	is efficiently searchable
	[moAO_SRC[ O_CHN.S_SRC], mo_trgt[ O_CHN.S_SRC]] = await Promise.all( [
		(async () => (await import( 
							`../../../beefy-app/src/features/configure/vault/${O_CHN.S_SRC}_pools.js`))
							[O_CHN.S_SRC + 'Pools'])(), 
		(async () => (await import( 
												`../config/vault/${O_CHN.S_TRGT_ALIAS ? O_CHN.S_TRGT_ALIAS : 
												O_CHN.S_SRC}.tsx`).then( O_MOD => O_MOD.pools.reduce( (o, O) => {
							if (o[ O[ mS_PRPNM_ID]])
								throw `Duplicate ${O_CHN.S_SRC} target vault-ID (${O[ mS_PRPNM_ID]}`;
							o[ O[ mS_PRPNM_ID]] = O; return o;}, {}), 
											() => ({})) ))()
		]);

	console.log( "loading: " + O_CHN.S_SRC);
} //p_loadChain(


async function p_loadAllVaultData()	{
	const Af = [];
	for (const O_CHN of mAO_CHAIN)
		Af.push( (async () => (await p_loadChain( O_CHN)))());

	return Promise.all( Af);
} //p_loadAllVaultData(


async function p_main()	{
	//efficiently load both source and target data, and the target data such that it's 
	//	efficiently searchable
	try	{
		await p_loadAllVaultData();
	} catch (O)	{
		console.error( O);
		return;
	}
	console.log( "All vault arrays loaded successfully for processing.");

	const S_DIR_BASE = import.meta.url.slice( 'file://'.length, 1000).split( '/').slice( 
																																				0, -4).join( '/');
	const O_hits = {};
	let o_trgtChn, i_pruned = 0, i_added = 0, b_dirty, o_DirSingleLogo, o_Dirent = {}, 
			o_singleLogo = {};

	//for each chain...
	const O_PROP_IGNR = {}; 
	for (const O_CHN of mAO_CHAIN)	{
		const S_TYP_RMVD = "REMOVED", S_TYP_ADD = "Added", S_TYP_UPDT = "synced", 
					S_PRPNM_LGO = "logo-copied", S_PRPNM_EOLD = "EOLd",
					S_TRGT_CHN = O_CHN.S_TRGT_ALIAS ? O_CHN.S_TRGT_ALIAS : O_CHN.S_SRC;

		console.log( `Sync v1 vaults to v2, ${O_CHN.S_SRC} chain...`); 
		o_trgtChn = mo_trgt[ O_CHN.S_SRC];

		//for each source vault on the chain...
		let s, o;
		for (const O_SRC of moAO_SRC[ O_CHN.S_SRC])	{
			let o_trgt;

			//if the vault is present in target vault array already (including accounting for 
			//	the possibility that the source vault has been updated to end-of-life but its
			//	target counterpart [v2] not yet)...
			s = null; o = null;
			const S_ID_SRC = O_SRC[ mS_PRPNM_ID];
			if (o_trgt = (o_trgtChn[ S_ID_SRC] || ((s = S_ID_SRC.split( 
																				/[-=]eol[0-9a-z]?$/)[ 0]) && S_ID_SRC !== s && 
																				(o = o_trgtChn[ s]) && O_SRC[ mS_PRPNM_CTRCT] === 
																				o[ mS_PRPNM_CTRCT] ? o : null)))	{
				//note that we've encountered this target vault
				const S_PRPNM_HIT = S_TRGT_CHN + ": " + S_ID_SRC, 
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
							//	interrelationship differs from that shown for the target vault, update  
							//	the target's status, and ensure it's noted that an update to the vault 
							//	has occurred
							}else if (O_SRC[ S] ? 'active' === o_trgt[ mS_PRPNM_STATUS] : 'paused' === 
																																o_trgt[ mS_PRPNM_STATUS])	{
								o_trgt[ mS_PRPNM_STATUS] = O_SRC[ S] ? 'paused' : 'active';
								O_hit[ mS_PRPNM_TYP] = S_TYP_UPDT;
							} //if ('eol' === O_SRC[ mS_PRPNM_STATUS])
						//else if the source vault has an active deposits-paused status which the 
						//	target doesn't reflect, reflect it now, and ensure it's noted that an 
						//	update to the vault has occurred
						}else if ((b_eol = 'eol' === O_SRC[ S]) || O_SRC[ mS_PRPNM_DEPOST_PSD] && 
																									'paused' !== o_trgt[ mS_PRPNM_STATUS])	{
							if (b_eol)
								o_trgt[ S] = 'eol';
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
								FS.copyFileSync( `${S_DIR_BASE}/beefy-app/src/images/${O_SRC[ S]}`, 
																				`${S_DIR_BASE}/beefy-v2/src/images/${O_SRC[ S]}`);
								O_hit[ S_PRPNM_LGO] = S;
								console.log( `Migrated updated logo of vault ${O_SRC[ mS_PRPNM_ID]}`);
							} catch (O)	{
								console.error( `Failed to copy over obstensibly updated logo of vault ${
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
					const S = `${S_DIR_BASE}/beefy-app/src/images/single-assets`;
					try	{
						o_DirSingleLogo = FS.opendirSync( S);
					} catch (E)	{
						console.error( `Failed to open expected source directory ${S}`);
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
							FS.copyFileSync( `${S_DIR_BASE}/beefy-app/src/images/single-assets/${s}`, 
																`${S_DIR_BASE}/beefy-v2/src/images/single-assets/${s}`);
						}else
							console.error( `Failed to locate icon for ${O_SRC[ 
																	mS_PRPNM_CHAIN]} asset ${s_ASST} of new vault ${O_SRC[ 
																	mS_PRPNM_ID]}`);
					} //for (s_ASST of O_SRC[ mS_PRPNM_ASSTS])
				} catch (O)	{
					console.error( `Failed to copy over an expected icon for ${O_SRC[ 
																	mS_PRPNM_CHAIN]} asset ${s_ASST} of new vault ${O_SRC[ 
																	mS_PRPNM_ID]}\n  (Error: ${O}`);
				} //try
			//else copy the _specified_ logo over
			}else
				try	{
					FS.copyFileSync( `${S_DIR_BASE}/beefy-app/src/images/${S_LOGO}`, 
														`${S_DIR_BASE}/beefy-v2/src/images/${S_LOGO}`);
				} catch (O)	{
					console.error( `Failed to copy over specified logo of new vault ${O_SRC[ 
													mS_PRPNM_ID]}:\n   beefy-app/src/images/${S_LOGO} (Error: ${O}`);
				} //try

			//reflect the source vault descriptor to the target array such that it adheres to 
			//	to the format	the target requires
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
				console.error( `Asset list missing on source vault ${o[ mS_PRPNM_ID]} on ${o[ 
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
			O_hits[ s = o[ mS_PRPNM_CHAIN] + ": " + o[ mS_PRPNM_ID]] = 
																						{[mS_PRPNM_ID]: s, [mS_PRPNM_TYP]: S_TYP_ADD};
			o_trgtChn.b_dirty = true;
		} //for (const O_SRC of moAO_SRC[ O_CHN.S_SRC]

		//All source vaults on this chain having been processed, cycle through the list of 
		//	vaults on the target platform (v2) and delete those that are unknown on the 
		//	source platform (v1), the last word on what exists on Beefy. Also note any such 
		//	deletions.
		const I = i_pruned;
		Object.values( o_trgtChn).forEach( O_trgt => {
			if (!(O_trgt && Object === O_trgt.constructor) || O_trgt[ mS_PRPNM_ID].endsWith( 
																																							"bifi-gov"))
				return;
			const S = S_TRGT_CHN + ": " + O_trgt[ mS_PRPNM_ID];
			if (O_hits[ S])
				return;
			delete o_trgtChn[ O_trgt[ mS_PRPNM_ID]];
			O_hits[ S] = {[mS_PRPNM_ID]: S, [mS_PRPNM_TYP]: S_TYP_RMVD};
			i_pruned++;
		}); //Object.values( o_trgtChn).forEach(
		if (i_pruned > I)
			o_trgtChn.b_dirty = true;

		//if no change has been noted prior to processing this chain and a change to this  
		//	chain's target array of vaults on this chain was identified, note now overall 
		//	that change has occurred
		if (!b_dirty)
			b_dirty = o_trgtChn.b_dirty;
	} //for (const O_CHN of mAO_CHAIN)

	//if nothing has changed anywhere, our work is done
	if (!b_dirty)	{
		console.log( 
							"No v1 changes to sync over to v2, and nothing in v2 to prune. Finished.");
		return;
	}

	//inform maintainer of the v1 vaults migrated to v2, and the v2 vaults pruned out
	Object.values( O_hits).forEach( O => {
		if (!O[ mS_PRPNM_TYP])
			delete O_hits[ O[ mS_PRPNM_ID]];
	});
	FS.writeFileSync( `${S_DIR_BASE}/beefy-v2/V1vaultsMigrated.txt`, JSON.stringify( 
																												Object.values( O_hits), null, 2));

	//for each changed target array (one per chain), commit it to persistent storage as a 
	//	loadable JavaScript file
	for (const O_CHN of mAO_CHAIN)	{
		o_trgtChn = mo_trgt[ O_CHN.S_SRC];
		if (!o_trgtChn.b_dirty)
			continue;
		delete o_trgtChn.b_dirty;
		console.log( "Writing updated v2 vault descriptors file: " + O_CHN.S_SRC);
		FS.writeFileSync( `${S_DIR_BASE}/beefy-v2/src/config/vault/${O_CHN.S_TRGT_ALIAS ? 
											O_CHN.S_TRGT_ALIAS : O_CHN.S_SRC}.tsx`, 
											`export const pools = ${JSON.stringify( Object.values( o_trgtChn), 
											null, 2).replace( /"([^"]+)":/g, "$1:")};`);
	} //for (o_trgtChn of mo_trgt)

	console.log( `\nFinished vault sync.\n  ${i_added} v1 vaults added to v2\n  ${
								i_pruned} v2 vaults pruned\nOperation detail in V1vaultsMigrated.txt`);
} //p_main(

//launch the migration
p_main();
