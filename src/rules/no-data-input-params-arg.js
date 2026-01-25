/**
 * @fileoverview data、input、paramsという引数名を禁止するルール
 * 引数は具体的な名前で受け取るべき
 * ただしRepositoryは例外（Prismaのcreate/updateパターンに合わせる）
 * @see [types-2] in docs/review.md
 */

const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "data、input、paramsという引数名を使用しないでください。具体的な名前で受け取ってください。（Repositoryは例外）",
      recommended: true,
    },
    messages: {
      noDataInputParamsArg:
        "[types-2] '{{name}}'という引数名は避けてください。userId, productIdなど具体的な名前で直接受け取ってください。（Repositoryでは'data'は許可）",
    },
    schema: [],
  },
  create(context) {
    const forbiddenNames = ["data", "input", "params", "args", "options", "opts", "config"];
    // Repositoryでは'data'のみ許可（Prismaパターンに合わせる）
    const repositoryAllowedNames = ["data"];

    // ファイルパスにrepositoryが含まれるかチェック
    function isRepositoryFile() {
      const filename = context.getFilename?.() || context.filename || "";
      return filename.toLowerCase().includes("repository");
    }

    // クラス名がRepositoryで終わるかチェック
    let currentClassName = null;

    function isInRepositoryClass() {
      return currentClassName && currentClassName.endsWith("Repository");
    }

    function shouldAllowName(name) {
      if (isRepositoryFile() || isInRepositoryClass()) {
        return repositoryAllowedNames.includes(name.toLowerCase());
      }
      return false;
    }

    function checkParam(param) {
      if (param.type === "Identifier") {
        const name = param.name.toLowerCase();
        if (forbiddenNames.includes(name) && !shouldAllowName(param.name)) {
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
      // クラス定義を追跡
      ClassDeclaration(node) {
        if (node.id && node.id.name) {
          currentClassName = node.id.name;
        }
      },
      "ClassDeclaration:exit"() {
        currentClassName = null;
      },

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
