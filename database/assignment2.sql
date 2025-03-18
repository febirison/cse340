-- ***************************************************
-- Task 1: Insert Tony Stark Account Record
-- ***************************************************
-- Adds a new account with default 'Client' role (auto-generated account_id)
INSERT INTO account (account_firstname, account_lastname, account_email, account_password)  
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n'); 

-- ***************************************************
-- Task 2: Update Tony Stark's Role to Admin
-- ***************************************************
-- Modifies the account_type to 'Admin' using account_id (primary key)
UPDATE account  
SET account_type = 'Admin'  
WHERE account_id = 1; 

-- ***************************************************
-- Task 3: Delete Tony Stark's Account
-- ***************************************************
-- Removes the account using account_id (primary key)
DELETE FROM account  
WHERE account_id = 1; 

-- ***************************************************
-- Task 4: Update GM Hummer Description
-- ***************************************************
-- Uses PostgreSQL REPLACE() to fix the description without retyping
UPDATE inventory  
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')  
WHERE inv_make = 'GM' AND inv_model = 'Hummer';  

-- ***************************************************
-- Task 5: Join Inventory and Classification for 'Sport' Category
-- ***************************************************
-- Returns make, model, and classification name for Sport vehicles
SELECT i.inv_make, i.inv_model, c.classification_name  
FROM inventory AS i  
INNER JOIN classification AS c  
ON i.classification_id = c.classification_id  
WHERE c.classification_name = 'Sport'; 

-- ***************************************************
-- Task 6: Update Image Paths to Include '/vehicles/'
-- ***************************************************
-- Adds '/vehicles/' to inv_image and inv_thumbnail paths for consistency
UPDATE inventory  
SET  
  inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),  
  inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/'); 