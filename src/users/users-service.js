const xss = require('xss');
const bcrypt = require('bcryptjs');

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/

const UsersService = {
    getAllUsers(knex) {
        return knex.select('*').from('cachow_users')
    },
    getById(knex, id) {
        return knex.from('cachow_users').select('*').where('user_id', id || 0).first()
    },
    hasUserWithUserName(db, user_name) {
        return db('cachow_users')
            .where({ user_name })
            .first()
            .then(user => !!user)
    },
    insertUser(db, newUser) {
        return db
            .insert(newUser)
            .into('cachow_users')
            .returning('*')
            .then(([user]) => user)
    },
    deleteUser(knex, user_name) {
        return knex('cachow_users')
            .where({ user_name })
            .delete()
    },
    validatePassword(password) {
        if (password.length < 8) {
            return 'Password must be longer than 8 characters'
        }
        if (password.length > 72) {
            return 'Password must be less than 72 characters'
        }
        if (password.startsWith(' ') || password.endsWith(' ')) {
            return 'Password must not start or end with empty spaces'
        }
        if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
            return 'Password must contain 1 upper case, lower case, number and special character'
        }
        return null
    },
    hashPassword(password) {
        return bcrypt.hash(password, 12)
    },
    serializeUser(user) {
        return {
            user_id: user.user_id,
            full_name: xss(user.full_name),
            user_name: xss(user.user_name),
            password: xss(user.password),
            date_created: new Date(user.date_created),
        }
    },
}

module.exports = UsersService;