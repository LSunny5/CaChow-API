BEGIN;
INSERT INTO cachow_users (userId, uName, uUsername)
VALUES
    (1, 'Not Assigned', 'NotAssignedOwner'),
    (2, 'John Smith', 'js12345'),
    (3, 'Average Jane', 'aj12345'),
    (4, 'John Doe', 'jd12345'),
    (5, 'Jane Doe', 'jd67890'),
    (6, 'Mr. Nobody', 'NobodyKnows');

INSERT INTO cachow_passwords (pId, uId, uPassword)
VALUES
    (1, 1, 'test12345'),
    (2, 2, 'abcdefg'),
    (3, 3, '123abc456'),
    (4, 4, 'thisismypassword'),
    (5, 5, '00000'),
    (6, 6, 'qwerty112233');
COMMIT;
