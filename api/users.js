const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { createUser, getUserByUsername, getPublicRoutinesByUser, getUser } = require('../db');
const {requireUser} = require('./utils')


const { JWT_SECRET = 'neverTell' } = process.env;

// POST /api/users/login
router.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      next({
        name: 'MissingCredentialsError',
        message: 'Please supply both a username and password'
      });
    }
  
    try {
      const user = await getUser({username, password});
      if(!user) {
        next({
          name: 'IncorrectCredentialsError',
          message: 'Username or password is incorrect',
        })
      } else {
        const token = jwt.sign({id: user.id, username: username}, JWT_SECRET)
        res.send({ user, message: "you're logged in!", token: token });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
});


// POST /api/users/register
router.post('/register', async (req, res, next) => {
    try {
      const {username, password} = req.body;
      const queriedUser = await getUserByUsername(username);
      
      if(password.length < 8) res.send ({
        error:"password too short",
        message:"Password Too Short!",
        name:"password too short"
      })

      if(queriedUser) res.send ({
        error:"user is allready being used",
        message:`User ${username} is already taken.`,
        name:"taken username"
      }) 

      if(!queriedUser){
      const user = await createUser({
        username,
        password
      });
        
      const token = jwt.sign({id: user.id, username: username}, JWT_SECRET)
      res.send({ user, message: "you're signed up!", token });
    }
      
    } catch (error) {
      next(error)
    }
})

// GET /api/users/me
router.get('/me', requireUser, async (req, res, next) => {
  try {
      if (req.headers.authorization) {
          const token = req.headers.authorization.split(' ')[1];
          const user = jwt.verify(token, JWT_SECRET);
          res.send({...user});
      } else {
          res.send({message: 'You must be logged in to perform this action'});
      }
  } catch (error) {
      next(error);
  }
});

// GET /api/users/:username/routines
router.get('/:username/routines', async (req, res) =>{
    const username = req.params
    const publicRoutines = await getPublicRoutinesByUser(username)
    res.send(publicRoutines)
})

module.exports = router;