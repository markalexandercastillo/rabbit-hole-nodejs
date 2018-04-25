const td = require('testdouble');

const whenLoose = testDouble => td.when(testDouble, {ignoreExtraArgs: true});

describe.only('Connection', () => {
  let Connection, amqp, ChannelPool;
  beforeEach(() => {
    amqp = td.replace('amqplib');
    ChannelPool = td.replace('./channelPool');
    Connection = require('./connection');
  });

  afterEach(() => {
    td.reset();
  });

  describe('.create', () => {
    it('creates an AMQP connection with the given options', done => {
      const expectedOptions = 'AMQP Connection options';
      td.when(amqp.connect(expectedOptions)).thenResolve();
      Connection.create(expectedOptions).then(() => done());
    });

    it('creates a ChannelPool with the created connection', () => {
      const expectedConnection = 'A Connection';
      whenLoose(amqp.connect()).thenResolve(expectedConnection);
      Connection.create({}).then(() => {
        td.verify(ChannelPool.create(expectedConnection));
      });
    });
  });

  describe('Instance Methods', () => {
    let amqpConnection, channelPool, connection;
    beforeEach(async () => {
      amqpConnection = td.object(['close']);
      channelPool = td.object(['close', 'get']);
      whenLoose(amqp.connect()).thenResolve(amqpConnection);
      whenLoose(ChannelPool.create()).thenReturn(channelPool);
      connection = await Connection.create({});
    });

    describe('.getChannel', () => {
      it('respects the given options', done => {
        const expectedChannelOptions = 'Channel Options';
        td.when(channelPool.get(expectedChannelOptions)).thenResolve();
        connection.getChannel(expectedChannelOptions).then(() => done());
      });
    });

    describe('.close', () => {
      it('closes the ChannelPool after closing the AMQP connection', () => {
        td.when(channelPool.close()).thenResolve();
        connection.close()
          .then(() => td.verify(amqpConnection.close()));
      });
    });
  });
});
