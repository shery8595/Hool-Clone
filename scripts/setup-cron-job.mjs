#!/usr/bin/env node
/**
 * Create or update the check-resolutions job on cron-job.org.
 *
 * Required env:
 *   CRON_JOB_API_KEY  — from cron-job.org → Settings
 *   CRON_APP_URL      — e.g. https://walrus-mu.vercel.app (no trailing slash)
 *   CRON_SECRET       — same value as Vercel CRON_SECRET
 *
 * Optional:
 *   CRON_JOB_ID       — if set, PATCH existing job instead of PUT create
 */

const apiKey = process.env.CRON_JOB_API_KEY;
const appUrl = process.env.CRON_APP_URL?.replace(/\/$/, "");
const cronSecret = process.env.CRON_SECRET;
const jobId = process.env.CRON_JOB_ID;

if (!apiKey || !appUrl || !cronSecret) {
  console.error(
    "Missing env. Set CRON_JOB_API_KEY, CRON_APP_URL, and CRON_SECRET.",
  );
  process.exit(1);
}

const payload = {
  job: {
    title: "HoolClone check-resolutions",
    url: `${appUrl}/api/cron/check-resolutions`,
    enabled: true,
    saveResponses: true,
    requestMethod: 0,
    extendedData: {
      headers: {
        Authorization: `Bearer ${cronSecret}`,
      },
    },
    schedule: {
      timezone: "UTC",
      expiresAt: 0,
      hours: [-1],
      mdays: [-1],
      minutes: [-1],
      months: [-1],
      wdays: [-1],
    },
  },
};

const endpoint = jobId
  ? `https://api.cron-job.org/jobs/${jobId}`
  : "https://api.cron-job.org/jobs";
const method = jobId ? "PATCH" : "PUT";

const response = await fetch(endpoint, {
  method,
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

const body = await response.text();
let parsed;
try {
  parsed = JSON.parse(body);
} catch {
  parsed = body;
}

if (!response.ok) {
  console.error(`cron-job.org ${method} failed (${response.status}):`, parsed);
  process.exit(1);
}

console.log(
  jobId ? `Updated cron job ${jobId}` : "Created cron job on cron-job.org",
);
console.log(JSON.stringify(parsed, null, 2));
