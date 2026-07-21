package com.kingstv.repository;

import com.kingstv.models.Condolence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CondolenceRepository extends JpaRepository<Condolence, Long> {
    List<Condolence> findByObituaryId(Long obituaryId);
    List<Condolence> findByObituaryIdAndStatus(Long obituaryId, String status);
}
