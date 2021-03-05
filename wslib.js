const WebSocket = require("ws");
const fs = require("fs");

const clients = [];
const messages = [];
const timestps = [];

let object = {
  messages: []
};
let longAnterior = 0;
function persistirJSON(init) {
  longAnterior = messages.length;
  while (init < longAnterior) {
    object.messages.push({ message: messages[init], author: "Generado Chat", ts: timestps[init] });
    init++;
  }
  let myJSON = JSON.stringify(object);
  return myJSON;
}

const getMessages = () => {
  return messages;
};

const getTimes = () => {
  return timestps;
};

const wsConnection = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    clients.push(ws);
    sendMessages();

    ws.on("message", (message) => {
      messages.push(message);
      let ts = Math.floor(Date.now() / 1000);
      timestps.push(ts);
      sendMessages();
    });
  });

  const sendMessages = () => {
    clients.forEach((client) => client.send(JSON.stringify(messages)));
    let longActual = messages.length;
    if (longActual !== longAnterior && longAnterior === 0) {
      fs.writeFile("messages.json", persistirJSON(0), (err) => {
        if (err) throw err;
      });
    } else {
      fs.writeFile("messages.json", persistirJSON(longAnterior), (err) => {
        if (err) throw err;
      });
    }
  };
};
module.exports = {
  wsConnection
};
