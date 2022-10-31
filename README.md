# microservices-ums
User management system microservices.

# Apllication URL.

    Development - https://dev-developers.byjusorders.com
    Staging     - https://staging-developers.byjusorders.com
    Production  - https://developers.byjusorders.com
    
### Features

Developer experience first:
- ✏️ Linter with [ESLint](https://eslint.org) with [Byjus-eslint-plugin](https://github.com/byjus-orders/byjus-eslint-plugin/packages/1286130) configuration.
- 🛠 Code Formatter with [Prettier](https://prettier.io).
- 🦊 Husky for Git Hooks.
- 🚫 Lint-staged for running linters on Git staged files.
- 🗂 VSCode configuration: Settings, and extension for ESLint, Prettier.
- ✔️ Commit message linter [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) using [@commitlint/cli](https://www.npmjs.com/package/@commitlint/cli).

### Philosophy

- Minimal code
- 🚀 Production-ready

### Requirements

- Node.js and npm
- Recemonded node version v14.15.4 

### Getting started

Run the following command on your local environment:

Clone the project and open in vscode
```
git clone https://github.com/byjus-orders/microservices-ums.git
cd microservices-ums
code .
```

If code command fails please setup the code command or you can open project in vscode manually.

##### Installing scoped packages

create the .npmrc file in both client and server and configure as below:

```
registry=https://registry.npmjs.org/
@byjus-orders:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=<XXXXXXXXXX>
```

##### Working with Client

In the project directory, you can run:
```
cd client
npm install
```

Then, you can run client locally in development mode:
```
npm run dev
```

The local server is now listening at http://localhost:80

##### Working with Server

In the project directory, you can run:
```
cd server
npm install
```

Then, you can run server locally in development mode:
```
npm run dev
```

The local server is now listening at http://localhost:3000

##### Run Gateway
In the project directory, you can run:
```
cd server
npm run gateway
```
See the section about [Gateway](https://github.com/byjus-orders/nucleus-gateway)

# addition/updation of env

* Please be noted that ecosystem.config.js and .env files should not be commited in server folder.
* If you want to add/update any new env, please contact DevOps team only.
* Please ensure that you do not commit by yourself any key names in GitHub.

### Production build.

You can build in production for the client with the following command:

In the project directory, you can run
```
cd client
npm install
npm run build
```

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### VSCode information (recommended)

If you are VSCode users, you can have a better integration with VSCode by installing the suggested extension in `.vscode/extension.json`. The starter code comes up with Settings for a seamless integration with VSCode.