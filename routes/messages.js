var express = require("express");
var router = express.Router();
const Joi = require("joi");
const WebSocket = require("ws");
const ws = new WebSocket("ws://localhost:3000");
const Message = require("../models/messages");

router.get("/", function (req, res, next) {
  Message.findAll().then((result) => {
    let i = 0;
    while (i < result.length) {
      ws.send(parseInt(JSON.stringify(result[i].dataValues.ts)));
      i++;
    }
    res.send(result);
  })
});

router.get("/:ts", function (req, res, next) {
  Message.findByPk(req.params.ts).then((result) => {
    if (result === null) {
      return res
        .status(404)
        .send(`The message with the 'ts':${req.params.ts}, was not found.`);
    }
    res.send(result);
  });
});

router.post("/", function (req, res, next) {
  const { error } = validateMessage(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const { message, author, ts } = req.body;
  Message.create({ message, author, ts }).then((result) => {
    ws.send(parseInt(ts));
    res.send(result);
  });
});

router.put("/:ts", function (req, res, next) {
  const { error } = validateMessage(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  Message.update(req.body, { where: { ts: req.params.ts } }).then((result) => {
    if (result[0] === 0) {
      return res.status(404).send(`The message with 'ts':${req.params.ts}, was not found.`);
    }
    ws.send(parseInt(JSON.stringify(req.body.ts)));
    res.status(200).send("Message updated");
  });
});

router.delete("/:ts", (req, res, next) => {
  Message.destroy({ where: { ts: req.params.ts } }).then((result) => {
    if (result === 0) {return res.status(404).send(`The message with 'ts':${req.params.ts}, was not found.`)};
    ws.send(parseInt(req.params.ts));
    res.status(204).send();
  });
});

function validateMessage(message) {
  const schema = Joi.object({
    message: Joi.string().min(5).required(),
    author: Joi.string().required().pattern(new RegExp('[a-zA-z] [a-zA-z]')),
    ts: Joi.number().integer().required()
  });
  return schema.validate(message);
}

module.exports = router;