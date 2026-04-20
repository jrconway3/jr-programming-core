-- Deduplicate: keep only the newest row per key before adding the unique index.
DELETE s1 FROM `jr_settings` s1
INNER JOIN `jr_settings` s2
  ON s1.`key` = s2.`key`
 AND (s1.`updated_at` < s2.`updated_at` OR (s1.`updated_at` = s2.`updated_at` AND s1.`id` < s2.`id`));

-- Add unique index on key.
ALTER TABLE `jr_settings` ADD UNIQUE INDEX `jr_settings_key_key` (`key`);

UPDATE `jr_settings`
SET `value` = 'Built using Next.js and Tailwind CSS, with assistance from GitHub Copilot.',
    `updated_at` = CURRENT_TIMESTAMP(3)
WHERE `key` = 'footer/copy/built';

INSERT INTO `jr_settings` (`page_id`, `key`, `value`, `created_at`, `updated_at`)
SELECT NULL, 'home/status/enabled', 'true', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `jr_settings` WHERE `key` = 'home/status/enabled'
);

INSERT INTO `jr_settings` (`page_id`, `key`, `value`, `created_at`, `updated_at`)
SELECT NULL, 'home/status/state', 'available', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `jr_settings` WHERE `key` = 'home/status/state'
);

INSERT INTO `jr_settings` (`page_id`, `key`, `value`, `created_at`, `updated_at`)
SELECT NULL, 'home/status/label', 'Status: Available for work', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `jr_settings` WHERE `key` = 'home/status/label'
);

INSERT INTO `jr_settings` (`page_id`, `key`, `value`, `created_at`, `updated_at`)
SELECT NULL, 'home/status/message', 'Looking for a developer to build or improve your system?', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `jr_settings` WHERE `key` = 'home/status/message'
);

INSERT INTO `jr_settings` (`page_id`, `key`, `value`, `created_at`, `updated_at`)
SELECT NULL, 'home/status/cta/label', 'Contact Me', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `jr_settings` WHERE `key` = 'home/status/cta/label'
);

INSERT INTO `jr_settings` (`page_id`, `key`, `value`, `created_at`, `updated_at`)
SELECT NULL, 'home/status/cta/href', '/contact#inquiry-form', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `jr_settings` WHERE `key` = 'home/status/cta/href'
);

INSERT INTO `jr_settings` (`page_id`, `key`, `value`, `created_at`, `updated_at`)
SELECT NULL, 'footer/copy/rights', 'all rights reserved.', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `jr_settings` WHERE `key` = 'footer/copy/rights'
);

INSERT INTO `jr_settings` (`page_id`, `key`, `value`, `created_at`, `updated_at`)
SELECT NULL, 'footer/font/name', 'Commodore 64', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `jr_settings` WHERE `key` = 'footer/font/name'
);

INSERT INTO `jr_settings` (`page_id`, `key`, `value`, `created_at`, `updated_at`)
SELECT NULL, 'footer/font/author', 'Devin Cook', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `jr_settings` WHERE `key` = 'footer/font/author'
);

INSERT INTO `jr_settings` (`page_id`, `key`, `value`, `created_at`, `updated_at`)
SELECT NULL, 'footer/font/url', 'https://www.dafont.com/commodore-64.font', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `jr_settings` WHERE `key` = 'footer/font/url'
);
