const WebSocket = require("ws");
const fs = require("fs");

const clients = [];
const messages = [];
const timestps = [];
const authors = [];

let object_messages = {
  messages: []
};
let longAnterior = 0;
function persistirJSON(init) {
  longAnterior = messages.length;
  while (init < longAnterior) {
    object_messages.messages.push({ message: messages[init], author: authors[init], ts: timestps[init] });
    init++;
  }
  let myJSON = JSON.stringify(object_messages);
  return myJSON;
}

function persistencia(mSon) {
  console.log(mSon);
  if (typeof (mSon) === 'string') {
    if (mSon.startsWith("Deleted-")) {
      let array = mSon.split("-");
      let index = array[2];
      messages.splice(index, 1);
      timestps.splice(index, 1);
      authors.splice(index, 1);
    } else{
      messages.push(mSon);
      timestps.push(Math.floor(Date.now() / 1000));
      authors.push("Generated via chat");
    }
  } else if (typeof (mSon) === 'object') {
    let exists = timestps.find((item) => item === parseInt(mSon.ts));
    if (!exists) {
      messages.push(mSon.message);
      timestps.push(mSon.ts);
      authors.push(mSon.author);
    } else if (exists) {
      let index = timestps.indexOf(exists);
      if (index != -1) {
        messages[index] = mSon.message;
        timestps[index] = mSon.ts;
        authors[index] = mSon.author;
      }
    }
  }
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
}

const getMessages = () => {
  return object_messages.messages;
};

const wsConnection = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    clients.push(ws);
    sendMessages();

    ws.on("message", (messagesString) => {
      let mSon;
      if (messagesString.startsWith('{')) {
        mSon = JSON.parse(messagesString);
      } else {
        mSon = messagesString;
      }
      persistencia(mSon);
      sendMessages();
    });
  });

  const sendMessages = () => {
    clients.forEach((client) => client.send(JSON.stringify(messages)));
    let int = 0;
    while (int < messages.length) {
      console.log(messages[int]);
      int++;
    }
  };
};
module.exports = {
  wsConnection,
  getMessages
};
