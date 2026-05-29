SET @now := NOW(3);

-- ─── 1. Add about_section column to jr_skills ────────────────────────────────
SET @_col := (SELECT COUNT(*) FROM information_schema.columns
              WHERE table_schema = DATABASE() AND table_name = 'jr_skills' AND column_name = 'about_section');
SET @_sql := IF(@_col = 0,
  'ALTER TABLE `jr_skills` ADD COLUMN `about_section` VARCHAR(20) NULL DEFAULT NULL',
  'SELECT 1');
PREPARE _s FROM @_sql; EXECUTE _s; DEALLOCATE PREPARE _s;

-- ─── 2. Add UNIQUE index on name for idempotent skill inserts ─────────────────
SET @_idx := (SELECT COUNT(*) FROM information_schema.statistics
              WHERE table_schema = DATABASE() AND table_name = 'jr_skills' AND index_name = 'jr_skills_name_key');
SET @_sql := IF(@_idx = 0,
  'ALTER TABLE `jr_skills` ADD UNIQUE INDEX `jr_skills_name_key` (`name`(100))',
  'SELECT 1');
PREPARE _s FROM @_sql; EXECUTE _s; DEALLOCATE PREPARE _s;

-- ─── 3. Insert all skills ─────────────────────────────────────────────────────
INSERT IGNORE INTO `jr_skills` (`name`, `desc`, `rating`, `about_section`, `created_at`, `updated_at`) VALUES
  -- Primary stack
  ('PHP',                                    '', 5, 'primary',   @now, @now),
  ('Laravel',                                '', 5, 'primary',   @now, @now),
  ('JavaScript',                             '', 5, 'primary',   @now, @now),
  ('MySQL',                                  '', 5, 'primary',   @now, @now),
  ('REST APIs',                              '', 5, 'primary',   @now, @now),
  ('Nuxt.js',                                '', 4, 'primary',   @now, @now),
  ('WordPress',                              '', 4, 'primary',   @now, @now),
  ('Next.js',                                '', 3, 'primary',   @now, @now),
  ('Tailwind CSS',                           '', 3, 'primary',   @now, @now),
  -- Also Worked With
  ('Python',                                 '', 2, 'secondary', @now, @now),
  ('Java (Android)',                         '', 2, 'secondary', @now, @now),
  ('Zend',                                   '', 3, 'secondary', @now, @now),
  ('Prisma',                                 '', 2, 'secondary', @now, @now),
  ('React',                                  '', 3, 'secondary', @now, @now),
  ('TypeScript',                             '', 3, 'secondary', @now, @now),
  ('Ruby on Rails',                          '', 1, 'secondary', @now, @now),
  -- Currently Learning
  ('Spring Boot',                            '', 1, 'learning',  @now, @now),
  ('JPA / Hibernate',                        '', 1, 'learning',  @now, @now),
  -- Other skills (not shown on About page)
  ('C++',                                    '', 2, NULL, @now, @now),
  ('CodeIgniter',                            '', 2, NULL, @now, @now),
  ('HTML5',                                  '', 4, NULL, @now, @now),
  ('CSS',                                    '', 4, NULL, @now, @now),
  ('JSON',                                   '', 4, NULL, @now, @now),
  ('Frontend Web Development',               '', 4, NULL, @now, @now),
  ('Backend Web Development',                '', 5, NULL, @now, @now),
  ('GitHub',                                 '', 3, NULL, @now, @now),
  ('Twig (Template Engine)',                 '', 3, NULL, @now, @now),
  ('Web Scraping',                           '', 3, NULL, @now, @now),
  ('Chrome Extension Development',           '', 4, NULL, @now, @now),
  ('Chrome Extension Management',            '', 3, NULL, @now, @now),
  ('Document Object Model (DOM)',            '', 4, NULL, @now, @now),
  ('XML',                                    '', 3, NULL, @now, @now),
  ('Vue.js',                                 '', 3, NULL, @now, @now),
  ('Vuetify',                                '', 2, NULL, @now, @now),
  ('Twilio Integration',                     '', 4, NULL, @now, @now),
  ('Twilio',                                 '', 4, NULL, @now, @now),
  ('Customer Relationship Management (CRM)', '', 4, NULL, @now, @now),
  ('Database Design',                        '', 4, NULL, @now, @now),
  ('Web Application Development',            '', 4, NULL, @now, @now),
  ('API Development',                        '', 4, NULL, @now, @now),
  ('Amazon Web Services (AWS)',              '', 3, NULL, @now, @now),
  ('Amazon SQS',                             '', 3, NULL, @now, @now),
  ('Amazon S3',                              '', 3, NULL, @now, @now),
  ('Email Marketing',                        '', 3, NULL, @now, @now),
  ('HTML Emails',                            '', 3, NULL, @now, @now),
  ('Marketing Campaign Management',          '', 3, NULL, @now, @now),
  ('Cron',                                   '', 3, NULL, @now, @now),
  ('Curl',                                   '', 3, NULL, @now, @now),
  ('Elasticsearch',                          '', 3, NULL, @now, @now),
  ('ZURB Foundation Framework',             '', 3, NULL, @now, @now),
  ('Responsive Web Design',                  '', 3, NULL, @now, @now),
  ('AJAX',                                   '', 3, NULL, @now, @now),
  ('jQuery',                                 '', 3, NULL, @now, @now),
  ('PSD to HTML',                            '', 3, NULL, @now, @now),
  ('WordPress Development',                  '', 4, NULL, @now, @now),
  ('PSD to Wordpress',                       '', 3, NULL, @now, @now),
  ('GitHub Copilot',                         '', 2, NULL, @now, @now),
  ('Claude Code',                            '', 2, NULL, @now, @now),
  ('AI Training',                            '', 2, NULL, @now, @now),
  ('PM2',                                    '', 2, NULL, @now, @now),
  ('Nginx',                                  '', 2, NULL, @now, @now),
  ('Java',                                   '', 3, NULL, @now, @now);

