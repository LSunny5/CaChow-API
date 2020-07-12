const UsersService = {
    getAllUsers(knex) {
      return knex.select('*').from('cachow_users')
    },
    getById(knex, id) {
      return knex.from('cachow_users').select('*').where('userId', id).first()
    },
    insertUser(knex, newUser) {
      return knex
        .insert(newUser)
        .into('cachow_users')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
    deleteUser(knex, id) {
      return knex('cachow_users')
        .where({ id })
        .delete()
    },
    updateUser(knex, id, changedUser) {
      return knex('cachow_users')
        .where({ id })
        .update(changedUser)
    },
  }
  
  module.exports = UsersService;