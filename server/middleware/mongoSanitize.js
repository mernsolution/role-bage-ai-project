const sanitizeMongo = (obj) => {
    for (const key in obj) {
        if (key.startsWith('$') || key.includes('.')) {
            delete obj[key];
        } else if (typeof obj[key] === 'object') {
            sanitizeMongo(obj[key]);
        }
    }
    return obj;
};
const mongoSanitizeMiddleware = (req, res, next) => {
    if (req.body) req.body = sanitizeMongo(req.body);
    if (req.params) req.params = sanitizeMongo(req.params);
    next();
};

export default mongoSanitizeMiddleware;