const Router = require('koa-router');

const subrouter = new Router();

const exchangeOne = require('./exchange/one');
const exchangeMany = require('./exchange/many');

const dataOne = require('./data/one');
const dataMany = require('./data/many');

const transferOne = require('./transfer/one');
const transferMany = require('./transfer/many');

const leaseOne = require('./lease/one');
const leaseMany = require('./lease/many');

const leaseCancelOne = require('./leaseCancel/one');
const leaseCancelMany = require('./leaseCancel/many');

const massTransferOne = require('./massTransfer/one');
const massTransferSearch = require('./massTransfer/search');

const setScriptOne = require('./setScript/one');
const setScriptMany = require('./setScript/many');

const allTransactionsOne = require('./all/one');
const allTransactionsMany = require('./all/many');

const postToGet = require('../utils/postToGet');

subrouter.get('/transactions/exchange/:id', exchangeOne);
subrouter.get('/transactions/exchange', exchangeMany);
subrouter.post('/transactions/exchange', postToGet(exchangeMany));

subrouter.get('/transactions/data/:id', dataOne);
subrouter.get('/transactions/data', dataMany);
subrouter.post('/transactions/data', postToGet(dataMany));

subrouter.get('/transactions/transfer/:id', transferOne);
subrouter.get('/transactions/transfer', transferMany);
subrouter.post('/transactions/transfer', postToGet(transferMany));

subrouter.get('/transactions/lease/:id', leaseOne);
subrouter.get('/transactions/lease', leaseMany);
subrouter.post('/transactions/lease', postToGet(leaseMany));

subrouter.get('/transactions/lease-cancel/:id', leaseCancelOne);
subrouter.get('/transactions/lease-cancel', leaseCancelMany);
subrouter.post('/transactions/lease-cancel', postToGet(leaseCancelMany));

subrouter.get('/transactions/mass-transfer/:id', massTransferOne);
subrouter.get('/transactions/mass-transfer', massTransferSearch);
subrouter.post('/transactions/mass-transfer', postToGet(massTransferSearch));

subrouter.get('/transactions/set-script/:id', setScriptOne);
subrouter.get('/transactions/set-script', setScriptMany);
subrouter.post('/transactions/set-script', postToGet(setScriptMany));

subrouter.get('/transactions/all/:id', allTransactionsOne);
subrouter.get('/transactions/all', allTransactionsMany);
subrouter.post('/transactions/all', postToGet(allTransactionsMany));

module.exports = subrouter;
