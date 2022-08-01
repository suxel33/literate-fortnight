const client = require('./client')
const { attachActivitiesToRoutines } = require("./activities");
async function getRoutineActivityById(id) {
  try {
    const { rows: [routine] } = await client.query(`
      SELECT *
      FROM routine_activities
      WHERE id=$1
    `, [id])
    return routine;
  } catch (err) {
    console.error(err)
  }
}

const addActivityToRoutine = async ({
  routineId,
  activityId,
  count,
  duration,
}) => {
  try {
    const { rows: [routineActivity] } = await client.query(`
      INSERT INTO routine_activities("routineId", "activityId", count, duration)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT ("routineId", "activityId") DO NOTHING
      RETURNING *;
    `, [routineId, activityId, count, duration]);
    return routineActivity;
  } catch (err) {
    console.error(err)

  }

}

async function getRoutineActivitiesByRoutine({ id }) {
  try {
    const { rows: routines } = await client.query(`
      SELECT routine_activities.*
      FROM routine_activities
      JOIN routines
      ON routines.id=routine_activities."routineId"
      WHERE routine_activities."routineId"=$1
    `, [id]);
    return attachActivitiesToRoutines(routines);
  } catch (err) {
    console.error(err)

  }
}

async function updateRoutineActivity({ id, ...fields }) {
  const setString = Object.keys(fields).map(
    (key, index) => `"${key}"=$${index + 1}`).join(', ');
  try {
    const { rows: [routine] } = await client.query(`
      UPDATE routine_activities
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
    `, Object.values(fields))
    return routine
  } catch (err) {
    console.error(err)
  }
}

async function destroyRoutineActivity(id) {
  try {
    const { rows: [deletedRoutActivity] } = await client.query(`
      DELETE FROM routine_activities
      WHERE id=$1
      RETURNING *
   `, [id])
    return deletedRoutActivity
  } catch (e) {
    console.error(e)
  }
}

async function canEditRoutineActivity(routineActivityId, userId) {

  try {
    const {rows: [routine]} = await client.query(`
      SELECT * 
      FROM routine_activities
      JOIN routines ON routine_activities."routineId" = routines.id
      AND routine_activities.id = $1
    `,[routineActivityId]);
    return routine.creatorId === userId;
  } catch (err) {
    console.error(err)
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
