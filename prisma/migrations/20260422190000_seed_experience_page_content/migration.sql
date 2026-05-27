-- Seed experience page job structure and job/project mappings.

SET @now := NOW(3);

INSERT INTO `jr_companies` (`name`, `shortcode`, `website`, `created_at`, `updated_at`)
VALUES
  ('TrailerCentral', 'trailercentral', NULL, @now, @now),
  ('oDesk', 'odesk', NULL, @now, @now),
  ('Ponticlaro', 'ponticlaro', NULL, @now, @now),
  ('Yazamo', 'yazamo', NULL, @now, @now),
  ('Kloutfire', 'kloutfire', NULL, @now, @now),
  ('Freight Access', 'freight-access', NULL, @now, @now),
  ('SEO Strong', 'seo-strong', NULL, @now, @now)
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `website` = VALUES(`website`),
  `updated_at` = @now;

SET @trailercentral_company_id := (
  SELECT `id`
  FROM `jr_companies`
  WHERE `shortcode` = 'trailercentral'
  LIMIT 1
);

SET @odesk_company_id := (
  SELECT `id`
  FROM `jr_companies`
  WHERE `shortcode` = 'odesk'
  LIMIT 1
);

SET @ponticlaro_company_id := (
  SELECT `id`
  FROM `jr_companies`
  WHERE `shortcode` = 'ponticlaro'
  LIMIT 1
);

SET @yazamo_company_id := (
  SELECT `id`
  FROM `jr_companies`
  WHERE `shortcode` = 'yazamo'
  LIMIT 1
);

SET @kloutfire_company_id := (
  SELECT `id`
  FROM `jr_companies`
  WHERE `shortcode` = 'kloutfire'
  LIMIT 1
);

SET @freight_access_company_id := (
  SELECT `id`
  FROM `jr_companies`
  WHERE `shortcode` = 'freight-access'
  LIMIT 1
);

SET @seo_strong_company_id := (
  SELECT `id`
  FROM `jr_companies`
  WHERE `shortcode` = 'seo-strong'
  LIMIT 1
);

INSERT INTO `jr_jobs` (`shortcode`, `company_id`, `is_primary_tier`, `summary`, `start_date`, `end_date`, `priority`, `created_at`, `updated_at`)
VALUES
  (
    'trailercentral',
    @trailercentral_company_id,
    1,
    'Owned and rebuilt core CRM and automation systems, restoring critical workflows and delivering a Twilio-based call tracking platform that improved lead routing and dealer response reliability.',
    '2016-03-01 00:00:00.000',
    NULL,
    0,
    @now,
    @now
  ),
  (
    'ponticlaro',
    @ponticlaro_company_id,
    0,
    'Delivered client-facing web development work and platform enhancements during earlier contract years.',
    '2013-12-01 00:00:00.000',
    '2015-09-01 00:00:00.000',
    10,
    @now,
    @now
  ),
  (
    'yazamo',
    @yazamo_company_id,
    0,
    'Built and iterated campaign landing pages and marketing-oriented web implementations.',
    '2013-01-01 00:00:00.000',
    '2013-08-01 00:00:00.000',
    20,
    @now,
    @now
  ),
  (
    'kloutfire',
    @kloutfire_company_id,
    0,
    'Contributed web development and maintenance across multiple company client websites.',
    '2012-12-01 00:00:00.000',
    '2013-09-01 00:00:00.000',
    30,
    @now,
    @now
  ),
  (
    'freight-access',
    @freight_access_company_id,
    0,
    'Built and supported early custom web application systems, including core workflow tooling.',
    '2010-08-01 00:00:00.000',
    '2012-10-01 00:00:00.000',
    40,
    @now,
    @now
  ),
  (
    'seo-strong',
    @seo_strong_company_id,
    0,
    'Produced web development deliverables for SEO-focused client engagements.',
    '2012-10-01 00:00:00.000',
    '2013-08-01 00:00:00.000',
    50,
    @now,
    @now
  ),
  (
    'odesk',
    @odesk_company_id,
    0,
    'Umbrella record for early freelance and contract work not mapped to named company entries.',
    '2011-04-01 00:00:00.000',
    '2016-03-01 00:00:00.000',
    60,
    @now,
    @now
  )
