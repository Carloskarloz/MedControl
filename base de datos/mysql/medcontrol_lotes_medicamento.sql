CREATE DATABASE  IF NOT EXISTS `medcontrol` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `medcontrol`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: medcontrol
-- ------------------------------------------------------
-- Server version	8.0.46

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
-- Table structure for table `lotes_medicamento`
--

DROP TABLE IF EXISTS `lotes_medicamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lotes_medicamento` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `institucion_id` bigint NOT NULL,
  `medicamento_id` bigint NOT NULL,
  `codigo_lote` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cantidad_disponible` int NOT NULL DEFAULT '0',
  `fecha_ingreso` date NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DISPONIBLE',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_lote_institucion` (`institucion_id`,`medicamento_id`,`codigo_lote`),
  KEY `fk_lotes_medicamentos` (`medicamento_id`),
  CONSTRAINT `fk_lotes_instituciones` FOREIGN KEY (`institucion_id`) REFERENCES `instituciones` (`id`),
  CONSTRAINT `fk_lotes_medicamentos` FOREIGN KEY (`medicamento_id`) REFERENCES `medicamentos` (`id`),
  CONSTRAINT `chk_lotes_cantidad` CHECK ((`cantidad_disponible` >= 0)),
  CONSTRAINT `chk_lotes_fechas` CHECK ((`fecha_vencimiento` >= `fecha_ingreso`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-03  0:45:08
