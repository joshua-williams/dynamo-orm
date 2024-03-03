import {
  AttributeDefinition,
  AttributeDefinitions,
  Attributes,
  AttributeType,
  TableConstructor,
} from "./types";
import {
  DynamoDBClient,
  PutItemCommand,
  PutItemCommandOutput,
  ResourceNotFoundException
} from "@aws-sdk/client-dynamodb";
import {ServiceUnavailableException, TableNotFoundException} from "./exceptions";

class Model {
  public name: string;
  protected table: TableConstructor;

  protected attributes: AttributeDefinitions = {};

  constructor( private client: DynamoDBClient ) {
    this.table = Reflect.getMetadata('table', this.constructor);
    const entity = this.table.getEntity(true);
    this.attributes = entity.getAttributeDefinitions();

    for (let attribute in this.attributes) {
      Object.defineProperty(this, attribute, {
        get() {
          return this.attributes[attribute].value
        },
        set(value) {
          const result = this.validateAttribute(this.attributes[attribute], value);
          if (result instanceof TypeError) {
            result.message = `${attribute} must be a ${result.message} on ${this.constructor.name}`
            throw result;
          }
          this.attributes[attribute].value = value
        }
      });
    }
  }

  private validateAttribute(attribute: AttributeDefinition, value: any) {
    switch (attribute.type.toLowerCase()) {
      case 's':
        if ((typeof value) != 'string') return new TypeError('string')
        break;
      case 'ss':
        if (! (value instanceof Array)) return new TypeError('string set');
        for (let v of value) {
          if ((typeof v) !== 'string') return new TypeError('string set');
        }
        break
      case 'n':
        if ((typeof value) !== 'number') return new TypeError('number');
        break
      case 'ns':
        if (! (value instanceof Array)) return new TypeError('number set');
        for (let v of value) {
          if ((typeof value) !== 'number') return new TypeError('number set');
        }
        break
      case 'bb':
        if (typeof value != 'boolean') return new TypeError('boolean');
        break;

      case 'map':
        // @ts-ignore
        if (typeof value != 'object') return new TypeError('object');
        break;
    }
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
   * @description Sets named attribute value
   * @param attributeName
   * @param value
   */
  public set(attributeName: string, value: any) {
    if (this.attributes.hasOwnProperty(attributeName)) {
      this.attributes[attributeName].value = value;
    }
  }

  /**
   * @description Sets named attribute value. If attribute not set and defaultValue is not provided an error is thrown
   * @param attributeName
   */
  public get(attributeName: string) {
    if (this.attributes.hasOwnProperty(attributeName)) {
      return this.attributes[attributeName].value;
    }
    throw new Error(`Attribute not found: ${attributeName}`)
  }

  public getAttributes() {
    return this.attributes;
  }
  public getAttributeValues() {
    return Object.keys(this.attributes).reduce((attributes, attribute) => {
      attributes[attribute] = this.attributes[attribute].value;
      return attributes;
    }, {})
  }
  static getEntity() {
    return Reflect.getMetadata('entity', this);
  }

  public getEntity(instance: boolean = false) {
    return this.table.getEntity(instance);
  }


  public async save(): Promise<PutItemCommandOutput> {
    const input = this.toPutCommandInput();
    const command = new PutItemCommand(input);
    let result: PutItemCommandOutput;
    try {
      result = await this.client.send(command);
    } catch ( e ) {
      let message = `Failed to save dynamo model ${this.constructor.name}. ${e.message}`;

      switch ( e.constructor ) {
        case ResourceNotFoundException:
          const { statusCode, reason } = e.$response;

          switch( statusCode ) {
            case 400:
              message = `dynamodb table does not exist "${this.table.getName()}"`
              break;
          }
          throw new TableNotFoundException(message);

        default:
          throw new ServiceUnavailableException(message);
      }
    }
    return result;
  }

  private toPutCommandInput() {
    const input = {
      TableName: this.table.getName(),
      Item: {}
    };
    for (let name in this.attributes) {
      const attribute = this.attributes[name];
      if (attribute.value === undefined) continue;
      input.Item[name] = {
        [attribute.type]: attribute.value
      }
    }
    return input;
  }
}

export default Model
