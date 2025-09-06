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
    },
    {
      name: 'outbound-no-inbound',
      severity: 'error',
      comment: 'Outbound adapters should not import from inbound adapters',
      from: {
        path: '^src/main/adapters/outbound'
      },
      to: {
        path: '^src/main/adapters/inbound'
      }
    },
    {
      name: 'inbound-no-outbound',
      severity: 'error',
      comment: 'Inbound adapters should not import from outbound adapters',
      from: {
        path: '^src/main/adapters/inbound'
      },
      to: {
        path: '^src/main/adapters/outbound'
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
