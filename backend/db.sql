CREATE DATABASE  IF NOT EXISTS `marketplace` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `marketplace`;
-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: marketplace
-- ------------------------------------------------------
-- Server version	8.0.41

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

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cart_id` (`cart_id`,`product_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (7,1,2,1,'2025-09-07 10:48:13','2025-09-07 10:48:13');
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `buyer_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `buyer_id` (`buyer_id`),
  CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (1,2,'2025-09-07 07:37:02','2025-09-07 07:37:02'),(2,5,'2025-09-07 10:52:29','2025-09-07 10:52:29');
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Clothing','Clothing fabrics wool cotton','2025-09-06 22:24:40','2025-09-07 17:09:08'),(2,'Educational','Books Pen Glue Colors Paper ','2025-09-06 22:25:36','2025-09-07 09:28:27'),(5,'Medical','medicines, tablets, bandaid','2025-09-07 10:15:32','2025-09-07 10:15:32'),(6,'Tools','screw bolt','2025-09-07 12:34:32','2025-09-07 12:34:32');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `buyer_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` enum('Pending','Confirmed','Shipped','Delivered') DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `buyer_id` (`buyer_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,2,1,1,10.00,'Delivered','2025-09-07 08:48:58','2025-09-07 10:29:23'),(2,2,2,3,552.00,'Pending','2025-09-07 09:37:35','2025-09-07 09:37:35'),(3,2,3,4,36.00,'Delivered','2025-09-07 10:39:49','2025-09-07 10:42:01'),(4,5,2,3,552.00,'Delivered','2025-09-07 10:52:42','2025-09-07 12:51:41'),(5,5,1,1,10.00,'Shipped','2025-09-07 11:28:47','2025-09-07 12:51:43'),(6,5,3,12,108.00,'Delivered','2025-09-07 11:38:21','2025-09-07 12:51:33'),(7,5,2,1,184.00,'Confirmed','2025-09-07 11:41:13','2025-09-07 11:41:35'),(8,5,2,1,184.00,'Confirmed','2025-09-07 11:43:01','2025-09-07 11:43:24'),(9,5,2,1,184.00,'Delivered','2025-09-07 12:21:31','2025-09-07 12:51:47'),(10,5,1,3,30.00,'Confirmed','2025-09-07 12:54:47','2025-09-07 12:54:59'),(11,5,2,2,368.00,'Pending','2025-09-07 12:54:47','2025-09-07 12:54:47'),(12,5,3,1,9.00,'Pending','2025-09-07 12:54:47','2025-09-07 12:54:47'),(13,5,3,1,9.00,'Confirmed','2025-09-07 13:01:28','2025-09-07 13:01:45'),(14,5,3,7,63.00,'Delivered','2025-09-07 13:03:43','2025-09-07 13:08:04'),(15,5,4,1,8.64,'Delivered','2025-09-07 17:44:49','2025-09-07 17:47:38');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `payment_method` enum('Razorpay','CreditCard','CashOnDelivery') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_status` enum('Pending','Completed','Failed') DEFAULT 'Pending',
  `payment_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id` (`order_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,1,'Razorpay',500.00,'Pending','2025-09-07 16:44:35','2025-09-07 11:14:35','2025-09-07 11:14:35'),(2,5,'Razorpay',10.00,'Pending','2025-09-07 16:58:47','2025-09-07 11:28:47','2025-09-07 11:28:47'),(3,6,'Razorpay',108.00,'Pending','2025-09-07 17:08:21','2025-09-07 11:38:21','2025-09-07 11:38:21'),(4,7,'Razorpay',184.00,'Pending','2025-09-07 17:11:14','2025-09-07 11:41:14','2025-09-07 11:41:14'),(5,8,'Razorpay',184.00,'Pending','2025-09-07 17:13:01','2025-09-07 11:43:01','2025-09-07 11:43:01'),(6,9,'Razorpay',184.00,'Completed','2025-09-07 17:51:32','2025-09-07 12:21:32','2025-09-07 12:21:43'),(7,10,'Razorpay',407.00,'Completed','2025-09-07 18:24:48','2025-09-07 12:54:48','2025-09-07 12:54:59'),(8,13,'Razorpay',9.00,'Completed','2025-09-07 18:31:28','2025-09-07 13:01:28','2025-09-07 13:01:45'),(9,14,'Razorpay',63.00,'Completed','2025-09-07 18:33:43','2025-09-07 13:03:43','2025-09-07 13:03:52'),(10,15,'Razorpay',8.64,'Completed','2025-09-07 23:14:50','2025-09-07 17:44:50','2025-09-07 17:45:12');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `seller_id` int NOT NULL,
  `category_id` int DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `price` decimal(10,2) DEFAULT '0.00',
  `discount` decimal(5,2) DEFAULT '0.00',
  `stock` int DEFAULT '0',
  `deal_expiry` datetime DEFAULT NULL,
  `approved` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `product_img` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `seller_id` (`seller_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `products_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,3,2,'Pen','ball pen blue',10.00,12.00,25,'2025-09-07 23:29:00',1,'2025-09-06 22:57:43','2025-09-07 17:58:00','http://192.168.29.228:5000/uploads/compressed-1757199463925.jpeg'),(2,3,2,'new book','Story Book',230.00,20.00,139,'2025-11-09 04:00:00',1,'2025-09-07 09:30:57','2025-09-07 12:54:47','http://192.168.29.228:5000/uploads/compressed-1757237456968.jpeg'),(3,3,5,'crocin','crocin tablet',10.00,10.00,2967,'2025-09-20 16:02:00',1,'2025-09-07 10:33:29','2025-09-07 13:03:43','http://192.168.29.228:5000/uploads/compressed-1757241209631.jpeg'),(4,4,6,'Bolt','bolt mm ',12.00,28.00,349,'2025-09-14 12:35:00',1,'2025-09-07 12:37:09','2025-09-07 17:44:49','http://192.168.29.228:5000/uploads/compressed-1757267050470.jpeg');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('Admin','Seller','Buyer') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin',NULL,'$2b$10$BsX8fjKOGUel4otd5OzzweOZrLZg/mXADhxSQo1sj2UWfa.1h4Npq','Admin','2025-09-06 21:49:02','2025-09-06 21:49:02'),(2,'amit','alanwalkerdj27@gmail.com','$2b$10$xgAbvkDWUJKvNzvFxP0qV.hl9xrCUB1an/Uf/tOJOppi.2xOdtDHa','Buyer','2025-09-06 22:14:55','2025-09-06 22:14:55'),(3,'rohit','alanwalkerdj27@gmail.com','$2b$10$l5.TYzbbxT8IcMLR3ifQ1OqsRcAK63UHrc.wgUs37ZnHEmu/f2.vy','Seller','2025-09-06 22:19:36','2025-09-06 22:19:36'),(4,'test','alanwalkerdj27@gmail.com','$2b$10$Q8tymdfY9fvafdV.fIFpl.UobEcZvclWnPhrJBIjc5zzvr..aCaUq','Seller','2025-09-07 09:22:57','2025-09-07 09:22:57'),(5,'praj','alanwalkerdj27@gmail.com','$2b$10$TkcLTx4qsSKBStOtK0rFoO8sE/7hP/Wau/N4CPkCwptBQKj23uoS.','Buyer','2025-09-07 10:51:50','2025-09-07 10:51:50'),(6,'testing','alanwalkerdj27@gmail.com','$2b$10$yaKV93qziqWSpywulShSvedNGbikSOh2T0uBhVe8kvZw5q62UOI1C','Buyer','2025-09-07 17:52:56','2025-09-07 17:52:56');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-07 23:31:58
