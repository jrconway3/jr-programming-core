-- Seed portfolio gallery images for all projects that have screenshots.
-- Unique index on (project_id, image) to prevent duplicate gallery entries.

SET @_tbl := (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name='jr_projects_gallery');
SET @_sql := IF(@_tbl > 0,
  'ALTER TABLE `jr_projects_gallery` ADD UNIQUE INDEX IF NOT EXISTS `jr_projects_gallery_project_image_key`(`project_id`, `image`(191))',
  'SELECT 1');
PREPARE _s FROM @_sql; EXECUTE _s; DEALLOCATE PREPARE _s;

SET @now := NOW(3);

-- ─────────────────────────────────────────────────────
-- Resolve project IDs by shortcode for use in gallery INSERTs.
-- ─────────────────────────────────────────────────────

SET @p_sands_ig                  := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'sandsig' LIMIT 1);
SET @p_real_chords               := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'real-chords' LIMIT 1);
SET @p_express_roofing           := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'express-roofing' LIMIT 1);
SET @p_extreme_devs              := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'extreme-developers' LIMIT 1);
SET @p_packard_grill             := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'packard-grill' LIMIT 1);
SET @p_biodental                 := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'biodental-veneers' LIMIT 1);
SET @p_cps                       := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'center-for-partially-sighted' LIMIT 1);
SET @p_mangat                    := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'mangat-plastic-surgery' LIMIT 1);
SET @p_restyle                   := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'restyle-kitchen-bath' LIMIT 1);
SET @p_kloutfire_site            := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'kloutfire-website' LIMIT 1);
SET @p_my_choice_energy          := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'my-choice-energy' LIMIT 1);
SET @p_tansavatdi                := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'tansavatdi-plastic-surgery' LIMIT 1);
SET @p_raffle                    := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'raffle-consulting' LIMIT 1);
SET @p_washington_dental         := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'washington-dental' LIMIT 1);
SET @p_pete_mamos                := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'pete-mamos' LIMIT 1);
SET @p_home_solution             := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'home-solution-properties' LIMIT 1);
SET @p_craigslist                := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'craigslist-autoposter' LIMIT 1);
SET @p_tt2016                    := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'trailertrader-2016' LIMIT 1);
SET @p_overlays                  := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'image-overlays' LIMIT 1);
SET @p_crm_legacy                := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'crm-legacy' LIMIT 1);
SET @p_crm_system                := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'crm-system' LIMIT 1);
SET @p_crm_email_text            := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'crm-email-text' LIMIT 1);
SET @p_lotvantage                := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'lotvantage-facebook' LIMIT 1);
SET @p_twilio                    := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'twilio-call-tracking' LIMIT 1);
SET @p_huffman                   := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'huffman-trailers' LIMIT 1);
SET @p_hitchman                  := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'hitchman-inc' LIMIT 1);
SET @p_factory_vantage           := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'factory-vantage' LIMIT 1);
SET @p_twilio_sms                := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'twilio-sms-system' LIMIT 1);
SET @p_gmail_oauth               := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'gmail-oauth-integration' LIMIT 1);
SET @p_facebook_mktpl            := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'facebook-marketplace' LIMIT 1);
SET @p_abundance                 := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'abundance-campaign' LIMIT 1);
SET @p_genius_network            := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'genius-network' LIMIT 1);
SET @p_joe_polish                := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'joe-polish-press' LIMIT 1);
SET @p_equilibrio                := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'equilibrio-nicaragua' LIMIT 1);
SET @p_millennium                := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'millennium-marketing-denver' LIMIT 1);
SET @p_ulpc                      := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'ulpc-spritesheet-generator' LIMIT 1);
SET @p_lt                        := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'lex-talionis-engine' LIMIT 1);
SET @p_jrprogramming             := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'jrprogramming' LIMIT 1);
SET @p_jaidynreiman              := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'jaidynreiman-net' LIMIT 1);

