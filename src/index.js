/**
 * @noaqh/lint - Oxlint plugin for noaqh projects
 */

import noTryCatchInServer from "./rules/no-try-catch-in-server.js";
import noPrismaInServer from "./rules/no-prisma-in-server.js";
import noWithRelationMethod from "./rules/no-with-relation-method.js";
import noFindbySearchbyMethod from "./rules/no-findby-searchby-method.js";
import noInputOutputParamsType from "./rules/no-input-output-params-type.js";
import noDataInputParamsArg from "./rules/no-data-input-params-arg.js";
import noExpectInIf from "./rules/no-expect-in-if.js";
import noDefaultParam from "./rules/no-default-param.js";
import noCrossFeatureImport from "./rules/no-cross-feature-import.js";
import noNPlusOneQuery from "./rules/no-n-plus-one-query.js";
import noFeaturesImportFlows from "./rules/no-features-import-flows.js";

const plugin = {
  meta: {
    name: "@noaqh/lint",
    version: "1.0.0",
  },
  rules: {
    "no-try-catch-in-server": noTryCatchInServer,
    "no-prisma-in-server": noPrismaInServer,
    "no-with-relation-method": noWithRelationMethod,
    "no-findby-searchby-method": noFindbySearchbyMethod,
    "no-input-output-params-type": noInputOutputParamsType,
    "no-data-input-params-arg": noDataInputParamsArg,
    "no-expect-in-if": noExpectInIf,
    "no-default-param": noDefaultParam,
    "no-cross-feature-import": noCrossFeatureImport,
    "no-n-plus-one-query": noNPlusOneQuery,
    "no-features-import-flows": noFeaturesImportFlows,
  },
};

export default plugin;
