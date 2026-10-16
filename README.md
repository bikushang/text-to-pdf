# Smart PDF Document Editor

A modern React-based document editor for creating, formatting, and exporting PDF documents directly in your browser.

## Features

- Rich-text document editing
- Text formatting and document creation
- PDF export functionality
- Smart pagination designed to help reduce awkward page breaks
- Clean and responsive user interface
- Browser-based document workflow
- Production build using Vite

## Technology Stack

- React
- JavaScript (JSX)
- Vite
- Tailwind CSS
- Tiptap
- jsPDF
- html2canvas
- pdf-lib / PDF.js, where used by the application

## Requirements

- Node.js and npm
- A modern web browser
- Internet connection for installing dependencies

## Installation

1. Extract the project ZIP.
2. Open a terminal in the project directory.
3. Install dependencies:

   ```bash
   npm install
   ```

## Run in Development

Start the local development server:

```bash
npm run dev
```

Open the local URL shown in your terminal.

## Build for Production

Create the production build:

```bash
npm run build
```

Vite generates the production files in the `dist` directory.

## Preview the Production Build

Run:

```bash
npm run preview
```

Open the local URL shown in your terminal to preview the production build.

## Deployment

To deploy the application to Netlify or another compatible static hosting service:

1. Run `npm run build`.
2. Upload the contents of the `dist` directory or connect the project repository to your hosting provider.
3. Configure the publish directory as `dist`.
4. Open the deployed website and test the editor and PDF export functionality.

For Netlify deployments, ensure the publish directory is configured correctly.

## Using the Application

1. Open the application in a supported browser.
2. Create or enter document content.
3. Use the available editor controls to format the content.
4. Export the document as a PDF.
5. Open the generated PDF and check its formatting and page breaks.

Smart pagination is designed to help keep content blocks together and reduce awkward page breaks. Exact pagination may vary depending on document content, fonts, and layout.

## Troubleshooting

**Dependencies fail to install**

Check your Node.js and npm versions, then run:

```bash
npm install
```

**The application does not start**

Verify that dependencies are installed and run:

```bash
npm run dev
```

**The production build fails**

Review the terminal output for missing dependencies or configuration errors.

**PDF export issues**

Try a current version of Chrome, Edge, or Firefox. Check the browser console for errors and verify the generated PDF.

**Missing images or styles after deployment**

Ensure the complete contents of `dist`, including its `assets` directory, have been deployed. If hosting in a subdirectory, configure the Vite base path appropriately and rebuild.

## Package Contents

The source-code distribution should include the React source files, package configuration, lockfile, public assets, and relevant build configuration.

The `dist` directory contains the compiled production build when included.

Do not distribute `node_modules` or private environment variables.

## License and Third-Party Notices

Review the included `LICENSE-AND-THIRD-PARTY-NOTICES.md` file for applicable license information. Verify all third-party dependencies and assets are licensed for your intended distribution before publishing.

## Version History

See `CHANGELOG.md` for release details.