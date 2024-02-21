import 'reflect-metadata';
import db from './fixtures/db';
import {CookbookModel} from "./fixtures/models";
import {Entity, Model} from '../index'

describe('app', () => {

  describe('getters', () => {
    it('should get tables', () =>{
      const tables = db.getTables();
      expect(tables).toBeInstanceOf(Array);
      expect(tables).toHaveLength(3);
    })

    it('should get table by name', () => {
      const table = db.getTable('CookbookTable');
      expect(table).toHaveProperty('name', 'CookbookTable')
    })

    it('should get models', () => {
      const models = db.getModels();
      expect(models).toBeInstanceOf(Array);
      expect(models).toHaveLength(2);
    })

    it('should get model by name', () => {
      const model = db.getModel('CookbookModel');
      expect(model).toHaveProperty('name', 'CookbookModel')
    })
  })

  describe('factories', () => {
    it('should make model instance', () => {
      const model = db.model('CookbookModel');
      expect(model).toBeInstanceOf(CookbookModel)
    })

    it('should make entity into model instance', () => {
      const model = db.model('CookbookEntity');
      const attributes = model.getAttributes();
      const expectedAttributes = {
        title: undefined,
        summary: undefined,
        description: undefined,
        author: undefined,
        image: undefined
      }
      expect(model.constructor.name).toBe('EntityModel')
      expect(attributes).toMatchObject(expectedAttributes);
      expect(model).toBeInstanceOf(Model)
    })

    it('should get entities from model', () => {
      const model = db.model('CookbookModel');
      const entities = model.getEntities();
      expect(entities).toBeInstanceOf(Array)
      expect(entities).toHaveLength(3)
    })
    it('should get entities from model made from entity', () => {
      const model = db.model('CookbookEntity');
      const entities = model.getEntities();
      expect(entities).toBeInstanceOf(Array)
      expect(entities).toHaveLength(1)
      expect(entities[0]).toBeInstanceOf(Entity)
    })
  })

  describe('model attributes', () => {
    let model:Model;
    beforeEach(() => {
      model = db.model('CookbookModel');
    })
    it('should throw error if attribute is not defined', () => {
      const expectedError = () => model.get('noAttribute');
      expect(expectedError).toThrow();
    })

    it('should get an attribute default value', () => {
      const title = model.get('title');
      expect(title).toEqual('Southern Smothered');
    })

    it('should set an attribute', () => {
      model.set('title', 'Down South Cooking');
      const title = model.get('title');
      expect(title).toEqual('Down South Cooking')
    })

    it('should fill attributes', () => {
      const expectedAttributes = {
        title: 'Good Cookin',
        summary: 'A collection of good recipes'
      }
      model.fill(expectedAttributes)
      const attributes = model.getAttributes();
      expect(attributes).toMatchObject(expectedAttributes);
    })

  })

  describe('table creation', () => {
    it('should create table', async () => {
      let table = db.getTable('CookbookTable');
    })

    it('should create all tables', () => {})
  })
})