ON DUPLICATE KEY UPDATE
  `company_id` = VALUES(`company_id`),
  `is_primary_tier` = VALUES(`is_primary_tier`),
  `summary` = VALUES(`summary`),
  `start_date` = VALUES(`start_date`),
  `end_date` = VALUES(`end_date`),
  `priority` = VALUES(`priority`),
  `updated_at` = @now;

SET @trailercentral_job_id := (
  SELECT `id`
  FROM `jr_jobs`
  WHERE `shortcode` = 'trailercentral'
  LIMIT 1
);

SET @ponticlaro_job_id := (
  SELECT `id`
  FROM `jr_jobs`
  WHERE `shortcode` = 'ponticlaro'
  LIMIT 1
);

SET @yazamo_job_id := (
  SELECT `id`
  FROM `jr_jobs`
  WHERE `shortcode` = 'yazamo'
  LIMIT 1
);

SET @kloutfire_job_id := (
  SELECT `id`
  FROM `jr_jobs`
  WHERE `shortcode` = 'kloutfire'
  LIMIT 1
);

SET @freight_access_job_id := (
  SELECT `id`
  FROM `jr_jobs`
  WHERE `shortcode` = 'freight-access'
  LIMIT 1
);

SET @seo_strong_job_id := (
  SELECT `id`
  FROM `jr_jobs`
  WHERE `shortcode` = 'seo-strong'
  LIMIT 1
);

SET @odesk_job_id := (
  SELECT `id`
  FROM `jr_jobs`
  WHERE `shortcode` = 'odesk'
  LIMIT 1
);

INSERT INTO `jr_job_roles` (`job_id`, `title`, `short_summary`, `start_date`, `end_date`, `priority`, `is_current`, `created_at`, `updated_at`)
SELECT @trailercentral_job_id, 'Systems Engineer III', 'Restored critical lead communication and dealer notification reliability.', '2024-03-01 00:00:00.000', NULL, 10, 1, @now, @now
WHERE @trailercentral_job_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM `jr_job_roles`
    WHERE `job_id` = @trailercentral_job_id
      AND `title` = 'Systems Engineer III'
  );

INSERT INTO `jr_job_roles` (`job_id`, `title`, `short_summary`, `start_date`, `end_date`, `priority`, `is_current`, `created_at`, `updated_at`)
SELECT @trailercentral_job_id, 'Lead Developer', 'Reduced manual workload through automation and system integrations.', '2022-09-01 00:00:00.000', '2024-03-01 00:00:00.000', 20, 0, @now, @now
WHERE @trailercentral_job_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM `jr_job_roles`
    WHERE `job_id` = @trailercentral_job_id
      AND `title` = 'Lead Developer'
  );

INSERT INTO `jr_job_roles` (`job_id`, `title`, `short_summary`, `start_date`, `end_date`, `priority`, `is_current`, `created_at`, `updated_at`)
SELECT @trailercentral_job_id, 'Web Programmer', 'Improved lead response speed and campaign execution consistency across the CRM.', '2016-03-01 00:00:00.000', '2022-09-01 00:00:00.000', 30, 0, @now, @now
WHERE @trailercentral_job_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM `jr_job_roles`
    WHERE `job_id` = @trailercentral_job_id
      AND `title` = 'Web Programmer'
  );

