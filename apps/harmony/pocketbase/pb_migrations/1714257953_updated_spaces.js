/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("rxgmouxoji9qajr")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "cbragekj",
    "name": "banner",
    "type": "email",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "exceptDomains": null,
      "onlyDomains": null
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "sf7a9giq",
    "name": "icon",
    "type": "file",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "mimeTypes": [],
      "thumbs": [],
      "maxSelect": 1,
      "maxSize": 5242880,
      "protected": false
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("rxgmouxoji9qajr")

  // remove
  collection.schema.removeField("cbragekj")

  // remove
  collection.schema.removeField("sf7a9giq")

  return dao.saveCollection(collection)
})
