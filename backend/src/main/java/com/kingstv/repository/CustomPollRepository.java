package com.kingstv.repository;

import com.kingstv.models.CustomPoll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomPollRepository extends JpaRepository<CustomPoll, Long> {
}
