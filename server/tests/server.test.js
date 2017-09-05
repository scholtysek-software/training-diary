const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Training } = require('./../models/training');
const { User } = require('./../models/user');
const { trainings, populateTrainings, users, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTrainings);

describe('POST /api/trainings', () => {
  it('should create a new training', (done) => {
    const date = new Date().getTime();

    request(app)
      .post('/api/trainings')
      .set('x-auth', users[0].tokens[0].token)
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
          .then((trainingsDocs) => {
            expect(trainingsDocs.length).toBe(1);
            expect(trainingsDocs[0].date).toBe(date);
            expect(trainingsDocs[0].exercises).toEqual([]);
            done();
          })
          .catch(e => done(e));
      });
  });

  it('should not create training with invalid body data', (done) => {
    request(app)
      .post('/api/trainings')
      .set('x-auth', users[1].tokens[0].token)
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
          .then((trainingsDocs) => {
            expect(trainingsDocs.length).toBe(2);
            done();
          })
          .catch(e => done(e));
      });
  });

  it('should restrict access to authenticated users only', (done) => {
    const date = new Date().getTime();

    request(app)
      .post('/api/trainings')
      .send({ date })
      .expect(401)
      .end(done);
  });
});

describe('POST /api/trainings/:id/exercises', () => {
  it('should create a new exercise', (done) => {
    const trainingId = trainings[0]._id.toHexString();
    const name = 'Exercise 1';
    const order = 1;

    request(app)
      .post(`/api/trainings/${trainingId}/exercises`)
      .set('x-auth', users[0].tokens[0].token)
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
          .then((trainingsDocs) => {
            expect(trainingsDocs.length).toBe(1);
            expect(trainingsDocs[0].exercises[0].name).toBe(name);
            expect(trainingsDocs[0].exercises[0].series.length).toEqual(1);
            done();
          })
          .catch(e => done(e));
      });
  });

  it('should not add exercise when faulty training ID is provided', (done) => {
    request(app)
      .post('/api/trainings/random-string/exercises')
      .set('x-auth', users[0].tokens[0].token)
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
    const trainingId = trainings[0]._id.toHexString();

    request(app)
      .post(`/api/trainings/${trainingId}/exercises`)
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toBe('Training validation failed: exercises.1.order: Path `order` is required., exercises.1.name: Path `name` is required.');
      })
      .end((err) => {
        if (err) {
          done(err);
          return;
        }

        Training.find({ _id: trainingId })
          .then((trainingsDocs) => {
            expect(trainingsDocs[0].exercises.length).toBe(1);
            done();
          })
          .catch(e => done(e));
      });
  });

  it('should not add exercise when invalid training ID is provided', (done) => {
    request(app)
      .post(`/api/trainings/${new ObjectID().toHexString()}/exercises`)
      .set('x-auth', users[0].tokens[0].token)
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

  it('should get 404 trying to access someone else\'s training', (done) => {
    const trainingId = trainings[1]._id.toHexString();

    request(app)
      .post(`/api/trainings/${trainingId}/exercises`)
      .set('x-auth', users[0].tokens[0].token)
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

  it('should get 401 trying to access without authentication', (done) => {
    const trainingId = trainings[0]._id.toHexString();

    request(app)
      .post(`/api/trainings/${trainingId}/exercises`)
      .send({})
      .expect(401)
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
    const trainingId = trainings[0]._id.toHexString();
    const exerciseId = trainings[0].exercises[0]._id.toHexString();
    const load = 30;
    const repetition = 3;
    const order = 1;

    request(app)
      .post(`/api/trainings/${trainingId}/exercises/${exerciseId}/series`)
      .set('x-auth', users[0].tokens[0].token)
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
          .then((trainingsDocs) => {
            expect(trainingsDocs.length).toBe(1);
            expect(trainingsDocs[0].exercises[0].series[1].load).toBe(load);
            expect(trainingsDocs[0].exercises[0].series[1].order).toBe(order);
            expect(trainingsDocs[0].exercises[0].series[1].repetition).toBe(repetition);
            done();
          })
          .catch(e => done(e));
      });
  });

  it('should not add series with invalid body data', (done) => {
    const trainingId = trainings[0]._id.toHexString();
    const exerciseId = trainings[0].exercises[0]._id.toHexString();

    request(app)
      .post(`/api/trainings/${trainingId}/exercises/${exerciseId}/series`)
      .set('x-auth', users[0].tokens[0].token)
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
          .then((trainingsDocs) => {
            expect(trainingsDocs[0].exercises[0].series.length).toBe(1);
            done();
          })
          .catch(e => done(e));
      });
  });

  it('should not add series when invalid training ID is provided', (done) => {
    const exerciseId = trainings[0].exercises[0]._id.toHexString();

    request(app)
      .post(`/api/trainings/${new ObjectID().toHexString()}/exercises/${exerciseId}/series`)
      .set('x-auth', users[0].tokens[0].token)
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
    const trainingId = trainings[0]._id.toHexString();

    request(app)
      .post(`/api/trainings/${trainingId}/exercises/${new ObjectID().toHexString()}/series`)
      .set('x-auth', users[0].tokens[0].token)
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
    const trainingId = trainings[0]._id.toHexString();

    request(app)
      .post(`/api/trainings/${trainingId}/exercises/random-string/series`)
      .set('x-auth', users[0].tokens[0].token)
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

  it('should return 404 when trying to modify someone else\'s training', (done) => {
    const trainingId = trainings[0]._id.toHexString();
    const exerciseId = trainings[0].exercises[0]._id.toHexString();

    request(app)
      .post(`/api/trainings/${trainingId}/exercises/${exerciseId}/series`)
      .set('x-auth', users[1].tokens[0].token)
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

  it('should return 401 when trying to access without token', (done) => {
    const trainingId = trainings[0]._id.toHexString();
    const exerciseId = trainings[0].exercises[0]._id.toHexString();

    request(app)
      .post(`/api/trainings/${trainingId}/exercises/${exerciseId}/series`)
      .send({})
      .expect(401)
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
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.trainings.length).toBe(2);
      })
      .end(done);
  });

  it('should restrict access to authenticated users only', (done) => {
    request(app)
      .get('/api/trainings')
      .expect(401)
      .end(done);
  });
});

