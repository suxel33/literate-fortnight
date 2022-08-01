
const client = require("./client")
const getAllActivities = async () => {
  try {
    const { rows: activities } = await client.query(`
      SELECT *
      FROM activities;
      `);
    return activities
  } catch (err) {
    console.error(err)
  }
}

const getActivityById = async (activityId) => {
  try {
    const { rows: [activity] } = await client.query(`
      SELECT * 
      FROM activities
      WHERE id=$1;
      `, [activityId])

    return activity;
  } catch (err) {
    console.error(err)
  }
}


const getActivityByName = async (name) => {
  try {
    const { rows: [activity] } = await client.query(`
      SELECT *
      FROM activities
      WHERE name=$1
  `, [name])
    return activity
  } catch (err) {
    console.error(err)
  }
}

const attachActivitiesToRoutines = async (routines) => {
  try {
    const {rows: activities } = await client.query(`
      SELECT activities.*, routine_activities.duration, routine_activities.count, routine_activities.id AS "routineActivityId", routine_activities."routineId"
      FROM activities
      JOIN routine_activities 
      ON activities.id=routine_activities."activityId"
    `);
    routines.forEach((routine) => {
      const filteredActivities = activities.filter(
        (activity) => routine.id === activity.routineId

      )
      routine.activities = filteredActivities
    });
  
    return routines
  } catch (err) {
    console.error(err)
  }
}

const createActivity = async ({ name, description }) => {
  try {
    const { rows: [activity] } = await client.query(`
      INSERT INTO activities(name, description)
      VALUES ($1, $2)
      ON CONFLICT (name) DO NOTHING
      RETURNING *;
  `, [name, description])

    return activity
  } catch (err) {
    console.error(err)
  }
}



const updateActivity = async ({ id, ...fields }) => {
  const setString = Object.keys(fields).map(
    (key, index) => `"${key}"=$${index + 1}`).join(', ');
  try {
    const { rows: [activity] } = await client.query(`
      UPDATE activities
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
      `, Object.values(fields))
    return activity
  } catch (err) {
    console.error(err)
  }
}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,

}
