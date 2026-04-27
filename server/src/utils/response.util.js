class ResponseUtil {
  static success(res, data = null, message = 'Success', statusCode = 200) {
    const body = { success: true, message, timestamp: new Date().toISOString() };
    if (data !== null) body.data = data;
    return res.status(statusCode).json(body);
  }

  static created(res, data = null, message = 'Created') {
    return this.success(res, data, message, 201);
  }

  static error(res, message = 'Error', statusCode = 500) {
    return res.status(statusCode).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  static badRequest(res, message = 'Bad request') {
    return this.error(res, message, 400);
  }
}

module.exports = ResponseUtil;