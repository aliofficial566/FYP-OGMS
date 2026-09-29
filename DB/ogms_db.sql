CREATE DATABASE  IF NOT EXISTS `ogms_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `ogms_db`;
-- MySQL dump 10.13  Distrib 8.0.45, for macos15 (x86_64)
--
-- Host: 127.0.0.1    Database: ogms_db
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '76e988f2-09a5-11f1-b6a7-93f826d0a3c1:1-721';

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `admin_id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `profile_image` varchar(255) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_expires` datetime DEFAULT NULL,
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'Administrator','admin@ogms.com','$2b$10$MVegX4nKLlRp2a8PvKyZue3VlZmOjDToY5jcisfW25ORlAgqQCNlO',1,'2026-04-22 18:53:35',NULL,NULL,NULL);
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `cart_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `cart_item_id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int DEFAULT '1',
  PRIMARY KEY (`cart_item_id`),
  UNIQUE KEY `cart_id` (`cart_id`,`product_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `cart` (`cart_id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `catalogues`
--

DROP TABLE IF EXISTS `catalogues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `catalogues` (
  `catalogue_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `image_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `discount_percent` int DEFAULT '0',
  PRIMARY KEY (`catalogue_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `catalogues`
--

LOCK TABLES `catalogues` WRITE;
/*!40000 ALTER TABLE `catalogues` DISABLE KEYS */;
INSERT INTO `catalogues` VALUES (1,'Seasonal Picks','Fresh seasonal favorites at unbeatable prices! Explore a handpicked collection of premium products across selected categories, now available with up to 50% off. Perfect for stocking up on everyday essentials and discovering limited-time seasonal deals. Hurry — offers available while stocks last.','/uploads/catalogues/catalogue-1778272857996.png',1,'2026-04-30 14:43:20','2026-05-09 18:08:22',25),(2,'Stay Cool This Summer','Refresh your store with top soft drinks and chilled beverages at special discounted prices. Explore Pepsi, Coca-Cola, Sprite, juices, energy drinks, and more for your customers.','/uploads/catalogues/catalogue-1778486856452.png',1,'2026-04-30 15:36:00','2026-05-11 08:40:13',15);
/*!40000 ALTER TABLE `catalogues` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `image_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `catalogue_id` int DEFAULT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `name` (`name`),
  KEY `catalogue_id` (`catalogue_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`catalogue_id`) REFERENCES `catalogues` (`catalogue_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Fresh Fruits','','/uploads/categories/category-1778508760125.png',1,'2026-04-22 14:08:49',1),(3,'Dairy & Eggs','','/uploads/categories/category-1778508727102.png',1,'2026-04-22 14:08:49',NULL),(4,'Cold Drinks','','/uploads/categories/category-1778508395689.png',1,'2026-04-22 14:08:49',2),(5,'Snacks & Packaged Foods','','/uploads/categories/category-1778508686975.png',1,'2026-04-22 14:08:49',NULL),(15,'Oils & Ghee','','/uploads/categories/category-1778508795723.png',1,'2026-05-09 19:31:28',NULL),(16,'Milk','','/uploads/categories/category-1778508638859.png',1,'2026-05-09 20:33:20',NULL),(17,'Sauces','','/uploads/categories/category-1778508473851.png',1,'2026-05-10 09:39:27',NULL);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `message` text,
  `type` varchar(50) DEFAULT NULL,
  `is_read` tinyint DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,1,'Order Status Updated','Your order #28 is now Processing','order_status',1,'2026-05-11 16:52:48'),(2,1,'Order Status Updated','Your order #28 is now Shipped','order_status',1,'2026-05-11 16:53:13'),(3,1,'Order Status Updated','Your order #28 is now Delivered','order_status',1,'2026-05-11 16:53:29');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_name` varchar(200) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL,
  `line_total` decimal(10,2) NOT NULL,
  `discount_percent` int DEFAULT '0',
  `final_price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`order_item_id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (25,21,41,'LAYS CHIPS PAPRIKA 30 GM',50.00,1,50.00,0,50.00),(26,21,40,'LAYS CHIPS MASALA 30 GM',50.00,2,100.00,0,50.00),(27,21,39,'LAYS CHIPS FRENCH CHEESE 30 GM',50.00,1,50.00,0,50.00),(28,21,29,'NESTLE JUICE FRUITA VITALS CHAUNSA NECTAR 200 ML - CARTON',1680.00,2,2856.00,15,1428.00),(29,22,23,'DALDA CANOLA OIL POUCH',595.00,2,1190.00,0,595.00),(30,22,21,'MEZAN OLIVOLA OLIVE AND CANOLA OILPOUCH',620.00,2,1240.00,0,620.00),(31,23,35,'KNORR CHILLI GARLIC SAUCE POUCH 800 GM',425.00,2,850.00,0,425.00),(32,23,34,'KNORR TOMATO KETCHUP POUCH 800 GM',415.00,2,830.00,0,415.00),(33,24,33,'OLPERS MILK FULL CREAM 250 ML - POUCH CARTON',2520.00,1,2520.00,0,2520.00),(34,25,32,'OLPERS MILK FULL CREAM 250 ML',90.00,2,180.00,0,90.00),(35,25,38,'LAYS WAVY BBQ CHIPS 30 GM',50.00,2,100.00,0,50.00),(37,27,27,'COCA COLA LOCAL CAN 250 ML- CARTON',1260.00,1,1071.00,15,1071.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `order_status` enum('Pending','Processing','Shipped','Delivered','Cancelled') DEFAULT 'Pending',
  `delivery_address` text NOT NULL,
  `city` varchar(100) DEFAULT NULL,
  `payment_method` enum('Cash on Delivery') DEFAULT 'Cash on Delivery',
  `total_amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `cancelled_by` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (21,1,'Delivered','55th Avenue, Raiwind Road, Lahore, 54000','Lahore','Cash on Delivery',3056.00,'2026-05-02 08:36:10','2026-05-11 14:34:34',NULL),(22,1,'Delivered','55th Avenue, Raiwind Road, Lahore, 54000','Lahore','Cash on Delivery',2430.00,'2026-04-27 14:23:24','2026-05-11 14:34:34',NULL),(23,2,'Delivered','55th Avenue, Raiwind Road, Lahore, 54000','Lahore','Cash on Delivery',1680.00,'2026-05-11 14:25:07','2026-05-11 14:25:43',NULL),(24,2,'Delivered','55th Avenue, Raiwind Road, Lahore, 54000','Lahore','Cash on Delivery',2520.00,'2026-05-06 14:25:33','2026-05-11 14:40:11',NULL),(25,2,'Cancelled','55th Avenue, Raiwind Road, Ajmer, 305001','Ajmer','Cash on Delivery',280.00,'2026-05-07 14:26:34','2026-05-11 14:40:11','Admin'),(27,1,'Cancelled','55th Avenue, Raiwind Road, Lahore, 54000','Lahore','Cash on Delivery',1071.00,'2026-05-11 14:40:58','2026-05-11 14:41:07','User');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text,
  `brand` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock_qty` int DEFAULT '0',
  `unit` varchar(50) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `discount_percent` int DEFAULT '0',
  PRIMARY KEY (`product_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (5,1,'Fresh Strawberries','Sweet and juicy organic strawberries.','FarmFresh',230.00,100,'500 Grams','[\"https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&q=80\"]',1,'2026-04-30 14:34:45','2026-05-11 08:16:56',0),(8,3,'Whole Wheat Bread','Freshly baked whole wheat bread.','Bakery Delight',210.00,30,'1 Loaf','[\"/uploads/products/bread.png\"]',1,'2026-04-30 14:34:45','2026-05-11 08:17:31',0),(10,3,'Greek Yogurt','Plain thick Greek yogurt.','DairyPure',300.00,100,'500g','[\"https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&q=80\"]',1,'2026-04-30 14:34:45','2026-05-11 08:17:49',0),(13,4,'Coca Cola 345 ML','Coca Cola 345 Ml','Coca Cola',140.00,100,'345 ML','[\"https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80\"]',1,'2026-04-30 14:34:45','2026-05-11 17:23:02',0),(14,1,'Avocado','Ripe Hass avocado.','GreenFarms',90.00,150,'500 Grams','[\"https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&q=80\"]',1,'2026-04-30 14:34:45','2026-05-11 08:18:08',0),(15,3,'FARM FRESH CLASSIC EGGS PACK','Durable Egg tray. Makes storing eggs easy. With separate containers for each egg to prevent breakage.\r\n\r\n',NULL,320.00,220,'12 PCS','[\"/uploads/products/product-1778350367198.webp\"]',1,'2026-05-09 18:12:47','2026-05-09 18:14:45',0),(16,3,'FARM FRESH OMEGA 3 EGGS PACK','Farm Fresh Omega-3 Eggs . Makes storing eggs easy. With separate containers for each egg to prevent breakage.\r\n\r\n',NULL,420.00,220,'12 PCS','[\"/uploads/products/product-1778350430112.webp\"]',1,'2026-05-09 18:13:50','2026-05-09 18:14:53',0),(17,3,'FARM FRESH GOLDEN EGGS PACK','Farm Fresh golden Eggs . Makes storing eggs easy. With separate containers for each egg to prevent breakage.\r\n\r\n',NULL,390.00,220,'12 PCS','[\"/uploads/products/product-1778350609977.webp\"]',1,'2026-05-09 18:16:49','2026-05-09 18:16:49',0),(18,3,'FF HAPPY HEN DESI EGGS 12 PCS','FF HAPPY HEN DESI EGGS 12 PCS\r\n\r\n',NULL,465.00,240,'12 PCS','[\"/uploads/products/product-1778350706073.webp\"]',1,'2026-05-09 18:18:26','2026-05-09 18:18:26',0),(19,15,'FF DESI GHEE PLASTIC JAR','FF DESI GHEE 870 GM PLASTIC JAR\r\n\r\n','Farm Fields',2695.00,40,'870 gram','[\"/uploads/products/product-1778351343687.webp\"]',1,'2026-05-09 18:29:03','2026-05-09 19:34:59',0),(20,15,'FF DESI GHEE PLASTIC JAR','FF DESI GHEE 400 GM PLASTIC JAR\r\n\r\n','Farm Fields',1345.00,40,'400 grams','[\"/uploads/products/product-1778352784307.webp\"]',1,'2026-05-09 18:53:04','2026-05-09 19:34:49',0),(21,15,'MEZAN OLIVOLA OLIVE AND CANOLA OILPOUCH','MEZAN OLIVOLA OLIVE AND CANOLA OIL 1 LTR POUCH\r\n\r\n','MEZAN',620.00,200,'1 LTR ','[\"/uploads/products/product-1778355206801.webp\"]',1,'2026-05-09 19:33:26','2026-05-09 19:33:26',0),(22,15,'DALDA COOKING OIL POUCH','Along with being the clearest cooking oil, it is completely free from cholesterol, making it safe for the heart. Apart from the perfect blend of Dalda Cooking Oil, Daldas Fortified range of oils, enriched with extra vitamins, also offers Dalda Canola and Dalda Sunflower. Dalda also offers the natural attributes of olives in Dalda Olive Oil which is imported directly from Spain.','Dalda',595.00,300,'1 LTR','[\"/uploads/products/product-1778355644334.webp\"]',1,'2026-05-09 19:40:44','2026-05-09 19:40:44',0),(23,15,'DALDA CANOLA OIL POUCH','DALDA CANOLA OIL POUCH 1 LTR is ideal for sauteing and frying. It is made with DAALI SARSON COOKING OIL, giving it a naturally mild flavor. Perfect for cooking a variety of dishes, this oil has a balanced fatty acid ratio for healthier eating. With a light texture and high smoke point, it\'s ideal for everyday cooking.\r\n\r\n','Dalda',595.00,200,'1 LTR','[\"/uploads/products/product-1778357060569.webp\"]',1,'2026-05-09 19:48:51','2026-05-09 20:04:20',0),(24,15,'DALDA COOKING OIL STAND UP POUCH','This 1 liter stand-up pouch of Dalda cooking oil is a convenient and practical choice for your kitchen. Made from high-quality ingredients, it offers a smooth and flavorful cooking experience. With its easy-to-use design and reliable seal, it ensures your oil stays fresh and ready for use at any time.\r\n\r\n','Dalda',599.00,200,' 1 LTR','[\"/uploads/products/product-1778357120336.webp\"]',1,'2026-05-09 20:05:20','2026-05-09 20:05:20',0),(25,15,'DALDA COOKING OIL BOTTLE','Along with being the clearest cooking oil, it is completely free from cholesterol, making it safe for the heart. Apart from the perfect blend of Dalda Cooking Oil, Dalda\'s Fortified range of oils, enriched with extra vitamins, also offers Dalda Canola and Dalda Sunflower. Dalda also offers the natural attributes of olives in Dalda Olive Oil which is imported directly from Spain.','Dalda',1875.00,500,'3 LTR','[\"/uploads/products/product-1778357188929.webp\"]',1,'2026-05-09 20:06:28','2026-05-09 20:06:28',0),(26,4,'COCA COLA LOCAL TIN 250 ML','COCA COLA LOCAL TIN 250 ML\r\n\r\n','COCA COLA ',105.00,500,'1 PC','[\"/uploads/products/product-1778358008016.webp\"]',1,'2026-05-09 20:20:08','2026-05-09 20:20:08',0),(27,4,'COCA COLA LOCAL CAN 250 ML- CARTON','Coca Cola is the world\'s favorite soft drink and has been enjoyed since 1886. Coca Cola is now the most recognised trademark in the world, available everywhere from Australia to Zambia. Coca Cola was introduced in Pakistan in 1953.\r\n\r\n','COCA COLA ',1260.00,500,'250 ML x 12','[\"/uploads/products/product-1778358120853.webp\",\"/uploads/products/product-1778358120854.webp\"]',1,'2026-05-09 20:22:00','2026-05-09 20:22:00',0),(28,4,'NESTLE JUICE FRUITA VITALS CHAUNSA NECTAR 200 ML','Nestle FRUITA VITALS Chaunsa Nectar is a refreshing drink which is made from the best premium Chaunsa mangoes. Mango provides nutrition like dietary fiber, Vitamin-A, C and E which help you to stay fit.\r\n\r\n','NESTLE',70.00,500,'1 PC','[\"/uploads/products/product-1778358388496.webp\"]',1,'2026-05-09 20:26:28','2026-05-09 20:26:28',0),(29,4,'NESTLE JUICE FRUITA VITALS CHAUNSA NECTAR 200 ML - CARTON','Nestle FRUITA VITALS Chaunsa Nectar is a refreshing drink which is made from the best premium Chaunsa mangoes. Mango provides nutrition like dietary fiber, Vitamin-A, C and E which help you to stay fit.\r\n\r\n','Nestle',1680.00,500,'200ML x 24','[\"/uploads/products/product-1778358500942.webp\"]',1,'2026-05-09 20:28:20','2026-05-09 20:28:20',0),(30,3,'NESTLE MILKPAK MILK FULL CREAM 250ML','NESTLE MILKPAK MILK FULL CREAM MILK\r\n\r\nNature\'s gift of dairy has a fascinating taste, and with over three and a half decades of dairy expertise in Pakistan, Nestle MILKPAK has perfected the processes that allow it to capture this smooth, rich and creamy experience, the way nature meant it to be.','Nestle',95.00,500,'1 PC','[\"/uploads/products/product-1778358776737.webp\"]',1,'2026-05-09 20:32:56','2026-05-11 08:35:45',0),(31,3,'NESTLE MILKPAK MILK FULL CREAM 250ML - CARTON','NESTLE MILKPAK MILK FULL CREAM MILK\r\n\r\nNature\'s gift of dairy has a fascinating taste, and with over three and a half decades of dairy expertise in Pakistan, Nestle MILKPAK has perfected the processes that allow it to capture this smooth, rich and creamy experience, the way nature meant it to be.','Nestle',2565.00,500,'250 ML x 27','[\"/uploads/products/product-1778358937069.webp\"]',1,'2026-05-09 20:35:37','2026-05-11 08:36:12',0),(32,3,'OLPERS MILK FULL CREAM 250 ML','Introduced in 2006, Olper\'s Milk, our flagship brand, is the leading UHT processed milk brand. Olper\'s has gained leadership position within a span of eleven years through the promise of wholesome nutrition and through commitment to innovation, safety & convenience. The brand philosophy resonates well with mothers who are constantly in the process of seeking superior nutrition for their children.\r\n\r\n','Olpers',90.00,500,'1 PC','[\"/uploads/products/product-1778359554788.webp\",\"/uploads/products/product-1778359579799.webp\"]',1,'2026-05-09 20:45:54','2026-05-11 08:36:20',0),(33,3,'OLPERS MILK FULL CREAM 250 ML - POUCH CARTON','Enjoy the pure goodness of milk with Olpers Full Cream Milk. This 250ml carton of full cream milk contains no added preservatives and is hormone free, giving you the convenience of a refreshing, wholesome drink with no compromise on quality or taste.\r\n\r\n','Olpers',2520.00,500,'250 ML x 28 (Pouch)','[\"/uploads/products/product-1778359677948.webp\"]',1,'2026-05-09 20:47:57','2026-05-11 08:36:27',0),(34,17,'KNORR TOMATO KETCHUP POUCH 800 GM','Knorr Tomato Ketchup Pouch 800 GM offers a rich and tangy tomato flavor made from high-quality ingredients. This convenient pouch is perfect for enhancing the taste of your meals, delivering a smooth texture and balanced sweetness. Ideal for both home use and food service, it ensures freshness and easy dispensing, making it a reliable choice for adding a classic ketchup taste to your dishes.\r\n\r\n','Knorr',415.00,500,'1 PC','[\"/uploads/products/product-1778406012584.webp\"]',1,'2026-05-10 09:40:12','2026-05-10 09:40:29',0),(35,17,'KNORR CHILLI GARLIC SAUCE POUCH 800 GM','Knorr Chilli Garlic Sauce delivers bold, authentic flavors in a convenient 800g pouch. This versatile condiment combines the heat of premium chilies with aromatic garlic, creating a perfect balance for enhancing curries, grilled meats, rice dishes, and marinades. Ready-to-use and crafted by a trusted culinary brand, it brings restaurant-quality taste to your kitchen. Ideal for home cooks seeking consistent, quality seasoning without the preparation hassle.\r\n\r\n','Knorr',425.00,500,'1 PC','[\"/uploads/products/product-1778406069084.webp\"]',1,'2026-05-10 09:41:09','2026-05-11 16:45:34',0),(36,17,'SHANGRILA CHILLI SIZLING HOT SAUCE BOTTLE 700 ML','Experience a fiery kick to your taste buds with SHANGRILA CHILLI SIZLING HOT SAUCE BOTTLE 700 ML. Made with quality ingredients, this sauce packs a punch of flavor and spice in every drop. Perfect for adding that extra heat to your meals.\r\n\r\n','Shangrila',265.00,500,'1 PC','[\"/uploads/products/product-1778406116955.webp\"]',1,'2026-05-10 09:41:56','2026-05-10 09:41:56',0),(37,17,'SHANGRILA SAUCES VALUE PACK 275 ML','SHANGRILA SAUCES VALUE PACK 275 ML\r\n\r\n','Shangrila',345.00,500,'1 Pack','[\"/uploads/products/product-1778406159041.webp\"]',1,'2026-05-10 09:42:39','2026-05-10 09:42:39',0),(38,5,'LAYS WAVY BBQ CHIPS 30 GM','LAYS WAVY BBQ CHIPS 30 GM combine a classic smoky BBQ flavor with the perfect crunch of a wavy chip. Enjoy a tasty snack that\'s perfect for munching at any time. Each bag contains 30g of chips, making it easy to share with a friend or keep for yourself.\r\n\r\n','Lays',50.00,500,'1 PC','[\"/uploads/products/product-1778406338915.webp\"]',1,'2026-05-10 09:45:38','2026-05-10 09:45:38',0),(39,5,'LAYS CHIPS FRENCH CHEESE 30 GM','LAYS CHIPS FRENCH CHEESE 30 GM\r\n\r\n','Lays',50.00,500,'1 PC','[\"/uploads/products/product-1778406369793.webp\"]',1,'2026-05-10 09:46:09','2026-05-10 09:46:09',0),(40,5,'LAYS CHIPS MASALA 30 GM','LAYS CHIPS MASALA 30 GM\r\n\r\n','Lays',50.00,500,'1 PC','[\"/uploads/products/product-1778406411340.webp\"]',1,'2026-05-10 09:46:51','2026-05-10 09:46:51',0),(41,5,'LAYS CHIPS PAPRIKA 30 GM','LAYS CHIPS PAPRIKA 30 GM\r\n','Lays',50.00,500,'1 PC','[\"/uploads/products/product-1778406459190.webp\"]',1,'2026-05-10 09:47:39','2026-05-10 09:47:39',0);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `city` varchar(100) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_expires` datetime DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `profile_image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'M Ali Khaliq','ali@ogms.com','$2b$10$mJ38je4I1cKQcrsoD2lMhejwZ3nbT/GEjEfqRfE5TqWRtvEW207ze','923096219566','55th Avenue, Thokar Niaz Baig','Lahore',NULL,NULL,1,'2026-04-22 19:06:45','2026-05-11 19:20:40',''),(2,'Fahad Ullah','fahad@ogms.com','$2b$10$mJ38je4I1cKQcrsoD2lMhejwZ3nbT/GEjEfqRfE5TqWRtvEW207ze','1234567890','55th Avenue, Thokar Niaz Baig','Lahore',NULL,NULL,1,'2026-04-24 18:04:34','2026-05-11 19:20:40',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-11 22:35:13
