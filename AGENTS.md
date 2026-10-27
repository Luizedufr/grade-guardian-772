<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Class visuals use a shared ClassIcon renderer and a curated, statically imported Tabler registry; optional icon IDs preserve existing emoji-only localStorage records and keep bundles small.
- GitHub Pages uses a separate SPA build configuration with a repository-aware base path and a copied 404 shell; preserve the default Lovable configuration and browser-only data storage.
