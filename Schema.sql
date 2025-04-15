-- MySQL Script to create the Cooperative Management System Database Schema

-- Drop database if it exists and create a new one
DROP DATABASE IF EXISTS cooperative_db;
CREATE DATABASE cooperative_db;
USE cooperative_db;

-- MEMBERS table
CREATE TABLE MEMBERS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reg_no VARCHAR(50) UNIQUE,
    staff_no VARCHAR(50) UNIQUE,
    email VARCHAR(100),
    firstname VARCHAR(100),
    surname VARCHAR(100),
    gender VARCHAR(10),
    dob DATE,
    date_of_appoint DATE,
    retirement_date DATE,
    mobile_no VARCHAR(20),
    state_of_origin VARCHAR(50),
    rank_grade VARCHAR(50),
    bank_name VARCHAR(100),
    acct_no VARCHAR(20),
    member_status ENUM('Active', 'Inactive', 'Retired', 'Suspended', 'Terminated'),
    profile_photo_url VARCHAR(255),
    bio TEXT,
    last_profile_update DATE
);

-- USERS table
CREATE TABLE USERS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staff_no VARCHAR(50),
    email VARCHAR(100),
    password VARCHAR(255),
    login_type VARCHAR(50),
    login_status VARCHAR(50),
    last_login TIMESTAMP,
    reset_token VARCHAR(255),
    token_expiry TIMESTAMP,
    dashboard_tour_completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (staff_no) REFERENCES MEMBERS(staff_no) ON DELETE CASCADE
);

-- TRANSACTION_TYPES table
CREATE TABLE TRANSACTION_TYPES (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(100) UNIQUE,
    description VARCHAR(255),
    is_credit BOOLEAN,
    is_debit BOOLEAN,
    is_default BOOLEAN,
    is_active BOOLEAN,
    default_interest_rate DECIMAL(10, 2),
    default_term_months INT,
    created_at DATE,
    updated_at DATE
);

-- LOANS table
CREATE TABLE LOANS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ref_no VARCHAR(50) UNIQUE,
    staff_no VARCHAR(50),
    reg_no VARCHAR(50),
    transaction_type_id INT,
    amount_requested DECIMAL(15, 2),
    monthly_repayment DECIMAL(15, 2),
    repayment_period INT,
    interest_rate DECIMAL(5, 2),
    purpose VARCHAR(255),
    status VARCHAR(50),
    date_applied DATE,
    date_approved DATE,
    next_repayment_date DATE,
    remaining_balance DECIMAL(15, 2),
    rejection_reason VARCHAR(255),
    loan_documents_url VARCHAR(255),
    FOREIGN KEY (staff_no) REFERENCES MEMBERS(staff_no),
    FOREIGN KEY (reg_no) REFERENCES MEMBERS(reg_no),
    FOREIGN KEY (transaction_type_id) REFERENCES TRANSACTION_TYPES(id)
);

-- GUARANTORS table
CREATE TABLE GUARANTORS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ref_no VARCHAR(50),
    applicant_reg_no VARCHAR(50),
    guarantor_staff_no VARCHAR(50),
    guaranteed_amount DECIMAL(15, 2),
    status VARCHAR(50),
    request_date DATE,
    response_date DATE,
    guarantor_comment TEXT,
    FOREIGN KEY (ref_no) REFERENCES LOANS(ref_no),
    FOREIGN KEY (applicant_reg_no) REFERENCES MEMBERS(reg_no),
    FOREIGN KEY (guarantor_staff_no) REFERENCES MEMBERS(staff_no)
);

-- TRANSACTIONS table
CREATE TABLE TRANSACTIONS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reg_no VARCHAR(50),
    staff_no VARCHAR(50),
    transaction_type_id INT,
    transaction_date DATE,
    transaction_mode VARCHAR(50),
    amount DECIMAL(15, 2),
    description VARCHAR(255),
    status VARCHAR(50),
    reference_no VARCHAR(100),
    receipt_url VARCHAR(255),
    FOREIGN KEY (reg_no) REFERENCES MEMBERS(reg_no),
    FOREIGN KEY (staff_no) REFERENCES MEMBERS(staff_no),
    FOREIGN KEY (transaction_type_id) REFERENCES TRANSACTION_TYPES(id)
);