describe('GET /api/trainings/:trainingId', () => {
  it('should return training', (done) => {
    request(app)
      .get(`/api/trainings/${trainings[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.training.date).toBe(trainings[0].date);
      })
      .end(done);
  });

  it('should return 404 if training not found', (done) => {
    request(app)
      .get(`/api/trainings/${new ObjectID().toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 for faulty ObjectId', (done) => {
    request(app)
      .get('/api/trainings/random-string')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should not return someone else\'s training', (done) => {
    request(app)
      .get(`/api/trainings/${trainings[0]._id.toHexString()}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 401 trying to access endpoint without token', (done) => {
    request(app)
      .get(`/api/trainings/${trainings[0]._id.toHexString()}`)
      .expect(401)
      .end(done);
  });
});

describe('DELETE /api/trainings/:trainingId', () => {
  it('should remove a training', (done) => {
    const trainingId = trainings[1]._id.toHexString();

    request(app)
      .delete(`/api/trainings/${trainingId}`)
      .set('x-auth', users[1].tokens[0].token)
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
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    request(app)
      .delete('/api/trainings/random-string')
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should not allow to delete someone else\'s training', (done) => {
    request(app)
      .delete(`/api/trainings/${trainings[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should not allow to delete a training without token', (done) => {
    request(app)
      .delete(`/api/trainings/${trainings[1]._id.toHexString()}`)
      .expect(401)
      .end(done);
  });
});

describe('DELETE /api/trainings/:trainingId/exercise/:exerciseId', () => {
  it('should remove an exercise', (done) => {
    const trainingId = trainings[0]._id.toHexString();
    const exerciseId = trainings[0].exercises[0]._id.toHexString();

    request(app)
      .delete(`/api/trainings/${trainingId}/exercises/${exerciseId}`)
      .set('x-auth', users[0].tokens[0].token)
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
    const trainingId = trainings[0]._id.toHexString();

    request(app)
      .delete(`/api/trainings/${trainingId}/exercises/${new ObjectID().toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    const trainingId = trainings[0]._id.toHexString();

    request(app)
      .delete(`/api/trainings/${trainingId}/exercises/random-string`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should not delete exercise from someone else', (done) => {
    const trainingId = trainings[0]._id.toHexString();
    const exerciseId = trainings[0].exercises[0]._id.toHexString();

    request(app)
      .delete(`/api/trainings/${trainingId}/exercises/${exerciseId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should not delete an exercise when token is not provided', (done) => {
    const trainingId = trainings[0]._id.toHexString();
    const exerciseId = trainings[0].exercises[0]._id.toHexString();

    request(app)
      .delete(`/api/trainings/${trainingId}/exercises/${exerciseId}`)
      .expect(401)
      .end(done);
  });
});

describe('DELETE /api/trainings/:trainingId/exercise/:exerciseId/series/:seriesId', () => {
  it('should remove series', (done) => {
    const trainingId = trainings[0]._id.toHexString();
    const exerciseId = trainings[0].exercises[0]._id.toHexString();
    const seriesId = trainings[0].exercises[0].series[0]._id.toHexString();

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
    const trainingId = trainings[0]._id.toHexString();
    const exerciseId = trainings[0].exercises[0]._id.toHexString();

    request(app)
      .delete(`/api/trainings/${trainingId}/exercises/${exerciseId}/series/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    const trainingId = trainings[0]._id.toHexString();
    const exerciseId = trainings[0].exercises[0]._id.toHexString();

    request(app)
      .delete(`/api/trainings/${trainingId}/exercises/${exerciseId}/series/random-string`)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /api/trainings/:trainingId', () => {
  it('should update a training', (done) => {
    const trainingId = trainings[0]._id.toHexString();
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
    const trainingId = trainings[0]._id.toHexString();
    const exerciseId = trainings[0].exercises[0]._id.toHexString();
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
    const trainingId = trainings[0]._id.toHexString();

    request(app)
      .patch(`/api/trainings/${trainingId}/exercises/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 when invalid object id is provided', (done) => {
    const trainingId = trainings[0]._id.toHexString();

    request(app)
      .patch(`/api/trainings/${trainingId}/exercises/random-string`)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /api/trainings/:trainingId/exercise/:exerciseId/series/:seriesId', () => {
  it('should update series', (done) => {
    const trainingId = trainings[0]._id.toHexString();
    const exerciseId = trainings[0].exercises[0]._id.toHexString();
    const seriesId = trainings[0].exercises[0].series[0]._id.toHexString();
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
    const trainingId = trainings[0]._id.toHexString();
    const exerciseId = trainings[0].exercises[0]._id.toHexString();

    request(app)
      .patch(`/api/trainings/${trainingId}/exercises/${exerciseId}/series/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 when invalid object id is provided', (done) => {
    const trainingId = trainings[0]._id.toHexString();
    const exerciseId = trainings[0].exercises[0]._id.toHexString();

    request(app)
      .patch(`/api/trainings/${trainingId}/exercises/${exerciseId}/series/random-string`)
      .expect(404)
      .end(done);
  });
});

describe('GET /api/users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/api/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/api/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /api/users', () => {
  it('should create a user', (done) => {
    const email = 'example@example.com';
    const password = '123mnb!';

    request(app)
      .post('/api/users')
      .send({ email, password })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if (err) {
          done(err);
          return;
        }

        User.findOne({ email }).then((user) => {
          expect(user).toExist();
          expect(user.password).toNotBe(password);
          done();
        }).catch(e => done(e));
      });
  });

  it('should return validation errors if request invalid', (done) => {
    request(app)
      .post('/api/users')
      .send({
        email: 'and',
        password: '123',
      })
      .expect(400)
      .end(done);
  });

  it('should not create user if email in use', (done) => {
    request(app)
      .post('/api/users')
      .send({
        email: users[0].email,
        password: 'Password123!',
      })
      .expect(400)
      .end(done);
  });
});

describe('POST /api/users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/api/users/login')
      .send({
        email: users[1].email,
        password: users[1].password,
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
      })
      .end((err, res) => {
        if (err) {
          done(err);
          return;
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[1]).toInclude({
            access: 'auth',
            token: res.headers['x-auth'],
          });
          done();
        }).catch(e => done(e));
      });
  });

  it('should reject invalid login', (done) => {
    request(app)
      .post('/api/users/login')
      .send({
        email: users[1].email,
        password: `${users[1].password}1`,
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toNotExist();
      })
      .end((err) => {
        if (err) {
          done(err);
          return;
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(1);
          done();
        }).catch(e => done(e));
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    request(app)
      .delete('/api/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err) => {
        if (err) {
          done(err);
          return;
        }

        User.findById(users[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch(e => done(e));
      });
  });
});

