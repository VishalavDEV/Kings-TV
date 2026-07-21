package com.kingstv.repository;

import com.kingstv.models.GalleryImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GalleryImageRepository extends JpaRepository<GalleryImage, Long>, JpaSpecificationExecutor<GalleryImage> {
    List<GalleryImage> findByAlbumIdOrderByDisplayOrderAsc(Long albumId);
    List<GalleryImage> findByAlbumId(Long albumId);
    long countByAlbumId(Long albumId);
    void deleteByAlbumId(Long albumId);
}
