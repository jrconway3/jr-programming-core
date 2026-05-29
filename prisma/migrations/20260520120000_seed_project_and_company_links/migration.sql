-- Seed links for all portfolio projects using polymorphic bridge tables.
-- Safe to re-run: INSERT IGNORE + UNIQUE on url/image prevents duplicates.

SET @now := NOW(3);

-- ─────────────────────────────────────────────────────────────────────────────
-- 0. DDL: rename tables, create bridge tables, backfill, drop old columns
-- ─────────────────────────────────────────────────────────────────────────────

-- 0a. Rename jr_projects_links → jr_links
RENAME TABLE `jr_projects_links` TO `jr_links`;

-- 0b. Rename jr_projects_gallery → jr_gallery
RENAME TABLE `jr_projects_gallery` TO `jr_gallery`;

-- 0c. Create jr_link_bridges
CREATE TABLE `jr_link_bridges` (
  `id`            INT           NOT NULL AUTO_INCREMENT,
  `relation_type` ENUM('project','company','job') NOT NULL,
  `relation_id`   INT           NOT NULL,
  `link_id`       INT           NOT NULL,
  `priority`      INT           NOT NULL DEFAULT 0,
  `created_at`    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `jr_link_bridges_relation_link_key` (`relation_type`, `relation_id`, `link_id`),
  INDEX `jr_link_bridges_relation_idx` (`relation_type`, `relation_id`),
  CONSTRAINT `jr_link_bridges_link_fkey` FOREIGN KEY (`link_id`) REFERENCES `jr_links` (`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 0d. Create jr_gallery_bridges
CREATE TABLE `jr_gallery_bridges` (
  `id`            INT           NOT NULL AUTO_INCREMENT,
  `relation_type` ENUM('project','company','job') NOT NULL,
  `relation_id`   INT           NOT NULL,
  `gallery_id`    INT           NOT NULL,
  `link_id`       INT           NULL,
  `priority`      INT           NOT NULL DEFAULT 0,
  `created_at`    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `jr_gallery_bridges_relation_gallery_key` (`relation_type`, `relation_id`, `gallery_id`),
  INDEX `jr_gallery_bridges_relation_idx` (`relation_type`, `relation_id`),
  INDEX `jr_gallery_bridges_link_idx` (`link_id`),
  CONSTRAINT `jr_gallery_bridges_gallery_fkey` FOREIGN KEY (`gallery_id`) REFERENCES `jr_gallery` (`id`) ON DELETE CASCADE,
  CONSTRAINT `jr_gallery_bridges_link_fkey` FOREIGN KEY (`link_id`) REFERENCES `jr_links` (`id`) ON DELETE SET NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 0e. Backfill jr_link_bridges from jr_links.project_id
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', `project_id`, `id`, `priority`, `created_at`, `updated_at`
FROM `jr_links` WHERE `project_id` IS NOT NULL;

-- 0f. Drop old compound unique index from jr_links (was on project_id, url) if it exists.
SET @_idx_exists := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'jr_links' AND index_name = 'jr_projects_links_project_url_key');
SET @_sql := IF(@_idx_exists > 0, 'ALTER TABLE `jr_links` DROP INDEX `jr_projects_links_project_url_key`', 'SELECT 1');
PREPARE _stmt FROM @_sql; EXECUTE _stmt; DEALLOCATE PREPARE _stmt;

-- 0g. Drop project_id FK + column from jr_links
ALTER TABLE `jr_links`
  DROP FOREIGN KEY `jr_projects_links_project_id_fkey`,
  DROP COLUMN `project_id`;

-- 0h. Add UNIQUE on url(191) to jr_links
ALTER TABLE `jr_links` ADD UNIQUE INDEX `jr_links_url_key` (`url`(191));

-- 0i. Backfill jr_gallery_bridges from jr_gallery.project_id
INSERT IGNORE INTO `jr_gallery_bridges` (`relation_type`, `relation_id`, `gallery_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', `project_id`, `id`, `priority`, `created_at`, `updated_at`
FROM `jr_gallery` WHERE `project_id` IS NOT NULL;

-- 0j. Drop link_id FK + column from jr_gallery
ALTER TABLE `jr_gallery`
  DROP FOREIGN KEY `jr_projects_gallery_link_id_fkey`,
  DROP COLUMN `link_id`;

-- 0k. Drop project_id FK + column from jr_gallery
ALTER TABLE `jr_gallery`
  DROP FOREIGN KEY `jr_projects_gallery_project_id_fkey`,
  DROP INDEX `jr_projects_gallery_project_image_key`,
  DROP COLUMN `project_id`;

-- 0l. Add UNIQUE on image(191) to jr_gallery
ALTER TABLE `jr_gallery` ADD UNIQUE INDEX `jr_gallery_image_key` (`image`(191));

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Company websites (displayed on the Experience / job detail pages)
-- ─────────────────────────────────────────────────────────────────────────────

-- TrailerCentral rebranded to DealerSpike (Dec 2025)
UPDATE `jr_companies` SET `website` = 'https://www.dealerspike.com/trailer-website-marketing-provider/', `updated_at` = @now WHERE `shortcode` = 'trailercentral';
UPDATE `jr_companies` SET `website` = 'https://www.ponticlaro.net/',                                     `updated_at` = @now WHERE `shortcode` = 'ponticlaro';
UPDATE `jr_companies` SET `website` = 'https://www.upwork.com/',                                         `updated_at` = @now WHERE `shortcode` = 'odesk'; -- oDesk became Upwork 2015

-- Archived (wildcard URL — pick a snapshot from the calendar)
UPDATE `jr_companies` SET `website` = 'https://web.archive.org/web/*/https://yazamo.com/',       `updated_at` = @now WHERE `shortcode` = 'yazamo';
UPDATE `jr_companies` SET `website` = 'https://web.archive.org/web/*/https://kloutfire.com/',    `updated_at` = @now WHERE `shortcode` = 'kloutfire';
UPDATE `jr_companies` SET `website` = 'https://web.archive.org/web/*/https://freightaccess.com/',`updated_at` = @now WHERE `shortcode` = 'freight-access';
UPDATE `jr_companies` SET `website` = 'https://web.archive.org/web/*/https://seostrong.com/',    `updated_at` = @now WHERE `shortcode` = 'seo-strong';

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Resolve project IDs by shortcode
-- ─────────────────────────────────────────────────────────────────────────────

SET @p_jrprogramming     := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'jrprogramming'                  LIMIT 1);
SET @p_jaidynreiman      := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'jaidynreiman-net'               LIMIT 1);
SET @p_jrplays           := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'jrplays-net'                    LIMIT 1);
SET @p_eternity_ready    := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'eternity-ready'                 LIMIT 1);
SET @p_data_ann_ai       := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'data-annotation'                LIMIT 1);
SET @p_sands_ig          := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'sandsig'                        LIMIT 1);
SET @p_real_chords       := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'real-chords'                    LIMIT 1);
SET @p_home_solution     := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'home-solution-properties'       LIMIT 1);
SET @p_pete_mamos        := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'pete-mamos'                     LIMIT 1);
SET @p_my_choice_energy  := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'my-choice-energy'               LIMIT 1);
SET @p_equilibrio        := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'equilibrio-nicaragua'           LIMIT 1);
SET @p_millennium        := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'millennium-marketing-denver'    LIMIT 1);
SET @p_express_roofing   := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'express-roofing'               LIMIT 1);
SET @p_extreme_devs      := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'extreme-developers'             LIMIT 1);
SET @p_biodental         := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'biodental-veneers'              LIMIT 1);
SET @p_washington_dental := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'washington-dental'              LIMIT 1);
SET @p_packard_grill     := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'packard-grill'                  LIMIT 1);
SET @p_restyle           := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'restyle-kitchen-bath'           LIMIT 1);
SET @p_fort_collins      := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'fort-collins-roofing'           LIMIT 1);
SET @p_abundance         := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'abundance-campaign'             LIMIT 1);
SET @p_25kgroup          := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = '25kgroup-magazine'              LIMIT 1);
SET @p_joe_polish        := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'joe-polish-press'               LIMIT 1);
SET @p_genius_network    := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'genius-network'                 LIMIT 1);
SET @p_cps               := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'center-for-partially-sighted'   LIMIT 1);
SET @p_mangat            := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'mangat-plastic-surgery'         LIMIT 1);
SET @p_tansavatdi        := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'tansavatdi-plastic-surgery'     LIMIT 1);
SET @p_raffle            := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'raffle-consulting'              LIMIT 1);
SET @p_kloutfire_site    := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'kloutfire-website'              LIMIT 1);
SET @p_freight_access    := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'freight-access-crm'             LIMIT 1);
SET @p_tt2016            := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'trailertrader-2016'             LIMIT 1);
SET @p_huffman           := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'huffman-trailers'               LIMIT 1);
SET @p_hitchman          := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'hitchman-inc'                   LIMIT 1);
SET @p_factory_vantage   := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'factory-vantage'                LIMIT 1);
SET @p_craigslist        := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'craigslist-autoposter'         LIMIT 1);
SET @p_ksl_feed          := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'ksl-feed'                    LIMIT 1);
SET @p_overlays          := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'image-overlays'              LIMIT 1);
SET @p_dealer_sites      := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'dealer-websites'             LIMIT 1);
SET @p_elasticsearch     := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'elasticsearch'               LIMIT 1);
SET @p_crm_legacy        := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'crm-legacy'                  LIMIT 1);
SET @p_crm_system        := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'crm-system'                  LIMIT 1);
SET @p_crm_email_text    := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'crm-email-text'              LIMIT 1);
SET @p_gmail_oauth       := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'gmail-oauth-integration'        LIMIT 1);
SET @p_truckpaper        := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'truckpaper-autoposter'       LIMIT 1);
SET @p_lotvantage        := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'lotvantage-facebook'         LIMIT 1);
SET @p_facebook_mktpl    := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'facebook-marketplace'        LIMIT 1);
SET @p_twilio            := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'twilio-call-tracking'           LIMIT 1);
SET @p_twilio_sms        := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'twilio-sms-system'              LIMIT 1);
SET @p_email_stab        := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'email-system-stabilization'     LIMIT 1);
SET @p_crm_automation    := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'crm-automation'                 LIMIT 1);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Project links
--    Each unique URL gets one row in jr_links (UNIQUE on url(255)).
--    Bridge rows in jr_link_bridges associate the link with each project.
--    priority 1 = archive / context link, priority 2+ = current live URL
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Personal / self-owned ────────────────────────────────────────────────────

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Live Site', 'https://jrprogramming.net/', 2, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_jrprogramming, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://jrprogramming.net/' AND @p_jrprogramming IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Live Site', 'https://jaidynreiman.net/', 2, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_jaidynreiman, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://jaidynreiman.net/' AND @p_jaidynreiman IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Live Site', 'https://jrplays.net/', 2, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_jrplays, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://jrplays.net/' AND @p_jrplays IS NOT NULL LIMIT 1;

