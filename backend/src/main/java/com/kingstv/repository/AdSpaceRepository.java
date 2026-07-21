package com.kingstv.repository;

import com.kingstv.models.AdSpace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AdSpaceRepository extends JpaRepository<AdSpace, Long> {
    Optional<AdSpace> findByPlacementKey(String placementKey);
}
