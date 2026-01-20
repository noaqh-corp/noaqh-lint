/**
 * @fileoverview .server.ts / .server.js では try-catch を使用しないルール
 * エラーは hooks.server.ts で一括ハンドリングすることを推奨
 */

const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        ".server.ts / .server.js では try-catch を使用しないでください。エラーは hooks.server.ts で一括ハンドリングしてください。",
      recommended: true,
    },
    messages: {
      noTryCatch:
        "[error-1] .server.ts / .server.js では try-catch を使用しないでください。エラーは hooks.server.ts で一括ハンドリングしてください。",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename || context.getFilename();
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
      TryStatement(node) {
        context.report({
          node,
          messageId: "noTryCatch",
        });
      },
    };
  },
};

export default rule;
