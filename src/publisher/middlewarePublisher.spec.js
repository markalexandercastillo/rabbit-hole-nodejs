const td = require('testdouble')
  , MiddlewarePublisher = require('./middlewarePublisher');

const verifyLoose = spy => td.verify(spy, { ignoreExtraArgs: true });

describe('MiddlewarePublisher', () => {
  describe('Instance Methods', () => {
    beforeEach(() => {
      this.exchange = 'some-exchange';
      this.channel = td.object(['publish', 'test']);
      this.publisher = MiddlewarePublisher.create(this.channel, this.exchange);
    });

    describe('.publish', () => {
      it('respects the exchange the publisher was created with', () => {
        this.publisher.publish('some-routing-key', Buffer.from('some-content'));
        verifyLoose(this.channel.publish(this.exchange));
      });

      it('respects the given routing key', () => {
        const expectedRoutingKey = 'some-routing-key';
        this.publisher.publish(expectedRoutingKey, Buffer.from('some-content'));
        verifyLoose(this.channel.publish(td.matchers.anything(), expectedRoutingKey));
      });

      it('respects the given content', () => {
        const expectedContent = Buffer.from('some-content');
        this.publisher.publish('some-routing-key', expectedContent);
        verifyLoose(this.channel.publish(td.matchers.anything(), td.matchers.anything(), expectedContent));
      });

      it('respects the given options', () => {
        const expectedOptions = {someKey: 'some-value'};
        this.publisher.publish('some-routing-key', Buffer.from('some-content'), expectedOptions);
        verifyLoose(this.channel.publish(td.matchers.anything(), td.matchers.anything(), td.matchers.anything(), expectedOptions));
      });
    });

    describe('.use', () => {
      beforeEach(() => {
        this.appendMiddleware =
          toAppend => (routingKey, content, options) =>
            [
              `${routingKey}-${toAppend}`,
              Buffer.from(`${content.toString()}-${toAppend}`),
              {
                ...options,
                appendedKey: options.appendedKey
                  ? `${options.appendedKey}-${toAppend}`
                  : toAppend,
              }
            ];
      });

      it('calls the given middleware function on the arguments before publishing', () => {
        this.publisher.use(this.appendMiddleware('appended'));

        this.publisher.publish(
          'some-routing-key',
          Buffer.from('some-content'),
          { originalKey: 'some-original-value' },
        );

        td.verify(this.channel.publish(
          td.matchers.anything(),
          'some-routing-key-appended',
          Buffer.from('some-content-appended'),
          td.matchers.contains({ appendedKey: 'appended'}),
        ));
      });

      it('respects middleware ordering on one invocation', () => {
        this.publisher.use(
          this.appendMiddleware('first'),
          this.appendMiddleware('second'),
        );

        this.publisher.publish(
          'some-routing-key',
          Buffer.from('some-content'),
          { originalKey: 'some-original-value' },
        );

        td.verify(this.channel.publish(
          td.matchers.anything(),
          'some-routing-key-first-second',
          Buffer.from('some-content-first-second'),
          td.matchers.contains({appendedKey: 'first-second'})
        ));
      });

      it('respects middleware ordering on separate invocations', () => {
        this.publisher.use(this.appendMiddleware('first'));
        this.publisher.use(this.appendMiddleware('second'));

        this.publisher.publish(
          'some-routing-key',
          Buffer.from('some-content'),
          { originalKey: 'some-original-value' }
        );

        td.verify(this.channel.publish(
          td.matchers.anything(),
          'some-routing-key-first-second',
          Buffer.from('some-content-first-second'),
          td.matchers.contains({ appendedKey: 'first-second' }),
        ));
      });
    });
  });
});
