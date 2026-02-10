-- CreateTable
CREATE TABLE `jr_projects_skills` (
    `project_id` INTEGER NOT NULL,
    `skill_id` INTEGER NOT NULL,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`project_id`, `skill_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jr_projects_cats` (
    `project_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`project_id`, `category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jr_skills` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `desc` VARCHAR(191) NOT NULL,
    `rating` TINYINT NOT NULL DEFAULT 5,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jr_cats` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `jr_projects_skills` ADD CONSTRAINT `jr_projects_skills_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `jr_projects`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jr_projects_skills` ADD CONSTRAINT `jr_projects_skills_skill_id_fkey` FOREIGN KEY (`skill_id`) REFERENCES `jr_skills`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jr_projects_cats` ADD CONSTRAINT `jr_projects_cats_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `jr_projects`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jr_projects_cats` ADD CONSTRAINT `jr_projects_cats_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `jr_cats`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Insert Categories
INSERT INTO `jr_cats` (`title`, `created_at`, `updated_at`) VALUES
('Featured Projects', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3));

-- Insert Projects
INSERT INTO `jr_projects` (`name`, `short`, `role`, `position`, `extended`, `created_at`, `updated_at`) VALUES
('JR Programming', 'I used Github Copilot to assist me in creating this portfolio website in React. I have a long history of picking up new things and detailed experience in Javascript programming and development.', '', 'Web Developer', '', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3));