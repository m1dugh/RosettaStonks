# Rosetta Stonks

## How to use

### Chrome based browsers

To use the extension in a chrome-based browser, you need to:
- download the file `rosettastonks-chrome.tar.gz` from the latest release on
  your machine.
- create a folder named `rosettastonks` somewhere on your machine to store the
  extension
- run the following command in the `rosettastonks` folder.
```bash
$ tar xvzf /path/to/rosettastonks-chrome.tar.gz
```

In your browser:
- go to `chrome://extensions`
- check the `Developer mode` toggle
- click `Load unpacked`
- Select your `rosettastonks` folder

### Firefox based browsers

- download the file `rosettastonks.xpi` from the latest release.
- go to `about:addons` in your browser
- click the settings button and go to `Debug addons`.
- click `Load Temporary Add-On`
- select the `rosettastonks.xpi` file in the file picker.

*Warning: This method only installs the extension temporarily, meaning that if
you close your browser, the addon will be uninstalled. This is due to firefox
policies not allowing unverified extensions to be used.*


## Building the application

### Building the worker

The worker can be packaged using the following command
```
$ deno task build:worker
```

Which creates the packaged file `/dist/worker.esm.js` which is the packaged
file for the worker.

### Building the frontend

The worker can be packaged using the following command
```
$ deno task build:front
```

Which creates the packaged file `/dist/frontend.esm.js` which is the packaged
file for the frontend.

## Packaging the extension

### Chrome

To package the extension for chrome, the following command can be ran:

```
$ make chrome
```

### Firefox

To package the extension for firefox, the following command can be ran:

```
$ make firefox
```

Which will produce `rosettastonks.xpi`, the file for the extension that can be
loaded in firefox.
