-- V2 Migration: Insert dummy data for Money Market System
-- Note: GL_setup data is handled in V3 migration
-- This migration focuses on core business data with proper backend logic

-- Customer dummy data (Enhanced with realistic money market participants)
INSERT INTO Cust_Master (Ext_Cust_Id, Cust_Type, First_Name, Last_Name, Trade_Name, Address_1, Mobile, Branch_Code, Maker_Id, Entry_Date, Entry_Time, Verifier_Id, Verification_Date, Verification_Time) VALUES 
-- Individual Customers
('IND001', 'Individual', 'John', 'Doe', NULL, '123 Financial District, New York', '1234567890', 'BR001', 'ADMIN', CURDATE(), '09:00:00', 'MANAGER', CURDATE(), '09:30:00'),
('IND002', 'Individual', 'Jane', 'Smith', NULL, '456 Wall Street, New York', '9876543210', 'BR001', 'ADMIN', CURDATE(), '10:15:00', 'MANAGER', CURDATE(), '10:45:00'),
('IND003', 'Individual', 'Robert', 'Johnson', NULL, '789 Investment Ave, Chicago', '5555551234', 'BR002', 'ADMIN', CURDATE(), '11:00:00', NULL, NULL, NULL),

-- Corporate Customers  
('CORP001', 'Corporate', NULL, NULL, 'Alpha Investment Corp', '100 Corporate Plaza, Boston', '2223334444', 'BR001', 'ADMIN', CURDATE(), '09:15:00', 'MANAGER', CURDATE(), '10:00:00'),
('CORP002', 'Corporate', NULL, NULL, 'Beta Financial Services', '200 Business Center, Miami', '3334445555', 'BR003', 'ADMIN', CURDATE(), '14:00:00', 'MANAGER', CURDATE(), '14:30:00'),
('CORP003', 'Corporate', NULL, NULL, 'Gamma Holdings Ltd', '300 Trade Tower, Seattle', '4445556666', 'BR001', 'ADMIN', CURDATE(), '15:30:00', NULL, NULL, NULL),

-- Bank Customers (Primary money market participants)
('BANK001', 'Bank', NULL, NULL, 'Federal Reserve Bank of NY', '33 Liberty Street, New York', '2129205000', 'BR001', 'ADMIN', CURDATE(), '08:00:00', 'MANAGER', CURDATE(), '08:30:00'),
('BANK002', 'Bank', NULL, NULL, 'Chase Manhattan Bank', '270 Park Avenue, New York', '2129355000', 'BR001', 'ADMIN', CURDATE(), '08:30:00', 'MANAGER', CURDATE(), '09:00:00'),
('BANK003', 'Bank', NULL, NULL, 'Bank of America Corp', '100 N Tryon Street, Charlotte', '7043865000', 'BR002', 'ADMIN', CURDATE(), '09:30:00', 'MANAGER', CURDATE(), '10:00:00'),
('BANK004', 'Bank', NULL, NULL, 'Wells Fargo Bank', '420 Montgomery Street, San Francisco', '4156361000', 'BR003', 'ADMIN', CURDATE(), '16:00:00', NULL, NULL, NULL);

-- Product dummy data (Updated to use new GL numbers from V3)
INSERT INTO Prod_Master (Product_Code, Product_Name, Cum_GL_Num, Maker_Id, Entry_Date, Entry_Time, Verifier_Id, Verification_Date, Verification_Time) VALUES 
('SAV-DEP', 'Savings Bank Deposit', '110101000', 'ADMIN', CURDATE(), '08:00:00', 'MANAGER', CURDATE(), '08:30:00'),
('CUR-DEP', 'Current Account Deposit', '110102000', 'ADMIN', CURDATE(), '08:15:00', 'MANAGER', CURDATE(), '08:45:00'),
('TD-DEP', 'Term Deposit', '110201000', 'ADMIN', CURDATE(), '08:30:00', 'MANAGER', CURDATE(), '09:00:00'),
('OD-LOAN', 'Overdraft Loan', '210201000', 'ADMIN', CURDATE(), '08:45:00', 'MANAGER', CURDATE(), '09:15:00');

-- Sub-product dummy data (Using explicit Product_Id values)
INSERT INTO Sub_Prod_Master (Product_Id, Sub_Product_Code, Sub_Product_Name, Intt_Code, Cum_GL_Num, Ext_GL_Num, Sub_Product_Status, Maker_Id, Entry_Date, Entry_Time, Verifier_Id, Verification_Date, Verification_Time) VALUES 
-- Savings Bank Sub-products (Product_Id = 1 for SAV-DEP)
(1, 'SAV-REG', 'Savings Bank Regular', 'SAV-INT', '110101001', '001', 'Active', 'ADMIN', CURDATE(), '09:00:00', 'MANAGER', CURDATE(), '09:30:00'),
(1, 'SAV-SEN', 'Savings Bank (Sr. Citizen)', 'SAV-SEN', '110101002', '002', 'Active', 'ADMIN', CURDATE(), '09:15:00', 'MANAGER', CURDATE(), '09:45:00'),

-- Current Account Sub-products (Product_Id = 2 for CUR-DEP)
(2, 'CUR-REG', 'Current Account Regular', 'CUR-INT', '110102001', '001', 'Active', 'ADMIN', CURDATE(), '09:30:00', 'MANAGER', CURDATE(), '10:00:00'),

-- Term Deposit Sub-products (Product_Id = 3 for TD-DEP)
(3, 'TD-CUM', 'Term Deposit Cum', 'TD-CUM', '110201001', '001', 'Active', 'ADMIN', CURDATE(), '09:45:00', 'MANAGER', CURDATE(), '10:15:00'),
(3, 'TD-NON', 'Term Deposit Non Cum', 'TD-NON', '110201002', '002', 'Active', 'ADMIN', CURDATE(), '10:00:00', 'MANAGER', CURDATE(), '10:30:00'),

