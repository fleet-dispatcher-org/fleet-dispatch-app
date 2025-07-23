const crypto = require('crypto');

// This is going to generate a secure random secret for webhook authentication
function generateSecret(length = 32) {
    return crypto.randomBytes(length).toString('base64url');
}

module.exports = { generateSecret }; 