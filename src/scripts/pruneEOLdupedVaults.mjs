/*********
Node.js script to remove duplicated vault objects introduced during v1 migration where 
the v1 vault was end-of-lifed in the v1 vault-object array but not in the v2 object array.

Script should be run from root "beefy-v2" directory:

node src/scripts/pruneEOLdupedVaults.mjs

Progess will be reported to standard out and errors to standard error.

Script creates an output file with a JSON-like listing of useful information about each 
vault removed: prunedEol&errorVaults.txt. The file is placed in directory from which the 
command is run. The maintainer should move or delete this file to ensure it won't be 
pushed into the main repository.

Development
+ v0.1 AllTrades
**********/
import * as FS from 'fs';

const mAO_CHAIN = [{S_FILENM: "bsc"}, 
                    {S_FILENM: "heco"}, 
                    {S_FILENM: "fantom"}, 
                    {S_FILENM: "polygon"},
                    {S_FILENM: "avax"},
                    {S_FILENM: "harmony"},
                    {S_FILENM: "arbitrum"}];
const mS_PRPNM_ID = "id", mS_PRPNM_CTRCT = "earnContractAddress";
const mo_trgt = {};


async function p_loadChain( O_CHN)  {
  //note the specified chain's source vault data, marking duplicative vault objects along 
  //  the way
  mo_trgt[ O_CHN.S_FILENM] = (await import( `../config/vault/${O_CHN.S_FILENM
                                            }.js`)).pools.reduce( (o_vlts, O_VLT) => {
        const O = o_vlts[ O_VLT[ mS_PRPNM_CTRCT]];
        if (O)  {
          if (!Array.isArray( O))
            o_vlts[ O_VLT[ mS_PRPNM_CTRCT]] = [O];
          o_vlts[ O_VLT[ mS_PRPNM_CTRCT]].push( O_VLT);
        }else
          o_vlts[ O_VLT[ mS_PRPNM_CTRCT]] = O_VLT;
        return o_vlts;}, {});

  console.log( "loading: " + O_CHN.S_FILENM);
} //p_loadChain(


async function p_loadAllVaultData() {
  const Af = [];
  for (const O_CHN of mAO_CHAIN)
    Af.push( (async () => (await p_loadChain( O_CHN)))());

  return Promise.all( Af);
} //p_loadAllVaultData(


