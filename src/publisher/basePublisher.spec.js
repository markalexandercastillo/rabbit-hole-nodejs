const td = require('testdouble')
  , BasePublisher = require('./basePublisher');

const verifyLoose = spy => td.verify(spy, { ignoreExtraArgs: true });

describe('BasePublisher', () => {
  describe('Instance Methods', () => {
    let exchange, channel, publisher;
    beforeEach(() => {
      exchange = 'some-exchange';
      channel = td.object(['publish', 'test']);
      publisher = BasePublisher.create(channel, exchange);
    });

    describe('.publish', () => {
      it('respects the exchange the publisher was created with', () => {
        publisher.publish('some-routing-key', Buffer.from('some-content'));
        verifyLoose(channel.publish(exchange));
      });

      it('respects the given routing key', () => {
        const expectedRoutingKey = 'some-routing-key';
        publisher.publish(expectedRoutingKey, Buffer.from('some-content'));
        verifyLoose(channel.publish(td.matchers.anything(), expectedRoutingKey));
      });

      it('respects the given content', () => {
        const expectedContent = Buffer.from('some-content');
        publisher.publish('some-routing-key', expectedContent);
        verifyLoose(channel.publish(td.matchers.anything(), td.matchers.anything(), expectedContent));
      });

      it('respects the given options', () => {
        const expectedOptions = { someKey: 'some-value' };
        publisher.publish('some-routing-key', Buffer.from('some-content'), expectedOptions);
        verifyLoose(channel.publish(td.matchers.anything(), td.matchers.anything(), td.matchers.anything(), expectedOptions));
      });
    });
  });
});
