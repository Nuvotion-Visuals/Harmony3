/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("l8m52adj295vhlc")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "kij8xemh",
    "name": "provider",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("l8m52adj295vhlc")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "kij8xemh",
    "name": "provider",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": "^(openai|groq|ollama)$"
    }
  }))

  return dao.saveCollection(collection)
})
