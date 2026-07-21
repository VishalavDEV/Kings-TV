package com.kingstv.repository;

import com.kingstv.models.MediaAsset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MediaAssetRepository extends JpaRepository<MediaAsset, Long> {

    Optional<MediaAsset> findByUrl(String url);

    @Query("SELECT m FROM MediaAsset m WHERE " +
           "(:type IS NULL OR m.mimeType LIKE CONCAT(:type, '/%')) AND " +
           "(:tag IS NULL OR m.tags LIKE CONCAT('%', :tag, '%')) AND " +
           "(:search IS NULL OR m.filename LIKE CONCAT('%', :search, '%') OR m.altText LIKE CONCAT('%', :search, '%'))")
    Page<MediaAsset> searchAssets(
        @Param("type") String type,
        @Param("tag") String tag,
        @Param("search") String search,
        Pageable pageable
    );

    @Query("SELECT m FROM MediaAsset m WHERE " +
           "(:mimePrefix IS NULL OR m.mimeType LIKE CONCAT(:mimePrefix, '/%')) AND " +
           "(:tag IS NULL OR m.tags LIKE CONCAT('%', :tag, '%')) AND " +
           "(:search IS NULL OR m.filename LIKE CONCAT('%', :search, '%') OR m.altText LIKE CONCAT('%', :search, '%'))")
    Page<MediaAsset> searchAssetsWithMimePrefix(
        @Param("mimePrefix") String mimePrefix,
        @Param("tag") String tag,
        @Param("search") String search,
        Pageable pageable
    );
}
