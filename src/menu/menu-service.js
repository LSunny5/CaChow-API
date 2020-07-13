const xss = require('xss');

const MenuService = {
  getAllItems(knex) {
    return knex.select('*').from('restaurant_menu')
  },
  getById(knex, id) {
    return knex.from('restaurant_menu').select('*').where('item_id', id).first()
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
  deleteItem(knex, item_id) {
    return knex('restaurant_menu')
      .where({ item_id })
      .delete()
  },
  updateItem(knex, item_id, editedItem) {
    return knex('restaurant_menu')
      .where({ item_id })
      .update(editedItem)
  },
  validateItem(item) {
    //check to see if restaurant referenced is in dataase
    if (!item.item_restaurant) {



      return `Item restaurant is not referencing a restaurant...`;
    };
    if ((item.item_name).length < 3 || item.item_name.length > 25) {
      return `Item name needs to be more than 3 or less than 25 characters.`;
    };
    //check to see if category is in category given
    if (!item.item_cat) {






      return `Item's category is incorrect or not in database...`;
    };
    //check to see if item price is a numeric number
    if (!item.item_price) {






      return `Item price needs two decimal places...`;
    };
    return null;
  },
  serializeItem(item) {
    return {
      item_id: item.item_id,
      item_restaurant: xss(item.item_restaurant),
      item_name: xss(item.item_name),
      item_cat: xss(item.item_cat),
      item_price: xss(item.item_price)
    }
  }
}

module.exports = MenuService;