import 'reflect-metadata';
import {CreateTableCommand, DynamoDBClient, ResourceInUseException} from "@aws-sdk/client-dynamodb";
import Model from "./model";
import {Entity} from "../index";
import Table from "./table";
import {EntityConstructor, ModelConstructor, TableConstructor} from "./types";

/**
 * @todo throw error if tables or client is undefined
 */
class DynamoRM {
  private readonly tables: Array<any>;
  private readonly models: Array<any>
  private readonly client: DynamoDBClient;

  constructor(DB: Function) {
    this.tables = Reflect.getMetadata('tables', DB)
    this.models = Reflect.getMetadata('models', DB)
    this.client = Reflect.getMetadata('client', DB);
    if (!this.tables || !this.client) {
      throw new Error('A dynamodb client and tables are required')
    }
  }

  getTables() {
    return this.tables;
  }

  getTable(tableName: string): TableConstructor {
    for (let table of this.tables) {
      if (tableName === table.name) {
        return table;
      }
    }
  }

  public async createTables() {
    const results = [];
    for ( let Constructor of this.tables ) {
      const table = new Constructor(this.client);
      const result = await table.create(Constructor)
      results.push(result);
    }
    return results;
  }

  getModels(): Array<ModelConstructor> {
    return this.models;
  }

  getModel(modelName: string): ModelConstructor {
    for (let model of this.models) {
       if (modelName == model.name) {
         return model;
       }
    }
  }

  private entityToModel(Constructor: EntityConstructor): Model {
    const attributeDefinitions = Reflect.getMetadata('attributes', Constructor.prototype);
    const reducer = (attributes: Record<string, any>, attribute: string) => {
      attributes = {...attributes, [attribute]: undefined}
      return attributes;
    }
    const attributes = Object.keys(attributeDefinitions).reduce(reducer, {})
    class EntityModel extends Model {
      protected entity: EntityConstructor = Constructor;
      protected attributes = attributes
    };
    Object.assign(EntityModel.prototype, Entity);
    return new EntityModel(this.client);
  }

  /**
   * @description Gets instance of model
   * @param modelName
   * @param attributes
   */
  model(modelName: string, attributes?:Record<string, any>):Model {
    let Constructor:ModelConstructor = this.getModel(modelName);
    let model:Model;

    if (Constructor) {
      model = new Constructor(this.client);
    } else {
      for (let table of this.tables) {
        const EntityConstructor = table.getEntity();
        if (EntityConstructor.name == modelName) {
          model = this.entityToModel(EntityConstructor);
          break;
        }
      }
    }
    if (!model) return;
    if (attributes) {
      model.fill(attributes);
    }

    return model;
  }
}

export const create = (App: Function) => {
  return new DynamoRM(App);
}

export default {
  create
}
