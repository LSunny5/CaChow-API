const CategoriesService = {
  getAllCategories(knex) {
    return knex.select('*').from('cachow_categories')
  },
  getById(knex, id) {
    return knex.select('*').from('cachow_categories').where('cat_id', id).first()
  },
  insertCategory(knex, newCategory) {
    return knex
      .insert(newCategory)
      .into('cachow_categories')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  deleteCategory(knex, cat_id) {
    return knex('cachow_categories')
      .where({ cat_id })
      .delete()
  },
  updateCategory(knex, cat_id, editedCategory) {
    return knex('cachow_categories')
      .where({ cat_id })
      .update(editedCategory)
  },
}

module.exports = CategoriesService;