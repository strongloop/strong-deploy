# strong-deploy

Deploy a node application package built using [strong-build](http://github.com/strongloop/strong-build) on a [StrongLoop process manager](http://github.com/strongloop/strong-pm).

## Usage

```
usage: sl-deploy [options] URL [BRANCH]

Deploy a node application to a StrongLoop process manager

Options:
  -h,--help          Print this message and exit.
  -v,--version       Print version and exit.
  -c,--config CFG    Deploy a specified configuration.
                     (default: default)
  -r,--redeploy      Redeploy branch, even if has been deployed before.

Arguments:
  URL       The URL of the StrongLoop process manager
            eg: http://127.0.0.1:7777
  BRANCH    Deploy a specified branch.
            (default: deploy)
```
