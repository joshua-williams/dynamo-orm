import {Entity, attribute} from "../../index";

export class AuthorEntity extends Entity {
  @attribute()
  private firstName;

  @attribute()
  private lastName;

  @attribute()
  private email;

  @attribute()
  private image;

  @attribute()
  private about;

  @attribute()
  private socialMediaLinks;
}

export class CookbookEntity extends Entity {
  @attribute()
  private title;

  @attribute()
  private summary;

  @attribute()
  private description;

  @attribute()
  private author;

  @attribute()
  private image;
}

export class RecipeEntity extends Entity {
  @attribute()
  private cookbook;

  @attribute()
  private title;

  @attribute()
  private subject;

  @attribute()
  private body;

  @attribute()
  private user;
}
