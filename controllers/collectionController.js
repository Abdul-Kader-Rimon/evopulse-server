const mongoose = require("mongoose");

const resolveCollectionName = async (
  db,
  requestedCollection,
  defaultCollection,
  fallbackAliases = []
) => {
  const allCollections = await db.listCollections({}, { nameOnly: true }).toArray();
  const collectionNames = allCollections.map((item) => item.name);
  const lowerCaseNameMap = new Map(
    collectionNames.map((name) => [name.toLowerCase(), name])
  );

  const candidates = [requestedCollection, defaultCollection, ...fallbackAliases].filter(Boolean);
  const exactMatch = candidates.find((name) => collectionNames.includes(name));

  if (exactMatch) {
    return { targetCollection: exactMatch, collectionNames };
  }

  const caseInsensitiveMatch = candidates
    .map((name) => lowerCaseNameMap.get(String(name).toLowerCase()))
    .find(Boolean);

  return {
    targetCollection: caseInsensitiveMatch || requestedCollection || defaultCollection,
    collectionNames
  };
};

const createCollectionReader = ({
  defaultCollection,
  fallbackAliases = [],
  sanitize = (docs) => docs
}) => {
  return async (req, res) => {
    try {
      if (!mongoose.connection.db) {
        return res.status(503).json({
          success: false,
          message: "Database is not connected yet."
        });
      }

      const db = mongoose.connection.db;
      const debugEnabled = req.query.debug === "1" || req.query.debug === "true";
      const requestedCollection = req.query.collection;

      const { targetCollection, collectionNames } = await resolveCollectionName(
        db,
        requestedCollection,
        defaultCollection,
        fallbackAliases
      );

      const rawData = await db.collection(targetCollection).find({}).toArray();
      const data = sanitize(rawData);

      const payload = {
        success: true,
        count: data.length,
        data
      };

      if (debugEnabled) {
        payload.meta = {
          dbName: db.databaseName || mongoose.connection.name,
          requestedCollection: requestedCollection || defaultCollection,
          targetCollection,
          availableCollections: collectionNames
        };
      }

      return res.status(200).json(payload);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
};

module.exports = {
  createCollectionReader
};
