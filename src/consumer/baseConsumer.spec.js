const td = require('testdouble')
  , BaseConsumer = require('./baseConsumer');

const whenLoose = testDouble => td.when(testDouble, { ignoreExtraArgs: true });

describe('BaseConsumer', () => {
  context('Instance methods', () => {
    let queue, channel, consumer;
    beforeEach(async () => {
      queue = 'some-queue';
      channel = td.object(['consume', 'prefetch', 'ack', 'nack']);
      consumer = await BaseConsumer.create(channel, queue);
    });

    describe('.ack', () => {
      it('acks the given message', done => {
        const expectedMessage = { someMessageKey: 'some-message-value' };
        whenLoose(channel.ack(expectedMessage)).thenResolve();
        consumer.ack(expectedMessage)
          .then(() => done());
      });

      it('defaults allUpTo to false', done => {
        td.when(channel.ack(td.matchers.anything(), false)).thenResolve();
        consumer.ack({ someMessageKey: 'some-message-value' })
          .then(() => done());
      });

      it('respects allUpTo', done => {
        td.when(channel.ack(td.matchers.anything(), true)).thenResolve();
        consumer.ack({ someMessageKey: 'some-message-value' }, true)
          .then(() => done());
      });
    });

    describe('.nack', () => {
      it('nacks the given message', done => {
        const expectedMessage = { someMessageKey: 'some-message-value' };
        whenLoose(channel.nack(expectedMessage)).thenResolve();
        consumer.nack(expectedMessage)
          .then(() => done());
      });

      it('defaults allUpTo to false', done => {
        whenLoose(channel.nack(td.matchers.anything(), false)).thenResolve();
        consumer.nack({ someMessageKey: 'some-message-value' })
          .then(() => done());
      });

      it('respects allUpTo', done => {
        whenLoose(channel.nack(td.matchers.anything(), true)).thenResolve();
        consumer.nack({ someMessageKey: 'some-message-value' }, true)
          .then(() => done());
      });

      it('defaults requeue to true', done => {
        td.when(channel.nack(td.matchers.anything(), td.matchers.anything(), true)).thenResolve();
        consumer.nack({ someMessageKey: 'some-message-value' })
          .then(() => done());
      });

      it('respects requeue', done => {
        td.when(channel.nack(td.matchers.anything(), td.matchers.anything(), false)).thenResolve();
        consumer.nack({ someMessageKey: 'some-message-value' }, false, false)
          .then(() => done());
      });
    });

    describe('.consume', () => {
      it('respects the queue the consumer was created with', done => {
        whenLoose(channel.consume(queue)).thenResolve();
        consumer.consume(td.func())
          .then(() => done());
      });

      it('respects the given cb', done => {
        const expectedCb = message => `${message}-updated`;
        whenLoose(channel.consume(
          td.matchers.anything(),
          td.matchers.argThat(cb => cb('some-message') === expectedCb('some-message'))
        )).thenResolve();
        consumer.consume(expectedCb)
          .then(() => done());
      });

      it('defaults to empty options', done => {
        td.when(channel.consume(
          td.matchers.anything(),
          td.matchers.anything(),
          td.matchers.argThat(options => !Object.keys(options).length)
        )).thenResolve();
        consumer.consume(td.func())
          .then(() => done());
      });

      it('respects the given options', done => {
        const expectedOptions = { someKey: 'some-value' };
        td.when(channel.consume(
          td.matchers.anything(),
          td.matchers.anything(),
          expectedOptions
        )).thenResolve();
        consumer.consume(td.func(), expectedOptions)
          .then(() => done());
      });
    });
  });
});

