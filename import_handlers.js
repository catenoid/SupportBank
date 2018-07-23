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
        let runningTotal = 0;
        let accountName = this.name;
        this.transactionRefs.forEach(function(transaction) {
            const toThisAccount = transaction.to === accountName;
            runningTotal += (toThisAccount ? 1 : -1) * transaction.amount;
        });
        return runningTotal;
    }
}

function importCSVdata(inputPath, accounts) {
    let transactions = [];

    const lineSplit = fs.readFileSync(inputPath, 'utf8').trim().split('\n')

    for (let i=1; i<lineSplit.length; i++) {
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
        const dateMoment = moment(date, 'DD/MM/YYYY');
        if (!dateMoment.isValid()) {
            console.log('Not a valid date:', date);
            continue
        }

        // Create transaction objects
        transactions.push(new Transaction(dateMoment, from, to, narrative, amount));
    }

    // Use the transactions just loaded to update the accounts
    updateAccounts(accounts, transactions);
    return transactions;
}

function importJSONdata(inputPath, accounts) {
    let transactions = [];

    const json = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    json.forEach(function (transaction) {
        const dateMoment = moment(transaction['Date'], 'YYYY-MM-DD');
        if (!dateMoment.isValid()) {
            console.log('Not a valid date', dateMoment);
            return;
        }

        transactions.push(new Transaction(dateMoment,
                                          transaction['FromAccount'],
                                          transaction['ToAccount'],
                                          transaction['Narrative'],
                                          transaction['Amount']));
    });

    updateAccounts(accounts, transactions);
    return transactions;
}

function importXMLdata(inputPath, accounts) {
    let transactions = [];

    const xmlAsString = fs.readFileSync(inputPath, 'utf8');
    const parseString = xml2js.parseString;
    parseString(xmlAsString, function (err, result) {
        // Convert XML to JSON
        const asJSON = JSON.parse(JSON.stringify(result));
        const transactions = asJSON['TransactionList']['SupportTransaction'];
        transactions.forEach(function(t) {
            const amount = t['Value'][0];
            
            // Check valid amounts (with isNaN)
            if (isNaN(parseFloat(amount))) {
                console.log('Not a valid amount');
                return;
            }

            const nDaysSince = parseInt(t['$']['Date']); // The attribute of a SupportTransaction;
            const dateMoment = moment('1900-01-01', 'YYYY-MM-DD').add('days', nDaysSince);
            if (!dateMoment.isValid()) {
                console.log('Not a valid date', dateMoment);
                return;
            }
            transactions.push(new Transaction(dateMoment,
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
    transactions.forEach(function(transaction) {
        // For each transaction:
    
        [transaction.from, transaction.to].forEach(function(name) {
            // Create accounts if they don't exist already
            if (!accounts.get(name)) {
                accounts.set(name, new Account(name));
            }
    
            // add references to those transactions
            accounts.get(name).transactionRefs.push(transaction);
        });
    });
}

module.exports = {importCSVdata, importJSONdata, importXMLdata}