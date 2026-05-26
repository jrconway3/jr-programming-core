-- AlterTable
ALTER TABLE `jr_cats` ADD COLUMN `priority` INTEGER NOT NULL DEFAULT 0 AFTER `shortcode`;
ALTER TABLE `jr_cats` ADD COLUMN `show_in_filter` BOOLEAN NOT NULL DEFAULT false AFTER `priority`;

-- CreateIndex
CREATE INDEX `jr_jobs_is_primary_tier_priority_idx` ON `jr_jobs`(`is_primary_tier`, `priority`);

-- Add filter categories, assign existing projects to them, and add jaidynreiman.net + jrplays.net.
SET @now := NOW(3);

-- ─────────────────────────────────────────────────────
-- New projects: jaidynreiman.net and jrplays.net
-- ─────────────────────────────────────────────────────

INSERT INTO `jr_projects` (`name`, `shortcode`, `short`, `role`, `position`, `extended`, `start_date`, `created_at`, `updated_at`)
VALUES
  (
    'Sprite and Game Asset Portfolio',
    'jaidynreiman-net',
    'Sprite and game asset portfolio built in Next.js, showcasing LPC-compatible character sprites and tilesets.',
    'Full-Stack Developer',
    'Personal Project',
    NULL,
    '2026-05-01 00:00:00.000',
    @now,
    @now
  ),
  (
    'Video Game Wordpress Blog',
    'jrplays-net',
    'Standalone WordPress gaming blog migrating from a multisite setup, covering game reviews, commentary, and lets plays.',
    'Full-Stack Developer',
    'Personal Project',
    NULL,
    '2026-05-01 00:00:00.000',
    @now,
    @now
  ),
  (
    'Twilio SMS System with Delivery Tracking & Webhook Integration',
    'twilio-sms-system',
    'Built and maintained a Twilio-based SMS system integrated into a CRM for both automated and direct messaging workflows.',
    'Developer',
    'TrailerCentral',
    'Built and maintained a Twilio-based SMS system integrated into a CRM for both automated and direct messaging workflows. Implemented webhook handling to process real-time delivery status updates, including carrier-level failures such as unreachable numbers and invalid recipients. Developed reporting and tracking features to monitor message outcomes, including sent, failed, and unsubscribed states. Integrated SMS activity into lead workflows and campaign automation systems, enabling scalable communication and improved visibility into customer engagement.',
    '2019-10-01 00:00:00.000',
    '2026-01-02 00:00:00.000',
    @now
  ),
  (
    'Email Config & OAuth Integration',
    'gmail-oauth-integration',
    'Implemented Gmail OAuth 2.0 integration within a CRM system to enable secure email authentication, sending, and inbox synchronization.',
    'API Integration Engineer',
    'TrailerCentral',
    'Designed and implemented a CRM-based email automation system supporting trigger-driven messaging workflows. Built a visual template editor (Mosaico) and a campaign engine with scheduling and state-based logic, enabling emails to be sent based on timing, lead status, and user actions. Developed delivery tracking and reporting features to monitor sent, bounced, and skipped messages. Integrated campaign activity into lead interaction timelines, improving communication visibility and enabling scalable follow-up workflows.',
    '2020-03-01 00:00:00.000',
    '2026-01-02 00:00:00.000',
    @now
  ),
  (
    'Eternity Ready',
    'eternity-ready',
    'Contributed to improvements to Eternity Ready, fixing channel links and cleaning up page design and structure.',
    'Webmaster',
    'Freelancer',
    NULL,
    '2026-05-01 00:00:00.000',
    @now,
    @now
  ),
  (
    'TrailerCentral CRM System',
    'tc-crm-system',
    'Migrated and rebuilt a legacy CRM into a scalable Laravel + Vue/Nuxt system supporting lead management, workflow automation, and Twilio-based communication pipelines.',
    'Full-Stack Developer',
    'TrailerCentral',
    'Migrated a legacy CRM into a scalable Laravel + Vue/Nuxt system supporting lead management, workflow automation, and campaign execution. Built backend services for CRM pipelines, dealer workflows, and API-driven integrations. Implemented Twilio-based communication workflows with opt-in compliance, delivery tracking, and messaging rules. Focused on improving system reliability, performance, and extensibility across production CRM operations.',
    '2018-01-01 00:00:00.000',
    @now,
    @now
  ),
  (
    'Data Annotation',
    'data-annotation',
    'Participated in various AI training projects.',
    'Webmaster',
    'Freelancer',
    NULL,
    '2026-05-01 00:00:00.000',
    @now,
    @now
  )
