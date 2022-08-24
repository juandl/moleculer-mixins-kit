//Default params
module.exports = {
  mongoose: {
    db: {}, //Database settings
    url: {}, // connection url
    model: {
      toJSON: { getters: true },
      timestamps: true,
    },
  },
  sequalize: {
    url: null,
    sequalize: {},
    model: {},
  },
};
