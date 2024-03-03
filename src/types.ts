import Entity from "./entity";
import Table from "./table";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import Model from "./model";

export type EntityConstructor = new() => Entity;

export type Entities = Record<string, EntityConstructor>
export interface EntityAttributes extends Record<string|symbol, any> {}

export type Attributes = Record<string, any>;

export type AttributeDefinition = {
  type: string,
  required?: boolean,
  value?: any,
};

export type AttributeDefinitions = {
  [key: string]: AttributeDefinition
}

export const AttributeRequired = true;

export enum AttributeType {
  String = 'S',
  Number = 'N',
  Binary = 'B',
  Boolean = 'BB',
  Null = 'NULL',
  Map = 'M',
  List  = 'L',
  StringSet = 'SS',
  NumberSet = 'NS',
  BinarySet = 'BS',
}

export type KeyInput = {
  AttributeName: string,
  AttributeType: string
}

export type PrimaryKeyDefinition = {
  pk: KeyInput,
  sk: KeyInput
}

export type PrimaryKey = {
  pk: string,
  sk?: string,
}

export type TableConstructor = {
  new () : Table,
  getName(): string,
  getEntity(instance?: boolean): any
}

export type TableOptions = {
  name: string,
  primaryKey: PrimaryKey
  autoCreate?: boolean,
  entity: Record<string, any>
}

export type ModelConstructor = {
  new(client: DynamoDBClient): Model,
}

export type ModelOptions = {
  table: TableConstructor
}

export type DynamoRM = {

}
export type DynamoRMOptions = {
  tables: Array<any>,
  client: DynamoDBClient,
  models?: Array<any>
}