ON DUPLICATE KEY UPDATE
  `name`       = VALUES(`name`),
  `short`      = VALUES(`short`),
  `role`       = VALUES(`role`),
  `position`   = VALUES(`position`),
  `start_date` = VALUES(`start_date`),
  `updated_at` = @now;

-- ─────────────────────────────────────────────────────
-- Assign shortcodes to projects that don't have them yet.
-- Matched by name so this is safe across environments with different IDs.
-- ─────────────────────────────────────────────────────

UPDATE `jr_projects` SET `shortcode` = 'jrprogramming',                `updated_at` = @now WHERE `name` = 'JR Programming';
UPDATE `jr_projects` SET `shortcode` = 'sandsig',                      `updated_at` = @now WHERE `name` = 'Sands Investment Group';
UPDATE `jr_projects` SET `shortcode` = 'real-chords',                  `updated_at` = @now WHERE `name` = 'Real Chords Website';
UPDATE `jr_projects` SET `shortcode` = 'millennium-marketing-denver',  `updated_at` = @now WHERE `name` = 'Millennium Marketing Denver Updates';
UPDATE `jr_projects` SET `shortcode` = 'express-roofing',              `updated_at` = @now WHERE `name` = 'Express Roofing, Inc.';
UPDATE `jr_projects` SET `shortcode` = 'extreme-developers',           `updated_at` = @now WHERE `name` = 'Extreme Developers, Inc.';
UPDATE `jr_projects` SET `shortcode` = 'abundance-campaign',           `updated_at` = @now WHERE `name` = 'Abundance Campaign';
UPDATE `jr_projects` SET `shortcode` = 'packard-grill',                `updated_at` = @now WHERE `name` = 'Packard Grill';
UPDATE `jr_projects` SET `shortcode` = '25kgroup-magazine',            `updated_at` = @now WHERE `name` = '25kGroup Magazine Lander';
UPDATE `jr_projects` SET `shortcode` = 'biodental-veneers',            `updated_at` = @now WHERE `name` = 'BioDental Veneers Landing Page';
UPDATE `jr_projects` SET `shortcode` = 'genius-network',               `updated_at` = @now WHERE `name` = 'Genius Network Mastermind';
UPDATE `jr_projects` SET `shortcode` = 'center-for-partially-sighted', `updated_at` = @now WHERE `name` = 'Center for the Partially Sighted';
UPDATE `jr_projects` SET `shortcode` = 'mangat-plastic-surgery',       `updated_at` = @now WHERE `name` = 'Mangat Plastic Surgery';
UPDATE `jr_projects` SET `shortcode` = 'joe-polish-press',             `updated_at` = @now WHERE `name` = 'Joe Polish Press Page';
UPDATE `jr_projects` SET `shortcode` = 'restyle-kitchen-bath',         `updated_at` = @now WHERE `name` = 'Restyle Kitchen and Bath';
UPDATE `jr_projects` SET `shortcode` = 'kloutfire-website',            `updated_at` = @now WHERE `name` = 'KloutFire Website';
UPDATE `jr_projects` SET `shortcode` = 'my-choice-energy',             `updated_at` = @now WHERE `name` = 'My Choice Energy';
UPDATE `jr_projects` SET `shortcode` = 'tansavatdi-plastic-surgery',   `updated_at` = @now WHERE `name` = 'Tansavatdi Plastic Surgery';
UPDATE `jr_projects` SET `shortcode` = 'raffle-consulting',            `updated_at` = @now WHERE `name` = 'Raffle Consulting';
UPDATE `jr_projects` SET `shortcode` = 'washington-dental',            `updated_at` = @now WHERE `name` = 'Washington Dental';
UPDATE `jr_projects` SET `shortcode` = 'fort-collins-roofing',         `updated_at` = @now WHERE `name` = 'Fort Collins Roofing Consultants';
UPDATE `jr_projects` SET `shortcode` = 'pete-mamos',                   `updated_at` = @now WHERE `name` = 'PeteMamos.com';
UPDATE `jr_projects` SET `shortcode` = 'home-solution-properties',     `updated_at` = @now WHERE `name` = 'Home Solution Properties';
UPDATE `jr_projects` SET `shortcode` = 'equilibrio-nicaragua',         `updated_at` = @now WHERE `name` = 'Equilibrio Nicaragua';
UPDATE `jr_projects` SET `shortcode` = 'freight-access-crm',           `updated_at` = @now WHERE `name` = 'Freight Access CRM';
UPDATE `jr_projects` SET `shortcode` = 'tc-craigslist-autoposter',     `updated_at` = @now WHERE `name` = 'TrailerCentral Craigslist Autoposter';
UPDATE `jr_projects` SET `shortcode` = 'trailertrader-2016',           `updated_at` = @now WHERE `name` = 'TrailerTrader (2016 Version)';
UPDATE `jr_projects` SET `shortcode` = 'tc-ksl-feed',                  `updated_at` = @now WHERE `name` = 'TrailerCentral KSL Feed';
UPDATE `jr_projects` SET `shortcode` = 'tc-image-overlays',            `updated_at` = @now WHERE `name` = 'TrailerCentral Custom Inventory Image Overlays';
UPDATE `jr_projects` SET `shortcode` = 'tc-dealer-websites',           `updated_at` = @now WHERE `name` = 'TrailerCentral Dealer Websites Responsive Mode';
UPDATE `jr_projects` SET `shortcode` = 'tc-elasticsearch',             `updated_at` = @now WHERE `name` = 'Elastic Search for TrailerCentral Dealer Websites Inventory';
UPDATE `jr_projects` SET `shortcode` = 'factory-vantage',              `updated_at` = @now WHERE `name` = 'Factory Vantage';
UPDATE `jr_projects` SET `shortcode` = 'huffman-trailers',             `updated_at` = @now WHERE `name` = 'Huffman Trailers Website for TrailerCentral';
UPDATE `jr_projects` SET `shortcode` = 'hitchman-inc',                 `updated_at` = @now WHERE `name` = 'The Hitchman, Inc. Website for TrailerCentral';
UPDATE `jr_projects` SET `shortcode` = 'tc-crm-legacy',                `updated_at` = @now WHERE `name` = 'TrailerCentral CRM (Zend)';
UPDATE `jr_projects` SET `shortcode` = 'tc-crm-email-text',            `updated_at` = @now WHERE `name` = 'TrailerCentral CRM Email & Text Marketing';
UPDATE `jr_projects` SET `shortcode` = 'tc-truckpaper-autoposter',     `updated_at` = @now WHERE `name` = 'TrailerCentral TruckPaper Autoposter Integration';
UPDATE `jr_projects` SET `shortcode` = 'tc-lotvantage-facebook',       `updated_at` = @now WHERE `name` = 'TrailerCentral LotVantage Facebook Feed';
UPDATE `jr_projects` SET `shortcode` = 'ulpc-spritesheet-generator',   `updated_at` = @now WHERE `name` = 'Universal LPC Spritesheet Character Generator';
UPDATE `jr_projects` SET `shortcode` = 'lex-talionis-engine',          `updated_at` = @now WHERE `name` = 'Lex Talionis Engine';
UPDATE `jr_projects` SET `shortcode` = 'tc-horse-trailer-world',       `updated_at` = @now WHERE `name` = 'TrailerCentral Horse Trailer World Autoposter';
UPDATE `jr_projects` SET `shortcode` = 'tc-facebook-marketplace',      `updated_at` = @now WHERE `name` = 'TrailerCentral Facebook Marketplace Autoposter';

