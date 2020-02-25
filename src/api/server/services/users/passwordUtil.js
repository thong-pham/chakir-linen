const bcrypt = require('bcrypt');

const saltRounds = 10;

// const  generatePasswordHash = (password) => {
//     bcrypt.genSalt(saltRounds, function (err, salt) {
//         bcrypt.hash(password, salt, function (err, hash) {
//             callback(err, hash);
//         });
//     });
// }

const  generatePasswordHash = (password) => {
    return bcrypt.hash(password, saltRounds).then(function(hash){
        return hash;
    });
}

const validatePasswordHash = (password, hash) => {
    return bcrypt.compare(password, hash).then(function(isSame){
        return isSame
    });
}


module.exports = {
    generatePasswordHash: generatePasswordHash,
    validatePasswordHash: validatePasswordHash
}
