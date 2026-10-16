# License and Third-Party Notices

## 1. Product source-code license

This file documents third-party software used by the project. It does not, by itself, grant a license to the buyer for the complete product.

The license for the Smart PDF Document Editor source code is governed by the license and purchase terms shown on the marketplace listing. Before publishing, the seller should confirm the applicable Codester terms and make sure the listing's license promises are consistent with this package.

Unless expressly included in the seller's license, purchasing this project does not transfer ownership of third-party libraries.

## 2. Third-party dependencies

The project uses third-party packages declared in `package.json`. The package lockfile records the resolved dependency tree.

Direct runtime dependencies include:

- React and React DOM — https://react.dev/
- Tiptap and Tiptap extensions — https://tiptap.dev/
- jsPDF — https://github.com/parallax/jsPDF
- html2canvas — https://html2canvas.hertzen.com/
- pdf-lib — https://pdf-lib.js.org/
- PDF.js (`pdfjs-dist`) — https://mozilla.github.io/pdf.js/

Build and development dependencies include Vite, Tailwind CSS, PostCSS, Autoprefixer, ESLint, and related plugins. Refer to `package.json` for the complete declared list.

Each dependency is distributed under its own license and may include additional notices or attribution requirements. Review the license file and notices supplied by each package version before redistributing the project. The dependency list can change when packages are updated.

## 3. Seller's pre-release checklist

Before publishing or redistributing this project:

1. Run `npm install` from the final project folder.
2. Review the installed dependency tree and the license metadata for every direct and transitive dependency.
3. Include required license texts, copyright notices, and attribution notices in the distributed package.
4. Check fonts, icons, images, and other assets separately; confirm that each asset may be redistributed with a commercial source-code product.
5. Remove any asset that lacks suitable redistribution permission.
6. Re-run the license review whenever dependencies or assets change.

Useful commands and checks depend on the package manager and audit tooling installed in the environment. Do not assume that every dependency uses the same license.

## 4. No warranty for third-party software

Third-party libraries are provided by their respective authors and are subject to their own license terms, warranties, and limitations. Refer to the upstream project and the license distributed with the exact version you use.

## 5. Notice

This document is a practical notice template, not legal advice and not a substitute for a complete license audit. The seller is responsible for verifying license compliance and the marketplace license terms before release.
