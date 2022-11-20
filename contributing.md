<!-- @format -->

# Get started with the development

Great that you want to contribute! Nice to have you onboard. 🚀 To get started, follow this contributing guideline to set up the project and work with us!

## Necessary software & tools

The following tools and softwares are necessary to develop this application:

| name    | version             | link                                        |
| ------- | ------------------- | ------------------------------------------- |
| Node.js | ^18.x (recommended) | [Node.js v18](https://nodejs.org/en/)       |
| yarn    | ^1.22.x             | [yarn](https://yarnpkg.com/getting-started) |

After installing the necessary tools, you can run the commands below to start developing.

## Development - Setting Up The Repository

-   clone the repository by running `git clone https://github.com/IamSebastianDev/flotsam.git .` in your terminal or shell to clone the repo into the current directory.
-   run `yarn` or `yarn install` to install the dependencies.
-   run `yarn setup`. This will install the necessary husky scripts.

## Development - CLI Commands

-   `yarn preci`: Removes all files inside the node_modules folder. Is part of the repository setup.
-   `yarn ci`: Installs all dependencies without generating a lockfile and throws and error if an update is needed.
-   `yarn setup`: Installs husky and the hooks
-   `yarn build`: Builds the library
-   `yarn dev`: Build the library in watch mode

## Development - Enforcing Code Standards

This project uses multiple tools to enforce code quality:

### Conventional commits

The project uses [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) to ensure a certain commit message style.

-   `feat`: Used when adding features to the application.
-   `fix`: Used when fixing a bug or issue.
-   `refactor`: Used when changing or improving code that is not a new feature or bug.
-   `chore`: Used when updating non application related code.

### Formatting

The project uses prettier to format the code to conform to a certain style. Formatting is enforced using [pretty-quick](https://www.npmjs.com/package/pretty-quick) as a pre-commit hook.

## Development - Git Structure

To develop a feature, checkout a new Branch from `development` and prefix it with the correct branch type. The project currently differentiates between two branch types, `feature` and `bugfix`. For example, a branch to fix a bug would be created like this:

```bash
$ git checkout development
# checkout development as basis for development
$ git checkout -b bugfix/bug-to-fix
# creates a new branch with the correct branch type prefixed
```

## Development - Github Actions

-   Publish: A automatic action that is triggered when merging into `main`. Will create a new Release and publish it to npm.
