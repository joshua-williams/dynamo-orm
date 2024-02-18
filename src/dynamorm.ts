import 'reflect-metadata';
import Table from "./table";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import Model from "./model";
/**
 * @todo throw error if tables or client is undefined
 */
class DynamoRM {
  private readonly tables: Array<any>;
  private readonly models: Array<any>
  private readonly client: DynamoDBClient;

  constructor(App) {
    this.tables = Reflect.getMetadata('tables', App)
    this.models = Reflect.getMetadata('models', App)
    this.client = Reflect.getMetadata('client', App);
    if (!this.tables || !this.client) {
      throw new Error('A dynamodb client and tables are required')
    }
  }

  getTables() {
    return this.tables;
  }

  getTable(tableName) {
    for (let table of this.tables) {
      if (tableName === table.name) {
        return table;
      }
    }
  }

  getModels(): Array<Model> {
    return this.models;
  }

  getModel(modelName) {
    for (let model of this.models) {
       if (modelName == model.name) {
         return model;
       }
    }
  }

  model(modelName, attributes?:Record<string, any>):Model {
    let model = this.getModel(modelName);
    if (model) {
      const m = new model();
      m.init();
      if (attributes) {
        m.fill(attributes);
      }
      return m;
    }
    for (let table of this.tables) {
      const entities = table.getEntities();
      if (entities[modelName]) {
        const Entity = entities[modelName];
        const attributeDefinitions = Reflect.getMetadata('attributes', Entity.prototype);
        const reducer = (attributes, attribute) => {
          attributes = {...attributes, [attribute]: undefined}
          return attributes;
        }
        const attributes = Object.keys(attributeDefinitions).reduce(reducer, {})
        const EntityModel = class extends Model {
          protected attributes = attributes
        };
        Object.assign(EntityModel.prototype, Entity);
        const model = new EntityModel();
        model.init();
        if (attributes) {
          model.fill(attributes);
        }
        return model;
      }
    }
  }
}

export const create = (App) => {
  return new DynamoRM(App);
}

export default {
  create
}
