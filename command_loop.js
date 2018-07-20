const readlineSync = require('readline-sync');
const list_command = require('./list_command');
const import_command = require('./import_command');
const help_command = require('./help_command');

function begin() {
    // Store transactions and accounts as objects
    var transactions = [];
    var accounts = new Map(); // Map string IDs to accound objects

    // Command interpreter
    // Initialise an arrray of string commands to functions
    var commands_dictionary = {};
    commands_dictionary["List"] = list_command.do_list;
    commands_dictionary["Import"] = import_command.do_import;
    commands_dictionary["Help"] = help_command.do_help;

    // Command loop
    while (true) {
        var command = readlineSync.question('Enter a command: ');
        command = command.split(" ");

        const cmd_str = command[0];
        const cmd_fn = commands_dictionary[cmd_str];
        const cmd_remains = command.slice(1).join(' ');

        // Depending on whether the command is defined...
        if (!cmd_fn) {
            console.log("Command "+ cmd_str +" not found");
            continue;
        }
        
        // Depending on whether the command returns data or needs data...
        let new_transactions;
        if (cmd_fn.requiresAccounts) {
            new_transactions = cmd_fn(cmd_remains, accounts);
        } else {
            new_transactions = cmd_fn(cmd_remains);
        }

        if (new_transactions) {
            transactions.push(...new_transactions);
        }
    }
}

module.exports = {begin}