CREATE TABLE restaurant_hours (
    hours_id SERIAL PRIMARY KEY, 
    sun_open TEXT NOT NULL, 
    sun_close TEXT NOT NULL,
    mon_open TEXT NOT NULL,
    mon_close TEXT NOT NULL,
    tues_open TEXT NOT NULL,
    tues_close TEXT NOT NULL,
    wed_open TEXT NOT NULL,
    wed_close TEXT NOT NULL,
    thu_open TEXT NOT NULL,
    thu_close TEXT NOT NULL,
    fri_open TEXT NOT NULL,
    fri_close TEXT NOT NULL,
    sat_open TEXT NOT NULL,
    sat_close TEXT NOT NULL, 
    hours_owner TEXT REFERENCES cachow_users(user_name) ON DELETE CASCADE NOT NULL
);