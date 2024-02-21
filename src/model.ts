import {Attributes, EntityConstructor} from "./types";


class Model {
  public name: string;
  protected attributes: Array<string> | Attributes = {};
  protected entities: Array<EntityConstructor> = [];

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
}

export default Model
