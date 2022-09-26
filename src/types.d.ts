declare module "config/database" {
    export namespace mongoose {
        const db: {};
        const url: {};
        namespace model {
            namespace toJSON {
                const getters: boolean;
            }
            const timestamps: boolean;
        }
    }
    export namespace sequalize {
        const url_1: any;
        export { url_1 as url };
        const sequalize_1: {};
        export { sequalize_1 as sequalize };
        const model_1: {};
        export { model_1 as model };
    }
}
declare module "connectors/mongose" {
    function _exports(mongoUrl: any, opts?: {}): {
        name: string;
        /**
         * Service created lifecycle event handler
         */
        started(): Promise<any>;
        /**
         * Service stop lifecycle event handler
         */
        stopped(): Promise<any>;
    };
    export = _exports;
}
declare module "database" {
    export { Mongoose };
    import Mongoose = require("connectors/mongose");
}
declare module "helpers/error" {
    export = ErrorResponse;
    /**
     * Custom helper extends of calss molecule error
     */
    class ErrorResponse extends MoleculerError {
        constructor(message: any, code: any, type: any, data: any);
    }
    import { MoleculerError } from "moleculer";
}
declare module "index" {
    export namespace settings {
        namespace mixinsKit {
            const model: any;
        }
    }
    export namespace methods {
        /**
         *
         * @param {Object} params
         * @param {Object} params.query
         * @param {Object} params.error
         * @param {String} params.error.message
         * @param {Number} params.error.code
         * @param {Object} params.actions
         * @param {function|boolean} params.actions.onFound - Return into a function if the entity is found
         * @param {function|boolean} params.actions.onNotFound - Return into a function if the entity is not found
         * @param {Object} params.model
         * @param {String} params.model.name
         * @param {String} params.model.type
         * @param {Function} params.model.action
         * @param {Array} params.model.populate
         * @param {Array} params.model.select
         * @param {Object} params.broker
         * @param {String} params.broker.name
         * @param {String} params.broker.node
         * @param {Object} params.broker.options
         * @returns {Object|Array|Function}
         */
        function queryHelper(params?: {
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
        }): any;
        /**
         *
         * @param {Object} params
         * @param {Object} params.query
         * @param {Object} params.error
         * @param {String} params.error.message
         * @param {Number} params.error.code
         * @param {Object} params.actions
         * @param {function|boolean} params.actions.onFound - Return into a function if the entity is found
         * @param {function|boolean} params.actions.onNotFound - Return into a function if the entity is not found
         * @param {Object} params.model
         * @param {String} params.model.name
         * @param {String} params.model.type
         * @param {Function} params.model.action
         * @param {Array} params.model.populate
         * @param {Array} params.model.select
         * @param {Object} params.broker
         * @param {String} params.broker.name
         * @param {String} params.broker.node
         * @param {Object} params.broker.options
         * @returns {Object|Array|Function}
         */
        function queryHelper(params?: {
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
        }): any;
        /**
         * Format errors
         * @deprecated Since version 0.2.8. Will be deleted in version 0.2.9. Use throwError() instead.
         * @param {Object} params
         * @param {String} params.msg
         * @param {String} params.uid
         * @param {String} params.code
         * @param {Object} params.extra
         * @returns {Void}
         */
        function formatError(params: {
            msg: string;
            uid: string;
            code: string;
            extra: any;
        }): void;
        /**
         * Format errors
         * @deprecated Since version 0.2.8. Will be deleted in version 0.2.9. Use throwError() instead.
         * @param {Object} params
         * @param {String} params.msg
         * @param {String} params.uid
         * @param {String} params.code
         * @param {Object} params.extra
         * @returns {Void}
         */
        function formatError(params: {
            msg: string;
            uid: string;
            code: string;
            extra: any;
        }): void;
        /**
         * Format errors
         * @param {Object} params
         * @param {String} params.message
         * @param {String} params.uid
         * @param {String} params.code
         * @param {Object} params.extra
         * @returns {Error}
         */
        function throwError(params: {
            message: string;
            uid: string;
            code: string;
            extra: any;
        }): Error;
        /**
         * Format errors
         * @param {Object} params
         * @param {String} params.message
         * @param {String} params.uid
         * @param {String} params.code
         * @param {Object} params.extra
         * @returns {Error}
         */
        function throwError(params: {
            message: string;
            uid: string;
            code: string;
            extra: any;
        }): Error;
        /**
         *
         * @param {String|Number} value - String/Number value
         * @param {Integer} precision - Decimal places
         * @returns
         */
        function parseNumberDec(value: string | number, precision?: Integer): number;
        /**
         *
         * @param {String|Number} value - String/Number value
         * @param {Integer} precision - Decimal places
         * @returns
         */
        function parseNumberDec(value: string | number, precision?: Integer): number;
        /**
         * Create a random 10-digit number code
         */
        function generateRandNum(digits: any): any;
        /**
         * Create a random 10-digit number code
         */
        function generateRandNum(digits: any): any;
    }
    /**
     * Service started lifecycle event handler
     */
    export function started(): Promise<void>;
    /**
     * Service started lifecycle event handler
     */
    export function started(): Promise<void>;
}
declare module "middlewares/sequelizeDB" {
    function _exports(Opts?: {}): {
        name: string;
        /**
         * Run on create broker
         */
        starting(broker: any): Promise<void>;
        /**
         * This hook is called before service starting.
         */
        serviceStarting(service: any): Promise<any>;
        /**
         * This hook is called when service start already.
         */
        started(broker: any): Promise<void>;
        /**
         * This hook is called before broker stopping.
         */
        stopping(broker: any): Promise<void>;
    };
    export = _exports;
}
declare module "middlewares/mongooseDB" {
    function _exports(Opts?: {
        url: string;
        db: any;
        model: any;
    }): {
        name: string;
        /**
         * Run on create broker
         */
        starting(broker: any): Promise<any>;
        /**
         * This hook is called before service starting.
         */
        serviceStarting(service: any): Promise<void>;
        /**
         * This hook is called before broker stopping.
         */
        stopped(broker: any): Promise<any>;
    };
    export = _exports;
    /**
     * Model Schema Tyoe
     */
    export type ModelTypeSchema = {
        name: string;
        schema: any;
        options: any;
        plugins: any[];
        hooks: Array<{
            type: string;
            preHandler: Promise<any>;
            postHandler: Promise<any>;
        }>;
    };
}
declare module "middleware" {
    import SequelizeDb = require("middlewares/sequelizeDB");
    import MongooseDb = require("middlewares/mongooseDB");
    export { SequelizeDb, MongooseDb };
}
declare module "validations/joi" {
    export = JoiValidator;
    class JoiValidator {
        Joi: any;
        compile(schema: any): any;
        /**
         * Clean messages
         * From "\"name\" is required"
         * to "name is required"
         * @param {string} msg
         * @returns {string}
         */
        cleanMessage(msg: string): string;
        /**
         * Validate joi schema
         * @param {Object} params
         * @param {*} schema
         * @returns
         */
        validate(params: any, schema: any): boolean;
    }
}
declare module "validator" {
    export { Joi };
    import Joi = require("validations/joi");
}
declare module "helpers/mongo/filterBuilder" {
    export = builderFilter;
    /**
     * @param {Object} opts
     * @param {Object} opts.params
     * @param {Array<{name: string, field: string, type: ('SEARCH' | 'DATE')}>} opts.filtersAllowed
     * @returns
     */
    function builderFilter({ params, filtersAllowed }: {
        params: any;
        filtersAllowed: Array<{
            name: string;
            field: string;
            type: ('SEARCH' | 'DATE');
        }>;
    }): {};
}
declare module "helpers/normalize/builder" {
    export = normalizeBuilder;
    /**
     * Normalize builder
     * this helper help to normalize data using lodash,
     * to get each value using keys and values
     * @param {Object} opts
     * @param {Object} opts.data - data to normalize
     * @param {Array<{selector: string, field: string }>} opts.fields - fields to normalize
     *
     */
    function normalizeBuilder(opts: {
        data: any;
        fields: Array<{
            selector: string;
            field: string;
        }>;
    }): {};
}
declare module "helpers/normalize/cleaner" {
    export = normalizeCleaner;
    /**
     * Clean object properties
     * this helper will clean object with the fields mentioned
     * @param {Object} opts
     * @param {Object} opts.data - data to normalize
     * @param {Array<string>} opts.fields - fields to normalize
     *
     */
    function normalizeCleaner(opts: {
        data: any;
        fields: Array<string>;
    }): any;
}
//# sourceMappingURL=types.d.ts.map