const readlineSync = require('readline-sync');
const listCommand = require('./list_command');
const importCommand = require('./import_command');
const helpCommand = require('./help_command');

function begin() {
    // Store transactions and accounts as objects
    let transactions = [];
    let accounts = new Map(); // Map string IDs to account objects

    // Command interpreter
    // Initialise an arrray of string commands to functions
    const commandsDictionary = {
        List: listCommand,
        Import: importCommand,
        Help: helpCommand,
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