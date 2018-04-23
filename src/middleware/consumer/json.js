const CONTENT_TYPES = require('./../../contentTypes');

module.exports =
  /**
   *
   */
  message => {
    if (
      !message.properties.hasOwnProperty('contentType')
      || message.properties.contentType !== CONTENT_TYPES.JSON
    ) {
      throw new Error(`JSON-encoded messages are expected to have the content_type property set to '${CONTENT_TYPES.JSON}'`);
    }

    return {
      json: JSON.parse(message.content.toString()),
      ...message,
    };
  };
