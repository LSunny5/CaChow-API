CREATE TABLE restaurant_menu (
    item_id SERIAL PRIMARY KEY, 
    item_restaurant SERIAL REFERENCES cachow_restaurants(r_id) ON DELETE CASCADE NOT NULL, 
    item_name TEXT NOT NULL, 
    item_cat SERIAL REFERENCES cachow_categories(cat_id) ON DELETE CASCADE NOT NULL, 
    item_price MONEY
);