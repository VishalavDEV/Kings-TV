package com.kingstv.controllers;

import com.kingstv.models.Constituency;
import com.kingstv.models.District;
import com.kingstv.models.NavigationMenu;
import com.kingstv.models.Permission;
import com.kingstv.repository.ConstituencyRepository;
import com.kingstv.repository.DistrictRepository;
import com.kingstv.repository.NavigationMenuRepository;
import com.kingstv.security.RequiresPermission;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class NavigationMenuController {

    @Autowired
    private NavigationMenuRepository menuRepository;

    @Autowired
    private DistrictRepository districtRepository;

    @Autowired
    private ConstituencyRepository constituencyRepository;

    @GetMapping("/public/menus")
    public ResponseEntity<?> getPublicMenus() {
        List<NavigationMenu> allActive = menuRepository.findByIsActiveOrderByDisplayOrderAsc(true);

        // Group menu items hierarchically
        List<Map<String, Object>> result = new ArrayList<>();
        Map<Long, Map<String, Object>> lookup = new HashMap<>();

        for (NavigationMenu menu : allActive) {
            Map<String, Object> node = buildMenuNode(menu);
            lookup.put(menu.getId(), node);
        }

        for (NavigationMenu menu : allActive) {
            Map<String, Object> node = lookup.get(menu.getId());
            if (menu.getParentId() != null && lookup.containsKey(menu.getParentId())) {
                Map<String, Object> parentNode = lookup.get(menu.getParentId());
                List<Map<String, Object>> subs = (List<Map<String, Object>>) parentNode.get("subcategories");
                subs.add(node);
            } else if (menu.getParentId() == null) {
                // For top-level items with dynamicType, inject dynamic submenus
                if ("DISTRICTS".equals(menu.getDynamicType())) {
                    injectDistrictSubmenus(node, menu.getId());
                } else if ("CONSTITUENCIES".equals(menu.getDynamicType()) && menu.getDynamicDistrictId() != null) {
                    injectConstituencySubmenus(node, menu.getDynamicDistrictId(), menu.getId());
                }
                result.add(node);
            }
        }

        return ResponseEntity.ok(result);
    }

    private Map<String, Object> buildMenuNode(NavigationMenu menu) {
        Map<String, Object> node = new HashMap<>();
        node.put("id", menu.getId());
        node.put("titleTa", menu.getTitleTa());
        node.put("titleEn", menu.getTitleEn());
        node.put("linkUrl", menu.getLinkUrl());
        node.put("displayOrder", menu.getDisplayOrder());
        node.put("parentId", menu.getParentId());
        node.put("dynamicType", menu.getDynamicType());
        node.put("subcategories", new ArrayList<>());
        return node;
    }

    /** Injects districts from the districts table as submenus */
    private void injectDistrictSubmenus(Map<String, Object> parentNode, Long parentMenuId) {
        List<District> districts = districtRepository.findAll();
        List<Map<String, Object>> subs = (List<Map<String, Object>>) parentNode.get("subcategories");
        for (District d : districts) {
            Map<String, Object> child = new HashMap<>();
            child.put("id", "district-" + d.getId());
            child.put("titleTa", d.getNameTa());
            child.put("titleEn", d.getNameEn());
            child.put("linkUrl", "/district/" + d.getId());
            child.put("parentId", parentMenuId);
            child.put("dynamic", true);
            child.put("subcategories", new ArrayList<>());
            subs.add(child);
        }
    }

    /** Injects constituencies for a given district as submenus */
    private void injectConstituencySubmenus(Map<String, Object> parentNode, Long districtId, Long parentMenuId) {
        List<Constituency> constituencies = constituencyRepository.findByDistrictIdOrderByNameEnAsc(districtId);
        List<Map<String, Object>> subs = (List<Map<String, Object>>) parentNode.get("subcategories");
        for (Constituency c : constituencies) {
            Map<String, Object> child = new HashMap<>();
            child.put("id", "constituency-" + c.getId());
            child.put("titleTa", c.getNameTa());
            child.put("titleEn", c.getNameEn());
            child.put("linkUrl", "/constituency/" + c.getId());
            child.put("parentId", parentMenuId);
            child.put("dynamic", true);
            child.put("subcategories", new ArrayList<>());
            subs.add(child);
        }
    }

    @GetMapping("/admin/menus")
    @RequiresPermission(Permission.HOME_LAYOUT_MANAGE)
    public ResponseEntity<?> getAllMenusAdmin() {
        return ResponseEntity.ok(menuRepository.findByOrderByDisplayOrderAsc());
    }

    @PostMapping("/admin/menus")
    @RequiresPermission(Permission.HOME_LAYOUT_MANAGE)
    public ResponseEntity<?> createMenuAdmin(@RequestBody NavigationMenu menu) {
        if (menu.getDisplayOrder() == null) {
            menu.setDisplayOrder(0);
        }
        if (menu.getIsActive() == null) {
            menu.setIsActive(true);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(menuRepository.save(menu));
    }

    @PutMapping("/admin/menus/{id}")
    @RequiresPermission(Permission.HOME_LAYOUT_MANAGE)
    public ResponseEntity<?> updateMenuAdmin(@PathVariable Long id, @RequestBody NavigationMenu updated) {
        return menuRepository.findById(id)
                .map(existing -> {
                    existing.setTitleTa(updated.getTitleTa());
                    existing.setTitleEn(updated.getTitleEn());
                    existing.setLinkUrl(updated.getLinkUrl());
                    existing.setDisplayOrder(updated.getDisplayOrder());
                    existing.setParentId(updated.getParentId());
                    existing.setDynamicType(updated.getDynamicType());
                    existing.setDynamicDistrictId(updated.getDynamicDistrictId());
                    if (updated.getIsActive() != null) {
                        existing.setIsActive(updated.getIsActive());
                    }
                    return ResponseEntity.ok(menuRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/admin/menus/{id}")
    @RequiresPermission(Permission.HOME_LAYOUT_MANAGE)
    public ResponseEntity<?> deleteMenuAdmin(@PathVariable Long id) {
        return menuRepository.findById(id)
                .map(menu -> {
                    menuRepository.delete(menu);
                    // Orphan children: set parentId = null for menus whose parent was deleted
                    List<NavigationMenu> children = menuRepository.findByParentIdAndIsActiveOrderByDisplayOrderAsc(id, true);
                    for (NavigationMenu child : children) {
                        child.setParentId(null);
                        menuRepository.save(child);
                    }
                    return ResponseEntity.ok(Map.of("message", "Menu item deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
