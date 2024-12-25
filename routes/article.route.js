import express from "express";
import categoryService from "../services/categoryService.js";
import articleService from "../services/articleService.js";
import tagService from "../services/tagService.js";
import commentService from "../services/commentService.js";
import moment from "moment";
import helper from "../utils/helper.js";
import os from "os";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import subscriberService from "../services/subscriberService.js";

const router = express.Router();
// Limit for each page
const limit = 10;

router.get("/", async function (req, res) {
  // Authorization
  const isAuth = req.session.user !== undefined;
  let isWriter,
    isEditor,
    isAdmin = false;
  if (isAuth) {
    isWriter = req.session.user.role === "writer";
    isEditor = req.session.user.role === "editor";
    isAdmin = req.session.user.role === "admin";
  }

  // Data for homepage
  const categoryTree = await categoryService.getCategoryTree();
  const topViewArticles = await articleService.getTopViewArticlesWithCat(10);
  const newestArticles = await articleService.getNewestArticlesWithCat(10);
  const newestArticlesOfTopCat = await articleService.getNewestArticleOfTopCats(
    10
  );
  const topWeekArticles = await articleService.getTopWeekArticlesWithCat(4);

  res.render("vwHome/home", {
    layout: "home",
    title: "Tuổi Già Offline",
    isAuth: isAuth,
    isWriter: isWriter,
    isEditor: isEditor,
    isWriter: isWriter,
    isAdmin: isAdmin,
    categoryTree: categoryTree,
    topViewArticles: topViewArticles,
    newestArticles: newestArticles,
    newestArticlesOfTopCat: newestArticlesOfTopCat,
    topWeekArticles: topWeekArticles,
  });
});

// ../article?id=
router.get("/article", async function (req, res) {
  // Get article id
  const articleId = +req.query.id || 0;
  if (articleId === 0) {
    const script = `
        <script>
            alert('Vui lòng nhập ID bài viết khi truy cập bằng phương thức này.');
            window.location.href = '/';
        </script>
        `;
    return res.send(script);
  }

  // Get article information from database
  const fullInfoArticle = await articleService.getFullArticleInfoById(
    articleId
  );
  if (!fullInfoArticle) {
    const script = `
        <script>
            alert('Bài viết không tồn tại!');
            window.location.href = '/';
        </script>
        `;
    return res.send(script);
  }
  if (fullInfoArticle.is_premium) {
    let user = await subscriberService.getVipStatus(req.session.user.id);
    if (user.vipStatus !== "active") {
      const script = `
        <script>
            alert('Bạn không phải là thành viên Premium để đọc bài này.');
            window.location.href = '/';
        </script>
    `;
      return res.send(script);
    }
  }

  // Get comments of article
  const articleComments =
    await commentService.fetchCommentsOfArticleByArticleId(articleId);
  articleComments.forEach((comment) => {
    if (!comment.user) {
      comment.user = "Vô Danh";
    }
  });

  // Get relevants articles
  // Get category IDs of main article first
  const catIDsList = fullInfoArticle.categories.map((row) => row.id);
  // Query to fetch data
  const relevantArticles = await articleService.getRandomSameCatArticles(
    articleId,
    catIDsList,
    5
  );
  const noRelevantArticles = relevantArticles.length === 0;

  res.render("vwHome/article", {
    layout: "home",
    article: fullInfoArticle,
    comments: articleComments,
    commentCount: articleComments.length,
    relevantArticles: relevantArticles,
    noRelevantArticles: noRelevantArticles,
  });
});

router.get("/cat", async function (req, res) {
  const catId = +req.query.catId || 6;

  const page = +req.query.page || 1;
  const offset = (page - 1) * limit;

  const childCats = await categoryService.getChildCategories(catId);

  const category = await categoryService.getCategory(catId);

  const paginationVars = await helper.paginationVars(
    catId,
    limit,
    offset,
    page,
    articleService.getArticlesByCat,
    articleService.countByCatId
  );

  res.render("vwHome/articleListByCat", {
    layout: "home",
    mainCat: category,
    childCats: childCats,
    articles: paginationVars.articles,
    empty: paginationVars.articles.length === 0,
    page_items: paginationVars.page_items,
    catId: catId,
    prevPage: paginationVars.prevPage,
    nextPage: paginationVars.nextPage,
  });
});

router.get("/search", async function (req, res) {
  const page = +req.query.page || 1;
  const offset = (page - 1) * limit;
  const keywords = req.query.keywords.trimEnd();
  const paginationVars = await helper.paginationVars(
    keywords,
    limit,
    offset,
    page,
    articleService.getArticlesByKeywords,
    articleService.countByKeywords
  );
  res.render("vwHome/articleListByKeywords", {
    layout: "home",
    empty: paginationVars.articles.length === 0,
    page_items: paginationVars.page_items,
    prevPage: paginationVars.prevPage,
    nextPage: paginationVars.nextPage,
    keywords: keywords,
    articles: paginationVars.articles,
  });
});

