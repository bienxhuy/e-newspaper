SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'Xuy Huân', '2004-02-07', 'xhuan1111@gmail.com', '$2a$08$vsrbQ6w2mtluTw2Q2lgOjuoGHop5l3FbsSde3gN7r2rBUHzsLpHnS', 'writer');

-- ----------------------------
-- Records of writers
-- ----------------------------
INSERT INTO `writers` VALUES ('Vô Cực Kiếm', 1);

-- ----------------------------
-- Records of categories
-- ----------------------------
INSERT INTO `categories` VALUES (1, 'Thời Sự', NULL);

-- ----------------------------
-- Records of tags
-- ----------------------------
INSERT INTO `tags` VALUES (1, 'AI');

-- ----------------------------
-- Records of articles
-- ----------------------------
INSERT INTO `articles` VALUES (26, 'Dự báo mưa lớn dịp Giáng sinh, Khánh Hòa lên phương án ứng phó', 'Khánh Hòa đã lên phương án sẵn sàng ứng phó với áp thấp nhiệt đới mạnh lên thành bão số 10.', '/static/images/articles/26/1734941091513-1.webp', '<p>Ng&agrave;y 23-12, trao đổi với Tuổi Trẻ Online, &ocirc;ng Nguyễn Duy Quang - gi&aacute;m đốc Sở N&ocirc;ng nghiệp v&agrave; Ph&aacute;t triển n&ocirc;ng th&ocirc;n Kh&aacute;nh H&ograve;a - cho biết tỉnh n&agrave;y đ&atilde; l&ecirc;n phương &aacute;n ứng ph&oacute; với &aacute;p thấp nhiệt đới tr&ecirc;n Biển Đ&ocirc;ng khả năng mạnh l&ecirc;n th&agrave;nh b&atilde;o số 10.</p>\r\n<p><strong>Sẵn s&agrave;ng ứng ph&oacute; với &aacute;p thấp nhiệt đới th&agrave;nh b&atilde;o</strong></p>\r\n<p>Trung t&acirc;m Dự b&aacute;o kh&iacute; tượng thủy văn quốc gia cho biết do ảnh hưởng của &aacute;p thấp nhiệt đới c&oacute; khả năng mạnh l&ecirc;n th&agrave;nh b&atilde;o v&agrave; kh&ocirc;ng kh&iacute; lạnh, n&ecirc;n từ đ&ecirc;m 23 đ&ecirc;́n ng&agrave;y 24-12 khu vực từ Đ&agrave; Nẵng đến Kh&aacute;nh H&ograve;a c&oacute; mưa vừa, mưa to, cục bộ c&oacute; nơi mưa rất to v&agrave; d&ocirc;ng, với lượng mưa phổ biến 30 - 80mm, cục bộ c&oacute; nơi tr&ecirc;n 200mm.</p>\r\n<p>Theo &ocirc;ng Quang, tỉnh n&agrave;y đ&atilde; sẵn s&agrave;ng lực lượng, phương tiện để kịp thời cứu hộ, cứu nạn, hỗ trợ người d&acirc;n khi c&oacute; y&ecirc;u cầu.</p>\r\n<p>Đồng thời đ&atilde; r&agrave; so&aacute;t c&aacute;c khu vực d&acirc;n cư sinh sống tại v&ugrave;ng đồi n&uacute;i c&oacute; nguy cơ sạt lở đất, lũ qu&eacute;t, c&aacute;c khu vực tho&aacute;t lũ ở hạ lưu c&aacute;c hồ chứa để thực hiện di dời ngay người d&acirc;n ra khỏi c&aacute;c khu vực nguy hiểm.</p>\r\n<p>Vận động người d&acirc;n ở những khu vực trũng thấp thường xuy&ecirc;n bị ngập lụt hạn chế c&aacute;c hoạt động gần khu vực nguy hiểm, chủ động k&ecirc; cao t&agrave;i sản, vật dụng gia đ&igrave;nh để tr&aacute;nh thiệt hại do mưa lũ, ngập lụt.</p>\r\n<p>Trong những ng&agrave;y mưa lớn, Sở Giao th&ocirc;ng vận tải Kh&aacute;nh H&ograve;a sẽ phối hợp với Sở Giao th&ocirc;ng vận tải L&acirc;m Đồng thực hiện chốt chặn tuyến quốc lộ 27C (đ&egrave;o Kh&aacute;nh L&ecirc;), nghi&ecirc;m cấm c&aacute;c phương tiện lưu th&ocirc;ng qua khu vực n&agrave;y để ph&ograve;ng ngừa lũ qu&eacute;t, sạt lở.</p>\r\n<p><strong>Nha Trang mưa lớn trong dịp Gi&aacute;ng sinh</strong></p>\r\n<p>Theo dự b&aacute;o Đ&agrave;i Kh&iacute; tượng thủy văn khu vực Nam Trung Bộ, từ đ&ecirc;m 23 đến đ&ecirc;m 25-12 to&agrave;n tỉnh Kh&aacute;nh H&ograve;a c&oacute; mưa vừa, mưa to, cục bộ c&oacute; nơi mưa rất to v&agrave; d&ocirc;ng.</p>\r\n<p>Mưa lớn tập trung trong ng&agrave;y 24 v&agrave; 25-12, từ ng&agrave;y 26-12 mưa lớn tr&ecirc;n khu vực tỉnh n&agrave;y c&oacute; xu hướng giảm dần. Tổng lượng mưa to&agrave;n đợt c&aacute;c nơi phổ biến 100 - 200mm/đợt, c&oacute; nơi cao hơn 250mm/đợt.</p>\r\n<p>Từ ng&agrave;y 23 đến 26-12, tr&ecirc;n c&aacute;c s&ocirc;ng tỉnh Kh&aacute;nh H&ograve;a c&oacute; khả năng xuất hiện một đợt lũ, đỉnh lũ lớn nhất tr&ecirc;n s&ocirc;ng C&aacute;i Nha Trang ở mức b&aacute;o động cấp 1, cấp 2. Độ s&acirc;u ngập lụt hạ lưu c&aacute;c s&ocirc;ng phổ biến 0,3 - 0,7m, khu vực trũng thấp 1 - 1,5m.</p>\r\n<p>Đ&agrave;i n&agrave;y cảnh b&aacute;o cần đề ph&ograve;ng ngập &uacute;ng do mưa ở c&aacute;c v&ugrave;ng trũng thấp, trong đ&ocirc; thị, nguy cơ xảy ra lũ qu&eacute;t, sạt lở đất ở c&aacute;c x&atilde; v&ugrave;ng n&uacute;i, khu vực xung yếu, đặc biệt tại TP Nha Trang, TP Cam Ranh v&agrave; huyện Cam L&acirc;m.</p>', 1, '2024-12-20 09:05:00', 0, 1, 56);

-- ----------------------------
-- Records of articles_categories
-- ----------------------------
INSERT INTO `articles_categories` VALUES (26, 1);

-- ----------------------------
-- Records of articles_tags
-- ----------------------------
INSERT INTO `articles_tags` VALUES (26, 1);


SET FOREIGN_KEY_CHECKS = 1;

ALTER TABLE articles
ADD FULLTEXT INDEX ft_title_abstract_content (title, abstract, content);