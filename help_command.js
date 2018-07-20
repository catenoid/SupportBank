function do_help() {
    console.log("Supported commands are List, Import [filename] for CSV, XML, JSON");
}
do_help.requiresAccounts = false;
do_help.returnsTransactions = false;

module.exports = {do_help}