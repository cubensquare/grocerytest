CREATE DATABASE  IF NOT EXISTS `grocery_pos` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `grocery_pos`;
-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: grocery_pos
-- ------------------------------------------------------
-- Server version	8.0.44

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
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Fruits & Vegetables','Fresh fruits and vegetables','2026-04-21 05:11:28'),(2,'Dairy & Eggs','Milk, cheese, butter, eggs','2026-04-21 05:11:28'),(3,'Bakery','Breads, cakes, pastries','2026-04-21 05:11:28'),(4,'Beverages','Juices, water, sodas, tea, coffee','2026-04-21 05:11:28'),(5,'Snacks','Chips, biscuits, namkeen','2026-04-21 05:11:28'),(6,'Grains & Pulses','Rice, wheat, dal, pulses','2026-04-21 05:11:28'),(7,'Meat & Seafood','Fresh meat, fish, chicken','2026-04-21 05:11:28'),(8,'Personal Care','Soap, shampoo, toothpaste','2026-04-21 05:11:28'),(9,'Household','Cleaning products, detergent','2026-04-21 05:11:28'),(10,'Frozen Foods','Frozen vegetables, ready meals','2026-04-21 05:11:28');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `loyalty_points` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'Priya Sharma','9876543210','priya@example.com',250,'2026-04-21 05:11:28'),(2,'Rahul Verma','9876543211','rahul@example.com',120,'2026-04-21 05:11:28'),(3,'Anita Singh','9876543212','anita@example.com',500,'2026-04-21 05:11:28'),(4,'Dev Patel','9876543213','dev@example.com',75,'2026-04-21 05:11:28');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int DEFAULT NULL,
  `product_name` varchar(200) NOT NULL,
  `product_price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=340 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,6,'Tomatoes',40.00,2,80.00),(2,1,17,'Nescafe Classic (100g)',250.00,4,1000.00),(3,1,14,'Coca-Cola (500ml)',40.00,1,40.00),(4,2,23,'Chicken Breast (1kg)',280.00,1,280.00),(5,3,10,'Apples (1kg)',180.00,4,720.00),(6,3,20,'Colgate Toothpaste (200g)',95.00,4,380.00),(7,3,12,'Parle-G Biscuits',10.00,2,20.00),(8,3,15,'Mineral Water (1L)',20.00,1,20.00),(9,3,7,'Onions',35.00,5,175.00),(10,3,17,'Nescafe Classic (100g)',250.00,1,250.00),(11,4,25,'Maggi Noodles (280g)',52.00,3,156.00),(12,4,20,'Colgate Toothpaste (200g)',95.00,4,380.00),(13,5,25,'Maggi Noodles (280g)',52.00,1,52.00),(14,5,24,'Frozen Peas (500g)',70.00,2,140.00),(15,5,22,'Surf Excel (1kg)',210.00,3,630.00),(16,5,5,'Eggs (12 pcs)',90.00,1,90.00),(17,6,3,'Amul Butter (500g)',245.00,2,490.00),(18,6,15,'Mineral Water (1L)',20.00,2,40.00),(19,7,23,'Chicken Breast (1kg)',280.00,2,560.00),(20,8,10,'Apples (1kg)',180.00,3,540.00),(21,8,6,'Tomatoes',40.00,5,200.00),(22,8,9,'Bananas (dozen)',45.00,4,180.00),(23,8,17,'Nescafe Classic (100g)',250.00,1,250.00),(24,8,4,'Amul Milk (1L)',62.00,1,62.00),(25,9,1,'Basmati Rice (1kg)',85.00,2,170.00),(26,9,19,'Sunflower Oil (1L)',130.00,4,520.00),(27,9,11,'Britannia Bread',45.00,3,135.00),(28,9,9,'Bananas (dozen)',45.00,5,225.00),(29,10,6,'Tomatoes',40.00,4,160.00),(30,11,1,'Basmati Rice (1kg)',85.00,2,170.00),(31,11,25,'Maggi Noodles (280g)',52.00,4,208.00),(32,11,23,'Chicken Breast (1kg)',280.00,3,840.00),(33,12,6,'Tomatoes',40.00,5,200.00),(34,12,1,'Basmati Rice (1kg)',85.00,3,255.00),(35,13,15,'Mineral Water (1L)',20.00,5,100.00),(36,14,17,'Nescafe Classic (100g)',250.00,4,1000.00),(37,14,7,'Onions',35.00,5,175.00),(38,15,9,'Bananas (dozen)',45.00,4,180.00),(39,15,18,'Toor Dal (1kg)',130.00,1,130.00),(40,15,7,'Onions',35.00,1,35.00),(41,16,12,'Parle-G Biscuits',10.00,4,40.00),(42,16,3,'Amul Butter (500g)',245.00,3,735.00),(43,16,20,'Colgate Toothpaste (200g)',95.00,4,380.00),(44,16,25,'Maggi Noodles (280g)',52.00,2,104.00),(45,16,18,'Toor Dal (1kg)',130.00,3,390.00),(46,17,21,'Dove Soap (75g)',50.00,1,50.00),(47,17,7,'Onions',35.00,2,70.00),(48,18,20,'Colgate Toothpaste (200g)',95.00,3,285.00),(49,18,9,'Bananas (dozen)',45.00,5,225.00),(50,18,23,'Chicken Breast (1kg)',280.00,1,280.00),(51,19,12,'Parle-G Biscuits',10.00,4,40.00),(52,20,10,'Apples (1kg)',180.00,5,900.00),(53,20,24,'Frozen Peas (500g)',70.00,3,210.00),(54,20,15,'Mineral Water (1L)',20.00,5,100.00),(55,20,6,'Tomatoes',40.00,4,160.00),(56,20,16,'Tata Tea Premium (250g)',140.00,3,420.00),(57,20,5,'Eggs (12 pcs)',90.00,3,270.00),(58,21,13,'Lay\'s Classic Chips',20.00,1,20.00),(59,21,17,'Nescafe Classic (100g)',250.00,3,750.00),(60,21,6,'Tomatoes',40.00,5,200.00),(61,22,5,'Eggs (12 pcs)',90.00,5,450.00),(62,23,1,'Basmati Rice (1kg)',85.00,3,255.00),(63,23,25,'Maggi Noodles (280g)',52.00,4,208.00),(64,23,6,'Tomatoes',40.00,4,160.00),(65,23,8,'Potatoes',30.00,3,90.00),(66,24,2,'Whole Wheat Atta (5kg)',220.00,5,1100.00),(67,24,20,'Colgate Toothpaste (200g)',95.00,1,95.00),(68,25,11,'Britannia Bread',45.00,1,45.00),(69,25,8,'Potatoes',30.00,4,120.00),(70,26,23,'Chicken Breast (1kg)',280.00,3,840.00),(71,26,11,'Britannia Bread',45.00,5,225.00),(72,26,2,'Whole Wheat Atta (5kg)',220.00,3,660.00),(73,27,11,'Britannia Bread',45.00,4,180.00),(74,27,7,'Onions',35.00,3,105.00),(75,27,14,'Coca-Cola (500ml)',40.00,2,80.00),(76,28,23,'Chicken Breast (1kg)',280.00,1,280.00),(77,29,8,'Potatoes',30.00,3,90.00),(78,29,16,'Tata Tea Premium (250g)',140.00,3,420.00),(79,30,13,'Lay\'s Classic Chips',20.00,3,60.00),(80,30,22,'Surf Excel (1kg)',210.00,2,420.00),(81,30,3,'Amul Butter (500g)',245.00,5,1225.00),(82,30,14,'Coca-Cola (500ml)',40.00,5,200.00),(83,30,21,'Dove Soap (75g)',50.00,5,250.00),(84,31,24,'Frozen Peas (500g)',70.00,2,140.00),(85,32,11,'Britannia Bread',45.00,1,45.00),(86,32,6,'Tomatoes',40.00,2,80.00),(87,32,1,'Basmati Rice (1kg)',85.00,4,340.00),(88,32,20,'Colgate Toothpaste (200g)',95.00,5,475.00),(89,33,17,'Nescafe Classic (100g)',250.00,3,750.00),(90,34,16,'Tata Tea Premium (250g)',140.00,5,700.00),(91,34,21,'Dove Soap (75g)',50.00,5,250.00),(92,34,19,'Sunflower Oil (1L)',130.00,1,130.00),(93,35,3,'Amul Butter (500g)',245.00,2,490.00),(94,35,9,'Bananas (dozen)',45.00,2,90.00),(95,35,7,'Onions',35.00,5,175.00),(96,35,4,'Amul Milk (1L)',62.00,5,310.00),(97,36,2,'Whole Wheat Atta (5kg)',220.00,5,1100.00),(98,36,4,'Amul Milk (1L)',62.00,5,310.00),(99,36,14,'Coca-Cola (500ml)',40.00,4,160.00),(100,36,9,'Bananas (dozen)',45.00,4,180.00),(101,36,13,'Lay\'s Classic Chips',20.00,1,20.00),(102,37,6,'Tomatoes',40.00,2,80.00),(103,37,13,'Lay\'s Classic Chips',20.00,2,40.00),(104,37,18,'Toor Dal (1kg)',130.00,3,390.00),(105,37,7,'Onions',35.00,4,140.00),(106,37,25,'Maggi Noodles (280g)',52.00,5,260.00),(107,38,6,'Tomatoes',40.00,2,80.00),(108,38,21,'Dove Soap (75g)',50.00,4,200.00),(109,38,5,'Eggs (12 pcs)',90.00,3,270.00),(110,38,4,'Amul Milk (1L)',62.00,2,124.00),(111,38,25,'Maggi Noodles (280g)',52.00,1,52.00),(112,39,25,'Maggi Noodles (280g)',52.00,3,156.00),(113,39,17,'Nescafe Classic (100g)',250.00,1,250.00),(114,39,3,'Amul Butter (500g)',245.00,3,735.00),(115,40,1,'Basmati Rice (1kg)',85.00,2,170.00),(116,41,13,'Lay\'s Classic Chips',20.00,5,100.00),(117,41,10,'Apples (1kg)',180.00,2,360.00),(118,41,4,'Amul Milk (1L)',62.00,5,310.00),(119,41,23,'Chicken Breast (1kg)',280.00,3,840.00),(120,41,15,'Mineral Water (1L)',20.00,2,40.00),(121,42,18,'Toor Dal (1kg)',130.00,4,520.00),(122,42,5,'Eggs (12 pcs)',90.00,4,360.00),(123,42,4,'Amul Milk (1L)',62.00,1,62.00),(124,43,11,'Britannia Bread',45.00,1,45.00),(125,43,10,'Apples (1kg)',180.00,4,720.00),(126,43,2,'Whole Wheat Atta (5kg)',220.00,1,220.00),(127,44,22,'Surf Excel (1kg)',210.00,2,420.00),(128,45,1,'Basmati Rice (1kg)',85.00,3,255.00),(129,45,8,'Potatoes',30.00,3,90.00),(130,45,18,'Toor Dal (1kg)',130.00,1,130.00),(131,45,12,'Parle-G Biscuits',10.00,4,40.00),(132,45,19,'Sunflower Oil (1L)',130.00,1,130.00),(133,46,1,'Basmati Rice (1kg)',85.00,4,340.00),(134,46,10,'Apples (1kg)',180.00,4,720.00),(135,46,5,'Eggs (12 pcs)',90.00,2,180.00),(136,46,14,'Coca-Cola (500ml)',40.00,3,120.00),(137,46,24,'Frozen Peas (500g)',70.00,1,70.00),(138,46,8,'Potatoes',30.00,4,120.00),(139,47,7,'Onions',35.00,4,140.00),(140,47,3,'Amul Butter (500g)',245.00,3,735.00),(141,47,20,'Colgate Toothpaste (200g)',95.00,3,285.00),(142,47,5,'Eggs (12 pcs)',90.00,1,90.00),(143,48,2,'Whole Wheat Atta (5kg)',220.00,2,440.00),(144,49,14,'Coca-Cola (500ml)',40.00,5,200.00),(145,49,20,'Colgate Toothpaste (200g)',95.00,3,285.00),(146,50,16,'Tata Tea Premium (250g)',140.00,4,560.00),(147,50,12,'Parle-G Biscuits',10.00,5,50.00),(148,50,11,'Britannia Bread',45.00,3,135.00),(149,51,6,'Tomatoes',40.00,4,160.00),(150,51,8,'Potatoes',30.00,1,30.00),(151,52,24,'Frozen Peas (500g)',70.00,2,140.00),(152,52,5,'Eggs (12 pcs)',90.00,1,90.00),(153,52,3,'Amul Butter (500g)',245.00,3,735.00),(154,52,1,'Basmati Rice (1kg)',85.00,1,85.00),(155,52,2,'Whole Wheat Atta (5kg)',220.00,3,660.00),(156,52,20,'Colgate Toothpaste (200g)',95.00,3,285.00),(157,53,19,'Sunflower Oil (1L)',130.00,1,130.00),(158,53,9,'Bananas (dozen)',45.00,3,135.00),(159,54,23,'Chicken Breast (1kg)',280.00,4,1120.00),(160,54,20,'Colgate Toothpaste (200g)',95.00,5,475.00),(161,54,4,'Amul Milk (1L)',62.00,1,62.00),(162,55,11,'Britannia Bread',45.00,4,180.00),(163,55,22,'Surf Excel (1kg)',210.00,3,630.00),(164,55,21,'Dove Soap (75g)',50.00,2,100.00),(165,56,22,'Surf Excel (1kg)',210.00,2,420.00),(166,56,6,'Tomatoes',40.00,5,200.00),(167,56,5,'Eggs (12 pcs)',90.00,2,180.00),(168,57,12,'Parle-G Biscuits',10.00,5,50.00),(169,57,11,'Britannia Bread',45.00,3,135.00),(170,57,2,'Whole Wheat Atta (5kg)',220.00,1,220.00),(171,58,22,'Surf Excel (1kg)',210.00,5,1050.00),(172,58,8,'Potatoes',30.00,4,120.00),(173,59,10,'Apples (1kg)',180.00,2,360.00),(174,59,13,'Lay\'s Classic Chips',20.00,1,20.00),(175,59,21,'Dove Soap (75g)',50.00,4,200.00),(176,59,12,'Parle-G Biscuits',10.00,1,10.00),(177,59,17,'Nescafe Classic (100g)',250.00,4,1000.00),(178,60,18,'Toor Dal (1kg)',130.00,2,260.00),(179,60,20,'Colgate Toothpaste (200g)',95.00,3,285.00),(180,60,6,'Tomatoes',40.00,1,40.00),(181,60,16,'Tata Tea Premium (250g)',140.00,4,560.00),(182,60,8,'Potatoes',30.00,2,60.00),(183,60,22,'Surf Excel (1kg)',210.00,4,840.00),(184,61,9,'Bananas (dozen)',45.00,2,90.00),(185,61,21,'Dove Soap (75g)',50.00,3,150.00),(186,61,12,'Parle-G Biscuits',10.00,5,50.00),(187,61,24,'Frozen Peas (500g)',70.00,5,350.00),(188,61,15,'Mineral Water (1L)',20.00,5,100.00),(189,61,20,'Colgate Toothpaste (200g)',95.00,5,475.00),(190,62,8,'Potatoes',30.00,1,30.00),(191,62,7,'Onions',35.00,1,35.00),(192,62,2,'Whole Wheat Atta (5kg)',220.00,3,660.00),(193,62,16,'Tata Tea Premium (250g)',140.00,1,140.00),(194,63,11,'Britannia Bread',45.00,4,180.00),(195,64,25,'Maggi Noodles (280g)',52.00,5,260.00),(196,64,6,'Tomatoes',40.00,3,120.00),(197,64,16,'Tata Tea Premium (250g)',140.00,4,560.00),(198,64,11,'Britannia Bread',45.00,1,45.00),(199,64,19,'Sunflower Oil (1L)',130.00,1,130.00),(200,65,8,'Potatoes',30.00,3,90.00),(201,66,24,'Frozen Peas (500g)',70.00,3,210.00),(202,67,6,'Tomatoes',40.00,3,120.00),(203,67,24,'Frozen Peas (500g)',70.00,2,140.00),(204,67,18,'Toor Dal (1kg)',130.00,3,390.00),(205,68,1,'Basmati Rice (1kg)',85.00,2,170.00),(206,68,25,'Maggi Noodles (280g)',52.00,2,104.00),(207,68,14,'Coca-Cola (500ml)',40.00,4,160.00),(208,68,24,'Frozen Peas (500g)',70.00,3,210.00),(209,68,18,'Toor Dal (1kg)',130.00,5,650.00),(210,69,15,'Mineral Water (1L)',20.00,5,100.00),(211,69,24,'Frozen Peas (500g)',70.00,4,280.00),(212,69,4,'Amul Milk (1L)',62.00,1,62.00),(213,69,14,'Coca-Cola (500ml)',40.00,5,200.00),(214,69,23,'Chicken Breast (1kg)',280.00,2,560.00),(215,70,12,'Parle-G Biscuits',10.00,2,20.00),(216,71,18,'Toor Dal (1kg)',130.00,3,390.00),(217,72,15,'Mineral Water (1L)',20.00,4,80.00),(218,73,14,'Coca-Cola (500ml)',40.00,1,40.00),(219,73,12,'Parle-G Biscuits',10.00,3,30.00),(220,73,1,'Basmati Rice (1kg)',85.00,4,340.00),(221,73,11,'Britannia Bread',45.00,3,135.00),(222,73,9,'Bananas (dozen)',45.00,3,135.00),(223,73,19,'Sunflower Oil (1L)',130.00,4,520.00),(224,74,25,'Maggi Noodles (280g)',52.00,5,260.00),(225,74,19,'Sunflower Oil (1L)',130.00,1,130.00),(226,74,7,'Onions',35.00,3,105.00),(227,75,12,'Parle-G Biscuits',10.00,1,10.00),(228,75,24,'Frozen Peas (500g)',70.00,4,280.00),(229,75,7,'Onions',35.00,4,140.00),(230,75,18,'Toor Dal (1kg)',130.00,5,650.00),(231,75,2,'Whole Wheat Atta (5kg)',220.00,5,1100.00),(232,76,14,'Coca-Cola (500ml)',40.00,2,80.00),(233,76,2,'Whole Wheat Atta (5kg)',220.00,2,440.00),(234,76,12,'Parle-G Biscuits',10.00,1,10.00),(235,77,18,'Toor Dal (1kg)',130.00,5,650.00),(236,77,13,'Lay\'s Classic Chips',20.00,3,60.00),(237,78,6,'Tomatoes',40.00,4,160.00),(238,78,14,'Coca-Cola (500ml)',40.00,5,200.00),(239,79,15,'Mineral Water (1L)',20.00,4,80.00),(240,79,3,'Amul Butter (500g)',245.00,4,980.00),(241,79,6,'Tomatoes',40.00,2,80.00),(242,79,14,'Coca-Cola (500ml)',40.00,1,40.00),(243,79,9,'Bananas (dozen)',45.00,1,45.00),(244,79,20,'Colgate Toothpaste (200g)',95.00,4,380.00),(245,80,1,'Basmati Rice (1kg)',85.00,5,425.00),(246,81,9,'Bananas (dozen)',45.00,5,225.00),(247,82,13,'Lay\'s Classic Chips',20.00,3,60.00),(248,82,5,'Eggs (12 pcs)',90.00,3,270.00),(249,82,25,'Maggi Noodles (280g)',52.00,2,104.00),(250,82,19,'Sunflower Oil (1L)',130.00,5,650.00),(251,82,11,'Britannia Bread',45.00,4,180.00),(252,83,7,'Onions',35.00,4,140.00),(253,83,24,'Frozen Peas (500g)',70.00,4,280.00),(254,84,15,'Mineral Water (1L)',20.00,4,80.00),(255,84,13,'Lay\'s Classic Chips',20.00,3,60.00),(256,84,18,'Toor Dal (1kg)',130.00,1,130.00),(257,84,16,'Tata Tea Premium (250g)',140.00,4,560.00),(258,85,6,'Tomatoes',40.00,4,160.00),(259,85,24,'Frozen Peas (500g)',70.00,2,140.00),(260,85,8,'Potatoes',30.00,3,90.00),(261,86,22,'Surf Excel (1kg)',210.00,2,420.00),(262,86,16,'Tata Tea Premium (250g)',140.00,5,700.00),(263,86,25,'Maggi Noodles (280g)',52.00,5,260.00),(264,86,14,'Coca-Cola (500ml)',40.00,2,80.00),(265,87,19,'Sunflower Oil (1L)',130.00,5,650.00),(266,88,7,'Onions',35.00,5,175.00),(267,88,20,'Colgate Toothpaste (200g)',95.00,2,190.00),(268,88,12,'Parle-G Biscuits',10.00,4,40.00),(269,89,17,'Nescafe Classic (100g)',250.00,1,250.00),(270,89,20,'Colgate Toothpaste (200g)',95.00,5,475.00),(271,89,21,'Dove Soap (75g)',50.00,3,150.00),(272,89,14,'Coca-Cola (500ml)',40.00,1,40.00),(273,90,17,'Nescafe Classic (100g)',250.00,1,250.00),(274,90,15,'Mineral Water (1L)',20.00,3,60.00),(275,90,3,'Amul Butter (500g)',245.00,3,735.00),(276,90,9,'Bananas (dozen)',45.00,5,225.00),(277,91,17,'Nescafe Classic (100g)',250.00,1,250.00),(278,91,22,'Surf Excel (1kg)',210.00,1,210.00),(279,91,15,'Mineral Water (1L)',20.00,4,80.00),(280,91,13,'Lay\'s Classic Chips',20.00,2,40.00),(281,92,13,'Lay\'s Classic Chips',20.00,2,40.00),(282,92,16,'Tata Tea Premium (250g)',140.00,4,560.00),(283,92,18,'Toor Dal (1kg)',130.00,2,260.00),(284,92,23,'Chicken Breast (1kg)',280.00,3,840.00),(285,92,4,'Amul Milk (1L)',62.00,4,248.00),(286,92,6,'Tomatoes',40.00,2,80.00),(287,93,22,'Surf Excel (1kg)',210.00,5,1050.00),(288,94,21,'Dove Soap (75g)',50.00,1,50.00),(289,95,18,'Toor Dal (1kg)',130.00,1,130.00),(290,95,12,'Parle-G Biscuits',10.00,5,50.00),(291,95,22,'Surf Excel (1kg)',210.00,4,840.00),(292,96,16,'Tata Tea Premium (250g)',140.00,4,560.00),(293,96,12,'Parle-G Biscuits',10.00,3,30.00),(294,96,24,'Frozen Peas (500g)',70.00,5,350.00),(295,97,16,'Tata Tea Premium (250g)',140.00,4,560.00),(296,97,4,'Amul Milk (1L)',62.00,1,62.00),(297,97,5,'Eggs (12 pcs)',90.00,1,90.00),(298,97,12,'Parle-G Biscuits',10.00,2,20.00),(299,97,15,'Mineral Water (1L)',20.00,5,100.00),(300,98,6,'Tomatoes',40.00,3,120.00),(301,98,21,'Dove Soap (75g)',50.00,5,250.00),(302,98,10,'Apples (1kg)',180.00,4,720.00),(303,98,18,'Toor Dal (1kg)',130.00,1,130.00),(304,98,19,'Sunflower Oil (1L)',130.00,4,520.00),(305,99,7,'Onions',35.00,5,175.00),(306,99,21,'Dove Soap (75g)',50.00,3,150.00),(307,100,19,'Sunflower Oil (1L)',130.00,1,130.00),(308,100,11,'Britannia Bread',45.00,5,225.00),(309,100,14,'Coca-Cola (500ml)',40.00,1,40.00),(310,101,7,'Onions',35.00,2,70.00),(311,101,20,'Colgate Toothpaste (200g)',95.00,4,380.00),(312,101,12,'Parle-G Biscuits',10.00,3,30.00),(313,102,14,'Coca-Cola (500ml)',40.00,2,80.00),(314,102,15,'Mineral Water (1L)',20.00,3,60.00),(315,102,8,'Potatoes',30.00,1,30.00),(316,102,24,'Frozen Peas (500g)',70.00,5,350.00),(317,102,3,'Amul Butter (500g)',245.00,5,1225.00),(318,103,23,'Chicken Breast (1kg)',280.00,4,1120.00),(319,103,4,'Amul Milk (1L)',62.00,1,62.00),(320,103,24,'Frozen Peas (500g)',70.00,3,210.00),(321,103,18,'Toor Dal (1kg)',130.00,2,260.00),(322,104,23,'Chicken Breast (1kg)',280.00,3,840.00),(323,104,14,'Coca-Cola (500ml)',40.00,3,120.00),(324,104,11,'Britannia Bread',45.00,5,225.00),(325,104,25,'Maggi Noodles (280g)',52.00,4,208.00),(326,105,19,'Sunflower Oil (1L)',130.00,4,520.00),(327,105,1,'Basmati Rice (1kg)',85.00,4,340.00),(328,105,13,'Lay\'s Classic Chips',20.00,3,60.00),(329,105,9,'Bananas (dozen)',45.00,2,90.00),(330,105,15,'Mineral Water (1L)',20.00,4,80.00),(331,106,8,'Potatoes',30.00,3,90.00),(332,106,21,'Dove Soap (75g)',50.00,4,200.00),(333,106,7,'Onions',35.00,5,175.00),(334,106,22,'Surf Excel (1kg)',210.00,2,420.00),(335,107,25,'Maggi Noodles (280g)',52.00,1,52.00),(336,107,17,'Nescafe Classic (100g)',250.00,4,1000.00),(337,109,4,'Amul Milk (1L)',62.00,1,62.00),(338,109,10,'Apples (1kg)',180.00,1,180.00),(339,109,9,'Bananas (dozen)',45.00,1,45.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) NOT NULL,
  `user_id` int DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) DEFAULT '0.00',
  `tax` decimal(10,2) DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','card','upi','wallet') DEFAULT 'cash',
  `payment_status` enum('paid','pending','refunded') DEFAULT 'paid',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `user_id` (`user_id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=110 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'INV-20260322-3476',2,4,1120.00,0.00,0.00,1120.00,'card','paid',NULL,'2026-03-22 08:59:48'),(2,'INV-20260322-7742',1,2,280.00,0.00,0.00,280.00,'wallet','paid',NULL,'2026-03-22 06:49:00'),(3,'INV-20260322-9691',2,2,1565.00,0.00,0.00,1565.00,'upi','paid',NULL,'2026-03-22 15:45:34'),(4,'INV-20260322-7550',2,2,536.00,0.00,0.00,536.00,'card','paid',NULL,'2026-03-22 12:37:35'),(5,'INV-20260322-7605',2,NULL,912.00,0.00,0.00,912.00,'wallet','paid',NULL,'2026-03-22 09:42:49'),(6,'INV-20260322-9178',1,1,530.00,0.00,0.00,530.00,'cash','paid',NULL,'2026-03-22 04:12:49'),(7,'INV-20260322-1632',2,1,560.00,0.00,0.00,560.00,'upi','paid',NULL,'2026-03-22 12:26:20'),(8,'INV-20260322-5586',2,NULL,1232.00,0.00,0.00,1232.00,'cash','paid',NULL,'2026-03-22 08:28:14'),(9,'INV-20260322-6867',1,NULL,1050.00,0.00,0.00,1050.00,'upi','paid',NULL,'2026-03-22 15:34:07'),(10,'INV-20260322-7813',2,4,160.00,0.00,0.00,160.00,'wallet','paid',NULL,'2026-03-22 05:11:59'),(11,'INV-20260322-5396',2,NULL,1218.00,0.00,0.00,1218.00,'card','paid',NULL,'2026-03-22 14:46:47'),(12,'INV-20260322-4592',1,1,455.00,0.00,0.00,455.00,'card','paid',NULL,'2026-03-22 06:01:29'),(13,'INV-20260322-6367',2,1,100.00,7.00,0.00,93.00,'upi','paid',NULL,'2026-03-22 13:56:52'),(14,'INV-20260323-9247',2,NULL,1175.00,0.00,0.00,1175.00,'card','paid',NULL,'2026-03-23 12:39:06'),(15,'INV-20260323-2901',1,NULL,345.00,0.00,0.00,345.00,'wallet','paid',NULL,'2026-03-23 07:45:37'),(16,'INV-20260323-1248',2,2,1649.00,0.00,0.00,1649.00,'wallet','paid',NULL,'2026-03-23 06:39:30'),(17,'INV-20260323-6951',2,2,120.00,0.00,0.00,120.00,'upi','paid',NULL,'2026-03-23 04:44:27'),(18,'INV-20260323-6017',2,4,790.00,0.00,0.00,790.00,'cash','paid',NULL,'2026-03-23 11:34:42'),(19,'INV-20260323-4070',2,NULL,40.00,0.00,0.00,40.00,'wallet','paid',NULL,'2026-03-23 06:57:18'),(20,'INV-20260323-3905',2,NULL,2060.00,0.00,0.00,2060.00,'upi','paid',NULL,'2026-03-23 12:34:26'),(21,'INV-20260323-8941',1,NULL,970.00,0.00,0.00,970.00,'wallet','paid',NULL,'2026-03-23 07:04:47'),(22,'INV-20260323-4615',2,NULL,450.00,0.00,0.00,450.00,'cash','paid',NULL,'2026-03-23 04:22:07'),(23,'INV-20260323-9160',2,3,713.00,0.00,0.00,713.00,'cash','paid',NULL,'2026-03-23 04:56:58'),(24,'INV-20260323-7694',2,3,1195.00,0.00,0.00,1195.00,'card','paid',NULL,'2026-03-23 15:48:26'),(25,'INV-20260323-9711',2,4,165.00,0.00,0.00,165.00,'card','paid',NULL,'2026-03-23 15:22:16'),(26,'INV-20260323-4934',2,1,1725.00,0.00,0.00,1725.00,'upi','paid',NULL,'2026-03-23 04:58:43'),(27,'INV-20260324-7563',1,NULL,365.00,0.00,0.00,365.00,'upi','paid',NULL,'2026-03-24 09:31:20'),(28,'INV-20260324-9174',2,4,280.00,0.00,0.00,280.00,'wallet','paid',NULL,'2026-03-24 07:22:02'),(29,'INV-20260324-2292',2,NULL,510.00,0.00,0.00,510.00,'upi','paid',NULL,'2026-03-24 15:06:43'),(30,'INV-20260324-6901',1,4,2155.00,0.00,0.00,2155.00,'wallet','paid',NULL,'2026-03-24 07:52:09'),(31,'INV-20260324-3111',1,NULL,140.00,0.00,0.00,140.00,'card','paid',NULL,'2026-03-24 09:04:56'),(32,'INV-20260324-8020',1,NULL,940.00,0.00,0.00,940.00,'upi','paid',NULL,'2026-03-24 15:00:35'),(33,'INV-20260324-5347',2,NULL,750.00,0.00,0.00,750.00,'cash','paid',NULL,'2026-03-24 11:55:46'),(34,'INV-20260324-8856',1,2,1080.00,0.00,0.00,1080.00,'cash','paid',NULL,'2026-03-24 12:39:16'),(35,'INV-20260325-6773',2,1,1065.00,0.00,0.00,1065.00,'upi','paid',NULL,'2026-03-25 02:38:47'),(36,'INV-20260325-8796',2,4,1770.00,0.00,0.00,1770.00,'cash','paid',NULL,'2026-03-25 02:45:23'),(37,'INV-20260325-8990',1,4,910.00,0.00,0.00,910.00,'wallet','paid',NULL,'2026-03-25 10:55:20'),(38,'INV-20260325-2480',1,NULL,726.00,10.00,0.00,716.00,'wallet','paid',NULL,'2026-03-25 11:26:50'),(39,'INV-20260325-4740',1,1,1141.00,48.00,0.00,1093.00,'card','paid',NULL,'2026-03-25 14:38:21'),(40,'INV-20260325-1952',1,3,170.00,0.00,0.00,170.00,'card','paid',NULL,'2026-03-25 14:49:22'),(41,'INV-20260325-4738',2,2,1650.00,0.00,0.00,1650.00,'cash','paid',NULL,'2026-03-25 05:50:06'),(42,'INV-20260325-7673',2,NULL,942.00,0.00,0.00,942.00,'wallet','paid',NULL,'2026-03-25 14:11:20'),(43,'INV-20260325-7554',1,4,985.00,30.00,0.00,955.00,'card','paid',NULL,'2026-03-25 06:59:49'),(44,'INV-20260325-6237',2,NULL,420.00,0.00,0.00,420.00,'cash','paid',NULL,'2026-03-25 04:47:42'),(45,'INV-20260325-6279',2,NULL,645.00,24.00,0.00,621.00,'upi','paid',NULL,'2026-03-25 06:49:28'),(46,'INV-20260325-1054',2,4,1550.00,35.00,0.00,1515.00,'wallet','paid',NULL,'2026-03-25 12:18:41'),(47,'INV-20260325-6055',2,NULL,1250.00,0.00,0.00,1250.00,'cash','paid',NULL,'2026-03-25 09:47:01'),(48,'INV-20260325-1267',1,NULL,440.00,0.00,0.00,440.00,'upi','paid',NULL,'2026-03-25 08:33:54'),(49,'INV-20260325-2395',1,NULL,485.00,0.00,0.00,485.00,'wallet','paid',NULL,'2026-03-25 03:15:59'),(50,'INV-20260326-7192',2,NULL,745.00,31.00,0.00,714.00,'card','paid',NULL,'2026-03-26 12:33:39'),(51,'INV-20260326-7147',1,NULL,190.00,0.00,0.00,190.00,'cash','paid',NULL,'2026-03-26 11:19:02'),(52,'INV-20260326-8392',1,NULL,1995.00,0.00,0.00,1995.00,'upi','paid',NULL,'2026-03-26 04:46:45'),(53,'INV-20260326-6022',1,2,265.00,0.00,0.00,265.00,'upi','paid',NULL,'2026-03-26 11:42:12'),(54,'INV-20260326-7373',1,NULL,1657.00,0.00,0.00,1657.00,'card','paid',NULL,'2026-03-26 05:42:51'),(55,'INV-20260326-9435',2,1,910.00,0.00,0.00,910.00,'cash','paid',NULL,'2026-03-26 11:29:34'),(56,'INV-20260326-1388',2,NULL,800.00,0.00,0.00,800.00,'cash','paid',NULL,'2026-03-26 04:46:52'),(57,'INV-20260326-2168',1,2,405.00,0.00,0.00,405.00,'wallet','paid',NULL,'2026-03-26 04:01:14'),(58,'INV-20260326-5250',2,3,1170.00,0.00,0.00,1170.00,'cash','paid',NULL,'2026-03-26 08:35:02'),(59,'INV-20260326-4729',1,4,1590.00,0.00,0.00,1590.00,'wallet','paid',NULL,'2026-03-26 07:28:21'),(60,'INV-20260326-8126',1,NULL,2045.00,31.00,0.00,2014.00,'cash','paid',NULL,'2026-03-26 04:47:41'),(61,'INV-20260326-9356',2,NULL,1215.00,0.00,0.00,1215.00,'upi','paid',NULL,'2026-03-26 04:13:57'),(62,'INV-20260326-8723',2,NULL,865.00,0.00,0.00,865.00,'cash','paid',NULL,'2026-03-26 10:27:24'),(63,'INV-20260326-4742',2,1,180.00,0.00,0.00,180.00,'card','paid',NULL,'2026-03-26 14:42:16'),(64,'INV-20260326-9751',1,1,1115.00,0.00,0.00,1115.00,'card','paid',NULL,'2026-03-26 13:04:23'),(65,'INV-20260326-6702',1,2,90.00,0.00,0.00,90.00,'cash','paid',NULL,'2026-03-26 11:35:55'),(66,'INV-20260326-4980',2,4,210.00,37.00,0.00,173.00,'wallet','paid',NULL,'2026-03-26 07:51:50'),(67,'INV-20260327-3355',1,NULL,650.00,0.00,0.00,650.00,'cash','paid',NULL,'2026-03-27 16:10:56'),(68,'INV-20260327-5823',1,3,1294.00,0.00,0.00,1294.00,'wallet','paid',NULL,'2026-03-27 05:31:47'),(69,'INV-20260327-7407',2,NULL,1202.00,14.00,0.00,1188.00,'upi','paid',NULL,'2026-03-27 05:33:23'),(70,'INV-20260327-6211',1,NULL,20.00,0.00,0.00,20.00,'card','paid',NULL,'2026-03-27 02:54:48'),(71,'INV-20260327-3971',2,NULL,390.00,0.00,0.00,390.00,'wallet','paid',NULL,'2026-03-27 05:05:30'),(72,'INV-20260327-4472',2,NULL,80.00,0.00,0.00,80.00,'card','paid',NULL,'2026-03-27 07:23:28'),(73,'INV-20260327-5826',2,3,1200.00,0.00,0.00,1200.00,'upi','paid',NULL,'2026-03-27 05:03:35'),(74,'INV-20260327-9192',2,4,495.00,0.00,0.00,495.00,'upi','paid',NULL,'2026-03-27 04:09:30'),(75,'INV-20260327-5902',2,NULL,2180.00,0.00,0.00,2180.00,'wallet','paid',NULL,'2026-03-27 02:37:14'),(76,'INV-20260327-5851',1,NULL,530.00,0.00,0.00,530.00,'cash','paid',NULL,'2026-03-27 15:45:29'),(77,'INV-20260327-8645',2,4,710.00,0.00,0.00,710.00,'upi','paid',NULL,'2026-03-27 14:30:32'),(78,'INV-20260327-6771',1,2,360.00,0.00,0.00,360.00,'wallet','paid',NULL,'2026-03-27 13:52:00'),(79,'INV-20260327-8465',1,NULL,1605.00,0.00,0.00,1605.00,'wallet','paid',NULL,'2026-03-27 13:31:09'),(80,'INV-20260327-9334',1,NULL,425.00,0.00,0.00,425.00,'cash','paid',NULL,'2026-03-27 12:01:54'),(81,'INV-20260327-6191',2,NULL,225.00,0.00,0.00,225.00,'card','paid',NULL,'2026-03-27 04:30:46'),(82,'INV-20260327-8515',2,3,1264.00,0.00,0.00,1264.00,'wallet','paid',NULL,'2026-03-27 05:26:04'),(83,'INV-20260328-3889',2,NULL,420.00,24.00,0.00,396.00,'wallet','paid',NULL,'2026-03-28 03:49:54'),(84,'INV-20260328-3475',1,NULL,830.00,29.00,0.00,801.00,'wallet','paid',NULL,'2026-03-28 12:21:20'),(85,'INV-20260328-8920',2,NULL,390.00,0.00,0.00,390.00,'card','paid',NULL,'2026-03-28 14:54:59'),(86,'INV-20260328-2773',1,NULL,1460.00,0.00,0.00,1460.00,'upi','paid',NULL,'2026-03-28 14:10:21'),(87,'INV-20260328-5144',2,2,650.00,0.00,0.00,650.00,'cash','paid',NULL,'2026-03-28 06:18:10'),(88,'INV-20260328-7393',1,2,405.00,0.00,0.00,405.00,'card','paid',NULL,'2026-03-28 12:28:31'),(89,'INV-20260328-5838',1,1,915.00,0.00,0.00,915.00,'wallet','paid',NULL,'2026-03-28 04:44:22'),(90,'INV-20260328-1809',2,NULL,1270.00,0.00,0.00,1270.00,'upi','paid',NULL,'2026-03-28 13:26:30'),(91,'INV-20260328-1318',1,NULL,580.00,0.00,0.00,580.00,'cash','paid',NULL,'2026-03-28 15:59:22'),(92,'INV-20260328-3830',2,3,2028.00,0.00,0.00,2028.00,'cash','paid',NULL,'2026-03-28 09:25:05'),(93,'INV-20260328-1029',1,2,1050.00,0.00,0.00,1050.00,'card','paid',NULL,'2026-03-28 13:13:34'),(94,'INV-20260328-3871',2,NULL,50.00,0.00,0.00,50.00,'upi','paid',NULL,'2026-03-28 03:56:19'),(95,'INV-20260328-4691',2,NULL,1020.00,0.00,0.00,1020.00,'wallet','paid',NULL,'2026-03-28 04:37:02'),(96,'INV-20260328-6877',1,1,940.00,0.00,0.00,940.00,'wallet','paid',NULL,'2026-03-28 02:58:59'),(97,'INV-20260328-9299',2,3,832.00,0.00,0.00,832.00,'upi','paid',NULL,'2026-03-28 07:05:27'),(98,'INV-20260328-1354',1,NULL,1740.00,0.00,0.00,1740.00,'upi','paid',NULL,'2026-03-28 03:01:13'),(99,'INV-20260328-8152',1,NULL,325.00,0.00,0.00,325.00,'upi','paid',NULL,'2026-03-28 07:28:51'),(100,'INV-20260329-3381',1,4,395.00,0.00,0.00,395.00,'wallet','paid',NULL,'2026-03-29 16:19:29'),(101,'INV-20260329-6413',2,NULL,480.00,0.00,0.00,480.00,'upi','paid',NULL,'2026-03-29 14:39:01'),(102,'INV-20260329-4813',1,NULL,1745.00,0.00,0.00,1745.00,'wallet','paid',NULL,'2026-03-29 15:32:52'),(103,'INV-20260329-6672',1,NULL,1652.00,0.00,0.00,1652.00,'cash','paid',NULL,'2026-03-29 16:15:08'),(104,'INV-20260329-4342',1,NULL,1393.00,0.00,0.00,1393.00,'upi','paid',NULL,'2026-03-29 07:53:52'),(105,'INV-20260329-5569',1,2,1090.00,0.00,0.00,1090.00,'upi','paid',NULL,'2026-03-29 06:26:17'),(106,'INV-20260329-9375',2,NULL,885.00,0.00,0.00,885.00,'cash','paid',NULL,'2026-03-29 12:17:52'),(107,'INV-20260329-2040',1,NULL,1052.00,0.00,0.00,1052.00,'wallet','paid',NULL,'2026-03-29 12:40:52'),(109,'INV-20260421-5910',1,NULL,287.00,0.00,0.00,287.00,'cash','paid',NULL,'2026-04-21 05:27:18');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `cost_price` decimal(10,2) DEFAULT '0.00',
  `stock` int DEFAULT '0',
  `unit` varchar(50) DEFAULT 'pcs',
  `image_url` varchar(500) DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `barcode` (`barcode`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Basmati Rice (1kg)','8901234567890',6,85.00,65.00,150,'kg',NULL,1,'2026-04-21 05:11:28'),(2,'Whole Wheat Atta (5kg)','8901234567891',6,220.00,175.00,80,'pack',NULL,1,'2026-04-21 05:11:28'),(3,'Amul Butter (500g)','8901234567892',2,245.00,200.00,60,'pack',NULL,1,'2026-04-21 05:11:28'),(4,'Amul Milk (1L)','8901234567893',2,62.00,50.00,199,'litre',NULL,1,'2026-04-21 05:11:28'),(5,'Eggs (12 pcs)','8901234567894',2,90.00,72.00,100,'dozen',NULL,1,'2026-04-21 05:11:28'),(6,'Tomatoes','8901234567895',1,40.00,25.00,200,'kg',NULL,1,'2026-04-21 05:11:28'),(7,'Onions','8901234567896',1,35.00,20.00,250,'kg',NULL,1,'2026-04-21 05:11:28'),(8,'Potatoes','8901234567897',1,30.00,18.00,300,'kg',NULL,1,'2026-04-21 05:11:28'),(9,'Bananas (dozen)','8901234567898',1,45.00,30.00,99,'dozen',NULL,1,'2026-04-21 05:11:28'),(10,'Apples (1kg)','8901234567899',1,180.00,140.00,79,'kg',NULL,1,'2026-04-21 05:11:28'),(11,'Britannia Bread','8901234567900',3,45.00,35.00,120,'pack',NULL,1,'2026-04-21 05:11:28'),(12,'Parle-G Biscuits','8901234567901',5,10.00,8.00,500,'pack',NULL,1,'2026-04-21 05:11:28'),(13,'Lay\'s Classic Chips','8901234567902',5,20.00,15.00,300,'pack',NULL,1,'2026-04-21 05:11:28'),(14,'Coca-Cola (500ml)','8901234567903',4,40.00,30.00,200,'bottle',NULL,1,'2026-04-21 05:11:28'),(15,'Mineral Water (1L)','8901234567904',4,20.00,12.00,400,'bottle',NULL,1,'2026-04-21 05:11:28'),(16,'Tata Tea Premium (250g)','8901234567905',4,140.00,110.00,90,'pack',NULL,1,'2026-04-21 05:11:28'),(17,'Nescafe Classic (100g)','8901234567906',4,250.00,200.00,50,'jar',NULL,1,'2026-04-21 05:11:28'),(18,'Toor Dal (1kg)','8901234567907',6,130.00,100.00,120,'kg',NULL,1,'2026-04-21 05:11:28'),(19,'Sunflower Oil (1L)','8901234567908',6,130.00,105.00,100,'litre',NULL,1,'2026-04-21 05:11:28'),(20,'Colgate Toothpaste (200g)','8901234567909',8,95.00,75.00,80,'tube',NULL,1,'2026-04-21 05:11:28'),(21,'Dove Soap (75g)','8901234567910',8,50.00,38.00,150,'bar',NULL,1,'2026-04-21 05:11:28'),(22,'Surf Excel (1kg)','8901234567911',9,210.00,165.00,70,'pack',NULL,1,'2026-04-21 05:11:28'),(23,'Chicken Breast (1kg)','8901234567912',7,280.00,220.00,40,'kg',NULL,1,'2026-04-21 05:11:28'),(24,'Frozen Peas (500g)','8901234567913',10,70.00,55.00,60,'pack',NULL,1,'2026-04-21 05:11:28'),(25,'Maggi Noodles (280g)','8901234567914',5,52.00,42.00,200,'pack',NULL,1,'2026-04-21 05:11:28');
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
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','cashier') DEFAULT 'cashier',
  `active` tinyint(1) DEFAULT '1',
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin User','admin@grocerypos.com','$2a$12$XatJnANy9filtHvG0isU2u1POpacIwh8W9xMo3YK6OTIKaNHna//2','admin',1,'2026-04-21 05:27:03','2026-04-21 05:11:28'),(2,'John Cashier','cashier@grocerypos.com','$2a$12$uUwWGmo0XJo0oYPm7oyWsuTqeIoN37qArN.bd1BiGYc./QSUWOTFa','cashier',1,'2026-04-21 05:46:32','2026-04-21 05:11:28');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'grocery_pos'
--

--
-- Dumping routines for database 'grocery_pos'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-21 13:58:00
