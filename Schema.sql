-- MySQL Script to create the Cooperative Management System Database Schema

-- Drop database if it exists and create a new one
DROP DATABASE IF EXISTS cooperative_db;
CREATE DATABASE cooperative_db;
USE cooperative_db;

--
-- Table structure for table `CONTRIBUTION_CHANGES`
--

CREATE TABLE `CONTRIBUTION_CHANGES` (
  `id` int NOT NULL,
  `reg_no` varchar(50) DEFAULT NULL,
  `transaction_type_id` int DEFAULT NULL,
  `current_contribution` decimal(15,2) DEFAULT NULL,
  `new_contribution` decimal(15,2) DEFAULT NULL,
  `effective_date` date DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `COOPERATIVE_SETTINGS`
--

CREATE TABLE `COOPERATIVE_SETTINGS` (
  `id` int NOT NULL,
  `coop_name` varchar(100) DEFAULT NULL,
  `coop_address` varchar(255) DEFAULT NULL,
  `contact_email` varchar(100) DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `financial_year_start` date DEFAULT NULL,
  `registration_date` date DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `DASHBOARD_WIDGETS`
--

CREATE TABLE `DASHBOARD_WIDGETS` (
  `id` int NOT NULL,
  `widget_name` varchar(100) DEFAULT NULL,
  `widget_description` varchar(255) DEFAULT NULL,
  `default_position` varchar(50) DEFAULT NULL,
  `is_enabled` tinyint(1) DEFAULT '1',
  `access_level` varchar(50) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `GUARANTORS`
--

CREATE TABLE `GUARANTORS` (
  `id` int NOT NULL,
  `ref_no` varchar(50) DEFAULT NULL,
  `applicant_reg_no` varchar(50) DEFAULT NULL,
  `guarantor_staff_no` varchar(50) DEFAULT NULL,
  `guaranteed_amount` decimal(15,2) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `request_date` date DEFAULT NULL,
  `response_date` date DEFAULT NULL,
  `guarantor_comment` text
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `LOANS`
--

CREATE TABLE `LOANS` (
  `id` int NOT NULL,
  `ref_no` varchar(50) DEFAULT NULL,
  `staff_no` varchar(50) DEFAULT NULL,
  `reg_no` varchar(50) DEFAULT NULL,
  `transaction_type_id` int DEFAULT NULL,
  `amount_requested` decimal(15,2) DEFAULT NULL,
  `monthly_repayment` decimal(15,2) DEFAULT NULL,
  `repayment_period` int DEFAULT NULL,
  `interest_rate` decimal(5,2) DEFAULT NULL,
  `purpose` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `date_applied` date DEFAULT NULL,
  `date_approved` date DEFAULT NULL,
  `next_repayment_date` date DEFAULT NULL,
  `remaining_balance` decimal(15,2) DEFAULT NULL,
  `rejection_reason` varchar(255) DEFAULT NULL,
  `loan_documents_url` varchar(255) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `MEMBERS`
--

CREATE TABLE `MEMBERS` (
  `id` int NOT NULL,
  `reg_no` varchar(50) DEFAULT NULL,
  `staff_no` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `firstname` varchar(100) DEFAULT NULL,
  `surname` varchar(100) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `date_of_appoint` date DEFAULT NULL,
  `retirement_date` date DEFAULT NULL,
  `mobile_no` varchar(20) DEFAULT NULL,
  `state_of_origin` varchar(50) DEFAULT NULL,
  `rank_grade` varchar(50) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `acct_no` varchar(20) DEFAULT NULL,
  `member_status` enum('Active','Inactive','Retired','Suspended','Terminated') DEFAULT NULL,
  `profile_photo_url` varchar(255) DEFAULT NULL,
  `bio` text,
  `last_profile_update` date DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `MEMBERS`
--

INSERT INTO `MEMBERS` (`id`, `reg_no`, `staff_no`, `email`, `firstname`, `surname`, `gender`, `dob`, `date_of_appoint`, `retirement_date`, `mobile_no`, `state_of_origin`, `rank_grade`, `bank_name`, `acct_no`, `member_status`, `profile_photo_url`, `bio`, `last_profile_update`) VALUES
(1, 'REG-4755', '4755', NULL, 'SULAIMON OLAYINKA', 'ABBAS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL),
(2, 'REG-210559', '210559', NULL, 'SURAT BUSOLA', 'ABBAS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL),
(3, 'REG-4640', '4640', NULL, 'ABDUSAHEED', 'ABDULLAH', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL),
(4, 'REG-209038', '209038', NULL, 'Miss BUKOLA BLESSING', 'ABE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL),
(5, 'REG-213845', '213845', NULL, 'Miss ZAINAB ADEYIMIKA', 'ABIADE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL),
(6, 'REG-49406', '49406', NULL, 'KOLAWOLE', 'ABIMBOLA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL),
(7, 'REG-4660', '4660', NULL, 'Miss AYOTUNDE OLUWATO', 'ABIODUN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL),
(8, 'REG-976', '976', NULL, 'ABIOLA MARY', 'ABIOLA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL),
(9, 'REG-2233', '2233', NULL, 'SULAIMON OLUWAFEMI', 'ADAMS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL),
(10, 'REG-61302', '61302', NULL, 'KABIRU ADEBOLA', 'ADEBANWO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL),
(11, 'REG-1831', '1831', NULL, 'ADETUTU OLUWAPEL', 'ADEBAYO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL),
(12, 'REG-193787', '193787', NULL, 'SEMIU ADETOLA', 'ADEBOWALE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL),
(13, 'REG-178839', '178839', NULL, 'Miss RAMOTA ABISOLA', 'ADEBOYE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL),
(14, 'REG-210521', '210521', NULL, 'EMMANUEL OLUJIMI', 'ADEBOYE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL),
(15, 'REG-226610', '226610', NULL, 'Miss TEMITAYO TITILAYO', 'ADEBOYEJO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL),
(16, 'REG-210920', '210920', NULL, 'BABATUNDE SAMSON', 'ADEDEJI', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL),
(17, 'REG-49407', '49407', NULL, 'SAKIRU OLAKUNLE', 'ADEDEKO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Active', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `MEMBER_BALANCES`
--

CREATE TABLE `MEMBER_BALANCES` (
  `id` int NOT NULL,
  `reg_no` varchar(50) DEFAULT NULL,
  `transaction_type_id` int DEFAULT NULL,
  `current_balance` decimal(15,2) DEFAULT NULL,
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `NOTIFICATIONS`
--

CREATE TABLE `NOTIFICATIONS` (
  `id` int NOT NULL,
  `sender_id` varchar(50) DEFAULT NULL,
  `recipient_id` varchar(50) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text,
  `status` varchar(50) DEFAULT NULL,
  `sent_date` datetime DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `notification_type` varchar(50) DEFAULT NULL,
  `action_url` varchar(255) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `TEMP_CONTRIBUTIONS`
--

CREATE TABLE `TEMP_CONTRIBUTIONS` (
  `id` int NOT NULL,
  `reg_no` varchar(50) DEFAULT NULL,
  `staff_no` varchar(50) DEFAULT NULL,
  `contribution_type` varchar(100) DEFAULT NULL,
  `contribution_date` date DEFAULT NULL,
  `amount` decimal(15,2) DEFAULT NULL,
  `upload_batch_id` varchar(100) DEFAULT NULL,
  `validation_errors` text,
  `validation_status` enum('Pending','Valid','Invalid') DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `TEMP_LOANS`
--

CREATE TABLE `TEMP_LOANS` (
  `id` int NOT NULL,
  `ref_no` varchar(50) DEFAULT NULL,
  `staff_no` varchar(50) DEFAULT NULL,
  `reg_no` varchar(50) DEFAULT NULL,
  `loan_type` varchar(100) DEFAULT NULL,
  `amount_requested` decimal(15,2) DEFAULT NULL,
  `monthly_repayment` decimal(15,2) DEFAULT NULL,
  `repayment_period` int DEFAULT NULL,
  `interest_rate` decimal(5,2) DEFAULT NULL,
  `purpose` varchar(255) DEFAULT NULL,
  `date_applied` date DEFAULT NULL,
  `upload_batch_id` varchar(100) DEFAULT NULL,
  `validation_errors` text,
  `validation_status` enum('Pending','Valid','Invalid') DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `TEMP_MEMBERS`
--

CREATE TABLE `TEMP_MEMBERS` (
  `id` int NOT NULL,
  `reg_no` varchar(50) DEFAULT NULL,
  `staff_no` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `firstname` varchar(100) DEFAULT NULL,
  `surname` varchar(100) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `date_of_appoint` date DEFAULT NULL,
  `retirement_date` date DEFAULT NULL,
  `mobile_no` varchar(20) DEFAULT NULL,
  `state_of_origin` varchar(50) DEFAULT NULL,
  `rank_grade` varchar(50) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `acct_no` varchar(20) DEFAULT NULL,
  `member_status` enum('Active','Inactive','Retired','Suspended','Terminated') DEFAULT NULL,
  `upload_batch_id` varchar(100) DEFAULT NULL,
  `validation_errors` text,
  `validation_status` enum('Pending','Valid','Invalid') DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `TEMP_SAVINGS`
--

CREATE TABLE `TEMP_SAVINGS` (
  `id` int NOT NULL,
  `reg_no` varchar(50) DEFAULT NULL,
  `staff_no` varchar(50) DEFAULT NULL,
  `savings_type` varchar(100) DEFAULT NULL,
  `transaction_date` date DEFAULT NULL,
  `amount` decimal(15,2) DEFAULT NULL,
  `upload_batch_id` varchar(100) DEFAULT NULL,
  `validation_errors` text,
  `validation_status` enum('Pending','Valid','Invalid') DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `TEMP_TRANSACTIONS`
--

CREATE TABLE `TEMP_TRANSACTIONS` (
  `id` int NOT NULL,
  `reg_no` varchar(50) DEFAULT NULL,
  `staff_no` varchar(50) DEFAULT NULL,
  `transaction_type_name` varchar(100) DEFAULT NULL,
  `transaction_date` date DEFAULT NULL,
  `transaction_mode` varchar(50) DEFAULT NULL,
  `amount` decimal(15,2) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `upload_batch_id` varchar(100) DEFAULT NULL,
  `validation_errors` text,
  `validation_status` enum('Pending','Valid','Invalid') DEFAULT 'Pending'
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `TRANSACTIONS`
--

CREATE TABLE `TRANSACTIONS` (
  `id` int NOT NULL,
  `reg_no` varchar(50) DEFAULT NULL,
  `staff_no` varchar(50) DEFAULT NULL,
  `transaction_type_id` int DEFAULT NULL,
  `transaction_date` date DEFAULT NULL,
  `transaction_mode` varchar(50) DEFAULT NULL,
  `amount` decimal(15,2) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `reference_no` varchar(100) DEFAULT NULL,
  `receipt_url` varchar(255) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `TRANSACTION_SETTINGS`
--

CREATE TABLE `TRANSACTION_SETTINGS` (
  `id` int NOT NULL,
  `transaction_type_id` int DEFAULT NULL,
  `setting_name` varchar(100) DEFAULT NULL,
  `value_percent` decimal(10,2) DEFAULT NULL,
  `updated_at` date DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `TRANSACTION_TYPES`
--

CREATE TABLE `TRANSACTION_TYPES` (
  `id` int NOT NULL,
  `type_name` varchar(100) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_credit` tinyint(1) DEFAULT NULL,
  `is_debit` tinyint(1) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `default_interest_rate` decimal(10,2) DEFAULT NULL,
  `default_term_months` int DEFAULT NULL,
  `created_at` date DEFAULT NULL,
  `updated_at` date DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `UPLOAD_BATCHES`
--

CREATE TABLE `UPLOAD_BATCHES` (
  `id` int NOT NULL,
  `batch_id` varchar(100) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `uploaded_by_user_id` varchar(50) DEFAULT NULL,
  `upload_date` date DEFAULT NULL,
  `upload_type` varchar(50) DEFAULT NULL,
  `total_records` int DEFAULT NULL,
  `valid_records` int DEFAULT NULL,
  `invalid_records` int DEFAULT NULL,
  `batch_status` enum('Pending','Validated','Approved','Rejected','Processed') DEFAULT NULL,
  `approved_by_user_id` varchar(50) DEFAULT NULL,
  `approval_date` date DEFAULT NULL,
  `rejection_reason` varchar(255) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `UPLOAD_LOGS`
--

CREATE TABLE `UPLOAD_LOGS` (
  `id` int NOT NULL,
  `batch_id` varchar(100) DEFAULT NULL,
  `log_timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `action` varchar(100) DEFAULT NULL,
  `performed_by_user_id` varchar(50) DEFAULT NULL,
  `details` text,
  `status` enum('Success','Failed','Pending','In Progress') DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `USERS`
--

CREATE TABLE `USERS` (
  `id` int NOT NULL,
  `staff_no` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `login_type` varchar(50) DEFAULT NULL,
  `login_status` varchar(50) DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `token_expiry` timestamp NULL DEFAULT NULL,
  `dashboard_tour_completed` tinyint(1) DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `USERS`
--

INSERT INTO `USERS` (`id`, `staff_no`, `email`, `password`, `login_type`, `login_status`, `last_login`, `reset_token`, `token_expiry`, `dashboard_tour_completed`) VALUES
(1, 'admin', 'admin@example.com', '$2b$10$CltHPVx2A7FMpcmJq9uqoeODcTUUMcUpD26YH6CTHQ4mvYKOSxCvi', 'SuperAdmin', 'Active', '2025-04-17 00:11:29', NULL, NULL, 0),
(2, '4755', 'lycotech@gmail.com', '$2b$10$2qJVqxHv17UFIJg6KsLpVeWoavUKQpA04.lgL91HPfVekZU7yDAb.', 'Member', 'Active', '2025-04-13 23:53:47', NULL, NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `USER_DASHBOARD_PREFERENCES`
--

CREATE TABLE `USER_DASHBOARD_PREFERENCES` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `widget_id` int DEFAULT NULL,
  `display_order` int DEFAULT NULL,
  `is_visible` tinyint(1) DEFAULT '1',
  `widget_size` varchar(50) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `CONTRIBUTION_CHANGES`
--
ALTER TABLE `CONTRIBUTION_CHANGES`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reg_no` (`reg_no`),
  ADD KEY `transaction_type_id` (`transaction_type_id`);

--
-- Indexes for table `COOPERATIVE_SETTINGS`
--
ALTER TABLE `COOPERATIVE_SETTINGS`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `DASHBOARD_WIDGETS`
--
ALTER TABLE `DASHBOARD_WIDGETS`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `GUARANTORS`
--
ALTER TABLE `GUARANTORS`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ref_no` (`ref_no`),
  ADD KEY `applicant_reg_no` (`applicant_reg_no`),
  ADD KEY `guarantor_staff_no` (`guarantor_staff_no`);

--
-- Indexes for table `LOANS`
--
ALTER TABLE `LOANS`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ref_no` (`ref_no`),
  ADD KEY `reg_no` (`reg_no`),
  ADD KEY `transaction_type_id` (`transaction_type_id`),
  ADD KEY `idx_loans_ref_no` (`ref_no`),
  ADD KEY `idx_loans_staff_no` (`staff_no`);

--
-- Indexes for table `MEMBERS`
--
ALTER TABLE `MEMBERS`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reg_no` (`reg_no`),
  ADD UNIQUE KEY `staff_no` (`staff_no`),
  ADD KEY `idx_members_reg_no` (`reg_no`),
  ADD KEY `idx_members_staff_no` (`staff_no`);

--
-- Indexes for table `MEMBER_BALANCES`
--
ALTER TABLE `MEMBER_BALANCES`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_type_id` (`transaction_type_id`),
  ADD KEY `idx_member_balances_reg_no` (`reg_no`);

--
-- Indexes for table `NOTIFICATIONS`
--
ALTER TABLE `NOTIFICATIONS`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `recipient_id` (`recipient_id`);

--
-- Indexes for table `TEMP_CONTRIBUTIONS`
--
ALTER TABLE `TEMP_CONTRIBUTIONS`
  ADD PRIMARY KEY (`id`),
  ADD KEY `upload_batch_id` (`upload_batch_id`);

--
-- Indexes for table `TEMP_LOANS`
--
ALTER TABLE `TEMP_LOANS`
  ADD PRIMARY KEY (`id`),
  ADD KEY `upload_batch_id` (`upload_batch_id`);

--
-- Indexes for table `TEMP_MEMBERS`
--
ALTER TABLE `TEMP_MEMBERS`
  ADD PRIMARY KEY (`id`),
  ADD KEY `upload_batch_id` (`upload_batch_id`);

--
-- Indexes for table `TEMP_SAVINGS`
--
ALTER TABLE `TEMP_SAVINGS`
  ADD PRIMARY KEY (`id`),
  ADD KEY `upload_batch_id` (`upload_batch_id`);

--
-- Indexes for table `TEMP_TRANSACTIONS`
--
ALTER TABLE `TEMP_TRANSACTIONS`
  ADD PRIMARY KEY (`id`),
  ADD KEY `upload_batch_id` (`upload_batch_id`);

--
-- Indexes for table `TRANSACTIONS`
--
ALTER TABLE `TRANSACTIONS`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_type_id` (`transaction_type_id`),
  ADD KEY `idx_transactions_reg_no` (`reg_no`),
  ADD KEY `idx_transactions_staff_no` (`staff_no`);

--
-- Indexes for table `TRANSACTION_SETTINGS`
--
ALTER TABLE `TRANSACTION_SETTINGS`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_type_id` (`transaction_type_id`);

--
-- Indexes for table `TRANSACTION_TYPES`
--
ALTER TABLE `TRANSACTION_TYPES`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `type_name` (`type_name`);

--
-- Indexes for table `UPLOAD_BATCHES`
--
ALTER TABLE `UPLOAD_BATCHES`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `batch_id` (`batch_id`),
  ADD KEY `uploaded_by_user_id` (`uploaded_by_user_id`),
  ADD KEY `approved_by_user_id` (`approved_by_user_id`),
  ADD KEY `idx_upload_batches_batch_id` (`batch_id`);

--
-- Indexes for table `UPLOAD_LOGS`
--
ALTER TABLE `UPLOAD_LOGS`
  ADD PRIMARY KEY (`id`),
  ADD KEY `batch_id` (`batch_id`),
  ADD KEY `performed_by_user_id` (`performed_by_user_id`);

--
-- Indexes for table `USERS`
--
ALTER TABLE `USERS`
  ADD PRIMARY KEY (`id`),
  ADD KEY `staff_no` (`staff_no`);

--
-- Indexes for table `USER_DASHBOARD_PREFERENCES`
--
ALTER TABLE `USER_DASHBOARD_PREFERENCES`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `widget_id` (`widget_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `CONTRIBUTION_CHANGES`
--
ALTER TABLE `CONTRIBUTION_CHANGES`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `COOPERATIVE_SETTINGS`
--
ALTER TABLE `COOPERATIVE_SETTINGS`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `DASHBOARD_WIDGETS`
--
ALTER TABLE `DASHBOARD_WIDGETS`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `GUARANTORS`
--
ALTER TABLE `GUARANTORS`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `LOANS`
--
ALTER TABLE `LOANS`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `MEMBERS`
--
ALTER TABLE `MEMBERS`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `MEMBER_BALANCES`
--
ALTER TABLE `MEMBER_BALANCES`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `NOTIFICATIONS`
--
ALTER TABLE `NOTIFICATIONS`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `TEMP_CONTRIBUTIONS`
--
ALTER TABLE `TEMP_CONTRIBUTIONS`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `TEMP_LOANS`
--
ALTER TABLE `TEMP_LOANS`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `TEMP_MEMBERS`
--
ALTER TABLE `TEMP_MEMBERS`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `TEMP_SAVINGS`
--
ALTER TABLE `TEMP_SAVINGS`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `TEMP_TRANSACTIONS`
--
ALTER TABLE `TEMP_TRANSACTIONS`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `TRANSACTIONS`
--
ALTER TABLE `TRANSACTIONS`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `TRANSACTION_SETTINGS`
--
ALTER TABLE `TRANSACTION_SETTINGS`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `TRANSACTION_TYPES`
--
ALTER TABLE `TRANSACTION_TYPES`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `UPLOAD_BATCHES`
--
ALTER TABLE `UPLOAD_BATCHES`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `UPLOAD_LOGS`
--
ALTER TABLE `UPLOAD_LOGS`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `USERS`
--
ALTER TABLE `USERS`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `USER_DASHBOARD_PREFERENCES`
--
ALTER TABLE `USER_DASHBOARD_PREFERENCES`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
