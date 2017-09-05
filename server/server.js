const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
// const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');

require('./config/config');
require('./db/mongoose');
const { authenticate } = require('./middleware/authenticate');
const trainingRoutes = require('./routes/training');
const userRoutes = require('./routes/user');

const { version: appVersion } = require('./../package.json');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
if (process.env.NODE_ENV !== 'test') {
  app.use(logger('dev'));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.render('index');
});

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

// catch 404 and forward to error handler
app.use((req, res) => res.render('index'));

app.listen(process.env.PORT, () => {
  console.log(`Server is waiting for the connection on port ${process.env.PORT}`);
});

module.exports = { app };
