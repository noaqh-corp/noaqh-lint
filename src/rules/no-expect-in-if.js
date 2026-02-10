/**
 * @fileoverview if文の中にexpectを書かないルール
 * 条件が満たされない場合にテストが通ってしまう可能性がある
 * @see [testing-2] in template/skills/review/reference/reliability.md
 */

const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "if文の中にexpectを書かないでください。条件が満たされない場合にテストが通ってしまいます。",
      recommended: true,
    },
    messages: {
      noExpectInIf:
        "[testing-2] if文の中にexpectを書かないでください。条件が満たされない場合にテストがパスしてしまいます。expectは常に実行されるようにしてください。",
    },
    schema: [],
  },
  create(context) {
    let ifDepth = 0;

    function isExpectCall(node) {
      // expect(...) の呼び出しを検出
      if (node.type === "CallExpression") {
        if (node.callee.type === "Identifier" && node.callee.name === "expect") {
          return true;
        }
        // expect(...).toBe(...) のようなチェーン呼び出し
        if (node.callee.type === "MemberExpression") {
          let obj = node.callee.object;
          while (obj.type === "CallExpression") {
            if (obj.callee.type === "Identifier" && obj.callee.name === "expect") {
              return true;
            }
            if (obj.callee.type === "MemberExpression") {
              obj = obj.callee.object;
            } else {
              break;
            }
          }
        }
      }
      return false;
    }

    return {
      IfStatement() {
        ifDepth++;
      },

      "IfStatement:exit"() {
        ifDepth--;
      },

      CallExpression(node) {
        if (ifDepth > 0 && isExpectCall(node)) {
          context.report({
            node,
            messageId: "noExpectInIf",
          });
        }
      },
    };
  },
};

export default rule;
