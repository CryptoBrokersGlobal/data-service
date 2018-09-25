const createService = require('..');
const { createPgDriver } = require('../../../../db');
const { parseDate } = require('../../../../utils/parseDate');
const Cursor = require('../../../../resolvers/pagination/cursor');

const TX_ID = 'AkM4bQ5dVkqWezSgMPdW5iieX98xDsiFjVDbEddntGNv';

const loadConfig = require('../../../../loadConfig');
const options = loadConfig();

const drivers = {
  pg: createPgDriver(options),
};

const service = createService({
  drivers,
  emitEvent: () => () => null,
});

describe('Data transaction service', () => {
  describe('get', () => {
    it('fetches real tx', async done => {
      service
        .get(TX_ID)
        .run()
        .promise()
        .then(x => {
          expect(x).toMatchSnapshot();
          done();
        })
        .catch(e => done(JSON.stringify(e)));
    });
    it('returns null for unreal tx', async () => {
      const tx = await service
        .get('UNREAL')
        .run()
        .promise();

      expect(tx).toBe(null);
    });
  });

  describe('mget', () => {
    it('fetches real txs with nulls for unreal', async done => {
      service
        .mget([TX_ID, 'UNREAL', '42HFStNghPMnXQLtYeGwFTzxXQRjc2rReubGHjwM5Fea'])
        .run()
        .promise()
        .then(xs => {
          expect(xs).toMatchSnapshot();
          done();
        })
        .catch(e => done(JSON.stringify(e)));
    });
  });

  describe('Data transaction service search', () => {
    it('fetches real txs', async () => {
      const tx = await service
        .search({
          limit: 5,
          sort: 'asc',
        })
        .run()
        .promise();
      expect(tx).toMatchSnapshot();
      expect(tx.data).toHaveLength(5);
    });
    describe('Pagination ', async () => {
      const START = '2018-06-28T05:12:41.449Z';
      const END = '2018-07-20T19:48:06.665Z';
      const LIMIT = 21;
      const createCursor = sort => ({ data }) => Cursor.encode(sort, data);
      it(' doesnt get 2 identical entries for limit 1 asc with next page fetching', async () => {
        const baseParams = {
          limit: 1,
          timeStart: parseDate('Mon Jun 11 2018 12:34:52 GMT+0300 (MSK)'),
          sort: 'asc',
        };

        const firstTx = await service
          .search(baseParams)
          .run()
          .promise();

        const secondTx = await service
          .search({
            after: firstTx.lastCursor,
            limit: 1,
          })
          .run()
          .promise();

        expect(firstTx.data).not.toEqual(secondTx.data);
      });
      it(' works asc', async () => {
        const SORT = 'asc';

        const baseParams = {
          limit: LIMIT,
          timeEnd: parseDate(END),
          timeStart: parseDate(START),
          sort: SORT,
        };

        const fetchAndGetNextCursor = cursor =>
          service
            .search({
              ...baseParams,
              limit: 5,
              after: cursor,
            })
            .run()
            .promise()
            .then(x => [x.lastCursor, x.data.map(createCursor(SORT))]);

        const firstCursor = await service
          .search({ ...baseParams, limit: 1 })
          .run()
          .promise()
          .then(x => x.data.map(createCursor(SORT))[0]);
        var i = 0;
        var cursors = [firstCursor];
        var curCursor = firstCursor;

        while (i++ < (LIMIT - 1) / 5) {
          var [nextCursor, cs] = await fetchAndGetNextCursor(curCursor);
          curCursor = nextCursor;
          cursors = [...cursors, ...cs];
        }

        const expectedCursors = await service
          .search({
            ...baseParams,
            limit: LIMIT,
          })
          .run()
          .promise()
          .then(x => x.data.map(createCursor(SORT)));

        expect(cursors).toEqual(expectedCursors);
      });
      it(' works desc', async () => {
        const SORT = 'desc';

        const baseParams = {
          limit: LIMIT,
          timeEnd: parseDate(END),
          timeStart: parseDate(START),
          sort: SORT,
        };

        const fetchAndGetNextCursor = cursor =>
          service
            .search({
              ...baseParams,
              limit: 5,
              after: cursor,
            })
            .run()
            .promise()
            .then(x => [x.lastCursor, x.data.map(createCursor(SORT))]);

        const firstCursor = await service
          .search({ ...baseParams, limit: 1 })
          .run()
          .promise()
          .then(x => x.data.map(createCursor(SORT))[0]);
        var i = 0;
        var cursors = [firstCursor];
        var curCursor = firstCursor;

        while (i++ < (LIMIT - 1) / 5) {
          var [nextCursor, curCursors] = await fetchAndGetNextCursor(curCursor);
          curCursor = nextCursor;
          cursors = [...cursors, ...curCursors];
        }

        const expectedCursors = await service
          .search({
            ...baseParams,
            limit: LIMIT,
          })
          .run()
          .promise()
          .then(x => x.data.map(createCursor(SORT)));

        expect(cursors).toEqual(expectedCursors);
      });
    });
  });
});