router.get("/tag", async function (req, res) {
  const tagId = +req.query.tagId || 1;
  const page = +req.query.page || 1;
  const offset = (page - 1) * limit;
  const tag = await tagService.getTagNameById(tagId);
  const paginationVars = await helper.paginationVars(
    tagId,
    limit,
    offset,
    page,
    articleService.getArticlesByTags,
    articleService.countByTagId
  );

  res.render("vwHome/articleListByTag", {
    layout: "home",
    tagName: tag.tagName,
    articles: paginationVars.articles,
    empty: paginationVars.articles.length === 0,
    page_items: paginationVars.page_items,
    tagId: tagId,
    prevPage: paginationVars.prevPage,
    nextPage: paginationVars.nextPage,
  });
});

router.get("/newest", async function (req, res) {
  const page = +req.query.page || 1;
  const offset = (page - 1) * limit;

  const paginationVars = await helper.paginationVars(
    null,
    limit,
    offset,
    page,
    articleService.getNewestArticles,
    articleService.count,
    "newest"
  );
  res.render("vwHome/articleNewest", {
    layout: "home",
    articles: paginationVars.articles,
    empty: paginationVars.articles.length === 0,
    page_items: paginationVars.page_items,
    prevPage: paginationVars.prevPage,
    nextPage: paginationVars.nextPage,
  });
});

router.get("/download-pdf", async (req, res) => {
  try {
    const articleId = req.query.id;
    if (!articleId) {
      return res.status(400).send("Thiếu id bài báo.");
    }

    const user = req.session.user;
    if (!user) {
      return res.send(`
        <script>
          alert('Bạn cần đăng nhập để tải file PDF.');
          window.location.href = window.location.href = '/article?id=${articleId}';
        </script>
      `);
    }

    const vipStatus = await subscriberService.getVipStatus(user.id);
    if (vipStatus.vipStatus !== "active") {
      return res.send(`
        <script>
          alert('Bạn cần là thành viên premium để tải file PDF.');
          window.location.href = window.location.href = '/article?id=${articleId}';
        </script>
      `);
    }

    // Lấy thông tin bài viết từ database
    const article = await articleService.getFullArticleInfoById(articleId);
    if (!article.is_premium) {
      return res.send(`
          <script>
            alert('Chỉ có thể tải được bài viết premium.');
            window.location.href = '/article?id=${articleId}';
          </script>
        `);
    }

    // Tạo đường dẫn đến file HTML (layout để render PDF)
    const htmlTemplatePath = path.join(
      process.cwd(),
      "static/template/pdfTemplate.html"
    );

    // Tạo đường dẫn đến ảnh thumbnail
    const fullImagePath = `file://${path.join(
      process.cwd(),
      article.main_thumb
    )}`;
    article.fullImagePath = fullImagePath;

    // Khởi chạy Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // Điều hướng đến file HTML
    await page.goto(`file://${htmlTemplatePath}`, {
      waitUntil: "domcontentloaded",
    });

    await page.waitForSelector("#article-title"); // Đảm bảo phần tử đã có mặt
    await page.evaluate((data) => {
      document.querySelector("#article-title").innerText = data.title;
      const categoryContainer = document.querySelector("#article-categories");
      data.categories.forEach((cat) => {
        const li = document.createElement("li");
        li.className = "breadcrumb-item active";
        li.innerHTML = `<a href="/cat?catId=${cat.id}" class="category-link">${cat.name}</a>`;
        categoryContainer.appendChild(li);
      });

      const tagContainer = document.querySelector("#article-tags");
      data.tags.forEach((tag) => {
        const span = document.createElement("li");
        span.className = "badge badge-pill badge-light tag-link";
        span.innerText = tag.name;
        tagContainer.appendChild(span);
      });

      document.querySelector(
        "#article-author"
      ).innerText = `Tác giả: ${data.writer_pseudonym}`;

      const options = {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour12: false,
      };
      const publishDate = new Date(data.publish_date).toLocaleString(
        "vi-VN",
        options
      );
      document.querySelector("#article-publish-date").innerText = publishDate;

      document.querySelector("#article-summary").innerText = data.abstract;

      document.querySelector("#article-thumbnail").src = data.fullImagePath;

      document.querySelector("#article-content").innerHTML = data.content;
    }, article);

    // Xác định thư mục Downloads
    const downloadsPath = path.join(os.homedir(), "Downloads");

    // Kiểm tra thư mục tồn tại, nếu không thì tạo mới
    if (!fs.existsSync(downloadsPath)) {
      fs.mkdirSync(downloadsPath);
    }

    // Kiểm tra xem file đã tồn tại
    let outputPath = path.join(downloadsPath, `article_${articleId}.pdf`);
    let fileIndex = 1;
    while (fs.existsSync(outputPath)) {
      outputPath = path.join(
        downloadsPath,
        `article_${articleId}(${fileIndex}).pdf`
      );
      fileIndex++;
    }

    // Lưu file PDF
    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
    });

    console.log(`PDF saved at: ${outputPath}`);
    await browser.close();

    // Trả về thông báo và chuyển hướng về trang bài viết
    res.send(`
        <script>
          alert('File PDF đã được lưu vào thư mục Downloads!');
          window.location.href = '/article?id=${articleId}';
        </script>
      `);
  } catch (error) {
    console.error("Lỗi:", error);
    res.status(500).send("Đã xảy ra lỗi trong quá trình tạo PDF.");
  }
});

export default router;
