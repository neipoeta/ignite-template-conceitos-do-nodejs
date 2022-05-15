const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.body;
  const user = users.find((user) => user.username === username);

  if (user) {
    return response.status(400).json({
      error: 'User already exists',
    });
}
  request.user = user;

  return next(user);
}

app.post('/users', checksExistsUserAccount, (request, response) => {
  const { name, username} = request.body;

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.query;

  const user = users.find(user => user.username === username);

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.query;
  const { title, deadline } = request.body;

  const user = users.find(user => user.username === username);

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(todo);

  return response.json(todo).status(201);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.query;
  const { title, deadline } = request.body;

  const user = users.find(user => user.username === username);

  const todo = user.todos.find(todo => todo.id === id);

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.query;

  const user = users.find(user => user.username === username);

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo) {
    return response.status(404).json({
      error: 'Todo not found'
    });
  }

  todo.done = !todo.done;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.query;

  const user = users.find(user => user.username === username);

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo) {
    return response.status(404).json({
      error: 'Todo not found'
    });
  }

  user.todos.splice(user.todos.indexOf(todo), 1);

  return response.status(204).json();
});

module.exports = app;