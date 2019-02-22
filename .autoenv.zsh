ROOT=$(dirname $0)
autostash PATH=$ROOT/node_modules/.bin:$PATH
nvm use `cat $ROOT/.nvmrc`
