BEGIN;
INSERT INTO cachow_users (user_id, full_name, user_name, password)
VALUES
    (1, 'Not Assigned', 'NotAssignedOwner', 'test12345'),
    (2, 'John Smith', 'js12345', 'qwerty112233'),
    (3, 'Average Jane', 'aj12345', 'abcdefg'),
    (4, 'John Doe', 'jd12345', '123abc456'),
    (5, 'Jane Doe', 'jd67890', 'thisismypassword'),
    (6, 'Mr. Nobody', 'NobodyKnows', '00000');
COMMIT;
