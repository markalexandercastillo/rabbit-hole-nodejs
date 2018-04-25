const td = require('testdouble')
  , Publisher = require('./publisher');

describe('Publisher', () => {
  let publisher, connectionPool;
  beforeEach(() => {
    connectionPool = td.object(['getForPublisher']);
    publisher = Publisher.create(connectionPool);
  });

  afterEach(() => {
    td.reset();
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
      it(`creates a ${publisherType} instance with a channel created by connection for publishers respecting the given exchange`, done => {
        const expectedExchange = 'some-exchange';
        const expectedChannel = td.object('some channel');
        const expectedConnection = td.object(['getChannel']);
        td.when(connectionPool.getForPublisher()).thenResolve(expectedConnection);
        td.when(expectedConnection.getChannel(td.matchers.contains({
          exchange: expectedExchange,
        }))).thenResolve(expectedChannel);
        td.when(publisherModule.create(expectedChannel)).thenResolve();
        publisher[publisherType].create(expectedExchange)
          .then(() => done());
      });
    });
  }));
});