-- ─── 4. Fix about_section on pre-existing rows (if any) ──────────────────────
UPDATE `jr_skills` SET `about_section` = 'primary'
  WHERE `name` IN ('PHP','Laravel','JavaScript','MySQL','REST APIs','Nuxt.js','WordPress','Next.js','Tailwind CSS')
    AND (`about_section` IS NULL OR `about_section` != 'primary');
UPDATE `jr_skills` SET `about_section` = 'secondary'
  WHERE `name` IN ('Python','Java (Android)','Zend','Prisma','React','TypeScript','Ruby on Rails')
    AND (`about_section` IS NULL OR `about_section` != 'secondary');
UPDATE `jr_skills` SET `about_section` = 'learning'
  WHERE `name` IN ('Spring Boot','JPA / Hibernate')
    AND (`about_section` IS NULL OR `about_section` != 'learning');

-- ─── 5. Skill ID variables ────────────────────────────────────────────────────
SET @s_php        := (SELECT `id` FROM `jr_skills` WHERE `name` = 'PHP' LIMIT 1);
SET @s_laravel    := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Laravel' LIMIT 1);
SET @s_js         := (SELECT `id` FROM `jr_skills` WHERE `name` = 'JavaScript' LIMIT 1);
SET @s_mysql      := (SELECT `id` FROM `jr_skills` WHERE `name` = 'MySQL' LIMIT 1);
SET @s_rest       := (SELECT `id` FROM `jr_skills` WHERE `name` = 'REST APIs' LIMIT 1);
SET @s_nuxt       := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Nuxt.js' LIMIT 1);
SET @s_wp         := (SELECT `id` FROM `jr_skills` WHERE `name` = 'WordPress' LIMIT 1);
SET @s_nextjs     := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Next.js' LIMIT 1);
SET @s_tailwind   := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Tailwind CSS' LIMIT 1);
SET @s_python     := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Python' LIMIT 1);
SET @s_java_and   := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Java (Android)' LIMIT 1);
SET @s_zend       := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Zend' LIMIT 1);
SET @s_prisma     := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Prisma' LIMIT 1);
SET @s_react      := (SELECT `id` FROM `jr_skills` WHERE `name` = 'React' LIMIT 1);
SET @s_ts         := (SELECT `id` FROM `jr_skills` WHERE `name` = 'TypeScript' LIMIT 1);
SET @s_ruby       := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Ruby on Rails' LIMIT 1);
SET @s_spring     := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Spring Boot' LIMIT 1);
SET @s_jpa        := (SELECT `id` FROM `jr_skills` WHERE `name` = 'JPA / Hibernate' LIMIT 1);
SET @s_cpp        := (SELECT `id` FROM `jr_skills` WHERE `name` = 'C++' LIMIT 1);
SET @s_ci         := (SELECT `id` FROM `jr_skills` WHERE `name` = 'CodeIgniter' LIMIT 1);
SET @s_html5      := (SELECT `id` FROM `jr_skills` WHERE `name` = 'HTML5' LIMIT 1);
SET @s_css        := (SELECT `id` FROM `jr_skills` WHERE `name` = 'CSS' LIMIT 1);
SET @s_json       := (SELECT `id` FROM `jr_skills` WHERE `name` = 'JSON' LIMIT 1);
SET @s_frontend   := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Frontend Web Development' LIMIT 1);
SET @s_backend    := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Backend Web Development' LIMIT 1);
SET @s_github     := (SELECT `id` FROM `jr_skills` WHERE `name` = 'GitHub' LIMIT 1);
SET @s_twig       := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Twig (Template Engine)' LIMIT 1);
SET @s_scraping   := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Web Scraping' LIMIT 1);
SET @s_chrome_ext := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Chrome Extension Development' LIMIT 1);
SET @s_chrome_mgm := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Chrome Extension Management' LIMIT 1);
SET @s_dom        := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Document Object Model (DOM)' LIMIT 1);
SET @s_xml        := (SELECT `id` FROM `jr_skills` WHERE `name` = 'XML' LIMIT 1);
SET @s_vuejs      := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Vue.js' LIMIT 1);
SET @s_vuetify    := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Vuetify' LIMIT 1);
SET @s_twilio_int := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Twilio Integration' LIMIT 1);
SET @s_twilio     := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Twilio' LIMIT 1);
SET @s_crm        := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Customer Relationship Management (CRM)' LIMIT 1);
SET @s_db_design  := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Database Design' LIMIT 1);
SET @s_web_app    := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Web Application Development' LIMIT 1);
SET @s_api_dev    := (SELECT `id` FROM `jr_skills` WHERE `name` = 'API Development' LIMIT 1);
SET @s_aws        := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Amazon Web Services (AWS)' LIMIT 1);
SET @s_sqs        := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Amazon SQS' LIMIT 1);
SET @s_s3         := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Amazon S3' LIMIT 1);
SET @s_email_mktg := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Email Marketing' LIMIT 1);
SET @s_html_email := (SELECT `id` FROM `jr_skills` WHERE `name` = 'HTML Emails' LIMIT 1);
SET @s_campaign   := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Marketing Campaign Management' LIMIT 1);
SET @s_cron       := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Cron' LIMIT 1);
SET @s_curl       := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Curl' LIMIT 1);
SET @s_elastic    := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Elasticsearch' LIMIT 1);
SET @s_zurb       := (SELECT `id` FROM `jr_skills` WHERE `name` = 'ZURB Foundation Framework' LIMIT 1);
SET @s_responsive := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Responsive Web Design' LIMIT 1);
SET @s_ajax       := (SELECT `id` FROM `jr_skills` WHERE `name` = 'AJAX' LIMIT 1);
SET @s_jquery     := (SELECT `id` FROM `jr_skills` WHERE `name` = 'jQuery' LIMIT 1);
SET @s_psd_html   := (SELECT `id` FROM `jr_skills` WHERE `name` = 'PSD to HTML' LIMIT 1);
SET @s_wp_dev     := (SELECT `id` FROM `jr_skills` WHERE `name` = 'WordPress Development' LIMIT 1);
SET @s_psd_wp     := (SELECT `id` FROM `jr_skills` WHERE `name` = 'PSD to Wordpress' LIMIT 1);
SET @s_gh_copilot := (SELECT `id` FROM `jr_skills` WHERE `name` = 'GitHub Copilot' LIMIT 1);
SET @s_claude     := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Claude Code' LIMIT 1);
SET @s_ai_train   := (SELECT `id` FROM `jr_skills` WHERE `name` = 'AI Training' LIMIT 1);
SET @s_pm2        := (SELECT `id` FROM `jr_skills` WHERE `name` = 'PM2' LIMIT 1);
SET @s_nginx      := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Nginx' LIMIT 1);
SET @s_java       := (SELECT `id` FROM `jr_skills` WHERE `name` = 'Java' LIMIT 1);

