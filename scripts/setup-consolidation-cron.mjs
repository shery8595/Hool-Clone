#!/usr/bin/env node
/**
 * Create or update the memory-consolidation job on cron-job.org (every 6 hours).
 *
 * Required env:
 *   CRON_JOB_API_KEY
 *   CRON_APP_URL
 *   CRON_SECRET
 *
 * Optional:
 *   CRON_CONSOLIDATION_JOB_ID — PATCH existing job instead of create
 */

const apiKey = process.env.CRON_JOB_API_KEY;
const appUrl = process.env.CRON_APP_URL?.replace(/\/$/, "");
const cronSecret = process.env.CRON_SECRET;
const jobId = process.env.CRON_CONSOLIDATION_JOB_ID;

if (!apiKey || !appUrl || !cronSecret) {
  console.error(
    "Missing env. Set CRON_JOB_API_KEY, CRON_APP_URL, and CRON_SECRET.",
  );
  process.exit(1);
}

const payload = {
  job: {
    title: "HoolClone memory-consolidation",
    url: `${appUrl}/api/cron/memory-consolidation`,
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
      hours: [0, 6, 12, 18],
      mdays: [-1],
      minutes: [0],
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
  jobId
    ? `Updated consolidation cron job ${jobId}`
    : "Created memory-consolidation cron job on cron-job.org",
);
console.log(JSON.stringify(parsed, null, 2));
