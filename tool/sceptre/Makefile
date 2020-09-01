# Sceptre Makefile

REPOSITORIES := https://github.com/bilardi/sceptre-git-clone-hook https://github.com/bilardi/sceptre-zip-code-s3
PLUGINS := hooks resolvers
VERSION := 2.3.0

.PHONY: help # print this help list
help:
	grep PHONY Makefile | sed 's/.PHONY: /make /' | grep -v grep

.PHONY: plugins # download plugins
plugins:
	for repository in $(REPOSITORIES); do dir=$$(basename $$repository); rm -rf $$dir; git clone $$repository; cd $$dir; make plugin TARGET=../; if [ $$? -ne 0 ]; then make plugins TARGET=../; fi; cd -; rm -rf $$dir; done

.PHONY: patch # add patch
patch: plugins
	patch hooks/s3_package/s3_package.py < s3_package.patch

.PHONY: compile # compile plugins
compile: patch
	for plugin in $(PLUGINS); do for dir in ./$$plugin/*; do (cd "$$dir" && pip install .); done; done

.PHONY: install # install requirements
install: compile
	pip install sceptre==$(VERSION)
