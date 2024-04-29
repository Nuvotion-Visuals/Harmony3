/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("l8m52adj295vhlc")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "e2jp8yk9",
    "name": "userid",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "_pb_users_auth_",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("l8m52adj295vhlc")

  // remove
  collection.schema.removeField("e2jp8yk9")

  return dao.saveCollection(collection)
})
