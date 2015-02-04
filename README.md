# strong-deploy

Deploy a node application package to a
[StrongLoop process manager](http://github.com/strongloop/strong-pm).

Both git branches and npm packages can be deployed. They will typically be
prepared using [strong-build](http://github.com/strongloop/strong-build).


## Usage

```
usage: slc deploy [options] URL [PACK|BRANCH]
usage: sl-deploy [options] URL [PACK|BRANCH]

Deploy a node application to a StrongLoop process manager

Options:
  -h,--help          Print this message and exit.
  -v,--version       Print version and exit.
  -c,--config CFG    Deploy a specified configuration (default is "default").

Arguments:
  URL       The URL of the StrongLoop process manager, eg: http://127.0.0.1:7777
            If the server requires authentication, the credentials must be part
            of the URL, eg: http://user:pass@127.0.0.1:7777
  PACK      Deploy an NPM package/tarball.
  BRANCH    Deploy a git branch.

Default behaviour is to deploy the git branch "deploy".
```
