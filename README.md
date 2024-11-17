# Rosetta Stonks

## How to use

### Chrome based browsers


1. Using github release

To use the extension in a chrome-based browser, you need to:
- download the file `rosettastonks-chrome.tar.gz` from the latest release on
  your machine.
- create a folder named `rosettastonks` somewhere on your machine to store the
  extension
- run the following command in the `rosettastonks` folder.
```bash
$ tar xvzf /path/to/rosettastonks-chrome.tar.gz
```

2. Using nix package manager

Instead of the previous commands, if you are on a nix system **supporting
flakes**, you can run the following commands, which will give your the path to
the `rosettastonks` folder (named `rosettastonks-chrome`)

```bash
$ nix build --out-link "" --print-out-paths github:m1dugh/RosettaStonks#chrome
```

**This part if for all users indepently of whether you are using github method
or nix method.**

In your browser:
- go to `chrome://extensions`
- check the `Developer mode` toggle
- click `Load unpacked`
- Select your `rosettastonks` folder

### Firefox based browsers

- download the file `rosettastonks.xpi` from the latest release.
- alternatively, if using nix package manager with flake support, your can run
  the following command.
```bash
$ nix build --out-link "" --print-out-paths github:m1dugh/RosettaStonks#mozilla
```
- go to `about:addons` in your browser
- click the settings button and go to `Debug addons`.
- click `Load Temporary Add-On`
- select the `rosettastonks.xpi` file in the file picker, or the path the nix
  command gave you.

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
