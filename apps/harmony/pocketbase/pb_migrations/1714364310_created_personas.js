/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "l8m52adj295vhlc",
    "created": "2024-04-29 04:18:30.689Z",
    "updated": "2024-04-29 04:18:30.689Z",
    "name": "personas",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "iaesr0oc",
        "name": "name",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "2q5wlssi",
        "name": "description",
        "type": "editor",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "convertUrls": false
        }
      },
      {
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
      },
      {
        "system": false,
        "id": "8myyggyp",
        "name": "model",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "wjo0ztyn",
        "name": "avatar",
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
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("l8m52adj295vhlc");

  return dao.deleteCollection(collection);
})