-- ─── 6. Project ID variables ──────────────────────────────────────────────────
-- Personal / Open Source
SET @p_ulpc      := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'ulpc-spritesheet-generator' LIMIT 1);
SET @p_lt        := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'lex-talionis-engine' LIMIT 1);
SET @p_jrprog    := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'jrprogramming' LIMIT 1);
SET @p_jaidyn    := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'jaidynreiman-net' LIMIT 1);
SET @p_jrplays   := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'jrplays-net' LIMIT 1);
SET @p_eternity  := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'eternity-ready' LIMIT 1);
SET @p_data_ann  := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'data-annotation' LIMIT 1);
-- TC Chrome Extensions
SET @p_htw       := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'horse-trailer-world' LIMIT 1);
SET @p_cl        := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'craigslist-autoposter' LIMIT 1);
SET @p_fbmkt     := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'facebook-marketplace' LIMIT 1);
SET @p_truck     := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'truckpaper-autoposter' LIMIT 1);
-- TC CRM / Backend
SET @p_crm_sys   := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'crm-system' LIMIT 1);
SET @p_twcall    := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'twilio-call-tracking' LIMIT 1);
SET @p_twsms     := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'twilio-sms-system' LIMIT 1);
SET @p_gmail     := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'gmail-oauth-integration' LIMIT 1);
SET @p_emktg     := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'crm-email-text' LIMIT 1);
SET @p_crm_leg   := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'crm-legacy' LIMIT 1);
-- TC Inventory / Feeds
SET @p_lotvantage := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'lotvantage-facebook' LIMIT 1);
SET @p_tt        := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'trailertrader-2016' LIMIT 1);
SET @p_ksl       := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'ksl-feed' LIMIT 1);
SET @p_classif   := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'classifieds-websites' LIMIT 1);
SET @p_elastic   := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'elasticsearch' LIMIT 1);
SET @p_fv        := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'factory-vantage' LIMIT 1);
SET @p_overlays  := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'image-overlays' LIMIT 1);
-- TC Dealer Websites
SET @p_dealer    := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'dealer-websites' LIMIT 1);
SET @p_hitchman  := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'hitchman-inc' LIMIT 1);
SET @p_huffman   := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'huffman-trailers' LIMIT 1);
-- Ponticlaro clients
SET @p_sandsig   := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'sandsig' LIMIT 1);
SET @p_restyle   := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'restyle-kitchen-bath' LIMIT 1);
-- Yazamo campaigns
SET @p_abundance := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'abundance-campaign' LIMIT 1);
SET @p_genius    := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'genius-network' LIMIT 1);
SET @p_joep      := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'joe-polish-press' LIMIT 1);
-- Kloutfire
SET @p_kloutfire := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'kloutfire-website' LIMIT 1);
-- Appster
SET @p_realchord := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'real-chords' LIMIT 1);
-- SEO Strong / Freelance
SET @p_extreme   := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'extreme-developers' LIMIT 1);
SET @p_25k       := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = '25kgroup-magazine' LIMIT 1);
SET @p_biodental := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'biodental-veneers' LIMIT 1);
SET @p_center    := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'center-for-partially-sighted' LIMIT 1);
SET @p_mychoice  := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'my-choice-energy' LIMIT 1);
SET @p_mangat    := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'mangat-plastic-surgery' LIMIT 1);
SET @p_packard   := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'packard-grill' LIMIT 1);
SET @p_raffle    := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'raffle-consulting' LIMIT 1);
SET @p_washdent  := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'washington-dental' LIMIT 1);
SET @p_ftcollins := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'fort-collins-roofing' LIMIT 1);
SET @p_pete      := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'pete-mamos' LIMIT 1);
SET @p_equilib   := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'equilibrio-nicaragua' LIMIT 1);
SET @p_homesol   := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'home-solution-properties' LIMIT 1);
-- Freight Access
SET @p_freight   := (SELECT `id` FROM `jr_projects` WHERE `shortcode` = 'freight-access-crm' LIMIT 1);

