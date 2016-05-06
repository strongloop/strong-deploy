2016-05-06, Version 3.1.4
=========================

 * update copyright notices and license (Ryan Graham)


2016-04-11, Version 3.1.3
=========================

 * package: update to eslint@2 (Sam Roberts)

 * Refer to licenses with a link (Sam Roberts)


2015-10-01, Version 3.1.2
=========================



2015-10-01, Version 3.1.1
=========================

 * Use strongloop conventions for licensing (Sam Roberts)


2015-09-09, Version 3.1.0
=========================

 * docs: add SSH_PORT to usage message (Ryan Graham)

 * set ssh port when use http+ssh deploy via env (SemonCat)


2015-07-27, Version 3.0.0
=========================

 * sl-deploy API accept cluster size parameter (Setogit)


2015-06-03, Version 2.2.2
=========================

 * test: expose mesh model apiVersion, not version (Sam Roberts)

 * Bump mesh-models dependency version (Krishna Raman)


2015-05-15, Version 2.2.1
=========================

 * eslint: new doesn't need parentheses (Sam Roberts)

 * package: remove usage from README (Sam Roberts)

 * package: run linters in pretest (Sam Roberts)


2015-05-08, Version 2.2.0
=========================

 * use provided service name in error as fallback (Ryan Graham)

 * print real url in error messages (Ryan Graham)

 * Log name of service that was deployed to (Sam Roberts)

 * deploy: check remote API version compatibility (Sam Roberts)


2015-04-30, Version 2.0.0
=========================

 * Support multiapp pm in deploy APIs (Sam Roberts)

 * put-file: report error message from server (Setogit)

 * Add multi-service support (Krishna Raman)


2015-04-17, Version 1.2.0
=========================

 * usage: add default npm package to documentation (Setogit)

 * slc deploy, should in non-git, deploy the archive, if it exists (Setogit)

 * Update README for strong-pm.io (Sam Roberts)


2015-03-18, Version 1.1.6
=========================

 * fix error in error handler (Ryan Graham)

 * deps: update dev dependencies (Ryan Graham)

 * deps: fix bad version of strong-tunnel (Ryan Graham)

 * package: update lint for CI (Sam Roberts)

 * Add support for deploying using http over ssh (Ryan Graham)


2015-03-16, Version 1.1.5
=========================

 * cli: update usage text (Ryan Graham)

 * git: show git error message on failure (Ryan Graham)

 * local deploy: tune messaging on failure (Sam Roberts)

 * deploy: URL defaulting to http://localhost:8701 (Sam Roberts)

 * lint: support eslint and jscs (Sam Roberts)

 * Read responses, so request can complete (Sam Roberts)


2015-02-09, Version 1.1.4
=========================

 * deps: make async a regular dependency (Ryan Graham)

 * Give useful error message when auth is required (Ryan Graham)

 * docs: document implicit support for HTTP auth (Ryan Graham)

 * test: use strong-fork-cicada for tests (Ryan Graham)


2015-01-20, Version 1.1.3
=========================

 * tests: use os.tmpdir() instead of /tmp (Ryan Graham)


2015-01-09, Version 1.1.2
=========================

 * Fix wrong output for --version, --help, etc. (Sam Roberts)

 * Fix bad CLA URL in CONTRIBUTING.md (Ryan Graham)


2014-12-12, Version 1.1.1
=========================

 * Fix local deploy logic error (Sam Roberts)

 * package: use debug v2.x in all strongloop deps (Sam Roberts)


2014-12-01, Version 1.1.0
=========================

 * Support local in-place deployment (Sam Roberts)

 * Fix incorrect error reporting for put based deploy (Krishna Raman)

 * Fix test and noisy console output for git deploys (Krishna Raman)

 * Enable strong-deploy to be used as a module (Krishna Raman)


2014-10-02, Version 1.0.0
=========================

 * Update contribution guidelines (Ryan Graham)


2014-09-02, Version 0.1.4
=========================

 * package: mention slc in usage, and git package (Sam Roberts)

 * package: add keywords for npm search (Sam Roberts)


2014-08-26, Version 0.1.3
=========================

 * usage: clarify pack and branch meaning (Sam Roberts)

 * Remove --redeploy and make git always force push (Krishna Raman)

 * Add ability to deploy npm package (tarball) (Krishna Raman)

 * Add usage enhancements (Krishna Raman)


2014-08-05, Version 0.1.2
=========================

 * Update package license to match LICENSE.md (Sam Roberts)

 * package: add .gitignore file (Sam Roberts)


2014-07-21, Version 0.1.1
=========================

 * Fix silent exit when run from non git repo (Krishna Raman)


2014-07-21, Version 0.1.0
=========================

 * First release!
