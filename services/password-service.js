const PasswordService = {
    getAllPasswords(knex) {
      return knex.select('*').from('cachow_passwords')
    },
    getById(knex, id) {
      return knex.from('cachow_passwords').select('*').where('pId', id).first()
    },
    insertPassword(knex, newPassword) {
      return knex
        .insert(newPassword)
        .into('cachow_passwords')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
    deletePassword(knex, id) {
      return knex('cachow_passwords')
        .where({ id })
        .delete()
    },
    updatePassword(knex, id, changedPassword) {
      return knex('cachow_passwords')
        .where({ id })
        .update(changedPassword)
    },
  }
  
  module.exports = PasswordService;