const { BigNumber } = require('@turtlenetwork/data-entities');
const {
  leftNotNullMonoid,
  rightNotNullMonoid,
  sumMonoid,
  bigNumberPlusMonoid,
  maxMonoid,
  bigNumberMaxMonoid,
  bigNumberMinMonoid,
  weightedAveragePriceMonoid,
  candleMonoid,
} = require('../candleMonoid');
const oneDayCandles = require('./mocks/oneDayCandles');

describe('monoid', () => {
  describe('left not null', () => {
    it('should return left arg', () => {
      expect(leftNotNullMonoid.concat('asd1', 'asd2')).toBe('asd1');
    });

    it('should return right arg', () => {
      expect(leftNotNullMonoid.concat(null, 'asd2')).toBe('asd2');
    });
  });

  describe('right not null', () => {
    it('should return right arg', () => {
      expect(rightNotNullMonoid.concat('asd1', 'asd2')).toBe('asd2');
    });

    it('should return left arg', () => {
      expect(rightNotNullMonoid.concat('asd1', null)).toBe('asd1');
    });
  });

  describe('sum', () => {
    it('should return sum of args', () => {
      expect(sumMonoid.concat(1, 2)).toBe(3);
    });
  });

  describe('big number plus', () => {
    it('shourd return big number of sum of args', () => {
      expect(bigNumberPlusMonoid.concat(new BigNumber(1), new BigNumber(2))).toEqual(
        new BigNumber(3)
      );
    });
  });

  describe('max', () => {
    it('should return max monoid', () => {
      expect(maxMonoid.concat(10, 2)).toBe(10);
    });
  });

  describe('big number max', () => {
    it('should return bignumber max monoid', () => {
      expect(bigNumberMaxMonoid.concat(new BigNumber(10), new BigNumber(2))).toEqual(
        new BigNumber(10)
      );
    });
  });

  describe('big number min', () => {
    it('should return bignumber min monoid', () => {
      expect(bigNumberMinMonoid.concat(new BigNumber(10), new BigNumber(2))).toEqual(
        new  BigNumber(2)
      );
    });
  });

  describe('weighted average price', () => {
    it('should return weighted average price of candles monoid', () => {
      expect(
        weightedAveragePriceMonoid.concat(
          { quote_volume: new BigNumber(2), volume: new BigNumber(3) },
          { quote_volume: new BigNumber(3), volume: new BigNumber(2) }
        )
      ).toEqual(new BigNumber(1));
    });
  });

  describe('candle', () => {
    it('should return two concated candle monoids', () => {
      const monoid = candleMonoid.concat(oneDayCandles[0], oneDayCandles[0]);
      expect(monoid).toMatchObject({
        time_start: '2018-11-15T14:03:00.000Z',
        max_height: 377979,
        txs_count: 40,
      });
      expect(monoid.open.bn.comparedTo(new BigNumber(0.01))).toEqual(0);
      expect(monoid.close.bn.comparedTo(new BigNumber(0.0001))).toEqual(0);
      expect(monoid.low.bn.comparedTo(new BigNumber(1e-8))).toEqual(0);
      expect(monoid.high.bn.comparedTo(new BigNumber(0.01))).toEqual(0);
      expect(monoid.volume.bn.comparedTo(new BigNumber(5684))).toEqual(0);
      expect(monoid.quote_volume.bn.comparedTo(new BigNumber(6.6000884))).toEqual(0);
      expect(
        monoid.weighted_average_price.bn.comparedTo(
          new BigNumber('0.00116116966924700914')
        )
      ).toEqual(0);
    });
  });
});
