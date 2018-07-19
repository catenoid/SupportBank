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

// Extract Data
const readlineSync = require('readline-sync');

// Store transactions and accounts as objects
var transactions = [];
var accounts = new Map();

// Command interpreter
// Initialise an arrray of string commands to functions
var commands_dictionary = {};

function do_help() {
    console.log("Supported commands are List, Import [filename] for CSV, XML, JSON");
}
do_help.requiresAccounts = false;
do_help.returnsTransactions = false;

const list_command = require('./list_command');
const import_command = require('./import_command');

// Command loop
commands_dictionary["List"] = list_command.do_list;
commands_dictionary["Import"] = import_command.do_import;
commands_dictionary["Help"] = do_help;

while (true) {
    var command = readlineSync.question('Enter a command: ');
    command = command.split(" ");

    const cmd_str = command[0];
    const cmd_fn = commands_dictionary[cmd_str];

    // Depending on whether the command returns data or needs data...
    if (cmd_fn.requiresAccounts && cmd_fn.returnsTransactions) {
        const new_transactions = cmd_fn(command.slice(1).join(' '), accounts);
        transactions.push(...new_transactions);
    }
    
    else if (cmd_fn.requiresAccounts && !cmd_fn.returnsTransactions) {
        cmd_fn(command.slice(1).join(' '), accounts);
    }
    
    else {
        console.log("command "+ cmd_str +" not found");
    }
}