INSERT INTO `jr_job_roles` (`job_id`, `title`, `short_summary`, `start_date`, `end_date`, `priority`, `is_current`, `created_at`, `updated_at`)
SELECT @ponticlaro_job_id, 'Web Developer', 'Built and maintained client websites and enhancements.', '2013-12-01 00:00:00.000', '2015-09-01 00:00:00.000', 10, 1, @now, @now
WHERE @ponticlaro_job_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM `jr_job_roles`
    WHERE `job_id` = @ponticlaro_job_id
      AND `title` = 'Web Developer'
  );

INSERT INTO `jr_job_roles` (`job_id`, `title`, `short_summary`, `start_date`, `end_date`, `priority`, `is_current`, `created_at`, `updated_at`)
SELECT @yazamo_job_id, 'Web Developer', 'Implemented campaign pages and marketing-focused builds.', '2013-01-01 00:00:00.000', '2013-08-01 00:00:00.000', 10, 1, @now, @now
WHERE @yazamo_job_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM `jr_job_roles`
    WHERE `job_id` = @yazamo_job_id
      AND `title` = 'Web Developer'
  );

INSERT INTO `jr_job_roles` (`job_id`, `title`, `short_summary`, `start_date`, `end_date`, `priority`, `is_current`, `created_at`, `updated_at`)
SELECT @kloutfire_job_id, 'Web Developer', 'Delivered updates and support across client web properties.', '2012-12-01 00:00:00.000', '2013-09-01 00:00:00.000', 10, 1, @now, @now
WHERE @kloutfire_job_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM `jr_job_roles`
    WHERE `job_id` = @kloutfire_job_id
      AND `title` = 'Web Developer'
  );

INSERT INTO `jr_job_roles` (`job_id`, `title`, `short_summary`, `start_date`, `end_date`, `priority`, `is_current`, `created_at`, `updated_at`)
SELECT @freight_access_job_id, 'Web Application Developer', 'Developed early custom application workflows and backend systems.', '2010-08-01 00:00:00.000', '2012-10-01 00:00:00.000', 10, 1, @now, @now
WHERE @freight_access_job_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM `jr_job_roles`
    WHERE `job_id` = @freight_access_job_id
      AND `title` = 'Web Application Developer'
  );

INSERT INTO `jr_job_roles` (`job_id`, `title`, `short_summary`, `start_date`, `end_date`, `priority`, `is_current`, `created_at`, `updated_at`)
SELECT @seo_strong_job_id, 'Web Development Freelancer', 'Created and delivered client-focused web projects.', '2012-10-01 00:00:00.000', '2013-08-01 00:00:00.000', 10, 1, @now, @now
WHERE @seo_strong_job_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM `jr_job_roles`
    WHERE `job_id` = @seo_strong_job_id
      AND `title` = 'Web Development Freelancer'
  );

INSERT INTO `jr_job_roles` (`job_id`, `title`, `short_summary`, `start_date`, `end_date`, `priority`, `is_current`, `created_at`, `updated_at`)
SELECT @odesk_job_id, 'Web Development Freelancer', 'Handled mixed freelance contracts and web implementation work.', '2011-04-01 00:00:00.000', '2016-03-01 00:00:00.000', 10, 1, @now, @now
WHERE @odesk_job_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM `jr_job_roles`
    WHERE `job_id` = @odesk_job_id
      AND `title` = 'Web Development Freelancer'
  );

