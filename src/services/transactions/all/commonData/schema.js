const Joi = require('../../../../utils/validation/joi');

const commonFilters = require('../../../presets/pg/searchWithPagination/commonFilterSchemas');

const result = Joi.object().keys({
  tx_type: Joi.number()
    .min(1)
    .max(15)
    .required(),
  time_stamp: Joi.date().required(),
  id: Joi.string()
    .base58()
    .required(),
});

const inputSearch = Joi.object()
  .keys({
    ...commonFilters,

    sender: Joi.string(),
    assetId: Joi.string(),
    address: Joi.string(),
  })
  .required()
  .without('sender', ['assetId', 'address']);

module.exports = { result, inputSearch };
