DENO=deno

.PHONY: chrome frontend worker mozilla

all: mozilla

mozilla: rosettastonks.xpi

rosettastonks.xpi: frontend worker static/* ./mozilla/manifest.json
	cp ./mozilla/manifest.json .
	zip -FS -r $@ manifest.json dist/ static/


chrome: front worker ./chrome/manifest.json
	cp ./chrome/manifest.json .

frontend: ./dist/frontend.esm.js
worker: ./dist/worker.esm.js

./dist/frontend.esm.js: src/frontend/* src/lib/*
	$(DENO) task build:frontend

./dist/worker.esm.js: src/worker/* src/lib/*
	$(DENO) task build:worker

clean:
	$(RM) -r dist manifest.json rosettastonks.xpi
