/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("trqfo2q97edvb8l")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ik7a7q6l",
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
  const collection = dao.findCollectionByNameOrId("trqfo2q97edvb8l")

  // remove
  collection.schema.removeField("ik7a7q6l")

  return dao.saveCollection(collection)
})
