function doList(name, accounts) {
    // Query all accounts or just one
    if (name === 'All') {
        console.log('Print all account names and balances');
        for (let [key, value] of accounts) {
            const roundedBalance = Math.round(value.calcBalance() * 100) / 100;
            console.log(value.name, roundedBalance);
        }

    } else {
        const record = accounts.get(name);
        if (record) {
            const roundedBalance = Math.round(record.calcBalance() * 100) / 100;
            console.log(name, 'has balance', roundedBalance);
            
            console.log('Every associate transaction with', name);
            record.transactionRefs.forEach(function(t) {
                // Some formatting for this transaction:
                const toThisAccount = t.to === name;
                const connective = (toThisAccount ? 'from' : 'to');
                console.log(t.date.toString(), t.narrative, connective);
            });
        } else {
            console.log('No account found with name', name);
        }
    }
}
doList.requiresAccounts = true;

module.exports = doList