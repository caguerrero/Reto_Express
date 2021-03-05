var express = require("express");
var router = express.Router();
const fs = require("fs");
const Joi = require("joi");

const getFileContent = (callback) => {
  fs.readFile("messages.json", (err, data) => {
    if (err) throw err;
    callback(data.toString());
  });
};

router.get("/", function (req, res, next) {
  getFileContent((data) => {
    res.send(data);
  });
});

router.get("/:ts", function (req, res, next) {
  getFileContent((data) => {
    const content = JSON.parse(data);
    let message;
    let i = 0;
    while (i < content.messages.length) {
      if (content.messages[i].ts === parseInt(req.params.ts)){
        message = content.messages[i];
      }
      i++;
    }
    if(message=== undefined){
      return res
      .status(404)
      .send("The message with the given 'ts' was not found.");
    } else{
      res.send(message);
    }
  });
});

router.post("/", function (req, res, next) {
  const { error } = validateMessage(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const message = {
    message: req.body.message,
    author: req.body.author,
    ts: req.body.ts
  };

  res.send(message);
});


function validateMessage(message) {
  const schema = Joi.object({
    message: Joi.string().min(5).required(),
    author: Joi.string().required().pattern(new RegExp('[a-zA-z] [a-zA-z]')),
    ts: Joi.required()
  });
  return schema.validate(album);
}

module.exports = router;
