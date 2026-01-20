/**
 * @fileoverview デフォルト値を引数に書かないルール
 * 呼び出し側で明示的に指定させることでコードの意図を明確にする
 * @see [misc-3] in docs/review.md
 */

const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "デフォルト値を引数に書かないでください。呼び出し側で明示的に指定してください。",
      recommended: true,
    },
    messages: {
      noDefaultParam:
        "[misc-3] 引数'{{name}}'にデフォルト値を設定しないでください。呼び出し側で明示的に指定してください。",
    },
    schema: [],
  },
  create(context) {
    function checkParam(param) {
      // デフォルト値付きパラメータ: function(timeout = 5000)
      if (param.type === "AssignmentPattern") {
        let paramName = "unknown";
        if (param.left.type === "Identifier") {
          paramName = param.left.name;
        } else if (param.left.type === "ObjectPattern") {
          paramName = "{...}";
        } else if (param.left.type === "ArrayPattern") {
          paramName = "[...]";
        }

        context.report({
          node: param,
          messageId: "noDefaultParam",
          data: { name: paramName },
        });
      }
    }

    function checkParams(params) {
      params.forEach(checkParam);
    }

    return {
      // 関数宣言: function scrapeProduct(url, timeout = 5000) {}
      FunctionDeclaration(node) {
        checkParams(node.params);
      },

      // 関数式: const scrapeProduct = function(url, timeout = 5000) {}
      FunctionExpression(node) {
        checkParams(node.params);
      },

      // アロー関数: const scrapeProduct = (url, timeout = 5000) => {}
      ArrowFunctionExpression(node) {
        checkParams(node.params);
      },

      // メソッド定義: class { scrapeProduct(url, timeout = 5000) {} }
      MethodDefinition(node) {
        if (node.value && node.value.params) {
          checkParams(node.value.params);
        }
      },
    };
  },
};

export default rule;
