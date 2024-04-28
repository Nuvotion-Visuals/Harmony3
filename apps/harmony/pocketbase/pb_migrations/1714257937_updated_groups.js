/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xgqfanb0w77pmlt")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "eyy9va2r",
    "name": "banner",
    "type": "file",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "mimeTypes": [],
      "thumbs": [],
      "maxSelect": 1,
      "maxSize": 5242880,
      "protected": false
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xgqfanb0w77pmlt")

  // remove
  collection.schema.removeField("eyy9va2r")

  return dao.saveCollection(collection)
})
