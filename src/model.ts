import {Attributes, AttributeType, EntityConstructor, TableConstructor} from "./types";
import {Entity, Table} from "../index";
import {DynamoDBClient, PutItemCommand, PutItemCommandInput} from "@aws-sdk/client-dynamodb";

class Model {
  public name: string;
  protected attributes: Array<string> | Attributes = {};
  protected entities: Array<EntityConstructor> = [];

  constructor(
    private tables: Array<TableConstructor>,
    private client: DynamoDBClient) {

  }
  public fill(attribute: Attributes | string, value?:any) {
    switch (typeof attribute) {
      case 'string':
        this.set(attribute, value);
        break;
      case 'object':
        for (let attr in attribute) {
          this.set(attr, attribute[attr]);
        }
        break;
    }
  }

  /**
   * @description If this.attributes are initialized as Array<string>, init will make it an object setting each string
   * value as the key and setting the value to undefined
   */
  public init() {
    if (this.attributes instanceof Array) {
      const reducer = (attributes, attribute ) => {
        attributes[attribute] = undefined;
        return attributes;
      }
      this.attributes = this.attributes.reduce(reducer, {});
    }
  }

  /**
   * @description Sets named attribute value
   * @param attributeName
   * @param value
   */
  public set(attributeName: string, value: any) {
    if (this.attributes.hasOwnProperty(attributeName)) {
      this.attributes[attributeName] = value;
    }
  }

  /**
   * @description Sets named attribute value. If attribute not set and defaultValue is not provided an error is thrown
   * @param attributeName
   */
  public get(attributeName) {
    if (this.attributes.hasOwnProperty(attributeName)) {
      return this.attributes[attributeName];
    }
    throw new Error(`Attribute not found: ${attributeName}`)
  }

  public getAttributes() {
    return this.attributes;
  }

  public getEntities() {
    return this.entities;
  }

  public save() {
    const inputs = this.toPutItemCommandInput();
    for (let input of Object.values(inputs)) {
      const command = new PutItemCommand(<PutItemCommandInput>input);

    }
  }
  public toPutItemCommandInput() {
    const inputs = {};
    for (let attributeName in this.attributes) {
      const table = this.getTableByAttribute(attributeName);
      const TableName = table.getName();
      if (!inputs.hasOwnProperty(TableName)) {
        inputs[TableName] = {
          TableName,
          Item: {},
        };
      }
      const entity = table.getEntity(true);
      const attributeDefinitions = Reflect.getMetadata('attributes', entity);
      if (attributeDefinitions.hasOwnProperty(attributeName)) {
        const { type } = attributeDefinitions[attributeName];
        const dynamoType = this.toDynamoType(type);
        inputs[TableName].Item[attributeName] = {
          [dynamoType]: this.attributes[attributeName]
        }
      }
    }
    return inputs;
  }

  private toDynamoType(type) {
    const typeMap = {
      [ AttributeType.String ]    : 'S',
      [ AttributeType.Number ]    : 'N',
      [ AttributeType.Boolean ]   : 'BOOL',
      [ AttributeType.List ]      : 'L',
      [ AttributeType.Map ]       : 'M',
      [ AttributeType.Binary ]    : 'B',
      [ AttributeType.Null ]      : 'NULL',
      [ AttributeType.StringSet ] : 'SS',
      [ AttributeType.NumberSet ] : 'NS',
      [ AttributeType.BinarySet ] : 'BS',
    };
    return typeMap[type];
  }

  private getTableByAttribute(attributeName: string) {
    let _table: Table;
    for (let table of this.tables) {
      const entity: Entity = table.getEntity(true);
      const attributeDefinitions = entity.getAttributeDefinitions();
      if (attributeDefinitions.hasOwnProperty(attributeName)) {
        _table = new table();
      }
    }
    return _table;
  }
}

export default Model
