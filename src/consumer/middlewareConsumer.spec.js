const td = require('testdouble')
  , MiddlewareConsumer = require('./middlewareConsumer');

const whenLoose = testDouble => td.when(testDouble, {ignoreExtraArgs: true});

describe('MiddlewareConsumer', () => {
  let queue, channel, consumer;
  beforeEach(async () => {
    queue = 'some-queue';
    channel = td.object(['consume', 'prefetch', 'ack', 'nack']);
    consumer = await MiddlewareConsumer.create(channel, queue);
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
        const expectedCb = ({message}) => `${message}-updated`;
        whenLoose(channel.consume(
          td.matchers.anything(),
          td.matchers.argThat(async cb => await cb('some-message') === expectedCb({ message: 'some-message' }))
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
          (targetKey, toAppend) => ({
            onMessage: message =>
              ({ [targetKey]: `${message[targetKey]}-${toAppend}` })
          });
      });

      it('calls the given middleware onMessage function on the consumed message before calling the given cb', done => {
        whenLoose(channel.consume(
          td.matchers.anything(),
          td.matchers.argThat(async cb => await cb({ someKey: 'original' }).someKey === 'original-appended')
        )).thenResolve();
        consumer.use(appendMiddleware('someKey', 'appended'))
          .then(consumer => consumer.consume(identity))
          .then(() => done());
      });

      it('respects middleware ordering on one invocation', done => {
        whenLoose(channel.consume(
          td.matchers.anything(),
          td.matchers.argThat(async cb => await cb({ someKey: 'original' }).someKey === 'original-first-second')
        )).thenResolve();
        consumer.use(
          appendMiddleware('someKey', 'first'),
          appendMiddleware('someKey', 'second')
        ).then(consumer => consumer.consume(identity))
          .then(() => done());
      });

      it('respects middleware ordering on separate invocations', done => {
        whenLoose(channel.consume(
          td.matchers.anything(),
          td.matchers.argThat(async cb => await cb({ key: 'original' }).key === 'original-first-second')
        )).thenResolve();

        consumer.use(appendMiddleware('key', 'first'))
          .then(consumer => consumer.use(appendMiddleware('key', 'second')))
          .then(consumer => consumer.consume(identity))
          .then(() => done());
      });

      it('supports Promise-based middleware', done => {
        whenLoose(channel.consume(
          td.matchers.anything(),
          td.matchers.argThat(async cb => await cb({ someKey: 'original' }).someKey === 'original-appended')
        )).thenResolve();

        consumer.use(Promise.resolve(appendMiddleware('someKey', 'appended')))
          .then(consumer => consumer.consume(identity))
          .then(() => done());
      });

      it('stops executing middlewares when an error occurs in one of them and invokes the given cb with the error having been set', done => {
        const expectedCb = td.func();

        whenLoose(channel.consume(
          td.matchers.anything(),
          td.matchers.argThat(async cb => {
            await cb({ someKey: 'original' });
            try {
              td.verify(expectedCb(td.matchers.contains({
                message: { someKey: 'original-first' },
                error: new Error('some error'),
              })));
              done();
            } catch (e) {
              return done(e);
            }
            return true;
          })
        )).thenResolve();

        consumer.use(
          appendMiddleware('someKey', 'first'),
          {
            onMessage: () => {
              throw new Error('some error');
            },
          },
          appendMiddleware('someKey', 'second')
        ).then(consumer => consumer.consume(expectedCb));
      });

      it('stops executing middlewares when an error invoking the onError callback when set and not calling the given callback', done => {
        const notSoExpectedCb = td.func();
        const onError = td.func();

        whenLoose(channel.consume(
          td.matchers.anything(),
          td.matchers.argThat(async cb => {
            await cb({ someKey: 'original' });
            try {
              td.verify(notSoExpectedCb(td.matchers.anything()), { times: 0 });
              td.verify(onError(td.matchers.contains({
                message: { someKey: 'original-first' },
                error: new Error('some error'),
              })));
              done();
            } catch (e) {
              return done(e);
            }
            return true;
          })
        )).thenResolve();

        consumer.use(
          appendMiddleware('someKey', 'first'),
          {
            onMessage: () => {
              throw new Error('some error');
            },
            onError,
          },
          appendMiddleware('someKey', 'second')
        ).then(consumer => consumer.consume(notSoExpectedCb));
      });
    });
  });
});

