# Citizen submission update
Apply drizzle/0001_citizen_geofence.sql once to an existing database; a fresh database needs both migrations in order. This additive migration preserves records. Populate existing hotspots' latitude, longitude and radius_meters using verified government coordinates before accepting submissions. New POST /api/hotspots requests require latitude, longitude and radiusMeters.

POST /api/submissions accepts JSON or multipart text fields: hotspotId, beforeImageUrl, afterImageUrl, location. For multipart, location is a JSON string. Location contains numeric latitude, longitude, accuracy (meters), timestamp (epoch milliseconds). Idempotency-Key remains required. The camera component already supplies these fields.

Images can be trusted HTTPS URLs or bounded JPEG data URLs. Multipart binary files are not supported; upload files to your storage first. Maximum submission body: 2.5MB. URL origins require BOUNTY_IMAGE_ORIGINS configuration. Base64 images are stored as data URLs; use uploaded URLs for larger deployments.

All newly received submissions are Pending with zero payout; completionPercentage=0 is an unverified placeholder, aiReason='Awaiting verification'. No AI call is performed at intake. An asynchronous verification worker is not included. Existing manual government approval remains available. The prior synchronous AI intake tests and behavior are superseded.

GPS is validated against server-stored coordinates, including reported accuracy and a two-minute freshness window. Browser GPS can be spoofed; this is not cryptographic location proof. Idempotent replays return the already stored result without creating new records.

This archive updates the downloaded project only; it does not deploy or modify the hosted site.
