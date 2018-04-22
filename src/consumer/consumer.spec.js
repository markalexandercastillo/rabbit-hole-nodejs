const td = require('testdouble')
  , Consumer = require('./consumer');

describe('Consumer', () => {
  let consumer, channelPool;
  beforeEach(() => {
    channelPool = td.object(['get']);
    consumer = Consumer.create(channelPool);
  });

  describe('BaseConsumer', () => {
    let BaseConsumer;
    beforeEach(() => {
      BaseConsumer = td.replace('./baseConsumer');
    });

    describe('.create', () => {
      it('creates a BaseConsumer instance with a channel respecting on the given queue', done => {
        const expectedQueue = 'some-queue';
        const expectedChannel = td.object('some channel');
        td.when(channelPool.get(td.matchers.contains({
          queue: expectedQueue,
        }))).thenResolve(expectedChannel);
        td.when(BaseConsumer.create(expectedChannel)).thenResolve();
        consumer.BaseConsumer.create(expectedQueue)
          .then(() => done());
      });

      it('creates a BaseConsumer instance with a channel with a default prefetch of 1', done => {
        const expectedPrefetch = 1;
        const expectedChannel = td.object('some channel');
        td.when(channelPool.get(td.matchers.contains({
          prefetch: expectedPrefetch,
        }))).thenResolve(expectedChannel);
        td.when(BaseConsumer.create(expectedChannel)).thenResolve();
        consumer.BaseConsumer.create('some-queue')
          .then(() => done());
      });

      it('creates a BaseConsumer instance based on the given prefetch', done => {
        const expectedPrefetch = 4;
        const expectedChannel = td.object('some channel');
        td.when(channelPool.get(td.matchers.contains({
          prefetch: expectedPrefetch,
        }))).thenResolve(expectedChannel);
        td.when(BaseConsumer.create(expectedChannel)).thenResolve();
        consumer.BaseConsumer.create('some-queue', {prefetch: expectedPrefetch})
          .then(() => done());
      });
    });
  });
});

