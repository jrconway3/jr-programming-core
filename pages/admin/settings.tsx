import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import { FormEvent, useState } from 'react';
import AdminShell from '../../components/admin/AdminShell';
import { getAdminPageProps } from 'app/services/admin/auth';
import { extractApiErrorMessage } from 'app/helpers/response';
import {
  editableSiteSettingSections,
  editableSiteSettingKeys,
  mergeSettingsWithDefaults,
  type SiteSettingField,
} from 'app/services/settings';
import { prisma } from '../../prisma/adapter';

type AdminSettingsPageProps = {
  adminUser: string;
  settings: Record<string, string>;
};

function renderField(
  field: SiteSettingField,
  value: string,
  onChange: (key: string, nextValue: string) => void,
) {
  const sharedClasses = 'mt-2 w-full rounded-lg border border-primary-accent/30 bg-slate-950/65 px-4 py-3 text-sm text-primary-text focus:border-primary-accent focus:ring-primary-accent';

  if (field.inputType === 'textarea') {
    return (
      <textarea
        rows={field.rows ?? 3}
        value={value}
        placeholder={field.placeholder}
        onChange={(event) => onChange(field.key, event.target.value)}
        className={sharedClasses}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      placeholder={field.placeholder}
      onChange={(event) => onChange(field.key, event.target.value)}
      className={sharedClasses}
    />
  );
}

export default function AdminSettings({ adminUser, settings: initialSettings }: AdminSettingsPageProps) {
  const [settings, setSettings] = useState<Record<string, string>>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateSetting(key: string, value: string) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
    setSuccessMessage(null);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setError(null);

    try {
      const payload = editableSiteSettingKeys.reduce<Record<string, string>>((result, key) => {
        result[key] = settings[key] ?? '';
        return result;
      }, {});

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: payload }),
      });

      const responsePayload = await response.json() as {
        ok?: boolean;
        data?: {
          settings?: Record<string, string>;
        };
      };

      if (!response.ok || !responsePayload.ok || !responsePayload.data?.settings) {
        throw new Error(extractApiErrorMessage(responsePayload, 'Unable to save settings.'));
      }

      setSettings(responsePayload.data.settings);
      setSuccessMessage('Settings saved successfully.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save settings.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Head>
        <title>Admin Settings | JRProgramming</title>
      </Head>

      <AdminShell
        title="Site Settings"
        description="Edit the database-backed copy and CTA settings that control the core public homepage messaging."
        adminUser={adminUser}
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
          {editableSiteSettingSections.map((section) => (
            <section key={section.id} className="rounded-2xl border border-primary-accent/20 bg-slate-950/45 p-6">
              <div className="border-b border-primary-accent/15 pb-4">
                <h2 className="text-xl font-bold text-primary-accentLight">{section.title}</h2>
                <p className="mt-2 text-sm text-primary-text/70">{section.description}</p>
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                {section.fields.map((field) => (
                  <label key={field.key} className={field.inputType === 'textarea' ? 'block text-xs uppercase tracking-[0.24em] text-primary-accentLight lg:col-span-2' : 'block text-xs uppercase tracking-[0.24em] text-primary-accentLight'}>
                    {field.label}
                    <p className="mt-2 text-[11px] normal-case tracking-normal text-primary-text/60">{field.description}</p>
                    {renderField(field, settings[field.key] ?? '', updateSetting)}
                  </label>
                ))}
              </div>
            </section>
          ))}

          {(error || successMessage) && (
            <div className={`rounded-lg px-4 py-3 text-sm ${error ? 'border border-red-400/45 bg-red-500/10 text-red-100' : 'border border-emerald-400/35 bg-emerald-500/10 text-emerald-100'}`}>
              {error || successMessage}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg border border-primary-accent/40 bg-primary-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-accentDark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </AdminShell>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<AdminSettingsPageProps> = async (context) => {
  return getAdminPageProps(context, async () => {
    const settings = await prisma.settings.findMany({
      where: {
        key: {
          in: editableSiteSettingKeys,
        },
      },
      orderBy: [
        { updated_at: 'desc' },
        { id: 'desc' },
      ],
    });

    return {
      settings: mergeSettingsWithDefaults(settings),
    };
  });
};