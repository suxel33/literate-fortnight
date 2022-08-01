const express = require('express');
const router = express.Router();
const {getRoutineActivityById, updateRoutineActivity,destroyRoutineActivity,canEditRoutineActivity} = require('../db');
const {requireUser} = require('./utils')
const jwt = require('jsonwebtoken');
const { JWT_SECRET = 'neverTell' } = process.env;

// PATCH /api/routine_activities/:routineActivityId
router.patch('/:routineActivityId',requireUser ,async (req, res) => {
  try {

    if(req.params.routineActivityId){
        const originalRoutine = await getRoutineActivityById(req.params.routineActivityId);
        console.log("originalRoutine",originalRoutine)
      
  
        if(req.headers.authorization){
          const token = req.headers.authorization.split(' ')[1];
          
          const user = jwt.verify(token, JWT_SECRET);

          const canEdit = await canEditRoutineActivity(req.params.routineActivityId, user.id)
          
          if(!canEdit){ //creatorId issue
              res.status(403)
              res.send({
                error: "not the owner",
                message: `User ${user.username} is not allowed to update In the evening`,
                name: "not the owner"
              })
          }
        const updateFields = {};

        if(req.body.count !== originalRoutine.count){
          updateFields.count = req.body.count
        }

        if(req.body.duration !== originalRoutine.duration){
            updateFields.duration = req.body.duration
        }

        updateFields.id = req.params.routineActivityId;
        
        const updatedRoutineActivities = await updateRoutineActivity(updateFields)
        res.send(updatedRoutineActivities)
      }
    }
  } catch (error) {
    console.error(error)
  }
})

// DELETE /api/routine_activities/:routineActivityId
router.delete('/:routineActivityId',requireUser ,async (req, res) => {
    try {
        

        if(req.headers.authorization){
            const token = req.headers.authorization.split(' ')[1];
            
            const user = jwt.verify(token, JWT_SECRET);
            console.log("user",user)

            const canEdit = await canEditRoutineActivity(req.params.routineActivityId, user.id)
            if(!canEdit){ 
                res.status(403)
                res.send({
                  error: "not the owner",
                  message: `User ${user.username} is not allowed to delete In the afternoon`,
                  name: "not the owner"
                })
            }
        
            const destroyedRoutine = await destroyRoutineActivity(req.params.routineActivityId)
            res.send(destroyedRoutine)
        }

  res.send("delete")
    } catch (error) {
        console.error(error)
    }
})
module.exports = router;