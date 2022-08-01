function requireUser(req, res, next) {
  if (req.headers.authorization === undefined) {
    res.status(401);
    res.send({
      error: "401",
      message: "You must be logged in to perform this action",
      name: "missing user"
    });
  }
  next();
}

const requiredNotSent = ({ requiredParams, atLeastOne = false }) => {
  return (req, res, next) => {
    if(atLeastOne) {
      let numParamsFound = 0;
      for(let param of requiredParams) {
        if(req.body[param] !== undefined) {
          numParamsFound++;
        }
      }
      if(!numParamsFound) {
        next({
          name: 'MissingParams',
          message: `Must provide at least one of these in body: ${requiredParams.join(', ')}`
        })
      } else {
        next();
      }
    } else {
      const notSent = [];
      for(let param of requiredParams) {
        if(req.body[param] === undefined) {
          notSent.push(param);
        }
      }
      if(notSent.length) next({
        name: 'MissingParams',
        message: `Required Parameters not sent in body: ${notSent.join(', ')}`
      })
      next();
    }
  }
}

module.exports = {
  requireUser,
  requiredNotSent
}