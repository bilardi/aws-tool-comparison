# Sample Makefile

.PHONY: help # print this help list
help:
	grep PHONY Makefile | sed 's/.PHONY: /make /' | grep -v grep

.PHONY: clean # remove packaging files
clean:
	rm -rf dist node_modules cdk.out

.PHONY: install # install packages from npm
install: clean
	bash build.sh

.PHONY: test # run unit tests
test: install
	npm run build; npm run test

.PHONY: ltest # run linting using ESLint
ltest: test
	npm run lint
