const td = require('testdouble')
  , chai = require('chai');

const whenLoose = testDouble => td.when(testDouble, {ignoreExtraArgs: true});
const expect = chai.expect;

describe('RabbitHole', () => {
  let Publisher, Consumer, ConnectionPool, amqp, RabbitHole;
  beforeEach(() => {
    Publisher = td.replace('./publisher');
    Consumer = td.replace('./consumer');
    ConnectionPool = td.replace('./connectionPool');
    RabbitHole = require('./rabbitHole');
  });

  afterEach(() => {
    td.reset();
  });

  describe('.create', () => {
    context('ConnectionPool creation', () => {
      beforeEach(() => {
        whenLoose(Consumer.create()).thenResolve();
        whenLoose(Publisher.create()).thenResolve();
      });

      const defaultOptions = {
        protocol: 'amqp',
        hostname: 'localhost',
        port: 5672,
        username: 'guest',
        password: 'guest',
        locale: 'en_US',
        frameMax: 0,
        heartbeat: 0,
        vhost: '/',
      };
      Object.entries(defaultOptions).forEach(([optionKey, defaultValue]) => {
        it(`defaults the '${optionKey}' value to ${JSON.stringify(defaultValue)}`, done => {
          whenLoose(ConnectionPool.create(td.matchers.contains({ [optionKey]: defaultValue }))).thenResolve();
          RabbitHole.create()
            .then(() => done());
        });
      });

      const userDefinedOptions = {
        hostname: 'some-host',
        port: 1234,
        username: 'some-user',
        password: 'some-password',
        locale: 'en_PH',
        frameMax: 56,
        heartbeat: 78,
        vhost: 'some-vhost',
      };
      Object.entries(userDefinedOptions).forEach(([optionKey, expectedValue]) => {
        it(`respects the given '${optionKey}' value`, done => {
          whenLoose(ConnectionPool.create(td.matchers.contains({ [optionKey]: expectedValue }))).thenResolve();
          RabbitHole.create({ [optionKey]: expectedValue })
            .then(() => done());
        });
      });
    });

    context('Consumer and Publisher creation', () => {
      it('creates a Consumer instance with the created ConnectionPool', done => {
        const expectedConnectionPool = 'some-connection-pool';
        whenLoose(ConnectionPool.create()).thenResolve(expectedConnectionPool);
        RabbitHole.create()
          .then(() => {
            td.verify(Consumer.create(expectedConnectionPool));
          })
          .then(() => done())
          .catch(done);
      });

      it('creates a Publisher instance with the created ConnectionPool', done => {
        const expectedConnectionPool = 'some-connection-pool';
        whenLoose(ConnectionPool.create()).thenResolve(expectedConnectionPool);
        RabbitHole.create()
          .then(() => {
            td.verify(Publisher.create(expectedConnectionPool));
          })
          .then(() => done())
          .catch(done);
      });

      it('merges the Consumer factory and Publisher factory into the resolved object', done => {
        const expectedConsumerFactory = {someConsumerKey: 'some-consumer-value'};
        const expectedPublisherFactory = {somePublisherKey: 'some-publisher-value'};
        whenLoose(ConnectionPool.create()).thenResolve();
        whenLoose(Consumer.create()).thenResolve(expectedConsumerFactory);
        whenLoose(Publisher.create()).thenResolve(expectedPublisherFactory);
        RabbitHole.create()
          .then(rabbitHole => {
            expect(rabbitHole).to.include({...expectedConsumerFactory, ...expectedPublisherFactory});
          })
          .then(() => done());
      });
    });
  });

  describe('Instance Methods', () => {
    describe('.close', () => {
      it('closes both the ConnectionPool and the AMQP connection', done => {
        const expectedConnectionPool = td.object(['close']);
        whenLoose(ConnectionPool.create()).thenResolve(expectedConnectionPool);
        td.when(expectedConnectionPool.close()).thenResolve();
        RabbitHole.create()
          .then(rabbitHole => rabbitHole.close())
          .then(() => done());
      });
    });
  });
});
