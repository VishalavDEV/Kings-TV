package com.kingstv.repository;

import com.kingstv.models.PayoutMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PayoutMethodRepository extends JpaRepository<PayoutMethod, Long> {
    Optional<PayoutMethod> findByMethodName(String methodName);
}
