/**
 * @fileoverview N+1クエリを検出するルール
 * ループ内やPromise.all内でRepositoryメソッドを呼び出すパターンを警告
 * @see [architecture-7] in docs/review.md
 */

const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "N+1クエリを避けてください。ループ内でRepositoryを呼び出す代わりに、includeを使用した専用メソッドを用意してください。",
      recommended: true,
    },
    messages: {
      noNPlusOneInLoop:
        "[architecture-7] ループ内でRepositoryメソッド '{{method}}' を呼び出しています。N+1クエリになる可能性があります。Repositoryにincludeを使用した専用メソッド（例: searchWithItems）を用意してください。",
      noNPlusOneInPromiseAll:
        "[architecture-7] Promise.all内で配列要素ごとにRepositoryメソッド '{{method}}' を呼び出しています。N+1クエリになります。Repositoryにincludeを使用した専用メソッドを用意してください。",
    },
    schema: [],
  },
  create(context) {
    // Repositoryメソッドと判断するパターン
    const repositoryMethodPatterns = [
      /^get$/i,
      /^find/i,
      /^search/i,
      /^list/i,
      /^fetch/i,
      /^load/i,
      /^query/i,
    ];

    // ループ内にいるかどうかを追跡
    let loopDepth = 0;
    // Promise.all内のmap/forEach内にいるかどうかを追跡
    let inPromiseAllCallback = false;

    function isRepositoryMethod(callee) {
      // パターン1: repo.get(), repository.search() など
      if (callee.type === "MemberExpression" && callee.property) {
        const objectName = callee.object?.name?.toLowerCase() || "";
        const propertyName = callee.property?.name || "";

        // オブジェクト名にrepo/repositoryが含まれる
        if (objectName.includes("repo") || objectName.includes("repository")) {
          return propertyName;
        }

        // メソッド名がRepositoryっぽいパターン
        if (repositoryMethodPatterns.some((pattern) => pattern.test(propertyName))) {
          // Container.getXxxRepository().method() のパターン
          if (callee.object?.type === "CallExpression") {
            const innerCallee = callee.object.callee;
            if (innerCallee?.type === "MemberExpression") {
              const innerMethodName = innerCallee.property?.name || "";
              if (innerMethodName.toLowerCase().includes("repository")) {
                return propertyName;
              }
            }
          }
        }
      }

      return null;
    }

    function checkCallExpression(node) {
      const methodName = isRepositoryMethod(node.callee);
      if (!methodName) return;

      if (loopDepth > 0) {
        context.report({
          node,
          messageId: "noNPlusOneInLoop",
          data: { method: methodName },
        });
      } else if (inPromiseAllCallback) {
        context.report({
          node,
          messageId: "noNPlusOneInPromiseAll",
          data: { method: methodName },
        });
      }
    }

    function isPromiseAllArgument(node) {
      // Promise.all([...]) の引数内かチェック
      let parent = node.parent;
      while (parent) {
        if (
          parent.type === "CallExpression" &&
          parent.callee?.type === "MemberExpression" &&
          parent.callee.object?.name === "Promise" &&
          parent.callee.property?.name === "all"
        ) {
          return true;
        }
        parent = parent.parent;
      }
      return false;
    }

    return {
      // forループ
      ForStatement() {
        loopDepth++;
      },
      "ForStatement:exit"() {
        loopDepth--;
      },

      // for...inループ
      ForInStatement() {
        loopDepth++;
      },
      "ForInStatement:exit"() {
        loopDepth--;
      },

      // for...ofループ
      ForOfStatement() {
        loopDepth++;
      },
      "ForOfStatement:exit"() {
        loopDepth--;
      },

      // whileループ
      WhileStatement() {
        loopDepth++;
      },
      "WhileStatement:exit"() {
        loopDepth--;
      },

      // do...whileループ
      DoWhileStatement() {
        loopDepth++;
      },
      "DoWhileStatement:exit"() {
        loopDepth--;
      },

      // .forEach(), .map() などのコールバック
      "CallExpression > ArrowFunctionExpression"(node) {
        const callExpr = node.parent;
        if (callExpr?.callee?.type === "MemberExpression") {
          const methodName = callExpr.callee.property?.name;
          if (["forEach", "map", "filter", "reduce", "some", "every", "flatMap"].includes(methodName)) {
            // Promise.all内のmapか確認
            if (isPromiseAllArgument(callExpr)) {
              inPromiseAllCallback = true;
            } else {
              loopDepth++;
            }
          }
        }
      },
      "CallExpression > ArrowFunctionExpression:exit"(node) {
        const callExpr = node.parent;
        if (callExpr?.callee?.type === "MemberExpression") {
          const methodName = callExpr.callee.property?.name;
          if (["forEach", "map", "filter", "reduce", "some", "every", "flatMap"].includes(methodName)) {
            if (isPromiseAllArgument(callExpr)) {
              inPromiseAllCallback = false;
            } else {
              loopDepth--;
            }
          }
        }
      },

      // 関数式のコールバック
      "CallExpression > FunctionExpression"(node) {
        const callExpr = node.parent;
        if (callExpr?.callee?.type === "MemberExpression") {
          const methodName = callExpr.callee.property?.name;
          if (["forEach", "map", "filter", "reduce", "some", "every", "flatMap"].includes(methodName)) {
            if (isPromiseAllArgument(callExpr)) {
              inPromiseAllCallback = true;
            } else {
              loopDepth++;
            }
          }
        }
      },
      "CallExpression > FunctionExpression:exit"(node) {
        const callExpr = node.parent;
        if (callExpr?.callee?.type === "MemberExpression") {
          const methodName = callExpr.callee.property?.name;
          if (["forEach", "map", "filter", "reduce", "some", "every", "flatMap"].includes(methodName)) {
            if (isPromiseAllArgument(callExpr)) {
              inPromiseAllCallback = false;
            } else {
              loopDepth--;
            }
          }
        }
      },

      // 関数呼び出しをチェック
      CallExpression(node) {
        checkCallExpression(node);
      },

      // awaitの中の関数呼び出しもチェック
      AwaitExpression(node) {
        if (node.argument?.type === "CallExpression") {
          checkCallExpression(node.argument);
        }
      },
    };
  },
};

export default rule;
