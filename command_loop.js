const readlineSync = require('readline-sync');
const list_command = require('./list_command');
const import_command = require('./import_command');
const help_command = require('./help_command');

function begin() {
    // Store transactions and accounts as objects
    var transactions = [];
    var accounts = new Map(); // Map string IDs to account objects

    // Command interpreter
    // Initialise an arrray of string commands to functions
    const commandsDictionary = {
        List: list_command,
        Import: import_command,
        Help: help_command,
    };

    // Command loop
    while (true) {
        const command = readlineSync.question('Enter a command: ').split(' ');

        const commandType = command[0];
        const commandFunction = commandsDictionary[commandType];
        const commandParams = command.slice(1).join(' ');

        // Depending on whether the command is defined...
        if (!commandFunction) {
            console.log(`Command ${commandType} not found`);
            continue;
        }
        
        // Depending on whether the command returns data or needs data...
        let newTransactions;
        if (commandFunction.requiresAccounts) {
            newTransactions = commandFunction(commandParams, accounts);
        } else {
            newTransactions = commandFunction(commandParams);
        }

        if (newTransactions) {
            transactions.push(...newTransactions);
        }
    }
}

module.exports = {begin}