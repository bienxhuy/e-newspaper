/*
 Navicat Premium Dump SQL

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 100432 (10.4.32-MariaDB)
 Source Host           : localhost:3306
 Source Schema         : epaperdb

 Target Server Type    : MySQL
 Target Server Version : 100432 (10.4.32-MariaDB)
 File Encoding         : 65001

 Date: 25/12/2024 23:11:25
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `birth_date` date NULL DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `role` enum('guest','writer','editor','admin') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `email`(`email` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 14 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for apply
-- ----------------------------
DROP TABLE IF EXISTS `apply`;
CREATE TABLE `apply`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `role` enum('writer','editor') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `self_access` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `status` enum('pending','approved','rejected') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `apply_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for articles
-- ----------------------------
DROP TABLE IF EXISTS `articles`;
CREATE TABLE `articles`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `abstract` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `main_thumb` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `content` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `is_available` tinyint NULL DEFAULT 0,
  `publish_date` datetime NOT NULL,
  `is_premium` tinyint NULL DEFAULT 0,
  `writer_id` int NOT NULL,
  `view_count` int NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `writer_id`(`writer_id` ASC) USING BTREE,
  FULLTEXT INDEX `title`(`title`, `abstract`, `content`),
  CONSTRAINT `articles_ibfk_1` FOREIGN KEY (`writer_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 85 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for categories
-- ----------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `parent_id` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `parent_id`(`parent_id` ASC) USING BTREE,
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 39 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for tags
-- ----------------------------
DROP TABLE IF EXISTS `tags`;
CREATE TABLE `tags`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `name`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 71 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for articles_categories
-- ----------------------------
DROP TABLE IF EXISTS `articles_categories`;
CREATE TABLE `articles_categories`  (
  `article_id` int NOT NULL,
  `category_id` int NOT NULL,
  PRIMARY KEY (`article_id`, `category_id`) USING BTREE,
  INDEX `category_id`(`category_id` ASC) USING BTREE,
  CONSTRAINT `articles_categories_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `articles_categories_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for articles_tags
-- ----------------------------
DROP TABLE IF EXISTS `articles_tags`;
CREATE TABLE `articles_tags`  (
  `article_id` int NOT NULL,
  `tag_id` int NOT NULL,
  PRIMARY KEY (`article_id`, `tag_id`) USING BTREE,
  INDEX `tag_id`(`tag_id` ASC) USING BTREE,
  CONSTRAINT `articles_tags_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `articles_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for comments
-- ----------------------------
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `date` datetime NOT NULL,
  `article_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `article_id`(`article_id` ASC) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for drafts
-- ----------------------------
DROP TABLE IF EXISTS `drafts`;
CREATE TABLE `drafts`  (
  `status` enum('pending','approved','rejected','creating') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `date` datetime NOT NULL,
  `reject_reason` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `article_id` int NOT NULL,
  PRIMARY KEY (`article_id`) USING BTREE,
  INDEX `article_id`(`article_id` ASC) USING BTREE,
  CONSTRAINT `drafts_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for editor_history
-- ----------------------------
DROP TABLE IF EXISTS `editor_history`;
CREATE TABLE `editor_history`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `editor_id` int NOT NULL,
  `action` enum('approved','rejected') CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `extra` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL,
  `date` datetime NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `article_title` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK_EDITORS`(`editor_id` ASC) USING BTREE,
  CONSTRAINT `FK_EDITORS` FOREIGN KEY (`editor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for editors_categories
-- ----------------------------
DROP TABLE IF EXISTS `editors_categories`;
CREATE TABLE `editors_categories`  (
  `editor_id` int NOT NULL,
  `category_id` int NOT NULL,
  PRIMARY KEY (`editor_id`, `category_id`) USING BTREE,
  INDEX `category_id`(`category_id` ASC) USING BTREE,
  CONSTRAINT `editors_categories_ibfk_1` FOREIGN KEY (`editor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `editors_categories_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for saved_articles
-- ----------------------------
DROP TABLE IF EXISTS `saved_articles`;
CREATE TABLE `saved_articles`  (
  `user_id` int NOT NULL,
  `article_id` int NOT NULL,
  `saved_at` datetime NULL DEFAULT current_timestamp,
  PRIMARY KEY (`user_id`, `article_id`) USING BTREE,
  INDEX `article_id`(`article_id` ASC) USING BTREE,
  CONSTRAINT `saved_articles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `saved_articles_ibfk_2` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for subscribers
-- ----------------------------
DROP TABLE IF EXISTS `subscribers`;
CREATE TABLE `subscribers`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `subscribe_time` datetime NOT NULL,
  `outdate_time` datetime NOT NULL,
  `status` enum('active','waiting') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `subscribers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for views
-- ----------------------------
DROP TABLE IF EXISTS `views`;
CREATE TABLE `views`  (
  `article_id` int NOT NULL,
  `vwDate` date NOT NULL,
  `vwCounts` int NOT NULL,
  PRIMARY KEY (`article_id`, `vwDate`) USING BTREE,
  CONSTRAINT `views_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for writers
-- ----------------------------
DROP TABLE IF EXISTS `writers`;
CREATE TABLE `writers`  (
  `pseudonym` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`user_id`) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `writers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
