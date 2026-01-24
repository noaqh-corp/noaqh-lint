/**
 * @fileoverview .server.ts / .server.js では prisma を直接使用しないルール
 * データベースアクセスはリポジトリ層を経由することを推奨
 */

const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        ".server.ts / .server.js では prisma を直接使用しないでください。データベースアクセスはリポジトリ層を経由してください。",
      recommended: true,
    },
    messages: {
      noPrisma:
        "[error-1] .server.ts / .server.js では prisma を直接使用しないでください。データベースアクセスはリポジトリ層を経由してください。",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    // hooks.server.ts は例外として許可（認証初期化などでprismaを使用するため）
    if (filename.includes("hooks.server.ts") || filename.includes("hooks.server.js")) {
      return {};
    }
    // .server.ts / .server.js で終わるファイル、または +server.ts / +server.js を対象にする
    const isServerFile =
      filename.endsWith(".server.ts") ||
      filename.endsWith(".server.js") ||
      filename.endsWith("+server.ts") ||
      filename.endsWith("+server.js");

    if (!isServerFile) {
      return {};
    }

    return {
      // @prisma/client からのインポートを検出
      ImportDeclaration(node) {
        if (
          node.source.value === "@prisma/client" ||
          node.source.value.includes("prisma")
        ) {
          context.report({
            node,
            messageId: "noPrisma",
          });
        }
      },
      // prisma.xxx のような呼び出しを検出
      MemberExpression(node) {
        if (
          node.object.type === "Identifier" &&
          node.object.name.toLowerCase() === "prisma"
        ) {
          context.report({
            node,
            messageId: "noPrisma",
          });
        }
      },
    };
  },
};

export default rule;
