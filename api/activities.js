/* eslint-disable no-useless-catch */
const express = require('express');
const router = express.Router();
const { ActivityExistsError, ActivityNotFoundError } = require("../errors");
const {
    getAllActivities,
    createActivity,
    updateActivity,
    getPublicRoutinesByActivity,
    getActivityByName,
    getActivityById
} = require ('../db');


// GET /api/activities/:activityId/routines
router.get('/:activityId/routines', async (req, res, next) => {
    const { activityId } = req.params
    try {
        const routines = await getPublicRoutinesByActivity({ id: activityId })
        res.send(routines);

    } catch (error) {
        next(error);
    }
});


// GET /api/activities
router.get('/', async(req, res, next) => {
    try {
        const activities = await getAllActivities()
        if (activities) {
            res.send(activities)
        }
    } catch (error) {
        next(error)
    }
})

// POST /api/activities
router.post('/', async(req, res, next) => {
    const { name, description } = req.body
    try {
        const act = await getActivityByName(name)
        if (act) {
            next({
                name: "activity exists error",
                message: ActivityExistsError(name),
            })
        }    
        const newAct = await createActivity({ name, description })
        res.send(newAct)
    } catch (error) {
        next(error)
    }
})

// PATCH /api/activities/:activityId
router.patch('/:activityId', async(req, res, next) => {
    const { activityId: id } = req.params
    const { name, description } = req.body
    try {
        const actName = await getActivityByName(name)
        if (actName) {
            next({
                name: "Activity exists error",
                message: ActivityExistsError(name),
            })
        }  
        const actId = await getActivityById(id);
        if (!actId) {
          next({
            name: "That activity does not exist!",
            message: ActivityNotFoundError(id),
          });
        } 
        const activity = await updateActivity({
            id,
            name,
            description
        })
        res.send(activity)
    } catch (error) {
        next(error)
    }
})

module.exports = router;