-- Overdraft Sub-products (Product_Id = 4 for OD-LOAN)
(4, 'OD-TD', 'OD against TD', 'OD-INT', '210201001', '001', 'Active', 'ADMIN', CURDATE(), '10:15:00', 'MANAGER', CURDATE(), '10:45:00');

-- Customer accounts dummy data (Using explicit Sub_Product_Id values)
INSERT INTO Cust_Acct_Master (Account_No, Sub_Product_Id, GL_Num, Cust_Id, Cust_Name, Acct_Name, Date_Opening, Tenor, Date_Maturity, Date_Closure, Branch_Code, Account_Status) VALUES 
-- Savings Bank Regular Accounts (Sub_Product_Id = 1)
('110101001001', 1, '110101001', 1, 'John Doe', 'John Doe Savings Account', CURDATE(), NULL, NULL, NULL, 'BR001', 'Active'),
('110101001002', 1, '110101001', 2, 'Jane Smith', 'Jane Smith Savings Account', CURDATE(), NULL, NULL, NULL, 'BR001', 'Active'),
('110101001003', 1, '110101001', 3, 'Robert Johnson', 'Robert Johnson Savings Account', DATE_SUB(CURDATE(), INTERVAL 30 DAY), NULL, NULL, NULL, 'BR002', 'Active'),

-- Savings Bank (Sr. Citizen) Accounts (Sub_Product_Id = 2)
('110101002001', 2, '110101002', 4, 'Alpha Investment Corp', 'Alpha Corp Senior Account', CURDATE(), NULL, NULL, NULL, 'BR001', 'Active'),
('110101002002', 2, '110101002', 5, 'Beta Financial Services', 'Beta Corp Senior Account', DATE_SUB(CURDATE(), INTERVAL 15 DAY), NULL, NULL, NULL, 'BR003', 'Active'),

-- Current Account Regular (Sub_Product_Id = 3)
('110102001001', 3, '110102001', 6, 'Gamma Holdings Ltd', 'Gamma Holdings Current Account', CURDATE(), NULL, NULL, NULL, 'BR001', 'Active'),

-- Term Deposit Cum (Sub_Product_Id = 4)
('110201001001', 4, '110201001', 7, 'Federal Reserve Bank of NY', 'Fed Term Deposit', CURDATE(), 30, DATE_ADD(CURDATE(), INTERVAL 30 DAY), NULL, 'BR001', 'Active'),
('110201001002', 4, '110201001', 8, 'Chase Manhattan Bank', 'Chase Term Deposit', DATE_SUB(CURDATE(), INTERVAL 10 DAY), 60, DATE_ADD(CURDATE(), INTERVAL 50 DAY), NULL, 'BR001', 'Active'),

-- Term Deposit Non Cum (Sub_Product_Id = 5)
('110201002001', 5, '110201002', 9, 'Bank of America Corp', 'BoA Term Deposit', CURDATE(), 90, DATE_ADD(CURDATE(), INTERVAL 90 DAY), NULL, 'BR002', 'Active'),
('110201002002', 5, '110201002', 10, 'Wells Fargo Bank', 'Wells Fargo Term Deposit', DATE_SUB(CURDATE(), INTERVAL 5 DAY), 180, DATE_ADD(CURDATE(), INTERVAL 175 DAY), NULL, 'BR003', 'Active'),

-- OD against TD (Sub_Product_Id = 6)
('210201001001', 6, '210201001', 4, 'Alpha Investment Corp', 'Alpha Corp OD Facility', CURDATE(), NULL, NULL, NULL, 'BR001', 'Active'),
('210201001002', 6, '210201001', 5, 'Beta Financial Services', 'Beta Corp OD Facility', DATE_SUB(CURDATE(), INTERVAL 7 DAY), NULL, NULL, NULL, 'BR003', 'Active');

-- Account balance initialization (Updated balances for new structure)
INSERT INTO Acct_Bal (Account_No, Current_Balance, Available_Balance) VALUES 
-- Savings Bank Regular (Credit balances)
('110101001001', 500000.00, 500000.00),
('110101001002', 750000.00, 750000.00), 
('110101001003', 300000.00, 300000.00),

-- Savings Bank (Sr. Citizen) (Credit balances)
('110101002001', 1200000.00, 1200000.00),
('110101002002', 800000.00, 800000.00),

-- Current Account Regular (Credit balance)
('110102001001', 2000000.00, 2000000.00),

-- Term Deposit Cum (Credit balances)
('110201001001', 5000000.00, 5000000.00),
('110201001002', 3000000.00, 3000000.00),

-- Term Deposit Non Cum (Credit balances)
('110201002001', 10000000.00, 10000000.00),
('110201002002', 7500000.00, 7500000.00),

-- OD against TD (Debit balances - loans)
('210201001001', 1500000.00, 1500000.00),
('210201001002', 2200000.00, 2200000.00);

-- Interest Accrual Transactions will be created when actual transactions are processed
-- Skipping for now as they require Tran_Id references from Tran_Table

-- Display summary information
SELECT 'V2 Migration Complete - Business Data Inserted!' as Status;
SELECT 'Total Customers Created:' as Summary, COUNT(*) as Count FROM Cust_Master
UNION ALL
SELECT 'Total Products Created:', COUNT(*) FROM Prod_Master  
UNION ALL
SELECT 'Total Sub-Products Created:', COUNT(*) FROM Sub_Prod_Master
UNION ALL
SELECT 'Total Customer Accounts Created:', COUNT(*) FROM Cust_Acct_Master
UNION ALL
SELECT 'Total Account Balances Created:', COUNT(*) FROM Acct_Bal;