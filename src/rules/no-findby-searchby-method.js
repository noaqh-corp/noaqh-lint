/**
 * @fileoverview findBy~~、searchBy~~という条件別メソッドを禁止するルール
 * find/searchメソッドはオプショナル引数で統合すべき
 * @see [repository-1] in template/skills/review/reference/architecture.md
 */

const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "findBy~~、searchBy~~という条件別メソッドを作成しないでください。オプショナル引数で統合してください。",
      recommended: true,
    },
    messages: {
      noFindBySearchByMethod:
        "[repository-1] 'findBy~~'や'searchBy~~'という条件別メソッドを作成しないでください。find({ id, userId, status })のようにwhereオブジェクトで統合してください。",
    },
    schema: [],
  },
  create(context) {
    /**
     * メソッド名が「findBy」または「searchBy」で始まるかチェック
     * 例: findById, findByUserId, searchByTitle, searchByCategory
     */
    function hasFindByOrSearchByPattern(name) {
      if (!name) return false;
      return /^(findBy|searchBy)[A-Z]/.test(name);
    }

    function reportIfFindBySearchByPattern(node, name) {
      if (hasFindByOrSearchByPattern(name)) {
        context.report({
          node,
          messageId: "noFindBySearchByMethod",
        });
      }
    }

    return {
      // メソッド定義: class { findById() {} }
      MethodDefinition(node) {
        if (node.key && node.key.type === "Identifier") {
          reportIfFindBySearchByPattern(node, node.key.name);
        }
      },

      // 関数宣言: function findById() {}
      FunctionDeclaration(node) {
        if (node.id && node.id.type === "Identifier") {
          reportIfFindBySearchByPattern(node, node.id.name);
        }
      },

      // 変数宣言 (アロー関数): const findById = () => {}
      VariableDeclarator(node) {
        if (
          node.id &&
          node.id.type === "Identifier" &&
          node.init &&
          (node.init.type === "ArrowFunctionExpression" ||
            node.init.type === "FunctionExpression")
        ) {
          reportIfFindBySearchByPattern(node, node.id.name);
        }
      },

      // オブジェクトプロパティ (メソッド): { findById: async () => {} }
      Property(node) {
        if (
          node.key &&
          node.key.type === "Identifier" &&
          node.value &&
          (node.value.type === "ArrowFunctionExpression" ||
            node.value.type === "FunctionExpression")
        ) {
          reportIfFindBySearchByPattern(node, node.key.name);
        }
      },
    };
  },
};

export default rule;
