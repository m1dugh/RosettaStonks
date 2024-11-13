# Rosetta Stonks


## Building the application

### Building the worker

The worker can be packaged using the following command
```
$ deno run --allow-all scripts/package.json worker
```

Which creates the packaged file `/dist/worker.esm.js` which is the packaged
file for the worker.

### Building the frontend

The worker can be packaged using the following command
```
$ deno run --allow-all scripts/package.json front
```

Which creates the packaged file `/dist/bundle.esm.js` which is the packaged
file for the frontend.
