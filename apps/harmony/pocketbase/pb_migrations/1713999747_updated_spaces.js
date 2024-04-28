/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("rxgmouxoji9qajr")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "sc2ovrst",
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
  const collection = dao.findCollectionByNameOrId("rxgmouxoji9qajr")

  // remove
  collection.schema.removeField("sc2ovrst")

  return dao.saveCollection(collection)
})
