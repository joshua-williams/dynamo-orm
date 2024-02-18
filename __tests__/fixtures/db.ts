import {AuthorTable, CookbookTable, RecipeTable} from "./tables";
import { DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {Dynamorm, dynamorm} from "../../index";
import {AuthorModel, CookbookModel} from "./models";

@dynamorm({
  client: new DynamoDBClient(),
  tables: [AuthorTable, CookbookTable, RecipeTable],
  models: [CookbookModel, AuthorModel]
})
class Db {}

export default Dynamorm.create(Db)
