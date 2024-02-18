import Entity from "./entity";

class Table {
  public name: string;
  private entities: Array<Entity>;

  constructor() {
    this.name = Reflect.getMetadata('name', this.constructor);
    this.entities = Reflect.getMetadata('entities', this.constructor);
  }

  static getName() {
    return Reflect.getMetadata('name', this.constructor);
  }
  getName() {
    return this.name;
  }
  getEntities() {
    return this.entities;
  }
  static getEntities() {
    return Reflect.getMetadata('entities', this);
  }

  getEntity() {

  }
}
export default Table;
