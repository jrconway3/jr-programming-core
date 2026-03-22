-- AlterTable
ALTER TABLE `jr_cats` ADD COLUMN `shortcode` VARCHAR(191) NOT NULL DEFAULT '' AFTER `title`;

-- Backfill shortcodes for seeded categories
UPDATE `jr_cats` SET `shortcode` = 'featured-projects' WHERE `title` = 'Featured Projects';
UPDATE `jr_cats` SET `shortcode` = 'projects' WHERE `title` = 'Projects';
UPDATE `jr_cats` SET `shortcode` = 'work-history' WHERE `title` = 'Work History';

-- AlterTable: make shortcode unique and remove the temporary default
ALTER TABLE `jr_cats` ADD UNIQUE INDEX `jr_cats_shortcode_key` (`shortcode`);
ALTER TABLE `jr_cats` ALTER COLUMN `shortcode` DROP DEFAULT;

-- Assign Featured Projects category to selected projects
INSERT INTO `jr_projects_cats` (`project_id`, `category_id`, `priority`, `created_at`, `updated_at`)
SELECT p.id, c.id, 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM `jr_projects` p
JOIN `jr_cats` c ON c.shortcode = 'featured-projects'
WHERE p.name IN (
  'Software Engineer III at TrailerCentral',
  'Lex Talionis Engine',
  'Universal Spritesheet Character Generator',
  'Sands Investment Group',
  'TrailerCentral Craigslist Autoposter'
)
ON DUPLICATE KEY UPDATE `updated_at` = VALUES(`updated_at`);
