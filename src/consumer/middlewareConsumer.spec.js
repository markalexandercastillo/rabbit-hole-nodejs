const td = require('testdouble')
  , MiddlewareConsumer = require('./middlewareConsumer');

const whenLoose = testDouble => td.when(testDouble, {ignoreExtraArgs: true});

describe('MiddlewareConsumer', () => {
  let queue, channel, consumer;
  beforeEach(() => {
    queue = 'some-queue';
    channel = td.object(['consume', 'prefetch', 'ack', 'nack']);
    consumer = MiddlewareConsumer.create(channel, queue);
  });

  context('Instance methods', () => {
    describe('.ack', () => {
      it('acks the given message', done => {
        const expectedMessage = { someMessageKey: 'some-message-value' };
        td.when(channel.ack(expectedMessage), { ignoreExtraArgs: true }).thenResolve();
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
        consumer.ack({ someMessageKey: 'some-message-value'}, true)
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
          td.matchers.argThat(cb => cb('some-message') === 'some-message-updated')
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
        const expectedOptions = {someKey: 'some-value'};
        td.when(channel.consume(
          td.matchers.anything(),
          td.matchers.anything(),
          expectedOptions
        )).thenResolve();
        consumer.consume(td.func(), expectedOptions)
          .then(() => done());
      });
    });

    describe('.use', () => {
      let identity, appendMiddleware;
      beforeEach(() => {
        identity =
          message =>
            message;

        appendMiddleware =
          (targetKey, toAppend) => message =>
            ({ [targetKey]: `${message[targetKey]}-${toAppend}` });
      });

      it('calls the given middleware function on the consumed message before calling the given cb', done => {
        consumer.use(appendMiddleware('someKey', 'appended'));
        whenLoose(channel.consume(
          td.matchers.anything(),
          td.matchers.argThat(cb => cb({ someKey: 'original' }).someKey === 'original-appended')
        )).thenResolve();
        consumer.consume(identity)
          .then(() => done());
      });

      it('respects middleware ordering on one invocation', done => {
        consumer.use(
          appendMiddleware('someKey', 'first'),
          appendMiddleware('someKey', 'second')
        );
        whenLoose(channel.consume(
          td.matchers.anything(),
          td.matchers.argThat(cb => cb({ someKey: 'original' }).someKey === 'original-first-second')
        )).thenResolve();
        consumer.consume(identity)
          .then(() => done());
      });

      it('respects middleware ordering on separate invocations', done => {
        consumer.use(appendMiddleware('key', 'first'));
        consumer.use(appendMiddleware('key', 'second'));
        whenLoose(channel.consume(
          td.matchers.anything(),
          td.matchers.argThat(cb => cb({ key: 'original' }).key === 'original-first-second')
        )).thenResolve();
        consumer.consume(identity)
          .then(() => done());
      });
    });
  });
});

