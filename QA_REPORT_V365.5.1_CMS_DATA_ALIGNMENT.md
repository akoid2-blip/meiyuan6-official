# Production V365.5.1 CMS Data Alignment Fix — QA Report

## Scope
- Preserve existing production frontend layout and embedded fallback content.
- Keep Editorial Workflow enabled.
- Align CMS facility data with the currently published website.
- Make existing project images selectable from the Decap CMS media library.
- Normalize CMS image paths for preview rendering under `/admin/`.

## Changes
- `admin/config.yml`: `media_folder` changed to `assets`; `public_folder` changed to `/assets`.
- `data/facilities.json`: synchronized to the currently published facility cards.
- Image fields in JSON were normalized to root-relative `/assets/...` paths.
- Existing frontend fallback content was not removed or rewritten.

## Validation
- Editorial Workflow retained: PASS
- JSON parse validation: PASS
- Referenced local image files exist: PASS
- Facility group names/descriptions/items match embedded production baseline: PASS
- Existing frontend fallback preserved: PASS

## Post-deployment checks
1. Open `/admin/` and verify the media library can browse existing assets.
2. Verify attraction, room, hero, and social-share image previews.
3. Verify facility content matches the frontend.
4. Save a draft and confirm Editorial Workflow status transitions.
