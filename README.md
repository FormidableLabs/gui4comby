# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)


## References
* Design https://github.com/ayu-theme/vscode-ayu/blob/master/assets/light-bordered.png
* Lite Theme in VSCode https://vscode.dev/theme/teabyii.ayu/Ayu%20Light%20Bordered
  * ace editor version of theme could provide a mapping reference https://github.com/ayu-theme/ayu-ace
* using css to theme https://blog.bitsrc.io/theming-react-components-with-css-variables-ee52d1bb3d90
* ace theme css sample https://github.com/ajaxorg/ace/blob/master/src/theme/github.css.js
* ace diff example https://securingsincity.github.io/react-ace/diff.html
* rust docker library https://crates.io/crates/bollard
* Docker credentials - application passwords: [Manage access tokens | Docker Documentation](https://docs.docker.com/docker-hub/access-tokens/)
* https://github.com/ydeshayes/react-highlight for highlighting matches/rewrites
* VSCode theme reference https://code.visualstudio.com/api/references/theme-color
* Generate ace theme from vscode theme https://github.com/ayu-theme/ayu-ace/blob/master/scripts/update.js

## Todo
- [x] App: Support tabs to accommodate multiple work streams
- [ ] App: Docker credentials
- [x] Playground: Functional
- [x] Playground: Language selection
- [x] Playground: Ace editor for source code
- [ ] Playground: Matched/Rewritten color highlighting or diff
- [x] Playground: Auto "run" when source, matcher, rewrite or rule changes (debounced)
- [x] Filesystem: Dry-run Functional
- [x] Filesystem: Language selection
- [ ] ~Filesystem: Reject All Functional~ 
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

## Todo Edge Cases
### Edge Case: comby/comby image not available locally, and not signed into docker
Results in Error: toomanyrequests: You have reached your pull rate limit
App should suggest to user they should sign into docker desktop (osx) or (nix/win solution)
