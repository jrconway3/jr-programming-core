-- Delete legacy "job-as-project" placeholder entries (predated the Jobs table).
DELETE FROM `jr_projects_cats` WHERE `project_id` IN (
  SELECT `id` FROM `jr_projects` WHERE `name` IN (
    'Web Developer at Ponticlaro',
    'Web Developer at Lead Optimize',
    'Web Developer at Appster',
    'Web Developer at Millennium Marketing Solutions LLC',
    'Web Developer at KloutFire',
    'Web Development Freelancer at SeoStrong',
    'Web Developer at Yazamo',
    'Web Development Freelancer at Dominate Net',
    'Software Engineer III at TrailerCentral',
    'Lead Developer at TrailerCentral',
    'Web Programmer at TrailerCentral',
    'Web Application Developer at Freight Access, Inc.'
  )
);
DELETE FROM `jr_projects_skills` WHERE `project_id` IN (
  SELECT `id` FROM `jr_projects` WHERE `name` IN (
    'Web Developer at Ponticlaro',
    'Web Developer at Lead Optimize',
    'Web Developer at Appster',
    'Web Developer at Millennium Marketing Solutions LLC',
    'Web Developer at KloutFire',
    'Web Development Freelancer at SeoStrong',
    'Web Developer at Yazamo',
    'Web Development Freelancer at Dominate Net',
    'Software Engineer III at TrailerCentral',
    'Lead Developer at TrailerCentral',
    'Web Programmer at TrailerCentral',
    'Web Application Developer at Freight Access, Inc.'
  )
);
DELETE FROM `jr_projects` WHERE `name` IN (
  'Web Developer at Ponticlaro',
  'Web Developer at Lead Optimize',
  'Web Developer at Appster',
  'Web Developer at Millennium Marketing Solutions LLC',
  'Web Developer at KloutFire',
  'Web Development Freelancer at SeoStrong',
  'Web Developer at Yazamo',
  'Web Development Freelancer at Dominate Net',
  'Software Engineer III at TrailerCentral',
  'Lead Developer at TrailerCentral',
  'Web Programmer at TrailerCentral',
  'Web Application Developer at Freight Access, Inc.'
);

-- Delete the redundant 2019 server-side Facebook Marketplace entry.
-- The 2016 Chrome extension entry (tc-facebook-marketplace) is kept and its description updated below.
DELETE FROM `jr_projects_cats` WHERE `project_id` IN (
  SELECT `id` FROM `jr_projects` WHERE `name` = 'TrailerCentral Facebook Marketplace Server Integration'
);
DELETE FROM `jr_projects_skills` WHERE `project_id` IN (
  SELECT `id` FROM `jr_projects` WHERE `name` = 'TrailerCentral Facebook Marketplace Server Integration'
);
DELETE FROM `jr_projects` WHERE `name` = 'TrailerCentral Facebook Marketplace Server Integration';

-- Replace featured projects on the homepage.
-- Clears all existing featured-projects assignments and inserts the three
-- chosen projects in display order.

SET @cat := (SELECT `id` FROM `jr_cats` WHERE `shortcode` = 'featured-projects' LIMIT 1);

DELETE FROM `jr_projects_cats` WHERE `category_id` = @cat;

INSERT IGNORE INTO `jr_projects_cats` (`project_id`, `category_id`, `priority`, `created_at`, `updated_at`)
SELECT p.`id`, @cat, 0, NOW(3), NOW(3) FROM `jr_projects` p
WHERE p.`shortcode` = 'twilio-call-tracking' AND @cat IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_projects_cats` (`project_id`, `category_id`, `priority`, `created_at`, `updated_at`)
SELECT p.`id`, @cat, 1, NOW(3), NOW(3) FROM `jr_projects` p
WHERE p.`shortcode` = 'craigslist-autoposter' AND @cat IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_projects_cats` (`project_id`, `category_id`, `priority`, `created_at`, `updated_at`)
SELECT p.`id`, @cat, 2, NOW(3), NOW(3) FROM `jr_projects` p
WHERE p.`shortcode` = 'crm-email-text' AND @cat IS NOT NULL LIMIT 1;

