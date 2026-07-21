package com.kingstv.repository;

import com.kingstv.models.GalleryAlbum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GalleryAlbumRepository extends JpaRepository<GalleryAlbum, Long> {
}
