/* eslint-disable consistent-return */
const _ = require('lodash');
const { User } = require('./../models/user');

const createUser = (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);
  const user = new User(body);

  user.save()
    .then(() => user.generateAuthToken())
    .then((token) => {
      res.header('x-auth', token).send(user);
    }).catch((e) => {
      res.status(400).send({ error: e.message });
    });
};

const getUser = (req, res) => {
  res.send(req.user);
};

const login = (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password)
    .then(user => user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    })).catch(() => {
      res.status(400).send();
    });
};

const deleteToken = (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
};

module.exports = {
  createUser,
  getUser,
  login,
  deleteToken,
};
