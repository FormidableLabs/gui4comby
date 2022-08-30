# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)


## References
* Design https://github.com/ayu-theme/vscode-ayu/blob/master/assets/light-bordered.png
* Lite Theme in VSCode https://vscode.dev/theme/teabyii.ayu/Ayu%20Light%20Bordered
* using css to theme https://blog.bitsrc.io/theming-react-components-with-css-variables-ee52d1bb3d90
* ace theme css sample https://github.com/ajaxorg/ace/blob/master/src/theme/github.css.js
* ace diff example https://securingsincity.github.io/react-ace/diff.html
* rust docker library https://crates.io/crates/bollard
* Docker credentials - application passwords: [Manage access tokens | Docker Documentation](https://docs.docker.com/docker-hub/access-tokens/)
* https://github.com/ydeshayes/react-highlight for highlighting matches/rewrites

## Todo
- [x] App: Support tabs to accommodate multiple work streams
- [ ] App: Docker credentials
- [x] Playground: Functional
- [ ] Playground: Language selection
- [ ] Playground: Ace editor for source code
- [ ] Playground: Matched/Rewritten color highlighting or diff 
- [ ] Filesystem: Dry-run Functional
- [ ] Filesystem: Language selection
- [ ] Filesystem: Reject All Functional 
- [ ] Filesystem: Accept All Functional
- [ ] Filesystem: Interactive Accept / Reject
- [ ] Filesystem: Matched/Rewritten color highlighting or diff
- [ ] Docs: Basic import & display of comby.dev docs
- [ ] Docs: Replace playground links w/ open in app (new playground tab auto-filled)
- [ ] Library: Save and Manage match, rewrite and rule patterns
- [ ] Library: Default collection - Samples
- [ ] App State: Persist across program termination
- [x] Themes: Map vscode themes to css variable overrides (POC)
- [ ] Themes: Map vscode themes to css variable overrides
- [ ] Themes: Ability to switch between available themes
- [ ] Themes: Support any theme from https://vscodethemes.com/
- [ ] App Tabs: Close all tabs shows Getting Started splash
- [x] App Toaster: Provide Feedback on success/failure messages using toasts
- [ ] App Event Log: History of time, action, success or failure messages
- 
- [ ] Bug: Too many tabs pushes new tab buttons off the screen
- [x] Bug: Execing docker: Docker Container Error: Docker responded with status code 409: Conflict. The container name "/gui4comby-server" is already in use by container
- [ ] Bug: If no matches from comby, stdOut is empty resulting in JSON Parse error: Unexpected EOF on the frontend

## Todo Edge Cases
### Edge Case: comby/comby image not available locally, and not signed into docker
Results in Error: toomanyrequests: You have reached your pull rate limit
App should suggest to user they should sign into docker desktop (osx) or (nix/win solution)
