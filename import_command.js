const importTransactions = require('./import_handlers');

const extractData = {'json': importTransactions.importJSONdata,
                      'csv': importTransactions.importCSVdata,
                      'xml': importTransactions.importXMLdata}

function doImport(filename, accounts) {
    // Call different file handlers depending on the extension
    const extension = filename.split('.').pop();
    const fn = extractData[extension]
    if (fn) {
        return fn(filename, accounts);
    } else {
        console.warn('Unrecognised file type');
        return [];
    }
}
doImport.requiresAccounts = true; // accounts array to update balances and add transaction refs

module.exports = doImport;