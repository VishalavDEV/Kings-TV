package com.kingstv.repository;

import com.kingstv.models.LiveChannel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LiveChannelRepository extends JpaRepository<LiveChannel, Long> {
    List<LiveChannel> findByIsActive(Boolean isActive);
}