-- ─── 7. Project-skill associations ────────────────────────────────────────────
-- INSERT IGNORE skips rows where project_id or skill_id is NULL or already exists.

-- [ulpc-spritesheet-generator] preview: JavaScript, HTML5, JSON | all: + Frontend Web Development, GitHub
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_ulpc, @s_js,       0, @now, @now),
  (@p_ulpc, @s_html5,    1, @now, @now),
  (@p_ulpc, @s_json,     2, @now, @now),
  (@p_ulpc, @s_frontend, 3, @now, @now),
  (@p_ulpc, @s_github,   4, @now, @now);

-- [lex-talionis-engine] preview: Python, JSON, GitHub | all: + Frontend Web Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_lt, @s_python,   0, @now, @now),
  (@p_lt, @s_json,     1, @now, @now),
  (@p_lt, @s_github,   2, @now, @now),
  (@p_lt, @s_frontend, 3, @now, @now);

-- [jrprogramming] preview: Next.js, Tailwind CSS, Prisma | all: + React, TypeScript, GitHub
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_jrprog, @s_nextjs,  0, @now, @now),
  (@p_jrprog, @s_tailwind,1, @now, @now),
  (@p_jrprog, @s_prisma,  2, @now, @now),
  (@p_jrprog, @s_react,   3, @now, @now),
  (@p_jrprog, @s_ts,      4, @now, @now),
  (@p_jrprog, @s_github,  5, @now, @now);

-- [jaidynreiman-net] preview: Next.js, TypeScript, JSON | all: + Frontend Web Development, GitHub
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_jaidyn, @s_nextjs,  0, @now, @now),
  (@p_jaidyn, @s_ts,      1, @now, @now),
  (@p_jaidyn, @s_json,    2, @now, @now),
  (@p_jaidyn, @s_frontend,3, @now, @now),
  (@p_jaidyn, @s_github,  4, @now, @now);

-- [jrplays-net] preview: WordPress, Twig, PHP | all: + CSS, MySQL
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_jrplays, @s_wp,    0, @now, @now),
  (@p_jrplays, @s_twig,  1, @now, @now),
  (@p_jrplays, @s_php,   2, @now, @now),
  (@p_jrplays, @s_css,   3, @now, @now),
  (@p_jrplays, @s_mysql, 4, @now, @now);

-- [eternity-ready] preview: WordPress, HTML5, CSS | all: + Frontend Web Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_eternity, @s_wp,      0, @now, @now),
  (@p_eternity, @s_html5,   1, @now, @now),
  (@p_eternity, @s_css,     2, @now, @now),
  (@p_eternity, @s_frontend,3, @now, @now);

-- [data-annotation] preview: GitHub Copilot, Claude Code, Python, TypeScript | all: + Java, Spring Boot, JavaScript, PHP, AI Training
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_data_ann, @s_gh_copilot, 0, @now, @now),
  (@p_data_ann, @s_claude,     1, @now, @now),
  (@p_data_ann, @s_python,     2, @now, @now),
  (@p_data_ann, @s_ts,         3, @now, @now),
  (@p_data_ann, @s_java,       4, @now, @now),
  (@p_data_ann, @s_spring,     5, @now, @now),
  (@p_data_ann, @s_js,         6, @now, @now),
  (@p_data_ann, @s_php,        7, @now, @now),
  (@p_data_ann, @s_ai_train,   8, @now, @now);

-- [horse-trailer-world] preview: Chrome Extension Development, JavaScript, Web Scraping | all: + Chrome Extension Management, DOM
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_htw, @s_chrome_ext, 0, @now, @now),
  (@p_htw, @s_js,         1, @now, @now),
  (@p_htw, @s_scraping,   2, @now, @now),
  (@p_htw, @s_chrome_mgm, 3, @now, @now),
  (@p_htw, @s_dom,        4, @now, @now);

-- [craigslist-autoposter] preview: Chrome Extension Development, JavaScript, PHP | all: + Chrome Extension Management, Laravel, REST APIs, Web Scraping, DOM, Backend Web Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_cl, @s_chrome_ext, 0, @now, @now),
  (@p_cl, @s_js,         1, @now, @now),
  (@p_cl, @s_php,        2, @now, @now),
  (@p_cl, @s_chrome_mgm, 3, @now, @now),
  (@p_cl, @s_laravel,    4, @now, @now),
  (@p_cl, @s_rest,       5, @now, @now),
  (@p_cl, @s_scraping,   6, @now, @now),
  (@p_cl, @s_dom,        7, @now, @now),
  (@p_cl, @s_backend,    8, @now, @now);

