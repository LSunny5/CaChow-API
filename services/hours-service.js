const HoursService = {
    getAllHours(knex) {
        return knex.select('*').from('restHours')
    },
    getById(knex, id) {
        return knex.from('restHours').select('*').where('hId', id).first()
    },
    insertHours(knex, newHours) {
        return knex
            .insert(newHours)
            .into('restHours')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    deleteHours(knex, id) {
        return knex('restHours')
            .where({ id })
            .delete()
    },
    updateHours(knex, id, editedHour) {
        return knex('restHours')
            .where({ id })
            .update(editedHour)
    },
}

module.exports = HoursService;