console.log("Test");

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

//Hints:
//You will need to accept user input - the readline-sync package covers this.
//The JavaScript Date class is extremely bothersome to use. We recommend you parse your date strings using the moment package instead: install it with npm install moment and see this link for documentation on how to parse dates.
//Either parse the file yourself, or search NPM for a relevant CSV parsing library!

// Account class, with fields:
// Name
// Balance

// Read the transaction file and create account objects
var readlineSync = require('readline-sync');

// Initialise an arrray of string commands to functions
var commands_dictionary = {};

function do_list(name) {
    if (name === "All"){
        console.log("all the names");
    } else {
        console.log(name);
    }
}

commands_dictionary["List"] = do_list;
while (true) {
    var command = readlineSync.question('Enter a command: ');
    command = command.split(" ");

    commands_dictionary[command[0]](command[1]);
}
