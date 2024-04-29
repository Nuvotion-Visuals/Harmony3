/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("v7fbyy7ujkinph3")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ugyc2j0k",
    "name": "personaid",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "l8m52adj295vhlc",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("v7fbyy7ujkinph3")

  // remove
  collection.schema.removeField("ugyc2j0k")

  return dao.saveCollection(collection)
})
