/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("rxgmouxoji9qajr")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "tbwa1qe1",
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
  const collection = dao.findCollectionByNameOrId("rxgmouxoji9qajr")

  // remove
  collection.schema.removeField("tbwa1qe1")

  return dao.saveCollection(collection)
})
