/**
 * @fileoverview data、input、paramsという引数名を禁止するルール
 * 引数は具体的な名前で受け取るべき
 * @see [types-2] in docs/review.md
 */

const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "data、input、paramsという引数名を使用しないでください。具体的な名前で受け取ってください。",
      recommended: true,
    },
    messages: {
      noDataInputParamsArg:
        "[types-2] '{{name}}'という引数名は避けてください。userId, productIdなど具体的な名前で直接受け取ってください。",
    },
    schema: [],
  },
  create(context) {
    const forbiddenNames = ["data", "input", "params", "args", "options", "opts", "config"];

    function checkParam(param) {
      if (param.type === "Identifier") {
        const name = param.name.toLowerCase();
        if (forbiddenNames.includes(name)) {
          context.report({
            node: param,
            messageId: "noDataInputParamsArg",
            data: { name: param.name },
          });
        }
      }
      // 分割代入パターン: function({ userId }: Input) の場合はOK
      // ObjectPatternは許可（具体的なプロパティ名を使っているため）
    }

    function checkParams(params) {
      params.forEach(checkParam);
    }

    return {
      // 関数宣言: function createUser(data) {}
      FunctionDeclaration(node) {
        checkParams(node.params);
      },

      // 関数式: const createUser = function(data) {}
      FunctionExpression(node) {
        checkParams(node.params);
      },

      // アロー関数: const createUser = (data) => {}
      ArrowFunctionExpression(node) {
        checkParams(node.params);
      },

      // メソッド定義: class { createUser(data) {} }
      MethodDefinition(node) {
        if (node.value && node.value.params) {
          checkParams(node.value.params);
        }
      },
    };
  },
};

export default rule;
