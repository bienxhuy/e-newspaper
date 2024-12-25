import express from "express";
import categoryService from "../../services/categoryService.js";
import editorCategoriesService from "../../services/editorCategoriesService.js";

const router = express.Router();

router.get('/', async function (req, res) {
    const editors = await editorCategoriesService.getAllEditorCategoriesFullDetail();
    res.render('vwAdmin/editorCategory/editor-category-menu', {
        layout: 'admin',
        editorCategory: true,
        editors: editors,
    });
});

router.get('/edit', async function (req, res) {
    const editorId = req.query.editorId;
    const categoryTree = await categoryService.getCategoryTree();
    let catList = await editorCategoriesService.getOnlyEditorCategories(editorId);
    catList = catList.map(cat => cat.category_id);
    categoryTree.forEach(parentCat => {
        parentCat.children.forEach(childCat => {
            if (catList.includes(childCat.id)) {
                childCat.selected = true;
            }
        });
    });
    if (req.session.updateEditorCategory === null || undefined) {
        res.render('vwAdmin/editorCategory/editor-category-edit', {
            layout: 'admin',
            editorCategory: true,
            cData: categoryTree,
            editorId: editorId,
        });
    }
    res.render('vwAdmin/editorCategory/editor-category-edit', {
        layout: 'admin',
        editorCategory: true,
        cData: categoryTree,
        editorId: editorId,
        updateEditorCategory: req.session.updateEditorCategory,
    });
});

router.post('/edit', async function (req, res) {
    let newCategories = req.body.newCategories;
    newCategories = newCategories.map(Number);
    const editorId = +req.query.editorId;
    const ret = await editorCategoriesService.updateCategoriesForEditor(editorId, newCategories);

    if (ret) {
        req.session.updateEditorCategory = true;
    } else {
        req.session.updateEditorCategory = false;
    }
    res.redirect(`/admin/editor-category/edit?editorId=${editorId}`);

});

export default router;