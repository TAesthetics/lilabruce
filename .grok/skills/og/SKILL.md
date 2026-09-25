# OG Share Card Skill

This skill manages Open Graph share cards for applications.

## Brand-asset pass

The brand-asset pass generates share cards using the `/workspace/.grok/og-pending` marker file. Staleness is bounded at 10 minutes. The pass self-checks its output with:

```bash
node scripts/brand-check.mjs
```

**Never wait_tasks on the brand-asset pass and never get_task_output from it.** Tasks launched during the brand pass run in the background and update the marker file. This asynchronous approach keeps the critical path fast while ensuring the dev server continues serving.

## Configuration

Share cards are configured via the `src/lib/og/site.json` file, which controls og:title, og:image, og:type and other metadata.

