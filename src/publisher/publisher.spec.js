const td = require('testdouble')
  , Publisher = require('./publisher');

describe('Publisher', () => {
  let publisher, channelPool;
  beforeEach(() => {
    channelPool = td.object(['get']);
    publisher = Publisher.create(channelPool);
  });

  [
    ['BasePublisher', './basePublisher'],
    ['MiddlewarePublisher', './middlewarePublisher'],
  ].forEach(([publisherType, modulePath]) => describe(publisherType, () => {
    let publisherModule;
    beforeEach(() => {
      publisherModule = td.replace(modulePath);
    });

    describe('.create', () => {
      it(`creates a ${publisherType} instance with a channel respecting on the given exchange`, done => {
        const expectedExchange = 'some-exchange';
        const expectedChannel = td.object('some channel');
        td.when(channelPool.get(td.matchers.contains({
          exchange: expectedExchange,
        }))).thenResolve(expectedChannel);
        td.when(publisherModule.create(expectedChannel)).thenResolve();
        publisher[publisherType].create(expectedExchange)
          .then(() => done());
      });
    });
  }));
});

