.DEFAULT_GOAL := help

define THREADSCAPE
---------------------------------
╔╦╗┬ ┬┬─┐┌─┐┌─┐┌┬┐╔═╗┌─┐┌─┐┌─┐┌─┐
 ║ ├─┤├┬┘├┤ ├─┤ ││╚═╗│  ├─┤├─┘├┤ 
 ╩ ┴ ┴┴└─└─┘┴ ┴─┴┘╚═╝└─┘┴ ┴┴  └─┘
---------------------------------
endef
export THREADSCAPE

help: ## Shows this message.
	@echo "$$THREADSCAPE"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

server: ## Runs an HTTP Server to host ThreadScape locally.
	http-server -c-1

setup: ## Installs dependencies for ThreadScape.
	npm install -g http-server
