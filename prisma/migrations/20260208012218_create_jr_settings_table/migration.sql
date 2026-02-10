-- CreateTable
CREATE TABLE `jr_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `page_id` INTEGER DEFAULT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateSettings
INSERT INTO `jr_settings` (`page_id`, `key`, `value`, `created_at`, `updated_at`) VALUES
(NULL, 'home/banner/title', 'David Conway Jr.', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
(NULL, 'home/banner/subtitle', 'Systems Engineer / Web Developer', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
(NULL, 'footer/copy/year', '2026', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
(NULL, 'footer/copy/name', 'David Conway Jr.', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
(NULL, 'footer/copy/built', 'Built using Next.js and Tailwind CSS, with assistance from Github Copilot.', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)),
(NULL, 'footer/copy/extra', 'Free Font "Commodore 64" by <a href="https://www.dafont.com/commodore-64.font" target="_blank">Devin Cook.</a>', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3));