import { AuthorEntity, CookbookEntity, RecipeEntity } from "./entities";
import {model, Model} from "../../index";

@model({
  entity: CookbookEntity
})
export class CookbookModel extends Model {

}
@model({entity: AuthorEntity})
export class AuthorModel extends Model {

}