-- ── Freelance client ─────────────────────────────────────────────────────────

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Live Site', 'https://eternityready.com/', 2, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_eternity_ready, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://eternityready.com/' AND @p_eternity_ready IS NOT NULL LIMIT 1;

-- ── Data Annotation ──────────────────────────────────────────────────────────

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('DataAnnotation.tech', 'https://www.dataannotation.tech/', 2, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_data_ann_ai, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://www.dataannotation.tech/' AND @p_data_ann_ai IS NOT NULL LIMIT 1;

-- ── Ponticlaro ───────────────────────────────────────────────────────────────

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Archive.org', 'https://web.archive.org/web/20160110011422/http://signnn.com/', 1, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_sands_ig, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/20160110011422/http://signnn.com/' AND @p_sands_ig IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Live Site', 'https://www.sandsig.com/', 2, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_sands_ig, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://www.sandsig.com/' AND @p_sands_ig IS NOT NULL LIMIT 1;

-- ── oDesk / Freelance ────────────────────────────────────────────────────────

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Archive.org', 'https://web.archive.org/web/20141011214124/http://www.realchords.com.au/', 1, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_real_chords, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/20141011214124/http://www.realchords.com.au/' AND @p_real_chords IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Archive.org', 'https://web.archive.org/web/20120904002316/http://www.homesolutionproperties.com/', 1, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_home_solution, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/20120904002316/http://www.homesolutionproperties.com/' AND @p_home_solution IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Archive.org', 'https://web.archive.org/web/20130110111448/http://www.petemamos.com/', 1, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_pete_mamos, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/20130110111448/http://www.petemamos.com/' AND @p_pete_mamos IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Live Site', 'https://www.petemamos.com/', 2, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_pete_mamos, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://www.petemamos.com/' AND @p_pete_mamos IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Archive.org', 'https://web.archive.org/web/20130325090308/http://www.fostermychoice.com/', 1, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_my_choice_energy, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/20130325090308/http://www.fostermychoice.com/' AND @p_my_choice_energy IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Live Site', 'http://www.fostermychoice.com/', 2, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_my_choice_energy, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'http://www.fostermychoice.com/' AND @p_my_choice_energy IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Archive.org', 'https://web.archive.org/web/20120120184016/http://www.equilibrionicaragua.com/', 1, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_equilibrio, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/20120120184016/http://www.equilibrionicaragua.com/' AND @p_equilibrio IS NOT NULL LIMIT 1;

-- ── Millennium Marketing ──────────────────────────────────────────────────────

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Archive.org', 'https://web.archive.org/web/20131028204020/http://www.millenniummarketingdenver.com/', 1, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_millennium, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/20131028204020/http://www.millenniummarketingdenver.com/' AND @p_millennium IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Live Site', 'http://www.millenniummarketingdenver.com/', 2, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_millennium, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'http://www.millenniummarketingdenver.com/' AND @p_millennium IS NOT NULL LIMIT 1;

-- ── SEO Strong ───────────────────────────────────────────────────────────────

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Archive.org', 'https://web.archive.org/web/20130128035340/http://www.washington-dental.com/', 1, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_washington_dental, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/20130128035340/http://www.washington-dental.com/' AND @p_washington_dental IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Live Site', 'http://www.washington-dental.com/', 2, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_washington_dental, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'http://www.washington-dental.com/' AND @p_washington_dental IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Archive.org', 'https://web.archive.org/web/20131228151622/http://expressroofinginc.com/', 1, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_express_roofing, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/20131228151622/http://expressroofinginc.com/' AND @p_express_roofing IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Live Site', 'https://expressroofinginc.com/', 2, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_express_roofing, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://expressroofinginc.com/' AND @p_express_roofing IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Archive.org', 'https://web.archive.org/web/20140207164106/http://www.extremedevelopersinc.com/', 1, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_extreme_devs, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/20140207164106/http://www.extremedevelopersinc.com/' AND @p_extreme_devs IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Archive.org', 'https://web.archive.org/web/20130419021734/http://www.mybiodental.com/veneers-special/', 1, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_biodental, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/20130419021734/http://www.mybiodental.com/veneers-special/' AND @p_biodental IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Live Site', 'https://www.topencinodentist.com/', 2, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_biodental, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://www.topencinodentist.com/' AND @p_biodental IS NOT NULL LIMIT 1;

-- ── Dominate.net / Lead Optimize ─────────────────────────────────────────────

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Archive.org', 'https://web.archive.org/web/20130923221642/http://www.packardgrill.net/', 1, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_packard_grill, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/20130923221642/http://www.packardgrill.net/' AND @p_packard_grill IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Archive.org', 'https://web.archive.org/web/20130216072717/http://restylekitchenandbath.com/', 1, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_restyle, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/20130216072717/http://restylekitchenandbath.com/' AND @p_restyle IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Archive.org', 'https://web.archive.org/web/20130309222304/http://www.fortcollinsroofingconsultants.com/', 1, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_fort_collins, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/20130309222304/http://www.fortcollinsroofingconsultants.com/' AND @p_fort_collins IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Live Site', 'http://www.fortcollinsroofingconsultants.com/', 2, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_fort_collins, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'http://www.fortcollinsroofingconsultants.com/' AND @p_fort_collins IS NOT NULL LIMIT 1;

-- ── Yazamo ───────────────────────────────────────────────────────────────────

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Archive.org', 'https://web.archive.org/web/20131115045050/http://abundancethebook.com/ab/', 1, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_abundance, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/20131115045050/http://abundancethebook.com/ab/' AND @p_abundance IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Live Site', 'https://www.diamandis.com/abundance', 2, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_abundance, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://www.diamandis.com/abundance' AND @p_abundance IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Amazon', 'https://amzn.to/2EsPj2J', 3, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_abundance, `id`, 3, @now, @now FROM `jr_links` WHERE `url` = 'https://amzn.to/2EsPj2J' AND @p_abundance IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Archive.org', 'https://web.archive.org/web/20130607024614/http://www.25kgroup.com/MySuccess1/', 1, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_25kgroup, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/20130607024614/http://www.25kgroup.com/MySuccess1/' AND @p_25kgroup IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Live Site', 'https://geniusnetwork.com/', 2, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_25kgroup, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://geniusnetwork.com/' AND @p_25kgroup IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Archive.org', 'https://web.archive.org/web/20130923102941/http://www.joepolish.com/2012/press', 1, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_joe_polish, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/20130923102941/http://www.joepolish.com/2012/press' AND @p_joe_polish IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Live Site', 'https://www.joepolish.com/', 2, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_joe_polish, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://www.joepolish.com/' AND @p_joe_polish IS NOT NULL LIMIT 1;

-- ── KloutFire ────────────────────────────────────────────────────────────────

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Archive.org', 'https://web.archive.org/web/20130430102043/http://www.geniusnetworkmastermind.com/25k/', 1, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_genius_network, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/20130430102043/http://www.geniusnetworkmastermind.com/25k/' AND @p_genius_network IS NOT NULL LIMIT 1;

-- geniusnetwork.com already inserted for @p_25kgroup above — just add bridge
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_genius_network, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://geniusnetwork.com/' AND @p_genius_network IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Archive.org', 'https://web.archive.org/web/20130515092227/http://www.low-vision.org/', 1, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_cps, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/20130515092227/http://www.low-vision.org/' AND @p_cps IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Archive.org', 'https://web.archive.org/web/20130411215649/http://www.mangatplasticsurgery.com/', 1, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_mangat, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/20130411215649/http://www.mangatplasticsurgery.com/' AND @p_mangat IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Live Site', 'https://www.vailvalleyps.com/', 2, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_mangat, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://www.vailvalleyps.com/' AND @p_mangat IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Archive.org', 'https://web.archive.org/web/20130228190944/http://kloutfire.com/', 1, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_kloutfire_site, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/20130228190944/http://kloutfire.com/' AND @p_kloutfire_site IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Archive.org', 'https://web.archive.org/web/20130809190359/http://www.facesbydrt.com/', 1, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_tansavatdi, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/20130809190359/http://www.facesbydrt.com/' AND @p_tansavatdi IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Live Site', 'https://www.facesbydrt.com/', 2, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_tansavatdi, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://www.facesbydrt.com/' AND @p_tansavatdi IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Archive.org', 'https://web.archive.org/web/20121225064931/http://www.raffleconsulting.com/', 1, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_raffle, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/20121225064931/http://www.raffleconsulting.com/' AND @p_raffle IS NOT NULL LIMIT 1;

-- ── TrailerCentral — client-facing sites ─────────────────────────────────────

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Archive.org', 'https://web.archive.org/web/20161013100417/http://www.trailertraders.com/', 1, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_tt2016, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/20161013100417/http://www.trailertraders.com/' AND @p_tt2016 IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('TrailerTrader', 'https://www.trailertrader.com/', 2, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_tt2016, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://www.trailertrader.com/' AND @p_tt2016 IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Archive.org', 'https://web.archive.org/web/20190715224624/https://www.huffmantrailers.com/', 1, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_huffman, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/20190715224624/https://www.huffmantrailers.com/' AND @p_huffman IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Live Site', 'https://www.huffmantrailers.com/', 2, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_huffman, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://www.huffmantrailers.com/' AND @p_huffman IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Archive.org', 'https://web.archive.org/web/20180805083556/https://www.thehitchmaninc.com/', 1, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_hitchman, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/20180805083556/https://www.thehitchmaninc.com/' AND @p_hitchman IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Live Site', 'https://www.thehitchmaninc.com/', 2, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_hitchman, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://www.thehitchmaninc.com/' AND @p_hitchman IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Archive.org', 'https://web.archive.org/web/*/https://factoryvantage.com/', 1, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_factory_vantage, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/*/https://factoryvantage.com/' AND @p_factory_vantage IS NOT NULL LIMIT 1;

-- ── TrailerCentral — internal tools (shared TC archive + homepage URL) ────────

SET @p_htw_autoposter := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'horse-trailer-world'    LIMIT 1);
SET @p_cl_scheduler   := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'craigslist-scheduler'  LIMIT 1);
SET @p_camera_mobile  := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'camera-mobile-app'     LIMIT 1);
SET @p_classifieds    := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'classifieds-websites'  LIMIT 1);

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Archive.org', 'https://web.archive.org/web/*/https://www.trailercentral.com/', 1, @now, @now);

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('TrailerCentral', 'https://www.trailercentral.com/', 2, @now, @now);

