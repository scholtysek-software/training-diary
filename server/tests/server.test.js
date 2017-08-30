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
  },
];

beforeEach((done) => {
  Training.remove({})
    .then(() => Training.insertMany(trainingFixtures))
    .then(() => done());
});

describe('POST /api/trainings', () => {
  it('should create a new training', (done) => {
    const date = new Date().getTime();

    request(app)
      .post('/api/trainings')
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
      .post('/api/trainings')
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

describe('POST /api/trainings/:id/exercises', () => {
  it('should create a new exercise', (done) => {
    const trainingId = trainingFixtures[0]._id.toHexString();
    const name = 'Exercise 1';
    const order = 1;

    request(app)
      .post(`/api/trainings/${trainingId}/exercises`)
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
            expect(trainings[0].exercises[0].series.length).toEqual(1);
            done();
          })
          .catch(e => done(e));
      });
  });

  it('should not add exercise when faulty training ID is provided', (done) => {
    request(app)
      .post('/api/trainings/random-string/exercises')
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

  it('should not add exercise with invalid body data', (done) => {
    const trainingId = trainingFixtures[1]._id.toHexString();

    request(app)
      .post(`/api/trainings/${trainingId}/exercises`)
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
      .post(`/api/trainings/${new ObjectID().toHexString()}/exercises`)
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

describe('POST /api/trainings/:id/exercises/:id/series', () => {
  it('should create a new series', (done) => {
    const trainingId = trainingFixtures[0]._id.toHexString();
    const exerciseId = trainingFixtures[0].exercises[0]._id.toHexString();
    const load = 30;
    const repetition = 3;
    const order = 1;

    request(app)
      .post(`/api/trainings/${trainingId}/exercises/${exerciseId}/series`)
      .send({ load, order, repetition })
      .expect(200)
      .expect((res) => {
        expect(res.body.exercises[0].series[1].load).toBe(load);
        expect(res.body.exercises[0].series[1].order).toBe(order);
        expect(res.body.exercises[0].series[1].repetition).toBe(repetition);
      })
      .end((err) => {
        if (err) {
          done(err);
          return;
        }

        Training.find({ _id: trainingId })
          .then((trainings) => {
            expect(trainings.length).toBe(1);
            expect(trainings[0].exercises[0].series[1].load).toBe(load);
            expect(trainings[0].exercises[0].series[1].order).toBe(order);
            expect(trainings[0].exercises[0].series[1].repetition).toBe(repetition);
            done();
          })
          .catch(e => done(e));
      });
  });

  it('should not add series with invalid body data', (done) => {
    const trainingId = trainingFixtures[0]._id.toHexString();
    const exerciseId = trainingFixtures[0].exercises[0]._id.toHexString();

    request(app)
      .post(`/api/trainings/${trainingId}/exercises/${exerciseId}/series`)
      .send({})
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toBe('Training validation failed: exercises.0.series.1.load: Path `load` is required., exercises.0.series.1.repetition: Path `repetition` is required., exercises.0.series.1.order: Path `order` is required.');
      })
      .end((err) => {
        if (err) {
          done(err);
          return;
        }

        Training.find({ _id: trainingId })
          .then((trainings) => {
            expect(trainings[0].exercises[0].series.length).toBe(1);
            done();
          })
          .catch(e => done(e));
      });
  });

  it('should not add series when invalid training ID is provided', (done) => {
    const exerciseId = trainingFixtures[0].exercises[0]._id.toHexString();

    request(app)
      .post(`/api/trainings/${new ObjectID().toHexString()}/exercises/${exerciseId}/series`)
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
      .post(`/api/trainings/${trainingId}/exercises/${new ObjectID().toHexString()}/series`)
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

  it('should not add series when faulty exercise ID is provided', (done) => {
    const trainingId = trainingFixtures[0]._id.toHexString();

    request(app)
      .post(`/api/trainings/${trainingId}/exercises/random-string/series`)
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

describe('GET /api/trainings', () => {
  it('should get all trainings', (done) => {
    request(app)
      .get('/api/trainings')
      .expect(200)
      .expect((res) => {
        expect(res.body.trainings.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /api/trainings/:trainingId', () => {
  it('should return training', (done) => {
    request(app)
      .get(`/api/trainings/${trainingFixtures[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.training.date).toBe(trainingFixtures[0].date);
      })
      .end(done);
  });

  it('should return 404 if training not found', (done) => {
    request(app)
      .get(`/api/trainings/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for faulty ObjectId', (done) => {
    request(app)
      .get('/api/trainings/random-string')
      .expect(404)
      .end(done);
  });
});

describe('DELETE /api/trainings/:trainingId', () => {
  it('should remove a training', (done) => {
    const trainingId = trainingFixtures[1]._id.toHexString();

    request(app)
      .delete(`/api/trainings/${trainingId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.training._id).toBe(trainingId);
      })
      .end((err) => {
        if (err) {
          done(err);
          return;
        }

        Training.findById(trainingId)
          .then((training) => {
            expect(training).toNotExist();
            done();
          }).catch(e => done(e));
      });
  });

  it('should return 404 if training not found', (done) => {
    request(app)
      .delete(`/api/trainings/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    request(app)
      .delete('/api/trainings/random-string')
      .expect(404)
      .end(done);
  });
});

describe('DELETE /api/trainings/:trainingId/exercise/:exerciseId', () => {
  it('should remove an exercise', (done) => {
    const trainingId = trainingFixtures[0]._id.toHexString();
    const exerciseId = trainingFixtures[0].exercises[0]._id.toHexString();

    request(app)
      .delete(`/api/trainings/${trainingId}/exercises/${exerciseId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.training._id).toBe(trainingId);
      })
      .end((err) => {
        if (err) {
          done(err);
          return;
        }

        Training.findById(trainingId)
          .then((training) => {
            expect(training.exercises.length).toEqual(0);
            done();
          }).catch(e => done(e));
      });
  });

  it('should return 404 if exercise not found', (done) => {
    const trainingId = trainingFixtures[0]._id.toHexString();

    request(app)
      .delete(`/api/trainings/${trainingId}/exercises/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    const trainingId = trainingFixtures[0]._id.toHexString();

    request(app)
      .delete(`/api/trainings/${trainingId}/exercises/random-string`)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /api/trainings/:trainingId/exercise/:exerciseId/series/:seriesId', () => {
  it('should remove series', (done) => {
    const trainingId = trainingFixtures[0]._id.toHexString();
    const exerciseId = trainingFixtures[0].exercises[0]._id.toHexString();
    const seriesId = trainingFixtures[0].exercises[0].series[0]._id.toHexString();

    request(app)
      .delete(`/api/trainings/${trainingId}/exercises/${exerciseId}/series/${seriesId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.training._id).toBe(trainingId);
      })
      .end((err) => {
        if (err) {
          done(err);
          return;
        }

        Training.findById(trainingId)
          .then((training) => {
            expect(training.exercises[0].series.length).toEqual(0);
            done();
          }).catch(e => done(e));
      });
  });

  it('should return 404 if series not found', (done) => {
    const trainingId = trainingFixtures[0]._id.toHexString();
    const exerciseId = trainingFixtures[0].exercises[0]._id.toHexString();

    request(app)
      .delete(`/api/trainings/${trainingId}/exercises/${exerciseId}/series/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    const trainingId = trainingFixtures[0]._id.toHexString();
    const exerciseId = trainingFixtures[0].exercises[0]._id.toHexString();

    request(app)
      .delete(`/api/trainings/${trainingId}/exercises/${exerciseId}/series/random-string`)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /api/trainings/:trainingId', () => {
  it('should update a training', (done) => {
    const trainingId = trainingFixtures[0]._id.toHexString();
    const date = 123123123;

    request(app)
      .patch(`/api/trainings/${trainingId}`)
      .send({ date })
      .expect(200)
      .expect((res) => {
        expect(res.body.training.date).toBe(date);
      })
      .end(done);
  });

  it('should return 404 when training not found', (done) => {
    request(app)
      .patch(`/api/trainings/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 when invalid object id is provided', (done) => {
    request(app)
      .patch('/api/trainings/random-string')
      .expect(404)
      .end(done);
  });
});

describe('PATCH /api/trainings/:trainingId/exercise/:exerciseId', () => {
  it('should update an exercise', (done) => {
    const trainingId = trainingFixtures[0]._id.toHexString();
    const exerciseId = trainingFixtures[0].exercises[0]._id.toHexString();
    const name = 'Exercise 123';

    request(app)
      .patch(`/api/trainings/${trainingId}/exercises/${exerciseId}`)
      .send({ name })
      .expect(200)
      .expect((res) => {
        expect(res.body.training.exercises[0].name).toBe(name);
      })
      .end(done);
  });

  it('should return 404 when exercise not found', (done) => {
    const trainingId = trainingFixtures[0]._id.toHexString();

    request(app)
      .patch(`/api/trainings/${trainingId}/exercises/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 when invalid object id is provided', (done) => {
    const trainingId = trainingFixtures[0]._id.toHexString();

    request(app)
      .patch(`/api/trainings/${trainingId}/exercises/random-string`)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /api/trainings/:trainingId/exercise/:exerciseId/series/:seriesId', () => {
  it('should update series', (done) => {
    const trainingId = trainingFixtures[0]._id.toHexString();
    const exerciseId = trainingFixtures[0].exercises[0]._id.toHexString();
    const seriesId = trainingFixtures[0].exercises[0].series[0]._id.toHexString();
    const load = 1500;

    request(app)
      .patch(`/api/trainings/${trainingId}/exercises/${exerciseId}/series/${seriesId}`)
      .send({ load })
      .expect(200)
      .expect((res) => {
        expect(res.body.training.exercises[0].series[0].load).toBe(load);
      })
      .end(done);
  });

  it('should return 404 when series not found', (done) => {
    const trainingId = trainingFixtures[0]._id.toHexString();
    const exerciseId = trainingFixtures[0].exercises[0]._id.toHexString();

    request(app)
      .patch(`/api/trainings/${trainingId}/exercises/${exerciseId}/series/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 when invalid object id is provided', (done) => {
    const trainingId = trainingFixtures[0]._id.toHexString();
    const exerciseId = trainingFixtures[0].exercises[0]._id.toHexString();

    request(app)
      .patch(`/api/trainings/${trainingId}/exercises/${exerciseId}/series/random-string`)
      .expect(404)
      .end(done);
  });
});