-- ─────────────────────────────────────────────────────
-- Filter categories
-- ─────────────────────────────────────────────────────

INSERT INTO `jr_cats` (`title`, `shortcode`, `show_in_filter`, `priority`, `created_at`, `updated_at`)
VALUES
  ('TrailerCentral',    'trailercentral',     1, 1, @now, @now),
  ('WordPress',         'wordpress',          1, 2, @now, @now),
  ('Chrome Extensions', 'chrome-extensions',  1, 3, @now, @now),
  ('Personal',          'personal',           1, 4, @now, @now),
  ('Backend',           'backend',            1, 5, @now, @now),
  ('Frontend',          'frontend',           1, 6, @now, @now)
ON DUPLICATE KEY UPDATE
  `show_in_filter` = 1,
  `updated_at` = @now;

SET @cat_projects        := (SELECT `id` FROM `jr_cats` WHERE `shortcode` = 'projects'          LIMIT 1);
SET @cat_tc              := (SELECT `id` FROM `jr_cats` WHERE `shortcode` = 'trailercentral'    LIMIT 1);
SET @cat_wp              := (SELECT `id` FROM `jr_cats` WHERE `shortcode` = 'wordpress'         LIMIT 1);
SET @cat_chrome          := (SELECT `id` FROM `jr_cats` WHERE `shortcode` = 'chrome-extensions' LIMIT 1);
SET @cat_personal        := (SELECT `id` FROM `jr_cats` WHERE `shortcode` = 'personal'          LIMIT 1);
SET @cat_backend         := (SELECT `id` FROM `jr_cats` WHERE `shortcode` = 'backend'           LIMIT 1);
SET @cat_frontend        := (SELECT `id` FROM `jr_cats` WHERE `shortcode` = 'frontend'          LIMIT 1);

