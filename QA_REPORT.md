# Production V365.2.2 Full QA Report

Date: 2026-07-14  
Result: **PASS — Ready for Netlify deployment**

## Verified
- Production V365.2.2 version marker is present.
- Navigation logo is enlarged to 64 px on desktop and remains responsive on smaller screens.
- Logo asset is transparent and no separate background block is applied.
- Three reservation CTA cards use equal-height grid rows and flex-column layout.
- Telephone, LINE, and Facebook buttons use the same brand-gold style, width and minimum height.
- Desktop CTA buttons are anchored after equal flexible content areas, providing one horizontal bottom baseline.
- Facebook explanatory text is plain text; the CTA button is the only Facebook link inside the card.
- Approved policy text is present: add-bed inquiry, breakfast ordering, NT$5,000 deposit, and 14-day extension notice.
- “寵物友善” is absent.
- No duplicate HTML IDs were found.
- All referenced local images and assets exist.
- All images include alt text.
- Inline JavaScript passed Node syntax validation.
- No zero-byte files remain in the package.

## Responsive behavior
- Desktop: three equal-width cards in one row with aligned CTA bottoms.
- Tablet: cards collapse to one column for stable spacing and readability.
- Mobile: CTA buttons expand to full card width and card height becomes content-driven.

## Limitation
A browser screenshot pass could not be completed in the execution environment because local HTTP and file URLs were blocked by the administrator policy. Structural, asset, CSS, HTML and JavaScript checks all passed.

## Uploaded homepage integration verification — 2026-07-21
- Source file integrated as root `index.html`: PASS
- Previous homepage rollback copy retained: PASS
- HTML document structure check: PASS
- Local asset reference existence check: PASS
- JSON data parse check: PASS
- Manifest regenerated: PASS
- ZIP integrity test: PASS
