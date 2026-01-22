/**
 * @fileoverview features/ 内で他の features/ をインポートすることを禁止するルール
 * 複数featureをまたぐ処理は flows/ に切り出すことを推奨
 */

const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "features/ 内で他の features/ をインポートしないでください。複数featureをまたぐ処理は flows/ に切り出してください。",
      recommended: true,
    },
    messages: {
      noCrossFeatureImport:
        "[architecture-6] features/ 内で他の features/ をインポートしないでください。複数featureをまたぐ処理は flows/ に切り出してください。",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename || context.getFilename();

    // features/ 配下のファイルかどうかを判定
    const featuresMatch = filename.match(/[/\\]features[/\\]([^/\\]+)[/\\]/);
    if (!featuresMatch) {
      return {};
    }

    const currentFeature = featuresMatch[1];

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        // 相対パスで features/ をインポートしているかチェック
        // 例: '../../../user/query/get-user/handler' や '../../product/utils'
        if (importPath.includes("/features/") || importPath.match(/\.\.\/.*\.\.\//)) {
          // インポートパスから features 名を抽出
          const importFeaturesMatch = importPath.match(/features[/\\]([^/\\]+)[/\\]/);

          if (importFeaturesMatch) {
            const importedFeature = importFeaturesMatch[1];
            if (importedFeature !== currentFeature) {
              context.report({
                node,
                messageId: "noCrossFeatureImport",
              });
            }
          }
        }

        // 相対パスで上位に遡って別のfeatureをインポートしているかチェック
        // 例: '../../../user/...' のように複数階層戻るパターン
        if (importPath.startsWith("..")) {
          // パスを正規化して別featureかどうか判定
          const pathParts = importPath.split("/");
          let upCount = 0;
          for (const part of pathParts) {
            if (part === "..") {
              upCount++;
            } else {
              break;
            }
          }

          // 3階層以上戻る場合は別featureの可能性が高い
          // features/domain/command/operation/ から別featureへのアクセスを検出
          if (upCount >= 3) {
            // インポート先のディレクトリ名が現在のfeatureと異なるかチェック
            const remainingPath = pathParts.slice(upCount);
            if (remainingPath.length > 0) {
              const targetDir = remainingPath[0];
              // 他のfeatureディレクトリ名と思われる場合（command, query, utils, types以外）
              if (!["command", "query", "utils", "types", "shared", "adapter", "flows"].includes(targetDir)) {
                // 現在のファイルパスから判断して別featureへのアクセスか確認
                const currentPathParts = filename.split(/[/\\]/);
                const featuresIndex = currentPathParts.indexOf("features");
                if (featuresIndex !== -1 && currentPathParts[featuresIndex + 1] !== targetDir) {
                  context.report({
                    node,
                    messageId: "noCrossFeatureImport",
                  });
                }
              }
            }
          }
        }
      },
    };
  },
};

export default rule;
