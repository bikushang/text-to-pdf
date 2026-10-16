# Smart PDF Document Editor

A browser-based document editor for creating and exporting PDF documents.

## Package Contents

This package contains the compiled production build of the application. The original React development source code is not included.

- `dist/` — Compiled application files (HTML, JavaScript, CSS, and assets).
- `CHANGELOG.md` — Version history.
- `LICENSE-AND-THIRD-PARTY-NOTICES.md` — License and third-party notices.

## Requirements

- A modern web browser with JavaScript enabled.
- A static web server or compatible hosting service.

Node.js is not required on the production server to serve the compiled files.

## Deployment Instructions

1. Extract the ZIP archive.
2. Open the `dist` folder.
3. Upload the contents of `dist` to your hosting provider's public directory.
4. Ensure the server serves `index.html` as the entry page.
5. Open the deployed application in your browser.
6. Create a document and test the PDF export feature.

## Local Preview

Use a local static web server to preview the `dist` folder. Avoid opening `index.html` directly using a `file://` URL, as browser security restrictions may prevent some features from working.

## Using the Application

1. Open the application in a supported browser.
2. Enter and format your document using the available editor controls.
3. Use the PDF export feature to generate your document.
4. Open the exported PDF and verify its formatting and page breaks.

Smart pagination is designed to help keep content blocks together and reduce awkward page breaks. Results may vary depending on document content, fonts, and layout.

## Troubleshooting

**Blank page or missing styles:** Verify that you uploaded the complete contents of `dist`, including the `assets` folder.

**Problems when hosting in a subdirectory:** The application may require an appropriate Vite base-path configuration and a new production build.

**PDF export problems:** Try a current version of Chrome, Edge, or Firefox and check the browser console for errors.

**Changes are not visible:** Clear the browser cache or perform a hard refresh.

## Package Information

This distribution contains the compiled web application only. The original development source code and build configuration are not included.

See `CHANGELOG.md` for version history.