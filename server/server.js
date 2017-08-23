const express = require('express');
const bodyParser = require('body-parser');

require('./db/mongoose');
const trainingRoutes = require('./routes/training');

const app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send({
    name: 'Training Diary API',
    version: '0.1.0',
  });
});

/**
 * Trainings routes
 */
app.post('/trainings', trainingRoutes.createTraining);
app.post('/trainings/:trainingId/exercises', trainingRoutes.createExercise);
app.post('/trainings/:trainingId/exercises/:exerciseId/series', trainingRoutes.createSeries);

app.get('/training', trainingRoutes.listTrainings);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is waiting for the connection on port ${port}`);
});

module.exports = { app };
