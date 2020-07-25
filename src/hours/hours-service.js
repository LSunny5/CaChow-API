const xss = require('xss');

const HoursService = {
    getAllHours(knex) {
        return knex.select('*').from('restaurant_hours')
    },
    getById(knex, id) {
        return knex.from('restaurant_hours').select('*').where('hours_id', id || 0).first()
    },
    insertHours(knex, newHours) {
        return knex
            .insert(newHours)
            .into('restaurant_hours')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    deleteHours(knex, hours_id) {
        return knex('restaurant_hours')
            .where({ hours_id })
            .delete()
    },
    updateHours(knex, hours_id, editedHour) {
        return knex('restaurant_hours')
            .where({ hours_id })
            .update(editedHour)
    },
    validateHour(hour) {
        if (hour.length < 8 || hour.length > 4) {
            return `Hour given must be "Closed" or 7:00PM format`;
        };
        return null;
    },
    serializeHour(hour) {
        return {
            hours_id: hour.hours_id,
            sun_open: xss(hour.sun_open),
            sun_close: xss(hour.sun_close),
            mon_open: xss(hour.mon_open),
            mon_close: xss(hour.mon_close),
            tues_open: xss(hour.tues_open),
            tues_close: xss(hour.tues_close),
            wed_open: xss(hour.wed_open),
            wed_close: xss(hour.wed_close),
            thu_open: xss(hour.thu_open),
            thu_close: xss(hour.thu_close),
            fri_open: xss(hour.fri_open),
            fri_close: xss(hour.fri_close),
            sat_open: xss(hour.sat_open),
            sat_close: xss(hour.sat_close),
            hours_owner: xss(hour.hours_owner),
        }
    }
}

module.exports = HoursService;