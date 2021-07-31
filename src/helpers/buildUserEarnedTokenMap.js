const buildUserEarnedTokenMap = (pools, tokens) => {
    const userEarnedTokenMap = {};
    Object.keys(tokens).forEach(tokenName => {
        const userTokenBalance = parseInt(tokens[tokenName].balance)
        if (userTokenBalance > 0) {
            let poolToUpdate = Object.values(pools).find(pool => pool.earnedToken === tokenName);
            if (poolToUpdate !== undefined) {
                userEarnedTokenMap[tokenName] = {
                    balance: userTokenBalance
                }
            }
        }
    })

    return userEarnedTokenMap;
}

export default buildUserEarnedTokenMap;