/**
 * @fileoverview Input/Output/Params型を作らないルール
 * 関数の引数は直接受け取るべき
 * @see [types-1] in template/skills/review/reference/types-data.md
 */

const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Input/Output/Params型を作成しないでください。関数の引数は直接受け取ってください。",
      recommended: true,
    },
    messages: {
      noInputOutputParamsType:
        "[types-1] '{{name}}'のようなInput/Output/Params型を作成しないでください。関数の引数は直接受け取ってください。",
    },
    schema: [],
  },
  create(context) {
    /**
     * 型名がInput、Output、Paramsで終わるかチェック
     * 例: CreateHearingSheetInput, CreateHearingSheetOutput, CreateHearingSheetParams
     */
    function hasInputOutputParamsPattern(name) {
      if (!name) return false;
      return /(Input|Output|Params|Result)$/.test(name);
    }

    function reportIfInputOutputParamsPattern(node, name) {
      if (hasInputOutputParamsPattern(name)) {
        context.report({
          node,
          messageId: "noInputOutputParamsType",
          data: { name },
        });
      }
    }

    return {
      // type宣言: type CreateHearingSheetInput = { ... }
      TSTypeAliasDeclaration(node) {
        if (node.id && node.id.type === "Identifier") {
          reportIfInputOutputParamsPattern(node, node.id.name);
        }
      },

      // interface宣言: interface CreateHearingSheetInput { ... }
      TSInterfaceDeclaration(node) {
        if (node.id && node.id.type === "Identifier") {
          reportIfInputOutputParamsPattern(node, node.id.name);
        }
      },
    };
  },
};

export default rule;