-- [facebook-marketplace] preview: Chrome Extension Development, JavaScript, Web Scraping | all: + Chrome Extension Management, REST APIs, DOM
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_fbmkt, @s_chrome_ext, 0, @now, @now),
  (@p_fbmkt, @s_js,         1, @now, @now),
  (@p_fbmkt, @s_scraping,   2, @now, @now),
  (@p_fbmkt, @s_chrome_mgm, 3, @now, @now),
  (@p_fbmkt, @s_rest,       4, @now, @now),
  (@p_fbmkt, @s_dom,        5, @now, @now);

-- [truckpaper-autoposter] preview: Web Scraping, JavaScript, Chrome Extension Development | all: + DOM, XML
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_truck, @s_scraping,   0, @now, @now),
  (@p_truck, @s_js,         1, @now, @now),
  (@p_truck, @s_chrome_ext, 2, @now, @now),
  (@p_truck, @s_dom,        3, @now, @now),
  (@p_truck, @s_xml,        4, @now, @now);

-- [crm-system] preview: Laravel, Vue.js, MySQL | all: + Vuetify, Nuxt.js, REST APIs, Twilio, CRM, Backend Web Development, Database Design
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_crm_sys, @s_laravel,   0, @now, @now),
  (@p_crm_sys, @s_vuejs,     1, @now, @now),
  (@p_crm_sys, @s_mysql,     2, @now, @now),
  (@p_crm_sys, @s_vuetify,   3, @now, @now),
  (@p_crm_sys, @s_nuxt,      4, @now, @now),
  (@p_crm_sys, @s_rest,      5, @now, @now),
  (@p_crm_sys, @s_twilio,    6, @now, @now),
  (@p_crm_sys, @s_crm,       7, @now, @now),
  (@p_crm_sys, @s_backend,   8, @now, @now),
  (@p_crm_sys, @s_db_design, 9, @now, @now);

-- [twilio-call-tracking] preview: Twilio Integration, Laravel, REST APIs | all: + Twilio, PHP, MySQL, Backend Web Development, Web Application Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_twcall, @s_twilio_int, 0, @now, @now),
  (@p_twcall, @s_laravel,    1, @now, @now),
  (@p_twcall, @s_rest,       2, @now, @now),
  (@p_twcall, @s_twilio,     3, @now, @now),
  (@p_twcall, @s_php,        4, @now, @now),
  (@p_twcall, @s_mysql,      5, @now, @now),
  (@p_twcall, @s_backend,    6, @now, @now),
  (@p_twcall, @s_web_app,    7, @now, @now);

-- [twilio-sms-system] preview: Twilio Integration, Laravel, PHP | all: + Twilio, MySQL, REST APIs, Backend Web Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_twsms, @s_twilio_int, 0, @now, @now),
  (@p_twsms, @s_laravel,    1, @now, @now),
  (@p_twsms, @s_php,        2, @now, @now),
  (@p_twsms, @s_twilio,     3, @now, @now),
  (@p_twsms, @s_mysql,      4, @now, @now),
  (@p_twsms, @s_rest,       5, @now, @now),
  (@p_twsms, @s_backend,    6, @now, @now);

-- [gmail-oauth-integration] preview: REST APIs, Laravel, PHP | all: + MySQL, Backend Web Development, API Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_gmail, @s_rest,    0, @now, @now),
  (@p_gmail, @s_laravel, 1, @now, @now),
  (@p_gmail, @s_php,     2, @now, @now),
  (@p_gmail, @s_mysql,   3, @now, @now),
  (@p_gmail, @s_backend, 4, @now, @now),
  (@p_gmail, @s_api_dev, 5, @now, @now);

-- [crm-email-text] preview: Amazon Web Services, Amazon SQS, Email Marketing | all: + Amazon S3, HTML Emails, Marketing Campaign Management, PHP, Laravel, MySQL, REST APIs, Backend Web Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_emktg, @s_aws,        0, @now, @now),
  (@p_emktg, @s_sqs,        1, @now, @now),
  (@p_emktg, @s_email_mktg, 2, @now, @now),
  (@p_emktg, @s_s3,         3, @now, @now),
  (@p_emktg, @s_html_email, 4, @now, @now),
  (@p_emktg, @s_campaign,   5, @now, @now),
  (@p_emktg, @s_php,        6, @now, @now),
  (@p_emktg, @s_laravel,    7, @now, @now),
  (@p_emktg, @s_mysql,      8, @now, @now),
  (@p_emktg, @s_rest,       9, @now, @now),
  (@p_emktg, @s_backend,   10, @now, @now);

-- [crm-legacy] preview: Zend, PHP, MySQL | all: + CRM, REST APIs, Backend Web Development, Web Application Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_crm_leg, @s_zend,    0, @now, @now),
  (@p_crm_leg, @s_php,     1, @now, @now),
  (@p_crm_leg, @s_mysql,   2, @now, @now),
  (@p_crm_leg, @s_crm,     3, @now, @now),
  (@p_crm_leg, @s_rest,    4, @now, @now),
  (@p_crm_leg, @s_backend, 5, @now, @now),
  (@p_crm_leg, @s_web_app, 6, @now, @now);

-- [lotvantage-facebook] preview: PHP, REST APIs, MySQL | all: + XML, Backend Web Development, API Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_lotvantage, @s_php,     0, @now, @now),
  (@p_lotvantage, @s_rest,    1, @now, @now),
  (@p_lotvantage, @s_mysql,   2, @now, @now),
  (@p_lotvantage, @s_xml,     3, @now, @now),
  (@p_lotvantage, @s_backend, 4, @now, @now),
  (@p_lotvantage, @s_api_dev, 5, @now, @now);

