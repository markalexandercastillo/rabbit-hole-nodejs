const td = require('testdouble')
  , BasePublisher = require('./basePublisher');

const verifyLoose = spy => td.verify(spy, { ignoreExtraArgs: true });

describe('BasePublisher', () => {
  describe('Instance Methods', () => {
    let exchange, channel, publisher;
    beforeEach(async () => {
      exchange = 'some-exchange';
      channel = td.object(['publish', 'test']);
      publisher = await BasePublisher.create(channel, exchange);
    });

    describe('.publish', () => {
      it('respects the exchange the publisher was created with', done => {
        publisher.publish('some-routing-key', Buffer.from('some-content'));
        try {
          verifyLoose(channel.publish(exchange));
          done();
        } catch (e) {
          done(e);
        }
      });

      it('respects the given routing key', done => {
        const expectedRoutingKey = 'some-routing-key';
        publisher.publish(expectedRoutingKey, Buffer.from('some-content'));
        try {
          verifyLoose(channel.publish(
            td.matchers.anything(),
            expectedRoutingKey
          ));
          done();
        } catch (e) {
          done(e);
        }
      });

      it('respects the given content', done => {
        const expectedContent = Buffer.from('some-content');
        publisher.publish('some-routing-key', expectedContent);
        try {
          verifyLoose(channel.publish(
            td.matchers.anything(),
            td.matchers.anything(),
            expectedContent
          ));
          done();
        } catch (e) {
          done(e);
        }
      });

      it('respects the given options', done => {
        const expectedOptions = { someKey: 'some-value' };
        publisher.publish('some-routing-key', Buffer.from('some-content'), expectedOptions);
        try {
          verifyLoose(channel.publish(
            td.matchers.anything(),
            td.matchers.anything(),
            td.matchers.anything(),
            expectedOptions
          ));
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
});
