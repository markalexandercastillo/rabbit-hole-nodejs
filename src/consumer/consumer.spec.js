const td = require('testdouble')
  , Consumer = require('./consumer');

describe('Consumer', () => {
  let consumer, connectionPool;
  beforeEach(() => {
    connectionPool = td.object(['getForConsumer']);
    consumer = Consumer.create(connectionPool);
  });

  afterEach(() => {
    td.reset();
  });

  [
    ['BaseConsumer', './baseConsumer'],
    ['MiddlewareConsumer', './middlewareConsumer'],
  ].forEach(([consumerType, modulePath]) => describe(consumerType, () => {
    let consumerModule;
    beforeEach(() => {
      consumerModule = td.replace(modulePath);
    });

    describe('.create', () => {
      it(`creates a ${consumerType} instance with a channel created by the connection respecting the given queue`, done => {
        const expectedQueue = 'some-queue';
        const expectedChannel = td.object('some channel');
        const expectedConnection = td.object(['getChannel']);
        td.when(connectionPool.getForConsumer()).thenResolve(expectedConnection);
        td.when(expectedConnection.getChannel(td.matchers.contains({
          queue: expectedQueue,
        }))).thenResolve(expectedChannel);
        td.when(consumerModule.create(expectedChannel)).thenResolve();
        consumer[consumerType].create(expectedQueue)
          .then(() => done());
      });

      it('creates a BaseConsumer instance with a channel created by the connection with a default prefetch of 1', done => {
        const expectedPrefetch = 1;
        const expectedChannel = td.object('some channel');
        const expectedConnection = td.object(['getChannel']);
        td.when(connectionPool.getForConsumer()).thenResolve(expectedConnection);
        td.when(expectedConnection.getChannel(td.matchers.contains({
          prefetch: expectedPrefetch,
        }))).thenResolve(expectedChannel);
        td.when(consumerModule.create(expectedChannel)).thenResolve();
        consumer[consumerType].create('some-queue')
          .then(() => done());
      });

      it('creates a BaseConsumer instance based on the given prefetch', done => {
        const expectedPrefetch = 4;
        const expectedChannel = td.object('some channel');
        const expectedConnection = td.object(['getChannel']);
        td.when(connectionPool.getForConsumer()).thenResolve(expectedConnection);
        td.when(expectedConnection.getChannel(td.matchers.contains({
          prefetch: expectedPrefetch,
        }))).thenResolve(expectedChannel);
        td.when(consumerModule.create(expectedChannel)).thenResolve();
        consumer[consumerType].create('some-queue', { prefetch: expectedPrefetch })
          .then(() => done());
      });
    });
  }));
});

