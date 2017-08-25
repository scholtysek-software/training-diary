const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
// const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');

require('./config/config');
require('./db/mongoose');

const trainingRoutes = require('./routes/training');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
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
    version: '0.3.0',
  });
});

/**
 * Trainings routes
 */
app.post('/api/trainings', trainingRoutes.createTraining);
app.get('/api/trainings/:trainingId', trainingRoutes.getTraining);
app.delete('/api/trainings/:trainingId', trainingRoutes.deleteTraining);
app.patch('/api/trainings/:trainingId', trainingRoutes.updateTraining);

app.post('/api/trainings/:trainingId/exercises', trainingRoutes.createExercise);
app.delete('/api/trainings/:trainingId/exercises/:exerciseId', trainingRoutes.deleteExercise);
app.patch('/api/trainings/:trainingId/exercises/:exerciseId', trainingRoutes.updateExercises);

app.post('/api/trainings/:trainingId/exercises/:exerciseId/series', trainingRoutes.createSeries);
app.delete('/api/trainings/:trainingId/exercises/:exerciseId/series/:seriesId', trainingRoutes.deleteSeries);
app.patch('/api/trainings/:trainingId/exercises/:exerciseId/:series/:seriesId', trainingRoutes.updateSeries);

app.get('/api/trainings', trainingRoutes.listTrainings);

// catch 404 and forward to error handler
app.use((req, res) => res.render('index'));

app.listen(process.env.PORT, () => {
  console.log(`Server is waiting for the connection on port ${process.env.PORT}`);
});

module.exports = { app };
