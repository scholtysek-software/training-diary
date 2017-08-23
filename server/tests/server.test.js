const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Training } = require('./../models/training');

const trainingFixtures = [
  {
    _id: new ObjectID(),
    date: 1234,
    exercises: [
      {
        _id: new ObjectID(),
        name: 'Exercise 1',
        order: 1,
      },
    ],
  },
  {
    _id: new ObjectID(),
    date: 12345,
  },
];

beforeEach((done) => {
  Training.remove({})
    .then(() => Training.insertMany(trainingFixtures))
    .then(() => done());
});

describe('POST /trainings', () => {
  it('should create a new training', (done) => {
    const date = new Date().getTime();

    request(app)
      .post('/trainings')
      .send({ date })
      .expect(200)
      .expect((res) => {
        expect(res.body.date).toBe(date);
      })
      .end((err) => {
        if (err) {
          done(err);
          return;
        }

        Training.find({ date })
          .then((trainings) => {
            expect(trainings.length).toBe(1);
            expect(trainings[0].date).toBe(date);
            expect(trainings[0].exercises).toEqual([]);
            done();
          })
          .catch(e => done(e));
      });
  });

  it('should not create training with invalid body data', (done) => {
    request(app)
      .post('/trainings')
      .send({})
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toBe('Training validation failed: date: Path `date` is required.');
      })
      .end((err) => {
        if (err) {
          done(err);
          return;
        }

        Training.find()
          .then((trainings) => {
            expect(trainings.length).toBe(2);
            done();
          })
          .catch(e => done(e));
      });
  });
});

describe('POST /trainings/:id/exercises', () => {
  it('should create a new exercise', (done) => {
    const trainingId = trainingFixtures[0]._id.toHexString();
    const name = 'Exercise 1';
    const order = 1;

    request(app)
      .post(`/trainings/${trainingId}/exercises`)
      .send({ name, order })
      .expect(200)
      .expect((res) => {
        expect(res.body.exercises[0].name).toBe(name);
        expect(res.body.exercises[0].order).toBe(order);
      })
      .end((err) => {
        if (err) {
          done(err);
          return;
        }

        Training.find({ _id: trainingId })
          .then((trainings) => {
            expect(trainings.length).toBe(1);
            expect(trainings[0].exercises[0].name).toBe(name);
            expect(trainings[0].exercises[0].series).toEqual([]);
            done();
          })
          .catch(e => done(e));
      });
  });

  it('should not add exercise with invalid body data', (done) => {
    const trainingId = trainingFixtures[1]._id.toHexString();

    request(app)
      .post(`/trainings/${trainingId}/exercises`)
      .send({})
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toBe('Training validation failed: exercises.0.order: Path `order` is required., exercises.0.name: Path `name` is required.');
      })
      .end((err) => {
        if (err) {
          done(err);
          return;
        }

        Training.find({ _id: trainingId })
          .then((trainings) => {
            expect(trainings[0].exercises.length).toBe(0);
            done();
          })
          .catch(e => done(e));
      });
  });

  it('should not add exercise when invalid training ID is provided', (done) => {
    request(app)
      .post(`/trainings/${new ObjectID().toHexString()}/exercises`)
      .send({})
      .expect(404)
      .end((err) => {
        if (err) {
          done(err);
          return;
        }

        done();
      });

  });
});

describe('POST /trainings/:id/exercises/:id/series', () => {
  it('should create a new series', (done) => {
    const trainingId = trainingFixtures[0]._id.toHexString();
    const exerciseId = trainingFixtures[0].exercises[0]._id.toHexString();
    const load = 30;
    const repetition = 3;
    const order = 1;

    request(app)
      .post(`/trainings/${trainingId}/exercises/${exerciseId}/series`)
      .send({ load, order, repetition })
      .expect(200)
      .expect((res) => {
        expect(res.body.exercises[0].series[0].load).toBe(load);
        expect(res.body.exercises[0].series[0].order).toBe(order);
        expect(res.body.exercises[0].series[0].repetition).toBe(repetition);
      })
      .end((err) => {
        if (err) {
          done(err);
          return;
        }

        Training.find({ _id: trainingId })
          .then((trainings) => {
            expect(trainings.length).toBe(1);
            expect(trainings[0].exercises[0].series[0].load).toBe(load);
            expect(trainings[0].exercises[0].series[0].order).toBe(order);
            expect(trainings[0].exercises[0].series[0].repetition).toBe(repetition);
            done();
          })
          .catch(e => done(e));
      });
  });

  it('should not add series with invalid body data', (done) => {
    const trainingId = trainingFixtures[0]._id.toHexString();
    const exerciseId = trainingFixtures[0].exercises[0]._id.toHexString();

    request(app)
      .post(`/trainings/${trainingId}/exercises/${exerciseId}/series`)
      .send({})
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toBe('Training validation failed: exercises.0.series.0.load: Path `load` is required., exercises.0.series.0.repetition: Path `repetition` is required., exercises.0.series.0.order: Path `order` is required.');
      })
      .end((err) => {
        if (err) {
          done(err);
          return;
        }

        Training.find({ _id: trainingId })
          .then((trainings) => {
            expect(trainings[0].exercises[0].series.length).toBe(0);
            done();
          })
          .catch(e => done(e));
      });
  });

  it('should not add series when invalid training ID is provided', (done) => {
    const exerciseId = trainingFixtures[0].exercises[0]._id.toHexString();

    request(app)
      .post(`/trainings/${new ObjectID().toHexString()}/exercises/${exerciseId}/series`)
      .send({})
      .expect(404)
      .end((err) => {
        if (err) {
          done(err);
          return;
        }

        done();
      });

  });

  it('should not add series when invalid exercise ID is provided', (done) => {
    const trainingId = trainingFixtures[0]._id.toHexString();

    request(app)
      .post(`/trainings/${trainingId}/exercises/${new ObjectID().toHexString()}/series`)
      .send({})
      .expect(404)
      .end((err) => {
        if (err) {
          done(err);
          return;
        }

        done();
      });

  });
});
