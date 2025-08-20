module.exports = {
  forbidden: [
    {
      name: 'hexagon-no-adapters',
      severity: 'error',
      comment: 'The hexagon layer should not import from adapters',
      from: {
        path: '^src/main/hexagon'
      },
      to: {
        path: '^src/main/adapters'
      }
    }
  ],
  options: {
    doNotFollow: {
      path: 'node_modules'
    },
    includeOnly: '^src/main'
  }
}
