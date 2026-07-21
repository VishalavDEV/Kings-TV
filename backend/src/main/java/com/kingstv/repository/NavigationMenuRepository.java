package com.kingstv.repository;

import com.kingstv.models.NavigationMenu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NavigationMenuRepository extends JpaRepository<NavigationMenu, Long> {
    List<NavigationMenu> findByIsActiveOrderByDisplayOrderAsc(boolean isActive);
    List<NavigationMenu> findByOrderByDisplayOrderAsc();
    List<NavigationMenu> findByParentIdAndIsActiveOrderByDisplayOrderAsc(Long parentId, boolean isActive);

    List<NavigationMenu> findByLocationOrderByDisplayOrderAsc(String location);
    List<NavigationMenu> findByParentIdOrderByDisplayOrderAsc(Long parentId);
}
