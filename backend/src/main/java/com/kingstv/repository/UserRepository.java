package com.kingstv.repository;

import com.kingstv.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByFullName(String fullName);
    Page<User> findByRole(String role, Pageable pageable);
    List<User> findByRole(String role);
    long countByRole(String role);
    long countByIsActive(Boolean isActive);
    List<User> findByRoleAndIsActive(String role, Boolean isActive);
    List<User> findTop5ByOrderByCreatedAtDesc();
    Page<User> findByDistrictId(Long districtId, Pageable pageable);
    List<User> findByDistrictId(Long districtId);
    Page<User> findByRoleAndDistrictId(String role, Long districtId, Pageable pageable);
    List<User> findByRoleAndDistrictId(String role, Long districtId);
    Optional<User> findByUsername(String username);
}
