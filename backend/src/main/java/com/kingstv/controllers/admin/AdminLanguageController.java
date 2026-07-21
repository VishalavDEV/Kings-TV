package com.kingstv.controllers.admin;

import com.kingstv.models.Language;
import com.kingstv.models.LanguageTranslation;
import com.kingstv.repository.LanguageRepository;
import com.kingstv.repository.LanguageTranslationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin/languages")
public class AdminLanguageController {

    @Autowired private LanguageRepository languageRepository;
    @Autowired private LanguageTranslationRepository translationRepository;

    @GetMapping
    public ResponseEntity<?> getLanguages() {
        List<Language> list = languageRepository.findAll();
        if (list.isEmpty()) {
            Language en = new Language();
            en.setName("English");
            en.setShortForm("EN");
            en.setLanguageCode("en");
            en.setIsDefault(true);
            en.setIsActive(true);
            en.setMenuOrder(1);

            Language ta = new Language();
            ta.setName("Tamil");
            ta.setShortForm("TA");
            ta.setLanguageCode("ta");
            ta.setIsDefault(false);
            ta.setIsActive(true);
            ta.setMenuOrder(2);

            languageRepository.saveAll(List.of(en, ta));
            list = languageRepository.findAll();
        }
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<?> createLanguage(@RequestBody Language language) {
        if (language.getName() == null || language.getLanguageCode() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "name and languageCode are required"));
        }
        if (Boolean.TRUE.equals(language.getIsDefault())) {
            unsetOtherDefaults();
        }
        Language saved = languageRepository.save(language);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateLanguage(@PathVariable Long id, @RequestBody Language payload) {
        return languageRepository.findById(id).map(lang -> {
            if (payload.getName() != null) lang.setName(payload.getName());
            if (payload.getShortForm() != null) lang.setShortForm(payload.getShortForm());
            if (payload.getLanguageCode() != null) lang.setLanguageCode(payload.getLanguageCode());
            if (payload.getIsActive() != null) lang.setIsActive(payload.getIsActive());
            if (payload.getMenuOrder() != null) lang.setMenuOrder(payload.getMenuOrder());
            if (Boolean.TRUE.equals(payload.getIsDefault())) {
                unsetOtherDefaults();
                lang.setIsDefault(true);
            }
            Language saved = languageRepository.save(lang);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLanguage(@PathVariable Long id) {
        if (!languageRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        translationRepository.deleteByLanguageId(id);
        languageRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Language deleted successfully"));
    }

    @GetMapping("/{id}/translations")
    public ResponseEntity<?> getTranslations(@PathVariable Long id) {
        List<LanguageTranslation> list = translationRepository.findByLanguageId(id);
        Map<String, String> map = new LinkedHashMap<>();
        for (LanguageTranslation lt : list) {
            map.put(lt.getTranslationKey(), lt.getTranslationValue());
        }
        if (map.isEmpty()) {
            map.put("home", "Home");
            map.put("categories", "Categories");
            map.put("breaking_news", "Breaking News");
            map.put("contact_us", "Contact Us");
            map.put("search", "Search");
        }
        return ResponseEntity.ok(map);
    }

    @PutMapping("/{id}/translations")
    public ResponseEntity<?> saveTranslations(@PathVariable Long id, @RequestBody Map<String, String> translations) {
        if (!languageRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        for (Map.Entry<String, String> entry : translations.entrySet()) {
            String key = entry.getKey();
            String val = entry.getValue();
            Optional<LanguageTranslation> existing = translationRepository.findByLanguageIdAndTranslationKey(id, key);
            LanguageTranslation lt = existing.orElseGet(() -> {
                LanguageTranslation newLt = new LanguageTranslation();
                newLt.setLanguageId(id);
                newLt.setTranslationKey(key);
                return newLt;
            });
            lt.setTranslationValue(val);
            translationRepository.save(lt);
        }

        return ResponseEntity.ok(Map.of("message", "Translations saved successfully"));
    }

    @PostMapping("/{id}/import")
    public ResponseEntity<?> importTranslations(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        if (!languageRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        for (Map.Entry<String, String> entry : payload.entrySet()) {
            String key = entry.getKey();
            String val = entry.getValue();
            Optional<LanguageTranslation> existing = translationRepository.findByLanguageIdAndTranslationKey(id, key);
            LanguageTranslation lt = existing.orElseGet(() -> {
                LanguageTranslation newLt = new LanguageTranslation();
                newLt.setLanguageId(id);
                newLt.setTranslationKey(key);
                return newLt;
            });
            lt.setTranslationValue(val);
            translationRepository.save(lt);
        }

        return ResponseEntity.ok(Map.of("message", "Imported " + payload.size() + " translation keys successfully"));
    }

    @GetMapping("/{id}/export")
    public ResponseEntity<?> exportTranslations(@PathVariable Long id) {
        List<LanguageTranslation> list = translationRepository.findByLanguageId(id);
        Map<String, String> map = new LinkedHashMap<>();
        for (LanguageTranslation lt : list) {
            map.put(lt.getTranslationKey(), lt.getTranslationValue());
        }
        return ResponseEntity.ok(map);
    }

    private void unsetOtherDefaults() {
        List<Language> all = languageRepository.findAll();
        for (Language l : all) {
            if (Boolean.TRUE.equals(l.getIsDefault())) {
                l.setIsDefault(false);
                languageRepository.save(l);
            }
        }
    }
}
