import {AuthorEntity, CookbookEntity, RecipeEntity} from "./entities";
import {Table, table} from "../../index";


@table({
  name: 'Authors',
  primaryKey: {pk: 'email'},
  entities: [AuthorEntity]
})
export class AuthorTable extends Table {}


@table({
  name: 'Cookbooks',
  primaryKey: {pk: 'title', sk: 'author'},
  entities: [CookbookEntity]
})
export class CookbookTable extends Table {}



@table({
  name: 'Recipes',
  primaryKey: {pk: 'id'},
  entities: [RecipeEntity]
})
export class RecipeTable extends Table {}

