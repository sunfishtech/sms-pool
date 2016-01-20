'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Pipeline;

var _utils = require('./utils');

function Pipeline(pipelineSpec) {
  return (0, _utils.createPipeline)(pipelineSpec);
}
module.exports = exports['default'];