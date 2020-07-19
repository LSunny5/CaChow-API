BEGIN;
INSERT INTO cachow_users (user_id, full_name, user_name, password)
VALUES
    (1, 'Not Assigned', 'NotAssignedOwner', 'test12345#'), 
    (2, 'John Smith', 'js12345', 'Example!123');
COMMIT;
