const log4js = require("log4js");

log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/debug.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
});

console.log("Press Ctrl-C to quit");

//Write a program which creates an account for each person, and then creates transactions between the accounts. 
// The person in the 'From' column is paying money, so the amount needs to be deducted from their account. 
// The person in the 'To' column is being paid, so the amount needs to be added to their account.
// Use a class for each type of object you want to create.
//Your program should support two commands, which can be typed in on the console:
//List All should output the names of each person, and the total amount they owe, or are owed.
//List [Account] should also print a list of every transaction, with the date and narrative, for that account with that name.




// Extract Data
const readlineSync = require('readline-sync');
const fs = require('fs');
const xml2js = require('xml2js');
const moment = require('moment');

// Store transactions and accounts as objects
var transactions = [];
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
        this.balance = 0;
        this.transactionRefs = [];
    }
}
var accounts = new Map();

// There is a different function handler for each data format

function import_csv_data(inputPath) {
    // Clear any pre-existing transactions
    transactions = [];

    const csv_out = fs.readFileSync(inputPath, 'utf8');
    const lineSplit = csv_out.split('\n');

    for (var i=1; i<lineSplit.length-1; i++) {
        // Start at row 1, as row 0 contains the column headings
        // End one before the final element, since the last array item is a blank line
        const transaction = lineSplit[i].split(',');

        // Extract the fields
        const date = transaction[0];
        const from = transaction[1];
        const to = transaction[2];
        const narrative = transaction[3];
        const amount = transaction[4];
        
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
    updateAccounts();
}

function import_json_data(inputPath) {
    // Clear any pre-existing transactions
    transactions = [];

    const json_str_out = fs.readFileSync(inputPath, 'utf8');
    const json = JSON.parse(json_str_out);

    json.forEach(function (t) {
        const date_moment = moment(t['Date'], 'YYYY-MM-DD');
        if (!date_moment.isValid()) {
            console.log('Not a valid date', date_moment);
            return;
        }

        transactions.push(new Transaction(date_moment,
                                          t["FromAccount"],
                                          t["ToAccount"],
                                          t["Narrative"],
                                          t["Amount"]));
    });

    updateAccounts();
}

function import_xml_data(inputPath) {
    // Clear any pre-existing transactions
    transactions = [];

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
            console.log(date_moment);

            transactions.push(new Transaction(date_moment,
                                              t['Parties'][0]['From'][0],
                                              t['Parties'][0]['To'][0],
                                              t['Description'][0],
                                              amount));
        });
    });
    
    updateAccounts();
}

// Once all the transactions have been read into the transactions array
// Update the accounts array with money transfers
function updateAccounts() {
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
    
        // credit or debit those balances
        accounts.get(element.from).balance -= element.amount;
        accounts.get(element.to).balance += element.amount;
    });
}



// Command interpreter
// Initialise an arrray of string commands to functions
var commands_dictionary = {};

function do_list(name) {
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

function do_import(filename) {
    // Call different file handlers depending on the extension
    const extension = filename.split('.').pop();
    if (extension === 'json') {
        import_json_data(filename);
    } else if (extension === 'csv') {
        import_csv_data(filename);
    } else if (extension === 'xml') {
        import_xml_data(filename);
    } else {
        console.log('Unrecognised file type');
    }
}

function do_help() {
    console.log("Supported commands are List, Import [filename] for CSV, XML, JSON");
}

// Command loop
commands_dictionary["List"] = do_list;
commands_dictionary["Import"] = do_import;
commands_dictionary["Help"] = do_help;

while (true) {
    var command = readlineSync.question('Enter a command: ');
    command = command.split(" ");

    const cmd_str = command[0];
    const cmd_fn = commands_dictionary[cmd_str];
    if (cmd_fn) {
        // Give the list command the remainder of the command string
        cmd_fn(command.slice(1).join(' '));
    } else {
        console.log("command "+ cmd_str +" not found");
    }
}
