import db from "../utils/db.js";
import categoryService from "./categoryService.js";
import tagService from "./tagService.js";
import helper from "../utils/helper.js";
// import { isPresent } from "openai/lib/chatCompletionUtils.mjs";

let now = new Date().toISOString();
export default {
    async getArticlesByCat(catId, limit, offset) {
        //Lấy tất cả các báo theo category ra
        let childCats = await categoryService.getChildCategories(catId);
        if (childCats.length !== 0) {
            childCats = childCats.map(cat => cat.id);
            childCats.push(catId);
        } else {
            childCats = Array.of(catId);
        }
        let articlesList = await db('articles')
            .where('articles.is_available', 1)
            .where('articles.publish_date', '<', now)
            .orderBy('is_premium', 'desc')
            .join('articles_categories', 'articles.id', 'articles_categories.article_id')
            .whereIn('articles_categories.category_id', childCats)
            .distinct('articles.id')
            .select('articles.id', 'articles.title', 'articles.abstract', 'articles.main_thumb', 'articles.id as article_id', 'articles.publish_date', 'is_premium')
            .limit(limit).offset(offset);
        // Với mỗi aricle thì thêm category names và tag names cho nó
        return this.getCatsAndTagsForAnArticle(articlesList);
    },

    async getCatsAndTagsForAnArticle(articlesList) {
        articlesList = await Promise.all(articlesList.map(async (article) => {
            article.categoryList = (await categoryService.getCategoryListFromAnArticle(article.id));
            article.tagList = (await tagService.getTagListFromAnArticle(article.id));
            return article;
        }));

        //Lười quá nên đây để xử lý time lun

        articlesList = articlesList.map((article) => {
            article.publish_date = helper.formatDateTime(article.publish_date)
            return article;
        });

        return articlesList;
    },
    async getCatsAndTagsForAnArticleNoModificationDateTime(articlesList) {
        articlesList = await Promise.all(articlesList.map(async (article) => {
            article.categoryList = (await categoryService.getCategoryListFromAnArticle(article.id));
            article.tagList = (await tagService.getTagListFromAnArticle(article.id));
            return article;
        }));
        return articlesList;
    },
    async countByCatId(catId) {
        let childCats = await categoryService.getChildCategories(catId);
        if (childCats.length !== 0) {
            childCats = childCats.map(cat => cat.id);
            childCats.push(catId);
        } else {
            childCats = Array.of(catId);
        }
        return db('articles')
            .where('articles.is_available', 1)
            .where('articles.publish_date', '<', now)
            .join('articles_categories', 'articles.id', 'articles_categories.article_id')
            .whereIn('articles_categories.category_id', childCats)
            .count('* as quantity')
            .first();
    },
    countByTagId(tagId) {
        return db('articles_tags')
            .where('articles_tags.tag_id', tagId)
            .join('articles', 'articles_tags.article_id', 'articles.id')
            .where('is_available', 1)
            .where('publish_date', '<', now)
            .count('* as quantity')
            .first();
    },
    async getArticlesByKeywords(keywords, limit, offset) {
        let articlesList = await db('articles')
            .where('is_available', 1)
            .where('publish_date', '<', now)
            .orderBy('is_premium', 'desc')
            .whereRaw('MATCH(title,content,abstract) against (? in natural language mode)', [keywords])
            .limit(limit)
            .offset(offset)
            .select('id', 'title', 'abstract', 'main_thumb', 'content', 'articles.id as article_id', 'publish_date', 'is_premium');
        articlesList = await this.getCatsAndTagsForAnArticle(articlesList);


        return articlesList;
    },
    async countByKeywords(keywords) {
        return db('articles')
            .where('is_available', 1)
            .where('publish_date', '<', now)
            .whereRaw('MATCH(title,content,abstract) against (? in natural language mode)', [keywords])
            .count('* as quantity')
            .first();
    },

    async getArticlesByTags(tagId, limit, offset) {
        let articlesList = await db('articles')
            .where('articles_tags.tag_id', tagId)
            .where('is_available', 1)
            .where('publish_date', '<', now)
            .orderBy('is_premium', 'desc')
            .limit(limit)
            .offset(offset)
            .join('articles_tags', 'articles.id', 'articles_tags.article_id')
            .select('articles.id', 'title', 'abstract', 'main_thumb', 'content', 'articles.id as article_id', 'publish_date', 'is_premium');
        return this.getCatsAndTagsForAnArticle(articlesList);
    },

    async getNewestArticles(limit, offset) {
        //Lấy tất cả các báo theo category ra
        let articlesList = await db('articles')
            .where('is_available', 1)
            .where('publish_date', '<', now)
            .orderBy('publish_date', 'desc')
            .orderBy('is_premium', 'desc')
            .limit(limit)
            .offset(offset)
            .select('id', 'title', 'abstract', 'main_thumb', 'articles.id as article_id', 'publish_date', 'is_premium');
        // Với mỗi aricle thì thêm category names và tag names cho nó
        return this.getCatsAndTagsForAnArticle(articlesList);
    },
    count() {
        return db('articles')
            .where('is_available', 1)
            .where('publish_date', '<', now)
            .count('* as quantity')
            .first();
    },
    async getRandomSameCatArticles(root_article_id, category_id_list, amount) {
        // Fetch random article IDs
        const randomSameCatArticlesId = await db('articles_categories')
            .whereIn('category_id', category_id_list)
            .whereNot('article_id', root_article_id)
            .leftJoin('articles', 'article_id', '=', 'articles.id')
            .where('is_available', '=', '1')
            .where('publish_date', '<', db.raw('CURRENT_TIMESTAMP'))
            .pluck('article_id')
            .orderByRaw('RAND()')
            .limit(amount);

        if (randomSameCatArticlesId.length === 0) {
            return [];
        }

        // Get articles's details
        const randomArticles = await db('articles')
            .whereIn('id', randomSameCatArticlesId)
            .select('id', 'title', 'main_thumb', 'is_premium', 'publish_date');

        return randomArticles;
    },
    async getTopViewArticlesWithCat(amount) {
        const topViewsArticlesId = await db('articles')
            .where('is_available', '=', '1')
            .where('publish_date', '<', db.raw('CURRENT_TIMESTAMP'))
            .orderBy('view_count', 'desc')
            .limit(amount)
            .pluck('id');

        if (topViewsArticlesId.length === 0) {
            return [];
        }

        const topViewsArticlesRawData = await db('articles')
            .whereIn('articles.id', topViewsArticlesId)
            .leftJoin('articles_categories', 'articles.id', '=', 'articles_categories.article_id')
            .leftJoin('categories', 'articles_categories.category_id', '=', 'categories.id')
            .select(
                'articles.id',
                'articles.title',
                'articles.publish_date',
                'articles.main_thumb',
                'articles.view_count',
                'articles.is_premium',
                'categories.id as category_id',
                'categories.name as category_name',
            );

        let topViewsArticlesMap = {};
        topViewsArticlesRawData.forEach(row => {
            if (!topViewsArticlesMap[row.id]) {
                topViewsArticlesMap[row.id] = {
                    id: row.id,
                    title: row.title,
                    publish_date: row.publish_date,
                    main_thumb: row.main_thumb,
                    is_premium: row.is_premium,
                    view_count: row.view_count,
                    categories: [],
                };
            }

            if (row.category_id && !topViewsArticlesMap[row.id].categories.some(cat => cat.id === row.category_id)) {
                topViewsArticlesMap[row.id].categories.push({
                    id: row.category_id,
                    name: row.category_name,
                });
            }
        });

        return Object.values(topViewsArticlesMap);
    },

    async getNewestArticlesWithCat(amount) {
        const newestArticlesRawData = await db('articles')
            .where('is_available', '=', '1')
            .where('publish_date', '<', db.raw('CURRENT_TIMESTAMP'))
            .orderBy('publish_date', 'desc')
            .limit(amount)
            .leftJoin('articles_categories', 'articles.id', 'articles_categories.article_id')
            .leftJoin('categories', 'articles_categories.category_id', 'categories.id')
            .select(
                'articles.id',
                'articles.title',
                'articles.publish_date',
                'articles.main_thumb',
                'articles.abstract',
                'articles.is_premium',
                'categories.id as category_id',
                'categories.name as category_name',
            );

        if (newestArticlesRawData.length === 0) {
            return [];
        }

        let newstArticlesMap = {};
        newestArticlesRawData.forEach(row => {
            if (!newstArticlesMap[row.id]) {
                newstArticlesMap[row.id] = {
                    id: row.id,
                    title: row.title,
                    publish_date: row.publish_date,
                    main_thumb: row.main_thumb,
                    abstract: row.abstract,
                    is_premium: row.is_premium,
                    categories: [],
                };
            }

            if (row.category_id && !newstArticlesMap[row.id].categories.some(cat => cat.id === row.category_id)) {
                newstArticlesMap[row.id].categories.push({
                    id: row.category_id,
                    name: row.category_name,
                });
            }
        });

        return Object.values(newstArticlesMap).sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date));
    },

    async getNewestArticleOfTopCats(amount) {
        const topCats = await categoryService.getTopViewCategories(10);
        let newestArticlesOfTopCat = await Promise.all(
            topCats.map(async (cat) => {
                if (cat.total_views !== null) {
                    return {
                        catId: cat.category_id,
                        catName: cat.category_name,
                        total_views: cat.total_views,
                        article: await this.getNewestArticleByCat(cat.category_id)
                    };
                }
            })
        );
        return newestArticlesOfTopCat.filter(cat => cat !== undefined);
    },

    async getNewestArticleByCat(catId) {
        return db('articles')
            .where('is_available', '=', '1')
            .where('publish_date', '<', db.raw('CURRENT_TIMESTAMP'))
            .leftJoin('articles_categories', 'articles.id', 'articles_categories.article_id')
            .where('articles_categories.category_id', '=', catId)
            .orderBy('articles.publish_date', 'desc')
            .first()
            .select(
                'articles.id as id',
                'articles.title as title',
                'articles.main_thumb as main_thumb',
                'articles.publish_date as publish_date',
                'articles.is_premium as is_premium',
            );
    },

    async getTopWeekArticlesWithCat(amount) {
        // Get ID of top week
        const topWeekViewArticlesIdAndView = await db('views')
            .where('vwDate', '<', db.raw('CURRENT_TIMESTAMP'))
            .where('vwDate', '>=', db.raw('DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 7 DAY)'))
            .select('article_id')
            .sum('vwCounts as total_views')
            .groupBy('article_id')
            .orderBy('total_views', 'desc')
            .limit(amount);

        if (topWeekViewArticlesIdAndView.length === 0) {
            return [];
        }

        const articleIds = topWeekViewArticlesIdAndView.map(row => row.article_id);
        // Fetch data TABLE
        const rawData = await db('articles')
            .where('is_available', '=', '1')
            .where('publish_date', '<', db.raw('CURRENT_TIMESTAMP'))
            .whereIn('articles.id', articleIds)
            .leftJoin('articles_categories', 'articles.id', 'articles_categories.article_id')
            .leftJoin('categories', 'articles_categories.category_id', 'categories.id')
            .select(
                'articles.id',
                'articles.title',
                'articles.publish_date',
                'articles.main_thumb',
                'articles.is_premium',
                'categories.id as category_id',
                'categories.name as category_name',
            );

        // Group each row based on article ID
        let groupedData = {};
        rawData.forEach(row => {
            if (!groupedData[row.id]) {
                groupedData[row.id] = {
                    id: row.id,
                    title: row.title,
                    publish_date: row.publish_date,
                    main_thumb: row.main_thumb,
                    is_premium: row.is_premium,
                    categories: [],
                };
            }

            if (row.category_id && !groupedData[row.id].categories.some(cat => cat.id === row.category_id)) {
                groupedData[row.id].categories.push({
                    id: row.category_id,
                    name: row.category_name,
                });
            }
        });

        // Add views for each row
        topWeekViewArticlesIdAndView.forEach(row => {
            groupedData[row.article_id].total_views = row.total_views;
        });

        return Object.values(groupedData);
    },

    // =============================
    // PHẦN NÀY BÊN CHỨC NĂNG WRITER
    // =============================

    async getAvailableOfWriterByWriterId(id) {
        // Available list along with category list of each article (each article can have many categories)
        const articlesWithCategories = await db('articles')
            .where({ writer_id: id, is_available: 1 })
            .leftJoin('articles_categories', 'articles.id', 'articles_categories.article_id')
            .leftJoin('categories', 'articles_categories.category_id', 'categories.id')
            .leftJoin('articles_tags', 'articles.id', 'articles_tags.article_id')
            .leftJoin('tags', 'articles_tags.tag_id', 'tags.id')
            .select(
                'articles.id',
                'articles.title',
                'articles.abstract',
                'articles.main_thumb',
                'articles.publish_date',
                'articles.is_premium',
                'categories.id as category_id',
                'categories.name as category_name',
                'tags.id as tag_id',
                'tags.name as tag_name',
            );

        // Group categories by article
        const articlesMap = {};
        articlesWithCategories.forEach(row => {
            if (!articlesMap[row.id]) {
                articlesMap[row.id] = {
                    id: row.id,
                    title: row.title,
                    abstract: row.abstract,
                    main_thumb: row.main_thumb,
                    publish_date: row.publish_date,
                    is_premium: row.is_premium,
                    is_published: row.publish_date < Date.now(),
                    categories: [],
                    tags: [],
                };
            }

            if (row.category_id && row.category_name &&
                !articlesMap[row.id].categories.some(c => c.id === row.category_id)) {
                articlesMap[row.id].categories.push({
                    id: row.category_id,
                    name: row.category_name
                });
            }

            if (row.tag_id && row.tag_name &&
                !articlesMap[row.id].tags.some(t => t.id === row.tag_id)) {
                articlesMap[row.id].tags.push({
                    id: row.tag_id,
                    name: row.tag_name
                });
            }
        });

        // Dump to list
        return Object.values(articlesMap);
    },
    async getDraftOfWriterByWriterId(id) {
        // Draft list along with category list of each article (each article can have many categories)
        const draftsWithCategories = await db('articles')
            .where({writer_id: id, is_available: 0})
            .join('drafts', 'articles.id', 'drafts.article_id')
            .leftJoin('articles_categories', 'articles.id', 'articles_categories.article_id')
            .leftJoin('categories', 'articles_categories.category_id', 'categories.id')
            .leftJoin('articles_tags', 'articles.id', 'articles_tags.article_id')
            .leftJoin('tags', 'articles_tags.tag_id', 'tags.id')
            .select(
                'articles.id',
                'articles.title',
                'articles.abstract',
                'articles.main_thumb',
                'articles.is_premium',
                'drafts.status as status',
                'categories.id as category_id',
                'categories.name as category_name',
                'tags.id as tag_id',
                'tags.name as tag_name',
            );

        // Group categories by article
        const articlesMap = {};
        draftsWithCategories.forEach(row => {
            if (!articlesMap[row.id]) {
                articlesMap[row.id] = {
                    id: row.id,
                    title: row.title,
                    abstract: row.abstract,
                    main_thumb: row.main_thumb,
                    is_premium: row.is_premium,
                    is_creating: row.status === 'creating',
                    is_pending: row.status === 'pending',
                    is_rejected: row.status === 'rejected',
                    categories: [],
                    tags: [],
                };
            }

            if (row.category_id && row.category_name &&
                !articlesMap[row.id].categories.some(c => c.id === row.category_id)) {
                articlesMap[row.id].categories.push({
                    id: row.category_id,
                    name: row.category_name
                });
            }

            if (row.tag_id && row.tag_name &&
                !articlesMap[row.id].tags.some(t => t.id === row.tag_id)) {
                articlesMap[row.id].tags.push({
                    id: row.tag_id,
                    name: row.tag_name
                });
            }
        });

        // Dump to list
        return Object.values(articlesMap);
    },
    async getFullDraftInfoById(id) {
        // Retrieve infor of draft from database
        const fullInfoDraft = await db('articles')
            .where('articles.id', id)
            .join('writers', 'articles.writer_id', 'writers.user_id')
            .leftJoin('drafts', 'articles.id', 'drafts.article_id')
            .leftJoin('articles_categories', 'articles.id', 'articles_categories.article_id')
            .leftJoin('categories', 'articles_categories.category_id', 'categories.id')
            .leftJoin('articles_tags', 'articles.id', 'articles_tags.article_id')
            .leftJoin('tags', 'articles_tags.tag_id', 'tags.id')
            .select(
                'articles.*',
                'writers.pseudonym as writer_pseudonym',
                'drafts.status',
                'drafts.reject_reason',
                'drafts.date as last_modified',
                'categories.id as category_id',
                'tags.id as tag_id',
            );

        // Group categories and tags
        const draftMap = {};
        fullInfoDraft.forEach(row => {
            if (!draftMap[row.id]) {
                draftMap[row.id] = {
                    id: row.id,
                    title: row.title,
                    abstract: row.abstract,
                    main_thumb: row.main_thumb,
                    content: row.content,
                    is_premium: row.is_premium,
                    is_available: row.is_available,
                    writer_id: row.writer_id,
                    writer_pseudonym: row.writer_pseudonym,
                    status: row.status,
                    reject_reason: row.reject_reason,
                    last_modified: row.last_modified,
                    categories: [],
                    tags: [],
                };
            }

            // Add category if it exists
            if (row.category_id && !draftMap[row.id].categories.includes(row.category_id)) {
                draftMap[row.id].categories.push(row.category_id);
            }

            // Add tag if it exists
            if (row.tag_id && !draftMap[row.id].tags.includes(row.tag_id)) {
                draftMap[row.id].tags.push(row.tag_id);
            }
        });

        // Dump to an object
        return (Object.values(draftMap))[0];
    },
    async getFullArticleInfoById(id) {
        // Retrieve article information
        const fullInfoArticle = await db('articles')
            .where('articles.id', id)
            .leftJoin('writers', 'articles.writer_id', 'writers.user_id')
            .leftJoin('articles_categories', 'articles.id', 'articles_categories.article_id')
            .leftJoin('categories', 'articles_categories.category_id', 'categories.id')
            .leftJoin('articles_tags', 'articles.id', 'articles_tags.article_id')
            .leftJoin('tags', 'articles_tags.tag_id', 'tags.id')
            .select(
                'articles.*',
                'writers.pseudonym as writer_pseudonym',
                'categories.id as cat_id',
                'categories.name as cat_name',
                'tags.id as tag_id',
                'tags.name as tag_name'
            );

        if (!fullInfoArticle.length) {
            return null; // Return null if no data found
        }

        const article = {
            id: fullInfoArticle[0].id,
            title: fullInfoArticle[0].title,
            abstract: fullInfoArticle[0].abstract,
            main_thumb: fullInfoArticle[0].main_thumb,
            content: fullInfoArticle[0].content,
            is_premium: fullInfoArticle[0].is_premium,
            is_available: fullInfoArticle[0].is_available,
            publish_date: fullInfoArticle[0].publish_date,
            writer_id: fullInfoArticle[0].writer_id,
            writer_pseudonym: fullInfoArticle[0].writer_pseudonym,
            view_count: fullInfoArticle[0].view_count,
            categories: [],
            tags: [],
        };

        const categorySet = new Set();
        const tagSet = new Set();

        fullInfoArticle.forEach(row => {
            if (row.cat_id && !categorySet.has(row.cat_id)) {
                article.categories.push({ id: row.cat_id, name: row.cat_name });
                categorySet.add(row.cat_id);
            }
            if (row.tag_id && !tagSet.has(row.tag_id)) {
                article.tags.push({ id: row.tag_id, name: row.tag_name });
                tagSet.add(row.tag_id);
            }
        });

        return article;
    },
    // Update information of draft
    async patchArticle(id, entity, categories, tags) {
        try {
            // Kiểm tra đầu vào (entity)
            if (!entity || !tags || !categories) {
                throw new Error('Invalid entity data');
            }

            // Delete old article_tag and article_category 
            const deleteTags = db('articles_tags').where('article_id', id).del();
            const deleteCategories = db('articles_categories').where('article_id', id).del();

            // Add new article_tag and article_category 
            const addTags = tags.map(tag =>
                db('articles_tags').insert({ article_id: id, tag_id: tag })
            );
            const addCategories = categories.map(cat =>
                db('articles_categories').insert({ article_id: id, category_id: cat })
            );

            // Update article
            if (entity.publish_date && entity.publish_date === 'need update') {
                entity.publish_date = db.raw('CURRENT_TIMESTAMP');
            }
            const updateArticle = db('articles').where('id', id).update(entity);

            // Wait all to complete
            await Promise.all([
                deleteTags,
                deleteCategories,
                ...addTags,
                ...addCategories,
                updateArticle
            ]);

            console.log('Article updated successfully');
        } catch (error) {
            console.error('Error updating article:', error);
            throw error;
        }
    },
    patchDraft(id, entity) {
        return db('drafts').where('article_id', id).update(entity);
    },
    delArticle(id) {
        return db('articles').where('id', id).del();
    },
    delDraft(id) {
        return db('drafts').where('article_id', id).del();
    },
    submitDraft(id) {
        let datetime = new Date();
        const formattedLocalTime = helper.formatFullDateTime(datetime);

        const entity = { status: 'pending', date: formattedLocalTime };
        return db('drafts').where('article_id', id).update(entity);
    },
    async createNewDraft(writerId) {
        const newArt = {
            main_thumb: '/static/images/others/test.webp',
            writer_id: writerId,
        }
        const result = await db('articles').insert(newArt);
        const artId = result[0];

        const draft = {
            status: 'creating',
            article_id: artId,
        };
        await db('drafts').insert(draft);

        return artId;
    },
    getPendingDraftsByCatId(catId) {
        return db('articles')
            .where('is_available', 0)
            .leftJoin('drafts', 'articles.id', '=', 'drafts.article_id')
            .where('drafts.status', 'pending')
            .leftJoin('articles_categories', 'articles.id', '=', 'articles_categories.article_id')
            .where('articles_categories.category_id', catId)
            .select(
                'articles.id as id',
                'articles.title as title',
                'articles.abstract as abstract',
                'articles.main_thumb as main_thumb',
                'articles.is_premium as is_premium',
                'drafts.date as submit_time',
            );
    },
    getArticlesList() {
        return db('articles').select('id', 'title', 'is_available', 'publish_date', 'is_premium');
    },

    deleteArticle(articleId) {
        return db('articles').where('id', articleId).delete();
    },
    getArticleTitleById(id) {
        return db('articles').where('id', '=', id).select('title').first();
    }
};
