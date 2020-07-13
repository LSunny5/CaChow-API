CREATE TABLE cachow_restaurants (
    r_id SERIAL PRIMARY KEY, 
    r_owner SERIAL REFERENCES cachow_users(user_id) ON DELETE CASCADE NOT NULL, 
    r_image TEXT, 
    r_type TEXT NOT NULL, 
    r_name TEXT NOT NULL, 
    r_address TEXT NOT NULL, 
    r_city TEXT NOT NULL, 
    r_state TEXT NOT NULL, 
    r_zip TEXT NOT NULL, 
    r_phone TEXT NOT NULL, 
    r_hours SERIAL REFERENCES restaurant_hours(hours_id) ON DELETE CASCADE NOT NULL
);