const { where, whereIn, limit } = require('../../../../../utils/db/knex');

const id = where('id');
const ids = whereIn('id');
const sender = where('sender');

const after = ({ timestamp, id, sortDirection }) => q => {
  const comparator = sortDirection === 'desc' ? '<' : '>';
  return q
    .clone()
    .whereRaw(`(t.time_stamp, t.id) ${comparator} (?, ?)`, [timestamp, id]);
};
const timeStart = where('t.time_stamp', '>=');
const timeEnd = where('t.time_stamp', '<=');
const sort = s => q =>
  q
    .clone()
    .orderBy('t.time_stamp', s)
    .orderBy('t.id', s);

module.exports = {
  id,
  ids,
  sender,
  after,
  timeStart,
  timeEnd,
  sort,
  limit,
};