-- MEMBER_BALANCES table
CREATE TABLE MEMBER_BALANCES (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reg_no VARCHAR(50),
    transaction_type_id INT,
    current_balance DECIMAL(15, 2),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (reg_no) REFERENCES MEMBERS(reg_no),
    FOREIGN KEY (transaction_type_id) REFERENCES TRANSACTION_TYPES(id)
);

-- CONTRIBUTION_CHANGES table
CREATE TABLE CONTRIBUTION_CHANGES (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reg_no VARCHAR(50),
    transaction_type_id INT,
    current_contribution DECIMAL(15, 2),
    new_contribution DECIMAL(15, 2),
    effective_date DATE,
    status VARCHAR(50),
    FOREIGN KEY (reg_no) REFERENCES MEMBERS(reg_no),
    FOREIGN KEY (transaction_type_id) REFERENCES TRANSACTION_TYPES(id)
);

-- TRANSACTION_SETTINGS table
CREATE TABLE TRANSACTION_SETTINGS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_type_id INT,
    setting_name VARCHAR(100),
    value_percent DECIMAL(10, 2),
    updated_at DATE,
    FOREIGN KEY (transaction_type_id) REFERENCES TRANSACTION_TYPES(id)
);

-- NOTIFICATIONS table
CREATE TABLE NOTIFICATIONS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id VARCHAR(50),
    recipient_id VARCHAR(50),
    subject VARCHAR(255),
    message TEXT,
    status VARCHAR(50),
    sent_date DATETIME,
    is_read BOOLEAN DEFAULT FALSE,
    notification_type VARCHAR(50),
    action_url VARCHAR(255),
    FOREIGN KEY (sender_id) REFERENCES MEMBERS(staff_no),
    FOREIGN KEY (recipient_id) REFERENCES MEMBERS(staff_no)
);

-- DASHBOARD_WIDGETS table
CREATE TABLE DASHBOARD_WIDGETS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    widget_name VARCHAR(100),
    widget_description VARCHAR(255),
    default_position VARCHAR(50),
    is_enabled BOOLEAN DEFAULT TRUE,
    access_level VARCHAR(50)
);

-- USER_DASHBOARD_PREFERENCES table
CREATE TABLE USER_DASHBOARD_PREFERENCES (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    widget_id INT,
    display_order INT,
    is_visible BOOLEAN DEFAULT TRUE,
    widget_size VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES USERS(id),
    FOREIGN KEY (widget_id) REFERENCES DASHBOARD_WIDGETS(id)
);

-- COOPERATIVE_SETTINGS table
CREATE TABLE COOPERATIVE_SETTINGS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coop_name VARCHAR(100),
    coop_address VARCHAR(255),
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    logo_url VARCHAR(255),
    financial_year_start DATE,
    registration_date DATE
);

-- Temporary Tables for Data Upload

-- UPLOAD_BATCHES table
CREATE TABLE UPLOAD_BATCHES (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(100) UNIQUE,
    file_name VARCHAR(255),
    file_path VARCHAR(255),
    uploaded_by_user_id VARCHAR(50),
    upload_date DATE,
    upload_type VARCHAR(50),
    total_records INT,
    valid_records INT,
    invalid_records INT,
    batch_status ENUM('Pending', 'Validated', 'Approved', 'Rejected', 'Processed'),
    approved_by_user_id VARCHAR(50),
    approval_date DATE,
    rejection_reason VARCHAR(255),
    FOREIGN KEY (uploaded_by_user_id) REFERENCES USERS(staff_no),
    FOREIGN KEY (approved_by_user_id) REFERENCES USERS(staff_no)
);

-- TEMP_MEMBERS table
CREATE TABLE TEMP_MEMBERS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reg_no VARCHAR(50),
    staff_no VARCHAR(50),
    email VARCHAR(100),
    firstname VARCHAR(100),
    surname VARCHAR(100),
    gender VARCHAR(10),
    dob DATE,
    date_of_appoint DATE,
    retirement_date DATE,
    mobile_no VARCHAR(20),
    state_of_origin VARCHAR(50),
    rank_grade VARCHAR(50),
    bank_name VARCHAR(100),
    acct_no VARCHAR(20),
    member_status ENUM('Active', 'Inactive', 'Retired', 'Suspended', 'Terminated'),
    upload_batch_id VARCHAR(100),
    validation_errors TEXT,
    validation_status ENUM('Pending', 'Valid', 'Invalid'),
    FOREIGN KEY (upload_batch_id) REFERENCES UPLOAD_BATCHES(batch_id)
);

