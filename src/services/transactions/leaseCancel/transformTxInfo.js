const { compose } = require('ramda');
const { renameKeys } = require('ramda-adjunct');

const transformTxInfo = require('../common/transformTxInfo');

module.exports = compose(
  transformTxInfo,
  renameKeys({ lease_id: 'leaseId' })
);
