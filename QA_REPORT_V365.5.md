# Production V365.5 Enterprise Dynamic CMS Edition — QA Report

## Build principle
The online baseline remains embedded in `index.html`. Dynamic CMS data is applied only after all JSON files load successfully. If loading fails, the existing published content remains visible.

## Completed
- Preserved `publish_mode: editorial_workflow`.
- Preserved Git Gateway backend and `main` branch.
- Added `/assets/uploads/` as the dedicated location for newly uploaded CMS media.
- Normalized all existing CMS-managed image values to root-relative `/assets/...` URLs.
- Added the missing `assets/garden/exterior-24.webp` referenced by news data.
- Connected `assets/js/cms-content.js` to the published page.
- Connected `assets/css/cms-content.css` to the published page.
- Facilities and attractions now load from the same JSON files edited by CMS.
- Existing embedded HTML remains as a fallback to avoid blank sections during network or data failures.

## Automated checks
- JavaScript syntax: PASS
- YAML parse: PASS
- JSON parse: PASS
- Referenced image existence: PASS
- Editorial Workflow preserved: PASS
- Dynamic CSS/JS integration: PASS

## Deployment verification required
After Netlify deploy:
1. Open `/admin/` and confirm sign-in.
2. Confirm SEO social image preview.
3. Confirm attraction and room image previews.
4. Edit one facility item as a draft and verify the published site remains unchanged until publication.
5. Publish the test change and confirm the frontend updates.
