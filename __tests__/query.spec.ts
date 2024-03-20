import QueryBuilder from '../src/query';
import db from './fixtures/db';
import {Model} from '../index';
import {QueryException} from '../src/exceptions';

describe('Query', () => {
  let query: QueryBuilder;

  beforeEach(() => {
    query = new QueryBuilder(db);
  })

  describe('Delete', () => {

    beforeEach( async () => {
      const cookbook = db.model('Cookbooks');
      await cookbook.fill({
        title: 'Haggis Cookbook',
        author: 'no author',
        image: ['cover.png']
      }).save();
    });

    it('should fail to delete if sort key is not set', async () => {
      const deleteCookbook = async () => {
        await query
          .table('Cookbooks')
          .where('title', '=', 'Haggis Cookbook')
          .delete()
      }

      await expect(deleteCookbook).rejects.toThrowError(QueryException)
    });

    it('should delete item from table', async () => {
      await query
        .table('Cookbooks')
        .where('title', '=', 'Haggis Cookbook')
        .and('author', '=', 'no author')
        .delete()
    });

  })

  describe('Select', () => {
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

    it('should use select.from.where', async () => {
      const model = await query
        .select('*')
        .from('Cookbooks')
        .where('title', '=', 'Southern Savories')
        .first()
      expect(model).toBeInstanceOf(Model);

    })
  })

  describe('Operators', () => {
    it('AND Logical Operator', async () => {
      const collection = await query
        .table('Cookbooks')
        .where('title', '=', 'Southern Savories')
        .and('author', '=', 'dev@studiowebfx.com')
        .get()
      expect(collection).toHaveLength(1);
      expect(collection[0]).toBeInstanceOf(Model)
    })

    it('OR Logical Operator', async () => {
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