-- Add new projects to the main projects category
INSERT INTO `jr_projects_cats` (`project_id`, `category_id`, `priority`, `created_at`, `updated_at`)
SELECT p.`id`, @cat_projects, 0, @now, @now
FROM `jr_projects` p
WHERE p.`shortcode` IN ('jaidynreiman-net', 'jrplays-net')
  AND @cat_projects IS NOT NULL
ON DUPLICATE KEY UPDATE `updated_at` = @now;

-- ─────────────────────────────────────────────────────
-- TrailerCentral filter — all projects with position = 'TrailerCentral'
-- ─────────────────────────────────────────────────────

INSERT INTO `jr_projects_cats` (`project_id`, `category_id`, `priority`, `created_at`, `updated_at`)
SELECT p.`id`, @cat_tc, p.`id`, @now, @now
FROM `jr_projects` p
WHERE p.`position` = 'TrailerCentral'
  AND @cat_tc IS NOT NULL
ON DUPLICATE KEY UPDATE `updated_at` = @now;

-- ─────────────────────────────────────────────────────
-- Chrome Extensions filter
-- ─────────────────────────────────────────────────────

INSERT INTO `jr_projects_cats` (`project_id`, `category_id`, `priority`, `created_at`, `updated_at`)
SELECT p.`id`, @cat_chrome, p.`id`, @now, @now
FROM `jr_projects` p
WHERE p.`shortcode` IN (
  'tc-craigslist-autoposter',
  'tc-horse-trailer-world',
  'tc-facebook-marketplace',
  'tc-truckpaper-autoposter'
)
AND @cat_chrome IS NOT NULL
ON DUPLICATE KEY UPDATE `updated_at` = @now;

-- ─────────────────────────────────────────────────────
-- WordPress filter
-- ─────────────────────────────────────────────────────

