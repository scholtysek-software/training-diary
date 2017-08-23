/* eslint-disable consistent-return */
const { Training } = require('./../models/training');
const { ObjectID } = require('mongodb');

const createTraining = (req, res) => {
  const training = new Training({
    date: req.body.date,
  });

  training.save().then((doc) => {
    res.send(doc);
  }).catch(e => res.status(400).send({ error: e.message }));
};

const createExercise = (req, res) => {
  const trainingId = req.params.trainingId;

  if (!ObjectID.isValid(trainingId)) {
    return res.status(404).send();
  }

  Training.findById(trainingId).then((training) => {
    if (!training) {
      return res.status(404).send();
    }

    training.exercises.push({
      name: req.body.name,
      order: req.body.order,
    });
    training.save()
      .then(doc => res.send(doc))
      .catch(e => res.status(400).send({ error: e.message }));
  }).catch((e) => {
    res.status(400).send({ error: e.message });
  });
};

const createSeries = (req, res) => {
  const { trainingId, exerciseId } = req.params;

  if (!ObjectID.isValid(trainingId) || !ObjectID.isValid(exerciseId)) {
    return res.status(404).send();
  }

  Training.findById(trainingId)
    .then((training) => {
      if (!training) {
        return res.status(404).send();
      }

      const exercises = training.exercises.filter(ex => ex._id.toHexString() === exerciseId);
      if (!exercises.length) {
        return res.status(404).send();
      }

      exercises[0].series.push({
        order: req.body.order,
        repetition: req.body.repetition,
        load: req.body.load,
      });

      training.save()
        .then(doc => res.send(doc))
        .catch(e => res.status(400).send({ error: e.message }));
    });
};

const listTrainings = (req, res) => {
  Training.find()
    .then((trainings) => {
      res.send({ trainings });
    })
    .catch(e => res.status(400).send({ error: e.message }));
};

const getTraining = (req, res) => {
  const trainingId = req.params.trainingId;

  if (!ObjectID.isValid(trainingId)) {
    res.status(404).send();
  }

  Training.findById(trainingId)
    .then((training) => {
      if (!training) {
        return res.status(400).send();
      }

      res.send({ training });
    })
    .catch(e => res.status(400).send({ error: e.message }));
};

const deleteTraining = (req, res) => {
  const trainingId = req.params.trainingId;

  if (!ObjectID.isValid(trainingId)) {
    return res.status(404).send();
  }

  Training.findByIdAndRemove(trainingId)
    .then((training) => {
      if (!training) {
        return res.status(404).send();
      }

      res.send({ training });
    }).catch((e) => {
      res.status(400).send({ error: e.message });
    });
};

module.exports = {
  createTraining,
  createExercise,
  createSeries,
  listTrainings,
  getTraining,
  deleteTraining,
};
