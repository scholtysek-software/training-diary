const express = require('express');
const bodyParser = require('body-parser');

require('./config/config');
require('./db/mongoose');

const trainingRoutes = require('./routes/training');

const app = express();

app.use(bodyParser.json());

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

app.listen(process.env.PORT, () => {
  console.log(`Server is waiting for the connection on port ${process.env.PORT}`);
});

module.exports = { app };
