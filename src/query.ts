import {DynamormIoC, TableConstructor} from './types';
import {QueryException} from './exceptions';
import * as validate from './validate';
import Entity from './entity';
import Model from './model'
import {ExecuteStatementCommand, ExecuteStatementCommandInput} from '@aws-sdk/client-dynamodb';

type ComparisonOperator = '='|'<>'|'!='|'>'|'<'|'>='|'<=';
type LogicalOperator = 'and'|'between'|'in'|'is'|'not'|'or';

class QueryOperator {
  constructor(public operator: ComparisonOperator | LogicalOperator) {}
  toString() {
    return this.operator;
  }
}

class QueryCondition {
  constructor(
    public attribute: string,
    public operator: QueryOperator,
    public value: any
  ) {}
}

type Query = {
  type: 'select'|'update'|'delete'|'insert',
  entity: Entity,
  table: TableConstructor
  statement: string,
  attributes: string[],
  conditions: Array< QueryCondition | QueryOperator> ,
}

export default class QueryBuilder {
  private query: Query = {
    type: undefined,
    entity: undefined,
    table: undefined,
    statement: undefined,
    attributes: [],
    conditions: []
  };

  constructor(private db: DynamormIoC) {}

  table(tableName: string) {
    this.query.table = this.db.getTable(tableName);
    if (!this.query.table) throw new QueryException(`Table not defined "${tableName}"`);
    this.query.entity = this.query.table.getEntity(true);
    return this;
  }

  select(...attributes) {
    this.query.type = 'select';
    attributes.forEach(attribute => {
      if (!this.query.entity.hasOwnProperty(attribute)) {
        throw new QueryException(`attribute "${attribute}" not defined in ${this.query.entity.constructor.name}`)
      }
      this.query.attributes.push(attribute);
    })
    return this;
  }

  where(attribute: string, operator:  ComparisonOperator, value: any) {
    if (!this.query.entity.hasOwnProperty(attribute)) {
      throw new QueryException(`attribute "${attribute}" not defined in ${this.query.entity.constructor.name}`)
    }
    const _operator = new QueryOperator(operator);
    const condition = new QueryCondition( attribute, _operator, value );
    this.query.conditions.push(condition);
    return this;
  }

  and(attribute: string, operator:  ComparisonOperator, value: any) {
    if (!this.query.conditions.length) throw new QueryException('"and()" must follow at least one "where()" call');
    this.query.conditions.push(new QueryOperator('and'))
    return this.where(attribute, operator, value);
  }

  or(attribute: string, operator:  ComparisonOperator, value: any) {
    if (!this.query.conditions.length) throw new QueryException('"or()" must follow at least one "where()" call');
    this.query.conditions.push(new QueryOperator('or'));
    return this.where(attribute, operator, value);

  }

  private attributesToModel(attributes): Model {
    const attributeDefinitions = this.query.entity.getAttributeDefinitions();
    for (let attributeName in attributeDefinitions) {
      const attributeDefinition = attributeDefinitions[attributeName];
      if (attributes.hasOwnProperty(attributeName)) {
        attributeDefinition.value = attributes[attributeName]
      }
    }
    class DynamicModel extends Model {
      protected attributes = attributeDefinitions;
    }
    Reflect.defineMetadata('table', this.query.table, DynamicModel);
    return new DynamicModel(this.db.getClient());
  }
  async first(): Promise<Model> {
    const collection = await this.get();
    if (collection.length) return collection[0];
  }

  async get(): Promise<Model[]> {
    const commandInput = this.toSelectStatementCommandInput();
    const command = new ExecuteStatementCommand(commandInput);
    let response;
    try {
      response = await this.db.getClient().send(command);
    } catch (e) {
      console.log(e)
    }

    const attributeDefinitions = this.query.entity.getAttributeDefinitions();

    return response.Items.reduce((collection: Model[], item: any) => {
      const attributes = {};

      for (let attributeName in attributeDefinitions) {
        const attributeDefinition = attributeDefinitions[attributeName];
        if (item.hasOwnProperty(attributeName)) {
          const type = attributeDefinition.type;
          attributes[attributeName] = item[attributeName][type];
        } else {
          attributes[attributeName] = attributeDefinition.value;
        }
      }

      collection.push(this.attributesToModel(attributes));
      return collection;
    }, []);
  }

  private toSelectStatementCommandInput(): ExecuteStatementCommandInput {
    let Statement = 'SELECT';
    if (!this.query.table) {
      throw new QueryException('table name must be set in select query. use query.table(tableName) before query.fetch')
    }
    const attributes = this.query.attributes.length ? this.query.attributes.join(', ') : '*'
    Statement += ` ${attributes} FROM ${this.query.table.getName()} `
    if (this.query.conditions.length) Statement += '\nWHERE\n'
    this.query.conditions.forEach(condition => {
      if (condition instanceof QueryCondition) {
        const attributeDefinitions = this.query.entity.getAttributeDefinitions();
        const attributeDefinition = attributeDefinitions[condition.attribute];
        const validationResult = validate.attribute(attributeDefinition, condition.value);
        if (validationResult instanceof TypeError) {
          throw new QueryException(`attribute "${condition.attribute}" should be of type ${validationResult.message}`);
        }
        Statement += `  ${condition.attribute} ${condition.operator} '${condition.value}'`
      } else if (condition instanceof QueryOperator) {
        Statement += ` ${condition} `
      }
    })
    return { Statement };
  }

}
