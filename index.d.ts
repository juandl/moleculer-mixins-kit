declare namespace BkrModelsKist {
  interface QueryHelper {
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

  interface ModelMongoose {
    name: string;
    schema: any;
    options: any;
    plugins: any[];
    hooks: Array<{
      type: string;
      preHandler: Promise<any>;
      postHandler: Promise<any>;
    }>;
  }

  type ModelSchemaMongoose = Array<ModelMongoose>;
}

export = BkrModelsKist;
