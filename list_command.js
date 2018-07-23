function do_list(name, accounts) {
    // Query all accounts or just one
    if (name === "All") {
        console.log("Print all account names and balances");
        for (var [key, value] of accounts) {
            const rounded_balance = Math.round(value.calcBalance() * 100) / 100;
            console.log(value.name, rounded_balance);
        }

    } else {
        const record = accounts.get(name);
        if (record) {
            const rounded_balance = Math.round(record.calcBalance() * 100) / 100;
            console.log(name, "has balance", rounded_balance);
            
            console.log("Every associate transaction with", name);
            record.transactionRefs.forEach(function(t) {
                // Some formatting for this transaction:
                const toThisAccount = t.to === name;
                const connective = (toThisAccount ? 'from' : 'to');
                console.log(t.date.toString(), t.narrative, connective);
            });
        } else {
            console.log("No account found with name", name);
        }
    }
}
do_list.requiresAccounts = true;

module.exports = do_list