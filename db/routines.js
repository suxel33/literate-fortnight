const client = require('./client');
const { attachActivitiesToRoutines } = require("./activities");



const getRoutineById = async (id) => {
  try {
    const { rows: [routine] } = await client.query(`
      SELECT *
      FROM routines
      WHERE id=$1
    `, [id])
    return routine;
  } catch (err) {
    console.error(err)
  }
}

const getRoutinesWithoutActivities = async () => {
  try {
    const { rows: routines } = await client.query(`
      SELECT *
      FROM routines
    `)
    return routines
  } catch (err) {
    console.error(err)
  }
}

const getAllRoutines = async () => {
  try {
    const { rows: routines } = await client.query(`
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users 
      ON users.id=routines."creatorId"
    `);
    return attachActivitiesToRoutines(routines);

  } catch (err) {
    console.error(err)
  }
}

const getAllRoutinesByUser = async ({ username }) => {
  try {
    const { rows: routines } = await client.query(`
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users
      ON users.id=routines."creatorId"
      WHERE username=$1
   `,[username])
    return attachActivitiesToRoutines(routines);

  } catch (err) {
    console.error(err)
  }
}

async function getPublicRoutinesByUser({ username }) {
  try { 
    const {rows: routines } = await client.query(`
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users 
      ON users.id=routines."creatorId"
      WHERE "isPublic" = true AND username=$1
    `,[username]);
    return attachActivitiesToRoutines(routines);
  } catch (err) {
    console.error(err)

  }
}

const getAllPublicRoutines = async () => {
  try {
    const { rows: routines } = await client.query(`
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users
      ON users.id=routines."creatorId"
      WHERE "isPublic" = true
   `)
    return attachActivitiesToRoutines(routines);

  } catch (err) {
    console.error(err)
  }
}

const getPublicRoutinesByActivity = async ({ id }) => {
  try { 
    const {rows: routines } = await client.query(`
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users 
      ON users.id=routines."creatorId"
      JOIN routine_activities 
      ON routines.id=routine_activities."routineId"
      WHERE "isPublic" = true AND routine_activities."activityId"=$1
    `,[id]);
    return attachActivitiesToRoutines(routines);
  } catch (err) {
    console.error(err)

  }
}

const createRoutine = async ({ creatorId, isPublic, name, goal }) => {

  try {
    const { rows: [routine] } = await client.query(`
      INSERT INTO routines("creatorId", "isPublic", name, goal)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (name) DO NOTHING 
      RETURNING *;
  
    `, [creatorId, isPublic, name, goal]);
      if (!routine) {
        console.log('CREATE ROUTINE ERROR')
      }
    return routine
  } catch (err) {
    console.error(err)
  }
}

const updateRoutine = async ({ id, ...fields }) => {
  const setString = Object.keys(fields).map(
    (key, index) => `"${key}"=$${index + 1}`).join(', ');
  try {
    const { rows: [routine] } = await client.query(`
      UPDATE routines
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
    `, Object.values(fields))
    return routine
  } catch (err) {
    console.error(err)
  }
}

const destroyRoutine = async (id) => {
  try {
    await client.query(`
      DELETE FROM routine_activities
      RETURNING *
    `)
    const { rows: [routine] } = await client.query(`
      DELETE FROM routines
      WHERE id=$1
      RETURNING *
    `, [id])
    return routine
  } catch (err) {
    console.error(err)
  }
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
}