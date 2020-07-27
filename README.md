# Cachow - API

## Client Repo Location
In use with the Cachow React Client located at https://github.com/LSunny5/CaChow-Client 

## React App
Link to the Live App:  https://cachow.vercel.app/   

## Description 
Cachow is a site where you can see and enter menus for different restaurants and easily access it from one site.  Inspiration is from family and friends who are always browsing through several sites to find the menus for different food places.  This repo is for the API that allows the client to obtain data from the database and display the results on the client.  JWT Authentication is also set up for this API.  

## API Documentation
This is the documentation for the Cachow API

### Endpoints:
#### Categories Endpoints:   
##### Base page Test Endpoint 
GET /api 
```javascript
"Welcome to Cachow API!"
```
##### Get all categories
GET /api/category/         
```javascript
JSON:  [
    {
        "cat_id":1,                    // (Category ID)
        "cat_name":"Burgers"           // (Category Name)
    },
    {
        "cat_id":2,
        "cat_name":"Chicken"
    },
    {   ...
```

##### Post a New Category   
*Protected Endpoint (Uses JWT)  <br />
POST /api/category/            
```javascript
Example Body                    
    { 
	    "cat_name": "test"
    }
```

##### Get a single Category
GET /api/category/:cat_id       <br />
Example: /api/category/10
```javascript
JSON 
    {
        "cat_id": 10,
        "cat_name": "Entree"
    }
```

##### Delete Category
*Protected Endpoint (Uses JWT)
DELETE /api/category/:cat_id        <br />
Example: /api/category/10
```javascript
JSON: empty
```

##### Update a category
*Protected Endpoint (Uses JWT)
PATCH /api/category/:cat_id         <br />
Example: /api/category/10
```javascript
Example Body
{ 
	"cat_name": "test 1 edited"
}
```

#### Restaurant Hours Table
##### Get all hours for restaurants
GET /api/hours/
```javascript
JSON:  [
    {
        "hours_id":1,                       (Hours ID)
        "sun_open":"11:00AM",               (Time Sunday Open)
        "sun_close":"9:00PM",               (Time Sunday Closed)
        "mon_open":"11:00AM",               (Time Monday Open)
        "mon_close":"9:00PM",               (Time Monday Closed)
        "tues_open":"11:00AM",              (Time Tuesday Open)
        "tues_close":"9:00PM",              (Time Tuesday Closed)
        "wed_open":"11:00AM",               (Time Wednesday Open)
        "wed_close":"9:00PM",               (Time Wednesday Closed)
        "thu_open":"11:00AM",               (Time Thursday Open)
        "thu_close":"9:00PM",               (Time Thursday Closed)
        "fri_open":"11:00AM",               (Time Friday Open)
        "fri_close":"9:00PM",               (Time Friday Closed)
        "sat_open":"11:00AM",               (Time Saturday Open)
        "sat_close":"9:00PM",               (Time Saturday Closed)
        "hours_owner":"notassignedowner"    (User Hours is assigned to)
    },
    {   ...
```

##### Post a restaurant's hours
*Protected Endpoint (Uses JWT)
POST /api/hours/                    <br />
```javascript
Example Body 
{ 
	"sun_open":"11:00AM",               
    "sun_close":"9:00PM",              
    "mon_open":"11:00AM",    
    "mon_close":"9:00PM",            
    "tues_open":"11:00AM",             
    "tues_close":"9:00PM",     
    "wed_open":"11:00AM",        
    "wed_close":"9:00PM",     
    "thu_open":"11:00AM",             
    "thu_close":"9:00PM",              
    "fri_open":"11:00AM",             
    "fri_close":"9:00PM",           
    "sat_open":"11:00AM",            
    "sat_close":"9:00PM",             
    "hours_owner":"johndoe"           
}
```

##### Get a single restaurant's hours
GET /api/hours/:hours_id 
Example: /api/hours/2               <br />
```javascript
JSON 
{
    "hours_id":2,
    "sun_open":"Closed",
    "sun_close":"Closed",
    "mon_open":"11:00AM",
    "mon_close":"7:00PM",
    "tues_open":"11:00AM",
    "tues_close":"7:00PM",
    "wed_open":"11:00AM",
    "wed_close":"7:00PM",
    "thu_open":"11:00AM",
    "thu_close":"7:00PM",
    "fri_open":"11:00AM",
    "fri_close":"7:00PM",
    "sat_open":"11:00AM",
    "sat_close":"5:00PM",
    "hours_owner":"js12345"
}
```

##### Delete a restaurant's hours
*Protected Endpoint (Uses JWT)  
DELETE /api/hours/:hours_id             <br />
Example: /api/hours/3
```javascript
JSON: empty
```

##### Update a restaurant's hours
*Protected Endpoint (Uses JWT)
PATCH /api/hours/:hours_id              <br />
Example: /api/hours/2
```javascript
Example Body 
{ 
	"hours_id":2,
    "sun_open":"Closed",
    "sun_close":"Closed",
    "mon_open":"11:00AM",
    "mon_close":"7:00PM",
    "tues_open":"11:00AM",
    "tues_close":"7:00PM",
    "wed_open":"11:00AM",
    "wed_close":"7:00PM",
    "thu_open":"11:00AM",
    "thu_close":"7:00PM",
    "fri_open":"11:00AM",
    "fri_close":"7:00PM",
    "sat_open":"11:00AM",
    "sat_close":"5:00PM",
    "hours_owner":"js12345"
}
```

