/**
 * @fileoverview with~~という子テーブル取得専用メソッドを禁止するルール
 * リレーションの取得はincludeオプションで統合的に行うべき
 * @see [repository-7] in docs/review.md
 */

const rule = {
	meta: {
		type: "suggestion",
		docs: {
			description:
				"with~~という子テーブル取得専用メソッドを作成しないでください。includeオプションで統合してください。",
			recommended: true,
		},
		messages: {
			noWithRelationMethod:
				"[repository-7] 'with~~'という子テーブル取得専用メソッドを作成しないでください。includeオプションで統合してください。例: findByIdWithEbayListing → find({ id }, { ebayListing: true }) ※findは1件、searchは複数件を返す",
		},
		schema: [],
	},
	create(context) {
		// Repositoryファイルのみに適用
		const filename = context.filename || context.getFilename();
		if (!filename.includes("Repository")) {
			return {};
		}

		/**
		 * メソッド名が「With」を含むかチェック（大文字小文字を区別）
		 * 例: findByIdWithEbayListing, getProductWithRelations
		 */
		function hasWithPattern(name) {
			if (!name) return false;
			// "With" が含まれているかチェック（キャメルケースで使われる場合）
			return /With[A-Z]/.test(name);
		}

		function reportIfWithPattern(node, name) {
			if (hasWithPattern(name)) {
				context.report({
					node,
					messageId: "noWithRelationMethod",
				});
			}
		}

		return {
			// メソッド定義: class { findByIdWithEbayListing() {} }
			MethodDefinition(node) {
				if (node.key && node.key.type === "Identifier") {
					reportIfWithPattern(node, node.key.name);
				}
			},

			// 関数宣言: function findByIdWithEbayListing() {}
			FunctionDeclaration(node) {
				if (node.id && node.id.type === "Identifier") {
					reportIfWithPattern(node, node.id.name);
				}
			},

			// 変数宣言 (アロー関数): const findByIdWithEbayListing = () => {}
			VariableDeclarator(node) {
				if (
					node.id &&
					node.id.type === "Identifier" &&
					node.init &&
					(node.init.type === "ArrowFunctionExpression" ||
						node.init.type === "FunctionExpression")
				) {
					reportIfWithPattern(node, node.id.name);
				}
			},

			// オブジェクトプロパティ (メソッド): { findByIdWithEbayListing: async () => {} }
			Property(node) {
				if (
					node.key &&
					node.key.type === "Identifier" &&
					node.value &&
					(node.value.type === "ArrowFunctionExpression" ||
						node.value.type === "FunctionExpression")
				) {
					reportIfWithPattern(node, node.key.name);
				}
			},
		};
	},
};

export default rule;
