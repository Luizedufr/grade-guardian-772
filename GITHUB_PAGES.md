# GitHub Pages

The `Deploy Marklet to GitHub Pages` workflow builds the app on pushes to `main`, or when run manually from GitHub Actions. It uploads only `dist/client`, never the repository or server output.

## Activate deployment

1. Connect this project to GitHub in Lovable project settings if it is not already connected.
2. In the GitHub repository, open **Settings → Pages → Build and deployment → Source**, and choose **GitHub Actions**.
3. Open **Actions → Deploy Marklet to GitHub Pages → Run workflow** on `main`.
4. The completed deployment provides the website URL.

GitHub account permissions and a plan that supports Pages for the repository's visibility are required. If the synced branch is not `main`, adjust the workflow's push branch accordingly.

## Static hosting behavior

- The workflow uses the base path returned by GitHub Pages, supporting project sites, root sites, and configured custom domains.
- A copy of the SPA shell at `404.html` allows direct class links and refreshes to load the client router. GitHub still returns HTTP 404 on those direct deep-link requests; the app itself renders normally.
- Classes and settings remain entirely in localStorage. Data belongs to each browser and origin: the GitHub Pages site does not automatically receive grades stored on the Lovable preview or another domain.
- No live GitHub deployment can be confirmed until the workflow has completed in the connected repository.