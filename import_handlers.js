const fs = require('fs');
const moment = require('moment');
const xml2js = require('xml2js');
//const logger = log4js.getLogger('<filename>');

class Transaction {
    constructor(date, from, to, narrative, amount) {
        this.date = date;
        this.from = from;
        this.to = to;
        this.narrative = narrative;
        this.amount = parseFloat(amount);    
    }
}

class Account {
    constructor(name) {
        this.name = name;
        this.transactionRefs = [];
    }

    calcBalance() {
        var running_total = 0;
        let account_name = this.name;
        this.transactionRefs.forEach(function(t) {
            const toThisAccount = t.to === account_name;
            running_total += (toThisAccount ? 1 : -1) * t.amount;
        });
        return running_total;
    }
}

function import_csv_data(inputPath, accounts) {
    let transactions = [];

    const lineSplit = fs.readFileSync(inputPath, 'utf8').trim().split('\n')

    for (var i=1; i<lineSplit.length; i++) {
        // Start at row 1, as row 0 contains the column headings
        // End one before the final element, since the last array item is a blank line
        const transaction = lineSplit[i].split(',');

        // Extract the fields
        const [date, from, to, narrative, amount] = transaction;
        
        // Check valid amounts (with isNaN)
        if (isNaN(parseFloat(amount))) {
            console.log('Not a valid amount');
            continue;
        }
        
        // Valid date checking
        const date_moment = moment(date, 'DD/MM/YYYY');
        if (!date_moment.isValid()) {
            console.log('Not a valid date:', date);
            continue
        }

        // Create transaction objects
        transactions.push(new Transaction(date_moment, from, to, narrative, amount));
    }

    // Use the transactions just loaded to update the accounts
    updateAccounts(accounts, transactions);
    return transactions;
}

function import_json_data(inputPath, accounts) {
    let transactions = [];

    const json_str_out = fs.readFileSync(inputPath, 'utf8');
    const json = JSON.parse(json_str_out);

    json.forEach(function (transaction) {
        const date_moment = moment(transaction['Date'], 'YYYY-MM-DD');
        if (!date_moment.isValid()) {
            console.log('Not a valid date', date_moment);
            return;
        }

        transactions.push(new Transaction(date_moment,
                                          transaction["FromAccount"],
                                          transaction["ToAccount"],
                                          transaction["Narrative"],
                                          transaction["Amount"]));
    });

    updateAccounts(accounts, transactions);
    return transactions;
}

function import_xml_data(inputPath, accounts) {
    let transactions = [];

    const xml_str_out = fs.readFileSync(inputPath, 'utf8');
    var parseString = xml2js.parseString;
    parseString(xml_str_out, function (err, result) {
        // Convert XML to JSON
        const as_json = JSON.parse(JSON.stringify(result));
        const ts = as_json["TransactionList"]["SupportTransaction"];
        ts.forEach(function(t) {
            const amount = t['Value'][0];
            
            // Check valid amounts (with isNaN)
            if (isNaN(parseFloat(amount))) {
                console.log('Not a valid amount');
                return;
            }

            const nDaysSince = parseInt(t['$']['Date']); // The attribute of a SupportTransaction;
            const date_moment = moment('1900-01-01', 'YYYY-MM-DD').add('days', nDaysSince);
            if (!date_moment.isValid()) {
                console.log('Not a valid date', date_moment);
                return;
            }
            transactions.push(new Transaction(date_moment,
                                              t['Parties'][0]['From'][0],
                                              t['Parties'][0]['To'][0],
                                              t['Description'][0],
                                              amount));
        });
    });
    
    updateAccounts(accounts, transactions);
    return transactions;
}

// Once all the transactions have been read into the transactions array
// Update the accounts array with money transfers
function updateAccounts(accounts, transactions) {
    transactions.forEach(function(element) {
        // For each transaction:
    
        [element.from, element.to].forEach(function(name) {
            // Create accounts if they don't exist already
            if (!accounts.get(name)) {
                accounts.set(name, new Account(name));
            }
    
            // add references to those transactions
            accounts.get(name).transactionRefs.push(element);
        });
    });
}

module.exports = {import_csv_data, import_json_data, import_xml_data}