const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Training } = require('./../../models/training');
const { User } = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [{
  _id: userOneId,
  email: 'user1@example.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userOneId, access: 'auth' }, process.env.JWT_SECRET).toString(),
  }],
}, {
  _id: userTwoId,
  email: 'user2@example.com',
  password: 'userTwoPass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({ _id: userTwoId, access: 'auth' }, process.env.JWT_SECRET).toString(),
  }],
}];

const trainings = [{
  _id: new ObjectID(),
  date: 1234,
  creator: userOneId,
  exercises: [
    {
      _id: new ObjectID(),
      name: 'Exercise 1',
      order: 1,
      series: [{
        _id: new ObjectID(),
        order: 1,
        load: 15,
        repetition: 10,
      }],
    },
  ],
},
{
  _id: new ObjectID(),
  date: 12345,
  creator: userTwoId,
}];

const populateTrainings = (done) => {
  Training.remove({}).then(() => Training.insertMany(trainings)).then(() => done());
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    const userOne = new User(users[0]).save();
    const userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo]);
  }).then(() => done());
};

module.exports = { trainings, populateTrainings, users, populateUsers };
