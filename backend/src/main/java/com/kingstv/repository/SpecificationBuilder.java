package com.kingstv.repository;

import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.*;
import java.util.ArrayList;
import java.util.List;

public class SpecificationBuilder {
    public static <T> Specification<T> build(String search, String status, String categoryId, String districtId) {
        return (Root<T> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null && !status.isEmpty()) {
                predicates.add(cb.equal(root.get("status"), status));
            } else {
                try {
                    root.get("status");
                    predicates.add(cb.notEqual(root.get("status"), "deleted"));
                } catch (IllegalArgumentException e) {
                    // Entity doesn't have a status field, ignore
                }
            }

            if (categoryId != null && !categoryId.isEmpty()) {
                try {
                    root.get("categoryId");
                    predicates.add(cb.equal(root.get("categoryId"), Long.parseLong(categoryId)));
                } catch (IllegalArgumentException e) {
                    // Entity doesn't have a categoryId field, ignore
                }
            }

            if (districtId != null && !districtId.isEmpty()) {
                try {
                    root.get("districtId");
                    predicates.add(cb.equal(root.get("districtId"), Long.parseLong(districtId)));
                } catch (IllegalArgumentException e) {
                    // Entity doesn't have a districtId field, ignore
                }
            }

            if (search != null && !search.isEmpty()) {
                String searchPattern = "%" + search.toLowerCase() + "%";
                List<Predicate> searchPredicates = new ArrayList<>();
                
                List<String> textFields = List.of(
                    "title", "titleTa", "titleEn", "name", "nameTa", "slug",
                    "description", "descriptionTa", "content", "contentTa", "contentEn", 
                    "shortDescription", "shortDescTa", "shortDescEn", "deceasedName", 
                    "businessName", "companyName", "subject", "message", "question", "questionTa"
                );
                
                for (String field : textFields) {
                    try {
                        root.get(field);
                        searchPredicates.add(cb.like(cb.lower(root.get(field)), searchPattern));
                    } catch (IllegalArgumentException e) {
                        // Field doesn't exist on this entity, ignore
                    }
                }
                
                if (!searchPredicates.isEmpty()) {
                    predicates.add(cb.or(searchPredicates.toArray(new Predicate[0])));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
