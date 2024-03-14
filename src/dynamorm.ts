import 'reflect-metadata';
import {CreateTableCommand, DynamoDBClient, ResourceInUseException} from "@aws-sdk/client-dynamodb";
import Model from "./model";
import {Entity} from "../index";
import Table from "./table";
import {EntityConstructor, ModelConstructor, TableConstructor} from "./types";

/**
 * @todo throw error if tables or client is undefined
 */
export class DynamoRM {
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

  private tableToModel(table: TableConstructor): Model {
    const attributes = table.getEntity(true).getAttributeDefinitions();
    class DynamicModel extends Model {
      protected attributes = attributes
    };
    Reflect.defineMetadata('table', table, DynamicModel);
    Object.assign(DynamicModel.prototype, Entity);
    return new DynamicModel(this.client);
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
        const entityConstructor: EntityConstructor = table.getEntity();
        if (entityConstructor.name == modelName) {
          model = this.tableToModel(table);
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