#### Menu Items Table
##### Get all items
GET /api/menu/
```javascript
JSON:  [
    {
        "item_id":1,                            (Item ID)
        "item_restaurant":1,                    (ID of restaurant Item is present at)
        "item_name":"Single ShackBurger",       (Name of Item)
        "item_cat":1,                           (Category the item is located in)
        "item_price":"$5.89"                    (Price of the item)
    },
    {   ...
```

##### Post a new item
*Protected Endpoint (Uses JWT)              
POST /api/menu/                     <br />
```javascript
Example Body                
{ 
	"item_restaurant":1,                
    "item_name":"Another Sandwich",      
    "item_cat":2,                          
    "item_price":"$5.50"            
}
```

##### Get a single item
GET /api/menu/:item_id 
Example: /api/menu/9            <br />
```javascript
JSON 
{
    "item_id":9,
    "item_restaurant":2,
    "item_name":"Chick-fil-A Cobb Salad",
    "item_cat":6,
    "item_price":"$0.00"
}
```

##### Delete a menu item
*Protected Endpoint (Uses JWT)
DELETE /api/menu/:item_id           <br />
Example: /api/menu/3
```javascript
JSON: empty
``` 

##### Update a menu item
*Protected Endpoint (Uses JWT)
PATCH /api/menu/:item_id            <br />
Example: /api/menu/2
```javascript
Example Body 
{ 
	"item_id":2,
    "item_restaurant":1,
    "item_name":"Single SmokeShack",
    "item_cat":1,
    "item_price":"$9.99"
}
```

#### Restaurants Table
##### Get all restaurants
GET /api/restaurants/
```javascript
JSON:  [
    {
        "r_id":1,                               (Restaurant ID)
        "r_owner":"notassignedowner",           (Restaurant Owner)
        "r_image":"No Image",                   (Restaurant image)
        "r_type":"Fast Food",                   (Type of Restaurant)
        "r_name":"Shake Shack",                 (Restaurant Name)
        "r_address":"610 Commons Way",          (Restaurant Address)
        "r_city":"Bridgewater",                 (Restaurant City)
        "r_state":"NJ",                         (Restaurant State)
        "r_zip":"08807",                        (Restaurant Zip Code)
        "r_phone":"(732) 347-8820",             (Restaurant Phone)
        "r_hours":1                             (Restaurant Hours ID that matches the hours)
    },
    {   ...
```

##### Post a new restaurant
*Protected Endpoint (Uses JWT)          <br />
POST /api/restaurants/              
```javascript
Example Body 
{ 
	"r_owner":"guest",
    "r_image":"No Image",
    "r_type":"Fine Dining",
    "r_name":"Random Restaurant",
    "r_address":"123 Some Way",
    "r_city":"Some City",
    "r_state":"NJ",
    "r_zip":"12345",
    "r_phone":"(111) 111-1111",
    "r_hours":1
}
```
##### Get a single restaurant
GET /api/restaurants/:r_id          <br />
Example: /api/restaurants/2
```javascript
JSON 
{
    "r_id":2,
    "r_owner":"js12345",
    "r_image":"No Image",
    "r_type":"Fast Food",
    "r_name":"Chick-fil-A",
    "r_address":"3710 U.S. 9 Ste 2314",
    "r_city":"Freehold",
    "r_state":"NJ",
    "r_zip":"07728",
    "r_phone":"(732) 308-3402",
    "r_hours":2
}
```

##### Delete a restaurant
*Protected Endpoint (Uses JWT)          <br />
DELETE /api/restaurants/:r_id           <br />
Example: /api/restaurants/3
```javascript
JSON: empty
```

##### Update a restaurant
*Protected Endpoint (Uses JWT)          <br />
PATCH /api/restaurants/:r_id            <br />
Example: /api/restaurants/2
```javascript
Example Body 
{ 
    "r_id":2,
    "r_owner":"js12345",
    "r_image":"Image here",
    "r_type":"Fast Food",
    "r_name":"New Name",
    "r_address":"3710 U.S. 9 Ste 2314",
    "r_city":"Freehold",
    "r_state":"NJ",
    "r_zip":"07728",
    "r_phone":"(732) 308-3402",
    "r_hours":2
}
```

#### Users Table
##### Post a new user
*Protected Endpoint (Uses JWT)      <br />
POST /api/users/ 
```javascript
Example Body 
{ 
    "full_name":"John Doe",                     (Full name of user)
    "user_name":"JohnDoeUser",                  (Username of user)
    "password":"Somepassword",                  (Password of user - will be encrypted)
}
```

##### Delete a user
*Protected Endpoint (Uses JWT)          <br />
DELETE /api/users/:user_name            <br />
Example: /api/users/johndoeuser
```javascript
JSON: empty
```

### Validation errors 
Errors will be thrown for these reasons: 

#### Error example Cannot POST /api/category/
This message will occur due to the following reasons
##### Category Name
If the category name field in body is less than 3 or more than 50 characters an error will be returned and not added to database.  
If the category name field in body is empty an error will be returned and not added to database.

## Hosted on 
Heroku

## Technologies Used
Node, Express, Knex, PostgreSQL, Postgrator

### Express Boilerplate Used
Boilerplate project used for starting this project.
Template has cors, dotenv, express, helmet, morgan, and winston

### Scripts
Start the application `npm start`
Start nodemon for the application `npm run dev`
Run the tests `npm test`

### Deploying
`npm run deploy`