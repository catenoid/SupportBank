const import_transactions = require('./import_handlers');

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

module.exports = {do_import}