const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

//fake data for testing users
function makeUsersArray() {
  return [
    {
      user_id: 1,
      user_name: 'test-user-1',
      full_name: 'Test user 1',
      password: 'password',
      date_created: new Date('2019-01-22T16:28:32.615Z'),
    },
    {
      user_id: 2,
      user_name: 'test-user-2',
      full_name: 'Test user 2',
      password: 'password',
      date_created: new Date('2019-01-22T16:28:32.615Z'),
    },
    {
      user_id: 3,
      user_name: 'test-user-3',
      full_name: 'Test user 3',
      password: 'password',
      date_created: new Date('2019-01-22T16:28:32.615Z'),
    },
  ]
}

//fake data for testing categories
function makeCategoriesArray() {
  return [
    {
      cat_id: 1,
      cat_name: 'TestCat1',
    },
    {
      cat_id: 2,
      cat_name: 'TestCat2',
    },
    {
      cat_id: 3,
      cat_name: 'TestCat3',
    },
  ];
};

//fake data for testing hours
function makeHoursArray() {
  return [
    {
      hours_id: 1,
      sun_open: "Closed",
      sun_close: "Closed",
      mon_open: "Closed",
      mon_close: "Closed",
      tues_open: "Closed",
      tues_close: "Closed",
      wed_open: "Closed",
      wed_close: "Closed",
      thu_open: "Closed",
      thu_close: "Closed",
      fri_open: "Closed",
      fri_close: "Closed",
      sat_open: "Closed",
      sat_close: "Closed",
      hours_owner: "test-user-1",
    },
    {
      hours_id: 2,
      sun_open: "Open",
      sun_close: "Open",
      mon_open: "Open",
      mon_close: "Open",
      tues_open: "Open",
      tues_close: "Open",
      wed_open: "Open",
      wed_close: "Open",
      thu_open: "Open",
      thu_close: "Open",
      fri_open: "Open",
      fri_close: "Open",
      sat_open: "Open",
      sat_close: "Open",
      hours_owner: 'test-user-2',
    },
    {
      hours_id: 3,
      sun_open: "1:00PM",
      sun_close: "12:00AM",
      mon_open: "2:00AM",
      mon_close: "11:00PM",
      tues_open: "3:00AM",
      tues_close: "10:00PM",
      wed_open: "4:00PM",
      wed_close: "9:00PM",
      thu_open: "5:00PM",
      thu_close: "8:00PM",
      fri_open: "6:00AM",
      fri_close: "7:00PM",
      sat_open: "Closed",
      sat_close: "Closed",
      hours_owner: 'test-user-3',
    },
  ];
};

//fake data for testing restaurants
function makeRestaurantsArray() {
  return [
    {
      r_id: 1,
      r_owner: 'test-user-1',
      r_image: 'test1Image',
      r_type: 'Fast',
      r_name: 'TestRestaurant1',
      r_address: 'Test1Address',
      r_city: 'Test1City',
      r_state: 'Test1State',
      r_zip: 'Test1Zip',
      r_phone: 'Test1Phone',
      r_hours: 1,
    },
    {
      r_id: 2,
      r_owner: 'test-user-2',
      r_image: 'TestCat1',
      r_type: 'Fine',
      r_name: 'TestRestaurant2',
      r_address: 'Test2Address',
      r_city: 'Test2City',
      r_state: 'Test2State',
      r_zip: 'Test2Zip',
      r_phone: 'Test2Phone',
      r_hours: 2,
    },
    {
      r_id: 3,
      r_owner: 'test-user-3',
      r_image: 'TestCat1',
      r_type: 'Mediterranean',
      r_name: 'TestRestaurant3',
      r_address: 'Test3Address',
      r_city: 'Test3City',
      r_state: 'Test3State',
      r_zip: 'Test3Zip',
      r_phone: 'Test3Phone',
      r_hours: 3,
    },
  ];
};

