const td = require('testdouble')
  , chaiAsPromised = require('chai-as-promised')
  , chai = require('chai');

chai.use(chaiAsPromised);

const expect = chai.expect;

const whenLoose = testDouble => td.when(testDouble, {ignoreExtraArgs: true});

describe('ConnectionPool', () => {
  let Connection, ConnectionPool;
  beforeEach(() => {
    Connection = td.replace('./connection');
    ConnectionPool = require('./connectionPool');
  });

  describe.only('Instance methods', () => {
    describe('.getForConsumer', () => {
      it('respects the options the ConnectionPool was created with', done => {
        const expectedOptions = 'AMQP connection options';
        const expectedConnection = td.object('A Connection');
        td.when(Connection.create(expectedOptions)).thenResolve(expectedConnection);
        ConnectionPool.create(expectedOptions)
          .then(connectionPool => connectionPool.getForConsumer())
          .then(connection => expect(connection).to.deep.equal(expectedConnection))
          .then(() => done());
      });

      it('caches', () => {
        const expectedConnection = td.object('A Connection');
        whenLoose(Connection.create()).thenResolve(expectedConnection);

        ConnectionPool.create({})
          .then(connectionPool => connectionPool.getForConsumer()
            .then(firstConnection => Promise.all([firstConnection, connectionPool.getForConsumer()]))
            .then(([firstConnection, secondConnection]) => expect(secondConnection).to.deep.equal(firstConnection))
          );
      });
    });

    describe('.getForPublisher', () => {
      it('respects the options the ConnectionPool was created with', done => {
        const expectedOptions = 'AMQP connection options';
        const expectedConnection = td.object('A Connection');
        td.when(Connection.create(expectedOptions)).thenResolve(expectedConnection);
        ConnectionPool.create(expectedOptions)
          .then(connectionPool => connectionPool.getForPublisher())
          .then(connection => expect(connection).to.deep.equal(expectedConnection))
          .then(() => done());
      });

      it('caches', () => {
        const expectedConnection = td.object('A Connection');
        whenLoose(Connection.create()).thenResolve(expectedConnection);

        ConnectionPool.create({})
          .then(connectionPool => connectionPool.getForPublisher()
            .then(firstConnection => Promise.all([firstConnection, connectionPool.getForPublisher()]))
            .then(([firstConnection, secondConnection]) => expect(secondConnection).to.deep.equal(firstConnection))
          );
      });
    });

    describe('.close', () => {
      it('closes all the connections returned by get', done => {
        const consumerConnection = td.object(['close']);
        const publisherConnection = td.object(['close']);
        whenLoose(Connection.create()).thenResolve(consumerConnection, publisherConnection);
        td.when(consumerConnection.close()).thenResolve();
        td.when(publisherConnection.close()).thenResolve();
        ConnectionPool.create({})
          .then(connectionPool =>
            connectionPool.getForPublisher()
              .then(() => connectionPool.getForPublisher())
              .then(() => connectionPool.close())
          )
          .then(() => done());
      });
    });
  });
});

