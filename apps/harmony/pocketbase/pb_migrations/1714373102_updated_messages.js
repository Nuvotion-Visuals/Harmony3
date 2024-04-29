/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("v7fbyy7ujkinph3")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "mx0ojg9l",
    "name": "system",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("v7fbyy7ujkinph3")

  // remove
  collection.schema.removeField("mx0ojg9l")

  return dao.saveCollection(collection)
})