-- CL Autoposter
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_craigslist, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/*/https://www.trailercentral.com/' AND @p_craigslist IS NOT NULL LIMIT 1;
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_craigslist, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://www.trailercentral.com/' AND @p_craigslist IS NOT NULL LIMIT 1;
INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Craigslist', 'https://craigslist.org/', 3, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_craigslist, `id`, 3, @now, @now FROM `jr_links` WHERE `url` = 'https://craigslist.org/' AND @p_craigslist IS NOT NULL LIMIT 1;

-- KSL Feed
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_ksl_feed, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/*/https://www.trailercentral.com/' AND @p_ksl_feed IS NOT NULL LIMIT 1;
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_ksl_feed, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://www.trailercentral.com/' AND @p_ksl_feed IS NOT NULL LIMIT 1;
INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('KSL', 'https://www.ksl.com/', 3, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_ksl_feed, `id`, 3, @now, @now FROM `jr_links` WHERE `url` = 'https://www.ksl.com/' AND @p_ksl_feed IS NOT NULL LIMIT 1;

-- Image Overlays
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_overlays, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/*/https://www.trailercentral.com/' AND @p_overlays IS NOT NULL LIMIT 1;
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_overlays, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://www.trailercentral.com/' AND @p_overlays IS NOT NULL LIMIT 1;

-- Dealer Sites
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_dealer_sites, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/*/https://www.trailercentral.com/' AND @p_dealer_sites IS NOT NULL LIMIT 1;
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_dealer_sites, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://www.trailercentral.com/' AND @p_dealer_sites IS NOT NULL LIMIT 1;

-- Elasticsearch
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_elasticsearch, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/*/https://www.trailercentral.com/' AND @p_elasticsearch IS NOT NULL LIMIT 1;
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_elasticsearch, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://www.trailercentral.com/' AND @p_elasticsearch IS NOT NULL LIMIT 1;

-- CRM Legacy
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_crm_legacy, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/*/https://www.trailercentral.com/' AND @p_crm_legacy IS NOT NULL LIMIT 1;
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_crm_legacy, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://www.trailercentral.com/' AND @p_crm_legacy IS NOT NULL LIMIT 1;

-- CRM System
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_crm_system, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/*/https://www.trailercentral.com/' AND @p_crm_system IS NOT NULL LIMIT 1;
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_crm_system, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://www.trailercentral.com/' AND @p_crm_system IS NOT NULL LIMIT 1;

-- CRM Email/Text
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_crm_email_text, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/*/https://www.trailercentral.com/' AND @p_crm_email_text IS NOT NULL LIMIT 1;
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_crm_email_text, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://www.trailercentral.com/' AND @p_crm_email_text IS NOT NULL LIMIT 1;

-- Gmail OAuth
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_gmail_oauth, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/*/https://www.trailercentral.com/' AND @p_gmail_oauth IS NOT NULL LIMIT 1;
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_gmail_oauth, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://www.trailercentral.com/' AND @p_gmail_oauth IS NOT NULL LIMIT 1;

-- TruckPaper Autoposter
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_truckpaper, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/*/https://www.trailercentral.com/' AND @p_truckpaper IS NOT NULL LIMIT 1;
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_truckpaper, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://www.trailercentral.com/' AND @p_truckpaper IS NOT NULL LIMIT 1;
INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('TruckPaper', 'https://www.truckpaper.com/', 3, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_truckpaper, `id`, 3, @now, @now FROM `jr_links` WHERE `url` = 'https://www.truckpaper.com/' AND @p_truckpaper IS NOT NULL LIMIT 1;

-- LotVantage Facebook
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_lotvantage, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/*/https://www.trailercentral.com/' AND @p_lotvantage IS NOT NULL LIMIT 1;
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_lotvantage, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://www.trailercentral.com/' AND @p_lotvantage IS NOT NULL LIMIT 1;

-- Twilio Call Tracking
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_twilio, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/*/https://www.trailercentral.com/' AND @p_twilio IS NOT NULL LIMIT 1;
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_twilio, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://www.trailercentral.com/' AND @p_twilio IS NOT NULL LIMIT 1;

-- Twilio SMS
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_twilio_sms, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/*/https://www.trailercentral.com/' AND @p_twilio_sms IS NOT NULL LIMIT 1;
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_twilio_sms, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://www.trailercentral.com/' AND @p_twilio_sms IS NOT NULL LIMIT 1;

-- Email System Stabilization
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_email_stab, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/*/https://www.trailercentral.com/' AND @p_email_stab IS NOT NULL LIMIT 1;
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_email_stab, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://www.trailercentral.com/' AND @p_email_stab IS NOT NULL LIMIT 1;

-- CRM Automation
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_crm_automation, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/*/https://www.trailercentral.com/' AND @p_crm_automation IS NOT NULL LIMIT 1;
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_crm_automation, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://www.trailercentral.com/' AND @p_crm_automation IS NOT NULL LIMIT 1;

-- Facebook Marketplace
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_facebook_mktpl, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/*/https://www.trailercentral.com/' AND @p_facebook_mktpl IS NOT NULL LIMIT 1;
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_facebook_mktpl, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://www.trailercentral.com/' AND @p_facebook_mktpl IS NOT NULL LIMIT 1;
INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Facebook Marketplace', 'https://www.facebook.com/marketplace/', 3, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_facebook_mktpl, `id`, 3, @now, @now FROM `jr_links` WHERE `url` = 'https://www.facebook.com/marketplace/' AND @p_facebook_mktpl IS NOT NULL LIMIT 1;
INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Facebook', 'https://www.facebook.com/', 4, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_facebook_mktpl, `id`, 4, @now, @now FROM `jr_links` WHERE `url` = 'https://www.facebook.com/' AND @p_facebook_mktpl IS NOT NULL LIMIT 1;

-- HTW Autoposter
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_htw_autoposter, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/*/https://www.trailercentral.com/' AND @p_htw_autoposter IS NOT NULL LIMIT 1;
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_htw_autoposter, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://www.trailercentral.com/' AND @p_htw_autoposter IS NOT NULL LIMIT 1;
INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('HTW', 'https://horsetrailerworld.com/', 3, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_htw_autoposter, `id`, 3, @now, @now FROM `jr_links` WHERE `url` = 'https://horsetrailerworld.com/' AND @p_htw_autoposter IS NOT NULL LIMIT 1;

-- CL Scheduler
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_cl_scheduler, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/*/https://www.trailercentral.com/' AND @p_cl_scheduler IS NOT NULL LIMIT 1;
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_cl_scheduler, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://www.trailercentral.com/' AND @p_cl_scheduler IS NOT NULL LIMIT 1;

-- Camera Mobile App
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_camera_mobile, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/*/https://www.trailercentral.com/' AND @p_camera_mobile IS NOT NULL LIMIT 1;
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_camera_mobile, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://www.trailercentral.com/' AND @p_camera_mobile IS NOT NULL LIMIT 1;

-- TC Classifieds Websites
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_classifieds, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/*/https://www.trailercentral.com/' AND @p_classifieds IS NOT NULL LIMIT 1;
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_classifieds, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://www.trailercentral.com/' AND @p_classifieds IS NOT NULL LIMIT 1;

-- CL Scheduler shares gallery images with CL Autoposter
INSERT IGNORE INTO `jr_gallery_bridges` (`relation_type`, `relation_id`, `gallery_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_cl_scheduler, gb.`gallery_id`, gb.`priority`, @now, @now
FROM `jr_gallery_bridges` gb
WHERE gb.`relation_type` = 'project'
  AND gb.`relation_id` = @p_craigslist
  AND @p_cl_scheduler IS NOT NULL
  AND @p_craigslist IS NOT NULL;

-- ── Personal projects (ULPC, LT Engine) ──────────────────────────────────────

SET @p_ulpc := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'ulpc-spritesheet-generator' LIMIT 1);
SET @p_lt   := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'lex-talionis-engine' LIMIT 1);

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('ULPC Generator', 'https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/', 2, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_ulpc, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/' AND @p_ulpc IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('GitHub', 'https://github.com/LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator/', 3, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_ulpc, `id`, 3, @now, @now FROM `jr_links` WHERE `url` = 'https://github.com/LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator/' AND @p_ulpc IS NOT NULL LIMIT 1;

INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('GitLab', 'https://gitlab.com/rainlash/lt-maker/', 2, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_lt, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://gitlab.com/rainlash/lt-maker/' AND @p_lt IS NOT NULL LIMIT 1;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Company links
-- ─────────────────────────────────────────────────────────────────────────────

SET @c_kloutfire := (SELECT `id` FROM `jr_companies` WHERE `shortcode` = 'kloutfire' LIMIT 1);

-- KloutFire: archived domain link
INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('KloutFire (archived)', 'https://web.archive.org/web/*/https://kloutfire.com/', 1, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'company', @c_kloutfire, `id`, 1, @now, @now FROM `jr_links` WHERE `url` = 'https://web.archive.org/web/*/https://kloutfire.com/' AND @c_kloutfire IS NOT NULL LIMIT 1;

-- KloutFire rebranded to Yazamo — link the current Yazamo domain
INSERT IGNORE INTO `jr_links` (`website`, `url`, `priority`, `created_at`, `updated_at`)
VALUES ('Yazamo (current)', 'https://yazamo.com/', 2, @now, @now);
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'company', @c_kloutfire, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://yazamo.com/' AND @c_kloutfire IS NOT NULL LIMIT 1;

-- kloutfire-website project also links to the Yazamo domain (same URL row, new bridge)
INSERT IGNORE INTO `jr_link_bridges` (`relation_type`, `relation_id`, `link_id`, `priority`, `created_at`, `updated_at`)
SELECT 'project', @p_kloutfire_site, `id`, 2, @now, @now FROM `jr_links` WHERE `url` = 'https://yazamo.com/' AND @p_kloutfire_site IS NOT NULL LIMIT 1;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Replace oDesk job with Freelance
--    The 20260422190000 migration seeded an 'odesk' job as an umbrella for
--    early freelance work. A proper 'Freelance' company + job replace it here.
--    Roles, impacts, and project relations are moved before the oDesk job is
--    removed. The oDesk company row stays in jr_companies for reference.
-- ─────────────────────────────────────────────────────────────────────────────

SET @odesk_job_id := (SELECT `id` FROM `jr_jobs` WHERE `shortcode` = 'odesk' LIMIT 1);

INSERT INTO `jr_companies` (`name`, `shortcode`, `website`, `created_at`, `updated_at`)
VALUES ('Freelance', 'freelance', NULL, @now, @now)
ON DUPLICATE KEY UPDATE `updated_at` = @now;

SET @c_freelance := (SELECT `id` FROM `jr_companies` WHERE `shortcode` = 'freelance' LIMIT 1);

INSERT INTO `jr_jobs` (`shortcode`, `company_id`, `is_primary_tier`, `summary`, `start_date`, `end_date`, `priority`, `created_at`, `updated_at`)
VALUES (
  'freelance',
  @c_freelance,
  0,
  'Handled a variety of freelance web development contracts and projects across multiple clients, primarily through other companies or job boards like oDesk and Freelancer, with a focus on WordPress implementations.',
  '2011-04-01 00:00:00.000',
  '2016-03-01 00:00:00.000',
  60,
  @now,
  @now
)
ON DUPLICATE KEY UPDATE
  `company_id` = VALUES(`company_id`),
  `summary` = VALUES(`summary`),
  `updated_at` = @now;

SET @freelance_job_id := (SELECT `id` FROM `jr_jobs` WHERE `shortcode` = 'freelance' LIMIT 1);

UPDATE `jr_job_roles`
  SET `job_id` = @freelance_job_id
  WHERE `job_id` = @odesk_job_id AND @freelance_job_id IS NOT NULL AND @odesk_job_id IS NOT NULL;

UPDATE `jr_job_impacts`
  SET `job_id` = @freelance_job_id
  WHERE `job_id` = @odesk_job_id AND @freelance_job_id IS NOT NULL AND @odesk_job_id IS NOT NULL;

UPDATE `jr_job_project_relations`
  SET `job_id` = @freelance_job_id
  WHERE `job_id` = @odesk_job_id AND @freelance_job_id IS NOT NULL AND @odesk_job_id IS NOT NULL;

DELETE FROM `jr_jobs` WHERE `id` = @odesk_job_id AND @odesk_job_id IS NOT NULL;
