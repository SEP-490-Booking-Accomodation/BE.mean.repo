const moment = require('moment-timezone');

/**
 * Helper function to parse date fields in the specified format and timezone.
 * @param {Object} data - The data (e.g., req.body) to process.
 * @param {Array} dateFields - Array of date fields to parse.
 * @param {String} dateFormat - The format to expect (e.g., "DD-MM-YYYY HH:mm:ss Z").
 * @param {String} timezone - The timezone to use (e.g., "Asia/Ho_Chi_Minh").
 * @returns {Object} - The data with parsed dates.
 */
const parseDateFields = (data, dateFields, dateFormat, timezone) => {
    dateFields.forEach(field => {
        if (data[field]) {
            const parsedDate = moment.tz(data[field], dateFormat, timezone);
            if (!parsedDate.isValid()) {
                throw new Error(`Invalid date format for ${field}`);
            }
            data[field] = parsedDate.toDate(); // Convert moment object to JavaScript Date
        }
    });
    return data;
};

module.exports = parseDateFields;
