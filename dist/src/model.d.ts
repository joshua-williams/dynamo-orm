import { AttributeDefinitions, Attributes } from "./types";
import { DynamoDBClient, PutItemCommandOutput } from "@aws-sdk/client-dynamodb";
import Table from "./table";
declare class Model {
    private client;
    name: string;
    protected table: Table;
    protected attributes: AttributeDefinitions;
    constructor(client: DynamoDBClient);
    fill(attribute: Attributes | string, value?: any): void;
    /**
     * @description Sets named attribute value
     * @param attributeName
     * @param value
     */
    set(attributeName: string, value: any): void;
    /**
     * @description Sets named attribute value. If attribute not set and defaultValue is not provided an error is thrown
     * @param attributeName
     */
    get(attributeName: string): any;
    getAttributes(): AttributeDefinitions;
    getAttributeValues(): {};
    static getEntity(): any;
    getEntity(instance?: boolean): unknown;
    save(): Promise<PutItemCommandOutput>;
    find(pk?: string, sk?: string): Promise<Model>;
    /**
     * @description Delete an item by primary key
     * @param pk - Partition key
     * @param sk - (optional) Sort Key
     * @return boolean - True if an item was deleted. False if primary key did not match an item and nothing was deleted
     */
    delete(pk?: string, sk?: string): Promise<any>;
    clear(): void;
    validate(): {
        valid: boolean;
        errors: string[];
    };
    private validateAttribute;
    private toPutCommandInput;
}
export default Model;
//# sourceMappingURL=model.d.ts.map