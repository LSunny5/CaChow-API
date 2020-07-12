const RestaurantsService = {
    getAllRestaurants(knex) {
      return knex.select('*').from('cachow_categories')
    },
    getById(knex, id) {
      return knex.from('cachow_restaurants').select('*').where('rId', id).first()
    },
    insertRestaurant(knex, newRestaurant) {
      return knex
        .insert(newRestaurant)
        .into('cachow_restaurants')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
    deleteRestaurant(knex, id) {
      return knex('cachow_restaurants')
        .where({ id })
        .delete()
    },
    updateRestaurant(knex, id, editedRestaurant) {
      return knex('cachow_restaurants')
        .where({ id })
        .update(editedRestaurant)
    },
  }
  
  module.exports = RestaurantsService;