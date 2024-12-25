import db from "../utils/db.js";

export default {
    getEditorCategories(userId) {
        return db('editors_categories').where('editor_id', userId);
    },
    getEditorCategoryNames(userId) {
        return db('editors_categories')
            .where('editors_categories.editor_id', userId)
            .join('categories', 'editors_categories.category_id', '=', 'categories.id')
            .select('categories.name');
    },
    async getEditorCategoriesFullDetail(userId) {
        const rawEditorCatList = await db('editors_categories')
            .where('editor_id', userId)
            .join('categories', 'editors_categories.category_id', '=', 'categories.id')
            .leftJoin('categories as parents', 'categories.parent_id', '=', 'parents.id')
            .select(
                'categories.id as id',
                'categories.name as name',
                'categories.parent_id as parent_id',
                'parents.name as parent_name'
            );

        const tree = {};

        rawEditorCatList.forEach(cat => {
            // Nếu là danh mục cha hoặc cha chưa tồn tại trong tree
            if (!tree[cat.parent_id]) {
                tree[cat.parent_id] = {
                    id: cat.parent_id,
                    name: cat.parent_name || 'Lỗi danh mục',
                    children: [],
                };
            }

            // Thêm danh mục con vào cha
            tree[cat.parent_id].children.push({
                id: cat.id,
                name: cat.name,
                parent_id: cat.parent_id,
            });
        });

        return Object.values(tree);
    },
    async getOnlyEditorCategories(editorId) {
        return db('editors_categories').where('editor_id', editorId)
            .join('categories', 'editors_categories.category_id', 'categories.id')
            .select('categories.name', 'editors_categories.category_id');
    },


    async getAllEditorCategoriesFullDetail() {
        let editors = await db('users').where('role', 'editor');


        editors = await Promise.all(editors.map(async editor => {
            editor.categories = await this.getOnlyEditorCategories(editor.id);
            return editor;
        }));

        return editors;
    },

    addEditorCategory(entity, trx) {
        return db('editors_categories').transacting(trx).insert(entity);
    },

    async updateCategoriesForEditor(editorId, newCategories) {
        const trx = await db.transaction();
        try {
            const deleteOldCategory =await db('editors_categories').where('editor_id', editorId).transacting(trx).delete();
            if (!deleteOldCategory) {
                throw Error("Error in delete old categories");
            }

            const addPromise =
                newCategories.map(async (newCat) => await this.addEditorCategory({
                        editor_id: editorId,
                        category_id: newCat,
                    },trx)
                )

            const addNewCat = await Promise.all(addPromise);
            if (!addNewCat) {
                throw Error("Error in add new categories");
            }
            await trx.commit();
            return true;
        } catch (e) {
            await trx.rollback();
            console.log('Error in editor-category__updateCategoriesForEditor ', e);
            return false;

        }

    },
};