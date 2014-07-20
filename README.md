# strong-deploy

Deploy a node application package built using [strong-build](http://github.com/strongloop/strong-build) on a [StrongLoop process manager](http://github.com/strongloop/strong-pm).

## Usage

```
usage: sl-deploy [options] URL

Deploy a node application to a StrongLoop process manager

Options:
  -h,--help       Print this message and exit.
  -v,--version    Print version and exit.

Git specific options:
  --branch BRANCH    Deploy a specified branch.
                     (default: current branch)

Arguments:
  URL    The URL of the StrongLoop process manager
```
