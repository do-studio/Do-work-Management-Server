import _ from 'lodash';


const sanitizeHandler  = (req, res, next) => {
  Object.keys(req.body).forEach((key) => {
    req.body[key] = _.replace(req.body[key], "{", "[");
    req.body[key] = _.replace(req.body[key], "}", "]");
  });
  Object.keys(req.params).forEach((key) => {
    req.params[key] = _.replace(req.params[key], "{", "[");
    req.params[key] = _.replace(req.params[key], "}", "]");
  });
  next();
}

export default sanitizeHandler