INSERT INTO `jr_projects` (`name`, `shortcode`, `short`, `role`, `position`, `extended`, `start_date`, `end_date`, `created_at`, `updated_at`)
VALUES
  (
    'Twilio Call Tracking',
    'twilio-call-tracking',
    'Real-time call routing and lead attribution system using Laravel, APIs, and webhooks.',
    'Systems Engineer III',
    'TrailerCentral',
    NULL,
    '2024-03-01 00:00:00.000',
    NULL,
    @now,
    @now
  ),
  (
    'Craigslist Autoposter',
    'craigslist-autoposter',
    'Chrome extension and backend system automating inventory posting and payment flows.',
    'Lead Developer',
    'TrailerCentral',
    NULL,
    '2022-09-01 00:00:00.000',
    NULL,
    @now,
    @now
  ),
  (
    'Email System Stabilization',
    'email-system-stabilization',
    'Resolved SES delivery failures and eliminated repeated account blocks.',
    'Systems Engineer III',
    'TrailerCentral',
    NULL,
    '2024-03-01 00:00:00.000',
    NULL,
    @now,
    @now
  ),
  (
    'CRM Automation',
    'crm-automation',
    'Built workflow systems to reduce manual operations across dealer platforms.',
    'Lead Developer',
    'TrailerCentral',
    NULL,
    '2022-09-01 00:00:00.000',
    NULL,
    @now,
    @now
  )
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `short` = VALUES(`short`),
  `role` = VALUES(`role`),
  `position` = VALUES(`position`),
  `extended` = VALUES(`extended`),
  `start_date` = VALUES(`start_date`),
  `end_date` = VALUES(`end_date`),
  `updated_at` = @now;

SET @experience_category_id := (
  SELECT `id`
  FROM `jr_cats`
  WHERE `shortcode` = 'experience'
  LIMIT 1
);

INSERT INTO `jr_projects_cats` (`project_id`, `category_id`, `priority`, `created_at`, `updated_at`)
SELECT p.`id`, @experience_category_id, t.`priority`, @now, @now
FROM (
  SELECT 'twilio-call-tracking' AS `shortcode`, 0 AS `priority`
  UNION ALL SELECT 'craigslist-autoposter', 1
  UNION ALL SELECT 'email-system-stabilization', 2
  UNION ALL SELECT 'crm-automation', 3
) t
JOIN `jr_projects` p ON p.`shortcode` = t.`shortcode`
WHERE @experience_category_id IS NOT NULL
ON DUPLICATE KEY UPDATE
  `priority` = VALUES(`priority`),
  `updated_at` = @now;

INSERT INTO `jr_job_project_relations` (`job_id`, `project_id`, `relation_type`, `priority`, `created_at`, `updated_at`)
SELECT @trailercentral_job_id, p.`id`, 'key_system', t.`priority`, @now, @now
FROM (
  SELECT 'twilio-call-tracking' AS `shortcode`, 0 AS `priority`
  UNION ALL SELECT 'craigslist-autoposter', 1
  UNION ALL SELECT 'email-system-stabilization', 2
  UNION ALL SELECT 'crm-automation', 3
) t
JOIN `jr_projects` p ON p.`shortcode` = t.`shortcode`
WHERE @trailercentral_job_id IS NOT NULL
ON DUPLICATE KEY UPDATE
  `relation_type` = VALUES(`relation_type`),
  `priority` = VALUES(`priority`),
  `updated_at` = @now;

DELETE r
FROM `jr_job_project_relations` r
JOIN `jr_jobs` j ON j.`id` = r.`job_id`
WHERE j.`shortcode` IN ('odesk', 'ponticlaro', 'yazamo', 'kloutfire', 'freight-access', 'seo-strong');

INSERT INTO `jr_job_project_relations` (`job_id`, `project_id`, `relation_type`, `priority`, `created_at`, `updated_at`)
SELECT @ponticlaro_job_id, p.`id`, 'project', p.`id`, @now, @now
FROM `jr_projects` p
WHERE @ponticlaro_job_id IS NOT NULL
  AND LOWER(CONCAT_WS(' ', COALESCE(p.`name`, ''), COALESCE(p.`short`, ''), COALESCE(p.`position`, ''), COALESCE(p.`role`, ''))) LIKE '%ponticlaro%';

INSERT INTO `jr_job_project_relations` (`job_id`, `project_id`, `relation_type`, `priority`, `created_at`, `updated_at`)
SELECT @yazamo_job_id, p.`id`, 'project', p.`id`, @now, @now
FROM `jr_projects` p
WHERE @yazamo_job_id IS NOT NULL
  AND LOWER(CONCAT_WS(' ', COALESCE(p.`name`, ''), COALESCE(p.`short`, ''), COALESCE(p.`position`, ''), COALESCE(p.`role`, ''))) LIKE '%yazamo%';

