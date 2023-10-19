declare namespace MoleculerMixinsKit {
  export interface QueryHelper {
    query: any;
    error: {
      message: string;
      code: number;
    };
    actions: {
      onFound: boolean | Function;
      onNotFound: boolean | Function;
    };
    model: {
      name: string;
      type: string;
      action: Function;
      populate: any[];
      select: any[];
    };
    broker: {
      name: string;
      node: string;
      options: any;
    };
  }

  export interface ModelMongoose {
    name: string;
    schema: any;
    options: any;
    plugins: any[];
    indexes: Array<{ indexes: Record<string, number>; options: object }>;
    virtuals: Array<{
      name: string;
      options: object;
      actions: { get: Function; set: Function };
    }>;
    discriminator: Record<string, object>;
    hooks: Array<{
      type: string;
      preHandler: Promise<any>;
      postHandler: Promise<any>;
    }>;
  }

  export type ModelSchemaMongoose = Array<ModelMongoose>;
}
