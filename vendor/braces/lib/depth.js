'use strict';

// Local mitigation for GHSA-vfj7-8cjw-p6xm. This hard ceiling cannot be
// disabled by caller options; count semantic containers, not literal braces.
module.exports = depth => {
  if (depth > 128) throw new SyntaxError('Maximum nesting depth (128) exceeded');
};
