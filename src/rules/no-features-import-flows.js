/**
 * @fileoverview features/ 内から flows/ をインポートすることを禁止するルール
 * flows/ は features/ を組み合わせる層であり、依存関係は flows -> features の方向であるべき
 */

const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "features/ 内から flows/ をインポートしないでください。依存関係は flows -> features の方向であるべきです。",
      recommended: true,
    },
    messages: {
      noFeaturesImportFlows:
        "[architecture-6] features/ 内から flows/ をインポートしないでください。依存関係は flows -> features の方向であるべきです。",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename || context.getFilename();

    // features/ 配下のファイルかどうかを判定
    const featuresMatch = filename.match(/[/\\]features[/\\]/);
    if (!featuresMatch) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        // flows/ へのインポートをチェック
        // 絶対パス形式: @/flows/, ~/flows/, 等
        // 相対パス形式: ../flows/, ../../flows/, 等
        if (
          importPath.includes("/flows/") ||
          importPath.includes("\\flows\\") ||
          importPath.match(/^flows\//)
        ) {
          context.report({
            node,
            messageId: "noFeaturesImportFlows",
          });
        }
      },
    };
  },
};

export default rule;
