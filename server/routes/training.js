const { Training } = require('./../models/training');

const createTraining = (req, res) => {
  const training = new Training({
    date: req.body.date,
    exercises: req.body.exercises
  });

  training.save().then((doc) => {
    res.send(doc);
  }).catch(e => res.status(400).send({error: e.message}))
};


module.exports = { createTraining };