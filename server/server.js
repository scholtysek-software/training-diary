const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');

require('./config/config');
require('./db/mongoose');
const { authenticate } = require('./middleware/authenticate');
const trainingRoutes = require('./routes/training');
const userRoutes = require('./routes/user');

const { version: appVersion } = require('./../package.json');

const app = express();

if (process.env.NODE_ENV !== 'test') {
  app.use(logger('dev'));
}
app.use(cors({
  exposedHeaders: ['x-auth'],
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'dist')));

app.get('/api/', (req, res) => {
  res.send({
    name: 'Training Diary API',
    version: appVersion,
  });
});

/**
 * Trainings routes
 */
app.post('/api/trainings', authenticate, trainingRoutes.createTraining);
app.get('/api/trainings/:trainingId', authenticate, trainingRoutes.getTraining);
app.delete('/api/trainings/:trainingId', authenticate, trainingRoutes.deleteTraining);
app.patch('/api/trainings/:trainingId', authenticate, trainingRoutes.updateTraining);

app.post('/api/trainings/:trainingId/exercises', authenticate, trainingRoutes.createExercise);
app.delete('/api/trainings/:trainingId/exercises/:exerciseId', authenticate, trainingRoutes.deleteExercise);
app.patch('/api/trainings/:trainingId/exercises/:exerciseId', authenticate, trainingRoutes.updateExercises);

app.post('/api/trainings/:trainingId/exercises/:exerciseId/series', authenticate, trainingRoutes.createSeries);
app.delete('/api/trainings/:trainingId/exercises/:exerciseId/series/:seriesId', authenticate, trainingRoutes.deleteSeries);
app.patch('/api/trainings/:trainingId/exercises/:exerciseId/:series/:seriesId', authenticate, trainingRoutes.updateSeries);

app.get('/api/trainings', authenticate, trainingRoutes.listTrainings);

/**
 * User routes
 */
app.post('/api/users', userRoutes.createUser);
app.get('/api/users/me', authenticate, userRoutes.getUser);
app.post('/api/users/login', userRoutes.login);
app.delete('/api/users/me/token', authenticate, userRoutes.deleteToken);

app.listen(process.env.PORT, () => {
  console.log(`Server is waiting for the connection on port ${process.env.PORT}`);
});

module.exports = { app };
