const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send({
    name: 'Training Diary API',
    version: '1.0.0',
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is waiting for the connection on port ${port}`)
});

module.exports = { app };
