import QueryBuilder from '../src/query';
import db from './fixtures/db';
import {Model} from '../index';

describe('Query', () => {
  let query: QueryBuilder;

  beforeEach(() => {
    query = new QueryBuilder(db);
  })
  describe('SELECT', () => {
    it('should select specified attributes', async () => {
      const model = await query
        .table('Cookbooks')
        .select('title', 'author', 'description')
        .where('title', '=', 'Southern Savories')
        .first()
      const attributes = model.getAttributeValues()
      expect(attributes).toHaveProperty('title', 'Southern Savories')
      expect(attributes).toHaveProperty('author', 'dev@studiowebfx.com')
      expect(attributes).toHaveProperty('description', 'Southern Cookbook')
    })

    it('should select items by single attribute', async () => {
      const collection = await query
        .table('Cookbooks')
        .where('title', '=', 'Southern Savories')
        .get()
      expect(collection).toHaveLength(1);
      expect(collection[0]).toBeInstanceOf(Model)
    })

    it('should limit results', async () => {
      const collection = await query.table('Cookbooks').limit(3).get();
      expect(collection).toHaveLength(3);
    })
  })

  describe('AND Logical Operator', () => {
    it('should select items by multiple attributes', async () => {
      const collection = await query
        .table('Cookbooks')
        //.select('title', 'description', 'author')
        .where('title', '=', 'Southern Savories')
        .and('author', '=', 'dev@studiowebfx.com')
        .get()
      expect(collection).toHaveLength(1);
      expect(collection[0]).toBeInstanceOf(Model)
    })
  })

  describe('OR Logical Operator', () => {
    it('should select items by one of multiple attributes', async () => {
      const collection = await query
        .table('Cookbooks')
        .where('title', '=', 'Southern Savories')
        .or('title', '=', 'Southern Smothered')
        .get()
      expect(collection).toHaveLength(2);
      expect(collection[0]).toHaveProperty('title', 'Southern Savories')
      expect(collection[1]).toHaveProperty('title', 'Southern Smothered')
    })
  })
})
