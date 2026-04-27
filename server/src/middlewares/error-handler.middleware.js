const ResponseUtil = require('../utils/response.util');

function errorHandlerMiddleware(err, req, res, next) {
  console.error(`[ErrorHandler] ${err.message}`);
  return ResponseUtil.error(res, '服务器内部错误', 500);
}

module.exports = errorHandlerMiddleware;