INSERT INTO `jr_projects_cats` (`project_id`, `category_id`, `priority`, `created_at`, `updated_at`)
SELECT p.`id`, @cat_wp, p.`id`, @now, @now
FROM `jr_projects` p
WHERE p.`shortcode` IN (
  'real-chords',
  'express-roofing',
  'extreme-developers',
  'packard-grill',
  'genius-network',
  'center-for-partially-sighted',
  'mangat-plastic-surgery',
  'restyle-kitchen-bath',
  'kloutfire-website',
  'tansavatdi-plastic-surgery',
  'raffle-consulting',
  'washington-dental',
  'fort-collins-roofing',
  'pete-mamos',
  'jrplays-net'
)
AND @cat_wp IS NOT NULL
ON DUPLICATE KEY UPDATE `updated_at` = @now;

-- ─────────────────────────────────────────────────────
-- Personal filter
-- ─────────────────────────────────────────────────────

INSERT INTO `jr_projects_cats` (`project_id`, `category_id`, `priority`, `created_at`, `updated_at`)
SELECT p.`id`, @cat_personal, p.`id`, @now, @now
FROM `jr_projects` p
WHERE p.`shortcode` IN (
  'jrprogramming',
  'ulpc-spritesheet-generator',
  'lex-talionis-engine',
  'jaidynreiman-net',
  'jrplays-net'
)
AND @cat_personal IS NOT NULL
ON DUPLICATE KEY UPDATE `updated_at` = @now;

-- ─────────────────────────────────────────────────────
-- Backend filter — CRM systems, APIs, feeds, automation, custom PHP
-- ─────────────────────────────────────────────────────

INSERT INTO `jr_projects_cats` (`project_id`, `category_id`, `priority`, `created_at`, `updated_at`)
SELECT p.`id`, @cat_backend, p.`id`, @now, @now
FROM `jr_projects` p
WHERE p.`shortcode` IN (
  'sandsig',
  'my-choice-energy',
  'home-solution-properties',
  'freight-access-crm',
  'tc-ksl-feed',
  'tc-image-overlays',
  'tc-elasticsearch',
  'factory-vantage',
  'tc-crm-legacy',
  'tc-crm-system',
  'tc-crm-email-text',
  'tc-truckpaper-autoposter',
  'tc-lotvantage-facebook',
  'twilio-call-tracking',
  'crm-automation',
  'email-system-stabilization',
  'craigslist-autoposter'
)
AND @cat_backend IS NOT NULL
ON DUPLICATE KEY UPDATE `updated_at` = @now;

-- ─────────────────────────────────────────────────────
-- Frontend filter — PSD-to-web builds, WordPress themes, UI/responsive work
-- ─────────────────────────────────────────────────────

INSERT INTO `jr_projects_cats` (`project_id`, `category_id`, `priority`, `created_at`, `updated_at`)
SELECT p.`id`, @cat_frontend, p.`id`, @now, @now
FROM `jr_projects` p
WHERE p.`shortcode` IN (
  'real-chords',
  'millennium-marketing-denver',
  'express-roofing',
  'extreme-developers',
  'abundance-campaign',
  'packard-grill',
  '25kgroup-magazine',
  'biodental-veneers',
  'genius-network',
  'center-for-partially-sighted',
  'mangat-plastic-surgery',
  'joe-polish-press',
  'restyle-kitchen-bath',
  'kloutfire-website',
  'tansavatdi-plastic-surgery',
  'raffle-consulting',
  'washington-dental',
  'fort-collins-roofing',
  'pete-mamos',
  'equilibrio-nicaragua',
  'trailertrader-2016',
  'tc-dealer-websites',
  'huffman-trailers',
  'hitchman-inc',
  'jaidynreiman-net',
  'jrplays-net'
)
AND @cat_frontend IS NOT NULL
ON DUPLICATE KEY UPDATE `updated_at` = @now;
