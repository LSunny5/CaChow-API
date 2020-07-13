const MenuService = {
    getAllItems(knex) {
      return knex.select('*').from('restaurant_menu')
    },
    getById(knex, id) {
      return knex.from('restaurant_menu').select('*').where('mId', id).first()
    },
    insertItem(knex, newItem) {
      return knex
        .insert(newItem)
        .into('restaurant_menu')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
    deleteItem(knex, id) {
      return knex('restaurant_menu')
        .where({ id })
        .delete()
    },
    updateItem(knex, id, editedItem) {
      return knex('restaurant_menu')
        .where({ id })
        .update(editedItem)
    },
  }
  
  module.exports = MenuService;