-- [trailertrader-2016] preview: PHP, MySQL, Frontend Web Development | all: + HTML5, CSS, Database Design
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_tt, @s_php,       0, @now, @now),
  (@p_tt, @s_mysql,     1, @now, @now),
  (@p_tt, @s_frontend,  2, @now, @now),
  (@p_tt, @s_html5,     3, @now, @now),
  (@p_tt, @s_css,       4, @now, @now),
  (@p_tt, @s_db_design, 5, @now, @now);

-- [ksl-feed] preview: PHP, Web Scraping, Curl | all: + MySQL, XML, Backend Web Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_ksl, @s_php,     0, @now, @now),
  (@p_ksl, @s_scraping,1, @now, @now),
  (@p_ksl, @s_curl,    2, @now, @now),
  (@p_ksl, @s_mysql,   3, @now, @now),
  (@p_ksl, @s_xml,     4, @now, @now),
  (@p_ksl, @s_backend, 5, @now, @now);

-- [classifieds-websites] preview: PHP, MySQL, Frontend Web Development | all: + HTML5, CSS
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_classif, @s_php,     0, @now, @now),
  (@p_classif, @s_mysql,   1, @now, @now),
  (@p_classif, @s_frontend,2, @now, @now),
  (@p_classif, @s_html5,   3, @now, @now),
  (@p_classif, @s_css,     4, @now, @now);

-- [elasticsearch] preview: Elasticsearch, PHP, MySQL | all: + REST APIs, Backend Web Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_elastic, @s_elastic, 0, @now, @now),
  (@p_elastic, @s_php,     1, @now, @now),
  (@p_elastic, @s_mysql,   2, @now, @now),
  (@p_elastic, @s_rest,    3, @now, @now),
  (@p_elastic, @s_backend, 4, @now, @now);

-- [factory-vantage] preview: PHP, MySQL, REST APIs | all: + Backend Web Development, API Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_fv, @s_php,     0, @now, @now),
  (@p_fv, @s_mysql,   1, @now, @now),
  (@p_fv, @s_rest,    2, @now, @now),
  (@p_fv, @s_backend, 3, @now, @now),
  (@p_fv, @s_api_dev, 4, @now, @now);

-- [image-overlays] preview: PHP, MySQL, Backend Web Development | all: + HTML5, CSS
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_overlays, @s_php,     0, @now, @now),
  (@p_overlays, @s_mysql,   1, @now, @now),
  (@p_overlays, @s_backend, 2, @now, @now),
  (@p_overlays, @s_html5,   3, @now, @now),
  (@p_overlays, @s_css,     4, @now, @now);

-- [dealer-websites] preview: ZURB Foundation Framework, Twig, PHP | all: + HTML5, CSS, Responsive Web Design, Frontend Web Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_dealer, @s_zurb,      0, @now, @now),
  (@p_dealer, @s_twig,      1, @now, @now),
  (@p_dealer, @s_php,       2, @now, @now),
  (@p_dealer, @s_html5,     3, @now, @now),
  (@p_dealer, @s_css,       4, @now, @now),
  (@p_dealer, @s_responsive,5, @now, @now),
  (@p_dealer, @s_frontend,  6, @now, @now);

-- [hitchman-inc] preview: ZURB Foundation Framework, PHP, AJAX | all: + REST APIs, HTML5, CSS, Frontend Web Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_hitchman, @s_zurb,    0, @now, @now),
  (@p_hitchman, @s_php,     1, @now, @now),
  (@p_hitchman, @s_ajax,    2, @now, @now),
  (@p_hitchman, @s_rest,    3, @now, @now),
  (@p_hitchman, @s_html5,   4, @now, @now),
  (@p_hitchman, @s_css,     5, @now, @now),
  (@p_hitchman, @s_frontend,6, @now, @now);

-- [huffman-trailers] preview: PSD to HTML, HTML5, PHP | all: + CSS, JavaScript, jQuery, Frontend Web Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_huffman, @s_psd_html, 0, @now, @now),
  (@p_huffman, @s_html5,    1, @now, @now),
  (@p_huffman, @s_php,      2, @now, @now),
  (@p_huffman, @s_css,      3, @now, @now),
  (@p_huffman, @s_js,       4, @now, @now),
  (@p_huffman, @s_jquery,   5, @now, @now),
  (@p_huffman, @s_frontend, 6, @now, @now);

-- Ponticlaro clients (sandsig, restyle-kitchen-bath)
-- preview: WordPress, PHP, HTML5 | all: + WordPress Development, CSS, MySQL, Frontend Web Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_sandsig, @s_wp,      0, @now, @now),
  (@p_sandsig, @s_php,     1, @now, @now),
  (@p_sandsig, @s_html5,   2, @now, @now),
  (@p_sandsig, @s_wp_dev,  3, @now, @now),
  (@p_sandsig, @s_css,     4, @now, @now),
  (@p_sandsig, @s_mysql,   5, @now, @now),
  (@p_sandsig, @s_frontend,6, @now, @now);

INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_restyle, @s_wp,      0, @now, @now),
  (@p_restyle, @s_php,     1, @now, @now),
  (@p_restyle, @s_html5,   2, @now, @now),
  (@p_restyle, @s_wp_dev,  3, @now, @now),
  (@p_restyle, @s_css,     4, @now, @now),
  (@p_restyle, @s_mysql,   5, @now, @now),
  (@p_restyle, @s_frontend,6, @now, @now);

