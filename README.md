# strong-deploy

Deploy a node application package to a
[StrongLoop process manager](http://github.com/strongloop/strong-pm).

Both git branches and npm packages can be deployed. They will typically be
prepared using [strong-build](http://github.com/strongloop/strong-build).


## Usage

```
usage: sl-deploy [options] [URL [PACK|BRANCH]]

Deploy a node application to a StrongLoop process manager

Options:
  -h,--help          Print this message and exit.
  -v,--version       Print version and exit.
  -c,--config CFG    Deploy a specified configuration (default is "default").

Arguments:
  URL: The URL of the StrongLoop process manager.

    Defaults to `http://localhost:8701`. If a URL is provided, both the host
    and port is optional, they default to `localhost` and 8701, respectively.
    If the server requires authentication, the credentials must be part of the
    URL, see examples.

  PACK: Deploy an NPM package/tarball.

  BRANCH: Deploy a git branch.

Default behaviour is to deploy the git branch "deploy" to
`http://localhost:8701`.

Note that if PACK or BRANCH is specified, URL *must* be specified as well.

Examples:

Deploy 'deploy' branch to localhost:

    sl-deploy

Deploy 'deploy' branch to a remote host:

    sl-deploy http://prod1.example.com

Deploy to a remote host, on a non-standard port, using authentication:

    sl-deploy http://user:pass@prod1.example.com:8765

Deploy 'production' branch to localhost:

    sl-deploy http://localhost production
```
