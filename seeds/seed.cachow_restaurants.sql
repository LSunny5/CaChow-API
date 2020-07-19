BEGIN;
INSERT INTO restaurant_hours (hours_id, sun_open, sun_close, mon_open, mon_close, tues_open, tues_close, wed_open, wed_close, thu_open, thu_close, fri_open, fri_close, sat_open, sat_close)
VALUES
    (1, '11:00AM', '9:00PM', '11:00AM', '9:00PM', '11:00AM', '9:00PM', '11:00AM', '9:00PM', '11:00AM', '9:00PM', '11:00AM', '9:00PM', '11:00AM', '9:00PM'),
    (2, 'Closed', 'Closed', '11:00AM', '7:00PM', '11:00AM', '7:00PM', '11:00AM', '7:00PM', '11:00AM', '7:00PM', '11:00AM', '7:00PM', '11:00AM', '5:00PM');

INSERT INTO cachow_restaurants (r_id, r_owner, r_image, r_type, r_name, r_address, r_city, r_state, r_zip, r_phone, r_hours)
VALUES
    (1, 'NotAssignedOwner', 'No Image', 'Fast Food', 'Shake Shack', '610 Commons Way', 'Bridgewater', 'NJ', '08807', '(732) 347-8820', 1),
    (2, 'js12345', 'No Image', 'Fast Food', 'Chick-fil-A', '3710 U.S. 9 Ste 2314', 'Freehold', 'NJ', '07728', '(732) 308-3402', 2);

INSERT INTO restaurant_menu (item_id, item_restaurant, item_name, item_cat, item_price)
VALUES
    (1, 1, 'Single ShackBurger', 1, 5.89), /*Burgers*/
    (2, 1, 'Single SmokeShack', 1, 7.39), /*Burgers*/
    (3, 1, 'Chick''n Shack', 2, 7.19), /*Chicken*/
    (4, 1, 'Cheese Fries', 3, 4.09), /*Sides*/
    (5, 1, 'S''mores Shake', 4, 5.99), /*Desserts*/
    (6, 1, 'Small Pink Lemonade', 5, 3.09), /*Drinks*/
    (7, 2, 'Chick-fil-A Chicken Sandwich', 2, 4.19), /*Chicken*/
    (8, 2, 'Chick-fil-A Nuggets', 2, 4.29), /*Chicken*/
    (9, 2, 'Chick-fil-A Cobb Salad', 6, 0.00), /*Salads*/
    (10, 2, 'Mac & Cheese', 3, 3.55), /*Sides*/
    (11, 2, 'Chocolate Chunk Cookie', 4, 1.45), /*Desserts*/
    (12, 2, 'Mango Passion Tea Lemonade', 5, 2.29); /*Drinks*/
COMMIT;