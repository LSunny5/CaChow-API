const CategoriesService = {
  getAllCategories(knex) {
    return knex.select('*').from('cachow_categories')
  },
  getById(knex, id) {
    return knex.from('cachow_categories').select('*').where('cId', id).first()
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
  deleteCategory(knex, id) {
    return knex('cachow_categories')
      .where({ id })
      .delete()
  },
  updateCategory(knex, id, editedCategory) {
    return knex('cachow_categories')
      .where({ id })
      .update(editedCategory)
  },
}

module.exports = CategoriesService;