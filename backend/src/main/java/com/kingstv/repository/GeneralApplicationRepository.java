package com.kingstv.repository;

import com.kingstv.models.GeneralApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GeneralApplicationRepository extends JpaRepository<GeneralApplication, Long> {
}
