CREATE TABLE cachow_users (
    userId SERIAL PRIMARY KEY, 
    uName TEXT NOT NULL, 
    uUsername TEXT NOT NULL
);

CREATE TABLE cachow_passwords (
    pId SERIAL PRIMARY KEY, 
    uId SERIAL REFERENCES cachow_users(userId) ON DELETE CASCADE NOT NULL, 
    uPassword TEXT NOT NULL
);

CREATE TABLE restHours (
    hId SERIAL PRIMARY KEY, 
    sunOpen TEXT NOT NULL, 
    sunClose TEXT NOT NULL,
    monOpen TEXT NOT NULL,
    monClose TEXT NOT NULL,
    tuesOpen TEXT NOT NULL,
    tuesClose TEXT NOT NULL,
    wedOpen TEXT NOT NULL,
    wedClose TEXT NOT NULL,
    thuOpen TEXT NOT NULL,
    thuClose TEXT NOT NULL,
    friOpen TEXT NOT NULL,
    friClose TEXT NOT NULL,
    satOpen TEXT NOT NULL,
    satClose TEXT NOT NULL
);

CREATE TABLE cachow_restaurants (
    rId SERIAL PRIMARY KEY, 
    rOwner SERIAL REFERENCES cachow_users(userId) ON DELETE CASCADE NOT NULL, 
    rImage TEXT, 
    rType TEXT NOT NULL, 
    rName TEXT NOT NULL, 
    rAddress TEXT NOT NULL, 
    rCity TEXT NOT NULL, 
    rState TEXT NOT NULL, 
    rZip TEXT NOT NULL, 
    rPhone TEXT NOT NULL, 
    rHours SERIAL REFERENCES restHours(hId) ON DELETE CASCADE NOT NULL
);

CREATE TABLE cachow_categories (
    cId SERIAL PRIMARY KEY, 
    cName TEXT NOT NULL
);

CREATE TABLE restMenu (
    mId SERIAL PRIMARY KEY, 
    mRestId SERIAL REFERENCES cachow_restaurants(rId) ON DELETE CASCADE NOT NULL, 
    mName TEXT NOT NULL, 
    mCat SERIAL REFERENCES cachow_categories(cId) ON DELETE CASCADE NOT NULL, 
    mPrice NUMERIC(3, 2)
);