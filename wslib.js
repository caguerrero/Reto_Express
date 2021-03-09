const WebSocket = require("ws");
const Message = require("./models/messages");
const Joi = require("joi");

const clients = [];
const messages = [];
const times = [];

function colocar(message) {
  if (!times.find(ele => ele === message.ts)) {
    messages.push(message.message);
    times.push(message.ts);
  } else {
    let index = times.indexOf(message.ts);
    messages[index] = message.message;
  }
}

function eliminar(message) {
  let index = times.indexOf(parseInt(message));
  messages.splice(index, 1);
  times.splice(index, 1);
}

function validateMessage(message) {
  const schema = Joi.object({
    message: Joi.string().min(5).required(),
    author: Joi.string().required().pattern(new RegExp('[a-zA-z] [a-zA-z]')),
    ts: Joi.number().integer().required()
  });
  return schema.validate(message);
}


const wsConnection = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    clients.push(ws);
    sendMessages();
    ws.on("message", (message) => {
      Message.findByPk(message).then((result) => {
        if (result === null && !Number.isInteger(parseInt(message))) {
          let author = "Generated via chat";
          let ts = Math.floor(Date.now() / 1000);
          let messageO = {
            message: message,
            author: author,
            ts: ts
          }
          const { error } = validateMessage(messageO);
          console.log("OKJO" + typeof error);
          if (error) {
            console.log("ENTRA");
            console.log(error.details[0].message);
          } else {
            Message.create({ message, author, ts }).then((res) => {
              colocar(res);
              sendMessages();
            });
          }
        } else if (result === null && Number.isInteger(parseInt(message))) {
          eliminar(message);
          sendMessages();
        } else if (result !== null) {
          colocar(result);
          sendMessages();
        }
      });
    });
  });

  const sendMessages = () => {
    clients.forEach((client) => client.send(JSON.stringify(messages)));
  };
};
module.exports = {
  wsConnection
};