-- ─────────────────────────────────────────────────────
-- Gallery entries — one INSERT block per project group.
-- priority: lower = shown first on the detail page and used as card thumbnail.
-- ─────────────────────────────────────────────────────

-- TrailerCentral: Craigslist Autoposter
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_craigslist, 'Craigslist Extension',               '/images/portfolio/trailercentral/craigslist-autoposter/01-craigslist-extension.jpeg',           0, @now, @now),
  (@p_craigslist, 'Craigslist Scheduler',               '/images/portfolio/trailercentral/craigslist-autoposter/02-craigslist-scheduler.jpeg',           1, @now, @now),
  (@p_craigslist, 'Craigslist Scheduler (Responsive)',  '/images/portfolio/trailercentral/craigslist-autoposter/03-craigslist-scheduler-responsive.jpeg', 2, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- TrailerCentral: TrailerTrader 2016
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_tt2016, 'TrailerTraders 2016', '/images/portfolio/trailercentral/trailertrader-2016/01-trailertrader-2016.jpeg', 0, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- TrailerCentral: CRM (Zend Legacy)
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_crm_legacy, 'Dashboard',         '/images/portfolio/trailercentral/crm-legacy-zend-framework/01-crm-legacy-dashboard.png',    0, @now, @now),
  (@p_crm_legacy, 'Lead Details',      '/images/portfolio/trailercentral/crm-legacy-zend-framework/02-crm-legacy-lead-details.png', 1, @now, @now),
  (@p_crm_legacy, 'Gmail OAuth Setup', '/images/portfolio/trailercentral/crm-legacy-zend-framework/03-gmail-oauth.png',             2, @now, @now),
  (@p_crm_legacy, 'Gmail Sign In',     '/images/portfolio/trailercentral/crm-legacy-zend-framework/04-gmail-signin.png',            3, @now, @now),
  (@p_crm_legacy, 'Send Email',        '/images/portfolio/trailercentral/crm-legacy-zend-framework/05-crm-send-email.png',          4, @now, @now),
  (@p_crm_legacy, 'Archived View',     '/images/portfolio/trailercentral/crm-legacy-zend-framework/06-crm-legacy-archived.png',     5, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- TrailerCentral: CRM System (Nuxt/Vue)
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_crm_system, 'Dashboard',               '/images/portfolio/trailercentral/crm-system/01_crm_nuxt_dashboard.jpeg',            0, @now, @now),
  (@p_crm_system, 'Dashboard (Responsive)',  '/images/portfolio/trailercentral/crm-system/02_crm_nuxt_dashboard_responsive.jpeg', 1, @now, @now),
  (@p_crm_system, 'Interactions',            '/images/portfolio/trailercentral/crm-system/03_crm_nuxt_interactions.png',          2, @now, @now),
  (@p_crm_system, 'Salespeople',             '/images/portfolio/trailercentral/crm-system/04_crm_nuxt_salespeople.png',           3, @now, @now),
  (@p_crm_system, 'Stats',                   '/images/portfolio/trailercentral/crm-system/05_crm_nuxt_stats.png',                 4, @now, @now),
  (@p_crm_system, 'Lead Details',            '/images/portfolio/trailercentral/crm-system/06_crm_nuxt_lead_details.png',          5, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- TrailerCentral: CRM Email & Text Marketing
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_crm_email_text, 'Template Builder',      '/images/portfolio/trailercentral/crm-email-text-marketing/01-template-builder.png',     0, @now, @now),
  (@p_crm_email_text, 'Drip Campaigns',        '/images/portfolio/trailercentral/crm-email-text-marketing/02-drip-campaigns.png',        1, @now, @now),
  (@p_crm_email_text, 'Drip Campaign Report',  '/images/portfolio/trailercentral/crm-email-text-marketing/03-drip-campaign-report.png',  2, @now, @now),
  (@p_crm_email_text, 'Send Blasts',           '/images/portfolio/trailercentral/crm-email-text-marketing/04-send-blasts.png',           3, @now, @now),
  (@p_crm_email_text, 'Send Blasts Report',    '/images/portfolio/trailercentral/crm-email-text-marketing/05-send-blasts-report.png',    4, @now, @now),
  (@p_crm_email_text, 'Email Templates',       '/images/portfolio/trailercentral/crm-email-text-marketing/06-email-templates.png',       5, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- TrailerCentral: Gmail OAuth Integration
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_gmail_oauth, 'Gmail OAuth Setup',      '/images/portfolio/trailercentral/gmail-oauth/01-gmail-oauth.png',            0, @now, @now),
  (@p_gmail_oauth, 'Gmail OAuth Connected',  '/images/portfolio/trailercentral/gmail-oauth/02-gmail-oauth-connected.png',  1, @now, @now),
  (@p_gmail_oauth, 'Send From Gmail',        '/images/portfolio/trailercentral/gmail-oauth/03-send-from-gmail-email.png',  2, @now, @now),
  (@p_gmail_oauth, 'Email Interaction',      '/images/portfolio/trailercentral/gmail-oauth/04-email-interaction.png',      3, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- TrailerCentral: Image Overlays
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_overlays, 'Image Overlays System',           '/images/portfolio/trailercentral/image-overlays/01-image-overlays-system.jpg',              0, @now, @now),
  (@p_overlays, 'Image Overlays (Mobile)',          '/images/portfolio/trailercentral/image-overlays/02-image-overlays-mobile.jpg',              1, @now, @now),
  (@p_overlays, 'TrailerTrader Image Overlays',     '/images/portfolio/trailercentral/image-overlays/03-image-overlays-trailertrader.jpg',      2, @now, @now),
  (@p_overlays, 'TrailerTrader Overlays (Mobile)',  '/images/portfolio/trailercentral/image-overlays/04-image-overlays-trailertrader-mobile.jpg', 3, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- TrailerCentral: LotVantage Facebook Feed
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_lotvantage, 'Facebook Catalog',              '/images/portfolio/trailercentral/lotvantage-facebook-feed/01-facebook-catalog.jpeg',              0, @now, @now),
  (@p_lotvantage, 'Facebook Catalog (Responsive)', '/images/portfolio/trailercentral/lotvantage-facebook-feed/02-facebook-catalog-responsive.jpeg',  1, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- TrailerCentral: Twilio Call Tracking
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_twilio, 'TrailerTrader Live Page (Calls)',  '/images/portfolio/trailercentral/twilio-call-tracking/01-trailertrader-live-page-calls.jpeg', 0, @now, @now),
  (@p_twilio, 'Call Forwarding Form',             '/images/portfolio/trailercentral/twilio-call-tracking/02-call-forwarding-form.jpeg',           1, @now, @now),
  (@p_twilio, 'Call Status Checks',               '/images/portfolio/trailercentral/twilio-call-tracking/03-call-status-checks.png',              2, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- TrailerCentral: Twilio SMS System
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_twilio_sms, 'Text Status Tracking',  '/images/portfolio/trailercentral/twilio-sms/01-text-status-tracking.png', 0, @now, @now),
  (@p_twilio_sms, 'Text Blast Report',     '/images/portfolio/trailercentral/twilio-sms/02-text-blast-report.png',    1, @now, @now),
  (@p_twilio_sms, 'Text Blast List',       '/images/portfolio/trailercentral/twilio-sms/03-text-blast-list.png',      2, @now, @now),
  (@p_twilio_sms, 'SMS History',           '/images/portfolio/trailercentral/twilio-sms/04-sms-history.png',          3, @now, @now),
  (@p_twilio_sms, 'Enable SMS',            '/images/portfolio/trailercentral/twilio-sms/05-enable-sms.png',           4, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- TrailerCentral: Huffman Trailers
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_huffman, 'Hero',      '/images/portfolio/trailercentral/huffman-trailers/01-huffman-hero.png',     0, @now, @now),
  (@p_huffman, 'Featured',  '/images/portfolio/trailercentral/huffman-trailers/02-huffman-featured.png', 1, @now, @now),
  (@p_huffman, 'Welcome',   '/images/portfolio/trailercentral/huffman-trailers/03-huffman-welcome.png',  2, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- TrailerCentral: The Hitchman, Inc.
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_hitchman, 'Hero',      '/images/portfolio/trailercentral/the-hitchman-inc/01-hitch-man-hero.png',     0, @now, @now),
  (@p_hitchman, 'Featured',  '/images/portfolio/trailercentral/the-hitchman-inc/02-hitch-man-featured.png', 1, @now, @now),
  (@p_hitchman, 'Welcome',   '/images/portfolio/trailercentral/the-hitchman-inc/03-hitch-man-welcome.png',  2, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- TrailerCentral: Factory Vantage
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_factory_vantage, 'Hero',      '/images/portfolio/trailercentral/factory-vantage/01-fv-hero.png',     0, @now, @now),
  (@p_factory_vantage, 'Insights',  '/images/portfolio/trailercentral/factory-vantage/02-fv-insights.png', 1, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- TrailerCentral: Facebook Marketplace Autoposter
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_facebook_mktpl, 'FB Catalog',              '/images/portfolio/trailercentral/catalog-app-integration/01-fb-catalog.jpeg',             0, @now, @now),
  (@p_facebook_mktpl, 'FB Catalog (Responsive)', '/images/portfolio/trailercentral/catalog-app-integration/02-fb-catalog-responsive.jpeg', 1, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- Kloutfire: Mangat Plastic Surgery
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_mangat, 'Header',     '/images/portfolio/kloutfire/mangat-plastic-surgery/01_mangat_header.png',    0, @now, @now),
  (@p_mangat, 'Content',    '/images/portfolio/kloutfire/mangat-plastic-surgery/02_mangat_content.png',   1, @now, @now),
  (@p_mangat, 'Gallery',    '/images/portfolio/kloutfire/mangat-plastic-surgery/03_mangat_gallery.png',   2, @now, @now),
  (@p_mangat, 'Locations',  '/images/portfolio/kloutfire/mangat-plastic-surgery/04_mangat_locations.png', 3, @now, @now),
  (@p_mangat, 'Footer',     '/images/portfolio/kloutfire/mangat-plastic-surgery/05_mangat_footer.png',    4, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- Kloutfire: Center for the Partially Sighted
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_cps, 'Home',     '/images/portfolio/kloutfire/center-for-partially-sighted/01_cpc_home.jpg',    0, @now, @now),
  (@p_cps, 'Contact',  '/images/portfolio/kloutfire/center-for-partially-sighted/02_cpc_contact.jpg', 1, @now, @now),
  (@p_cps, 'Footer',   '/images/portfolio/kloutfire/center-for-partially-sighted/03_cpc_footer.jpg',  2, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- Kloutfire: Tansavatdi Plastic Surgery
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_tansavatdi, 'Header',  '/images/portfolio/kloutfire/tansavatdi-plastic-surgery/01_tansavadti_header.jpg', 0, @now, @now),
  (@p_tansavatdi, 'About',   '/images/portfolio/kloutfire/tansavatdi-plastic-surgery/02_tansavadti_about.jpg',  1, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- Kloutfire: KloutFire Website
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_kloutfire_site, 'Home',    '/images/portfolio/kloutfire/kloutfire-website/01_kloutfire.png',        0, @now, @now),
  (@p_kloutfire_site, 'Posts',   '/images/portfolio/kloutfire/kloutfire-website/02_kloutfire_posts.png',  1, @now, @now),
  (@p_kloutfire_site, 'Footer',  '/images/portfolio/kloutfire/kloutfire-website/03_kloutfire_footer.png', 2, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- Kloutfire: Raffle Consulting
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_raffle, 'Raffle Consulting', '/images/portfolio/kloutfire/raffle-consulting/01_raffle_consulting.png', 0, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- SEO Strong: Washington Dental
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_washington_dental, 'Header',   '/images/portfolio/seostrong/washington-dental/01_washingtondental_header.png',  0, @now, @now),
  (@p_washington_dental, 'Home',     '/images/portfolio/seostrong/washington-dental/02_washingtondental_home.png',    1, @now, @now),
  (@p_washington_dental, 'Sidebar',  '/images/portfolio/seostrong/washington-dental/03_washingtondental_sidebar.png', 2, @now, @now),
  (@p_washington_dental, 'Footer',   '/images/portfolio/seostrong/washington-dental/04_washingtondental_footer.png',  3, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- SEO Strong: BioDental Veneers
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_biodental, 'Contact Form',  '/images/portfolio/seostrong/biodental-veneers/01_bd_veneers_form.png',   0, @now, @now),
  (@p_biodental, 'Technology',    '/images/portfolio/seostrong/biodental-veneers/02_bd_veneers_tech.png',   1, @now, @now),
  (@p_biodental, 'Veneer Types',  '/images/portfolio/seostrong/biodental-veneers/03_bd_veneers_types.png',  2, @now, @now),
  (@p_biodental, 'Footer',        '/images/portfolio/seostrong/biodental-veneers/04_bd_veneers_footer.png', 3, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- SEO Strong: Express Roofing
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_express_roofing, 'Express Roofing', '/images/portfolio/seostrong/express-roofing-inc/01-express-roofing.jpg', 0, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- SEO Strong: Extreme Developers
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_extreme_devs, 'Extreme Developers Inc.', '/images/portfolio/seostrong/extreme-developers-inc/01-extreme-developers-inc.jpg', 0, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- Freelance: Restyle Kitchen and Bath
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_restyle, 'Header',   '/images/portfolio/freelance/restyle-kitchen-bath/01_restylekitchenbath_header.png',  0, @now, @now),
  (@p_restyle, 'Gallery',  '/images/portfolio/freelance/restyle-kitchen-bath/02_restylekitchenbath_gallery.png', 1, @now, @now),
  (@p_restyle, 'Footer',   '/images/portfolio/freelance/restyle-kitchen-bath/03_restylekitchenbath_footer.png',  2, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- Freelance: Real Chords
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_real_chords, 'Real Chords',              '/images/portfolio/freelance/real-chords/01_realchords.jpg',             0, @now, @now),
  (@p_real_chords, 'Real Chords (Responsive)', '/images/portfolio/freelance/real-chords/02_realchords_responsive.jpg',  1, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- Freelance: Sands Investment Group
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_sands_ig, 'Home',              '/images/portfolio/freelance/sandsig/01_signnn_home.jpg',       0, @now, @now),
  (@p_sands_ig, 'Home (Responsive)', '/images/portfolio/freelance/sandsig/02_signnn_responsive.jpg', 1, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- Freelance: Packard Grill
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_packard_grill, 'Packard Grill', '/images/portfolio/freelance/packard-grill/01_packard_grill.jpg', 0, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- Freelance: Home Solution Properties
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_home_solution, 'Home Solution Properties', '/images/portfolio/freelance/home-solution-properties/01_home_solution_properties.jpg', 0, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- Freelance: My Choice Energy
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_my_choice_energy, 'My Choice Energy', '/images/portfolio/freelance/my-choice-energy/01_my_choice_energy.jpg', 0, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- Freelance: Pete Mamos
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_pete_mamos, 'Pete Mamos', '/images/portfolio/freelance/pete-mamos/01_petemamos.jpg', 0, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- Freelance: Equilibrio Nicaragua
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_equilibrio, 'Equilibrio Nicaragua', '/images/portfolio/freelance/equilibrio-nicaragua/01_equilibrio_nicaragua.png', 0, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- Freelance: Millennium Marketing Denver
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_millennium, 'Hero',          '/images/portfolio/freelance/millennium-marketing-solutions/01_mms_hero.png',         0, @now, @now),
  (@p_millennium, 'Lead Contact',  '/images/portfolio/freelance/millennium-marketing-solutions/02_mms_lead_contact.png', 1, @now, @now),
  (@p_millennium, 'Footer',        '/images/portfolio/freelance/millennium-marketing-solutions/03_mms_footer.png',       2, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- Yazamo: Abundance Campaign
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_abundance, 'Title Page',  '/images/portfolio/yazamo/abundance/01_abundance_title.png',     0, @now, @now),
  (@p_abundance, 'Book Cover',  '/images/portfolio/yazamo/abundance/02_abundance_book_cover.png', 1, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- Yazamo: Genius Network
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_genius_network, 'Home',   '/images/portfolio/yazamo/genius-network/01_genius_network.png',       0, @now, @now),
  (@p_genius_network, 'About',  '/images/portfolio/yazamo/genius-network/02_genius_network_about.png', 1, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- Yazamo: Joe Polish Press
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_joe_polish, 'Press Page',      '/images/portfolio/yazamo/joe-polish/01_joepolish_press.png',          0, @now, @now),
  (@p_joe_polish, 'Press Releases',  '/images/portfolio/yazamo/joe-polish/02_joepolish_press_releases.png', 1, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- Personal: ULPC Spritesheet Generator
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_ulpc, 'Recolors',              '/images/portfolio/personal/ulpc-character-generator/01-ulpc-generator-recolors.png',             0, @now, @now),
  (@p_ulpc, 'Recolors (Responsive)', '/images/portfolio/personal/ulpc-character-generator/02-ulpc-generator-recolors-responsive.png',  1, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- Personal: Lex Talionis Engine
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_lt, 'Combat Folders',         '/images/portfolio/personal/lt-maker/01-lt-combat-folders.png',          0, @now, @now),
  (@p_lt, 'Map Anim Palette',       '/images/portfolio/personal/lt-maker/02-lt-map-anim-palette-preview.png', 1, @now, @now),
  (@p_lt, 'Weapon Rank Up',         '/images/portfolio/personal/lt-maker/03-lt-weapon-rank-up.png',           2, @now, @now),
  (@p_lt, 'Custom Platform Types',  '/images/portfolio/personal/lt-maker/04-lt-custom-platform-types.png',    3, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- Personal: JR Programming (this portfolio site)
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_jrprogramming, 'Home — Hero',     '/images/portfolio/personal/jr-programming/01-home-hero.png',    0, @now, @now),
  (@p_jrprogramming, 'Home — Stats',    '/images/portfolio/personal/jr-programming/02-home-stats.png',   1, @now, @now),
  (@p_jrprogramming, 'Home — Projects', '/images/portfolio/personal/jr-programming/03-home-projects.png', 2, @now, @now),
  (@p_jrprogramming, 'About',           '/images/portfolio/personal/jr-programming/04-about.png',         3, @now, @now),
  (@p_jrprogramming, 'About — Stack',   '/images/portfolio/personal/jr-programming/05-about-stack.png',   4, @now, @now),
  (@p_jrprogramming, 'Contact',         '/images/portfolio/personal/jr-programming/06-contact.png',       5, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;

-- Personal: Jaidynreiman.net (Sprite Portfolio)
INSERT INTO `jr_projects_gallery` (`project_id`, `title`, `image`, `priority`, `created_at`, `updated_at`)
VALUES
  (@p_jaidynreiman, 'Home',        '/images/portfolio/personal/jr-productions/01-home.png',        0, @now, @now),
  (@p_jaidynreiman, 'LPC Hair',    '/images/portfolio/personal/jr-productions/02-lpc-hair.png',    1, @now, @now),
  (@p_jaidynreiman, 'FE:GBA',      '/images/portfolio/personal/jr-productions/03-fegba.png',       2, @now, @now),
  (@p_jaidynreiman, 'Commissions', '/images/portfolio/personal/jr-productions/04-commissions.png', 3, @now, @now)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `priority` = VALUES(`priority`), `updated_at` = @now;