-- Professional experience start year (used for "X+ years" stat on homepage).
INSERT INTO `jr_settings` (`key`, `value`, `created_at`, `updated_at`)
VALUES ('home/stats/experience_start_year', '2011', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `value` = '2011', `updated_at` = NOW(3);

-- Fix project names: remove "TrailerCentral " company prefix and clean up parentheses.
UPDATE `jr_projects` SET `name` = 'TrailerTrader 2016',               `updated_at` = NOW(3) WHERE `shortcode` = 'trailertrader-2016';
UPDATE `jr_projects` SET `name` = 'Craigslist Autoposter',            `updated_at` = NOW(3) WHERE `shortcode` = 'craigslist-autoposter';
UPDATE `jr_projects` SET `name` = 'HTW Autoposter',                   `updated_at` = NOW(3) WHERE `shortcode` = 'horse-trailer-world';
UPDATE `jr_projects` SET `name` = 'KSL Feed',                         `updated_at` = NOW(3) WHERE `shortcode` = 'ksl-feed';
UPDATE `jr_projects` SET `name` = 'Facebook Marketplace Autoposter',  `updated_at` = NOW(3) WHERE `shortcode` = 'tc-facebook-marketplace';
UPDATE `jr_projects` SET `name` = 'Custom Inventory Image Overlays',  `updated_at` = NOW(3) WHERE `shortcode` = 'image-overlays';
UPDATE `jr_projects` SET `name` = 'Responsive Websites in Foundation', `updated_at` = NOW(3) WHERE `shortcode` = 'dealer-websites';
UPDATE `jr_projects` SET `name` = 'Elastic Search for Inventory',     `updated_at` = NOW(3) WHERE `shortcode` = 'elasticsearch';
UPDATE `jr_projects` SET `name` = 'CRM Zend Framework',               `updated_at` = NOW(3) WHERE `shortcode` = 'crm-legacy';
UPDATE `jr_projects` SET `name` = 'CRM Nuxt Dashboard',               `updated_at` = NOW(3) WHERE `shortcode` = 'crm-system';
UPDATE `jr_projects` SET `name` = 'Email & Text Marketing for CRM',   `updated_at` = NOW(3) WHERE `shortcode` = 'crm-email-text';
UPDATE `jr_projects` SET `name` = 'TruckPaper Autoposter',            `updated_at` = NOW(3) WHERE `shortcode` = 'truckpaper-autoposter';
UPDATE `jr_projects` SET `name` = 'LotVantage Facebook Feed',         `updated_at` = NOW(3) WHERE `shortcode` = 'lotvantage-facebook';
UPDATE `jr_projects` SET `name` = 'Craigslist Auto Scheduler',        `updated_at` = NOW(3) WHERE `name` = 'TrailerCentral Craigslist Scheduler (Chrome Extension)';
UPDATE `jr_projects` SET `name` = 'Huffman Trailers',                 `updated_at` = NOW(3) WHERE `shortcode` = 'huffman-trailers';
UPDATE `jr_projects` SET `name` = 'The Hitchman, Inc.',               `updated_at` = NOW(3) WHERE `shortcode` = 'hitchman-inc';

-- Fix project positions.
-- Match by both shortcode and name to handle any environment where shortcode assignment may have run order issues.
UPDATE `jr_projects` SET `position` = 'Personal Project', `updated_at` = NOW(3)
WHERE `shortcode` IN ('ulpc-spritesheet-generator', 'lex-talionis-engine', 'jrprogramming')
   OR `name` IN ('Universal LPC Spritesheet Character Generator', 'Universal Spritesheet Character Generator', 'Lex Talionis Engine', 'JR Programming');

-- Remove personal projects from job relations — the 20260422190000 oDesk catch-all sweep incorrectly
-- linked these to the oDesk/Freelance job. Personal projects should not appear under any employer.
DELETE FROM `jr_job_project_relations`
WHERE `project_id` IN (
  SELECT `id` FROM `jr_projects`
  WHERE `shortcode` IN ('ulpc-spritesheet-generator', 'lex-talionis-engine', 'jrprogramming')
     OR `name` IN ('Universal LPC Spritesheet Character Generator', 'Universal Spritesheet Character Generator', 'Lex Talionis Engine', 'JR Programming')
);

-- Fix project roles and company names.
UPDATE `jr_projects` SET `role` = 'Chrome Extension Developer', `updated_at` = NOW(3)
WHERE `shortcode` = 'tc-facebook-marketplace';

-- Merge the deleted 2019 server-side attempt description into the Chrome extension entry.
UPDATE `jr_projects` SET
  `extended` = 'The Facebook Marketplace autoposter was approached in multiple phases. The initial version was a Chrome extension built like the Craigslist and HTW autoposters, with scheduler support intended to minimize manual dealer effort. A later server-side iteration proved more challenging — triggering image uploads and managing dealer account logins could not be reliably automated, and despite bringing in a contractor to help, the login verification problem remained unsolved. Both approaches were eventually dropped; Facebook later shut down third-party dealer posting to Marketplace entirely, and we transitioned to a feed-based approach through LotVantage instead.',
  `updated_at` = NOW(3)
WHERE `shortcode` = 'tc-facebook-marketplace';

UPDATE `jr_projects` SET
  `extended` = 'Built a production call tracking and routing system using Twilio APIs and Laravel. Implemented real-time call forwarding, lead attribution, and webhook-based event processing. Designed queue-driven backend architecture for call state handling, logging, and reliable event processing. System supports multi-source lead attribution and integrates into CRM workflows for accurate reporting and operational visibility.',
  `updated_at` = NOW(3)
WHERE `shortcode` = 'twilio-call-tracking';

UPDATE `jr_projects` SET `position` = 'TrailerCentral', `updated_at` = NOW(3)
WHERE `shortcode` IN ('trailertrader-2016', 'factory-vantage', 'lotvantage-facebook');

-- Add two new TC key systems (Twilio SMS and Gmail OAuth) to the existing four.
SET @tc_job := (SELECT `id` FROM `jr_jobs` WHERE `shortcode` = 'trailercentral' LIMIT 1);

INSERT IGNORE INTO `jr_job_project_relations` (`job_id`, `project_id`, `relation_type`, `priority`, `created_at`, `updated_at`)
SELECT @tc_job, p.`id`, 'key_system', 4, NOW(3), NOW(3) FROM `jr_projects` p
WHERE p.`shortcode` = 'twilio-sms-system' AND @tc_job IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_job_project_relations` (`job_id`, `project_id`, `relation_type`, `priority`, `created_at`, `updated_at`)
SELECT @tc_job, p.`id`, 'key_system', 5, NOW(3), NOW(3) FROM `jr_projects` p
WHERE p.`shortcode` = 'gmail-oauth-integration' AND @tc_job IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_job_project_relations` (`job_id`, `project_id`, `relation_type`, `priority`, `created_at`, `updated_at`)
SELECT @tc_job, p.`id`, 'key_system', 6, NOW(3), NOW(3) FROM `jr_projects` p
WHERE p.`shortcode` = 'crm-system' AND @tc_job IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_job_project_relations` (`job_id`, `project_id`, `relation_type`, `priority`, `created_at`, `updated_at`)
SELECT @tc_job, p.`id`, 'key_system', 7, NOW(3), NOW(3) FROM `jr_projects` p
WHERE p.`shortcode` = 'image-overlays' AND @tc_job IS NOT NULL LIMIT 1;

-- Link all TrailerCentral portfolio projects to the TC job as 'project' relations.
-- INSERT IGNORE skips projects already inserted as key systems above or in earlier migrations.
INSERT IGNORE INTO `jr_job_project_relations` (`job_id`, `project_id`, `relation_type`, `priority`, `created_at`, `updated_at`)
SELECT @tc_job, p.`id`, 'project', p.`id`, NOW(3), NOW(3)
FROM `jr_projects` p
WHERE p.`position` = 'TrailerCentral'
  AND p.`shortcode` IS NOT NULL
  AND @tc_job IS NOT NULL;

-- Set end date to Jan 2026 for all TC projects and the TC job showing as "Present".
UPDATE `jr_projects`
SET `end_date` = '2026-01-01 00:00:00.000', `updated_at` = NOW(3)
WHERE `position` = 'TrailerCentral' AND `end_date` IS NULL;

UPDATE `jr_jobs`
SET `end_date` = '2026-01-01 00:00:00.000', `updated_at` = NOW(3)
WHERE `shortcode` = 'trailercentral' AND `end_date` IS NULL;

-- Remove incorrectly assigned gallery images for TC Facebook Marketplace Autoposter.
DELETE gb FROM `jr_gallery_bridges` gb
INNER JOIN `jr_projects` p ON p.`id` = gb.`relation_id`
WHERE gb.`relation_type` = 'project' AND p.`shortcode` = 'tc-facebook-marketplace';
