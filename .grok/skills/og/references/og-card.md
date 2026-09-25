# Custom OG Card Generation

To hand over a generated og.jpg card from the build task:

```bash
node scripts/write-atomic.mjs /tmp/og-card.jpg public/og.jpg
```

This script writes the card atomically from staging to the public directory.
