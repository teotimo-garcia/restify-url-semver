'use strict';

var restify = require('restify'),
    semver = require('semver');

module.exports = function (options) {
  options = options || {};

  options.prefix = options.prefix || '';
  options.blacklist = options.blacklist || [];

  return function (req, res, next) {

    options.blacklist.forEach(function(item){
        if(item === req.url) {
          return next();
        }
    });

    req.originalUrl = req.url;
    req.url = req.url.replace(options.prefix, '');

    var pieces = req.url.replace(/^\/+/, '').split('/');
    var version = pieces[0];

    version = version.replace(/v(\d{1})\.(\d{1})\.(\d{1})/, '$1.$2.$3');
    version = version.replace(/v(\d{1})\.(\d{1})/, '$1.$2.0');
    version = version.replace(/v(\d{1})/, '$1.0.0');

    if (semver.valid(version)) {
      req.url = req.url.replace(pieces[0], '');
      req.headers = req.headers || [];
      req.headers['accept-version'] = version;
    } else {
      return next(new restify.InvalidVersionError('This is an invalid version'));
    }

    next();
  };
};
