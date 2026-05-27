-- Create companies table
CREATE TABLE `jr_companies` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `shortcode` VARCHAR(191) NULL,
  `website` VARCHAR(191) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `jr_companies_name_key`(`name`),
  UNIQUE INDEX `jr_companies_shortcode_key`(`shortcode`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create jobs table
CREATE TABLE `jr_jobs` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `shortcode` VARCHAR(191) NULL,
  `company_id` INTEGER NULL,
  `is_primary_tier` TINYINT(1) NOT NULL DEFAULT 0,
  `summary` TEXT NULL,
  `start_date` DATETIME(3) NULL,
  `end_date` DATETIME(3) NULL,
  `priority` INTEGER NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `jr_jobs_shortcode_key`(`shortcode`),
  INDEX `jr_jobs_company_id_priority_idx`(`company_id`, `priority`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create job roles table
CREATE TABLE `jr_job_roles` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `job_id` INTEGER NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `short_summary` TEXT NULL,
  `start_date` DATETIME(3) NULL,
  `end_date` DATETIME(3) NULL,
  `priority` INTEGER NOT NULL DEFAULT 0,
  `is_current` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `jr_job_roles_job_id_priority_key`(`job_id`, `priority`),
  INDEX `jr_job_roles_job_id_is_current_idx`(`job_id`, `is_current`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create job to project relation table
CREATE TABLE `jr_job_project_relations` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `job_id` INTEGER NOT NULL,
  `project_id` INTEGER NOT NULL,
  `relation_type` VARCHAR(191) NOT NULL DEFAULT 'key_system',
  `priority` INTEGER NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `jr_job_project_relations_job_project_key`(`job_id`, `project_id`),
  INDEX `jr_job_project_relations_job_relation_priority_idx`(`job_id`, `relation_type`, `priority`),
  INDEX `jr_job_project_relations_project_relation_idx`(`project_id`, `relation_type`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create job impacts table
CREATE TABLE `jr_job_impacts` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `job_id` INTEGER NOT NULL,
  `description` TEXT NOT NULL,
  `priority` INTEGER NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `jr_job_impacts_job_id_priority_key`(`job_id`, `priority`),
  INDEX `jr_job_impacts_job_id_priority_idx`(`job_id`, `priority`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Extend projects table with shortcode and job relation
ALTER TABLE `jr_projects`
  ADD COLUMN `shortcode` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `jr_projects_shortcode_key` ON `jr_projects`(`shortcode`);

-- Add foreign keys
ALTER TABLE `jr_jobs`
  ADD CONSTRAINT `jr_jobs_company_id_fkey`
  FOREIGN KEY (`company_id`) REFERENCES `jr_companies`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `jr_job_roles`
  ADD CONSTRAINT `jr_job_roles_job_id_fkey`
  FOREIGN KEY (`job_id`) REFERENCES `jr_jobs`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `jr_job_project_relations`
  ADD CONSTRAINT `jr_job_project_relations_job_id_fkey`
  FOREIGN KEY (`job_id`) REFERENCES `jr_jobs`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `jr_job_project_relations_project_id_fkey`
  FOREIGN KEY (`project_id`) REFERENCES `jr_projects`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `jr_job_impacts`
  ADD CONSTRAINT `jr_job_impacts_job_id_fkey`
  FOREIGN KEY (`job_id`) REFERENCES `jr_jobs`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
