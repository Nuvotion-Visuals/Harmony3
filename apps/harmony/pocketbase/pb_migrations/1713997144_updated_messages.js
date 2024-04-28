/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("v7fbyy7ujkinph3")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "lvz0rbpg",
    "name": "threadid",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "trqfo2q97edvb8l",
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
  collection.schema.removeField("lvz0rbpg")

  return dao.saveCollection(collection)
})
