import { AuthorEntity, CookbookEntity, RecipeEntity } from "./entities";
import {Model} from "../../index";

export class CookbookModel extends Model {

  protected entities = [
    CookbookEntity,
    AuthorEntity,
    RecipeEntity
  ];

  protected attributes = {
    title: 'Southern Smothered',
    summary: 'A cookbook with some of the best southern gravy recipes on the internet',
  }
}

export class AuthorModel extends Model {
  protected attributes = [
    'firstName',
    'lastName',
    'email'
  ]
}
