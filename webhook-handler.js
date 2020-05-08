const Bluebird = require('bluebird');
const crypto = require('crypto');
const request = require('request-promise');

const followEventProcessor = require('./event-processors/follow');
const invalidEventProcessor = require('./event-processors/invalid');
const joinEventProcessor = require('./event-processors/join');
const leaveEventProcessor = require('./event-processors/leave');
const messageEventProcessor = require('./event-processors/message');
const unfollowEventProcessor = require('./event-processors/unfollow');

const MAX_CONCURRENCY = 5;

const REPLY = {
  URL: 'https://api.line.me/v2/bot/message/reply',
  TIMEOUT: 60000,
};

const config = {
  channelAccessToken: 'I1C99yaC4mqGqwbqtA4g5GnAgH4KpnEi/dh+X07JFsqpnY9OrNrAZm0Bkkrfa8ddcbj5T+Gvve4HhePrVnJ5Ia/zUPsGgmBvSaX1n15MVpZJPFsni4c076FnADbHCJjAEBAEG3yqUtt+LYQpKFoVFAdB04t89/1O/w1cDnyilFU=',
  channelSecret: '272e0dcfb4f2f409a292234f63bdbaa8'
}

const processEventByType = (event) => {
  switch (event.type) {
    case 'follow':
      return followEventProcessor(event);

    case 'join':
      console.log("joined")
      return joinEventProcessor(event);

    case 'leave':
      return leaveEventProcessor(event);

    case 'message':
      return messageEventProcessor(event);

    case 'unfollow':
      return unfollowEventProcessor(event);

    default:
      return invalidEventProcessor();
  }
};

const processEvent = event => processEventByType(event)
  .catch((err) => {
    console.error(err);

    // In case something error on our side,
    // we should tell the user that we're unable to process the request
    const messages = [{
      type: 'text',
      text: 'Something error',
    }];

    return messages;
  })
  .then((messages) => {
    // Some events don't have replyToken
    if (!event.replyToken) {
      return Bluebird.resolve();
    }

    const requestBody = {
      replyToken: event.replyToken,
      messages,
    };

    const requestOptions = {
      uri: REPLY.URL,
      method: 'POST',
      timeout: REPLY.TIMEOUT,
      headers: {
        Authorization: `Bearer ${config.channelAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      resolveWithFullResponse: true,
    };

    return request(requestOptions)
      .then((response) => {
        if (response.statusCode === 200) {
          console.log('Reply sent successfully');
        } else {
          console.log(`Error sending reply to LINE server with status ${response.statusCode}:\n ${response.body}`);
        }
      });
  })
  .catch((err) => {
    // Error sending HTTP request
    console.error(err);
  });

const processWebhookEvents = events => Bluebird.map(events, event => processEvent(event), { concurrency: MAX_CONCURRENCY });

module.exports = (req, res) => {
  try {
    const text = JSON.stringify(req.body);
    const signature = crypto.createHmac('SHA256', config.channelSecret).update(text).digest('base64').toString();

    console.log(signature);

    if (signature !== req.headers['x-line-signature']) {
      return res.status(401).send('Unauthorized');
    }

    return processWebhookEvents(req.body.events)
      .then(() => res.status(200).send('OK'));
  } catch (err) {
    console.error(err);

    return res.status(500).send('Error');
  }
};