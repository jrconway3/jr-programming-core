UPDATE `jr_settings`
SET `value` = 'I help businesses automate workflows, integrate APIs, and scale backend systems',
    `updated_at` = CURRENT_TIMESTAMP(3)
WHERE `key` = 'home/banner/subtitle';

INSERT INTO `jr_settings` (`page_id`, `key`, `value`, `created_at`, `updated_at`)
SELECT NULL, 'home/banner/eyebrow', 'Backend Developer • API Integrations • Automation Systems', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `jr_settings` WHERE `key` = 'home/banner/eyebrow'
);

INSERT INTO `jr_settings` (`page_id`, `key`, `value`, `created_at`, `updated_at`)
SELECT NULL, 'home/banner/supporting/line1', '10+ years experience building real-world systems for production businesses', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `jr_settings` WHERE `key` = 'home/banner/supporting/line1'
);

INSERT INTO `jr_settings` (`page_id`, `key`, `value`, `created_at`, `updated_at`)
SELECT NULL, 'home/banner/supporting/line2', 'Specialized in PHP, APIs, automation, and database systems', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `jr_settings` WHERE `key` = 'home/banner/supporting/line2'
);

INSERT INTO `jr_settings` (`page_id`, `key`, `value`, `created_at`, `updated_at`)
SELECT NULL, 'home/banner/cta/primary/label', 'View My Work', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `jr_settings` WHERE `key` = 'home/banner/cta/primary/label'
);

INSERT INTO `jr_settings` (`page_id`, `key`, `value`, `created_at`, `updated_at`)
SELECT NULL, 'home/banner/cta/primary/href', '#projects', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `jr_settings` WHERE `key` = 'home/banner/cta/primary/href'
);

INSERT INTO `jr_settings` (`page_id`, `key`, `value`, `created_at`, `updated_at`)
SELECT NULL, 'home/banner/cta/secondary/label', 'Hire Me', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `jr_settings` WHERE `key` = 'home/banner/cta/secondary/label'
);

INSERT INTO `jr_settings` (`page_id`, `key`, `value`, `created_at`, `updated_at`)
SELECT NULL, 'home/banner/cta/secondary/href', '/contact', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `jr_settings` WHERE `key` = 'home/banner/cta/secondary/href'
);

INSERT INTO `jr_settings` (`page_id`, `key`, `value`, `created_at`, `updated_at`)
SELECT NULL, 'home/banner/cta/tertiary/label', 'Get in Touch', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `jr_settings` WHERE `key` = 'home/banner/cta/tertiary/label'
);

INSERT INTO `jr_settings` (`page_id`, `key`, `value`, `created_at`, `updated_at`)
SELECT NULL, 'home/banner/cta/tertiary/href', '/contact#inquiry-form', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `jr_settings` WHERE `key` = 'home/banner/cta/tertiary/href'
);