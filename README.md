# GUI 4 Comby

## Screenshots
![Splash screen - jump to docs or start rewriting](https://raw.githubusercontent.com/FormidableLabs/gui4comby/8f459ee2f4f4a809b113cce75b83c6857cb55418/docs/Screen%20Shot%202022-09-26%20at%202.13.49%20PM.png)

Paste in some source code to start playing around with match and rewrite templates.
![Playground tab - explore match and rewrite patterns](https://raw.githubusercontent.com/FormidableLabs/gui4comby/8f459ee2f4f4a809b113cce75b83c6857cb55418/docs/Screen%20Shot%202022-09-26%20at%202.27.27%20PM.png)

Once you've perfected your templates, run them against your project files.
![Filesystem tab - run match and rewrite patterns on your files](https://raw.githubusercontent.com/FormidableLabs/gui4comby/8f459ee2f4f4a809b113cce75b83c6857cb55418/docs/Screen%20Shot%202022-09-26%20at%202.28.29%20PM.png)

Easy access to comby documentation right in the application.
![Docs tab - view the comby docs in app](https://raw.githubusercontent.com/FormidableLabs/gui4comby/8f459ee2f4f4a809b113cce75b83c6857cb55418/docs/Screen%20Shot%202022-09-26%20at%202.31.20%20PM.png)

Switch between light and dark mode themes.
![Theme Options - choose between light and dark](https://raw.githubusercontent.com/FormidableLabs/gui4comby/8f459ee2f4f4a809b113cce75b83c6857cb55418/docs/Screen%20Shot%202022-09-26%20at%202.33.39%20PM.png)

The application uses docker behind the scenes to do all the magic, use docker settings to download or update your comby image.
![Docker Setup - download and update the comby image](https://raw.githubusercontent.com/FormidableLabs/gui4comby/8f459ee2f4f4a809b113cce75b83c6857cb55418/docs/Screen%20Shot%202022-09-26%20at%202.33.52%20PM.png)


## Development
### Tauri + React + Typescript

This project is a https://tauri.app/ and uses Tauri, React and Typescript in Vite.

### Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)


## References
* using css to theme https://blog.bitsrc.io/theming-react-components-with-css-variables-ee52d1bb3d90
* rust docker library https://crates.io/crates/bollard
* Docker credentials - application passwords: [Manage access tokens | Docker Documentation](https://docs.docker.com/docker-hub/access-tokens/)
* https://github.com/ydeshayes/react-highlight for highlighting matches/rewrites
* ace editor range highlight https://stackoverflow.com/questions/27531860/how-to-highlight-a-certain-line-in-ace-editor

## Todo
- [x] App: Support tabs to accommodate multiple work streams
- [x] App: Docker credentials
- [x] Playground: Functional
- [x] Playground: Language selection
- [x] Playground: Ace editor for source code
- [ ] Playground: Matched/Rewritten color highlighting or diff
- [x] Playground: Auto "run" when source, matcher, rewrite or rule changes (debounced)
- [x] Filesystem: Dry-run Functional
- [x] Filesystem: Language selection
- [ ] ~~Filesystem: Reject All Functional~~ [wont do] 
- [x] Filesystem: Accept All Functional
- [x] Filesystem: Interactive Accept / Reject
- [x] Filesystem: Matched/Rewritten color highlighting or diff
- [x] Docs: Basic import & display of comby.dev docs
- [ ] Docs: Replace playground links w/ open in app (new playground tab auto-filled)
- [ ] Library: Save and Manage match, rewrite and rule patterns
- [ ] Library: Default collection - Samples
- [ ] App State: Persist across program termination
- [x] Themes: Map vscode themes to css variable overrides (POC)
- [x] Themes: Map vscode themes to css variable overrides
- [x] Themes: Ability to switch between available themes
- [x] ~Themes: Support any theme from https://vscodethemes.com/~ (turned out unreliable) 
- [x] App Tabs: Close all tabs shows Getting Started splash
- [x] App Toaster: Provide Feedback on success/failure messages using toasts
- [x] App Event Log: History of time, action
- [ ] App Event Log: include toaster messages
- [x] Docs: Enhance styling of elements like tables, blockquotes, etc
- 
- [x] Bug: Too many tabs pushes new tab buttons off the screen
- [x] Bug: Execing docker: Docker Container Error: Docker responded with status code 409: Conflict. The container name "/gui4comby-server" is already in use by container
- [x] Bug: If no matches from comby, stdOut is empty resulting in JSON Parse error: Unexpected EOF on the frontend
- [x] Bug: State is shared between playground tabs
- [x] Bug: Docs tab lose scroll position on tab changes (they revert to tab path which is usually top, or a section header)

