const Publisher = require('./publisher')
  , Consumer = require('./consumer')
  , ConnectionPool = require('./connectionPool')
  , Middleware = require('./middleware')
  , CONTENT_TYPES = require('./contentTypes');

/**
 * See http://www.squaremobius.net/amqp.node/channel_api.html#connect
 * @param {object} options
 * @param {string} options.protocol
 * @param {string} options.hostname
 * @param {number} options.port
 * @param {string} options.username
 * @param {string} options.password
 * @param {string} options.locale
 * @param {number} options.frameMax
 * @param {number} options.heartbeat
 * @param {string} options.vhost
 */
const create =
  ({
    protocol = 'amqp',
    hostname = 'localhost',
    port = 5672,
    username = 'guest',
    password = 'guest',
    locale = 'en_US',
    frameMax = 0,
    heartbeat = 0,
    vhost = '/',
  } = {}) =>
    ConnectionPool.create({
      protocol,
      hostname,
      port,
      username,
      password,
      locale,
      frameMax,
      heartbeat,
      vhost,
    })
      .then(
        connectionPool => Promise.all([
          connectionPool,
          Consumer.create(connectionPool),
          Publisher.create(connectionPool),
        ]),
      )
      .then(
        ([connectionPool, consumerFactory, publisherFactory]) =>
          ({
            ...consumerFactory,
            ...publisherFactory,
            /**
             * Closes channels and the connection
             */
            close: () =>
              connectionPool.close(),
          })
      );

module.exports = {
  create,
  Middleware,
  CONTENT_TYPES,
};
