package com.kingstv.repository;

import com.kingstv.models.Widget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WidgetRepository extends JpaRepository<Widget, Long> {
    List<Widget> findByPlacementOrderByMenuOrderAsc(String placement);
}
