# What and Why?
A browser extension that automatically syncs Go code from Boot.dev's CodeMirror editor to `/tmp/main.go` via a local Go HTTP server.

# Usage guide
1. Load extension folder as `extension unpacked` in your browser extensions
    - You can find the browser extensions page by typing this into your url if you're on a chromium-based browser `chrome:extensions`
2. Start the Go server
    - CD to the receiver directory, and start the go server ie: `cd ~/whereever-you-cloned-this/boot-dev-extension/receiver; go run .`

# Architecture
- extension/content.js extracts code from the page's DOM

- extension/background.js sends extracted code to a Go http server

- receiver/main.go listens for a request, and writes to `/tmp/main.go`

I chose this architecture because I wanted to make something with Go! It isn't the cleanest architecture overall considering I use VSCode, though; as its a little known secret that VSCode actually has a websocket server built in!

# Security
We use a token to prevent random websites writing to `/tmp/main.go`, which is not secure because the token is hardcoded. Optimally, we would rotate the token, but the threat model is low, as nothing is possible other than writing to `/tmp/main.go` through this server. The worst case scenario if the token is compromised is a website writes self-replicating, malicious code to `tmp/main.go`, but that should not matter: the intent is to inspect `tmp/main.go` before each execution, as boot.dev is an educational website; although either the token being compromised, or a website maliciously acting upon this extension is highly unlikely.