-- Yazamo campaigns (abundance-campaign, genius-network, joe-polish-press)
-- preview: WordPress, PHP, HTML5 | all: + WordPress Development, CSS, Frontend Web Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_abundance, @s_wp,      0, @now, @now),
  (@p_abundance, @s_php,     1, @now, @now),
  (@p_abundance, @s_html5,   2, @now, @now),
  (@p_abundance, @s_wp_dev,  3, @now, @now),
  (@p_abundance, @s_css,     4, @now, @now),
  (@p_abundance, @s_frontend,5, @now, @now);

INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_genius, @s_wp,      0, @now, @now),
  (@p_genius, @s_php,     1, @now, @now),
  (@p_genius, @s_html5,   2, @now, @now),
  (@p_genius, @s_wp_dev,  3, @now, @now),
  (@p_genius, @s_css,     4, @now, @now),
  (@p_genius, @s_mysql,   5, @now, @now),
  (@p_genius, @s_frontend,6, @now, @now);

INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_joep, @s_wp,      0, @now, @now),
  (@p_joep, @s_php,     1, @now, @now),
  (@p_joep, @s_html5,   2, @now, @now),
  (@p_joep, @s_wp_dev,  3, @now, @now),
  (@p_joep, @s_css,     4, @now, @now),
  (@p_joep, @s_frontend,5, @now, @now);

-- [kloutfire-website] preview: WordPress, PHP, HTML5 | all: + WordPress Development, CSS, MySQL, Frontend Web Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_kloutfire, @s_wp,      0, @now, @now),
  (@p_kloutfire, @s_php,     1, @now, @now),
  (@p_kloutfire, @s_html5,   2, @now, @now),
  (@p_kloutfire, @s_wp_dev,  3, @now, @now),
  (@p_kloutfire, @s_css,     4, @now, @now),
  (@p_kloutfire, @s_mysql,   5, @now, @now),
  (@p_kloutfire, @s_frontend,6, @now, @now);

-- Appster (real-chords) preview: WordPress, PHP, HTML5 | all: + WordPress Development, CSS, MySQL, Frontend Web Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_realchord, @s_wp,      0, @now, @now),
  (@p_realchord, @s_php,     1, @now, @now),
  (@p_realchord, @s_html5,   2, @now, @now),
  (@p_realchord, @s_wp_dev,  3, @now, @now),
  (@p_realchord, @s_css,     4, @now, @now),
  (@p_realchord, @s_mysql,   5, @now, @now),
  (@p_realchord, @s_frontend,6, @now, @now);

-- [extreme-developers] preview: WordPress, PHP, HTML5 | all: + CSS, Frontend Web Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_extreme, @s_wp,      0, @now, @now),
  (@p_extreme, @s_php,     1, @now, @now),
  (@p_extreme, @s_html5,   2, @now, @now),
  (@p_extreme, @s_css,     3, @now, @now),
  (@p_extreme, @s_frontend,4, @now, @now);

-- [25kgroup-magazine] preview: PSD to HTML, PHP, HTML5 | all: + CSS, JavaScript, jQuery, Frontend Web Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_25k, @s_psd_html, 0, @now, @now),
  (@p_25k, @s_php,      1, @now, @now),
  (@p_25k, @s_html5,    2, @now, @now),
  (@p_25k, @s_css,      3, @now, @now),
  (@p_25k, @s_js,       4, @now, @now),
  (@p_25k, @s_jquery,   5, @now, @now),
  (@p_25k, @s_frontend, 6, @now, @now);

-- [biodental-veneers] preview: PSD to HTML, PHP, HTML5 | all: + CSS, JavaScript, jQuery, Frontend Web Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_biodental, @s_psd_html, 0, @now, @now),
  (@p_biodental, @s_php,      1, @now, @now),
  (@p_biodental, @s_html5,    2, @now, @now),
  (@p_biodental, @s_css,      3, @now, @now),
  (@p_biodental, @s_js,       4, @now, @now),
  (@p_biodental, @s_jquery,   5, @now, @now),
  (@p_biodental, @s_frontend, 6, @now, @now);

-- [center-for-partially-sighted] preview: WordPress, PHP, HTML5 | all: + WordPress Development, CSS, MySQL, Frontend Web Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_center, @s_wp,      0, @now, @now),
  (@p_center, @s_php,     1, @now, @now),
  (@p_center, @s_html5,   2, @now, @now),
  (@p_center, @s_wp_dev,  3, @now, @now),
  (@p_center, @s_css,     4, @now, @now),
  (@p_center, @s_mysql,   5, @now, @now),
  (@p_center, @s_frontend,6, @now, @now);

-- [my-choice-energy] preview: PHP, HTML5, AJAX | all: + CSS, MySQL, Backend Web Development, Curl, Frontend Web Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_mychoice, @s_php,     0, @now, @now),
  (@p_mychoice, @s_html5,   1, @now, @now),
  (@p_mychoice, @s_ajax,    2, @now, @now),
  (@p_mychoice, @s_css,     3, @now, @now),
  (@p_mychoice, @s_mysql,   4, @now, @now),
  (@p_mychoice, @s_backend, 5, @now, @now),
  (@p_mychoice, @s_curl,    6, @now, @now),
  (@p_mychoice, @s_frontend,7, @now, @now);

