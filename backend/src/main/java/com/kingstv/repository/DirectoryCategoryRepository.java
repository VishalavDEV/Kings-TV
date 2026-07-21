package com.kingstv.repository;

import com.kingstv.models.DirectoryCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DirectoryCategoryRepository extends JpaRepository<DirectoryCategory, Long> {
    Optional<DirectoryCategory> findBySlug(String slug);
}
