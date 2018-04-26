const td = require('testdouble')
  , MiddlewarePublisher = require('./middlewarePublisher');

const verifyLoose = spy => td.verify(spy, { ignoreExtraArgs: true });

describe('MiddlewarePublisher', () => {
  describe('Instance Methods', () => {
    let exchange, channel, publisher;
    beforeEach(async () => {
      exchange = 'some-exchange';
      channel = td.object(['publish', 'test']);
      publisher = await MiddlewarePublisher.create(channel, exchange);
    });

    describe('.publish', () => {
      it('respects the exchange the publisher was created with', done => {
        publisher.publish('some-routing-key', Buffer.from('some-content'))
          .then(() => verifyLoose(channel.publish(exchange)))
          .then(() => done())
          .catch(done);
      });

      it('respects the given routing key', done => {
        const expectedRoutingKey = 'some-routing-key';
        publisher.publish(expectedRoutingKey, Buffer.from('some-content'))
          .then(() => verifyLoose(channel.publish(td.matchers.anything(), expectedRoutingKey)))
          .then(() => done())
          .catch(done);
      });

      it('respects the given content', done => {
        const expectedContent = Buffer.from('some-content');
        publisher.publish('some-routing-key', expectedContent)
          .then(() => verifyLoose(channel.publish(
            td.matchers.anything(),
            td.matchers.anything(),
            expectedContent
          )))
          .then(() => done())
          .catch(done);
      });

      it('respects the given options', done => {
        const expectedOptions = {someKey: 'some-value'};
        publisher.publish('some-routing-key', Buffer.from('some-content'), expectedOptions)
          .then(() => verifyLoose(channel.publish(
            td.matchers.anything(),
            td.matchers.anything(),
            td.matchers.anything(),
            expectedOptions
          )))
          .then(() => done())
          .catch(done);
      });
    });

    describe('.use', () => {
      const appendMiddleware =
        toAppend =>
          ({
            onRoutingKey: routingKey =>
              `${routingKey}-${toAppend}`,
            onContent: content =>
              Buffer.from(`${content.toString()}-${toAppend}`),
            onOptions: options =>
              ({
                ...options,
                appendedKey: options.appendedKey
                  ? `${options.appendedKey}-${toAppend}`
                  : toAppend,
              }),
          });

      it('calls the given middleware function on the arguments before publishing', done => {
        publisher.use(appendMiddleware('appended'))
          .then(publisher => publisher.publish(
            'some-routing-key',
            Buffer.from('some-content'),
            { originalKey: 'some-original-value' },
          ))
          .then(() => td.verify(channel.publish(
            td.matchers.anything(),
            'some-routing-key-appended',
            Buffer.from('some-content-appended'),
            td.matchers.contains({ appendedKey: 'appended' }),
          )))
          .then(() => done())
          .catch(done);
      });

      it('respects middleware ordering on one invocation', done => {
        publisher.use(appendMiddleware('first'), appendMiddleware('second'))
          .then(publisher => publisher.publish(
            'some-routing-key',
            Buffer.from('some-content'),
            { originalKey: 'some-original-value' },
          ))
          .then(() => td.verify(channel.publish(
            td.matchers.anything(),
            'some-routing-key-first-second',
            Buffer.from('some-content-first-second'),
            td.matchers.contains({ appendedKey: 'first-second' })
          )))
          .then(() => done())
          .catch(done);
      });

      it('respects middleware ordering on separate invocations', done => {
        publisher.use(appendMiddleware('first'))
          .then(publisher => publisher.use(appendMiddleware('second')))
          .then(publisher => publisher.publish(
            'some-routing-key',
            Buffer.from('some-content'),
            { originalKey: 'some-original-value' }
          ))
          .then(() => td.verify(channel.publish(
            td.matchers.anything(),
            'some-routing-key-first-second',
            Buffer.from('some-content-first-second'),
            td.matchers.contains({ appendedKey: 'first-second' }),
          )))
          .then(() => done())
          .catch(done);
      });

      const originalArgs = [
        'some-routing-key',
        Buffer.from('some-content'),
        { originalKey: 'some-original-value' },
      ];
      [
        ['onRoutingKey', 'routingKey', [
          'some-routing-key',
          Buffer.from('some-content-appended'),
          td.matchers.contains({ appendedKey: 'appended' }),
        ]],
        ['onOptions', 'options', [
          'some-routing-key-appended',
          Buffer.from('some-content-appended'),
          { originalKey: 'some-original-value' },
        ]],
        ['onContent', 'content', [
          'some-routing-key-appended',
          Buffer.from('some-content'),
          td.matchers.contains({ appendedKey: 'appended' })
        ]],
      ].forEach(([middlewareKey, argName, expectedArgs]) => {
        it(`preserves the ${argName} when the ${middlewareKey} function is omitted`, done => {
          publisher.use({...appendMiddleware('appended'), [middlewareKey]: undefined})
            .then(publisher => publisher.publish(...originalArgs))
            .then(() => td.verify(channel.publish(td.matchers.anything(), ...expectedArgs)))
            .then(() => done())
            .catch(done);
        });
      });
    });
  });
});
