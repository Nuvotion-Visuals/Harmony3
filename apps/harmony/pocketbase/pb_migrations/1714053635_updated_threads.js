/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("trqfo2q97edvb8l")

  // remove
  collection.schema.removeField("nfsh3ds1")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "w2go3x9l",
    "name": "channelid",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "qbmbq6zsrh3wcbt",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("trqfo2q97edvb8l")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "nfsh3ds1",
    "name": "groupid",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "xgqfanb0w77pmlt",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  // remove
  collection.schema.removeField("w2go3x9l")

  return dao.saveCollection(collection)
})
