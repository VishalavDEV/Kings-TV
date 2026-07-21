package com.kingstv.repository;

import com.kingstv.models.CommodityPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommodityPriceRepository extends JpaRepository<CommodityPrice, Long> {
}
