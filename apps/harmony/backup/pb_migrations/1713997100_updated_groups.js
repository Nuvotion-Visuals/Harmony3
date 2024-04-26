/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xgqfanb0w77pmlt")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "9wu9lrbd",
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
  const collection = dao.findCollectionByNameOrId("xgqfanb0w77pmlt")

  // remove
  collection.schema.removeField("9wu9lrbd")

  return dao.saveCollection(collection)
})
