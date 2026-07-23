# Production V365.5.3 Enterprise Dynamic CMS Official Stable

- Fixed CMS DOM replacement invalidating Hero and room carousel bindings.
- Replaced duplicate direct accordion handlers with delegated handling.
- Reinitialized interactive components after CMS content updates.
- Added safe timer/listener cleanup to prevent duplicate autoplay instances.
- Preserved desktop LINE modal and mobile direct LINE behavior after dynamic rendering.
- Changed runtime asset/data references to deployment-relative paths for local HTTP and Pages testing.
