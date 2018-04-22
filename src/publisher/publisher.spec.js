const td = require('testdouble')
  , Publisher = require('./publisher');

describe('Publisher', () => {
  let publisher, channelPool;
  beforeEach(() => {
    channelPool = td.object(['get']);
    publisher = Publisher.create(channelPool);
  });
  describe('BasePublisher', () => {
    let BasePublisher;
    beforeEach(() => {
      BasePublisher = td.replace('./basePublisher');
    });

    describe('.create', () => {
      it('creates a BasePublisher instance with a channel respecting on the given exchange', done => {
        const expectedExchange = 'some-exchange';
        const expectedChannel = td.object('some channel');
        td.when(channelPool.get(td.matchers.contains({
          exchange: expectedExchange,
        }))).thenResolve(expectedChannel);
        td.when(BasePublisher.create(expectedChannel)).thenResolve();
        publisher.BasePublisher.create(expectedExchange)
          .then(() => done());
      });
    });
  });
});