//fake data for testing items
function makeItemsArray() {
  return [
    {
      item_id: 1,
      item_restaurant: 1,
      item_name: 'TestItem1',
      item_cat: 1,
      item_price: '$1.11',
    },
    {
      item_id: 2,
      item_restaurant: 2,
      item_name: 'TestItem2',
      item_cat: 2,
      item_price: '$2.22',
    },
    {
      item_id: 3,
      item_restaurant: 3,
      item_name: 'TestItem1',
      item_cat: 3,
      item_price: '$3.33',
    },
  ];
};

/****************************************/
//make malicious category
function makeMaliciousCategory() {
  const maliciousCategory = {
    cat_id: 123,
    cat_name: 'Naughty <script>alert("xss");</script>',
  }
  const expectedCategory = {
    ...maliciousCategory,
    cat_name: 'Naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
  }
  return {
    maliciousCategory,
    expectedCategory,
  }
};

//make malicious hours
function makeMaliciousHours() {
  const maliciousHours = {
    hours_id: 123,
    sun_open: 'Naughty <script>alert("xss");</script>',
    sun_close: 'Naughty <script>alert("xss");</script>',
    mon_open: 'Naughty <script>alert("xss");</script>',
    mon_close: 'Naughty <script>alert("xss");</script>',
    tues_open: 'Naughty <script>alert("xss");</script>',
    tues_close: 'Naughty <script>alert("xss");</script>',
    wed_open: 'Naughty <script>alert("xss");</script>',
    wed_close: 'Naughty <script>alert("xss");</script>',
    thu_open: 'Naughty <script>alert("xss");</script>',
    thu_close: 'Naughty <script>alert("xss");</script>',
    fri_open: 'Naughty <script>alert("xss");</script>',
    fri_close: 'Naughty <script>alert("xss");</script>',
    sat_open: 'Naughty <script>alert("xss");</script>',
    sat_close: 'Naughty <script>alert("xss");</script>',
    hours_owner: 'test-user-1'
  }
  const expectedHours = {
    ...maliciousHours,
    sun_open: 'Naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    sun_close: 'Naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    mon_open: 'Naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    mon_close: 'Naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    tues_open: 'Naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    tues_close: 'Naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    wed_open: 'Naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    wed_close: 'Naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    thu_open: 'Naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    thu_close: 'Naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    fri_open: 'Naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    fri_close: 'Naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    sat_open: 'Naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    sat_close: 'Naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    hours_owner: 'test-user-1'
  }
  return {
    maliciousHours,
    expectedHours,
  }
};

//make malicious restaurants
function makeMaliciousRestaurants() {
  const maliciousRestaurant = {
    r_id: 123,
    r_owner: 1,
    r_image: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    r_type: 'Naughty naughty very naughty <script>alert("xss");</script>',
    r_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
    r_address: 'Naughty naughty very naughty <script>alert("xss");</script>',
    r_city: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    r_state: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    r_zip: 'Naughty naughty very naughty <script>alert("xss");</script>',
    r_phone: 'Naughty naughty very naughty <script>alert("xss");</script>',
    r_hours: 1,
  }
  const expectedRestaurants = {
    ...maliciousRestaurant,
    r_image: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
    r_type: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    r_name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    r_address: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    r_city: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
    r_state: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
    r_zip: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    r_phone: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
  }
  return {
    maliciousRestaurant,
    expectedRestaurants,
  }
};

//make malicious items
function makeMaliciousItems() {
  const maliciousItems = {
    item_id: 911,
    item_restaurant: 1,
    item_name: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    item_cat: 1,
    item_price: '$123.12',
  }
  const expectedItems = {
    ...maliciousItems,
    item_name: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  }
  return {
    maliciousItems,
    expectedItems,
  }
};

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('cachow_users').insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(
        `SELECT setval('cachow_users_user_id_seq', ?)`,
        [users[users.length - 1].user_id],
      )
    )
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.user_name,
    algorithm: 'HS256',
  })
  return `Bearer ${token}`
}

module.exports = {
  makeUsersArray,
  makeCategoriesArray,
  makeHoursArray,
  makeRestaurantsArray,
  makeItemsArray,
  makeMaliciousCategory,
  makeMaliciousHours,
  makeMaliciousRestaurants,
  makeMaliciousItems,
  seedUsers,
  makeAuthHeader,
}