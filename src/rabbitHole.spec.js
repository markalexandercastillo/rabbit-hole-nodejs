const td = require('testdouble')
  , chai = require('chai');

const whenLoose = testDouble => td.when(testDouble, {ignoreExtraArgs: true});
const expect = chai.expect;

describe('RabbitHole', () => {
  let Publisher, Consumer, ChannelPool, amqp, RabbitHole;
  beforeEach(() => {
    Publisher = td.replace('./publisher');
    Consumer = td.replace('./consumer');
    ChannelPool = td.replace('./channelPool');
    amqp = td.replace('amqplib');
    RabbitHole = require('./rabbitHole');
  });

  afterEach(() => {
    td.reset();
  });

  describe('.create', () => {
    context('AMQP connection creation', () => {
      beforeEach(() => {
        whenLoose(Consumer.create()).thenResolve();
        whenLoose(Publisher.create()).thenResolve();
        whenLoose(ChannelPool.create()).thenResolve();
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
      Object.keys(defaultOptions).forEach(optionKey => {
        const defaultValue = defaultOptions[optionKey];
        it(`defaults the '${optionKey}' value to ${JSON.stringify(defaultValue)}`, done => {
          whenLoose(amqp.connect(td.matchers.contains({ [optionKey]: defaultValue }))).thenResolve();
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
      Object.keys(userDefinedOptions).forEach(optionKey => {
        it(`respects the given '${optionKey}' value`, done => {
          const expectedValue = userDefinedOptions[optionKey];
          whenLoose(amqp.connect(td.matchers.contains({ [optionKey]: expectedValue }))).thenResolve();
          RabbitHole.create({ [optionKey]: expectedValue })
            .then(() => done());
        });
      });
    });

    context('ChannelPool creation', () => {
      it('creates a ChannelPool from the created AMQP connection', done => {
        const expectedConnection = 'some-amqp-connection';
        whenLoose(amqp.connect()).thenResolve(expectedConnection);
        RabbitHole.create()
          .then(() => {
            td.verify(ChannelPool.create(expectedConnection));
          })
          .then(() => done());
      });
    });

    context('Consumer and Publisher creation', () => {
      beforeEach(() => {
        whenLoose(amqp.connect()).thenResolve();
      });

      it('creates a Consumer instance with the created ChannelPool', done => {
        const expectedChannelPool = 'some-channel-pool';
        whenLoose(ChannelPool.create()).thenResolve(expectedChannelPool);
        RabbitHole.create()
          .then(() => {
            td.verify(Consumer.create(expectedChannelPool));
          })
          .then(() => done());
      });

      it('creates a Publisher instance with the created ChannelPool', done => {
        const expectedChannelPool = 'some-channel-pool';
        whenLoose(ChannelPool.create()).thenResolve(expectedChannelPool);
        RabbitHole.create()
          .then(() => {
            td.verify(Publisher.create(expectedChannelPool));
          })
          .then(() => done());
      });

      it('merges the Consumer factory and Publisher factory into the resolved object', done => {
        const expectedConsumerFactory = {someConsumerKey: 'some-consumer-value'};
        const expectedPublisherFactory = {somePublisherKey: 'some-publisher-value'};
        whenLoose(ChannelPool.create()).thenResolve();
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
      it('closes both the ChannelPool and the AMQP connection', done => {
        const expectedConnection = td.object(['close']);
        const expectedChannelPool = td.object(['close']);
        whenLoose(amqp.connect()).thenResolve(expectedConnection);
        whenLoose(ChannelPool.create()).thenResolve(expectedChannelPool);
        td.when(expectedChannelPool.close()).thenResolve();
        RabbitHole.create()
          .then(rabbitHole => rabbitHole.close())
          .then(() => {
            td.verify(expectedConnection.close());
          })
          .then(() => done());
      });
    });
  });
});
