import {EntityConstructor, PrimaryKey} from "./types";
import {Entity} from "../index";

class Table {
  private name: string;
  private entity: EntityConstructor;
  private primaryKey: PrimaryKey;

  constructor() {
    this.name = Reflect.getMetadata('name', this.constructor);
    this.entity = Reflect.getMetadata('entity', this.constructor);
    this.primaryKey = Reflect.getMetadata('primaryKey', this.constructor);

    if (!this.entity) {
      throw new Error(`${this.constructor.name} requires an Entity to be defined. See @Table in dynamorm/decorators`)
    }
  }

  static getName() {
    return Reflect.getMetadata('name', this);
  }

  getName() {
    return this.name;
  }

  getEntity<T>(instance = false): T {
    // @ts-ignore
    return instance ? new this.entity() : this.entity;
  }

  static getEntity(instance = false) {
    const Constructor =  Reflect.getMetadata('entity', this);
    return instance ? new Constructor() : Constructor;
  }


  public toAttributeDefinition() {
    const AttributeDefinitions = [];
    const entity = new this.entity();
    const attributes = entity.getAttributeDefinitions();
    let partitionKeySet = false;
    let sortKeySet = false;

    for (let AttributeName in attributes) {
      const isPartitionKey = AttributeName == this.primaryKey.pk;
      const isSortKey = AttributeName == this.primaryKey.sk;

      if (isPartitionKey || isSortKey) {
        if (isPartitionKey) partitionKeySet = true;
        if (isSortKey) sortKeySet = true;
        AttributeDefinitions.push({
          AttributeName,
          AttributeType: attributes[AttributeName].type
        })
      }
    }
    if (!partitionKeySet) {
      const message = 'Partition key not set on ' + this.constructor.name
      throw new Error(message);
    }
    if (this.primaryKey.sk && !sortKeySet) {
      const message = `Sort key is defined on ${this.constructor.name} but not found in any entities`
      throw new Error(message)
    }

    return AttributeDefinitions;
  }

  public toCreateCommandInput() {
    const AttributeDefinitions = this.toAttributeDefinition();
    const ProvisionedThroughput = {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    };
    const KeySchema = [{
      AttributeName: this.primaryKey.pk,
      KeyType: 'HASH'
    }];

    if (this.primaryKey.sk) {
      KeySchema.push({
        AttributeName: this.primaryKey.sk,
        KeyType: 'RANGE'
      })
    }

    return {
      TableName: this.name,
      AttributeDefinitions,
      KeySchema,
      ProvisionedThroughput
    }
  }

}
export default Table;
