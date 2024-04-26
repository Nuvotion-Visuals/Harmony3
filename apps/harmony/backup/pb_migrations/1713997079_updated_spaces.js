/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("rxgmouxoji9qajr")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "9jowirue",
    "name": "description",
    "type": "editor",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "convertUrls": false
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("rxgmouxoji9qajr")

  // remove
  collection.schema.removeField("9jowirue")

  return dao.saveCollection(collection)
})
