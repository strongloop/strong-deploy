# strong-deploy

Deploy a node application package built using [strong-build](http://github.com/strongloop/strong-build) on a [StrongLoop process manager](http://github.com/strongloop/strong-pm).

## Usage

```
usage: sl-deploy [options] URL [PACK|BRANCH]

Deploy a node application to a StrongLoop process manager

Options:
  -h,--help          Print this message and exit.
  -v,--version       Print version and exit.
  -c,--config CFG    Deploy a specified configuration (default is "default").

Arguments:
  URL       The URL of the StrongLoop process manager
            eg: http://127.0.0.1:7777
  PACK      Deploy an NPM package/tarball.
  BRANCH    Deploy a git branch.

Default behaviour is to deploy the git branch "deploy".
```
