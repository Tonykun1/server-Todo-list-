const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors'); 
const server = express();
const port=process.env.PORT||3050

const TOKEN_EXPIRATION_DAYS = 14;
const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000;


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
server.post('/generateToken', (req, res) => {
    const { name, password, Email } = req.body;

    if (!name || !password || !Email) {
        return res.status(400).json({ error: 'Missing required fields: name, password, and Email are required.' });
    }

    fs.readFile('data/Login.json', 'utf-8', (error, data) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to read file' });
        }
        try {
            let users = data ? JSON.parse(data) : [];
            const userIndex = users.findIndex(user => user.name === name && user.password === password && user.Email === Email);

            if (userIndex === -1) {
                const newUser = { name, password, Email, token: uuidv4(), lastTokenUpdate: Date.now() };
                users.push(newUser);

                fs.writeFile('data/Login.json', JSON.stringify(users), (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ error: 'Failed to write file' });
                    }

                    res.json({ token: newUser.token });
                });
            } else {
                const token = uuidv4();
                users[userIndex].token = token;
                users[userIndex].lastTokenUpdate = Date.now();

                fs.writeFile('data/Login.json', JSON.stringify(users, null, 2), (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ error: 'Failed to write file' });
                    }

                    res.json({ token });
                });
            }
        } catch (errorConnected) {
            console.error(errorConnected);
            res.status(500).json({ error: 'Failed to parse JSON' });
        }
    });
});

server.post('/:token', (req, res) => {
    const { token } = req.params;

    fs.readFile('data/Login.json', 'utf-8', (error, data) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to read file' });
        }
        try {
            const users = data ? JSON.parse(data) : [];
            const findUser = users.find(item => item.token === token);

            if (findUser) {
                const currentTime = Date.now();
                const tokenAge = currentTime - findUser.lastTokenUpdate;

                if (tokenAge > TOKEN_EXPIRATION_DAYS * MILLISECONDS_IN_A_DAY) {
                    findUser.token = uuidv4();
                    findUser.lastTokenUpdate = currentTime;

                    fs.writeFile('data/Login.json', JSON.stringify(users, null, 2), (err) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({ error: 'Failed to write file' });
                        }

                        res.json(findUser);
                    });
                } else {
                    res.json(findUser);
                }
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (errorConnected) {
            console.error(errorConnected);
            res.status(500).json({ error: 'Failed to parse JSON' });
        }
    });
});
  

server.listen(port, () => {
    console.log(`Server is running  Url: http://localhost:${port}`);
});
