package com.kingstv.repository;

import com.kingstv.models.AdSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AdSlotRepository extends JpaRepository<AdSlot, Long> {
    Optional<AdSlot> findByPlacement(String placement);
    boolean existsByPlacement(String placement);
}
