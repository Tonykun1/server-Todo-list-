const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors'); 
const server = express();
server.use(cors()); 
server.use(express.json());

server.get('/', (req, res) => {
    res.send('Welcome to my CRUD!');
});

server.get('/todo', (req, res) => {
    fs.readFile('data/todoJson.json', 'utf-8', (error, data) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: 'Error reading the file' });
            return;
        }
        res.json(JSON.parse(data));
    });
});

server.get('/todo/:id', (req, res) => {
    let { id } = req.params;

    if (typeof id === "string" && !isNaN(id)) {
        id = parseInt(id);
    }

    fs.readFile('data/todoJson.json', 'utf-8', (error, data) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: 'Error reading the file' });
            return;
        }
        const todos = JSON.parse(data);
        const todo = todos.find(item => item.id === id);
        if (todo) {
            res.json(todo);
        } else {
            res.status(404).json({ error: 'Todo not found' });
        }
    });
});

server.post('/todo', (req, res) => {
    const { value } = req.body;
    const newTodo = { id: uuidv4(), value };
    fs.readFile('data/todoJson.json', 'utf-8', (error, data) => {
        if (error) {
            console.error(error);
            return;
        }
        const todos = JSON.parse(data);
        todos.push(newTodo);
        fs.writeFile('data/todoJson.json', JSON.stringify(todos,null,2), (error) => {
            if (error) {
                console.error(error);
                return;
            }
            res.json(newTodo);
        });
    });
});

server.put('/todo/:id', (req, res) => {
    const { id } = req.params;
    const { value } = req.body;

    fs.readFile('data/todoJson.json', 'utf-8', (error, data) => {
        if (error) {
            console.error(error);
            return;
        }
        let todos = JSON.parse(data);
        const index = todos.findIndex(item => item.id === id);
        if (index === -1) {
            res.status(404).json({ error: 'Todo not found' });
            return;
        }

        todos[index].value = value;
        fs.writeFile('data/todoJson.json', JSON.stringify(todos,null,2), (error) => {
            if (error) {
                console.log(error);
                return;
            }
            res.json(todos[index]);
        });
    });
});

server.delete('/todo/:id', (req, res) => {
    const { id } = req.params;

    fs.readFile('data/todoJson.json', 'utf-8', (error, data) => {
        if (error) {
            console.error(error);
            return;
        }
        let todos = JSON.parse(data);
        const index = todos.findIndex(item => item.id === id);
        if (index === -1) {
            res.status(404).json({ error: 'Todo not found' });
            return;
        }

        todos.splice(index, 1);
        fs.writeFile('data/todoJson.json', JSON.stringify(todos,null,2), (error) => {
            if (error) {
                console.error(error);
                return;
            }

            res.json({ message: `Todo with ID ${id} deleted` });
        });
    });
});

  

server.listen(3050, () => {
    console.log('Server is running on port 3050');
});
