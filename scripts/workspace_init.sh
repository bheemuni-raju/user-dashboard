#!/bin/bash

if [[ $(uname -s) == MINGW* ]]
then
  cd .. && husky install .husky
  (echo \#!/bin/sh & echo '. "$(dirname "$0")/_/husky.sh"' & echo npx --no -- commitlint --edit $1) > .husky/commit-msg
  (echo \#!/bin/sh & echo '. "$(dirname "$0")/_/husky.sh"' & echo 'cd client && npm run lint' & echo 'cd ../server && npm run lint') > .husky/pre-commit
else
  cd .. && husky install .husky
  echo '. "$(dirname "$0")/_/husky.sh" \n\n npx --no -- commitlint --edit $1' > .husky/commit-msg && chmod +x .husky/commit-msg
  echo '. "$(dirname "$0")/_/husky.sh" \n\n cd client && npm run lint \n cd ../server && npm run lint' > .husky/pre-commit && chmod +x .husky/pre-commit
fi

#Install Extension manually if the code command fails
echo '---------Installing VsCode Extension'
{
  code --install-extension dbaeumer.vscode-eslint
  code --install-extension esbenp.prettier-vscode
  code --install-extension vivaxy.vscode-conventional-commits
}||{
  echo '---------Please install workspace recommended plugins or try again after `code` path setup'
}