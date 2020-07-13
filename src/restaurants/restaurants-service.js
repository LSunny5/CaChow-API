const xss = require('xss');

const RestaurantService = {
    getAllRestaurants(knex) {
        return knex.select('*').from('cachow_restaurants')
    },
    getById(knex, id) {
        return knex.from('cachow_restaurants').select('*').where('r_id', id || 0).first()
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
    deleteRestaurant(knex, r_id) {
        return knex('cachow_restaurants')
            .where({ r_id })
            .delete()
    },
    updateRestaurant(knex, r_id, editedRestaurant) {
        return knex('cachow_restaurants')
            .where({ r_id })
            .update(editedRestaurant)
    },
    validateRestaurant(restaurant) {

      //check owner name


      //check image url

      //check restaurant type

      //check length of restaurant name
      if ((restaurant.r_name).length < 2 || (restaurant.r_name).length > 50) {
        return `Restaurant name needs to be less than 25 char and more than 2 char.`;
      };

      //check address

      //check city length

      //check zip code

      //check state is one of US states
      if ((restaurant.r_state).length > 25) {
        return `Restaurant state is incorrect, please check again`;
      }

      //check phone number

      //check hours id in table


      
      return null;


    },
    serializeRestaurant(restaurant) {
        return {
            r_id: restaurant.r_id,
            r_owner: xss(restaurant.r_owner),
            r_image: xss(restaurant.r_image),
            r_type: xss(restaurant.r_type), 
            r_name: xss(restaurant.r_name), 
            r_address: xss(restaurant.r_address), 
            r_city: xss(restaurant.r_city), 
            r_state: xss(restaurant.r_state), 
            r_zip: xss(restaurant.r_zip), 
            r_phone: xss(restaurant.r_phone), 
            r_hours: xss(restaurant.r_hours)
        }
    }
}

module.exports = RestaurantService;