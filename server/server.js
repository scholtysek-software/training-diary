const express = require('express');
const bodyParser = require('body-parser');

require('./config/config');
require('./db/mongoose');

const trainingRoutes = require('./routes/training');

const app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send({
    name: 'Training Diary API',
    version: '0.3.0',
  });
});

/**
 * Trainings routes
 */
app.post('/trainings', trainingRoutes.createTraining);
app.get('/trainings/:trainingId', trainingRoutes.getTraining);
app.delete('/trainings/:trainingId', trainingRoutes.deleteTraining);
app.patch('/trainings/:trainingId', trainingRoutes.updateTraining);

app.post('/trainings/:trainingId/exercises', trainingRoutes.createExercise);
app.delete('/trainings/:trainingId/exercises/:exerciseId', trainingRoutes.deleteExercise);
app.patch('/trainings/:trainingId/exercises/:exerciseId', trainingRoutes.updateExercises);

app.post('/trainings/:trainingId/exercises/:exerciseId/series', trainingRoutes.createSeries);
app.delete('/trainings/:trainingId/exercises/:exerciseId/series/:seriesId', trainingRoutes.deleteSeries);
app.patch('/trainings/:trainingId/exercises/:exerciseId/:series/:seriesId', trainingRoutes.updateSeries);

app.get('/trainings', trainingRoutes.listTrainings);

app.listen(process.env.PORT, () => {
  console.log(`Server is waiting for the connection on port ${process.env.PORT}`);
});

module.exports = { app };
