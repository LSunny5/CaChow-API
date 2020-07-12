const MenuService = {
    getAllItems(knex) {
      return knex.select('*').from('restMenu')
    },
    getById(knex, id) {
      return knex.from('restMenu').select('*').where('mId', id).first()
    },
    insertItem(knex, newItem) {
      return knex
        .insert(newItem)
        .into('restMenu')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
    deleteItem(knex, id) {
      return knex('restMenu')
        .where({ id })
        .delete()
    },
    updateItem(knex, id, editedItem) {
      return knex('restMenu')
        .where({ id })
        .update(editedItem)
    },
  }
  
  module.exports = MenuService;