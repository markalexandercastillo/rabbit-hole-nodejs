const amqp = require('amqplib');

const ChannelPool = require('./channelPool');

const create =
  options =>
    amqp.connect(options)
      .then(amqpConnection => [
        amqpConnection,
        ChannelPool.create(amqpConnection),
      ])
      .then(([amqpConnection, channelPool]) => ({
        close: () =>
          channelPool.close()
            .then(() => amqpConnection.close()),
        getChannel: options =>
          channelPool.get(options)
      }));

module.exports = {
  create
};
