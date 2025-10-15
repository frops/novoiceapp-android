const NativeModules = {
  Linking: {
    openURL: jest.fn()
  },
  NativeUnimoduleProxy: {
    viewManagersMetadata: {},
    modulesConstants: {
      mockDefinition: {
        ExponentConstants: {
          experienceUrl: { mock: '' }
        }
      }
    }
  },
  UIManager: {}
};

module.exports = NativeModules;
module.exports.default = NativeModules;
