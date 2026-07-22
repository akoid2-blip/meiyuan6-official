# Production V365.5 Enterprise Dynamic CMS Rebuild — Static QA Report

## Build status

**Candidate status: RC1 — static QA passed; Netlify deployment QA pending.**

## Changes completed

- Rebuilt `admin/config.yml` into separated CMS collections.
- Preserved `git-gateway` backend and `editorial_workflow`.
- Assigned collection-level media folders:
  - Home/Rooms: `assets/garden`
  - Attractions: `assets/attractions`
  - Website/SEO: `assets/brand`
  - News: `assets/news`
  - Blog: `assets/blog`
- Synchronized `data/facilities.json` with the current production HTML baseline.
- Added attraction image ALT fields.
- Added dedicated news/blog media directories.
- Preserved current production `index.html` as the safe embedded fallback.

## Static QA results

| Item | Result |
|---|---|
| ZIP project structure | PASS |
| `admin/config.yml` YAML parsing | PASS |
| Git Gateway retained | PASS |
| Editorial Workflow retained | PASS |
| All `data/*.json` parse correctly | PASS |
| Referenced local media files exist | PASS |
| Facilities baseline synchronization | PASS |
| Production HTML fallback retained | PASS |
| No `.git` directory included | PASS |

## Deployment QA still required

These checks require a Netlify Deploy Preview or production deployment and cannot be certified by static inspection alone:

- Netlify Identity login.
- Git Gateway authorization and commit creation.
- Editorial Workflow draft/review/publish cycle.
- Media Library browsing for each collection.
- Image preview and image replacement in CMS.
- Front-end refresh after CMS publish.
- Desktop/mobile browser regression.

## Release decision

Do not label this candidate `Official Stable` until the deployment QA items above pass.
