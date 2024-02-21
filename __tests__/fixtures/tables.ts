import {AuthorEntity, CookbookEntity, RecipeEntity} from "./entities";
import {Table, table} from "../../index";


@table({
  name: 'Authors',
  primaryKey: {pk: 'email'},
  entity: AuthorEntity
})
export class AuthorTable extends Table {}


@table({
  name: 'Cookbooks',
  primaryKey: {pk: 'title', sk: 'author'},
  entity: CookbookEntity
})
export class CookbookTable extends Table {}



@table({
  name: 'Recipes',
  primaryKey: {pk: 'cookbook', sk: 'title'},
  entity: RecipeEntity
})
export class RecipeTable extends Table {}

