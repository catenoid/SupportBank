const import_transactions = require('./import_handlers');

const extract_data = {'json': import_transactions.import_json_data,
                      'csv': import_transactions.import_csv_data,
                      'xml': import_transactions.import_xml_data}

function do_import(filename, accounts) {
    // Call different file handlers depending on the extension
    const extension = filename.split('.').pop();
    const fn = extract_data[extension]
    if (fn) {
        return fn(filename, accounts);
    } else {
        console.warn('Unrecognised file type');
        return [];
    }
}
do_import.requiresAccounts = true; // accounts array to update balances and add transaction refs

module.exports = do_import;