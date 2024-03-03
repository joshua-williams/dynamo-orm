import db from './fixtures/db'
import {CookbookModel} from "./fixtures/models";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";


const client = new DynamoDBClient({endpoint: 'http://localhost:8000'});
describe('model', () => {
  let model: any;

  beforeEach (() => {
    model = new CookbookModel(client);
  });

  it ('should set attribute with setter', () => {
    model.title = 'Southern Cooking'
    model.image = ['http://pathtoimage.com'];
    model.reviews = 5;
    expect(model.title).toEqual('Southern Cooking');
  });

  describe('validation', () => {
    it ('should fail string validation', () => {
      const expectedFailure = () => model.title = [];
      expect(expectedFailure).toThrow(TypeError)
    });

    it ('should fail string set validation', () => {
      const expectedFailure = () => model.image = 'http://pathtoimage.com';
      expect(expectedFailure).toThrow(TypeError)
    });

    it ('should fail number validation', () => {
      const expectedFailure = () => model.reviews = '70';
      expect(expectedFailure).toThrow(TypeError)
    });

    it ('should fail number set validation', () => {
      const expectedFailure = () => model.reviews = ['70'];
      expect(expectedFailure).toThrow(TypeError)
    })

    it('should fail map validation', () => {
      const expectedFailure = () => model.reviews = ['70'];
      expect(expectedFailure).toThrow(TypeError)

    })
  })

  describe('save', () => {
    it('should save', async () => {
      model.fill({
        title: "Southern Savories",
        author: 'com.joshua360@gmail.com'
      });
      const result = await model.save();
      console.log(result);
    })
  })
})
