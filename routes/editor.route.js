import express from "express";
import editorCategoriesService from "../services/editorCategoriesService.js";
import articleService from "../services/articleService.js";
import categoryService from "../services/categoryService.js";
import tagService from "../services/tagService.js";
import editorHistory from "../services/editorHistory.js";

import { isEditorWorkAvailable, isEditorHasPermissonOnCategory, isEditorHasPermissionOnArticle } from "../middlewares/auth.mdw.js";

const router = express.Router();

router.get('/', isEditorWorkAvailable, async function (req, res) {
    res.redirect(`/editor/drafts?catId=${req.session.editor.minCategory.category_id}`);
});

// ../editor/drafts?catId=
router.get('/drafts', isEditorWorkAvailable, isEditorHasPermissonOnCategory, async function (req, res) {
    const editorId = req.session.user.id;
    const activeCatId = +req.query.catId || 0;
    if (activeCatId === 0) {
        activeCatId = req.editor.minCategory.category_id;
    }

    const categoryListOfEditor = await editorCategoriesService.getEditorCategoriesFullDetail(editorId);
    let activeCatName = "";
    let activeParentName = "";
    categoryListOfEditor.forEach(parentCat => {
        parentCat.children.forEach(cat => {
            if (activeCatId === cat.id) {
                cat.isActive = true;
                activeCatName = cat.name;
                activeParentName = parentCat.name;
            }
        });
    });

    const drafts = await articleService.getPendingDraftsByCatId(activeCatId);
    const isEmpty = drafts.length === 0;

    res.render('vwEditor/drafts', {
        layout: 'editor',
        title: 'Danh sách bài viết cần phê duyệt',
        catList: categoryListOfEditor,
        activeCatName: activeCatName,
        activeParentName: activeParentName,
        drafts: drafts,
        isEmpty: isEmpty
    });
});

// ../editor/drafts/view?id=
router.get('/drafts/view', isEditorWorkAvailable, isEditorHasPermissionOnArticle, async function (req, res) {
    // Get draft
    const draftId = +req.query.id || 0;
    const draft = await articleService.getFullDraftInfoById(draftId);

    // Invalid case: draft is published (editor try to access a published draft)
    if (draft.is_available === 1) {
        const script = `
        <script>
            alert('Bài viết đã được xuất bản.');
            window.location.href = '/editor';
        </script>
        `;
        return res.send(script);
    }

    // Prepare data for categories and tags
    // For approve action
    const categoryTree = await categoryService.getCategoryTree();
    const tagList = await tagService.getAll();
    const articleCatList = draft.categories;
    const articleTagList = draft.tags;

    // Configure selected categories and tags
    categoryTree.forEach(parentCat => {
        parentCat.children.forEach(childCat => {
            if (articleCatList.includes(childCat.id)) {
                childCat.selected = true;
            }
        });
    });

    tagList.forEach(tag => {
        if (articleTagList.includes(tag.id)) {
            tag.selected = true;
        }
    });

    res.render('vwEditor/draft-view', {
        layout: 'main',
        title: draft.title,
        draft: draft,
        cData: categoryTree,
        tData: tagList,
    });
});

// ../editor/approve?id=
router.post('/approve', isEditorWorkAvailable, isEditorHasPermissionOnArticle, async function (req, res) {
    const article_id = +req.query.id || 0;
    const newCategories = req.body.newCategories;
    const newTags = req.body.newTags;
    const articleChanges = {
        is_available: 1,
        publish_date: req.body.publish_time,
    };

    await articleService.patchArticle(article_id, articleChanges, newCategories, newTags);
    await articleService.delDraft(article_id);

    // Add edit history
    const editHistory = {
        article_title : (await articleService.getArticleTitleById(article_id)).title,
        editor_id: req.session.user.id,
        action: 'approved',
        extra: `${article_id}`,
    }
    await editorHistory.add(editHistory);

    res.redirect('/editor');
});

// ../editor/reject?id=
router.post('/reject', isEditorWorkAvailable, isEditorHasPermissionOnArticle, async function (req, res) {
    const article_id = +req.query.id || 0;
    const draftChanges = {
        status: 'rejected',
        reject_reason: req.body.reject_reason,
    }
    await articleService.patchDraft(article_id, draftChanges);
    
    // Add edit history
    const editHistory = {
        article_title : (await articleService.getArticleTitleById(article_id)).title,
        editor_id: req.session.user.id,
        action: 'rejected',
        extra: req.body.reject_reason,
    }
    await editorHistory.add(editHistory);

    res.redirect('/editor');
});

router.get('/history', isEditorWorkAvailable, async function (req, res) {
    const editorId = req.session.user.id;
    const categoryListOfEditor = await editorCategoriesService.getEditorCategoriesFullDetail(editorId);

    const history = await editorHistory.fetchHistoryOfEditorByEditorId(editorId);
    history.forEach(element => {
        if (element.action === 'rejected') {
            element.isRejected = true;
        }
        else {
            element.isApproved = true;
        }
    });

    res.render('vwEditor/history', {
        layout: 'editor',
        title: 'Lịch sử duyệt bài',
        catList: categoryListOfEditor,
        history: history,
        isHistoryEmpty: history.length === 0
    });
});

export default router;