-- TEMP_LOANS table
CREATE TABLE TEMP_LOANS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ref_no VARCHAR(50),
    staff_no VARCHAR(50),
    reg_no VARCHAR(50),
    loan_type VARCHAR(100),
    amount_requested DECIMAL(15, 2),
    monthly_repayment DECIMAL(15, 2),
    repayment_period INT,
    interest_rate DECIMAL(5, 2),
    purpose VARCHAR(255),
    date_applied DATE,
    upload_batch_id VARCHAR(100),
    validation_errors TEXT,
    validation_status ENUM('Pending', 'Valid', 'Invalid'),
    FOREIGN KEY (upload_batch_id) REFERENCES UPLOAD_BATCHES(batch_id)
);

-- TEMP_CONTRIBUTIONS table
CREATE TABLE TEMP_CONTRIBUTIONS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reg_no VARCHAR(50),
    staff_no VARCHAR(50),
    contribution_type VARCHAR(100),
    contribution_date DATE,
    amount DECIMAL(15, 2),
    upload_batch_id VARCHAR(100),
    validation_errors TEXT,
    validation_status ENUM('Pending', 'Valid', 'Invalid'),
    FOREIGN KEY (upload_batch_id) REFERENCES UPLOAD_BATCHES(batch_id)
);

-- TEMP_TRANSACTIONS table (New)
CREATE TABLE TEMP_TRANSACTIONS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reg_no VARCHAR(50),
    staff_no VARCHAR(50),
    transaction_type_name VARCHAR(100), -- Store type name from Excel initially
    transaction_date DATE,
    transaction_mode VARCHAR(50),
    amount DECIMAL(15, 2),
    description VARCHAR(255),
    upload_batch_id VARCHAR(100),
    validation_errors TEXT,
    validation_status ENUM('Pending', 'Valid', 'Invalid') DEFAULT 'Pending',
    FOREIGN KEY (upload_batch_id) REFERENCES UPLOAD_BATCHES(batch_id)
);

-- TEMP_SAVINGS table
CREATE TABLE TEMP_SAVINGS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reg_no VARCHAR(50),
    staff_no VARCHAR(50),
    savings_type VARCHAR(100),
    transaction_date DATE,
    amount DECIMAL(15, 2),
    upload_batch_id VARCHAR(100),
    validation_errors TEXT,
    validation_status ENUM('Pending', 'Valid', 'Invalid'),
    FOREIGN KEY (upload_batch_id) REFERENCES UPLOAD_BATCHES(batch_id)
);

-- UPLOAD_LOGS table
CREATE TABLE UPLOAD_LOGS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batch_id VARCHAR(100),
    log_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    action VARCHAR(100),
    performed_by_user_id VARCHAR(50),
    details TEXT,
    status ENUM('Success', 'Failed', 'Pending', 'In Progress'),
    FOREIGN KEY (batch_id) REFERENCES UPLOAD_BATCHES(batch_id),
    FOREIGN KEY (performed_by_user_id) REFERENCES USERS(staff_no)
);

-- Create indexes for better performance
CREATE INDEX idx_members_reg_no ON MEMBERS(reg_no);
CREATE INDEX idx_members_staff_no ON MEMBERS(staff_no);
CREATE INDEX idx_loans_ref_no ON LOANS(ref_no);
CREATE INDEX idx_loans_staff_no ON LOANS(staff_no);
CREATE INDEX idx_transactions_reg_no ON TRANSACTIONS(reg_no);
CREATE INDEX idx_transactions_staff_no ON TRANSACTIONS(staff_no);
CREATE INDEX idx_member_balances_reg_no ON MEMBER_BALANCES(reg_no);
CREATE INDEX idx_upload_batches_batch_id ON UPLOAD_BATCHES(batch_id);