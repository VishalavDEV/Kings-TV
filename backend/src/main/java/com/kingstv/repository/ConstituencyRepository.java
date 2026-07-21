package com.kingstv.repository;

import com.kingstv.models.Constituency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ConstituencyRepository extends JpaRepository<Constituency, Long> {
    List<Constituency> findByDistrictId(Long districtId);
    List<Constituency> findByDistrictIdOrderByNameEnAsc(Long districtId);
}
