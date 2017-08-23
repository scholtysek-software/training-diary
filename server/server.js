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
    version: '0.2.1',
  });
});

/**
 * Trainings routes
 */
app.post('/trainings', trainingRoutes.createTraining);
app.post('/trainings/:trainingId/exercises', trainingRoutes.createExercise);
app.post('/trainings/:trainingId/exercises/:exerciseId/series', trainingRoutes.createSeries);

app.get('/training', trainingRoutes.listTrainings);

app.listen(process.env.PORT, () => {
  console.log(`Server is waiting for the connection on port ${process.env.PORT}`);
});

module.exports = { app };
