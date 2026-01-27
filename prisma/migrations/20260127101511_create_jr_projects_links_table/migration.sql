-- AlterTable
ALTER TABLE `jr_projects_gallery` ADD COLUMN `link_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `jr_projects_links` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `project_id` INTEGER NOT NULL,
    `website` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `jr_projects_links` ADD CONSTRAINT `jr_projects_links_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `jr_projects`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jr_projects_gallery` ADD CONSTRAINT `jr_projects_gallery_link_id_fkey` FOREIGN KEY (`link_id`) REFERENCES `jr_projects_links`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