async function p_main() {
  //efficiently load source data such that it's also efficiently searchable
  try {
    await p_loadAllVaultData();
  } catch (O) {
    console.error( O);
    return;
  }
  console.log( "All vault arrays loaded successully for processing.");

  let o_trgtChn, aO_noted = [];

  //for each chain..
  for (const O_CHN of mAO_CHAIN)  {
    console.log( `Analyzing vaults on chain '${O_CHN.S_FILENM}'...`);
    o_trgtChn = mo_trgt[ O_CHN.S_FILENM];

    //for each vault contract registered on the chain...
    for (const S_CTRCT in o_trgtChn)  {
      const O_REGX_EOL = /[-=]eol[0-9a-z]?$/, 
            S_PRPNM_CTRCT = "vault-contract", S_PRPNM_ERR_DUPES = "ERROR-duplicates", 
            S_PRPNM_REMVD = "removed-eold-dupe";

      const O_ctrct = o_trgtChn[ S_CTRCT];

      //if the vault has no duplicate, loop for the next candidate
      if (!Array.isArray( O_ctrct))
        continue;

      const I_EOL = O_ctrct.findIndex( (O) => O_REGX_EOL.test( O[ mS_PRPNM_ID]));

      //if none of the duplicates is marked as being at end-of-life...
      if (-1 == I_EOL)  {
        //We have a problem beyond our scope of operation, so complain and take pains 
        //  to preserve the duplicates for overlords to assess. Then loop for the next 
				//  vault-contract entry. No need to mark the chain for persistence because of 
				//  this because none of the vault descriptors require removal.
        const O_note = { [S_PRPNM_CTRCT]: `${O_CHN.S_FILENM}: ${S_CTRCT}`, 
													[S_PRPNM_ERR_DUPES]: []};
        console.error( `${O_CHN.S_FILENM}: Duplicate vaults with address ${S_CTRCT}`);
        O_ctrct.forEach( (O, I) => {
          const S = O[ mS_PRPNM_ID];
          console.error( `  - ${S}`);
          O_note[ S_PRPNM_ERR_DUPES].push( S);
          if (I < O_ctrct.length - 1)
            o_trgtChn[ `${S_CTRCT}-${I}`] = O;
          else
            o_trgtChn[ S_CTRCT] = O
				});
        aO_noted.push( O_note);
				continue;
      } //if (-1 == I_EOL)

      //We have a candidate case for removing an obsolete vault descriptor (object). For 
			//	each duplicate vault descriptor...
			let o_note = null;
			O_ctrct.forEach( (O_VLT, I) => {
				let s;

				//if this duplicate is our anticipated end-of-life vault, loop for the next 
				//  duplicate to validate
				if (I_EOL == I)
					return;
				
				//if this is not a weird case of a duplicated end-of-lifed vault descriptor, note 
				//  that this descriptor "has now been" removed, and loop for the next duplicate
				s = O_VLT[ mS_PRPNM_ID];
				if (!(O_REGX_EOL.test( s))) {
					if (!o_note)
						o_note = {[S_PRPNM_CTRCT]: `${O_CHN.S_FILENM}: ${S_CTRCT}`, 
											 [S_PRPNM_REMVD]: s};
					else if (!o_note[ S_PRPNM_REMVD])
						o_note[ S_PRPNM_REMVD] = s;
					else if (!o_note[ S_PRPNM_REMVD].isArray())
						o_note[ S_PRPNM_REMVD] = [o_note[ S_PRPNM_REMVD], s];
					else
						o_note[ S_PRPNM_REMVD].push( s);
					return;
				} //if (!(O_REGX_EOL.test( s)))

				//complain about this weird case of duplicate end-of-lifed vaults registered, 
				//  and _preserve_ this particular duplicate for overlords to assess
				if (!(o_note || o_note[ S_PRPNM_ERR_DUPES]))	{
					const S = O_ctrct[ I_EOL][ mS_PRPNM_ID];
					if (!o_note)
						o_note = { [S_PRPNM_CTRCT]: `${O_CHN.S_FILENM}: ${S_CTRCT}`, 
												[S_PRPNM_ERR_DUPES]: [S]};
					else
						o_note[ S_PRPNM_ERR_DUPES] = [S];
					console.error( `${O_CHN.S_FILENM}: Duplicate EOL'd vaults with address ${
																																	S_CTRCT}\n  - ${S}`);
				} //if (!(o_note ||
				console.error( `  - ${s}`);
				o_note[ S_PRPNM_ERR_DUPES].push( s);
				o_trgtChn[ `${S_CTRCT}-${I}`] = O_VLT;
			}); //O_ctrct.forEach(
			if (o_note)
				aO_noted.push( o_note);

			//edge-case handling done, cement the settled-upon end-of-lifed vault object for
			//  normal persistence
			o_trgtChn[ S_CTRCT] = O_ctrct[ I_EOL];

      //if a vault descriptor was removed, ensure it's noted that a change to this 
			//	chain's array of vault descriptors has been prepared
      if (o_note[ S_PRPNM_REMVD])
        o_trgtChn.b_dirty = true;
    } //for (const S_CTRCT in o_trgtChn)
  } //for (const O_CHN of mAO_CHAIN)

  //if nothing has changed anywhere, our work is done
  if (!aO_noted.length) {
    console.log( "No duplicates found anywhere. Finished.");
    return;
  }

  //inform maintainer of the duplicate vault objects removed and any situations needing 
  //  overlord attention
  FS.writeFileSync( "prunedEol&errorVaults.txt", JSON.stringify( aO_noted, null, 
                                                    2).replace( /"([^"]+)":/g, "$1:"));

  //for each changed vault-object array (one per chain), commit it to persistent storage  
  //  as a loadable JavaScript file
  for (const O_CHN of mAO_CHAIN)  {
    o_trgtChn = mo_trgt[ O_CHN.S_FILENM];
    if (!o_trgtChn.b_dirty)	{
			console.log( "Unchanged v2 vault descriptors file: " + O_CHN.S_FILENM);
      continue;
		}
    delete o_trgtChn.b_dirty;
    console.log( "Writing updated v2 vault descriptors file: " + O_CHN.S_FILENM);
//TODO?: don't assume the exact declaration code, parse for it
    FS.writeFileSync( `src/config/vault/${O_CHN.S_FILENM}.js`, 
                                `export const pools = ${JSON.stringify( Object.values( 
                                o_trgtChn), null, 2).replace( /"([^"]+)":/g, "$1:")};`);
  } //for (o_trgtChn of mo_trgt)

  console.log( "Processing complete. Results file written: prunedEol&errorVaults.txt");
} //p_main()

//launch the analysis
p_main();
