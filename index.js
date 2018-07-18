console.log("Press Ctrl-C to quit");

// CSV
//Date To From Narrative Amount

//Write a program which creates an account for each person, and then creates transactions between the accounts. 
// The person in the 'From' column is paying money, so the amount needs to be deducted from their account. 
// The person in the 'To' column is being paid, so the amount needs to be added to their account.
// Use a class for each type of object you want to create.
//Your program should support two commands, which can be typed in on the console:
//List All should output the names of each person, and the total amount they owe, or are owed.
// Loop over array of accounts, print balance

//List [Account] should also print a list of every transaction, with the date and narrative, for that account with that name.
// 

//The JavaScript Date class is extremely bothersome to use. We recommend you parse your date strings using the moment package instead: install it with npm install moment and see this link for documentation on how to parse dates.
//Either parse the file yourself, or search NPM for a relevant CSV parsing library!

// Account class, with fields:
// Name
// Balance
const readlineSync = require('readline-sync');
const fs = require('fs');
const csv = require('csv');

// Read CSV, extract data
var transactions = [];
class Transaction {
    constructor(date, from, to, narrative, amount) {
        this.date = date;
        this.from = from;
        this.to = to;
        this.narrative = narrative;
        this.amount = parseInt(amount);    
    }
}

const inputPath = '.\\Transactions2014.csv';
const csv_out = fs.readFileSync(inputPath, 'utf8');
const lineSplit = csv_out.split('\n');

for (var i=1; i<lineSplit.length; i++) {
    // Start at row 1, as row 0 contains the column headings
    const transaction = lineSplit[i].split(',');

    // Extract the fields
    const date = transaction[0];
    const from = transaction[1];
    const to = transaction[2];
    const narrative = transaction[3];
    const amount = transaction[4];
    
    // Create transaction objects
    transactions.push(new Transaction(date, from, to, narrative, amount));
}


// Now all the transactions are in one array
// Can we have two accounts with different names?
class Account {
    constructor(name) {
        this.name = name;
        this.balance = 0;
        this.transactionRefs = [];
    }
}
var accounts = new Map();
transactions.forEach(function(element) {
    // For each transaction:

    [element.from, element.to].forEach(function(name) {
        // Create accounts if they don't exist already
        if (!accounts.get(name)) {
            accounts.set(name, new Account(name));
        }

        // add references to those transactions
        accounts.get(name).transactionRefs += element;
    });

    // credit or debit those balances
    accounts.get(element.from).balance -= element.amount;
    accounts.get(element.to).balance += element.amount;
});


// Initialise an arrray of string commands to functions
var commands_dictionary = {};

function do_list(name) {
    if (name === "All") {
        console.log("Print all account names and balances");
        for (var [key, value] of accounts) {
            console.log(value.name, value.balance);
        }

    } else {
        console.log(name);
    }
}

commands_dictionary["List"] = do_list;
while (true) {
    var command = readlineSync.question('Enter a command: ');
    command = command.split(" ");

    const cmd_str = command[0];
    const cmd_fn = commands_dictionary[cmd_str];
    if (cmd_fn) {
        cmd_fn(command[1]);
    } else {
        console.log("command "+ cmd_str +" not found");
    }
}
