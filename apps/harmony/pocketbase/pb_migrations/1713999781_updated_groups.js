/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("xgqfanb0w77pmlt")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "bvvmabbg",
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
  const collection = dao.findCollectionByNameOrId("xgqfanb0w77pmlt")

  // remove
  collection.schema.removeField("bvvmabbg")

  return dao.saveCollection(collection)
})
