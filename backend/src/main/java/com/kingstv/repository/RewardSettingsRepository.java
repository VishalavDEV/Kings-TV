package com.kingstv.repository;

import com.kingstv.models.RewardSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RewardSettingsRepository extends JpaRepository<RewardSettings, Long> {
}
