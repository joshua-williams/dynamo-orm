# DynamoRM
DynamoRM is an object-relational mapper (ORM) for interacting with DynamoDB.

### Entity


`entities.ts`

```typescript
import {Entity} from 'dynamorm'
import {Attribute} from 'dynamorm/decorators'

class UserEntity extends Entity {
  @Attribute()
  private firstName;

  @Attribute()
  private lastName;

  @Attribute()
  private email;
}
```

### Define a Table
This table uses `email` as the partition key with no sort key.
`DemoTable.ts`
```typescript
import { Table } from ".dynamorm/decorators";
import { Table } from "dynamorm";
import UserEntity from "./UserEntity";

@Table({
  name: 'DemoTable',
  primaryKey: {pk: 'email'},
  entities: [UserEntity]
})
class DemoTable extends Table {}

export default DemoTable

```

### Save User To Database
`index.ts`

```typescript
import DemoTable from './DemoTable';

const userAttributes = new UserEntity({
  firstName: 'Jack',
  lastName: 'Black',
  email: 'jack@black.com'
});

const table = new DemoTable();
const user = table.entity('UserEntity', userAttributes);
user.save();

```

### Get Item By Primary Key
```typescript
import DemoTable from './DemoTable';
const table = new DemoTable();
const user = table.entity('UserEntity');
const jack = user.find('jack@black.com')
```

### Delete Item
```typescript
import DemoTable from './DemoTable';
const table = new DemoTable();
const jack = table.entity('UserEntity');
jack.set('email', 'jack@black.com')
jack.delete();
```
### Testing
The test suite relies on [DynamoDB Local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html) 
as a [Docker image](https://hub.docker.com/r/amazon/dynamodb-local) so Docker must be installed and running.

```bash
# start local dynamodb
$ npm run start

# run all tests
$ npm run test

# run tests in watch mode
$ npm run test: watch

```
