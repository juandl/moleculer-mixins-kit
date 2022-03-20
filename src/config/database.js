//Default params
module.exports = {
  mongoose: {
    db: {},
    model: {
      toJSON: { getters: true },
      timestamps: true,
    },
  },
};
