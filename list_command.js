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

            console.log("Every associate transaction with", name);
            var running_total = 0;
            record.transactionRefs.forEach(function(t) {
                // Some formatting for this transaction:
                let connective = 'to ' + t.to;
                if (t.to === name) {
                    connective = 'from ' + t.from;
                    running_total += t.amount;
                } else {
                    running_total -= t.amount;
                }
                console.log(t.date.toString(), t.narrative, connective);
                
            });
            console.log("Running total", running_total); // Should equal balance
        } else {
            console.log("No account found with name", name);
        }
    }
}
do_list.requiresAccounts = true; // takes the accounts global array
do_list.returnsTransactions = false; // it only does logging

module.exports = {do_list}