INSERT INTO `jr_job_project_relations` (`job_id`, `project_id`, `relation_type`, `priority`, `created_at`, `updated_at`)
SELECT @kloutfire_job_id, p.`id`, 'project', p.`id`, @now, @now
FROM `jr_projects` p
WHERE @kloutfire_job_id IS NOT NULL
  AND LOWER(CONCAT_WS(' ', COALESCE(p.`name`, ''), COALESCE(p.`short`, ''), COALESCE(p.`position`, ''), COALESCE(p.`role`, ''))) LIKE '%kloutfire%';

INSERT INTO `jr_job_project_relations` (`job_id`, `project_id`, `relation_type`, `priority`, `created_at`, `updated_at`)
SELECT @freight_access_job_id, p.`id`, 'project', p.`id`, @now, @now
FROM `jr_projects` p
WHERE @freight_access_job_id IS NOT NULL
  AND (
    LOWER(CONCAT_WS(' ', COALESCE(p.`name`, ''), COALESCE(p.`short`, ''), COALESCE(p.`position`, ''), COALESCE(p.`role`, ''))) LIKE '%freight access%'
    OR LOWER(CONCAT_WS(' ', COALESCE(p.`name`, ''), COALESCE(p.`short`, ''), COALESCE(p.`position`, ''), COALESCE(p.`role`, ''))) LIKE '%freight-access%'
  );

INSERT INTO `jr_job_project_relations` (`job_id`, `project_id`, `relation_type`, `priority`, `created_at`, `updated_at`)
SELECT @seo_strong_job_id, p.`id`, 'project', p.`id`, @now, @now
FROM `jr_projects` p
WHERE @seo_strong_job_id IS NOT NULL
  AND (
    LOWER(CONCAT_WS(' ', COALESCE(p.`name`, ''), COALESCE(p.`short`, ''), COALESCE(p.`position`, ''), COALESCE(p.`role`, ''))) LIKE '%seo strong%'
    OR LOWER(CONCAT_WS(' ', COALESCE(p.`name`, ''), COALESCE(p.`short`, ''), COALESCE(p.`position`, ''), COALESCE(p.`role`, ''))) LIKE '%seostrong%'
  );

INSERT INTO `jr_job_project_relations` (`job_id`, `project_id`, `relation_type`, `priority`, `created_at`, `updated_at`)
SELECT @odesk_job_id, p.`id`, 'project', p.`id`, @now, @now
FROM `jr_projects` p
WHERE @odesk_job_id IS NOT NULL
  AND LOWER(CONCAT_WS(' ', COALESCE(p.`name`, ''), COALESCE(p.`short`, ''), COALESCE(p.`position`, ''), COALESCE(p.`role`, ''))) NOT LIKE '%trailercentral%'
  AND p.`id` NOT IN (
    SELECT r.`project_id`
    FROM `jr_job_project_relations` r
    WHERE r.`job_id` IN (
      COALESCE(@ponticlaro_job_id, -1),
      COALESCE(@yazamo_job_id, -1),
      COALESCE(@kloutfire_job_id, -1),
      COALESCE(@freight_access_job_id, -1),
      COALESCE(@seo_strong_job_id, -1)
    )
  );

INSERT INTO `jr_job_impacts` (`job_id`, `description`, `priority`, `created_at`, `updated_at`)
SELECT
  r.`job_id`,
  TRIM(r.`short_summary`) AS `description`,
  r.`priority`,
  NOW(3),
  NOW(3)
FROM `jr_job_roles` r
WHERE r.`short_summary` IS NOT NULL
  AND TRIM(r.`short_summary`) <> ''
ON DUPLICATE KEY UPDATE
  `description` = VALUES(`description`),
  `updated_at` = NOW(3);