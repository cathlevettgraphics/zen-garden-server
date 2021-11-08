require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Server
const app = express();

// Bind to port and env constants
const {
  PORT = 3333,
  // Remote
  MONGODB_URI,
  // Local
  // MONGODB_URI = 'mongodb://localhost/trees-001',
} = process.env;

// Remote connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// SCHEMA
const { Schema } = mongoose;

const treeSchema = new Schema({
  imageUrl: String,
  minTemp: Number,
  height: Number,
  leaves: String,
  tree: String,
  name: String,
});

// MODEL
const Tree = mongoose.model('Tree', treeSchema);

// MIDDLEWARE
app.use(cors());
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
// parse application/json
app.use(express.json());

/*****************
 ***** API
 *****************/

// Redirect to root
app.get('/redirect', (req, res) => {
  res.redirect('/');
});

// !! GET DATA
app.get('/api/v1/trees/:id?', (req, res) => {
  console.log('query string params: ', req.query);
  const filters = {};
  const { id } = req.params;
  // Find ond tree
  if (id) {
    filters._id = id;
  }

  Tree.find(filters).exec((err, tree) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      return res.status(200).json(tree);
    }
  });
});

// !! ADD DATA
app.post('/api/v1/trees/', (req, res) => {
  console.log(req.body);
  const newTree = new Tree(req.body);

  // Check for bad data
  if (!newTree.name) {
    return res.status(400).send('please provide a name for the tree');
  }

  // Save new data entry
  newTree.save((err, tree) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      res.status(201).send(tree);
    }
  });
});

// !! UPDATE DATA
app.put('/api/v1/trees/:id', (req, res) => {
  console.log(req.params.id);
  // Get id of tree to update
  const { id } = req.params;

  // Update tree and rename _id to id
  Tree.updateOne({ _id: id }, req.body, (err, report) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      console.log(report);
      return res.sendStatus(200);
    }
  });
});

// !! DELETE DATA
app.delete('/api/v1/trees/:id', (req, res) => {
  console.log('id: ', req.params.id);
  // Get id of tree to delete
  const { id } = req.params;
  // Delete tree and rename _id to id
  Tree.remove({ _id: id }, (err) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      return res.sendStatus(204);
    }
  });
});

// Catch all
app.all('*', (req, res) => {
  res.sendStatus(404);
});

// Open port and listen
app.listen(PORT, () => {
  console.log(`
        🚀  Server is running!
        🔉  Listening on port ${PORT}
    `);
});
