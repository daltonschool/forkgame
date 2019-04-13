# Fork Game

Fork game is a project to keep track of the standings of the fork game.

## Development Setup

1. Clone the repository. Run `npm i` to install dependences, then run `npm start`
> At this point, don't run `npm run dev`, because concurrently doesn't allow terminal input then.
2. Follow the instructions as prompted. Use a Dalton username and password to sign in.
3. Once setup is complete, press <kbd>ctrl</kbd> + <kbd>c</kbd> to terminate the process, then run `npm run dev` to start the development server
> The development server watches the static files for changes, while the production server does not.

## Production Setup
Setup the application how you normally would for a node.js production application. If you cannot enter text into the command line on the production server, you can upload the `storage.db` file from another computer.