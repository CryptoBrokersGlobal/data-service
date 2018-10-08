const { compose } = require('ramda');
const { renameKeys } = require('ramda-adjunct');

const transformTxInfo = require('../_common/transformTxInfo');

module.exports = compose(
  renameKeys({
    asset_id: 'assetId',
  }),
  transformTxInfo
);
