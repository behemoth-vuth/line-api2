module.exports = (event) => {
  const messages = [
    {
      type: 'text',
      text: 'Chatbot has decided to leave this chat',
    },
  ];

  return Promise.resolve(messages);
};