-- [mangat-plastic-surgery] preview: WordPress, PHP, PSD to Wordpress | all: + WordPress Development, HTML5, CSS, MySQL, Frontend Web Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_mangat, @s_wp,      0, @now, @now),
  (@p_mangat, @s_php,     1, @now, @now),
  (@p_mangat, @s_psd_wp,  2, @now, @now),
  (@p_mangat, @s_wp_dev,  3, @now, @now),
  (@p_mangat, @s_html5,   4, @now, @now),
  (@p_mangat, @s_css,     5, @now, @now),
  (@p_mangat, @s_mysql,   6, @now, @now),
  (@p_mangat, @s_frontend,7, @now, @now);

-- [packard-grill] preview: WordPress, PHP, HTML5 | all: + WordPress Development, CSS, MySQL, Frontend Web Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_packard, @s_wp,      0, @now, @now),
  (@p_packard, @s_php,     1, @now, @now),
  (@p_packard, @s_html5,   2, @now, @now),
  (@p_packard, @s_wp_dev,  3, @now, @now),
  (@p_packard, @s_css,     4, @now, @now),
  (@p_packard, @s_mysql,   5, @now, @now),
  (@p_packard, @s_frontend,6, @now, @now);

-- [raffle-consulting] preview: WordPress, PHP, HTML5 | all: + WordPress Development, CSS, MySQL, Frontend Web Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_raffle, @s_wp,      0, @now, @now),
  (@p_raffle, @s_php,     1, @now, @now),
  (@p_raffle, @s_html5,   2, @now, @now),
  (@p_raffle, @s_wp_dev,  3, @now, @now),
  (@p_raffle, @s_css,     4, @now, @now),
  (@p_raffle, @s_mysql,   5, @now, @now),
  (@p_raffle, @s_frontend,6, @now, @now);

-- [washington-dental] preview: PSD to Wordpress, WordPress, PHP | all: + WordPress Development, HTML5, CSS, MySQL, Frontend Web Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_washdent, @s_psd_wp,  0, @now, @now),
  (@p_washdent, @s_wp,      1, @now, @now),
  (@p_washdent, @s_php,     2, @now, @now),
  (@p_washdent, @s_wp_dev,  3, @now, @now),
  (@p_washdent, @s_html5,   4, @now, @now),
  (@p_washdent, @s_css,     5, @now, @now),
  (@p_washdent, @s_mysql,   6, @now, @now),
  (@p_washdent, @s_frontend,7, @now, @now);

-- [fort-collins-roofing] preview: WordPress, PHP, HTML5 | all: + WordPress Development, CSS, MySQL, Frontend Web Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_ftcollins, @s_wp,      0, @now, @now),
  (@p_ftcollins, @s_php,     1, @now, @now),
  (@p_ftcollins, @s_html5,   2, @now, @now),
  (@p_ftcollins, @s_wp_dev,  3, @now, @now),
  (@p_ftcollins, @s_css,     4, @now, @now),
  (@p_ftcollins, @s_mysql,   5, @now, @now),
  (@p_ftcollins, @s_frontend,6, @now, @now);

-- [pete-mamos] preview: WordPress, PHP, HTML5 | all: + WordPress Development, CSS, MySQL, Frontend Web Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_pete, @s_wp,      0, @now, @now),
  (@p_pete, @s_php,     1, @now, @now),
  (@p_pete, @s_html5,   2, @now, @now),
  (@p_pete, @s_wp_dev,  3, @now, @now),
  (@p_pete, @s_css,     4, @now, @now),
  (@p_pete, @s_mysql,   5, @now, @now),
  (@p_pete, @s_frontend,6, @now, @now);

-- [equilibrio-nicaragua] preview: WordPress, PHP, HTML5 | all: + WordPress Development, CSS, MySQL, Frontend Web Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_equilib, @s_wp,      0, @now, @now),
  (@p_equilib, @s_php,     1, @now, @now),
  (@p_equilib, @s_html5,   2, @now, @now),
  (@p_equilib, @s_wp_dev,  3, @now, @now),
  (@p_equilib, @s_css,     4, @now, @now),
  (@p_equilib, @s_mysql,   5, @now, @now),
  (@p_equilib, @s_frontend,6, @now, @now);

-- [home-solution-properties] preview: PHP, Curl, HTML5 | all: + CSS, MySQL, Backend Web Development, Frontend Web Development
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_homesol, @s_php,     0, @now, @now),
  (@p_homesol, @s_curl,    1, @now, @now),
  (@p_homesol, @s_html5,   2, @now, @now),
  (@p_homesol, @s_css,     3, @now, @now),
  (@p_homesol, @s_mysql,   4, @now, @now),
  (@p_homesol, @s_backend, 5, @now, @now),
  (@p_homesol, @s_frontend,6, @now, @now);

-- [freight-access-crm] preview: PHP, MySQL, Web Application Development | all: + Backend Web Development, Database Design, CRM
INSERT IGNORE INTO `jr_projects_skills` (`project_id`, `skill_id`, `priority`, `created_at`, `updated_at`) VALUES
  (@p_freight, @s_php,       0, @now, @now),
  (@p_freight, @s_mysql,     1, @now, @now),
  (@p_freight, @s_web_app,   2, @now, @now),
  (@p_freight, @s_backend,   3, @now, @now),
  (@p_freight, @s_db_design, 4, @now, @now),
  (@p_freight, @s_crm,       5, @now, @now);
