# Contributing

This project is a side-project that I do on my spare time and I might not keep
on maintaining when I no longer have use of it. Henceforth, you are more than
encouraged to participate in the project to make _your_ rosetta stone go
stonks.

## Overview

This project is built using [deno](https://deno.com/), and the build process is
managed via `make` as a way to combine multiple commands.

All the scripts are packaged via the `scripts/package.ts` deno script to
produce the outputs for both the `workers` and the `frontend` parts.

You are more than encouraged to read the content of this script and the
Makefile to have a better understanding of how the project is built.

## Compatility

This addon uses the [manifest version 3](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3)
for both `firefox` and `chrome` based browsers, with some twists since
`firefox` does not entirely support a few features (You can take a look at both
manifests at `mozilla/manifest.json` and `chrome/manifest.json`).

In order to make the extension run in chrome, all occurences of `browser` must
be replaced by `chrome` in the code. This step is ensured by the `make chrome`
recipe.

## Writing code

You are free to open issues and PRs to enhance the code/report some errors.
