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

const import_transactions = require('./import_handlers');

// Extract Data
const readlineSync = require('readline-sync');
const fs = require('fs');
const xml2js = require('xml2js');
const moment = require('moment');

// Store transactions and accounts as objects
var transactions = [];
var accounts = new Map();

// Command interpreter
// Initialise an arrray of string commands to functions
var commands_dictionary = {};

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

function do_import(filename, accounts) {
    // Call different file handlers depending on the extension
    const extension = filename.split('.').pop();
    if (extension === 'json') {
        return import_transactions.import_json_data(filename, accounts);
    } else if (extension === 'csv') {
        return import_transactions.import_csv_data(filename, accounts);
    } else if (extension === 'xml') {
        return import_transactions.import_xml_data(filename, accounts);
    } else {
        console.log('Unrecognised file type');
        return [];
    }
}
do_import.requiresAccounts = true; // accounts array to update balances and add transaction refs
do_import.returnsTransactions = true; // new transactions objects to append
//You have to keep all the transactions, because otherwise where do the refs point?

function do_help() {
    console.log("Supported commands are List, Import [filename] for CSV, XML, JSON");
}
do_help.requiresAccounts = false;
do_help.returnsTransactions = false;

// Command loop
commands_dictionary["List"] = do_list;
commands_dictionary["Import"] = do_import;
commands_dictionary["Help"] = do_help;

while (true) {
    var command = readlineSync.question('Enter a command: ');
    command = command.split(" ");

    const cmd_str = command[0];
    const cmd_fn = commands_dictionary[cmd_str];

    if (cmd_fn.requiresAccounts && cmd_fn.returnsTransactions) {
        // Give the list command the remainder of the command string
        const new_transactions = cmd_fn(command.slice(1).join(' '), accounts);
        transactions.push(...new_transactions);
    } else if (cmd_fn.requiresAccounts && !cmd_fn.returnsTransactions) {
        cmd_fn(command.slice(1).join(' '), accounts);
    } else {
        console.log("command "+ cmd_str +" not found");
    }

}
