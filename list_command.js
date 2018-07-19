function do_list(name, accounts) {
    // Query all accounts or just one
    if (name === "All") {
        console.log("Print all account names and balances");
        for (var [key, value] of accounts) {
            const rounded_balance = Math.round(value.balance * 100) / 100;
            console.log(value.name, rounded_balance);
        }

    } else {
        const record = accounts.get(name);
        if (record) {
            const rounded_balance = Math.round(record.balance * 100) / 100;
            console.log(name, "has balance", rounded_balance);

            // Not a single source of truth
            // Which do you trust?
            console.log("Every associate transaction with", name);
            record.transactionRefs.forEach(function(t) {
                // Some formatting for this transaction:
                let connective = 'to ' + t.to;
                if (t.to === name) {
                    connective = 'from ' + t.from;
                }
                console.log(t.date.toString(), t.narrative, connective);
            });
        } else {
            console.log("No account found with name", name);
        }
    }
}
do_list.requiresAccounts = true; // takes the accounts global array
do_list.returnsTransactions = false; // it only does logging

module.exports = {do_list}