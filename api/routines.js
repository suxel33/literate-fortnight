const express = require('express');
const router = express.Router();
const {getAllPublicRoutines, createRoutine, attachActivitiesToRoutines, getRoutineById, updateRoutine, destroyRoutine, getRoutineActivitiesByRoutine} = require('../db');
const {requireUser} = require('./utils')
const jwt = require('jsonwebtoken');
const { JWT_SECRET = 'neverTell' } = process.env;

// GET /api/routines
router.get('/', async (req, res) => {
try{
    const allPublicRoutines = await getAllPublicRoutines()

    res.send(allPublicRoutines)
} catch (error) {
    console.error(error)
}
})

// POST /api/routines
router.post('/', requireUser, async (req, res) => {
    
  try {
    const {isPublic, name, goal} = req.body
    if(req.headers.authorization){
      const token = req.headers.authorization.split(' ')[1];
      const user = jwt.verify(token, JWT_SECRET);
      const newRoutine = await createRoutine({creatorId: user.id, name, goal, isPublic});
      res.send(newRoutine)
    }
    res.send()
  } catch (error) {
    console.error(error)
  }
})

// PATCH /api/routines/:routineId
router.patch('/:routineId',requireUser ,async (req, res) => {
    try{
    const { isPublic, name, goal } = req.body;
    
    if(req.params.routineId){
      const routine = await getRoutineById(req.params.routineId);

      if(req.headers.authorization){
        const token = req.headers.authorization.split(' ')[1];
        
        const user = jwt.verify(token, JWT_SECRET);
        
        if(user.id !== routine.creatorId){
            res.status(403)
            res.send({
              error: "not the owner",
              message: `User ${user.username} is not allowed to update Every day`,
              name: "not the owner"
            })
        }
      }
        
      const updateFields = {};
    
      if(isPublic !== routine.isPublic){
        updateFields.isPublic = isPublic;
      }
        
      if(name){
        updateFields.name = name;
      }
            
      if(goal){
        updateFields.goal = goal;
      }
    
      updateFields.id = req.params.routineId;

      const updatedroutine = await updateRoutine(updateFields)
      res.send(updatedroutine)
    }  
    } catch (error) {
        console.error(error)
    }
})

// DELETE /api/routines/:routineId
router.delete('/:routineId',requireUser, async (req, res) => {
  try{
   const routine = await getRoutineById(req.params.routineId)

   if(req.headers.authorization){
    const token = req.headers.authorization.split(' ')[1];
    
    const user = jwt.verify(token, JWT_SECRET);

    if(user.id !== routine.creatorId){
        res.status(403)
        res.send({
          error: "not the owner",
          message: `User ${user.username} is not allowed to delete On even days`,
          name: "not the owner"
        })
     }

     const destroyedRoutine = await destroyRoutine(req.params.routineId)
     res.send(destroyedRoutine)
   }
  } catch (error){
    console.error(error)
  }
    
})

router.post('/:routineId/activities', async (req, res) => {
    
  try {
    const routine = await getRoutineById(req.params.routineId)
    console.log("routine",routine)

    const _compRoutine = await getRoutineActivitiesByRoutine({id: req.params.routineId});
    const _routineActivity = _compRoutine && _compRoutine.filter(_activity => _activity.activityId === req.body.activityId);
    
    if (_routineActivity && _routineActivity.length){
      res.send({
        error: "activity allready exists on routine",
        message: `Activity ID ${req.body.activityId} already exists in Routine ID ${req.body.routineId}`,
        name: "activity allready exists on routine"
      });
    } 

  const newRoutine = await attachActivitiesToRoutines([req.body])
  console.log("newroutine",newRoutine[0])
  res.send(newRoutine[0])
  } catch (error) {
    console.error(error)
  }
})


module.exports = router;