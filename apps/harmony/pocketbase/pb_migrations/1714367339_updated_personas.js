/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("l8m52adj295vhlc")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ts9clt5f",
    "name": "systemmessage",
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
  const collection = dao.findCollectionByNameOrId("l8m52adj295vhlc")

  // remove
  collection.schema.removeField("ts9clt5f")

  return dao.saveCollection(collection)
})
